module.exports = {
  preset: 'ts-jest',
  setupFiles: [
    '<rootDir>/../../jest/env.ts'
  ],
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
}
