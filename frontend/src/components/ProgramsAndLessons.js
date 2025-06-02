import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

const ProgramsAndLessons = ({ token }) => {
  Modal.setAppElement('#root'); // Set the root element for the modal
  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedFileUrl, setSelectedFileUrl] = useState('');

  useEffect(() => {
    console.log("Token received in ProgramsAndLessons:", token); // Debugging token
  
    const fetchProgramsAndLessons = async () => {
      if (!token) {
        setError("No token found");
        return;
      }
  
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const { data } = await axios.get('/api/users/my-programs', config);
        console.log("Fetched Programs:", data); // Added console log for debug
        setPrograms(data);
      } catch (error) {
        console.error('Failed to fetch programs and lessons:', error);
        setError('Failed to fetch your programs and lessons.');
      }
    };
  
    fetchProgramsAndLessons();
  }, [token]);  

  const handleOpenModal = (fileUrl) => {
    const fullUrl = `http://localhost:5000${fileUrl}`; // Update to use port 5000
    console.log("Full URL for modal:", fullUrl); // Debugging URL
    setSelectedFileUrl(fullUrl);
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setSelectedFileUrl('');
  };

  return (
    <div>
      <h2>My Programs and Lessons</h2>
      {error && <p>{error}</p>}
      {programs.length > 0 ? (
        programs.map((program) => (
          <div key={program._id}>
            <h3>{program.name}</h3>
            <ul>
              {program.lessonFiles && program.lessonFiles.length > 0 ? (
                program.lessonFiles.map((file) => (
                  <li key={file._id}>
                    {file.fileName}
                    <button onClick={() => handleOpenModal(file.fileUrl)}>
                      View
                    </button>
                  </li>
                ))
              ) : (
                <p>No lessons available for this program.</p>
              )}
            </ul>
          </div>
        ))
      ) : (
        <p>No programs available</p>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Lesson File"
        appElement={document.getElementById('root')}
      >
        <h2>Lesson File</h2>
        <button onClick={handleCloseModal}>Close</button>
        {selectedFileUrl && (
          <iframe
            src={selectedFileUrl}
            title="Lesson File"
            width="100%"
            height="500px"
          />
        )}
      </Modal>
    </div>
  );
};

export default ProgramsAndLessons;
