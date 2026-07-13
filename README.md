# Creative Group - Real Estate Web App & CRM

This is a full-stack, production-ready Real Estate Web Application and CRM built for **Creative Group** (Gwalior, MP).

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Database:** Neon PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** NextAuth.js v5 (Credentials only: Admin & Brokers)
- **Media Storage:** Cloudinary (Signed uploads directly from browser)
- **Emails:** Resend (Transactional emails for leads, signups, and withdrawals)
- **Styling:** Tailwind CSS (Modern, dark-theme aesthetic)

## 🏗️ Getting Started

### 1. Environment Variables
Copy `.env.example` to `.env.local` and fill in all the required credentials:
```bash
cp .env.example .env.local
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
Ensure your Neon PostgreSQL connection string is set in `.env.local`, then run:
```bash
npm run db:push
npm run db:seed
```
*The seed script creates the default Admin user (`admin@creativegroup.in` / `Admin@123`) and initial site settings.*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 👥 Access Portals
- **Admin Panel:** `/admin` (or click "Admin Login" on the login page)
- **Broker Portal:** `/broker` (or click "Broker Login" on the login page)

## 📁 Key Features
- **Public Website:** Dynamic project listings (Running, Upcoming, Completed), Image/Video Gallery, Contact form with WhatsApp redirect.
- **Admin CRM:** Manage projects, brokers, gallery media, leads, and process withdrawal requests. Approve/Reject broker payouts.
- **Broker System:** Brokers get unique affiliate links. Leads generated via their link are automatically attributed to them. Real-time earnings dashboard and PDF report generation.
