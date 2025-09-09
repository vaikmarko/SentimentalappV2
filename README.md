# SentimentalApp V2: The Psychology Cursor

## 🧠 What This Is
Visual mind mapping + Claude AI + Friend validation = Magical self-discovery

Like Cursor makes coding feel magical, we make psychology feel magical.

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Add your keys to .env:
# - CLAUDE_API_KEY=your_key_here
# - SUPABASE_URL=your_url_here
# - SUPABASE_ANON_KEY=your_key_here
```

### 2. Install & Run
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (Supabase)
npx supabase start
```

## 📁 Project Structure
```
├── frontend/          ← React mind mapping interface
├── supabase/         ← Database schema + edge functions  
├── docs/             ← Documentation
├── .env.example      ← Environment template (safe to commit)
├── .env              ← Your secrets (NEVER commit)
└── README.md         ← You are here
```

## 🎯 Development Goals
- **Week 1-2**: Foundation (Claude + mind mapping)
- **Week 3-4**: Core Magic (patterns + friends)
- **Week 5-8**: University pilot (100 students)

## 🔒 Security
- **ALL SECRETS** go in `.env` file (never committed)
- Check `.gitignore` before committing
- Use `.env.example` as template for others

## 🧪 Testing with Students
Target: 100 university students saying "this is magical"

---
**Let's build something that changes how people understand themselves** 🚀
