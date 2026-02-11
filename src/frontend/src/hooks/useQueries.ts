import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@icp-sdk/core/principal';
import { ExternalBlob, DeliveryOption, DeliveryStatus, Condition, VerificationLabel, ProductAge } from '@/backend';
import { toast } from 'sonner';
import { normalizeBackendError } from '../utils/backendErrors';

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

export function useGetProductDetails(productId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!actor) return null;
      const product = await actor.getProduct(BigInt(productId));
      if (!product) return null;
      return {
        product,
        shop: product.shop,
      };
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

export function useGetProductsForShop(shopId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['shopProducts', shopId],
    queryFn: async () => {
      if (!actor || !shopId) return [];
      return actor.getProductsForShop(BigInt(shopId));
    },
    enabled: !!actor && !isFetching && !!shopId,
  });
}

// === Shop Queries ===
export function useGetOwnShopProfiles() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['ownShops'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOwnShopProfiles();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// === Shop Mutations ===
export function useCreateShopProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      rating,
      address,
      distance,
      priceInfo,
      phone,
      locationUrl,
    }: {
      name: string;
      rating: bigint;
      address: string;
      distance: number;
      priceInfo: string;
      phone: string;
      locationUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createShopProfile(name, rating, address, distance, priceInfo, phone, locationUrl);
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
    mutationFn: async ({
      shopId,
      name,
      description,
      price,
      photoBlobs,
      condition,
      returnPolicy,
      age,
      productVerificationLabels,
    }: {
      shopId: bigint;
      name: string;
      description: string;
      price: bigint;
      photoBlobs?: ExternalBlob[] | null;
      condition: Condition;
      returnPolicy: string;
      age: ProductAge | null;
      productVerificationLabels: VerificationLabel[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(
        shopId,
        name,
        description,
        price,
        photoBlobs || null,
        condition,
        returnPolicy,
        age,
        productVerificationLabels
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['ownShops'] });
    },
  });
}

// === Cart Queries ===
export function useGetCartItems() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['cartItems'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCartItems();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetCartTotalWithInsurance() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['cartTotal'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCartTotalWithInsurance();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// Alias for backward compatibility
export const useGetCartTotal = useGetCartTotalWithInsurance;

export function useAddToCart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: bigint; quantity: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToCart(productId, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
      queryClient.invalidateQueries({ queryKey: ['cartTotal'] });
    },
  });
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
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['selectedInsurance'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSelectedInsurance();
    },
    enabled: !!actor && !isFetching && !!identity,
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

// === Bargain Queries ===
export function useGetBargainsByProduct(productId: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['bargains', productId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.bargainsByProduct(BigInt(productId));
    },
    enabled: !!actor && !isFetching && !!identity && !!productId,
    refetchInterval: 5000,
  });
}

export function useSendBargainRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      desiredPrice,
      note,
    }: {
      productId: bigint;
      desiredPrice: bigint;
      note: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendBargainRequest(productId, desiredPrice, note);
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
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['messages', productId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChatMessages(BigInt(productId));
    },
    enabled: !!actor && !isFetching && !!identity && !!productId,
    refetchInterval: 3000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ to, content, productId }: { to: string; content: string; productId: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      const toPrincipal = Principal.fromText(to);
      return actor.sendMessage(toPrincipal, content, productId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.productId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['shopkeeperThreads'] });
    },
  });
}

// === Shopkeeper Chat Threads ===
export function useGetShopkeeperChatThreads() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const { data: ownShops } = useGetOwnShopProfiles();
  const { data: allProducts } = useBrowseProductsWithShop();

  return useQuery({
    queryKey: ['shopkeeperThreads'],
    queryFn: async () => {
      if (!actor || !ownShops || ownShops.length === 0 || !allProducts) return [];

      const myShopIds = ownShops.map((s) => s.id.toString());
      const myProducts = allProducts.filter((p) => myShopIds.includes(p.shop.id.toString()));

      const threadsMap = new Map<string, any>();

      for (const product of myProducts) {
        const messages = await actor.getChatMessages(product.id);
        
        for (const message of messages) {
          const otherParticipant = message.from.toString() === identity?.getPrincipal().toString()
            ? message.to.toString()
            : message.from.toString();

          const threadKey = `${product.id}-${otherParticipant}`;

          if (!threadsMap.has(threadKey) || message.timestamp > threadsMap.get(threadKey).lastMessageTime) {
            threadsMap.set(threadKey, {
              productId: product.id,
              productName: product.name,
              otherParticipant,
              lastMessagePreview: message.content,
              lastMessageTime: message.timestamp,
            });
          }
        }
      }

      return Array.from(threadsMap.values()).sort((a, b) => 
        Number(b.lastMessageTime - a.lastMessageTime)
      );
    },
    enabled: !!actor && !isFetching && !!identity && !!ownShops && !!allProducts,
    refetchInterval: 5000,
  });
}

