# Mai Store

This is an e-commerce project built with [Next.js](https://nextjs.org) and [Supabase](https://supabase.io/). It features product management, a shopping cart, user authentication, and order confirmation via WhatsApp.

## Features

- **Product Catalog**: Displays a variety of products on the home page.
- **Shopping Cart**: Only the admin can add products to a cart, update quantities, and remove items.
- **User Authentication**: Secure user login and management powered by Supabase using Google OAuth.
- **Admin Panel**: Authenticated administrators can add, edit, and delete products.
- **WhatsApp Order Confirmation**: Logged-in users can confirm their orders via WhatsApp, including order details.
- **Vercel Analytics**: Integrated for tracking application performance and user engagement.
- **Responsive Design**: Optimized for various screen sizes.

## Getting Started

First, ensure you have the necessary environment variables set up for Supabase.

### Environment Variables

Create a `.env` file in the root of your project and add the following:

```
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
# Add any other environment variables required for your Supabase setup (e.g., POSTGRES_URL, SUPABASE_SERVICE_ROLE_KEY)
```

Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual Supabase project URL and public anon key.

Next, run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
