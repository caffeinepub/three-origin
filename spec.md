# Three Origin

## Current State
The admin panel has an edit (pencil) feature for updating existing designs. When the admin taps Save Changes, it calls `updateTshirt` via `useUpdateTshirt` hook. The backend `updateTshirt` function uses `Map.add` to overwrite the existing entry.

User consistently reports "Failed to save" (shown as "Failed to update design" toast) when trying to update a design.

## Requested Changes (Diff)

### Add
- Better error surfacing so real error message is shown in the toast (not just generic "Failed to update design")
- Retry logic in useUpdateTshirt to wait for actor if it's momentarily unavailable
- Console logging of the actual error for debugging

### Modify
- `useUpdateTshirt` in `useQueries.ts`: surface the actual error message from the backend in the toast
- `AdminPage.tsx` `handleSave`: log and display the actual error rather than a generic message
- Backend `updateTshirt`: use `Map.replace` instead of `Map.add` to explicitly overwrite, ensuring the key is always updated
- Backend: remove the `containsKey` guard on `updateTshirt` and instead use `replace` which handles both insert and update (so it never throws "Not found")

### Remove
- Generic error swallowing in the update flow

## Implementation Plan
1. Update `main.mo`: change `updateTshirt` to use `tshirts.replace(tshirt.name, tshirt)` instead of `tshirts.add` - this is the explicit overwrite API
2. Remove the "Not found" trap from `updateTshirt` so it upserts safely
3. Update `useQueries.ts` `useUpdateTshirt`: surface the actual error message
4. Update `AdminPage.tsx` `handleSave`: show the real error in the toast
