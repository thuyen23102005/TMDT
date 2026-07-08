import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard";
import Category from "../pages/Admin/Category";
import UserLayout from "../layouts/UserLayout";

import Home from "../pages/User/Home";
import Login from "../pages/User/Login";
import Register from "../pages/User/Register";
import Profile from "../pages/User/Profile";

// Các trang con trong Profile
import HoSoCaNhan from "../pages/User/Profile/HoSoCaNhan";
import SoDiaChi from "../pages/User/Profile/SoDiaChi";
import DoiMatKhau from "../pages/User/Profile/DoiMatKhau";
import UuDaiThanhVien from "../pages/User/Profile/UuDaiThanhVien";
import DonHang from "../pages/User/Profile/DonHang";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Website khách */}
                <Route path="/" element={<UserLayout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />

                    {/* Profile có route con */}
                    <Route path="profile" element={<Profile />}>
                        <Route index element={<HoSoCaNhan />} />
                        <Route path="dia-chi" element={<SoDiaChi />} />
                        <Route path="doi-mat-khau" element={<DoiMatKhau />} />
                        <Route path="uu-dai" element={<UuDaiThanhVien />} />
                        <Route path="don-hang" element={<DonHang />} />
                    </Route>
                </Route>

                {/* Admin */}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="categories" element={<Category />} />
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;