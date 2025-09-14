# SentimentalApp V2: The Future of Self-Discovery

## 🧠 Vision: "Cursor for Psychology"
**Visual mind mapping + Claude AI + Friend validation = Magical self-discovery**

Like Cursor makes non-coders feel like programming wizards, we're making people feel like psychological detectives exploring their own minds.

## 📚 Complete Documentation Suite

### 🎯 **Start Here: Core Documents**
1. **[📋 Complete Development Plan](docs/COMPLETE_DEVELOPMENT_PLAN.md)** - Everything needed to build this successfully
2. **[🏗️ Technical Specifications](docs/TECHNICAL_SPECIFICATIONS.md)** - Detailed implementation guide  
3. **[🧪 Testing Plan](docs/TESTING_PLAN.md)** - Comprehensive testing strategy
4. **[📁 Legacy Documentation](docs/legacy/)** - Reference from original system

### 🚀 **What Makes This Revolutionary**

#### **The Experience We're Creating**
```
User Journey:
💬 Natural conversation with Claude AI
    ↓
🧠 Thoughts become visual mind map nodes  
    ↓
🔗 AI discovers patterns and connections
    ↓
👥 Friends validate your self-perceptions
    ↓
✨ "I never noticed that about myself!"
```

#### **Core Features**
- **🗺️ Mind Mapping**: See your thoughts as interconnected visual networks
- **🤖 Claude Integration**: AI that understands psychology and finds patterns
- **👭 Social Validation**: Friends provide external perspectives on how they see you
- **📊 Pattern Recognition**: Discover recurring themes in your thinking and emotions
- **📱 Progressive Discovery**: Deeper insights unlock as your profile develops

## 🛠 Development Stack

### **Frontend**
- **React 18 + Vite** - Fast development and building
- **React Flow** - Interactive mind map visualization  
- **Tailwind CSS** - Rapid, consistent styling
- **React Query** - Server state management
- **TypeScript** - Type safety for critical components

### **Backend**
- **Supabase** - PostgreSQL + real-time + auth + edge functions
- **Claude API** - Conversational AI and pattern analysis
- **Vercel** - Deployment and hosting

### **Development Tools**
- **Jest + React Testing Library** - Unit testing
- **Playwright** - End-to-end testing
- **GitHub Actions** - CI/CD pipeline
- **Sentry** - Error monitoring

## 🚀 Quick Start Guide

### **1. Prerequisites**
```bash
# Required accounts:
# - Supabase account (supabase.com)
# - Claude API key (console.anthropic.com)
# - Vercel account (vercel.com) - for deployment

# Required tools:
node --version  # v18 or higher
npm --version   # v8 or higher
git --version   # v2.0 or higher
```

### **2. Environment Setup**
```bash
# Clone and setup
git clone https://github.com/vaikmarko/SentimentalappV2.git
cd SentimentalappV2

# Copy environment template
cp env.template .env

# Add your API keys to .env:
CLAUDE_API_KEY=your_claude_key_here
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### **3. Database Setup**
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase (if not already done)
supabase init

# Start local development
supabase start

# Apply database schema
supabase db reset
```

### **4. Development**
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# In another terminal - run tests
npm run test

