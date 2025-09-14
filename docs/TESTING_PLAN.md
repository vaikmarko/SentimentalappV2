# SentimentalApp V2: Comprehensive Testing Plan

## 🧪 Testing Overview

### Testing Philosophy
**"Test like a user, think like a developer, validate like a scientist"**

Our testing strategy ensures that SentimentalApp V2 not only works technically but creates genuinely magical experiences for users discovering themselves.

### Testing Pyramid
```
                    🔺
                   /   \
                  /  E2E  \         <- 10% (Critical user journeys)
                 /_________\
                /           \
               / Integration  \      <- 30% (API + DB interactions)
              /_______________\
             /                 \
            /    Unit Tests      \   <- 60% (Component logic)
           /_____________________ \
```

---

## 1. Unit Testing Strategy

### Frontend Unit Tests (Jest + React Testing Library)

#### Component Testing Standards
```typescript
// Example: MindMapCanvas.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { MindMapCanvas } from './MindMapCanvas';

describe('MindMapCanvas', () => {
  const mockNodes = [
    { id: '1', type: 'thought', title: 'Test Thought', position: { x: 100, y: 100 } }
  ];
  
  beforeEach(() => {
    // Setup test environment
  });
  
  test('renders nodes correctly', () => {
    const { getByTestId } = render(<MindMapCanvas nodes={mockNodes} />);
    expect(getByTestId('node-1')).toBeInTheDocument();
  });
  
  test('handles node selection', async () => {
    const onNodeSelect = jest.fn();
    const { getByTestId } = render(
      <MindMapCanvas nodes={mockNodes} onNodeSelect={onNodeSelect} />
    );
    
    fireEvent.click(getByTestId('node-1'));
    await waitFor(() => {
      expect(onNodeSelect).toHaveBeenCalledWith('1');
    });
  });
  
  test('creates new nodes on canvas click', async () => {
    const onNodeCreate = jest.fn();
    const { getByTestId } = render(
      <MindMapCanvas nodes={[]} onNodeCreate={onNodeCreate} />
    );
    
    // Simulate double-click to create node
    fireEvent.doubleClick(getByTestId('canvas-background'));
    await waitFor(() => {
      expect(onNodeCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          position: expect.any(Object),
          type: 'thought'
        })
      );
    });
  });
});
```

#### Hook Testing
```typescript
// Example: useMindMap.test.ts
import { renderHook, act } from '@testing-library/react';
import { useMindMap } from './useMindMap';

describe('useMindMap', () => {
  test('adds nodes correctly', () => {
    const { result } = renderHook(() => useMindMap());
    
    act(() => {
      result.current.addNode({
        type: 'thought',
        title: 'Test Thought',
        content: 'This is a test'
      });
    });
    
    expect(result.current.nodes).toHaveLength(1);
    expect(result.current.nodes[0].title).toBe('Test Thought');
  });
  
  test('connects nodes with edges', () => {
    const { result } = renderHook(() => useMindMap());
    
    // Add two nodes first
    act(() => {
      result.current.addNode({ id: 'node1', type: 'thought', title: 'Node 1' });
      result.current.addNode({ id: 'node2', type: 'emotion', title: 'Node 2' });
    });
    
    // Connect them
    act(() => {
      result.current.addEdge({
        source: 'node1',
        target: 'node2',
        type: 'relates_to'
      });
    });
    
    expect(result.current.edges).toHaveLength(1);
  });
});
```

