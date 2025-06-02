import React, { useState } from 'react';
import axios from 'axios';

const UpdateProfile = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  // Handle changes in the input fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });  // Update formData state with new values
  };

  // Handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent default form submission behavior
    try {
      await axios.put('/api/users/profile', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }  // Pass token for authorization
      });
      alert('Profile updated successfully');  // Show success message
    } catch (error) {
      console.error('Error updating profile:', error);  // Log error in case of failure
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="Name"
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Email"
      />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        placeholder="Password"
      />
      <button type="submit">Update Profile</button>
    </form>
  );
};

export default UpdateProfile;
