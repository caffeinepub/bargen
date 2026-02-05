# Specification

## Summary
**Goal:** Ensure the existing bargaining website scaffold builds and runs end-to-end as a working, runnable model (no new features).

**Planned changes:**
- Fix any build/runtime issues so the frontend builds without TypeScript errors and the backend canister builds without Motoko errors.
- Verify and repair (as needed) the existing core flows: Internet Identity login/logout, shop discovery/product listing, product detail view, add-to-cart and cart page, submit bargain request (including best-deal request), and product messages thread send/receive.
- Add/ensure clear in-app English error messaging (toast or inline) when core backend calls fail (e.g., not authenticated, missing data, unexpected errors) so the UI does not silently fail.

**User-visible outcome:** The app loads in the browser and renders the main layout; users can log in/out, browse shops/products, view product details, add items to cart, submit bargain requests, and send/receive product messages, with clear English error messages when something goes wrong.
