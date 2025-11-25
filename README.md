# BinderBase

BinderBase is a full-stack trading card collection management application that allows users to search for cards, manage their personal collections, trade cards in a marketplace, and chat with other collectors in real-time.

## Features

- **Card Search**: Search and discover trading cards
- **Personal Collection**: Manage your card collection with status tracking
- **Marketplace**: Buy and sell cards with other collectors
- **Real-time Chat**: WebSocket-based chat functionality to communicate with other users
- **User Authentication**: Secure authentication using Clerk OAuth2

## Technologies Used

### Backend

- **Java 17**: Programming language
- **Spring Boot 3.5.6**: Application framework
- **Spring Data JPA**: Data persistence layer
- **Spring Security**: Authentication and authorization
- **Spring WebSocket**: Real-time communication support
- **PostgreSQL 14**: Relational database
- **Maven**: Dependency management and build tool
- **Lombok**: Reducing boilerplate code
- **OAuth2 Resource Server**: JWT token validation for Clerk authentication

### Frontend

- **React 19.1.1**: UI library
- **TypeScript 5.9.3**: Type-safe JavaScript
- **Vite 7.1.7**: Build tool and development server
- **TanStack Router 1.132.47**: Type-safe routing
- **TanStack React Query 5.90.3**: Server state management
- **Clerk React 5.52.0**: Authentication and user management
- **STOMP.js 7.2.1**: WebSocket messaging protocol
- **SockJS Client 1.6.1**: WebSocket fallback transport
- **Tailwind CSS 4.1.14**: Utility-first CSS framework
- **ESLint**: Code linting

## Project Structure

```
BinderBase/
├── backend/                 # Spring Boot backend application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/org/example/backend/
│   │   │   │   ├── config/          # Configuration classes
│   │   │   │   ├── controller/      # REST API controllers
│   │   │   │   ├── dto/             # Data transfer objects
│   │   │   │   ├── model/           # Entity models
│   │   │   │   ├── repository/      # JPA repositories
│   │   │   │   └── service/         # Business logic services
│   │   │   └── resources/
│   │   │       └── application.yml  # Application configuration
│   │   └── test/                    # Test files
│   ├── docker-compose.yml           # PostgreSQL database setup
│   └── pom.xml                      # Maven dependencies
│
└── frontend/                # React frontend application
    ├── src/
    │   ├── components/      # React components
    │   ├── contexts/        # React contexts
    │   ├── hooks/           # Custom React hooks
    │   ├── pages/           # Page components
    │   ├── router.tsx       # Route configuration
    │   └── utils/           # API utilities
    ├── package.json         # NPM dependencies
    └── vite.config.ts       # Vite configuration
```

## Prerequisites

- **Java 17** or higher
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for PostgreSQL database)
- **Maven** 3.6+ (or use the included `mvnw` wrapper)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Start the PostgreSQL database using Docker Compose:

   ```bash
   docker-compose up -d
   ```

3. Create a `.env` file in the backend directory with the following environment variables:

   ```env
   JDBC_DATABASE_URL=jdbc:postgresql://localhost:5432/binderbasedb
   JDBC_DATABASE_USERNAME=binderbasedb
   JDBC_DATABASE_PASSWORD=binderbasedb
   CLERK_JWT_ISSUER_URI=https://your-clerk-domain.clerk.accounts.dev
   JPA_DDL_AUTO=update
   JPA_SHOW_SQL=false
   ```

4. Build and run the backend application:

   ```bash
   # Using Maven wrapper (Windows)
   ./mvnw.cmd spring-boot:run

   # Using Maven wrapper (Linux/Mac)
   ./mvnw spring-boot:run

   # Or using installed Maven
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080` (default Spring Boot port).

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory with your Clerk configuration:

   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173` (default Vite port).

5. Build for production:
   ```bash
   npm run build
   ```

## API Endpoints

The backend provides the following REST API and WebSocket endpoints:

### Collection API (`/api/v1/collection`)

- `GET /api/v1/collection?userId={userId}` - Get user's card collection
- `POST /api/v1/collection` - Add card to collection

### Marketplace API (`/api/v1/marketplace`)

- `GET /api/v1/marketplace` - Get all cards currently listed for sale
- `PUT /api/v1/marketplace/list/{cardDbId}` - List a card for sale with price
- `PUT /api/v1/marketplace/unlist/{cardDbId}` - Remove a card from the marketplace
- `PUT /api/v1/marketplace/sold/{cardDbId}` - Mark a card as sold

### Chat API (`/api/v1/chat`)

- `GET /api/v1/chat/history/{recipientClerkId}` - Get chat history with a specific user
- **WebSocket**: `/ws` endpoint for real-time messaging
  - Message mapping: `/app/private-message` - Send private messages
  - Subscribe to: `/user/{userId}/private` - Receive private messages

### User API (`/api/v1/users`)

- `GET /api/v1/users` - Get all users available for chat (excluding current user)
- `GET /api/v1/users/chat-partners` - Get users with existing chat history

## Database

The application uses PostgreSQL as the database. The Docker Compose configuration automatically sets up a PostgreSQL 14 container with the following default credentials:

- **Database**: `binderbasedb`
- **Username**: `binderbasedb`
- **Password**: `binderbasedb`
- **Port**: `5432`

## Development

### Backend Development

- The backend uses Spring Boot DevTools for hot reloading
- Database schema is managed via JPA Hibernate (set `JPA_DDL_AUTO=update` for development)
- API endpoints are CORS-enabled for frontend integration

### Frontend Development

- Vite provides fast hot module replacement (HMR)
- TypeScript provides type checking
- ESLint is configured for code quality
- TanStack Router Devtools available in development mode
