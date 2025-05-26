import React, { useState, useContext } from 'react';
import { CartContext } from '../../contexts/CartContext'; // For showToast

const AccountProfile = () => {
    const { showToast } = useContext(CartContext);
    const [formData, setFormData] = useState({
        fullName: 'Khách Hàng Mẫu', // Mock initial data
        email: 'customer@example.com', // Mock initial data
        phone: '0987654321', // Mock initial data
        address: '123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh', // Mock initial data
    });
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Họ tên không được để trống.';
        if (!formData.email.trim()) {
            newErrors.email = 'Email không được để trống.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ.';
        }
        if (formData.phone && !/^\d{10,11}$/.test(formData.phone)) { // Phone is optional for profile, but validated if present
            newErrors.phone = 'Số điện thoại không hợp lệ (10-11 chữ số).';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            console.log('Simulating profile update:', formData);
            showToast('Thông tin cá nhân đã được cập nhật! (Demo)', 'success');
            setIsEditing(false); // Exit editing mode after successful save
        } else {
            showToast('Vui lòng kiểm tra lại thông tin.', 'error');
        }
    };
    
    const commonInputClasses = "w-full mt-1 p-2.5 border rounded-md text-sm";
    const errorInputClasses = "border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500";
    const normalInputClasses = "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-primary focus:border-primary";
    const disabledInputClasses = "bg-gray-100 dark:bg-gray-700/50 cursor-not-allowed";


    return (
        <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">Thông Tin Cá Nhân</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên<span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`${commonInputClasses} ${errors.fullName ? errorInputClasses : normalInputClasses} ${!isEditing ? disabledInputClasses : ''}`}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email<span className="text-red-500">*</span></label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`${commonInputClasses} ${errors.email ? errorInputClasses : normalInputClasses} ${!isEditing ? disabledInputClasses : ''}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Số điện thoại</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`${commonInputClasses} ${errors.phone ? errorInputClasses : normalInputClasses} ${!isEditing ? disabledInputClasses : ''}`}
                    />
                     {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Địa chỉ</label>
                    <textarea
                        id="address"
                        name="address"
                        rows="3"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`${commonInputClasses} ${normalInputClasses} ${!isEditing ? disabledInputClasses : ''}`}
                    ></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    {isEditing ? (
                        <>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 text-sm font-medium text-white bg-primary hover:bg-red-600 dark:bg-secondary dark:hover:bg-orange-600 rounded-lg transition"
                            >
                                Lưu Thay Đổi
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition"
                        >
                            <i className="fas fa-edit mr-2"></i>Chỉnh Sửa
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AccountProfile;
