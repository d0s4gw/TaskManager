export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/../shared/$1'
  },
  modulePaths: ['<rootDir>/node_modules'],
  testMatch: ['**/src/**/*.spec.ts']
};
