import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Brownies', 'Chocolates', 'Cookies'], required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true }
});

export default mongoose.model('Product', productSchema);
