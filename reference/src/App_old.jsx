import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { FaRegUserCircle, FaFolderOpen, FaFileAlt, FaPlus, FaLock } from 'react-icons/fa';
import { fileTemplates } from "./fileTemplates";
import DiffViewer from './DiffViewer.jsx';
import knowledgeMap from "../knowledge_map.json";
import DiffMatchPatch from 'diff-match-patch';
import { Decoration, ViewPlugin } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';

// Helper: folder colour based on type/name
const folderColor = (name) => {
  if (name === 'TherapistNotes') return 'text-pink-300';
  if (name === 'session-summaries') return 'text-yellow-300';
  if (name === 'voices') return 'text-lime-300';
  return 'text-gray-400';
};

// Helper: find which folder contains a given file name
function findFolderForFile(fileName) {
  for (const folder of mentalModel) {
    if (folder.files.some(f => f.name === fileName)) return folder.name;
  }
  return null;
}

// Helper function to get icon for folder/file type
const getIcon = (type, name) => {
  if (type === 'user') return <FaRegUserCircle className="inline mr-2 text-blue-400" />;
  if (type === 'folder') return <FaFolderOpen className="inline mr-2 text-gray-400" />;
  if (type === 'file') return <FaFileAlt className="inline mr-1 text-gray-300" />;
  return <FaFileAlt className="inline mr-1 text-gray-300" />;
};

function getFileKey(folder, file) {
  return `mentalOS/${folder}/${file}`;
}

// Add friendly descriptions for each file
const fileDescriptions = {
  "values.md": "Your core values and beliefs. What principles guide your life?",
  "personality-traits.md": "Your main personality traits (e.g., introvert/extrovert, openness, etc.).",
  "life-philosophy.md": "Your worldview and life principles.",
  "identity-markers.md": "The roles you identify with (parent, worker, friend, etc.).",
  "decision-making.md": "How you make decisions.",
  "problem-solving.md": "Your style of solving problems.",
  "learning-style.md": "How you learn new information.",
  "thinking-biases.md": "Your thinking habits and biases.",
  "emotional-triggers.md": "What triggers strong emotions for you?",
  "stress-responses.md": "How you respond to stress.",
  "emotional-regulation.md": "How you manage your emotions.",
  "attachment-patterns.md": "Your patterns in relationships.",
  "communication-style.md": "How you communicate.",
  "conflict-resolution.md": "How you resolve conflicts.",
  "social-interactions.md": "Your social behavior patterns.",
  "habits-routines.md": "Your daily habits and routines.",
  "family-dynamics.md": "Your family relationships.",
  "friendship-patterns.md": "Your friendships.",
  "romantic-relationships.md": "Your romantic relationships.",
  "professional-relationships.md": "Your work relationships.",
  "childhood-events.md": "Important events from your childhood.",
  "significant-traumas.md": "Significant traumas in your life.",
  "achievements-failures.md": "Your achievements and failures.",
  "turning-points.md": "Turning points in your life.",
  "current-stressors.md": "Current sources of stress.",
  "goals-aspirations.md": "Your goals and dreams.",
  "support-systems.md": "Your support systems.",
  "daily-life.md": "A description of your daily life.",
  "skills-abilities.md": "Your skills and abilities.",
  "coping-mechanisms.md": "How you cope with challenges.",
  "interests-passions.md": "Your interests and passions.",
  "support-network.md": "Your support network.",
  "mental-health-history.md": "Your mental health history.",
  "addiction-patterns.md": "Any addiction patterns.",
  "limiting-beliefs.md": "Beliefs that may be holding you back.",
  "recurring-problems.md": "Problems that keep coming up.",
  "therapy-goals.md": "Your goals for therapy or self-development.",
  "development-areas.md": "Areas you want to develop.",
  "motivation-factors.md": "What motivates you to change?",
  "readiness-assessment.md": "How ready are you for change?",
  "SessionSummaries.md": "Chronological bullet summaries of each chat session.",
  "private.md": "Private notes for therapist/AI only.",
};

