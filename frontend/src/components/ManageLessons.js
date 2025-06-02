import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageLessons = ({ token }) => {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const { data } = await axios.get('/api/lessons/upcoming', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLessons(data);
      } catch (error) {
        console.error('Failed to fetch upcoming lessons:', error);
      }
    };

    fetchLessons();
  }, [token]);

  // Function to handle approving a lesson
  const handleApproveLesson = async (lessonId) => {
    try {
      await axios.put(`/api/lessons/${lessonId}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Update the lesson status in the local state
      setLessons((prevLessons) =>
        prevLessons.map((lesson) =>
          lesson._id === lessonId ? { ...lesson, status: 'approved' } : lesson
        )
      );
      alert('Lesson approved successfully');
    } catch (error) {
      console.error('Failed to approve lesson:', error);
      alert('Failed to approve lesson');
    }
  };

  // Function to handle canceling a lesson
  const handleCancelLesson = async (lessonId) => {
    try {
      await axios.delete(`/api/lessons/${lessonId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Remove the lesson from the local state
      setLessons((prevLessons) => prevLessons.filter((lesson) => lesson._id !== lessonId));
      alert('Lesson canceled successfully');
    } catch (error) {
      console.error('Failed to cancel lesson:', error);
      alert('Failed to cancel lesson');
    }
  };

  return (
    <div>
      <h2>Manage Lessons</h2>
      <ul>
        {lessons.map((lesson) => (
          <li key={lesson._id}>
            {new Date(lesson.dateTime).toLocaleString()} - Student: {lesson.student.name}
            <button onClick={() => handleApproveLesson(lesson._id)}>Approve</button>
            <button onClick={() => handleCancelLesson(lesson._id)}>Cancel</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageLessons;
