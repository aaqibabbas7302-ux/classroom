# AI Teacher - Student Personal Tutor

A modern web application for students to learn with AI-powered tutors. Features an Indian classroom blackboard theme with Clerk authentication and Supabase database.

## Features

- 🎓 **AI-Powered Learning**: Connect your n8n AI agents for personalized tutoring
- 📚 **Multiple Subjects**: Create unlimited subjects with custom colors
- 💬 **WhatsApp-Style Chat**: Natural conversation interface
- 🔐 **Secure Authentication**: Powered by Clerk
- ☁️ **Cloud Storage**: All data stored in Supabase
- 🎨 **Indian Classroom Theme**: Beautiful blackboard design with tricolor accents

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Styling**: Custom CSS with Indian classroom theme

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd student
npm install
```

### 2. Set Up Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy your API keys

### 3. Set Up Supabase Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to SQL Editor and run the schema from `supabase-schema.sql`
4. Copy your project URL and anon key from Settings > API

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
```

### 5. Configure Supabase RLS (Optional for Development)

For easier development, you can disable RLS temporarily:

1. Go to Supabase Dashboard > Authentication > Policies
2. For `subjects` and `messages` tables, add a policy:
   - Policy name: "Enable all access"
   - Target roles: All
   - USING expression: `true`
   - WITH CHECK expression: `true`

### 6. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Setting Up n8n AI Agent

To use the AI Teacher, you need to set up an n8n workflow:

1. Create a new workflow in n8n
2. Add a **Webhook** trigger node
3. Add your AI agent (OpenAI, Anthropic, etc.)
4. Configure the response to return JSON with one of these fields:
   - `response`
   - `message`
   - `output`
   - `text`
   - `reply`
   - `answer`

Example n8n workflow:
```
[Webhook] → [OpenAI Chat] → [Respond to Webhook]
```

The webhook will receive:
```json
{
  "message": "User's question",
  "subject": "Subject name",
  "timestamp": "ISO timestamp",
  "sessionId": "Subject UUID",
  "userId": "Clerk user ID"
}
```

## Project Structure

```
student/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Main dashboard with chat
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx   # Sign in page
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/
│   │   │       └── page.tsx   # Sign up page
│   │   ├── globals.css        # Global styles with theme
│   │   ├── layout.tsx         # Root layout with Clerk
│   │   └── page.tsx           # Landing page
│   ├── lib/
│   │   └── supabase.ts        # Supabase client & types
│   └── middleware.ts          # Clerk middleware
├── supabase-schema.sql        # Database schema
├── .env.local.example         # Environment variables template
├── package.json
└── README.md
```

## License

MIT
