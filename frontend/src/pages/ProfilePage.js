import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import StudentProfile from '../components/StudentProfile';
import InstructorProfile from '../components/InstructorProfile';

const ProfilePage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [instructorSummary, setInstructorSummary] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        console.log("Fetching user info...");

        const userData = JSON.parse(localStorage.getItem('userInfo'));
        console.log('Retrieved user data from localStorage:', userData);

        if (userData && userData.token) {
          console.log("Token found:", userData.token);
          const config = {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          };

          const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
          setUserInfo(data);
          console.log('User info set in state:', data); // Log user info to verify

          if (data.role === 'instructor') {
            // Fetch instructor summary if role is instructor
            const summary = await axios.get('http://localhost:5000/api/lessons/instructor-summary', config);
            setInstructorSummary(summary.data);
            console.log('Instructor summary:', summary.data); // Log instructor summary
          }
        } else {
          throw new Error('No token found');
        }

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        setError('Failed to fetch user information.');
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userInfo'));

      if (userData && userData.token) {
        const config = {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        };

        await axios.post('http://localhost:5000/api/users/logout', {}, config);

        localStorage.removeItem('userInfo');
        navigate('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Profile Page</h1>
      {userInfo && (
        <div>
          <p>Name: {userInfo.name}</p>
          <p>Email: {userInfo.email}</p>
          <p>Role: {userInfo.role}</p>
          <button onClick={handleLogout}>Logout</button>

          {userInfo.role === 'student' && (
            <StudentProfile userInfo={userInfo} />
          )}

          {userInfo.role === 'instructor' && instructorSummary && (
            <InstructorProfile userInfo={userInfo} instructorSummary={instructorSummary} />
          )}

          {userInfo.role === 'admin' && (
            <Link to="/admin">
              <button>Go to Admin Page</button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
