# One More — Ordering System Build Plan for Claude Code

Run these **in order, one per Claude Code session, in the same project** — each step builds on the ones before it. Copy only the text inside each `PROMPT →` block into Claude Code; everything else on this page is for you, not for Claude Code to read.

**Model:** use Opus for this build — `/model claude-opus-4-8` inside a Claude Code session, or `claude --model claude-opus-4-8` at launch. There's enough interlocking logic here (order routing across five roles, shared table sessions, inventory math) that it's worth the stronger model over the default.

**Reference the live site directly.** A few steps below (mainly 2 and 3) ask Claude Code to cross-check against the real thing at **https://one-more.alimento.io** rather than only trusting my written descriptions — those are accurate but not exhaustive, and the actual site is right there.

**Workflow — every step, no exceptions:** build → deploy a Vercel preview → you get a real link to open on your phone → you test it → you approve → only then does Claude Code push to GitHub. Nothing moves to the next step, and nothing gets pushed to GitHub, until you've actually tapped through it on a phone and said so explicitly. I've baked this into the closing lines of every prompt block below so it holds even though each step gets pasted into Claude Code as its own fresh message with no memory of this framing text. "Zero errors" is a hard bar throughout — not "it basically works," actually clean: no console errors, no TypeScript errors, clean build.

---

## ⚠️ Flags — decisions made along the way, worth a quick skim

