import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageAvailability = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');

  useEffect(() => {
    // Fetch existing availability
    const fetchAvailability = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.token) {
          console.error('No user info or token found in local storage.');
          return;
        }
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        console.log('Fetching availability with config:', config);

        const { data } = await axios.get(`/api/availability/${userInfo._id}`, config);
        if (data && data.availableSlots) {
          setAvailableSlots(data.availableSlots);
        }
      } catch (error) {
        console.error('Failed to fetch availability:', error);
        alert('Failed to fetch availability. Please try again later.');
      }
    };

    fetchAvailability();
  }, []);

  const handleAddSlot = () => {
    const parsedDate = new Date(newSlot);
    if (!isNaN(parsedDate)) {
      setAvailableSlots([...availableSlots, { dateTime: parsedDate.toISOString() }]);
      setNewSlot('');
      alert('Slot added successfully!');
    } else {
      alert('Invalid date format, please try again.');
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        console.error('No user info or token found in local storage.');
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      console.log('Available Slots:', availableSlots); 
      console.log('Sending availability update with config:', config);
      console.log('Available Slots:', availableSlots);

      await axios.post(
        '/api/availability',
        { availableSlots },
        config
      );

      alert('Availability updated successfully!');
    } catch (error) {
      console.error('Failed to update availability:', error);
      alert('Failed to update availability. Please try again later.');
    }
  };

  return (
    <div>
      <h2>Manage Availability</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Add Available Slot:
          <input
            type="datetime-local"
            value={newSlot}
            onChange={(e) => setNewSlot(e.target.value)}
          />
          <button type="button" onClick={handleAddSlot}>
            Add Slot
          </button>
        </label>
        <ul>
          {availableSlots.map((slot, index) => (
            <li key={index}>{new Date(slot.dateTime).toLocaleString()}</li>
          ))}
        </ul>
        <button type="submit">Save Availability</button>
      </form>
    </div>
  );
};

export default ManageAvailability;
