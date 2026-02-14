# Specification

## Summary
**Goal:** Publish the currently deployed draft of the application to a live (non-expiring) deployment.

**Planned changes:**
- Create a live deployment from the current project state (not draft-only) so it remains accessible without requiring rebuilds.
- Verify the live URL loads the main route (`/`) and that backend canister calls work as they did in the draft deployment.

**User-visible outcome:** Users can access the app via a live, non-expiring URL where the main page loads and backend functionality works as expected.
