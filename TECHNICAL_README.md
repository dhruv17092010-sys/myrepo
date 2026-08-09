# Velvet Whisk — Technical Documentation for AI Assistants

> **Purpose:** This document helps AI coding assistants understand the Velvet Whisk artisan bakery website architecture, conventions, and integration points to generate accurate, error-free code.

---

## 🏗️ Project Overview

**Velvet Whisk** is a static artisan bakery e-commerce website with:
- Product catalog with 7 categories
- Shopping cart with localStorage persistence
- Checkout flow with Supabase backend
- Order tracking system
- Custom cake request form
- Decap CMS for content management
- Netlify deployment

**Tech Stack:**
- Vanilla HTML/CSS/JavaScript (no framework)
- Supabase (PostgreSQL backend + Row Level Security)
- Decap CMS (Git-based content management)
- ImgBB API (image uploads for custom cakes)
- Netlify (hosting + Identity + Git Gateway)

---

## 📁 File Structure

```
/workspace
├── index.html                 # Main homepage (menu, custom cake form)
├── checkout.html              # Checkout page (order form)
├── track-order.html           # Order tracking page
├── style.css                  # Global styles
├── script.js                  # Main JavaScript (cart, products, UI logic)
├── supabase-config.js         # Supabase credentials (URL + anon key)
├── admin/
│   ├── index.html             # Decap CMS entry point
│   └── config.yml             # Decap CMS configuration
└── _data/
    ├── site.json              # Site-wide content (hero text, phone, address)
    └── products/
        ├── cakes.json         # Cakes & Cupcakes products
        ├── breads.json        # Breads & Loaves products
        ├── pastries.json      # Pastries & Sweet Goods
        ├── cookies.json       # Biscuits & Cookies
        ├── muffins.json       # Muffins, Brownies & Doughnuts
        ├── savory.json        # Savory Baked Goods
        └── dried.json         # Dried Bakery Products
```

---

## 🔑 Critical Configuration Files

