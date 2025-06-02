import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UpdateLessonsStatus = ({ role }) => {
  const [lessons, setLessons] = useState([]);
  const [token, setToken] = useState(null); // Use a state to store the token
  const [loading, setLoading] = useState(false); // Loading state
  const [message, setMessage] = useState(''); // Message state for feedback

  useEffect(() => {
    // Get the token from local storage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const userToken = userInfo?.token;

    if (!userToken) {
      console.error('No token found, unable to fetch lessons');
      return;
    }

    setToken(userToken); // Set the token in the state

    // Fetch the lessons based on the user's role
    const fetchLessons = async () => {
      try {
        setLoading(true);
        console.log('Fetching lessons...');
        console.log('Token:', userToken);
        console.log('Role:', role);

        const config = {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        };

        // Fetch lessons for student or instructor
        const url = role === 'instructor' ? '/api/lessons/instructor-summary' : '/api/lessons/student-summary';
        console.log('Request URL:', url);

        const { data } = await axios.get(url, config);
        setLessons(data.upcomingLessons || []);
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
        setMessage('Failed to fetch lessons. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [role]);

  const handleApproveLesson = async (lessonId) => {
    if (!token) {
      console.error('No token found, unable to approve lesson');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(`/api/lessons/${lessonId}/approve`, {}, config);
      setMessage('Lesson approved successfully!');
      setLessons(lessons.filter(lesson => lesson._id !== lessonId));
    } catch (error) {
      console.error('Failed to approve lesson:', error);
      setMessage('Failed to approve lesson. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLesson = async (lessonId) => {
    if (!token) {
      console.error('No token found, unable to cancel lesson');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`/api/lessons/${lessonId}`, config);
      setMessage('Lesson canceled successfully!');
      setLessons(lessons.filter(lesson => lesson._id !== lessonId));
    } catch (error) {
      console.error('Failed to cancel lesson:', error);
      setMessage('Failed to cancel lesson. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLessonConfirm = async (lessonId) => {
    if (!token) {
      console.error('No token found, unable to confirm lesson');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      await axios.put(`/api/lessons/${lessonId}/confirm`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage('Lesson successfully confirmed!');
      setLessons((prevLessons) =>
        prevLessons.map((lesson) =>
          lesson._id === lessonId ? { ...lesson, status: 'completed' } : lesson
        )
      );
    } catch (error) {
      console.error('Failed to confirm lesson:', error);
      setMessage('Failed to confirm lesson. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Update Lesson Status</h2>
      {loading && <p>Loading...</p>}
      {message && <p>{message}</p>}
      <ul>
        {lessons.length > 0 ? (
          lessons.map((lesson) => (
            <li key={lesson._id}>
              {new Date(lesson.dateTime).toLocaleString()} - 
              {role === 'instructor' ? ` Student: ${lesson.student.name}` : ` Instructor: ${lesson.instructor.name}`}
              <button
                onClick={() => handleLessonConfirm(lesson._id)}
                disabled={lesson.status === 'completed' || loading}
              >
                {lesson.status === 'completed' ? 'Completed' : 'Confirm Lesson'}
              </button>
              {role === 'instructor' && lesson.status === 'pending' && (
                <button onClick={() => handleApproveLesson(lesson._id)} disabled={loading}>Approve</button>
              )}
              <button onClick={() => handleCancelLesson(lesson._id)} disabled={loading}>Cancel</button>
            </li>
          ))
        ) : (
          <p>No upcoming lessons</p>
        )}
      </ul>
    </div>
  );
};

export default UpdateLessonsStatus;
