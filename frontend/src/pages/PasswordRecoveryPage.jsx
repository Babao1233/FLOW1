import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Trang khôi phục mật khẩu
 * Cho phép người dùng yêu cầu đặt lại mật khẩu thông qua email
 */
const PasswordRecoveryPage = () => {
  const [step, setStep] = useState('request'); // 'request', 'verify', 'reset'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '' });
  
  // Xử lý khi gửi yêu cầu khôi phục mật khẩu
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra dữ liệu
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Địa chỉ email không hợp lệ';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Gọi API gửi email khôi phục
      // Mô phỏng việc gọi API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Chuyển sang bước xác thực mã
      setStep('verify');
    } catch (error) {
      console.error('Lỗi khi gửi yêu cầu khôi phục mật khẩu:', error);
      setErrors({
        general: 'Đã có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Xử lý khi gửi mã xác thực
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra dữ liệu
    const newErrors = {};
    if (!code) {
      newErrors.code = 'Vui lòng nhập mã xác thực';
    } else if (code.length !== 6) {
      newErrors.code = 'Mã xác thực không hợp lệ';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Gọi API xác thực mã
      // Mô phỏng việc gọi API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Chuyển sang bước đặt lại mật khẩu
      setStep('reset');
    } catch (error) {
      console.error('Lỗi khi xác thực mã:', error);
      setErrors({
        general: 'Mã xác thực không đúng hoặc đã hết hạn.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Kiểm tra độ mạnh mật khẩu
  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ score: 0, message: '' });
      return;
    }
    
    let score = 0;
    let message = '';
    
    // Độ dài
    if (password.length >= 8) score++;
    
    // Chữ hoa
    if (/[A-Z]/.test(password)) score++;
    
    // Chữ thường
    if (/[a-z]/.test(password)) score++;
    
    // Số
    if (/[0-9]/.test(password)) score++;
    
    // Ký tự đặc biệt
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    // Đánh giá độ mạnh
    if (score <= 2) {
      message = 'Yếu';
    } else if (score <= 3) {
      message = 'Trung bình';
    } else {
      message = 'Mạnh';
    }
    
    setPasswordStrength({ score, message });
  };
  
  // Xử lý khi đặt lại mật khẩu
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra dữ liệu
    const newErrors = {};
    
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu mới';
    } else if (password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường và một chữ số';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Gọi API đặt lại mật khẩu
      // Mô phỏng việc gọi API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Chuyển hướng đến trang đăng nhập
      window.location.href = '/login?reset=success';
    } catch (error) {
      console.error('Lỗi khi đặt lại mật khẩu:', error);
      setErrors({
        general: 'Đã có lỗi xảy ra khi đặt lại mật khẩu. Vui lòng thử lại sau.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Hiển thị màu thanh độ mạnh mật khẩu
  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-red-500';
    if (passwordStrength.score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/">
          <img
            className="mx-auto h-16 w-auto"
            src="/images/logo.png"
            alt="Yapee Vietnam"
          />
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Khôi phục mật khẩu
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Thông báo lỗi chung */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {errors.general}
            </div>
          )}
          
          {/* Bước 1: Gửi yêu cầu khôi phục */}
          {step === 'request' && (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Nhập địa chỉ email đã đăng ký của bạn và chúng tôi sẽ gửi cho bạn một mã xác thực để đặt lại mật khẩu.
              </p>
              
              <form className="space-y-6" onSubmit={handleRequestSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Địa chỉ email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="example@email.com"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isSubmitting
                        ? 'bg-amber-400 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
                    }`}
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Gửi mã xác thực'}
                  </button>
                </div>
              </form>
            </>
          )}
          
          {/* Bước 2: Xác thực mã */}
          {step === 'verify' && (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Chúng tôi đã gửi một mã xác thực đến email <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến và nhập mã xác thực vào bên dưới.
              </p>
              
              <form className="space-y-6" onSubmit={handleVerifySubmit}>
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Mã xác thực
                  </label>
                  <div className="mt-1">
                    <input
                      id="code"
                      name="code"
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                        errors.code ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nhập mã 6 chữ số"
                      maxLength={6}
                    />
                    {errors.code && (
                      <p className="mt-2 text-sm text-red-600">{errors.code}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('request')}
                    className="text-sm font-medium text-amber-600 hover:text-amber-500"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    className="text-sm font-medium text-amber-600 hover:text-amber-500"
                    onClick={() => {
                      // Gửi lại mã
                      alert('Đã gửi lại mã xác thực mới.');
                    }}
                  >
                    Gửi lại mã
                  </button>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isSubmitting
                        ? 'bg-amber-400 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
                    }`}
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Xác thực'}
                  </button>
                </div>
              </form>
            </>
          )}
          
          {/* Bước 3: Đặt lại mật khẩu */}
          {step === 'reset' && (
            <>
              <p className="text-sm text-gray-600 mb-6">
                Vui lòng nhập mật khẩu mới của bạn.
              </p>
              
              <form className="space-y-6" onSubmit={handleResetSubmit}>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mật khẩu mới
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        checkPasswordStrength(e.target.value);
                      }}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nhập mật khẩu mới"
                    />
                    {password && (
                      <div className="mt-2">
                        <div className="h-2 rounded-full overflow-hidden bg-gray-200">
                          <div 
                            className={`h-full ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          ></div>
                        </div>
                        <p className={`text-sm mt-1 ${
                          passwordStrength.score <= 2 ? 'text-red-600' : 
                          passwordStrength.score <= 3 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {passwordStrength.message}
                        </p>
                      </div>
                    )}
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Xác nhận mật khẩu mới
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      isSubmitting
                        ? 'bg-amber-400 cursor-not-allowed'
                        : 'bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
                    }`}
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                  </button>
                </div>
              </form>
            </>
          )}
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Hoặc</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <div>
                <Link
                  to="/login"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecoveryPage;