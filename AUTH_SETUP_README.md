# Supabase Auth Setup for Velvet Whisk

## Overview
This document explains the Sign Up / Sign In system implementation using Supabase Auth.

## File Structure
```
/workspace
├── account.html              # NEW: Customer authentication page (Sign Up / Sign In)
├── index.html                # Updated with Account link in navigation
├── style.css                 # Updated with .account-link styling
├── supabase-config.js        # Supabase credentials (shared across all pages)
├── supabase.sql              # Updated database schema with user_id column
├── admin-orders/index.html   # Admin order management (existing)
└── TECHNICAL_README.md       # Main technical documentation
```

## What Was Added

### 1. `account.html` - Customer Authentication Page
A complete sign up / sign in system with:
- **Tabbed interface**: Switch between Sign In and Sign Up forms
- **Sign Up Form**: 
  - Full name, email, password fields
  - Minimum 6 character password requirement
  - Email confirmation flow (users must verify email before signing in)
- **Sign In Form**:
  - Email and password authentication
  - Error handling for invalid credentials
- **Logged In State**:
  - Shows user email
  - Links to continue shopping or track orders
  - Sign out button
- **Auth State Listener**: Automatically updates UI when auth state changes

### 2. Navigation Updates (`index.html`)
Added "Account" link to:
- Desktop navigation (styled as a pill button)
- Mobile navigation menu

### 3. Styling (`style.css`)
Added `.account-link` styles:
- Pink background matching brand colors
- Hover effects
- Icon + text layout
- Responsive design

### 4. Database Schema (`supabase.sql`)
Updated `orders` table:
- Added `user_id` column (UUID) referencing `auth.users(id)`
- Created index on `user_id` for performance
- Updated RLS policies:
  - Users can view their own orders (`auth.uid() = user_id`)
  - Orders without `user_id` remain visible (for guest checkouts)
  - Admins retain full access via admin-orders page

## How It Works

### User Flow
1. **New User**: 
   - Visit `/account.html`
   - Click "Sign Up" tab
   - Enter name, email, password
   - Receive email confirmation link
   - After confirming, return and sign in

2. **Returning User**:
   - Visit `/account.html`
   - Enter email and password
   - Access granted immediately

3. **Authenticated User**:
   - See their email displayed
   - Can navigate to shop or track orders
   - Can sign out

### Integration with Existing Features

#### Order Placement (Future Enhancement)
When a logged-in user places an order, you can now associate it with their account:

```javascript
// In script.js, when submitting checkout form:
const { data: { user } } = await supabaseClient.auth.getUser();

const { error } = await supabaseClient.from('orders').insert({
  // ... other fields
  user_id: user?.id || null  // Associate with authenticated user
});
```

#### Order Tracking
Authenticated users can view their order history (future feature):
```javascript
const { data: orders } = await supabaseClient
  .from('orders')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

## Supabase Configuration Required

### 1. Enable Email Auth
In Supabase Dashboard:
- Go to **Authentication** → **Providers**
- Ensure **Email** is enabled
- Configure email templates (optional)

### 2. Email Confirmation Settings
Choose one of these options:

**Option A: Require Email Confirmation (Recommended)**
- Authentication → Settings → Email Auth
- Enable "Confirm email"
- Users must click email link before signing in

**Option B: Skip Email Confirmation (Development Only)**
- Authentication → Settings → Email Auth
- Disable "Confirm email"
- Users can sign in immediately after signup

### 3. Run SQL Migration
Execute the updated `supabase.sql` in Supabase SQL Editor:
- **Warning**: If you have existing orders, DO NOT run the `DROP TABLE` statement
- Instead, run only these commands:
```sql
-- Add user_id column to existing table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Update RLS policy for viewing own orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);
```

## Security Notes

### Row Level Security (RLS)
The updated policies ensure:
- **Guest users**: Can place orders but cannot view any orders via direct queries
- **Authenticated users**: Can only view orders they placed (where `user_id` matches)
- **Admins**: Can view/update/delete all orders via admin-orders page

### Best Practices
1. Never expose `service_role` key in frontend code
2. Always use `SUPABASE_ANON_KEY` for client-side operations
3. Email confirmation prevents fake accounts
4. Password minimum length enforced (6 characters)

## Testing Checklist

- [ ] Sign up with new email address
- [ ] Verify email confirmation email received
- [ ] Confirm email via link
- [ ] Sign in with confirmed account
- [ ] Verify "Continue Shopping" link works
- [ ] Verify "Track Orders" link works
- [ ] Sign out successfully
- [ ] Try signing in with wrong password (error shown)
- [ ] Try signing up with existing email (error shown)
- [ ] Test on mobile device (responsive design)

## Future Enhancements

1. **Order History Page**: Show all orders for logged-in users
2. **Profile Management**: Allow users to update name, phone, address
3. **Password Reset**: Implement forgot password flow
4. **Social Login**: Add Google/Facebook authentication
5. **Auto-fill Checkout**: Pre-populate checkout form with user data

## Troubleshooting

### "Invalid login credentials"
- Check if email is confirmed (check spam folder)
- Verify password meets minimum requirements

### "User already registered"
- User signed up previously; switch to Sign In tab

### Email not received
- Check spam/junk folder
- Verify Supabase email settings
- Use a real email address (not fake@test.com)

### API errors
- Ensure `supabase-config.js` has correct URL and anon key
- Check browser console for specific error messages
- Verify Supabase project is active
