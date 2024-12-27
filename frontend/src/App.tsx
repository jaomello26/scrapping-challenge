import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Insights from './pages/Insights';
import Results from './pages/SearchResults';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results   />} />
          <Route path="/insights/:id" element={<Insights />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;