// GlobalEditor.tsx
import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as monaco from 'monaco-editor';
import {
  LeanMonaco,
  LeanMonacoEditor,
  LeanMonacoOptions,
} from 'lean4monaco';

export interface GlobalEditorHandle {
  revealRange: (startLine: number, endLine: number) => void;
  getFullContent: () => string;
}

interface GlobalEditorProps {
  fullContent: string;
  project: string;
  onContentChange: (newContent: string) => void;
  onBlur: () => void;
}

const GlobalEditor = forwardRef<GlobalEditorHandle, GlobalEditorProps>(
  ({ fullContent, project, onContentChange, onBlur }, ref) => {
    const editorDivRef = useRef<HTMLDivElement>(null);
    const infoviewRef = useRef<HTMLDivElement>(null);
    const [editorInstance, setEditorInstance] = useState<
      monaco.editor.IStandaloneCodeEditor | null
    >(null);
    const [leanMonaco, setLeanMonaco] = useState<LeanMonaco | null>(null);

    const options: LeanMonacoOptions = {
      websocket: {
        url:
          (window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
          window.location.host +
          '/websocket/' +
          project,
      },
      htmlElement: editorDivRef.current ?? undefined,
      vscode: {
        'workbench.colorTheme': 'Visual Studio Light',
        'editor.tabSize': 2,
        'editor.lightbulb.enabled': 'on',
        'editor.wordWrap': 'on',
        'editor.wrappingStrategy': 'advanced',
        'editor.semanticHighlighting.enabled': true,
        'editor.acceptSuggestionOnEnter': 'on',
        'lean4.input.eagerReplacementEnabled': true,
        'lean4.input.leader': '\\',
      },
    };

    useEffect(() => {
      if (!editorDivRef.current) return;

      const _leanMonaco = new LeanMonaco();
      const leanMonacoEditor = new LeanMonacoEditor();

      // Set the infoview container so it appears to the right.
      _leanMonaco.setInfoviewElement(infoviewRef.current!);

      (async () => {
        await _leanMonaco.start(options);
        // Initialize the editor with the full file content.
        await leanMonacoEditor.start(
          editorDivRef.current!,
          `/project/${project}.lean`,
          fullContent
        );
        setEditorInstance(leanMonacoEditor.editor);
        setLeanMonaco(_leanMonaco);

        leanMonacoEditor.editor?.onDidChangeModelContent(() => {
          const newContent =
            leanMonacoEditor.editor?.getModel()?.getValue() ?? '';
          onContentChange(newContent);
        });

        leanMonacoEditor.editor?.onDidBlurEditorWidget(() => {
          onBlur();
        });
      })();

      return () => {
        leanMonacoEditor.dispose();
        _leanMonaco.dispose();
      };
    }, [editorDivRef, project]); // initialize only once per mount

    useImperativeHandle(ref, () => ({
      revealRange: (startLine: number, endLine: number) => {
        if (editorInstance) {
          editorInstance.revealLinesInCenter(startLine, endLine);
          editorInstance.setSelection(
            new monaco.Range(startLine, 1, endLine, 1)
          );
          editorInstance.focus();
        }
      },
      getFullContent: () => {
        return editorInstance?.getModel()?.getValue() ?? '';
      },
    }));

    return (
      <div
        className="global-editor"
        style={{ display: 'flex', flexDirection: 'row', height: '300px' }}
      >
        <div
          ref={editorDivRef}
          className="codeview"
          style={{ flex: 1, height: '100%' }}
        />
        <div
          ref={infoviewRef}
          className="infoview"
          style={{
            width: '40%',
            height: '100%',
            borderLeft: '1px solid #ccc',
            padding: '10px',
            backgroundColor: '#fafafa',
          }}
        />
      </div>
    );
  }
);

export default React.memo(GlobalEditor);
