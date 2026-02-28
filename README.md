# Salad Subscription Management System

A Next.js-based subscription management system for a salad business, featuring bilingual support (Arabic/English), staff and admin portals, and integration with Supabase.

## Features

### Customer Management
- **Registration**: Register customers with name, phone, and subscription plan
- **Subscription Plans**: 
  - Biweekly (15 days) - 15 salads
  - Monthly (30 days) - 30 salads
- **Unique Subscription IDs**: Easy-to-read format (XXX-XXX)
- **Payment Slips**: Thermal and digital receipt printing

### Staff Portal (No Login Required)
- **Activate Subscriptions**: Confirm payments and activate subscriptions
- **Optional Receipt Tracking**: Enter last 5 digits of receipt number (admin-only visible)
- **Redeem Salads**: Verify customers using OTP and dispense salads
- **Subscription Management**: View active subscriptions and balances

### Admin Portal (Login Required)
- **Dashboard**: Statistics, revenue charts, and subscription analytics
- **Subscription Management**: View all subscriptions with receipt numbers
- **Staff Management**: Add/remove staff members
- **Configuration**: Set plan prices, validity periods, and grace periods
- **Data Export**: Export subscription data to CSV/Excel

### Security & Features
- **OTP Verification**: 4-digit OTP for redemption security
- **Session Management**: Persistent admin sessions (30 days)
- **Rate Limiting**: Login attempt protection
- **Audit Logging**: Track all system activities
- **Refund System**: Full/partial refund support

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom JWT-based auth
- **Styling**: Tailwind CSS
- **Internationalization**: next-intl
- **Barcode Generation**: JsBarcode

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

4. Run database migrations:

Go to your Supabase SQL Editor and run all migrations in order:
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`
- `supabase/migrations/003_functions_triggers.sql`
- `supabase/migrations/004_add_otp_field.sql`
- `supabase/migrations/005_add_receipt_number.sql`
- `supabase/migrations/006_change_weekly_to_biweekly.sql`

Or use Supabase CLI:
```bash
npx supabase db push
```

5. Seed the database (optional):
```bash
# Run seed.sql in Supabase SQL Editor
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── admin/         # Admin portal
│   │   │   ├── staff/         # Staff portal
│   │   │   └── page.tsx       # Home page
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── features/          # Feature-specific components
│   │   └── ui/                # Reusable UI components
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Business logic
│   │   ├── middleware/        # Auth, rate limiting
│   │   ├── repositories/      # Database access layer
│   │   ├── services/          # Business logic layer
│   │   ├── supabase/          # Supabase client
│   │   ├── utils/             # Utility functions
│   │   └── validators/        # Zod validation schemas
│   └── types/                 # TypeScript types
├── messages/                  # i18n translations (ar.json, en.json)
├── supabase/                  # Database migrations and seed
└── public/                    # Static assets
```

## Key Workflows

### 1. Customer Registration Flow
1. Customer provides name and phone
2. Staff selects subscription plan (biweekly/monthly)
3. System generates unique subscription ID (XXX-XXX format)
4. Payment slip printed/shown to customer
5. Customer pays at cashier

### 2. Subscription Activation Flow
1. Staff searches for pending subscription
2. Confirms payment received
3. Optionally enters last 5 digits of receipt number
4. System generates activation code and 4-digit OTP
5. Activation receipt printed for customer

### 3. Salad Redemption Flow
1. Staff searches by name/phone/subscription ID
2. Customer provides 4-digit OTP
3. Staff verifies OTP and dispenses salad(s)
4. System updates remaining balance

## Configuration

### Plan Settings (Admin Panel → Settings)

Configure subscription plans:
- **Price**: Subscription cost
- **Salads**: Number of salads included
- **Validity Days**: How long subscription is valid
- **Grace Period Days**: Extra days after expiry

### Default Configuration

**Biweekly Plan:**
- Price: 75 SAR
- Salads: 15
- Validity: 15 days
- Grace Period: 3 days

**Monthly Plan:**
- Price: 180 SAR
- Salads: 30
- Validity: 30 days
- Grace Period: 5 days

## API Routes

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/staff/login` - Staff login (currently disabled)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get current session

### Customers
- `GET /api/customers` - List customers
- `POST /api/customers` - Register new customer

### Subscriptions
- `GET /api/subscriptions` - List subscriptions
- `POST /api/subscriptions/activate` - Activate subscription
- `GET /api/subscriptions/pending` - List pending subscriptions
- `GET /api/subscriptions/search` - Search subscriptions
- `POST /api/subscriptions/[id]/refund` - Refund subscription

### Redemptions
- `POST /api/redemptions/dispense` - Dispense salad
- `GET /api/redemptions/list` - List redemptions
- `GET /api/redemptions/search` - Search redemptions
- `GET /api/redemptions/[subscriptionId]/history` - Get redemption history

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/config` - Get configuration
- `PUT /api/admin/config` - Update configuration
- `GET /api/admin/staff` - List staff
- `POST /api/admin/staff` - Add staff
- `DELETE /api/admin/staff` - Remove staff
- `GET /api/admin/export` - Export data

## Internationalization

The app supports Arabic (primary) and English:
- Translation files: `messages/ar.json`, `messages/en.json`
- Default language: Arabic
- Language switching available in UI

## Security Features

- **JWT Authentication**: Secure session management
- **Rate Limiting**: Protect against brute force attacks
- **SQL Injection Protection**: Parameterized queries via Supabase
- **XSS Protection**: React's built-in sanitization
- **CSRF Protection**: SameSite cookies
- **Row Level Security**: Supabase RLS policies

## Database Schema

### Main Tables
- `customers` - Customer information
- `subscriptions` - Subscription records
- `redemptions` - Salad redemption history
- `staff` - Staff accounts
- `admins` - Admin accounts
- `config` - System configuration
- `audit_log` - Activity audit trail

## Development

### Build for Production
```bash
npm run build
```

### Run Production Server
```bash
npm start
```

### Linting
```bash
npm run lint
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `NODE_ENV` | Environment (development/production) | Auto |

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

### Other Platforms
- Ensure Node.js 18+ support
- Set environment variables
- Run `npm run build && npm start`

## License

[Add your license here]

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Built with Next.js and Supabase
- Designed for Salad Subscription Management
