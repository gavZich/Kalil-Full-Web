import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams , useNavigate } from 'react-router-dom';

const PurchasePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [program, setProgram] = useState(null);
  const navigate = useNavigate();


  const { id } = useParams(); // Get the program ID from the URL

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (userInfo) {
      setIsLoggedIn(true);
      // Fetch the program details based on the ID from the URL
      axios.get(`/api/programs/${id}`)
        .then(response => {
          setProgram(response.data);
        })
        .catch(error => {
          console.error('Failed to load program details:', error);
        });
    } else {
      // Save program details in localStorage before redirecting to login
      localStorage.setItem('selectedProgram', JSON.stringify({ _id: id }));
      window.location.href = '/login';  // Redirect to login if not logged in
    }
    return () => {
      localStorage.removeItem('selectedProgram');  // Remove selectedProgram from localStorage
    };
  }, [id]);

  // Handle purchase process
  const handlePurchase = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      await axios.post('/api/purchases', { programId: program._id, userId: userInfo._id });
      console.log('Purchase successful');
  
      // Clear the selected program from localStorage after purchase
      localStorage.removeItem('selectedProgram');
  
      // Redirect to profile or any other page
      navigate('/profile');
    } catch (error) {
      console.error('Purchase failed:', error);
    }
  };
  
  const cancelPurchase = () => {
    localStorage.removeItem('selectedProgram');
    navigate('/ '); // Redirect back to programs page
  };

  return (
    <div>
      {program ? (
        <>
          <h1>Purchase {program.name}</h1>
          {isLoggedIn ? (
            <button onClick={handlePurchase}>Complete Purchase</button>
          ) : (
            <p>Loading...</p>
          )}
        </>
      ) : (
        <p>Loading program details...</p>
      )}
      <button onClick={cancelPurchase}>Cancel Purchase</button>
    </div>
  );
};

export default PurchasePage;
