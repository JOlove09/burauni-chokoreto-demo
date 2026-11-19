import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import Order from './models/Order.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '20kb' }));

app.get('/api/health', (_, res) => res.json({ message: 'Bakery API is running' }));

app.get('/api/products', async (_, res) => {
  try {
    const products = await Product.find().sort({ _id: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Could not load products.' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, phone, address, items } = req.body;
    if (typeof customerName !== 'string' || !customerName.trim() ||
        typeof phone !== 'string' || !/^\d{10}$/.test(phone.trim()) ||
        typeof address !== 'string' || !address.trim() ||
        !Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: 'Please enter your name, 10-digit phone, address, and products.' });
    }

    const cleanItems = [];
    for (const item of items) {
      if (!mongoose.isValidObjectId(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 30) {
        return res.status(400).json({ message: 'An item in the cart is invalid.' });
      }
      const product = await Product.findById(item.productId);
      if (!product) return res.status(400).json({ message: 'A product is no longer available.' });
      // Prices come from the database, not the client.
      cleanItems.push({ productId: product._id, name: product.name, price: product.price, quantity: item.quantity });
    }

    const totalAmount = cleanItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await Order.create({
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      items: cleanItems,
      totalAmount
    });
    res.status(201).json({ message: 'Order received!', orderId: order._id.toString(), totalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
});

const PORT = Number(process.env.PORT) || 5001;
try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/burauni_chokoreto');
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
} catch (error) {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1);
}
