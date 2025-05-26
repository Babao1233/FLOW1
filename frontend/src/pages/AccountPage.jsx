import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AccountSidebar from '../components/account/AccountSidebar';
import ProfileForm from '../components/account/ProfileForm';
import ChangePasswordForm from '../components/account/ChangePasswordForm';
import AddressManager from '../components/account/AddressManager';
import AccountOverview from '../components/account/AccountOverview';
import OrderHistory from '../components/account/OrderHistory';
import OrderDetail from '../components/account/OrderDetail';

/**
 * Trang quản lý tài khoản người dùng
 * Tích hợp tất cả các chức năng quản lý tài khoản người dùng
 */
const AccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  // Xác định tab đang active dựa trên đường dẫn URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/orders/')) {
      setActiveTab('orders');
    } else if (path.includes('/profile')) {
      setActiveTab('profile');
    } else if (path.includes('/addresses')) {
      setActiveTab('addresses');
    } else if (path.includes('/password')) {
      setActiveTab('password');
    } else if (path.includes('/wishlist')) {
      setActiveTab('wishlist');
    } else if (path.includes('/orders')) {
      setActiveTab('orders');
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);
  
  // Tải dữ liệu người dùng
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Mô phỏng việc gọi API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Dữ liệu mẫu
        setUser({
          id: 1,
          username: 'nguyenvana',
          email: 'nguyenvana@example.com',
          fullName: 'Nguyễn Văn A',
          phone: '0987654321',
          avatar: '/images/avatar-placeholder.png',
          createdAt: '2023-01-15T00:00:00Z'
        });
        
        setAddresses([
          {
            id: 1,
            fullName: 'Nguyễn Văn A',
            phone: '0987654321',
            address: '123 Đường Lê Lợi',
            ward: 'Phường Bến Nghé',
            district: 'Quận 1',
            province: 'TP. Hồ Chí Minh',
            isDefault: true
          },
          {
            id: 2,
            fullName: 'Nguyễn Văn A',
            phone: '0987654321',
            address: '456 Đường Nguyễn Huệ',
            ward: 'Phường Bến Thành',
            district: 'Quận 1',
            province: 'TP. Hồ Chí Minh',
            isDefault: false
          }
        ]);
        
        setOrders([
          {
            id: 1,
            orderNumber: 'YP12345',
            orderDate: '2023-06-15T08:30:00Z',
            status: 'completed',
            total: 5490000,
            subtotal: 5590000,
            discount: 100000,
            shippingFee: 0,
            paymentStatus: 'paid',
            paymentMethod: { name: 'Thanh toán khi nhận hàng (COD)' },
            shippingMethod: { name: 'Giao hàng tiêu chuẩn' },
            shippingAddress: {
              fullName: 'Nguyễn Văn A',
              phone: '0987654321',
              address: '123 Đường Lê Lợi',
              ward: 'Phường Bến Nghé',
              district: 'Quận 1',
              province: 'TP. Hồ Chí Minh'
            },
            products: [
              {
                id: 101,
                name: 'Robot hút bụi thông minh Xiaomi Vacuum Mop 2 Pro',
                image_url: '/images/products/robot-hut-bui.jpg',
                price: 5990000,
                quantity: 1,
                variant: 'Màu trắng'
              }
            ],
            processingDate: '2023-06-15T10:45:00Z',
            shippingDate: '2023-06-16T09:20:00Z',
            deliveryDate: '2023-06-18T14:30:00Z'
          },
          {
            id: 2,
            orderNumber: 'YP12346',
            orderDate: '2023-07-20T14:20:00Z',
            status: 'shipping',
            total: 6490000,
            subtotal: 6490000,
            discount: 0,
            shippingFee: 0,
            paymentStatus: 'paid',
            paymentMethod: { name: 'Thẻ tín dụng/Ghi nợ' },
            shippingMethod: { name: 'Giao hàng nhanh' },
            shippingAddress: {
              fullName: 'Nguyễn Văn A',
              phone: '0987654321',
              address: '456 Đường Nguyễn Huệ',
              ward: 'Phường Bến Thành',
              district: 'Quận 1',
              province: 'TP. Hồ Chí Minh'
            },
            products: [
              {
                id: 102,
                name: 'Máy lọc không khí Samsung AX60',
                image_url: '/images/products/may-loc-khong-khi.jpg',
                price: 6490000,
                quantity: 1,
                variant: 'Bạc'
              }
            ],
            processingDate: '2023-07-20T15:10:00Z',
            shippingDate: '2023-07-21T08:45:00Z',
            deliveryDate: null
          },
          {
            id: 3,
            orderNumber: 'YP12347',
            orderDate: '2023-08-05T10:15:00Z',
            status: 'pending',
            total: 9980000,
            subtotal: 9980000,
            discount: 0,
            shippingFee: 0,
            paymentStatus: 'pending',
            paymentMethod: { name: 'Chuyển khoản ngân hàng' },
            shippingMethod: { name: 'Giao hàng tiêu chuẩn' },
            shippingAddress: {
              fullName: 'Nguyễn Văn A',
              phone: '0987654321',
              address: '123 Đường Lê Lợi',
              ward: 'Phường Bến Nghé',
              district: 'Quận 1',
              province: 'TP. Hồ Chí Minh'
            },
            products: [
              {
                id: 103,
                name: 'Khóa cửa thông minh Xiaomi Smart Door Lock',
                image_url: '/images/products/khoa-cua-thong-minh.jpg',
                price: 4990000,
                quantity: 2,
                variant: 'Đen'
              }
            ],
            processingDate: null,
            shippingDate: null,
            deliveryDate: null
          }
        ]);
        
        setWishlist([
          {
            id: 201,
            name: 'Bóng đèn thông minh Philips Hue',
            price: 890000,
            image_url: '/images/products/bong-den-thong-minh.jpg'
          },
          {
            id: 202,
            name: 'Loa thông minh Google Nest Mini',
            price: 1290000,
            image_url: '/images/products/loa-thong-minh.jpg'
          },
          {
            id: 203,
            name: 'Camera an ninh trong nhà Xiaomi Mi Home 360',
            price: 790000,
            image_url: '/images/products/camera-trong-nha.jpg'
          }
        ]);
        
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu người dùng:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);
  
  // Xử lý cập nhật thông tin cá nhân
  const handleUpdateProfile = (profileData) => {
    console.log('Cập nhật thông tin cá nhân:', profileData);
    // Trong ứng dụng thực tế, gọi API để cập nhật thông tin
    setUser({
      ...user,
      ...profileData
    });
  };
  
  // Xử lý đổi mật khẩu
  const handleChangePassword = (passwordData) => {
    console.log('Đổi mật khẩu:', passwordData);
    // Trong ứng dụng thực tế, gọi API để cập nhật mật khẩu
  };
  
  // Xử lý thêm địa chỉ mới
  const handleAddAddress = (addressData) => {
    console.log('Thêm địa chỉ mới:', addressData);
    // Trong ứng dụng thực tế, gọi API để thêm địa chỉ
    
    const newAddress = {
      id: Date.now(), // Giả lập ID
      ...addressData
    };
    
    // Nếu đây là địa chỉ mặc định, cập nhật các địa chỉ khác
    if (newAddress.isDefault) {
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: false
      })).concat(newAddress));
    } else {
      setAddresses([...addresses, newAddress]);
    }
  };
  
  // Xử lý cập nhật địa chỉ
  const handleEditAddress = (addressData) => {
    console.log('Cập nhật địa chỉ:', addressData);
    // Trong ứng dụng thực tế, gọi API để cập nhật địa chỉ
    
    // Nếu đây là địa chỉ mặc định, cập nhật các địa chỉ khác
    if (addressData.isDefault) {
      setAddresses(addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressData.id ? true : false
      })));
    } else {
      setAddresses(addresses.map(addr => 
        addr.id === addressData.id ? addressData : addr
      ));
    }
  };
  
  // Xử lý xóa địa chỉ
  const handleDeleteAddress = (addressId) => {
    console.log('Xóa địa chỉ:', addressId);
    // Trong ứng dụng thực tế, gọi API để xóa địa chỉ
    setAddresses(addresses.filter(addr => addr.id !== addressId));
  };
  
  // Xử lý đặt địa chỉ mặc định
  const handleSetDefaultAddress = (addressId) => {
    console.log('Đặt địa chỉ mặc định:', addressId);
    // Trong ứng dụng thực tế, gọi API để cập nhật địa chỉ mặc định
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
  };
  
  // Xử lý hủy đơn hàng
  const handleCancelOrder = (orderId, reason) => {
    console.log('Hủy đơn hàng:', orderId, 'Lý do:', reason);
    // Trong ứng dụng thực tế, gọi API để hủy đơn hàng
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    ));
  };
  
  // Lấy thông tin đơn hàng theo ID
  const getOrderById = (orderId) => {
    return orders.find(order => order.id === parseInt(orderId));
  };

  // Hiển thị màn hình loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tài khoản của tôi</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <AccountSidebar activeTab={activeTab} onTabChange={(tab) => navigate(`/account/${tab}`)} />
          </div>
          
          {/* Main content */}
          <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <AccountOverview 
                      user={user} 
                      orders={orders} 
                      wishlist={wishlist} 
                    />
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProfileForm 
                      user={user} 
                      onUpdateProfile={handleUpdateProfile} 
                    />
                  } 
                />
                <Route 
                  path="/password" 
                  element={
                    <ChangePasswordForm 
                      onChangePassword={handleChangePassword} 
                    />
                  } 
                />
                <Route 
                  path="/addresses" 
                  element={
                    <AddressManager 
                      addresses={addresses}
                      onAddAddress={handleAddAddress}
                      onEditAddress={handleEditAddress}
                      onDeleteAddress={handleDeleteAddress}
                      onSetDefaultAddress={handleSetDefaultAddress}
                    />
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <OrderHistory 
                      orders={orders} 
                    />
                  } 
                />
                <Route 
                  path="/orders/:id" 
                  element={
                    <OrderDetail 
                      order={getOrderById(location.pathname.split('/').pop())}
                      onCancelOrder={handleCancelOrder}
                    />
                  } 
                />
                <Route 
                  path="/wishlist" 
                  element={
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Sản phẩm yêu thích</h2>
                      {wishlist.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {wishlist.map((item) => (
                            <div key={item.id} className="group relative">
                              <div className="aspect-w-1 aspect-h-1 rounded-md overflow-hidden bg-gray-100">
                                <img
                                  src={item.image_url || '/images/product-placeholder.jpg'}
                                  alt={item.name}
                                  className="object-center object-cover group-hover:opacity-75"
                                />
                              </div>
                              <div className="mt-4 flex justify-between">
                                <div>
                                  <h3 className="text-sm text-gray-700 font-medium">
                                    <a href={`/products/${item.id}`}>
                                      {item.name}
                                    </a>
                                  </h3>
                                  <p className="mt-1 text-sm text-amber-600">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                  </p>
                                </div>
                                <button className="text-red-600 hover:text-red-900">
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <p className="mt-2 text-gray-600">Bạn chưa có sản phẩm yêu thích nào</p>
                          <a href="/products" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500">
                            Khám phá sản phẩm
                          </a>
                        </div>
                      )}
                    </div>
                  } 
                />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;