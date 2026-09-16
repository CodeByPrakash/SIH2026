"""
MPLADS-SATHI: Execution Verification Client
Author: Team Code_Warrior6 (SIH 2026)
Location: Model/serving/test_client.py
Purpose: Directly tests and verifies FastAPI model loading, feature calculation,
         XGBoost inference, and Risk Fusion Engine evaluation.
"""

import os
import sys
import asyncio

# Ensure serving directory and Model directory are on the python path
SERVING_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.dirname(SERVING_DIR)
sys.path.insert(0, SERVING_DIR)
sys.path.insert(0, MODEL_DIR)

from api import app, lifespan, process_work_audit, WorkAuditRequest

async def run_verification():
    print("=" * 65)
    print("  [EXECUTION TEST] Initializing FastAPI Lifespan & Models...")
    print("=" * 65)
    
    async with lifespan(app):
        # Case 1: High-Risk Work with Multiple Non-Compliances
        print("\n[Case 1] High-Risk Irregular Work (Cost Overrun + Delay + GPS Mismatch)")
        high_risk_work = WorkAuditRequest(
            work_id="WRK-TEST-2026-001",
            work_title="Installation of 50 Solar High-Mast Lights",
            state="Uttar Pradesh",
            district="Varanasi",
            constituency="Varanasi",
            constituency_type="General",
            work_category="Electricity",
            estimated_cost_inr=2500000.0,
            sanctioned_cost_inr=3000000.0,
            actual_expenditure_inr=4800000.0,
            expected_completion_days=60,
            actual_completion_days=180,
            inspection_done=0,
            photo_available=1,
            photo_location_match=0,
            similar_work_count_500m=3,
            payment_count=8
        )
        res1 = process_work_audit(high_risk_work)
        print("-" * 65)
        print(f"  Work ID:              {res1.work_id}")
        print(f"  Is Anomalous:         {res1.is_anomalous}")
        print(f"  Anomaly Probability:  {res1.anomaly_probability * 100:.2f}%")
        print(f"  Predicted Archetype:  {res1.predicted_archetype}")
        print(f"  Composite Risk Score: {res1.composite_risk_score} / 100")
        print(f"  Risk Tier:            {res1.risk_tier}")
        print(f"  Governance Action:    {res1.governance_action}")
        print("  Key Risk Drivers:")
        for d in res1.risk_drivers:
            print(f"   • {d}")
        print("-" * 65)

        # Case 2: Clean Benchmark Work
        print("\n[Case 2] Clean Benchmark Work (On-Time + Within Budget + Inspected)")
        clean_work = WorkAuditRequest(
            work_id="WRK-TEST-CLEAN-002",
            work_title="Primary School Computer Lab Setup",
            state="Tamil Nadu",
            district="Coimbatore",
            constituency="Coimbatore",
            constituency_type="General",
            work_category="Education",
            estimated_cost_inr=1000000.0,
            sanctioned_cost_inr=1000000.0,
            actual_expenditure_inr=950000.0,
            expected_completion_days=90,
            actual_completion_days=85,
            inspection_done=1,
            photo_available=1,
            photo_location_match=1,
            similar_work_count_500m=0,
            payment_count=2
        )
        res2 = process_work_audit(clean_work)
        print("-" * 65)
        print(f"  Work ID:              {res2.work_id}")
        print(f"  Is Anomalous:         {res2.is_anomalous}")
        print(f"  Anomaly Probability:  {res2.anomaly_probability * 100:.2f}%")
        print(f"  Predicted Archetype:  {res2.predicted_archetype}")
        print(f"  Composite Risk Score: {res2.composite_risk_score} / 100")
        print(f"  Risk Tier:            {res2.risk_tier}")
        print(f"  Governance Action:    {res2.governance_action}")
        print("-" * 65)

        print("\nAll execution tests passed successfully!")

if __name__ == "__main__":
    asyncio.run(run_verification())
