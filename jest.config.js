// jest.config.js
export default {
  // Indicate that we're using ES modules
  extensionsToTreatAsEsm: ['.js'],
  
  // Specify the test environment
  testEnvironment: 'node',
  
  // Transform using Babel
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // Ignore certain directories
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/'
  ],
  
  // Collect coverage information
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  
  // Coverage threshold to ensure code quality
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Setup files before running tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};