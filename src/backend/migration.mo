import Map "mo:core/Map";
import Text "mo:core/Text";
import Storage "blob-storage/Storage";

module {
  type OldTshirt = {
    name : Text;
    description : Text;
    imageKey : Text;
  };

  type OldActor = {
    tshirts : Map.Map<Text, OldTshirt>;
    whatsappNumber : ?Text;
    paymentQR : ?Storage.ExternalBlob;
  };

  type NewTshirt = {
    name : Text;
    description : Text;
    imageKey : Text;
    price : Text;
    deliveryCharge : Text;
  };

  type NewActor = {
    tshirts : Map.Map<Text, NewTshirt>;
    whatsappNumber : ?Text;
    paymentQR : ?Storage.ExternalBlob;
  };

  public func run(old : OldActor) : NewActor {
    let newTshirts = old.tshirts.map<Text, OldTshirt, NewTshirt>(
      func(_name, oldTshirt) {
        {
          name = oldTshirt.name;
          description = oldTshirt.description;
          imageKey = oldTshirt.imageKey;
          price = "";
          deliveryCharge = "";
        };
      }
    );
    {
      tshirts = newTshirts;
      whatsappNumber = old.whatsappNumber;
      paymentQR = old.paymentQR;
    };
  };
};
