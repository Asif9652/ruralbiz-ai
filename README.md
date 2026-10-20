# RuralBiz AI — AI-Driven Hyper-Local Business Advisory & Concessional Financial Structuring

**Smart India Hackathon (SIH) — Problem Statement ID: 26091**  
*Ministry of Social Justice and Empowerment (MoSJE)*

---

## 🌾 Project Overview

**RuralBiz AI** is a fully functional 3D geospatial intelligence and financial structuring web platform engineered for rural micro-entrepreneurs across India. It bridges grassroots rural business discovery with institutional credit eligibility by connecting:

1. **3D Village Countryside Simulation:** Interactive Three.js rural environment featuring terraced hills, village habitat clusters, solar microgrids, and rotating wind turbines with reduced-motion accessibility and WebGL fallback.
2. **Real Geospatial Business Discovery:** Live OpenStreetMap / Overpass API integration querying listed businesses, competitors, suppliers, and artisans within a 5 km and 10 km radius.
3. **Official Demographic Data:** Authentic Census of India 2011 Primary Census Abstract (PCA) indicators covering population, households, literacy rates, and agricultural workforce.
4. **Agricultural Wholesale Mandi Prices:** AGMARKNET / Directorate of Marketing & Inspection (data.gov.in) price indices with transparent distinction between wholesale auction rates and village retail prices.
5. **Grassroots Participatory Survey Module:** Anonymous local survey collection stored in SQLite (`ruralbiz.db`) to record local customer habits and unmet needs.
6. **Statutory MoSJE Loan Structurer (SIH PS 26091):**
   - **Micro Finance Scheme:** Projects up to ₹1,40,000 | Max loan ₹1,25,000 | 6.5% p.a. | 3 years tenure | 3 months moratorium.
   - **Term Loan Scheme:** Projects >₹1,40,000 up to ₹50,00,000 | Max loan ₹45,00,000 | 8.0% p.a. | 7 years tenure | 6 months moratorium.
   - Tested mathematical amortization engine computing monthly EMI, quarterly installments, moratorium interest treatment, margin shortfalls, and ceiling warnings.
7. **AI-Driven Feasibility Report (DPR):** Synthesizes live evidence into five rigorously separated sections:
   - Section 1: Verified Sourced Observations
   - Section 2: Calculated Financial Results & Break-Even
   - Section 3: AI Strategic Advisory & SWOT Analysis
   - Section 4: Operating Cost Assumptions
   - Section 5: Unknown Information & Next Validation Steps
   - Print-friendly & PDF export support.
8. **Vernacular Accessibility:** Instant multilingual switching between **English (EN)**, **Tamil (த)**, and **Hindi (हि)** with text-to-speech audio guidance.
9. **Kage Precision Edition:** Preserves Google Stitch visual design fidelity and includes a toggle for the cinematic dark Sumi-e theme.

---

## 🚀 Quick Start Guide (Beginner-Friendly)

### 1. Prerequisites
- **Python 3.10+** (Python 3.13 is tested and working)
- **Modern Web Browser** (Chrome, Edge, Firefox, or Safari)

### 2. Install Dependencies
Open your PowerShell or terminal in the project root directory and run:
```bash
pip install fastapi uvicorn httpx pydantic
```

### 3. Run Financial Arithmetic Unit Tests
To verify all loan caps, margin requirements, and moratorium calculations:
```bash
python backend/tests/test_calculator.py
```
*Expected Output:*
```text
[PASS] test_micro_finance_scheme_boundary
[PASS] test_term_loan_scheme_mid
[PASS] test_term_loan_ceiling_50_lakh
[PASS] test_exceeding_ceiling_warning
[PASS] test_margin_shortfall_warning
[PASS] test_reverse_calculate_from_margin
ALL FINANCIAL ARITHMETIC UNIT TESTS PASSED SUCCESSFULLY!
```

### 4. Start the Application
Run the backend server (which also serves the frontend):
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Open your browser and navigate to:
👉 **`http://127.0.0.1:8000/`**

---

## 📂 Project Architecture

