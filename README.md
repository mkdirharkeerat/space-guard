# 🛰️ Space-Guard — Orbital Collision Defense System

> **Smart India Hackathon 2026 · Problem Statement #17 — Space Debris Detection & Collision Avoidance**

<div align="center">

![Space-Guard Banner](https://img.shields.io/badge/Space--Guard-v2.1.0-00ff88?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![SIH](https://img.shields.io/badge/SIH-2026-ff6b35?style=for-the-badge)

**A real-time satellite conjunction risk assessment platform built on the same Foster/Alfano analytic Pc models used by ESA and NASA.**

[🚀 Live Dashboard](#running-locally) · [📖 How It Works](#how-it-works) · [🧪 Validation](#iridium-33--cosmos-2251-validation) · [🤝 Contributing](CONTRIBUTING.md)

</div>

---

## 🌍 The Problem

**27,000+ tracked objects** are in Earth's orbit, with **millions of debris fragments** moving at 7–8 km/s. A single collision can generate thousands of new fragments in a cascade known as **Kessler Syndrome** — permanently denying access to certain orbital shells.

Most existing student solutions plot satellite dots on a globe and print a "risk score" with no defined meaning. **Space-Guard is different.**

---

## ✨ What Makes Space-Guard Different

| Feature | Generic Approach | Space-Guard |
|---|---|---|
| **Screening** | Fixed time-step grid scan | Two-stage: altitude filter → numerical TCA minimization |
| **Probability of Collision (Pc)** | Mystery formula or none | Analytic 2D Gaussian integral (Foster/Alfano — used by ESA/NASA) |
| **ML Role** | "AI risk score" from thin air | Speed/triage layer — predicts Pc cheaply so full physics runs on a short list |
| **Validation** | Only synthetic data | Replays the **2009 Iridium 33 / Cosmos 2251** real-world collision |
| **Transparency** | Black box | Every assumption stated in UI tooltips and docs |

---

## 🏗️ Architecture

```
┌──────────────────────┐
│  CelesTrak (public)  │  → TLE catalogue (cached every 6h)
└────────┬─────────────┘
         ↓
┌────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                    │
│                                                        │
│  Ingestion → SGP4 Propagation → Screening              │
│               (skyfield)        Coarse → Fine TCA      │
│                                     ↓                  │
│  CW Maneuver ← ML Triage ← Analytic Pc Engine          │
│  Planner (SVD)  (sklearn)   (Foster/Alfano)            │
└───────────────────────────┬────────────────────────────┘
                            ↓  REST API
              ┌─────────────────────────┐
              │   Frontend Dashboard     │
              │   (Vanilla HTML/CSS/JS)  │
              │   · Conjunction table    │
              │   · Detail panel         │
              │   · Maneuver simulator   │
              │   · Historical replay    │
              └─────────────────────────┘
```

---

## 🔬 How It Works

### Stage 1 — TLE Ingestion & SGP4 Propagation
We source **Two-Line Element sets (TLEs)** from CelesTrak for every tracked object in orbit. Each TLE is propagated using the **SGP4 model** (accurate to ~1 km over 24 hours).

### Stage 2 — Conjunction Screening
A two-stage screening engine evaluates all object pairs over a 24–72 hour lookahead window:
1. **Coarse filter** — discard pairs outside the ±25 km altitude band
2. **Fine TCA search** — uses `scipy.optimize.minimize_scalar` to precisely locate the **Time of Closest Approach (TCA)**

### Stage 3 — Probability of Collision (Pc)
We model positional uncertainty (~500 m from TLEs) in the **B-plane** using an **Analytic 2D Isotropic Gaussian integral** (Foster/Alfano):

| Tier | Pc Threshold |
|---|---|
| 🔴 **Critical** | Pc > 1×10⁻⁴ |
| 🟠 **High** | Pc > 1×10⁻⁵ |
| 🟡 **Moderate** | Pc > 1×10⁻⁶ |
| 🟢 **Low** | Pc ≤ 1×10⁻⁶ |

### Stage 4 — Maneuver Planning (Clohessy-Wiltshire)
For Critical/High events, the **Clohessy-Wiltshire State Transition Matrix** computes the optimal impulsive burn using **SVD** to find the burn direction that maximises miss distance shift.

> **Key insight:** A 1 m/s burn **24h before TCA** creates ~14× more separation than the same burn 1h before TCA.

---

## 🧪 Iridium 33 / Cosmos 2251 Validation

On **February 10, 2009**, Iridium 33 and Cosmos 2251 collided at 789 km altitude over Siberia — the first accidental hypervelocity collision in history. Space-Guard, given only the pre-collision TLEs, correctly:

- ✅ Raised a **Critical alert** (Pc > 1×10⁻⁴)
- ✅ Located the TCA within ~15 minutes of the actual collision time
- ✅ Recommended a maneuver **48 hours** in advance

---

## 📁 Project Structure

```
space-guard/
├── backend/
│   └── app/
│       ├── api/main.py              # FastAPI app & endpoints
│       ├── ingestion/               # TLE fetcher & parser
│       ├── propagation/             # SGP4 propagator
│       ├── screening/               # Coarse filter + fine TCA search
│       ├── risk/                    # Analytic Pc + ML triage
│       ├── maneuver/                # Clohessy-Wiltshire planner
│       ├── validation/              # Iridium/Cosmos historical replay
│       └── config.py                # Constants & thresholds
├── data/tle_cache/                  # Cached TLE files
├── dashboard.html                   # Frontend (zero-dependency)
├── requirements.txt
├── verify_phase1-6.py               # Phase validation scripts
├── CONTRIBUTING.md
└── README.md
```

---

## 🚀 Running Locally

### Prerequisites
- Python 3.11+

### 1. Clone & enter the repo
```bash
git clone https://github.com/YOUR_USERNAME/space-guard.git
cd space-guard
```

### 2. Set up virtual environment
```bash
python3 -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Start the backend API
```bash
uvicorn backend.app.api.main:app --port 8000
```

### 5. Start the React Frontend (Vite)
```bash
cd frontend
npm install
npm run dev
```

### 6. Open the Mission Control Dashboard
Visit **http://localhost:5173** (or the zero-dependency fallback at `http://localhost:3000/dashboard.html`).

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check & ML status |
| `POST` | `/scan` | Run full two-stage conjunction pipeline |
| `GET` | `/api/objects` | Propagated GCRS coordinates for catalog satellites |
| `POST` | `/api/maneuver` | Clohessy-Wiltshire impulsive burn planner |
| `GET` | `/api/validation/iridium-cosmos` | 2009 Iridium/Cosmos collision validation replay |

### `POST /scan` — Example Response
```json
{
  "events": [
    {
      "target_id": "IRIDIUM 33",
      "chaser_id": "COSMOS 2251",
      "tca_utc": "2009-02-10 16:56:00 UTC",
      "miss_distance_km": 0.003,
      "relative_velocity_km_s": 14.1,
      "pc": 2.0e-4,
      "risk_tier": "Critical"
    }
  ]
}
```

---

## 🧑‍💻 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, Uvicorn |
| Orbital Mechanics | SGP4, Skyfield |
| Scientific Computing | NumPy, SciPy (minimize_scalar) |
| ML Triage | scikit-learn (Random Forest surrogate) |
| Frontend | React 19, Vite, Three.js, Tailwind CSS, Lucide Icons, Web Audio API |

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
Made with ❤️ for <strong>Smart India Hackathon 2026</strong>
</div>
