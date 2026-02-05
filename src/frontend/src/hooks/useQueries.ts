import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { toast } from 'sonner';
import { normalizeBackendError } from '../utils/backendErrors';
import type { CartItem, Message, ProductWithShopDetails, UserProfile } from '../backend';

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
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
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error) => {
      toast.error(normalizeBackendError(error));
    },
  });
}

// Browse Products with Shop Details
export function useBrowseProductsWithShop() {
  const { actor, isFetching } = useActor();

  return useQuery<ProductWithShopDetails[]>({
    queryKey: ['productsWithShop'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.browseProductsWithShop();
      } catch (error) {
        console.error('Failed to browse products:', error);
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

// Get Product Details
export function useGetProductDetails(productId: string) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const products = await actor.browseProductsWithShop();
      const product = products.find(p => p.id.toString() === productId);
      if (!product) throw new Error('Product not found');
      return {
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
        },
        shop: product.shop,
      };
    },
    enabled: !!actor && !isFetching && !!productId,
    retry: 1,
  });
}

// Create Shop Profile
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
      queryClient.invalidateQueries({ queryKey: ['productsWithShop'] });
      toast.success('Shop profile created successfully');
    },
    onError: (error) => {
      toast.error(normalizeBackendError(error));
    },
  });
}

// Create Product
export function useCreateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      shopId: bigint;
      name: string;
      description: string;
      price: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProduct(data.shopId, data.name, data.description, data.price);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productsWithShop'] });
      toast.success('Product created successfully');
    },
    onError: (error) => {
      toast.error(normalizeBackendError(error));
    },
  });
}

// Cart Operations
export function useGetCartItems() {
  const { actor, isFetching } = useActor();

  return useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getCartItems();
      } catch (error) {
        console.error('Failed to get cart items:', error);
        // Return empty cart on error instead of throwing
        return [];
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
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
    onError: (error) => {
      // Error will be handled by the component
      console.error('Add to cart error:', error);
    },
  });
}

// Bargain Requests
export function useSendBargainRequest() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (data: {
      productId: bigint;
      desiredPrice: bigint;
      note: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendBargainRequest(data.productId, data.desiredPrice, data.note);
    },
    onError: (error) => {
      // Error will be handled by the component
      console.error('Bargain request error:', error);
    },
  });
}

// Messages
export function useGetChatMessages(productId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Message[]>({
    queryKey: ['messages', productId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getChatMessages(BigInt(productId));
      } catch (error) {
        console.error('Failed to get messages:', error);
        // Return empty messages on error instead of throwing
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!productId,
    refetchInterval: 5000,
    retry: 1,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      to: any;
      content: string;
      productId: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(data.to, data.content, data.productId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.productId.toString()] });
    },
    onError: (error) => {
      // Error will be handled by the component
      console.error('Send message error:', error);
    },
  });
}
