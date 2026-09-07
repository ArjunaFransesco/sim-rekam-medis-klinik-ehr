# -*- coding: utf-8 -*-
"""
FastAPI Clinical EHR & AI Triage Scoring API
Author: Arjuna Fransesco (https://github.com/ArjunaFransesco)
"""

import os
import sqlite3
import joblib
import pandas as pd
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Clinical EHR & AI Triage API",
    description="Electronic Health Record (EHR) and Automated Emergency Clinical Triage Engine",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "database", "clinical_ehr.db")
MODEL_PATH = os.path.join(BASE_DIR, "models", "triage_classifier.joblib")
SCALER_PATH = os.path.join(BASE_DIR, "models", "scaler.joblib")

model = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None
scaler = joblib.load(SCALER_PATH) if os.path.exists(SCALER_PATH) else None


class TriageAssessment(BaseModel):
    age: int
    systolic_bp: int
    heart_rate: int
    oxygen_sat: float
    crp: float = 5.0


class PatientCreate(BaseModel):
    full_name: str
    gender: str
    age: int
    blood_type: str
    systolic_bp: int
    heart_rate: int
    oxygen_sat: float
    crp: float = 5.0


class MedicalRecordCreate(BaseModel):
    patient_id: int
    doctor_name: str
    diagnosis: str
    prescription: str
    total_billing: float
    payment_status: str = "LUNAS"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def calculate_triage_score(age: int, sbp: int, hr: int, spo2: float, crp: float):
    risk_prob = 0.15
    if model and scaler:
        try:
            df = pd.DataFrame([{"age": age, "systolic_bp": sbp, "heart_rate": hr, "oxygen_sat": spo2, "crp": crp}])
            scaled = scaler.transform(df)
            risk_prob = float(model.predict_proba(scaled)[0][1])
        except Exception:
            risk_prob = 0.20
    else:
        # Clinical heuristic fallback
        if spo2 < 92 or sbp > 170 or hr > 115:
            risk_prob = 0.85
        elif spo2 < 95 or sbp > 140 or hr > 95:
            risk_prob = 0.45
        else:
            risk_prob = 0.10

    if risk_prob >= 0.70:
        category = "Merah (Kritis)"
        recommendation = "Resusitasi & Evaluasi Dokter Spesialis Segera (Prioritas 1)"
    elif risk_prob >= 0.35:
        category = "Kuning (Sedang)"
        recommendation = "Observasi Ruang Tindakan & Terapi Simptomatik (Prioritas 2)"
    else:
        category = "Hijau (Ringan)"
        recommendation = "Penanganan Poliklinik Rawat Jalan (Prioritas 3)"

    return round(risk_prob, 4), category, recommendation


@app.get("/")
def root():
    return {
        "service": "Clinical EHR & AI Triage Scoring API",
        "author": "Arjuna Fransesco",
        "github": "https://github.com/ArjunaFransesco/sim-rekam-medis-klinik-ehr",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "database": os.path.exists(DB_PATH),
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None
    }


@app.get("/api/stats")
def get_dashboard_stats():
    conn = get_db()
    total_patients = conn.execute("SELECT COUNT(*) FROM patients").fetchone()[0]
    critical_count = conn.execute("SELECT COUNT(*) FROM patients WHERE triage_category LIKE '%Merah%'").fetchone()[0]
    urgent_count = conn.execute("SELECT COUNT(*) FROM patients WHERE triage_category LIKE '%Kuning%'").fetchone()[0]
    stable_count = conn.execute("SELECT COUNT(*) FROM patients WHERE triage_category LIKE '%Hijau%'").fetchone()[0]
    avg_spo2 = conn.execute("SELECT AVG(oxygen_sat) FROM patients").fetchone()[0] or 98.0
    avg_bp = conn.execute("SELECT AVG(systolic_bp) FROM patients").fetchone()[0] or 120.0
    total_records = conn.execute("SELECT COUNT(*) FROM medical_records").fetchone()[0]
    conn.close()

    return {
        "total_patients": total_patients,
        "critical_count": critical_count,
        "urgent_count": urgent_count,
        "stable_count": stable_count,
        "avg_spo2": round(avg_spo2, 1),
        "avg_bp": round(avg_bp, 1),
        "total_records": total_records
    }


