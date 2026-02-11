import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Storage "blob-storage/Storage";

module {
  public type Condition = { #used; #new };

  // Old product type without returnPolicy, productVerificationLabels, and ProductAge
  public type OldProduct = {
    id : Nat;
    shopId : Nat;
    name : Text;
    description : Text;
    price : Nat;
    photoBlobs : ?[Storage.ExternalBlob];
    condition : Condition;
  };

  // Old actor type
  public type OldActor = {
    products : Map.Map<Nat, OldProduct>;
    // Other fields remain unchanged
  };

  // The new product type with added fields
  public type NewProduct = {
    id : Nat;
    shopId : Nat;
    name : Text;
    description : Text;
    price : Nat;
    photoBlobs : ?[Storage.ExternalBlob];
    condition : Condition;
    returnPolicy : Text;
    age : ?ProductAge;
    productVerificationLabels : [VerificationLabel];
    listingQualityScore : ?Nat;
  };

  public type VerificationLabel = {
    labelText : Text;
    description : Text;
  };

  public type ProductAge = {
    time : ProductAgeTime;
    conditionDescription : Text;
  };

  public type ProductAgeTime = {
    #months : Nat;
    #years : Nat;
    #brandNew;
    #days : Nat;
    #unknown;
  };

  // The new actor type with updated products
  public type NewActor = {
    products : Map.Map<Nat, NewProduct>;
  };

  public func run(old : OldActor) : NewActor {
    let newProducts = old.products.map<Nat, OldProduct, NewProduct>(
      func(_id, oldProduct) {
        {
          oldProduct with
          returnPolicy = "7-day return policy (default)";
          age = null;
          productVerificationLabels = [];
          listingQualityScore = ?5;
        };
      }
    );
    { products = newProducts };
  };
};
