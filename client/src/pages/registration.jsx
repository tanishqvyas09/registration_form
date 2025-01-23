import React, { useState } from 'react';

function Registration() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Adjust this URL if your server is on a different port or domain.
      // e.g., "https://my-app.onrender.com/register"
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Registration successful:', data);
        alert(`User '${data.user.username}' registered!`);
        // Optionally reset your form:
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        // e.g. 400 or 500 status
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Request error:', error);
      alert('Network or server error occurred');
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username: </label>
          <input 
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />
        </div>

        <div>
          <label>Email: </label>
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div>
          <label>Password: </label>
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Registration;
