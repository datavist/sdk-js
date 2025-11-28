module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['jest-fetch-mock'],
  clearMocks: true,
  restoreMocks: true
};