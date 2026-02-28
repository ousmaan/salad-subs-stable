# Local Development Setup Instructions

## Quick Start Guide

### First Time Setup

1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/
   - Choose LTS version (20.x or higher)
   - Install with default settings

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Open `.env.local` and add your Supabase credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     JWT_SECRET=your_jwt_secret
     ```

3. **Create Desktop Shortcut**
   - Right-click `create-desktop-shortcut.ps1`
   - Select "Run with PowerShell"
   - If you see a security warning, choose "Run anyway"
   - A shortcut will be created on your desktop

### Running the Application

**Method 1: Desktop Shortcut (Recommended)**
- Double-click "Salad Subscription System" on your desktop
- Wait for the server to start (takes ~10-30 seconds)
- Browser will open automatically at http://localhost:3000

**Method 2: Manual Start**
- Double-click `start-salad-subs.bat` in the project folder
- Or open Command Prompt, navigate to project folder, and run:
  ```cmd
  npm run dev
  ```

### Accessing the Application

Once the server is running:
- **Main Page**: http://localhost:3000
- **Staff Portal**: http://localhost:3000/ar/staff/login
- **Admin Portal**: http://localhost:3000/ar/admin/login

### Stopping the Server

- Press `Ctrl+C` in the command window
- Or simply close the command window

## Troubleshooting

### Problem: "npm is not recognized"
**Solution**: Node.js is not installed or not in PATH
- Install Node.js from https://nodejs.org/
- Restart your computer after installation

### Problem: "Dependencies installation failed"
**Solution**: 
- Check your internet connection
- Delete `node_modules` folder and try again
- Run `npm cache clean --force` then try again

### Problem: ".env.local not found"
**Solution**: 
- Copy `.env.example` to `.env.local`
- Add your Supabase credentials

### Problem: "Port 3000 is already in use"
**Solution**:
- Close other applications using port 3000
- Or edit `package.json` and change the port:
  ```json
  "dev": "next dev -p 3001"
  ```

### Problem: "Cannot connect to database"
**Solution**:
- Check your `.env.local` has correct Supabase credentials
- Verify your Supabase project is active
- Check your internet connection

## Database Setup

If you haven't set up the database yet:

1. Go to your Supabase project SQL Editor
2. Run migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_functions_triggers.sql`
   - `supabase/migrations/004_add_otp_field.sql`
   - `supabase/migrations/005_add_receipt_number.sql`
   - `supabase/migrations/006_change_weekly_to_biweekly.sql`

3. (Optional) Run `supabase/seed.sql` to add sample data

## Updates

To update the application:
1. Pull latest changes from GitHub
2. Delete the desktop shortcut
3. Run `create-desktop-shortcut.ps1` again
4. Dependencies will auto-update on next run

## Support

For issues, check:
- README.md for detailed documentation
- GitHub Issues for known problems
- Supabase dashboard for database status
