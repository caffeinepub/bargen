# Specification

## Summary
**Goal:** Add used-product age info, product verification labels, and return policy to products, and ensure end-to-end support for uploading and viewing multiple product images.

**Planned changes:**
- Extend the backend Product model to store: used-product age (optional), product verification label(s) ("Verified Product", "Quality Checked"), and a return policy ("Return Available", "No Return", "Exchange Only"), and include these fields in product read responses.
- Update backend create/update product APIs to accept and validate the new fields, only allowing used-product age when product condition is "Used".
- Add a safe/conditional migration so existing persisted products get consistent defaults for the new fields without breaking existing deployments.
- Update the shopkeeper Add Product UI to capture: used-product age (only when condition is Used), verification label(s) selection, and return policy selection; submit these values on create.
- Update the product detail page to display: used-product age (when applicable), verification badges/labels, and the selected return policy, handling missing/unset values gracefully.
- Ensure multi-image upload works end-to-end: select multiple images, preview and remove before submit, persist multiple photos, and browse them via gallery (carousel + thumbnails) on the product detail page while preserving current single/zero-image behavior.

**User-visible outcome:** Shopkeepers can create products with optional used-age text (for used items), verification labels, and a return policy, upload multiple photos per product, and buyers can view these new fields and browse multiple product images on the product detail page.
