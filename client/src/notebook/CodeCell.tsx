// CodeCell.tsx
import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { LeanMonacoEditor } from 'lean4monaco';
import { CodeCellData } from './NotebookTypes';

interface CodeCellProps {
  cellData: CodeCellData;
  preview: string;
  sharedModel: monaco.editor.ITextModel | null;
  project: string;
  updateCell: (newContent: string) => void;
}

const CodeCell: React.FC<CodeCellProps> = ({
  cellData,
  preview,
  sharedModel,
  project,
  updateCell,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<LeanMonacoEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current || !sharedModel) return;
    const leanEditor = new LeanMonacoEditor();
    editorRef.current = leanEditor;
    (async () => {
      // Start the editor. Typically, lean4monaco creates its own model,
      // but we want to override it with our sharedModel.
      await leanEditor.start(
        containerRef.current!,
        `/project/${project}.lean`,
        sharedModel.getValue()
      );
      // Replace the model with our shared model.
      const monacoEditor = leanEditor.editor;
      if (monacoEditor) {
        const oldModel = monacoEditor.getModel();
        if (oldModel && oldModel !== sharedModel) {
          oldModel.dispose();
        }
        monacoEditor.setModel(sharedModel);
        
        // Debug: log the total line count.
        const totalLines = sharedModel.getLineCount();
        console.log(`Cell ${cellData.id}: totalLines=${totalLines}`);
        
        // Calculate hidden ranges
        const start = cellData.startLine;
        const end = cellData.endLine;
        const hiddenRanges: monaco.IRange[] = [];
        if (start > 1) {
          hiddenRanges.push({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: start - 1,
            endColumn: 1,
          });
        }
        if (end < totalLines) {
          hiddenRanges.push({
            startLineNumber: end + 1,
            startColumn: 1,
            endLineNumber: totalLines,
            endColumn: 1,
          });
        }
        console.log(`Cell ${cellData.id}: hiddenRanges=`, hiddenRanges);
        // Use a cast to allow setHiddenAreas.
        (monacoEditor as any).setHiddenAreas(hiddenRanges);
        
        // Reveal cell's range.
        monacoEditor.revealLinesInCenter(start, end);
        
        // Listen for changes: extract only the visible portion.
        monacoEditor.onDidChangeModelContent(() => {
          const allLines = sharedModel.getValue().split('\n');
          const cellLines = allLines.slice(start - 1, end);
          updateCell(cellLines.join('\n'));
        });
      }
    })();
    
    return () => {
      leanEditor.dispose();
    };
  }, [containerRef, sharedModel, cellData, project, updateCell]);

  return (
    <div
      className="code-cell"
      style={{ height: '300px', border: '1px solid #ccc', marginBottom: '10px' }}
    >
      <div ref={containerRef} style={{ height: '100%' }} />
    </div>
  );
};

export default CodeCell;
