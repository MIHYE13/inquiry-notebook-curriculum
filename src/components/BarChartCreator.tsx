import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { BarChartData, ChartDataPoint } from '../types';

interface BarChartCreatorProps {
  initialData?: BarChartData;
  onSave: (chart: BarChartData) => void;
  editable: boolean;
}

const DEFAULT_COLOR = '#3b82f6'; // blue-500

const COLOR_OPTIONS: { label: string; value: string; className: string }[] = [
  { label: '파랑', value: '#3b82f6', className: 'bg-blue-500' },
  { label: '보라', value: '#8b5cf6', className: 'bg-purple-500' },
  { label: '초록', value: '#22c55e', className: 'bg-green-500' },
  { label: '주황', value: '#f97316', className: 'bg-orange-500' },
  { label: '빨강', value: '#ef4444', className: 'bg-red-500' }
];

const BarChartCreator: React.FC<BarChartCreatorProps> = ({
  initialData,
  onSave,
  editable
}) => {
  const [title, setTitle] = useState(initialData?.title || '실험 결과 그래프');
  const [xAxisLabel, setXAxisLabel] = useState(initialData?.xAxisLabel || '가로축');
  const [yAxisLabel, setYAxisLabel] = useState(initialData?.yAxisLabel || '세로축');
  const [color, setColor] = useState(initialData?.color || DEFAULT_COLOR);
  const [data, setData] = useState<ChartDataPoint[]>(
    initialData?.data || [
      { label: '1', value: 0 },
      { label: '2', value: 0 },
      { label: '3', value: 0 }
    ]
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '실험 결과 그래프');
      setXAxisLabel(initialData.xAxisLabel || '가로축');
      setYAxisLabel(initialData.yAxisLabel || '세로축');
      setColor(initialData.color || DEFAULT_COLOR);
      setData(initialData.data);
    }
  }, [initialData]);

  const handleDataChange = (index: number, field: 'label' | 'value', value: string) => {
    if (!editable) return;
    setData(prev =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (field === 'label') {
          return { ...item, label: value };
        }
        // value
        const numeric = Number(value.replace(/[^0-9.-]/g, ''));
        return { ...item, value: Number.isNaN(numeric) ? 0 : numeric };
      })
    );
  };

  const handleAddRow = () => {
    if (!editable) return;
    setData(prev => [...prev, { label: `${prev.length + 1}`, value: 0 }]);
  };

  const handleRemoveRow = (index: number) => {
    if (!editable) return;
    setData(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!editable) return;

    const hasAnyLabel = data.some(d => d.label.trim() !== '');
    const hasAnyValue = data.some(d => d.value !== 0);

    if (!hasAnyLabel || !hasAnyValue) {
      setError('항목 이름과 값에 한 칸 이상 내용을 입력해주세요.');
      return;
    }

    setError(null);

    const chart: BarChartData = {
      id: initialData?.id || Date.now().toString(),
      title: title.trim() || '실험 결과 그래프',
      xAxisLabel: xAxisLabel.trim() || '가로축',
      yAxisLabel: yAxisLabel.trim() || '세로축',
      color,
      data,
      createdAt: initialData?.createdAt || new Date().toISOString()
    };

    onSave(chart);
  };

  const maxValue = Math.max(...data.map(d => d.value || 0), 0);
  const yDomainMax = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 10;

  return (
    <div className="space-y-4">
      {/* 상단 입력 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">
            그래프 제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!editable}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:bg-gray-100"
            placeholder="예: 씨앗이 싹트는 조건에 따른 싹의 개수"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">
            가로축 이름
          </label>
          <input
            type="text"
            value={xAxisLabel}
            onChange={(e) => setXAxisLabel(e.target.value)}
            disabled={!editable}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:bg-gray-100"
            placeholder="예: 조건(빛, 물, 온도 등)"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700">
            세로축 이름
          </label>
          <input
            type="text"
            value={yAxisLabel}
            onChange={(e) => setYAxisLabel(e.target.value)}
            disabled={!editable}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 disabled:bg-gray-100"
            placeholder="예: 싹의 개수"
          />
        </div>
      </div>

      {/* 색상 선택 */}
      {editable && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">막대 색상 선택</p>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setColor(option.value)}
                className={`h-10 px-4 rounded-full text-xs md:text-sm font-bold text-white shadow-sm hover:shadow-md transition-all ${
                  option.className
                } ${color === option.value ? 'ring-4 ring-offset-2 ring-yellow-300' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-2 rounded-xl text-sm font-semibold">
          ⚠️ {error}
        </div>
      )}

      {/* 그래프 미리보기 */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">
          📈 그래프 미리보기
        </p>
        <div className="w-full" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                label={{ value: xAxisLabel, position: 'insideBottom', offset: -20 }}
              />
              <YAxis
                domain={[0, yDomainMax]}
                allowDecimals={false}
                label={{
                  value: yAxisLabel,
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10
                }}
              />
              <Tooltip />
              <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 데이터 입력 테이블 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">
            🔢 그래프에 들어갈 데이터 입력
          </p>
          {editable && (
            <button
              type="button"
              onClick={handleAddRow}
              className="h-10 px-4 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              ➕ 항목 추가
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="border-2 border-gray-300 bg-blue-50 px-3 py-2 text-xs md:text-sm font-bold text-gray-800">
                  항목 이름
                </th>
                <th className="border-2 border-gray-300 bg-blue-50 px-3 py-2 text-xs md:text-sm font-bold text-gray-800">
                  값(숫자)
                </th>
                {editable && (
                  <th className="border-2 border-gray-300 bg-blue-50 px-3 py-2" />
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="border-2 border-gray-300 px-3 py-2 bg-white">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => handleDataChange(index, 'label', e.target.value)}
                      disabled={!editable}
                      className="w-full bg-transparent focus:outline-none text-xs md:text-sm"
                      placeholder="예: 빛 있음, 물 없음"
                    />
                  </td>
                  <td className="border-2 border-gray-300 px-3 py-2 bg-white">
                    <input
                      type="number"
                      value={item.value}
                      onChange={(e) => handleDataChange(index, 'value', e.target.value)}
                      disabled={!editable}
                      className="w-full bg-transparent focus:outline-none text-xs md:text-sm"
                    />
                  </td>
                  {editable && (
                    <td className="border-2 border-gray-300 px-3 py-2 bg-white text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="text-red-500 hover:text-red-700 font-bold text-lg"
                      >
                        ×
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editable && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="h-12 px-6 rounded-xl bg-purple-500 text-white font-bold text-lg hover:bg-purple-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            💾 그래프 저장하기
          </button>
        </div>
      )}
    </div>
  );
};

export default BarChartCreator;


