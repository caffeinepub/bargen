import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Condition, VerificationLabel, ProductAge } from '@/backend';

// === Product Queries ===
export function useBrowseProductsWithShop() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.browseProductsWithShop();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetProduct(productId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProduct(BigInt(productId));
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

// Alias for compatibility
export function useGetProductDetails(productId: string) {
  return useGetProduct(productId);
}

export function useGetProductsForShop(shopId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['products', 'shop', shopId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductsForShop(BigInt(shopId));
    },
    enabled: !!actor && !isFetching && !!shopId,
  });
}

// === Shop Queries ===
export function useGetOwnShopProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['ownShops'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOwnShopProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateShopProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      rating: bigint;
      address: string;
      distance: number;
      priceInfo: string;
      phone: string;
      locationUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createShopProfile(
        data.name,
        data.rating,
        data.address,
        data.distance,
        data.priceInfo,
        data.phone,
        data.locationUrl
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownShops'] });
    },
  });
}

// === Product Mutations ===
export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      shopId: bigint;
      name: string;
      description: string;
      price: bigint;
      photoBlobs: any;
      condition: Condition;
      returnPolicy: string;
      age: ProductAge | null;
      productVerificationLabels: VerificationLabel[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(
        data.shopId,
        data.name,
        data.description,
        data.price,
        data.photoBlobs,
        data.condition,
        data.returnPolicy,
        data.age,
        data.productVerificationLabels
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      productId: bigint;
      name: string;
      description: string;
      price: bigint;
      photoBlobs: any;
      condition: Condition;
      returnPolicy: string;
      age: ProductAge | null;
      productVerificationLabels: VerificationLabel[];
      listingQualityScore: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProduct(
        data.productId,
        data.name,
        data.description,
        data.price,
        data.photoBlobs,
        data.condition,
        data.returnPolicy,
        data.age,
        data.productVerificationLabels,
        data.listingQualityScore
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// === Admin Product Management ===
export function useAdminBrowseProductsWithShop() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.adminBrowseProductsWithShop();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdminUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      productId: bigint;
      name: string;
      description: string;
      price: bigint;
      photoBlobs: any;
      condition: Condition;
      returnPolicy: string;
      age: ProductAge | null;
      productVerificationLabels: VerificationLabel[];
      listingQualityScore: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminUpdateProduct(
        data.productId,
        data.name,
        data.description,
        data.price,
        data.photoBlobs,
        data.condition,
        data.returnPolicy,
        data.age,
        data.productVerificationLabels,
        data.listingQualityScore
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId.toString()] });
    },
  });
}

export function useAdminDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminDeleteProduct(productId);
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', productId.toString()] });
    },
  });
}

// === Cart Queries ===
export function useGetCartItems() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCartItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(data.productId, data.quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useGetCartTotalWithInsurance() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['cartTotal'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCartTotalWithInsurance();
    },
    enabled: !!actor && !isFetching,
  });
}

// === Bargain Queries ===
export function useGetBargainsByProduct(productId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['bargains', productId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.bargainsByProduct(BigInt(productId));
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

export function useSendBargainRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      productId: bigint;
      desiredPrice: bigint;
      note: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendBargainRequest(data.productId, data.desiredPrice, data.note);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bargains', variables.productId.toString()] });
    },
  });
}

export function useAcceptBargain() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bargainId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptBargain(bargainId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bargains'] });
    },
  });
}

// === Messaging Queries ===
export function useGetChatMessages(productId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['messages', productId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatMessages(BigInt(productId));
    },
    enabled: !!actor && !isFetching && !!productId,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { to: any; content: string; productId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(data.to, data.content, data.productId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.productId.toString()] });
    },
  });
}

// Placeholder for shopkeeper chat threads (not in backend yet)
export function useGetShopkeeperChatThreads() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['chatThreads'],
    queryFn: async () => {
      // Backend doesn't have this endpoint yet, return empty array
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

// === Wishlist Queries ===
export function useGetWishlist() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWishlist();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useHasLikedProduct(productId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['liked', productId],
    queryFn: async () => {
      if (!actor) return false;
      return actor.hasLikedProduct(BigInt(productId));
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

// Alias for compatibility
export function useGetProductLikeStatus(productId: string) {
  return useHasLikedProduct(productId);
}

export function useLikeProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.likeProduct(productId);
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['liked', productId.toString()] });
    },
  });
}

export function useRemoveLike() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeLike(productId);
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['liked', productId.toString()] });
    },
  });
}

// Alias for compatibility
export function useUnlikeProduct() {
  return useRemoveLike();
}

// === Insurance Queries ===
export function useGetDefaultInsuranceOptions() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['insuranceOptions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDefaultInsuranceOptions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetSelectedInsurance() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['selectedInsurance'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSelectedInsurance();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSelectInsurance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insurance: any) => {
      if (!actor) throw new Error('Actor not available');
      return actor.selectInsurance(insurance);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['selectedInsurance'] });
      queryClient.invalidateQueries({ queryKey: ['cartTotal'] });
    },
  });
}

// === Shopkeeper Notifications ===
export function useGetShopkeeperNotifications(shopId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['notifications', shopId],
    queryFn: async () => {
      if (!actor || !shopId) return [];
      return actor.getShopkeeperNotifications(BigInt(shopId));
    },
    enabled: !!actor && !isFetching && !!shopId,
    refetchInterval: 10000, // Poll every 10 seconds
  });
}

// === User Profile Queries ===
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(user: any) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['userProfile', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getUserProfile(user);
    },
    enabled: !!actor && !isFetching && !!user,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: { name: string; email?: string; phone?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// === Admin Queries ===
export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['userRole'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// === Claims (Placeholder - backend not implemented) ===
export function useGetOwnClaims() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['claims'],
    queryFn: async () => {
      // Backend doesn't have this endpoint yet, return empty array
      return [];
    },
    enabled: !!actor && !isFetching,
  });
}

// === Delivery Partner Queries ===
export function useRegisterDeliveryPartner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; vehicleType: string; location: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerDeliveryPartner(data.name, data.vehicleType, data.location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryOrders'] });
    },
  });
}

export function useSetDeliveryPartnerAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { partnerId: bigint; isAvailable: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setDeliveryPartnerAvailability(data.partnerId, data.isAvailable);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryOrders'] });
    },
  });
}

// Alias for compatibility
export function useSetPartnerAvailability() {
  return useSetDeliveryPartnerAvailability();
}

export function useGetOwnDeliveryOrders() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['deliveryOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOwnDeliveryOrders();
    },
    enabled: !!actor && !isFetching,
  });
}
