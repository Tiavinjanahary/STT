import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import NavigationBar from './components/NavigationBar';
import HomePage from './pages/HomePage';
import N1Page from './pages/N1Page';
import N2Page from './pages/N2Page';

function App() {
  return (
    <Router>
      <NavigationBar />
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/n1" element={<N1Page />} />
          <Route path="/n2" element={<N2Page />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;