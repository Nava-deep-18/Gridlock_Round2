# 🚗 Approach Strategy: AI-Driven Parking Intelligence for Bengaluru

## Current Implementation Status

### Completed So Far

- Core pipeline is implemented in `src/`.
- PICI scoring is fixed and now produces nonzero congestion-impact scores.
- Historical feature output is generated in `data/processed/historical/featured_violations.parquet`.
- DBSCAN hotspot detection is implemented and generates ranked hotspots.
- XGBoost patrol-window prediction is implemented and generates patrol recommendations.
- Pipeline sanity checks are added so broken outputs, missing columns, empty data, or all-zero impact scores fail early.
- Historical processed output currently contains:
  - 115,353 approved violation rows
  - 211 detected hotspots
  - 35,448 patrol recommendation windows
- Backend has been modularized into a FastAPI package under `backend/app/`.
- Backend currently supports:
  - `GET /api/health`
  - `GET /api/stats`
  - `GET /api/hotspots`
  - `GET /api/recommendations`
  - `POST /api/upload`
- Backend supports two modes:
  - `historical`
  - `new_data`

### Still Pending

- Test `/api/upload` end-to-end with `sample_data/sample_upload.csv`.
- Add upload guardrails for file size, row count, and clearer schema errors.
- Add richer dashboard endpoints for station, temporal, vehicle, and repeat-offender summaries.
- Build the React/Vite frontend dashboard.
- Deploy backend and frontend.

---

## 1. Understanding the Dataset

