const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/db");

// Import Routes
const categoryRoutes = require("./routes/categoryRoutes");

const productRoutes = require('./routes/productRoutes');

const cartRoutes = require('./routes/cartRoutes');

const orderRoutes = require("./routes/orderRoutes");

const customerRoutes = require("./routes/customerRoutes");

const addressRoutes = require('./routes/addressRoutes'); // Thêm dòng này ở trên

const voucherRoutes = require("./routes/voucherRoutes");

const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

const authRoutes = require("./routes/authRoutes");   
// Middleware
app.use(cors());

app.use(express.json());

app.use("/uploads", express.static("uploads"));

// Kết nối Database
connectDB();

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes); 

app.use('/api/products', productRoutes);

app.use('/api/cart', cartRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/customers", customerRoutes);

app.use('/api/addresses', addressRoutes);

app.use("/api/vouchers", voucherRoutes);

app.use("/api/dashboard", dashboardRoutes);

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