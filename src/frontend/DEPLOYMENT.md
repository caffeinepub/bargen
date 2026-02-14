# Deployment Guide

## Publishing to Live (Non-Expiring) Deployment

This guide explains how to publish the current draft deployment to a live, non-expiring deployment.

### Prerequisites
- Current draft deployment is tested and working
- All backend canisters are deployed and stable
- Internet Identity integration is functioning

### Publishing Steps

1. **Verify Draft Deployment**
   - Navigate to the draft URL
   - Test the main route (`/`) loads correctly
   - Verify product browsing works (backend call to `browseProductsWithShop`)
   - Test authentication flow (login/logout)
   - Check that cart and wishlist features work

2. **Publish Command**
   ```bash
   # From project root
   dfx deploy --network ic
   ```

3. **Post-Publish Verification**
   - Navigate to the live URL
   - Verify the home page (`/`) loads and displays products
   - Test login with Internet Identity
   - Browse products and verify shop details display
   - Add a product to cart and verify it persists
   - Test navigation between pages (Wishlist, Reports, Admin if applicable)

### Smoke Test Checklist

After publishing, verify these core features:

- [ ] Home page loads at `/`
- [ ] Product list displays with shop information
- [ ] Product detail page loads when clicking a product
- [ ] Login/logout works with Internet Identity
- [ ] Cart functionality (add/view items)
- [ ] Wishlist functionality (like/unlike products)
- [ ] Navigation between all routes works
- [ ] Backend calls succeed (no 404 or canister errors)

### Troubleshooting

**Issue: Blank screen on live deployment**
- Check browser console for errors
- Verify canister IDs are correct in deployment
- Ensure Internet Identity integration is configured for production

**Issue: Backend calls fail**
- Verify backend canister is deployed to mainnet
- Check that frontend is using correct canister ID
- Ensure authentication state is properly initialized

**Issue: Cached data issues**
- Clear browser cache and reload
- Verify QueryClient configuration in `main.tsx`
- Check that cache invalidation works after mutations

### Rollback

If issues occur after publishing:
