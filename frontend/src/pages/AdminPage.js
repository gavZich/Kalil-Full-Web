import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AddInstructor from '../components/AddInstructor';
import ProgramManagement from '../components/ProgramManagement'; 

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [programs, setPrograms] = useState([]);

  const fetchUsersByRole = async (role) => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('userInfo'));

      if (userData && userData.token) {
        const config = {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        };

        const { data } = await axios.get(`/api/admin/users/${role}`, config);
        setUsers(data);
      } else {
        throw new Error('No token found');
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to fetch users information.');
      setLoading(false);
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'student' || selectedRole === 'instructor') {
      fetchUsersByRole(selectedRole);
    }
  };

  const handleResetLessons = async (instructorId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));

      if (userInfo && userInfo.token) {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        await axios.put(`http://localhost:5000/api/admin/instructors/${instructorId}/reset-lessons`, {}, config);
        alert('Lessons count reset successfully.');

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === instructorId ? { ...user, lessonsCompleted: 0 } : user
          )
        );
      }
    } catch (error) {
      console.error('Failed to reset lessons:', error);
      alert('Failed to reset lessons count.');
    }
  };

  const handleGenerateReport = async (instructorId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));

      if (userInfo && userInfo.token) {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
          responseType: 'blob',
        };

        const { data } = await axios.get(`http://localhost:5000/api/admin/instructor-payments/${instructorId}`, config);

        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'instructor_report.pdf');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report.');
    }
  };

  useEffect(() => {
    // Fetch all users when the component mounts
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem('userInfo'));

        if (userData && userData.token) {
          const config = {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          };

          const { data } = await axios.get('/api/admin/users/student', config);
          setUsers(data);
        } else {
          throw new Error('No token found');
        }
      } catch (error) {
        setError('Failed to fetch users information.');
      } finally {
        setLoading(false);
      }
    };

    // Fetch all programs
    const fetchPrograms = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userInfo'));

        if (userData && userData.token) {
          const config = {
            headers: {
              Authorization: `Bearer ${userData.token}`,
            },
          };

          const { data } = await axios.get('/api/programs', config);
          setPrograms(data);
        } else {
          throw new Error('No token found');
        }
      } catch (error) {
        console.error('Failed to fetch programs:', error);
      }
    };

    fetchUsers();
    fetchPrograms();
  }, []);

  const handleAssignProgram = async () => {
    if (!selectedStudent || !selectedProgram) {
      alert('Please select both a student and a program.');
      return;
    }
    
    try {
      setLoading(true); // begin the process
  
      const userData = JSON.parse(localStorage.getItem('userInfo'));
  
      if (userData && userData.token) {
        const config = {
          headers: {
            Authorization: `Bearer ${userData.token}`,
          },
        };
  
        const response = await axios.post(
          `/api/admin/users/${selectedStudent}/assign-program`,
          { programId: selectedProgram },
          config
        );
  
        alert('Program assigned successfully');
        console.log(response.data);
      }
    } catch (error) {
      console.error('Failed to assign program:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Failed to assign program: ${error.response.data.message}`);
      } else {
        alert('Failed to assign program. Please try again later.');
      }
    } finally {
      setLoading(false); // done with the process
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
      <h1>Admin Page</h1>
      <div>
        <button onClick={() => handleRoleSelect('student')}>View Students</button>
        <button onClick={() => handleRoleSelect('instructor')}>View Instructors</button>
        <button onClick={() => handleRoleSelect('programManagement')}>Manage Programs</button>
        <button onClick={() => handleRoleSelect('addInstructor')}>Add Instructor</button>
      </div>

      {role === 'student' && (
        <>
          <h2>Students List</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Lessons Completed</th>
                <th>Lessons Remaining</th>
                <th>Programs</th>
              </tr>
            </thead>
            <tbody>
            {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>{user.lessonsCompleted}</td>
                  <td>{user.lessonsRemaining}</td>
                  <td>
                    {user.purchasedPrograms && user.purchasedPrograms.length > 0
                      ? user.purchasedPrograms.map(program => {
                          // Log to check if the program field contains the expected details
                          console.log("Program Details:", program);
                          return program.program?.name; // Accessing the name from the populated program field
                        }).join(', ')
                      : 'No programs assigned'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <h3>Assign Program to Student</h3>
            <div>
              <label>Select Student:</label>
              <select onChange={(e) => setSelectedStudent(e.target.value)} value={selectedStudent}>
                <option value="">Select Student</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Select Program:</label>
              <select onChange={(e) => setSelectedProgram(e.target.value)} value={selectedProgram}>
                <option value="">Select Program</option>
                {programs.map((program) => (
                  <option key={program._id} value={program._id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={handleAssignProgram}>Assign Program</button>
          </div>
        </>
      )}

      {role === 'instructor' && (
        <>
          <h2>Instructors List</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Lessons Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>{user.lessonsCompleted}</td>
                  <td>
                    <button onClick={() => handleResetLessons(user._id)}>Reset Lessons</button>
                    <button onClick={() => handleGenerateReport(user._id)}>Generate Report</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {role === 'programManagement' && (
        <>
          <ProgramManagement token={JSON.parse(localStorage.getItem('userInfo')).token} />
        </>
      )}

      {role === 'addInstructor' && (
        <>
          <AddInstructor token={JSON.parse(localStorage.getItem('userInfo')).token} />
        </>
      )}
    </div>
  );
};

export default AdminPage;
