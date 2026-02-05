# Specification

## Summary
**Goal:** Display all product and cart prices across the website in Indian Rupees (INR) with ₹ and Indian number formatting, applying a consistent USD→INR conversion from existing USD minor-unit values.

**Planned changes:**
- Update the shared frontend currency/price formatting utility to output INR (₹) using Indian locale formatting (en-IN) and apply a consistent USD→INR conversion for existing price values treated as USD cents.
- Replace all user-facing USD labels, placeholders, and examples in price entry fields (e.g., product creation and bargain offer flows) to INR wording and ₹ examples.
- Ensure cart line items and subtotal/total use the same conversion + formatting logic as individual product prices so totals remain consistent.

**User-visible outcome:** All prices throughout product browsing, product details, cart, and product-management/bargain flows appear in INR (₹) with Indian-style digit grouping, and no UI text references USD/$.
