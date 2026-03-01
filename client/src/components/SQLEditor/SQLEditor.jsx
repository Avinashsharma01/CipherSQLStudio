import { useState } from 'react';
import Editor from '@monaco-editor/react';
import './SQLEditor.scss';

function SQLEditor({ onExecute, loading }) {
  const [query, setQuery] = useState('');

  function handleRun() {
    if (query.trim().length === 0) return;
    onExecute(query);
  }

  // let user press Ctrl+Enter to run
  function handleEditorMount(editor) {
    editor.addAction({
      id: 'run-query',
      label: 'Run Query',
      keybindings: [
        2048 | 3, // CtrlCmd + Enter
      ],
      run: () => handleRun(),
    });
  }

  return (
    <div className="sql-editor">
      <div className="sql-editor__toolbar">
        <span className="sql-editor__label">SQL Editor</span>
        <button
          className="sql-editor__run-btn"
          onClick={handleRun}
          disabled={loading || query.trim().length === 0}
        >
          {loading ? 'Running...' : '▶ Run Query'}
        </button>
      </div>
      <div className="sql-editor__editor-container">
        <Editor
          height="250px"
          defaultLanguage="sql"
          theme="vs-dark"
          value={query}
          onChange={(val) => setQuery(val || '')}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 8 },
          }}
        />
      </div>
      <p className="sql-editor__shortcut">Tip: Ctrl + Enter to run</p>
    </div>
  );
}

export default SQLEditor;
