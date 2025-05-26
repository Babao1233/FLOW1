import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Component hiển thị tổng quan tài khoản người dùng
 * Hiển thị các thông tin cơ bản và thống kê về hoạt động của tài khoản
 */
const AccountOverview = ({ user, orders, wishlist }) => {
  // Tính số đơn hàng theo trạng thái
  const pendingOrders = orders?.filter(order => ['pending', 'processing'].includes(order.status)) || [];
  const completedOrders = orders?.filter(order => order.status === 'completed') || [];
  
  // Tính tổng chi tiêu
  const totalSpent = completedOrders.reduce((sum, order) => sum + order.total, 0);
  
  // Các box thống kê
  const stats = [
    {
      id: 'pending-orders',
      title: 'Đơn hàng chờ xử lý',
      value: pendingOrders.length,
      icon: (
        <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: '/account/orders?status=pending'
    },
    {
      id: 'completed-orders',
      title: 'Đơn hàng đã hoàn thành',
      value: completedOrders.length,
      icon: (
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: '/account/orders?status=completed'
    },
    {
      id: 'wishlist',
      title: 'Sản phẩm yêu thích',
      value: wishlist?.length || 0,
      icon: (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      link: '/account/wishlist'
    },
    {
      id: 'total-spent',
      title: 'Tổng chi tiêu',
      value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSpent),
      icon: (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Thông báo chào mừng */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">
              Xin chào, {user?.fullName || user?.username || 'Quý khách'}
            </h3>
            <div className="mt-2 text-sm text-amber-700">
              <p>
                Từ trang tài khoản, bạn có thể quản lý thông tin cá nhân, theo dõi đơn hàng và cập nhật các thông tin khác.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Thống kê */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-gray-50">
                {stat.icon}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
                <p className="text-lg font-semibold text-gray-800 mt-1">{stat.value}</p>
              </div>
            </div>
            {stat.link && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <Link to={stat.link} className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Xem chi tiết
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Đơn hàng gần đây */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Đơn hàng gần đây</h2>
            <Link to="/account/orders" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              Xem tất cả
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          {orders && orders.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã đơn hàng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đặt
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng tiền
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'completed' ? 'Hoàn thành' :
                         order.status === 'processing' ? 'Đang xử lý' :
                         order.status === 'pending' ? 'Chờ xử lý' :
                         order.status === 'cancelled' ? 'Đã hủy' :
                         order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/account/orders/${order.id}`} className="text-amber-600 hover:text-amber-700">
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
              <Link to="/products" className="mt-2 inline-block text-amber-600 hover:text-amber-700 font-medium">
                Bắt đầu mua sắm
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Sản phẩm yêu thích gần đây */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-800">Sản phẩm yêu thích</h2>
            <Link to="/account/wishlist" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              Xem tất cả
            </Link>
          </div>
        </div>
        {wishlist && wishlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {wishlist.slice(0, 5).map((item) => (
              <div key={item.id} className="group relative">
                <div className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden bg-gray-100">
                  <img
                    src={item.image_url || '/images/product-placeholder.jpg'}
                    alt={item.name}
                    className="object-center object-cover group-hover:opacity-75"
                  />
                </div>
                <div className="mt-2 flex justify-between">
                  <div>
                    <h3 className="text-sm text-gray-700 font-medium line-clamp-2">
                      <Link to={`/products/${item.id}`}>
                        {item.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-amber-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">Bạn chưa có sản phẩm yêu thích nào</p>
            <Link to="/products" className="mt-2 inline-block text-amber-600 hover:text-amber-700 font-medium">
              Khám phá sản phẩm
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountOverview;