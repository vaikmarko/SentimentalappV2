# SentimentalApp V2: Technical Specifications

## 🏗️ System Architecture

### Technology Stack
```
Frontend:
├── React 18 + Vite         # Fast development and building
├── TypeScript               # Type safety for critical components
├── Tailwind CSS            # Utility-first CSS framework
├── React Flow              # Mind map visualization (chosen over D3/Cytoscape)
├── Framer Motion           # Smooth animations and transitions
├── React Query             # Server state management
└── React Router Dom        # Client-side routing

Backend & Database:
├── Supabase                # Backend-as-a-Service
│   ├── PostgreSQL          # Primary database
│   ├── Edge Functions      # Serverless functions (Deno runtime)
│   ├── Real-time           # WebSocket subscriptions
│   ├── Auth                # User authentication
│   └── Storage             # File storage (if needed)

External APIs:
├── Claude API (Anthropic)  # AI conversation and analysis
├── Vercel                  # Hosting and deployment
└── Resend                  # Email notifications (optional)
```

### Database Design

#### Core Tables
```sql
-- User profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mind map nodes
CREATE TABLE nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('thought', 'emotion', 'experience', 'pattern', 'insight', 'goal', 'relationship')),
  title TEXT NOT NULL,
  content TEXT,
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}', -- {x: number, y: number}
  style JSONB DEFAULT '{"color": "#3B82F6", "size": 40}', -- {color: string, size: number}
  metadata JSONB DEFAULT '{}', -- Additional node-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_nodes_user_id ON nodes(user_id),
  INDEX idx_nodes_type ON nodes(type),
  INDEX idx_nodes_created_at ON nodes(created_at)
);

-- Connections between nodes
CREATE TABLE edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'relates_to' CHECK (type IN ('relates_to', 'causes', 'enables', 'conflicts_with', 'similar_to')),
  strength FLOAT DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure no duplicate edges
  UNIQUE(user_id, source_id, target_id, type),
  
  -- Indexes
  INDEX idx_edges_user_id ON edges(user_id),
  INDEX idx_edges_source ON edges(source_id),
  INDEX idx_edges_target ON edges(target_id)
);

-- Conversation history
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL, -- Group related messages
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}', -- Claude usage stats, processing time, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_conversations_user_session ON conversations(user_id, session_id),
  INDEX idx_conversations_created_at ON conversations(created_at)
);

-- Patterns detected by AI
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'emotional', 'behavioral', 'thought', 'relationship'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence JSONB NOT NULL, -- References to conversations, nodes, etc.
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'dismissed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_patterns_user_id ON patterns(user_id),
  INDEX idx_patterns_type ON patterns(type),
  INDEX idx_patterns_status ON patterns(status)
);

-- Friend perspective invitations
CREATE TABLE friend_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  friend_name TEXT NOT NULL,
  friend_email TEXT,
  token TEXT NOT NULL UNIQUE,
  questions JSONB NOT NULL, -- Array of question objects
  responses JSONB, -- Friend's responses
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_invitations_token ON friend_invitations(token),
  INDEX idx_invitations_user_status ON friend_invitations(user_id, status),
  INDEX idx_invitations_expires_at ON friend_invitations(expires_at)
);
```

#### Row Level Security (RLS) Policies
```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_invitations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view their own nodes" ON nodes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own edges" ON edges
  FOR ALL USING (auth.uid() = user_id);

-- Special policy for friend invitations (friends can access via token)
CREATE POLICY "Users can manage their invitations" ON friend_invitations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view invitation by token" ON friend_invitations
  FOR SELECT USING (token IS NOT NULL AND expires_at > NOW());
```

### API Specifications

#### Supabase Edge Functions
```typescript
// Edge Function: /functions/claude-chat/index.ts
interface ClaudeChatRequest {
  message: string;
  sessionId: string;
  context?: {
    nodeIds?: string[];
    patternIds?: string[];
  };
}

interface ClaudeChatResponse {
  response: string;
  suggestedNodes?: Array<{
    type: string;
    title: string;
    content: string;
  }>;
  detectedPatterns?: Array<{
    type: string;
    description: string;
    confidence: number;
  }>;
  connections?: Array<{
    sourceId: string;
    targetId: string;
    type: string;
  }>;
}

// Edge Function: /functions/analyze-patterns/index.ts
interface AnalyzeRequest {
  conversationIds: string[];
  nodeIds: string[];
}

interface AnalysisResponse {
  patterns: Pattern[];
  suggestedConnections: Connection[];
  insights: Insight[];
}
```

### Frontend Component Architecture

#### Component Hierarchy
```
App
├── AuthProvider                 # Authentication context
├── QueryProvider               # React Query provider
├── Layout
│   ├── Header
│   │   ├── UserMenu
│   │   └── NavigationTabs
│   ├── Sidebar (optional)
│   └── MainContent
│       ├── MindMapView
│       │   ├── MindMapCanvas      # React Flow canvas
│       │   ├── NodeComponents
│       │   │   ├── ThoughtNode
│       │   │   ├── EmotionNode
│       │   │   ├── PatternNode
│       │   │   └── CustomNode
│       │   ├── EdgeComponents
│       │   ├── ControlPanel       # Zoom, fit, layout controls
│       │   └── NodeEditor         # Edit selected node
│       ├── ChatInterface
│       │   ├── MessageList
│       │   │   ├── UserMessage
│       │   │   ├── AIMessage
│       │   │   └── SystemMessage
│       │   ├── InputArea
│       │   │   ├── TextInput
│       │   │   ├── SendButton
│       │   │   └── AttachmentButton
│       │   └── TypingIndicator
│       ├── PatternPanel
│       │   ├── PatternList
│       │   ├── PatternCard
│       │   └── PatternDetails
│       └── FriendPerspectives
│           ├── InvitationForm
│           ├── InvitationList
│           ├── PerspectiveResults
│           └── ComparisonView
```

