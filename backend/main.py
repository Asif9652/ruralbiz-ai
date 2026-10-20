"""
RuralBiz AI - Backend API Gateway & Static Server
SIH Problem Statement ID: 26091
FastAPI server connecting real geospatial sources, census tables, mandi data,
tested financial calculation engines, and SQLite storage.
"""

import os

# Auto-load .env file if present
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(env_path):
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

from backend.services.geocoding import reverse_geocode, search_villages
from backend.services.osm_provider import query_nearby_businesses
from backend.services.census_provider import get_census_demographics
from backend.services.mandi_provider import get_mandi_prices
from backend.services.calculator import calculate_loan_structure, reverse_calculate_from_margin
from backend.services.survey_db import init_database, submit_survey, get_surveys_for_location
from backend.services.advisory import generate_feasibility_report

# Initialize database on startup
init_database()

app = FastAPI(
    title="RuralBiz AI API Gateway",
    description="Hyper-Local Business Advisory and Financial Structuring Assistant (SIH PS 26091)",
    version="1.0.0"
)

# Enable CORS for local testing and cross-origin access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Schemas
class LoanCalcRequest(BaseModel):
    project_cost: float = Field(..., gt=0, description="Total project expenditure in INR")
    user_margin_capital: Optional[float] = Field(None, ge=0, description="Available promoter capital in INR")
    preferred_scheme: Optional[str] = Field(None, description="'micro' or 'term'")
    interest_accrues_in_moratorium: bool = Field(True, description="Whether interest accrues during moratorium")


class MarginCalcRequest(BaseModel):
    margin_capital: float = Field(..., gt=0, description="Available promoter capital in INR")
    preferred_scheme: Optional[str] = None


class SurveySubmissionRequest(BaseModel):
    village_name: str
    district_name: str
    latitude: float
    longitude: float
    business_category: str
    respondent_role: str
    frequently_purchased: str
    customer_purchasing_habits: Optional[str] = ""
    approx_price_range: Optional[str] = ""
    supplier_reliability_score: int = Field(4, ge=1, le=5)
    unmet_local_needs: str
    existing_competition_perception: Optional[str] = ""


class AdvisoryRequest(BaseModel):
    village_name: str
    taluk: str
    district: str
    state: str
    latitude: float
    longitude: float
    business_category: str = "dairy"
    custom_business_idea: Optional[str] = None
    project_cost: float = 320000.0
    user_margin: float = 35000.0


# Health Check
@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "RuralBiz AI Core",
        "version": "1.0.0",
        "sih_ps_id": "26091",
        "provenance_layer": "Active"
    }


# Location & Geocoding Endpoints
@app.get("/api/location/reverse-geocode")
async def api_reverse_geocode(lat: float = Query(...), lon: float = Query(...)):
    """Reverse geocodes coordinates to village/taluk/district via Nominatim."""
    return await reverse_geocode(lat, lon)


@app.get("/api/location/search")
async def api_search_villages(q: str = Query(..., min_length=1), state: Optional[str] = None):
    """Searches for Indian villages and taluks with candidate disambiguation."""
    return await search_villages(q, state)


# Geospatial & OpenStreetMap Endpoints
@app.get("/api/data/osm-businesses")
async def api_osm_businesses(
    lat: float = Query(10.5844),
    lon: float = Query(76.9328),
    radius_km: float = Query(5.0, ge=1.0, le=15.0),
    category: Optional[str] = "all",
    location_name: Optional[str] = None,
    business_idea: Optional[str] = None
):
    """Queries 100% genuine mapped businesses within radius using OpenStreetMap Nominatim."""
    return await query_nearby_businesses(
        lat=lat,
        lon=lon,
        radius_km=radius_km,
        category_filter=category,
        location_name=location_name,
        business_idea=business_idea
    )


# Demographic & Mandi Data Endpoints
@app.get("/api/data/census")
def api_census_demographics(query: str = Query("anaimalai")):
    """Retrieves authentic Census of India 2011 PCA rural demographic indicators."""
    return get_census_demographics(query)


@app.get("/api/data/market-prices")
def api_mandi_prices(category: Optional[str] = "all"):
    """Retrieves authentic AGMARKNET wholesale commodity modal prices."""
    return get_mandi_prices(category)


# Local Participatory Survey Endpoints
@app.get("/api/data/survey")
def api_get_surveys(category: Optional[str] = "all", village: Optional[str] = ""):
    """Retrieves local community survey findings stored in SQLite."""
    return get_surveys_for_location(village, category)


@app.post("/api/data/survey")
def api_submit_survey(payload: SurveySubmissionRequest):
    """Stores grassroots survey response with consent and privacy protection."""
    return submit_survey(payload.dict())


# Tested Financial Calculation Endpoints
@app.post("/api/calculator/amortization")
def api_calculate_amortization(req: LoanCalcRequest):
    """Calculates MoSJE loan eligibility, EMI, moratorium, and amortization schedule."""
    return calculate_loan_structure(
        project_cost=req.project_cost,
        user_margin_capital=req.user_margin_capital,
        preferred_scheme=req.preferred_scheme,
        interest_accrues_in_moratorium=req.interest_accrues_in_moratorium
    )


@app.post("/api/calculator/from-margin")
def api_calculate_from_margin(req: MarginCalcRequest):
    """Computes project cost and loan given promoter margin capital (M / 0.10)."""
    return reverse_calculate_from_margin(req.margin_capital, req.preferred_scheme)


# AI Business Advisory Feasibility Generator Endpoint
@app.post("/api/advisory/generate")
async def api_generate_advisory(req: AdvisoryRequest):
    """Synthesizes real retrieved evidence into a structured feasibility report."""
    # 1. Fetch real OSM businesses
    osm_data = await query_nearby_businesses(req.latitude, req.longitude, radius_km=5.0, category_filter=req.business_category)
    # 2. Fetch Census Demographics
    census_data = get_census_demographics(req.taluk or req.district)
    # 3. Fetch Mandi Prices
    mandi_data = get_mandi_prices(req.business_category)
    # 4. Fetch Survey Data
    survey_data = get_surveys_for_location(req.village_name, req.business_category)

    loc_dict = {
        "village": req.village_name,
        "taluk": req.taluk,
        "district": req.district,
        "state": req.state,
        "latitude": req.latitude,
        "longitude": req.longitude
    }

    report = generate_feasibility_report(
        location_data=loc_dict,
        business_category=req.business_category,
        project_cost=req.project_cost,
        user_margin=req.user_margin,
        osm_evidence=osm_data,
        census_evidence=census_data,
        mandi_evidence=mandi_data,
        survey_evidence=survey_data,
        custom_business_idea=req.custom_business_idea
    )
    return report


# Static Files Mount for Frontend Web Application
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")
