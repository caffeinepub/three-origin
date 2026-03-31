import Map "mo:core/Map";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  type Tshirt = {
    name : Text;
    description : Text;
    imageKey : Text;
    price : Text;
    deliveryCharge : Text;
  };

  module Tshirt {
    public func compare(t1 : Tshirt, t2 : Tshirt) : Order.Order {
      Text.compare(t1.name, t2.name);
    };
  };

  let tshirts = Map.empty<Text, Tshirt>();
  var whatsappNumber : ?Text = null;
  var paymentQR : ?Storage.ExternalBlob = null;

  // --- Public reads ---

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

  // --- Writes (admin password enforced on frontend) ---

  public func addTshirt(tshirt : Tshirt) : async () {
    if (tshirt.name.size() > 100) { Runtime.trap("Name too long") };
    if (tshirts.containsKey(tshirt.name)) { Runtime.trap("Already exists") };
    tshirts.add(tshirt.name, tshirt);
  };

  public func removeTshirt(name : Text) : async () {
    if (not tshirts.containsKey(name)) { Runtime.trap("Not found") };
    tshirts.remove(name);
  };

  public func setWhatsappNumber(number : Text) : async () {
    whatsappNumber := ?number;
  };

  public func setPaymentQR(blob : Storage.ExternalBlob) : async () {
    paymentQR := ?blob;
  };
};
