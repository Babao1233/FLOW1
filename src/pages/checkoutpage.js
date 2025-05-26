import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';

const CheckoutPage = () => {
    const { cartItems, cartTotal, clearCart, showToast } = useContext(CartContext);
    const navigate = useNavigate();

    const [formData, setFormData] =useState({
        fullName: 'Khách Hàng Mẫu', // Pre-filled for demo
        email: 'customer@example.com', // Pre-filled for demo
        phone: '0987654321', // Pre-filled for demo
        province: 'TP. Hồ Chí Minh', // Pre-filled for demo
        district: 'Quận 1', // Pre-filled for demo
        ward: 'Phường Bến Nghé', // Pre-filled for demo
        addressDetail: '123 Đường Đồng Khởi', // Pre-filled for demo
        notes: '',
        paymentMethod: 'cod',
    });
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);

    // Redirect if cart is empty
    useEffect(() => {
        if (cartItems.length === 0 && !isProcessing) { // Check !isProcessing to prevent redirect during order simulation
            showToast('Giỏ hàng của bạn trống. Vui lòng thêm sản phẩm.', 'error');
            navigate('/cart');
        }
    }, [cartItems, navigate, showToast, isProcessing]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Họ tên không được để trống.';
        if (!formData.email.trim()) {
            newErrors.email = 'Email không được để trống.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ.';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Số điện thoại không được để trống.';
        } else if (!/^\d{10,11}$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ (10-11 chữ số).';
        }
        if (!formData.province.trim()) newErrors.province = 'Tỉnh/Thành phố không được để trống.';
        if (!formData.district.trim()) newErrors.district = 'Quận/Huyện không được để trống.';
        if (!formData.ward.trim()) newErrors.ward = 'Phường/Xã không được để trống.';
        if (!formData.addressDetail.trim()) newErrors.addressDetail = 'Địa chỉ chi tiết không được để trống.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (cartItems.length === 0) {
             showToast('Giỏ hàng trống. Không thể đặt hàng.', 'error');
             return;
        }
        if (validateForm()) {
            setIsProcessing(true);
            showToast('Đang xử lý đơn hàng của bạn...', 'info');
            const mockOrderData = {
                orderId: `JSL-${Date.now().toString().slice(-6)}`,
                customerName: formData.fullName,
                shippingAddress: `${formData.addressDetail}, ${formData.ward}, ${formData.district}, ${formData.province}`,
                items: cartItems,
                totalAmount: cartTotal,
                paymentMethod: formData.paymentMethod,
            };
            console.log('Simulating Order Submission:', mockOrderData);

            setTimeout(() => {
                clearCart();
                showToast('Đặt hàng thành công!', 'success');
                navigate('/order-confirmation', { state: { order: mockOrderData } });
                setIsProcessing(false);
            }, 2500);
        } else {
            showToast('Vui lòng kiểm tra lại thông tin đơn hàng.', 'error');
        }
    };

     const renderOrderSummaryItems = () => {
         if (cartItems.length === 0) {
             return <p className="text-center text-gray-500 dark:text-gray-400 py-4">Giỏ hàng của bạn trống.</p>;
         }
         return cartItems.map(item => (
             <div key={item.id} className="flex justify-between items-center text-gray-600 dark:text-gray-300 text-sm py-1.5">
                 <span className="truncate w-2/3">{item.name} <span className="text-xs text-gray-500 dark:text-gray-400">(x{item.quantity})</span></span>
                 <span className="font-medium">${((item.salePrice || item.price) * item.quantity).toFixed(2)}</span>
             </div>
         ));
     };

    const commonInputClasses = "form-input text-sm py-2.5 px-3.5";
    const commonTextareaClasses = "form-textarea text-sm py-2.5 px-3.5";
    const errorInputClasses = "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500";
    const normalInputClasses = "border-gray-300 dark:border-gray-600 focus:ring-primary focus:border-primary";

    return (
        <div className="bg-gray-50 dark:bg-gray-900 py-8 md:py-12">
             <div className="container mx-auto px-4">
                 <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Thanh Toán</h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <section className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 md:p-8">
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Thông tin giao hàng</h2>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="fullName" className="form-label">Họ và tên người nhận<span className="text-red-500">*</span></label>
                                <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} className={`${commonInputClasses} ${errors.fullName ? errorInputClasses : normalInputClasses}`} placeholder="Nguyễn Văn A" />
                                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="email" className="form-label">Email<span className="text-red-500">*</span></label>
                                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className={`${commonInputClasses} ${errors.email ? errorInputClasses : normalInputClasses}`} placeholder="email@example.com" />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                                <div>
                                    <label htmlFor="phone" className="form-label">Số điện thoại<span className="text-red-500">*</span></label>
                                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className={`${commonInputClasses} ${errors.phone ? errorInputClasses : normalInputClasses}`} placeholder="09xxxxxxxx" />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label htmlFor="province" className="form-label">Tỉnh/Thành phố<span className="text-red-500">*</span></label>
                                    <input type="text" id="province" name="province" value={formData.province} onChange={handleInputChange} className={`${commonInputClasses} ${errors.province ? errorInputClasses : normalInputClasses}`} placeholder="TP. Hồ Chí Minh" />
                                     {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
                                </div>
                                <div>
                                    <label htmlFor="district" className="form-label">Quận/Huyện<span className="text-red-500">*</span></label>
                                    <input type="text" id="district" name="district" value={formData.district} onChange={handleInputChange} className={`${commonInputClasses} ${errors.district ? errorInputClasses : normalInputClasses}`} placeholder="Quận 1" />
                                    {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                                </div>
                                <div>
                                     <label htmlFor="ward" className="form-label">Phường/Xã<span className="text-red-500">*</span></label>
                                    <input type="text" id="ward" name="ward" value={formData.ward} onChange={handleInputChange} className={`${commonInputClasses} ${errors.ward ? errorInputClasses : normalInputClasses}`} placeholder="Phường Bến Nghé" />
                                    {errors.ward && <p className="text-red-500 text-xs mt-1">{errors.ward}</p>}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="addressDetail" className="form-label">Địa chỉ chi tiết (Số nhà, tên đường)<span className="text-red-500">*</span></label>
                                <textarea id="addressDetail" name="addressDetail" rows="3" value={formData.addressDetail} onChange={handleInputChange} className={`${commonTextareaClasses} ${errors.addressDetail ? errorInputClasses : normalInputClasses}`} placeholder="123 Đường Đồng Khởi"></textarea>
                                {errors.addressDetail && <p className="text-red-500 text-xs mt-1">{errors.addressDetail}</p>}
                            </div>
                            <div>
                                <label htmlFor="notes" className="form-label">Ghi chú (Tùy chọn)</label>
                                <textarea id="notes" name="notes" rows="2" value={formData.notes} onChange={handleInputChange} className={`${commonTextareaClasses} ${normalInputClasses}`} placeholder="Giao hàng giờ hành chính..."></textarea>
                            </div>
                        </div>
                         <style jsx="true">{`
                            .form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #4b5563; margin-bottom: 0.25rem; }
                            .dark .form-label { color: #d1d5db; }
                            .form-input, .form-textarea { display: block; width: 100%; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; background-color: #ffffff; color: #1f2937; }
                            .dark .form-input, .dark .form-textarea { background-color: #374151; color: #f9fafb; border-color: #4b5563; }
                            .form-input:focus, .form-textarea:focus { outline: none; ring-width: 2px; }
                            .form-radio-label { display: flex; align-items: center; padding: 0.75rem 1rem; border-width: 1px; border-radius: 0.375rem; cursor: pointer; transition: all 0.15s ease-in-out; background-color: #ffffff; color: #1f2937; }
                            .dark .form-radio-label { background-color: #374151; color: #f9fafb; }
                            .form-radio-label:hover { border-color: #EF4444; } /* primary */
                            .form-radio-label.selected { border-color: #EF4444; /* primary */ box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.4); }
                            .dark .form-radio-label.selected { border-color: #F97316; box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.4); } /* secondary for dark */
                            .form-radio { margin-right: 0.75rem; color: #EF4444; /* primary */ background-color: #ffffff; border-color: #d1d5db; cursor: pointer; flex-shrink: 0; margin-top: 0.1rem; }
                            .dark .form-radio { background-color: #4b5563; border-color: #6b7280; color: #F97316; } /* secondary for dark */
                            .form-radio:focus { outline: none; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2); }
                         `}</style>
                    </section>

                    <section className="lg:col-span-1 space-y-8 sticky top-24"> {/* sticky top-24 for header height clearance */}
                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 md:p-8">
                            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Tóm tắt đơn hàng</h2>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 mb-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                                {renderOrderSummaryItems()}
                            </div>
                            <hr className="border-gray-200 dark:border-gray-700 my-3"/>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center font-medium text-gray-700 dark:text-gray-300">
                                    <span>Tạm tính</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center font-medium text-gray-700 dark:text-gray-300">
                                    <span>Phí vận chuyển</span>
                                    <span>Miễn phí</span>
                                </div>
                                <hr className="border-gray-200 dark:border-gray-700 my-3"/>
                                <div className="flex justify-between items-center text-lg font-bold text-gray-800 dark:text-white">
                                    <span>Tổng cộng</span>
                                    <span className="text-primary dark:text-secondary">${cartTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 md:p-8">
                            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Phương thức thanh toán</h2>
                            <div className="space-y-4">
                                <label className={`form-radio-label ${formData.paymentMethod === 'cod' ? 'selected' : ''} border-gray-300 dark:border-gray-600`}>
                                    <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="form-radio" />
                                    <div className="flex-grow">
                                        <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Trả tiền mặt khi nhận được hàng.</p>
                                    </div>
                                </label>
                                <label className={`form-radio-label ${formData.paymentMethod === 'card' ? 'selected' : ''} border-gray-300 dark:border-gray-600`}>
                                    <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={handleInputChange} className="form-radio" />
                                    <div className="flex-grow">
                                        <span className="font-medium">Thẻ Tín dụng/Ghi nợ (Demo)</span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Thanh toán an toàn (giả lập).</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button type="submit" className={`w-full bg-primary hover:bg-red-600 dark:bg-secondary dark:hover:bg-orange-600 text-white font-semibold py-3.5 px-6 rounded-lg text-center transition-colors duration-300 text-base shadow-md hover:shadow-lg ${isProcessing || cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isProcessing || cartItems.length === 0}>
                            {isProcessing ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2"></i> Đang xử lý...
                                </>
                            ) : 'Hoàn Tất Đơn Hàng'}
                        </button>
                         <p className="text-center mt-4">
                            <Link to="/cart" className="text-sm text-primary dark:text-secondary hover:underline">
                                <i className="fas fa-arrow-left mr-1"></i> Quay lại giỏ hàng
                            </Link>
                         </p>
                    </section>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