### 1. `supabase-config.js`
**Purpose:** Stores Supabase connection credentials.

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_...';
```

**⚠️ AI Warning:** 
- NEVER modify these values unless explicitly instructed.
- NEVER add the `service_role` key here (security risk).
- This file must be loaded BEFORE `script.js` on pages using Supabase.

### 2. `_data/site.json`
**Purpose:** Centralized site content managed via Decap CMS.

```json
{
  "hero_title_1": "Baked with",
  "hero_highlight_1": "Passion",
  "hero_title_2": "Served with",
  "hero_highlight_2": "Love",
  "hero_subtitle": "Experience the luxury...",
  "hero_cta": "Explore Our Menu",
  "hero_cta_cake": "Order Custom Cake",
  "whatsapp_number": "919797979797",
  "phone_display": "+91 97979 79797",
  "address": "123 Baker Street, City",
  "footer_tagline": "Baking smiles, one crumb at a time."
}
```

**⚠️ AI Warning:**
- All text content should be read from this file, not hardcoded.
- `whatsapp_number` must be in format `91XXXXXXXXXX` (no `+`, no spaces).
- Changes here automatically update the live site via CMS.

### 3. `_data/products/*.json`
**Purpose:** Product data for each category.

**Schema:**
```json
{
  "items": [
    {
      "name": "Product Name",
      "price": 650,
      "image": "https://...",
      "desc": "Short description",
      "badges": ["eggless"] or ["vegan"] or ["eggless", "vegan"] or []
    }
  ]
}
```

**Valid badge values:** `"eggless"`, `"vegan"` (case-sensitive).

**⚠️ AI Warning:**
- Price must be a number (not string).
- `badges` array can be empty `[]` but must exist.
- Image URLs should be absolute (HTTPS).

---

## 🧠 JavaScript Architecture (`script.js`)

### Global Variables
| Variable | Purpose | Default/Source |
|----------|---------|----------------|
| `IMGBB_API_KEY` | ImgBB upload API key | `"85d2b64330c82ad0a82284b10bacc47c"` |
| `SITE_WHATSAPP_NUMBER` | WhatsApp contact | From `site.json` |
| `supabaseClient` | Supabase JS client | Initialized via `initSupabase()` |
| `products` | Product catalog | Object with 7 category arrays |
| `cart` | Shopping cart items | Persisted in localStorage |

### Key Functions

#### Initialization
```javascript
init()              // Main entry: loads Supabase, cart, content, products
initSupabase()      // Creates Supabase client from config
loadSiteContent()   // Fetches _data/site.json, updates DOM
loadAllProducts()   // Fetches all 7 product JSON files
renderProducts()    // Renders product cards, attaches listeners
```

#### Cart Management
```javascript
loadCartFromStorage()   // Reads 'velvetwhisk_cart' from localStorage
saveCartToStorage()     // Writes cart to localStorage
updateCartUI()          // Re-renders cart sidebar
```

#### Order Processing
```javascript
generateOrderId()       // Creates UUID v4 for new orders
rememberLastOrder(id, phone)  // Stores in localStorage for tracking
```

#### Form Handlers
- **Custom Cake Form** (`#customCakeForm`): Uploads image to ImgBB, inserts order to Supabase.
- **Checkout Form** (`#checkoutForm`): Located in `checkout.html`, submits to Supabase.

#### UI Utilities
```javascript
showSuccessModal(title, message)  // Shows order confirmation modal
buildOrderIdBlock(orderId)        // Generates HTML with copy button
copyOrderId(orderId, btn)         // Copies ID to clipboard
applyFilters()                    // Handles search + badge + category filters
```

### localStorage Keys
| Key | Content | Used By |
|-----|---------|---------|
| `velvetwhisk_cart` | Cart items array | `script.js` |
| `velvetwhisk_last_order` | `{id, phone}` object | `script.js`, `track-order.html` |
| `velvetwhisk_whatsapp_number` | WhatsApp number string | `script.js`, `track-order.html` |

**⚠️ AI Warning:**
- Always use `try/catch` around localStorage operations (may fail in private browsing).
- Cart persistence is critical—never lose cart data on page reload.

---

## 🛒 Checkout Flow

### Pages Involved
1. **`index.html`** → User adds items to cart.
2. **`checkout.html`** → User fills delivery details, submits order.
3. **Supabase** → Order stored in `orders` table.
4. **Success Modal** → Shows Order ID to customer.
5. **`track-order.html`** → Customer tracks order using ID + phone.

### Checkout Form Fields (`checkout.html`)
```html
<input id="custName">      <!-- Full name -->
<input id="custPhone">     <!-- 10-digit mobile (validated) -->
<textarea id="custAddress"><!-- Delivery address -->
<select id="checkoutPayment"> <!-- Only COD (disabled, display-only) -->
```

### Order Submission Logic
1. Generate UUID via `generateOrderId()`.
2. Insert into Supabase `orders` table with:
   - `id`: Generated UUID
   - `order_type`: `"regular"`
   - `customer_name`, `phone`, `address`
   - `items`: Array of cart items (with `name`, `qty`, `price`, `subtotal`)
   - `total`: Sum of all subtotals
   - `payment_method`: `"COD"`
   - `status`: `"pending"`
3. Store `{id, phone}` in localStorage via `rememberLastOrder()`.
4. Show success modal with Order ID.

**⚠️ AI Warning:**
- Checkout form is ONLY on `checkout.html`, NOT on `index.html`.
- Payment method is display-only (COD only, no actual payment processing).
- Phone validation: exactly 10 digits (Indian format).

---

## 🎂 Custom Cake Request Flow

### Form Fields (`index.html` → `#customCakeForm`)
```html
<input id="cakeName">       <!-- Optional -->
<select id="cakeWeight">    <!-- 0.5kg, 1kg, 1.5kg, 2kg, etc. -->
<select id="cakeFlavor">    <!-- Chocolate, Vanilla, Red Velvet, etc. -->
<select id="cakeType">      <!-- Eggless, Vegan -->
<input id="cakePhone">      <!-- Required -->
<textarea id="cakeAddress"><!-- Required -->
<select id="cakePayment">   <!-- COD only -->
<input id="cakeWhatsappUpdates"> <!-- Checkbox -->
<textarea id="cakeNotes">   <!-- Special instructions -->
<input id="cakeImage">      <!-- Reference image upload -->
```

### Image Upload Process
1. User selects image file.
2. Upload to ImgBB API: `POST https://api.imgbb.com/1/upload?key=IMGBB_API_KEY`
3. Receive `data.data.url` in response.
4. Store URL in `uploadedImageUrl` variable.
5. Submit form with `reference_image_url` field.

**⚠️ AI Warning:**
- Image upload is optional—if it fails, user can still submit order.
- Custom cake orders do NOT include `items` or `total` fields in Supabase.
- `payment_method` and `whatsapp_updates` are NOT sent to backend (per requirements).

---

## 📦 Supabase Database Schema

### Table: `orders`
```sql
id              UUID PRIMARY KEY
created_at      TIMESTAMPTZ DEFAULT NOW()
order_type      TEXT CHECK (order_type IN ('regular', 'custom'))
customer_name   TEXT
phone           TEXT
address         TEXT
status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'delivered'))
payment_method  TEXT

-- Regular order fields
items           JSONB
total           INTEGER

-- Custom cake fields
cake_weight     TEXT
cake_flavor     TEXT
cake_type       TEXT
cake_notes      TEXT
reference_image_url TEXT
```

### Row Level Security (RLS)
**Critical:** RLS is enabled on `orders` table.

**Policies:**
1. **INSERT:** Anyone (anon) can insert new orders.
2. **SELECT:** Only authenticated users OR matching phone number via RPC function.

### RPC Function: `get_order_for_customer`
```sql
CREATE FUNCTION get_order_for_customer(p_order_id UUID, p_phone TEXT)
RETURNS TABLE (...) AS $$
  SELECT * FROM orders
  WHERE id = p_order_id AND phone = p_phone;
$$ LANGUAGE SQL SECURITY DEFINER;
```

**⚠️ AI Warning:**
- Direct `SELECT` from `orders` is BLOCKED for anon users.
- MUST use `supabase.rpc('get_order_for_customer', {p_order_id, p_phone})` for tracking.
- Order ID + phone number are both required to fetch an order.

---

## 🖼️ Decap CMS Configuration (`admin/config.yml`)

### Collections
1. **`site_content`** → Edits `_data/site.json`
2. **`products`** → Edits 7 product category files

### How It Works
1. User logs in via Netlify Identity at `/admin`.
2. CMS makes changes to JSON files.
3. Commits pushed to Git repository.
4. Netlify rebuilds site automatically.

**⚠️ AI Warning:**
- Do NOT manually edit JSON files if CMS is in use (risk of merge conflicts).
- CMS uses `format: "json"` with `list` widgets for products.
- Image uploads go to `images/uploads/` folder (configured in `media_folder`).

---

## 🎨 CSS Variables (`style.css`)

```css
:root {
    --cream: #FDF8F5;        /* Background */
    --pink-light: #FCE4EC;
    --pink-main: #F4A6B7;
    --pink-dark: #D87093;    /* Primary accent */
    --rose-bold: #8A2342;    /* Text emphasis */
    --text-dark: #2D2D2D;
    --text-light: #666666;
    --white: #FFFFFF;
    --shadow: 0 10px 30px rgba(138, 35, 66, 0.08);
    --eggless: #4CAF50;      /* Badge color */
    --vegan: #8BC34A;        /* Badge color */
    --whatsapp: #25D366;
}
```

**⚠️ AI Warning:**
- Always use CSS variables for colors (do not hardcode hex values).
- Mobile-first responsive design (hamburger menu below 768px).

---

## 🔍 Page-Specific Notes

### `index.html`
- Contains hero section, product menu, custom cake form, contact section.
- Loads `script.js` for all interactive features.
- Does NOT contain checkout form.

### `checkout.html`
- Minimal navigation (links back to `index.html`).
- Contains checkout form (`#checkoutForm`).
- Has its own inline script for cart rendering + form submission.
- Must load `supabase-config.js` before any Supabase calls.

