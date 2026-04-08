import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

actor {
  // Migration: preserve accessControlState from previous version (will be unused)
  type UserRole = { #admin; #guest; #user };
  stable var accessControlState : { var adminAssigned : Bool; userRoles : Map.Map<Principal, UserRole> } = {
    var adminAssigned = false;
    userRoles = Map.empty<Principal, UserRole>();
  };

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
};
