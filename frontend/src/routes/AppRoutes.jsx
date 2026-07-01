import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard";
import Category from "../pages/Admin/Category";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home/Home";

import ProductDetail from "../pages/ProductDetail/ProductDetail";

import Cart from "../pages/Cart/Cart";

import Checkout from "../pages/Checkout/Checkout";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                </Route>

                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="categories" element={<Category />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;