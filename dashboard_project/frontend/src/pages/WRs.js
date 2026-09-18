import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import '../styles/WRs.css';

function WRs() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState('fantasy_points');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [season, setSeason] = useState(2025); 
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/api/wrs/?season=${season}`)
      .then(res => { setPlayers(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [season]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...players].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const itemsPerPage = 20;
  const startIdx = (page - 1) * itemsPerPage;
  const paginatedPlayers = sorted.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  const arrow = (key) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="wrs-container">
      <div className="wrs-header">
  <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
  <div>
    <h1>Wide Receivers <select
      value={season}
      onChange={(e) => { setSeason(Number(e.target.value)); setPage(1); }}
      className="season-select"
    >
      <option value={2021}>2021</option>
      <option value={2022}>2022</option>
      <option value={2023}>2023</option>
      <option value={2024}>2024</option>
      <option value={2025}>2025</option>
    </select></h1>
  </div>
</div>

      <div className="table-wrapper">
        <table className="wrs-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Team</th>
              <th onClick={() => handleSort('games_played')} className="sortable">GP{arrow('games_played')}</th>
              <th onClick={() => handleSort('receptions')} className="sortable">Rec{arrow('Receptions')}</th>
              <th onClick={() => handleSort('receiving_yards')} className="sortable">YDs{arrow('receiving_yards')}</th>
              <th onClick={() => handleSort('receiving_tds')} className="sortable">TDs{arrow('receiving_tds')}</th>
              <th onClick={() => handleSort('fantasy_points')} className="sortable">FPTS{arrow('fantasy_points')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPlayers.map((p, i) => (
              <tr key={p.player_id} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
              <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img
                  src={p.headshot_url}
                  alt={p.player_display_name}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => e.target.style.display = 'none'}
                />
                  <span
                  className="player-name"
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => navigate(`/wrs/${encodeURIComponent(p.player_id)}/detail`)}
                >
                  {p.player_display_name}
                </span>
              </td>
                <td><span className="team-badge">{p.team}</span></td>
                <td>{p.games_played}</td>
                <td>{p.receptions}</td>
                <td>{p.receiving_yards}</td>
                <td className="highlight">{p.receiving_tds}</td>
                <td className="highlight">{parseFloat(p.fantasy_points).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default WRs;
