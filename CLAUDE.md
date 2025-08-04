# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Overview

This is the **Chore Equity App**, a full-stack web application that helps cohabiting partners manage household responsibilities equitably by assigning monetary values to chores. The core business logic revolves around the **chore valuation formula**: `Chore Value = (Base Rate × Time) + Skill Bonus + Rarity Bonus`.

## Architecture

**Full-Stack TypeScript Application:**
- **Backend**: Express.js API with Prisma ORM and SQLite database
- **Frontend**: Vue 3 (Composition API) with Pinia state management and Tailwind CSS
- **Database**: SQLite with household-scoped data model designed for future multi-user expansion

**Key Design Patterns:**
- Household-centric data scoping (all queries filtered by `householdId`)
- Service layer pattern for business logic (`ChoreValuationService`, `EquityAnalysisService`)
- Pinia stores for frontend state management with error handling and loading states
- RESTful API with consistent response format: `{ success: boolean, data: T }` or `{ error: string }`

## Critical Business Logic

### Chore Valuation Engine (`backend/src/services/choreValuationService.ts`)
The heart of the application calculates chore monetary value:
- **Skill Bonuses**: Basic (0%), Intermediate (+15%), Advanced (+30%)
- **Rarity Bonus**: +25% when only one household member can perform the skill level
- **Base Rate**: Configurable per household (defaults to $15/hour)

### Equity Analysis (`backend/src/services/equityAnalysisService.ts`)
Calculates who owes whom by:
1. Summing completed chore values by user
2. Applying settlement adjustments (debts paid)
3. Computing net balance between household members

## Development Commands

### Quick Start
```bash
npm run install:all           # Install all dependencies
cd backend && npm run db:generate && npm run db:push && cd ..  # Set up database
npm run dev                   # Start both servers (frontend:3000, backend:3001)
```

### Testing
```bash
npm test                      # Run all tests
cd backend && npm run test:watch  # Backend tests in watch mode
cd frontend && npm run test:ui    # Frontend tests with UI
```

### Database Management
```bash
cd backend
npm run db:generate          # Regenerate Prisma client after schema changes
npm run db:push             # Apply schema changes to database
npm run db:migrate          # Create and apply migrations
```

### Individual Services
```bash
# Backend only
cd backend && npm run dev    # Express server on :3001

# Frontend only  
cd frontend && npm run dev   # Vite dev server on :3000
cd frontend && npm run typecheck  # TypeScript validation
```

## Data Model Key Points

**Household-Scoped Architecture**: All data is partitioned by `householdId` to support future multi-household users.

**Core Entities**:
- `User` → `Household` (many-to-one via `householdId`)
- `Chore` → `CompletedChore` (one-to-many with calculated `value` field)
- `Settlement` tracks debt payments between users

**Important**: The `CompletedChore.value` field stores the calculated monetary value and should never be manually set - it's computed by `ChoreValuationService.calculateChoreValue()`.

## Frontend State Management

**Store Hierarchy**:
- `useUserStore()`: Authentication, household membership, localStorage persistence
- `useChoresStore()`: Chore CRUD operations and completion tracking  
- `useDashboardStore()`: Equity analysis and dashboard data

**Key Pattern**: All stores include error handling with auto-clearing errors after 5 seconds, and loading states for async operations.

## API Route Structure

**Authentication**: Simplified for V1 - users identified by ID stored in localStorage, no JWT/sessions.

**Household Scoping**: All data operations require `householdId` parameter and return only household-scoped data.

**Core Endpoints**:
- `/api/users` - User creation and retrieval
- `/api/households` - Household creation, joining, settings
- `/api/chores` - Chore CRUD and completion
- `/api/dashboard/:householdId` - Equity analysis with period filters
- `/api/settlements` - Debt settlement tracking

## Testing Architecture

**Backend**: Jest with comprehensive service, controller, and integration tests. All Prisma operations are mocked in unit tests.

**Frontend**: Vitest with Vue Test Utils. API services are mocked, and stores are tested with Pinia test utilities.

**Test Patterns**: Each major service has corresponding `__tests__` directory with both unit and integration coverage.

## Common Development Patterns

**Database Queries**: Always include household scoping:
```typescript
const chores = await prisma.chore.findMany({
  where: { householdId: user.householdId },
  // ... rest of query
});
```

**Frontend API Calls**: Handle errors consistently with store error patterns:
```typescript
try {
  const result = await apiCall();
  return result;
} catch (err: any) {
  setError(err.response?.data?.error || 'Default error message');
  throw err;
}
```

**Vue Components**: Use Composition API with TypeScript, stores for state, and props interfaces:
```typescript
interface Props {
  chore: Chore;
  isLoading?: boolean;
}
const props = withDefaults(defineProps<Props>(), { isLoading: false });
```

## Mobile-First Design

The application uses Tailwind CSS with mobile-first responsive design. Key patterns:
- Bottom navigation for mobile (`md:hidden` class)
- Top navigation for desktop (`hidden md:flex` class)
- Card-based layouts that stack on mobile, grid on desktop
- Touch-friendly button sizes and spacing
```

## Testing Best Practices

- When testing, run tests with full debug mode and capture the logs to avoid having to re-run tests again and again between code changes. Test reruns should be only required when the code changes.
- When writing or fixing tests, don't create any unnecessary test dependencies.