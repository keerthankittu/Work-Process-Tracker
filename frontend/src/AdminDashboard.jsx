import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactFlow, { Background, Controls, applyNodeChanges, applyEdgeChanges } from 'reactflow';
import 'reactflow/dist/style.css';

export default function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [tasks, setTasks] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, depsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/work-items/'),
        axios.get('http://127.0.0.1:8000/dependencies/')
      ]);

      const fetchedTasks = tasksRes.data;
      const fetchedDeps = depsRes.data;
      setTasks(fetchedTasks);

      // 1. Create Nodes (Sleek dark theme, wider spacing)
      const newNodes = fetchedTasks.map((task, index) => ({
        id: task.id.toString(),
        // Increased spacing: 350px horizontally, 150px vertically
        position: { x: 350 * (index % 3), y: 150 * Math.floor(index / 3) }, 
        data: { 
          label: (
            <div style={{ padding: '8px', textAlign: 'center', fontFamily: 'sans-serif' }}>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#eeeeee', marginBottom: '8px' }}>
                {task.title}
              </div>
              <div style={{ 
                fontSize: '12px', 
                fontWeight: 'bold',
                color: task.status === 'blocked' ? '#ff6b6b' : task.status === 'done' ? '#51cf66' : '#339af0' 
              }}>
                {task.status.toUpperCase()} ({task.progress}%)
              </div>
            </div>
          )
        },
        style: { 
          background: '#2b2b2b', 
          border: '1px solid #444', 
          borderRadius: '12px', 
          width: 220,
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }
      }));

      // 2. Create Edges (Smoother arrows with cleaner labels)
      const newEdges = fetchedDeps.map(dep => ({
        id: `e${dep.predecessor_id}-${dep.successor_id}`,
        source: dep.predecessor_id.toString(),
        target: dep.successor_id.toString(),
        animated: true,
        type: 'smoothstep', // Gives the arrows nice clean corners
        label: `${dep.type} (${dep.threshold}%)`,
        labelStyle: { fill: '#eeeeee', fontWeight: 600, fontSize: 11 },
        labelBgStyle: { fill: '#1e1e1e', fillOpacity: 0.9 }, // Dark background for the edge label
        style: { stroke: '#ff0072', strokeWidth: 2 }
      }));

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error("Error fetching admin data", error);
    }
  };

  const onNodesChange = (changes) => setNodes((nds) => applyNodeChanges(changes, nds));
  const onEdgesChange = (changes) => setEdges((eds) => applyEdgeChanges(changes, eds));

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', height: '100vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      
      {/* Cleaned up Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#fff' }}>Admin Dashboard: Process Flow</h1>
          <p style={{ margin: 0, color: '#aaa', fontSize: '15px' }}>Drag the nodes around to organize your workflow.</p>
        </div>
        <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px' }}>
          Logout
        </button>
      </div>

      {/* The React Flow Canvas */}
      <div style={{ flexGrow: 1, border: '1px solid #333', borderRadius: '12px', backgroundColor: '#121212', overflow: 'hidden' }}>
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          fitViewOptions={{ padding: 0.2 }} // Adds a little padding so nodes don't touch the edge of the screen
        >
          <Background color="#333" gap={20} size={1} />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}