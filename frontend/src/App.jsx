import React, { useState, useEffect } from 'react';

// Sample offline fallback data for instant demo without backend requirement
const INITIAL_PATIENTS = [
  { id: 1, mrn: "MRN-1001", full_name: "Bambang Santoso", gender: "Laki-laki", age: 58, blood_type: "O", systolic_bp: 175, heart_rate: 110, oxygen_sat: 91.5, crp: 24.5, triage_category: "Merah (Kritis)", admission_risk: 0.92 },
  { id: 2, mrn: "MRN-1002", full_name: "Siti Rahmawati", gender: "Perempuan", age: 34, blood_type: "A", systolic_bp: 118, heart_rate: 72, oxygen_sat: 99.0, crp: 3.2, triage_category: "Hijau (Ringan)", admission_risk: 0.06 },
  { id: 3, mrn: "MRN-1003", full_name: "Ahmad Hidayat", gender: "Laki-laki", age: 67, blood_type: "B", systolic_bp: 168, heart_rate: 104, oxygen_sat: 90.0, crp: 35.8, triage_category: "Merah (Kritis)", admission_risk: 0.95 },
  { id: 4, mrn: "MRN-1004", full_name: "Dewi Lestari", gender: "Perempuan", age: 26, blood_type: "AB", systolic_bp: 112, heart_rate: 68, oxygen_sat: 98.5, crp: 2.8, triage_category: "Hijau (Ringan)", admission_risk: 0.04 },
  { id: 5, mrn: "MRN-1005", full_name: "Rudi Hermawan", gender: "Laki-laki", age: 45, blood_type: "O", systolic_bp: 142, heart_rate: 88, oxygen_sat: 95.5, crp: 12.0, triage_category: "Kuning (Sedang)", admission_risk: 0.42 },
  { id: 6, mrn: "MRN-1006", full_name: "Endang Tri Astuti", gender: "Perempuan", age: 61, blood_type: "B", systolic_bp: 158, heart_rate: 96, oxygen_sat: 93.0, crp: 18.5, triage_category: "Kuning (Sedang)", admission_risk: 0.65 },
  { id: 7, mrn: "MRN-1007", full_name: "Fajar Nugroho", gender: "Laki-laki", age: 29, blood_type: "O", systolic_bp: 120, heart_rate: 74, oxygen_sat: 98.0, crp: 4.1, triage_category: "Hijau (Ringan)", admission_risk: 0.07 },
  { id: 8, mrn: "MRN-1008", full_name: "Sri Wahyuni", gender: "Perempuan", age: 72, blood_type: "A", systolic_bp: 182, heart_rate: 118, oxygen_sat: 88.5, crp: 42.0, triage_category: "Merah (Kritis)", admission_risk: 0.98 }
];

