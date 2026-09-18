import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">NFL <span className="accent">Stats</span></h1>
        <p className="home-subtitle">2025 Season · Select a position to explore</p>
      </div>
      <div className="position-grid">
        <div className="position-card" onClick={() => navigate('/qbs')}>
          <span className="position-label">QB</span>
          <span className="position-name">Quarterbacks</span>
          <span className="position-arrow">→</span>
        </div>
        <div className="position-card" onClick={() => navigate('/rbs')}>
          <span className="position-label">RB</span>
          <span className="position-name">Running Backs</span>
          <span className="position-arrow">→</span>
        </div>
        <div className="position-card" onClick={() => navigate('/wrs')}>
          <span className="position-label">WR</span>
          <span className="position-name">Wide Receivers</span>
          <span className="position-arrow">→</span>
        </div>
         <div className="position-card" onClick={() => navigate('/tes')}>
          <span className="position-label">TE</span>
          <span className="position-name">Tight Ends</span>
          <span className="position-arrow">→</span>
        </div>
         <div className="position-card" onClick={() => navigate('/k')}>
          <span className="position-label">K</span>
          <span className="position-name">Kickers</span>
          <span className="position-arrow">→</span>
        </div>
      </div>
    </div>
  );
}

export default Home;