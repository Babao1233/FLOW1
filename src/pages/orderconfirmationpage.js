import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderConfirmationPage = () => {
    const location = useLocation();
    const orderData = location.state?.order; // Get order data passed via navigate state

    return (
        <div className="container mx-auto px-4 py-12 md:py-16 text-center min-h-[60vh] flex flex-col items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-xl shadow-2xl max-w-2xl w-full">
                <i className="fas fa-check-circle fa-5x text-green-500 dark:text-green-400 mb-6 animate-pulse"></i>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">Đặt hàng thành công!</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                    Cảm ơn bạn đã mua sắm tại Yapee. Đơn hàng của bạn đã được ghi nhận.
                </p>

                {orderData && (
                    <div className="text-left bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-8 space-y-3 text-sm">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3 border-b dark:border-gray-600 pb-2">Chi tiết đơn hàng (Demo)</h3>
                        <p><strong>Mã đơn hàng:</strong> <span className="font-mono text-primary dark:text-secondary">{orderData.orderId}</span></p>
                        <p><strong>Khách hàng:</strong> {orderData.customerName}</p>
                        <p><strong>Địa chỉ giao:</strong> {orderData.shippingAddress}</p>
                        <p><strong>Tổng tiền:</strong> <span className="font-semibold">${orderData.totalAmount.toFixed(2)}</span></p>
                        <p><strong>Sản phẩm:</strong></p>
                        <ul className="list-disc list-inside pl-4 text-xs">
                            {orderData.items.map(item => (
                                <li key={item.id}>{item.name} (x{item.quantity})</li>
                            ))}
                        </ul>
                         <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Một email xác nhận đã được gửi đến địa chỉ của bạn (giả lập).</p>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <Link
                        to="/"
                        className="bg-primary hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition shadow-md hover:shadow-lg"
                    >
                        <i className="fas fa-shopping-bag mr-2"></i> Tiếp tục mua sắm
                    </Link>
                    <Link
                        to="/account/orders"
                        className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-8 py-3 rounded-lg font-semibold text-lg transition shadow-md hover:shadow-lg"
                    >
                        <i className="fas fa-receipt mr-2"></i> Xem lịch sử đơn hàng
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
