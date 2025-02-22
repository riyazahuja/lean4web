// MarkdownCell.tsx
import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { Cell } from './NotebookTypes';

interface MarkdownCellProps {
  cell: Cell;
  updateCell: (id: string, content: string) => void;
}

const MarkdownCell: React.FC<MarkdownCellProps> = ({ cell, updateCell }) => {
  const [editing, setEditing] = useState<boolean>(true);
  const [localContent, setLocalContent] = useState<string>(cell.content);
  const [renderedContent, setRenderedContent] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editing) {
      setLocalContent(cell.content);
    }
  }, [cell.content, editing]);

  useEffect(() => {
    Promise.resolve(marked(localContent)).then((html) =>
      setRenderedContent(html)
    );
  }, [localContent]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="markdown-cell">
      {editing ? (
        <textarea
          value={localContent}
          onChange={(e) => {
            const newContent = e.target.value;
            setLocalContent(newContent);
            updateCell(cell.id, newContent);
          }}
          onBlur={() => setEditing(false)}
          placeholder="Write Markdown/LaTeX here..."
          style={{ width: '100%', height: '150px' }}
        />
      ) : (
        <div
          onClick={() => setEditing(true)}
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      )}
    </div>
  );
};

export default MarkdownCell;
