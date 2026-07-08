const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/db");

// Import Routes
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

const authRoutes = require("./routes/authRoutes");   
// Middleware
app.use(cors());
app.use(express.json());

// Kết nối Database
connectDB();

// Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes); 

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