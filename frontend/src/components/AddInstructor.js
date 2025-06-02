import React, { useState } from 'react';
import axios from 'axios';

const AddInstructor = ({ token }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddInstructor = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post('/api/admin/add-instructor', {
        name,
        email,
        phone,
        password,
      }, config);
      
      setSuccess(`Instructor ${data.name} added successfully!`);
      setError('');
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
    } catch (error) {
      console.error('Failed to add instructor:', error);
      setError('Failed to add instructor. Please try again.');
      setSuccess('');
    }
  };

  return (
    <div>
      <h2>Add New Instructor</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="tel"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleAddInstructor}>Add Instructor</button>
    </div>
  );
};

export default AddInstructor;
