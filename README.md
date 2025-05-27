# 🎯 RIMcode Services Management Dashboard

> A powerful, modern service management platform built with Next.js 14, TypeScript, and Supabase for streamlined service, account, and user subscription management.

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.49.1-green)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3.0-06B6D4)](https://tailwindcss.com/)

📍 **[Live Demo](https://services-mangment.vercel.app)** | 🔗 **[GitHub Repository](https://github.com/ahmed-abdat/services-mangment)**

---

## 🚀 Overview

**RIMcode Services Management Dashboard** is a comprehensive platform designed for managing services, accounts, and user subscriptions with enterprise-level features. Built with modern web technologies, it provides an intuitive interface for service providers to manage their operations efficiently.

### ✨ Key Features

- 🔐 **Secure Authentication** - Email-based auth with Supabase integration
- 🎛️ **Service Management** - Create, update, and delete services with rich metadata
- 👥 **Account Management** - Handle both personal and shared account types
- 📊 **User Dashboard** - Track subscriptions, expiration dates, and user details
- 🖼️ **Media Management** - Upload and manage thumbnails with drag-and-drop
- 📱 **Responsive Design** - Mobile-first UI with modern components
- 🔄 **Real-time Updates** - Live data synchronization across the platform
- 🎨 **Modern UI/UX** - Built with Shadcn/ui and Radix primitives

---

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern React component library
- **Radix UI** - Unstyled, accessible UI primitives

### **Backend & Database**

- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - Authentication and user management
- **Supabase Storage** - File storage for media assets

### **State Management & Data Fetching**

- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **TanStack Table** - Advanced data tables

### **Development Tools**

- **ESLint** - Code linting
- **Autoprefixer** - CSS vendor prefixes
- **Sharp** - Image optimization

---

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── services/          # Service management pages
│   └── actions/           # Server actions
├── components/            # Reusable UI components
│   ├── auth/             # Authentication components
│   ├── forms/            # Form components
│   └── ui/               # Base UI components
├── features/             # Feature-based modules
│   ├── auth/             # Authentication logic
│   └── dashboard/        # Dashboard functionality
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
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

### 🎛️ Service Management

- **Create Services**: Add new services with metadata and thumbnails
- **Service Dashboard**: View all services with account counts and quick actions
- **Service Details**: Detailed view with account management capabilities

### 👥 Account Management

- **Account Types**: Support for personal and shared accounts
- **Account Details**: Store email, phone, descriptions, and expiration dates
- **Bulk Operations**: Efficient management of multiple accounts

### 📊 User Subscriptions

- **Subscription Tracking**: Monitor active, expired, and pending subscriptions
- **Expiration Management**: Automated tracking of subscription end dates
- **User Profiles**: Comprehensive user information management

### 🔐 Authentication

- **Email Authentication**: Secure login with email verification
- **Protected Routes**: Route-based access control
- **Session Management**: Persistent user sessions with Supabase

---

## 🎨 UI Components

The project uses a comprehensive design system built on:

- **Shadcn/ui** components for consistent styling
- **Radix UI** primitives for accessibility
- **Lucide React** for iconography
- **TailwindCSS** for responsive design

### Available Components

- Forms with validation
- Data tables with sorting/filtering
- Modal dialogs and alerts
- File upload with drag-and-drop
- Responsive navigation
- Toast notifications

---

## 📦 Available Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Build for production     |
| `npm run start` | Start production server  |
| `npm run lint`  | Run ESLint               |

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

### File Storage

Media files are stored in Supabase Storage with organized buckets for:

- Service thumbnails
- Account avatars
- User profile images

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

---

## 📄 License

This project is private and proprietary to RIMcode.

---

## 🆘 Support

For support and questions:

- 📧 **Email**: [contact@rimcode.com](mailto:contact@rimcode.com)
- 📖 **Documentation**: Check the `/docs` directory
- 🐛 **Issues**: Report bugs via GitHub Issues

---

<div align="center">

**Built with ❤️ by RIMcode**

[⬆ Back to Top](#-rimcode-services-management-dashboard)

</div>
