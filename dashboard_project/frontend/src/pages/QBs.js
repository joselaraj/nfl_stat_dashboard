import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import '../styles/QBs.css';

function QBs() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState('fantasy_points');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [season, setSeason] = useState(2025); 
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/api/qbs/?season=${season}`)
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
    <div className="qbs-container">
      <div className="qbs-header">
  <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
  <div>
    <h1>Quarterbacks <select
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
        <table className="qbs-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Team</th>
              <th onClick={() => handleSort('games_played')} className="sortable">GP{arrow('games_played')}</th>
              <th onClick={() => handleSort('completions')} className="sortable">CMP{arrow('completions')}</th>
              <th onClick={() => handleSort('attempts')} className="sortable">ATT{arrow('attempts')}</th>
              <th onClick={() => handleSort('passing_yards')} className="sortable">YDS{arrow('passing_yards')}</th>
              <th onClick={() => handleSort('passing_tds')} className="sortable">TD{arrow('passing_tds')}</th>
              <th onClick={() => handleSort('passing_interceptions')} className="sortable">INT{arrow('passing_interceptions')}</th>
              <th onClick={() => handleSort('rushing_yards')} className="sortable">RUSH YDS{arrow('rushing_yards')}</th>
              <th onClick={() => handleSort('rushing_tds')} className="sortable">RUSH TD{arrow('rushing_tds')}</th>
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
                    onClick={() => navigate(`/qbs/${encodeURIComponent(p.player_id)}/detail`)}
                  >
                    {p.player_display_name}
                  </span>
              </td>
                <td><span className="team-badge">{p.team}</span></td>
                <td>{p.games_played}</td>
                <td>{p.completions}</td>
                <td>{p.attempts}</td>
                <td className="highlight">{p.passing_yards}</td>
                <td>{p.passing_tds}</td>
                <td>{p.passing_interceptions}</td>
                <td>{p.rushing_yards}</td>
                <td>{p.rushing_tds}</td>
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

export default QBs;
