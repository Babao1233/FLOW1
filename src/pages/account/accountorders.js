import React, { useState } from 'react';

const mockOrders = [
  {
    id: 'JSL-1001A5',
    date: '2024-05-15',
    status: 'Đã giao hàng',
    totalAmount: 138.00,
    items: [
      { productId: '2', name: 'Ceramic Heater', quantity: 1, price: 99.00, image: 'https://placehold.co/80x80/f97316/ffffff?text=Heater' },
      { productId: '3', name: 'USB Desk Fan', quantity: 1, price: 39.00, image: 'https://placehold.co/80x80/3b82f6/ffffff?text=Fan' },
    ],
    shippingAddress: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'
  },
  {
    id: 'JSL-1002B8',
    date: '2024-05-20',
    status: 'Đang xử lý',
    totalAmount: 249.00,
    items: [
      { productId: '1', name: 'Smart Air Purifier', quantity: 1, price: 249.00, image: 'https://placehold.co/80x80/ef4444/ffffff?text=Purifier' },
    ],
    shippingAddress: '456 Đường XYZ, Quận Ba Đình, Hà Nội'
  },
  {
    id: 'JSL-1003C1',
    date: '2024-05-22',
    status: 'Đã hủy',
    totalAmount: 45.00,
    items: [
      { productId: '5', name: 'Portable Neck Fan', quantity: 1, price: 45.00, image: 'https://placehold.co/80x80/8b5cf6/ffffff?text=Neck+Fan' },
    ],
    shippingAddress: '789 Đường LMN, Quận Cầu Giấy, Hà Nội'
  },
];

const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
        case 'đã giao hàng':
            return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-200';
        case 'đang xử lý':
            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100';
        case 'đã hủy':
            return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-200';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300';
    }
};


const AccountOrders = () => {
    const [orders] = useState(mockOrders); // Use mockOrders, in real app this would come from API

    if (orders.length === 0) {
        return (
            <div>
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Lịch Sử Đơn Hàng</h2>
                <div className="text-center py-10">
                    <i className="fas fa-box-open fa-3x text-gray-400 dark:text-gray-500 mb-4"></i>
                    <p className="text-gray-600 dark:text-gray-400">Bạn chưa có đơn hàng nào.</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Lịch Sử Đơn Hàng</h2>
            <div className="space-y-6">
                {orders.map(order => (
                    <div key={order.id} className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
                            <div>
                                <h3 className="text-lg font-semibold text-primary dark:text-secondary">Đơn hàng #{order.id}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Ngày đặt: {new Date(order.date).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mt-2 sm:mt-0 ${getStatusClass(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        
                        <div className="mb-3">
                            {order.items.map(item => (
                                <div key={item.productId} className="flex items-center space-x-3 py-2 border-b border-gray-100 dark:border-gray-600/50 last:border-b-0">
                                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md"/>
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium text-gray-800 dark:text-white">{item.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Số lượng: {item.quantity} x ${item.price.toFixed(2)}</p>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">${(item.quantity * item.price).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            <strong>Địa chỉ giao hàng:</strong> {order.shippingAddress}
                        </div>
                        <div className="text-right">
                            <p className="text-md font-bold text-gray-800 dark:text-white">Tổng cộng: <span className="text-primary dark:text-secondary">${order.totalAmount.toFixed(2)}</span></p>
                        </div>
                        {/* <div className="mt-4 text-right">
                            <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                                Xem chi tiết
                            </button>
                        </div> */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AccountOrders;
