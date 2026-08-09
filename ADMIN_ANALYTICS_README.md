# Admin Dashboard Analytics Setup Guide

## ✅ Features Implemented

Your admin-orders page now includes:

### 1. **Revenue Tracking**
- **Daily Revenue** - Total earnings from today's orders
- **Monthly Revenue** - Total earnings for the current month
- **Yearly Revenue** - Total earnings for the current year

### 2. **Product Analytics**
- **Most Sold Product** - Shows the top-selling item with quantity
- **Least Sold Product** - Shows the lowest-selling item with quantity
- Time-period filtering (Day/Month/Year)

### 3. **Visual Charts**
- **Bar Chart** - Revenue overview (hourly for day, weekly for month, monthly for year)
- **Pie Chart** - Order distribution (Regular Orders vs Custom Cakes)

### 4. **PDF Report Download**
- Download daily, monthly, or yearly reports as PDF
- Includes revenue summary, order statistics, and product performance
- Auto-generated filename with date

---

## 📁 File Structure (No API Errors)

```
/workspace
├── admin-orders/
│   └── index.html          # Updated with analytics dashboard
├── supabase-config.js      # Shared credentials (used by all pages)
└── supabase.sql            # Database schema (no changes needed)
```

**Library Load Order** (critical for no errors):
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"></script>
<script src="../supabase-config.js"></script>
```

---

## 🔧 No Supabase Changes Required

The implementation uses your existing `orders` table structure:
- `total` column → Revenue calculations
- `items` JSONB → Product counting for regular orders
- `order_type`, `cake_weight`, `cake_flavor` → Custom cake tracking
- `created_at` → Time-based filtering

**No SQL migrations needed!** Everything works with your current schema.

---

## 🎯 How to Use

### View Analytics
1. Log in to `/admin-orders/`
2. Scroll down to see:
   - Revenue cards (Today/Month/Year)
   - Time period selector (Day/Month/Year buttons)
   - Most/Least sold products
   - Revenue bar chart
   - Order distribution pie chart

### Change Time Period
- Click **Day** → Shows today's hourly data
- Click **Month** → Shows this month's weekly data
- Click **Year** → Shows this year's monthly data
- Product stats and charts update automatically

### Download PDF Report
1. Select desired time period (Day/Month/Year)
2. Click **"Download Report"** button
3. PDF includes:
   - Revenue summary (today/month/year)
   - Order statistics for selected period
   - Top 10 products by sales
   - Generation timestamp

---

## 📊 Data Breakdown

### Revenue Calculation
```javascript
// Sums up `total` field from orders in each period
Today:   Orders where created_at is today
Month:   Orders where created_at is this month
Year:    Orders where created_at is this year
```

### Product Counting
- **Regular Orders**: Counts `items[].qty` for each product name
- **Custom Cakes**: Uses `cake_weight` as quantity, labeled as "Custom Cake (flavor)"

### Chart Data
- **Bar Chart (Day)**: Revenue grouped by 4-hour intervals (6AM, 9AM, 12PM, 3PM, 6PM, 9PM)
- **Bar Chart (Month)**: Revenue grouped by weeks (Week 1-4)
- **Bar Chart (Year)**: Revenue by month (Jan-Dec)
- **Pie Chart**: Simple count of regular vs custom orders

---

## 🎨 Styling

All new components use your existing design system:
- Colors: `--pink`, `--pink-dark`, `--cream`, `--brown`, `--green`, `--orange`
- Fonts: Playfair Display (headings), Poppins (body)
- Shadows, borders, and spacing match existing cards
- Fully responsive (mobile-first breakpoints at 600px and 380px)

---

## 🔒 Security Notes

- Uses same `SUPABASE_ANON_KEY` as other pages (no secrets exposed)
- Only authenticated users can access (existing login system)
- No new database permissions required
- PDF generation happens client-side (no server calls)

---

## 🧪 Testing Checklist

- [ ] Log in to admin-orders page
- [ ] Verify revenue cards show correct amounts
- [ ] Switch between Day/Month/Year periods
- [ ] Check most/least sold products update correctly
- [ ] Verify bar chart displays properly
- [ ] Verify pie chart displays properly
- [ ] Download PDF report for each period
- [ ] Test on mobile device (responsive layout)
- [ ] Refresh stats button works

---

## 🐛 Troubleshooting

### Charts not showing?
- Check browser console for errors
- Ensure Chart.js CDN loads (check Network tab)
- Verify you have orders with `created_at` timestamps

### PDF download fails?
- Check jsPDF and autoTable CDNs load correctly
- Ensure browser allows pop-ups/downloads from your domain
- Try in a different browser

### Revenue shows ₹0?
- Verify orders have `total` field populated
- Check order `created_at` dates match selected period
- Refresh stats using the "Refresh Stats" button

### Products show "—"?
- Add some orders with `items` array (regular orders) or `cake_weight` (custom cakes)
- Ensure time period has orders with product data

---

## 📝 Notes

- Custom cakes are counted by weight (e.g., 2kg = 2 units)
- Regular products are counted by `qty` field
- Reports include top 10 products only (to fit on page)
- All times use visitor's local timezone
- PDF uses A4 size with automatic pagination

---

**Last Updated**: 2026-08-09  
**Version**: 1.0  
**Compatible With**: Existing Velvet Whisk deployment (GitHub + Netlify + Supabase)