#### Utility Function Testing
```typescript
// Example: patternAnalysis.test.ts
import { detectEmotionalPatterns, analyzeConversations } from './patternAnalysis';

describe('Pattern Analysis', () => {
  test('detects emotional patterns in conversations', () => {
    const conversations = [
      { content: 'I feel anxious about work', role: 'user' },
      { content: 'Work stress is overwhelming', role: 'user' },
      { content: 'Another stressful day at work', role: 'user' }
    ];
    
    const patterns = detectEmotionalPatterns(conversations);
    
    expect(patterns).toContainEqual(
      expect.objectContaining({
        type: 'emotional',
        emotion: 'anxiety',
        context: 'work',
        frequency: 3,
        confidence: expect.any(Number)
      })
    );
  });
  
  test('analyzes conversation sentiment over time', () => {
    const conversations = [
      { content: 'I hate this', role: 'user', created_at: '2024-01-01' },
      { content: 'Feeling better today', role: 'user', created_at: '2024-01-02' },
      { content: 'Great day!', role: 'user', created_at: '2024-01-03' }
    ];
    
    const analysis = analyzeConversations(conversations);
    
    expect(analysis.sentimentTrend).toBe('improving');
    expect(analysis.averageSentiment.start).toBeLessThan(analysis.averageSentiment.end);
  });
});
```

### Backend Unit Tests (Deno + Supabase Edge Functions)

#### Edge Function Testing
```typescript
// Example: claude-chat.test.ts
import { assertEquals, assertExists } from 'https://deno.land/std/testing/asserts.ts';
import { handler } from '../functions/claude-chat/index.ts';

Deno.test('Claude Chat Function', async (t) => {
  await t.step('processes user message correctly', async () => {
    const request = new Request('https://example.com', {
      method: 'POST',
      body: JSON.stringify({
        message: 'I feel anxious about my presentation tomorrow',
        sessionId: 'test-session-123'
      })
    });
    
    const response = await handler(request);
    const data = await response.json();
    
    assertEquals(response.status, 200);
    assertExists(data.response);
    assertExists(data.suggestedNodes);
  });
  
  await t.step('handles invalid input gracefully', async () => {
    const request = new Request('https://example.com', {
      method: 'POST',
      body: JSON.stringify({}) // Missing required fields
    });
    
    const response = await handler(request);
    assertEquals(response.status, 400);
  });
});
```

#### Database Function Testing
```typescript
// Example: database.test.ts
Deno.test('Database Operations', async (t) => {
  await t.step('creates user profile correctly', async () => {
    const userId = 'test-user-123';
    const profile = await createUserProfile(userId, {
      display_name: 'Test User'
    });
    
    assertExists(profile.id);
    assertEquals(profile.display_name, 'Test User');
  });
  
  await t.step('enforces RLS policies', async () => {
    // Test that users can't access other users' data
    const result = await supabase
      .from('nodes')
      .select('*')
      .eq('user_id', 'other-user-id');
      
    assertEquals(result.data.length, 0);
  });
});
```

---

## 2. Integration Testing