The provided CSV ([given.csv](file:///c:/programming/Gridlock_Round2/data/raw/given.csv)) contains **~298,451 parking violation records** from Bengaluru Traffic Police (BTP), spanning roughly **November 2023 to mid-2024**.

### Columns Available (24 total)

| Column | What It Contains | Usefulness |
|---|---|---|
| `id` | Unique violation ID (anonymized) | Record identifier |
| `latitude`, `longitude` | GPS coordinates of violation | **🔥 Critical** — enables geospatial hotspot mapping |
| `location` | Full address string (road, area, pin code) | **🔥 Critical** — human-readable location context |
| `vehicle_number` | Anonymized vehicle plate | Repeat offender analysis |
| `vehicle_type` | CAR, SCOOTER, TANKER, AUTO, etc. | **Important** — vehicle profile analysis |
| `violation_type` | JSON array: "WRONG PARKING", "NO PARKING", "DOUBLE PARKING", "PARKING IN MAIN ROAD", "PARKING NEAR BUSTOP/SCHOOL/HOSPITAL", "PARKING OPPOSITE ANOTHER VEHICLE", "PARKING NEAR ROAD CROSSING" | **🔥 Critical** — violation severity classification |
| `offence_code` | Numeric codes (107–113) | Maps to violation types |
| `created_datetime` | When violation was recorded | **🔥 Critical** — temporal pattern analysis |
| `closed_datetime` | When resolved (mostly NULL) | Enforcement gap indicator |
| `modified_datetime` | Record modification time | Processing lag analysis |
| `device_id` | Capturing device (anonymized) | Device/camera coverage analysis |
| `created_by_id` | Officer/user who created record | Enforcement resource analysis |
| `center_code` | Numeric traffic center code | Jurisdiction mapping |
| `police_station` | Station name (Madiwala, Bellandur, etc.) | **Important** — jurisdiction-level analysis |
| `junction_name` | Junction or "No Junction" (e.g., "BTP044 - Sagar Theatre Junction") | **🔥 Critical** — intersection-level impact |
| `data_sent_to_scita` | TRUE/FALSE | Data pipeline completeness |
| `validation_status` | approved / rejected / NULL | **Important** — data quality filtering |
| `validation_timestamp` | When validated | Enforcement response time |

### Key Data Observations

- **Violation types are JSON arrays** — one record can have multiple violations (e.g., WRONG PARKING + PARKING IN MAIN ROAD + DOUBLE PARKING), meaning a single vehicle can compound congestion impact
- **"No Junction" is common** — many violations happen mid-block, not at intersections
- **validation_status** has three values: `approved`, `rejected`, `NULL` — we should focus on `approved` for reliable analysis
- **GPS coordinates are precise** — enables clustering and heatmap generation
- **Police stations** provide a natural jurisdictional grouping for enforcement prioritization
- **Time spans ~7 months** — enough for temporal pattern discovery (hourly, daily, weekly, monthly)

---

## 2A. MapMyIndia Situation & Mapping Strategy

> [!WARNING]
> **MapMyIndia was listed as a hackathon partner** and was supposed to provide "proprietary mapping technology and localized traffic intelligence." However, **no MapMyIndia API key, SDK, or data was actually provided** to participants.

### What We Do Instead

**We use Leaflet.js + OpenStreetMap (OSM) tiles** — which is completely free, open-source, and requires no API key.

| Aspect | MapMyIndia (Not Given) | Leaflet.js + OpenStreetMap (Our Approach) |
|---|---|---|
| **Map tiles** | Proprietary India maps | Free OSM tiles — Bengaluru coverage is excellent |
| **Cost** | Paid API | Completely free |
| **Heatmap support** | Via their SDK | Leaflet.heat plugin — works perfectly |
| **Marker clustering** | Via their SDK | Leaflet.markercluster plugin — industry standard |
| **Offline capability** | No | Can self-host tiles if needed |
| **Customization** | Limited to their API | Full control over styling, layers, interactions |

> [!IMPORTANT]
> **Key decision: Do NOT mention MapMyIndia in the submission** as a tool we used (since we didn't receive it). Also do NOT complain about it. Simply build with Leaflet + OSM and let the quality speak for itself.

### Why This Is Actually Better for Our Use Case

- We have **GPS coordinates in the CSV** — that's all we need to plot on any map
- OSM tiles show Bengaluru roads, landmarks, and neighborhoods clearly
- Leaflet gives us **full programmatic control** over heatmap rendering, marker popups, layer toggling
- No dependency on a third-party API that could rate-limit or go down during the demo

### Mapping Libraries We'll Use

1. **Leaflet.js** — core interactive map
2. **Leaflet.heat** — heatmap layer for violation density
3. **Leaflet.markercluster** — clustered markers for individual violations
4. **OpenStreetMap tiles** — `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`

---

## 2. The Problem We're Solving

> **"How can AI-driven parking intelligence detect illegal parking hotspots and quantify their impact on traffic flow to enable targeted enforcement?"**

Breaking this down into 3 sub-problems:

| Sub-Problem | What It Means |
|---|---|
| **Detect hotspots** | Cluster violations geospatially to find where parking violations concentrate |
| **Quantify congestion impact** | Score each hotspot based on violation severity, frequency, road type, and proximity to junctions |
| **Enable targeted enforcement** | Rank zones, recommend patrol schedules, and visualize actionable intelligence for BTP |

---

## 3. Proposed Approach (Strictly Using Only the Provided Dataset)

> [!IMPORTANT]
> Per the FAQs: *"Participants must use only the datasets provided by HackerEarth. The use of external datasets may result in disqualification."*
> 
> This means **NO external traffic flow data, NO Google Maps API congestion data, NO OpenStreetMap road classification data**. Everything must be derived from the CSV itself.

### Phase 1: Data Preprocessing & Feature Engineering

From the raw dataset, we can engineer the following features **entirely from the provided data**:

| Engineered Feature | How to Derive | Purpose |
|---|---|---|
| **Violation Severity Score** | Weight each violation type (DOUBLE PARKING > PARKING IN MAIN ROAD > WRONG PARKING > NO PARKING, etc.) | Quantify per-record congestion impact |
| **Multi-Violation Multiplier** | Count of violation types per record (a record with 6 violations is worse than one with 1) | Compound impact scoring |
| **Vehicle Size Factor** | TANKER/BUS > CAR/MAXI-CAB > AUTO > SCOOTER/MOTORCYCLE | Larger vehicles cause more blockage |
| **Junction Proximity Flag** | Binary: is `junction_name` a named junction vs "No Junction"? | Junction violations are far more impactful |
| **Temporal Features** | Hour of day, day of week, month from `created_datetime` | Peak-hour and pattern detection |
| **Geospatial Grid Cells** | Round lat/lng to create grid cells for clustering | Spatial aggregation |
| **Repeat Location Score** | Count of violations at same (rounded) GPS coordinate | Chronic hotspot identification |
| **Enforcement Response Time** | Gap between `created_datetime` and `validation_timestamp` | Identifies under-enforced zones |
| **Validation Rate by Area** | Ratio of approved vs total by police_station | Enforcement effectiveness |

### Phase 2: AI/ML Components

#### A. Hotspot Detection (Unsupervised Clustering)
- **DBSCAN or HDBSCAN** on lat/lng coordinates to find spatial clusters of violations
- Why DBSCAN? It finds clusters of arbitrary shape (parking violations follow road geometry, not circles), doesn't need pre-specified K, and identifies noise/outliers
- Each cluster = a parking violation hotspot

#### B. Congestion Impact Score (Composite Scoring Model)
Since we don't have actual traffic flow data (and can't use external data), we **derive a proxy congestion impact score** for each hotspot:

$$\text{Impact Score} = \sum_{i \in \text{hotspot}} \left( w_1 \cdot \text{SeverityScore}_i + w_2 \cdot \text{VehicleSizeFactor}_i + w_3 \cdot \text{JunctionFlag}_i + w_4 \cdot \text{PeakHourFlag}_i \right) \times \text{FrequencyMultiplier}$$

This is a **data-driven heuristic** that doesn't need external data but logically quantifies impact:
- DOUBLE PARKING on a main road near a junction during peak hour = **very high impact**
- A scooter in NO PARKING zone mid-block at 3 AM = **low impact**

#### C. Temporal Pattern Prediction (Time-Series / Classification)
- Use historical patterns to **predict** when and where violations are most likely to occur
- Train a model (e.g., XGBoost/Random Forest) to predict: given (location cluster, hour, day_of_week, month) → expected violation count and severity
- This enables **proactive deployment** of enforcement resources

#### D. Repeat Offender Detection
- Analyze `vehicle_number` to identify chronic repeat offenders
- Flag vehicles with multiple violations across different locations (they contribute disproportionately to congestion)

### Phase 3: Prototype — Interactive Dashboard / Web App

The deliverable should be a **working interactive prototype** that a BTP officer could use:

| Dashboard Component | What It Shows |
|---|---|
| **Violation Heatmap** | Geospatial heatmap of Bengaluru showing violation density, color-coded by congestion impact score |
| **Top Hotspots Ranked** | Table/list of top N hotspots ranked by AI-computed congestion impact score |
| **Temporal Patterns** | Charts showing violation patterns by hour, day, month — when are violations worst? |
| **Enforcement Prioritization Panel** | Recommended patrol zones with priority ranking, optimal patrol times, and expected impact reduction |
| **Police Station Dashboard** | Per-station breakdown of violations, enforcement response times, and under-served areas |
| **Junction Impact View** | Which junctions have the worst parking-induced congestion? |
| **Vehicle Type Analysis** | Breakdown by vehicle type — which vehicles cause the most congestion? |
| **Repeat Offender Alerts** | Flagged vehicles with repeated violations |

---

## 4. What Makes This Approach Stand Out (For Jury)

The jury (BTP + Flipkart) evaluates on: **feasibility, relevance, innovation, and real-world impact**.

| Evaluation Criteria | How We Score Well |
|---|---|
| **Feasibility** | Uses ONLY the provided dataset. No external APIs or data. Python-based, reproducible. |
| **Relevance** | Directly addresses BTP's operational challenge: reactive patrol → data-driven targeted enforcement |
| **Innovation** | Composite AI scoring (clustering + severity weighting + temporal prediction) creates a congestion impact metric that doesn't exist today |
| **Real-World Impact** | Actionable output: "Deploy patrol at Koramangala 2nd Block, Mon–Fri 9–11 AM, expected to address 340 violations/month with impact score 8.7/10" |

---

## 5. Tech Stack (FINALIZED)

| Layer | Technology | Why |
|---|---|---|
| **Backend** | **FastAPI (Python)** | Serves processed data + accepts new CSV uploads for reprocessing |
| **Data Processing** | Pandas, NumPy | Standard, fast, reproducible |
| **ML/AI** | Scikit-learn (DBSCAN/HDBSCAN), XGBoost | Lightweight, no GPU needed |
| **Frontend** | **React + Vite** | Component-based, clean code for repo review by judges |
| **Maps** | **react-leaflet + OpenStreetMap tiles** | Free, no API key, full control (MapMyIndia was NOT provided) |
| **Charts** | **Recharts** or Chart.js | React-native charting, rich interactive visualizations |
| **Frontend Hosting** | **Vercel** (free tier) | Always-on, auto-deploys from GitHub, no sleep |
| **Backend Hosting** | **Render** or **Railway** (free tier) | Python support, free, handles FastAPI |

> [!IMPORTANT]
> **No Streamlit.** It goes to sleep on free tier — bad for judges checking the demo link.
> **No Folium.** We use react-leaflet since frontend is React-based.
> **No MapMyIndia.** Was never provided — using Leaflet + OSM instead.

---

## 6. Submission Checklist (From the Screenshots)

All of these are **mandatory** (marked with red asterisks):

| Field | What to Prepare |
|---|---|
| **Title** | e.g., "ParkSense AI — Intelligent Parking Violation Hotspot Detection & Congestion Impact Scoring for BTP" |
| **Description** | Problem → Approach → AI Models → Results → Impact |
| **Theme** | Select the parking/congestion theme |
| **Snapshots** | Screenshots of the dashboard (heatmap, charts, tables) |
| **Video URL** | 3–5 min demo video (Loom/YouTube unlisted) |
| **Presentation** | Pitch deck (PPT/PDF, <50MB) |
| **Demo Link** | Live hosted URL of the prototype |
| **Repository URL** | GitHub repo link |
| **Source Code** | ZIP of source code (<50MB) |
| **Instructions to Run** | Step-by-step: clone → install deps → run |

---

## 7. Timeline (You Have ~4 Days Left)

> Deadline: **June 21, 2026 at 11:59 PM IST**

| Day | Focus |
|---|---|
| **Day 1 (Today, June 17)** | Finalize approach, data preprocessing, feature engineering |
| **Day 2 (June 18)** | ML models (clustering, scoring, temporal prediction), generate results |
| **Day 3 (June 19)** | Build interactive dashboard/web app prototype |
| **Day 4 (June 20)** | Polish UI, create pitch deck, record demo video |
| **Day 5 (June 21)** | Final testing, deploy, submit before 11:59 PM |

---

## 8. Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| **"No actual traffic flow data"** | Frame the congestion impact as a **proxy score derived from violation characteristics** — this is the innovation, not a limitation |
| **"Dataset is anonymized"** | Doesn't affect geospatial or temporal analysis — we have real coordinates and timestamps |
| **"~110MB CSV is large"** | Filter to `validation_status = 'approved'` early to reduce noise; process in chunks if needed |
| **"closed_datetime is mostly NULL"** | This itself is a finding — enforcement follow-through is weak, reinforcing the need for prioritization |
| **"No external data allowed"** | All features are engineered from within the dataset — we're fully compliant |

---

## 9. Congestion Impact Logic — The Core Innovation

Since we cannot use external traffic data, our **key innovation** is creating a **Parking-Induced Congestion Impact (PICI) Score** entirely from the violation data:

### Violation Severity Weights (proposed)

| Violation Type | Weight | Rationale |
|---|---|---|
| DOUBLE PARKING | 10 | Blocks a full lane |
| PARKING OPPOSITE TO ANOTHER PARKED VEHICLE | 9 | Creates pinch point, effectively blocks road |
| PARKING IN A MAIN ROAD | 8 | Main roads carry heavy traffic |
| PARKING NEAR ROAD CROSSING | 7 | Blocks intersection visibility and flow |
| PARKING NEAR BUSTOP/SCHOOL/HOSPITAL | 6 | High pedestrian + vehicle conflict zone |
| WRONG PARKING | 4 | General misplacement |
| NO PARKING | 3 | Designated zone violation (may not always block traffic) |

### Vehicle Size Multiplier

| Vehicle Type | Multiplier | Rationale |
|---|---|---|
| BUS / TANKER / TRUCK | 2.0 | Large footprint |
| CAR / MAXI-CAB | 1.5 | Medium footprint |
| PASSENGER AUTO | 1.2 | Small-medium |
| SCOOTER / MOTOR CYCLE | 1.0 | Smallest footprint |

### Temporal Multiplier
- **Peak hours (8–11 AM, 5–9 PM)**: × 1.5
- **Off-peak**: × 1.0

### Junction Multiplier
- **Named junction**: × 2.0 (junction violations cascade congestion)
- **No Junction**: × 1.0

This gives every single violation record a **quantified congestion impact score**, which when aggregated by location cluster, creates a **ranked hotspot priority list**.

> [!TIP]
> This scoring framework is the **centerpiece of the AI approach**. It's explainable, tunable, and directly actionable — exactly what BTP needs.

---

## 10. Full-Stack Architecture — WHAT WE ARE ACTUALLY BUILDING

> [!IMPORTANT]
> **We are NOT just making a static dashboard.** We are building a full-stack system with a FastAPI backend that can accept new data, reprocess it through our AI pipeline, and update the dashboard dynamically. This is what separates a "data analysis project" from a "real product."

### What the CSV Tells Us About BTP's Live Infrastructure

The dataset columns reveal that BTP **already has a live data pipeline**:

| Column Evidence | What It Proves |
|---|---|
| `device_id` (FKDEV00000, etc.) | BTP has **field devices/cameras** actively capturing violations right now |
| `created_by_id` (FKUSR00000, etc.) | **Officers** are logging violations in real-time into a system |
| `data_sent_to_scita = TRUE/FALSE` | There's a backend system called **SCITA** that receives violation data |
| `created_datetime` with timestamps | Records are generated **in real-time**, not batch-uploaded |
| `validation_status` workflow | There's an **approval pipeline** — someone reviews each violation |

This means the CSV is just a **historical export of a live system**. BTP generates this exact data every single day.

### What We're Building (Full End-to-End Pipeline)

```
┌─────────────────────────────────────────────────────┐
│  FASTAPI BACKEND (Python) — Deployed on Render      │
│                                                      │
│  MODE 1: Pre-loaded Results                          │
│  • 298K CSV already processed at build time          │
│  • Hotspots, PICI scores, temporal patterns ready    │
│  • API endpoints serve this data to the dashboard    │
│                                                      │
│  MODE 2: Upload New Data (LIVE REPROCESSING)         │
│  • BTP uploads a new CSV via the dashboard           │
│  • Backend receives the file                         │
│  • Runs the SAME AI pipeline:                        │
│    → Data cleaning & feature engineering             │
│    → DBSCAN clustering → new hotspots               │
│    → PICI score calculation → new rankings          │
│    → Temporal pattern analysis → new predictions    │
│  • Returns fresh results to the dashboard            │
│                                                      │
│  The AI code is IDENTICAL for both modes.            │
│  Only the data source changes (file vs upload).      │
└──────────────────┬──────────────────────────────────┘
                   │ API calls (JSON responses)
                   ↓
┌─────────────────────────────────────────────────────┐
│  REACT FRONTEND (Vite) — Deployed on Vercel          │
│                                                      │
│  • Loads pre-processed results on first visit        │
│  • Interactive dashboard with map, charts, tables    │
│  • "Upload New Data" button:                         │
│    → User selects a CSV file                        │
│    → Sends to FastAPI backend                       │
│    → Dashboard refreshes with NEW results           │
│  • Judge sees: "This actually processes new data!"   │
└─────────────────────────────────────────────────────┘
```

### Dashboard Mode Strategy — OPTION C (Two-Mode Toggle)

> [!IMPORTANT]
> **Decided:** The dashboard has TWO MODES with a visible toggle. This is the safest and most impressive approach.

| | Historical Mode | New Data Mode |
|---|---|---|
| **Data** | Pre-loaded 298K records (Nov 2023–May 2024) | Only the uploaded CSV file |
| **Hotspots** | Full Bengaluru coverage | Only stations in the uploaded file |
| **Use case** | Long-term strategic intelligence | This week's ground truth for deployment |
| **Speed** | Instant (pre-computed) | ~5–15 seconds (live processing) |
| **Always available** | ✅ Yes | ✅ After upload |

### What the Judge Experiences in the Demo

1. **Opens the dashboard** → lands in **Historical Mode** — sees rich 298K analysis (heatmap, charts, ranked hotspots)
2. **Explores freely** → interacts with filters, map layers, junction rankings, vehicle type charts
3. **Sees the toggle:** `[ 📊 Historical Mode ]  ←→  [ 📤 New Data Mode ]`
4. **Clicks "New Data Mode"** → prompted to upload a CSV
5. **Uploads `sample_upload.csv`** (200 rows, 7 stations, instant upload)
6. **Watches dashboard switch** → shows analysis of ONLY the uploaded 200 rows — different hotspots, different PICI scores
7. **Clicks back to "Historical Mode"** → full 298K dashboard returns instantly, unchanged
8. **Judge realizes:** *"This is two operational views on the same AI pipeline. This is a real product."*

### Upload Limits (enforced by FastAPI backend)

| Limit | Value | Reason |
|---|---|---|
| Max file size | 50 MB | Browser + server memory constraint |
| Max rows | 50,000 rows | DBSCAN performance on free-tier server |
| Schema check | Required columns must be present | Pipeline won't crash on wrong CSV |
| If exceeded | Returns clear error message to UI | Graceful failure, not crash |

> [!NOTE]
> For very large historical datasets (e.g. 10 years of BTP data — ~2GB), the production architecture would use a PostgreSQL database with incremental processing. Only new records (delta) get reprocessed each day, not the full history. This is what SCITA integration enables.

### Pitch Story for the Two-Mode Approach

> *"Our dashboard has two operational modes. Historical Mode gives BTP commanders long-term strategic intelligence — chronic hotspots, seasonal patterns, enforcement gaps across 298K validated violations. New Data Mode lets field supervisors upload this week's violation export and immediately see current hotspots and patrol recommendations. Same AI pipeline. Two operational views. In production, the manual upload is replaced by an automated SCITA feed — eliminating the upload step entirely."*

### Future Integrations (For Pitch Deck Only — NOT Built)

These are what we **present in the slide deck** as the production roadmap:

| Integration | What It Adds |
|---|---|
| **SCITA API connection** | Replace manual CSV upload with automated real-time data feed |
| **MapMyIndia traffic overlay** | Validate PICI scores against actual live traffic congestion |
| **CCTV video feeds + computer vision** | Automated violation detection without officer intervention |
| **Push alerts to patrol vehicles** | "High violation surge at Koramangala — deploy now" |
| **Citizen reporting integration** | Crowdsourced violation reports |
| **Smart parking sensors** | Occupancy-based parking intelligence |

### UI Touches in the Dashboard

- **"Data Source: BTP Historical Dataset (Nov 2023 – May 2024)"** label on main view
- **"📤 Upload New Data"** button — functional, actually processes new CSVs
- **"Last Processed"** timestamp that updates after upload
- **"🔮 Future: SCITA Live Feed"** subtle label showing the production path

### The Pitch Story

> *"We built a full-stack AI system — not just a dashboard. Our FastAPI backend processes parking violation data through DBSCAN clustering, PICI congestion impact scoring, and temporal prediction models. It comes pre-loaded with analysis of 298K real BTP violations, but it can also accept new data uploads and reprocess everything in real-time. In production, the manual upload is replaced with a SCITA API feed, and with MapMyIndia integration, we can validate our congestion scores against live traffic data."*

---

## 11. Key Reminders (DO NOT FORGET)

> [!CAUTION]
> These are non-negotiable constraints:

1. **ONLY use the provided CSV dataset** — no external datasets, no web scraping, no API calls for additional data
2. **MapMyIndia was NOT provided** — use Leaflet.js + OpenStreetMap tiles instead (free, no API key)
3. **Do NOT mention MapMyIndia** as a tool used in the submission
4. **Frame MapMyIndia as a future integration** in the pitch deck's production architecture
5. **Source code ZIP must be < 50MB** — the CSV itself is 110MB, so don't include it in the ZIP
6. **Submission deadline: June 21, 2026, 11:59 PM IST** — you can resubmit multiple times before this
7. **Top 10 teams go to Flipkart HQ finale on July 3** — the prototype must be impressive enough to make the cut
8. **Everything derived from the CSV** — the PICI score, hotspots, temporal patterns, all engineered from the data we have
