"""
RuralBiz AI - Financial Calculator Service
SIH Problem Statement ID: 26091
Title: AI-Driven Hyper-Local Business Advisory and Financial Structuring Assistant for Rural Micro-Entrepreneurs

Implements exact arithmetic for:
- Scheme A: Micro Finance Scheme (Project cost up to Rs 1,40,000, Agency loan max Rs 1,25,000, 6.5% p.a., 3 years tenure, 3 months moratorium)
- Scheme B: Term Loan Scheme (Project cost > Rs 1,40,000 up to Rs 50,00,000, Agency loan max Rs 45,00,000, 8.0% p.a., 7 years tenure, 6 months moratorium)
"""

from typing import Dict, Any, List
import math

class SchemeRules:
    # Scheme A: Micro Finance
    MICRO_MAX_COST = 140000.0
    MICRO_MAX_LOAN = 125000.0
    MICRO_ANNUAL_RATE = 0.065  # 6.5%
    MICRO_TENURE_YEARS = 3
    MICRO_TENURE_MONTHS = 36
    MICRO_MORATORIUM_MONTHS = 3

    # Scheme B: Term Loan
    TERM_MIN_COST = 140000.01
    TERM_MAX_COST = 5000000.0
    TERM_MAX_LOAN = 4500000.0
    TERM_ANNUAL_RATE = 0.080  # 8.0%
    TERM_TENURE_YEARS = 7
    TERM_TENURE_MONTHS = 84
    TERM_MORATORIUM_MONTHS = 6

    # Margin Money rules
    MIN_MARGIN_PCT = 0.10  # 10% self-contribution floor
    MAX_AGENCY_SHARE = 0.90 # 90% project cost


