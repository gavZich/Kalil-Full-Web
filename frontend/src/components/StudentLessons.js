import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StudentLessons = ({ programId }) => {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        console.error('No user info or token found in local storage.');
        return;
      }

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get(`/api/programs/${programId}/lessons`, config);
        setLessons(data.lessons);
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
      }
    };

    fetchLessons();
  }, [programId]);

  return (
    <div>
      <h2>Lessons</h2>
      <ul>
        {lessons.map((lesson, index) => (
          <li key={index}>
            <a href={lesson.fileUrl} target="_blank" rel="noopener noreferrer">
              {lesson.fileName}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentLessons;
