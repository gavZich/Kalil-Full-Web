import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post('/api/users', { name, email, phone, password });

      localStorage.setItem('userInfo', JSON.stringify(data));

      // Check if the user started a purchase process before registration
      const savedProgram = localStorage.getItem('selectedProgram');
      if (savedProgram) {
        const program = JSON.parse(savedProgram);
        navigate(`/purchase/${program._id}`);  // Redirect to the purchase page with the program id
      } else {
        navigate('/profile');  // Redirect to the profile page if no purchase process is ongoing
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div>
      <h1>Create an Account</h1>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
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
          Phone Number:
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default RegisterPage;