```text
├── backend/
│   ├── main.py                  # FastAPI gateway, routes, and static frontend mount
│   ├── ruralbiz.db              # SQLite database for surveys and saved reports
│   ├── services/
│   │   ├── calculator.py        # MoSJE statutory loan arithmetic & amortization engine
│   │   ├── geocoding.py         # Nominatim reverse geocoding & village search with cache
│   │   ├── osm_provider.py      # OpenStreetMap Overpass spatial competitor discovery
│   │   ├── census_provider.py   # Census of India 2011 PCA rural demographic data
│   │   ├── mandi_provider.py    # AGMARKNET wholesale commodity price indices
│   │   ├── survey_db.py         # SQLite survey persistence & privacy protection
│   │   └── advisory.py          # Evidence-grounded business feasibility generator
│   └── tests/
│       └── test_calculator.py   # Automated unit tests for boundary conditions
├── frontend/
│   ├── index.html               # Stitch visual design with 3D canvas, Leaflet map, tabs
│   ├── app.js                   # Client controller, 3D Three.js animation, GPS logic
│   └── translations.js          # Multilingual dictionary (English, Tamil, Hindi)
├── stitch_ruralbiz_.../         # Original Google Stitch export visual design source of truth
├── .env.example                 # Environment configuration template
└── README.md                    # Documentation & hackathon presentation guide
```

---

## 📡 Live API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | GET | Health status and SIH problem statement metadata |
| `/api/location/search?q={query}` | GET | Search Indian villages/taluks with candidate disambiguation |
| `/api/location/reverse-geocode?lat={lat}&lon={lon}` | GET | Reverse geocode coordinates to village, taluk, district, state |
| `/api/data/osm-businesses?lat={lat}&lon={lon}&radius_km={r}` | GET | Real Overpass API query for listed businesses around coordinates |
| `/api/data/census?query={taluk}` | GET | Authentic Census 2011 Primary Census Abstract rural indicators |
| `/api/data/market-prices?category={cat}` | GET | AGMARKNET wholesale mandi modal prices & arrival dates |
| `/api/data/survey` | GET / POST | Grassroots community field survey entries stored in SQLite |
| `/api/calculator/amortization` | POST | MoSJE loan amortization, EMI, moratorium, and gap analysis |
| `/api/calculator/from-margin` | POST | Reverse compute project cost from margin capital ($M / 0.10$) |
| `/api/advisory/generate` | POST | Sourced feasibility report generator (Verified DPR) |

---

## 🔒 Data Provenance & Honest Limitations

In strict adherence to Smart India Hackathon guidelines:
- **No Fabricated Competitors:** Competitor counts are strictly labeled as `"listed businesses found on OpenStreetMap"` within the selected radius. Unmapped informal village shops are explicitly noted as absent from public geospatial registries.
- **No Fictional Demographics:** Population and literacy figures cite the official Census of India 2011 PCA publications. They are statutory reference baselines, not real-time counts.
- **Wholesale vs Retail Price Distinction:** AGMARKNET mandi rates reflect APMC bulk wholesale auctions and are never falsely presented as village consumer retail prices.
- **Deterministic AI Advisory:** If no external API key is provided in `.env`, the system runs its built-in deterministic, evidence-grounded advisory engine without hallucinations.
- **Configurable External AI:** Optional keys (`GEMINI_API_KEY` or `OPENAI_API_KEY`) can be added to `.env` for narrative enrichment on the backend only; keys are never exposed in frontend bundles.

---

## 🏆 Smart India Hackathon Presentation Highlights

When demonstrating to SIH evaluators:
1. **Show End-to-End Flow:** Select a village (e.g. *Anaimalai*) $\rightarrow$ view the live 3D countryside simulation $\rightarrow$ inspect the Spatial Cluster Radar on the interactive Leaflet map $\rightarrow$ adjust project cost sliders on the MoSJE loan structurer $\rightarrow$ generate the bankable DPR feasibility report.
2. **Switch Languages:** Click `த` (Tamil) or `हि` (Hindi) and demonstrate the vernacular audio help.
3. **Show Data Transparency:** Point to the *Section 1: Verified Sourced Observations* cards displaying exact retrieval timestamps, data sources, and known limitations.
4. **Show Tested Arithmetic:** Point out the zero funding gap and principal holiday handling during the moratorium period.
