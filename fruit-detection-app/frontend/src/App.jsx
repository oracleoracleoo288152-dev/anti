import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Camera, History, Scan } from 'lucide-react';
import Home from './pages/Home';
import HistoryPage from './pages/History';

function Layout({ children }) {
  return (
    <div className="app-container">
      <nav className="navbar glass">
        <div className="nav-brand">
          <Scan size={32} color="#8b5cf6" />
          <span className="text-gradient">FruitAI</span>
        </div>
        <div className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Camera size={20} />
            Detect
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <History size={20} />
            History
          </NavLink>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
