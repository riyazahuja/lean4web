import React, { useState } from 'react';
import CodeCell from './CodeCell';
import MarkdownCell from './MarkdownCell';
import { CodeCellData } from './NotebookTypes';

const Notebook: React.FC = () => {
  // The full underlying Lean file content.
  const [fullContent, setFullContent] = useState<string>(
`-- Lean file example
def add (a b : Nat) := a + b
#eval add 2 3
-- More Lean code...
-- End of file`
  );

  // Hard-coded code cell boundaries (for demonstration).
  const [codeCells, setCodeCells] = useState<CodeCellData[]>([
    { id: 'cell1', startLine: 0, endLine: 2 },
    { id: 'cell2', startLine: 3, endLine: 5 },
  ]);

  // The ID of the currently active code cell.
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  // The content currently in the global (persistent) Editor.
  const [editorContent, setEditorContent] = useState<string>('');

  // Update the underlying file and adjust cell boundaries.
  const updateCodeCell = (id: string, newCellContent: string) => {
    const cellIndex = codeCells.findIndex(c => c.id === id);
    if (cellIndex === -1) return;
    const cell = codeCells[cellIndex];
    const lines = fullContent.split('\n');
    const oldCellLines = lines.slice(cell.startLine, cell.endLine + 1);
    const oldLineCount = oldCellLines.length;
    const newLines = newCellContent.split('\n');
    const newLineCount = newLines.length;
    const diff = newLineCount - oldLineCount;

    const before = lines.slice(0, cell.startLine);
    const after = lines.slice(cell.endLine + 1);
    const updatedContent = [...before, ...newLines, ...after].join('\n');
    setFullContent(updatedContent);

    // Update boundaries for the edited cell.
    const updatedCells = [...codeCells];
    updatedCells[cellIndex] = { ...cell, endLine: cell.endLine + diff };
    // Shift subsequent cells.
    for (let i = cellIndex + 1; i < updatedCells.length; i++) {
      updatedCells[i] = {
        ...updatedCells[i],
        startLine: updatedCells[i].startLine + diff,
        endLine: updatedCells[i].endLine + diff,
      };
    }
    setCodeCells(updatedCells);
  };

  const project = 'mathlib-demo'; // default project

  return (
    <div className="notebook">
      {codeCells.map(cell => {
        // Extract the cell's content from fullContent.
        const cellLines = fullContent.split('\n');
        const cellContent = cellLines.slice(cell.startLine, cell.endLine + 1).join('\n');
        return (
          <div key={cell.id} className="cell">
            <CodeCell
              cellData={cell}
              cellContent={cellContent}
              project={project}
              isActive={activeCellId === cell.id}
              onActivate={() => {
                // Activate this cell and load its content into the persistent Editor.
                setActiveCellId(cell.id);
                setEditorContent(cellContent);
              }}
              onDeactivate={() => {
                // When deactivating, update the file and clear the active cell.
                updateCodeCell(cell.id, editorContent);
                setActiveCellId(null);
              }}
              editorContent={editorContent}
              setEditorContent={setEditorContent}
            />
          </div>
        );
      })}
      {/* Render a Markdown cell for demonstration */}
      <div className="cell">
        <MarkdownCell 
          cell={{ id: 'md1', type: 'markdown', content: '# Markdown Example\nThis is a markdown cell.' }}
          //@ts-ignore
          updateCell={(id, content) => { /* implement as needed */ }} />
      </div>
      <div className="controls">
        <button onClick={() => { /* Add new code cell logic */ }}>Add Code Cell</button>
        <button onClick={() => { /* Add new markdown cell logic */ }}>Add Markdown Cell</button>
      </div>
    </div>
  );
};

export default Notebook;
