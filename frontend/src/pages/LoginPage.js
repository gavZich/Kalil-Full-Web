import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password });
      console.log('Login response data:', data);

      localStorage.setItem('userInfo', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role, // Ensure role is saved in localStorage
        token: data.token,
      }));

      console.log('User information saved in localStorage:', JSON.parse(localStorage.getItem('userInfo')));

      setIsLoggedIn(true);

      // Check if a program is saved in localStorage
      const savedProgram = localStorage.getItem('selectedProgram');
      if (savedProgram) {
        const program = JSON.parse(savedProgram);
        navigate(`/purchase/${program._id}`);
      } else {
        // Ensure no leftover data in localStorage
        localStorage.removeItem('selectedProgram');
        navigate('/profile');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div>
      <h1>Login</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

export default LoginPage;
