# Split Personality

A modern web application that helps cohabiting partners manage and share household responsibilities equitably by assigning monetary values to chores.

## 🏠 What is Split Personality?

Split Personality transforms household labor management by treating chores as valuable contributions with real monetary worth. Instead of arguments about fairness, partners get a clear, quantifiable measure of each person's contribution to the household.

### Key Features

- **Smart Chore Valuation**: Automatically calculates chore values based on time, skill level, and rarity
- **Real-time Equity Dashboard**: Visual representation of contributions and balances
- **Mobile-First Design**: Seamless experience on any device
- **Debt Settlement**: Track and settle chore-related debts with payment notes
- **Two-Person Households**: Optimized for couples (V1), with architecture ready for larger households

### How It Works

**Chore Value = (Base Rate × Time) + Skill Bonus + Rarity Bonus**

- **Base Rate**: Configurable hourly rate (defaults to minimum wage)
- **Skill Bonus**: +15% (Intermediate), +30% (Advanced)
- **Rarity Bonus**: +25% if only one person in the household can do the task

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd split-personality
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up the database**
   ```bash
   cd backend
   npm run db:generate
   npm run db:push
   cd ..
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 📱 Usage Guide

### Getting Started

1. **Create Your Profile**
   - Enter your first name on the welcome screen
   - No email or password required for V1

2. **Set Up Your Household**
   - **Create New**: Start a new household and get an invite code
   - **Join Existing**: Enter your partner's invite code

3. **Start Adding Chores**
   - Navigate to the Chores page
   - Click "Add Chore" and fill out the details
   - Choose skill level and assign to specific person (optional)

4. **Complete Chores**
   - Mark chores as complete with actual time spent
   - System automatically calculates monetary value
   - View your contributions on the Dashboard

5. **Settle Up**
   - Check the Dashboard for current balance
   - Use "Settle Up" button to record debt settlements
   - Add notes about how payment was made

### Understanding Skill Levels

- **Basic**: Simple tasks like wiping counters (no bonus)
- **Intermediate**: Complex tasks like cooking elaborate meals (+15%)
- **Advanced**: Skilled tasks like minor repairs (+30%)

### Dashboard Features

- **Period Views**: Switch between Daily, Weekly, Monthly, and All Time
- **Visual Balance**: See who owes whom at a glance
- **Contribution Charts**: Compare individual contributions
- **Recent Activity**: Track latest completed chores
- **Settlement History**: View past debt settlements

## 🛠 Development

### Project Structure

```
split-personality/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Database models (Prisma)
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities and validation
│   ├── prisma/           # Database schema
│   └── package.json
├── frontend/             # Vue.js client app
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── views/        # Page components
│   │   ├── stores/       # Pinia state management
│   │   ├── services/     # API client
│   │   └── types/        # TypeScript definitions
│   └── package.json
├── package.json          # Root package for scripts
└── README.md
```

### Available Scripts

**Root level:**
```bash
npm run dev              # Start both backend and frontend
npm run build            # Build both applications
npm run test             # Run all tests
npm run install:all      # Install all dependencies
```

**Backend specific:**
```bash
cd backend
npm run dev              # Start development server
npm run build            # Build for production
npm run test             # Run tests
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
```

**Frontend specific:**
```bash
cd frontend
npm run dev              # Start development server
npm run build            # Build for production
npm run test             # Run tests
npm run typecheck        # Type checking
```

### Running Tests

**Backend Tests:**
```bash
cd backend
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
```

**Frontend Tests:**
```bash
cd frontend
npm test                 # Run all tests
npm run test:ui          # Run tests with UI
```

### Database Management

The app uses SQLite with Prisma ORM. Database file is stored at `backend/prisma/dev.db`.

**Common commands:**
```bash
cd backend
npm run db:generate      # Regenerate Prisma client after schema changes
npm run db:push          # Apply schema changes to database
npm run db:migrate       # Create and apply migrations
```

### API Documentation

#### Core Endpoints

**Users:**
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details

**Households:**
- `POST /api/households` - Create household
- `POST /api/households/join` - Join household
- `GET /api/households/:id` - Get household details
- `PATCH /api/households/:id/settings` - Update settings

**Chores:**
- `POST /api/chores` - Create chore
- `GET /api/chores?householdId=:id` - List household chores
- `POST /api/chores/:id/complete` - Mark chore complete
- `GET /api/chores/completed?householdId=:id` - Get completed chores

**Dashboard:**
- `GET /api/dashboard/:householdId` - Get dashboard summary
- `GET /api/dashboard/:householdId/analysis` - Get detailed analysis

**Settlements:**
- `POST /api/settlements` - Create settlement
- `GET /api/settlements?householdId=:id` - List settlements

## 🧪 Testing

The application includes comprehensive test coverage:

- **Backend**: Unit tests for services and controllers, integration tests for API endpoints
- **Frontend**: Component tests, store tests, and API service tests

### Test Files

**Backend:**
- `src/services/__tests__/` - Service layer tests
- `src/controllers/__tests__/` - Controller tests
- `src/__tests__/integration.test.ts` - API integration tests

**Frontend:**
- `src/components/__tests__/` - Component tests
- `src/stores/__tests__/` - Store tests
- `src/services/__tests__/` - API service tests
- `src/views/__tests__/` - Page component tests

## 🔧 Configuration

### Environment Variables

**Backend** (optional):
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

**Frontend** (via Vite):
- Development proxy automatically routes `/api` requests to backend

### Customizing Base Rate

The default hourly rate can be changed in the household settings. This affects the base calculation for all chore values.

## 📦 Deployment

### Backend Deployment

1. Build the application:
   ```bash
   cd backend
   npm run build
   ```

2. Set up production database:
   ```bash
   npm run db:generate
   npm run db:push
   ```

3. Start the server:
   ```bash
   npm start
   ```

### Frontend Deployment

1. Build for production:
   ```bash
   cd frontend
   npm run build
   ```

2. Serve the `dist` directory with any static hosting service

### Environment Setup

- Ensure Node.js 18+ is installed on production server
- Set `NODE_ENV=production` for backend
- Configure reverse proxy for API routes if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Style

- TypeScript for type safety
- ESLint and Prettier for code formatting
- Jest/Vitest for testing
- Conventional commit messages

## 🗺 Roadmap (Future Versions)

- **Multi-Person Households**: Support for 3+ people
- **Recurring Chores**: Schedule repeating tasks
- **Payment Integration**: Direct payment processing
- **Mobile Apps**: Native iOS and Android apps
- **Advanced Analytics**: Detailed reporting and insights
- **Chore Suggestions**: AI-powered task recommendations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check the Developer Documentation (DEVELOPER.md)
- Review the API documentation above

---

**Made with ❤️ for fair households everywhere**