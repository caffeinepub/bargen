import type { ProductWithShopDetails } from '../backend';

/**
 * Find all listings with the same product name (case-insensitive), excluding the current product
 */
export function findMatchingProducts(
  productName: string,
  allProducts: ProductWithShopDetails[],
  currentProductId: bigint
): ProductWithShopDetails[] {
  const normalizedName = productName.toLowerCase().trim();
  
  return allProducts.filter(
    (p) =>
      p.id !== currentProductId &&
      p.name.toLowerCase().trim() === normalizedName
  );
}

/**
 * Sort comparison listings by price (lowest first)
 */
export function sortByLowestPrice(listings: ProductWithShopDetails[]): ProductWithShopDetails[] {
  return [...listings].sort((a, b) => {
    const priceA = Number(a.price);
    const priceB = Number(b.price);
    return priceA - priceB;
  });
}

/**
 * Sort comparison listings by rating (highest first)
 */
export function sortByHighestRating(listings: ProductWithShopDetails[]): ProductWithShopDetails[] {
  return [...listings].sort((a, b) => {
    const ratingA = Number(a.shop.rating);
    const ratingB = Number(b.shop.rating);
    return ratingB - ratingA;
  });
}

/**
 * Sort comparison listings by distance (nearest first)
 */
export function sortByNearestDistance(listings: ProductWithShopDetails[]): ProductWithShopDetails[] {
  return [...listings].sort((a, b) => {
    return a.shop.distanceKm - b.shop.distanceKm;
  });
}

export type SortOption = 'price' | 'rating' | 'distance';

/**
 * Apply sorting to comparison listings based on selected option
 */
export function applySorting(
  listings: ProductWithShopDetails[],
  sortBy: SortOption
): ProductWithShopDetails[] {
  switch (sortBy) {
    case 'price':
      return sortByLowestPrice(listings);
    case 'rating':
      return sortByHighestRating(listings);
    case 'distance':
      return sortByNearestDistance(listings);
    default:
      return listings;
  }
}
