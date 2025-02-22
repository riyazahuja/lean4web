// Notebook.tsx
import React, { useState, useEffect } from 'react';
import * as monaco from 'monaco-editor';
import CodeCell from './CodeCell';
import MarkdownCell from './MarkdownCell';
import { CodeCellData, Cell } from './NotebookTypes';

const Notebook: React.FC = () => {
  // Full underlying Lean file content (5 lines)
  const [fullContent, setFullContent] = useState<string>(
`-- Lean file example
def add (a b : Nat) := a + b
#eval add 2 3
-- More Lean code...
-- End of file`
  );

  // Define code cell boundaries. Note: Our file has 5 lines.
  const [codeCells, setCodeCells] = useState<CodeCellData[]>([
    { id: 'cell1', startLine: 1, endLine: 3 },
    { id: 'cell2', startLine: 4, endLine: 5 },
  ]);

  // Create a shared Monaco model (once) for the full file.
  const [sharedModel, setSharedModel] = useState<monaco.editor.ITextModel | null>(null);
  useEffect(() => {
    if (!sharedModel) {
      const model = monaco.editor.createModel(fullContent, 'lean');
      setSharedModel(model);
    } else {
      if (sharedModel.getValue() !== fullContent) {
        sharedModel.setValue(fullContent);
      }
    }
  }, [fullContent, sharedModel]);

  const project = 'mathlib-demo'; // default project

  // When a cell is edited, update the full file.
  const updateCellInFile = (cellId: string, newCellContent: string) => {
    const cellIndex = codeCells.findIndex(c => c.id === cellId);
    if (cellIndex === -1 || !sharedModel) return;
    const cell = codeCells[cellIndex];
    const lines = fullContent.split('\n');
    // Lines are 1-indexed.
    const before = lines.slice(0, cell.startLine - 1);
    const after = lines.slice(cell.endLine);
    const newLines = newCellContent.split('\n');
    const updatedContent = [...before, ...newLines, ...after].join('\n');
    setFullContent(updatedContent);
    // Adjust boundaries for this cell and shift subsequent cells.
    const diff = newLines.length - (cell.endLine - cell.startLine + 1);
    const updatedCells = [...codeCells];
    updatedCells[cellIndex] = { ...cell, endLine: cell.endLine + diff };
    for (let i = cellIndex + 1; i < updatedCells.length; i++) {
      updatedCells[i] = {
        ...updatedCells[i],
        startLine: updatedCells[i].startLine + diff,
        endLine: updatedCells[i].endLine + diff,
      };
    }
    setCodeCells(updatedCells);
  };

  return (
    <div className="notebook">
      {codeCells.map(cell => {
        const lines = fullContent.split('\n');
        const preview = lines.slice(cell.startLine - 1, cell.endLine).join('\n');
        return (
          <div key={cell.id} className="cell">
            <CodeCell
              cellData={cell}
              sharedModel={sharedModel}
              project={project}
              preview={preview}
              updateCell={(newContent: string) => updateCellInFile(cell.id, newContent)}
            />
          </div>
        );
      })}
      <div className="cell">
        <MarkdownCell
          cell={{ id: 'md1', type: 'markdown', content: '# Markdown Example\nThis is a markdown cell.' }}
          updateCell={(id, content) => { /* implement as needed */ }}
        />
      </div>
      <div className="controls">
        <button onClick={() => { /* Add new code cell logic */ }}>Add Code Cell</button>
        <button onClick={() => { /* Add new markdown cell logic */ }}>Add Markdown Cell</button>
      </div>
    </div>
  );
};

export default Notebook;
