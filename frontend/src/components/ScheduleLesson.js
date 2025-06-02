import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ScheduleLesson = () => {
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch all instructors
    const fetchInstructors = async () => {
      const userData = JSON.parse(localStorage.getItem('userInfo'));
      const token = userData?.token;

      if (!token) {
        console.error('Token is missing');
        setMessage('Failed to load instructors, token is missing.');
        return;
      }

      console.log("Fetching instructors with token:", token); // Debugging token

      try {
        setLoading(true);
        setMessage('');
        const { data } = await axios.get('http://localhost:5000/api/users/instructors', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setInstructors(data);
      } catch (error) {
        console.error('Failed to fetch instructors:', error);
        setMessage('Failed to load instructors. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  const handleInstructorSelect = async (instructorId) => {
    setSelectedInstructor(instructorId);
    setAvailableSlots([]);
    setSelectedSlot('');
    setMessage('');

    // Fetch available slots for the selected instructor
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('userInfo'));
      const token = userData?.token;

      if (!token) {
        console.error('Token is missing');
        setMessage('Failed to load available slots, token is missing.');
        return;
      }

      const { data } = await axios.get(`http://localhost:5000/api/availability/${instructorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAvailableSlots(data.availableSlots);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      setMessage('Failed to load available slots. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleLesson = async () => {
    try {
      setLoading(true);
      setMessage('');
      const userData = JSON.parse(localStorage.getItem('userInfo'));
      const token = userData?.token;

      if (!token) {
        console.error('Token is missing');
        setMessage('Failed to schedule lesson, token is missing.');
        return;
      }

      await axios.post(
        'http://localhost:5000/api/lessons/schedule',
        { instructorId: selectedInstructor, dateTime: selectedSlot },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage('Lesson successfully scheduled!');
    } catch (error) {
      console.error('Failed to schedule lesson:', error);
      setMessage('Failed to schedule lesson. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Schedule a Lesson</h2>
      {loading && <p>Loading...</p>}
      {message && <p>{message}</p>}
      
      <div>
        <label>Select Instructor:</label>
        <select onChange={(e) => handleInstructorSelect(e.target.value)} value={selectedInstructor}>
          <option value="">Select</option>
          {instructors.map((inst) => (
            <option key={inst._id} value={inst._id}>
              {inst.name}
            </option>
          ))}
        </select>
      </div>

      {availableSlots.length > 0 && (
        <div>
          <label>Select Available Slot:</label>
          <select onChange={(e) => setSelectedSlot(e.target.value)} value={selectedSlot}>
            <option value="">Select</option>
            {availableSlots.map((slot, index) => (
              <option key={index} value={slot.dateTime}>
                {new Date(slot.dateTime).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      )}

      <button onClick={handleScheduleLesson} disabled={!selectedInstructor || !selectedSlot || loading}>
        Schedule Lesson
      </button>
    </div>
  );
};

export default ScheduleLesson;
