/**
 * Cấu hình Jest cho dự án Yapee Vietnam
 */

module.exports = {
  testEnvironment: 'node',
  verbose: true,
  testTimeout: 30000,
  coveragePathIgnorePatterns: ['/node_modules/'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/utils/logger.js',
    '!src/middleware/errorHandler.js'
  ]
};