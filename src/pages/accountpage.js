import React from 'react';
import { Routes, Route, NavLink, Outlet, Navigate } from 'react-router-dom';
import AccountProfile from './account/AccountProfile';
import AccountOrders from './account/AccountOrders';
import NotFoundPage from './NotFoundPage'; // For handling invalid sub-routes

const AccountPage = () => {
    const navLinkClasses = ({ isActive }) =>
        `flex items-center space-x-3 p-3 rounded-lg transition-all text-sm font-medium ${
            isActive
            ? 'bg-primary/10 text-primary dark:bg-secondary/20 dark:text-secondary shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700/50'
        }`;

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-800 dark:text-white">Tài Khoản Của Tôi</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                {/* Sidebar Navigation */}
                <aside className="md:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg sticky md:top-[88px]"> {/* Adjusted sticky top considering header height */}
                        <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 hidden md:block">Điều Hướng</h3>
                        <nav className="space-y-2">
                            <NavLink to="profile" className={navLinkClasses}>
                                <i className="fas fa-id-card w-5 h-5"></i>
                                <span>Thông Tin Cá Nhân</span>
                            </NavLink>
                            <NavLink to="orders" className={navLinkClasses}>
                                <i className="fas fa-box-archive w-5 h-5"></i>
                                <span>Lịch Sử Đơn Hàng</span>
                            </NavLink>
                            {/* Placeholder for future links */}
                            {/* <NavLink to="addresses" className={navLinkClasses}>
                                <i className="fas fa-map-marker-alt w-5 h-5"></i>
                                <span>Địa Chỉ</span>
                            </NavLink>
                            <NavLink to="settings" className={navLinkClasses}>
                                <i className="fas fa-cog w-5 h-5"></i>
                                <span>Cài Đặt</span>
                            </NavLink> */}
                            <button className="w-full flex items-center space-x-3 p-3 rounded-lg transition-all text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-gray-700/50 text-left">
                                <i className="fas fa-sign-out-alt w-5 h-5 text-red-500 dark:text-red-400"></i>
                                <span>Đăng Xuất</span>
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area - Renders sub-routes via Outlet */}
                <section className="md:col-span-3 bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-xl min-h-[300px]">
                    <Routes>
                         {/* Redirect /account to /account/profile by default */}
                        <Route index element={<Navigate to="profile" replace />} />
                        <Route path="profile" element={<AccountProfile />} />
                        <Route path="orders" element={<AccountOrders />} />
                        {/* <Route path="addresses" element={<AccountAddresses />} /> */}
                        {/* <Route path="settings" element={<AccountSettings />} /> */}
                        <Route path="*" element={<NotFoundPage />} /> {/* Or a specific "Account Section Not Found" */}
                    </Routes>
                </section>
            </div>
        </div>
    );
};

export default AccountPage;
