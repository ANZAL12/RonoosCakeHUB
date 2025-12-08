# Ronoos BakeHub - Frontend

Next.js frontend for Ronoos BakeHub bakery management system.

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Create environment file:**
Create a `.env.local` file in the frontend directory:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

3. **Run development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Features

### Customer Features
- Browse products and categories
- Custom cake builder
- Shopping cart
- Order placement and tracking
- User authentication

### Admin Features
- Product management
- Order management
- Inventory tracking
- Analytics dashboard

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios

## Project Structure
```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable components
├── contexts/         # React contexts (Auth, etc.)
├── lib/             # Utilities and API client
└── types/           # TypeScript types
```

## Environment Variables
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (default: http://localhost:8000)
