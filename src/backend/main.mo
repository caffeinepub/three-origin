import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Blob "mo:core/Blob";

actor {
  // Migration: preserve accessControlState from previous version (will be unused)
  type UserRole = { #admin; #guest; #user };
  stable var accessControlState : { var adminAssigned : Bool; userRoles : Map.Map<Principal, UserRole> } = {
    var adminAssigned = false;
    userRoles = Map.empty<Principal, UserRole>();
  };
  ignore accessControlState;

  type Tshirt = {
    name : Text;
    description : Text;
    imageKey : Text;
    price : Text;
    deliveryCharge : Text;
    sizes : [Text];
    colors : [Text];
    stock : Nat;
  };

  module Tshirt {
    public func compare(t1 : Tshirt, t2 : Tshirt) : Order.Order {
      Text.compare(t1.name, t2.name);
    };
  };

  let tshirts = Map.empty<Text, Tshirt>();
  var whatsappNumber : ?Text = null;
  var paymentQR : ?Blob = null;

  type Contact = {
    contactLabel : Text;
    number : Text;
  };
  let contactsMap = Map.empty<Text, Contact>();

  // Multi-currency: cached exchange rates as JSON string (keyed off "INR" base)
  var cachedExchangeRates : ?Text = null;
  var ratesCachedAt : Int = 0;

  // User profiles (kept for API compatibility)
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared func saveCallerUserProfile(profile : UserProfile) : async () {
    ignore profile;
  };

  // Public query functions - accessible to everyone including guests
  public query func getAllTshirts() : async [Tshirt] {
    tshirts.values().toArray().sort();
  };

  public query func getTshirt(name : Text) : async Tshirt {
    switch (tshirts.get(name)) {
      case (null) { Runtime.trap("Tshirt not found") };
      case (?t) { t };
    };
  };

  public query func searchTshirts(term : Text) : async [Tshirt] {
    let lowered = term.toLower();
    tshirts.values()
      .filter(func(t) {
        t.name.toLower().contains(#text lowered) or
        t.description.toLower().contains(#text lowered)
      })
      .toArray()
      .sort();
  };

  public query func getWhatsappNumber() : async Text {
    switch (whatsappNumber) {
      case (null) { "" };
      case (?n) { n };
    };
  };

  public query func getPaymentQR() : async Blob {
    switch (paymentQR) {
      case (null) { Runtime.trap("Payment QR not set") };
      case (?b) { b };
    };
  };

  public query func getContacts() : async [Contact] {
    contactsMap.values().toArray();
  };

  // Product management - open to all callers (frontend password gate handles auth)
  public shared func addTshirt(tshirt : Tshirt) : async () {
    if (tshirt.name.size() > 100) { Runtime.trap("Name too long") };
    tshirts.add(tshirt.name, tshirt);
  };

  public shared func updateTshirt(tshirt : Tshirt) : async () {
    tshirts.add(tshirt.name, tshirt);
  };

  public shared func removeTshirt(name : Text) : async () {
    tshirts.remove(name);
  };

  // Settings management - open to all callers (frontend password gate handles auth)
  public shared func setWhatsappNumber(number : Text) : async () {
    whatsappNumber := ?number;
  };

  public shared func setPaymentQR(blob : Blob) : async () {
    paymentQR := ?blob;
  };

  // Contact management - open to all callers (frontend password gate handles auth)
  public shared func addContact(contact : Contact) : async () {
    contactsMap.add(contact.contactLabel, contact);
  };

  public shared func removeContact(contactLabel : Text) : async () {
    contactsMap.remove(contactLabel);
  };

  // ── Multi-currency: IC management canister type declarations ──────────────

  type HttpHeader = { name : Text; value : Text };
  type HttpMethod = { #get; #head; #post };
  type HttpRequestResult = { status : Nat; headers : [HttpHeader]; body : Blob };
  type HttpRequestArgs = {
    url : Text;
    max_response_bytes : ?Nat64;
    method : HttpMethod;
    headers : [HttpHeader];
    body : ?Blob;
    transform : ?{
      function : shared query ({ response : HttpRequestResult; context : Blob }) -> async HttpRequestResult;
      context : Blob;
    };
    is_replicated : ?Bool;
  };

  let IC = actor "aaaaa-aa" : actor {
    http_request : HttpRequestArgs -> async HttpRequestResult;
  };

  // ── Simple JSON field extractor ───────────────────────────────────────────
  // Extracts the value for a top-level string field: "key":"value"
  func extractJsonTextField(json : Text, fieldName : Text) : ?Text {
    let needle = "\"" # fieldName # "\":\"";
    switch (json.stripStart(#text needle)) {
      case null {
        // Try to find it anywhere in the string
        let parts = json.split(#text needle).toArray();
        if (parts.size() < 2) { return null };
        let after = parts[1];
        switch (after.split(#text "\"").next()) {
          case null { null };
          case (?v) { ?v };
        };
      };
      case (?rest) {
        switch (rest.split(#text "\"").next()) {
          case null { null };
          case (?v) { ?v };
        };
      };
    };
  };

  // ── Currency: query cached rates ──────────────────────────────────────────

  public query func getCurrencyRates() : async ?Text {
    cachedExchangeRates;
  };

  public query func getRatesCachedAt() : async Int {
    ratesCachedAt;
  };

  // ── Currency: fetch and cache exchange rates ──────────────────────────────

  public shared func refreshExchangeRates() : async Text {
    let result = await IC.http_request({
      url = "https://open.er-api.com/v6/latest/INR";
      max_response_bytes = ?50_000;
      method = #get;
      headers = [{ name = "Accept"; value = "application/json" }];
      body = null;
      transform = null;
      is_replicated = ?false;
    });

    let bodyText = switch (result.body.decodeUtf8()) {
      case null { Runtime.trap("Failed to decode exchange rate response") };
      case (?t) { t };
    };

    cachedExchangeRates := ?bodyText;
    ratesCachedAt := Time.now();
    bodyText;
  };

  // ── Currency: detect user currency from IP ────────────────────────────────

  public shared func detectUserCurrency(userIp : Text) : async Text {
    if (userIp.size() == 0) { return "INR" };

    let url = "https://ipapi.co/" # userIp # "/json/";

    let result = await IC.http_request({
      url = url;
      max_response_bytes = ?10_000;
      method = #get;
      headers = [{ name = "Accept"; value = "application/json" }];
      body = null;
      transform = null;
      is_replicated = ?false;
    });

    if (result.status < 200 or result.status >= 300) { return "INR" };

    let bodyText = switch (result.body.decodeUtf8()) {
      case null { return "INR" };
      case (?t) { t };
    };

    switch (extractJsonTextField(bodyText, "currency")) {
      case null { "INR" };
      case (?currency) {
        if (currency.size() == 0) { "INR" } else { currency };
      };
    };
  };
};
