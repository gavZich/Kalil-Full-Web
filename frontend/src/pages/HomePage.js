import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';  // Axios for fetching data
import Header from '../components/Header';  // Importing the Header component
import AboutUs from '../components/AboutUs';  // Importing the AboutUs component
import Programs from '../components/Programs';  // Importing Programs component
import '../assets/styles/HomePage.css';

const HomePage = ({ setRedirectPath }) => {
  const [programs, setPrograms] = useState([]);  // State to store all programs
  const [filteredPrograms, setFilteredPrograms] = useState([]);  // State to store filtered programs
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();


  // Fetch all programs from backend
  const fetchPrograms = async () => {
    try {
      const { data } = await axios.get('/api/programs');  // Fetching programs from backend
      setPrograms(data);  // Store all programs
      setFilteredPrograms(data);  // Initially show all programs
    } catch (error) {
      console.error('Error fetching programs:', error);  // Log any errors that occur during fetching
    }
  };

  useEffect(() => {
    fetchPrograms();  // Fetch programs when the component mounts or when the pathname changes
  
    // Check if the user is logged in
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    setIsLoggedIn(!!userInfo);
  }, [location.pathname]);
  

  // Function to filter programs by category
  const handleCategoryClick = (category) => {
    if (category === 'all') {
      setFilteredPrograms(programs);  // Show all programs if "all" is clicked
    } else {
      const filtered = programs.filter((program) => program.type === category);  // Filter programs based on type
      setFilteredPrograms(filtered);
    }
  };

  const handlePurchase = (program) => {
    // Save selected program to localStorage
    localStorage.setItem('selectedProgram', JSON.stringify(program));

    if (isLoggedIn) {
      // Navigate to purchase page
      navigate(`/purchase/${program._id}`);
    } else {
      // Redirect to login page
      navigate('/login');
    }
  };


  return (
    <div>
      <Header />
      <AboutUs />
      <Programs 
        programs={filteredPrograms} 
        onCategoryClick={handleCategoryClick} 
        handlePurchase={handlePurchase} 
        isLoggedIn={isLoggedIn} 
        setRedirectPath={setRedirectPath} 
      />
    </div>
  );
};

export default HomePage;
