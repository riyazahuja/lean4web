import React from 'react';
import Editor from './Editor';
import { CodeCellData } from './NotebookTypes';

interface CodeCellProps {
  cellData: CodeCellData;
  cellContent: string;
  project: string;
  isActive: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  editorContent: string;
  setEditorContent: (content: string) => void;
}

const CodeCell: React.FC<CodeCellProps> = ({
//@ts-ignore
  cellData,
  cellContent,
  project,
  isActive,
  onActivate,
  onDeactivate,
  editorContent,
  setEditorContent
}) => {
  return (
    <div className="code-cell" style={{ border: '1px solid #ddd', padding: '10px' }}>
      {isActive ? (
        <Editor
          initialValue={editorContent}
          project={project}
          onChange={setEditorContent}
          onBlur={onDeactivate}
        />
      ) : (
        <pre onClick={onActivate} style={{ cursor: 'pointer' }}>
          {cellContent}
        </pre>
      )}
    </div>
  );
};

export default CodeCell;
