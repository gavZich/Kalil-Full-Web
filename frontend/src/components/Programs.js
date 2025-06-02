import React from 'react';
import ProgramDetails from './ProgramDetails';  // Import the ProgramDetails component

const Programs = ({ programs, onCategoryClick, handlePurchase, isLoggedIn, setRedirectPath }) => {
  return (
    <section className="program-categories">
      <h2>Our Programs</h2>
      <div className="category-buttons">
        {/* Buttons to select category */}
        <button onClick={() => onCategoryClick('course')}>Beginner's Course</button>
        <button onClick={() => onCategoryClick('phone_calls')}>Phone Calls Package</button>
        <button onClick={() => onCategoryClick('profession_specific')}>Professional Training</button>
      </div>

      {/* Display the filtered programs */}
      <div className="program-list">
        {programs.length > 0 ? (
          programs.map((program) => (
            <ProgramDetails 
              key={program._id} 
              program={program} 
              handlePurchase={handlePurchase}
              isLoggedIn={isLoggedIn} 
              setRedirectPath={setRedirectPath} 
            />
          ))
        ) : (
          <p>No programs available for this category</p>  // Fallback if no programs are available
        )}
      </div>
    </section>
  );
};

export default Programs;
