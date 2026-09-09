cat << 'EOF' > README.md
# DevRev Support & Escalation Engine 🚀

A real-time, light-themed, AI-triaged customer support and escalation portal built with **Next.js 15**, **NextAuth.js**, **SQLite**, and **Tailwind CSS**. 

This system bridges frontline customer operations with engineering backlogs by automatically triaging incoming ticket descriptions, generating executive summaries, computing severity levels, and providing a unified operational dashboard.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Next.js 15 (App Router)
* **AI Engine:** Google Gemini 2.5 Flash (`@google/genai`)
* **Database:** SQLite (`better-sqlite3` with Vercel `/tmp` execution context)
* **Authentication:** NextAuth.js
* **Styling:** Tailwind CSS
* **Language:** TypeScript
* **Deployment:** Vercel

---
## ✨ Features & AI 

1. **Secure Admin Authentication:** Protected dashboard access guarded by root-level NextAuth session checks.
2. **Real-Time Dashboard Metrics:** Live aggregation cards tracking **Total Volume**, **Untriaged Issues**, and **High Priority** tickets.
3. **Automated AI Triage:** Next.js API routes call Gemini 2.5 Flash to automatically extract:
  * **Category:** Enforced enums (`BUG`, `BILLING`, `FEATURE_REQUEST`).
  * **Priority:** Enforced enums (`HIGH`, `MEDIUM`, `LOW`).
4. **CRUD Ticket Workflow:**
   - **Create:** Modal overlay (`+ New Ticket`) triggering server-side triage and SQLite insertion.
   - **Read:** Active escalation table display with live status badges.
   - **Update:** Interactive dropdown firing real-time `PATCH` requests to update lifecycle stages (`UNTRIAGED`, `IN_PROGRESS`, `RESOLVED`).

---

## 📋 System Data Schema

The SQLite database (`tickets.db`) holds records structured under the following schema:

| Field | Data Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key (Auto-incrementing unique identifier) |
| `title` | `TEXT` | High-level problem summary submitted by customer |
| `description` | `TEXT` | Detailed issue context parsed by the AI triage engine |
| `customer` | `TEXT` | Customer email address linking issues to accounts |
| `category` | `TEXT` | Auto-classified label (`BUG`, `BILLING`, `FEATURE_REQUEST`) |
| `priority` | `TEXT` | Auto-computed severity score (`HIGH`, `MEDIUM`, `LOW`) |
| `status` | `TEXT` | Live lifecycle state (`UNTRIAGED`, `IN_PROGRESS`, `RESOLVED`) |
| `summary` | `TEXT` | Inline AI-generated technical summary for engineers |

---

## 🚀 Local Development Setup

Follow these step-by-step instructions to get the application running on your local machine.

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** / **pnpm**
- **Git**

---

### Step 1: Clone the Repository

```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git)
cd YOUR_REPO_NAME


### Step 2: Install Dependencies
Install all required NPM packages:

npm install

### Step 3: Configure Environment Variables
Create a .env.local file in the root of your project:

touch .env.local

Add the following environment variables to .env.local:

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# Google Gemini API Key
GEMINI_API_KEY=AIzaSy...

💡 Note: You can generate a random secret for NEXTAUTH_SECRET by running openssl rand -base64 32 in your terminal.


### Step 4: Initialize the Local SQLite Database
The app uses SQLite (tickets.db). Make sure your database file exists or initialize it with sample schema:

# If your project includes a database seed or initialization script:
npm run db:init  # (or ensure tickets.db is in your project directory)



### Step 5: Run the Development Server
Start the Next.js development server:

npm run dev

Open http://localhost:3000 in your browser to view the application.


### Step 6: Log In & Test
Use the default admin credentials to access the operational dashboard:

Username / Email: admin

Password: devrev2026


API Route Specifications
The application exposes the following RESTful route handlers under /api:

1. GET /api/tickets
Fetches all tickets from the SQLite database.

Response: 200 OK (JSON Array of ticket entities)

2. POST /api/tickets
Submits a new ticket, executes AI triage logic inline, and inserts the record into SQLite.

{
  "title": "Cannot process credit card payment",
  "description": "Customer gets a 500 error on the checkout page when trying to pay with Visa.",
  "customer": "enterprise_client@acme.com"
}

Response: 201 Created (Returns newly created ticket record with category, priority, and summary)


3. PATCH /api/tickets/[id]
Updates the status or details of a specific ticket by ID.

{
  "status": "IN_PROGRESS"
}

Response: 200 OK


☁️ Deployment on Vercel
This repository is optimized for deployment on Vercel:

1.Push your latest code to GitHub (git push origin main)
2. Import your GitHub repository into the Vercel Dashboard
3.In Project Settings -> Environment Variables, add NEXTAUTH_SECRET , GEMINI_API_KEY and NEXTAUTH_URL
4. Click Deploy. Vercel will automatically compile the Next.js App Router endpoints as serverless functions.

