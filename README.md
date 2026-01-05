# Gym Management System

A comprehensive browser-based gym management system built with React, Node.js, Express, TypeScript, and PostgreSQL.

## Features

- **Client Management**: Add, edit, and manage gym members
- **Package Management**: Create and manage membership packages
- **Instructor Management**: Manage instructors and their assignments
- **Membership Management**: Track client memberships, payments, and status
- **Payment Tracking**: Record and manage payments
- **Training Sessions**: Schedule and track training sessions with instructors
- **Gym Activity**: Monitor gym entrance/exit and active sessions
- **Dashboard**: Overview of key statistics and recent activity
- **Authentication**: Secure admin login system

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React 18
- TypeScript
- Material-UI (MUI)
- React Router
- Axios for API calls

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Database Setup

First, make sure PostgreSQL is running and create a database:

```sql
CREATE DATABASE "gym-db";
```

Then run the initialization script:

```bash
psql -U postgres -d gym-db -f Init.sql
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/gym-db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
```

Generate Prisma client:

```bash
npm run prisma:generate
```

Start the backend server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Default Admin Account

You'll need to create an admin account in the database. You can do this by running:

```sql
INSERT INTO public.admins (adminID, fname, lname, dob, is_male, password, phone_number)
VALUES ('admin', 'Admin', 'User', '1990-01-01', true, '$2a$10$YourHashedPasswordHere', '1234567890');
```

Or use bcrypt to hash a password and insert it. For testing, you can use a simple script or create an admin through a database tool.

**Note**: Make sure to hash the password using bcrypt before inserting into the database.

## Project Structure

```
GymWeb/
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth middleware
│   │   └── server.ts        # Express server
│   ├── prisma/
│   │   └── schema.prisma    # Prisma schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/           # Page components
│   │   └── App.tsx          # Main app component
│   └── package.json
├── Init.sql                 # Database initialization script
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin info

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Packages
- `GET /api/packages` - Get all packages
- `GET /api/packages/:id` - Get package by ID
- `POST /api/packages` - Create package
- `PUT /api/packages/:id` - Update package
- `DELETE /api/packages/:id` - Delete package

### Instructors
- `GET /api/instructors` - Get all instructors
- `GET /api/instructors/:id` - Get instructor by ID
- `POST /api/instructors` - Create instructor
- `PUT /api/instructors/:id` - Update instructor
- `DELETE /api/instructors/:id` - Delete instructor

### Memberships
- `GET /api/memberships` - Get all memberships
- `GET /api/memberships/:id` - Get membership by ID
- `POST /api/memberships` - Create membership
- `PUT /api/memberships/:id` - Update membership
- `DELETE /api/memberships/:id` - Delete membership

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Create payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Sessions
- `GET /api/sessions` - Get all training sessions
- `GET /api/sessions/:id` - Get session by ID
- `POST /api/sessions` - Create session
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session

### Gym Sessions
- `GET /api/gym-sessions` - Get all gym sessions
- `GET /api/gym-sessions?active=true` - Get active gym sessions
- `GET /api/gym-sessions/:id` - Get gym session by ID
- `POST /api/gym-sessions` - Create gym session (entrance)
- `PUT /api/gym-sessions/:id/exit` - Mark exit

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent-activity` - Get recent activity

## Development

### Backend Development

```bash
cd backend
npm run dev        # Start development server with hot reload
npm run build      # Build for production
npm start          # Start production server
```

### Frontend Development

```bash
cd frontend
npm start          # Start development server
npm run build      # Build for production
```

## Production Deployment

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Build the backend:
   ```bash
   cd backend
   npm run build
   ```

3. Set production environment variables

4. Run migrations if needed:
   ```bash
   npm run prisma:migrate
   ```

5. Start the production server:
   ```bash
   npm start
   ```

## Security Notes

- Change the JWT_SECRET in production
- Use strong passwords for database
- Implement rate limiting in production
- Use HTTPS in production
- Regularly update dependencies

## License

ISC

## Support

For issues and questions, please check the codebase or create an issue in your repository.

