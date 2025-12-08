import React, { useState, useRef, useEffect } from 'react';

export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  children?: MindMapNode[];
}

interface MindMapProps {
  initialData?: MindMapNode[];
  onSave: (nodes: MindMapNode[]) => void;
  editable: boolean;
  placeholder?: string;
}

const CENTER_X = 400;
const CENTER_Y = 300;
const NODE_RADIUS = 80;
const MIN_DISTANCE = 150;

const MindMap: React.FC<MindMapProps> = ({
  initialData,
  onSave,
  editable,
  placeholder = '중앙에 주제를 적고, 주변에 궁금한 내용을 추가해보세요'
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<MindMapNode[]>(() => {
    if (initialData && initialData.length > 0) {
      return initialData;
    }
    return [{
      id: 'center',
      text: '궁금한 내용',
      x: CENTER_X,
      y: CENTER_Y,
      children: []
    }];
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setNodes(initialData);
    }
  }, [initialData]);

  const centerNode = nodes.find(n => n.id === 'center') || nodes[0];
  const childNodes = nodes.filter(n => n.id !== 'center' && n.id !== nodes[0]?.id);

  const handleAddNode = () => {
    if (!editable) return;

    const angle = (childNodes.length * 60) % 360;
    const radian = (angle * Math.PI) / 180;
    const distance = MIN_DISTANCE + (Math.floor(childNodes.length / 6) * 50);
    
    const newX = centerNode.x + Math.cos(radian) * distance;
    const newY = centerNode.y + Math.sin(radian) * distance;

    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      text: '새로운 질문',
      x: newX,
      y: newY
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    onSave(updatedNodes);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!editable || nodeId === 'center') return;
    
    const updatedNodes = nodes.filter(n => n.id !== nodeId);
    setNodes(updatedNodes);
    onSave(updatedNodes);
  };

  const handleNodeTextChange = (nodeId: string, newText: string) => {
    if (!editable) return;

    const updatedNodes = nodes.map(node =>
      node.id === nodeId ? { ...node, text: newText } : node
    );
    setNodes(updatedNodes);
    onSave(updatedNodes);
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (!editable || nodeId === 'center') return;
    
    e.stopPropagation();
    setDraggingNodeId(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDragOffset({
        x: e.clientX - node.x,
        y: e.clientY - node.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !editable) return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;

    const updatedNodes = nodes.map(node =>
      node.id === draggingNodeId
        ? { ...node, x: Math.max(50, Math.min(750, newX)), y: Math.max(50, Math.min(550, newY)) }
        : node
    );
    setNodes(updatedNodes);
  };

  const handleMouseUp = () => {
    if (draggingNodeId) {
      onSave(nodes);
      setDraggingNodeId(null);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (editable) {
      setSelectedNodeId(nodeId);
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-300 p-4">
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">{placeholder}</p>
        {editable && (
          <button
            type="button"
            onClick={handleAddNode}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors text-sm"
          >
            ➕ 질문 추가하기
          </button>
        )}
      </div>

      <div className="relative bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200" style={{ height: '600px' }}>
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="absolute inset-0"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* 연결선 그리기 */}
          {childNodes.map((node) => (
            <line
              key={`line-${node.id}`}
              x1={centerNode.x}
              y1={centerNode.y}
              x2={node.x}
              y2={node.y}
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
          ))}

          {/* 노드 렌더링 */}
          {nodes.map((node) => {
            const isCenter = node.id === 'center' || node.id === nodes[0]?.id;
            const isSelected = selectedNodeId === node.id;

            return (
              <g key={node.id}>
                {/* 노드 원 */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isCenter ? NODE_RADIUS : NODE_RADIUS - 20}
                  fill={isCenter ? '#3b82f6' : '#ffffff'}
                  stroke={isSelected ? '#f59e0b' : isCenter ? '#2563eb' : '#64748b'}
                  strokeWidth={isSelected ? 4 : 2}
                  className={editable && !isCenter ? 'cursor-move' : 'cursor-default'}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onClick={() => handleNodeClick(node.id)}
                />

                {/* 노드 텍스트 */}
                {isSelected && editable ? (
                  <foreignObject
                    x={node.x - (isCenter ? NODE_RADIUS : NODE_RADIUS - 20)}
                    y={node.y - 15}
                    width={(isCenter ? NODE_RADIUS : NODE_RADIUS - 20) * 2}
                    height="30"
                  >
                    <input
                      type="text"
                      value={node.text}
                      onChange={(e) => handleNodeTextChange(node.id, e.target.value)}
                      onBlur={() => setSelectedNodeId(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setSelectedNodeId(null);
                        }
                      }}
                      className="w-full h-full text-center text-xs md:text-sm font-bold border-2 border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                      autoFocus
                    />
                  </foreignObject>
                ) : (
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={isCenter ? '#ffffff' : '#1e293b'}
                    fontSize={isCenter ? '14' : '12'}
                    fontWeight="bold"
                    className="pointer-events-none select-none"
                    style={{ userSelect: 'none' }}
                  >
                    {node.text.length > 15 ? node.text.substring(0, 15) + '...' : node.text}
                  </text>
                )}

                {/* 삭제 버튼 (중앙 노드가 아니고 편집 가능할 때) */}
                {!isCenter && editable && (
                  <g
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(node.id);
                    }}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={node.x + (NODE_RADIUS - 20)}
                      cy={node.y - (NODE_RADIUS - 20)}
                      r="12"
                      fill="#ef4444"
                      opacity="0.8"
                    />
                    <text
                      x={node.x + (NODE_RADIUS - 20)}
                      y={node.y - (NODE_RADIUS - 20)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      ×
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {editable && (
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>💡 노드를 클릭하면 텍스트를 수정할 수 있어요</p>
          <p>💡 노드를 드래그해서 위치를 이동할 수 있어요</p>
          <p>💡 × 버튼을 눌러서 노드를 삭제할 수 있어요</p>
        </div>
      )}
    </div>
  );
};

export default MindMap;