### `track-order.html`
- Standalone page with embedded CSS + JS (no external `script.js`).
- Loads `supabase-config.js` + Supabase CDN directly.
- Uses `get_order_for_customer` RPC function for order lookup.
- Pre-fills form from `velvetwhisk_last_order` localStorage.
- WhatsApp help links use stored `velvetwhisk_whatsapp_number`.

---

## ⚠️ Common Pitfalls for AI Assistants

### 1. Missing Supabase Initialization
**Wrong:**
```javascript
const { data } = await supabase.from('orders').select(); // Fails!
```

**Correct:**
```javascript
// Ensure supabase-config.js is loaded first
let supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const { data } = await supabaseClient.rpc('get_order_for_customer', {...});
```

### 2. Hardcoding Content
**Wrong:**
```html
<h1>Baked with Passion</h1>
```

**Correct:**
```html
<h1 id="hero-title"></h1>
<!-- Populated by loadSiteContent() from _data/site.json -->
```

### 3. Breaking Cart Persistence
**Wrong:**
```javascript
cart = []; // Resets cart, loses localStorage data
```

**Correct:**
```javascript
loadCartFromStorage(); // Call this on page load
cart = []; // Only after loading from storage
```

### 4. Incorrect Product JSON Structure
**Wrong:**
```json
{
  "name": "Cake",
  "price": "650",      // String instead of number
  "badges": "eggless"  // String instead of array
}
```

