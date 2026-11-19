
import 'dotenv/config';
import mongoose from 'mongoose';
import { readdirSync } from 'node:fs';
import Product from './models/Product.js';

// Read images from frontend/public/images
const imageFiles = readdirSync(
  new URL('../frontend/public/images/', import.meta.url)
);

// Match filenames regardless of spaces, accents or case
function normalize(text) {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function findImage(name) {
  const image = imageFiles.find((file) => {
    const dot = file.lastIndexOf('.');

    if (dot === -1) return false;

    const extension = file.slice(dot).toLowerCase();
    const fileName = file.slice(0, dot);

    return (
      ['.jpg', '.jpeg', '.png', '.webp'].includes(extension) &&
      normalize(fileName) === normalize(name)
    );
  });

  if (!image) {
    throw new Error(`Image not found: ${name}`);
  }

  return image;
}

// Product list with sample prices
const items = [

  // BURAUNI LAB - BROWNIES

  [
    'Melty Choco Burauni',
    'Rich fudgy chocolate brownie - 1 piece',
    'Brownies',
    99
  ],

  [
    'Nutty Drizzle Burauni',
    'Chocolate brownie with peanuts - 1 piece',
    'Brownies',
    109
  ],

  [
    'Strawberry Swirl Burauni',
    'Brownie topped with strawberry - 1 piece',
    'Brownies',
    119
  ],

  [
    'Caramel Drip Burauni',
    'Brownie with caramel drizzle - 1 piece',
    'Brownies',
    119
  ],

  [
    'Orange Kiss Burauni',
    'Chocolate-orange brownie - 1 piece',
    'Brownies',
    109
  ],

  [
    'Mango Bliss Burauni',
    'Brownie with mango topping - 1 piece',
    'Brownies',
    129
  ],

  [
    'Burauni Bites',
    'Bite-sized fudgy brownies - box of 6',
    'Brownies',
    179
  ],

  [
    'Assorted Burauni',
    'Mixed brownie flavours - box of 6',
    'Brownies',
    599
  ],

  // CHOKORETO LAB - CHOCOLATES

  [
    'Pinattsu Choko',
    'Groundnut chocolate - 1 piece',
    'Chocolates',
    39
  ],

  [
    'Ichigo Choko',
    'Strawberry chocolate - 1 piece',
    'Chocolates',
    45
  ],

  [
    'Kyarameru Choko',
    'Butterscotch chocolate - 1 piece',
    'Chocolates',
    45
  ],

  [
    'Orenji Choko',
    'Orange chocolate - 1 piece',
    'Chocolates',
    45
  ],

  [
    'Natsu Mango Choko',
    'Mango chocolate - 1 piece',
    'Chocolates',
    45
  ],

  [
    'Painappuru Choko',
    'Pineapple chocolate - 1 piece',
    'Chocolates',
    45
  ],

  [
    'Burūberī Choko',
    'Blueberry chocolate - 1 piece',
    'Chocolates',
    49,
    'Buruberi Choko'
  ],

  [
    'Jamu Iri Choko',
    'Jam-filled chocolate - 1 piece',
    'Chocolates',
    49
  ],

  [
    'Kuki Kurimu Choko',
    'Cookies and cream chocolate - 1 piece',
    'Chocolates',
    49
  ],

  [
    'Assorted Chokoreto',
    'Nine assorted chocolates - box of 9',
    'Chocolates',
    379
  ],

  // KUKKI LAB - COOKIES

  [
    'Nutty Choco Chippu',
    'Chocolate chip and peanut cookie - 1 piece',
    'Cookies',
    79
  ],

  [
    'Choco Chippu',
    'Classic chocolate chip cookie - 1 piece',
    'Cookies',
    69
  ]
];

// Insert/update products in MongoDB
async function seed() {
  const products = items.map(
    ([name, description, category, price, imageName]) => ({
      name,
      description,
      category,
      price,
      image: findImage(imageName || name)
    })
  );

  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
      'mongodb://127.0.0.1:27017/burauni_chokoreto'
    );

    console.log('MongoDB connected');

    for (const product of products) {
      await Product.updateOne(
        { name: product.name },
        { $set: product },
        { upsert: true }
      );
    }

    // Remove outdated product entries
    await Product.deleteMany({
      name: {
        $in: ['Buraunī Koro', 'Buruberi Choko']
      }
    });

    console.log('Products updated successfully!');
    console.log(`Menu items updated: ${products.length}`);

    const count = await Product.countDocuments();
    console.log(`Total products in database: ${count}`);

  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error) => {
  console.error('Error:', error.message);
  process.exitCode = 1;
});
