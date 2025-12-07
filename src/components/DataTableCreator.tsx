import React, { useEffect, useState } from 'react';
import { DataTable, TableCell } from '../types';

interface DataTableCreatorProps {
  initialData?: DataTable;
  onSave: (table: DataTable) => void;
  editable: boolean;
}

const DEFAULT_ROWS = 4;
const DEFAULT_COLS = 3;

const createEmptyTable = (rows: number, cols: number): TableCell[][] => {
  const data: TableCell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: TableCell[] = [];
    for (let c = 0; c < cols; c++) {
      const isHeader = r === 0 || c === 0;
      row.push({
        value: '',
        isHeader
      });
    }
    data.push(row);
  }
  return data;
};

const DataTableCreator: React.FC<DataTableCreatorProps> = ({
  initialData,
  onSave,
  editable
}) => {
  const [title, setTitle] = useState(initialData?.title || '실험 데이터 표');
  const [rows, setRows] = useState(initialData?.rows || DEFAULT_ROWS);
  const [cols, setCols] = useState(initialData?.cols || DEFAULT_COLS);
  const [data, setData] = useState<TableCell[][]>(() => {
    if (initialData && Array.isArray(initialData.data) && initialData.data.length > 0) {
      return initialData.data;
    }
    return createEmptyTable(initialData?.rows || DEFAULT_ROWS, initialData?.cols || DEFAULT_COLS);
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '실험 데이터 표');
      setRows(initialData.rows || DEFAULT_ROWS);
      setCols(initialData.cols || DEFAULT_COLS);

      if (Array.isArray(initialData.data) && initialData.data.length > 0) {
        setData(initialData.data);
      } else {
        setData(createEmptyTable(initialData.rows || DEFAULT_ROWS, initialData.cols || DEFAULT_COLS));
      }
    }
  }, [initialData]);

  const syncSize = (newRows: number, newCols: number) => {
    setData(prev => {
      let next = prev.map(row => row.slice(0, newCols));
      next = next.slice(0, newRows);

      if (next.length < newRows) {
        for (let r = next.length; r < newRows; r++) {
          const newRow: TableCell[] = [];
          for (let c = 0; c < newCols; c++) {
            const isHeader = r === 0 || c === 0;
            newRow.push({ value: '', isHeader });
          }
          next.push(newRow);
        }
      }

      next = next.map((row, r) =>
        row.map((cell, c) => ({
          ...cell,
          isHeader: r === 0 || c === 0
        }))
      );

      return next;
    });
  };

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    if (!editable) return;
    setData(prev =>
      prev.map((row, r) =>
        row.map((cell, c) =>
          r === rowIndex && c === colIndex
            ? { ...cell, value }
            : cell
        )
      )
    );
  };

  const handleAddRow = () => {
    if (!editable) return;
    const newRows = rows + 1;
    setRows(newRows);
    syncSize(newRows, cols);
  };

  const handleAddCol = () => {
    if (!editable) return;
    const newCols = cols + 1;
    setCols(newCols);
    syncSize(rows, newCols);
  };

  const handleRemoveRow = () => {
    if (!editable || rows <= 2) return;
    const newRows = rows - 1;
    setRows(newRows);
    syncSize(newRows, cols);
  };

  const handleRemoveCol = () => {
    if (!editable || cols <= 2) return;
    const newCols = cols - 1;
    setCols(newCols);
    syncSize(rows, newCols);
  };

  const handleReset = () => {
    if (!editable) return;
    setTitle('실험 데이터 표');
    setRows(DEFAULT_ROWS);
    setCols(DEFAULT_COLS);
    setData(createEmptyTable(DEFAULT_ROWS, DEFAULT_COLS));
    setError(null);
  };

  const handleSave = () => {
    if (!editable) return;

    const hasAnyValue = data.some(row => row.some(cell => cell.value.trim() !== ''));
    if (!hasAnyValue) {
      setError('표에 한 칸 이상 값을 입력해주세요.');
      return;
    }

    setError(null);
    const table: DataTable = {
      id: initialData?.id || Date.now().toString(),
      title: title.trim() || '실험 데이터 표',
      rows,
      cols,
      data,
      createdAt: initialData?.createdAt || new Date().toISOString()
    };
    onSave(table);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          표 제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!editable}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:bg-gray-100"
          placeholder="예: 씨앗이 싹트는 조건 실험 결과"
        />
      </div>

      {editable && (
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-semibold text-gray-700">행/열 조절</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAddRow}
              className="h-10 px-4 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              ➕ 행 추가
            </button>
            <button
              type="button"
              onClick={handleRemoveRow}
              className="h-10 px-4 rounded-xl bg-blue-100 text-blue-700 text-sm font-bold hover:bg-blue-200 transition-all"
            >
              ➖ 행 삭제
            </button>
            <button
              type="button"
              onClick={handleAddCol}
              className="h-10 px-4 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              ➕ 열 추가
            </button>
            <button
              type="button"
              onClick={handleRemoveCol}
              className="h-10 px-4 rounded-xl bg-green-100 text-green-700 text-sm font-bold hover:bg-green-200 transition-all"
            >
              ➖ 열 삭제
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="h-10 px-4 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-all"
            >
              🔄 표 초기화
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td
                    key={colIndex}
                    className={`border-2 border-gray-300 p-2 md:p-3 align-middle ${
                      cell.isHeader
                        ? 'bg-blue-50 font-bold text-gray-800'
                        : 'bg-white text-gray-800'
                    }`}
                  >
                    {editable ? (
                      <input
                        type="text"
                        value={cell.value}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        className={`w-full bg-transparent focus:outline-none text-xs md:text-sm ${
                          !cell.isHeader ? '' : 'font-bold'
                        }`}
                        placeholder={cell.isHeader ? '헤더' : ''}
                      />
                    ) : (
                      <span className="text-xs md:text-sm break-words">
                        {cell.value}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editable && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="h-12 px-6 rounded-xl bg-purple-500 text-white font-bold text-lg hover:bg-purple-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            💾 표 저장하기
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTableCreator;


