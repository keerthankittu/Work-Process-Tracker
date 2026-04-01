import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/login/', {
        username,
        password
      });

      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/member');
      }
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#121212', // Matches the dark background of the app
      fontFamily: 'sans-serif',
      margin: '-8px', // Negates default browser margins if they exist
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: '#1e1e1e',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #333'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '32px', letterSpacing: '1px' }}>NestUp</h1>
          <p style={{ color: '#aaa', margin: 0, fontSize: '15px' }}>Sign in to your workspace</p>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: 'rgba(255, 77, 77, 0.1)', 
            color: '#ff6b6b', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '20px', 
            fontSize: '14px',
            border: '1px solid rgba(255, 77, 77, 0.2)',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Username</label>
            <input 
              type="text" 
              placeholder="Enter your username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '6px', 
                border: '1px solid #444', 
                backgroundColor: '#2b2b2b', 
                color: '#fff',
                boxSizing: 'border-box',
                fontSize: '15px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Password</label>
            <input 
              type="password" 
              placeholder="Enter your password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '6px', 
                border: '1px solid #444', 
                backgroundColor: '#2b2b2b', 
                color: '#fff',
                boxSizing: 'border-box',
                fontSize: '15px',
                outline: 'none'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              marginTop: '10px',
              padding: '14px', 
              backgroundColor: isLoading ? '#555' : '#3b82f6', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}