// Example bot prompts for each file (can be expanded/AI-generated later)
const fileBotPrompts = {
  "values.md": [
    "Let's talk about your core values! What principles do you think guide your life?",
    "Can you name a value that's super important to you? Why?",
    "How do your values show up in your daily decisions?",
    "Have your values changed over time? If so, how?",
    "When was a time you acted against your values? How did it feel?"
  ],
  "personality-traits.md": [
    "How would you describe your personality? Are you more introverted or extroverted?",
    "What's a trait your friends would use to describe you?",
    "How do you react to new situations?",
    "What trait are you most proud of?",
    "Is there a trait you wish to develop or change?"
  ],
  "life-philosophy.md": [
    "What is your general outlook on life?",
    "Do you believe life has a purpose? If so, what is it?",
    "How do you approach challenges or setbacks?",
    "What principles guide your big decisions?",
    "How do you define a 'good life'?"
  ],
  "identity-markers.md": [
    "What roles do you identify with (e.g., parent, friend, professional)?",
    "Which role feels most central to your identity?",
    "Have your roles changed over time?",
    "How do you balance your different roles?",
    "Is there a role you wish to grow into?"
  ],
  "decision-making.md": [
    "How do you typically make decisions? Quickly or after much thought?",
    "Do you rely more on logic or intuition?",
    "Can you recall a recent difficult decision? How did you approach it?",
    "Who do you consult when making big decisions?",
    "Are you happy with your decision-making style?"
  ],
  "problem-solving.md": [
    "How do you approach problems?",
    "Do you prefer to solve problems alone or with others?",
    "Can you share a time you solved a tough problem?",
    "What strategies work best for you?",
    "Is there a problem-solving skill you want to improve?"
  ],
  "learning-style.md": [
    "How do you learn best (reading, doing, listening, etc.)?",
    "What helps you remember new information?",
    "Do you enjoy learning new things? Why or why not?",
    "How do you handle topics that are hard for you?",
    "Is there a skill you want to learn next?"
  ],
  "thinking-biases.md": [
    "Are you aware of any thinking habits or biases you have?",
    "How do you challenge your own assumptions?",
    "Can you recall a time a bias affected your judgment?",
    "How do you try to stay objective?",
    "Is there a bias you want to work on?"
  ],
  "emotional-triggers.md": [
    "What situations trigger strong emotions for you?",
    "How do you usually react to these triggers?",
    "Can you identify patterns in your emotional responses?",
    "How do you recover from being triggered?",
    "Is there a trigger you want to better understand?"
  ],
  "stress-responses.md": [
    "How do you know when you're stressed?",
    "What are your first reactions to stress?",
    "How do you cope with ongoing stress?",
    "Can you share a time you managed stress well?",
    "Is there a stress response you'd like to change?"
  ],
  "emotional-regulation.md": [
    "How do you manage your emotions when they're intense?",
    "What strategies help you calm down?",
    "Do you talk to others about your feelings?",
    "How do you express difficult emotions?",
    "Is there a regulation skill you want to improve?"
  ],
  "attachment-patterns.md": [
    "How do you behave in close relationships?",
    "Do you find it easy or hard to trust others?",
    "How do you react to conflict with loved ones?",
    "Can you describe your ideal relationship?",
    "Is there a pattern you want to change?"
  ],
  "communication-style.md": [
    "How would you describe your communication style?",
    "Do you find it easy to express your needs?",
    "How do you handle misunderstandings?",
    "Can you recall a time communication broke down?",
    "Is there a style you admire in others?"
  ],
  "conflict-resolution.md": [
    "How do you approach conflicts?",
    "Do you prefer to avoid or address issues directly?",
    "Can you share a time you resolved a conflict well?",
    "What makes conflict hard for you?",
    "Is there a skill you want to develop?"
  ],
  "social-interactions.md": [
    "How do you feel in social situations?",
    "Do you prefer small groups or large gatherings?",
    "How do you make new friends?",
    "What do you enjoy most about socializing?",
    "Is there a social skill you want to improve?"
  ],
  "habits-routines.md": [
    "What are your most important daily habits?",
    "How do you build new routines?",
    "Can you share a habit you're proud of?",
    "What habit would you like to change?",
    "How do you stay motivated?"
  ],
  "family-dynamics.md": [
    "How would you describe your family relationships?",
    "What role do you play in your family?",
    "How does your family handle conflict?",
    "What do you value most about your family?",
    "Is there a family dynamic you'd like to change?"
  ],
  "friendship-patterns.md": [
    "How do you choose your friends?",
    "What do you value most in a friendship?",
    "How do you maintain your friendships?",
    "Can you share a meaningful friendship story?",
    "Is there a pattern you notice in your friendships?"
  ],
  "romantic-relationships.md": [
    "How do you approach romantic relationships?",
    "What qualities do you look for in a partner?",
    "How do you handle disagreements in relationships?",
    "What does a healthy relationship mean to you?",
    "Is there a pattern you want to change?"
  ],
  "professional-relationships.md": [
    "How do you interact with colleagues at work?",
    "What do you value in a professional relationship?",
    "How do you handle workplace conflict?",
    "Can you share a positive work relationship story?",
    "Is there a skill you want to develop at work?"
  ],
  "childhood-events.md": [
    "What are some important events from your childhood?",
    "How did these events shape you?",
    "Is there a childhood memory that stands out?",
    "How do you feel about your childhood now?",
    "Is there something from childhood you want to revisit?"
  ],
  "significant-traumas.md": [
    "Have you experienced any significant traumas?",
    "How have you coped with these experiences?",
    "What support did you have during tough times?",
    "How do you feel about these events now?",
    "Is there healing you still seek?"
  ],
  "achievements-failures.md": [
    "What achievements are you most proud of?",
    "How do you handle failure?",
    "Can you share a lesson from a failure?",
    "How do you celebrate your successes?",
    "Is there an achievement you still strive for?"
  ],
  "turning-points.md": [
    "What have been the major turning points in your life?",
    "How did these moments change you?",
    "What did you learn from these experiences?",
    "How do you approach change now?",
    "Is there a turning point you wish for in the future?"
  ],
  "current-stressors.md": [
    "What are your main sources of stress right now?",
    "How do you manage these stressors?",
    "Who supports you during stressful times?",
    "How do you prioritize your well-being?",
    "Is there a stressor you want to address first?"
  ],
  "goals-aspirations.md": [
    "What are your current goals and dreams?",
    "How do you set and pursue your goals?",
    "What motivates you to achieve them?",
    "What obstacles do you face?",
    "Is there a goal you want to focus on now?"
  ],
  "support-systems.md": [
    "Who are your main sources of support?",
    "How do you seek help when needed?",
    "What makes you feel supported?",
    "How do you support others?",
    "Is there a support system you want to strengthen?"
  ],
  "daily-life.md": [
    "How would you describe your daily life?",
    "What routines or rituals are important to you?",
    "How do you balance work, rest, and play?",
    "What would you change about your daily life?",
    "What do you enjoy most about your day?"
  ],
  "skills-abilities.md": [
    "What skills and abilities are you most proud of?",
    "How did you develop these skills?",
    "How do you use your abilities in daily life?",
    "Is there a skill you want to learn next?",
    "How do you share your skills with others?"
  ],
  "coping-mechanisms.md": [
    "What strategies do you use to cope with challenges?",
    "Which coping mechanisms work best for you?",
    "How did you learn these strategies?",
    "Is there a coping skill you want to improve?",
    "How do you help others cope?"
  ],
  "interests-passions.md": [
    "What are your main interests and passions?",
    "How do you pursue these interests?",
    "How do your passions shape your life?",
    "Is there a passion you want to explore more?",
    "How do you share your interests with others?"
  ],
  "support-network.md": [
    "Who is in your support network?",
    "How do you maintain these connections?",
    "What do you value most about your network?",
    "How do you expand your support system?",
    "Is there someone you want to reconnect with?"
  ],
  "mental-health-history.md": [
    "How would you describe your mental health journey?",
    "Have you faced any mental health challenges?",
    "What has helped you most in tough times?",
    "How do you care for your mental health now?",
    "Is there support you wish you had?"
  ],
  "addiction-patterns.md": [
    "Have you struggled with any addictions?",
    "How have you tried to manage or overcome them?",
    "What support have you found helpful?",
    "How do you feel about your progress?",
    "Is there a next step you want to take?"
  ],
  "limiting-beliefs.md": [
    "What beliefs do you hold that might limit you?",
    "How did you develop these beliefs?",
    "How do they affect your choices?",
    "Have you challenged any limiting beliefs?",
    "Is there a belief you want to change?"
  ],
  "recurring-problems.md": [
    "Are there problems that keep coming up in your life?",
    "How do you usually address these issues?",
    "What patterns do you notice?",
    "Have you tried new approaches?",
    "Is there a recurring problem you want to solve?"
  ],
  "therapy-goals.md": [
    "What are your goals for therapy or self-development?",
    "How did you choose these goals?",
    "What progress have you made so far?",
    "What support do you need to reach your goals?",
    "Is there a new goal you want to set?"
  ],
  "development-areas.md": [
    "What areas of your life do you want to develop?",
    "Why are these areas important to you?",
    "What steps have you taken so far?",
    "What challenges do you face?",
    "How will you know you've grown?"
  ],
  "motivation-factors.md": [
    "What motivates you to make changes?",
    "How do you stay motivated over time?",
    "What obstacles affect your motivation?",
    "How do you celebrate progress?",
    "Is there a new source of motivation you want to tap into?"
  ],
  "readiness-assessment.md": [
    "How ready do you feel for change?",
    "What makes you feel prepared or unprepared?",
    "What would help you feel more ready?",
    "How do you handle uncertainty?",
    "What is the first step you want to take?"
  ],
  "SessionSummaries.md": [
    "Let's start with a summary of your recent chat sessions. Could you share the key points of your last session?",
    "What were the main topics discussed in your last therapy session?",
    "Could you provide a bullet point summary of your most recent conversation with the AI?"
  ],
  "private.md": [
    "This is a private space for your therapist/AI to jot down notes. What's on your mind?",
    "What are your thoughts about the session we just had?",
    "Is there anything specific you'd like to discuss in our next session?"
  ]
};

