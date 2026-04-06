# Three Origin — Color Options per Design

## Current State

- `Tshirt` record in backend has: `name`, `description`, `imageKey`, `price`, `deliveryCharge`, `sizes: [Text]`, `stock: Nat`
- No color data exists anywhere — backend, TypeScript types, admin panel, or detail page
- Admin panel has fields: name, description, price, delivery charge, sizes (comma-separated), stock, single image upload
- `DesignDetailPage` shows: image, title, price, delivery, size selector buttons, quantity, WhatsApp order button
- WhatsApp message includes: image URL, name, size, quantity, price, delivery — no color

## Requested Changes (Diff)

### Add
- `colors: [Text]` field on `Tshirt` backend type — list of color names (e.g. ["Black", "White", "Red"])
- Admin panel: color input field — user types comma-separated color names (same pattern as sizes), stored on save
- `DesignDetailPage`: color swatch selector — clickable buttons/pills for each color, one auto-selected on load, selected color highlighted
- Selected color included in the WhatsApp order message (e.g. "Color: Black")
- Color shown in the Cart and cart WhatsApp message

### Modify
- `Tshirt` type in `main.mo` — add `colors : [Text]`
- `Tshirt` interface in `backend.d.ts` — add `colors: Array<string>`
- `addTshirt` call in `AdminPage.tsx` — include `colors` array parsed from comma-separated input
- `DesignDetailPage.tsx` — add `selectedColor` state, render color swatches, include color in WhatsApp message
- `CartContext.tsx` / `CartPage.tsx` — include `selectedColor` in cart item and WhatsApp summary if present

### Remove
- Nothing removed

## Implementation Plan

1. Update `Tshirt` record in `main.mo` to include `colors : [Text]`
2. Update `backend.d.ts` `Tshirt` interface to include `colors: Array<string>`
3. Update `AdminPage.tsx` DesignsTab:
   - Add `colors` state (string input, comma-separated)
   - Parse and pass colors array when calling `addTshirt`
   - Display colors in the design list rows
4. Update `DesignDetailPage.tsx`:
   - Add `selectedColor` state (default to first color on load)
   - Render color swatches as clickable pill/button row — only shown if design has colors
   - Highlight selected color
   - Include `Color: {selectedColor}` in WhatsApp message if a color is selected
5. Update `CartContext.tsx` and `CartPage.tsx` to carry `selectedColor` per cart item and include it in WhatsApp order summary
