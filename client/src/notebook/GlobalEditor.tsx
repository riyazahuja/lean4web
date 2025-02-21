//@ts-ignore
import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import * as monaco from 'monaco-editor';
import { LeanMonaco, LeanMonacoEditor, LeanMonacoOptions } from 'lean4monaco';

export interface GlobalEditorRef {
  setContent: (content: string) => void;
  getContent: () => string;
  focus: () => void;
}

interface GlobalEditorProps {
  project: string;
  initialValue: string;
  onChange: (newValue: string) => void;
}

const GlobalEditor = forwardRef<GlobalEditorRef, GlobalEditorProps>(
  ({ project, initialValue, onChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const infoviewRef = useRef<HTMLDivElement>(null);
    //@ts-ignore
    const [leanMonaco, setLeanMonaco] = useState<LeanMonaco | null>(null);
    const [editorInstance, setEditorInstance] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);

    const options: LeanMonacoOptions = {
      websocket: {
        url:
          (window.location.protocol === "https:" ? "wss://" : "ws://") +
          window.location.host +
          "/websocket/" +
          project
      },
      htmlElement: containerRef.current ?? undefined,
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
      if (!containerRef.current) return;
      const _leanMonaco = new LeanMonaco();
      const leanMonacoEditor = new LeanMonacoEditor();

      // Set the infoview container.
      _leanMonaco.setInfoviewElement(infoviewRef.current!);

      (async () => {
        await _leanMonaco.start(options);
        // Note: Use the initial value only on the first mount.
        await leanMonacoEditor.start(containerRef.current!, `/project/${project}.lean`, initialValue);
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
    }, [project]); // Run once on mount or when project changes.

    // Expose imperative methods.
    useImperativeHandle(ref, () => ({
      setContent: (content: string) => {
        editorInstance?.getModel()?.setValue(content);
      },
      getContent: () => {
        return editorInstance?.getModel()?.getValue() || '';
      },
      focus: () => {
        editorInstance?.focus();
      }
    }), [editorInstance]);

    return (
      // Render the editor in a container that is positioned absolutely,
      // but initially hidden. You can then control its position via CSS or a portal.
      <div id="global-editor-wrapper" style={{ position: 'absolute', top: 0, left: 0, width: '100%', display: 'none' }}>
        <div ref={containerRef} style={{ width: '100%', height: '300px' }} />
        <div ref={infoviewRef} style={{ width: '40%', height: '300px', borderLeft: '1px solid #ccc', padding: '10px', backgroundColor: '#fafafa' }} />
      </div>
    );
  }
);

export default GlobalEditor;