**Correct:**
```json
{
  "name": "Cake",
  "price": 650,
  "badges": ["eggless"]
}
```

### 5. Direct Database Queries (RLS Violation)
**Wrong:**
```javascript
const { data } = await supabase
  .from('orders')
  .select()
  .eq('id', orderId)
  .eq('phone', phone); // Returns null due to RLS
```

**Correct:**
```javascript
const { data } = await supabase
  .rpc('get_order_for_customer', {
    p_order_id: orderId,
    p_phone: phone
  });
```

### 6. Image Upload Error Handling
**Wrong:**
```javascript
const response = await fetch(imgbbUrl);
const data = await response.json();
uploadedImageUrl = data.data.url; // Crashes if upload fails
```

**Correct:**
```javascript
try {
  const response = await fetch(imgbbUrl);
  const data = await response.json();
  if (data.success) {
    uploadedImageUrl = data.data.url;
  } else {
    throw new Error('Upload failed');
  }
} catch (error) {
  console.error('Upload error:', error);
  uploadedImageUrl = ''; // Allow form submission without image
  alert('Image upload failed. You can still place the order.');
}
```

---

## 🧪 Testing Checklist for AI-Generated Code

Before suggesting code changes, verify:

- [ ] Does this break existing functionality on `index.html`, `checkout.html`, or `track-order.html`?
- [ ] Are all new features compatible with vanilla JS (no ES6+ features that break older browsers)?
- [ ] Is localStorage access wrapped in `try/catch`?
- [ ] Are Supabase calls using the correct RPC function (not direct queries)?
- [ ] Does the UI update reflect changes in `site.json` or product JSON files?
- [ ] Are CSS variables used instead of hardcoded colors?
- [ ] Is mobile responsiveness maintained (hamburger menu, touch targets)?
- [ ] Are event listeners properly attached after dynamic content loads?
- [ ] Is the cart count updated across all pages after adding items?
- [ ] Does the order tracking flow work end-to-end (place order → get ID → track)?

---

## 📞 External Integrations

### Supabase
- **URL:** From `supabase-config.js`
- **Anon Key:** From `supabase-config.js`
- **Table:** `orders`
- **RPC:** `get_order_for_customer(p_order_id, p_phone)`

### ImgBB API
- **Endpoint:** `https://api.imgbb.com/1/upload`
- **API Key:** `85d2b64330c82ad0a82284b10bacc47c`
- **Method:** POST with FormData (`image` field)
- **Response:** `data.data.url` contains image URL

### WhatsApp
- **Format:** `https://wa.me/{whatsapp_number}`
- **Number Source:** `_data/site.json` → `whatsapp_number`
- **Fallback:** `919797979797`

### Netlify Identity
- **Widget Script:** `https://identity.netlify.com/v1/netlify-identity-widget.js`
- **Login Path:** `/admin`
- **CMS Script:** `https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js`

---

## 🚀 Deployment Notes

**Platform:** Netlify
**Build Command:** None (static site)
**Publish Directory:** `/` (root)
**Environment Variables:** None required (config in repo files)

**Required Netlify Settings:**
1. **Identity:** Enabled (for CMS login)
2. **Git Gateway:** Enabled (for CMS commits)
3. **Redirects:** None needed (SPA routing not used)

---

## 📝 Version History

| Date | Change |
|------|--------|
| 2024 | Initial setup with Supabase integration |
| 2024 | Decap CMS configured for content management |
| 2024 | Order tracking with RLS-protected Supabase queries |
| 2024 | Cart persistence via localStorage |
| 2024 | Custom cake form with ImgBB image upload |

---

## 🆘 Quick Reference for AI

**Need to add a new product?**
→ Edit `_data/products/[category].json` or use Decap CMS at `/admin`.

**Need to change site text?**
→ Edit `_data/site.json` or use Decap CMS at `/admin`.

**Need to modify order submission?**
→ Update `script.js` checkout form handler → Supabase `orders` table.

**Need to add a new page?**
→ Copy structure from `track-order.html` (standalone) or `index.html` (uses shared `script.js`).

**Need to change colors/styles?**
→ Update CSS variables in `style.css` :root.

**Need to test order tracking?**
1. Place order via `checkout.html`
2. Copy Order ID from success modal
3. Go to `track-order.html`
4. Enter Order ID + phone number
5. Verify order details appear

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Maintained By:** Development Team