#### State Management
```typescript
// Global state with React Query + Zustand
interface AppState {
  // User state
  user: User | null;
  
  // Mind map state
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  viewportState: ReactFlowState;
  
  // Chat state
  conversations: Conversation[];
  currentSession: string;
  isTyping: boolean;
  
  // Pattern state
  patterns: Pattern[];
  activePatterns: Pattern[];
  
  // UI state
  sidebarOpen: boolean;
  currentView: 'mindmap' | 'chat' | 'patterns' | 'friends';
  loading: boolean;
  error: string | null;
}

// Actions
interface AppActions {
  // Node actions
  addNode: (node: Partial<Node>) => void;
  updateNode: (id: string, updates: Partial<Node>) => void;
  deleteNode: (id: string) => void;
  
  // Edge actions
  addEdge: (edge: Partial<Edge>) => void;
  deleteEdge: (id: string) => void;
  
  // Chat actions
  sendMessage: (content: string) => Promise<void>;
  startNewSession: () => void;
  
  // Pattern actions
  acknowledgePattern: (id: string) => void;
  dismissPattern: (id: string) => void;
}
```

### Performance Specifications

#### Frontend Performance
- **Initial Load**: <2 seconds (4G connection)
- **Mind Map Rendering**: <500ms for <100 nodes
- **Node Interaction**: <100ms response time
- **Chat Message**: <200ms to appear in UI
- **Bundle Size**: <500KB gzipped (excluding maps)

#### Backend Performance  
- **Database Queries**: <100ms average response
- **Claude API**: <3 seconds response time
- **Real-time Updates**: <200ms latency
- **Concurrent Users**: Support 1000+ concurrent

#### Scalability Targets
- **Users**: 10,000 registered users
- **Nodes per User**: Up to 1000 nodes
- **Conversations**: 100+ messages per session
- **Database Size**: 1GB+ data per 1000 users

### Security Specifications

#### Authentication & Authorization
```typescript
// Supabase Auth configuration
const supabaseAuth = {
  providers: ['email', 'google', 'github'], // Social login options
  passwordRequirements: {
    minLength: 8,
    requireSpecialChar: true,
    requireNumber: true,
  },
  sessionTimeout: '24h',
  refreshTokenRotation: true,
};

// Route protection
const protectedRoutes = [
  '/app/*',     // Main application
  '/profile/*', // User profile
  '/settings/*' // User settings
];
```

#### Data Protection
- **Encryption at Rest**: Supabase default AES-256
- **Encryption in Transit**: TLS 1.3 for all connections
- **API Keys**: Environment variables only, never in code
- **Input Validation**: All user inputs sanitized and validated
- **Rate Limiting**: 100 requests/minute per user

#### Privacy Controls
```typescript
interface PrivacySettings {
  dataRetention: '1year' | '2years' | '5years' | 'indefinite';
  shareAnalytics: boolean;
  friendPerspectiveRetention: '30days' | '90days' | '1year';
  exportData: () => Promise<UserDataExport>;
  deleteAllData: () => Promise<void>;
}
```

### Monitoring & Analytics

#### Performance Monitoring
- **Vercel Analytics**: Page loads, Core Web Vitals
- **Sentry**: Error tracking and performance monitoring
- **Custom Metrics**: Mind map interactions, chat response times

#### User Analytics (Privacy-First)
```typescript
interface AnalyticsEvents {
  // Onboarding
  'onboarding_started': {};
  'onboarding_completed': { duration: number };
  
  // Core features
  'conversation_started': {};
  'node_created': { type: string; method: 'manual' | 'ai_suggested' };
  'pattern_discovered': { type: string; confidence: number };
  'friend_invited': {};
  'friend_response_received': {};
  
  // Engagement
  'session_duration': { duration: number };
  'feature_usage': { feature: string; count: number };
}
```

### Error Handling & Resilience

#### Frontend Error Boundaries
```typescript
class AppErrorBoundary extends React.Component {
  // Catch and handle React errors
  // Provide graceful fallbacks
  // Report errors to monitoring
}

// Network error handling
const apiClient = {
  async request(url: string, options: RequestOptions) {
    // Retry logic with exponential backoff
    // Offline detection and queueing
    // Graceful degradation
  }
};
```

#### Backend Error Handling
```typescript
// Edge Functions error handling
export default async function handler(req: Request) {
  try {
    // Main logic
  } catch (error) {
    // Log error with context
    // Return appropriate error response
    // Notify monitoring systems
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

### Development & Deployment

#### Development Environment
```bash
# Environment variables required
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
CLAUDE_API_KEY=your_claude_api_key (server-side only)
NODE_ENV=development

# Development commands
npm run dev          # Start development server
npm run test         # Run test suite
npm run test:e2e     # Run end-to-end tests
npm run build        # Build for production
npm run preview      # Preview production build
```

#### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test
      - run: npm run build
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-args: '--prod'
```

#### Production Configuration
```typescript
// Production optimizations
const productionConfig = {
  // Bundle optimization
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mindmap: ['reactflow'],
          ui: ['@headlessui/react', 'framer-motion'],
        },
      },
    },
  },
  
  // Service worker for offline support
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    },
  },
};
```

---

This technical specification provides the detailed implementation guidance needed to build SentimentalApp V2 according to the development plan.