# Run E2E tests
npm run test:e2e
```

## 📊 Success Metrics

### **Week 2 Targets**
- [ ] Users can chat and see visual mind map update in real-time
- [ ] Basic pattern recognition identifies themes in conversations  
- [ ] <2 second page load time, <1 second mind map rendering
- [ ] 100% of test users complete onboarding successfully

### **Week 4 Targets**
- [ ] Friend perspective system functional with >75% completion rate
- [ ] Users can import conversations from ChatGPT, WhatsApp, etc.
- [ ] Users report "discovering something new about themselves"
- [ ] 5-10 beta users providing regular feedback

### **Week 8 Targets (University Pilot)**
- [ ] 100 university students enrolled and actively using
- [ ] 70% weekly active usage rate  
- [ ] 15+ minute average session duration
- [ ] 60%+ report "magical" experience in feedback
- [ ] Statistically significant improvement in self-awareness scores

## 🔒 Security & Privacy

### **Security First Approach**
- ✅ **No secrets in git** - Comprehensive `.gitignore` and `env.template`
- ✅ **Row Level Security** - Database policies ensure users only access their data
- ✅ **Input validation** - All user inputs sanitized and validated  
- ✅ **API rate limiting** - Prevent abuse of Claude and database APIs
- ✅ **Encrypted data** - All sensitive data encrypted at rest and in transit

### **Privacy Controls**
- **Local-first default**: Data stays in user's control
- **Granular sharing**: Users choose exactly what friends can see
- **Easy data export**: Complete data portability
- **Right to deletion**: One-click complete data removal

## 🧪 Testing Strategy

### **Automated Testing (60% of effort)**
- **Unit Tests**: Jest + React Testing Library for components
- **Integration Tests**: API and database interaction testing
- **E2E Tests**: Playwright for critical user journeys
- **Performance Tests**: Load testing and Core Web Vitals monitoring

### **User Testing (40% of effort)**
- **Phase 1**: Internal testing (5-8 people, 1 week)
- **Phase 2**: Beta testing (25-30 external users, 2 weeks)  
- **Phase 3**: University pilot (100 students, 4+ weeks)

## 👥 Target Audience

### **Primary: University Students (18-25)**
- Interested in self-discovery and personal growth
- Comfortable with technology and AI
- Value peer perspectives and social validation
- Have time to engage deeply with the platform

### **Secondary: Young Professionals (25-35)**
- Seeking better self-understanding for career/relationships
- Less time but higher disposable income
- Value efficiency and actionable insights

## 🎯 Unique Value Proposition

### **What Makes This Different**
1. **Visual Pattern Recognition** - First platform to show psychological patterns as interactive mind maps
2. **Social Validation** - Only system that integrates friend perspectives for self-discovery
3. **Conversational Interface** - Natural chat vs boring forms and questionnaires  
4. **AI-Powered Insights** - Claude's advanced reasoning applied to psychology
5. **Progressive Discovery** - Unlockable depth keeps users engaged long-term

### **Competitive Advantages**
- **Technical**: Advanced AI + real-time visualization + social features
- **User Experience**: "Magical" feeling vs clinical/medical approach
- **Network Effects**: Value increases as more friends participate
- **Scientific Grounding**: Based on established psychology research

## 📈 Business Model (Future)

### **Freemium Approach**
- **Free Tier**: Basic self-discovery features, 1 friend perspective/month
- **Pro Tier** ($9.99/month): Unlimited friend perspectives, advanced patterns, export features
- **Therapist Tier** ($29.99/month): Professional tools, client collaboration features
- **Enterprise**: Corporate wellness programs and team building tools

## 🚦 Development Phases

### **Phase 1: Foundation (Weeks 1-2)**
Focus: Core functionality that creates "wow" moments
- Claude API integration with natural conversation
- Basic mind map visualization with real-time updates
- User authentication and profile system
- Pattern recognition for common themes

### **Phase 2: Social Features (Weeks 3-4)**  
Focus: External perspective validation
- Friend invitation and response system
- Perspective comparison and insight generation
- Data import from external conversations
- Enhanced pattern analysis

### **Phase 3: Polish & Scale (Weeks 5-8)**
Focus: Production readiness and user research
- Performance optimization and mobile support
- Comprehensive testing and bug fixes
- University pilot deployment and monitoring
- User feedback integration and iteration

## 🔄 Continuous Improvement

### **Development Workflow**
1. **Feature Development**: Follow technical specifications
2. **Testing**: Automated tests + manual QA  
3. **User Feedback**: Regular testing sessions and surveys
4. **Iteration**: Data-driven improvements based on usage analytics
5. **Documentation**: Keep all docs updated with changes

### **Quality Gates**
- ✅ All automated tests pass
- ✅ Performance benchmarks met  
- ✅ Security scan clean
- ✅ User testing shows positive sentiment
- ✅ Documentation updated

## 🤝 Contributing

### **Development Standards**
- **Code Style**: ESLint + Prettier configuration
- **Testing**: >80% coverage for core functionality  
- **Documentation**: Update relevant docs with each PR
- **Review**: All changes require code review
- **Security**: Run security checks before committing

### **Getting Help**
- **Technical Issues**: Check technical specifications document
- **Testing Questions**: Refer to testing plan
- **General Questions**: Review complete development plan

## 🎉 Next Steps

### **Immediate Actions (This Week)**
1. **Set up development environment** using quick start guide
2. **Get API keys** from Supabase and Anthropic
3. **Review technical specifications** for implementation details
4. **Start with Week 1 tasks** from development plan

### **Success Indicators**
- Development environment runs without errors
- Can create Supabase account and project  
- Claude API responds to test requests
- Mind map renders basic nodes and edges

---

## 📞 Support & Resources

- **📋 [Development Plan](docs/COMPLETE_DEVELOPMENT_PLAN.md)** - Complete roadmap and specifications
- **🏗️ [Technical Specs](docs/TECHNICAL_SPECIFICATIONS.md)** - Implementation details
- **🧪 [Testing Plan](docs/TESTING_PLAN.md)** - Quality assurance strategy  
- **🔧 [Legacy Docs](docs/legacy/)** - Reference from original system

**Ready to build the future of self-discovery? Let's make psychology feel as magical as Cursor makes coding feel.** ✨🚀
