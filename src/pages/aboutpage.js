import React from 'react';

const AboutPage = () => {
  return (
    <div className="bg-white dark:bg-gray-900 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary dark:text-secondary mb-4">Về Yapee Vietnam</h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Nâng tầm chất lượng cuộc sống của bạn với các giải pháp gia dụng thông minh, tiện lợi và phong cách.
          </p>
        </header>

        <section className="mb-12 md:mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img 
                src="https://placehold.co/800x600/e2e8f0/334155?text=Yapee+Team" 
                alt="Đội ngũ Yapee" 
                className="rounded-xl shadow-xl w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
            <div className="prose dark:prose-invert lg:prose-lg max-w-none text-gray-700 dark:text-gray-300">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white mb-4">Sứ Mệnh Của Chúng Tôi</h2>
              <p>
                Tại Yapee, chúng tôi tin rằng công nghệ có thể làm cho cuộc sống hàng ngày trở nên đơn giản, thoải mái và thú vị hơn. Sứ mệnh của chúng tôi là mang đến những sản phẩm gia dụng thông minh, chất lượng cao với thiết kế tinh tế, giúp bạn tạo ra một không gian sống lý tưởng.
              </p>
              <p>
                Chúng tôi không ngừng nghiên cứu và phát triển để đổi mới, từ những chiếc quạt mini tiện dụng, máy tạo ẩm thông minh cho đến các thiết bị lọc không khí tiên tiến. Mỗi sản phẩm đều được chăm chút tỉ mỉ từ khâu thiết kế đến sản xuất, đảm bảo đáp ứng nhu cầu và vượt trên cả sự mong đợi của khách hàng.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12 md:mb-16 bg-gray-50 dark:bg-gray-800 p-8 md:p-12 rounded-xl shadow-lg">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white mb-6 text-center">Giá Trị Cốt Lõi</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <i className="fas fa-lightbulb fa-3x text-primary dark:text-secondary mb-4"></i>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Đổi Mới Sáng Tạo</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Luôn tiên phong áp dụng công nghệ mới để tạo ra sản phẩm ưu việt.</p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <i className="fas fa-check-circle fa-3x text-primary dark:text-secondary mb-4"></i>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Chất Lượng Vượt Trội</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Cam kết chất lượng sản phẩm và dịch vụ ở mức cao nhất.</p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <i className="fas fa-users fa-3x text-primary dark:text-secondary mb-4"></i>
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">Khách Hàng Là Trung Tâm</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Lắng nghe và đáp ứng nhu cầu của khách hàng một cách tốt nhất.</p>
            </div>
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white mb-6">Gặp Gỡ Đội Ngũ</h2>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Chúng tôi là một đội ngũ đam mê, tận tâm, luôn nỗ lực để mang đến những trải nghiệm tốt nhất cho bạn.
          </p>
          {/* Placeholder for team members or further info */}
          <img 
            src="https://placehold.co/1200x400/cbd5e1/475569?text=Our+Awesome+Team+Working" 
            alt="Đội ngũ Yapee đang làm việc" 
            className="rounded-xl shadow-lg w-full h-auto object-cover"
            loading="lazy"
          />
        </section>
      </div>
    </div>
  );
};

export default AboutPage;

