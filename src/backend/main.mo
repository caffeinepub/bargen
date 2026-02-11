import Set "mo:core/Set";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  // === State Management ===
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // === Types ===
  public type UserProfile = {
    name : Text;
    email : ?Text;
    phone : ?Text;
  };

  public type Condition = { #used; #new };

  public type Product = {
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

  public type ProductWithShopDetails = {
    id : Nat;
    shop : ShopProfile;
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

  public type ShopProfile = {
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

  public type CartItem = {
    productId : Nat;
    quantity : Nat;
  };

  public type Claim = {
    id : Nat;
    owner : Principal;
    productId : ?Nat;
    reason : Text;
    details : Text;
    status : ClaimStatus;
    timestamp : Time.Time;
    claimType : ?ClaimType;
    shortDescription : ?Text;
    proofs : [Storage.ExternalBlob];
  };

  public type ClaimStatus = {
    #submitted;
    #under_review;
    #approved;
    #rejected;
  };

  public type ClaimType = {
    #damage;
    #late_delivery;
    #fraud;
    #incorrect;
    #other;
    #non_delivery;
    #quality_issue;
    #missing_items;
  };

  public type Insurance = {
    name : Text;
    coverageAmount : Nat;
    premium : Nat;
    details : Text;
  };

  public type CartTotal = {
    cartItems : [CartItem];
    subtotal : Nat;
    insurance : ?Insurance;
    insurancePremium : Nat;
    total : Nat;
  };

  public type BargainRequest = {
    id : Nat;
    productId : Nat;
    customer : Principal;
    desiredPrice : Nat;
    note : ?Text;
    shopkeeper : Principal;
    timestamp : Time.Time;
    status : Text;
    mutuallyAccepted : Bool;
  };

  // Add messaging types
  public type Message = {
    id : Nat;
    from : Principal;
    to : Principal;
    content : Text;
    productId : Nat;
    timestamp : Time.Time;
  };

  // Add delivery types
  public type DeliveryPartner = {
    id : Nat;
    owner : Principal;
    name : Text;
    vehicleType : Text;
    location : Text;
    isAvailable : Bool;
  };

  public type DeliveryOption = { #delivery; #pickup };
  public type DeliveryStatus = { #pending; #driver_assigned; #picking_up; #in_transit; #delivered; #completed; #failed; #driver_pending_assignment };

  public type DeliveryOrder = {
    id : Nat;
    shopId : Nat;
    customer : Principal;
    deliveryOption : DeliveryOption;
    status : DeliveryStatus;
    deliveryFee : Nat;
    driverId : ?Nat;
    pickupLocation : Text;
    dropoffLocation : Text;
    timestamp : Time.Time;
    completionCode : Text;
  };

  // Add shopkeeper notifications type
  public type ShopkeeperAction = { #liked; #in_cart };
  public type ShopkeeperNotification = {
    action : ShopkeeperAction;
    user : Principal;
    productId : Nat;
    timestamp : Time.Time;
  };

  // ==== Wishlist/Deal Protection ====

  // Deal Protection Order Types (Mock)
  public type DealProtectionStatus = { #payment_held; #delivered; #payment_released };
  public type DealProtectionOrder = {
    id : Nat;
    customer : Principal;
    productId : Nat;
    amount : Nat;
    status : DealProtectionStatus;
    deliveryAddress : Text;
    timestamp : Time.Time;
  };

  // Report/Complaint Type
  public type SellerReport = {
    id : Nat;
    reporter : Principal;
    shopId : Nat;
    productId : ?Nat;
    reason : Text;
    details : Text;
    status : ReportStatus;
    timestamp : Time.Time;
  };

  public type ReportStatus = { #open; #reviewed; #resolved; #rejected };

  // Verified Seller info
  public type VerifiedSellerInfo = {
    shopId : Nat;
    isVerified : Bool;
    score : Float;
  };

  // === Persistent Storage ===
  var nextDealId = 0;
  var nextReportId = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let shops = Map.empty<Nat, ShopProfile>();
  let products = Map.empty<Nat, Product>();
  let carts = Map.empty<Principal, List.List<CartItem>>();
  let bargains = Map.empty<Nat, BargainRequest>();
  let messages = Map.empty<Nat, Message>();

  // Add persistent maps for insurance, claims, delivery partners & orders
  let insuranceSelection = Map.empty<Principal, ?Insurance>();
  let claims = Map.empty<Nat, Claim>();
  let deliveryPartners = Map.empty<Nat, DeliveryPartner>();
  let deliveryOrders = Map.empty<Nat, DeliveryOrder>();

  // Add persistent notifications & likes
  let notifications = Map.empty<Nat, List.List<ShopkeeperNotification>>();
  let likes = Map.empty<Text, Set.Set<Principal>>();

  // Add persistent message threads
  let messageThreads = Map.empty<Nat, List.List<Message>>();

  // Deal Protection & Reporting Maps
  let dealProtectionOrders = Map.empty<Nat, DealProtectionOrder>();
  let sellerReports = Map.empty<Nat, SellerReport>();

  var nextShopId = 0;
  var nextProductId = 0;
  var nextBargainId = 0;
  var nextMessageId = 0;
  var nextClaimId = 0;
  var nextDeliveryPartnerId = 0;
  var nextDeliveryOrderId = 0;

  // === User Profile Management ===
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
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
  public shared ({ caller }) func createShopProfile(
    name : Text,
    rating : Nat,
    address : Text,
    distance : Float,
    priceInfo : Text,
    phone : Text,
    locationUrl : Text,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only shopkeepers can create shop profiles");
    };

    addShopInternal(name, rating, address, distance, priceInfo, phone, locationUrl, caller);
  };

  public shared ({ caller }) func createProduct(
    shopId : Nat,
    name : Text,
    description : Text,
    price : Nat,
    photoBlobs : ?[Storage.ExternalBlob],
    condition : Condition,
    returnPolicy : Text,
    age : ?ProductAge,
    productVerificationLabels : [VerificationLabel],
  ) : async Nat {
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

    // Validate age is only provided for used products
    switch (condition) {
      case (#new) {
        if (age != null) {
          Runtime.trap("Validation error: Product age can only be specified for used products");
        };
      };
      case (#used) {
        // Age is optional for used products, no validation needed
      };
    };

    switch (addProductInternal(shopId, name, description, price, photoBlobs, condition, returnPolicy, age, productVerificationLabels, null)) {
      case (null) { Runtime.trap("Unexpected error: Product could not be created") };
      case (?productId) { productId };
    };
  };

  public shared ({ caller }) func updateProduct(
    productId : Nat,
    name : Text,
    description : Text,
    price : Nat,
    photoBlobs : ?[Storage.ExternalBlob],
    condition : Condition,
    returnPolicy : Text,
    age : ?ProductAge,
    productVerificationLabels : [VerificationLabel],
    listingQualityScore : ?Nat,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can update products");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) {
        // Validate shop ownership
        if (shops.get(product.shopId) == null) {
          Runtime.trap("Shop does not exist");
        };

        let shop = shops.get(product.shopId);

        // Unwrapping shop
        switch (shop) {
          case (?shop) {
            if (shop.owner != caller) {
              Runtime.trap("Unauthorized: Only shop owner can update products");
            };

            // Validate age is only provided for used products
            switch (condition) {
              case (#new) {
                if (age != null) {
                  Runtime.trap("Validation error: Product age can only be specified for used products");
                };
              };
              case (#used) {
                // Age is optional for used products, no validation needed
              };
            };

            let updatedProduct = {
              product with name;
              description;
              price;
              photoBlobs;
              condition;
              returnPolicy;
              age;
              productVerificationLabels;
              listingQualityScore;
            };
            products.add(productId, updatedProduct);
          };
          case (null) { Runtime.trap("Shop does not exist") };
        };
      };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can delete products");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) {
        // Validate shop ownership
        if (shops.get(product.shopId) == null) {
          Runtime.trap("Shop does not exist");
        };

        let shop = shops.get(product.shopId);

        // Unwrapping shop
        switch (shop) {
          case (?shop) {
            if (shop.owner != caller) {
              Runtime.trap("Unauthorized: Only shop owner can delete products");
            };
            products.remove(productId);
          };
          case (null) { Runtime.trap("Shop does not exist") };
        };
      };
    };
  };

  public query ({ caller }) func getOwnShopProfiles() : async [ShopProfile] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view their shops");
    };
    shops.values().toArray().filter(
      func(shop) {
        shop.owner == caller;
      }
    );
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

    // Look up product to get shopkeeper ID
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) {
        // Create new notification for shopkeeper
        let notification : ShopkeeperNotification = {
          action = #in_cart;
          user = caller;
          productId;
          timestamp = Time.now();
        };

        // Fetch existing notifications or create new
        let currentList = switch (notifications.get(product.shopId)) {
          case (null) { List.empty<ShopkeeperNotification>() };
          case (?list) { list };
        };
        currentList.add(notification);
        notifications.add(product.shopId, currentList);
      };
    };
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
      mutuallyAccepted = false;
    };

    bargains.add(bargainId, bargain);
    nextBargainId += 1;
    bargainId;
  };

  public shared ({ caller }) func acceptBargain(bargainId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only shopkeepers can accept bargains");
    };

    switch (bargains.get(bargainId)) {
      case (null) { Runtime.trap("Bargain does not exist") };
      case (?bargain) {
        let product = switch (products.get(bargain.productId)) {
          case (null) { Runtime.trap("Product does not exist") };
          case (?product) { product };
        };

        let shop = switch (shops.get(product.shopId)) {
          case (null) { Runtime.trap("Shop does not exist") };
          case (?shop) { shop };
        };

        if (shop.owner != caller) {
          Runtime.trap("Unauthorized: Only shop owner can accept bargains");
        };

        let updatedBargain = { bargain with mutuallyAccepted = true };
        bargains.add(bargainId, updatedBargain);
      };
    };
  };

  public query ({ caller }) func bargainsByProduct(productId : Nat) : async [BargainRequest] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view bargains");
    };

    // Verify caller has permission to view bargains for this product
    let product = switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) { product };
    };

    let shop = switch (shops.get(product.shopId)) {
      case (null) { Runtime.trap("Shop does not exist") };
      case (?shop) { shop };
    };

    // Only shop owner or admin can view all bargains for a product
    // Regular users can only see their own bargains
    let allBargains = bargains.values().toArray().filter(
      func(bargain) { bargain.productId == productId }
    );

    if (shop.owner == caller or AccessControl.isAdmin(accessControlState, caller)) {
      // Shop owner or admin can see all bargains
      allBargains;
    } else {
      // Regular users can only see their own bargains
      allBargains.filter(func(bargain) { bargain.customer == caller });
    };
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

    // Fetch existing messages for product and add new message
    let currentThread = switch (messageThreads.get(productId)) {
      case (null) { List.empty<Message>() };
      case (?list) { list };
    };
    currentThread.add(message);
    messageThreads.add(productId, currentThread);

    nextMessageId += 1;
    messageId;
  };

  public query ({ caller }) func getChatMessages(productId : Nat) : async [Message] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    switch (messageThreads.get(productId)) {
      case (null) { [] };
      case (?thread) {
        thread.toArray().filter(
          func(m) { m.from == caller or m.to == caller }
        );
      };
    };
  };

  // === Shopkeeper Notification Management ===
  public shared ({ caller }) func likeProduct(productId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can like products");
    };

    // Fetch existing set of users who liked this product
    let currentLikers = switch (likes.get(productId.toText())) {
      case (null) { Set.empty<Principal>() };
      case (?set) { set };
    };

    // Check if user already liked the product
    switch (currentLikers.contains(caller)) {
      case (true) { () };
      case (false) {
        // Add user to likers
        currentLikers.add(caller);
        likes.add(productId.toText(), currentLikers);

        // Find product to get shopkeeper ID, if it exists
        switch (products.get(productId)) {
          case (null) { Runtime.trap("Product does not exist") };
          case (?product) {
            // Create new notification for shopkeeper
            let notification : ShopkeeperNotification = {
              action = #liked;
              user = caller;
              productId;
              timestamp = Time.now();
            };

            // Fetch existing notifications or create new
            let currentList = switch (notifications.get(product.shopId)) {
              case (null) { List.empty<ShopkeeperNotification>() };
              case (?list) { list };
            };
            currentList.add(notification);
            notifications.add(product.shopId, currentList);
          };
        };
      };
    };
  };

  // Return products liked by the current user (Wishlist)
  public query ({ caller }) func getWishlist() : async [Product] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view wishlist");
    };

    var likedProducts = List.empty<Product>();
    for ((productId, users) in likes.entries()) {
      if (users.contains(caller)) {
        let id = switch (Nat.fromText(productId)) {
          case (null) { Runtime.trap("Invalid product id") };
          case (?num) { num };
        };
        switch (products.get(id)) {
          case (null) {};
          case (?product) { likedProducts.add(product) };
        };
      };
    };
    likedProducts.toArray();
  };

  // Check if caller has liked a specific product
  public query ({ caller }) func hasLikedProduct(productId : Nat) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can check wishlist");
    };

    switch (likes.get(productId.toText())) {
      case (null) { false };
      case (?set) { set.contains(caller) };
    };
  };

  // Remove a like for a product
  public shared ({ caller }) func removeLike(productId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can manage wishlist");
    };

    switch (likes.get(productId.toText())) {
      case (null) {};
      case (?users) {
        users.remove(caller);
        if (users.isEmpty()) {
          likes.remove(productId.toText());
        } else {
          likes.add(productId.toText(), users);
        };
      };
    };
  };

  // Get all notifications for a shopkeeper (by shopId instead of caller)
  public query ({ caller }) func getShopkeeperNotifications(shopId : Nat) : async [ShopkeeperNotification] {
    // Validate shop ownership
    switch (shops.get(shopId)) {
      case (null) { Runtime.trap("Shop does not exist") };
      case (?shop) {
        if (shop.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only shop owner can view notifications");
        };
      };
    };

    // Fetch notifications for specific shopId
    switch (notifications.get(shopId)) {
      case (null) { [] };
      case (?n) { n.toArray() };
    };
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
            photoBlobs = product.photoBlobs;
            condition = product.condition;
            returnPolicy = product.returnPolicy;
            age = product.age;
            productVerificationLabels = product.productVerificationLabels;
            listingQualityScore = product.listingQualityScore;
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

  public query ({ caller }) func getProduct(productId : Nat) : async ?ProductWithShopDetails {
    switch (products.get(productId)) {
      case (null) { null };
      case (?product) {
        switch (shops.get(product.shopId)) {
          case (null) { null };
          case (?shop) {
            ?{
              id = product.id;
              shop;
              name = product.name;
              description = product.description;
              price = product.price;
              photoBlobs = product.photoBlobs;
              condition = product.condition;
              returnPolicy = product.returnPolicy;
              age = product.age;
              productVerificationLabels = product.productVerificationLabels;
              listingQualityScore = product.listingQualityScore;
            };
          };
        };
      };
    };
  };

  // Get products for a specific shop
  public query ({ caller }) func getProductsForShop(shopId : Nat) : async [ProductWithShopDetails] {
    var result = List.empty<ProductWithShopDetails>();

    for ((_, product) in products.entries()) {
      if (product.shopId == shopId) {
        switch (shops.get(product.shopId)) {
          case (null) {};
          case (?shop) {
            let productWithShop : ProductWithShopDetails = {
              id = product.id;
              shop;
              name = product.name;
              description = product.description;
              price = product.price;
              photoBlobs = product.photoBlobs;
              condition = product.condition;
              returnPolicy = product.returnPolicy;
              age = product.age;
              productVerificationLabels = product.productVerificationLabels;
              listingQualityScore = product.listingQualityScore;
            };
            result.add(productWithShop);
          };
        };
      };
    };

    result.toArray().sort(
      func(a, b) { Nat.compare(a.id, b.id) }
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

  // === "Deal Protection" Insurance (Bundled Risks) ===
  // Get default "deal protection" options instead of vehicle insurance
  public query ({ caller }) func getDefaultInsuranceOptions() : async [Insurance] {
    [
      {
        name = "Basic Deal Protection";
        coverageAmount = 500_00; // UGX coverage
        premium = 50_00; // UGX premium
        details = "Covers fraud/delivery risks up to 500 UGX.";
      },
      {
        name = "Standard Deal Protection";
        coverageAmount = 2_000_00;
        premium = 120_00;
        details = "Covers fraud, delivery, and product damage up to 2,000 UGX.";
      },
      {
        name = "Premium Deal Protection";
        coverageAmount = 8_000_00;
        premium = 450_00;
        details = "Higher coverage for larger purchase risks up to 8,000 UGX.";
      },
      {
        name = "Price Guarantee Only";
        coverageAmount = 0;
        premium = 10_00;
        details = "Covers price changes and minor bad faith behavior.";
      },
    ];
  };

  // Calculate best insurance match for cart
  public query ({ caller }) func recommendBestInsurance(cartTotal : Nat) : async ?Insurance {
    if (cartTotal == 0) {
      return null;
    };

    let options = [
      {
        name = "Basic Deal Protection";
        coverageAmount = 500_00;
        premium = 50_00;
        details = "Covers fraud/delivery risks up to 500 UGX.";
      },
      {
        name = "Standard Deal Protection";
        coverageAmount = 2_000_00;
        premium = 120_00;
        details = "Covers broader risks up to 2,000 UGX.";
      },
      {
        name = "Premium Deal Protection";
        coverageAmount = 8_000_00;
        premium = 450_00;
        details = "High value deals up to 8_000 UGX.";
      },
      {
        name = "Price Guarantee Only";
        coverageAmount = 0;
        premium = 10_00;
        details = "Minor risk mitigation";
      },
    ];

    if (cartTotal < 500_00) {
      return ?options[0];
    } else if (cartTotal < 2_000_00) {
      return ?options[1];
    } else if (cartTotal < 8_000_00) {
      return ?options[2];
    } else {
      return ?options[3];
    };
  };

  // Set insurance selection for cart
  public shared ({ caller }) func selectInsurance(insurance : ?Insurance) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can select protection");
    };
    insuranceSelection.add(caller, insurance);
  };

  // Get currently selected insurance
  public query ({ caller }) func getSelectedInsurance() : async ?Insurance {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their protection selection");
    };
    switch (insuranceSelection.get(caller)) {
      case (null) { null };
      case (?insurance) { insurance };
    };
  };

  // Calculate total cart amount including insurance
  public query ({ caller }) func getCartTotalWithInsurance() : async CartTotal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart totals");
    };

    var subtotal = 0;
    let cartItems = switch (carts.get(caller)) {
      case (null) { List.empty<CartItem>() };
      case (?cart) { cart };
    };

    let cartItemsArray = cartItems.toArray();

    // Calculate subtotal for products only
    for (cartItem in cartItemsArray.values()) {
      let product = switch (products.get(cartItem.productId)) {
        case (null) { Runtime.trap("Product does not exist") };
        case (?p) { p };
      };
      subtotal += product.price * cartItem.quantity;
    };

    let insurance = switch (insuranceSelection.get(caller)) {
      case (null) { null };
      case (?ins) { ins };
    };

    let insurancePremium = switch (insurance) {
      case (null) { 0 };
      case (?ins) { ins.premium };
    };

    let total = subtotal + insurancePremium;
    {
      cartItems = cartItemsArray;
      subtotal;
      insurance;
      insurancePremium;
      total;
    };
  };

  // === Delivery Integration ===

  // --- Backend Only State for Delivery Partners ---
  let deliveryFees = Map.empty<Nat, Nat>(); // shopId to fee table

  public shared ({ caller }) func registerDeliveryPartner(name : Text, vehicleType : Text, location : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can register as delivery partners");
    };

    let partnerId = nextDeliveryPartnerId;
    let partner : DeliveryPartner = {
      id = partnerId;
      name;
      vehicleType;
      location;
      isAvailable = true;
      owner = caller;
    };

    deliveryPartners.add(partnerId, partner);
    nextDeliveryPartnerId += 1;
    partnerId;
  };

  public shared ({ caller }) func setDeliveryPartnerAvailability(partnerId : Nat, isAvailable : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can update availability");
    };

    switch (deliveryPartners.get(partnerId)) {
      case (null) { Runtime.trap("Delivery partner does not exist") };
      case (?partner) {
        if (partner.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only partner owner can update availability");
        };
        let updatedPartner = { partner with isAvailable };
        deliveryPartners.add(partnerId, updatedPartner);
      };
    };
  };

  public query ({ caller }) func calculateDeliveryFee(shopId : Nat, distanceKm : Float) : async Nat {
    let baseFeePerKm = 1000_00;
    let minFee : Nat = 500_00;

    let fee = if (distanceKm < 1.0) {
      minFee;
    } else if (distanceKm < 5.0) {
      (baseFeePerKm * distanceKm.toInt()).toNat();
    } else {
      let additionalDistance = distanceKm - 5.0;
      let additionalFee = if (additionalDistance > 0.0) { (2500_00.0 * additionalDistance).toInt().toNat() } else {
        minFee;
      };
      additionalFee;
    };

    fee;
  };

  public query ({ caller }) func getOwnDeliveryOrders() : async [DeliveryOrder] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their delivery orders");
    };

    let ordersArray = deliveryOrders.values().toArray();
    let ownedShopIds = shops.values().toArray().filter(
      func(shop) { shop.owner == caller }
    ).map(func(shop) { shop.id });

    ordersArray.filter(
      func(order) {
        // Include if caller is customer or shop owner
        order.customer == caller or hasShopId(ownedShopIds, order.shopId)
      }
    );
  };

  // Helper function to check if shopId exists in ownedShopIds array
  func hasShopId(ownedShopIds : [Nat], shopId : Nat) : Bool {
    for (id in ownedShopIds.values()) {
      if (id == shopId) {
        return true;
      };
    };
    false;
  };

  // === Internal (Demo/Seed Data) ===

  // --- Shop and Product Creation ---
  func addShopInternal(
    name : Text,
    rating : Nat,
    address : Text,
    distance : Float,
    priceInfo : Text,
    phone : Text,
    locationUrl : Text,
    owner : Principal,
  ) : Nat {
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

  func addProductInternal(
    shopId : Nat,
    name : Text,
    description : Text,
    price : Nat,
    photoBlobs : ?[Storage.ExternalBlob],
    condition : Condition,
    returnPolicy : Text,
    age : ?ProductAge,
    productVerificationLabels : [VerificationLabel],
    listingQualityScore : ?Nat,
  ) : ?Nat {
    let productId = nextProductId;
    let product : Product = {
      id = productId;
      shopId;
      name;
      description;
      price;
      photoBlobs;
      condition;
      returnPolicy;
      age;
      productVerificationLabels;
      listingQualityScore = if (listingQualityScore != null) { listingQualityScore } else {
        switch (condition) {
          case (#used) { ?3 };
          case (#new) { ?5 };
        };
      };
    };

    products.add(productId, product);
    nextProductId += 1;
    ?productId;
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
