import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Reviews from './pages/Reviews';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reviews" element={<Reviews   />} />
          <Route path="/insights/:id" element={<Insights />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;