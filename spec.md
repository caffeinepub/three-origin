# Three Origin

## Current State
T-shirt gallery with modal popup on image click. No price fields. WhatsApp message has only design name. Admin adds designs with name, description, image only.

## Requested Changes (Diff)

### Add
- price and deliveryCharge fields to Tshirt backend type
- New route /design/:name — full detail page per design
- Detail page: large image, name, description, price breakdown, Order Now via WhatsApp button
- WhatsApp message includes image URL, price, delivery charge
- Price + delivery inputs in admin Add Design form

### Modify
- Card click navigates to /design/:name instead of modal
- WhatsApp message enriched with price info and image URL
- Admin form adds price/delivery charge fields

### Remove
- DesignModal popup (replaced by detail page)

## Implementation Plan
1. Update backend Motoko: add price and deliveryCharge to Tshirt
2. Regenerate backend bindings
3. Create DesignDetailPage.tsx
4. Update App.tsx with new route
5. Update HomePage.tsx — no modal, card navigates to detail
6. Update AdminPage.tsx — add price/delivery fields