// === User Profile Queries ===
export function useGetUserProfile(principalString: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['userProfile', principalString],
    queryFn: async () => {
      if (!actor || !principalString) return null;
      const principal = Principal.fromText(principalString);
      return actor.getUserProfile(principal);
    },
    enabled: !!actor && !isFetching && !!principalString,
  });
}

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
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

// === Claims Queries (Placeholder - backend not implemented) ===
export function useGetOwnClaims() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['ownClaims'],
    queryFn: async () => {
      if (!actor) return [];
      // Backend method not yet implemented
      return [];
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useFileClaim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      reason,
      details,
      claimType,
      shortDescription,
    }: {
      productId: bigint | null;
      reason: string;
      details: string;
      claimType: string | null;
      shortDescription: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      throw new Error('Claims backend not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownClaims'] });
    },
  });
}

export function useUploadClaimProof() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ claimId, externalBlob }: { claimId: bigint; externalBlob: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      throw new Error('Claims backend not yet implemented');
    },
  });
}

// === Delivery Queries (Placeholder - backend not fully implemented) ===
export function useGetOwnDeliveryOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['ownDeliveryOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOwnDeliveryOrders();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetDeliveryOrderDetails(orderId: string | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['deliveryOrder', orderId],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      // Backend method not yet implemented - return mock data
      return null;
    },
    enabled: !!actor && !isFetching && !!identity && !!orderId,
    refetchInterval: 5000,
  });
}

export function useCreateDeliveryOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shopId,
      dropoffLocation,
      deliveryOption,
    }: {
      shopId: bigint;
      dropoffLocation: string;
      deliveryOption: DeliveryOption;
    }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      throw new Error('Delivery backend not yet implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownDeliveryOrders'] });
    },
  });
}

export function useUpdateDeliveryStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: bigint; newStatus: DeliveryStatus }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      throw new Error('Delivery backend not yet implemented');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deliveryOrder', variables.orderId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['ownDeliveryOrders'] });
    },
  });
}

export function useCompleteDeliveryWithOTP() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, otp }: { orderId: bigint; otp: string }) => {
      if (!actor) throw new Error('Actor not available');
      // Backend method not yet implemented
      throw new Error('Delivery backend not yet implemented');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deliveryOrder', variables.orderId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['ownDeliveryOrders'] });
    },
  });
}

// === Delivery Partner Mutations ===
export function useRegisterDeliveryPartner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      vehicleType,
      location,
    }: {
      name: string;
      vehicleType: string;
      location: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerDeliveryPartner(name, vehicleType, location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryPartners'] });
    },
  });
}

export function useSetPartnerAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partnerId, isAvailable }: { partnerId: bigint; isAvailable: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setDeliveryPartnerAvailability(partnerId, isAvailable);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryPartners'] });
    },
  });
}

// === Shopkeeper Notifications ===
export function useGetShopkeeperNotifications(shopId: string | null) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['shopkeeperNotifications', shopId],
    queryFn: async () => {
      if (!actor || !shopId) return [];
      return actor.getShopkeeperNotifications(BigInt(shopId));
    },
    enabled: !!actor && !isFetching && !!identity && !!shopId,
    refetchInterval: 5000,
  });
}

// === Wishlist Queries ===
export function useGetWishlist() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWishlist();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetProductLikeStatus(productId: string) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['productLikeStatus', productId],
    queryFn: async () => {
      if (!actor) return { isLiked: false };
      const isLiked = await actor.hasLikedProduct(BigInt(productId));
      return { isLiked };
    },
    enabled: !!actor && !isFetching && !!identity && !!productId,
  });
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
      queryClient.invalidateQueries({ queryKey: ['productLikeStatus', productId.toString()] });
    },
  });
}

export function useUnlikeProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeLike(productId);
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['productLikeStatus', productId.toString()] });
    },
  });
}
