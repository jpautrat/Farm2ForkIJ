import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

// Pages
import HomePage from './pages/HomePage';

// Styles
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <Helmet>
        <title>Farm2Fork - Direct-to-Door Food Marketplace</title>
        <meta name="description" content="Buy fresh produce directly from local farmers" />
        <meta name="keywords" content="farm, food, local, organic, fresh, produce" />
      </Helmet>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
