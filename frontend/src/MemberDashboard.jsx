import { useState, useEffect } from 'react';
import axios from 'axios';

export default function MemberDashboard() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [tasks, setTasks] = useState([]);

  // Fetch tasks when the page loads
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/work-items/');
      // Filter is BACK ON: Only show tasks that belong to the logged-in user
      const myTasks = response.data.filter(
        task => parseInt(task.assignee_id) === parseInt(user.id)
      );
      setTasks(myTasks); 
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  };
  const updateProgress = async (taskId, newProgress) => {
    try {
      await axios.patch(`http://127.0.0.1:8000/work-items/${taskId}`, { 
        progress: parseInt(newProgress) 
      });
      fetchTasks(); // Refresh the list from the database to get new statuses
    } catch (error) {
      console.error("Error updating task", error);
      alert("Failed to update task.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Member Dashboard</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#555', color: 'white', border: 'none', borderRadius: '4px' }}>Logout</button>
      </div>
      <p>Welcome, <strong>{user?.username}</strong>! Your skills: {user?.skills}</p>
      <hr style={{ margin: '20px 0', borderColor: '#444' }} />
      
      <h2>Your Assigned Tasks</h2>  
      
      {tasks.length === 0 ? <p>No tasks assigned yet.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {tasks.map(task => (
            <div key={task.id} style={{ border: '1px solid #444', padding: '20px', borderRadius: '8px', backgroundColor: '#1e1e1e', color: 'white' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>
                {task.title} <span style={{ fontSize: '14px', color: '#aaa' }}>(Priority: {task.priority})</span>
              </h3>
              
              

              <p style={{ margin: '0 0 10px 0' }}>{task.description}</p>
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                <p style={{ margin: 0 }}>Status: <strong style={{ color: task.status === 'blocked' ? '#ff4d4d' : '#4dff4d' }}>{task.status.toUpperCase()}</strong></p>
                <p style={{ margin: 0 }}>Progress: <strong>{task.progress}%</strong></p>
              </div>
              
              {/* Only allow updates if the task isn't blocked */}
              {task.status !== 'blocked' && task.status !== 'done' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="number" 
                    min="0" 
                    max="100" 
                    defaultValue={task.progress}
                    id={`progress-${task.id}`}
                    style={{ padding: '8px', width: '80px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <button 
                    onClick={() => {
                      const val = document.getElementById(`progress-${task.id}`).value;
                      updateProgress(task.id, val);
                    }}
                    style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Update Progress
                  </button>
                </div>
              )}

              {task.status === 'blocked' && (
                <div style={{ padding: '10px', backgroundColor: 'rgba(255, 77, 77, 0.2)', borderLeft: '4px solid #ff4d4d' }}>
                  This task is currently blocked by a dependency.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}