import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileManagement from './FileManagement';

const ProgramManagement = ({ token }) => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [editProgram, setEditProgram] = useState(null);
  const [newProgram, setNewProgram] = useState({
    name: '',
    description: '',
    price: 0,
    type: '',
    phoneCalls: 0,
  });

  useEffect(() => {
    // Fetch the list of programs
    const fetchPrograms = async () => {
      try {
        if (token) {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const { data } = await axios.get('http://localhost:5000/api/programs', config);
          setPrograms(data);
        }
      } catch (error) {
        console.error('Failed to fetch programs:', error);
      }
    };

    fetchPrograms();
  }, [token]);

  const handleProgramSelect = (e) => {
    const programId = e.target.value;
    setSelectedProgram(programId);
    const program = programs.find((p) => p._id === programId);
    setEditProgram(program);
  };

  const handleAddProgram = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post('http://localhost:5000/api/programs', newProgram, config);
      setPrograms([...programs, data]);
      alert('Program added successfully');
    } catch (error) {
      console.error('Failed to add program:', error);
      alert('Failed to add program.');
    }
  };

  const handleUpdateProgram = async () => {
    if (!editProgram) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put(`http://localhost:5000/api/programs/${editProgram._id}`, editProgram, config);
      setPrograms(programs.map((p) => (p._id === data._id ? data : p)));
      alert('Program updated successfully');
    } catch (error) {
      console.error('Failed to update program:', error);
      alert('Failed to update program.');
    }
  };

  const handleDeleteProgram = async (programId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`http://localhost:5000/api/programs/${programId}`, config);
      setPrograms(programs.filter((p) => p._id !== programId));
      alert('Program deleted successfully');
    } catch (error) {
      console.error('Failed to delete program:', error);
      alert('Failed to delete program.');
    }
  };

  return (
    <div>
      <h2>Programs Management</h2>

      <div>
        <h3>Add New Program</h3>
        <input
          type="text"
          placeholder="Name"
          value={newProgram.name}
          onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newProgram.description}
          onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newProgram.price}
          onChange={(e) => setNewProgram({ ...newProgram, price: e.target.value })}
        />
        <input
          type="text"
          placeholder="Type"
          value={newProgram.type}
          onChange={(e) => setNewProgram({ ...newProgram, type: e.target.value })}
        />
        <input
          type="number"
          placeholder="Phone Calls"
          value={newProgram.phoneCalls}
          onChange={(e) => setNewProgram({ ...newProgram, phoneCalls: e.target.value })}
        />
        <button onClick={handleAddProgram}>Add Program</button>
      </div>

      <div>
        <h3>Update Program</h3>
        <select onChange={handleProgramSelect} value={selectedProgram}>
          <option value="">Select Program</option>
          {programs.map((program) => (
            <option key={program._id} value={program._id}>
              {program.name}
            </option>
          ))}
        </select>
        {editProgram && (
          <>
            <input
              type="text"
              value={editProgram.name}
              onChange={(e) => setEditProgram({ ...editProgram, name: e.target.value })}
            />
            <input
              type="text"
              value={editProgram.description}
              onChange={(e) => setEditProgram({ ...editProgram, description: e.target.value })}
            />
            <input
              type="number"
              value={editProgram.price}
              onChange={(e) => setEditProgram({ ...editProgram, price: e.target.value })}
            />
            <input
              type="text"
              value={editProgram.type}
              onChange={(e) => setEditProgram({ ...editProgram, type: e.target.value })}
            />
            <input
              type="number"
              value={editProgram.phoneCalls}
              onChange={(e) => setEditProgram({ ...editProgram, phoneCalls: e.target.value })}
            />
            <button onClick={handleUpdateProgram}>Update Program</button>
          </>
        )}
      </div>

      <div>
        <h3>Existing Programs</h3>
        <ul>
          {programs.map((program) => (
            <li key={program._id}>
              {program.name}
              <button onClick={() => handleDeleteProgram(program._id)}>Delete Program</button>
            </li>
          ))}
        </ul>
      </div>

      {selectedProgram && (
        <FileManagement programId={selectedProgram} token={token} />
      )}
    </div>
  );
};

export default ProgramManagement;
