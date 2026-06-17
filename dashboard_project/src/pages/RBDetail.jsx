import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import "../styles/RBs.css";

// ── palette ─────────────────────────────────────────────────────────────────
const C = {
  rush:    "#00adb5",   // teal  — rushing
  recv:    "#ffb703",   // gold  — receiving
  td:      "#2dc653",   // green — touchdowns
  fumble:  "#e63946",   // red   — fumbles / risk
  epa:     "#8ecae6",   // blue  — EPA
  wopr:    "#c77dff",   // purple — WOPR / target share
  muted:   "#5e6975",
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

// ── main component ───────────────────────────────────────────────────────────
function RBDetail() {
  const { player_id } = useParams();
  const navigate = useNavigate();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [activeTab, setActiveTab] = useState("charts");

  useEffect(() => {
    if (!player_id) return;
    setLoading(true);
    axios
      .get(`http://127.0.0.1:8000/api/rbs/${encodeURIComponent(player_id)}/detail/`)
      .then((res) => { setData(res.data); setError(null); })
      .catch((err) => { console.error(err); setError("Unable to load player details."); })
      .finally(() => setLoading(false));
  }, [player_id]);

  if (loading) return <div className="loading">Loading player details…</div>;
  if (error)   return <div className="loading">{error}</div>;
  if (!data)   return <div className="loading">Player not found.</div>;

  // ── derived chart data ───────────────────────────────────────────────────
  const chartData = [...data.seasons]
    .sort((a, b) => a.season - b.season)
    .map((s) => {
      const carries        = Number(s.carries || 0);
      const rushYds        = Number(s.rushing_yards || 0);
      const rushTds        = Number(s.rushing_tds || 0);
      const targets        = Number(s.targets || 0);
      const receptions     = Number(s.receptions || 0);
      const recvYds        = Number(s.receiving_yards || 0);
      const recvTds        = Number(s.receiving_tds || 0);
      const yac            = Number(s.receiving_yards_after_catch || 0);
      const fumbleLost     = Number((s.rushing_fumbles_lost || 0) + (s.receiving_fumbles_lost || 0));
      const totalTouches   = carries + receptions;
      const rushFirstDowns = Number(s.rushing_first_downs || 0);
      const recvFirstDowns = Number(s.receiving_first_downs || 0);
      const gp             = Number(s.games_played || 1);

      return {
        season:          String(s.season),
        team:            s.team,
        games_played:    gp,
        // rushing
        carries,
        rushing_yards:   rushYds,
        rushing_tds:     rushTds,
        ypc:             carries > 0 ? parseFloat((rushYds / carries).toFixed(2)) : 0,
        rush_fd_rate:    carries > 0 ? parseFloat(((rushFirstDowns / carries) * 100).toFixed(1)) : 0,
        rushing_epa:     s.rushing_epa != null ? parseFloat(Number(s.rushing_epa).toFixed(3)) : null,
        // receiving
        targets,
        receptions,
        receiving_yards: recvYds,
        receiving_tds:   recvTds,
        yac,
        air_yards:       parseFloat((recvYds - yac).toFixed(1)),
        catch_rate:      targets > 0 ? parseFloat(((receptions / targets) * 100).toFixed(1)) : 0,
        // efficiency
        target_share:    s.target_share != null ? parseFloat((Number(s.target_share) * 100).toFixed(1)) : null,
        wopr:            s.wopr != null ? parseFloat(Number(s.wopr).toFixed(3)) : null,
        // combined
        total_yards:     rushYds + recvYds,
        total_tds:       rushTds + recvTds,
        fumbles_lost:    fumbleLost,
        total_touches:   totalTouches,
        // per game
        yards_per_game:  parseFloat(((rushYds + recvYds) / gp).toFixed(1)),
        fantasy_pts:     Number(s.fantasy_points || 0),
        fantasy_per_game: parseFloat((Number(s.fantasy_points || 0) / gp).toFixed(1)),
      };
    });

  const { career, player_display_name, headshot_url } = data;
  const teams = [...new Set(data.seasons.map((s) => s.team).filter(Boolean))];

  const careerTouches = (career.carries || 0) + (career.receptions || 0);
  const careerRushYPC = career.carries > 0
    ? (career.rushing_yards / career.carries).toFixed(2) : "—";
  const careerCatchRate = career.targets > 0
    ? ((career.receptions / career.targets) * 100).toFixed(1) + "%" : "—";

  const careerCards = [
    { label: "Rush yards",   value: fmt(career.rushing_yards),   sub: `${fmt(career.carries)} car · ${careerRushYPC} YPC` },
    { label: "Rush TDs",     value: fmt(career.rushing_tds),     sub: `${fmt(career.rushing_fumbles_lost || 0)} fum lost` },
    { label: "Rec yards",    value: fmt(career.receiving_yards), sub: `${fmt(career.receptions)}/${fmt(career.targets)} · ${careerCatchRate}` },
    { label: "Rec TDs",      value: fmt(career.receiving_tds),   sub: `${fmt(career.receiving_first_downs || 0)} 1st downs` },
    { label: "Total touches",value: fmt(careerTouches),           sub: `${fmt(career.games_played)} games` },
    { label: "Fantasy pts",  value: fmt(career.fantasy_points, 1), sub: `${career.games_played > 0 ? (career.fantasy_points / career.games_played).toFixed(1) : "—"} / game` },
  ];

  const tabs = ["charts", "table"];

  // ── rushing epa — filter nulls for the line chart
  const epaData = chartData.filter((d) => d.rushing_epa != null);
  const woprData = chartData.filter((d) => d.wopr != null || d.target_share != null);

  return (
    <div className="rbs-container">

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

      {/* ── charts tab ── */}
      {activeTab === "charts" && (
        <div className="chart-grid">

          {/* 1 — rushing vs receiving yards stacked bar */}
          <div className="chart-card chart-card--wide">
            <h3>Rushing vs receiving yards</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="rushing_yards"   name="Rush yds" stackId="a" fill={C.rush}  />
                <Bar dataKey="receiving_yards" name="Rec yds"  stackId="a" fill={C.recv} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 2 — carries vs targets (touch share) */}
          <div className="chart-card">
            <h3>Carries vs targets</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="carries" name="Carries" fill={C.rush} radius={[3,3,0,0]} />
                <Bar dataKey="targets" name="Targets" fill={C.recv} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 3 — yards per carry trend */}
          <div className="chart-card">
            <h3>Yards per carry</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis domain={[2, 7]} tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={4.2} stroke={C.muted} strokeDasharray="4 4"
                  label={{ value: "avg 4.2", fill: C.muted, fontSize: 11 }} />
                <Line type="monotone" dataKey="ypc" name="YPC"
                  stroke={C.rush} strokeWidth={2.5}
                  dot={{ r: 4, fill: C.rush }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 4 — TDs breakdown */}
          <div className="chart-card">
            <h3>Touchdowns by type</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="rushing_tds"   name="Rush TD" fill={C.rush} radius={[3,3,0,0]} />
                <Bar dataKey="receiving_tds" name="Rec TD"  fill={C.recv} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 5 — YAC vs air yards (receiving role breakdown) */}
          <div className="chart-card">
            <h3>Receiving: YAC vs air yards</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="yac"       name="YAC"       stackId="b" fill={C.recv} />
                <Bar dataKey="air_yards" name="Air yards" stackId="b" fill={C.epa} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 6 — fumbles lost vs total touches (ball security) */}
          <div className="chart-card">
            <h3>Ball security: fumbles lost</h3>
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 12, right: 24, bottom: 24, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" />
                <XAxis
                  dataKey="total_touches" name="Touches" type="number"
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11, fill: C.muted }}
                  label={{ value: "Total touches", position: "insideBottom", offset: -12, fill: C.muted, fontSize: 11 }}
                />
                <YAxis
                  dataKey="fumbles_lost" name="Fum lost" type="number"
                  domain={[0, "auto"]}
                  tick={{ fontSize: 11, fill: C.muted }}
                  allowDecimals={false}
                  label={{ value: "Fum lost", angle: -90, position: "insideLeft", fill: C.muted, fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="chart-tooltip">
                        <p className="tooltip-label">{d.season} · {d.team}</p>
                        <p style={{ fontSize: 12, margin: "2px 0" }}>Touches: <strong>{d.total_touches}</strong></p>
                        <p style={{ fontSize: 12, margin: "2px 0", color: C.fumble }}>Fum lost: <strong>{d.fumbles_lost}</strong></p>
                      </div>
                    );
                  }}
                />
                <Scatter data={chartData} name="Season">
                  {chartData.map((entry) => (
                    <Cell key={entry.season}
                      fill={entry.fumbles_lost > 1 ? C.fumble : C.rush} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <p className="chart-note">Red = 2+ fumbles lost that season.</p>
          </div>

          {/* 7 — rushing EPA trend (only if data available) */}
          {epaData.length > 0 && (
            <div className="chart-card">
              <h3>Rushing EPA per season</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={epaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                  <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                  <YAxis tick={{ fontSize: 11, fill: C.muted }} />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={0} stroke={C.muted} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="rushing_epa" name="Rush EPA"
                    stroke={C.epa} strokeWidth={2.5}
                    dot={{ r: 4, fill: C.epa }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="chart-note">Above zero = value added vs average. Below = value lost.</p>
            </div>
          )}

          {/* 8 — WOPR / target share trend (only if data available) */}
          {woprData.length > 0 && (
            <div className="chart-card">
              <h3>Target share & WOPR</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={woprData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                  <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                  <YAxis tick={{ fontSize: 11, fill: C.muted }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="target_share" name="Target share %"
                    stroke={C.recv} strokeWidth={2.5}
                    dot={{ r: 4, fill: C.recv }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="wopr" name="WOPR"
                    stroke={C.wopr} strokeWidth={2.5} strokeDasharray="5 3"
                    dot={{ r: 4, fill: C.wopr }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
              <p className="chart-note">Target share shown as %. WOPR combines target + air yards share.</p>
            </div>
          )}

          {/* 9 — fantasy points per game trend */}
          <div className="chart-card">
            <h3>Fantasy points per game</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="fantasy_per_game" name="Fant pts/game"
                  stroke={C.td} strokeWidth={2.5}
                  dot={{ r: 4, fill: C.td }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
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
                  <th>CAR</th><th>Rush YDS</th><th>YPC</th><th>Rush TD</th>
                  <th>TGT</th><th>REC</th><th>Rec YDS</th><th>Rec TD</th>
                  <th>Fum lost</th><th>FPTS</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((s, i) => (
                  <tr key={s.season} className={i % 2 === 0 ? "row-even" : "row-odd"}>
                    <td>{s.season}</td>
                    <td><span className="team-badge">{s.team}</span></td>
                    <td>{s.games_played}</td>
                    <td>{s.carries}</td>
                    <td>{s.rushing_yards.toLocaleString()}</td>
                    <td>{s.ypc}</td>
                    <td>{s.rushing_tds}</td>
                    <td>{s.targets}</td>
                    <td>{s.receptions}</td>
                    <td>{s.receiving_yards.toLocaleString()}</td>
                    <td>{s.receiving_tds}</td>
                    <td style={{ color: s.fumbles_lost > 1 ? C.fumble : "inherit" }}>
                      {s.fumbles_lost}
                    </td>
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
                  <th>CAR</th><th>Rush YDS</th><th>YPC</th><th>Rush TD</th>
                  <th>REC</th><th>Rec YDS</th><th>Rec TD</th><th>FPTS</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-odd">
                  <td>{player_display_name}</td>
                  <td>{career.games_played}</td>
                  <td>{career.carries}</td>
                  <td>{Number(career.rushing_yards).toLocaleString()}</td>
                  <td>{careerRushYPC}</td>
                  <td>{career.rushing_tds}</td>
                  <td>{career.receptions}</td>
                  <td>{Number(career.receiving_yards).toLocaleString()}</td>
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

export default RBDetail;