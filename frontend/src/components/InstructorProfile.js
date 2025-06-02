import React, { useState } from 'react';
import ManageAvailability from './ManageAvailability';
import UpdateLessonsStatus from './UpdateLessonsStatus'; // Import the common UpdateLessonsStatus component

const InstructorProfile = ({ userInfo, instructorSummary }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleManageAvailabilitySuccess = () => {
    setMessage('Availability updated successfully!');
  };

  const handleManageAvailabilityError = (error) => {
    setMessage(`Failed to update availability: ${error.message}`);
  };

  return (
    <div>
      <h2>Manage Availability</h2>
      {loading && <p>Loading...</p>}
      {message && <p>{message}</p>}
      <ManageAvailability
        token={userInfo.token}
        onSuccess={handleManageAvailabilitySuccess}
        onError={handleManageAvailabilityError}
      />

      <h2>Instructor Summary</h2>
      <p>Lessons Completed: {userInfo.lessonsCompleted}</p>

      <h3>Upcoming Lessons</h3>
      {instructorSummary.upcomingLessons.length > 0 ? (
        <ul>
          {instructorSummary.upcomingLessons.map((lesson) => (
            <li key={lesson._id}>
              {new Date(lesson.dateTime).toLocaleString()} - Student: {lesson.student.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No upcoming lessons</p>
      )}

      <h2>Manage Lessons</h2>
      <UpdateLessonsStatus token={userInfo?.token} role="instructor" /> {/* Using the shared component */}
    </div>
  );
};

export default InstructorProfile;
