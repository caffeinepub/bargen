import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Order "mo:core/Order";
import List "mo:core/List";
import Float "mo:core/Float";
import Principal "mo:core/Principal";

import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // === State Management ===
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // === Types ===
  public type UserProfile = {
    name : Text;
    email : ?Text;
    phone : ?Text;
  };

  type ShopProfile = {
    id : Nat;
    name : Text;
    rating : Nat;
    address : Text;
    distanceKm : Float;
    priceInfo : Text;
    phone : Text;
    locationUrl : Text;
    owner : Principal;
  };

  type Product = {
    id : Nat;
    shopId : Nat;
    name : Text;
    description : Text;
    price : Nat;
  };

  type ProductWithShopDetails = {
    id : Nat;
    shop : ShopProfile;
    name : Text;
    description : Text;
    price : Nat;
  };

  type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  type BargainRequest = {
    id : Nat;
    productId : Nat;
    customer : Principal;
    desiredPrice : Nat;
    note : ?Text;
    shopkeeper : Principal;
    timestamp : Time.Time;
    status : Text;
  };

  type Message = {
    id : Nat;
    from : Principal;
    to : Principal;
    content : Text;
    productId : Nat;
    timestamp : Time.Time;
  };

  module Product {
    public func compareByShop(product1 : Product, product2 : Product) : Order.Order {
      switch (Nat.compare(product1.shopId, product2.shopId)) {
        case (#equal) { Nat.compare(product1.id, product2.id) };
        case (order) { order };
      };
    };
  };

  // === Persistent Storage ===
  let userProfiles = Map.empty<Principal, UserProfile>();
  let shops = Map.empty<Nat, ShopProfile>();
  let products = Map.empty<Nat, Product>();
  let carts = Map.empty<Principal, List.List<CartItem>>();
  let bargains = Map.empty<Nat, BargainRequest>();
  let messages = Map.empty<Nat, Message>();

  var nextShopId = 0;
  var nextProductId = 0;
  var nextBargainId = 0;
  var nextMessageId = 0;

  // === User Profile Management ===
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

  // === Shopkeeper APIs ===
  public shared ({ caller }) func createShopProfile(name : Text, rating : Nat, address : Text, distance : Float, priceInfo : Text, phone : Text, locationUrl : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only shopkeepers can create shop profiles");
    };

    addShopInternal(name, rating, address, distance, priceInfo, phone, locationUrl, caller);
  };

  public shared ({ caller }) func createProduct(shopId : Nat, name : Text, description : Text, price : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create products");
    };

    // Validate shop ownership
    switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop does not exist") };
      case (?shop) {
        if (shop.owner != caller) {
          Runtime.trap("Unauthorized: Only shop owner can add products");
        };
      };
    };

    addProductInternal(shopId, name, description, price);
  };

  // === Customer APIs ===
  public shared ({ caller }) func addToCart(productId : Nat, quantity : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can add items to cart");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than zero");
    };

    let cart = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?existing) { existing };
    };

    var found = false;
    let updatedItems = cart.toArray().map(
      func(item) {
        if (item.productId == productId) {
          found := true;
          { item with quantity = item.quantity + quantity };
        } else {
          item;
        };
      }
    );

    if (not found) {
      cart.add({ productId; quantity });
    } else {
      cart.clear();
      cart.addAll(updatedItems.values());
    };

    carts.add(caller, cart);
  };

  public shared ({ caller }) func sendBargainRequest(productId : Nat, desiredPrice : Nat, note : ?Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can send bargain requests");
    };

    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) { product };
    };

    let shop = switch (shops.get(product.shopId)) {
      case (null) { Runtime.trap("Shop does not exist") };
      case (?shop) { shop };
    };

    let bargainId = nextBargainId;
    let bargain : BargainRequest = {
      id = bargainId;
      productId;
      customer = caller;
      desiredPrice;
      note;
      shopkeeper = shop.owner;
      timestamp = Time.now();
      status = "pending";
    };

    bargains.add(bargainId, bargain);
    nextBargainId += 1;
    bargainId;
  };

  // === Messaging APIs ===
  public shared ({ caller }) func sendMessage(to : Principal, content : Text, productId : Nat) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can send messages");
    };

    if (content.size() == 0) {
      Runtime.trap("Cannot send messages with empty content");
    };

    let messageId = nextMessageId;
    let message : Message = {
      id = messageId;
      from = caller;
      to;
      content;
      productId;
      timestamp = Time.now();
    };

    messages.add(messageId, message);
    nextMessageId += 1;
    messageId;
  };

  public query ({ caller }) func getChatMessages(productId : Nat) : async [Message] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    let filteredMessages = messages.values().toArray().filter(
      func(m) {
        m.productId == productId and (m.from == caller or m.to == caller);
      }
    );
    filteredMessages;
  };

  // === Browsing APIs ===
  // Public browsing endpoint - intentionally accessible to all users including guests
  // This allows marketplace discovery without authentication
  public query ({ caller }) func browseProductsWithShop() : async [ProductWithShopDetails] {
    var result = List.empty<ProductWithShopDetails>();

    for ((_, product) in products.entries()) {
      switch (shops.get(product.shopId)) {
        case (null) {};
        case (?shop) {
          let productWithShop : ProductWithShopDetails = {
            id = product.id;
            shop;
            name = product.name;
            description = product.description;
            price = product.price;
          };
          result.add(productWithShop);
        };
      };
    };

    result.toArray().sort(
      func(a, b) {
        switch (Nat.compare(a.shop.id, b.shop.id)) {
          case (#equal) { Nat.compare(a.id, b.id) };
          case (order) { order };
        };
      }
    );
  };

  public query ({ caller }) func getCartItems() : async [CartItem] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view carts");
    };

    switch (carts.get(caller)) {
      case (null) { [] };
      case (?cart) { cart.toArray() };
    };
  };

  // === Internal (Demo/Seed Data) ===

  // --- Shop and Product Creation ---
  func addShopInternal(name : Text, rating : Nat, address : Text, distance : Float, priceInfo : Text, phone : Text, locationUrl : Text, owner : Principal) : Nat {
    let shopId = nextShopId;
    let shop : ShopProfile = {
      id = shopId;
      name;
      rating;
      address;
      distanceKm = distance;
      priceInfo;
      phone;
      locationUrl;
      owner;
    };

    shops.add(shopId, shop);
    nextShopId += 1;
    shopId;
  };

  func addProductInternal(shopId : Nat, name : Text, description : Text, price : Nat) : Nat {
    let productId = nextProductId;
    let product : Product = {
      id = productId;
      shopId;
      name;
      description;
      price;
    };

    products.add(productId, product);
    nextProductId += 1;
    productId;
  };

  // === Testing & Migration Demo Functions ===
  // Admin-only function for testing and debugging
  public query ({ caller }) func getAllShops() : async [ShopProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all shops");
    };
    shops.values().toArray();
  };
};
