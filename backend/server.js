const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/db");

// Import Routes
const categoryRoutes = require("./routes/categoryRoutes");

const productRoutes = require('./routes/productRoutes');

const cartRoutes = require('./routes/cartRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
// Kết nối Database
connectDB();

// Routes
app.use("/api/categories", categoryRoutes);

app.use('/api/products', productRoutes);

app.use('/api/cart', cartRoutes);

// Test API
app.get("/", (req, res) => {
    res.json({
        message: "🚀 Server đang chạy thành công!"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});