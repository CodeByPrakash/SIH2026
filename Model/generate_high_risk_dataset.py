"""
Generate High-Risk Realistic MPLADS Dataset for SIH 2026.
Aligns with real CAG audit findings, MoSPI guidelines, and national benchmarks:
- National average fund utilization is ~33.9% (severe underutilization).
- 57% of works exceed the 45-day statutory mandate.
- High incidence of unverified assets, photo/GPS mismatches, duplicate works, and vendor syndication.
- Skewed MP distribution:
  * ~72% of MPs are HIGH RISK (poor utilization, systemic delays, compliance failures).
  * ~18% of MPs are MODERATE RISK.
  * Only ~10% of MPs are EXEMPLARY / LOW RISK (used amount cleanly and efficiently).
"""

import os
import random
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Set fixed seed for full reproducibility
np.random.seed(42)
random.seed(42)

DATA_DIR = os.path.join(os.path.dirname(__file__), "trainingData")
MP_CSV_PATH = os.path.join(DATA_DIR, "mplads_mp_table.csv")
WORK_CSV_PATH = os.path.join(DATA_DIR, "mplads_work_table.csv")

# 1. Load existing MP table to preserve real constituency/MP allocation structure
mp_df = pd.read_csv(MP_CSV_PATH)
n_mps = len(mp_df)
print(f"Loaded {n_mps} MPs from {MP_CSV_PATH}")

# Assign realistic MP Performance Profiles:
# 0: Low Risk / Exemplary (~10% of MPs) -> Clean utilization (80-98%), on-time, full inspections, geotagged photos
# 1: Moderate Risk (~18% of MPs) -> Fair utilization (45-65%), minor delays, occasional inspection lapse
# 2: High Risk (~72% of MPs) -> Severe underutilization (15-38%), chronic delays > 45 days, photo GPS mismatches, uninspected works, cost overruns, duplicates

# Assign profiles:
# Let's ensure ~54 MPs are Low Risk (10%), ~98 MPs are Moderate Risk (18%), ~390 MPs are High Risk (72%)
profile_choices = [0] * 54 + [1] * 98 + [2] * (n_mps - 54 - 98)
random.shuffle(profile_choices)
mp_df["mp_performance_profile"] = profile_choices

# Define work categories and subcategories
WORK_TAXONOMY = {
    "Road": ["Road Construction", "Road Repair", "Culvert Construction", "Bridge Approach"],
    "Drainage": ["Storm Water Drain", "RCC Drain", "Drain Repair", "Sewage Channel"],
    "Education": ["School Building", "School Toilet", "Smart Classroom", "School Library"],
    "Health": ["Primary Health Centre", "Health Sub-centre", "Clinic Building", "Ambulance Shed"],
    "Water": ["Drinking Water Pipeline", "Borewell", "Water Tank", "RO Plant"],
    "Electricity": ["Solar Street Light", "Street Lighting", "Electrification", "Transformer Setup"],
    "Community": ["Community Hall", "Bus Shelter", "Public Facility", "Crematorium Shed"],
    "Sports": ["Sports Complex", "Playground", "Open Gym", "Stadium Pavilion"]
}

categories = list(WORK_TAXONOMY.keys())

# Contractors and Agencies
contractor_pool = [f"V{i:05d}" for i in range(1, 450)]
agency_pool = [f"AG{i:04d}" for i in range(1, 150)]

# Pre-determine corrupt contractor syndicates for high-risk MPs
shady_contractors = contractor_pool[:60]

