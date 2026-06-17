import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ReferenceLine, PieChart, Pie,
} from "recharts";
import "../styles/Kickers.css";

// ── palette ──────────────────────────────────────────────────────────────────
const C = {
  made:    "#2dc653",  // green  — made
  blocked:  "#ffb703",  // gold   — missed
  missed: "#e63946",  // red    — blocked
  pat:     "#00adb5",  // teal   — PAT
  gwfg:    "#c77dff",  // purple — game-winning
  muted:   "#5e6975",
};

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n, dec = 0) =>
  n == null ? "—" : Number(n).toLocaleString(undefined, {
    minimumFractionDigits: dec, maximumFractionDigits: dec,
  });

const pct = (made, att) =>
  att > 0 ? parseFloat(((made / att) * 100).toFixed(1)) : 0;

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

// ── custom label for pie chart ────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={500}>
      {(percent * 100).toFixed(0)}%
    </text>
  );
}

// ── main component ────────────────────────────────────────────────────────────
function KickerDetail() {
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
      .get(`http://127.0.0.1:8000/api/k/${encodeURIComponent(player_id)}/detail/`)
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
      const fgMade    = Number(s.fg_made    || 0);
      const fgAtt     = Number(s.fg_att     || 0);
      const fgMissed  = Number(s.fg_missed  || 0);
      const fgBlocked = Number(s.fg_blocked || 0);
      const patMade   = Number(s.pat_made   || 0);
      const patAtt    = Number(s.pat_att    || 0);
      const patMissed = Number(s.pat_missed || 0);
      const gwfgMade  = Number(s.gwfg_made  || 0);
      const gwfgDist  = Number(s.gwfg_distance || 0);
      const fpts      = Number(s.fantasy_points || 0);
      const gp        = Number(s.games_played || 1);

      return {
        season:       String(s.season),
        team:         s.team,
        games_played: gp,
        fg_made:      fgMade,
        fg_att:       fgAtt,
        fg_missed:    fgMissed,
        fg_blocked:   fgBlocked,
        fg_pct:       pct(fgMade, fgAtt),
        pat_made:     patMade,
        pat_att:      patAtt,
        pat_missed:   patMissed,
        pat_blocked:  Number(s.pat_blocked || 0),
        pat_pct:      pct(patMade, patAtt),
        fg_long:      Number(s.fg_long || 0),
        gwfg_made:    gwfgMade,
        gwfg_distance: gwfgDist,
        fantasy_pts:  fpts,
        fpts_per_game: parseFloat((fpts / gp).toFixed(1)),
      };
    });

  const { career, player_display_name, headshot_url } = data;
  const teams = [...new Set(data.seasons.map((s) => s.team).filter(Boolean))];

  const careerFgPct  = pct(career.fg_made,  career.fg_att);
  const careerPatPct = pct(career.pat_made, career.pat_att);
  const careerLong   = Math.max(...chartData.map((d) => d.fg_long));

  const careerCards = [
    { label: "FG %",       value: careerFgPct + "%",         sub: `${fmt(career.fg_made)}/${fmt(career.fg_att)} FGs` },
    { label: "PAT %",      value: careerPatPct + "%",        sub: `${fmt(career.pat_made)}/${fmt(career.pat_att)} PATs` },
    { label: "Long",       value: careerLong + " yds",       sub: "career longest FG" },
    { label: "GW FGs",     value: fmt(career.gwfg_made),     sub: "game-winning kicks" },
    { label: "Fantasy pts",value: fmt(career.fantasy_points, 1),
      sub: `${career.games_played > 0 ? (career.fantasy_points / career.games_played).toFixed(1) : "—"} / game` },
  ];

  // career pie data
  const pieMade    = career.fg_made    || 0;
  const pieMissed  = career.fg_missed  || 0;
  const pieBlocked = career.fg_blocked || 0;
  const pieData = [
    { name: "Made",    value: pieMade,    fill: C.made },
    { name: "Missed",  value: pieMissed,  fill: C.missed },
    { name: "Blocked", value: pieBlocked, fill: C.blocked },
  ].filter((d) => d.value > 0);

  return (
    <div className="kickers-container">

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

          {/* 1 — FG % trend — most important kicker chart */}
          <div className="chart-card chart-card--wide">
            <h3>Field goal % by season</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis domain={[60, 100]} unit="%" tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={85} stroke={C.muted} strokeDasharray="4 4"
                  label={{ value: "starter threshold 85%", fill: C.muted, fontSize: 11, position: "insideTopRight" }} />
                <ReferenceLine y={90} stroke={C.made} strokeDasharray="4 4"
                  label={{ value: "elite 90%", fill: C.made, fontSize: 11, position: "insideTopRight" }} />
                <Line
                  type="monotone" dataKey="fg_pct" name="FG %"
                  stroke={C.made} strokeWidth={2.5}
                  dot={({ cx, cy, payload }) => (
                    <circle
                      key={payload.season}
                      cx={cx} cy={cy} r={5}
                      fill={payload.fg_pct >= 90 ? C.made : payload.fg_pct >= 85 ? C.missed : C.blocked}
                      stroke="none"
                    />
                  )}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="chart-note">Green dot ≥ 90% · Gold dot ≥ 85% · Red dot below 85%.</p>
          </div>

          {/* 2 — FG made / missed / blocked stacked */}
          <div className="chart-card">
            <h3>FG outcomes by season</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="fg_made"    name="Made"    stackId="a" fill={C.made} />
                <Bar dataKey="fg_missed"  name="Missed"  stackId="a" fill={C.missed} />
                <Bar dataKey="fg_blocked" name="Blocked" stackId="a" fill={C.blocked} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 3 — career FG breakdown pie */}
          <div className="chart-card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h3>Career FG breakdown</h3>
            <PieChart width={200} height={200}>
              <Pie
                data={pieData}
                cx={100} cy={100}
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                labelLine={false}
                label={PieLabel}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v, name) => [v, name]} />
            </PieChart>
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: C.muted, marginTop: 4 }}>
              {pieData.map((d) => (
                <span key={d.name}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: d.fill, marginRight: 4 }} />
                  {d.name}
                </span>
              ))}
            </div>
          </div>

          {/* 4 — PAT accuracy trend */}
          <div className="chart-card">
            <h3>PAT % by season</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis domain={[80, 100]} unit="%" tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={95} stroke={C.muted} strokeDasharray="4 4"
                  label={{ value: "avg 95%", fill: C.muted, fontSize: 11 }} />
                <Line
                  type="monotone" dataKey="pat_pct" name="PAT %"
                  stroke={C.pat} strokeWidth={2.5}
                  dot={{ r: 4, fill: C.pat }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
            <p className="chart-note">Dips below 95% signal hold or snap issues — rarely the kicker alone.</p>
          </div>

          {/* 5 — longest FG per season */}
          <div className="chart-card">
            <h3>Longest FG by season</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis domain={[30, 65]} unit=" yd" tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={50} stroke={C.muted} strokeDasharray="4 4"
                  label={{ value: "50 yds", fill: C.muted, fontSize: 11 }} />
                <Bar dataKey="fg_long" name="Long (yds)" radius={[3,3,0,0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.season} fill={entry.fg_long >= 50 ? C.gwfg : C.pat} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="chart-note">Purple = 50+ yard kick.</p>
          </div>

          {/* 6 — game-winning FGs */}
          {chartData.some((d) => d.gwfg_made > 0) && (
            <div className="chart-card">
              <h3>Game-winning FGs</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData.filter((d) => d.gwfg_made > 0)} barCategoryGap="40%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                  <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                  <YAxis tick={{ fontSize: 11, fill: C.muted }} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="chart-tooltip">
                          <p className="tooltip-label">{d.season} · {d.team}</p>
                          <p style={{ fontSize: 12, color: C.gwfg }}>GW FGs: <strong>{d.gwfg_made}</strong></p>
                          {d.gwfg_distance > 0 && (
                            <p style={{ fontSize: 12, color: C.muted }}>Distance: <strong>{d.gwfg_distance} yds</strong></p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="gwfg_made" name="GW FGs" fill={C.gwfg} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="chart-note">Only seasons with at least one game-winning kick shown.</p>
            </div>
          )}

          {/* 7 — fantasy pts per game */}
          <div className="chart-card">
            <h3>Fantasy points per game</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f36" vertical={false} />
                <XAxis dataKey="season" tick={{ fontSize: 12, fill: C.muted }} />
                <YAxis tick={{ fontSize: 11, fill: C.muted }} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone" dataKey="fpts_per_game" name="Fant pts/game"
                  stroke={C.missed} strokeWidth={2.5}
                  dot={{ r: 4, fill: C.missed }} activeDot={{ r: 6 }} />
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
                  <th>FGM</th><th>FGA</th><th>FG%</th><th>Long</th>
                  <th>PAT</th><th>PAT Att</th><th>PAT%</th>
                  <th>GWFG</th><th>FPTS</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((s, i) => (
                  <tr key={s.season} className={i % 2 === 0 ? "row-even" : "row-odd"}>
                    <td>{s.season}</td>
                    <td><span className="team-badge">{s.team}</span></td>
                    <td>{s.games_played}</td>
                    <td>{s.fg_made}</td>
                    <td>{s.fg_att}</td>
                    <td style={{ color: s.fg_pct >= 90 ? C.made : s.fg_pct < 85 ? C.blocked : "inherit" }}>
                      {s.fg_pct}%
                    </td>
                    <td>{s.fg_long} yds</td>
                    <td>{s.pat_made}</td>
                    <td>{s.pat_att}</td>
                    <td style={{ color: s.pat_pct < 95 ? C.blocked : "inherit" }}>
                      {s.pat_pct}%
                    </td>
                    <td style={{ color: s.gwfg_made > 0 ? C.gwfg : "inherit" }}>
                      {s.gwfg_made > 0 ? `${s.gwfg_made} (${s.gwfg_distance} yds)` : "—"}
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
                  <th>FGM</th><th>FGA</th><th>FG%</th>
                  <th>PAT</th><th>PAT Att</th><th>PAT%</th>
                  <th>GWFG</th><th>FPTS</th>
                </tr>
              </thead>
              <tbody>
                <tr className="row-odd">
                  <td>{player_display_name}</td>
                  <td>{career.games_played}</td>
                  <td>{career.fg_made}</td>
                  <td>{career.fg_att}</td>
                  <td style={{ color: careerFgPct >= 90 ? C.made : careerFgPct < 85 ? C.blocked : "inherit" }}>
                    {careerFgPct}%
                  </td>
                  <td>{career.pat_made}</td>
                  <td>{career.pat_att}</td>
                  <td style={{ color: careerPatPct < 95 ? C.blocked : "inherit" }}>
                    {careerPatPct}%
                  </td>
                  <td style={{ color: career.gwfg_made > 0 ? C.gwfg : "inherit" }}>
                    {career.gwfg_made}
                  </td>
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

export default KickerDetail;