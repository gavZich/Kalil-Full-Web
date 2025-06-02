import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FileManagement = ({ token, programId }) => {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');
  

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(`http://localhost:5000/api/programs/${programId}/files`, config);
        setFiles(response.data.files);
      } catch (error) {
        console.error('Failed to fetch files:', error);
      }
    };

    fetchFiles();
  }, [token, programId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }
  
    const formData = new FormData();
    formData.append('lessonFile', file);
  
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      };
  
      const response = await axios.post(
        `http://localhost:5000/api/admin/programs/${programId}/upload`,
        formData, 
        config
      );
  
      setMessage('File uploaded successfully!');
      setFiles([...files, response.data.file]);
    } catch (error) {
      console.error('Failed to upload file:', error);
      setMessage('Failed to upload file. Please try again.');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
  
      await axios.delete(`http://localhost:5000/api/admin/programs/${programId}/files/${fileId}`, config);
      setFiles(files.filter((f) => f._id !== fileId));
      setMessage('File deleted successfully.');
    } catch (error) {
      console.error('Failed to delete file:', error);
      setMessage('Failed to delete file. Please try again.');
    }
  };

  return (
    <div>
      <h3>File Management</h3>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload File</button>
      {message && <p>{message}</p>}

      <h3>Existing Files</h3>
        <ul>
          {files.map((f, index) => (
            <li key={f._id || index}>
              {f.fileName}
              <button onClick={() => handleDeleteFile(f._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileManagement;
