# 🧁 Velvet Whisk — Artisan Bakery E-Commerce Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Netlify](https://img.shields.io/badge/deployed%20on-Netlify-00C7B7?logo=netlify)](https://www.netlify.com/)
[![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E?logo=supabase)](https://supabase.com/)

**Velvet Whisk** is a modern, responsive e-commerce platform designed for artisan bakeries. It offers a beautiful storefront, seamless shopping cart experience, custom cake ordering, and WhatsApp-based checkout flow. Built with vanilla JavaScript, HTML5, CSS3, and powered by Supabase for backend data persistence.

---

## 📋 Table of Contents

- [Features](#-features)
- [Live Demo](#-live-demo)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Configure Supabase](#2-configure-supabase)
  - [3. Set Up Database Schema](#3-set-up-database-schema)
  - [4. Configure Image Upload (ImgBB)](#4-configure-image-upload-imgbb)
  - [5. Add Product Data](#5-add-product-data)
  - [6. Customize Site Content](#6-customize-site-content)
  - [7. Deploy to Netlify](#7-deploy-to-netlify)
- [Usage Guide](#-usage-guide)
  - [For Customers](#for-customers)
  - [For Administrators](#for-administrators)
- [API Reference](#-api-reference)
- [Configuration Options](#-configuration-options)
- [Customization](#-customization)
- [Browser Support](#-browser-support)
- [Performance](#-performance)
- [Security Considerations](#-security-considerations)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## ✨ Features

### 🛍️ **E-Commerce Functionality**
- **Product Catalog**: Organized display of bakery items across 7 categories (Cakes, Breads, Pastries, Cookies, Muffins, Savory, Dried)
- **Shopping Cart**: Persistent cart using localStorage with real-time updates
- **Product Filtering**: Filter by category, dietary preferences (Eggless/Vegan), and search functionality
- **Dynamic Pricing**: Real-time cart total calculation

### 🎂 **Custom Cake Ordering**
- **Image Upload**: Reference image upload via ImgBB API
- **Detailed Form**: Weight, flavor, type, notes, and delivery preferences
- **Order Tracking**: Orders stored in Supabase with status management

### 💬 **WhatsApp Integration**
- **Checkout Flow**: Seamless redirect to WhatsApp with pre-filled order details
- **Customer Communication**: Direct messaging for order confirmation and updates
- **Optional Updates**: Checkbox for WhatsApp order updates subscription

### 🎨 **User Experience**
- **Responsive Design**: Mobile-first approach, works on all devices
- **Animations**: Smooth transitions, magnetic button effects, scroll reveal animations
- **Accessibility**: ARIA labels, keyboard navigation support
- **Success Modals**: Clear feedback for form submissions

### 🔧 **Technical Features**
- **CMS-Ready**: JSON-based content management for products and site settings
- **Lazy Loading**: Optimized image loading for better performance
- **Error Handling**: Graceful degradation when services are unavailable
- **Local Storage**: Cart persistence across sessions

---

## 🌐 Live Demo

> **Note**: Insert your live demo URL here after deployment.

```
https://your-bakery-name.netlify.app
```

---

## 🛠️ Tech Stack

| Category       | Technology                          |
|----------------|-------------------------------------|
| **Frontend**   | HTML5, CSS3, Vanilla JavaScript     |
| **Backend**    | Supabase (PostgreSQL, Auth, Storage)|
| **Hosting**    | Netlify                             |
| **Image CDN**  | ImgBB API                           |
| **Communication** | WhatsApp Business API            |
| **Version Control** | Git, GitHub                    |

### Dependencies (CDN)
- **Font Awesome** — Icons
- **Google Fonts** — Typography (Playfair Display, Poppins)

---

## 📁 Project Structure

```
velvet-whisk/
├── index.html              # Main landing page with product catalog
├── checkout.html           # Checkout form page
├── style.css               # Complete stylesheet with animations
├── script.js               # Main application logic
├── supabase-config.js      # Supabase configuration (API keys)
├── netlify.toml            # Netlify deployment configuration
├── README.md               # This documentation file
├── .gitignore              # Git ignore rules
│
├── _data/                  # CMS data directory
│   ├── site.json           # Site-wide content configuration
│   └── products/           # Product catalog JSON files
│       ├── cakes.json
│       ├── breads.json
│       ├── pastries.json
│       ├── cookies.json
│       ├── muffins.json
│       ├── savory.json
│       └── dried.json
│
├── admin/                  # Admin panel (order management)
│   └── index.html
│
├── admin-orders/           # Alternative admin interface
│   └── index.html
│
└── images/                 # Static image assets
    ├── logo.png
    ├── hero-bg.jpg
    └── ...
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following:

1. **Git** — Version control system ([Download](https://git-scm.com/))
2. **Node.js** (optional) — For local development server ([Download](https://nodejs.org/))
3. **Supabase Account** — Free tier available ([Sign Up](https://supabase.com/))
4. **ImgBB Account** — For image uploads ([Sign Up](https://imgbb.com/))
5. **WhatsApp Business Number** — For order notifications
6. **Netlify Account** — For hosting ([Sign Up](https://www.netlify.com/))

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/velvet-whisk.git
cd velvet-whisk
```

### 2. Configure Supabase

#### Step 2.1: Create Supabase Project
1. Go to [Supabase](https://supabase.com/) and create a new project
2. Note your **Project URL** and **anon public key** from Settings → API

#### Step 2.2: Update Configuration File
Open `supabase-config.js` and replace the placeholder values:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

⚠️ **Security Warning**: Never commit the `service_role` key to the repository. Keep it secret!

### 3. Set Up Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create orders table
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    order_type TEXT NOT NULL CHECK (order_type IN ('custom', 'checkout')),
    
    -- Customer Information
    customer_name TEXT,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    
    -- Custom Cake Fields
    cake_weight TEXT,
    cake_flavor TEXT,
    cake_type TEXT,
    cake_notes TEXT,
    reference_image_url TEXT,
    
    -- Checkout Order Fields
    items JSONB,
    total_amount NUMERIC,
    payment_method TEXT,
    whatsapp_updates BOOLEAN DEFAULT false,
    
    -- Order Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
    
    -- Metadata
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for public order submission)
CREATE POLICY "Allow anonymous order creation"
    ON orders FOR INSERT
    WITH CHECK (true);

-- Allow authenticated users to view all orders (for admin)
CREATE POLICY "Allow authenticated users to view orders"
    ON orders FOR SELECT
    USING (auth.role() = 'authenticated');

-- Create index for faster queries
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

### 4. Configure Image Upload (ImgBB)

#### Step 4.1: Get ImgBB API Key
1. Visit [ImgBB API](https://api.imgbb.com/)
2. Sign up and generate an API key

#### Step 4.2: Update API Key
In `script.js`, locate the `IMGBB_API_KEY` constant and update it:

```javascript
const IMGBB_API_KEY = "your-imgbb-api-key-here";
```

### 5. Add Product Data

Each product category has its own JSON file in `_data/products/`. Here's the format:

**Example: `_data/products/cakes.json`**
```json
{
  "category": "cakes",
  "items": [
    {
      "name": "Chocolate Truffle Cake",
      "desc": "Rich Belgian chocolate layers with truffle frosting",
      "price": 899,
      "image": "images/products/chocolate-truffle.jpg",
      "badges": ["eggless"]
    },
    {
      "name": "Red Velvet Cake",
      "desc": "Classic red velvet with cream cheese frosting",
      "price": 1099,
      "image": "images/products/red-velvet.jpg",
      "badges": ["vegan"]
    }
  ]
}
```

**Badge Options:**
- `"eggless"` — Displays egg-free icon
- `"vegan"` — Displays vegan icon
- Omit badges array if not applicable

### 6. Customize Site Content

Edit `_data/site.json` to customize text content:

```json
{
  "hero_title_1": "Baked with",
  "hero_highlight_1": "Passion",
  "hero_title_2": "Served with",
  "hero_highlight_2": "Love",
  "hero_subtitle": "Experience the luxury of artisan bakes...",
  "hero_cta": "Explore Our Menu",
  "hero_cta_cake": "Order Custom Cake",
  "whatsapp_number": "919797979797",
  "phone_display": "+91 97979 79797",
  "address": "123 Baker Street, City",
  "footer_tagline": "Baking smiles, one crumb at a time."
}
```

### 7. Deploy to Netlify

#### Option A: Drag & Drop
1. Go to [Netlify Drop](https://app.netlify.com/drop)
2. Drag the entire project folder
3. Your site is live!

#### Option B: Git Integration
1. Push code to GitHub/GitLab
2. Connect repository in Netlify dashboard
3. Configure build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: `/`
4. Deploy!

#### Option C: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

---

## 📖 Usage Guide

### For Customers

#### Browsing Products
1. Navigate to the homepage
2. Scroll through categories or use the navigation menu
3. Use filters to find specific dietary options

#### Adding to Cart
1. Click "Add to Bag" on any product
2. View cart by clicking the bag icon
3. Adjust quantities or remove items

#### Placing Orders
**Standard Orders:**
1. Add items to cart
2. Click checkout
3. Fill delivery details
4. Choose payment method
5. Submit → Redirects to WhatsApp with order summary

**Custom Cake Orders:**
1. Click "Order Custom Cake"
2. Upload reference image (optional)
3. Fill cake specifications
4. Submit request
5. Receive confirmation via WhatsApp/Phone

### For Administrators

#### Viewing Orders
Access the admin panel at `/admin/` or `/admin-orders/` to:
- View all submitted orders
- Update order status
- Filter by status or date
- Export order data

#### Managing Products
1. Edit JSON files in `_data/products/`
2. Commit changes to repository
3. Netlify auto-deploys updates

---

## 🔌 API Reference

### Supabase Tables

#### `orders` Table

| Column              | Type      | Description                        |
|---------------------|-----------|------------------------------------|
| `id`                | UUID      | Unique order identifier            |
| `created_at`        | TIMESTAMP | Order creation timestamp           |
| `order_type`        | TEXT      | 'custom' or 'checkout'             |
| `customer_name`     | TEXT      | Customer's full name               |
| `phone`             | TEXT      | Contact number                     |
| `address`           | TEXT      | Delivery address                   |
| `cake_weight`       | TEXT      | Weight for custom cakes            |
| `cake_flavor`       | TEXT      | Flavor preference                  |
| `cake_type`         | TEXT      | Eggless/Vegan                      |
| `cake_notes`        | TEXT      | Special instructions               |
| `reference_image_url`| TEXT     | Uploaded image URL                 |
| `items`             | JSONB     | Cart items (checkout orders)       |
| `total_amount`      | NUMERIC   | Order total                        |
| `payment_method`    | TEXT      | COD/UPI/Card                       |
| `whatsapp_updates`  | BOOLEAN   | Opt-in for updates                 |
| `status`            | TEXT      | Order status                       |
| `updated_at`        | TIMESTAMP | Last update timestamp              |

### External APIs

#### ImgBB Upload API
**Endpoint:** `POST https://api.imgbb.com/1/upload`

**Request:**
```javascript
FormData {
  image: File,
  key: IMGBB_API_KEY
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://i.ibb.co/xxx/image.jpg"
  }
}
```

---

## ⚙️ Configuration Options

### Environment Variables (Optional)

Create a `.env` file for local development:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_IMGBB_API_KEY=your-imgbb-key
VITE_WHATSAPP_NUMBER=919797979797
```

### Feature Flags

Modify these constants in `script.js` to enable/disable features:

```javascript
const CONFIG = {
  ENABLE_CART_PERSISTENCE: true,
  ENABLE_IMAGE_UPLOAD: true,
  ENABLE_WHATSAPP_CHECKOUT: true,
  ENABLE_PRODUCT_FILTERS: true,
  CURRENCY_SYMBOL: '₹',
  DELIVERY_CHARGE: 50,
  FREE_DELIVERY_THRESHOLD: 500
};
```

---

## 🎨 Customization

### Changing Colors

Edit CSS variables in `style.css`:

```css
:root {
  --pink-light: #fce4ec;
  --pink: #f8bbd0;
  --pink-dark: #ec407a;
  --eggless: #4caf50;
  --vegan: #8bc34a;
  --text-dark: #2c3e50;
  --text-light: #7f8c8d;
}
```

### Adding New Categories

1. Create new JSON file in `_data/products/`
2. Add corresponding section in `index.html`
3. Update `products` object in `script.js`
4. Add category to `categories` array in `loadAllProducts()`

### Modifying WhatsApp Message Format

Edit the message construction in `checkout.html` script section:

```javascript
const message = `🛍️ *New Order*\n\n` +
  `👤 Name: ${name}\n` +
  `📱 Phone: ${phone}\n` +
  // ... customize format
```

---

## 🌍 Browser Support

| Browser          | Version | Support |
|------------------|---------|---------|
| Chrome           | 90+     | ✅ Full |
| Firefox          | 88+     | ✅ Full |
| Safari           | 14+     | ✅ Full |
| Edge             | 90+     | ✅ Full |
| Opera            | 76+     | ✅ Full |
| Mobile Safari    | 14+     | ✅ Full |
| Samsung Internet | 14+     | ✅ Full |

**Required Features:**
- `localStorage`
- `fetch` API
- `Promise`
- ES6+ JavaScript
- CSS Grid & Flexbox

---

## ⚡ Performance

### Optimization Techniques Implemented
- **Lazy Loading**: Images load only when visible
- **Minified CSS/JS**: Production-ready stylesheets
- **LocalStorage Caching**: Reduces redundant operations
- **Async/Await**: Non-blocking API calls
- **Event Delegation**: Efficient event handling

### Lighthouse Scores (Target)
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+

### Tips for Better Performance
1. Compress images before uploading
2. Use WebP format where supported
3. Enable Netlify's asset optimization
4. Implement service worker for offline support

---

## 🔒 Security Considerations

### Implemented Security Measures
- **Row Level Security (RLS)** on Supabase tables
- **Anonymous API keys only** (never expose service_role)
- **Input sanitization** on form submissions
- **HTTPS enforcement** via Netlify

### Recommendations
1. **Rate Limiting**: Implement Supabase Edge Functions for rate limiting
2. **reCAPTCHA**: Add to forms to prevent spam
3. **Email Verification**: Optional customer authentication
4. **Payment Gateway**: Integrate Razorpay/Stripe for secure payments
5. **Data Backup**: Regular Supabase backups

### Known Limitations
- Client-side API keys are visible (use RLS policies)
- No user authentication currently implemented
- Image uploads rely on third-party service (ImgBB)

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Orders Not Saving to Supabase
**Symptoms:** Form submits but no data in database

**Solutions:**
- Verify `supabase-config.js` has correct credentials
- Check browser console for errors
- Ensure database schema matches the provided SQL
- Verify RLS policies allow anonymous inserts

#### 2. Image Upload Failing
**Symptoms:** Upload progress shows failure

**Solutions:**
- Check ImgBB API key validity
- Verify file size is under ImgBB limits (32MB)
- Check network connectivity
- Review browser console for CORS errors

#### 3. Cart Not Persisting
**Symptoms:** Cart empties on page refresh

**Solutions:**
- Ensure localStorage is enabled in browser
- Check for quota exceeded errors
- Verify `saveCartToStorage()` is being called

#### 4. Products Not Loading
**Symptoms:** Empty product grids

**Solutions:**
- Verify JSON files exist in `_data/products/`
- Check JSON syntax (use JSONLint)
- Ensure category names match exactly
- Check browser console for 404 errors

#### 5. WhatsApp Redirect Not Working
**Symptoms:** Checkout doesn't open WhatsApp

**Solutions:**
- Verify `whatsapp_number` in `site.json` includes country code
- Ensure number format: `91XXXXXXXXXX` (no + or spaces)
- Test WhatsApp link manually: `https://wa.me/91XXXXXXXXXX`

### Debug Mode

Enable detailed logging by adding to `script.js`:

```javascript
const DEBUG = true;

function log(message, data) {
  if (DEBUG) {
    console.log(`[VelvetWhisk] ${message}`, data || '');
  }
}
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers
- Update documentation for new features
- Write meaningful commit messages

### Code Style
- Use ES6+ features where appropriate
- Maintain consistent indentation (4 spaces)
- Use semantic HTML
- Follow BEM naming for CSS classes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Velvet Whisk

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **Supabase** — Backend-as-a-Service platform
- **ImgBB** — Free image hosting API
- **Font Awesome** — Icon library
- **Google Fonts** — Typography
- **Netlify** — Hosting platform
- **All Contributors** — Thank you for your support!

---

## 📞 Support

For questions, issues, or feature requests:

- **Email**: support@velvetwhisk.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/velvet-whisk/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/velvet-whisk/wiki)

---

## 🗺️ Roadmap

### Phase 1 (Completed) ✅
- [x] Basic product catalog
- [x] Shopping cart functionality
- [x] Custom cake ordering
- [x] WhatsApp integration

### Phase 2 (In Progress) 🚧
- [ ] User authentication
- [ ] Order tracking portal
- [ ] Payment gateway integration
- [ ] Email notifications

### Phase 3 (Planned) 📅
- [ ] Multi-language support
- [ ] Loyalty points system
- [ ] Subscription boxes
- [ ] Mobile app (React Native)

---

<div align="center">

**Made with ❤️ for artisan bakers everywhere**

[Back to Top](#-velvet-whisk--artisan-bakery-e-commerce-platform)

</div>