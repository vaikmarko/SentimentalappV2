# MentalOS V2: Development Plan

## 🎯 Vision
**Visual mind mapping + Claude AI + Friend validation = Magical self-discovery**

Like Cursor makes non-coders feel like programming wizards, we make people feel like psychological detectives exploring their own minds.

## 🚀 8-Week Development Plan

### Week 1-2: Foundation
- **Frontend**: React app with basic mind map visualization (D3.js or similar)
- **Backend**: Supabase setup with user auth and basic schema
- **AI**: Claude API integration for conversational insights
- **Goal**: Users can chat and see their thoughts as connected nodes

### Week 3-4: Core Magic
- **Pattern Recognition**: "I notice you mention X often in these contexts"
- **Friend Perspectives**: Share link → friend answers questions → updates your profile
- **Data Import**: Copy/paste conversations from ChatGPT, WhatsApp, etc.
- **Goal**: Users experience "I never noticed that!" moments

### Week 5-8: University Pilot
- **Deploy**: Stable version for 100 students
- **Measure**: 70% weekly usage, "this is magical" feedback
- **Iterate**: Based on student feedback and usage patterns
- **Goal**: Proven product-market fit with students

## 🧠 Core User Experience

1. **Natural Conversation**: Talk to Claude about thoughts, feelings, experiences
2. **Visual Patterns**: See how topics connect in interactive mind map
3. **Friend Validation**: "How does my partner see my communication style?"
4. **Progressive Discovery**: Unlock deeper insights as profile develops
5. **Pattern Recognition**: "You've mentioned feeling overwhelmed in these 5 situations"

## 🛠 Technical Stack

### Frontend
- **React + Vite**: Fast development and building
- **D3.js/Cytoscape**: Interactive mind map visualization
- **Tailwind CSS**: Rapid styling
- **Supabase JS**: Real-time data and auth

### Backend
- **Supabase**: PostgreSQL database, real-time subscriptions, auth
- **Edge Functions**: Claude API integration, pattern analysis
- **Row Level Security**: User data privacy

### AI & Data
- **Claude API**: Conversational insights and pattern recognition
- **PostgreSQL**: Graph-like relationships between thoughts/emotions
- **Vector embeddings**: Semantic similarity for pattern matching

## 📊 Success Metrics

### Week 2 Targets
- Users can chat and see visual mind map
- Basic pattern recognition working
- Secure deployment ready

### Week 4 Targets  
- Friend perspective system functional
- Data import from external sources
- 5-10 beta users providing feedback

### Week 8 Targets
- 100 university students using regularly
- 70% weekly active usage
- Average session >15 minutes
- "This is magical" qualitative feedback
- Clear patterns in user behavior data

## 🔒 Security & Privacy
- All API keys in environment variables (never git)
- User data encrypted and isolated
- Friend sharing with explicit consent
- Clear data deletion policies

---
**Next: Set up Supabase project and Claude API access**