### API Integration Tests
```typescript
// Example: api-integration.test.ts
describe('API Integration Tests', () => {
  let testUser: User;
  let testSession: string;
  
  beforeAll(async () => {
    testUser = await createTestUser();
    testSession = await authenticateTestUser(testUser);
  });
  
  afterAll(async () => {
    await cleanupTestUser(testUser);
  });
  
  test('complete conversation flow', async () => {
    // 1. Send message to Claude
    const chatResponse = await fetch('/api/claude-chat', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${testSession}` },
      body: JSON.stringify({
        message: 'I had a great day today, feeling really positive!'
      })
    });
    
    const chatData = await chatResponse.json();
    expect(chatResponse.status).toBe(200);
    expect(chatData.response).toContain('positive');
    
    // 2. Verify suggested nodes were created
    const nodesResponse = await fetch('/api/nodes', {
      headers: { 'Authorization': `Bearer ${testSession}` }
    });
    
    const nodes = await nodesResponse.json();
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.some(node => node.type === 'emotion')).toBe(true);
    
    // 3. Verify conversation was stored
    const conversationsResponse = await fetch('/api/conversations', {
      headers: { 'Authorization': `Bearer ${testSession}` }
    });
    
    const conversations = await conversationsResponse.json();
    expect(conversations.length).toBeGreaterThan(0);
  });
  
  test('friend invitation flow', async () => {
    // 1. Create invitation
    const inviteResponse = await fetch('/api/friend-invitations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${testSession}` },
      body: JSON.stringify({
        friend_name: 'Test Friend',
        friend_email: 'friend@example.com'
      })
    });
    
    const invitation = await inviteResponse.json();
    expect(inviteResponse.status).toBe(201);
    expect(invitation.token).toBeDefined();
    
    // 2. Friend accesses invitation (no auth required)
    const viewResponse = await fetch(`/api/friend-invitations/${invitation.token}`);
    const viewData = await viewResponse.json();
    expect(viewResponse.status).toBe(200);
    expect(viewData.questions).toBeDefined();
    
    // 3. Friend submits responses
    const responseData = {
      responses: {
        'communication_style': 'Very direct and honest',
        'strengths': 'Great listener, very empathetic',
        'growth_areas': 'Sometimes overthinks decisions'
      }
    };
    
    const submitResponse = await fetch(`/api/friend-invitations/${invitation.token}`, {
      method: 'PUT',
      body: JSON.stringify(responseData)
    });
    
    expect(submitResponse.status).toBe(200);
    
    // 4. Verify user can see friend's perspective
    const updatedInvitation = await fetch(`/api/friend-invitations/${invitation.id}`, {
      headers: { 'Authorization': `Bearer ${testSession}` }
    });
    
    const updatedData = await updatedInvitation.json();
    expect(updatedData.status).toBe('completed');
    expect(updatedData.responses).toEqual(responseData.responses);
  });
});
```

### Database Integration Tests
```typescript
describe('Database Integration', () => {
  test('complex query performance', async () => {
    const userId = 'performance-test-user';
    
    // Create large dataset
    const nodes = Array.from({ length: 1000 }, (_, i) => ({
      user_id: userId,
      type: 'thought',
      title: `Test Node ${i}`,
      position: { x: i * 10, y: i * 10 }
    }));
    
    await supabase.from('nodes').insert(nodes);
    
    // Test query performance
    const startTime = performance.now();
    const result = await supabase
      .from('nodes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    const endTime = performance.now();
    const queryTime = endTime - startTime;
    
    expect(queryTime).toBeLessThan(100); // Less than 100ms
    expect(result.data.length).toBe(50);
  });
  
  test('real-time subscriptions', async () => {
    const userId = 'realtime-test-user';
    const updates: any[] = [];
    
    // Set up subscription
    const subscription = supabase
      .from('nodes')
      .on('INSERT', payload => updates.push(payload))
      .eq('user_id', userId)
      .subscribe();
    
    // Create a new node
    await supabase.from('nodes').insert({
      user_id: userId,
      type: 'thought',
      title: 'Real-time Test Node'
    });
    
    // Wait for real-time update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    expect(updates.length).toBe(1);
    expect(updates[0].new.title).toBe('Real-time Test Node');
    
    subscription.unsubscribe();
  });
});
```

---

## 3. End-to-End Testing (Playwright)

### Critical User Journeys
```typescript
// Example: user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('new user onboarding to first insight', async ({ page }) => {
    // 1. Sign up
    await page.goto('/signup');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="signup-button"]');
    
    // 2. Complete onboarding
    await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
    await page.fill('[data-testid="display-name"]', 'Test User');
    await page.click('[data-testid="continue-button"]');
    
    // 3. First conversation
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    await page.fill('[data-testid="message-input"]', 'I had a really stressful day at work today');
    await page.click('[data-testid="send-button"]');
    
    // 4. Wait for AI response and mind map update
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="mind-map-node"]')).toBeVisible({ timeout: 5000 });
    
    // 5. Verify mind map has nodes
    const nodes = page.locator('[data-testid="mind-map-node"]');
    await expect(nodes).toHaveCountGreaterThan(0);
    
    // 6. Click on a node to see details
    await nodes.first().click();
    await expect(page.locator('[data-testid="node-details"]')).toBeVisible();
    
    // 7. Continue conversation to trigger pattern
    await page.fill('[data-testid="message-input"]', 'Work has been really overwhelming lately, I feel anxious about it');
    await page.click('[data-testid="send-button"]');
    
    // 8. Check for pattern detection
    await expect(page.locator('[data-testid="pattern-notification"]')).toBeVisible({ timeout: 10000 });
  });
  
  test('friend perspective flow', async ({ page, context }) => {
    // Setup: User already logged in with existing data
    await page.goto('/app');
    
    // 1. Create friend invitation
    await page.click('[data-testid="friends-tab"]');
    await page.click('[data-testid="invite-friend-button"]');
    await page.fill('[data-testid="friend-name"]', 'Best Friend');
    await page.fill('[data-testid="friend-email"]', 'friend@example.com');
    await page.click('[data-testid="send-invitation"]');
    
    // 2. Get invitation link
    const invitationLink = await page.locator('[data-testid="invitation-link"]').textContent();
    expect(invitationLink).toContain('/friend/');
    
    // 3. Open invitation in new context (simulate friend)
    const friendPage = await context.newPage();
    await friendPage.goto(invitationLink!);
    
    // 4. Friend fills out questionnaire
    await expect(friendPage.locator('[data-testid="friend-questionnaire"]')).toBeVisible();
    await friendPage.fill('[data-testid="response-communication"]', 'Very thoughtful and considerate');
    await friendPage.fill('[data-testid="response-strengths"]', 'Great at problem-solving');
    await friendPage.fill('[data-testid="response-growth"]', 'Could be more assertive');
    await friendPage.click('[data-testid="submit-responses"]');
    
    // 5. Verify thank you page
    await expect(friendPage.locator('[data-testid="thank-you-message"]')).toBeVisible();
    
    // 6. Back to user: check for friend perspective update
    await page.reload();
    await expect(page.locator('[data-testid="friend-response-notification"]')).toBeVisible();
    
    // 7. View friend's perspective
    await page.click('[data-testid="view-friend-perspective"]');
    await expect(page.locator('[data-testid="perspective-comparison"]')).toBeVisible();
    
    await friendPage.close();
  });
});
```

### Mobile Testing
```typescript
test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE
  
  test('mobile mind map interactions', async ({ page }) => {
    await page.goto('/app');
    
    // Test touch interactions
    const node = page.locator('[data-testid="mind-map-node"]').first();
    
    // Test tap to select
    await node.tap();
    await expect(page.locator('[data-testid="mobile-node-menu"]')).toBeVisible();
    
    // Test pinch to zoom (simulated)
    await page.touchscreen.tap(200, 300);
    await page.evaluate(() => {
      window.dispatchEvent(new TouchEvent('touchstart', {
        touches: [
          new Touch({ identifier: 1, target: document.body, clientX: 100, clientY: 100 }),
          new Touch({ identifier: 2, target: document.body, clientX: 200, clientY: 200 })
        ]
      }));
    });
    
    // Verify zoom controls appear
    await expect(page.locator('[data-testid="zoom-controls"]')).toBeVisible();
  });
  
  test('mobile chat interface', async ({ page }) => {
    await page.goto('/app');
    
    // Verify mobile chat layout
    await expect(page.locator('[data-testid="mobile-chat"]')).toBeVisible();
    
    // Test virtual keyboard handling
    await page.fill('[data-testid="message-input"]', 'Test message on mobile');
    
    // Verify input doesn't get obscured by keyboard
    const inputRect = await page.locator('[data-testid="message-input"]').boundingBox();
    expect(inputRect?.y).toBeLessThan(500); // Should be visible above keyboard
  });
});
```

### Performance Testing
```typescript
test.describe('Performance Tests', () => {
  test('page load performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000); // Less than 3 seconds
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          resolve(entries);
        }).observe({ entryTypes: ['navigation', 'paint'] });
      });
    });
    
    // First Contentful Paint should be < 1.8s
    // Largest Contentful Paint should be < 2.5s
    // First Input Delay should be < 100ms
  });
  
  test('large dataset performance', async ({ page }) => {
    // Create user with 500 nodes
    await page.goto('/app');
    
    const startTime = Date.now();
    await page.locator('[data-testid="mind-map-canvas"]').waitFor();
    const renderTime = Date.now() - startTime;
    
    expect(renderTime).toBeLessThan(1000); // Less than 1 second
    
    // Test smooth interactions with large dataset
    await page.mouse.wheel(0, -500); // Zoom in
    await page.waitForTimeout(100);
    
    const fps = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frames = 0;
        const startTime = performance.now();
        
        function countFrame() {
          frames++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrame);
          } else {
            resolve(frames);
          }
        }
        requestAnimationFrame(countFrame);
      });
    });
    
    expect(fps).toBeGreaterThan(30); // At least 30 FPS
  });
});
```

---

## 4. User Testing Plan

### Phase 1: Internal Testing (Week 5)
**Participants**: 5-8 team members and close friends
**Duration**: 1 week
**Focus**: Core functionality and major bugs

#### Testing Protocol
```typescript
interface InternalTestSession {
  participant: {
    role: 'developer' | 'designer' | 'friend';
    techSavvy: 'high' | 'medium' | 'low';
  };
  tasks: [
    'Complete onboarding',
    'Have 3 different conversations with AI',
    'Create 2 manual nodes',
    'Invite one friend for perspective',
    'Explore mind map for 10 minutes'
  ];
  metrics: {
    taskCompletionRate: number;
    timeToComplete: number[];
    errorCount: number;
    satisfactionScore: 1..10;
  };
  feedback: {
    mostConfusing: string;
    mostExciting: string;
    wouldRecommend: boolean;
    suggestedImprovements: string[];
  };
}
```

#### Success Criteria
- [ ] 100% task completion rate for core flows
- [ ] <5 critical bugs found
- [ ] Average satisfaction score >7/10
- [ ] <2 minutes average onboarding time

### Phase 2: Beta Testing (Week 6-7)
**Participants**: 25-30 external users
**Duration**: 2 weeks  
**Focus**: Real-world usage and edge cases

#### Participant Recruitment
```typescript
interface BetaParticipant {
  demographics: {
    age: 18..35;
    education: 'high_school' | 'college' | 'graduate';
    techComfort: 'low' | 'medium' | 'high';
  };
  mentalHealthEngagement: 'none' | 'occasional' | 'regular';
  motivation: 'self_improvement' | 'curiosity' | 'academic';
}

