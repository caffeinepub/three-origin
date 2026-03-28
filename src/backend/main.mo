import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";


actor {
  // Include authorization module for role-based access control.
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type Tshirt = {
    name : Text;
    description : Text;
    imageKey : Text;
  };

  module Tshirt {
    public func compare(tshirt1 : Tshirt, tshirt2 : Tshirt) : Order.Order {
      Text.compare(tshirt1.name, tshirt2.name);
    };
  };

  let tshirts = Map.empty<Text, Tshirt>();

  // Payment Info
  var whatsappNumber : ?Text = null;
  var paymentQR : ?Text = null;

  // User Profiles
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  // Claim admin - works if no admin assigned yet
  public shared ({ caller }) func claimFirstAdmin() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Must be logged in");
    };
    if (accessControlState.adminAssigned) {
      Runtime.trap("Admin already assigned");
    };
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
  };

  // Reset admin - clears all admin assignments so someone can claim again
  public shared ({ caller }) func resetAdmin() : async () {
    // Remove all admin roles
    let admins = accessControlState.userRoles.entries()
      .filter(func((p, r)) { r == #admin })
      .map(func((p, r)) { p })
      .toArray();
    for (admin in admins.vals()) {
      accessControlState.userRoles.remove(admin);
    };
    accessControlState.adminAssigned := false;
  };

  // Public read functions - no authorization needed
  public query ({ caller }) func getTshirt(name : Text) : async Tshirt {
    switch (tshirts.get(name)) {
      case (null) { Runtime.trap("Tshirt not found") };
      case (?tshirt) { tshirt };
    };
  };

  public query ({ caller }) func getAllTshirts() : async [Tshirt] {
    tshirts.values().toArray().sort();
  };

  public query ({ caller }) func searchTshirts(term : Text) : async [Tshirt] {
    let loweredTerm = term.toLower();
    let iter = tshirts.values();
    let filteredIter = iter.filter(
      func(tshirt) {
        tshirt.name.toLower().contains(#text loweredTerm) or tshirt.description.toLower().contains(#text loweredTerm);
      }
    );
    let result = filteredIter.toArray().sort();
    if (result.size() == 0) {
      Runtime.trap("No tshirts found for search term : " # term);
    };
    result;
  };

  public query ({ caller }) func getWhatsappNumber() : async Text {
    switch (whatsappNumber) {
      case (null) { Runtime.trap("Whatsapp number not set") };
      case (?number) { number };
    };
  };

  public query ({ caller }) func getPaymentQR() : async Text {
    switch (paymentQR) {
      case (null) { Runtime.trap("Payment QR not set") };
      case (?url) { url };
    };
  };

  // Admin-only write functions
  public shared ({ caller }) func addTshirt(tshirt : Tshirt) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (tshirt.name.size() > 100) {
      Runtime.trap("Tshirt name is too long. Please reduce size to 100 characters or less");
    };
    if (tshirts.containsKey(tshirt.name)) {
      Runtime.trap("Tshirt already exists");
    };
    tshirts.add(tshirt.name, tshirt);
  };

  public shared ({ caller }) func removeTshirt(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (tshirts.containsKey(name)) {
      tshirts.remove(name);
    } else {
      Runtime.trap("Tshirt does not exist");
    };
  };

  public shared ({ caller }) func setWhatsappNumber(number : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    whatsappNumber := ?number;
  };

  public shared ({ caller }) func setPaymentQR(url : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    paymentQR := ?url;
  };
};
