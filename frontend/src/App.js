import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import PurchasePage from './pages/PurchasePage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';

function App() {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userToken'));
  const [redirectPath, setRedirectPath] = useState('/');

  const token = localStorage.getItem('userToken');

  const handlePurchase = (program) => {
    setSelectedProgram(program);  // Save selected program

    if (isLoggedIn) {
      setRedirectPath(`/purchase/${program._id}`);
    } else {
      setRedirectPath(`/purchase/${program._id}`);
      localStorage.setItem('selectedProgram', JSON.stringify(program));
      window.location.href = '/login';  // Redirect to login if not logged in
    }
  };

  useEffect(() => {
    const savedProgram = localStorage.getItem('selectedProgram');
    if (savedProgram && isLoggedIn) {
      const program = JSON.parse(savedProgram);
      setSelectedProgram(program);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userInfo'));
    if (userData && userData.token) {
      localStorage.setItem('userToken', userData.token);
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<HomePage setRedirectPath={setRedirectPath} isLoggedIn={isLoggedIn} handlePurchase={handlePurchase} />}
        />
        <Route
          path="/login"
          element={<LoginPage setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/register"
          element={<RegisterPage />}
        />
        <Route
          path="/profile"
          element={<ProfilePage token={token} />}
        />
        <Route
          path="/purchase/:id"
          element={<PurchasePage />}
        />
        <Route
          path="/admin"
          element={<AdminPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
