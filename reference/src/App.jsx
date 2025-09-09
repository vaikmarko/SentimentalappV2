import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { FaFolder, FaFolderOpen, FaFile, FaUser, FaBrain, FaHeart, FaUsers, FaBook, FaComments, FaLock, FaSave, FaPlus, FaCog, FaTrash, FaRedo } from 'react-icons/fa';
import { GiThink } from 'react-icons/gi';
import { MdStickyNote2 } from 'react-icons/md';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import * as DiffMatchPatch from 'diff-match-patch';
import DiffViewer from './DiffViewer';
import './App.css';

// Helper to convert backend model to frontend with React icons
const mapBackendToFrontend = (backendModel) => {
  const iconMap = {
    'user': <FaUser className="inline text-gray-400" />,
    'brain': <FaBrain className="inline text-gray-400" />,
    'heart': <FaHeart className="inline text-gray-400" />,
    'users': <FaUsers className="inline text-gray-400" />,
    'book': <FaBook className="inline text-gray-400" />,
    'comments': <FaComments className="inline text-gray-400" />,
    'file': <FaFile className="inline text-gray-400" />,
    'folder': <FaFolder className="inline text-gray-400" />
  };

  return backendModel.map(folder => ({
    ...folder,
    icon: iconMap[folder.icon] || <FaFolder className="inline text-gray-400" />,
    files: folder.files.map(file => ({
      ...file,
      icon: iconMap[file.icon] || <FaFile className="inline text-gray-400" />
    }))
  }));
};