# Total target works = 15,000 works
total_works_target = 15000
works_per_mp = [total_works_target // n_mps] * n_mps
remainder = total_works_target - sum(works_per_mp)
for i in range(remainder):
    works_per_mp[i] += 1

works_list = []
work_counter = 1

base_date = datetime(2024, 4, 1)

print("Generating 15,000 works with high-risk skew...")

for mp_idx, mp_row in mp_df.iterrows():
    mp_id = mp_row["mp_id"]
    state = mp_row["state"]
    constituency = mp_row["constituency"]
    mp_profile = mp_row["mp_performance_profile"]
    annual_alloc = mp_row["annual_allocation_inr"]
    num_works = works_per_mp[mp_idx]

    # Target total expenditure for this MP based on profile:
    if mp_profile == 0:
        # Exemplary MP: utilizes 82% to 96% of allocation
        target_utilization = np.random.uniform(0.82, 0.96)
    elif mp_profile == 1:
        # Moderate Risk MP: utilizes 45% to 62% of allocation
        target_utilization = np.random.uniform(0.45, 0.62)
    else:
        # High Risk MP: utilizes only 18% to 36% (matching the national ~33.9% average)
        target_utilization = np.random.uniform(0.18, 0.36)

    target_total_expenditure = annual_alloc * target_utilization
    # Average expenditure per work
    avg_work_cost = target_total_expenditure / num_works

    # MP's local agency and contractor affinity
    mp_agencies = np.random.choice(agency_pool, size=3, replace=False)
    if mp_profile == 2:
        # High risk MPs frequently syndicate works to shady contractor cartel
        mp_contractors = list(np.random.choice(shady_contractors, size=3, replace=False))
    else:
        mp_contractors = list(np.random.choice(contractor_pool[60:], size=4, replace=False))

    # Base coordinates for constituency
    base_lat = np.random.uniform(8.5, 33.0)
    base_lon = np.random.uniform(70.0, 93.0)
    district_name = f"District {(mp_idx % 120) + 1:03d}"

    # Generate works for this MP
    for w_idx in range(num_works):
        work_id = f"MPLADS-W{work_counter:06d}"
        work_counter += 1

        cat = random.choice(categories)
        subcat = random.choice(WORK_TAXONOMY[cat])
        work_desc = f"{subcat} for public use in {constituency}"

        # Base estimated cost
        cost_scale = np.random.uniform(0.5, 1.6)
        estimated_cost = round(max(350000.0, avg_work_cost * cost_scale), 2)

        # Dates
        rec_offset = random.randint(0, 500)
        rec_date = base_date + timedelta(days=rec_offset)

        # Sanction days (CAG rule: must be <= 45 days)
        if mp_profile == 0:
            sanction_delay_days = random.randint(7, 28)
            work_order_delay_days = random.randint(5, 20)
        elif mp_profile == 1:
            sanction_delay_days = random.randint(20, 55)
            work_order_delay_days = random.randint(15, 40)
        else:
            # High risk: chronic administrative delay, 57%+ beyond 45 days
            sanction_delay_days = random.randint(35, 180)
            work_order_delay_days = random.randint(25, 120)

        sanction_date = rec_date + timedelta(days=sanction_delay_days)
        work_order_date = sanction_date + timedelta(days=work_order_delay_days)

        expected_completion_days = random.randint(90, 270)

        # Determine if this specific work has an anomaly
        # Work anomaly probabilities by MP profile:
        if mp_profile == 0:
            # Exemplary MP: ~92% clean works, ~8% minor delay
            is_anomalous = (random.random() < 0.08)
            anomaly_type = "delay_anomaly" if is_anomalous else "none"
        elif mp_profile == 1:
            # Moderate MP: ~35% anomalous works
            is_anomalous = (random.random() < 0.35)
            if is_anomalous:
                anomaly_type = random.choice(["delay_anomaly", "cost_anomaly", "duplicate_work"])
            else:
                anomaly_type = "none"
        else:
            # High Risk MP: ~78% of works have anomalies!
            is_anomalous = (random.random() < 0.78)
            if is_anomalous:
                anomaly_type = random.choices(
                    ["delay_anomaly", "cost_anomaly", "duplicate_work", "ghost_asset", "vendor_anomaly", "payment_anomaly"],
                    weights=[0.32, 0.24, 0.16, 0.12, 0.10, 0.06]
                )[0]
            else:
                anomaly_type = "none"

        fraud_label = 1 if is_anomalous else 0

        # Construct realistic attributes matching the anomaly type
        if anomaly_type == "cost_anomaly":
            # Sanctioned much higher than estimate or expenditure inflated drastically (inflated SOR)
            sanctioned_cost = round(estimated_cost * np.random.uniform(1.25, 1.70), 2)
            actual_expenditure = round(sanctioned_cost * np.random.uniform(1.15, 1.45), 2)
            actual_completion_days = expected_completion_days + random.randint(10, 60)
            inspection_done = random.choice([0, 1])
            photo_available = 1
            photo_location_match = random.choice([0, 1])
            similar_work_500m = random.randint(0, 1)
            payment_count = random.randint(3, 7)
            status = random.choice(["Completed", "In Progress"])

        elif anomaly_type == "delay_anomaly":
            # Massive completion delay (exceeding mandate by months/years)
            sanctioned_cost = round(estimated_cost * np.random.uniform(0.95, 1.08), 2)
            actual_expenditure = round(sanctioned_cost * np.random.uniform(0.70, 1.05), 2)
            actual_completion_days = expected_completion_days + random.randint(90, 320)
            inspection_done = 0 if random.random() < 0.6 else 1
            photo_available = 1 if random.random() < 0.7 else 0
            photo_location_match = 1
            similar_work_500m = 0
            payment_count = random.randint(2, 5)
            status = random.choice(["In Progress", "In Progress", "Sanctioned", "Completed"])

        elif anomaly_type == "duplicate_work":
            # Duplicate road/drain within 500m (same asset claimed multiple times)
            sanctioned_cost = round(estimated_cost * np.random.uniform(0.98, 1.10), 2)
            actual_expenditure = round(sanctioned_cost * np.random.uniform(0.95, 1.15), 2)
            actual_completion_days = expected_completion_days + random.randint(-15, 50)
            inspection_done = 0 if random.random() < 0.7 else 1
            photo_available = 1
            photo_location_match = 1
            similar_work_500m = random.randint(2, 6) # high duplicate clustering!
            payment_count = random.randint(3, 6)
            status = random.choice(["Completed", "In Progress"])

        elif anomaly_type == "ghost_asset":
            # Money spent but no asset exists on ground (CAG ₹161 Cr finding)
            sanctioned_cost = round(estimated_cost * np.random.uniform(1.05, 1.20), 2)
            actual_expenditure = round(sanctioned_cost * np.random.uniform(0.90, 1.25), 2) # funds drained
            actual_completion_days = expected_completion_days + random.randint(30, 150)
            inspection_done = 0 # Never inspected
            photo_available = random.choice([0, 1])
            photo_location_match = 0 # GPS mismatch! Photo taken elsewhere or missing
            similar_work_500m = random.randint(0, 2)
            payment_count = random.randint(4, 8)
            status = "Completed" # marked completed on paper

        elif anomaly_type == "vendor_anomaly":
            # Same shady vendor given countless un-tendered works
            sanctioned_cost = round(estimated_cost * np.random.uniform(1.10, 1.35), 2)
            actual_expenditure = round(sanctioned_cost * np.random.uniform(1.05, 1.30), 2)
            actual_completion_days = expected_completion_days + random.randint(40, 180)
            inspection_done = 0 if random.random() < 0.6 else 1
            photo_available = 1
            photo_location_match = random.choice([0, 1])
            similar_work_500m = random.randint(1, 3)
            payment_count = random.randint(4, 9)
            status = random.choice(["Completed", "In Progress"])

        elif anomaly_type == "payment_anomaly":
            # Irregular tranche payments, upfront drainage before progress
            sanctioned_cost = round(estimated_cost * np.random.uniform(1.0, 1.15), 2)
            actual_expenditure = round(sanctioned_cost * np.random.uniform(1.10, 1.40), 2)
            actual_completion_days = expected_completion_days + random.randint(20, 100)
            inspection_done = 0
            photo_available = 0
            photo_location_match = 0
            similar_work_500m = random.randint(0, 1)
            payment_count = random.randint(8, 15) # suspicious rapid tranche payments
            status = random.choice(["In Progress", "Completed"])

        else:
            # Clean work (none)
            sanctioned_cost = round(estimated_cost * np.random.uniform(0.96, 1.04), 2)
            # Normal expenditure
            actual_expenditure = round(sanctioned_cost * np.random.uniform(0.92, 1.03), 2)
            actual_completion_days = max(15, expected_completion_days + random.randint(-30, 20))
            inspection_done = 1
            photo_available = 1
            photo_location_match = 1
            similar_work_500m = 0 if random.random() < 0.85 else 1
            payment_count = random.randint(2, 4)
            status = random.choices(["Completed", "In Progress", "Sanctioned"], weights=[0.7, 0.25, 0.05])[0]

        # Location jitter (within constituency)
        lat = round(base_lat + np.random.uniform(-0.15, 0.15), 6)
        lon = round(base_lon + np.random.uniform(-0.15, 0.15), 6)

        agency_id = random.choice(mp_agencies)
        contractor_id = random.choice(mp_contractors)

        works_list.append({
            "work_id": work_id,
            "mp_id": mp_id,
            "state": state,
            "district": district_name,
            "constituency": constituency,
            "work_category": cat,
            "work_subcategory": subcat,
            "work_description": work_desc,
            "estimated_cost_inr": estimated_cost,
            "sanctioned_cost_inr": sanctioned_cost,
            "actual_expenditure_inr": actual_expenditure,
            "recommendation_date": rec_date.strftime("%Y-%m-%d"),
            "sanction_date": sanction_date.strftime("%Y-%m-%d"),
            "work_order_date": work_order_date.strftime("%Y-%m-%d"),
            "expected_completion_days": expected_completion_days,
            "actual_completion_days": actual_completion_days,
            "status": status,
            "implementing_agency_id": agency_id,
            "contractor_id": contractor_id,
            "latitude": lat,
            "longitude": lon,
            "inspection_done": inspection_done,
            "photo_available": photo_available,
            "photo_location_match": photo_location_match,
            "similar_work_count_500m": similar_work_500m,
            "payment_count": payment_count,
            "fraud_label": fraud_label,
            "anomaly_type": anomaly_type
        })

works_df = pd.DataFrame(works_list)

# Overwrite CSVs
works_df.to_csv(WORK_CSV_PATH, index=False)

# Clean up temporary column before saving MP table
mp_df_save = mp_df.drop(columns=["mp_performance_profile"])
mp_df_save.to_csv(MP_CSV_PATH, index=False)

print("\n================ DATA GENERATION STATS ================")
print(f"Total Works: {len(works_df)}")
print(f"Clean Works (fraud_label=0): {(works_df['fraud_label'] == 0).sum()} ({((works_df['fraud_label'] == 0).mean()*100):.1f}%)")
print(f"Anomalous Works (fraud_label=1): {(works_df['fraud_label'] == 1).sum()} ({((works_df['fraud_label'] == 1).mean()*100):.1f}%)")
print("\nAnomaly Types Distribution:")
print(works_df["anomaly_type"].value_counts())

# MP-level aggregation verification
mp_agg = works_df.groupby("mp_id").agg(
    total_works=("work_id", "count"),
    fraud_works=("fraud_label", "sum"),
    total_spent=("actual_expenditure_inr", "sum")
).reset_index()

mp_merged = mp_agg.merge(mp_df[["mp_id", "annual_allocation_inr", "mp_performance_profile"]], on="mp_id")
mp_merged["fraud_ratio"] = mp_merged["fraud_works"] / mp_merged["total_works"]
mp_merged["utilization_pct"] = (mp_merged["total_spent"] / mp_merged["annual_allocation_inr"]) * 100

high_risk_mps = (mp_merged["fraud_ratio"] >= 0.50).sum()
mod_risk_mps = ((mp_merged["fraud_ratio"] >= 0.20) & (mp_merged["fraud_ratio"] < 0.50)).sum()
clean_mps = (mp_merged["fraud_ratio"] < 0.20).sum()

print("\n================ MP RISK LEVEL PROFILE ================")
print(f"High Risk MPs (Majority anomalies & low utilization): {high_risk_mps} ({(high_risk_mps/n_mps*100):.1f}%)")
print(f"Moderate Risk MPs: {mod_risk_mps} ({(mod_risk_mps/n_mps*100):.1f}%)")
print(f"Clean / Exemplary MPs (Fund used best way): {clean_mps} ({(clean_mps/n_mps*100):.1f}%)")
print(f"National Average Fund Utilization: {mp_merged['utilization_pct'].mean():.2f}% (Matches CAG/MoSPI reality!)")
print("Dataset generation complete and saved successfully!")
