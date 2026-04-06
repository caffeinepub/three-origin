import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Principal "mo:core/Principal";


import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  // Initialize access control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  
  include MixinStorage();

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
  var paymentQR : ?Storage.ExternalBlob = null;

  type Contact = {
    contactLabel : Text;
    number : Text;
  };
  let contactsMap = Map.empty<Text, Contact>();

  // User profiles
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
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
      case (null) { Runtime.trap("WhatsApp number not set") };
      case (?n) { n };
    };
  };

  public query func getPaymentQR() : async Storage.ExternalBlob {
    switch (paymentQR) {
      case (null) { Runtime.trap("Payment QR not set") };
      case (?b) { b };
    };
  };

  public query func getContacts() : async [Contact] {
    contactsMap.values().toArray();
  };

  // Admin-only functions - product management
  public shared ({ caller }) func addTshirt(tshirt : Tshirt) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    if (tshirt.name.size() > 100) { Runtime.trap("Name too long") };
    if (tshirts.containsKey(tshirt.name)) { Runtime.trap("Already exists") };
    tshirts.add(tshirt.name, tshirt);
  };

  public shared ({ caller }) func removeTshirt(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove products");
    };
    if (not tshirts.containsKey(name)) { Runtime.trap("Not found") };
    tshirts.remove(name);
  };

  // Admin-only functions - settings management
  public shared ({ caller }) func setWhatsappNumber(number : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set WhatsApp number");
    };
    whatsappNumber := ?number;
  };

  public shared ({ caller }) func setPaymentQR(blob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set payment QR");
    };
    paymentQR := ?blob;
  };

  // Admin-only functions - contact management
  public shared ({ caller }) func addContact(contact : Contact) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add contacts");
    };
    if (contactsMap.containsKey(contact.contactLabel)) {
      Runtime.trap("Contact label already exists");
    };
    contactsMap.add(contact.contactLabel, contact);
  };

  public shared ({ caller }) func removeContact(contactLabel : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can remove contacts");
    };
    if (not contactsMap.containsKey(contactLabel)) { Runtime.trap("Contact not found") };
    contactsMap.remove(contactLabel);
  };
};