1. ~~Pickup order routing~~ — confirmed: `barista → cashier → counter`, as I proposed.
2. ~~Exact brand colors~~ — resolved: light accent `#7db2c5`, dark accent `#5a3694`. Baked into Step 1.
3. ~~The "name" field~~ — resolved, and simpler than I first guessed: there's no per-item "who is this for" field. Name is collected once, at the order level — required for pickup and delivery, not collected at all for table orders (the table number is the identifier). Delivery's form in Step 3 now includes Name alongside the address fields.
4. ~~Login / multi-role workers~~ — confirmed: username + password + a role picker, validated against the worker's assigned role(s). Actual role *assignment* will live on the Manager page (Step 11) once it exists — a worker being cross-trained for two roles is just two `workers`/`shifts` rows with the same person, nothing exotic.
5. ~~Receipt printing~~ — scratched per your instruction: Step 10 now generates a **digital receipt record** only, no physical printer, no `window.print()`. This also removes the second "deliver the printed receipt" pass from the Waiter page (Step 8) and changes what "On the way" triggers on the Delivery page (Step 9) — both updated below. Bringing physical printing back later would be its own small follow-up step, not a rewrite.
6. ~~Round-robin + "empty driver"~~ — confirmed: assign to whoever's currently free and, among the free ones, whoever was assigned an order longest ago, regardless of whether that prior order's actually been delivered yet. You're running 2–3 drivers a shift, not a fleet, so this stays a simple log-based rotation.
7. **QR code URL scheme, changed in this update.** The original plan was a plain `/menu?table=4` — easy to guess and share around, which cuts against the "high security awareness" anti-spam requirement from Step 5. Since Step 11 (Manager) now actually generates and prints these QR codes for the first time, I switched to `/menu?t=<random-token>`, where the token is looked up server-side to find the table (and its human-readable number) — not guessable, not sequential. **If you've already built Step 3 with the old `?table=` scheme, this needs a small follow-up adjustment** — flagging it now rather than leaving the document inconsistent.
8. **Accounting metrics on the Manager page** — you said "accounting and summary of all things," without a specific list. I picked a reasonable default set in Step 11 (revenue, order counts, breakdown by order type, best sellers, live status snapshot). Easy to add/remove once you see it.
9. **Zero-stock behavior: fully hidden vs. greyed-out "sold out."** You said "automatically hide," so Step 13 defaults to fully hiding an item once it hits 0 available quantity. A visibly greyed-out sold-out state is arguably a better experience (customer isn't confused why an item vanished) — flagged in Step 13, easy to flip either way.
10. **Stock is checked and decremented at order-submission time, not the moment something's added to a cart.** If it reserved stock the instant it entered someone's cart, an abandoned cart would lock up real inventory indefinitely. The cart/quantity-stepper still shows a live "X available" as guidance while browsing, but the actual cap-and-warn logic (your 5-cups/800ml-milk example) runs server-side, atomically, at the moment the order is placed — detailed in Step 13.

---

## Reference data (real, pulled from your live site and Notion database)

**Logo:** `https://media.alimento.io/logos/119/17717513987312835.png`

**Brand accent colors (confirmed):**
- Light theme accent (baby blue): `#7db2c5`
- Dark theme accent (purple): `#5a3694`

**Current footer content** (replicate structure, adjust styling to the new theme):
- Heading: "Share your contact to get updates on exclusive offers"
- Fields: Your Name / Your Phone Number / Your Birthday, with an Accept button
- Links: Privacy policy, Terms & conditions
- Copyright line: `© {current year} one-more`

**Delivery address form fields** (from the live site — match these exactly, plus the Name field per flag #3 above):
- Name (new — see flag #3)
- Area name (dropdown — Alexandria neighborhoods: Kafr Abdo, Roushdy, Stanley, Bolkly, Fleming, Smouha, Sedi Gaber, Saba Basha, Gleem, San Stefano, Ziznia, Celoptra, Janklees, Louran, Sporting, Ibrahimia)
- Street name (text)
- Building details (text)
- Address Mark (text — landmark/note)
- Address Type (Home / Office / Other)

**Pickup form:** Name + Phone Number (skip branch selection; there's one relevant venue for this build).

**Menu catalog:** 10 categories, 106 items total, already fully populated with names, prices, descriptions, and images in your "One More – Menu Database" Notion database. I can export this as a JSON seed file whenever you want it — flag it for Step 1 or wait until Step 14 (seed data step), your call.

**QR code scheme (updated — see flag #7):** `/menu?t=<qr_token>` for in-café QR codes, where `qr_token` is a random per-table string resolved server-side to the table's number. Bare `/menu` for the Instagram/external link. QR codes themselves are generated on the Manager page (Step 11).

**Live site for reference:** https://one-more.alimento.io — use this directly for anything ambiguous in Steps 2 and 3 especially.

---

## STEP 1 — Project setup, data model, design system, deployment pipeline

```
PROMPT →

Set up a new phone-first web app for a café ordering system called "One More."

TECH STACK
- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase for Postgres database, Realtime subscriptions, and auth (staff accounts are
  pre-provisioned by a manager, not self-signup — plain username/password stored as
  workers with hashed passwords is fine, Supabase Auth is optional here)
- This will grow into a large multi-role app (customer ordering + 6 staff dashboards),
  so set up a clean folder structure now: /app/(customer)/, /app/(admin)/, /lib/db/,
  /lib/realtime/, /components/shared/, /components/customer/, /components/admin/

DATABASE SCHEMA
Create these tables in Supabase (Postgres). Use UUIDs for primary keys, timestamps with
timezone, and sensible indexes on foreign keys and anything queried by status.

- menu_categories: id, name, sort_order
- menu_items: id, category_id (fk), name, description, price, image_url, is_available (bool)
- addon_groups: id, name (e.g. "Milk Type", "Sugar Level", "Flavor Add-ons", "Toppings"),
  selection_type ('single' | 'multiple'), is_required (bool)
- addon_options: id, group_id (fk), name, price_delta (numeric, can be 0)
- menu_item_addon_groups: menu_item_id (fk), addon_group_id (fk) — join table controlling
  which customization groups appear for which item (this is what makes customization
  "smart per item" later — a croissant won't show "milk type", a latte will)
- tables: id, table_number (int, unique), qr_token (text, unique, random — this is what
  the customer-facing URL actually encodes, not the raw number, see DESIGN SYSTEM below)
- table_sessions: id, table_id (fk), status ('open' | 'closed'), opened_at, closed_at
- delivery_addresses: id, area, street, building_details, address_mark,
  address_type ('home' | 'office' | 'other')
- orders: id, order_type ('table' | 'pickup' | 'delivery'), table_session_id (fk, nullable),
  customer_name (nullable — required for pickup/delivery, not collected for table orders),
  customer_phone (nullable — required for pickup), delivery_address_id (fk, nullable),
  status (text), created_at, sent_to_next_at (nullable), assigned_driver_id (fk to workers,
  nullable), is_pos_order (bool, default false), is_paid (bool, default false),
  session_token (text — see Step 5, anti-spam)
- order_items: id, order_id (fk), menu_item_id (fk), quantity, selected_options (jsonb —
  array of {group_name, option_name, price_delta}), unit_price, line_total
- workers: id, username (unique), password_hash, full_name, role ('barista' | 'waiter' |
  'cashier' | 'delivery' | 'manager' | 'inventory'), is_active (bool)
- shifts: id, worker_id (fk), role, clock_in, clock_out (nullable) — a worker is "on shift"
  when clock_out is null
- delivery_rotation_log: id, worker_id (fk), order_id (fk), assigned_at — an append-only
  log; the round-robin logic in Step 9 reads from this, don't build a separate pointer table

ORDER STATUS VALUES (use these exact strings across the whole app for consistency):
placed → at_barista → at_waiter | at_delivery | at_cashier (branches by order_type)
  → [table path] awaiting_payment → completed (closing the table session in Step 10
    generates a digital receipt and completes every order in it in one step — no
    physical hand-off stage, receipts are digital-only for now)
  → [delivery path] out_for_delivery → completed
  → [pickup path] ready_for_pickup → completed

DESIGN SYSTEM
This is phone-first ONLY. Do not build responsive desktop breakpoints — design for a
single mobile viewport (~375–430px wide). If someone opens it on a desktop browser, it's
fine for the layout to just stay narrow and centered; don't spend effort adapting it wider.

Two themes, switchable, persisted (localStorage). These are the confirmed brand colors —
use them exactly, no sampling or approximation needed:
- LIGHT: white background (#FFFFFF), black text (#000000), baby-blue accent (#7db2c5).
- DARK: black background (#000000), white text (#FFFFFF), purple accent (#5a3694).

Set these up as CSS custom properties (--bg, --text, --accent, etc.) so every component
reads from tokens, never hardcoded colors. Logo:
https://media.alimento.io/logos/119/17717513987312835.png — use it in both themes; if it
doesn't have enough contrast on dark mode, note that and suggest a treatment (e.g. a
subtle light backing plate) rather than silently leaving it unreadable.

For typography and spacing: don't default to generic Tailwind starter-template choices
(the ubiquitous Inter-everywhere, cream-and-terracotta, or stark-black-with-one-neon-accent
looks). Pick a clean, legible type pairing that feels like a modern café brand — this app
will be read quickly by customers and, critically, by staff under time pressure in a busy
shop, so legibility and touch-target size matter more than decoration here.

Table QR URLs use a random qr_token, not the raw table_number (e.g. /menu?t=aX7pQ2, not
/menu?table=4) — resolve the token server-side to find the table and its human-readable
number. This is a deliberate anti-guessing choice, not an accident.

Don't build any customer/admin pages yet beyond a barebones page that proves the theme
switcher and both color tokens work correctly — actual pages start in Step 2 onward.

DEPLOYMENT PIPELINE (set this up even if you're continuing an existing project — this can
run standalone as a catch-up step)
Every step in this build plan ends with: deploy a preview, get approval, then push to
GitHub. Set up the mechanism now:
1. If there's no git repo yet, initialize one. If there's no GitHub repo yet, create one
   (use the `gh` CLI if it's authenticated; otherwise tell me exactly what you need me to
   create/name) and push the current code as the initial commit.
2. Check whether the Vercel CLI is installed and authenticated (`vercel whoami`). If not,
   stop and tell me exactly what to run locally to authenticate (`vercel login`) — don't
   try to work around missing auth.
3. Link this project to a Vercel project (`vercel link`, creating a new one if needed) and
   connect it to the GitHub repo so pushes to main auto-deploy to production.
4. Do one full deploy now (`vercel deploy`) purely to prove the pipeline works end to end,
   and give me that URL.

BEFORE YOU FINISH THIS STEP
- Confirm the theme switcher visibly changes both background and accent colors correctly,
  and that the deployment pipeline above actually produces a working, loadable URL.
- Zero errors: production build must succeed clean, zero TypeScript errors, zero console
  errors or warnings. Don't hand back something with known errors "to fix later."
- Give me the deployed preview URL directly in your reply — something to open on my phone.
- Stop there. Don't start Step 2 until I reply confirming this works. If I report a bug,
  fix it, redeploy, and send the new link.
- Once I approve: git commit and push to GitHub as the checkpoint.
```

---

## STEP 2 — Shared layout components (top bar, footer, theme switcher)

```
PROMPT →

Building on the One More project from Step 1, create the shared layout components that
every page will use. Two variants: customer-facing and admin-facing — they share the
theme system but differ in content. For the footer especially, cross-check against the
live site at https://one-more.alimento.io if anything below is ambiguous.

CUSTOMER TOP BAR (component: CustomerTopBar)
Fixed to the top. Left-to-right layout:
- Far left: a three-line hamburger icon that opens a slide-in nav drawer listing other
  customer pages (right now this will only ever contain "Menu" since that's the only
  customer page that exists — build the drawer so it's trivial to add more links later)
- Next to it: the theme switcher button (sun/moon icon toggle)
- Center: the One More logo (https://media.alimento.io/logos/119/17717513987312835.png),
  truly centered regardless of what's on the left/right (don't let the hamburger+theme
  cluster push it off-center — center it independently, e.g. with absolute positioning
  or a 3-column grid)
- Right: empty for now, but leave a slot — the Menu page will inject a cart button here
  in Step 4. Design CustomerTopBar to accept an optional `rightSlot` prop/children so
  other future customer pages can add their own right-side action without duplicating
  the whole component.

CUSTOMER FOOTER (component: CustomerFooter)
Match the live site's current footer:
- Heading: "Share your contact to get updates on exclusive offers"
- Three inputs: Your Name, Your Phone Number, Your Birthday
- An "Accept" button (wire it to nothing functional yet — just the UI, we'll connect it
  when we know what "accept" should actually do, e.g. save to a customer table — leave a
  TODO comment)
- Links: Privacy policy, Terms & conditions (can point to placeholder routes /privacy and
  /terms for now)
- Copyright line: "© {current year} one-more" (compute the year, don't hardcode it)

ADMIN TOP BAR (component: AdminTopBar)
Fixed to the top. No hamburger, no nav — admin pages are role-locked and must not expose
a way to reach other admin pages.
- Left: theme switcher
- Center: logo, same centering rules as above
- Right: the logged-in worker's full name, then a "Log Out" button next to it
No footer at all on admin pages.

Both top bars must respect the light/dark tokens from Step 1 — no hardcoded colors.

Wire these into two route group layouts: app/(customer)/layout.tsx uses CustomerTopBar +
CustomerFooter around the page content; app/(admin)/layout.tsx uses AdminTopBar only, no
footer. Don't build the actual admin auth check yet (that's Step 6) — just get the visual
shell right and use a hardcoded placeholder worker name for now to verify the layout.

BEFORE YOU FINISH THIS STEP
- Confirm both layouts render correctly in both themes, the logo stays centered
  regardless of what's on either side, and the footer matches the live site's structure.
- Zero errors: clean build, zero TypeScript errors, zero console errors/warnings.
- Deploy a preview (`vercel deploy`) and give me the exact link.
- Stop there. Don't start Step 3 until I confirm this works. Fix and redeploy if I report
  an issue, and don't move on until I explicitly approve.
- Once I approve: git commit and push to GitHub.
```

---

## STEP 3 — Menu page: entry, QR/order-context detection, order-type forms, "Play with us" placeholder

```
PROMPT →

Building on Steps 1–2, build the entry section of the customer Menu page
(app/(customer)/menu/page.tsx). This step is everything ABOVE the actual item catalog —
the catalog itself is Step 4. Cross-check the delivery/pickup icon treatment against
https://one-more.alimento.io if anything below is ambiguous.

ROUTING / QR DETECTION
- If the URL is /menu?t=<qr_token>, this is an in-café QR scan. Look up the table by its
  qr_token server-side and resolve its table_number for display — don't trust or display
  a raw number from the URL directly.
- If the URL is bare /menu (no token — this is how the Instagram bio link or any external
  link should point), this is an external visit.

ORDER-CONTEXT BAR
Directly under CustomerTopBar, add a divider line, then below it:
- QR/table case: show "Table {number}" clearly (the resolved number, not the token). This
  sets order_type = 'table' for everything that follows on this visit — store it in a
  session/context so later steps (cart, submission) know it. No name or phone is
  collected for table orders — the table number is the identifier.
- External-link case: show two tappable options, Delivery and Pickup (reuse the existing
  site's icon style/intent — a fast-delivery icon and a pickup icon side by side).
  - Delivery selected → open a form with these fields — the address fields match the live
    site exactly, plus a Name field (delivery orders need a name the same way pickup does):
    Name, Area name (dropdown: Kafr Abdo, Roushdy, Stanley, Bolkly, Fleming, Smouha,
    Sedi Gaber, Saba Basha, Gleem, San Stefano, Ziznia, Celoptra, Janklees, Louran,
    Sporting, Ibrahimia), Street name, Building details, Address Mark, Address Type
    (Home/Office/Other). On submit, save the name to orders.customer_name, the rest to
    the delivery_addresses table, and set order_type = 'delivery' for this session.
  - Pickup selected → open a simple form: Name, Phone Number. On submit, store these and
    set order_type = 'pickup' for this session.
  Once either is chosen, show a small persistent indicator (e.g. "Delivery to {area}" or
  "Pickup for {name}") in place of the two buttons, with a way to change it.

"PLAY WITH US" SECTION
Directly below the order-context bar, above the menu catalog, add a section titled
"Play with us". This is a PLACEHOLDER only right now — build the component shell
(PlayWithUs component, its own file) with:
- A visually distinct card/banner inviting the user to play
- A "Play" button that currently just opens an empty modal/sheet saying
  "More coming soon" — no game logic, no questions, no scoring
- Structure the component so it's easy to slot in real question/scoring logic later
  (e.g. accept a `questions` prop that's currently an empty array, render nothing extra
  when empty)
Don't guess at what the game asks or how it scores — that logic comes later with more
detail.

Leave a clearly marked spot below "Play with us" where the category tabs + item catalog
from Step 4 will go.

BEFORE YOU FINISH THIS STEP
- Test both entry paths yourself: a fake table URL (/menu?t=<a token you seed for
  testing>) shows the right table number; bare /menu shows the Delivery/Pickup choice and
  both forms collect and save the right fields.
- Zero errors: clean build, zero TypeScript errors, zero console errors/warnings.
- Deploy a preview and give me the exact link, including one working test table URL I can
  actually tap.
- Stop there. Don't start Step 4 until I confirm this works.
- Once I approve: git commit and push to GitHub.
```

---

## STEP 4 — Menu catalog: category tabs, item grid, smooth scroll

```
PROMPT →

Building on Step 3, build the actual menu catalog inside the Menu page, below the
"Play with us" section.

DATA
Fetch menu_categories and menu_items (with their addon groups via
menu_item_addon_groups) from Supabase. For now, seed the database with a handful of
realistic placeholder items across 2–3 categories so the UI is testable — I'll provide
the full real catalog (106 items across 10 categories: Signature & Specials, Bakery &
Dessert, Hot Drinks, Ice Drinks, Hot Matcha, Ice Matcha, Mojitos, Smoothies & Shakers,
Drinks & Refreshments, Add-ons) as a seed script in Step 14. Note for later: Step 13 will
come back and add stock-based availability filtering to this fetch — nothing to do about
that now, just don't be surprised when a future step modifies this file.

CATEGORY TABS
A horizontal, swipeable/scrollable tab bar, one tab per category, sticky just below the
order-context bar as the user scrolls. Tapping a tab smoothly scrolls the page down to
that category's section (anchor-scroll with a smooth easing, not an instant jump — and
account for the sticky tab bar's height so the section title doesn't end up hidden
underneath it). The active tab should visually update both on tap AND as the user
naturally scrolls past each section (scroll-spy behavior).

ITEM GRID
Below the tabs, render each category as its own section (with a heading) containing a
grid of item cards. Each card: image, name, price. Keep cards touch-friendly — this is
tapped with thumbs, not clicked with a cursor, so give real tap targets (44px+ minimum).

Tapping a card is the trigger for Step 5's customization modal — for this step, just wire
the tap handler to open an empty modal shell (Step 5 fills it in) so the interaction is
provably wired up.

Handle empty/loading states properly: a loading skeleton while items fetch, and a real
"nothing here yet" state per category if it has zero items (not a blank white gap).

BEFORE YOU FINISH THIS STEP
- Confirm tapping every tab smoothly scrolls to the right section, scroll-spy correctly
  highlights the active tab while scrolling manually, and cards are comfortably tappable
  on an actual phone screen, not just a mouse cursor.
- Zero errors: clean build, zero TypeScript errors, zero console errors/warnings.
- Deploy a preview and give me the exact link.
- Stop there. Don't start Step 5 until I confirm this works.
- Once I approve: git commit and push to GitHub.
```

---

## STEP 5 — Item customization, cart, order submission, anti-spam

```
PROMPT →

Building on Step 4, build item customization, the cart, and order submission. This is the
step where a browsing session turns into a real order. Note for later: Step 13 will come
back and add stock-based capping to the quantity stepper and submission logic here —
nothing to do about that now, just don't be surprised when a future step modifies this
file.

CUSTOMIZATION MODAL (opens on item tap)
A bottom sheet / modal, not a separate blank page. Contents, top to bottom:
1. Item image + name + base price
2. Customization options — driven by that item's addon_groups (from Step 1's schema),
   NOT hardcoded per item. A milk-based drink shows Milk Type / Sugar / Flavor Add-ons
   groups; a pastry shows none, or just relevant ones. Single-select groups render as
   radio-style chips, multi-select as checkboxes, respecting each group's is_required flag
   for validation before allowing add-to-cart.
2b. Live-updating price as options are selected (base price + sum of selected
   price_deltas × quantity).
3. Quantity stepper (+ / −, minimum 1).
4. A large, full-width "Add to Cart" button. On tap: add the configured item to a client-
   side cart, close the modal, return to the menu (don't navigate to a new page), and
   update the cart badge count in the top bar.

CART
Wire CustomerTopBar's `rightSlot` (from Step 2) to a cart icon with a count badge. Tapping
it opens a cart drawer (not a separate route — keep this inside the Menu page, since the
menu is the only customer page for now) listing every item added: name, selected options,
quantity (editable), line price, and a remove control. Show a running total. A
"Place Order" button at the bottom, disabled if the cart is empty or if required
order-context info is missing (no table detected AND no delivery/pickup info chosen yet —
prompt the user back to that step if so).

ORDER SUBMISSION
On "Place Order": create one `orders` row (order_type, table/delivery/pickup fields set
from Step 3's context) plus one `order_items` row per cart line, status = 'at_barista'.
Validate that customer_name (and customer_phone, for pickup) are present before allowing
submission for pickup/delivery order types; table orders don't require either. Server-
side, NEVER trust client-sent prices — recompute every line total and the order total
from the current menu_items/addon_options data before writing. If order_type is 'table',
find or create the open table_sessions row for that table (see the session-merge rule
below) and attach the order to it.

TABLE SESSION MERGING (the "multiple phones, one table" rule)
When a table order comes in: look for an existing table_sessions row for that table with
status = 'open'. If one exists, attach this new order to it. If not, create one
(status = 'open', opened_at = now) and attach to that. The session stays open — and the
table effectively "occupied" — until a cashier closes it in Step 10 (generates the digital
receipt). Only then does the table become available for a fresh session.

ANTI-SPAM / SECURITY (this matters — implement all of these, don't skip for MVP speed)
- Issue a signed session token when the Menu page loads (store in an httpOnly cookie or
  similar), scoped to the table (by qr_token) or delivery/pickup context detected in
  Step 3. Reject any order submission that doesn't carry a valid, matching session token —
  this stops someone from scripting raw requests against the API.
- Rate-limit order creation per session token: no more than one new order every N seconds
  (make N configurable, default something like 30–60s), and/or require the previous order
  from that session to have left 'placed' status before allowing another.
- Add IP-based rate limiting at the API route level as a blunt backstop against scripted
  abuse from outside the normal flow.
- Add a lightweight human-confirmation step before final submit — e.g. a "hold to
  confirm" press-and-hold on the Place Order button instead of a single tap. This deters
  basic bots without adding real friction for a real customer.
- Validate every menu_item_id and addon_option_id in the submitted cart actually exists
  and is currently available before writing the order — reject and surface a clear error
  otherwise.

BEFORE YOU FINISH THIS STEP
- Place a real test order end to end (both a table-context order and a pickup/delivery
  one) and confirm it actually lands in the orders table correctly, confirm two orders
  from the same simulated table merge into one open table_session, and confirm the rate
  limit actually blocks a rapid double-submit.
- Zero errors: clean build, zero TypeScript errors, zero console errors/warnings.
- Deploy a preview and give me the exact link.
- Stop there. Don't start Step 6 until I confirm this works.
- Once I approve: git commit and push to GitHub.
```

---

## STEP 6 — Admin foundation: login, role routing, admin shell

```
PROMPT →

Building on Steps 1–2, build the staff-facing authentication and role routing that every
admin page from Step 7 onward will sit behind.

LOGIN PAGE (app/(admin)/login/page.tsx — the only unauthenticated admin route)
Three fields: Username, Password, Role (a select: Barista / Waiter / Cashier / Delivery /
Manager / Inventory). On submit: verify the username/password against the workers table,
then confirm the selected role matches (or is among) that worker's assigned role(s) —
reject with a clear error if it doesn't ("This account isn't set up as a {role}"). On
success, create a session (cookie/JWT — your call on mechanism, but it needs to survive a
page refresh during a shift), write a shifts row (clock_in = now, clock_out = null) for
this worker+role, and redirect straight to that role's dashboard:
/admin/barista, /admin/waiter, /admin/delivery, /admin/cashier, /admin/manager,
/admin/inventory.

ROLE GUARDING
Each of those six routes must check the session on load: if there's no valid session, or
the session's role doesn't match the route, redirect to /admin/login. A barista must not
be able to type /admin/cashier (or /admin/manager, or /admin/inventory) into the URL bar
and get in.

LOGOUT
The "Log Out" button in AdminTopBar (Step 2) should: set clock_out = now on the current
shifts row, clear the session, and redirect to /admin/login.

ADMIN SHELL
Now wire AdminTopBar's worker-name display to the actual logged-in worker's full_name
instead of the Step 2 placeholder. Confirm each of the six role routes renders inside the
admin layout (top bar only, no footer, no cross-navigation) with a simple placeholder body
for now — the real content for barista/waiter/delivery/cashier comes in Steps 7–10, and
manager/inventory come in Steps 11–13.

For testing, seed one worker account per role (simple, memorable test credentials) so
each role can actually be logged into and checked.

BEFORE YOU FINISH THIS STEP
- Log in as each of the six seeded test accounts and confirm each lands on the right
  dashboard, and confirm that manually typing a different role's URL while logged in as
  someone else correctly bounces back to login (or shows access denied).
- Zero errors: clean build, zero TypeScript errors, zero console errors/warnings.
- Deploy a preview and give me the exact link plus the seeded test credentials.
- Stop there. Don't start Step 7 until I confirm this works.
- Once I approve: git commit and push to GitHub.
```

---

## STEP 7 — Barista page

```
PROMPT →

Building on Step 6, build /admin/barista, the first stop for every order.

LIVE QUEUE
Subscribe (Supabase Realtime) to orders where status = 'at_barista', ordered oldest-first.
New orders should appear on this screen the moment they're placed, with no manual refresh.

ORDER CARD
Each order in the queue renders as its own card:
1. Top: order source — "Table {number}" / "Pickup" / "Delivery" — plus a live-updating
   elapsed timer counting up from created_at (how long this order has been sitting with
   the barista). Style the timer so it's easy to read at a glance from a few feet away;
   consider color escalation the longer it runs (e.g. shifts warmer past a threshold) —
   your call on exact thresholds, but make slow orders visually obvious.
2. Middle: each item in the order, with its image and name.
3. Then, prominently — this is explicitly the most important part to get right — the
   notes/customizations for each item, in LARGE, BOLD text. Not a small caption under the
   item; make it the visually dominant element of the card. This is what prevents a
   barista from missing "oat milk, no sugar."
4. A large "Send" button at the bottom of the card.

ROUTING ON SEND
Tapping Send updates that order's status based on order_type:
- table → 'at_waiter'
- delivery → 'at_delivery'
- pickup → 'at_cashier' unless is_paid is already true (POS orders, wired up in Step 10),
  in which case route straight to 'ready_for_pickup' and skip the cashier entirely
Also stamp sent_to_next_at = now (stops the elapsed timer's relevance for this stage).
The card should then disappear from the barista queue (it's realtime-driven, so this
should happen automatically once the status changes, but confirm it).

BEFORE YOU FINISH THIS STEP
- Place a real test order from the customer menu (Step 5) and confirm it appears here
  live with a running timer, that notes are genuinely bold and prominent, and that
  tapping Send correctly routes a table order to 'at_waiter', a delivery order to
  'at_delivery', and a pickup order to 'at_cashier'.
- Zero errors: clean build, zero TypeScript errors, zero console errors/warnings.
- Deploy a preview and give me the exact link.
- Stop there. Don't start Step 8 until I confirm this works.
- Once I approve: git commit and push to GitHub.
```

---

## STEP 8 — Waiter page

```
PROMPT →

Building on Step 6, build /admin/waiter.

Orders with status = 'at_waiter' (fresh from the barista) appear in the queue. Each card
shows the TABLE NUMBER in large, bold text — this is the single most important thing on
the page, sized so there's zero chance of confusing tables — plus the items in the order.
A "Delivered" button moves status to 'awaiting_payment'.

That's the only action on this page for now. Orders sitting at 'awaiting_payment' wait
there until the cashier closes out the whole table in Step 10 (which, since receipts are
digital-only for now, completes those orders directly — no physical hand-off pass needed
here). If physical receipts get added back later, this page would get a second queue for
delivering the printed receipt to the table; leave the page structured so that's easy to
add (e.g. don't hardcode "this page only ever has one queue" in a way that's awkward to
extend).

Realtime-driven, same as Step 7.

BEFORE YOU FINISH THIS STEP
- Send a test order through the barista page and confirm it lands here with the table
  number genuinely large and unmissable, and that "Delivered" correctly moves it to
  awaiting_payment and clears it from this queue.
- Zero errors: clean build, zero TypeScript errors, zero console errors/warnings.
- Deploy a preview and give me the exact link.
- Stop there. Don't start Step 9 until I confirm this works.
- Once I approve: git commit and push to GitHub.
```

---

## STEP 9 — Delivery page

```
PROMPT →

Building on Step 6, build /admin/delivery. Structurally similar to the waiter page, but
for delivery orders, plus a round-robin driver assignment system.

ROUND-ROBIN ASSIGNMENT
When an order's status becomes 'at_delivery' (set by the barista in Step 7), assign it to
a driver automatically — not randomly, and not strictly the "next name in a fixed list"
either, because a driver who's currently out on a delivery shouldn't get stacked with a
second one while a free driver sits idle. You're working with a small roster (2–3 drivers
per shift, not a large fleet), so keep this simple:
- "On shift" delivery workers = shifts rows with role = 'delivery' and clock_out IS NULL.
- "Busy" = has an order currently at status 'at_delivery' or 'out_for_delivery' assigned
  to them.
- On a new order: look at delivery_rotation_log for on-shift, currently-free drivers,
  find whoever among them was assigned longest ago (or never, this shift) and assign to
  them — write assigned_driver_id on the order and a new delivery_rotation_log row. A
  driver who's busy keeps their place in line based on when they were last assigned
  (whether or not they've delivered that order yet) and simply isn't eligible again until
  they're free.

ORDER CARD (only shows orders assigned to the logged-in driver)
- Customer name, phone, and the FULL delivery address (area, street, building details,
  address mark) — all clearly visible, this person is navigating a real neighborhood
  with this info, don't truncate it.
- The items in the order.
- An "On the way" button. Tapping it:
  - Sets status = 'out_for_delivery'
  - Adds this order to the cashier's digital-receipt queue for THIS specific order (this
    is different from the table flow — a delivery receipt is generated per-order,
    immediately, not batched per table-session). Wire this as an event/row-update the
    cashier page (Step 10) is already subscribed to, so it appears there instantly.

Leave room on this page for a future "Delivered" confirmation button (not specced in
detail yet) that would move status to 'completed' — build the status transition but you
can leave the actual button as a simple stub for now.

BEFORE YOU FINISH THIS STEP
- With at least two seeded on-shift delivery accounts, send two delivery orders through
  and confirm they alternate between drivers correctly (not both going to the same one),
  and confirm "On the way" correctly updates status and surfaces on the cashier's
  eventual delivery-receipts queue (even if that queue's UI doesn't exist until Step 10 —
  just confirm the underlying row update happens).
- Zero errors: clean build, zero TypeScript errors, zero console errors/warnings.
- Deploy a preview and give me the exact link.
- Stop there. Don't start Step 10 until I confirm this works.
- Once I approve: git commit and push to GitHub.
```

---

## STEP 10 — Cashier page + POS, digital receipts, table-session closing

```
PROMPT →

Building on Step 6, build /admin/cashier — this page has three distinct jobs, so give it
three clearly separated sections/tabs, not one mixed feed.

1. OPEN TABLE SESSIONS (the "tricky" part)
Show every table_sessions row with status = 'open', grouped by table, with every order
attached to that session (across however many phones ordered into it) listed together as
ONE consolidated bill — items, options, quantities, running total. A table does NOT get
closed out automatically the moment one order finishes; it waits, accumulating orders
from that table until someone (a customer asking for the bill, relayed by the waiter)
tells the cashier to close out. Add a clear "Generate Receipt & Close Table" button per
table session. Tapping it:
- Generates a digital receipt record (see DIGITAL RECEIPTS below) covering every order
  in that session
- Sets every one of those orders' status to 'completed' directly (no physical hand-off
  stage right now)
- Sets table_sessions.status = 'closed', closed_at = now — this is what frees the table
  up for a new session to start fresh next time someone scans that table's QR code.

2. PICKUP ORDERS — orders with status = 'at_cashier' (digital pickup orders arriving after
  the barista finishes them). Show the order, a "Generate Receipt" button (marks
  is_paid = true, generates the digital receipt, moves status to 'ready_for_pickup'), and
  let the cashier mark it 'completed' once handed over.

3. DELIVERY RECEIPTS — a queue driven by the event from Step 9 (driver tapped
  "On the way"): show each delivery order needing a receipt, with a "Generate Receipt"
  button that finalizes that one order's digital receipt record. This does not touch
  table_sessions at all.

DIGITAL RECEIPTS (no physical printing for now)
A "receipt" here is a stored record, not a printed slip: an itemized breakdown (items,
selected options, quantities, unit prices, line totals, order total) tied to the order(s)
it covers, with a timestamp and a receipt view page/component to display it on-screen.
Don't build any print trigger — just generate, store, and make it viewable.

POS (in-person ordering, for customers without the phone webapp)
A separate section/route on this page: a staff-facing version of the Step 4 menu-and-
customization flow (reuse those components rather than rebuilding), letting the cashier
build a cart and submit an order directly. On submit, create the order exactly like a
normal pickup order (status = 'at_barista', order_type = 'pickup') but with
is_pos_order = true and is_paid = true set immediately, since the cashier just collected
payment in person. Because is_paid is already true, this order skips the 'at_cashier'
stage entirely when the barista finishes it — it routes straight to 'ready_for_pickup'
(this routing check was already built in Step 7).

BEFORE YOU FINISH THIS STEP
- Run all three flows once each: close out a table session with 2+ merged orders and
  confirm it generates one consolidated receipt and reopens the table for a new session;
  generate a receipt for a digital pickup order; generate a receipt for a delivery order
  coming from Step 9's "On the way." Also place one order through the POS tool and
  confirm it skips this page entirely once the barista sends it.
- Zero errors: clean build, zero TypeScript errors, zero console errors/warnings.
- Deploy a preview and give me the exact link.
- Stop there. Don't start Step 11 until I confirm this works.
- Once I approve: git commit and push to GitHub.
```

---

## STEP 11 — Manager page

```
PROMPT →

Building on Step 6, build /admin/manager with three clearly separated tabs.

TAB 1 — ACCOUNTING & SUMMARY
A date-range selector (Today / This Week / This Month / Custom) driving:
- Total revenue and total order count for the selected range, plus average order value
- A breakdown by order_type (table / pickup / delivery) — count and revenue for each
- Best-selling items in the range, ranked by quantity sold and separately by revenue
- A live snapshot of current orders by status right now (how many are sitting at each
  stage across the whole pipeline), independent of the date range — this is operational,
  not historical
- A simple low-stock list once Step 12/13 exist (leave a clearly marked placeholder
  section for this now; wire it up when you get there, don't skip building the section)
This is a reasonable default metric set, not a fixed requirement — flag anything you think
is missing or unnecessary once it's built and I can see it.

TAB 2 — EDIT ORDERS
Browse/search ALL orders regardless of status, not just active ones — a manager needs
historical access too. Filters: date range, status, order_type, table number. Clicking
into an order shows full detail (items, options, quantities, prices, status, timestamps,
table/customer info) with the ability to:
- Edit line items: change quantity, change selected options, add or remove an item
- Manually override status (e.g. force a stuck order forward, or reopen one)
- Void/cancel an order, requiring a reason (free text)
Every edit here touches money, so log it: an order_edit_log table (order_id, worker_id,
what changed as a jsonb diff or before/after snapshot, reason if applicable, timestamp).
Show this edit history on the order detail view.

TAB 3 — TABLE QR CODES
List existing tables (table_number, plus a status indicator of whether that table
currently has an open session). Let the manager add a new table (creates a tables row
with a fresh random qr_token) and regenerate a table's token if needed (invalidates the
old QR code — old printed codes for that table stop working, which is the point if one's
lost/compromised). For each table, render a scannable QR code image (use a QR-generation
library) encoding the full URL https://<your-domain>/menu?t=<qr_token>, with the table
number printed clearly beneath the code. Support downloading a single table's QR code,
and a "Download All" that lays every table's QR code out on a printable sheet (grid
layout, table number labeled under each, sized reasonably for a real printer — this is
going on physical tables, not just viewed on screen).

BEFORE YOU FINISH THIS STEP
- Generate a QR code for a real test table, scan it with an actual phone camera, and
  confirm it opens the menu with the correct table number showing. Edit a real test
  order's quantity and confirm the edit log records it. Check the accounting tab shows
  correct numbers against a few test orders you place.
- Zero errors: clean build, zero TypeScript errors, zero console errors/warnings.
- Deploy a preview and give me the exact link.
- Stop there. Don't start Step 12 until I confirm this works.
- Once I approve: git commit and push to GitHub.
```

---

## STEP 12 — Inventory: data model and management UI

```
PROMPT →

Building on Step 6, build the inventory data model and the /admin/inventory management
UI. This step is the data layer and admin tooling only — it does NOT yet affect what
customers see on the menu or how orders are validated; that's Step 13.

SCHEMA ADDITIONS
- ingredients: id, name, unit ('ml' | 'g' | 'count' | other free text you find sensible),
  current_stock (numeric), low_stock_threshold (numeric, nullable), updated_at
- menu_item_ingredients: id, menu_item_id (fk), ingredient_id (fk), quantity_required
  (numeric) — the base recipe: how much of this ingredient one unit of this menu item
  consumes
- addon_option_ingredients: id, addon_option_id (fk), ingredient_id (fk),
  quantity_required (numeric) — optional layer for add-ons that themselves draw from
  tracked stock (e.g. choosing "Almond Milk" should consume almond milk stock instead of
  whatever the base recipe's default milk ingredient is)
- inventory_adjustment_log: id, ingredient_id (fk), change_amount (numeric, positive or
  negative), reason ('restock' | 'manual_correction' | 'order_consumption'),
  related_order_id (fk, nullable), worker_id (fk, nullable), created_at — full audit
  trail for every stock change, this matters for a food business

MANAGEMENT UI (/admin/inventory)
- A list of all ingredients: name, unit, current stock, threshold, with a clear visual
  low-stock indicator (e.g. a colored badge) when current_stock is below threshold.
- "Add ingredient" (name, unit, starting stock, threshold).
- "Restock" action on each ingredient: add a quantity, logs to inventory_adjustment_log
  with reason='restock'.
- "Manual correction" action: set stock directly to a specific number (for after a
  physical count), logs with reason='manual_correction'.
- Recipe builder: search/select a menu item, then add ingredient + quantity_required rows
  for its recipe (menu_item_ingredients). Same capability for addon_options where it makes
  sense (e.g. milk-type options, flavor syrups, purees, toppings — anything from the
  Add-ons category that has a real per-serving consumption amount).
- A simple "currently unavailable" list at the top of the page showing any menu item whose
  computed available quantity is 0 right now (you'll build the actual computation
  function in Step 13, but stub this list now with a TODO so the page is structurally
  ready).

Don't touch the customer menu, the cart, or order submission in this step — that's
deliberately deferred to Step 13 so this step stays testable in isolation.

BEFORE YOU FINISH THIS STEP
- Add a real ingredient (e.g. "Milk", unit ml, stock 800), build a real recipe for one
  seeded test menu item (e.g. "Cappuccino" needs 200ml Milk), restock it, and confirm the
  adjustment log records each action correctly.
- Zero errors: clean build, zero TypeScript errors, zero console errors/warnings.
- Deploy a preview and give me the exact link.
- Stop there. Don't start Step 13 until I confirm this works.
- Once I approve: git commit and push to GitHub.
```

---

## STEP 13 — Inventory: live availability, menu auto-hide, order-time capping

```
PROMPT →

Building on Step 12 (inventory schema), and modifying Step 4 (menu display) and Step 5
(cart + order submission), wire real ingredient stock into what customers actually see
and can order. This is the step your example was about: a cup of coffee needs 200ml
milk, a customer orders 5, only 800ml is in stock — the system should cap that order at
4 and warn about it, not silently fail or silently ignore the shortfall.

AVAILABILITY CALCULATION (a shared function — you'll call this from multiple places)
Write getAvailableQuantity(menuItemId, selectedOptions?) that:
- Looks up the item's base recipe (menu_item_ingredients), plus any ingredient
  requirements from the currently selected add-on options (addon_option_ingredients), if
  provided.
- For each required ingredient, computes floor(ingredient.current_stock /
  quantity_required).
- Returns the MINIMUM of those values across every required ingredient — that's the real
  max orderable quantity right now.
- If an item has no recipe rows at all (nobody's set one up yet), treat it as always
  available — don't accidentally hide items that just haven't been recipe'd yet.

MENU DISPLAY (modifies Step 4)
For each item in the grid, call this with the base recipe (no options selected yet).
If available quantity is 0, hide the item from the grid entirely, matching "automatically
hide" from the original spec (flag #9 at the top of this document has a note on the
alternative — a visibly greyed-out "sold out" card — if you think that's clearly better,
say so, but default to fully hiding). If available quantity is low but nonzero (say ≤3,
your call on the exact threshold), show a small "Only X left" badge on the card.

CUSTOMIZATION MODAL — QUANTITY STEPPER (modifies Step 5)
When the modal opens, and again whenever the customer changes a selected option, recompute
available quantity factoring in the current selections (since e.g. switching to Almond
Milk might hit a different, more/less constrained ingredient than the default). Cap the
quantity stepper's max at that number, and disable "Add to Cart" with a clear inline
message if it's 0 for the current combination.

ORDER SUBMISSION (modifies Step 5) — this is the authoritative check
The UI-level caps above are a good experience, not the source of truth — stock can change
between browsing and checkout because of someone else's order. At submission time, inside
the same transaction/DB function that creates the order:
- For each cart line, recompute real-time available quantity for that item+options
  combination.
- If the requested quantity exceeds what's actually available right now, cap that line's
  quantity down to the real available amount (your exact example: 5 requested, 800ml
  stock, 200ml/cup recipe → cap at 4) rather than rejecting the whole order.
- Decrement the relevant ingredient stock(s) by (capped_quantity × quantity_required) for
  every ingredient the line consumes, and write an inventory_adjustment_log row per
  ingredient with reason='order_consumption' and related_order_id set.
- Return which lines got capped, and by how much, in the response, so the UI can show the
  customer a clear message ("We only had enough for 4 — your Cappuccino was adjusted")
  instead of silently changing their order behind their back.
- Do this atomically (a single DB transaction or a Postgres function) so two simultaneous
  orders can't both see the same 800ml and both think they can make 4 cups each — this is
  the entire point of checking at submission time rather than trusting the browse-time UI
  cap.

MANAGER PAGE HOOKUP (small, closes the loop with Step 11)
Wire the "currently unavailable" stub from Step 12 and the low-stock placeholder from
Step 11's accounting tab to this real availability function.

BEFORE YOU FINISH THIS STEP
- Recreate your exact example: set Milk stock to 800ml with a 200ml/cup recipe on a real
  test item, try to order 5, confirm the order gets capped to 4 with a visible warning,
  and confirm stock correctly reads 0ml afterward (800 - 4×200). Then confirm that item
  now hides from the menu entirely (or shows sold-out, whichever you built), restock it,
  and confirm it reappears.
- Zero errors: clean build, zero TypeScript errors, zero console errors/warnings.
- Deploy a preview and give me the exact link.
- Stop there. Don't start Step 14 until I confirm this works.
- Once I approve: git commit and push to GitHub.
```

---

## STEP 14 — Real menu data seed + full end-to-end pass

```
PROMPT →

Building on everything above, replace the placeholder menu data from Step 4 with the real
catalog, then do a full run-through of every path in the system.

SEED DATA
I'll provide the full "One More" menu (10 categories, 106 items, with real names, prices,
descriptions, and image URLs, plus the add-on/customization data — milks, flavor syrups,
purees, toppings) as a JSON file. Write a seed script that:
- Inserts all 10 menu_categories in the right order
- Inserts all menu_items with their category, price, description, image_url
- Inserts addon_groups (Milk Type, Sugar/Flavor Add-ons, Purees, Toppings) and their
  addon_options with prices
- Wires menu_item_addon_groups sensibly — e.g. hot/iced coffee & matcha drinks get
  Milk Type + Flavor Add-ons; smoothies/shakers get Purees/Toppings where relevant;
  bakery items get none. Use judgment per category, and flag any item where it's unclear
  whether an add-on group should apply.
- Leave ingredient/recipe data (Step 12/13) out of the seed for now — real recipe amounts
  need real numbers from you, not guesses.

END-TO-END PASS
Walk through and confirm, on real (seeded) data, in a real browser on a phone-sized
viewport:
1. Table path: scan simulation via a real QR-token URl shows the right table number,
   order placed, appears on Barista with a correct running timer, notes are legible and
   bold, Send routes to Waiter, Waiter shows the table number in big text, Delivered moves
   it to awaiting_payment, a SECOND order from a different simulated session for the same
   table merges into the same open session, Manager's accounting tab reflects both orders,
   Cashier shows both as one consolidated bill, Generate Receipt & Close Table completes
   both orders and frees the table for a new session.
2. Delivery path: external /menu → Delivery → name + address form → order → Barista →
   Delivery page shows it assigned to the correct next-in-rotation driver → On the way →
   digital receipt appears on Cashier's delivery queue.
3. Pickup path (digital): external /menu → Pickup → name + phone → order → Barista →
   Cashier (generate receipt, mark paid) → ready_for_pickup.
4. Pickup path (POS): Cashier POS → build order → paid immediately → Barista → straight
   to ready_for_pickup, skipping the cashier queue.
5. Inventory path: set a real recipe on a real seeded item with a real stock number, order
   past the limit from the customer side, confirm the cap-and-warn behavior, confirm the
   item disappears from the menu at 0 stock and reappears after restocking on the
   Inventory page.
6. Manager path: generate a real table's QR code, scan it, edit a real order's quantity
   and confirm the edit log, check the accounting numbers against what you actually
   ordered during this pass.
7. Confirm both themes render correctly across every page in this list, confirm the
   anti-spam rate limit still blocks a rapid double-submit, and confirm a
   barista/waiter/cashier/delivery/manager/inventory account genuinely cannot navigate
   into another role's page.

Report back anything that didn't work as specced rather than silently patching around it.

BEFORE YOU FINISH THIS STEP
- Zero errors across the entire app: clean build, zero TypeScript errors, zero console
  errors/warnings on every single page touched in the end-to-end pass above.
- Deploy this to production (`vercel --prod`, not just a preview — this is the real launch
  candidate) and give me that link.
- Stop there and wait for me to do my own full pass before calling this project done.
- Once I approve: git commit and push to GitHub.
```

---

Want me to export the real menu catalog (all 106 items) as the JSON seed file referenced in Step 14 right now, so it's ready to hand over when you get there?
