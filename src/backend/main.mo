import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Blob "mo:core/Blob";
import Migration "migration";

(with migration = Migration.run)
actor {

  // ── Types ─────────────────────────────────────────────────────────────────

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

  type Contact = {
    contactLabel : Text;
    number : Text;
  };

  // ── State ─────────────────────────────────────────────────────────────────

  let tshirts = Map.empty<Text, Tshirt>();
  var whatsappNumber : Text = "";
  var paymentQR : ?Blob = null;
  let contactsMap = Map.empty<Text, Contact>();

  // Multi-currency: cached exchange rates as JSON string
  var cachedExchangeRates : ?Text = null;
  var ratesCachedAt : Int = 0;

  // ── User profile stubs (API compatibility) ────────────────────────────────

  public type UserProfile = { name : Text };
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

  // ── T-shirt queries ───────────────────────────────────────────────────────

  public query func getAllTshirts() : async [Tshirt] {
    tshirts.values().toArray().sort();
  };

  public query func getTshirt(name : Text) : async ?Tshirt {
    tshirts.get(name);
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

  // ── T-shirt mutations ─────────────────────────────────────────────────────

  public shared func addTshirt(tshirt : Tshirt) : async () {
    if (tshirt.name.size() > 200) { Runtime.trap("Name too long") };
    tshirts.add(tshirt.name, tshirt);
  };

  public shared func updateTshirt(tshirt : Tshirt) : async () {
    tshirts.add(tshirt.name, tshirt);
  };

  public shared func removeTshirt(name : Text) : async () {
    tshirts.remove(name);
  };

  // ── WhatsApp ──────────────────────────────────────────────────────────────

  public query func getWhatsappNumber() : async Text {
    whatsappNumber;
  };

  public shared func setWhatsappNumber(number : Text) : async () {
    whatsappNumber := number;
  };

  // ── Payment QR ────────────────────────────────────────────────────────────

  public query func getPaymentQR() : async ?Blob {
    paymentQR;
  };

  public shared func setPaymentQR(blob : Blob) : async () {
    paymentQR := ?blob;
  };

  // ── Contacts ──────────────────────────────────────────────────────────────

  public query func getContacts() : async [Contact] {
    contactsMap.values().toArray();
  };

  public shared func addContact(contact : Contact) : async () {
    contactsMap.add(contact.contactLabel, contact);
  };

  public shared func removeContact(contactLabel : Text) : async () {
    contactsMap.remove(contactLabel);
  };

  // ── HTTP outcall infrastructure ───────────────────────────────────────────

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

  func extractJsonTextField(json : Text, fieldName : Text) : ?Text {
    let needle = "\"" # fieldName # "\":\"";
    let parts = json.split(#text needle).toArray();
    if (parts.size() < 2) { return null };
    let after = parts[1];
    switch (after.split(#text "\"").next()) {
      case null { null };
      case (?v) { if (v.size() == 0) null else ?v };
    };
  };

  // ── Currency: cached rates ────────────────────────────────────────────────

  public query func getCurrencyRates() : async ?Text {
    cachedExchangeRates;
  };

  public query func getRatesCachedAt() : async Int {
    ratesCachedAt;
  };

  // ── Currency: fetch and cache exchange rates ──────────────────────────────

  public shared func refreshExchangeRates() : async Bool {
    try {
      let result = await IC.http_request({
        url = "https://open.er-api.com/v6/latest/INR";
        max_response_bytes = ?50_000;
        method = #get;
        headers = [{ name = "Accept"; value = "application/json" }];
        body = null;
        transform = null;
        is_replicated = ?false;
      });
      if (result.status < 200 or result.status >= 300) { return false };
      switch (result.body.decodeUtf8()) {
        case null { false };
        case (?bodyText) {
          cachedExchangeRates := ?bodyText;
          ratesCachedAt := Time.now();
          true;
        };
      };
    } catch (_) {
      false;
    };
  };

  // ── Currency: detect user currency from IP ────────────────────────────────

  public shared func detectUserCurrency(userIp : Text) : async ?Text {
    if (userIp.size() == 0) { return null };
    try {
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
      if (result.status < 200 or result.status >= 300) { return null };
      switch (result.body.decodeUtf8()) {
        case null { null };
        case (?bodyText) {
          extractJsonTextField(bodyText, "currency");
        };
      };
    } catch (_) {
      null;
    };
  };
};
