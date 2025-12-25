# PrintEase - Instant Printing & MP Online Services

A modern web application for printing services, government certificates, bill payments, and MP Online services. Fast, reliable, and affordable solutions delivered to your doorstep.

![PrintEase](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8)

## 🚀 Features

### Customer Features
- **Service Catalog**: Browse printing, certificates, bills, and MP Online services
- **Order Management**: Create, track, and manage orders
- **Document Upload**: Upload documents for printing and processing
- **Real-time Status**: Track order status from pending to delivery
- **User Dashboard**: Personal dashboard with order history and profile management
- **Google OAuth**: Quick and secure login with Google

### Admin Features
- **Admin Dashboard**: Comprehensive analytics and overview
- **Order Management**: View and manage all customer orders
- **Service Management**: Add, edit, and manage services
- **User Management**: View and manage registered users
- **Analytics**: Business insights and reporting

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Lovable Cloud (Supabase)
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: PostgreSQL
- **Storage**: Supabase Storage for documents
- **State Management**: TanStack Query (React Query)

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/      # Dashboard layout components
│   ├── landing/        # Landing page sections
│   └── ui/             # Reusable UI components (shadcn)
├── contexts/
│   └── AuthContext.tsx # Authentication context
├── hooks/
│   ├── useOrders.ts    # Order management hooks
│   ├── useServices.ts  # Service management hooks
│   └── useNotifications.ts
├── integrations/
│   └── supabase/       # Supabase client and types
├── pages/
│   ├── admin/          # Admin pages
│   ├── dashboard/      # User dashboard pages
│   ├── Auth.tsx        # Authentication page
│   └── Index.tsx       # Landing page
└── lib/
    └── utils.ts        # Utility functions
```

## 🗄️ Database Schema

### Tables
- **profiles**: User profile information
- **services**: Available services with pricing
- **orders**: Customer orders
- **order_documents**: Documents attached to orders
- **user_documents**: User uploaded documents
- **user_roles**: User role assignments (admin/user)

### Service Categories
- Printing
- Certificates
- Bills
- MP Online

### Order Statuses
- Pending
- In Progress
- Ready
- Delivered
- Cancelled

## 🔐 Authentication

The app supports:
- Email/Password authentication
- Google OAuth
- Password reset via email

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- npm or bun

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd <project-folder>
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 📝 Environment Variables

The following environment variables are configured automatically:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key
- `VITE_SUPABASE_PROJECT_ID` - Supabase project ID

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📱 PWA Support

This app includes PWA (Progressive Web App) support:
- Installable on mobile devices
- Offline-capable icons
- App manifest configured

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using [Lovable](https://lovable.dev)
