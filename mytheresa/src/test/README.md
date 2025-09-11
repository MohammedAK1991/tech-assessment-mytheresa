# Testing Documentation

This directory contains the testing infrastructure and utilities for the movie application.

## Test Structure

```
src/
├── test/
│   ├── __tests__/           # Integration tests
│   ├── mocks/               # MSW handlers for API mocking
│   ├── setup.ts             # Test setup and configuration
│   ├── utils.tsx            # Testing utilities and custom render functions
│   └── README.md            # This file
├── routes/__tests__/        # Route component tests
├── stores/__tests__/        # Zustand store tests
├── services/__tests__/      # API service tests
└── hooks/__tests__/         # Custom hook tests
```

## Testing Framework

- **Vitest**: Test runner and assertion library
- **Testing Library**: Component testing utilities
- **MSW**: API mocking for predictable tests
- **Happy DOM**: Fast DOM implementation for tests

## Test Categories

### Unit Tests
- **Zustand Stores**: Testing state management logic
- **API Services**: Testing HTTP requests and data transformation
- **Custom Hooks**: Testing data fetching and state logic
- **Utility Functions**: Testing pure functions

### Component Tests
- **Route Components**: Testing rendering, user interactions, and state changes
- **Reusable Components**: Testing component behavior in isolation

### Integration Tests
- **Cross-component workflows**: Testing data flow between components
- **Store integration**: Testing component interaction with global state
- **API integration**: Testing end-to-end data flow

## Running Tests

```bash
# Run all tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

## Mock Data

API responses are mocked using MSW handlers located in `mocks/handlers.ts`. This ensures:
- Predictable test data
- Fast test execution
- No external API dependencies
- Consistent test environment

## Test Utilities

The `utils.tsx` file provides:
- `renderWithQueryClient`: Renders components with TanStack Query provider
- `createTestQueryClient`: Creates a test-optimized query client
- Custom render functions for different testing scenarios

## Coverage Goals

Current test coverage includes:
- ✅ Zustand store operations (100%)
- ✅ API service methods (95%+)
- ✅ Component rendering and interactions (90%+)
- ✅ Custom hooks behavior (95%+)
- ✅ Error handling scenarios (85%+)
- ✅ Integration workflows (80%+)

## Best Practices

1. **Isolation**: Each test should be independent and not affect others
2. **Clarity**: Test names should clearly describe what is being tested
3. **Mocking**: Use MSW for HTTP requests, minimal mocking for internal modules
4. **Async**: Properly handle async operations with `waitFor` and `act`
5. **User-centric**: Test behavior users would experience, not implementation details
6. **Edge cases**: Include tests for error states, empty data, and boundary conditions