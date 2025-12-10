export const TOTAL_ROWS = 27;

export function getRowLength(rowIndex: number): number {
  return rowIndex % 2 === 0 ? 9 : 8;
}

export function createEmptyGrid(): (number | null)[][] {
  const grid: (number | null)[][] = [];
  for (let row = 0; row < TOTAL_ROWS; row++) {
    const rowLength = getRowLength(row);
    grid.push(new Array(rowLength).fill(null));
  }
  return grid;
}

export function createCompletedRowsArray(): boolean[] {
  return new Array(TOTAL_ROWS).fill(false);
}

export function getTotalBubbles(): number {
  let total = 0;
  for (let row = 0; row < TOTAL_ROWS; row++) {
    total += getRowLength(row);
  }
  return total; // 230 bubbles
}

export const NEIGHBOR_OFFSETS = {
  evenRow: [
    { dr: -1, dc: 0 },
    { dr: -1, dc: 1 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
  ],
  oddRow: [
    { dr: -1, dc: -1 },
    { dr: -1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
    { dr: 1, dc: -1 },
    { dr: 1, dc: 0 },
  ],
};

export function getNeighbors(
  row: number,
  col: number
): { row: number; col: number }[] {
  const offsets = row % 2 === 0 ? NEIGHBOR_OFFSETS.evenRow : NEIGHBOR_OFFSETS.oddRow;
  const neighbors: { row: number; col: number }[] = [];

  for (const { dr, dc } of offsets) {
    const newRow = row + dr;
    const newCol = col + dc;
    if (
      newRow >= 0 &&
      newRow < TOTAL_ROWS &&
      newCol >= 0 &&
      newCol < getRowLength(newRow)
    ) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }

  return neighbors;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
