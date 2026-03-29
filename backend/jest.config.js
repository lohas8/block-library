module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'app/**/*.js',
    '!app/extend/**'
  ],
  testMatch: [
    '**/test/**/*.test.js',
    '**/__tests__/**/*.test.js'
  ],
  testTimeout: 10000,
  verbose: true
};
