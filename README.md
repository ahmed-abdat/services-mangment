# 🎯 RIMcode Services Management Dashboard

> A powerful, modern service management platform built with Next.js 14, TypeScript, and Supabase for streamlined service, account, and user subscription management with real-time analytics and responsive design.

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.49.1-green)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-06B6D4)](https://tailwindcss.com/)
[![Build Status](https://img.shields.io/badge/Build-Passing-success)](https://services-mangment.vercel.app)

📍 **[Live Demo](https://services-mangment.vercel.app)** | 🔗 **[GitHub Repository](https://github.com/ahmed-abdat/services-mangment)**

---

## 🚀 Overview

**RIMcode Services Management Dashboard** is a comprehensive, enterprise-grade platform designed for managing services, accounts, and user subscriptions. Built with cutting-edge web technologies, it provides an intuitive, responsive interface with real-time analytics for service providers to manage their operations efficiently.

### ✨ Key Features

- 🔐 **Secure Authentication** - Email-based auth with Supabase integration
- 📊 **Real-time Dashboard** - Live statistics with database-driven insights
- 🔍 **Advanced Search** - Filter services and accounts with URL state management
- 📱 **Responsive Sidebar** - Collapsible navigation with icon mode for mobile
- 🎛️ **Service Management** - Create, update, and delete services with rich metadata
- 👥 **Account Management** - Handle both personal and shared account types
- 📈 **User Analytics** - Track subscriptions, expiration dates, and user insights
- 🖼️ **Media Management** - Upload and manage thumbnails with drag-and-drop
- 🧭 **Smart Navigation** - Breadcrumb navigation with sticky headers
- 🔄 **Real-time Updates** - Live data synchronization across the platform
- 🎨 **Modern UI/UX** - Built with Shadcn/ui and Radix primitives
- ⚡ **Performance Optimized** - Server-side rendering with optimized queries

---

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 14** - React framework with App Router and Route Groups
- **TypeScript** - Type-safe development with strict type checking
- **TailwindCSS** - Utility-first CSS framework with custom theme
- **Shadcn/ui** - Modern React component library with Radix primitives
- **Lucide React** - Beautiful, customizable icons

### **Backend & Database**

- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - Authentication and user management
- **Supabase Storage** - File storage for media assets
- **Server Actions** - Type-safe server-side operations

### **State Management & Data Fetching**

- **React Hook Form** - Performant form state management
- **Zod** - Schema validation with TypeScript inference
- **TanStack Table** - Advanced data tables with sorting/filtering
- **URL State Management** - Search parameters for shareable states

### **Development Tools**

- **ESLint** - Code linting with Next.js config
- **TypeScript 5.0** - Latest TypeScript features
- **Autoprefixer** - CSS vendor prefixes
- **Sharp** - Optimized image processing

---

## 🏗️ Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication route group
│   │   ├── login/               # Login page
│   │   └── verify-email/        # Email verification
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── dashboard/           # Main dashboard with analytics
│   │   ├── services/            # Service management
│   │   │   ├── [serviceId]/     # Dynamic service routes
│   │   │   │   ├── [accountId]/ # Account management
│   │   │   │   ├── add-account/ # Add new account
│   │   │   │   └── edit-service/# Edit service
│   │   │   └── new-service/     # Create new service
│   │   └── settings/            # User settings
│   ├── actions/                 # Server actions
│   ├── api/                     # API routes (notifications)
│   └── auth/                    # Auth callbacks
├── components/                   # Reusable UI components
│   ├── auth/                    # Authentication components
│   ├── forms/                   # Form components
│   ├── layout/                  # Layout components (sidebar, etc.)
│   └── ui/                      # Base UI components (shadcn/ui)
├── features/                    # Feature-based modules
│   ├── auth/                    # Authentication logic
│   │   ├── actions/             # Auth server actions
│   │   ├── components/          # Auth UI components
│   │   └── validations/         # Auth schemas
│   └── dashboard/               # Dashboard functionality
│       ├── actions/             # Dashboard server actions
│       ├── components/          # Dashboard UI components
│       ├── types/               # Dashboard type definitions
│       └── validations/         # Dashboard schemas
├── hooks/                       # Custom React hooks
├── lib/                         # Utility libraries
├── types/                       # Global TypeScript definitions
├── utils/                       # Helper functions
│   └── supabase/                # Supabase client utilities
└── emails/                      # Email templates
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0 or later
- **npm** or **yarn** package manager
- **Supabase** account and project

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/ahmed-abdat/services-mangment.git
   cd services-mangment
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```bash
   # Application URLs
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_VERIFY_EMAIL_REDIRECT=http://localhost:3000/verify-email

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Optional: WhatsApp API Integration
   GREEN_API_ID_INSTANCE=your_green_api_instance
   GREEN_API_ACCESS_TOKEN=your_green_api_token

   # Optional: Email Integration
   RESEND_API_KEY=your_resend_api_key
   ```

   > 📝 **Production Note**: Update all URLs to your production domain when deploying (e.g., `https://yourdomain.com`)

### Database Setup

1. **Set up Supabase project**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and API keys
2. **Run database migrations**
   ```bash
   npx supabase db reset
   ```

### Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📋 Core Features

### 📊 Real-time Dashboard

- **Live Statistics**: Real-time data from database with error handling
- **User Analytics**: Active, expired, and expiring soon subscriptions
- **Recent Activity**: Timeline of services, accounts, and user changes
- **Service Insights**: Visual representation of service performance
- **System Status**: Health monitoring of integrated services

### 🔍 Advanced Search & Filtering

- **Service Search**: Filter services by name with URL state persistence
- **Real-time Filtering**: Instant results as you type
- **Shareable URLs**: Bookmark and share filtered views
- **Clear Indicators**: Visual feedback for active searches

### 📱 Responsive Design

- **Collapsible Sidebar**: Icon mode for mobile devices
- **Sticky Navigation**: Persistent breadcrumbs and headers
- **Mobile-first**: Optimized for all screen sizes
- **Touch-friendly**: Gesture support for mobile interactions

### 🎛️ Service Management

- **Create Services**: Add new services with metadata and thumbnails
- **Service Dashboard**: View all services with account counts and quick actions
- **Service Details**: Detailed view with account management capabilities
- **Bulk Operations**: Efficient management of multiple services

### 👥 Account Management

- **Account Types**: Support for personal and shared accounts
- **Account Details**: Store email, phone, descriptions, and expiration dates
- **User Management**: Add, edit, and remove users from accounts
- **Expiration Tracking**: Automated monitoring of subscription dates

### 📈 User Subscriptions

- **Subscription Tracking**: Monitor active, expired, and pending subscriptions
- **Expiration Management**: Automated tracking of subscription end dates
- **User Profiles**: Comprehensive user information management
- **Bulk User Operations**: Efficient user management with table controls

### 🔐 Authentication & Security

- **Email Authentication**: Secure login with email verification
- **Protected Routes**: Route-based access control with middleware
- **Session Management**: Persistent user sessions with Supabase
- **Type-safe Actions**: Server actions with proper validation

---

## 🎨 UI Components & Design System

The project uses a comprehensive design system built on:

- **Shadcn/ui** components for consistent styling
- **Radix UI** primitives for accessibility compliance
- **Lucide React** for beautiful iconography
- **TailwindCSS** for responsive design with custom theme
- **CSS Variables** for dynamic theming support

### Available Components

- **Forms**: Validated forms with error handling
- **Data Tables**: Sortable, filterable tables with pagination
- **Navigation**: Responsive sidebar with breadcrumbs
- **Modals**: Accessible dialogs and confirmations
- **File Upload**: Drag-and-drop with progress indicators
- **Notifications**: Toast messages and alerts
- **Cards**: Information display with consistent layout
- **Buttons**: Various styles with loading states

---

## 📦 Available Scripts

| Command              | Description                  |
| -------------------- | ---------------------------- |
| `npm run dev`        | Start development server     |
| `npm run build`      | Build for production         |
| `npm run start`      | Start production server      |
| `npm run lint`       | Run ESLint                   |
| `npm run type-check` | Run TypeScript type checking |

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**

   ```bash
   npx vercel
   ```

2. **Configure environment variables** in Vercel dashboard

   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_VERIFY_EMAIL_REDIRECT`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

### Other Platforms

The application can be deployed to any platform supporting Next.js:

- **Netlify**
- **Railway**
- **Heroku**
- **DigitalOcean App Platform**

---

## 🔧 Configuration

### Database Schema

The application uses the following main tables:

- `services` - Service definitions and metadata
- `accounts` - Service accounts (personal/shared)
- `users` - User subscriptions and details
- `auth_users` - Supabase authentication users

### File Storage

Media files are stored in Supabase Storage with organized buckets for:

- Service thumbnails
- Account avatars
- User profile images

### Automated Notifications

- **WhatsApp Reminders**: 3-day and 1-day expiration warnings via Green API
- **Email Notifications**: Expired subscription alerts via Resend
- **Cron Jobs**: Automated notification scheduling with Supabase

---

## 🔄 Recent Updates

### v1.0.0 (Latest)

#### ✨ New Features

- **Real-time Dashboard**: Live statistics and analytics
- **Advanced Search**: Service filtering with URL state
- **Responsive Sidebar**: Collapsible navigation with icon mode
- **Route Groups**: Organized authentication and dashboard routes
- **Sticky Navigation**: Persistent breadcrumbs and headers

#### 🐛 Bug Fixes

- Fixed hydration mismatch in mobile detection
- Resolved import path issues and component naming
- Improved error handling in dashboard stats
- Fixed HTML validation for Button/Link combinations
- Enhanced date parsing and locale handling

#### 🔧 Improvements

- Enhanced TypeScript type safety
- Optimized database queries with proper error handling
- Improved mobile responsiveness
- Better accessibility support
- Code organization with feature-based structure

---

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'feat: add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Commit Convention

Follow conventional commits format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - Code formatting
- `refactor:` - Code restructuring
- `test:` - Test additions
- `chore:` - Maintenance tasks

### Development Guidelines

- **Type Safety**: Use TypeScript for all code
- **Component Structure**: Follow the established pattern in `/features`
- **Error Handling**: Implement proper error boundaries and validation
- **Accessibility**: Ensure WCAG compliance for all UI components
- **Performance**: Optimize queries and use proper loading states

---

## 📄 License

This project is private and proprietary to RIMcode.

---

## 🆘 Support

For support and questions:

- 📧 **Email**: [contact@rimcode.com](mailto:contact@rimcode.com)
- 📖 **Documentation**: Check the `/docs` directory
- 🐛 **Issues**: Report bugs via GitHub Issues
- 💬 **Discussions**: Use GitHub Discussions for feature requests

---

## 🙏 Acknowledgments

Special thanks to:

- **Vercel** for hosting and deployment platform
- **Supabase** for backend infrastructure
- **Shadcn** for the beautiful UI component library
- **Next.js team** for the amazing framework

---

<div align="center">

**Built with ❤️ by RIMcode**

[⬆ Back to Top](#-rimcode-services-management-dashboard)

</div>
