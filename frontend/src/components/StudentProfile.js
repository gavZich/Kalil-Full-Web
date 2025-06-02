import React, { useState, useEffect } from 'react';
import ScheduleLesson from './ScheduleLesson';
import UpdateLessonsStatus from './UpdateLessonsStatus'; // Import the common UpdateLessonsStatus component
import StudentLessons from './StudentLessons'; // Import the StudentLessons component
import ProgramsAndLessons from './ProgramsAndLessons'; // Import the common ProgramsAndLessons component

const StudentProfile = ({ userInfo }) => {
  const token = userInfo?.token || JSON.parse(localStorage.getItem('userInfo'))?.token;

  const [loading] = useState(false);
  const [message, setMessage] = useState('');
  const [showLessons, setShowLessons] = useState(false); // State to show/hide lessons

  useEffect(() => {
    if (userInfo && userInfo.token) {
      console.log("Token from userInfo in StudentProfile:", userInfo.token);
    } else {
      console.error("Token is missing in StudentProfile.");
    }
  }, [userInfo]);

  const handleScheduleLessonSuccess = () => {
    setMessage('Lesson successfully scheduled!');
  };

  const handleScheduleLessonError = (error) => {
    setMessage(`Failed to schedule lesson: ${error.message}`);
  };


  return (
    <div>
      <p>Lessons Remaining: {userInfo.lessonsRemaining}</p>
      <p>Lessons Completed: {userInfo.lessonsCompleted}</p>
      
      {loading && <p>Loading...</p>}
      {message && <p>{message}</p>}

      <ScheduleLesson
        token={userInfo.token}
        onSuccess={handleScheduleLessonSuccess}
        onError={handleScheduleLessonError}
      />
      
      {/* <h2>Upcoming Lessons</h2> */}
      <UpdateLessonsStatus token={token} role="student" /> {/* Using the shared component */}

      {/* <h2>Your Lessons</h2>
      <button onClick={() => setShowLessons(!showLessons)}>
        {showLessons ? 'Hide Lessons' : 'View Lessons'}
      </button> */}

      {showLessons && <StudentLessons programId={userInfo.purchasedPrograms[0]} />} {/* Assuming the first program */}

        <ProgramsAndLessons token={token} />
    </div>
  );
};

export default StudentProfile;
