# Buraunī & Chokorēto — Simple MERN Bakery Website

A beginner-friendly student project based on the supplied bakery poster.

## Features
- Home page with brownie/chocolate/cookie categories
- Shop with all 12 items from the original poster
- Filter by Brownies, Chocolates and Cookies
- Add items to cart, adjust quantity, calculate total
- Simple order form saves orders to MongoDB
- Product images cropped from the poster you provided
- Basic mobile-responsive pink and chocolate theme

**Important:** Product prices in this demo are made-up examples. This is **not a live ecommerce store**: there is no online payment, email confirmation, delivery integration, or admin login. Do not accept real customer orders or publish contact/address collection until you add proper security and privacy controls.

## Software needed
- Node.js (current LTS)
- MongoDB Community Server running locally (Compass is optional; Compass by itself is not the database server)
- VS Code or any text editor

## Step 1 — Set up backend
Open a terminal in the `backend` folder and run:

```bash
npm install
```

Create a file called `.env` in `backend` and paste:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/burauni_chokoreto
PORT=5001
```

Start the MongoDB Server, then run:

```bash
npm run seed
npm run dev
```

You should see `Connected to MongoDB` and `Server: http://localhost:5001`.

Test the API: http://localhost:5001/api/products

## Step 2 — Set up frontend
Open a **second** terminal in the `frontend` folder:

```bash
npm install
npm run dev
```

Open **http://localhost:5176**.

The frontend defaults to API http://localhost:5001, so no frontend `.env` file is required for local testing.

## Step 3 — Check database in Compass
Connect to `mongodb://127.0.0.1:27017`, then find:
- Database: `burauni_chokoreto`
- Collection: `products` (12 products)
- Collection: `orders` (created when you place a demo order)

## Folder structure
```text
burauni-chokoreto-mern/
├─ backend/
│  ├─ models/Product.js
│  ├─ models/Order.js
│  ├─ seed.js
│  ├─ server.js
│  ├─ .env.example
│  └─ package.json
├─ frontend/
│  ├─ public/images/        # Artwork cropped from your poster
│  ├─ src/App.jsx
│  ├─ src/main.jsx
│  ├─ src/style.css
│  ├─ index.html
│  ├─ vite.config.js
│  └─ package.json
├─ .gitignore
└─ README.md
```

## Customize
- **Prices or product names:** edit `backend/seed.js` and run `npm run seed` again.
- **Colors and spacing:** edit `frontend/src/style.css`.
- **Photos:** replace files in `frontend/public/images` using the same filenames.
- **Port:** frontend port is 5176 in `frontend/package.json`, backend port 5001 in `.env`.

## How it uses the MERN stack
- **M:** MongoDB stores products and orders
- **E:** Express serves `/api/products` and `/api/orders`
- **R:** React renders pages and manages cart state
- **N:** Node.js runs the backend

## Suggested classroom demo
1. Start MongoDB and the backend.
2. Run seed to add 12 products.
3. Open the React site and filter the menu.
4. Add a brownie and a chocolate to the cart.
5. Submit a **fake demo order** using non-personal data.
6. Open Compass and show the saved order document.
