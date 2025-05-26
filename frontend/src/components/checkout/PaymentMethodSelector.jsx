import React, { useState } from 'react';

/**
 * Component cho phép chọn phương thức thanh toán
 * Hỗ trợ các phương thức thanh toán phổ biến tại Việt Nam
 */
const PaymentMethodSelector = ({ selectedMethod, setSelectedMethod }) => {
  const [showBankList, setShowBankList] = useState(false);
  const [selectedBank, setSelectedBank] = useState('');

  // Danh sách phương thức thanh toán phổ biến tại Việt Nam
  const paymentMethods = [
    {
      id: 'cod',
      name: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán bằng tiền mặt khi nhận hàng',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'bank_transfer',
      name: 'Chuyển khoản ngân hàng',
      description: 'Chuyển khoản đến tài khoản ngân hàng của chúng tôi',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      id: 'momo',
      name: 'Ví MoMo',
      description: 'Thanh toán qua ví điện tử MoMo',
      icon: (
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#a50064">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-10c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zm-2 0c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z" />
        </svg>
      )
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      description: 'Thanh toán qua ví điện tử ZaloPay',
      icon: (
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0068ff">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-11H9v2h6v-2zm0 4H9v2h6v-2z" />
        </svg>
      )
    },
    {
      id: 'vnpay',
      name: 'VNPay',
      description: 'Thanh toán qua cổng thanh toán VNPay',
      icon: (
        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1a73e8">
          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
        </svg>
      )
    },
    {
      id: 'credit_card',
      name: 'Thẻ tín dụng/ghi nợ',
      description: 'Thanh toán bằng thẻ Visa, Mastercard, JCB',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    }
  ];

  // Danh sách ngân hàng Việt Nam (rút gọn)
  const banks = [
    { id: 'vcb', name: 'Vietcombank', logo: '/images/banks/vcb.png' },
    { id: 'tcb', name: 'Techcombank', logo: '/images/banks/tcb.png' },
    { id: 'acb', name: 'ACB', logo: '/images/banks/acb.png' },
    { id: 'bidv', name: 'BIDV', logo: '/images/banks/bidv.png' },
    { id: 'vib', name: 'VIB', logo: '/images/banks/vib.png' },
    { id: 'vp', name: 'VPBank', logo: '/images/banks/vpbank.png' },
    { id: 'mb', name: 'MB Bank', logo: '/images/banks/mbbank.png' },
    { id: 'tpb', name: 'TPBank', logo: '/images/banks/tpbank.png' },
    { id: 'scb', name: 'Sacombank', logo: '/images/banks/sacombank.png' },
    { id: 'ocb', name: 'OCB', logo: '/images/banks/ocb.png' },
  ];

  // Xử lý khi chọn phương thức thanh toán
  const handleSelectMethod = (methodId) => {
    setSelectedMethod(methodId);
    if (methodId === 'bank_transfer') {
      setShowBankList(true);
    } else {
      setShowBankList(false);
      setSelectedBank('');
    }
  };

  // Xử lý khi chọn ngân hàng
  const handleSelectBank = (bankId) => {
    setSelectedBank(bankId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
      
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div 
            key={method.id}
            className={`border rounded-md p-4 cursor-pointer transition-colors ${
              selectedMethod === method.id 
                ? 'border-amber-500 bg-amber-50' 
                : 'border-gray-300 hover:border-amber-400'
            }`}
            onClick={() => handleSelectMethod(method.id)}
          >
            <div className="flex items-center">
              <input
                type="radio"
                id={`payment-${method.id}`}
                name="paymentMethod"
                checked={selectedMethod === method.id}
                onChange={() => handleSelectMethod(method.id)}
                className="h-4 w-4 text-amber-600 border-gray-300 focus:ring-amber-500"
              />
              <div className="ml-3 flex items-center">
                <div className="mr-3 text-gray-600">
                  {method.icon}
                </div>
                <div>
                  <span className="font-medium">{method.name}</span>
                  <span className="block text-sm text-gray-600 mt-1">{method.description}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Danh sách ngân hàng (hiển thị khi chọn chuyển khoản) */}
      {showBankList && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h3 className="font-medium text-gray-700 mb-3">Chọn ngân hàng</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {banks.map((bank) => (
              <div 
                key={bank.id}
                className={`border rounded-md p-2 cursor-pointer flex flex-col items-center justify-center ${
                  selectedBank === bank.id 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-gray-300 hover:border-amber-400'
                }`}
                onClick={() => handleSelectBank(bank.id)}
              >
                {/* Placeholder cho logo ngân hàng */}
                <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center mb-2">
                  {bank.id.toUpperCase()}
                </div>
                <span className="text-xs text-center">{bank.name}</span>
              </div>
            ))}
          </div>
          
          {/* Thông tin tài khoản ngân hàng */}
          {selectedBank && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-700 mb-2">Thông tin chuyển khoản</h4>
              <p className="text-sm">Ngân hàng: <span className="font-medium">{banks.find(b => b.id === selectedBank)?.name}</span></p>
              <p className="text-sm mt-1">Số tài khoản: <span className="font-medium">0123456789</span></p>
              <p className="text-sm mt-1">Chủ tài khoản: <span className="font-medium">CÔNG TY TNHH YAPEE VIETNAM</span></p>
              <p className="text-sm mt-1">Chi nhánh: <span className="font-medium">Hồ Chí Minh</span></p>
              <p className="text-sm mt-3 text-gray-600">
                Nội dung chuyển khoản: <span className="font-medium">YAPEE [Số điện thoại]</span>
              </p>
              <div className="mt-3 text-sm text-gray-600">
                <p className="flex items-start">
                  <svg className="w-4 h-4 mr-1 mt-0.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Vui lòng chuyển khoản trong vòng 24 giờ sau khi đặt hàng. Đơn hàng sẽ được xử lý sau khi chúng tôi xác nhận thanh toán.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p className="flex items-center">
          <svg className="w-4 h-4 mr-1 text-amber-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Tất cả các giao dịch thanh toán đều được bảo mật và mã hóa
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;