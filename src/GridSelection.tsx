// File: src/GridSelection.tsx

import React, { useState, useCallback, useRef, useEffect } from 'react';
import './GridSelection.css';

interface GridSelectionProps {
  initialRows?: number;
  initialColumns?: number;
  initialCellSize?: number;
}

interface Selection {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

const GridSelection: React.FC<GridSelectionProps> = ({
  initialRows = 12,
  initialColumns = 12,
  initialCellSize = 30,
}) => {
  const [rows, setRows] = useState(initialRows);
  const [columns, setColumns] = useState(initialColumns);
  const [cellSize, setCellSize] = useState(initialCellSize);
  const [validSelections, setValidSelections] = useState<Selection[]>([]);
  const [invalidCells, setInvalidCells] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setStartCell({ row, col });
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isSelecting && startCell) {
      const newSelection = normalizeSelection({
        startRow: startCell.row,
        startCol: startCell.col,
        endRow: row,
        endCol: col,
      });
      updateSelections(newSelection);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    setStartCell(null);
  };

  const normalizeSelection = (selection: Selection): Selection => {
    return {
      startRow: Math.min(selection.startRow, selection.endRow),
      startCol: Math.min(selection.startCol, selection.endCol),
      endRow: Math.max(selection.startRow, selection.endRow),
      endCol: Math.max(selection.startCol, selection.endCol),
    };
  };

  const isValidSelection = (selection: Selection): boolean => {
    const width = selection.endCol - selection.startCol + 1;
    const height = selection.endRow - selection.startRow + 1;
    return width >= 2 && height >= 2;
  };

  const updateSelections = (newSelection: Selection) => {
    if (isValidSelection(newSelection)) {
      setValidSelections((prev) => {
        const filtered = prev.filter((s) => !isOverlapping(s, newSelection));
        return [...filtered, newSelection];
      });
    }
  };

  const isOverlapping = (s1: Selection, s2: Selection): boolean => {
    return !(
      s1.endRow < s2.startRow ||
      s1.startRow > s2.endRow ||
      s1.endCol < s2.startCol ||
      s1.startCol > s2.endCol
    );
  };

  useEffect(() => {
    const newInvalidCells = new Set<string>();
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        if (!isInValidSelection(row, col) && !canFormValidSelection(row, col)) {
          newInvalidCells.add(`${row}-${col}`);
        }
      }
    }
    setInvalidCells(newInvalidCells);
  }, [validSelections, rows, columns]);

  const isInValidSelection = (row: number, col: number): boolean => {
    return validSelections.some(
      (s) =>
        row >= s.startRow &&
        row <= s.endRow &&
        col >= s.startCol &&
        col <= s.endCol
    );
  };

  const canFormValidSelection = (row: number, col: number): boolean => {
    if (row < rows - 1 && col < columns - 1) {
      for (let i = 0; i <= 1; i++) {
        for (let j = 0; j <= 1; j++) {
          if (isInValidSelection(row + i, col + j)) {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  };

  const getCellStyle = useCallback(
    (row: number, col: number): string => {
      const cellId = `${row}-${col}`;
      if (invalidCells.has(cellId)) {
        return 'invalid';
      }

      const selection = validSelections.find(
        (s) =>
          row >= s.startRow &&
          row <= s.endRow &&
          col >= s.startCol &&
          col <= s.endCol
      );

      if (!selection) return '';

      let classes = 'selected';
      if (row === selection.startRow) classes += ' top';
      if (row === selection.endRow) classes += ' bottom';
      if (col === selection.startCol) classes += ' left';
      if (col === selection.endCol) classes += ' right';

      return classes;
    },
    [validSelections, invalidCells]
  );

  const getSelectionsJSON = () => {
    return JSON.stringify(validSelections, null, 2);
  };

  const resetSelections = () => {
    setValidSelections([]);
    setInvalidCells(new Set());
    setIsSelecting(false);
    setStartCell(null);
  };

  const handleInputChange =
    (setter: React.Dispatch<React.SetStateAction<number>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value > 0) {
        setter(value);
      }
    };

  return (
    <div className="grid-selection-container">
      <div className="left-panel">
        <div className="button-container">
          <button
            onClick={() => alert(getSelectionsJSON())}
            className="grid-button"
          >
            Get Selections JSON
          </button>
          <button
            onClick={resetSelections}
            className="grid-button reset-button"
          >
            Reset Selections
          </button>
        </div>
        <div className="controls">
          <div className="control-group">
            <label>Rows</label>
            <div className="input-group">
              <input
                type="number"
                value={rows}
                onChange={handleInputChange(setRows)}
                min="1"
              />
              <button onClick={() => setRows((r) => r + 1)}>+</button>
              <button onClick={() => setRows((r) => Math.max(1, r - 1))}>
                -
              </button>
            </div>
          </div>
          <div className="control-group">
            <label>Columns</label>
            <div className="input-group">
              <input
                type="number"
                value={columns}
                onChange={handleInputChange(setColumns)}
                min="1"
              />
              <button onClick={() => setColumns((c) => c + 1)}>+</button>
              <button onClick={() => setColumns((c) => Math.max(1, c - 1))}>
                -
              </button>
            </div>
          </div>
          <div className="control-group">
            <label>Height (px)</label>
            <div className="input-group">
              <input
                type="number"
                value={cellSize}
                onChange={handleInputChange(setCellSize)}
                min="1"
              />
              <button onClick={() => setCellSize((s) => s + 1)}>+</button>
              <button onClick={() => setCellSize((s) => Math.max(1, s - 1))}>
                -
              </button>
            </div>
          </div>
          <div className="control-group">
            <label>Width (px)</label>
            <div className="input-group">
              <input
                type="number"
                value={cellSize}
                onChange={handleInputChange(setCellSize)}
                min="1"
              />
              <button onClick={() => setCellSize((s) => s + 1)}>+</button>
              <button onClick={() => setCellSize((s) => Math.max(1, s - 1))}>
                -
              </button>
            </div>
          </div>
          <div className="control-group">
            <label>Copy Layout from a Different Ad</label>
            <input type="text" placeholder="Job: C8020021" readOnly />
            <select>
              <option value="">Select Ad</option>
            </select>
          </div>
          <div className="control-group">
            <label>Use a Preset Size</label>
            <select>
              <option value="">Select Size</option>
            </select>
          </div>
        </div>
      </div>
      <div
        className="grid-container"
        ref={gridRef}
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
        style={{
          gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {Array.from({ length: rows }, (_, row) =>
          Array.from({ length: columns }, (_, col) => (
            <div
              key={`${row}-${col}`}
              className={`grid-cell ${getCellStyle(row, col)}`}
              onMouseDown={() => handleMouseDown(row, col)}
              onMouseEnter={() => handleMouseEnter(row, col)}
              style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default GridSelection;
