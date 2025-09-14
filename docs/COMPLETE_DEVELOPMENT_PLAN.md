# SentimentalApp V2: Complete Development Plan

## 🎯 Project Vision
**Build the "Cursor for Psychology" - Visual mind mapping + Claude AI + Friend validation = Magical self-discovery**

Transform mental health technology by making self-understanding feel as magical as Cursor makes coding feel for non-programmers.

## 📋 Table of Contents
1. [Technical Architecture](#technical-architecture)
2. [Detailed Implementation Plan](#detailed-implementation-plan)
3. [Testing Strategy](#testing-strategy)
4. [User Stories & Acceptance Criteria](#user-stories--acceptance-criteria)
5. [Risk Mitigation](#risk-mitigation)
6. [Performance Requirements](#performance-requirements)
7. [Deployment Strategy](#deployment-strategy)
8. [Quality Assurance](#quality-assurance)

---

## Technical Architecture

### System Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Supabase APIs  │    │  Claude AI API  │
│                 │    │                 │    │                 │
│ • Mind Mapping  │◄──►│ • Authentication│◄──►│ • Conversation  │
│ • Chat Interface│    │ • Real-time DB  │    │ • Pattern Recog │
│ • Friend Sharing│    │ • Edge Functions│    │ • Insight Gen   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │    PostgreSQL Database    │
                    │                           │
                    │ • User profiles          │
                    │ • Conversation history   │
                    │ • Mind map nodes/edges   │
                    │ • Pattern analysis       │
                    │ • Friend perspectives    │
                    └───────────────────────────┘
```

### Database Schema
```sql
-- Users table (handled by Supabase Auth)
-- Additional user profile data
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mind map nodes (thoughts, emotions, experiences)
CREATE TABLE mind_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('thought', 'emotion', 'experience', 'pattern', 'insight')),
  title TEXT NOT NULL,
  content TEXT,
  x_position FLOAT,
  y_position FLOAT,
  color TEXT DEFAULT '#3B82F6',
  size FLOAT DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connections between nodes
CREATE TABLE mind_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  source_node_id UUID REFERENCES mind_nodes(id) ON DELETE CASCADE,
  target_node_id UUID REFERENCES mind_nodes(id) ON DELETE CASCADE,
  relationship_type TEXT DEFAULT 'relates_to',
  strength FLOAT DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation history with Claude
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context_nodes UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friend perspective invitations
CREATE TABLE friend_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  friend_name TEXT NOT NULL,
  friend_email TEXT,
  questions JSONB NOT NULL,
  responses JSONB,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pattern recognition results
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  pattern_type TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_nodes UUID[] DEFAULT '{}',
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Frontend Architecture
```
src/
├── components/
│   ├── MindMap/
│   │   ├── MindMapCanvas.jsx      # Main visualization component
│   │   ├── Node.jsx               # Individual node component
│   │   ├── Edge.jsx               # Connection component
│   │   └── NodeEditor.jsx         # Edit node content
│   ├── Chat/
│   │   ├── ChatInterface.jsx      # Main chat component
│   │   ├── Message.jsx            # Individual message
│   │   └── InputBox.jsx           # User input
│   ├── Friends/
│   │   ├── FriendInvitation.jsx   # Create invitations
│   │   ├── InvitationView.jsx     # Friend's perspective form
│   │   └── PerspectiveResults.jsx # Show friend insights
│   └── Common/
│       ├── Layout.jsx             # App layout
│       ├── Navigation.jsx         # Top navigation
│       └── LoadingSpinner.jsx     # Loading states
├── hooks/
│   ├── useSupabase.js            # Supabase client
│   ├── useMindMap.js             # Mind map state management
│   ├── useChat.js                # Chat functionality
│   └── usePatterns.js            # Pattern recognition
├── services/
│   ├── supabase.js               # Database client
│   ├── claude.js                 # AI integration
│   └── mindMap.js                # Mind map logic
├── utils/
│   ├── constants.js              # App constants
│   ├── validation.js             # Form validation
│   └── helpers.js                # Utility functions
├── styles/
│   └── globals.css               # Global styles (Tailwind)
├── App.jsx                       # Main app component
└── main.jsx                      # Entry point
```

---

## Detailed Implementation Plan

### Phase 1: Foundation (Weeks 1-2)

#### Week 1: Development Environment & Basic Structure
**Day 1-2: Environment Setup**
- [ ] Set up Supabase project
  - Create new project at supabase.com
  - Configure authentication (email/password + social login)
  - Set up database with initial schema
  - Configure Row Level Security (RLS) policies
  - Get API keys and connection strings

- [ ] Claude API Setup
  - Get API key from Anthropic Console
  - Set up environment variables
  - Create basic API client wrapper
  - Test API connection and rate limits

- [ ] Frontend Scaffolding
  - Initialize React + Vite project
  - Install dependencies (React, Supabase JS, D3/Cytoscape, Tailwind)
  - Set up basic routing (React Router)
  - Configure build and development scripts

**Day 3-4: Authentication & User Management**
- [ ] Implement user authentication
  - Sign up/sign in forms
  - Email verification flow
  - Password reset functionality
  - Protected routes

- [ ] User profile creation
  - Basic profile form
  - Onboarding flow
  - Profile editing
  - Data validation

**Day 5-7: Basic Mind Map Visualization**
- [ ] Choose visualization library (D3.js vs Cytoscape.js vs React Flow)
  - Performance testing with 100+ nodes
  - Mobile responsiveness
  - Touch/gesture support
  
- [ ] Implement basic mind map
  - Node creation and positioning
  - Edge drawing and manipulation
  - Zoom and pan functionality
  - Node selection and highlighting

#### Week 2: Core Functionality
**Day 1-3: Chat Interface**
- [ ] Basic chat UI
  - Message list component
  - Input field with send button
  - Message typing indicators
  - Conversation history persistence

- [ ] Claude API integration
  - Message sending to Claude
  - Response streaming (if supported)
  - Error handling and retries
  - Context management for conversations

**Day 4-5: Data Flow Integration**
- [ ] Connect chat to mind map
  - Extract entities from conversations
  - Create nodes automatically
  - Show conversation context in mind map
  - Real-time updates

**Day 6-7: Basic Pattern Recognition**
- [ ] Simple pattern detection
  - Keyword frequency analysis
  - Emotion detection in text
  - Topic clustering
  - Pattern visualization in mind map

### Phase 2: Core Features (Weeks 3-4)

#### Week 3: Advanced Pattern Recognition
**Day 1-3: Conversation Analysis**
- [ ] Implement advanced pattern recognition
  - Sentiment analysis over time
  - Topic modeling and clustering
  - Relationship extraction
  - Temporal pattern analysis

- [ ] Visual pattern representation
  - Pattern highlight in mind map
  - Pattern strength visualization
  - Pattern evolution over time
  - Interactive pattern exploration

**Day 4-5: Data Import System**
- [ ] Copy/paste conversation import
  - Text format detection (WhatsApp, ChatGPT, etc.)
  - Conversation parsing and structuring
  - Batch processing of large imports
  - Progress indicators and error handling

**Day 6-7: Enhanced Mind Map**
- [ ] Advanced mind map features
  - Different node types and styles
  - Edge types and properties
  - Clustering and grouping
  - Search and filter functionality

#### Week 4: Friend Perspectives
**Day 1-3: Friend Invitation System**
- [ ] Create invitation flow
  - Friend information form
  - Question generation based on user profile
  - Unique invitation links with tokens
  - Email notification system (optional)

**Day 4-5: Friend Response Interface**
- [ ] Friend perspective form
  - Mobile-friendly questionnaire
  - Progress tracking
  - Response validation
  - Thank you and completion flow

**Day 6-7: Integration and Analysis**
- [ ] Process friend responses
  - Compare friend vs self perspectives
  - Generate insights from differences
  - Update mind map with friend insights
  - Highlight areas of agreement/disagreement

### Phase 3: Polish & Testing (Weeks 5-8)

#### Week 5-6: User Experience Polish
**Day 1-3: UI/UX Improvements**
- [ ] Mobile responsiveness
  - Touch-friendly mind map controls
  - Mobile chat interface
  - Responsive layout system
  - Performance optimization for mobile

- [ ] Accessibility improvements
  - Screen reader support
  - Keyboard navigation
  - Color contrast compliance
  - Focus management

**Day 4-7: Performance Optimization**
- [ ] Frontend performance
  - Code splitting and lazy loading
  - Image optimization
  - Bundle size optimization
  - Caching strategies

- [ ] Backend performance
  - Database query optimization
  - API response caching
  - Rate limiting implementation
  - Connection pooling

#### Week 7-8: Testing & Deployment
**Day 1-3: Comprehensive Testing**
- [ ] Automated testing implementation
- [ ] User acceptance testing
- [ ] Performance testing
- [ ] Security testing

**Day 4-7: Production Deployment**
- [ ] Production environment setup
- [ ] CI/CD pipeline implementation
- [ ] Monitoring and logging
- [ ] University pilot preparation

---

## Testing Strategy

### 1. Unit Testing
**Frontend (Jest + React Testing Library)**
```javascript
// Example test structure
describe('MindMapCanvas', () => {
  test('renders nodes correctly', () => {
    // Test node rendering
  });
  
  test('handles node creation', () => {
    // Test node creation flow
  });
  
  test('connects nodes with edges', () => {
    // Test edge creation
  });
});

describe('ChatInterface', () => {
  test('sends messages to Claude API', () => {
    // Mock API calls, test message flow
  });
  
  test('displays conversation history', () => {
    // Test message persistence and display
  });
});
```

**Backend (Supabase Edge Functions + Deno)**
```javascript
// Test Claude API integration
Deno.test('Claude API Integration', async () => {
  // Test API connection, response handling, error scenarios
});

// Test database operations
Deno.test('Database Operations', async () => {
  // Test CRUD operations, RLS policies
});
```

### 2. Integration Testing
- **API Integration Tests**: Test all Supabase and Claude API interactions
- **Database Integration**: Test complex queries and transactions
- **Real-time Features**: Test WebSocket connections and live updates

### 3. End-to-End Testing (Playwright)
```javascript
// Example E2E test scenarios
test('Complete user journey', async ({ page }) => {
  // 1. User signs up
  // 2. Completes onboarding
  // 3. Has conversation with Claude
  // 4. Sees mind map update
  // 5. Invites friend
  // 6. Friend responds
  // 7. User sees updated insights
});

test('Mobile user experience', async ({ page }) => {
  // Test mobile-specific interactions
});
```

### 4. User Testing Protocol
**Phase 1: Internal Testing (Week 5)**
- 5-10 team members and friends
- Focus on core functionality and major bugs
- Collect qualitative feedback on user experience

**Phase 2: Beta Testing (Week 6-7)**
- 20-30 external users
- Mix of target demographics
- Structured feedback collection
- Performance monitoring

**Phase 3: University Pilot (Week 8)**
- 100 students
- Formal study protocol
- Pre/post surveys
- Usage analytics
- Weekly check-ins

### 5. Performance Testing
**Load Testing**
- 1000 concurrent users
- Database performance under load
- API response times
- Mind map rendering performance

**Stress Testing**
- Large mind maps (500+ nodes)
- Long conversation histories (1000+ messages)
- Multiple friend perspectives per user

---

## User Stories & Acceptance Criteria

### Epic 1: Self-Discovery Through Conversation
**User Story 1**: As a new user, I want to have my first conversation with the AI so I can start understanding myself better.

**Acceptance Criteria:**
- [ ] User can sign up and complete onboarding in <5 minutes
- [ ] First conversation feels natural and engaging
- [ ] AI asks thoughtful follow-up questions
- [ ] User sees at least 3 nodes appear in their mind map after first conversation
- [ ] User feels curious to continue ("I want to explore more")

**User Story 2**: As a returning user, I want to see how my thoughts connect so I can discover patterns in my thinking.

**Acceptance Criteria:**
- [ ] User can see visual connections between related topics
- [ ] Clicking on a node shows related conversations
- [ ] Patterns are highlighted with explanations
- [ ] User can explore connections by clicking through nodes
- [ ] At least 60% of users report "discovering something new about themselves"

### Epic 2: External Perspective Validation
**User Story 3**: As a user seeking validation, I want to invite my partner to share their perspective so I can see how they view me.

**Acceptance Criteria:**
- [ ] User can create invitation in <2 minutes
- [ ] Friend receives clear, engaging questionnaire
- [ ] Friend can complete questionnaire in <10 minutes
- [ ] User sees friend's perspective integrated into their mind map
- [ ] Differences between self and friend perspectives are clearly highlighted

**User Story 4**: As a friend who received an invitation, I want to provide helpful insights so I can support my friend's self-discovery.

**Acceptance Criteria:**
- [ ] Questions feel meaningful and answerable
- [ ] Interface is mobile-friendly
- [ ] Friend feels their input will be valuable
- [ ] Completion rate >75%
- [ ] Friends report feeling good about helping

### Epic 3: Pattern Recognition and Insights
**User Story 5**: As a regular user, I want to understand my emotional patterns so I can better manage my mental health.

**Acceptance Criteria:**
- [ ] System identifies recurring themes in conversations
- [ ] Emotional patterns are visualized over time
- [ ] User receives actionable insights
- [ ] Patterns are explained in understandable language
- [ ] User can track pattern changes over time

---

## Risk Mitigation

### Technical Risks

**Risk 1: Claude API Rate Limits/Costs**
- **Mitigation**: Implement request queuing, response caching, user limits
- **Fallback**: GPT-4 integration as backup
- **Monitoring**: Track API usage and costs daily

**Risk 2: Mind Map Performance with Large Datasets**
- **Mitigation**: Implement virtualization, clustering, progressive loading
- **Testing**: Test with 1000+ nodes during development
- **Fallback**: Simplified view for large datasets

**Risk 3: Supabase Scaling Issues**
- **Mitigation**: Database optimization, connection pooling
- **Monitoring**: Track query performance and connection usage
- **Fallback**: Migration plan to dedicated PostgreSQL if needed

### User Experience Risks

**Risk 1: Users Don't Find Value Immediately**
- **Mitigation**: Optimize onboarding flow, ensure "magic moments" in first session
- **Testing**: A/B test different onboarding approaches
- **Metrics**: Track user engagement in first 3 sessions

**Risk 2: Privacy Concerns About AI and Friend Sharing**
- **Mitigation**: Clear privacy policy, granular controls, local data emphasis
- **Communication**: Transparency about data usage and security
- **Features**: Easy data export and deletion

**Risk 3: Low Friend Participation Rate**
- **Mitigation**: Make friend experience engaging and mobile-optimized
- **Incentives**: Gamification elements, completion rewards
- **Testing**: A/B test different invitation approaches

### Business Risks

**Risk 1: University Pilot Doesn't Show Clear Benefits**
- **Mitigation**: Define clear success metrics, have backup study designs
- **Preparation**: Multiple measurement approaches (quantitative + qualitative)
- **Timeline**: Allow buffer time for iteration based on early results

**Risk 2: Competitive Products Launch First**
- **Mitigation**: Focus on unique value proposition (friend validation + visual patterns)
- **Speed**: Prioritize MVP features that create differentiation
- **IP**: Consider patent applications for unique approaches

---

## Performance Requirements

### Response Time Requirements
- **Page Load**: <2 seconds initial load
- **Mind Map Rendering**: <1 second for <100 nodes
- **Chat Response**: <3 seconds for AI responses
- **Friend Form**: <500ms form interactions

### Scalability Requirements
- **Concurrent Users**: Support 1000 concurrent users
- **Data Storage**: Handle 10GB+ per 1000 users
- **API Requests**: 10,000+ requests/day
- **Database**: <100ms query response times

### Availability Requirements
- **Uptime**: 99.5% availability
- **Data Backup**: Daily automated backups
- **Recovery**: <4 hour recovery time objective
- **Monitoring**: Real-time performance monitoring

---

## Deployment Strategy

### Development Environment
- **Local Development**: Docker containers for consistency
- **Database**: Local Supabase instance
- **API Keys**: Local environment variables

### Staging Environment
- **Supabase**: Dedicated staging project
- **Deployment**: Vercel staging deployment
- **Testing**: Automated test runs on deployment
- **Data**: Synthetic test data

### Production Environment
- **Frontend**: Vercel production deployment
- **Backend**: Supabase production instance
- **CDN**: Vercel Edge Network
- **Monitoring**: Vercel Analytics + Custom dashboards

### CI/CD Pipeline
```yaml
# GitHub Actions workflow
name: Deploy SentimentalApp V2
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
      
  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
      
  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: vercel --prod
```

---

## Quality Assurance

### Code Quality Standards
- **ESLint + Prettier**: Consistent code formatting
- **TypeScript**: Type safety for critical components
- **Code Reviews**: All PRs require review
- **Test Coverage**: >80% coverage for core functionality

### Security Standards
- **Environment Variables**: All secrets in environment variables
- **RLS Policies**: Strict database access controls
- **Input Validation**: All user inputs validated and sanitized
- **Rate Limiting**: Prevent abuse of APIs

### Monitoring and Analytics
- **Error Tracking**: Sentry for error monitoring
- **Performance**: Vercel Analytics for performance metrics
- **User Analytics**: Privacy-focused usage tracking
- **Business Metrics**: Conversion rates, engagement, retention

### Documentation Standards
- **API Documentation**: OpenAPI/Swagger specs
- **Component Documentation**: Storybook for UI components
- **User Documentation**: In-app help and external guides
- **Developer Documentation**: Setup and contribution guides

---

## Success Metrics

### Week 2 Targets
- [ ] 100% of test users can complete onboarding
- [ ] Mind map renders with 20+ nodes for active users
- [ ] <2 second average response time
- [ ] 0 critical bugs in production

### Week 4 Targets
- [ ] 80% of users create at least one friend invitation
- [ ] 60% friend response rate
- [ ] Users identify avg 3+ patterns about themselves
- [ ] <1% error rate in production

### Week 8 Targets (University Pilot)
- [ ] 100 students enrolled
- [ ] 70% weekly active usage
- [ ] 15+ minute average session duration
- [ ] "This is magical" feedback from 60%+ of users
- [ ] Statistically significant improvement in self-awareness scores

---

## Next Immediate Actions

### This Week:
1. **Set up Supabase project** (Day 1)
2. **Get Claude API access** (Day 1)
3. **Initialize React frontend** (Day 2)
4. **Create basic authentication flow** (Day 3-4)
5. **Implement simple chat interface** (Day 5-7)

### Resources Needed:
- **Claude API Key**: $100 budget for initial development
- **Supabase Pro Account**: For production features
- **Vercel Pro Account**: For deployment and analytics
- **Design Assets**: Logo, colors, brand guidelines

---
*This plan provides everything needed to build, test, and launch SentimentalApp V2 successfully.*