const MENTAL_API_BASE = "http://localhost:8080/api/mental-os";
const BACKEND_API_URL = `${MENTAL_API_BASE}/chat/message`; // MentalOS-specific endpoint
const FILE_API_BASE = `${MENTAL_API_BASE}/files`;

async function saveFileToBackend(filePath, content, userId) {
  try {
    await fetch(`${FILE_API_BASE}/${encodeURIComponent(filePath)}?user_id=${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  } catch {
    /* network down – it's fine, we'll retry next interaction */
  }
}

// Fetch real file content from backend
async function fetchFileContent(filePath, userId) {
  try {
    const response = await fetch(`http://localhost:8080/api/mental-os/files/${filePath}?user_id=${userId}`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "X-User-ID": userId 
      }
    });
    const data = await response.json();
    return data.content || "";
  } catch (error) {
    console.error('Failed to fetch file content:', error);
    return "";
  }
}

// Generate or get consistent user ID
function getUserId() {
  let userId = localStorage.getItem('mentalos_user_id');
  if (!userId) {
    userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('mentalos_user_id', userId);
  }
  return userId;
}

// Utility: key for storing chat history per file
function getChatHistoryKey(filePath) {
  return `mentalos_chat_history_${filePath}`;
}

// Clear chat history (useful for debugging or fresh starts)
function _clearChatHistory(filePath) {
  localStorage.removeItem(getChatHistoryKey(filePath));
  return [{ from: 'bot', text: "👋 Chat history cleared! How can I help you today?" }];
}

function getMissingFields(fileName, content) {
  const entry = knowledgeMap[fileName];
  if (!entry || !entry.fields) return [];
  const strip = (str) => str.replace(/[*_]/g, "").trim();
  const normalizedContent = strip(content);
  const missing = [];
  for (const [field, placeholder] of Object.entries(entry.fields)) {
    if (normalizedContent.includes(strip(placeholder))) {
      missing.push(field);
    }
  }
  return missing;
}

// Map folder name to display label
const folderLabel = (name) => {
  if (name === 'voices') return 'VOICES (friends & family)';
  return name.replace(/-/g, ' ').toUpperCase();
};

