import React, { useRef, useEffect, useState } from 'react';

interface DrawingCanvasProps {
  initialDataUrl?: string;
  onSave: (dataUrl: string) => void;
  disabled?: boolean;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  initialDataUrl,
  onSave,
  disabled = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3b82f6');
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialDataUrl;
    }
  }, [initialDataUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      onSave(dataUrl);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown') return;
    if (disabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (e.type === 'mousedown') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onSave('');
  };

  const colors = [
    { name: '파랑', value: '#3b82f6' },
    { name: '빨강', value: '#ef4444' },
    { name: '초록', value: '#22c55e' },
    { name: '노랑', value: '#eab308' },
    { name: '보라', value: '#a855f7' },
    { name: '검정', value: '#000000' }
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-300">
      {!disabled && (
        <div className="flex flex-wrap gap-4 items-center mb-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700">색상:</span>
            <div className="flex gap-2">
              {colors.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    color === c.value ? 'border-gray-800 ring-2 ring-gray-400' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-700">두께:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm font-bold text-gray-600 min-w-[40px]">{lineWidth}px</span>
          </div>

          <button
            onClick={clearCanvas}
            className="ml-auto bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors"
          >
            🗑️ 지우기
          </button>
        </div>
      )}

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`border-2 border-gray-400 rounded-lg bg-white w-full max-w-full ${
            disabled ? 'cursor-not-allowed opacity-70' : 'cursor-crosshair'
          }`}
        />
        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
            <span className="bg-white px-4 py-2 rounded-lg font-bold text-gray-700">
              과거 기록의 그림은 수정할 수 없어요
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawingCanvas;
