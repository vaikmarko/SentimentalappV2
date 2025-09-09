import React from 'react';
import DiffMatchPatch from 'diff-match-patch';

export default function DiffViewer({ oldText, newText }) {
  const dmp = new DiffMatchPatch();
  const diffs = dmp.diff_main(oldText, newText);
  dmp.diff_cleanupSemantic(diffs);

  return (
    <pre className="p-4 text-sm overflow-auto bg-base-300 border border-base-content/20 rounded-md">
      {diffs.map(([op, text], idx) => {
        if (op === DiffMatchPatch.DIFF_INSERT) {
          return <span key={idx} style={{ background: 'rgba(34,197,94,0.3)' }}>{text}</span>;
        }
        if (op === DiffMatchPatch.DIFF_DELETE) {
          return <span key={idx} style={{ background: 'rgba(239,68,68,0.3)', textDecoration: 'line-through' }}>{text}</span>;
        }
        return <span key={idx}>{text}</span>;
      })}
    </pre>
  );
} 