export default function App() {
  // Dynamic mental model loaded from backend
  const [mentalModel, setMentalModel] = useState([]);
  
  // Restore last selected file from localStorage (helps survive hot-reloads)
  const [selected, setSelected] = useState(() => {
    const folder = localStorage.getItem('mentalos_last_folder');
    const file = localStorage.getItem('mentalos_last_file');
    // Default to AboutMe.md if nothing is selected
    if (folder && file) {
      return { folder, file };
    }
    return { folder: "AboutMe", file: "AboutMe.md" };
  });
  const [fileContent, setFileContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  // Load dynamic model from backend
  const loadModel = async () => {
    const uid = getUserId();
    if (!uid) return;
    try {
      const resp = await fetch(`${MENTAL_API_BASE}/model?user_id=${uid}`);
      const data = await resp.json();
      if (data.model && Array.isArray(data.model)) {
        // Convert backend model to frontend format with icons
        const modelWithIcons = data.model.map(folder => ({
          ...folder,
          icon: getIcon(folder.icon, folder.name),
          files: folder.files.map(file => ({
            ...file,
            icon: getIcon(file.icon, file.name)
          }))
        }));
        setMentalModel(modelWithIcons);
      }
    } catch (err) {
      console.error('Could not load model', err);
      // Fallback to basic model
      setMentalModel([{
        name: "AboutMe",
        icon: getIcon('user', 'AboutMe'),
        files: [{ name: "AboutMe.md", label: "About Me (Summary)", icon: getIcon('file', 'AboutMe.md') }]
      }]);
    }
  };

  // Show file history for transparency
  const showFileHistory = async (fileName) => {
    const uid = getUserId();
    if (!uid || !fileName) return;
    
    try {
      const resp = await fetch(`${MENTAL_API_BASE}/history/${fileName}?user_id=${uid}`);
      const data = await resp.json();
      
      if (resp.ok) {
        alert(`History for ${fileName}:\n\n${data.history.map(h => h.summary).join('\n')}`);
      } else {
        alert(`No history available for ${fileName}`);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      alert('Could not load file history');
    }
  };

  // Apply insights from a voice file to user's mental model
  const applyVoiceInsights = async (voiceFileName) => {
    if (!confirm(`Apply insights from ${voiceFileName.replace('.md', '').replace('_', ' ')} to your mental model?`)) {
      return;
    }
    
    const uid = getUserId();
    if (!uid) return;
    
    try {
      const resp = await fetch(`${MENTAL_API_BASE}/voices/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: uid, 
          voice_file: `voices/${voiceFileName}` 
        })
      });
      
      if (!resp.ok) throw new Error('apply insights failed');
      const data = await resp.json();
      
      alert(`Insights applied! ${data.insights_applied.length} insights extracted from this voice contribution.`);
      
      // Optionally refresh the file content if we're viewing a file that got updated
      if (selected.file && data.insights_applied.some(insight => insight.includes(selected.file))) {
        loadUserContent(); // Refresh file content
      }
      
    } catch (err) {
      alert('Could not apply voice insights');
      console.error(err);
    }
  };

  // Create a new voice file via backend and refresh folder list
  const createVoice = async () => {
    const label = prompt('Person’s name (e.g., Alex)');
    if (!label) return;
    const role = prompt('Relationship (partner, friend, family, coworker)', 'friend') || 'friend';
    const uid = getUserId();
    try {
      const resp = await fetch(`${MENTAL_API_BASE}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: uid, label, role })
      });
      if (!resp.ok) throw new Error('share failed');
      const data = await resp.json();
      await loadModel(); // Reload dynamic model
      setSelected({ folder: 'voices', file: data.file });
      const backendOrigin = new URL(MENTAL_API_BASE).origin;
      const link = backendOrigin + data.url;
      alert(`Voice file ready – send this link to your ${role}:\n${link}`);
    } catch (err) {
      alert('Could not create voice file');
      console.error(err);
    }
  };

  // Use the dynamic model directly

  const [openFolders, setOpenFolders] = useState({
    "AboutMe": true // Always open AboutMe by default
  });
  const defaultGreeting = {
    from: 'bot',
    text: "👋 Welcome to MentalOS! Select a file from the sidebar and I'll guide you on a journey of self-discovery."
  };

  // Restore chat history **for the currently selected file** so a hot-reload doesn't wipe it
  const [botMessages, setBotMessages] = useState([defaultGreeting]);
  const [botInput, setBotInput] = useState("");
  const chatEndRef = useRef(null);
  
  // "Why" panel state for transparency
  const [showWhy, setShowWhy] = useState(false);
  const [lastCitations, setLastCitations] = useState([]);
  const [lastReasoning, setLastReasoning] = useState("");
  const [openTabs, setOpenTabs] = useState(() => {
    // Always have AboutMe.md open by default
    return [{ folder: "AboutMe", file: "AboutMe.md" }];
  }); // [{folder, file}]
  const [activeTab, setActiveTab] = useState(() => {
    // Set AboutMe.md as active by default
    return { folder: "AboutMe", file: "AboutMe.md" };
  });
  const [diffModal, setDiffModal] = useState(null); // {diff, oldText, newText}
  const [diffHighlights, setDiffHighlights] = useState([]); // [{from, to}]

  // Build a CodeMirror decoration plugin whenever highlight ranges change
  const highlightExtension = React.useMemo(() => {
    if (!diffHighlights || diffHighlights.length === 0) return [];
    const mark = Decoration.mark({ class: 'cm-diff-insert' });
    const plugin = ViewPlugin.fromClass(class {
      constructor() {
        const builder = new RangeSetBuilder();
        diffHighlights.forEach(r => builder.add(r.from, r.to, mark));
        this.decorations = builder.finish();
      }
      update() { /* static highlights until timer clears */ }
    }, {
      decorations: v => v.decorations
    });
    return [plugin];
  }, [diffHighlights]);

  // Interview session state for deep-dive files
  const interviewRef = useRef({ // {questions:[], idx:0, answers:[]}
    questions: [],
    idx: 0,
    answers: []
  });

  function extractInterviewQuestions(content) {
    // First: use knowledge map if questions defined
    const entry = knowledgeMap[selected.file];
    if (entry && entry.interview && Array.isArray(entry.interview)) {
      return entry.interview;
    }
    // Fallback to comment block scan
    const m = content.match(/<!--([\s\S]*?)-->/);
    if (!m) return [];
    const block = m[1];
    if (!/interview:/i.test(block)) return [];
    return block.split('\n').filter(l => l.trim().startsWith('-')).map(l => l.replace(/^-\s*/, '').trim());
  }

  // Ensure openTabs never contains duplicates (can happen under React 18 dev double-invoke)
  useEffect(() => {
    if (openTabs.length <= 1) return; // nothing to dedupe
    const seen = new Set();
    const unique = openTabs.filter(tab => {
      const key = `${tab.folder}/${tab.file}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (unique.length !== openTabs.length) {
      setOpenTabs(unique);
    }
  }, [openTabs]);

  // When the user switches to a different tab/file, load that file's chat history
  useEffect(() => {
    if (!selected.file) return;
    try {
      const saved = localStorage.getItem(getChatHistoryKey(selected.file));
      const label = mentalModel.find(f => f.name === selected.folder)?.files.find(f => f.name === selected.file)?.label || selected.file;
      const greeting = { from: 'bot', text: `👋 Let's explore your **${label}**. Feel free to share anything you're comfortable with, and I'll help fill in the details.` };
      if (saved) {
        const parsed = JSON.parse(saved);
        setBotMessages(parsed.length > 0 ? parsed : [greeting]);
      } else {
        setBotMessages([greeting]);
      }
    } catch {
      setBotMessages([defaultGreeting]);
    }
  }, [selected.file]);

  // Persist chat history whenever it changes (per-file)
  useEffect(() => {
    if (!selected.file) return;
    try {
      if (botMessages.length > 0) {
        localStorage.setItem(getChatHistoryKey(selected.file), JSON.stringify(botMessages));
      }
    } catch { /* storage quota / private mode */ }
  }, [botMessages, selected.file]);

  // Load file content from localStorage when selection changes
  useEffect(() => {
    if (selected.folder && selected.file) {
      // First try to load from backend (real file system)
      fetchFileContent(selected.file, getUserId()).then(backendContent => {
        const key = getFileKey(selected.folder, selected.file);
        let content = backendContent;
        
        // If backend has meaningful content, use it
        if (content.trim()) {
          setFileContent(content);
          localStorage.setItem(key, content); // Keep localStorage in sync
          setIsDirty(false);
          return;
        }
        
        // If backend has no content, check localStorage
        const localContent = localStorage.getItem(key) || "";
        if (localContent.trim()) {
          setFileContent(localContent);
          setIsDirty(false);
          return;
        }
        
        // If neither has content, use template
        const template = fileTemplates[selected.file] || "# ✨ Blank Canvas\n\nThis space is waiting for your insights. Start typing or chat with the Therapist Bot to co-create!";
        setFileContent(template);
        localStorage.setItem(key, template);
        // Persist template to backend so future placeholder patches work correctly
        saveFileToBackend(selected.file, template, getUserId());
        setIsDirty(false);
      }).catch(error => {
        console.error('Failed to load file from backend, using localStorage:', error);
        // Fallback to old localStorage method
        const key = getFileKey(selected.folder, selected.file);
        let saved = localStorage.getItem(key) || "";
        if (!saved.trim()) {
          saved = fileTemplates[selected.file] || "# ✨ Blank Canvas\n\nThis space is waiting for your insights. Start typing or chat with the Therapist Bot to co-create!";
          localStorage.setItem(key, saved);
        }
        setFileContent(saved);
        saveFileToBackend(selected.file, saved, getUserId());
        setIsDirty(false);
      });
    }
  }, [selected]);

  // Auto-save on content change
  useEffect(() => {
    if (selected.folder && selected.file && isDirty) {
      const key = getFileKey(selected.folder, selected.file);
      localStorage.setItem(key, fileContent);
    }
  }, [fileContent, isDirty, selected]);

  // Scroll chat to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [botMessages]);

  // Handle user reply in bot chat
  const handleBotSend = async (e) => {
    e.preventDefault();
    if (!botInput.trim()) return;
    const userMsg = { from: "user", text: botInput.trim() };
    setBotMessages(msgs => [...msgs, userMsg]);
    setBotInput("");

    // If interview session active, record answer and maybe send next question
    if (interviewRef.current.questions.length > 0) {
      interviewRef.current.answers.push(userMsg.text);
      const nextIdx = interviewRef.current.idx + 1;
      if (nextIdx < interviewRef.current.questions.length) {
        interviewRef.current.idx = nextIdx;
        const nextQ = interviewRef.current.questions[nextIdx];
        setBotMessages(msgs => [...msgs, { from: 'bot', text: nextQ }]);
        return; // Skip backend call until interview complete
      } else {
        // interview complete – send answers to backend
        const answersPayload = interviewRef.current.answers;
        interviewRef.current = { questions: [], idx: 0, answers: [] };
        await fetch(BACKEND_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "session_complete",
            active_file: selected.file,
            user_id: getUserId(),
            session_answers: answersPayload
          })
        }).then(r=>r.json()).then(data=>{
          if (data.snippet) {
            setFileContent(data.snippet);
            localStorage.setItem(getFileKey(selected.folder, selected.file), data.snippet);
          }
          if (data.ai_response) {
            setBotMessages(msgs=>[...msgs, {from:'bot', text:data.ai_response}]);
          }
        }).catch(console.error);
        return;
      }
    }

    // Build the conversation for GPT
    const fileKey = selected.file;
    const prompts = fileBotPrompts[fileKey] || [];
    const botMsgs = botMessages.filter(m => m.from === "bot");
    const userMsgs = botMessages.filter(m => m.from === "user");
    const messages = [
      { role: "system", content: `You are a world-class therapist helping a user fill out their personal file: ${fileDescriptions[fileKey] || fileKey}. Guide them with empathy and curiosity.` },
    ];
    // Add previous Q&A
    for (let i = 0; i < Math.max(botMsgs.length, userMsgs.length); i++) {
      if (botMsgs[i]) messages.push({ role: "assistant", content: botMsgs[i].text });
      if (userMsgs[i]) messages.push({ role: "user", content: userMsgs[i].text });
    }
    // Add the next prompt if available
    const nextPrompt = prompts[botMsgs.length] || null;
    if (nextPrompt) messages.push({ role: "assistant", content: nextPrompt });
    // Add the user's latest answer
    messages.push({ role: "user", content: userMsg.text });

    // Call backend API instead of OpenAI directly
    try {
      const response = await fetch(BACKEND_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          user_id: getUserId(), // Consistent user ID across sessions
          active_file: selected.file,
          open_files: openTabs.map(t => t.file),
          missing_fields: getMissingFields(selected.file, fileContent),
        }),
      });
      const data = await response.json();
      
      // Handle error responses properly
      if (!response.ok && !data.ai_response) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      const gptReply = data.ai_response || data.choices?.[0]?.message?.content || data.message || "Thank you for sharing!";
      
      // Capture citations and reasoning for "Why" panel
      const citations = data.citations || [];
      const reasoning = data.reasoning || "";
      if (citations.length > 0 || reasoning) {
        setLastCitations(citations);
        setLastReasoning(reasoning);
      }
      
      // Sync file changes from backend to frontend
      if (data.sources && data.sources.length > 0) {
        data.sources.forEach(source => {
          if (source.operation === 'overwrite_file' || source.operation === 'append_file') {
            const folderName = findFolderForFile(source.path);
            if (selected.file === source.path) {
              const newText = source.snippet;
              // Capture old content BEFORE applying the patch so we can highlight new additions
              const oldText = fileContent;
              // We now rely on the backend AST patcher to guarantee safe edits, so we skip the
              // old length-based rejection check that mis-fired on small placeholder updates.
              // Auto-apply the patch and subtly notify the user
              // Compute inserted ranges and highlight them inline
              try {
                const dmp = new DiffMatchPatch();
                const diffs = dmp.diff_main(oldText, newText);
                dmp.diff_cleanupSemantic(diffs);
                let cursor = 0;
                const ranges = [];
                diffs.forEach(([op, text]) => {
                  if (op === DiffMatchPatch.DIFF_INSERT && text.trim().length > 0) {
                    ranges.push({ from: cursor, to: cursor + text.length });
                    cursor += text.length;
                  } else if (op !== DiffMatchPatch.DIFF_DELETE) {
                    cursor += text.length;
                  }
                });
                setDiffHighlights(ranges);
                // Clear highlights after a few seconds so they don't linger forever
                setTimeout(() => setDiffHighlights([]), 6000);
              } catch (err) {
                console.warn('Failed to compute diff highlights', err);
              }
              setFileContent(newText);
              localStorage.setItem(getFileKey(selected.folder, selected.file), newText);
              // Show a subtle toast instead of injecting another bot bubble
              if (window?.toast) {
                window.toast('Saved to file ✨', { type: 'success', duration: 2000 });
              }
            } else {
              // For non-active files, only update localStorage if the patch is safe
              if (folderName && source.snippet && source.snippet.trim().length > 0) {
                localStorage.setItem(getFileKey(folderName, source.path), source.snippet);
              }
            }
          } else if (source.operation === 'open_file') {
            // Ensure the UI switches to the file the backend just opened
            const folderName = findFolderForFile(source.path);
            if (folderName) {
              setSelected(() => ({ folder: folderName, file: source.path }));
              setOpenTabs(tabs => {
                const exists = tabs.some(t => t.folder === folderName && t.file === source.path);
                return exists ? tabs : [...tabs, { folder: folderName, file: source.path }];
              });
            }
          }
        });
      }
      
      setBotMessages(msgs => [...msgs, { from: "bot", text: gptReply, sources: data.sources || [], citations, reasoning }]);

      // Ignore diff_preview popups – auto-apply handled earlier
    } catch (error) {
      console.error('Chat API Error:', error);
      setBotMessages(msgs => [...msgs, { 
        from: "bot", 
        text: `🚨 **Connection Error**\n\nCould not connect to the AI system.\n\n**Possible causes:**\n- Server is not running\n- API key is not configured\n- Network connection issue\n\n**To fix:**\n1. Check that the server is running on port 8080\n2. Verify your .env file has a valid OpenAI API key\n3. Restart the server\n\n*Error details: ${error.message}*`
      }]);
    }
  };

  // Update openTabs and activeTab when a file is selected from the sidebar
  useEffect(() => {
    if (selected.folder && selected.file) {
      const tabKey = `${selected.folder}/${selected.file}`;
      if (!openTabs.some(tab => tab.folder === selected.folder && tab.file === selected.file)) {
        setOpenTabs(tabs => [...tabs, { folder: selected.folder, file: selected.file }]);
      }
      setActiveTab(tabKey);
    }
  }, [selected]);

  // Handle tab click
  const handleTabClick = (tab) => {
    setSelected({ folder: tab.folder, file: tab.file });
  };

  // Handle tab close
  const handleTabClose = (tab, e) => {
    e.stopPropagation();
    setOpenTabs(tabs => tabs.filter(t => !(t.folder === tab.folder && t.file === tab.file)));
    // If closing the active tab, switch to the last tab or the first remaining tab
    const tabKey = `${tab.folder}/${tab.file}`;
    if (activeTab === tabKey) {
      const remaining = openTabs.filter(t => !(t.folder === tab.folder && t.file === tab.file));
      if (remaining.length > 0) {
        setSelected({ folder: remaining[remaining.length - 1].folder, file: remaining[remaining.length - 1].file });
      } else {
        // Instead of setting selected to null, default to AboutMe.md
        setSelected({ folder: "AboutMe", file: "AboutMe.md" });
      }
    }
  };

  // When a folder is clicked, open it and close all others
  const handleFolderClick = (folderName) => {
    setOpenFolders(f => Object.fromEntries(mentalModel.map(fld => [fld.name, fld.name === folderName ? !f[folderName] : false])));
  };

  // Auto-prompt bot when file opens and chat is empty
  useEffect(() => {
    if (selected.folder && selected.file) {
      // Save selection so we can restore after reloads
      localStorage.setItem('mentalos_last_folder', selected.folder);
      localStorage.setItem('mentalos_last_file', selected.file);
      const fileKey = selected.file;
      const prompts = fileBotPrompts[fileKey] || [];
      // Setup interview if present
      const interviewQs = extractInterviewQuestions(fileContent);
      if (interviewQs.length > 0) {
        interviewRef.current = { questions: interviewQs, idx: 0, answers: [] };
      } else {
        interviewRef.current = { questions: [], idx: 0, answers: [] };
      }

      // We no longer compute missing fields on the front-end; backend handles the flow.

      // Defer field-specific questions to the backend so the conversation feels cohesive.
      if (interviewRef.current.questions.length > 0) {
        // Start interview if not already started
        const askedFirst = botMessages.some(m => m.from === 'bot' && m.text === interviewRef.current.questions[0]);
        if (!askedFirst) {
          setBotMessages(msgs => [...msgs, { from: 'bot', text: interviewRef.current.questions[0] }]);
        }
      } else if (prompts.length > 0 && botMessages.length === 1) {
        setBotMessages(msgs => [...msgs, { from: 'bot', text: prompts[0] }]);
      }
      return;
    }
  }, [selected, botMessages]);

  // Removed local auto-prompt; backend will guide the flow after each placeholder replacement.

  // Fetch dynamic folders once on mount
  useEffect(() => {
    loadModel(); // Load dynamic mental model from backend
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty && selected.file) {
          saveFileToBackend(selected.file, fileContent, getUserId()).then(() => {
            setIsDirty(false);
            if (window?.toast) window.toast('Saved ✨', { type: 'success', duration: 1500 });
          }).catch(err => {
            console.error('Save failed', err);
            alert('Could not save file');
          });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDirty, selected.file, fileContent]);

  return (
    <div data-theme="mentalos" className="h-screen w-screen bg-base-100 text-base-content overflow-hidden flex">
      {/* Sidebar */}
      <aside className="w-60 bg-neutral shadow-lg flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-base-content/10">
          <h1 className="text-xl font-bold text-gray-100">MentalOS</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ul className="p-2 space-y-1">
            {mentalModel.map((folder) => (
              <li key={folder.name}>
                {folder.locked ? (
                  // Locked folder - show as disabled with unlock hint
                  <div className="opacity-50 cursor-not-allowed">
                    <div className={`uppercase font-semibold flex items-center gap-1 ${folderColor(folder.name)} p-2`}>
                      <FaLock className="inline text-gray-500 mr-2" />
                      <span className="truncate max-w-[120px]">{folderLabel(folder.name)}</span>
                    </div>
                    <div className="text-xs text-gray-500 pl-6 pb-1">
                      🔐 {folder.unlock_hint || "Complete previous sections to unlock"}
                    </div>
                  </div>
                ) : (
                  <details open={!!openFolders[folder.name]}>
                    <summary onClick={(e) => { e.preventDefault(); handleFolderClick(folder.name); }} className={`uppercase font-semibold flex items-center gap-1 ${folderColor(folder.name)} whitespace-nowrap`}>
                      {folder.icon ? folder.icon : <FaFolderOpen className="inline text-gray-400" />}
                      <span className="truncate max-w-[140px]">{folderLabel(folder.name)}</span>
                      {folder.name === 'voices' && (
                        <button onClick={(e) => { e.stopPropagation(); createVoice(); }} className="ml-auto btn btn-xs btn-ghost text-primary hover:bg-base-300">
                          <FaPlus />
                        </button>
                      )}
                    </summary>
                     <ul className="list-none pl-4">
                      {/* Removed empty-state hint for voices */}
                      {folder.files.map((file) => (
                      <li key={file.name}>
                        <div className="flex items-center">
                          <a
                            className={
                              selected.folder === folder.name && selected.file === file.name ? 'sidebar-link-active sidebar-link flex-1' : 'sidebar-link flex-1'
                            }
                            onClick={() => { setSelected({ folder: folder.name, file: file.name }); }}
                          >
                            {file.icon}
                             <span className="truncate max-w-[150px] align-middle">{file.label}</span>
                          </a>
                          {folder.name === 'voices' && file.name !== 'ABOUT_THIS_FOLDER.md' && (
                            <button 
                              onClick={() => applyVoiceInsights(file.name)}
                              className="btn btn-xs btn-ghost text-blue-400 hover:bg-base-300 ml-1"
                              title="Apply insights from this voice"
                            >
                              🧠
                            </button>
                          )}
                        </div>
                      </li>
                                          ))}
                    </ul>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-2 border-t border-base-content/10 text-xs opacity-40 flex-shrink-0">
          <div>v0.1</div>
          <div className="text-xs mt-1">
            User: {getUserId().slice(-8)}
          </div>
          <div className="text-xs">
            Messages: {botMessages.length}
          </div>
          <div className="text-xs">
            File: {fileContent.length} chars
          </div>
          <button 
            onClick={() => setBotMessages(_clearChatHistory(selected.file))}
            className="text-xs hover:opacity-80 mt-1 underline"
          >
            Clear Chat
          </button>
          <button 
            onClick={() => {
              // Clear all MentalOS localStorage data
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith('mentalos_') || key.startsWith('mentalOS/')) {
                  localStorage.removeItem(key);
                }
              });
              window.location.reload();
            }}
            className="text-xs hover:opacity-80 mt-1 underline"
          >
            Reset Cache
          </button>
        </div>
      </aside>
      
      {/* Main content area (tab bar + editor) */}
      <div className="col-start-2 row-start-1 row-span-2 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {/* Tab bar */}
        <div className="flex items-center h-10 bg-neutral space-x-1 overflow-x-auto border-b border-base-content/10 flex-shrink-0">
          {openTabs.map(tab => {
            const tabKey = `${tab.folder}/${tab.file}`;
            const isActive = activeTab === tabKey;
            const label = mentalModel.find(f => f.name === tab.folder)?.files.find(f => f.name === tab.file)?.label || tab.file;
            return (
              <button
                key={tabKey}
                onClick={() => handleTabClick(tab)}
                className={`px-3 py-1 rounded-t-md text-sm ${isActive ? 'bg-base-300 text-primary font-semibold' : 'bg-transparent hover:bg-base-300/30'}`}
              >
                {label}
                <span
                  className="ml-1 opacity-60 hover:opacity-100"
                  onClick={e => handleTabClose(tab, e)}
                >
                  ×
                </span>
              </button>
            );
          })}
        </div>

        {/* Main editor area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-auto p-6 gap-4">
        {selected.folder && selected.file ? (
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 flex-1 pb-6">
              {/* File header with Save button */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg font-bold text-gray-200 truncate max-w-[220px]">{mentalModel.find(f => f.name === selected.folder)?.files.find(f => f.name === selected.file)?.label}</span>
                  <span className="text-xs text-gray-400">({selected.file})</span>
                </div>
                <button
                  className={`btn btn-xs btn-ghost ${isDirty ? 'text-primary hover:bg-base-300' : 'text-gray-500 cursor-default'}`}
                  disabled={!isDirty}
                  title={isDirty ? 'Save (Ctrl/Cmd+S)' : 'Saved'}
                  onClick={async () => {
                    try {
                      await saveFileToBackend(selected.file, fileContent, getUserId());
                      setIsDirty(false);
                      if (window?.toast) window.toast('Saved ✨', { type: 'success', duration: 1500 });
                    } catch (e) {
                      console.error('Save failed', e);
                      alert('Could not save file');
                    }
                  }}
                >
                  Save
                </button>
              </div>
              <div className="mb-4 text-sm text-blue-300 bg-blue-900/40 rounded-sm p-2 w-full">
                {fileDescriptions[selected.file] || "This file is for mapping a part of your mind."}
              </div>
              {/* Fallback for missing/corrupted file content */}
              {(!fileContent || fileContent.trim().length === 0) ? (
                <div className="flex flex-col items-center justify-center gap-2 p-8 bg-base-200/60 rounded">
                  <div className="text-red-400 font-semibold">This file is empty or could not be loaded.</div>
                  <button className="btn btn-sm btn-primary" onClick={() => {
                    const template = fileTemplates[selected.file] || "# ✨ Blank Canvas\n\nThis space is waiting for your insights. Start typing or chat with the Therapist Bot to co-create!";
                    setFileContent(template);
                    setIsDirty(true);
                  }}>Reset file</button>
                </div>
              ) : (
                <div className="flex-1 min-h-0 overflow-hidden">
                  <CodeMirror
                    value={fileContent}
                    height="100%"
                    maxHeight="100%"
                    basicSetup={false} /* disable default line numbers & gutters */
                    extensions={[markdown(), ...highlightExtension]}
                    theme={oneDark}
                    onChange={(val) => {
                      setFileContent(val);
                      setIsDirty(true);
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <span>Select a file to view or edit details.</span>
          )}
        {diffModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setDiffModal(null)}>
    <div className="bg-base-100 p-4 rounded-lg max-w-3xl w-full" onClick={e => e.stopPropagation()}>
      <h2 className="font-bold mb-2">Recent Update</h2>
      {diffModal.oldText && diffModal.newText ? (
        <DiffViewer oldText={diffModal.oldText} newText={diffModal.newText} />
      ) : (
        <pre className="p-4 text-xs overflow-auto bg-base-300 border border-base-content/20 rounded-md mb-4">{diffModal.diff}</pre>
      )}
      <div className="mt-4 flex justify-end gap-2">
        <button className="btn btn-sm" onClick={() => setDiffModal(null)}>Got it</button>
      </div>
    </div>
  </div>
 )}
        </div>
        
        {/* Chat window – fixed row at bottom of grid */}
        <div className="col-start-2 row-start-3 flex flex-col gap-2 p-4 bg-base-200/40 backdrop-blur-sm border-t border-base-content/10">
        <div className="flex-1 overflow-y-auto pr-2">
          {botMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-bubble ${msg.from === 'bot' ? 'bg-base-300' : 'bg-primary/60 self-end'} mb-2 p-2 rounded text-sm`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleBotSend} className="flex gap-2 pt-2">
          <input
            type="text"
            value={botInput}
            onChange={e => setBotInput(e.target.value)}
            className="input input-bordered flex-1 text-sm"
            placeholder="Type your response and press Enter…"
          />
          <button type="submit" className="btn btn-primary btn-sm">Send</button>
          {(lastCitations.length > 0 || lastReasoning) && (
            <button 
              type="button" 
              onClick={() => setShowWhy(!showWhy)}
              className="btn btn-outline btn-sm"
              title="See sources and reasoning"
            >
              Why?
            </button>
          )}
        </form>
        
        {/* "Why" Panel - Shows citations and reasoning */}
        {showWhy && (
          <div className="mt-3 p-3 bg-base-200 rounded-lg border-l-4 border-blue-500">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-sm">Why this response?</h4>
              <button 
                onClick={() => setShowWhy(false)}
                className="btn btn-ghost btn-xs"
              >
                ✕
              </button>
            </div>
            
            {lastReasoning && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 italic">{lastReasoning}</p>
              </div>
            )}
            
            {lastCitations.length > 0 && (
              <div>
                <h5 className="font-medium text-xs mb-1">Sources:</h5>
                <div className="space-y-1">
                  {lastCitations.map((citation, idx) => (
                    <div key={idx} className="text-xs bg-base-100 p-2 rounded cursor-pointer hover:bg-base-300" 
                         onClick={() => {
                           // Open the cited file
                           if (citation.file) {
                             const folder = findFolderForFile(citation.file);
                             if (folder) {
                               setSelected({ folder, file: citation.file });
                             }
                           }
                         }}>
                      <div className="font-medium">{citation.file}</div>
                      <div className="text-gray-500 truncate">{citation.snippet}</div>
                      <div className="text-blue-500 text-xs">{citation.type}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}