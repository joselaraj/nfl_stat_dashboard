import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import "../styles/WRs.css";

// ── palette ──────────────────────────────────────────────────────────────────
const C = {
  rec:   "#00adb5",  // teal   — receptions / volume
  td:    "#2dc653",  // green  — touchdowns
  fpts:  "#ffb703",  // gold   — fantasy
  ypr:   "#8ecae6",  // blue   — efficiency
  muted: "#5e6975",
};

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n, dec = 0) =>
  n == null ? "—" : Number(n).toLocaleString(undefined, {
    minimumFractionDigits: dec, maximumFractionDigits: dec,
  });

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0", fontSize: 12 }}>
          {p.name}: <strong>{fmt(p.value, 1)}</strong>
        </p>
      ))}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
function WRDetail() {
  const { player_id } = useParams();
  const navigate = useNavigate();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeTab, setActiveTab] = useState("charts");

  useEffect(() => {
    if (!player_id) return;
    setLoading(true);
    axios
      .get(`http://127.0.0.1:8000/api/wrs/${encodeURIComponent(player_id)}/detail/`)
      .then((res) => { setData(res.data); setError(null); })
      .catch((err) => { console.error(err); setError("Unable to load player details."); })
      .finally(() => setLoading(false));
  }, [player_id]);

  if (loading) return <div className="loading">Loading player details…</div>;
  if (error)   return <div className="loading">{error}</div>;
  if (!data)   return <div className="loading">Player not found.</div>;

  // ── derived chart data ────────────────────────────────────────────────────
  const chartData = [...data.seasons]
    .sort((a, b) => a.season - b.season)
    .map((s) => {
      const rec     = Number(s.receptions || 0);
      const recvYds = Number(s.receiving_yards || 0);
      const fpts    = Number(s.fantasy_points || 0);
      const gp      = Number(s.games_played || 1);

      return {
        season:           String(s.season),
        team:             s.team,
        games_played:     gp,
        receptions:       rec,
        receiving_yards:  recvYds,
        receiving_tds:    Number(s.receiving_tds || 0),
        ypr:              rec > 0 ? parseFloat((recvYds / rec).toFixed(1)) : 0,
        yards_per_game:   parseFloat((recvYds / gp).toFixed(1)),
        fantasy_pts:      fpts,
        fantasy_per_game: parseFloat((fpts / gp).toFixed(1)),
      };
    });

  const { career, player_display_name, headshot_url } = data;
  const teams = [...new Set(data.seasons.map((s) => s.team).filter(Boolean))];
  const maxYards = Math.max(...chartData.map((d) => d.receiving_yards));

  const careerYPR = career.receptions > 0
    ? (career.receiving_yards / career.receptions).toFixed(1) : "—";

  const careerCards = [
    { label: "Rec yards",   value: fmt(career.receiving_yards),   sub: `${fmt(career.receptions)} receptions` },
    { label: "Rec TDs",     value: fmt(career.receiving_tds),     sub: "" },
    { label: "YPR",         value: careerYPR,                     sub: "yards per reception" },
    { label: "Games",       value: fmt(career.games_played),      sub: "" },
    { label: "Fantasy pts", value: fmt(career.fantasy_points, 1),
      sub: `${career.games_played > 0 ? (career.fantasy_points / career.games_played).toFixed(1) : "—"} / game` },
  ];

  return (
    <div className="wrs-container">

      {/* ── header ── */}
      <div className="qbs-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="player-identity">
          {headshot_url && (
            <img
              src={headshot_url}
              alt={player_display_name}
              className="player-headshot"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <div>
            <h1>{player_display_name}</h1>
            <div className="chip-row">
              {teams.map((t) => <span key={t} className="team-chip">{t}</span>)}
              <span className="team-chip">{data.seasons.length} seasons</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── career stat cards ── */}
      <div className="stat-card-grid">
        {careerCards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      {/* ── tabs ── */}
      <div className="tab-row">
        {["charts", "table"].map((t) => (
          <button
            key={t}
            className={`tab-btn${activeTab === t ? " active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t === "charts" ? "Season charts" : "Season log"}
          </button>
        ))}
      </div>

      {/* ── charts tab ── */}
      {activeTab === "charts" && (
        <div className="chart-grid">

          {/* 1 — receiving yards bar, highlight career best */}
          <div className="chart-card chart-card--wide">
            <h3>Receiving yards by season</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="receiving_yards" name="Rec yards" radius={[3,3,0,0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.season}
                      fill={entry.receiving_yards === maxYards ? C.fpts : C.rec}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="chart-note">Gold bar = career-best season.</p>
          </div>

          {/* 2 — receptions trend line */}
          <div className="chart-card">
            <h3>Receptions over time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="receptions" name="Receptions"
                  stroke={C.rec} strokeWidth={2.5}
                  dot={{ r: 4, fill: C.rec }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 3 — yards per reception */}
          <div className="chart-card">
            <h3>Yards per reception</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={12} stroke={C.muted} strokeDasharray="4 4"
                  label={{ value: "avg 12", fill: C.muted, fontSize: 11 }} />
                <Line type="monotone" dataKey="ypr" name="YPR"
                  stroke={C.ypr} strokeWidth={2.5}
                  dot={{ r: 4, fill: C.ypr }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 4 — receiving TDs */}
          <div className="chart-card">
            <h3>Receiving TDs</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="receiving_tds" name="Rec TDs" fill={C.td} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 5 — fantasy points per game */}
          <div className="chart-card">
            <h3>Fantasy points per game</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="fantasy_per_game" name="Fant pts/game"
                  stroke={C.fpts} strokeWidth={2.5}
                  dot={{ r: 4, fill: C.fpts }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 6 — YPR vs yards/game scatter */}
          <div className="chart-card chart-card--wide">
            <h3>Efficiency vs volume: YPR vs yards per game</h3>
            <ResponsiveContainer width="100%" height={240}>
              <ScatterChart margin={{ top: 12, right: 24, bottom: 24, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" />
                <XAxis
                  dataKey="yards_per_game" name="Yds/game" type="number"
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11, fill: C.muted }}
                  label={{ value: "Yards per game", position: "insideBottom", offset: -12, fill: C.muted, fontSize: 11 }}
                />
                <YAxis
                  dataKey="ypr" name="YPR" type="number"
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11, fill: C.muted }}
                  label={{ value: "Yards / rec", angle: -90, position: "insideLeft", fill: C.muted, fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="chart-tooltip">
                        <p className="tooltip-label">{d.season} · {d.team}</p>
                        <p style={{ fontSize: 12, margin: "2px 0" }}>Yds/game: <strong>{d.yards_per_game}</strong></p>
                        <p style={{ fontSize: 12, margin: "2px 0" }}>YPR: <strong>{d.ypr}</strong></p>
                        <p style={{ fontSize: 12, margin: "2px 0" }}>Rec yds: <strong>{d.receiving_yards.toLocaleString()}</strong></p>
                      </div>
                    );
                  }}
                />
                <Scatter data={chartData} name="Season">
                  {chartData.map((entry) => (
                    <Cell key={entry.season} fill={C.ypr} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <p className="chart-note">High YPR + high volume = elite season. Hover each dot for details.</p>
          </div>

        </div>
      )}

      {/* ── season log tab ── */}
      {activeTab === "table" && (
        <div style={{ marginTop: "1rem" }}>
          <div className="table-wrapper">
            <table className="qbs-table">
              <thead>
                <tr>
                  <th>Season</th><th>Team</th><th>GP</th>
                  <th>REC</th><th>Rec YDS</th><th>YPR</th>
                  <th>Yds/G</th><th>TD</th><th>FPTS</th><th>FPTS/G</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((s, i) => (
                  <tr key={s.season} className={i % 2 === 0 ? "row-even" : "row-odd"}>
                    <td>{s.season}</td>
                    <td><span className="team-badge">{s.team}</span></td>
                    <td>{s.games_played}</td>
                    <td>{s.receptions}</td>
                    <td>{s.receiving_yards.toLocaleString()}</td>
                    <td>{s.ypr}</td>
                    <td>{s.yards_per_game}</td>
                    <td>{s.receiving_tds}</td>
                    <td className="highlight">{s.fantasy_pts.toFixed(1)}</td>
                    <td>{s.fantasy_per_game}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-wrapper" style={{ marginTop: "0.75rem" }}>
            <table className="qbs-table">
              <thead>
                <tr>
                  <th>Career totals</th><th>GP</th>
                  <th>REC</th><th>Rec YDS</th><th>YPR</th><th>TD</th><th>FPTS</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-odd">
                  <td>{player_display_name}</td>
                  <td>{career.games_played}</td>
                  <td>{career.receptions}</td>
                  <td>{Number(career.receiving_yards).toLocaleString()}</td>
                  <td>{careerYPR}</td>
                  <td>{career.receiving_tds}</td>
                  <td className="highlight">{parseFloat(career.fantasy_points).toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default WRDetail;
