import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

module {
  // Old types
  type OldTshirt = {
    name : Text;
    description : Text;
    imageKey : Text;
    price : Text;
    deliveryCharge : Text;
    sizes : [Text];
    stock : Nat;
  };

  type OldActor = {
    tshirts : Map.Map<Text, OldTshirt>;
    whatsappNumber : ?Text;
    paymentQR : ?Storage.ExternalBlob;
  };

  // New types
  type NewTshirt = {
    name : Text;
    description : Text;
    imageKey : Text;
    price : Text;
    deliveryCharge : Text;
    sizes : [Text];
    colors : [Text];
    stock : Nat;
  };

  type NewContact = {
    contactLabel : Text;
    number : Text;
  };

  type UserProfile = {
    name : Text;
  };

  type NewActor = {
    tshirts : Map.Map<Text, NewTshirt>;
    whatsappNumber : ?Text;
    paymentQR : ?Storage.ExternalBlob;
    contactsMap : Map.Map<Text, NewContact>;
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    let newTshirts = old.tshirts.map<Text, OldTshirt, NewTshirt>(
      func(_id, oldTshirt) {
        {
          oldTshirt with
          colors = ["White"];
        };
      }
    );
    {
      tshirts = newTshirts;
      whatsappNumber = old.whatsappNumber;
      paymentQR = old.paymentQR;
      contactsMap = Map.empty<Text, NewContact>();
      accessControlState = AccessControl.initState();
      userProfiles = Map.empty<Principal, UserProfile>();
    };
  };
};
