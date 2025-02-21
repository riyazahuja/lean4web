// NotebookTypes.ts
export type CellType = 'code' | 'markdown';

export interface Cell {
  id: string;
  type: CellType;
  content: string;
}

export interface CodeCellData {
  id: string;
  startLine: number;
  endLine: number;
}
