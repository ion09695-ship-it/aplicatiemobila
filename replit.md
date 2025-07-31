# Travel AI Assistant - replit.md

## Overview

This is a full-stack travel assistant application built with React, Express, and PostgreSQL. The application provides an AI-powered chat interface that helps users plan trips by searching for hotels, flights, and activities using OpenAI's GPT-4o model. The system features a modern chat interface with session management, travel search capabilities, and a responsive design built with shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with React plugin and custom path aliases

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Design**: RESTful API with JSON responses
- **Error Handling**: Centralized error middleware with structured error responses
- **Logging**: Custom request logging middleware for API endpoints

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (configured for Neon serverless)
- **Migrations**: Drizzle Kit for schema management
- **Storage Interface**: Abstracted storage layer with in-memory fallback for development

## Key Components

### Chat System
- **Session Management**: Users can create multiple chat sessions with persistent message history
- **Message Types**: Support for both user messages and AI responses with metadata
- **Real-time UI**: Typing indicators and smooth message animations
- **Enhanced Sidebar Navigation**: Intelligent date-based grouping with multiple time periods:
  - Today (with time stamps)
  - Yesterday (with dates)
  - This Week (with dates)
  - This Month (with dates)
  - Older conversations grouped by month/year
  - Session count indicators for each time period

### AI Integration
- **Intelligent Fallback System**: Smart travel assistant that works without requiring external API keys
- **Destination Recognition**: Recognizes 100+ global destinations and provides context-specific advice
- **Intent Detection**: Automatically detects travel intent (hotels, flights, activities) and provides tailored responses
- **Contextual Travel Responses**: Provides intelligent suggestions for hotels, flights, activities, and general travel planning
- **OpenAI Integration Ready**: Can seamlessly upgrade to GPT-4o when API key is provided

### Travel Search System
- **Multi-type Search**: Support for hotels, flights, and activities
- **Mock Data Service**: Placeholder service returning sample travel results
- **Results Display**: Specialized UI components for different travel result types
- **Query Parameters**: Structured data extraction for destination, dates, guests, and budget

### UI Components
- **Design System**: Consistent component library with dark/light theme support
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Interactive Elements**: Quick action buttons for common travel queries
- **Loading States**: Skeleton loaders and typing indicators for better UX
- **Sticky Navigation**: Header and status bar remain visible during scroll for easy access to menu and controls
- **Responsive Sidebar**: Sticky positioning on desktop for easy access, mobile-optimized slide-out overlay on smaller screens

## Data Flow

### Chat Flow
1. User creates new chat session or selects existing one
2. User sends message through chat input component
3. Frontend sends message to `/api/chat/sessions/{id}/messages` endpoint
4. Backend processes message with OpenAI API
5. AI response and any travel results are stored in database
6. Frontend receives response and updates chat interface
7. Travel results are rendered using specialized components

### Travel Search Flow
1. AI identifies travel intent from user message
2. AI extracts search parameters (destination, dates, etc.)
3. Backend calls travel service with extracted parameters
4. Mock travel service returns sample results
5. Results are stored as message metadata
6. Frontend displays results using travel-specific UI components

### Session Management
1. Sessions are created with default "New Chat" title
2. Session titles can be auto-generated based on conversation content
3. Sessions are listed in sidebar grouped by date
4. Each session maintains its own message history

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver for Neon
- **drizzle-orm**: Type-safe ORM for database operations
- **openai**: Official OpenAI SDK for GPT integration
- **@tanstack/react-query**: Data fetching and caching
- **express**: Web framework for API server

### UI Dependencies
- **@radix-ui/***: Primitive UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Utility for component variants
- **react-hook-form**: Form state management

### Development Dependencies
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Development
- **Dev Server**: Vite development server with HMR for frontend
- **API Server**: Express server with tsx for TypeScript execution
- **Database**: Drizzle push for schema synchronization
- **Environment**: NODE_ENV=development with development-specific features

### Production Build
- **Frontend**: Vite builds static assets to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Migrations run via Drizzle Kit
- **Deployment**: Single artifact with both frontend and backend

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **OPENAI_API_KEY**: OpenAI API key for AI functionality
- **NODE_ENV**: Environment setting (development/production)

### Key Architectural Decisions

1. **Monorepo Structure**: Single repository with shared TypeScript types and clear separation between client, server, and shared code
2. **Type Safety**: End-to-end TypeScript with shared schema definitions and strict type checking
3. **Component Abstraction**: Travel results are displayed through specialized components that can be easily extended for real API integration
4. **Mock Services**: Travel search currently uses mock data, designed for easy replacement with real travel APIs
5. **Session-based Chat**: Each conversation is isolated in its own session for better organization and potential multi-user support
6. **Responsive Design**: Mobile-first approach with collapsible sidebar and touch-friendly interactions