def calculate_loan_structure(
    project_cost: float,
    user_margin_capital: float = None,
    preferred_scheme: str = None,
    interest_accrues_in_moratorium: bool = True
) -> Dict[str, Any]:
    """
    Calculates the financial structure based on project cost and margin capital.
    """
    project_cost = float(project_cost)
    warnings: List[str] = []
    eligibility_notes: List[str] = []

    # Check upper ceiling
    if project_cost > SchemeRules.TERM_MAX_COST:
        warnings.append(
            f"Project cost of Rs {project_cost:,.2f} exceeds the MoSJE Term Loan ceiling of Rs 50,00,000. "
            "The supplied scheme rules do not cover projects above this limit."
        )

    # Determine scheme
    if preferred_scheme == "micro" or (preferred_scheme is None and project_cost <= SchemeRules.MICRO_MAX_COST):
        scheme_id = "micro"
        scheme_name = "Micro Finance Scheme"
        annual_rate = SchemeRules.MICRO_ANNUAL_RATE
        tenure_months = SchemeRules.MICRO_TENURE_MONTHS
        moratorium_months = SchemeRules.MICRO_MORATORIUM_MONTHS
        max_loan_cap = SchemeRules.MICRO_MAX_LOAN
        max_project_cost = SchemeRules.MICRO_MAX_COST

        if project_cost > SchemeRules.MICRO_MAX_COST:
            warnings.append(
                f"Selected project cost (Rs {project_cost:,.2f}) exceeds Micro Finance limit of Rs 1,40,000. "
                "Recommendation: Switch to Term Loan Scheme."
            )
    else:
        scheme_id = "term"
        scheme_name = "Term Loan Scheme"
        annual_rate = SchemeRules.TERM_ANNUAL_RATE
        tenure_months = SchemeRules.TERM_TENURE_MONTHS
        moratorium_months = SchemeRules.TERM_MORATORIUM_MONTHS
        max_loan_cap = SchemeRules.TERM_MAX_LOAN
        max_project_cost = SchemeRules.TERM_MAX_COST

        if project_cost <= SchemeRules.MICRO_MAX_COST:
            eligibility_notes.append(
                f"Project cost (Rs {project_cost:,.2f}) qualifies for concessional Micro Finance Scheme (6.5% interest)."
            )

    # Statutory calculations
    min_required_margin = round(project_cost * SchemeRules.MIN_MARGIN_PCT, 2)
    indicative_agency_share = round(project_cost * SchemeRules.MAX_AGENCY_SHARE, 2)

    # Agency loan capped at scheme ceiling
    sanctionable_loan = min(indicative_agency_share, max_loan_cap)

    # Margin capital handling
    if user_margin_capital is not None:
        user_margin = float(user_margin_capital)
        margin_pct = (user_margin / project_cost * 100) if project_cost > 0 else 0
        if user_margin < min_required_margin:
            shortfall = min_required_margin - user_margin
            warnings.append(
                f"Margin shortfall: Available margin (Rs {user_margin:,.2f}) is below the mandatory 10% floor "
                f"(Rs {min_required_margin:,.2f}). Deficit: Rs {shortfall:,.2f}."
            )
    else:
        user_margin = min_required_margin
        margin_pct = 10.0

    # Total funding currently accounted for
    total_mobilized = sanctionable_loan + user_margin
    funding_gap = max(0.0, round(project_cost - total_mobilized, 2))

    if funding_gap > 0:
        warnings.append(
            f"Funding gap of Rs {funding_gap:,.2f} detected due to scheme loan ceiling (Max loan: Rs {max_loan_cap:,.2f}). "
            "Promoter must increase promoter contribution, seek state subsidy, or bridge finance."
        )

    # Moratorium & Repayment Calculation
    # Repayment periods post-moratorium
    repayment_months = tenure_months - moratorium_months
    monthly_rate = annual_rate / 12.0

    # Interest treatment during moratorium:
    # If simple interest accrues during moratorium:
    moratorium_interest = round(sanctionable_loan * monthly_rate * moratorium_months, 2)

    # Standard Amortization Formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    if repayment_months > 0 and monthly_rate > 0 and sanctionable_loan > 0:
        # Effective principal for repayment: assuming simple interest during holiday can be paid or serviced
        p = sanctionable_loan
        r = monthly_rate
        n = repayment_months
        factor = math.pow(1 + r, n)
        estimated_emi = round((p * r * factor) / (factor - 1), 2)
        estimated_quarterly = round(estimated_emi * 3, 2)
        total_repayment = round(estimated_emi * n, 2)
        total_interest = round(total_repayment - p + (moratorium_interest if interest_accrues_in_moratorium else 0), 2)
    else:
        estimated_emi = 0.0
        estimated_quarterly = 0.0
        total_repayment = 0.0
        total_interest = 0.0

    # Generate amortization schedule sample (First 12 months & Yearly totals)
    amortization_preview = []
    balance = sanctionable_loan

    for m in range(1, min(13, tenure_months + 1)):
        if m <= moratorium_months:
            # During moratorium: 0 principal repayment
            int_charge = round(balance * monthly_rate, 2)
            amortization_preview.append({
                "month": m,
                "phase": "Moratorium (Principal Holiday)",
                "principal_paid": 0.0,
                "interest_charged": int_charge,
                "total_payment": int_charge if interest_accrues_in_moratorium else 0.0,
                "remaining_balance": round(balance, 2)
            })
        else:
            int_charge = round(balance * monthly_rate, 2)
            prin_paid = round(min(balance, estimated_emi - int_charge), 2)
            balance = max(0.0, balance - prin_paid)
            amortization_preview.append({
                "month": m,
                "phase": "Active Repayment",
                "principal_paid": prin_paid,
                "interest_charged": int_charge,
                "total_payment": estimated_emi,
                "remaining_balance": round(balance, 2)
            })

    return {
        "status": "success",
        "provenance": {
            "source": "Smart India Hackathon Problem Statement 26091 (MoSJE Guidelines)",
            "calculation_engine": "RuralBiz Amortization Engine v1.0",
            "statutory_status": "Indicative estimates subject to bank credit appraisal"
        },
        "inputs": {
            "project_cost": project_cost,
            "user_margin_capital": user_margin,
            "margin_percentage": round(margin_pct, 2),
            "interest_accrues_in_moratorium": interest_accrues_in_moratorium
        },
        "scheme": {
            "scheme_id": scheme_id,
            "scheme_name": scheme_name,
            "annual_interest_rate_pct": round(annual_rate * 100, 2),
            "tenure_years": round(tenure_months / 12, 1),
            "tenure_months": tenure_months,
            "moratorium_months": moratorium_months,
            "active_repayment_months": repayment_months,
            "max_loan_cap": max_loan_cap,
            "max_project_cost": max_project_cost
        },
        "financial_summary": {
            "project_cost": project_cost,
            "sanctionable_agency_loan": sanctionable_loan,
            "promoter_margin_required": min_required_margin,
            "promoter_margin_actual": user_margin,
            "funding_gap": funding_gap,
            "indicative_monthly_emi": estimated_emi,
            "indicative_quarterly_installment": estimated_quarterly,
            "moratorium_interest_accrual": moratorium_interest,
            "total_estimated_interest": total_interest,
            "total_debt_service": round(sanctionable_loan + total_interest, 2)
        },
        "amortization_preview": amortization_preview,
        "warnings": warnings,
        "eligibility_notes": eligibility_notes
    }


def reverse_calculate_from_margin(margin_capital: float, scheme_preference: str = None) -> Dict[str, Any]:
    """
    Given available margin capital M:
    Indicative project cost = M / 0.10
    Indicative agency loan = project cost * 0.90, subject to scheme cap.
    """
    margin = float(margin_capital)
    if margin <= 0:
        return {"status": "error", "message": "Margin capital must be greater than zero."}

    indicative_project_cost = round(margin / SchemeRules.MIN_MARGIN_PCT, 2)
    return calculate_loan_structure(
        project_cost=indicative_project_cost,
        user_margin_capital=margin,
        preferred_scheme=scheme_preference
    )
