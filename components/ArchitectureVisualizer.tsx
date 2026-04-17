"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getSocket } from "@/lib/socket";
import { Plus, Check, X, Type } from "lucide-react";

interface VisualizerProps {
  roomId: string;
  nodes: Node[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

const nodeTypes = {};
const edgeTypes = {};

export default function ArchitectureVisualizer({ 
  roomId, 
  nodes, 
  setNodes, 
  edges, 
  setEdges 
}: VisualizerProps) {
  const socketRef = useRef<any>(null);
  const isRemoteUpdate = useRef(false);
  const [editingNode, setEditingNode] = useState<{ id: string; label: string } | null>(null);

  useEffect(() => {
    socketRef.current = getSocket();
    const handleRemoteChange = (data: { nodes: Node[], edges: Edge[] }) => {
      isRemoteUpdate.current = true; 
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
    };
    socketRef.current.on("canvas-change", handleRemoteChange);
    return () => { socketRef.current?.off("canvas-change"); };
  }, [setNodes, setEdges]);

  useEffect(() => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }
    socketRef.current?.emit("canvas-change", { sessionId: roomId, nodes, edges });
  }, [nodes, edges, roomId]);

  // ✅ FIX: Added missing change handlers
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNewNode = () => {
    // Check if setNodes exists before calling (defensive coding)
    if (typeof setNodes !== 'function') {
        console.error("setNodes is not a function! Check props in VideoRoom.tsx");
        return;
    }

    const newNode: Node = {
      id: `node_${Date.now()}`,
      data: { label: 'New Component' },
      position: { x: 250, y: 150 },
      style: { 
        background: '#111', color: '#fff', border: '1px solid #3b82f6', 
        borderRadius: '12px', padding: '15px', width: 180, textAlign: 'center',
        fontSize: '12px', fontWeight: 'bold'
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const saveNodeName = () => {
    if (editingNode) {
      setNodes((nds) => nds.map((n) => 
        n.id === editingNode.id ? { ...n, data: { ...n.data, label: editingNode.label } } : n
      ));
      setEditingNode(null);
    }
  };

  return (
    <div className="h-full w-full bg-[#050505] relative flex flex-col">
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={addNewNode} 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20"
        >
          <Plus size={14} /> Add Component
        </button>
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange} // ✅ This fixes your red underline
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodeDoubleClick={(_, node) => setEditingNode({ id: node.id, label: node.data.label })}
          fitView
        >
          <Background color="#111" gap={25} />
          <Controls />
        </ReactFlow>
      </div>

      {editingNode && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 w-full max-w-sm p-6 rounded-[24px]">
            <input 
              autoFocus
              type="text" 
              value={editingNode.label} 
              onChange={(e) => setEditingNode({ ...editingNode, label: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && saveNodeName()}
              className="w-full bg-black border border-white/5 outline-none p-4 rounded-xl text-white mb-6"
            />
            <div className="flex gap-3">
              <button onClick={() => setEditingNode(null)} className="flex-1 py-3 text-[10px] font-black uppercase text-zinc-500">Cancel</button>
              <button onClick={saveNodeName} className="flex-[2] bg-blue-600 py-3 rounded-xl text-[10px] font-black uppercase text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}