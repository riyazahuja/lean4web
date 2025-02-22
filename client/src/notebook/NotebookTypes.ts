// NotebookTypes.ts

export type CellType = 'code' | 'markdown';

export interface Cell {
  id: string;
  type: CellType;
  content: string;
}

/**
 * CodeCellData holds the assigned line range for a code cell.
 * startLine and endLine are 1-indexed.
 */
export interface CodeCellData {
  id: string;
  startLine: number;
  endLine: number;
}
