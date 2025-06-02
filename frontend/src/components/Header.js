import React from 'react';
import { Link } from 'react-router-dom';  // Importing Link for navigation
import profileIcon from '../assets/images/profile-icon.png';  // Profile icon

const Header = () => {
  return (
    <header className="home-header">
      <h1>Welcome to Our Arabic Learning Platform</h1>
      <p>Explore our programs and start learning Arabic today!</p>

      {/* Login button with profile icon */}
      <div className="login-container">
        <Link to="/login">
          <button className="login-button">
            <img src={profileIcon} alt="Profile" className="profile-icon" /> Login
          </button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