function App() {
  const [mentalModel, setMentalModel] = useState([]);
  const [selected, setSelected] = useState({ folder: null, file: null });
  const [fileContent, setFileContent] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [openFolders, setOpenFolders] = useState({});
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  // const [isSaving, setIsSaving] = useState(false);
  const [diffModal, setDiffModal] = useState(null);
  const [showWhy, setShowWhy] = useState(false);
  const [lastCitations, setLastCitations] = useState([]);
  const [lastReasoning, setLastReasoning] = useState('');
  const [showDevTools, setShowDevTools] = useState(false);

  // Load dynamic model on mount
  const loadModel = async () => {
    try {
      console.log('Loading model for user:', getCurrentUserId());
      const response = await fetch('/api/mental-os/model?user_id=' + getCurrentUserId());
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded model data:', data);
        const frontendModel = mapBackendToFrontend(data.model);
        console.log('Frontend model:', frontendModel);
        setMentalModel(frontendModel);
        // Initialize open folders for unlocked folders
        const initialOpen = {};
        frontendModel.forEach(folder => {
          if (!folder.locked) {
            initialOpen[folder.name] = true;
          }
        });
        setOpenFolders(initialOpen);
      } else {
        console.error('Failed to load model:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading model:', error);
    }
  };

  useEffect(() => {
    loadModel();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const folderLabel = (name) => {
    const labels = {
      'AboutMe': 'ABOUTME',
      'core-identity': 'CORE IDENTITY',
      'emotional-system': 'EMOTIONAL SYSTEM',
      'relationships': 'RELATIONSHIPS',
      'session-summaries': 'SESSION SUMMARIES',
      'voices': 'VOICES (FRIENDS/PARTNER)'
    };
    return labels[name] || name.toUpperCase();
  };

  const folderColor = (name) => {
    const colors = {
      'AboutMe': 'text-blue-400',
      'core-identity': 'text-purple-400',
      'emotional-system': 'text-pink-400',
      'relationships': 'text-green-400',
      'session-summaries': 'text-yellow-400',
      'voices': 'text-cyan-400'
    };
    return colors[name] || 'text-gray-400';
  };

  // const folderIcon = (icon) => {
  //   return icon || <FaFolderOpen className="inline text-gray-400" />;
  // };

  const getCurrentUserId = () => {
    const stored = localStorage.getItem('mentalos_user_id');
    if (stored) return stored;
    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('mentalos_user_id', newId);
    return newId;
  };

  const handleFileClick = async (folder, file) => {
    const fileObj = { folder: folder.name, file: file.name };
    
    // Check if tab is already open
    const tabKey = `${fileObj.folder}/${fileObj.file}`;
    const existingTab = openTabs.find(t => `${t.folder}/${t.file}` === tabKey);
    
    if (!existingTab) {
      setOpenTabs([...openTabs, fileObj]);
    }
    
    setActiveTab(tabKey);
    await loadFile(fileObj);
  };

  const loadFile = async (fileObj) => {
    if (isDirty && selected.file) {
      const shouldContinue = window.confirm('You have unsaved changes. Do you want to discard them?');
      if (!shouldContinue) return;
    }

    setSelected(fileObj);
    try {
      const response = await fetch(`/api/mental-os/files/${fileObj.file}?user_id=${getCurrentUserId()}`);
      if (response.ok) {
        const data = await response.json();
        setFileContent(data.content || '');
        setIsDirty(false);
      } else if (response.status === 404) {
        // File doesn't exist, show empty content
        setFileContent('');
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Error loading file:', error);
      setFileContent('');
      setIsDirty(false);
    }
  };

  const handleTabClick = (tab) => {
    const tabKey = `${tab.folder}/${tab.file}`;
    setActiveTab(tabKey);
    loadFile(tab);
  };

  const handleTabClose = (tab, e) => {
    e.stopPropagation();
    const tabKey = `${tab.folder}/${tab.file}`;
    const newTabs = openTabs.filter(t => `${t.folder}/${t.file}` !== tabKey);
    setOpenTabs(newTabs);
    
    if (activeTab === tabKey && newTabs.length > 0) {
      const nextTab = newTabs[newTabs.length - 1];
      handleTabClick(nextTab);
    } else if (newTabs.length === 0) {
      setSelected({ folder: null, file: null });
      setFileContent('');
      setActiveTab(null);
    }
  };

  const saveFile = async () => {
    if (!selected.file || !isDirty) return;
    
    try {
      const response = await fetch('/api/mental-os/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: selected.file,
          content: fileContent,
          user_id: getCurrentUserId()
        })
      });
      
      if (response.ok) {
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const sendBotMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const response = await fetch('/api/mental-os/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMsg }],
          user_id: getCurrentUserId(),
          active_file: selected.file
        })
      });

      const data = await response.json();
      
      // Capture citations and reasoning
      if (data.citations) setLastCitations(data.citations);
      if (data.reasoning) setLastReasoning(data.reasoning);
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      
      if (data.sources && data.sources.length > 0) {
        const source = data.sources[0];
        if (source.operation === 'overwrite_file' && source.path === selected.file) {
          if (data.diff_preview) {
            setDiffModal({
              oldContent: fileContent,
              newContent: source.snippet,
              summary: data.diff_preview,
              onAccept: () => {
                setFileContent(source.snippet);
                setIsDirty(true);
                setDiffModal(null);
              }
            });
      } else {
            setFileContent(source.snippet);
            setIsDirty(true);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const createVoice = async () => {
    const name = prompt('Enter the name of the person (e.g., "Alex Friend", "Mom", "Partner"):');
    if (!name) return;
    
    const filename = name.toLowerCase().replace(/\s+/g, '_') + '.md';
    const template = `# Voice Contribution from ${name}

## About This File
This file captures ${name}'s perspective about you. They can share observations, memories, and insights that help build a richer understanding of who you are.

## Their Relationship to You
[Partner/Friend/Family/Therapist/Other]

## How Long They've Known You
[Duration]

## Their Observations About You

### What They Appreciate Most
[What ${name} values about you]

### Memorable Moments Together
[Specific experiences that reveal your character]

### Your Strengths (from their perspective)
[What you're good at, according to ${name}]

### Areas for Growth (supportive observations)
[Gentle insights about potential improvements]

### How You Handle Challenges
[Their observations of your resilience and coping]

### What Makes You Unique
[Special qualities they see in you]

## Message to You
[A personal note from ${name} to you]

---
*Note: This perspective is valuable for understanding how others see you. All insights are shared with care and respect.*`;

    try {
      const response = await fetch('/api/mental-os/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: `voices/${filename}`,
          content: template,
          user_id: getCurrentUserId()
        })
      });
      
      if (response.ok) {
        await loadModel();
      }
    } catch (error) {
      console.error('Error creating voice file:', error);
    }
  };

  const applyVoiceInsights = async (voiceFile) => {
    try {
      const response = await fetch('/api/mental-os/voices/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: getCurrentUserId(),
          voice_file: voiceFile
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Applied insights from ${voiceFile}:\n\n${data.analysis}`);
      }
    } catch (error) {
      console.error('Error applying voice insights:', error);
    }
  };

  // const showFileHistory = async (filename) => {
  //   try {
  //     const response = await fetch(`/api/mental-os/history/${filename}?user_id=${getCurrentUserId()}`);
  //     if (response.ok) {
  //       const data = await response.json();
  //       const historyText = data.history.map(h => 
  //         `Version ${h.version}: ${h.summary} (${h.size} bytes)`
  //       ).join('\n');
  //       alert(`File History for ${filename}:\n\n${historyText}`);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching file history:', error);
  //   }
  // };

  const handleFolderClick = (folderName) => {
    setOpenFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  // Developer Tools Functions
  const clearAllData = async () => {
    if (window.confirm('⚠️ This will delete ALL user data and reset to empty state. Are you sure?')) {
      try {
        const response = await fetch('/api/mental-os/dev/clear-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: getCurrentUserId() })
        });
        
        if (response.ok) {
          // Clear frontend state
          setMessages([]);
          setFileContent('');
          setSelected({ folder: null, file: null });
          setOpenTabs([]);
          setActiveTab(null);
          setIsDirty(false);
          await loadModel();
          alert('✅ All data cleared successfully!');
        } else {
          alert('❌ Failed to clear data');
        }
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('❌ Error clearing data');
      }
    }
  };

  const clearCache = async () => {
    if (window.confirm('🔄 Start a new user session? This will clear your data but keep file templates.')) {
      try {
        // First, reset files to templates (preserve structure)
        const response = await fetch('/api/mental-os/dev/reset-to-templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: getCurrentUserId() })
        });
        
        if (response.ok) {
          // Clear browser cache/storage
          localStorage.removeItem('mentalos_user_id');
          sessionStorage.clear();
          // Generate new user ID
          const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('mentalos_user_id', newId);
          window.location.reload();
        } else {
          alert('❌ Failed to reset session');
        }
      } catch (error) {
        console.error('Error resetting session:', error);
        alert('❌ Error resetting session');
      }
    }
  };

  const resetCurrentFile = () => {
    if (selected.file && window.confirm(`Reset ${selected.file} to original template?`)) {
      setFileContent('# Empty File\n\nThis file has been reset.');
      setIsDirty(true);
    }
  };

  // Auto-save disabled - manual save only
  // useEffect(() => {
  //   if (!isDirty) return;
  //   
  //   const timer = setTimeout(() => {
  //     saveFile();
  //   }, 2000);
  //   
  //   return () => clearTimeout(timer);
  // }, [fileContent, isDirty]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty) saveFile();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDirty, selected.file, fileContent]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 bg-gray-900 text-gray-100 flex overflow-hidden" style={{ margin: 0, padding: 0 }}>
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-gray-700 flex-shrink-0">
          <h1 className="text-xl font-bold">MentalOS</h1>
        </div>
        
        {/* Developer Tools Panel */}
        {showDevTools && (
          <div className="px-3 py-3 bg-red-900/30 border-b border-red-700/50">
            <div className="text-sm font-bold text-red-300 mb-3 flex items-center gap-2">
              🛠️ Developer Tools
            </div>
            <div className="space-y-2">
              <button
                onClick={clearCache}
                className="w-full text-left px-3 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded flex items-center gap-2 font-medium"
              >
                <FaRedo className="w-4 h-4" />
                Reset User Data
              </button>
              <button
                onClick={resetCurrentFile}
                className="w-full text-left px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2 font-medium disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!selected.file}
              >
                <FaRedo className="w-4 h-4" />
                Reset Current File
              </button>
              <button
                onClick={clearAllData}
                className="w-full text-left px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-2 font-medium"
              >
                <FaTrash className="w-4 h-4" />
                Clear All Data
              </button>
            </div>
            <div className="mt-3 text-xs text-red-300/70">
              ⚠️ Use for testing only
            </div>
          </div>
        )}
        
        <nav className="flex-1 overflow-y-auto p-3">
          {mentalModel.map((folder) => (
            <div key={folder.name} className="mb-2">
              {folder.locked ? (
                <div className="opacity-50 cursor-not-allowed">
                  <div className={`flex items-center gap-2 px-2 py-1.5 text-sm font-medium ${folderColor(folder.name)}`}>
                    <FaLock className="w-3 h-3" />
                    <span>{folderLabel(folder.name)}</span>
                  </div>
                  <div className="text-xs text-gray-500 ml-7 mt-0.5">
                    {folder.unlock_hint || "Complete previous sections"}
                  </div>
                </div>
              ) : (
                <details open={!!openFolders[folder.name]}>
                  <summary 
                    onClick={(e) => { e.preventDefault(); handleFolderClick(folder.name); }} 
                    className={`flex items-center gap-2 px-2 py-1.5 text-sm font-medium cursor-pointer hover:bg-gray-700/50 rounded ${folderColor(folder.name)}`}
                  >
                    {openFolders[folder.name] ? <FaFolderOpen className="w-4 h-4" /> : <FaFolder className="w-4 h-4" />}
                    <span className="flex-1">{folderLabel(folder.name)}</span>
                    {folder.name === 'voices' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); createVoice(); }} 
                        className="hover:bg-gray-600 p-0.5 rounded"
                      >
                        <FaPlus className="w-3 h-3" />
                      </button>
                    )}
                  </summary>
                  <ul className="ml-3 mt-1">
                    {folder.files.map((file) => (
                      <li key={file.name} className="flex items-center group">
          <button 
                          onClick={() => handleFileClick(folder, file)}
                          className={`flex-1 flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-gray-700/50 text-left ${
                            selected.file === file.name ? 'bg-blue-600/20 text-blue-400' : 'text-gray-300'
                          }`}
                        >
                          <FaFile className="w-3 h-3 opacity-50" />
                          <span className="truncate">{file.label}</span>
          </button>
                        {folder.name === 'voices' && file.name.startsWith('voices/') && (
          <button 
                            onClick={() => applyVoiceInsights(file.name)}
                            className="opacity-0 group-hover:opacity-100 hover:bg-gray-600 p-1 rounded mr-1"
                            title="Apply insights from this voice"
                          >
                            <FaBrain className="w-3 h-3" />
          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
        </div>
          ))}
        </nav>
        
        {/* Developer Tools Button - Bottom Corner */}
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={() => setShowDevTools(!showDevTools)}
            className={`w-full p-3 rounded transition-colors flex items-center justify-center gap-2 text-sm font-medium ${showDevTools ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-600 hover:bg-gray-500 text-gray-300 hover:text-white'}`}
            title="Toggle Developer Tools"
          >
            <FaCog className="w-4 h-4" />
            <span>DEV TOOLS</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab Bar */}
        <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center overflow-x-auto flex-shrink-0">
        {openTabs.map(tab => {
          const tabKey = `${tab.folder}/${tab.file}`;
          const isActive = activeTab === tabKey;
            const label = mentalModel.find(f => f.name === tab.folder)?.files.find(f => f.name === tab.file)?.label || tab.file;
            
          return (
              <div
              key={tabKey}
                className={`flex items-center gap-2 px-3 h-full border-r border-gray-700 cursor-pointer ${
                  isActive ? 'bg-gray-900 text-white' : 'hover:bg-gray-700/50 text-gray-400'
                }`}
              onClick={() => handleTabClick(tab)}
            >
                <span className="text-sm">{label}</span>
                <button
                onClick={e => handleTabClose(tab, e)}
                  className="hover:bg-gray-600 rounded p-0.5"
              >
                  <span className="text-xs">×</span>
            </button>
              </div>
          );
        })}
      </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
        {selected.folder && selected.file ? (
            <div className="flex-1 flex flex-col">
                            <div className="px-4 py-3 border-b border-gray-700 flex-shrink-0 flex justify-between items-center min-w-0">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold truncate">
                    {mentalModel.find(f => f.name === selected.folder)?.files.find(f => f.name === selected.file)?.label || selected.file}
                  </h2>
                  {isDirty && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-yellow-400">
                      <FaSave />
                      <span>Unsaved changes</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={saveFile}
                  disabled={!isDirty}
                  className={`flex-shrink-0 px-3 py-1.5 rounded text-sm flex items-center gap-2 ${
                    isDirty 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FaSave />
                  Save
                </button>
              </div>
                            <div className="flex-1 relative" style={{ height: 'calc(100% - 250px)', minHeight: '200px' }}>
                  <CodeMirror
                    value={fileContent}
                    height="100%"
                  width="100%"
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    dropCursor: false,
                    allowMultipleSelections: false,
                    indentOnInput: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    highlightSelectionMatches: false,
                    searchKeymap: true,
                    scrollPastEnd: true
                  }}
                    theme={oneDark}
                  extensions={[markdown()]}
                    onChange={(val) => {
                      setFileContent(val);
                      setIsDirty(true);
                    }}
                  />
                </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FaBrain className="text-6xl mb-4 mx-auto opacity-20" />
                <p>Select a file from the sidebar to begin</p>
    </div>
  </div>
 )}
      </div>

                {/* Chat Area */}
        <div className="h-48 border-t border-gray-700 bg-gray-800 flex flex-col flex-shrink-0">
                    <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {messages.length === 0 ? (
              <div className="text-left text-gray-500 text-sm">
                👋 Welcome to MentalOS! Select a file from the sidebar and I'll guide you on a journey of self-discovery.
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className={`text-sm text-left ${msg.role === 'user' ? 'text-blue-400' : 'text-gray-300'}`}>
                  <span className="font-semibold">{msg.role === 'user' ? 'You' : 'AI'}:</span> {msg.content}
                </div>
              ))
            )}
            {isLoading && <div className="text-gray-500 text-sm text-left">AI is thinking...</div>}
          </div>
                    <div className="p-4 border-t border-gray-700 flex-shrink-0 bg-gray-800">
            <div className="flex gap-3 items-center max-w-full">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your response and press Enter..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendBotMessage();
                  }
                }}
                className="flex-1 min-w-0 bg-gray-700 text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button 
                type="button" 
                onClick={() => setShowWhy(!showWhy)}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center justify-center flex-shrink-0"
                title="Show reasoning"
              >
                Why?
              </button>
              <button 
                type="button"
                onClick={sendBotMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm flex items-center justify-center flex-shrink-0"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Why Panel */}
      {showWhy && (
        <div className="absolute bottom-48 right-4 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold">AI Reasoning</h3>
            <button onClick={() => setShowWhy(false)} className="text-gray-400 hover:text-white">×</button>
          </div>
          <div className="text-sm text-gray-300 mb-3">{lastReasoning || 'No reasoning available yet.'}</div>
          {lastCitations.length > 0 && (
            <>
              <h4 className="font-semibold text-sm mb-2">Sources:</h4>
              <ul className="space-y-1">
                {lastCitations.map((cite, idx) => (
                  <li 
                    key={idx} 
                    className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
                    onClick={() => {
                      const folder = mentalModel.find(f => f.files.some(file => file.name === cite.file));
                      if (folder) {
                        const file = folder.files.find(f => f.name === cite.file);
                        handleFileClick(folder, file);
                      }
                    }}
                  >
                    📄 {cite.file} ({cite.type})
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* Diff Modal */}
      {diffModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDiffModal(null)}>
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-bold">Review Changes</h3>
              <p className="text-sm text-gray-400 mt-1">{diffModal.summary}</p>
            </div>
            <div className="p-4 overflow-auto max-h-[60vh]">
              <DiffViewer oldContent={diffModal.oldContent} newContent={diffModal.newContent} />
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
              <button onClick={() => setDiffModal(null)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded">
                Cancel
              </button>
              <button onClick={diffModal.onAccept} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">
                Accept Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
