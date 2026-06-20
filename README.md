# NFL Stat Dashboard

A full-stack web application for exploring and visualizing NFL player statistics by position. Built with Django REST Framework, React, and MySQL.

![Python](https://img.shields.io/badge/Python-3.11+-blue) ![Django](https://img.shields.io/badge/Django-4.x-green) ![React](https://img.shields.io/badge/React-18-61DAFB) ![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

---

## Features

- Browse NFL player stats by position: **QBs, RBs, WRs, TEs, and Kickers**
- Player detail pages with headshots, stat cards, and season-by-season breakdowns
- Interactive charts powered by **Recharts** with custom tooltips
- Tabbed views switching between chart and table formats
- Data loaded via `nfl_data_py` / `nflreadpy` with Polars-based ingestion pipelines
- REST API built with Django REST Framework

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 6.0.6 + Django REST Framework |
| Frontend | React 18 + React Router + Recharts |
| Database | MySQL 8.0 |
| Data Ingestion | `nflreadpy`, Polars |
| Package Management | pip (backend), npm (frontend) |

---


## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- MySQL 8.0
- A MySQL database named `nfl_dashboard` (or your preferred name)

---

### Backend Setup

```bash
cd dashboard_project

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Mac/Linux
.venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Configure your database in nfl_dashboard/settings.py
# Update the DATABASES block with your MySQL credentials

# Run migrations
python manage.py migrate

# Load player data (run each command for the positions you want)
python manage.py load_qbs
python manage.py load_rbs
python manage.py load_wrs
python manage.py load_kickers
python manage.py load_tes

# Start the development server
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`.

---

### Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

The React app will be available at `http://localhost:5173/`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/qbs/` | List all QBs |
| GET | `/api/qbs/<player_id>/` | QB detail + season stats |
| GET | `/api/rbs/` | List all RBs |
| GET | `/api/rbs/<player_id>/` | RB detail + season stats |
| GET | `/api/wrs/` | List all WRs |
| GET | `/api/wrs/<player_id>/` | TE detail + season stats |
| GET | `/api/tes/` | List all TEs |
| GET | `/api/tes/<player_id>/` | WR detail + season stats |
| GET | `/api/kickers/` | List all Kickers |
| GET | `/api/kickers/<player_id>/` | Kicker detail + season stats |

---

## Data Ingestion

Player data is pulled using `nflreadpy` (a Python port of the R `nflreadr` package) and processed with **Polars** for fast aggregation. Each management command uses `update_or_create` keyed on `player_id` + `season` to allow safe re-runs without duplicates.

```bash
# Re-run any loader to refresh data
python manage.py load_kickers
```

---

## License

This project is open source and available under the [MIT License](LICENSE).
