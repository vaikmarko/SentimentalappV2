/* eslint-disable */
// MentalOS/test_cursor_patch_flow.js
import fetch from 'node-fetch';

const BACKEND_API_URL = 'http://localhost:8080/api/mental-os/chat/message';
const FILE_API_URL = 'http://localhost:8080/api/mental-os/files/goals.md?user_id=test_user_123';
const USER_ID = 'test_user_123';

async function getFileContent() {
  const res = await fetch(FILE_API_URL, { headers: { 'X-User-ID': USER_ID } });
  const data = await res.json();
  return data.content || '';
}

async function sendChatAndPatch(message) {
  const res = await fetch(BACKEND_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a helpful agent.' },
        { role: 'user', content: message }
      ],
      user_id: USER_ID
    })
  });
  return await res.json();
}

(async () => {
  // 1. Get original file content
  const original = await getFileContent();
  console.log('Original file:\n', original);

  // 2. Send a chat message to add a new goal
  const chatMsg = "Add a new goal: 'Learn to play guitar.'";
  const result = await sendChatAndPatch(chatMsg);
  console.log('Backend response:', JSON.stringify(result, null, 2));

  // 3. If a diff is returned, print it
  if (result.diff_preview) {
    console.log('Unified diff proposed by agent:\n', result.diff_preview);
  }

  // 4. Wait a moment for the backend to apply the patch
  await new Promise(r => setTimeout(r, 1000));

  // 5. Get the updated file content
  const updated = await getFileContent();
  console.log('Updated file:\n', updated);

  // 6. Check that the new goal was added
  if (updated.includes('Learn to play guitar')) {
    console.log('✅ Patch applied successfully and file updated as expected.');
  } else {
    console.error('❌ Patch did not apply as expected.');
  }
})(); 