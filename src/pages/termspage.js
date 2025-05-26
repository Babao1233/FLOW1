import React from 'react';

// Basic placeholder component
const TermsPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto prose dark:prose-invert lg:prose-xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl">
        <h1 className="text-primary dark:text-secondary">Điều Khoản và Điều Kiện Sử Dụng</h1>
        
        <p>Chào mừng bạn đến với Yapee Vietnam! Vui lòng đọc kỹ các Điều Khoản và Điều Kiện này trước khi sử dụng trang web của chúng tôi.</p>

        <h2>1. Chấp Nhận Điều Khoản</h2>
        <p>Bằng việc truy cập hoặc sử dụng trang web này (sau đây gọi là "Dịch vụ"), bạn đồng ý bị ràng buộc bởi các Điều Khoản và Điều Kiện này. Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản, bạn không được phép truy cập Dịch vụ.</p>

        <h2>2. Thay Đổi Điều Khoản</h2>
        <p>Chúng tôi có quyền, theo quyết định riêng của mình, sửa đổi hoặc thay thế các Điều Khoản này bất cứ lúc nào. Nếu một bản sửa đổi là quan trọng, chúng tôi sẽ cố gắng cung cấp thông báo ít nhất 30 ngày trước khi bất kỳ điều khoản mới nào có hiệu lực. Điều gì cấu thành một thay đổi quan trọng sẽ được xác định theo quyết định riêng của chúng tôi.</p>

        <h2>3. Sử Dụng Dịch Vụ</h2>
        <p>Bạn đồng ý không sử dụng Dịch vụ cho bất kỳ mục đích bất hợp pháp nào hoặc theo bất kỳ cách nào có thể làm hỏng, vô hiệu hóa, quá tải hoặc làm suy yếu Dịch vụ hoặc can thiệp vào việc sử dụng và hưởng thụ Dịch vụ của bất kỳ bên nào khác.</p>
        
        <h2>4. Tài Khoản Người Dùng</h2>
        <p>Khi bạn tạo một tài khoản với chúng tôi, bạn phải cung cấp cho chúng tôi thông tin chính xác, đầy đủ và hiện tại tại mọi thời điểm. Việc không làm như vậy cấu thành vi phạm Điều Khoản, có thể dẫn đến việc chấm dứt ngay lập tức tài khoản của bạn trên Dịch vụ của chúng tôi.</p>
        
        <h2>5. Sở Hữu Trí Tuệ</h2>
        <p>Dịch vụ và nội dung gốc, các tính năng và chức năng của nó là và sẽ vẫn là tài sản độc quyền của Yapee Vietnam và các nhà cấp phép của nó. Dịch vụ được bảo vệ bởi bản quyền, nhãn hiệu và các luật khác của cả Việt Nam và các quốc gia nước ngoài.</p>

        <h2>6. Giới Hạn Trách Nhiệm</h2>
        <p>Trong mọi trường hợp, Yapee Vietnam, cũng như giám đốc, nhân viên, đối tác, đại lý, nhà cung cấp hoặc chi nhánh của Yapee Vietnam, sẽ không chịu trách nhiệm pháp lý cho bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, do hậu quả hoặc trừng phạt nào, bao gồm nhưng không giới hạn, mất lợi nhuận, dữ liệu, việc sử dụng, thiện chí, hoặc các tổn thất vô hình khác, phát sinh từ (i) việc bạn truy cập hoặc sử dụng hoặc không thể truy cập hoặc sử dụng Dịch vụ...</p>
        
        {/* Add more sections as needed */}

        <h2>7. Liên Hệ</h2>
        <p>Nếu bạn có bất kỳ câu hỏi nào về các Điều Khoản này, vui lòng liên hệ với chúng tôi qua trang <a href="/contact" className="text-primary dark:text-secondary hover:underline">Liên Hệ</a>.</p>
        
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
      </div>
    </div>
  );
};

export default TermsPage;

