import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Loading from '../ui/Loading';

/**
 * Component kiểm tra tính tương thích với các trình duyệt
 * Giúp phát hiện vấn đề UX trên các trình duyệt và thiết bị khác nhau
 */
const BrowserCompatibilityTester = () => {
  const [browserInfo, setBrowserInfo] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [featuresSupport, setFeaturesSupport] = useState({});
  const [cssPropertiesSupport, setCssPropertiesSupport] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [simulatingDevice, setSimulatingDevice] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [exportingData, setExportingData] = useState(false);

  // Lấy màu badge dựa trên tên trình duyệt
  const getBrowserBadgeColor = (browserName) => {
    const name = browserName.toLowerCase();
    if (name.includes('chrome')) return 'bg-green-100 text-green-800';
    if (name.includes('firefox')) return 'bg-orange-100 text-orange-800';
    if (name.includes('safari')) return 'bg-blue-100 text-blue-800';
    if (name.includes('edge')) return 'bg-indigo-100 text-indigo-800';
    if (name.includes('opera')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  // Tải lịch sử kiểm tra từ localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('uxTestHistory');
      if (savedHistory) {
        setTestHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Không thể đọc lịch sử kiểm tra:', error);
    }
  }, []);

  // Phát hiện thông tin trình duyệt và thiết bị
  useEffect(() => {
    setLoading(true);
    
    // Phát hiện trình duyệt
    const detectBrowser = () => {
      const userAgent = navigator.userAgent;
      let browserName = "Unknown";
      let browserVersion = "Unknown";
      
      if (userAgent.match(/chrome|chromium|crios/i)) {
        browserName = "Chrome";
        const match = userAgent.match(/(?:chrome|chromium|crios)\/([0-9]+)/i);
        browserVersion = match ? match[1] : "Unknown";
      } else if (userAgent.match(/firefox|fxios/i)) {
        browserName = "Firefox";
        const match = userAgent.match(/(?:firefox|fxios)\/([0-9]+)/i);
        browserVersion = match ? match[1] : "Unknown";
      } else if (userAgent.match(/safari/i)) {
        browserName = "Safari";
        const match = userAgent.match(/(?:safari)\/([0-9]+)/i);
        browserVersion = match ? match[1] : "Unknown";
      } else if (userAgent.match(/opr\//i) || userAgent.match(/opera/i)) {
        browserName = "Opera";
        const match = userAgent.match(/(?:opr|opera)\/([0-9]+)/i);
        browserVersion = match ? match[1] : "Unknown";
      } else if (userAgent.match(/edg/i)) {
        browserName = "Edge";
        const match = userAgent.match(/(?:edg)\/([0-9]+)/i);
        browserVersion = match ? match[1] : "Unknown";
      } else if (userAgent.match(/trident/i) || userAgent.match(/msie/i)) {
        browserName = "Internet Explorer";
        const match = userAgent.match(/(?:trident|msie)\/([0-9]+)/i);
        browserVersion = match ? match[1] : "Unknown";
      }
      
      return {
        name: browserName,
        version: browserVersion,
        userAgent: userAgent,
        language: navigator.language,
        platform: navigator.platform,
        vendor: navigator.vendor
      };
    };
    
    // Phát hiện thiết bị
    const detectDevice = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent);
      
      return {
        type: isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop",
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio,
        orientation: window.innerWidth > window.innerHeight ? "Landscape" : "Portrait",
        touchScreen: 'ontouchstart' in window || navigator.maxTouchPoints > 0
      };
    };
    
    // Kiểm tra tính năng được hỗ trợ
    const detectFeatureSupport = () => {
      return {
        flexbox: typeof document.createElement('div').style.flexBasis !== 'undefined',
        grid: typeof document.createElement('div').style.grid !== 'undefined',
        webp: false, // Cần kiểm tra đặc biệt
        webgl: (() => {
          try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
          } catch (e) {
            return false;
          }
        })(),
        webanimation: typeof document.createElement('div').animate === 'function',
        serviceWorker: 'serviceWorker' in navigator,
        localStorage: (() => {
          try {
            return 'localStorage' in window && window.localStorage !== null;
          } catch (e) {
            return false;
          }
        })(),
        sessionStorage: (() => {
          try {
            return 'sessionStorage' in window && window.sessionStorage !== null;
          } catch (e) {
            return false;
          }
        })()
      };
    };
    
    // Kiểm tra thuộc tính CSS được hỗ trợ
    const detectCssSupport = () => {
      const div = document.createElement('div');
      return {
        gridLayout: 'grid' in div.style,
        flexbox: 'flexBasis' in div.style || 'WebkitFlexBasis' in div.style,
        animation: 'animation' in div.style || 'WebkitAnimation' in div.style,
        transform: 'transform' in div.style || 'WebkitTransform' in div.style,
        transition: 'transition' in div.style || 'WebkitTransition' in div.style,
        borderRadius: 'borderRadius' in div.style || 'WebkitBorderRadius' in div.style
      };
    };
    
    // Đo hiệu suất cơ bản
    const measurePerformance = () => {
      const perfData = window.performance && window.performance.timing;
      
      if (!perfData) {
        return {
          supported: false,
          message: 'Performance API không được hỗ trợ trên trình duyệt này'
        };
      }
      
      return {
        supported: true,
        loadTime: perfData.loadEventEnd - perfData.navigationStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        firstPaint: perfData.responseEnd - perfData.navigationStart,
        backendPerformance: perfData.responseEnd - perfData.requestStart
      };
    };
    
    // Thu thập tất cả thông tin
    setBrowserInfo(detectBrowser());
    setDeviceInfo(detectDevice());
    setFeaturesSupport(detectFeatureSupport());
    setCssPropertiesSupport(detectCssSupport());
    setPerformanceMetrics(measurePerformance());
    setLoading(false);
  }, []);
  
  // Danh sách các thiết bị phổ biến để mô phỏng
  const popularDevices = [
    { 
      name: 'iPhone 12/13', 
      width: 390, 
      height: 844, 
      pixelRatio: 3,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      isMobile: true
    },
    { 
      name: 'Samsung Galaxy S21', 
      width: 360, 
      height: 800, 
      pixelRatio: 3,
      userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.85 Mobile Safari/537.36',
      isMobile: true
    },
    { 
      name: 'iPad Pro', 
      width: 1024, 
      height: 1366, 
      pixelRatio: 2,
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      isTablet: true
    },
    { 
      name: 'MacBook Pro 13"', 
      width: 1440, 
      height: 900, 
      pixelRatio: 2,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
      isDesktop: true
    },
    { 
      name: 'Windows Laptop (1080p)', 
      width: 1920, 
      height: 1080, 
      pixelRatio: 1,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.85 Safari/537.36',
      isDesktop: true
    }
  ];
  
  // Mô phỏng thiết bị
  const simulateDevice = (device) => {
    setSimulatingDevice(true);
    setSelectedDevice(device);
    
    // Ghi đè thông tin thiết bị với thiết bị đã chọn
    const simulatedDeviceInfo = {
      ...deviceInfo,
      type: device.isTablet ? 'Tablet' : device.isMobile ? 'Mobile' : 'Desktop',
      width: device.width,
      height: device.height,
      pixelRatio: device.pixelRatio,
      orientation: device.width > device.height ? 'Landscape' : 'Portrait',
      touchScreen: device.isMobile || device.isTablet,
      isSimulated: true,
      simulatedName: device.name
    };
    
    setDeviceInfo(simulatedDeviceInfo);
    
    // Đặt lại kết quả kiểm tra
    setTestResults([]);
    setShowReport(false);
  };
  
  // Lưu kết quả kiểm tra
  const saveTestResults = () => {
    if (testResults.length === 0) return;
    
    const timestamp = new Date().toISOString();
    const newHistoryEntry = {
      id: `test-${timestamp}`,
      timestamp,
      device: deviceInfo,
      browser: browserInfo,
      results: testResults,
      performance: performanceMetrics
    };
    
    // Thêm vào lịch sử kiểm tra
    const updatedHistory = [...testHistory, newHistoryEntry];
    setTestHistory(updatedHistory);
    
    // Lưu vào localStorage để tham khảo sau
    try {
      localStorage.setItem('uxTestHistory', JSON.stringify(updatedHistory));
      return true;
    } catch (err) {
      console.error('Không thể lưu kết quả kiểm tra:', err);
      return false;
    }
  };
  
  // Xuất dữ liệu kiểm tra
  const exportTestData = () => {
    setExportingData(true);
    
    try {
      const dataToExport = {
        timestamp: new Date().toISOString(),
        device: deviceInfo,
        browser: browserInfo,
        features: featuresSupport,
        cssProperties: cssPropertiesSupport,
        performance: performanceMetrics,
        testResults: testResults
      };
      
      // Tạo file JSON
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      // Tạo phần tử tải xuống
      const exportFileDefaultName = `ux-test-${new Date().toISOString().slice(0,10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      return true;
    } catch (err) {
      console.error('Không thể xuất dữ liệu kiểm tra:', err);
      return false;
    } finally {
      setExportingData(false);
    }
  };

  // Chạy kiểm tra UX
  const runUXTests = () => {
    setLoading(true);
    
    const tests = [
      {
        name: 'Animation Smoothness',
        test: () => {
          // Kiểm tra các hiệu ứng animation có mượt không
          const isAnimationSupported = featuresSupport.webanimation && cssPropertiesSupport.animation;
          const isSmoothEnough = !deviceInfo.isMobile || (deviceInfo.isMobile && deviceInfo.pixelRatio >= 2);
          
          return {
            passed: isAnimationSupported && isSmoothEnough,
            message: isAnimationSupported 
              ? (isSmoothEnough ? 'Animation hiển thị mượt mà' : 'Animation có thể không mượt trên thiết bị này')
              : 'Animation không được hỗ trợ đầy đủ'
          };
        }
      },
      {
        name: 'Responsive Layout',
        test: () => {
          // Kiểm tra layout responsive
          const isFlexboxSupported = cssPropertiesSupport.flexbox;
          const isScreenSizeAdequate = deviceInfo.width >= 320; // Kích thước tối thiểu
          
          return {
            passed: isFlexboxSupported && isScreenSizeAdequate,
            message: isFlexboxSupported 
              ? (isScreenSizeAdequate ? 'Layout responsive hoạt động tốt' : 'Màn hình quá nhỏ cho layout responsive')
              : 'Flexbox không được hỗ trợ đầy đủ, có thể ảnh hưởng đến layout'
          };
        }
      },
      {
        name: 'Touch Interaction',
        test: () => {
          // Kiểm tra tương tác cảm ứng
          const isTouchSupported = deviceInfo.touchScreen;
          const hasAdequateScreenSize = deviceInfo.width >= 320 && deviceInfo.height >= 480;
          
          return {
            passed: !deviceInfo.isMobile || (isTouchSupported && hasAdequateScreenSize),
            message: deviceInfo.isMobile
              ? (isTouchSupported ? 'Tương tác cảm ứng hoạt động tốt' : 'Tương tác cảm ứng có thể không hoạt động tốt')
              : 'Không áp dụng cho thiết bị desktop'
          };
        }
      },
      {
        name: 'Performance Check',
        test: () => {
          // Kiểm tra hiệu suất
          if (!performanceMetrics.supported) {
            return {
              passed: null,
              message: 'Không thể đo hiệu suất trên trình duyệt này'
            };
          }
          
          const isLoadTimeFast = performanceMetrics.loadTime < 3000; // Dưới 3 giây
          
          return {
            passed: isLoadTimeFast,
            message: isLoadTimeFast 
              ? 'Thời gian tải trang chấp nhận được' 
              : 'Thời gian tải trang quá chậm, cần tối ưu hóa'
          };
        }
      },
      {
        name: 'CSS Features',
        test: () => {
          // Kiểm tra tính năng CSS mới
          const allFeaturesSupported = 
            cssPropertiesSupport.gridLayout && 
            cssPropertiesSupport.flexbox && 
            cssPropertiesSupport.animation &&
            cssPropertiesSupport.transform &&
            cssPropertiesSupport.transition;
          
          return {
            passed: allFeaturesSupported,
            message: allFeaturesSupported 
              ? 'Tất cả tính năng CSS hiện đại được hỗ trợ' 
              : 'Một số tính năng CSS hiện đại không được hỗ trợ, UI có thể hiển thị khác'
          };
        }
      },
      {
        name: 'Modern Browser',
        test: () => {
          // Kiểm tra trình duyệt hiện đại
          const isModernBrowser = 
            (browserInfo.name === 'Chrome' && parseInt(browserInfo.version) >= 70) ||
            (browserInfo.name === 'Firefox' && parseInt(browserInfo.version) >= 65) ||
            (browserInfo.name === 'Safari' && parseInt(browserInfo.version) >= 12) ||
            (browserInfo.name === 'Edge' && parseInt(browserInfo.version) >= 79);
          
          return {
            passed: isModernBrowser,
            message: isModernBrowser 
              ? 'Trình duyệt hiện đại, hỗ trợ tốt các tính năng web mới' 
              : 'Trình duyệt cũ, có thể không hỗ trợ đầy đủ các tính năng web mới'
          };
        }
      }
    ];
    
    // Thực hiện các bài kiểm tra
    const results = tests.map(test => {
      const result = test.test();
      return {
        name: test.name,
        passed: result.passed,
        message: result.message
      };
    });
    
    setTestResults(results);
    setShowReport(true);
    setLoading(false);
  };
  
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Công cụ kiểm tra UX đa nền tảng</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loading size="lg" color="primary" text="Đang phân tích thiết bị..." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-800">Thông tin trình duyệt</h3>
                {browserInfo && (
                  <span className={`px-2 py-1 text-xs rounded-full ${getBrowserBadgeColor(browserInfo.name)}`}>
                    {browserInfo.name}
                  </span>
                )}
              </div>
              {browserInfo && (
                <ul className="space-y-1 text-sm">
                  <li><span className="font-semibold">Tên:</span> {browserInfo.name}</li>
                  <li><span className="font-semibold">Phiên bản:</span> {browserInfo.version}</li>
                  <li><span className="font-semibold">Nền tảng:</span> {browserInfo.platform}</li>
                  <li><span className="font-semibold">Ngôn ngữ:</span> {browserInfo.language}</li>
                </ul>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-800">Thông tin thiết bị</h3>
                {deviceInfo && deviceInfo.isSimulated && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    Đang mô phỏng: {deviceInfo.simulatedName}
                  </span>
                )}
              </div>
              {deviceInfo && (
                <ul className="space-y-1 text-sm">
                  <li><span className="font-semibold">Loại:</span> {deviceInfo.type}</li>
                  <li><span className="font-semibold">Kích thước màn hình:</span> {deviceInfo.width} x {deviceInfo.height}px</li>
                  <li><span className="font-semibold">Tỉ lệ pixel:</span> {deviceInfo.pixelRatio}</li>
                  <li><span className="font-semibold">Hướng màn hình:</span> {deviceInfo.orientation}</li>
                  <li><span className="font-semibold">Màn hình cảm ứng:</span> {deviceInfo.touchScreen ? 'Có' : 'Không'}</li>
                </ul>
              )}
            </div>
          </div>

          {/* Phần mô phỏng thiết bị */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
              Mô phỏng thiết bị khác
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Chọn một thiết bị để mô phỏng và kiểm tra giao diện người dùng trên thiết bị đó
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {popularDevices.map((device, index) => (
                <div 
                  key={index}
                  className={`
                    border rounded-md p-2 text-center cursor-pointer transition-colors
                    ${selectedDevice && selectedDevice.name === device.name 
                      ? 'bg-amber-100 border-amber-300 text-amber-700' 
                      : 'border-gray-300 hover:bg-gray-50'}
                  `}
                  onClick={() => simulateDevice(device)}
                >
                  <div className="text-xs font-medium mb-1">{device.name}</div>
                  <div className="text-xs text-gray-500">{device.width}x{device.height}</div>
                </div>
              ))}
            </div>
            
            {simulatingDevice && selectedDevice && (
              <div className="mt-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSimulatingDevice(false);
                    setSelectedDevice(null);
                    // Khôi phục thông tin thiết bị thực tế
                    setDeviceInfo({
                      type: window.innerWidth <= 768 ? 'Mobile' : 'Desktop',
                      width: window.innerWidth,
                      height: window.innerHeight,
                      pixelRatio: window.devicePixelRatio,
                      orientation: window.innerWidth > window.innerHeight ? 'Landscape' : 'Portrait',
                      touchScreen: 'ontouchstart' in window || navigator.maxTouchPoints > 0
                    });
                    // Đặt lại kết quả kiểm tra
                    setTestResults([]);
                    setShowReport(false);
                  }}
                >
                  Hủy mô phỏng
                </Button>
              </div>
            )}
          </div>
          
          <div className="mb-6 flex flex-wrap gap-2">
            <Button 
              onClick={runUXTests}
              variant="primary"
              className="w-full sm:w-auto"
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
              }
            >
              Chạy kiểm tra UX
            </Button>
            
            {testResults.length > 0 && (
              <>
                <Button 
                  onClick={saveTestResults}
                  variant="outline"
                  className="w-full sm:w-auto"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                    </svg>
                  }
                >
                  Lưu kết quả
                </Button>
                
                <Button 
                  onClick={exportTestData}
                  variant="outline"
                  className="w-full sm:w-auto"
                  loading={exportingData}
                  loadingText="Đang xuất..."
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  }
                >
                  Xuất báo cáo
                </Button>
              </>
            )}
          </div>
          
          {showReport && (
            <div className="animate-fadeIn">
              <h3 className="font-medium text-gray-800 mb-3">Kết quả kiểm tra UX</h3>
              
              <div className="space-y-4 mb-6">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-md overflow-hidden">
                    <div className={`flex items-center justify-between px-4 py-3 ${
                      result.passed === null
                        ? 'bg-gray-100'
                        : result.passed
                          ? 'bg-green-50'
                          : 'bg-red-50'
                    }`}>
                      <div className="flex items-center">
                        {result.passed === null ? (
                          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        ) : result.passed ? (
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        )}
                        <span className="font-medium">{result.name}</span>
                      </div>
                      <span className={`text-sm ${
                        result.passed === null
                          ? 'text-gray-500'
                          : result.passed
                            ? 'text-green-600'
                            : 'text-red-600'
                      }`}>
                        {result.passed === null ? 'Không áp dụng' : result.passed ? 'Đạt' : 'Không đạt'}
                      </span>
                    </div>
                    <div className="px-4 py-3 text-sm text-gray-600 bg-white">
                      {result.message}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <Alert
                  type={testResults.every(r => r.passed === null || r.passed) ? 'success' : 'warning'}
                  message={
                    testResults.every(r => r.passed === null || r.passed)
                      ? 'Trang web hoạt động tốt trên thiết bị và trình duyệt này!'
                      : 'Trang web có thể gặp một số vấn đề trên thiết bị và trình duyệt này. Vui lòng xem chi tiết kết quả bên trên.'
                  }
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowserCompatibilityTester;
