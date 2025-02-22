import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
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
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (!containerRef.current || !sharedModel) return;
    // Create an editor that uses the shared model.
    const editor = monaco.editor.create(containerRef.current, {
      model: sharedModel,
      language: 'lean',
      automaticLayout: true,
      minimap: { enabled: false },
    });
    editorInstanceRef.current = editor;

    // Calculate total lines from the model.
    const totalLines = sharedModel.getLineCount();
    // Assume cellData.startLine and cellData.endLine are 1-indexed.
    const start = cellData.startLine;
    const end = cellData.endLine;

    // Create hidden ranges for lines outside the cell.
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

    try {
      // Cast to ICodeEditor so that setHiddenAreas is recognized.
      (editor as any).setHiddenAreas(hiddenRanges);
    } catch (error) {
      console.error("Error setting hidden areas:", error);
    }
    
    // Scroll to the cell's range.
    editor.revealLinesInCenter(start, end);

    return () => {
      editor.dispose();
    };
  }, [containerRef, sharedModel, cellData]);

  return (
    <div
      className="code-cell"
      style={{ height: '300px', border: '1px solid #ccc', marginBottom: '10px' }}
    >
      <div ref={containerRef} style={{ height: '100%' }} onClick={() => {}} />
    </div>
  );
};

export default CodeCell;
