# Three Origin

## Current State
The admin panel stores t-shirt images as full base64 data URLs inside the `imageKey` field of the `Tshirt` record. When a user edits a design and saves, the full base64 image (potentially several MB) is passed back through the ICP canister `updateTshirt` call, which exceeds the 2MB message size limit and causes a trap ("failed to save" error).

The blob-storage system is already integrated and available via `StorageClient` and `useStorageClient`.

## Requested Changes (Diff)

### Add
- Upload images to blob storage when adding a new design; store the resulting blob hash/URL in `imageKey` instead of base64
- Show upload progress when adding a new design

### Modify
- `handleAddTshirt` in `DesignsTab`: use `StorageClient.putFile()` to upload the image, then store the returned direct URL in `imageKey`
- `TshirtRow` edit save (`handleSave`): already passes `tshirt.imageKey` (the URL), which will now be small -- this will work correctly once images are stored as URLs

### Remove
- `fileToBase64` helper (no longer needed once blob storage is used)

## Implementation Plan
1. In `AdminPage.tsx`, import `useStorageClient` and use `StorageClient.putFile()` to upload the image
2. Store the direct URL (from `storageClient.getDirectURL(hash)`) as the `imageKey`
3. Keep the existing edit flow -- it already re-passes `tshirt.imageKey`, which will now be a short URL string instead of a huge base64
4. No backend changes needed
