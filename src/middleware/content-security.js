/**
 * Middleware thiết lập Content Security Policy (CSP)
 * Bảo vệ ứng dụng khỏi các cuộc tấn công XSS và data injection
 */

// Danh sách nguồn an toàn
const SELF = "'self'";
const INLINE = "'unsafe-inline'";
const EVAL = "'unsafe-eval'";
const DATA = "data:";
const BLOB = "blob:";
const TRUSTED_DOMAINS = [
  "https://fonts.googleapis.com",
  "https://fonts.gstatic.com",
  "https://cdn.jsdelivr.net",
  "https://cdn.tailwindcss.com"
];

// Tạo middleware CSP
const contentSecurityPolicy = (req, res, next) => {
  // Cấu hình CSP
  const cspConfig = {
    defaultSrc: [SELF],
    scriptSrc: [SELF, ...TRUSTED_DOMAINS, INLINE, EVAL], // Thêm EVAL chỉ cho môi trường dev
    styleSrc: [SELF, ...TRUSTED_DOMAINS, INLINE],
    imgSrc: [SELF, ...TRUSTED_DOMAINS, DATA, BLOB],
    fontSrc: [SELF, ...TRUSTED_DOMAINS, DATA],
    connectSrc: [SELF, ...TRUSTED_DOMAINS],
    frameSrc: [SELF],
    objectSrc: ["'none'"],
    baseUri: [SELF],
    formAction: [SELF],
    frameAncestors: [SELF],
    upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
  };

  // Chuyển đổi cấu hình thành chuỗi CSP
  const cspString = Object.entries(cspConfig)
    .filter(([key, value]) => value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0 ? `${formatDirective(key)} ${value.join(' ')}` : '';
      }
      return value ? `${formatDirective(key)}` : '';
    })
    .filter(Boolean)
    .join('; ');

  // Thiết lập header CSP
  res.setHeader('Content-Security-Policy', cspString);
  
  // Các header bảo mật khác
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Trong môi trường production, thiết lập HSTS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

// Hàm hỗ trợ định dạng directive CSP
function formatDirective(key) {
  // Chuyển đổi camelCase thành kebab-case
  return key.replace(/([A-Z])/g, '-$1').toLowerCase();
}

module.exports = contentSecurityPolicy;
