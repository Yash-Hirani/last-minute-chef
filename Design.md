1. Brand & visual language
Primary brand color: Orange‑red (used for CTAs, highlights, and key actions such as “Order Now”, filters, and status indicators).

Secondary palette: Neutral grays and soft whites for backgrounds, with subtle accent colors for promotions and badges.

Typography:

Sans‑serif system‑ui / custom font family.

Clear hierarchy: display title, heading, body, caption, and helper text sizes.

2. Layout & grid
Breakpoints:

Mobile‑first layout; portrait‑oriented, with 16–20 pt safe‑edge insets.

Grid:

8‑pt baseline grid for spacing, padding, and margins.

Cards and list items snap to this grid for consistent rhythm.

3. Navigation & flows
Bottom navigation bar (mobile):

4–5 core tabs: Home, Orders, Offers/Coins, Profile, optionally Cart.

Header / top bar:

Location pill (city + pin‑icon) on the left, search bar centrally, and profile/cart icons on the right.

Main flows:

Home → Select restaurant → Menu → Cart → Checkout → Order tracking.

Persistent cart icon / mini‑cart shows item count and opens slide‑up cart.

4. Components library
Design tokens and components are standardized across iOS, Android, and web.

Core tokens
Colors:

Brand primary, secondary, success, warning, error, and neutral tiers.

Spacing:

< 8>, 8, 12, 16, 24, 32, 40, 48, 64> used consistently.

Radius:

Small rounded corners for cards, buttons, and chips (e.g., 8–12 pt).

Key UI components
Buttons:

Primary (filled orange), secondary (outlined), text, and floating‑action‑style checkout button.

Chips & filters:

Rounded pills for cuisines, dietary tags (“Veg”, “Non‑Veg”), and order‑type filters.

Cards:

Restaurant card (image, name, rating, ETA, offer tag, price indicator).

Menu item card (image, name, price, add‑to‑cart button).

Lists & carousels:

Vertical scroll for restaurant lists; horizontal carousels for banners, offers, and “Because you ordered” recommendations.

5. Home screen structure
Location bar: City + pin + search bar.

Promo / banner section: Full‑width banners auto‑scroll horizontally.

Category section: Horizontal scroll of food categories (Pizza, Biryani, Chinese, etc.).

Restaurant list:

Each row: restaurant card with image, name, rating, ETA, offer badge, and price tier.

6. Restaurant / menu screens
Restaurant header:

Hero image, restaurant name, rating, distance, delivery time, and “Offer” labels.

Sub‑navigation:

Tabbed layout: “Menu”, “Reviews”, “Photos” (optional).

Menu structure:

Vertical sections: “Recommended”, “Starters”, “Mains”, “Desserts”, etc., each with a heading and list of items.

Each item shows name, price, description, and an “Add” button that turns into a quantity stepper when in cart.

7. Cart & checkout
Cart drawer / screen:

Collapsible side‑sheet or full‑page cart, listing items, modifiers, and final price.

Order summary:

Item total, delivery fee, taxes, and final amount.

Checkout steps:

Address selection → Payment method selection → Place order button.

8. Motion & micro‑interactions
Transitions:

Smooth push/pop transitions between screens; subtle slide‑in for bottom‑sheets (cart, filters).

Feedback:

Button press feedback, “Added to cart” snack‑bar or toast, and loading spinners on API calls.

9. Design system architecture (high‑level)
Swiggy’s Design Language System (DLS) is split into two main layers.

Layer	Purpose
Foundation	Design tokens: colors, typography, spacing, shadows, breakpoints. 
Components	Reusable UI units (buttons, cards, modals, lists, etc.) built from tokens. 
This setup allows Swiggy to reuse the same language across iOS, Android, and web and to change themes with minimal code changes.