// Target distribution
const targetParticipants = {
  students: 15,          // Primary target audience
  youngProfessionals: 10,  // Secondary audience  
  diverseBackgrounds: 5    // Edge case testing
};
```

#### Testing Structure
**Week 1: Guided Usage**
- Day 1: Onboarding + first conversation
- Day 3: Check-in call + second session
- Day 5: Friend invitation task
- Day 7: Pattern exploration + feedback survey

**Week 2: Natural Usage**
- Participants use app naturally
- Daily micro-surveys (2 questions)
- Usage analytics collection
- Final interview + detailed feedback

#### Data Collection
```typescript
interface BetaTestingMetrics {
  quantitative: {
    sessionCount: number;
    averageSessionDuration: number;
    nodesCreated: number;
    conversationCount: number;
    friendInvitationsSent: number;
    friendResponseRate: number;
    retentionRate: {
      day1: number;
      day3: number;
      day7: number;
      day14: number;
    };
  };
  
  qualitative: {
    userInterviews: UserInterview[];
    satisfactionScores: SatisfactionMetrics;
    featureFeedback: FeatureFeedback[];
    bugReports: BugReport[];
  };
  
  behavioral: {
    mostUsedFeatures: string[];
    abandonmentPoints: string[];
    userFlow: UserAction[];
    errorPatterns: ErrorPattern[];
  };
}
```

### Phase 3: University Pilot (Week 8+)
**Participants**: 100 students
**Duration**: 4 weeks minimum
**Focus**: Scientific validation and scale testing

#### Study Design
```typescript
interface UniversityStudy {
  studyType: 'pre_post_with_control'; // Randomized controlled trial
  participants: {
    treatment: 50; // Get access to SentimentalApp V2
    control: 50;   // Wait-list control group
  };
  
