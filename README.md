# 🌙 Beatrice's Sacred Companion

An AI-powered spiritual companion app that offers personalized mentorship through Beatrice (powered by Anthropic's Claude), dynamic journaling, ritual tracking, and magical correspondence integration.

## ✨ Features

### Phase 1 (MVP - Current)
- **AI Chat with Beatrice**: Personalized spiritual guidance powered by Claude
- **User Authentication**: Secure login with email/password and Google OAuth
- **User Profiles**: Spiritual journey tracking and personalization
- **Conversation Memory**: Persistent chat history and context awareness
- **Beautiful Mystical UI**: Spiritual-themed interface with animations

### Phase 2 (Current Development)
- **Digital Grimoire**: ✅ Complete - Customizable spell and ritual templates with correspondence integration
- **Correspondence Database**: ✅ Complete - Comprehensive magical correspondences with search and filtering
- **Digital Journal**: AI-enhanced reflective journaling
- **Ritual Tracking**: Log and track spiritual practices with photos
- **Inventory Management**: Track spiritual materials and supplies

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Anthropic API key for Claude

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd sacred-companion
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

4. **Set up Supabase**

a. Create a new Supabase project at [supabase.com](https://supabase.com)

b. Run the database migrations:
   - Go to SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Run the SQL to create tables and security policies

c. Enable Google OAuth (optional):
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your Google OAuth credentials
   - Set redirect URL to `http://localhost:3000/auth/callback`

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/           # Chat API endpoints
│   ├── components/
│   │   ├── auth/          # Authentication components
│   │   └── chat/          # Chat interface components
│   ├── dashboard/         # Main dashboard page
│   ├── lib/
│   │   ├── ai/           # AI/Beatrice integration
│   │   └── data/         # Database helpers
│   └── login/            # Login page
├── middleware.ts         # Auth middleware
└── types/               # TypeScript definitions
```

## 🔧 Configuration

### Supabase Setup

1. **Authentication**
   - Email/Password authentication is enabled by default
   - Configure OAuth providers in Supabase dashboard

2. **Row Level Security (RLS)**
   - All tables have RLS enabled
   - Users can only access their own data
   - Correspondences are read-only for all users

3. **Database Indexes**
   - Optimized for chat history queries
   - Full-text search on correspondences
   - Vector similarity search ready (pgvector)

### AI Configuration

The app uses Anthropic's Claude for Beatrice's responses. The AI system:
- Maintains conversation context
- Provides personalized spiritual guidance
- References user's spiritual profile
- Can search magical correspondences

## 🛠️ Development

### Key Technologies
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **AI**: Anthropic Claude API
- **Styling**: Tailwind CSS with custom mystical theme

### Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Adding New Features

1. **New API Routes**: Add to `src/app/api/`
2. **New Components**: Add to `src/app/components/`
3. **Database Changes**: Create new migration in `supabase/migrations/`
4. **AI Enhancements**: Update `src/app/lib/ai/beatrice.ts`

## 📊 Database Schema

Key tables:
- `user_spiritual_profiles`: User profiles and preferences
- `conversations`: Chat conversation containers
- `messages`: Individual chat messages
- `journal_entries`: User journal entries
- `rituals`: Ritual tracking
- `correspondences`: Magical correspondence database

See `supabase/migrations/001_initial_schema.sql` for full schema.

## 🔐 Security

- All user data is protected with Row Level Security (RLS)
- Authentication required for all API endpoints
- Encrypted storage for sensitive data
- API keys stored securely in environment variables
- Rate limiting ready to implement

## 🎨 Customization

### Theming
The app uses a mystical purple/indigo color scheme. Customize in:
- `src/app/globals.css` for global styles
- Tailwind classes throughout components
- Custom animations in global CSS

### AI Personality
Customize Beatrice's personality in:
- `src/app/lib/ai/beatrice.ts` - System prompt and behavior

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

## 📈 Roadmap

### Phase 1 (Current) ✅
- Basic chat with Beatrice
- User authentication
- Profile management

### Phase 2 (Current) ✅
- Digital Grimoire with correspondence integration
- Correspondence database with search and filtering
- Enhanced tagging system

### Phase 3 (Next)
- Journal entries with AI reflection
- Basic ritual tracking
- Book of Shadows integration

### Phase 4
- Inventory management
- Purchase tracking
- Community features

## 🤝 Contributing

This is currently a solo developer project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

[Your chosen license]

## 🙏 Acknowledgments

- Anthropic for Claude AI
- Supabase for the backend platform
- The spiritual and magical community for inspiration

## 💬 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact [your contact info]

---

*Built with love and intention for the modern spiritual practitioner* 🌟