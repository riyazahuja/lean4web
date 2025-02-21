import React, { useRef, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor';
import { LeanMonaco, LeanMonacoEditor, LeanMonacoOptions } from 'lean4monaco';

interface EditorProps {
  initialValue: string;
  project: string;
  onChange: (newValue: string) => void;
  onBlur: () => void;
}
//@ts-ignore
const Editor: React.FC<EditorProps> = ({ initialValue, project, onChange, onBlur }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const infoviewRef = useRef<HTMLDivElement>(null);
  //@ts-ignore
  const [leanMonaco, setLeanMonaco] = useState<LeanMonaco>();
  //@ts-ignore
  const [editorInstance, setEditorInstance] = useState<monaco.editor.IStandaloneCodeEditor>();

  const options: LeanMonacoOptions = {
    websocket: {
      url:
        (window.location.protocol === "https:" ? "wss://" : "ws://") +
        window.location.host +
        "/websocket/" +
        project
    },
    htmlElement: editorRef.current ?? undefined,
    vscode: {
      "workbench.colorTheme": "Visual Studio Light",
      "editor.tabSize": 2,
      "editor.lightbulb.enabled": "on",
      "editor.wordWrap": "on",
      "editor.wrappingStrategy": "advanced",
      "editor.semanticHighlighting.enabled": true,
      "editor.acceptSuggestionOnEnter": "on",
      "lean4.input.eagerReplacementEnabled": true,
      "lean4.input.leader": "\\"
    }
  };

  useEffect(() => {
    if (!editorRef.current) return;

    const _leanMonaco = new LeanMonaco();
    const leanMonacoEditor = new LeanMonacoEditor();

    // Set the infoview container so it appears to the right.
    _leanMonaco.setInfoviewElement(infoviewRef.current!);

    (async () => {
      await _leanMonaco.start(options);
      await leanMonacoEditor.start(editorRef.current!, `/project/${project}.lean`, initialValue);
      setEditorInstance(leanMonacoEditor.editor);
      setLeanMonaco(_leanMonaco);

      leanMonacoEditor.editor?.onDidChangeModelContent(() => {
        const currentCode = leanMonacoEditor.editor?.getModel()?.getValue() ?? '';
        onChange(currentCode);
      });
    })();

    return () => {
      leanMonacoEditor.dispose();
      _leanMonaco.dispose();
    };
  }, [editorRef, project]); // Initialize once per activation

  return (
    <div className="editor-container" style={{ display: 'flex', flexDirection: 'row', height: '300px' }}>
      <div ref={editorRef} className="codeview" style={{ flex: 1, height: '100%' }} />
      <div
        ref={infoviewRef}
        className="infoview"
        style={{
          width: '40%',
          height: '100%',
          borderLeft: '1px solid #ccc',
          padding: '10px',
          backgroundColor: '#fafafa'
        }}
      />
    </div>
  );
};

export default React.memo(Editor);
