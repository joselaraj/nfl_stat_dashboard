import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";
import "../styles/QBs.css";

// ── palette ────────────────────────────────────────────────────────────
const C = {
  teal:   "#00adb5",
  gold:   "#ffb703",
  blue:   "#8ecae6",
  red:    "#e63946",
  green:  "#2dc653",
  muted:  "#5e6975",
};

// ── tiny helpers ───────────────────────────────────────────────────────────
const fmt = (n, dec = 0) =>
  n == null ? "—" : Number(n).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });

function StatCard({ label, value, sub }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  );
}

// ── custom tooltip ──────────────────────────────────────────────────────────
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

// ── main component ──────────────────────────────────────────────────────────
function QBDetail() {
  const { player_id } = useParams();
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [activeTab, setActiveTab] = useState("charts");

  useEffect(() => {
    if (!player_id) return;
    setLoading(true);
    api
      .get(`/api/qbs/${encodeURIComponent(player_id)}/detail/`)
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
      const att = Number(s.attempts || 0);
      const cmp = Number(s.completions || 0);
      const pyds = Number(s.passing_yards || 0);
      const ptds = Number(s.passing_tds || 0);
      const ints = Number(s.passing_interceptions || 0);
      return {
        season:        String(s.season),
        passing_yards: pyds,
        rushing_yards: Number(s.rushing_yards || 0),
        fantasy_pts:   Number(s.fantasy_points || 0),
        passing_tds:   ptds,
        rushing_tds:   Number(s.rushing_tds || 0),
        interceptions: ints,
        completion_pct: att > 0 ? parseFloat(((cmp / att) * 100).toFixed(1)) : 0,
        ypa:            att > 0 ? parseFloat((pyds / att).toFixed(2)) : 0,
        td_rate:        att > 0 ? parseFloat(((ptds / att) * 100).toFixed(2)) : 0,
        completions:   cmp,
        incompletions: Math.max(att - cmp, 0),
        attempts:      att,
        team:          s.team,
        games_played:  s.games_played,
      };
    });

  const { career, player_display_name, headshot_url } = data;
  const teams = [...new Set(data.seasons.map((s) => s.team).filter(Boolean))];

  const careerCards = [
    { label: "Pass yards",  value: fmt(career.passing_yards),              sub: `${fmt(career.attempts)} att` },
    { label: "Pass TDs",    value: fmt(career.passing_tds),                sub: `${fmt(career.passing_interceptions)} INT` },
    { label: "Comp %",      value: fmt(career.completion_pct, 1) + "%",    sub: `${fmt(career.completions)} cmp` },
    { label: "YPA",         value: fmt(career.yards_per_attempt, 2),       sub: "" },
    { label: "Rush yards",  value: fmt(career.rushing_yards),              sub: `${fmt(career.rushing_tds)} rush TD` },
    { label: "Fantasy pts", value: fmt(career.fantasy_points, 1),          sub: `${fmt(career.games_played)} games` },
  ];

  const tabs = ["charts", "table"];

  return (
    <div className="qbs-container">
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
              {teams.map((t) => (
                <span key={t} className="team-chip">{t}</span>
              ))}
              <span className="team-chip">{data.seasons.length} seasons</span>
            </div>
          </div>
        </div>
      </div>

      <div className="stat-card-grid">
        {careerCards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <div className="tab-row">
        {tabs.map((t) => (
          <button
            key={t}
            className={`tab-btn${activeTab === t ? " active" : ""}`}
            onClick={() => setActiveTab(t)}
          >
            {t === "charts" ? "Season charts" : "Season log"}
          </button>
        ))}
      </div>

      {activeTab === "charts" && (
        <div className="chart-grid">
          <div className="chart-card">
            <h3>Yards by season</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="passing_yards" name="Pass yds" fill={C.teal}  radius={[3,3,0,0]} />
                <Bar dataKey="rushing_yards" name="Rush yds" fill={C.green} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>TDs vs INTs</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="passing_tds"   name="Pass TD" fill={C.green} radius={[3,3,0,0]} />
                <Bar dataKey="rushing_tds"   name="Rush TD" fill={C.gold}  radius={[3,3,0,0]} />
                <Bar dataKey="interceptions" name="INT"     fill={C.red}   radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Completion % over time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis domain={[50, 80]} unit="%" tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={65} stroke={C.muted} strokeDasharray="4 4" label={{ value: "avg 65%", fill: C.muted, fontSize: 11 }} />
                <Line type="monotone" dataKey="completion_pct" name="Comp %" stroke={C.teal} strokeWidth={2.5} dot={{ r: 4, fill: C.teal }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Fantasy points over time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="fantasy_pts" name="Fantasy pts" stroke={C.gold} strokeWidth={2.5} dot={{ r: 4, fill: C.gold }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card chart-card--wide">
            <h3>Efficiency: YPA vs TD rate</h3>
            <ResponsiveContainer width="100%" height={240}>
              <ScatterChart margin={{ top: 16, right: 24, bottom: 16, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" />
                <XAxis dataKey="ypa" name="YPA" type="number" domain={["auto", "auto"]} tick={{ fontSize: 11, fill: C.muted }} label={{ value: "Yards per attempt", position: "insideBottom", offset: -8, fill: C.muted, fontSize: 11 }} />
                <YAxis dataKey="td_rate" name="TD rate" type="number" domain={["auto", "auto"]} tick={{ fontSize: 11, fill: C.muted }} label={{ value: "TD %", angle: -90, position: "insideLeft", fill: C.muted, fontSize: 11 }} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="chart-tooltip">
                      <p className="tooltip-label">{d.season}</p>
                      <p style={{ fontSize: 12, margin: "2px 0" }}>YPA: <strong>{d.ypa}</strong></p>
                      <p style={{ fontSize: 12, margin: "2px 0" }}>TD%: <strong>{d.td_rate}%</strong></p>
                    </div>
                  );
                }} />
                <Scatter data={chartData} name="Season">
                  {chartData.map((entry) => (
                    <Cell key={entry.season} fill={C.gold} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <p className="chart-note">Each dot = one season. Hover for details.</p>
          </div>
        </div>
      )}

      {activeTab === "table" && (
        <div style={{ marginTop: "1rem" }}>
          <div className="table-wrapper">
            <table className="qbs-table">
              <thead>
                <tr>
                  <th>Season</th><th>Team</th><th>GP</th>
                  <th>CMP</th><th>ATT</th><th>Comp%</th>
                  <th>YDS</th><th>YPA</th>
                  <th>TD</th><th>INT</th>
                  <th>Rush YDS</th><th>Rush TD</th>
                  <th>FPTS</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((s, i) => (
                  <tr key={s.season} className={i % 2 === 0 ? "row-even" : "row-odd"}>
                    <td>{s.season}</td>
                    <td><span className="team-badge">{s.team}</span></td>
                    <td>{s.games_played}</td>
                    <td>{s.completions}</td>
                    <td>{s.attempts}</td>
                    <td>{s.completion_pct}%</td>
                    <td>{s.passing_yards.toLocaleString()}</td>
                    <td>{s.ypa}</td>
                    <td>{s.passing_tds}</td>
                    <td>{s.interceptions}</td>
                    <td>{s.rushing_yards.toLocaleString()}</td>
                    <td>{s.rushing_tds}</td>
                    <td className="highlight">{s.fantasy_pts.toFixed(1)}</td>
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
                  <th>CMP</th><th>ATT</th><th>Comp%</th>
                  <th>YDS</th><th>YPA</th>
                  <th>TD</th><th>INT</th>
                  <th>Rush YDS</th><th>Rush TD</th>
                  <th>FPTS</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-odd">
                  <td>{player_display_name}</td>
                  <td>{career.games_played}</td>
                  <td>{career.completions}</td>
                  <td>{career.attempts}</td>
                  <td>{career.completion_pct}%</td>
                  <td>{Number(career.passing_yards).toLocaleString()}</td>
                  <td>{career.yards_per_attempt}</td>
                  <td>{career.passing_tds}</td>
                  <td>{career.passing_interceptions}</td>
                  <td>{Number(career.rushing_yards).toLocaleString()}</td>
                  <td>{career.rushing_tds}</td>
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

export default QBDetail;