@app.get("/api/patients")
def list_patients(search: Optional[str] = None, triage: Optional[str] = None):
    conn = get_db()
    query = "SELECT * FROM patients WHERE 1=1"
    params = []

    if search:
        query += " AND (full_name LIKE ? OR mrn LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])

    if triage:
        query += " AND triage_category LIKE ?"
        params.append(f"%{triage}%")

    query += " ORDER BY id DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@app.post("/api/patients")
def create_patient(payload: PatientCreate):
    risk_prob, category, rec = calculate_triage_score(
        payload.age, payload.systolic_bp, payload.heart_rate, payload.oxygen_sat, payload.crp
    )

    conn = get_db()
    cur = conn.cursor()
    count = cur.execute("SELECT COUNT(*) FROM patients").fetchone()[0]
    mrn = f"MRN-{1001 + count}"

    cur.execute("""
    INSERT INTO patients (mrn, full_name, gender, age, blood_type, systolic_bp, heart_rate, oxygen_sat, crp, triage_category, admission_risk)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        mrn, payload.full_name, payload.gender, payload.age, payload.blood_type,
        payload.systolic_bp, payload.heart_rate, payload.oxygen_sat, payload.crp,
        category, risk_prob
    ))
    new_id = cur.lastrowid
    conn.commit()
    conn.close()

    return {
        "id": new_id,
        "mrn": mrn,
        "full_name": payload.full_name,
        "triage_category": category,
        "admission_risk": risk_prob,
        "recommendation": rec
    }


@app.get("/api/patients/{patient_id}")
def get_patient_detail(patient_id: int):
    conn = get_db()
    patient = conn.execute("SELECT * FROM patients WHERE id = ?", (patient_id,)).fetchone()
    if not patient:
        conn.close()
        raise HTTPException(status_code=404, detail="Patient not found")

    records = conn.execute("SELECT * FROM medical_records WHERE patient_id = ? ORDER BY id DESC", (patient_id,)).fetchall()
    conn.close()

    return {
        "patient": dict(patient),
        "medical_records": [dict(r) for r in records]
    }


@app.get("/api/medical-records")
def list_medical_records():
    conn = get_db()
    records = conn.execute("""
    SELECT mr.*, p.mrn, p.full_name, p.gender, p.age, p.triage_category
    FROM medical_records mr
    JOIN patients p ON mr.patient_id = p.id
    ORDER BY mr.id DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in records]


@app.post("/api/medical-records")
def create_medical_record(payload: MedicalRecordCreate):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
    INSERT INTO medical_records (patient_id, doctor_name, diagnosis, prescription, total_billing, payment_status)
    VALUES (?, ?, ?, ?, ?, ?)
    """, (payload.patient_id, payload.doctor_name, payload.diagnosis, payload.prescription, payload.total_billing, payload.payment_status))
    new_id = cur.lastrowid
    conn.commit()
    conn.close()
    return {"id": new_id, "status": "Medical record saved successfully"}


@app.post("/api/triage/predict")
def predict_triage_acuity(payload: TriageAssessment):
    risk_prob, category, rec = calculate_triage_score(
        payload.age, payload.systolic_bp, payload.heart_rate, payload.oxygen_sat, payload.crp
    )
    return {
        "admission_risk": risk_prob,
        "triage_category": category,
        "clinical_recommendation": rec,
        "vitals_input": payload.dict()
    }


if __name__ == "__main__":
    import uvicorn
    print("[*] Starting Clinical EHR FastAPI Service on http://127.0.0.1:8000 ...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
