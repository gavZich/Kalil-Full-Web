import React from 'react';
import { useLocation } from 'react-router-dom';  // Hook to get program data passed via link

const PaymentPage = () => {
  const location = useLocation();
  const { program } = location.state || {};  // Extract program data from state

  if (!program) {
    return <p>No program selected</p>;
  }

  return (
    <div>
      <h1>Payment for {program.name}</h1>
      <p>{program.description}</p>
      <p>Price: ${program.price}</p>
      <p>Phone Calls: {program.phoneCalls}</p>
      <button>Proceed to Payment</button>
    </div>
  );
};

export default PaymentPage;
