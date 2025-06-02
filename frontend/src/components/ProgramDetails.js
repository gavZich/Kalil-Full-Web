import React from 'react';
import { useNavigate } from 'react-router-dom';  // For navigation

const ProgramDetails = ({ program, handlePurchase, isLoggedIn, setRedirectPath }) => {
  const navigate = useNavigate();

  const handlePurchaseClick = () => {
    if (isLoggedIn) {
      // If the user is logged in, continue with the purchase process
      handlePurchase(program);  // Call the handlePurchase function
    } else {
      // If the user is not logged in, save the program and redirect to login
      localStorage.setItem('selectedProgram', JSON.stringify(program));
      navigate('/login');
    }
  };

  return (
    <div className="program-item">
      <h2>{program.name}</h2>
      <p>{program.description}</p>
      <p>Price: ${program.price}</p>
      <p>Phone Calls: {program.phoneCalls}</p>
      <button onClick={handlePurchaseClick}>Purchase Now</button>
    </div>
  );
};

export default ProgramDetails;