const INITIAL_RECORDS = [
  { id: 1, patient_id: 1, mrn: "MRN-1001", full_name: "Bambang Santoso", doctor_name: "dr. Hendra Sp.PD", diagnosis: "Krisis Hipertensi & Dispnea Akut", prescription: "Amlodipine 10mg, Furosemide 40mg IV, O2 Nasal 3 lpm", total_billing: 650000, payment_status: "LUNAS" },
  { id: 2, patient_id: 2, mrn: "MRN-1002", full_name: "Siti Rahmawati", doctor_name: "dr. Sarah Sp.A", diagnosis: "Faringitis Akut & Rinofaringitis", prescription: "Paracetamol 500mg, Amoxicillin 500mg, Vitamin C", total_billing: 185000, payment_status: "LUNAS" },
  { id: 3, patient_id: 3, mrn: "MRN-1003", full_name: "Ahmad Hidayat", doctor_name: "dr. Hendra Sp.PD", diagnosis: "PPOK Eksaserbasi Akut Berat", prescription: "O2 High Flow, Ceftriaxone 1g IV, Salbutamol Nebulizer", total_billing: 1450000, payment_status: "PENDING" },
  { id: 4, patient_id: 4, mrn: "MRN-1004", full_name: "Dewi Lestari", doctor_name: "dr. Sarah Sp.A", diagnosis: "Dispepsia Fungsional", prescription: "Omeprazole 20mg, Antasida Doen 500mg, Sukralfat Sirup", total_billing: 140000, payment_status: "LUNAS" },
  { id: 5, patient_id: 5, mrn: "MRN-1005", full_name: "Rudi Hermawan", doctor_name: "dr. Farhan Umum", diagnosis: "Bronkitis Akut & Febris H-3", prescription: "Azithromycin 500mg, Ambroxol 30mg, Paracetamol", total_billing: 275000, payment_status: "LUNAS" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTriage, setFilterTriage] = useState('ALL');
  const [backendOnline, setBackendOnline] = useState(false);

  // Form State for Triage Simulator & Registration
  const [formData, setFormData] = useState({
    full_name: '',
    gender: 'Laki-laki',
    age: 45,
    blood_type: 'O',
    systolic_bp: 125,
    heart_rate: 80,
    oxygen_sat: 97.0,
    crp: 5.0
  });

  // Live calculation of Triage Score
  const calculateLiveRisk = () => {
    const { age, systolic_bp, heart_rate, oxygen_sat, crp } = formData;
    const z = 0.025 * (age - 45) + 0.035 * (systolic_bp - 120) + 0.030 * (heart_rate - 75) - 0.220 * (oxygen_sat - 95) + 0.045 * (crp - 5) - 0.8;
    const prob = 1 / (1 + Math.exp(-z));
    let cat = "Hijau (Ringan)";
    let badgeBg = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    if (prob >= 0.70) {
      cat = "Merah (Kritis)";
      badgeBg = "bg-rose-500/20 text-rose-400 border-rose-500/40";
    } else if (prob >= 0.35) {
      cat = "Kuning (Sedang)";
      badgeBg = "bg-amber-500/20 text-amber-400 border-amber-500/40";
    }
    return { prob: Math.min(0.99, Math.max(0.01, prob)), cat, badgeBg };
  };

  const liveAssessment = calculateLiveRisk();

  useEffect(() => {
    // Check backend health
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'online') {
          setBackendOnline(true);
          fetch('/api/patients')
            .then(r => r.json())
            .then(liveP => setPatients(liveP))
            .catch(() => {});
          fetch('/api/medical-records')
            .then(r => r.json())
            .then(liveR => setRecords(liveR))
            .catch(() => {});
        }
      })
      .catch(() => {
        setBackendOnline(false);
      });
  }, []);

  const handleRegisterPatient = (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) return;

    const newPatient = {
      id: patients.length + 1,
      mrn: `MRN-${1001 + patients.length}`,
      full_name: formData.full_name,
      gender: formData.gender,
      age: Number(formData.age),
      blood_type: formData.blood_type,
      systolic_bp: Number(formData.systolic_bp),
      heart_rate: Number(formData.heart_rate),
      oxygen_sat: Number(formData.oxygen_sat),
      crp: Number(formData.crp),
      triage_category: liveAssessment.cat,
      admission_risk: Number(liveAssessment.prob.toFixed(2))
    };

    if (backendOnline) {
      fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(res => res.json())
        .then(saved => {
          setPatients([saved, ...patients]);
        })
        .catch(() => {
          setPatients([newPatient, ...patients]);
        });
    } else {
      setPatients([newPatient, ...patients]);
    }

    setFormData({
      full_name: '',
      gender: 'Laki-laki',
      age: 45,
      blood_type: 'O',
      systolic_bp: 125,
      heart_rate: 80,
      oxygen_sat: 97.0,
      crp: 5.0
    });
    setActiveTab('dashboard');
  };

  const filteredPatients = patients.filter(p => {
    const matchSearch = p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || p.mrn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTriage = filterTriage === 'ALL' || p.triage_category.includes(filterTriage);
    return matchSearch && matchTriage;
  });

  const criticalCount = patients.filter(p => p.triage_category.includes('Merah')).length;
  const urgentCount = patients.filter(p => p.triage_category.includes('Kuning')).length;
  const stableCount = patients.filter(p => p.triage_category.includes('Hijau')).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Enterprise Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-sky-600 flex items-center justify-center font-bold text-lg text-white shadow">
              EHR
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center space-x-2">
                <span>SIM Rekam Medis & AI Triage Klinis</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">v1.0.0</span>
              </h1>
              <p className="text-xs text-slate-400">Electronic Health Record & Machine Learning Triage Acuity Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-md">
              <span className={`h-2.5 w-2.5 rounded-full ${backendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="text-slate-300">FastAPI Backend: <strong>{backendOnline ? 'ONLINE (SQLite)' : 'DEMO MODE'}</strong></span>
            </div>
            <a
              href="https://github.com/ArjunaFransesco/sim-rekam-medis-klinik-ehr"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
            >
              GitHub Repo
            </a>
          </div>
        </div>
      </header>

      {/* Navigation Sub-header */}
      <nav className="border-b border-slate-800/80 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8 text-sm">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3.5 border-b-2 font-medium transition flex items-center space-x-2 ${activeTab === 'dashboard' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <span>📊 Dashboard & Antrean Pasien</span>
            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full">{patients.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-3.5 border-b-2 font-medium transition flex items-center space-x-2 ${activeTab === 'simulator' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <span>🩺 AI Triage & Pendaftaran Baru</span>
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`py-3.5 border-b-2 font-medium transition flex items-center space-x-2 ${activeTab === 'records' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <span>📋 Riwayat Rekam Medis (EHR)</span>
            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full">{records.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3.5 border-b-2 font-medium transition flex items-center space-x-2 ${activeTab === 'architecture' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <span>ℹ️ Arsitektur & Model ML</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Pasien Terdaftar</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{patients.length}</div>
            <div className="text-xs text-slate-500 mt-1">EHR Active Records</div>
          </div>
          <div className="bg-slate-900 border border-rose-950/60 rounded-lg p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-rose-500/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="text-xs font-semibold uppercase tracking-wider text-rose-400">Triase Merah (Kritis)</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{criticalCount}</div>
            <div className="text-xs text-slate-400 mt-1">Prioritas 1 Resusitasi Segera</div>
          </div>
          <div className="bg-slate-900 border border-amber-950/60 rounded-lg p-4 relative overflow-hidden">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400">Triase Kuning (Sedang)</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{urgentCount}</div>
            <div className="text-xs text-slate-400 mt-1">Prioritas 2 Observasi Medis</div>
          </div>
          <div className="bg-slate-900 border border-emerald-950/60 rounded-lg p-4 relative overflow-hidden">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Triase Hijau (Ringan)</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{stableCount}</div>
            <div className="text-xs text-slate-400 mt-1">Prioritas 3 Poliklinik Jalan</div>
          </div>
        </div>

        {/* TAB 1: DASHBOARD & ANTREAN PASIEN */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Cari pasien berdasarkan nama lengkap atau nomor MRN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
                <span className="text-xs text-slate-400 font-medium">Filter Kategori:</span>
                {['ALL', 'Merah', 'Kuning', 'Hijau'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterTriage(cat)}
                    className={`px-3 py-1.5 rounded text-xs font-medium border transition ${filterTriage === cat ? 'bg-sky-600 border-sky-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase font-semibold text-slate-400">
                    <tr>
                      <th className="px-4 py-3">MRN</th>
                      <th className="px-4 py-3">Nama Pasien</th>
                      <th className="px-4 py-3">Usia / Gender</th>
                      <th className="px-4 py-3">Gol. Darah</th>
                      <th className="px-4 py-3">Tanda Vital (BP / HR / SpO2)</th>
                      <th className="px-4 py-3">Status Triase AI</th>
                      <th className="px-4 py-3 text-right">Skor Risiko Acuity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                          Tidak ada data pasien yang sesuai kriteria pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((p) => {
                        const isRed = p.triage_category.includes('Merah');
                        const isYellow = p.triage_category.includes('Kuning');
                        const badgeColor = isRed
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : isYellow
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';

                        return (
                          <tr key={p.id} className="hover:bg-slate-850/50 transition">
                            <td className="px-4 py-3.5 font-mono text-xs text-sky-400 font-semibold">{p.mrn}</td>
                            <td className="px-4 py-3.5 font-medium text-slate-100">{p.full_name}</td>
                            <td className="px-4 py-3.5 text-slate-400">{p.age} th ({p.gender === 'Laki-laki' ? 'L' : 'P'})</td>
                            <td className="px-4 py-3.5 font-semibold text-slate-300">{p.blood_type}</td>
                            <td className="px-4 py-3.5">
                              <span className={`font-mono text-xs ${p.systolic_bp >= 160 ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>{p.systolic_bp}</span>
                              <span className="text-slate-500 text-xs">/80 mmHg &bull; </span>
                              <span className={`font-mono text-xs ${p.heart_rate >= 100 ? 'text-amber-400' : 'text-slate-300'}`}>{p.heart_rate} bpm &bull; </span>
                              <span className={`font-mono text-xs font-bold ${p.oxygen_sat < 94 ? 'text-rose-400' : 'text-emerald-400'}`}>{p.oxygen_sat}% SpO2</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
                                {p.triage_category}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono text-xs font-bold text-slate-200">
                              {(p.admission_risk * 100).toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI TRIAGE & PENDAFTARAN PASIEN BARU */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-6 shadow">
              <h2 className="text-lg font-bold text-slate-100 mb-1">Registrasi Pasien & Perekaman Vital Signs</h2>
              <p className="text-xs text-slate-400 mb-6">Masukkan data demografi dan tanda vital pasien untuk penilaian triase otomatis via model Random Forest.</p>

              <form onSubmit={handleRegisterPatient} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Nama Lengkap Pasien</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: drg. Nurul Izzati"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Jenis Kelamin</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Usia Pasien: <span className="text-sky-400 font-bold">{formData.age} Tahun</span></label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full accent-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Golongan Darah</label>
                    <select
                      value={formData.blood_type}
                      onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-md px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                    >
                      <option value="O">O</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4 mt-4">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">Parameter Tanda Vital & Biomarker</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Tekanan Darah Sistolik (SBP)</span>
                        <span className="font-mono text-sky-400 font-bold">{formData.systolic_bp} mmHg</span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="220"
                        value={formData.systolic_bp}
                        onChange={(e) => setFormData({ ...formData, systolic_bp: Number(e.target.value) })}
                        className="w-full accent-sky-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Frekuensi Denyut Nadi (Heart Rate)</span>
                        <span className="font-mono text-sky-400 font-bold">{formData.heart_rate} bpm</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="160"
                        value={formData.heart_rate}
                        onChange={(e) => setFormData({ ...formData, heart_rate: Number(e.target.value) })}
                        className="w-full accent-sky-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Saturasi Oksigen Perifer (SpO2)</span>
                        <span className={`font-mono font-bold ${formData.oxygen_sat < 94 ? 'text-rose-400' : 'text-emerald-400'}`}>{formData.oxygen_sat}%</span>
                      </div>
                      <input
                        type="range"
                        min="75"
                        max="100"
                        step="0.5"
                        value={formData.oxygen_sat}
                        onChange={(e) => setFormData({ ...formData, oxygen_sat: Number(e.target.value) })}
                        className="w-full accent-sky-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>C-Reactive Protein (CRP Inflamasi)</span>
                        <span className="font-mono text-sky-400 font-bold">{formData.crp} mg/L</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="60"
                        step="0.5"
                        value={formData.crp}
                        onChange={(e) => setFormData({ ...formData, crp: Number(e.target.value) })}
                        className="w-full accent-sky-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-sky-600 hover:bg-sky-500 text-white font-medium px-6 py-2.5 rounded-md transition text-sm flex items-center space-x-2"
                  >
                    <span>Simpan & Daftarkan Pasien</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Live Triage Score Card Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col justify-between shadow">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Penilaian Triase Otomatis (Live)</h3>
                
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 text-center mb-6">
                  <div className="text-xs text-slate-400 mb-1">Kategori Triase AI</div>
                  <div className={`inline-block px-4 py-1.5 rounded-full text-base font-bold border mt-1 ${liveAssessment.badgeBg}`}>
                    {liveAssessment.cat}
                  </div>
                  <div className="mt-4">
                    <div className="text-3xl font-extrabold text-slate-100 font-mono">
                      {(liveAssessment.prob * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Indeks Risiko Acuity Klinis</div>
                  </div>
                </div>

                {/* Progress Risk Bar */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Stabil (0%)</span>
                    <span>Kritis (100%)</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${liveAssessment.prob >= 0.70 ? 'bg-rose-500' : liveAssessment.prob >= 0.35 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, liveAssessment.prob * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded border border-slate-800/80 leading-relaxed">
                  <span className="font-semibold text-sky-400 block mb-1">Rekomendasi Tatalaksana:</span>
                  {liveAssessment.prob >= 0.70 && "Segera kirim ke Ruang Resusitasi / IGD Kritis. Siapkan monitoring hemodinamik ketat dan pasang oksigenasi konsentrasi tinggi."}
                  {liveAssessment.prob >= 0.35 && liveAssessment.prob < 0.70 && "Tempatkan di Ruang Observasi Tindakan. Berikan medikasi awal dan pantau tanda vital per 30 menit."}
                  {liveAssessment.prob < 0.35 && "Arahkan pasien ke Poliklinik Rawat Jalan. Pasien dalam kondisi hemodinamik stabil tanpa ancaman jalan nafas."}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-800 pt-4 text-xs text-slate-500">
                Model: Random Forest (100 Trees) &bull; Dilatih dengan standar ESI/ATS
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RIWAYAT REKAM MEDIS (EHR) */}
        {activeTab === 'records' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-100">Buku Rekam Medis Elektronik (Medical Records)</h2>
                <p className="text-xs text-slate-400">Riwayat diagnosis klinis, resep obat dokter, dan status penagihan/billing.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase font-semibold text-slate-400">
                  <tr>
                    <th className="px-4 py-3">ID / MRN</th>
                    <th className="px-4 py-3">Nama Pasien</th>
                    <th className="px-4 py-3">Dokter Pemeriksa</th>
                    <th className="px-4 py-3">Diagnosis Klinis</th>
                    <th className="px-4 py-3">Terapi / Resep Obat</th>
                    <th className="px-4 py-3">Billing</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-850/50 transition">
                      <td className="px-4 py-3.5 font-mono text-xs text-sky-400">
                        {r.mrn || `REC-${r.id}`}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-100">{r.full_name || `Pasien #${r.patient_id}`}</td>
                      <td className="px-4 py-3.5 text-slate-300 font-medium">{r.doctor_name}</td>
                      <td className="px-4 py-3.5 text-slate-200">{r.diagnosis}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-400 max-w-xs truncate">{r.prescription}</td>
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-200">
                        Rp {r.total_billing ? r.total_billing.toLocaleString('id-ID') : '0'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${r.payment_status === 'LUNAS' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                          {r.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ARSITEKTUR & MODEL ML */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow">
              <h2 className="text-lg font-bold text-slate-100 mb-2">Arsitektur Sistem & Spesifikasi Teknis</h2>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                SIM Rekam Medis & AI Triage mengintegrasikan arsitektur Web Enterprise Full-Stack dengan algoritma Machine Learning Scikit-Learn untuk memberikan penilaian triase objektif secara real-time.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">Frontend Layer</div>
                  <div className="text-sm font-semibold text-slate-200">React 18 + Vite SPA</div>
                  <p className="text-xs text-slate-400 mt-1">Antarmuka solid dark Slate-950, responsive table, live simulator slider, zero AI-slop design.</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">API & Service Layer</div>
                  <div className="text-sm font-semibold text-slate-200">FastAPI & Python 3.11</div>
                  <p className="text-xs text-slate-400 mt-1">REST API terstruktur dengan Pydantic schemas, CORS support, dan automated OpenAPI docs.</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1">Storage & AI Layer</div>
                  <div className="text-sm font-semibold text-slate-200">SQLite & Random Forest</div>
                  <p className="text-xs text-slate-400 mt-1">Database relasional terindeks untuk EHR dan model ensemble 100 estimator dengan standarisasi fitur.</p>
                </div>
              </div>

              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3">Formula & Pembobotan Fitur Klinis</h3>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
                <div>Fitur 1: SpO2 Saturasi Oksigen (Bobot Prioritas Tertinggi - Indikasi Hipoksemia Berat)</div>
                <div>Fitur 2: Tekanan Darah Sistolik / SBP (Krisis Hipertensi &gt; 170 mmHg atau Syok &lt; 90 mmHg)</div>
                <div>Fitur 3: Heart Rate (Takikardia &gt; 100 bpm atau Bradikardia &lt; 50 bpm)</div>
                <div>Fitur 4: C-Reactive Protein / CRP (Marker Inflamasi Akut Sepsis)</div>
                <div>Fitur 5: Usia Pasien (Faktor Risiko Geriatrik & Komorbiditas)</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400">
          <div>
            Built with React, FastAPI & Scikit-Learn by <a href="https://github.com/ArjunaFransesco" className="text-sky-400 hover:underline">Arjuna Fransesco</a>
          </div>
          <div className="mt-2 sm:mt-0 flex space-x-4">
            <span>Portfolio: <strong>sim-rekam-medis-klinik-ehr</strong></span>
            <span>&bull;</span>
            <span>License: MIT 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