  measurements: {
    baseline: {
      selfAwareness: SelfConceptClarity;
      wellbeing: WHO5WellBeingIndex;
      mood: PANAS;
      // Optional (with consent)
      anxiety: GAD7;
      depression: PHQ9;
    };
    
    weekly: {
      usageMetrics: UsageData;
      satisfactionSurvey: SatisfactionSurvey;
      goalProgress: GoalProgressScale;
      insight: InsightScale;
    };
    
    postTest: {
      // Same as baseline measures
      // Plus qualitative interviews
      // Plus app-specific measures
    };
  };
  
  timeline: {
    week1: 'Baseline measurement + app introduction';
    week2_4: 'Natural usage + weekly surveys';
    week4: 'Post-test measurement + interviews';
    followUp: '1-month retention check';
  };
}
```

#### Primary Research Questions
1. **Efficacy**: Does SentimentalApp V2 improve self-awareness scores compared to control?
2. **Engagement**: What usage patterns predict positive outcomes?
3. **Mechanism**: Which features drive the most insight and satisfaction?
4. **Accessibility**: Does the app work equally well for different demographics?

#### Success Criteria
- [ ] 70% weekly active usage rate
- [ ] Statistically significant improvement in self-awareness (p<0.05)
- [ ] 60%+ report "magical" experience
- [ ] <5% serious adverse events
- [ ] Positive user feedback themes > negative themes

---

## 5. Automated Testing Infrastructure

### Continuous Integration
```yaml
# .github/workflows/test.yml
name: Comprehensive Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3
        
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - run: npm run test:integration
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Data Management
```typescript
// Test data factories
export const createTestUser = () => ({
  id: generateUUID(),
  email: `test${Date.now()}@example.com`,
  display_name: 'Test User',
  onboarding_completed: true
});

export const createTestNodes = (count: number, userId: string) => 
  Array.from({ length: count }, (_, i) => ({
    id: generateUUID(),
    user_id: userId,
    type: ['thought', 'emotion', 'experience'][i % 3],
    title: `Test Node ${i + 1}`,
    content: `Content for test node ${i + 1}`,
    position: { x: Math.random() * 800, y: Math.random() * 600 }
  }));

// Test database seeding
export const seedTestDatabase = async () => {
  // Clean existing test data
  await supabase.from('nodes').delete().like('title', 'Test%');
  await supabase.from('user_profiles').delete().like('display_name', 'Test%');
  
  // Insert fresh test data
  const testUsers = Array.from({ length: 10 }, createTestUser);
  await supabase.from('user_profiles').insert(testUsers);
  
  for (const user of testUsers) {
    const nodes = createTestNodes(20, user.id);
    await supabase.from('nodes').insert(nodes);
  }
};
```

### Performance Monitoring
```typescript
// Performance test utilities
export const measureRenderTime = async (component: React.Component) => {
  const startTime = performance.now();
  render(component);
  await waitFor(() => expect(component).toBeInTheDocument());
  return performance.now() - startTime;
};

export const measureApiResponseTime = async (endpoint: string) => {
  const startTime = performance.now();
  await fetch(endpoint);
  return performance.now() - startTime;
};

// Performance benchmarks
const performanceBenchmarks = {
  pageLoad: { target: 2000, warning: 1500 },
  apiResponse: { target: 500, warning: 300 },
  mindMapRender: { target: 1000, warning: 500 },
  nodeCreation: { target: 100, warning: 50 }
};
```

---

This comprehensive testing plan ensures SentimentalApp V2 is not only technically sound but creates genuinely transformative experiences for users exploring their inner worlds.
