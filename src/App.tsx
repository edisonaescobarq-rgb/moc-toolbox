import { useMemo, useState } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #f0f4f8;
    --surface: #ffffff;
    --surface2: #f7f9fc;
    --border: #dde3ec;
    --border2: #c8d2e0;
    --accent: #1d4ed8;
    --accent2: #1e40af;
    --red: #dc2626;
    --green: #16a34a;
    --amber: #d97706;
    --purple: #7c3aed;
    --text: #1a2332;
    --text2: #4a5e78;
    --text3: #8fa0b8;
    --mono: 'DM Mono', monospace;
    --sans: 'Plus Jakarta Sans', sans-serif;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 12px 32px rgba(0,0,0,0.1), 0 4px 8px rgba(0,0,0,0.06);
  }

  body { background: var(--bg); color: var(--text); font-family: var(--sans); }

  input, select, textarea {
    background: var(--surface);
    border: 1.5px solid var(--border);
    color: var(--text);
    font-family: var(--mono);
    font-size: 12px;
    border-radius: 8px;
    padding: 10px 13px;
    width: 100%;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-shadow: var(--shadow-sm);
  }
  input:focus, select:focus, textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(29,78,216,0.12);
  }
  input::placeholder, textarea::placeholder { color: var(--text3); }
  select option { background: var(--surface); color: var(--text); }

  label { cursor: pointer; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  .fadeIn { animation: fadeIn 0.25s ease forwards; }

  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  .pulse { animation: pulse 2s infinite; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }
`;

// ─── DATA ────────────────────────────────────────────────────────────────────

const vibrationRows = [
  { id: "alt_gt_fl300",   category: "Altitude",                  parameter: "> FL300",               scores: [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0] },
  { id: "spd_le_250",     category: "Speed (kts)",               parameter: "≤ 250",                 scores: [0,1,1,1,1,4,0,1,3,1,0,1,1,0,0,0] },
  { id: "spd_250_280",    category: "Speed (kts)",               parameter: "250 ≤ S < 280",          scores: [1,3,4,3,2,0,0,3,1,3,4,3,3,0,0,0] },
  { id: "spd_280_320",    category: "Speed (kts)",               parameter: "280 ≤ S < 320",          scores: [3,2,2,2,3,0,0,3,1,3,4,3,4,0,0,0] },
  { id: "spd_ge_320",     category: "Speed (kts)",               parameter: "S ≥ 320",               scores: [4,1,1,1,2,0,0,3,1,3,4,3,4,0,0,0] },
  { id: "phase_climb",    category: "Flight Phase",              parameter: "Climb",                  scores: [3,1,4,0,3,0,0,6,3,1,0,1,1,0,0,0] },
  { id: "phase_cruise",   category: "Flight Phase",              parameter: "Cruise",                 scores: [3,3,3,5,3,0,0,0,0,3,6,3,3,0,0,0] },
  { id: "phase_descent",  category: "Flight Phase",              parameter: "Descent",                scores: [2,1,0,0,0,0,0,0,0,1,0,1,1,0,0,0] },
  { id: "phase_approach", category: "Flight Phase",              parameter: "Approach",               scores: [0,1,3,1,0,6,0,0,3,1,0,1,1,0,0,0] },
  { id: "slatflap_clean",    category: "Slats / Flaps",          parameter: "Clean",                  scores: [4,2,1,2,4,0,0,4,2,3,4,3,3,0,0,0] },
  { id: "slatflap_extended", category: "Slats / Flaps",          parameter: "Extended",               scores: [0,1,2,1,1,10,0,0,2,1,0,1,1,0,0,0] },
  { id: "area_cockpit",   category: "Affected Area",             parameter: "Cockpit",                scores: [0,2,1,1,3,1,0,6,0,0,0,3,0,0,0,0] },
  { id: "area_fwd",       category: "Affected Area",             parameter: "FWD Cabin",              scores: [1,1,2,2,1,1,0,0,0,0,0,3,0,0,0,0] },
  { id: "area_mid",       category: "Affected Area",             parameter: "Mid Cabin",              scores: [2,1,3,3,1,3,0,-5,6,6,6,0,3,0,0,0] },
  { id: "area_aft",       category: "Affected Area",             parameter: "Aft Cabin",              scores: [4,2,0,0,2,1,0,-10,0,0,0,0,3,0,0,0] },
  { id: "perception_whistling", category: "Perception",          parameter: "Whistling",              scores: [0,0,0,0,0,0,0,0,0,0,0,20,20,0,0,0] },
  { id: "perception_rumbling",  category: "Perception",          parameter: "Rumbling",               scores: [0,0,0,0,0,0,0,10,20,20,20,0,0,0,0,0] },
  { id: "perception_pure",      category: "Perception",          parameter: "Pure Vibration",         scores: [20,20,20,20,20,20,0,10,0,0,0,0,0,0,0,0] },
  { id: "intensity_light",    category: "Intensity",             parameter: "Light",                  scores: [0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0] },
  { id: "intensity_moderate", category: "Intensity",             parameter: "Moderate",               scores: [1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0] },
  { id: "intensity_strong",   category: "Intensity",             parameter: "Strong",                 scores: [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { id: "felt_vertically",  category: "Felt",                    parameter: "Vertically",             scores: [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { id: "felt_laterally",   category: "Felt",                    parameter: "Laterally",              scores: [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0] },
  { id: "param_airbrakes",  category: "Param Change (AP ON)",    parameter: "Airbrakes Ext.",         scores: [3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { id: "param_thrust",     category: "Param Change (AP ON)",    parameter: "Thrust",                 scores: [2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0] },
  { id: "param_altitude",   category: "Param Change (AP ON)",    parameter: "Altitude",               scores: [2,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0] },
  { id: "param_turn",       category: "Param Change (AP ON)",    parameter: "Turn",                   scores: [0,0,5,0,1,0,0,0,0,0,0,0,0,0,0,0] },
  { id: "ctrl_yaw",         category: "Flight Controls (AP OFF)", parameter: "Yaw stops vibration",   scores: [0,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0] },
  { id: "ctrl_pitch",       category: "Flight Controls (AP OFF)", parameter: "Pitch stops vibration",  scores: [10,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { id: "ctrl_roll",        category: "Flight Controls (AP OFF)", parameter: "Roll stops vibration",   scores: [0,0,10,0,2,0,0,0,0,0,0,0,0,0,0,0] },
  { id: "ctrl_not_tried",   category: "Flight Controls (AP OFF)", parameter: "Not Tried",              scores: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] },
  { id: "ctrl_no_effect",   category: "Flight Controls (AP OFF)", parameter: "No Effect",              scores: [0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0] },
];

const vibrationTypes = [
  { id: 1, label: "T1", short: "Elevator", ref: "TASK 27-30-00-810-850-A" },
  { id: 2, label: "T2", short: "Elevator Oscillation", ref: "TASK 27-30-00-810-849-A" },
  { id: 3, label: "T3", short: "Aileron", ref: "TASK 27-10-00-810-835-A" },
  { id: 4, label: "T4", short: "Aileron Oscillation", ref: "TASK 27-10-00-810-840-A" },
  { id: 5, label: "T5", short: "Rudder", ref: "TASK 27-20-00-810-802-A" },
  { id: 6, label: "T6", short: "Flap", ref: "TASK 27-54-00-810-801-A" },
  { id: 7, label: "T7", short: "N/A", ref: "Not applicable" },
  { id: 8, label: "T8", short: "NLG Door", ref: "TASK 32-20-00-810-803-A" },
  { id: 9, label: "T9", short: "Belly Fairing", ref: "TASK 53-35-00-810-801-A" },
  { id: 10, label: "T10", short: "Belly Fairing", ref: "TASK 53-35-00-810-801-A" },
  { id: 11, label: "T11", short: "Belly Fairing", ref: "TASK 53-35-00-810-801-A" },
  { id: 12, label: "T12", short: "PAX Door", ref: "TASK 52-11-00-810-826-A" },
  { id: 13, label: "T13", short: "PAX Door (Aft)", ref: "TASK 52-13-00-810-826-A" },
  { id: 14, label: "T14", short: "N/A", ref: "Not applicable" },
  { id: 15, label: "T15", short: "Rumbling Cockpit", ref: "Refer to TASK 21-26" },
  { id: 16, label: "T16", short: "Rudder Pedals", ref: "Type 16 corrective action" },
];

// Part Numbers afectados por AOT A55N004-25 (AD 2026-0083)
const AOT_A55N004_PN = [
  "D55471000XXXXX","D55471001XXXXX","D55471002XXXXX","D55471004XXXXX",
  "D55471006000XX","D55471006001XX","D55471006002XX","D55471006003XX",
  "D55471006004XX","D55471006100XX","D55471006102XX","D55471006104XX"
];

const vibrationActions = {
  1: ["Airframe vibration due to the Elevator (TASK 27-30-00-810-850-A)", "Review airbrake- and pitch-related effects"],
  2: ["Elevator oscillation path (TASK 27-30-00-810-849-A)", "Check F/CTL elevator indication on ECAM"],
  3: ["Airframe vibration due to the Aileron (TASK 27-10-00-810-835-A)", "Review roll-input effect"],
  4: ["Aileron oscillation path (TASK 27-10-00-810-840-A)", "Check AIL servo / ECAM indication"],
  5: [
    "Airframe vibration due to the Rudder (TASK 27-20-00-810-802-A)",
    "Verificar P/N del Rudder en Maintenix contra lista AOT A55N004-25",
    "Si P/N está en lista AOT: activar AD-A320FAM-55-C4540-PART1, PART2 y AD 2026-0083",
    "Si P/N NO está en lista AOT: continuar con GVI a superficies de vuelo primarias",
    "Si score Rudder >20 y no identificado por Decision Tree: activar AD-A320FAM-55-C4540-TEST/LIMIT/DFDR",
    "Enviar a Airbus via TechRequest: VRS + Decision Table + DFDR + acciones correctivas",
    "⚠ AD 2026-0083: fuente de vibración debe ser confirmada por Airbus antes de 200 FC"
  ],
  6: ["Flap vibration path (TASK 27-54-00-810-801-A)", "Correlate with extended slat/flap configuration"],
  8: ["NLG aft door clearance path (TASK 32-20-00-810-803-A)"],
  9: ["Mid-cabin belly fairing path (TASK 53-35-00-810-801-A)"],
  10: ["Mid-cabin belly fairing path (TASK 53-35-00-810-801-A)"],
  11: ["Mid-cabin belly fairing path (TASK 53-35-00-810-801-A)"],
  12: ["FWD PAX door vibration / noise path (TASK 52-11-00-810-826-A)"],
  13: ["AFT PAX door vibration / noise path (TASK 52-13-00-810-826-A)"],
  15: ["Refer to TASK 21-26 for cockpit rumbling only"],
  16: ["Rudder pedal-only vibration path (TASK 27-20-00-810-917-A)"],
};

const odorRows = [
  { id: "gnd", category: "GND / FLT", parameter: "Ground", scores: [4,3,3,4,4,4,4,3,0] },
  { id: "flt", category: "GND / FLT", parameter: "Flight", scores: [4,4,4,2,4,4,4,3,0] },
  { id: "gate", category: "Flight Phase", parameter: "Gate", scores: [3,3,3,3,2,2,1,3,0] },
  { id: "taxi", category: "Flight Phase", parameter: "Taxi", scores: [3,3,3,3,2,2,1,3,0] },
  { id: "to", category: "Flight Phase", parameter: "Takeoff", scores: [3,3,3,3,2,2,3,1,0] },
  { id: "climb", category: "Flight Phase", parameter: "Climb", scores: [1,4,4,3,2,2,3,0,0] },
  { id: "cruise", category: "Flight Phase", parameter: "Cruise", scores: [1,4,4,3,2,2,3,0,0] },
  { id: "descent", category: "Flight Phase", parameter: "Descent", scores: [4,3,3,1,2,2,0,3,0] },
  { id: "apu_on", category: "APU Bleed", parameter: "ON", scores: [5,0,0,3,5,5,1,5,0] },
  { id: "apu_off", category: "APU Bleed", parameter: "OFF", scores: [4,2,2,0,2,2,1,3,0] },
  { id: "x_open", category: "X Bleed", parameter: "Open", scores: [4,1,1,0,1,1,3,2,0] },
  { id: "x_closed", category: "X Bleed", parameter: "Closed", scores: [3,3,3,0,3,3,3,1,0] },
  { id: "pack1_only", category: "Packs", parameter: "Pack 1 ON / Pack 2 OFF", scores: [1,5,0,3,5,0,3,3,0] },
  { id: "pack2_only", category: "Packs", parameter: "Pack 2 ON / Pack 1 OFF", scores: [1,0,5,3,0,5,3,3,0] },
  { id: "eng1", category: "ENG Bleed", parameter: "ENG 1 Bleed ON", scores: [2,5,0,2,3,0,3,2,0] },
  { id: "eng2", category: "ENG Bleed", parameter: "ENG 2 Bleed ON", scores: [2,0,5,2,0,3,3,2,0] },
  { id: "cockpit", category: "Affected Area", parameter: "Cockpit", scores: [4,4,2,2,4,2,2,2,0] },
  { id: "cabin", category: "Affected Area", parameter: "Cabin", scores: [4,2,4,2,2,4,2,2,0] },
  { id: "hyd", category: "Odor Type", parameter: "Burn Eyes / Hydraulic", scores: [0,0,0,5,2,2,8,3,0] },
  { id: "dirty", category: "Odor Type", parameter: "Dirty Socks", scores: [3,3,3,0,2,2,0,0,0] },
  { id: "musty", category: "Odor Type", parameter: "Musty / Deicing Fluid", scores: [2,1,1,2,5,5,0,2,0] },
  { id: "oil", category: "Odor Type", parameter: "Oil / Acrid", scores: [5,5,5,2,0,0,1,0,0] },
  { id: "smoke", category: "Odor Type", parameter: "Smoke / Burning Smell", scores: [0,0,0,0,0,0,0,0,25] },
  { id: "deice_yes", category: "De-Icing", parameter: "Yes, last 2 flights", scores: [3,3,3,6,3,3,0,12,0] },
];

const odorTypes = [
  { id: 1, label: "T1", short: "APU", ref: "AMM 49-00-00-200-811/812/814/816" },
  { id: 2, label: "T2", short: "ENG 1", ref: "TASK 71-00-00-810-801/802/847" },
  { id: 3, label: "T3", short: "ENG 2", ref: "TASK 71-00-00-810-801/802/847" },
  { id: 4, label: "T4", short: "External / Bird Strike", ref: "AMM 05-51-14-200-803" },
  { id: 5, label: "T5", short: "Pack 1", ref: "Pack 1 corrective / ECS decontamination" },
  { id: 6, label: "T6", short: "Pack 2", ref: "Pack 2 corrective / ECS decontamination" },
  { id: 7, label: "T7", short: "Hydraulic", ref: "AMM 29-00-00-790-001" },
  { id: 8, label: "T8", short: "De-Icing", ref: "AMM 49-16-00-210 + AMM 21-00-00-615-802" },
  { id: 9, label: "T9", short: "Electrical", ref: "AMM 12-34-24 / 24-41-00" },
];

// ECS decontamination tasks by level (AMM 05-50-00-810-831-A Rev 52)
const ecsDecon = {
  A:   ["ECS descontaminación Level A → AMM 21-00-00-615-802"],
  B:   ["ECS descontaminación Level B → AMM 21-00-00-615-803", "Bleed air ducts Level B → AMM 36-10-00-615-801"],
  C:   ["ECS descontaminación Level C → AMM 21-00-00-615-804", "Bleed air ducts Level C → AMM 36-10-00-615-802"],
  UNK: ["Nivel desconocido → aplicar Level C (conservador)", "ECS descontaminación Level C → AMM 21-00-00-615-804", "Bleed air ducts Level C → AMM 36-10-00-615-802"],
};

// APU inspection tasks by level
const apuInsp = {
  A:   ["APU 131-9(A): inspección Level A → AMM 49-00-00-200-812", "APU APS3200: inspección Level A → AMM 49-00-00-200-814"],
  B:   ["APU 131-9(A): inspección Level B/C → AMM 49-00-00-200-811", "APU APS3200: inspección Level B/C → AMM 49-00-00-200-816"],
  C:   ["APU 131-9(A): inspección Level B/C → AMM 49-00-00-200-811", "APU APS3200: inspección Level B/C → AMM 49-00-00-200-816"],
  UNK: ["APU 131-9(A): inspección Level B/C → AMM 49-00-00-200-811", "APU APS3200: inspección Level B/C → AMM 49-00-00-200-816"],
};

function getOdorActions(typeId, level) {
  const lvl = level || "UNK";
  switch(typeId) {
    case 1: return [
      "⚠ PREPARAR contacto con Bomberos — humo/fumes puede ser fuego",
      ...apuInsp[lvl],
      ...ecsDecon[lvl],
    ];
    case 2: return [
      "⚠ PREPARAR contacto con Bomberos — humo/fumes puede ser fuego",
      "ENG 1: smoke/oil smell → TASK 71-00-00-810-801-A / 71-00-00-810-802-A",
      ...ecsDecon[lvl],
    ];
    case 3: return [
      "⚠ PREPARAR contacto con Bomberos — humo/fumes puede ser fuego",
      "ENG 2: smoke/oil smell → TASK 71-00-00-810-801-A / 71-00-00-810-802-A",
      ...ecsDecon[lvl],
    ];
    case 4: return [
      "Bird strike inspection → AMM 05-51-14-200-803",
    ];
    case 5: return [
      "⚠ PREPARAR contacto con Bomberos — humo/fumes puede ser fuego",
      "PACK 1: inspección APU según tipo instalado",
      ...apuInsp[lvl],
      ...ecsDecon[lvl],
    ];
    case 6: return [
      "⚠ PREPARAR contacto con Bomberos — humo/fumes puede ser fuego",
      "PACK 2: inspección APU según tipo instalado",
      ...apuInsp[lvl],
      ...ecsDecon[lvl],
    ];
    case 7: return [
      "Check external leaks hydraulic components → AMM 29-00-00-790-001",
      "GVI APU air-inlet plenum y APU air intake → AMM 49-16-00-210-802/805",
    ];
    case 8: return [
      "De-icing fluid ingestion: GVI APU air-inlet plenum → AMM 49-16-00-210-802/805",
      "ECS descontaminación Level A → AMM 21-00-00-615-802",
    ];
    case 9: return [
      "⚠ PREPARAR contacto con Bomberos — causa eléctrica puede reiniciar fuego al energizar",
      "⚠ DOS PERSONAS requeridas: una en cabina, una monitoreando humo/fuego",
      "Ground aircraft → AMM 12-34-24-869-002",
      "De-energizar circuitos eléctricos → AMM 24-41-00-862-002",
      "Verificar circuit breakers — si hay disparados, aplicar TSM correspondiente",
      "Identificar causa en área visible; si no: remover paneles y activar CB uno a uno",
      "Energizar → AMM 24-41-00-861-002 (External Power)",
    ];
    default: return ["Consultar AMM 05-50-00-810-831-A Rev 52"];
  }
}

const odorLevels = [
  { id: "A", label: "Level A", note: "Temporary odor" },
  { id: "B", label: "Level B", note: "Persistent, dissipates" },
  { id: "C", label: "Level C", note: "Continuous, discomfort" },
  { id: "UNK", label: "Unknown", note: "Conservative path" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function topThree(types, totals) {
  return types.map((t, i) => ({ ...t, total: totals[i] || 0 })).sort((a, b) => b.total - a.total).slice(0, 3);
}
function groupByCategory(rows) {
  const map = {};
  rows.forEach(r => { if (!map[r.category]) map[r.category] = []; map[r.category].push(r); });
  return map;
}
function computeSelectedMap(rows) {
  const map = {};
  rows.forEach(r => { if (!map[r.category]) map[r.category] = []; map[r.category].push(r.parameter); });
  return map;
}
function useMultiSelect(rows) {
  const [selectedIds, setSelectedIds] = useState([]);
  const selectedRows = useMemo(() => rows.filter(r => selectedIds.includes(r.id)), [rows, selectedIds]);
  const toggle = row => setSelectedIds(prev => prev.includes(row.id) ? prev.filter(id => id !== row.id) : [...prev, row.id]);
  const reset = () => setSelectedIds([]);
  return { selectedIds, selectedRows, toggle, reset };
}

// ─── MAILTO HELPER ────────────────────────────────────────────────────────────
// Builds a mailto: URL without encoding the email addresses themselves.
// Only subject and body are percent-encoded.
function buildMailto(to, cc, subject, body) {
  // Abre Gmail directamente en el navegador
  const cleanList = str => str.split(/[;,]/).map(s => s.trim()).filter(Boolean).join(",");
  const toStr  = cleanList(to);
  const ccStr  = cleanList(cc);
  const params = new URLSearchParams();
  if (toStr)  params.set("to",  toStr);
  if (ccStr)  params.set("cc",  ccStr);
  params.set("su",   subject);
  params.set("body", body);
  return "https://mail.google.com/mail/?view=cm&fs=1&" + params.toString();
}

// ─── SCORE BAR ────────────────────────────────────────────────────────────────

function ScoreBar({ value, max = 60 }) {
  const pct = Math.min(100, (value / max) * 100);
  const color = value >= 40 ? "#dc2626" : value >= 20 ? "#d97706" : "var(--accent)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ flex: 1, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, transition: "width 0.4s ease", borderRadius: 2 }} />
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color, minWidth: 24, textAlign: "right", fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function CheckItem({ row, checked, onToggle }) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 5,
      cursor: "pointer", transition: "background 0.15s",
      background: checked ? "rgba(29,78,216,0.08)" : "transparent",
      border: checked ? "1px solid rgba(29,78,216,0.25)" : "1px solid transparent",
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: 3, flexShrink: 0,
        border: `1.5px solid ${checked ? "var(--accent)" : "var(--border2)"}`,
        background: checked ? "var(--accent)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
      }}>
        {checked && <span style={{ color: "white", fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>}
      </div>
      <input type="checkbox" checked={checked} onChange={onToggle} style={{ display: "none" }} />
      <span style={{ fontSize: 12, color: checked ? "var(--text)" : "var(--text2)", fontFamily: "var(--mono)" }}>{row.parameter}</span>
    </label>
  );
}

function CatPanel({ category, rows, selectedIds, toggle }) {
  return (
    <div style={{ background: "var(--surface2)", border: "1.5px solid var(--border)", borderRadius: 8, padding: 10, marginBottom: 8 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6, fontFamily: "var(--mono)" }}>{category}</div>
      {rows.map(row => <CheckItem key={row.id} row={row} checked={selectedIds.includes(row.id)} onToggle={() => toggle(row)} />)}
    </div>
  );
}

function RankCard({ item, rank }) {
  const rankColors = ["#d97706", "#94a3b8", "#cd7f32"];
  const rankLabels = ["01", "02", "03"];
  return (
    <div style={{ background: "var(--surface2)", border: "1.5px solid var(--border)", borderRadius: 8, padding: "12px 14px", marginBottom: 6, borderLeft: `4px solid ${rankColors[rank]}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: rankColors[rank], fontWeight: 700 }}>#{rankLabels[rank]} </span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text)", fontWeight: 600 }}>{item.short}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", marginLeft: 8 }}>{item.label}</span>
        </div>
      </div>
      <ScoreBar value={item.total} />
      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", marginTop: 6 }}>{item.ref}</div>
    </div>
  );
}

function Header({ screen, setScreen }) {
  return (
    <div style={{ borderBottom: "1.5px solid var(--border)", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)", boxShadow: "var(--shadow-sm)", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {screen !== "home" && (
          <button onClick={() => setScreen("home")} style={{ background: "var(--surface2)", border: "1.5px solid var(--border2)", color: "var(--text2)", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 11, fontFamily: "var(--mono)" }}>← HOME</button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "var(--accent)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✈</div>
          <div>
            <div style={{ fontFamily: "var(--sans)", fontWeight: 800, fontSize: 14, color: "var(--text)", letterSpacing: "-0.02em" }}>MOC Toolbox</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", letterSpacing: "0.08em" }}>LATAM · OPERATIONAL ENGINEERING</div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 6, height: 6, background: "var(--green)", borderRadius: "50%" }} className="pulse" />
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)" }}>edison · ADM</span>
      </div>
    </div>
  );
}

function HomeScreen({ setScreen }) {
  const modules = [
    { key: "vibration", icon: "〜", label: "Vibration", sub: "Scoring Matrix", color: "var(--accent)" },
    { key: "odor", icon: "◎", label: "Odor / Smoke", sub: "Source Detection", color: "#d97706" },
    { key: "aog", icon: "⚡", label: "AOG Workflow", sub: "Email Generator", color: "#dc2626" },
    { key: "directorio", icon: "📞", label: "Directorio", sub: "Contactos MOC SSC", color: "#0891b2" },
    { key: "oil", icon: "🛢", label: "Oil Consumption", sub: "Engine Oil Tracking", color: "#16a34a" },
    { key: "birdstrike", icon: "🐦", label: "Bird Strike", sub: "A320 Checklist AMM", color: "#7c3aed" },
    { key: "mel", icon: "📘", label: "MEL", sub: "Coming Soon", color: "#8fa0b8", disabled: true },
  ];
  return (
    <div style={{ padding: "40px 24px", maxWidth: 900, margin: "0 auto" }} className="fadeIn">
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", letterSpacing: "0.15em", marginBottom: 10 }}>// OPERATIONAL TOOLS</div>
        <h1 style={{ fontFamily: "var(--sans)", fontWeight: 800, fontSize: 32, color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1.1 }}>MOC Toolbox v2.1</h1>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        {modules.map(m => (
          <button key={m.key} onClick={() => !m.disabled && setScreen(m.key)} disabled={m.disabled}
            style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 12, padding: "24px 20px", textAlign: "left", cursor: m.disabled ? "not-allowed" : "pointer", opacity: m.disabled ? 0.4 : 1, transition: "all 0.2s", borderTop: `4px solid ${m.color}`, boxShadow: "var(--shadow-sm)" }}
            onMouseOver={e => { if (!m.disabled) { e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.transform = "translateY(-2px)"; }}}
            onMouseOut={e => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ fontSize: 28, marginBottom: 12, color: m.color }}>{m.icon}</div>
            <div style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 16, color: "var(--text)", marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)" }}>{m.sub}</div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 32, padding: 16, background: "var(--surface)", borderRadius: 10, border: "1.5px solid var(--border)", display: "flex", gap: 32, boxShadow: "var(--shadow-sm)" }}>
        {[["Vibration Types", "16"], ["Odor Sources", "9"], ["AOG Templates", "5"], ["Contactos", "424+"]].map(([label, val]) => (
          <div key={label}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>{val}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VibrationModule() {
  const rowsByCategory = useMemo(() => groupByCategory(vibrationRows), []);
  const { selectedIds, selectedRows, toggle, reset } = useMultiSelect(vibrationRows);
  const [vStation, setVStation] = useState("");
  const [vHistory, setVHistory] = useState("");
  const selectedMap = useMemo(() => computeSelectedMap(selectedRows), [selectedRows]);
  const totals = useMemo(() => {
    return selectedRows.reduce((acc, row) => acc.map((v, i) => v + row.scores[i]), new Array(vibrationTypes.length).fill(0));
  }, [selectedRows]);
  // selectedMap used for future deferral logic only
  const ranking = useMemo(() => topThree(vibrationTypes, totals), [totals]);
  const best = ranking[0];
  const rudderInTop3 = ranking.find(r => r.id === 5);
  return (
    <div style={{ padding: "20px 24px", maxWidth: 1100, margin: "0 auto" }} className="fadeIn">
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.12em", marginBottom: 4 }}>// VIBRATION · SCORING MATRIX</div>
          <h2 style={{ fontFamily: "var(--sans)", fontWeight: 800, fontSize: 24, color: "var(--text)" }}>Vibration Tool</h2>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {selectedIds.length > 0 && <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", background: "rgba(29,78,216,0.08)", padding: "4px 10px", borderRadius: 20, border: "1.5px solid rgba(29,78,216,0.2)" }}>{selectedIds.length} selected</span>}
          <button onClick={reset} style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)", background: "var(--surface)", border: "1.5px solid var(--border2)", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>Reset</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
        <div style={{ maxHeight: "75vh", overflowY: "auto", paddingRight: 4 }}>
          {Object.entries(rowsByCategory).map(([cat, rows]) => <CatPanel key={cat} category={cat} rows={rows} selectedIds={selectedIds} toggle={toggle} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 10, padding: 16, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>Top Sources</div>
            {ranking.map((item, i) => <RankCard key={item.id} item={item} rank={i} />)}
          </div>
          <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 10, padding: 16, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>Action Path · Rev 52 / Feb 2026</div>
            {best && best.total > 0 ? (
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--accent)", marginBottom: 10 }}>Primary: {best.short}</div>
                {(vibrationActions[best.id] || []).map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, padding: "8px 10px", background: a.startsWith("⚠") ? "rgba(220,38,38,0.06)" : "var(--surface2)", borderRadius: 6, fontSize: 12, fontFamily: "var(--mono)", color: a.startsWith("⚠") ? "var(--red)" : "var(--text2)", borderLeft: a.startsWith("⚠") ? "3px solid var(--red)" : "3px solid var(--accent)" }}>
                    <span style={{ color: a.startsWith("⚠") ? "var(--red)" : "var(--accent)" }}>{a.startsWith("⚠") ? "⚠" : "→"}</span> {a.startsWith("⚠") ? a.slice(2) : a}
                  </div>
                ))}
                {best.id === 5 && best.total >= 20 && (
                  <div style={{ marginTop: 12, background: "rgba(220,38,38,0.06)", border: "1.5px solid rgba(220,38,38,0.25)", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, color: "var(--red)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      ⚠ AOT A55N004-25 — P/N Rudder afectados
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text2)", marginBottom: 6 }}>Verificar en Maintenix si el P/N del Rudder comienza con:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {["D55471000X","D55471001X","D55471002X","D55471004X","D55471006000X","D55471006001X","D55471006002X","D55471006003X","D55471006004X","D55471006100X","D55471006102X","D55471006104X"].map(pn => (
                        <span key={pn} style={{ fontFamily: "var(--mono)", fontSize: 9, background: "rgba(220,38,38,0.1)", color: "var(--red)", padding: "2px 6px", borderRadius: 4, border: "1px solid rgba(220,38,38,0.2)" }}>{pn}</span>
                      ))}
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--red)", marginTop: 8 }}>
                      Si coincide → Contactar PSE Engineering · AD 2026-0083
                    </div>
                  </div>
                )}
                {rudderInTop3 && rudderInTop3.total > 20 && best?.id !== 5 && (
                  <div style={{ marginTop: 12, background: "rgba(220,38,38,0.06)", border: "1.5px solid rgba(220,38,38,0.35)", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, color: "var(--red)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      ⚠ Rudder en Top 3 con score &gt; 20 — TSM 05-50-00-810-801-A §3.B.(1).(d)
                    </div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text2)", marginBottom: 4 }}>Verificar P/N en lista AOT A55N004-25</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text2)", marginBottom: 4 }}>Si P/N listado → contactar PSE Engineering para activar:</div>
                    {["AD-A320FAM-55-C4540-TEST","AD-A320FAM-55-C4540-LIMIT","AD-A320FAM-55-C4540-DFDR"].map(ad => (
                      <div key={ad} style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--red)", paddingLeft: 12, marginBottom: 2 }}>· {ad}</div>
                    ))}
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text2)", marginTop: 6, marginBottom: 4 }}>Enviar a Airbus vía TechRequest (cc Baseline Engineering): VRS + Decision Table + DFDR + acciones correctivas.</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--red)", marginTop: 6, borderTop: "1px solid rgba(220,38,38,0.2)", paddingTop: 6 }}>
                      NOTA: Fuente de vibración debe ser confirmada por Airbus antes de 200 FC desde el VRS.
                    </div>
                  </div>
                )}
              </div>
            ) : <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", textAlign: "center", padding: 20 }}>Select conditions to generate action path</div>}
          </div>
          <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 10, padding: 16, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>Deferral Guide · TSM 05-50-00-810-801-A Rev52</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase" }}>Ubicación A/C</div>
                {[["main","📍 Main Base"],["remote","🌐 Estación Remota"]].map(([val, label]) => (
                  <label key={val} onClick={() => setVStation(val)} style={{ display: "flex", gap: 6, alignItems: "center", padding: "7px 10px", borderRadius: 7, cursor: "pointer", marginBottom: 4, border: `1.5px solid ${vStation===val ? "var(--accent)" : "var(--border)"}`, background: vStation===val ? "rgba(29,78,216,0.07)" : "var(--surface2)", transition: "all 0.15s" }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${vStation===val ? "var(--accent)" : "var(--border2)"}`, background: vStation===val ? "var(--accent)" : "transparent", flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: vStation===val ? "var(--text)" : "var(--text2)" }}>{label}</span>
                  </label>
                ))}
              </div>
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text3)", marginBottom: 6, textTransform: "uppercase" }}>Histórico últimos 14 días</div>
                {[["yes","📋 Con histórico"],["no","✨ Sin histórico"]].map(([val, label]) => (
                  <label key={val} onClick={() => setVHistory(val)} style={{ display: "flex", gap: 6, alignItems: "center", padding: "7px 10px", borderRadius: 7, cursor: "pointer", marginBottom: 4, border: `1.5px solid ${vHistory===val ? "var(--accent)" : "var(--border)"}`, background: vHistory===val ? "rgba(29,78,216,0.07)" : "var(--surface2)", transition: "all 0.15s" }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${vHistory===val ? "var(--accent)" : "var(--border2)"}`, background: vHistory===val ? "var(--accent)" : "transparent", flexShrink: 0 }} />
                    <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: vHistory===val ? "var(--text)" : "var(--text2)" }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            {(selectedIds.includes("intensity_strong") || selectedIds.includes("perception_rumbling")) && (
              <div style={{ marginBottom: 12, padding: "10px 14px", background: "rgba(220,38,38,0.07)", border: "1.5px solid var(--red)", borderRadius: 8, display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "var(--red)", fontSize: 16, flexShrink: 0 }}>⚠</span>
                <div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--red)", marginBottom: 3 }}>Strong Vibration / Rumbling — Acción inmediata</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)" }}>El VRS indica <b>Strong Vibration</b> o <b>Rumbling Noise</b> → Contactar <b>Engineering PSE (SCL)</b> directamente antes de diferir.</div>
                </div>
              </div>
            )}
            {vStation && vHistory ? (() => {
              const isMain  = vStation === "main";
              const hasHist = vHistory === "yes";
              const rudderIsTop1 = best?.id === 5 && (best?.total ?? 0) > 20;
              const strongOrRumbling = selectedIds.includes("intensity_strong") || selectedIds.includes("perception_rumbling");
              const rudderTop3Over20 = !rudderIsTop1 && rudderInTop3 && rudderInTop3.total > 20;
              let para, fc, color, steps, warning;
              if (isMain && !hasHist) {
                para = "Párrafo 1 — Main Base / Sin histórico";
                if (rudderIsTop1) {
                  fc = "Inmediata"; color = "var(--red)";
                  steps = ["⚠ Rudder es fuente principal — seguir Action Path AOT A55N004-25","Revisar PFR — defectos en F/CTL","Verificar VRS con Decision Tree (antes de 20 FC)","GVI a superficies primarias (Rudder, Aileron, Elevator)","Si sin defectos → diferir 6 FC bajo monitoreo","Tripulación completa VRS solo si hay vibración","Sin reportes en 6 FC → cerrar diferido"];
                } else {
                  fc = "6 FC"; color = "var(--amber)";
                  steps = ["Revisar PFR — defectos en F/CTL","Verificar VRS con Decision Tree (antes de 20 FC)","GVI a superficies primarias (Rudder, Aileron, Elevator)","Si sin defectos → diferir 6 FC bajo monitoreo","Tripulación completa VRS solo si hay vibración","Sin reportes en 6 FC → cerrar diferido"];
                }
                warning = "Si hay reportes → contactar Engineering PSE (LOCAL)";
              } else if (isMain && hasHist) {
                para = "Párrafo 2 — Main Base / Con histórico";
                if (strongOrRumbling) {
                  fc = "Inmediata"; color = "var(--red)";
                  steps = ["⚠ VRS indica Strong Vibration o Rumbling Noise","Revisar PFR — defectos en F/CTL","Verificar VRS con Decision Tree (antes de 20 FC)","GVI a superficies primarias","⚠ Contactar Engineering PSE (SCL) directamente antes de diferir — NO aplicar Free Play/diferido de 6 FC hasta indicación de PSE"];
                  warning = "TSM 05-50-00-810-801-A — nota previa a Párrafo 2: Strong Vibration/Rumbling requiere contacto directo a PSE (SCL)";
                } else if (rudderIsTop1) {
                  fc = "Inmediata"; color = "var(--red)";
                  steps = ["⚠ Rudder es fuente principal — seguir Action Path AOT A55N004-25","Revisar PFR — defectos en F/CTL","Verificar VRS con Decision Tree (antes de 20 FC)","GVI a superficies primarias","Free Play Check inmediato — NO diferir al overnight","Si Free Play dentro de límites → diferir 6 FC","Tripulación completa VRS en CADA vuelo (con o sin vibración)","Sin reportes en 6 FC → cerrar e informar a PSE y MOC"];
                  warning = "Si hay reportes → PSE LOCAL para extensión y/o próximas acciones";
                } else {
                  fc = "Overnight"; color = "var(--amber)";
                  steps = ["Revisar PFR — defectos en F/CTL","Verificar VRS con Decision Tree (antes de 20 FC)","GVI a superficies primarias","Free Play Check a la fuente identificada (overnight)","Si Free Play dentro de límites → diferir 6 FC","Tripulación completa VRS en CADA vuelo (con o sin vibración)","Sin reportes en 6 FC → cerrar e informar a PSE y MOC"];
                  warning = rudderTop3Over20 ? "⚠ Rudder en Top 3 — ver alerta AOT A55N004-25 en Action Path" : "Si hay reportes → PSE LOCAL para extensión y/o próximas acciones";
                }
              } else if (!isMain && !hasHist) {
                para = "Párrafo 3 — Estación Remota / Sin histórico";
                if (rudderIsTop1) {
                  fc = "2 FC"; color = "var(--red)";
                  steps = ["⚠ Rudder es fuente principal — reubicar en Main Base urgente · ver Action Path AOT A55N004-25","Revisar PFR — defectos en F/CTL","Verificar VRS con Decision Tree (antes de 20 FC)","GVI a superficies primarias","Damping Test (Aileron/Elevator) — Rudder: test operacional ambas direcciones","Si sin defectos → diferir 2 FC para reubicar en Main Base","Tripulación completa VRS solo si hay vibración"];
                } else {
                  fc = "6 FC"; color = "var(--amber)";
                  steps = ["Revisar PFR — defectos en F/CTL","Verificar VRS con Decision Tree (antes de 20 FC)","GVI a superficies primarias","Damping Test (Aileron/Elevator) — Rudder: test operacional ambas direcciones","Si sin defectos → diferir 6 FC bajo monitoreo","Tripulación completa VRS solo si hay vibración"];
                }
                warning = "Si hay reportes en 6 FC → contactar PSE LOCAL para extensión";
              } else {
                para = "Párrafo 4 — Estación Remota / Con histórico"; fc = "2 FC";
                if (rudderIsTop1) {
                  color = "var(--red)";
                  steps = ["⚠ Rudder es fuente principal — reubicar en Main Base urgente · ver Action Path AOT A55N004-25","Revisar PFR — defectos en F/CTL","Verificar VRS con Decision Tree (antes de 20 FC)","GVI a superficies primarias","Damping Test (Aileron/Elevator) — Rudder: test operacional ambas direcciones","Si sin defectos → diferir 2 FC para reubicar en Main Base","Aplicar acciones correctivas en Main Base"];
                } else {
                  color = "var(--amber)";
                  steps = ["Revisar PFR — defectos en F/CTL","Verificar VRS con Decision Tree (antes de 20 FC)","GVI a superficies primarias","Damping Test (Aileron/Elevator) — Rudder: test operacional ambas direcciones","Si sin defectos → diferir 2 FC para reubicar en Main Base","Aplicar acciones correctivas en Main Base"];
                }
                warning = "Extensión de FC requiere evaluación Central Engineering PSE (SCL)";
              }
              return (
                <div style={{ background: "var(--surface2)", border: `2px solid ${color}`, borderRadius: 10, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>{para}</div>
                    <div style={{ fontFamily: "var(--sans)", fontWeight: 800, fontSize: 20, color }}>⏱ {fc}</div>
                  </div>
                  {steps.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)" }}>
                      <span style={{ color, flexShrink: 0 }}>✓</span> {s}
                    </div>
                  ))}
                  <div style={{ marginTop: 10, padding: "8px 10px", background: `rgba(0,0,0,0.04)`, borderRadius: 6, fontFamily: "var(--mono)", fontSize: 10, color, borderLeft: `3px solid ${color}` }}>
                    ⚠ {warning}
                  </div>
                </div>
              );
            })() : (
              <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", textAlign: "center", padding: 12 }}>
                Selecciona ubicación e histórico para ver el deferral aplicable
              </div>
            )}
          </div>

          <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 10, padding: 14, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", gap: 16, fontFamily: "var(--mono)", fontSize: 10 }}>
              {[["■", "var(--accent)", "< 20 Low"], ["■", "#d97706", "20–39 Med"], ["■", "#dc2626", "≥ 40 High"]].map(([sym, col, label]) => (
                <span key={label} style={{ color: "var(--text3)" }}><span style={{ color: col }}>{sym}</span> {label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OdorModule() {
  const [eventLevel, setEventLevel] = useState("UNK");
  const rowsByCategory = useMemo(() => groupByCategory(odorRows), []);
  const { selectedIds, selectedRows, toggle, reset } = useMultiSelect(odorRows);
  const selectedMap = useMemo(() => computeSelectedMap(selectedRows), [selectedRows]);
  const totals = useMemo(() => {
    return selectedRows.reduce((acc, row) => acc.map((v, i) => v + row.scores[i]), new Array(odorTypes.length).fill(0));
  }, [selectedRows]);
  const ranking = useMemo(() => topThree(odorTypes, totals), [totals]);
  const best = ranking[0];
  return (
    <div style={{ padding: "20px 24px", maxWidth: 1100, margin: "0 auto" }} className="fadeIn">
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#d97706", letterSpacing: "0.12em", marginBottom: 4 }}>// ODOR · SMOKE · SOURCE MATRIX</div>
          <h2 style={{ fontFamily: "var(--sans)", fontWeight: 800, fontSize: 24, color: "var(--text)" }}>Odor / Smoke Tool</h2>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {selectedIds.length > 0 && <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#d97706", background: "rgba(217,119,6,0.08)", padding: "4px 10px", borderRadius: 20, border: "1.5px solid rgba(217,119,6,0.2)" }}>{selectedIds.length} selected</span>}
          <button onClick={reset} style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text2)", background: "var(--surface)", border: "1.5px solid var(--border2)", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>Reset</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20 }}>
        <div>
          <div style={{ maxHeight: "55vh", overflowY: "auto", paddingRight: 4, marginBottom: 14 }}>
            {Object.entries(rowsByCategory).map(([cat, rows]) => <CatPanel key={cat} category={cat} rows={rows} selectedIds={selectedIds} toggle={toggle} />)}
          </div>
          <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 10, padding: 14, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase" }}>Event Level</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {odorLevels.map(lvl => (
                <label key={lvl.id} onClick={() => setEventLevel(lvl.id)} style={{ display: "flex", gap: 8, padding: "10px 12px", borderRadius: 7, cursor: "pointer", border: `1.5px solid ${eventLevel === lvl.id ? "#d97706" : "var(--border)"}`, background: eventLevel === lvl.id ? "rgba(217,119,6,0.08)" : "var(--surface2)", transition: "all 0.15s" }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, marginTop: 1, border: `2px solid ${eventLevel === lvl.id ? "#d97706" : "var(--border2)"}`, background: eventLevel === lvl.id ? "#d97706" : "transparent" }} />
                  <div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{lvl.label}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>{lvl.note}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 10, padding: 16, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>Top Sources</div>
            {ranking.map((item, i) => <RankCard key={item.id} item={item} rank={i} />)}
          </div>
          <div style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 10, padding: 16, boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)", letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>Corrective Path · Level {eventLevel}</div>
            {best && best.total > 0 ? (
              <div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "#d97706", marginBottom: 10 }}>Primary: {best.short}</div>
                {getOdorActions(best.id, eventLevel).map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, padding: "8px 10px", background: a.startsWith("⚠") ? "rgba(220,38,38,0.06)" : "var(--surface2)", borderRadius: 6, fontSize: 11, fontFamily: "var(--mono)", color: a.startsWith("⚠") ? "var(--red)" : "var(--text2)", borderLeft: `3px solid ${a.startsWith("⚠") ? "var(--red)" : "#d97706"}` }}>
                    <span style={{ color: a.startsWith("⚠") ? "var(--red)" : "#d97706", flexShrink: 0 }}>{a.startsWith("⚠") ? "⚠" : "→"}</span>
                    <span>{a.startsWith("⚠") ? a.slice(2) : a}</span>
                  </div>
                ))}
              </div>
            ) : <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text3)", textAlign: "center", padding: 20 }}>Select conditions to generate corrective path</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AOG MODULE ───────────────────────────────────────────────────────────────

function AOGModule() {
  const [aircraft, setAircraft]   = useState("");
  const [station, setStation]     = useState("");
  const [numTechs, setNumTechs]   = useState("");
  const [skill, setSkill]         = useState("");
  const [flight, setFlight]       = useState("");
  const [time, setTime]           = useState("");
  const [date, setDate]           = useState("");
  const [route, setRoute]         = useState("");
  const [authCode, setAuthCode]   = useState("");
  const [montoGlobal, setMontoGlobal] = useState("");
  const [techList, setTechList]   = useState("");
  const [techEmails, setTechEmails] = useState("");
  const [preview, setPreview]     = useState(null);
  const [showHotel, setShowHotel] = useState(false);
  const [hotelCommon, setHotelCommon] = useState({ tripId:"", pais:"", destino:"", ciudad:"", hotel:"", checkIn:"", horaIn:"", checkOut:"", horaOut:"", comentarios:"" });
  const [hotelPax, setHotelPax]   = useState({});

  const s = (v, f) => v.trim() ? v.trim() : f;

  const commonCC = "javier.muzio@latam.com,manuel.quintana@latam.com,manuel.lopezs@latam.com,victor.garcia@latam.com,pedro.astudillo@latam.com,waldo.diaz@latam.com,eturnomoc@latam.com,pamela.pena@latam.com";

  // ── Parser ────────────────────────────────────────────────────────────────
  const parseTechs = () => {
    // Pre-process: if a line looks like a standalone email, attach it to the previous tech line
    const lines = techList.split("\n").map(l => l.trim()).filter(Boolean);
    const merged = [];
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l);
      if (isEmail && merged.length > 0) {
        // Attach to previous line as EMAIL keyword
        merged[merged.length - 1] = merged[merged.length - 1] + " EMAIL " + l;
      } else {
        merged.push(l);
      }
    }
    return merged.map(l => {
      const bp    = (l.match(/BP\s+(\S+)/i)    || [])[1] || "";
      const rut   = (l.match(/RUT\s+(\S+)/i)   || [])[1] || "";
      const cc    = (l.match(/CC\s+(\S+)/i)    || [])[1] || "";
      const email = (l.match(/EMAIL\s+(\S+)/i) || [])[1] || "";
      const name  = l.split(/\s+(?:BP|RUT|CC|EMAIL)\s+/i)[0].trim();
      return { name, bp: bp.replace(/\.$/, ""), idNum: rut.replace(/\.$/, ""), cc: cc.replace(/\.$/, ""), email: email.replace(/\.$/, "") };
    }).filter(t => t.name && t.bp); // require at least BP to be a valid tech
  };

  const techs = parseTechs();

  // ── Tech emails for CC ────────────────────────────────────────────────────
  // Emails del personal: usa el campo manual; limpia separadores
  const techEmailsCC = techEmails.split(/[;,\n]/).map(e => e.trim()).filter(Boolean).join(",");

  // ── Email bodies ──────────────────────────────────────────────────────────
  const bodies = {
    tech: () =>
      `Estimados,\n\nFavor su ayuda asignando ${s(numTechs,"XX")} técnicos de apoyo con skill de ${s(skill,"XX")}, para el AOG recovery del ${s(aircraft,"CC-XXX")} en sta ${s(station,"XXX")}. El vuelo de traslado es el ${s(flight,"LAXXX")} de las ${s(time,"XX:XX")} horas.\n\nFavor enviar los siguientes datos y documentos para gestionar la COBUS:\n\n▪ Nombre:\n▪ BP:\n▪ Cédula de identidad:\n▪ Tilan:\n▪ Certificado de Antecedentes:\n\nSaludos,`,

    cobus: () => {
      const d = techs.map(t => `Nombre Funcionario: ${t.name}\nBP: ${t.bp}\nRut/pasaporte: ${t.idNum}\nCentro de costo: ${t.cc || "MOC"}`).join("\n\n");
      return `Sres. Ventas,\n\nFavor generar ticket AOG para el (los) funcionario(s) indicado(s) abajo, el motivo es la protección de avión matrícula (${s(aircraft,"XX-XXX")}), el cual está AOG en estación (${s(station,"XXX")}).\n\nFecha: ${s(date,"DD-MM-AAAA")}\nNúmero de vuelo: ${s(flight,"LAXXX")}, ETD ${s(time,"XX:XX")}, (${s(date,"FECHA")})\nTramo/ruta: ${s(route,"XXX-XXX")}\nTicket de vuelta: OPEN (EN CASO DE NECESITAR)\nReserva/Código de Autorización: ${s(authCode,"XXXXX")} (RESERVA CON EL BL RECIBIDA EN EL CORREO)\n\n${d}\n\n*ATTN AGENTE EMISOR NO CANCELAR LAS AUTORIZACIONES SON PARA EMISIÓN ILIMITADA*\n*FVR ESPECIAL ATTN TTSE PAXS GO SHOW DEBEN SER EMBARCADOS*\n\nIMPORTANTE:\n*REGISTRAR EL BOLETO EMITIDO EN UN REMARK ES OBLIGATORIO*`;
    },

    trans: () => {
      const d = techs.map(t => `Nombre: ${t.name}\nRut: ${t.idNum}\nBP: ${t.bp}\nCentro de costo: ${t.cc || ""}`).join("\n\n");
      return `Favor coordinar movilización de carácter AOG Casa-Aeropuerto para el/los funcionarios mencionados para el vuelo informado:\n\n${d}\n\nVuelo: ${s(flight,"LA (XXX)")} tramo ${s(route,"XXX-XXX")} ETD (${s(time,"XX:XX")}) horas, fecha ${s(date,"DD-MM-AAAA")}.`;
    },

    viaticos: () => {
      const d = techs.map(t => `Nombre: ${t.name}\nRut: ${t.idNum}\nBP: ${t.bp}\nCentro de costo: ${t.cc || ""}`).join("\n\n");
      return `Por evento de aeronave AOG, favor entregar a cada funcionario la cantidad abajo descrita a rendir.\n\n${d}\n\nMonto a rendir: ${montoGlobal || "___"} cada uno.`;
    },
  };

  // ── Send email — builds URL manually so addresses are never encoded ────────
  const sendEmail = (e) => {
    const body = bodies[e.key]();
    // For correo 1 (solicitud) no se copia a los técnicos porque aún no se conocen
    const ccParts = e.key === "tech"
      ? [e.cc]
      : [e.cc, techEmailsCC];
    const cc = ccParts.filter(Boolean).join(",");
    window.open(buildMailto(e.to, cc, e.subj(), body), '_blank');
  };

  // ── Hotel email ────────────────────────────────────────────────────────────
  const getHotelBody = () => {
    const blocks = techs.map((t, i) => {
      const p = hotelPax[i] || {};
      const email = p.email || t.email || "";
      return (
        `--- Pasajero ${i+1} ---\n` +
        `Código Trip ID: ${hotelCommon.tripId}\n` +
        `Centro de Costo: ${t.cc}\n` +
        `BP del Pasajero: ${t.bp}\n` +
        `Cargo del Pasajero: ${p.cargo || ""}\n` +
        `País de Origen del Viaje: ${hotelCommon.pais}\n` +
        `Nombre Completo: ${t.name}\n` +
        `Email Pasajero: ${email}\n` +
        `Nacionalidad: ${p.nacionalidad || ""}\n` +
        `País de Destino: ${hotelCommon.destino}\n` +
        `Ciudad: ${hotelCommon.ciudad}\n` +
        `Hotel o Sector de Preferencia: ${hotelCommon.hotel}\n` +
        `Fecha Check In: ${hotelCommon.checkIn}\n` +
        `Hora Check In: ${hotelCommon.horaIn}\n` +
        `Fecha Check Out: ${hotelCommon.checkOut}\n` +
        `Hora Check Out: ${hotelCommon.horaOut}\n` +
        `Comentarios Adicionales: ${hotelCommon.comentarios}`
      );
    }).join("\n\n");
    return `Estimados,\n\nSolicito reserva de hotel para el personal en comisión AOG aeronave ${s(aircraft,"CC-XXX")} estación ${s(station,"XXX")}.\n\n${blocks}\n\nSaludos,`;
  };

  const sendHotelEmail = () => {
    const cc = [commonCC, techEmailsCC].filter(Boolean).join(",");
    window.open(buildMailto("", cc, `Solicitud Hotel COBUS AOG ${s(aircraft,"XX")} sta ${s(station,"XX")}`, getHotelBody()), '_blank');
  };

  // ── PDF ────────────────────────────────────────────────────────────────────
  const generatePDF = () => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      const margin = 20; let y = margin;
      const lineH = 7; const pageH = doc.internal.pageSize.height;
      const addLine = (text, size=10, bold=false, color=[30,30,30]) => {
        if (y > pageH-20) { doc.addPage(); y = margin; }
        doc.setFontSize(size); doc.setFont("helvetica", bold?"bold":"normal"); doc.setTextColor(...color); doc.text(text, margin, y); y += lineH+(size>11?2:0);
      };
      const addDivider = () => { if (y>pageH-20){doc.addPage();y=margin;} doc.setDrawColor(200,200,200); doc.line(margin,y,190,y); y+=5; };
      const addField = (label, value) => { if (y>pageH-20){doc.addPage();y=margin;} doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(100,100,100); doc.text(label+":", margin, y); doc.setFont("helvetica","normal"); doc.setTextColor(20,20,20); doc.text(value||"—", margin+52, y); y+=lineH; };
      doc.setFillColor(0,50,160); doc.rect(0,0,210,22,"F"); doc.setFontSize(13); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255); doc.text("LATAM Airlines — Activación Comisión AOG", margin, 14); y=30;
      addLine("MOTIVO DE COMISIÓN",13,true,[0,50,160]); addDivider();
      const motivo = `Se activa comisión de ${s(numTechs,"XX")} técnico(s) con skill de ${s(skill,"XX")} para el recovery de aeronave AOG matrícula ${s(aircraft,"CC-XXX")} en estación ${s(station,"XXX")}.`;
      doc.setFontSize(10); doc.setFont("helvetica","normal"); doc.setTextColor(20,20,20);
      doc.splitTextToSize(motivo,170).forEach(l=>addLine(l)); y+=4;
      addLine("DATOS DEL VUELO",13,true,[0,50,160]); addDivider();
      addField("Matrícula",s(aircraft,"—")); addField("Estación AOG",s(station,"—")); addField("Vuelo traslado",s(flight,"—")); addField("ETD",s(time,"—")); addField("Fecha",s(date,"—")); addField("Ruta",s(route,"—")); addField("Cód. Autorización",s(authCode,"—")); y+=4;
      if (techs.length>0) { addLine("PERSONAL EN COMISIÓN",13,true,[0,50,160]); addDivider(); techs.forEach((t,i)=>{ addLine((i+1)+". "+t.name,10,true); if(t.bp) addField("   BP",t.bp); if(t.idNum) addField("   RUT/Pasaporte",t.idNum); if(t.cc) addField("   Centro de costo",t.cc); y+=2; }); }
      doc.setFontSize(8); doc.setTextColor(150,150,150); doc.text("Generado por MOC Toolbox LATAM — "+new Date().toLocaleDateString("es-CL"), margin, pageH-10);
      doc.save("Comision_AOG_"+s(aircraft,"XXXX")+"_"+s(station,"XXX")+".pdf");
    };
    document.head.appendChild(script);
  };

  // ── Email definitions ─────────────────────────────────────────────────────
  const emails = [
    { key:"tech",    label:"1. Solicitud Técnicos",  to:"SProdTurn@lan.com,capacityplannerscl@lan.com,GrpSupMant@lan.com",                                                                                                      cc:"javier.muzio@latam.com,javier.ferrari@latam.com,daniel.suarez@latam.com,sergio.sanchez@latam.com,guido.contreras@latam.com,hector.ruiz@latam.com,roberto.poblete@latam.com,jose.amar@latam.com,eduardo.mendez@latam.com,eturnomoc@latam.com,manuel.quintana@latam.com,manuel.lopezs@latam.com,victor.garcia@latam.com,pedro.astudillo@latam.com,waldo.diaz@latam.com", subj:()=>`Solicitud Personal de apoyo AOG ${aircraft} sta ${station}` },
    { key:"cobus",   label:"2. Activación COBUS",    to:"VentasAtoSCL@lan.com,grp_coordinadoresaptoscl@latam.com,grpcontrcoattscl@lan.com,grp_spvr_hcc_scl@latam.com,grp_jefescco@latam.com",                                 cc:commonCC, subj:()=>`Activación tickets COBUS AOG ${aircraft} sta ${station}` },
    { key:"trans",   label:"3. Transporte",           to:"transdiaterresscl@lan.com",                                                                                                                                             cc:commonCC, subj:()=>`Solicitud movilización COBUS AOG ${aircraft} sta ${station}` },
    { key:"viaticos",label:"4. Viáticos",             to:"global.viaticos@gmail.com,envios.latam@global-exchange.cl,grp_viaticoschile@latam.com",                                                                                 cc:commonCC, subj:()=>`Solicitud viáticos COBUS AOG ${aircraft} sta ${station}` },
  ];

  const cargos = ["VP","Director","Gerente Sr","Gerente","Subgerente","Mando Medio","Rol General"];

  const fields = [
    { ph:"Matrícula (CC-XXX)",              val:aircraft,     set:setAircraft },
    { ph:"Estación (XXX)",                  val:station,      set:setStation },
    { ph:"N° Técnicos",                     val:numTechs,     set:setNumTechs },
    { ph:"Skill (A320/A350/etc)",           val:skill,        set:setSkill },
    { ph:"Vuelo (LAXXXX)",                  val:flight,       set:setFlight },
    { ph:"ETD / Hora (XX:XX)",             val:time,         set:setTime },
    { ph:"Fecha (DD-MM-AAAA)",             val:date,         set:setDate },
    { ph:"Ruta (SCL-PUQ)",                 val:route,        set:setRoute },
    { ph:"Cód. Autorización",              val:authCode,     set:setAuthCode },
    { ph:"Monto viáticos (ej: $300.000 CLP)", val:montoGlobal, set:setMontoGlobal },
  ];

  return (
    <div style={{ padding:"20px 24px", maxWidth:1100, margin:"0 auto" }} className="fadeIn">
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--red)", letterSpacing:"0.12em", marginBottom:4 }}>// AOG · WORKFLOW · EMAIL GENERATOR</div>
        <h2 style={{ fontFamily:"var(--sans)", fontWeight:800, fontSize:24, color:"var(--text)" }}>AOG Workflow</h2>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.2fr 1fr", gap:20 }}>
        {/* LEFT */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:10, padding:16, boxShadow:"var(--shadow-sm)" }}>
            <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--text3)", letterSpacing:"0.1em", marginBottom:12, textTransform:"uppercase" }}>Flight Data</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {fields.map(f => <input key={f.ph} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} />)}
            </div>
          </div>

          <div style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:10, padding:16, boxShadow:"var(--shadow-sm)" }}>
            <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--text3)", letterSpacing:"0.1em", marginBottom:6, textTransform:"uppercase" }}>Tech List</div>
            <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--text3)", marginBottom:8 }}>
              Formato: NOMBRE BP 123456 RUT 12345678-9 CC LACLEXXX
            </div>
            <textarea
              placeholder={"EDISON ESCOBAR BP 3955987 RUT 12345678-9 CC LACLM123\nJUAN PEREZ BP 30398887 RUT 98765432-1 CC LUCLM456"}
              value={techList}
              onChange={e => setTechList(e.target.value)}
              style={{ height:110 }}
            />
            {techs.length > 0 && (
              <div style={{ marginTop:6, fontFamily:"var(--mono)", fontSize:10, color:"var(--green)" }}>
                ✓ {techs.length} técnico{techs.length>1?"s":""} cargado{techs.length>1?"s":""}
              </div>
            )}
            <div style={{ marginTop:10 }}>
              <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--text3)", marginBottom:4 }}>
                Correos del personal — se agregan en CC a todos los correos
              </div>
              <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--text3)", marginBottom:6 }}>
                Formato: correo1@latam.com; correo2@latam.com; correo3@latam.com
              </div>
              <textarea
                placeholder={"edison.escobar@latam.com; juan.perez@latam.com; jose.gil@latam.com"}
                value={techEmails}
                onChange={e => setTechEmails(e.target.value)}
                style={{ height:55 }}
              />
              {techEmailsCC && (
                <div style={{ marginTop:4, fontFamily:"var(--mono)", fontSize:10, color:"var(--accent)" }}>
                  📧 {techEmailsCC.split(",").length} correo{techEmailsCC.split(",").length>1?"s":""} detectado{techEmailsCC.split(",").length>1?"s":""}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:10, padding:16, boxShadow:"var(--shadow-sm)" }}>
            <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--text3)", letterSpacing:"0.1em", marginBottom:12, textTransform:"uppercase" }}>Generar Correos</div>
            {emails.map(e => (
              <div key={e.key} style={{ marginBottom:8, display:"flex", gap:6 }}>
                <button onClick={() => sendEmail(e)}
                  style={{ flex:1, padding:"12px 16px", borderRadius:9, background:"var(--accent)", color:"white", border:"none", cursor:"pointer", fontFamily:"var(--mono)", fontWeight:600, fontSize:12, textAlign:"left", boxShadow:"0 2px 8px rgba(29,78,216,0.2)", transition:"opacity 0.15s" }}
                  onMouseOver={e2=>e2.currentTarget.style.opacity="0.85"} onMouseOut={e2=>e2.currentTarget.style.opacity="1"}>
                  {e.label}
                </button>
                <button onClick={() => setPreview(preview===e.key ? null : e.key)}
                  style={{ padding:"12px 10px", borderRadius:7, background:"var(--surface2)", color:"var(--text3)", border:`1.5px solid ${preview===e.key?"var(--accent)":"var(--border)"}`, cursor:"pointer", fontFamily:"var(--mono)", fontSize:11 }} title="Preview">👁</button>
              </div>
            ))}

            <div style={{ marginTop:10, borderTop:"1.5px solid var(--border)", paddingTop:12, display:"grid", gap:8 }}>
              <button onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSepQhja35tJlHEHo_bVAX6Ko5u6JatWHP_T5h9cG2Epm2olYQ/viewform","_blank")}
                style={{ width:"100%", padding:"12px 16px", borderRadius:9, background:"var(--red)", color:"white", border:"none", cursor:"pointer", fontFamily:"var(--mono)", fontWeight:600, fontSize:12, textAlign:"left", boxShadow:"0 2px 8px rgba(220,38,38,0.2)" }}>
                5. Link Reserva Hotel ↗
              </button>
              <button onClick={generatePDF}
                style={{ width:"100%", padding:"12px 16px", borderRadius:9, background:"var(--green)", color:"white", border:"none", cursor:"pointer", fontFamily:"var(--mono)", fontWeight:600, fontSize:12, textAlign:"left", boxShadow:"0 2px 8px rgba(22,163,74,0.2)" }}>
                📄 Generar PDF Comisión
              </button>
              <button onClick={() => setShowHotel(true)}
                style={{ width:"100%", padding:"12px 16px", borderRadius:9, background:"var(--purple)", color:"white", border:"none", cursor:"pointer", fontFamily:"var(--mono)", fontWeight:600, fontSize:12, textAlign:"left", boxShadow:"0 2px 8px rgba(124,58,237,0.2)" }}>
                🏨 Solicitud Hotel Personal
              </button>
            </div>
          </div>

          {preview && (
            <div style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:10, padding:14, boxShadow:"var(--shadow-sm)" }}>
              <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--text3)", letterSpacing:"0.1em", marginBottom:8, textTransform:"uppercase" }}>Preview · {emails.find(e=>e.key===preview)?.label}</div>
              <pre style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--text)", whiteSpace:"pre-wrap", maxHeight:300, overflowY:"auto", lineHeight:1.7, background:"var(--surface2)", padding:12, borderRadius:8, border:"1.5px solid var(--border)" }}>
                {bodies[preview]?.()}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* ── HOTEL MODAL ─────────────────────────────────────────────────────── */}
      {showHotel && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.55)", backdropFilter:"blur(4px)", zIndex:100, display:"flex", alignItems:"flex-start", justifyContent:"center", overflowY:"auto", padding:"30px 16px" }}>
          <div style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:16, padding:28, width:"100%", maxWidth:720, boxShadow:"var(--shadow-lg)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--purple)", letterSpacing:"0.12em", marginBottom:4 }}>// SOLICITUD HOTEL · AOG</div>
                <div style={{ fontFamily:"var(--sans)", fontWeight:800, fontSize:20, color:"var(--text)" }}>Hotel Personal en Comisión</div>
              </div>
              <button onClick={() => setShowHotel(false)} style={{ background:"var(--surface2)", border:"1.5px solid var(--border2)", color:"var(--text2)", borderRadius:6, padding:"6px 12px", cursor:"pointer", fontFamily:"var(--mono)", fontSize:12 }}>✕ Cerrar</button>
            </div>

            <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>Datos Generales</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
              {[["tripId","Código Trip ID"],["pais","País de Origen del Viaje"],["destino","País de Destino"],["ciudad","Ciudad / Región / Estado"],["hotel","Hotel o Sector de Preferencia"],["checkIn","Fecha Check In (DD-MM-AAAA)"],["horaIn","Hora Check In (HH:MM)"],["checkOut","Fecha Check Out (DD-MM-AAAA)"],["horaOut","Hora Check Out (HH:MM)"]].map(([key,ph]) => (
                <input key={key} placeholder={ph} value={hotelCommon[key]||""} onChange={e => setHotelCommon(prev=>({...prev,[key]:e.target.value}))} />
              ))}
              <textarea placeholder="Comentarios Adicionales" value={hotelCommon.comentarios||""} onChange={e=>setHotelCommon(prev=>({...prev,comentarios:e.target.value}))} style={{ height:60, gridColumn:"1 / -1" }} />
            </div>

            {techs.length === 0 && (
              <div style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--text3)", textAlign:"center", padding:20 }}>⚠ Agrega técnicos en el Tech List para continuar</div>
            )}

            {techs.map((t, i) => {
              const pax = hotelPax[i] || {};
              // Email: usa lo que el usuario haya escrito en el modal; si no, usa el del tech list
              const emailsArr = techEmailsCC.split(",").map(e => e.trim()).filter(Boolean);
              const emailVal = pax.emailEdited ? pax.email : (emailsArr[i] || "");
              return (
                <div key={i} style={{ background:"var(--surface2)", border:"1.5px solid var(--border)", borderRadius:10, padding:14, marginBottom:10 }}>
                  <div style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--purple)", fontWeight:700, marginBottom:10 }}>
                    Pasajero {i+1}: {t.name} · BP {t.bp}
                    {t.email && <span style={{ color:"var(--accent)", fontWeight:400, marginLeft:8 }}>📧 {t.email}</span>}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    <select value={pax.cargo||""} onChange={e=>setHotelPax(prev=>({...prev,[i]:{...prev[i],cargo:e.target.value}}))}>
                      <option value="">Cargo del Pasajero</option>
                      {cargos.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                    <input placeholder="Email Pasajero" value={emailVal}
                      onChange={e=>setHotelPax(prev=>({...prev,[i]:{...prev[i],email:e.target.value,emailEdited:true}}))}
                    />
                    <input placeholder="Nacionalidad" value={pax.nacionalidad||""} onChange={e=>setHotelPax(prev=>({...prev,[i]:{...prev[i],nacionalidad:e.target.value}}))} />
                  </div>
                </div>
              );
            })}

            <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--amber)", background:"rgba(217,119,6,0.08)", border:"1px solid rgba(217,119,6,0.25)", borderRadius:8, padding:"10px 14px", marginTop:8, marginBottom:16 }}>
              ⚠ Llegada antes de las 12:00 PM = noche extra. Salida después de las 15:00 PM = noche extra. Indica NACIONALIDAD para evitar IVA.
            </div>

            <button onClick={sendHotelEmail}
              style={{ width:"100%", padding:14, borderRadius:9, background:"var(--purple)", color:"white", border:"none", cursor:"pointer", fontFamily:"var(--mono)", fontWeight:700, fontSize:13, boxShadow:"0 2px 8px rgba(124,58,237,0.25)" }}>
              📧 Generar Correo Solicitud Hotel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const DIRECTORIO = {
  "MOC SSC": [
    {
      "cargo": "MOC Operación        (+56)",
      "nombre": "22 677- 4200 Central",
      "celular": "-----",
      "anexo": "4200                 (4996 // 4888 4853 // 4952 // 4897 // 4681)",
      "mail": "eturnomoc@latam.com"
    },
    {
      "cargo": "Comprador AOG",
      "nombre": "",
      "celular": "56 9 9828 4316",
      "anexo": "4980 / 4775",
      "mail": "GrpCompAOG@lan.com"
    },
    {
      "cargo": "Jefe Compras AOG",
      "nombre": "Marcelo Matus",
      "celular": "56 9 9835 8562",
      "anexo": "4847",
      "mail": "marcelo.matus@latam.com"
    },
    {
      "cargo": "Jefe MOC",
      "nombre": "Manuel Quintana",
      "celular": "56 9 6195 3816",
      "anexo": "7520",
      "mail": "manuel.quintana@latam.com"
    },
    {
      "cargo": "Jefe MOC",
      "nombre": "Waldo Diaz",
      "celular": "56 9 6416 1116",
      "anexo": "4907",
      "mail": "waldo.diaz@latam.com"
    },
    {
      "cargo": "Jefe MOC",
      "nombre": "Victor Garcia",
      "celular": "56 9 6588 8699",
      "anexo": "4993",
      "mail": "victor.garcia@latam.com"
    },
    {
      "cargo": "Jefe MOC",
      "nombre": "Manuel Lopez",
      "celular": "56 9 5371 5258",
      "anexo": "4929",
      "mail": "manuel.lopezs@latam.com"
    },
    {
      "cargo": "Jefe MOC",
      "nombre": "Pedro Astudillo",
      "celular": "56 9 8901 8567",
      "anexo": "",
      "mail": "pedro.astudillo@latam.com"
    },
    {
      "cargo": "Gerente MOC",
      "nombre": "Javier Muzio",
      "celular": "56 9 9079 0500",
      "anexo": "4367",
      "mail": "javier.muzio@latam.com"
    },
    {
      "cargo": "Analista WB",
      "nombre": "",
      "celular": "",
      "anexo": "4277",
      "mail": "P72@lan.com"
    },
    {
      "cargo": "Analista NB",
      "nombre": "",
      "celular": "",
      "anexo": "4890",
      "mail": ""
    },
    {
      "cargo": "Ejecutivo P72",
      "nombre": "On Duty",
      "celular": "9 6405 4877",
      "anexo": "4763",
      "mail": ""
    },
    {
      "cargo": "SG",
      "nombre": "Estefany Guzmán",
      "celular": "9 57981597",
      "anexo": "",
      "mail": "estefany.guzman@latam.com"
    },
    {
      "cargo": "BOEING FIELD SUPPORT SCL",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Representant SCL",
      "nombre": "",
      "celular": "09 6206 6486 09 9238 3635",
      "anexo": "4601",
      "mail": "bfsscl@boeing.com"
    },
    {
      "cargo": "787 OCC",
      "nombre": "",
      "celular": "0188 01 206 544 7787",
      "anexo": "",
      "mail": "svc787occ@exchange.boeing.com"
    }
  ],
  "CCO SSC": [
    {
      "cargo": "DOM LP+XL",
      "nombre": "",
      "celular": "",
      "anexo": "4146",
      "mail": "ccolatam@latam.com"
    },
    {
      "cargo": "DOM CL+4M",
      "nombre": "",
      "celular": "",
      "anexo": "4777",
      "mail": ""
    },
    {
      "cargo": "InterTAM + Fleet 767 CC",
      "nombre": "",
      "celular": "",
      "anexo": "4634",
      "mail": ""
    },
    {
      "cargo": "B787 + 4C",
      "nombre": "",
      "celular": "",
      "anexo": "4232",
      "mail": ""
    },
    {
      "cargo": "Jefe CCO en Turno",
      "nombre": "",
      "celular": "9 6509 4617",
      "anexo": "4383",
      "mail": ""
    },
    {
      "cargo": "Jefe CCO Adm",
      "nombre": "Carlos Sanchez",
      "celular": "9 9221 4549",
      "anexo": "",
      "mail": "carlos.sanchez@latam.com"
    },
    {
      "cargo": "Gerente CCO",
      "nombre": "Francisco Uriel",
      "celular": "9 7969 6632",
      "anexo": "",
      "mail": "uriel.munoz@latam.com"
    },
    {
      "cargo": "Supervisor CCV",
      "nombre": "BOG",
      "celular": "057 3173717252",
      "anexo": "*1872053",
      "mail": "grp_despacho.bog@latam.com"
    },
    {
      "cargo": "Supervisor CCV",
      "nombre": "LIM",
      "celular": "",
      "anexo": "*1873546",
      "mail": "supervisoresccvlp@lanperu.com.pe"
    },
    {
      "cargo": "Supervisor CCV",
      "nombre": "UIO",
      "celular": "",
      "anexo": "*1877040",
      "mail": ""
    },
    {
      "cargo": "SOPORTE TELEFONOS IP CISCO",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Mesa Latam",
      "nombre": "",
      "celular": "2 2565 3633 2 2565 3933",
      "anexo": "Atención7x24",
      "mail": "Mesalatam.gcnetworks@latam.com"
    },
    {
      "cargo": "Celular Turno y escalamiento a la mesa",
      "nombre": "",
      "celular": "0 9 9494 1104",
      "anexo": "*1873546",
      "mail": "Outsourcing.gcnetworks@latam.com comunicaciones3@latam.com telefonia.latam@lan.com"
    },
    {
      "cargo": "Help desk Latam",
      "nombre": "",
      "celular": "225652200",
      "anexo": "2200",
      "mail": ""
    }
  ],
  "Mantto Línea SCL": [
    {
      "cargo": "Super Linea",
      "nombre": "",
      "celular": "0 941314164",
      "anexo": "95756",
      "mail": "SupLineaSCL@lan.com"
    },
    {
      "cargo": "Mesa Técnica Linea",
      "nombre": "",
      "celular": "MESA MAR 09 7706 2775 TEAM LEADER MOVIL  961846082",
      "anexo": "7562",
      "mail": "marscl@lan.com"
    },
    {
      "cargo": "Capacity Planner",
      "nombre": "",
      "celular": "",
      "anexo": "95405",
      "mail": ""
    },
    {
      "cargo": "Esp Estructuras",
      "nombre": "",
      "celular": "",
      "anexo": "4632",
      "mail": ""
    },
    {
      "cargo": "Jefe Estructuras linea/base",
      "nombre": "Eduardo Mendez",
      "celular": "09 6114 9973",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "SG Linea y Est",
      "nombre": "Daniel Suarez Gamarra",
      "celular": "09 5963 1901",
      "anexo": "",
      "mail": "daniel.suarez@latam.com"
    },
    {
      "cargo": "Jefe QC Turno",
      "nombre": "",
      "celular": "09 6393 1848",
      "anexo": "",
      "mail": "Sistema.calidad@lan.com"
    },
    {
      "cargo": "Gerente Calidad Line & Base",
      "nombre": "Nicolas Valencia",
      "celular": "09 6595 1229",
      "anexo": "",
      "mail": "nicolas.valencia@latam.com"
    },
    {
      "cargo": "Gerente Mantto Line & Base",
      "nombre": "Javier Ferrari",
      "celular": "09 8157 7915",
      "anexo": "",
      "mail": "javier.ferrari@lan.com"
    },
    {
      "cargo": "Director Mantto Line & Base SSC",
      "nombre": "Martin Donnari",
      "celular": "09 6596 0325",
      "anexo": "",
      "mail": "martin.donnari@latam.com"
    },
    {
      "cargo": "CCD SCL Maintenance",
      "nombre": "Nestor Gonzalez",
      "celular": "09 75042552",
      "anexo": "",
      "mail": "ccd@sclmaintenance.com"
    },
    {
      "cargo": "ATT",
      "nombre": "",
      "celular": "4356/4251",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "09 6919 3188",
      "anexo": "70440",
      "mail": "MnttoANF@lan.com"
    },
    {
      "cargo": "Jefe Estación",
      "nombre": "",
      "celular": "09 68786712",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "ARI (Arica) scl maintenance",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "SCL Maintenance (tercero)",
      "nombre": "",
      "celular": "56 9 99718826 (On Duty) 56 9 54080830 (Personal)",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "BBA (Balmaceda)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "SCL Maintenance (tercero)",
      "nombre": "EDUARDO FREDERIK  LOPEZ MIHOVILOVIC",
      "celular": "09 64281415 (On Duty) 09 53719840 (Personal)",
      "anexo": "70717",
      "mail": "elopez@sclmaintenance.com"
    },
    {
      "cargo": "CCP (Concepción)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Estación",
      "nombre": "Celular de Tec de turno",
      "celular": "09 9828 4470",
      "anexo": "70138",
      "mail": "MnttoCCP@lan.com"
    },
    {
      "cargo": "Victor Garrido (particular)",
      "nombre": "",
      "celular": "09 6122 4348",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "CJC (Calama)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "09 6196 6875",
      "anexo": "70876 / 70874",
      "mail": "MnttoCJC@lan.com"
    },
    {
      "cargo": "Tec",
      "nombre": "Alonso Korner",
      "celular": "09 7233 0699",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Tec",
      "nombre": "Fernando Salvo",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Jefe Estación",
      "nombre": "Hector",
      "celular": "09 8739 9476",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "CPO sclmaintenance.com",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "SCL Maintenance (tercero)",
      "nombre": "JIMY JUAN  IMANA LOPEZ",
      "celular": "0 9 64326140 (On Duty) 0 9 54884183 (Personal)",
      "anexo": "",
      "mail": "jimana@sclmaintenance.com"
    },
    {
      "cargo": "IPC (Isla de Pascua)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "INOPERATIVO",
      "celular": "",
      "anexo": "",
      "mail": "MntIPC@lan.com"
    },
    {
      "cargo": "Tecs",
      "nombre": "DIOMAR RIQUELME",
      "celular": "0 9 57828527",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Jefe estación",
      "nombre": "Luis Alfaro",
      "celular": "0 9 4266 0705",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "IQQ (Iquique)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "09 9828 4334",
      "anexo": "70358",
      "mail": "MnttoIQQ@lan.com"
    },
    {
      "cargo": "Gonzalo Barrasa",
      "nombre": "",
      "celular": "987681812",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Jefe Base",
      "nombre": "",
      "celular": "09 9644 6967",
      "anexo": "",
      "mail": "christian.klenner@latam.com"
    },
    {
      "cargo": "LSC (La Serena)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "Freddy Labarca 09 9828 4332 Fabian Caceres  09 95320926",
      "anexo": "70627 / 70628",
      "mail": "mnttolsc@lan.com"
    },
    {
      "cargo": "MHC (Isla Chiloé)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "LATAM",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "PMC (Puerto Montt)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "Celular Mantto 099099 9711 Francisco palma 0976211720   Patricio Muñoz 0944721544",
      "anexo": "70584",
      "mail": "mnttoPMC@lan.com"
    },
    {
      "cargo": "Jefe Estacion",
      "nombre": "Ricardo Gomez",
      "celular": "997165869",
      "anexo": "",
      "mail": "0946804459 Guillermo Lara PMC"
    },
    {
      "cargo": "PUQ (Punta Arenas) WAS Chile",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone  Tercero",
      "nombre": "Sebastian Gonzalez (Jefe Estacion) Juan Valenzuela Tomas Santibañes Eduardo Jara",
      "celular": "56975046970",
      "anexo": "",
      "mail": "Sgonzalez@waschile.cl Ejara@waschile.cl Jvalenzuela@waschile.cl Tsantibañez@waschile.cl"
    },
    {
      "cargo": "ZAL (Valdivia) sclmaintenance.com",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "SCL Maintenance (tercero)",
      "nombre": "JUAN FRANCISCO BARRIOS NAVARRETE",
      "celular": "9 68319706 (On Duty) 9 85890136 (Personal) (TEC DE PLANTA)",
      "anexo": "",
      "mail": "jbarrios@sclmaintenance.com"
    },
    {
      "cargo": "ZCO (Temuco)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "09 9828 4331 // 09 8989 8760 (silvio nieves)// 09 9949 5236 Manuel Fuica",
      "anexo": "70825 / 70824",
      "mail": "mnttoZCO@lan.com"
    },
    {
      "cargo": "ZOS (Osorno)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "SCL Maintenance (tercero)",
      "nombre": "JORGE PEREZ",
      "celular": "056 9 42586943 (On Duty)  (TECNICO DE PLANTA)",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "PNT (Puerto Natales)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "Base protegida con Tec a bordo desde SCL o en comisión por días",
      "anexo": "",
      "mail": ""
    }
  ],
  "Mantto Base SCL": [
    {
      "cargo": "Super Base",
      "nombre": "",
      "celular": "",
      "anexo": "4331 / 4362 / 4695",
      "mail": ""
    },
    {
      "cargo": "Capacity Planner",
      "nombre": "",
      "celular": "",
      "anexo": "4113",
      "mail": "capacityplannerscl@lan.com"
    },
    {
      "cargo": "Floor Planner",
      "nombre": "",
      "celular": "",
      "anexo": "4837",
      "mail": ""
    },
    {
      "cargo": "DCM",
      "nombre": "",
      "celular": "",
      "anexo": "4889",
      "mail": ""
    },
    {
      "cargo": "Mantto Cabina",
      "nombre": "",
      "celular": "",
      "anexo": "95630",
      "mail": ""
    },
    {
      "cargo": "Almacén",
      "nombre": "Supervisor",
      "celular": "",
      "anexo": "4745",
      "mail": ""
    },
    {
      "cargo": "SG QC CMA 153",
      "nombre": "Cesar Borrero",
      "celular": "9 95466390",
      "anexo": "95736",
      "mail": "cesar.borrero@latam.com"
    },
    {
      "cargo": "Esp Estructuras",
      "nombre": "",
      "celular": "",
      "anexo": "4632",
      "mail": ""
    },
    {
      "cargo": "SG de Turno",
      "nombre": "",
      "celular": "",
      "anexo": "4628 / 9161",
      "mail": ""
    },
    {
      "cargo": "Taller NDT",
      "nombre": "",
      "celular": "",
      "anexo": "4669",
      "mail": "Inspecndt@lan.com"
    },
    {
      "cargo": "Jefe NDT",
      "nombre": "Juan Larrucea",
      "celular": "09 63550839",
      "anexo": "",
      "mail": "juan.larrucea@latam.com"
    },
    {
      "cargo": "Jefe Taller Mec Gral",
      "nombre": "Nelson Palomino",
      "celular": "09 7488 4482",
      "anexo": "4414",
      "mail": "nelson.palominos@latam.com"
    },
    {
      "cargo": "Taller de Motores",
      "nombre": "",
      "celular": "",
      "anexo": "4800",
      "mail": ""
    },
    {
      "cargo": "Jefe Taller Motores & APU",
      "nombre": "Carlos Tapia",
      "celular": "9 63038006",
      "anexo": "4651",
      "mail": ""
    },
    {
      "cargo": "Avionica",
      "nombre": "",
      "celular": "09 8158 1923",
      "anexo": "",
      "mail": "Ingprodaog@lan.com"
    },
    {
      "cargo": "Jefe Avionica",
      "nombre": "Nestor Navas",
      "celular": "09 6469 9097",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Sistemas",
      "nombre": "",
      "celular": "09 8158 1923",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Estructuras",
      "nombre": "",
      "celular": "09 9828 4398",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Motores PSE",
      "nombre": "",
      "celular": "09 9514 6599",
      "anexo": "",
      "mail": "GrupoWarRoomMotores@lanchile.com ingenieriapselatamaog@latam.com"
    },
    {
      "cargo": "Jefe Motores PSE",
      "nombre": "Maria Bandi",
      "celular": "228195645",
      "anexo": "",
      "mail": "maria.bandi@latam.com"
    },
    {
      "cargo": "Diferidos Flota NB",
      "nombre": "Grupo  (Jefe)",
      "celular": "09 8158 1923",
      "anexo": "7539",
      "mail": "grp_pseflotanb@latam.com"
    },
    {
      "cargo": "Diferidos Flota WB",
      "nombre": "Grupo Marcelo Muñoz (Jefe)",
      "celular": "09 9440 6415",
      "anexo": "7906",
      "mail": "pseflotawb@latam.com"
    },
    {
      "cargo": "Gerente Ing SSC",
      "nombre": "Tomas Cruz",
      "celular": "09 9531 9339",
      "anexo": "",
      "mail": "tomas.cruz@latam.com"
    },
    {
      "cargo": "GMAT",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Almacen SCL",
      "nombre": "",
      "celular": "",
      "anexo": "4745 / 4512",
      "mail": "Superalmacen@lan.com"
    },
    {
      "cargo": "Jefe herraminentas",
      "nombre": "Franco Castillo",
      "celular": "",
      "anexo": "4587",
      "mail": "franco.castillo@latam.com"
    },
    {
      "cargo": "Sup Herramientas",
      "nombre": "Humberto Contreras",
      "celular": "",
      "anexo": "4713",
      "mail": "humberto.contreras@latam.com"
    },
    {
      "cargo": "Comprador AOG",
      "nombre": "",
      "celular": "9 9828 4316",
      "anexo": "4980 / 4775",
      "mail": "GrpCompAOG@lan.com"
    },
    {
      "cargo": "Jefe Compras AOG",
      "nombre": "Marcelo Matus",
      "celular": "9 9835 8562",
      "anexo": "4847",
      "mail": "marcelo.matus@latam.com"
    }
  ],
  "Mantto Hangar SCL": [
    {
      "cargo": "Jefe Turno",
      "nombre": "",
      "celular": "",
      "anexo": "4491 / 4109 / 4831",
      "mail": "jefesTHangar@lan.com"
    },
    {
      "cargo": "Taller Compuestos / Honeycomb",
      "nombre": "",
      "celular": "",
      "anexo": "4764",
      "mail": ""
    },
    {
      "cargo": "Jefe Taller Compuestos / Honeycomb",
      "nombre": "Felipe Silva",
      "celular": "09 8360 5473",
      "anexo": "",
      "mail": "felipe.silva2@latam.com"
    },
    {
      "cargo": "Taller Estructuras",
      "nombre": "",
      "celular": "",
      "anexo": "4632",
      "mail": ""
    },
    {
      "cargo": "Cabina",
      "nombre": "",
      "celular": "",
      "anexo": "95630",
      "mail": ""
    },
    {
      "cargo": "Sercretaria Hangar",
      "nombre": "Barbara Acuña",
      "celular": "",
      "anexo": "4481",
      "mail": ""
    },
    {
      "cargo": "Gerente Mantto",
      "nombre": "Rodolfo Quintas",
      "celular": "9 8464 2576",
      "anexo": "",
      "mail": "rodolfo.quintas@latam.com"
    },
    {
      "cargo": "SG Turno",
      "nombre": "Hector Nuñez",
      "celular": "9 9789 3719",
      "anexo": "",
      "mail": "hector.nunez@latam.com"
    },
    {
      "cargo": "Director Mantto",
      "nombre": "Jaime Aguirre",
      "celular": "9 9789 7546",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "DSO",
      "nombre": "Liliana Sartori",
      "celular": "09 9289 1926",
      "anexo": "",
      "mail": "liliana.sartori@latam.com"
    },
    {
      "cargo": "Panasonic",
      "nombre": "Soporte IFE B787",
      "celular": "09 6420 0266",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "HCC",
      "nombre": "",
      "celular": "",
      "anexo": "8610 / 95443",
      "mail": ""
    },
    {
      "cargo": "ATT",
      "nombre": "",
      "celular": "",
      "anexo": "4356 / 4251",
      "mail": "jinostroza@attats.cl (TARDE) elizama@attats.cl (NOCHE) supervisores@attats.cl"
    },
    {
      "cargo": "AVIO CHILE",
      "nombre": "",
      "celular": "952428124",
      "anexo": "95659",
      "mail": ""
    },
    {
      "cargo": "WAS Maintenance // Ex SCL Maintenance",
      "nombre": "Victor Yañez Sup",
      "celular": "935056660",
      "anexo": "4413",
      "mail": ""
    },
    {
      "cargo": "Continuidad de Negocio",
      "nombre": "",
      "celular": "",
      "anexo": "4004",
      "mail": "contoper@lan.com"
    },
    {
      "cargo": "Movilización",
      "nombre": "",
      "celular": "",
      "anexo": "4772",
      "mail": "transdiaterresscl@lan.com"
    },
    {
      "cargo": "Policlinico",
      "nombre": "",
      "celular": "",
      "anexo": "2 2677 4866 2 2677 4869",
      "mail": ""
    },
    {
      "cargo": "Red urgencias ACHS",
      "nombre": "",
      "celular": "",
      "anexo": "1404",
      "mail": ""
    },
    {
      "cargo": "Seguridad aeropuerto",
      "nombre": "",
      "celular": "",
      "anexo": "9242",
      "mail": ""
    },
    {
      "cargo": "Jefe Prevención Riesgos",
      "nombre": "Turnos",
      "celular": "9 7649 4845",
      "anexo": "2100",
      "mail": "Seguridad.laboral@latam.com"
    },
    {
      "cargo": "MSIS Duty Phone",
      "nombre": "",
      "celular": "984291908",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "BLACK SCREEN",
      "nombre": "",
      "celular": "56962197371",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Publicaciones Operacionales",
      "nombre": "",
      "celular": "09 8404 8924",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Biblioteca Tecnica",
      "nombre": "",
      "celular": "",
      "anexo": "4483 / 7411",
      "mail": ""
    },
    {
      "cargo": "BOEING FIELD SUPPORT SCL",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "09 6206 6486",
      "anexo": "4601",
      "mail": "bfsscl@boeing.com"
    },
    {
      "cargo": "787 OCC",
      "nombre": "",
      "celular": "0188 01 206 544 7787",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "AIRBUS FIELD SUPPORT SCL",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "984646102",
      "anexo": "",
      "mail": "airbusT@latam.com"
    }
  ],
  "Gerentes SSC": [
    {
      "cargo": "Martin Donnari",
      "nombre": "Director Red SSC",
      "celular": "56 965960325",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Javier Ferrari",
      "nombre": "Gerente Manto Chile",
      "celular": "56 981577915",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Javier Muzio",
      "nombre": "SG Mantto Linea y Estaciones Chile",
      "celular": "56 990790500",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Tomas Cruz",
      "nombre": "SG Calidad CMA 153 (Linea y Base) Chile",
      "celular": "56 995319339",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Hector Ruiz Tagle",
      "nombre": "Jefe Mantto Base",
      "celular": "56 988880399",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Guido Contreras",
      "nombre": "Jefe Mantto Base",
      "celular": "56 978072398",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Roberto Poblete",
      "nombre": "Jefe Mantto Base",
      "celular": "56 988293037",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Eduardo Brandi",
      "nombre": "Jefe Mantto Base",
      "celular": "56 988386421",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Sergio Sanchez",
      "nombre": "Jefe Mantto Base",
      "celular": "56 966299117",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Jorge Carrasco",
      "nombre": "SG (encargado) Planning SSC",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Manuel Recabal",
      "nombre": "Gerente Ing SSC",
      "celular": "56 984496485",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Nicolas Valencia",
      "nombre": "Gerente Calidad (Operador) SSC",
      "celular": "56 965951229",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Alejandro Roak",
      "nombre": "SG Estaciones Inter",
      "celular": "56 956873337",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Ignacio Brito",
      "nombre": "SG Cabina",
      "celular": "56 984395760",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Marcelo Matus",
      "nombre": "Jefe AOG Materiales",
      "celular": "56 998358562",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Jose Zapata",
      "nombre": "Gerente Mantto Colombia",
      "celular": "57 3185320311",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Javier Rendon",
      "nombre": "SG Mantto Colombia",
      "celular": "57 3115169071",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Richar Valencia",
      "nombre": "Jefe MOC Colombia",
      "celular": "57 3157352565",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Mauricio Almeida",
      "nombre": "Gerente Mantto Ecuador",
      "celular": "59 3994350675",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Fausto Bermeo",
      "nombre": "Jefe MCC Ecuador",
      "celular": "59 3997340471",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Esteban Luconi",
      "nombre": "Gerente Mantto Perú",
      "celular": "56 956089750",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Francisco Sugay",
      "nombre": "SG Manto Perú",
      "celular": "51 993588588",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Edgar Valdivia",
      "nombre": "Jefe MCC Perú",
      "celular": "51 956845469",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Jorge Sturla",
      "nombre": "Gerente Mantto Argentina",
      "celular": "54 91169497133",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Fernando Sanchez",
      "nombre": "SG Mantto Argentina",
      "celular": "54 91156043266",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Jorge Hanson",
      "nombre": "Gerente Mantto MIA",
      "celular": "1 3058121520",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Juan Carlos Szekman",
      "nombre": "SG Mantto MIA",
      "celular": "1 7865641678",
      "anexo": "",
      "mail": ""
    }
  ],
  "Internacional": [
    {
      "cargo": "Duty Phone Latam",
      "nombre": "",
      "celular": "054 911 5428 9490",
      "anexo": "",
      "mail": "Mantenimiento_aep_lanairlines@lan.com"
    },
    {
      "cargo": "Jefe Estaciones",
      "nombre": "Gonzalo Pereira",
      "celular": "054 911 6303 6565",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "AKL (AUCKLAND)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Latam",
      "nombre": "Victor Leal",
      "celular": "064 21 126 8173",
      "anexo": "064 925 66903",
      "mail": "auckland@lan.com victor.leal@latam.com"
    },
    {
      "cargo": "Air New Zealand",
      "nombre": "Solo fines de semana",
      "celular": "",
      "anexo": "064 215 99621 064 925 57070",
      "mail": "LinePlanningAuckland@airnz.co.nz LineDutyManagers@airnz.co.nz"
    },
    {
      "cargo": "AGT (Minga Guazú/Ciudad del Este (Paraguay))",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone TAM",
      "nombre": "Carlos Romero Amgel Miranda",
      "celular": "0595 992 924 694",
      "anexo": "",
      "mail": "agtmw@latam.com"
    },
    {
      "cargo": "ASU (Asunción)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "SUB GERENTE MTTO",
      "nombre": "Hector Florentin Villagra Benitez",
      "celular": "",
      "anexo": "",
      "mail": "hector.hvillagra@latam.com"
    },
    {
      "cargo": "SUPERVISOR",
      "nombre": "Luis Cordone",
      "celular": "",
      "anexo": "",
      "mail": "luis.cordone@latam.com"
    },
    {
      "cargo": "Duty Phone TAM",
      "nombre": "",
      "celular": "0595 991 707 225",
      "anexo": "",
      "mail": "asumw@tam.com.br raul.aponte@latam.com"
    },
    {
      "cargo": "AUA (Aruba)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Tercero",
      "nombre": "",
      "celular": "0297 594 8198 0297 594 6066 0297 593 8555",
      "anexo": "",
      "mail": "cstamper@jetinternationalaua.com scordeiro@jetinternationalaua.com contact@jetinternationalaua.com"
    },
    {
      "cargo": "BCN (Barcelona)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone KLM",
      "nombre": "",
      "celular": "34 609 700 697",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "COR (Cordoba)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Latam",
      "nombre": "",
      "celular": "054 911 6353 0335",
      "anexo": "*188 8152 *188 5798",
      "mail": "Hugo.prado@latam.com Francesco.palermo@latam.com"
    },
    {
      "cargo": "CUN (CANCÚN)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "TECNICO",
      "nombre": "HOMERO",
      "celular": "052 1 9982 940 213",
      "anexo": "",
      "mail": "cun.mtc@aisg.com.mx mcc@aisg.com.mx"
    },
    {
      "cargo": "MOC AISG",
      "nombre": "",
      "celular": "052 1 9982 808 007",
      "anexo": "052 9988 815758",
      "mail": ""
    },
    {
      "cargo": "CCS (CARACAS)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "EZE (Ezeiza)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Latam",
      "nombre": "",
      "celular": "54 9 11 6188 2170 54 9 11 6301 1118 54 9 11 6720 6881 54 9 11 6001 0902 54 9 11 6000 3942",
      "anexo": "5411 4480 7797 5411 4480 7702",
      "mail": "gmaneze@lan.com"
    },
    {
      "cargo": "Team Leader de Turno Latam",
      "nombre": "",
      "celular": "054911 57153132",
      "anexo": "54114480-0609",
      "mail": ""
    },
    {
      "cargo": "Jefe de Turno Latam",
      "nombre": "",
      "celular": "054 911 6188 2170",
      "anexo": "",
      "mail": "jmantoeze@lan.com"
    },
    {
      "cargo": "Subgerente",
      "nombre": "Miguel Angel Vivas",
      "celular": "054 911 4194 7950",
      "anexo": "",
      "mail": "miguel.vivas@latam.com"
    },
    {
      "cargo": "FRA (Frankfurt)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Lufthansa Technik",
      "nombre": "",
      "celular": "049 1752 667286",
      "anexo": "049 6969 690146 049 6969 691480",
      "mail": "fra.lm.cust.opsmcc@lht.dhl.de  fra.lm.cust.opsleader@lht.dhl.de"
    },
    {
      "cargo": "Duty Phone Lufthansa Technik",
      "nombre": "MAX",
      "celular": "049 175 2667188",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "LATAM TECNICO",
      "nombre": "Paulo Roman",
      "celular": "049 17613657913",
      "anexo": "",
      "mail": "paulo.roman@latam.com"
    },
    {
      "cargo": "HAV (Havana)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Ibeca",
      "nombre": "",
      "celular": "053 5285 0550",
      "anexo": "0537 649 5755",
      "mail": "matlhva@yahoo.es"
    },
    {
      "cargo": "IAD (Washington)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Swissport",
      "nombre": "",
      "celular": "01 703 906 5310 01 571 437 3074",
      "anexo": "01 703 260 3438",
      "mail": "iadacmx@swissport.com"
    },
    {
      "cargo": "Supervisor Swissport",
      "nombre": "",
      "celular": "01 571 437 3074",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Jefe Estación Swissport",
      "nombre": "",
      "celular": "01 571 437 3075",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "IGU (Iguazú)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone TAM",
      "nombre": "",
      "celular": "055 453 521 4252",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "JFK (New York)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Latam",
      "nombre": "",
      "celular": "01 347 306 7439",
      "anexo": "*18 50398 *18 50399",
      "mail": "grupo.mantenimientojfk@lancargo.com"
    },
    {
      "cargo": "Jefe Estación Latam",
      "nombre": "Cristian Opazo",
      "celular": "01 516 914 7768",
      "anexo": "*18 50412",
      "mail": "cristian.opazo@latam.com"
    },
    {
      "cargo": "KIN (Kingston)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "AMT Duty Phone:",
      "nombre": "",
      "celular": "",
      "anexo": "(+1)(876) 816 2456/999-1428",
      "mail": ""
    },
    {
      "cargo": "Mtce Manager:",
      "nombre": "Roderick Beecher",
      "celular": "(+1)(876) 990 6119",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "CEO:",
      "nombre": "Desmond Reeves",
      "celular": "(+1)(876) 817 7046",
      "anexo": "",
      "mail": "desmond.reeves@truflt.com"
    },
    {
      "cargo": "Office",
      "nombre": "",
      "celular": "",
      "anexo": "(+1)(876) 940 3012/876-816-1591",
      "mail": "truflight.quality@truflt.com"
    },
    {
      "cargo": "LAX (Los Angeles)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Tercero",
      "nombre": "",
      "celular": "0188 01 310 770 6835",
      "anexo": "01 310 338 1290 *18 54861",
      "mail": ""
    },
    {
      "cargo": "Jefe Estación Tercero",
      "nombre": "Raul Pïzarro",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "LPB (La Paz)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Tercero",
      "nombre": "",
      "celular": "0591 7800 1663 0591 7223 4913",
      "anexo": "",
      "mail": "estacionlpb@aereosmas.com"
    },
    {
      "cargo": "MAD (Madrid)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Latam",
      "nombre": "Operación LA",
      "celular": "034 67107 3210",
      "anexo": "*18 63644 *18 63647 *18 63646 0349 1594 7103",
      "mail": "manttomad@lan.com"
    },
    {
      "cargo": "Coordinador Mantto",
      "nombre": "Luis Llorente",
      "celular": "034 686022616",
      "anexo": "034 915947103",
      "mail": "luismllorente@latam.com"
    },
    {
      "cargo": "Coordinador QC",
      "nombre": "Ignacio Alcoceba",
      "celular": "034 696772359",
      "anexo": "034 915947103",
      "mail": "ignacio.alcoceba@latam.com"
    },
    {
      "cargo": "Coordinador Almacén",
      "nombre": "Javier Melero",
      "celular": "034 636224190",
      "anexo": "034 915947103",
      "mail": "javier.melero@latam.com"
    },
    {
      "cargo": "Jefe Estación Latam",
      "nombre": "Julio Molina",
      "celular": "034 673 660 111",
      "anexo": "034 915 947 102",
      "mail": "julio.molina@latam.com"
    },
    {
      "cargo": "MBJ (Montego Bay)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone AMT",
      "nombre": "",
      "celular": "",
      "anexo": "(+1)(876) 816 2608/832-7409",
      "mail": "trufltaviation@yahoo.com admin.coordinator@truflt.com"
    },
    {
      "cargo": "Office",
      "nombre": "",
      "celular": "",
      "anexo": "(+1)(876) 940 3012/876-816-1591",
      "mail": ""
    },
    {
      "cargo": "Duty Engineer MBJ",
      "nombre": "Billy Suer",
      "celular": "(+1)(876) 534 -7908",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Mtce Manager:",
      "nombre": "Roderick Beecher",
      "celular": "(+1)(876) 990 6119",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Clive Grizzle",
      "nombre": "Clive Grizzle",
      "celular": "(+1)(876) 834-3030",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "CEO:",
      "nombre": "Desmond Reeves",
      "celular": "(+1)(876) 817 7046",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "MCO (Orlando)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Latam",
      "nombre": "Rafael Caposo",
      "celular": "01 978 902 6753",
      "anexo": "*18 54163 *18 54077",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Latam",
      "nombre": "William Cárdenas",
      "celular": "",
      "anexo": "",
      "mail": "william.cardenasposc@gmail.com"
    },
    {
      "cargo": "Director Operaciones",
      "nombre": "Esteban Luconi",
      "celular": "XXXXXXX",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "MDZ (Mendoza)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Latam",
      "nombre": "",
      "celular": "054 9261 418 0645",
      "anexo": "*188 5670",
      "mail": "Javier.reye@latam.com Pablo.alesandro@latam.com"
    },
    {
      "cargo": "MEL (Melbourne)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Menzies Maintenance Company",
      "nombre": "CHI CHIN",
      "celular": "61 0421 226 503",
      "anexo": "",
      "mail": "chi.chin@menziesaviation.com  mel.linemaintenance@menziesaviation.com  victor.riquelme@latam.com victor.leal@latam.com mauricio.cortes2@latam.com"
    },
    {
      "cargo": "MEX (Ciudad de México)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Masair",
      "nombre": "",
      "celular": "052 1 55 2098 7123",
      "anexo": "",
      "mail": "grpmantomex@masair.com grptecmantomex@masair.com YA NO ES POSIBLE VIA IP HAY QUE LLAMAR A LA OPERADORA Y MARCAR EL ANEXO (52) 55 57 01 69 00 MANTTO (5) LINEA ( 2)"
    },
    {
      "cargo": "Jefe Mantto Mas Air",
      "nombre": "Arturo Benitez",
      "celular": "052 1 55 2949 9768",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "MIA (Miami)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Latam",
      "nombre": "",
      "celular": "0188 01 786 661 6420",
      "anexo": "PAX C *1852178 *1856099  / CARGA *1856105",
      "mail": "lcrsmiapax@lancargo.com"
    },
    {
      "cargo": "Hangar",
      "nombre": "",
      "celular": "",
      "anexo": "*1856261   / *1856099",
      "mail": ""
    },
    {
      "cargo": "MOC Lan Cargo",
      "nombre": "",
      "celular": "2",
      "anexo": "*1852163  *1852164",
      "mail": "lancargomocmia@latam.com"
    },
    {
      "cargo": "Jefe Mantto",
      "nombre": "Juan Carlos Szeckman",
      "celular": "01 786 564 1678",
      "anexo": "",
      "mail": "juan.szenkman@latam.com"
    },
    {
      "cargo": "Director Operaciones",
      "nombre": "Jorge Hanson",
      "celular": "01 305 812 1520",
      "anexo": "",
      "mail": "jorge.hanson@latam.com"
    },
    {
      "cargo": "MVD (Montevideo)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "SEMA Mantto",
      "nombre": "",
      "celular": "0598 9869 5662 0598 9955 7188 0598 9916 7498 0598 9232 9309",
      "anexo": "0598 2604 0143",
      "mail": "sema@aisg.aero"
    },
    {
      "cargo": "MXP (Milan)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone KLM",
      "nombre": "",
      "celular": "039 335 563 8251",
      "anexo": "039 02 5858 0254",
      "mail": "MXP.team@klm.com"
    },
    {
      "cargo": "Mantto Manager KLM",
      "nombre": "Hans Nelson",
      "celular": "039 335 716 4143",
      "anexo": "",
      "mail": "h.nelson@td.klm.com"
    },
    {
      "cargo": "Europe Station Manager Latam",
      "nombre": "Julio Molina",
      "celular": "034 673 660 111",
      "anexo": "",
      "mail": "julio.molina@lan.com"
    },
    {
      "cargo": "CDG (París)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "AWAC Tech on duty",
      "nombre": "Office",
      "celular": "033 686 17 4829 033 678 33 1779",
      "anexo": "033 1 48 64 93 44",
      "mail": "cdg@awac-technics.com"
    },
    {
      "cargo": "AWAC Maintenance Manager",
      "nombre": "Jacques Derigon",
      "celular": "033 671 79 3581",
      "anexo": "033 1 48 64 93 44",
      "mail": "jacques.derigon@awac-technics.com"
    },
    {
      "cargo": "PPT (Tahití)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Jefe Aeropuerto Latam",
      "nombre": "Movita Vairaa",
      "celular": "",
      "anexo": "068 989 772 149",
      "mail": "movita.vairaa@lan.com"
    },
    {
      "cargo": "PUJ (Punta Cana)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Latam",
      "nombre": "",
      "celular": "018 0976 39002 018 2925 92734",
      "anexo": "018 2942 09729",
      "mail": "grpmanttpuj@lan.com"
    },
    {
      "cargo": "ROS (Rosario)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Latam",
      "nombre": "",
      "celular": "054 911  6381 6100",
      "anexo": "*188 8048",
      "mail": "Walter.Ibarra@latam.com"
    },
    {
      "cargo": "SLA (Salta)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Latam",
      "nombre": "",
      "celular": "054 938 7524 4258",
      "anexo": "*188 5913 054 387 424 8886",
      "mail": "livio.mostini@latam.com"
    },
    {
      "cargo": "SJO (San Jose de Costa Rica)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Coopesa",
      "nombre": "",
      "celular": "506 2437 2984 506 8377 5222",
      "anexo": "",
      "mail": "plinea@coopesa.com"
    },
    {
      "cargo": "Almacén",
      "nombre": "",
      "celular": "01880  506 24372865",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "SYD (Sydney)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Latam",
      "nombre": "",
      "celular": "061 4768 53927",
      "anexo": "064 4837 47032",
      "mail": "mauricio.cortes2@latam.com"
    },
    {
      "cargo": "Duty Phone Air New Zealand",
      "nombre": "",
      "celular": "061 2833 74313 061 2833 74313",
      "anexo": "",
      "mail": "SYDEngineering@airnz.co.nz"
    },
    {
      "cargo": "TLV (Tel Aviv)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone El Al Maintenance",
      "nombre": "MECH",
      "celular": "0972 3 9714 726",
      "anexo": "",
      "mail": "mccmaintmsg@elal.co.il"
    },
    {
      "cargo": "Avionic Desk El Al Maintenance",
      "nombre": "Avionic",
      "celular": "0972 3 9714 721 0972-3 9714722 0972-3 9714723",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "MCC El Al Maintenance",
      "nombre": "MCC",
      "celular": "0972 3 9714 720 0972 3 9714 721 0972 3 9714 722 0972 3 9714 723 0972 3 9714 724 0972 3 9714 725",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "VVI (Viru Viru)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone Tercero",
      "nombre": "",
      "celular": "0591 770 40117 0591 760 06716",
      "anexo": "0591 338 52423",
      "mail": "estacionvvi@aereosmas.com"
    },
    {
      "cargo": "TLV ( Tel Aviv)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "MCC",
      "nombre": "",
      "celular": "-------",
      "anexo": "972-3-9714720/1/2/3/4/5",
      "mail": "mccmaintmsg@elal.co.il"
    },
    {
      "cargo": "Mech. Desk Mcc",
      "nombre": "",
      "celular": "-------",
      "anexo": "00972-3 9714726",
      "mail": "mccmaintmsg@elal.co.il"
    },
    {
      "cargo": "Avionics Desk Mcc",
      "nombre": "",
      "celular": "-------",
      "anexo": "00972-3 9714721/2/3",
      "mail": "mccmaintmsg@elal.co.il"
    },
    {
      "cargo": "MBJ (Montego Bay)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone AMT",
      "nombre": "",
      "celular": "",
      "anexo": "(+1)(876) 816 2608/832-7409",
      "mail": "trufltaviation@yahoo.com admin.coordinator@truflt.com"
    },
    {
      "cargo": "Office",
      "nombre": "",
      "celular": "",
      "anexo": "(+1)(876) 940 3012/876-816-1591",
      "mail": ""
    },
    {
      "cargo": "Duty Engineer MBJ",
      "nombre": "Billy Suer",
      "celular": "(+1)(876) 534 -7908",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Mtce Manager:",
      "nombre": "Roderick Beecher",
      "celular": "(+1)(876) 990 6119",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Clive Grizzle",
      "nombre": "Clive Grizzle",
      "celular": "(+1)(876) 834-3030",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "CEO:",
      "nombre": "Desmond Reeves",
      "celular": "(+1)(876) 817 7046",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "KIN (Kingston)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "AMT Duty Phone:",
      "nombre": "",
      "celular": "",
      "anexo": "(+1)(876) 816 2456/999-1428",
      "mail": ""
    },
    {
      "cargo": "Mtce Manager:",
      "nombre": "Roderick Beecher",
      "celular": "(+1)(876) 990 6119",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "CEO:",
      "nombre": "Desmond Reeves",
      "celular": "(+1)(876) 817 7046",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Office",
      "nombre": "",
      "celular": "",
      "anexo": "(+1)(876) 940 3012/876-816-1591",
      "mail": ""
    },
    {
      "cargo": "LHR (Londres)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Mantto KLM",
      "nombre": "James Burns",
      "celular": "(+44) 7876 478951",
      "anexo": "",
      "mail": "‎james.burns@klm.com at.brooks@td.klm.com"
    },
    {
      "cargo": "Expeditors LHR",
      "nombre": "Theodore Cheng",
      "celular": "(+44) 7896 600151",
      "anexo": "",
      "mail": "Theodore.Cheng@expeditors.com AOGLHR@expeditors.com"
    }
  ],
  "Colombia (4C)": [
    {
      "cargo": "Super Linea",
      "nombre": "",
      "celular": "0188057 315 544 9599 01880573016777598",
      "anexo": "*18 72235",
      "mail": "SupMantoBTALANCo@lanchile.com"
    },
    {
      "cargo": "Almacen",
      "nombre": "",
      "celular": "",
      "anexo": "*1871493",
      "mail": ""
    },
    {
      "cargo": "Floor Planner",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": "FPLANNER@lan.com"
    },
    {
      "cargo": "Jefe Mantto On Duty",
      "nombre": "2021-07-24 00:00:00",
      "celular": "0188057 318 239 3873",
      "anexo": "*18 72265 *18 71441",
      "mail": "JefesmantenimientoBOG@latam.com"
    },
    {
      "cargo": "MDE (Rionegro)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Supervisor",
      "nombre": "",
      "celular": "0188 057 316 401 8350",
      "anexo": "*18 72238",
      "mail": "mantenimiento.rng@lan.com"
    },
    {
      "cargo": "BAQ (Barranquilla)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "0188057 318 373 3292",
      "anexo": "*18 72225",
      "mail": "mantenimiento.baq@lan.com"
    },
    {
      "cargo": "CTG (Cartagena)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "0188057 318 373 3280 057 316 010 7035 057 316 010 7021",
      "anexo": "*18 72227",
      "mail": "mantenimiento.ctg@lan.com"
    },
    {
      "cargo": "BGA (Bucaramanga)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "0188 057 318 370 2154",
      "anexo": "*18 72231",
      "mail": "mantenimiento.bga@lan.com"
    },
    {
      "cargo": "CLO (Cali)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "MANTTO CLO 1: 01880573160107032  MANTTO CLO 2: 01880573160107019   MANTTO CLO 3:  01880573174416780",
      "anexo": "*18 72226",
      "mail": "mantenimiento.cali@lan.com"
    },
    {
      "cargo": "MTR (Monteria)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "057 317 574 0659",
      "anexo": "*18 72229",
      "mail": "mantenimiento.mtr@lan.com"
    },
    {
      "cargo": "PEI (Pereira)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Tercero Airsite",
      "nombre": "Ivan Cardona (Supervisor)",
      "celular": "057 300 4540788",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "VUP (Valledupar)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "057 317 4392403",
      "anexo": "*18 72303",
      "mail": "jose.quiroz@latam.com"
    },
    {
      "cargo": "SMR (Santa Marta)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Tercero Airsite",
      "nombre": "Carlos Barrera (Supervisor)",
      "celular": "057 300 3978423",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "EYP (El Yopal)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Tercero TBS",
      "nombre": "",
      "celular": "057 324 3499 564",
      "anexo": "",
      "mail": "mantotbs.smr@gmail.com"
    },
    {
      "cargo": "Tercero Airsite",
      "nombre": "Elkin Moreno",
      "celular": "0573132115505- 0573009906100",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "CUC (Cúcuta)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Tercero Airsite",
      "nombre": "Sergo Carvajal (Supervisor)",
      "celular": "057 301 2067015",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "LET (Leticia)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Tercero TBS",
      "nombre": "",
      "celular": "057 311 2074 740",
      "anexo": "",
      "mail": "mantotbs.let@gmail.com"
    },
    {
      "cargo": "Tercero Airsite",
      "nombre": "Roberto Carlos Marin",
      "celular": "057 3112158673",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "ADZ (Isla San Andrés)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Tercero Airsite",
      "nombre": "Sergio Carvajal (Supervisor)",
      "celular": "0188057 301 2067015",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "PSO (Pasto)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Tercero Airsite",
      "nombre": "Ivan Cardona (Supervisor)",
      "celular": "057 300 4540788",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "AMX (Armenia)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Tercero TBS",
      "nombre": "",
      "celular": "057 324 4741 019",
      "anexo": "",
      "mail": "mantotbs.axm@gmail.com"
    },
    {
      "cargo": "Tercero Airsite",
      "nombre": "Jose Miguel Fernandez",
      "celular": "573174240473 - 573202202505",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "NVA (Neiva",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Tercero TBS",
      "nombre": "",
      "celular": "057 324 3499 578",
      "anexo": "",
      "mail": "mantotbs.nva@gmail.com"
    },
    {
      "cargo": "Tercero Airsite",
      "nombre": "Arcesio Sanchez",
      "celular": "573196750397- 573160414236",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "RCH (RIOACHA)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Tercero Airsite",
      "nombre": "Luis Carlos Perez",
      "celular": "0188057 3208075203",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "IBE(IBAGE)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Tercero Airsite",
      "nombre": "Juan Carlos Romero",
      "celular": "573202202560",
      "anexo": "",
      "mail": ""
    }
  ],
  "Perú (LP)": [
    {
      "cargo": "Ver Contactos Actualizados (control por SG Mantto LP)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "CONTACTOS MANTTO LP / ESTACIONES Y TERCEROS - CUARENTENA",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "LIM (LIMA)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Ing de Turno",
      "nombre": "On Duty",
      "celular": "051 993 588 992",
      "anexo": "*1873094",
      "mail": ""
    },
    {
      "cargo": "Contacto ATT Perú (Temporal)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Inspector de turno ATT",
      "nombre": "On duty",
      "celular": "051 923 520 681",
      "anexo": "",
      "mail": "workpackageattperu@gmail.com"
    },
    {
      "cargo": "SUPERVISOR LINE",
      "nombre": "188051",
      "celular": "",
      "anexo": "",
      "mail": ""
    }
  ],
  "Ecuador (XL)": [
    {
      "cargo": "Técnico Turno",
      "nombre": "",
      "celular": "01880593 994 352 128 01880593 987 234 872",
      "anexo": "0593 994 352 128 0593 987 234 872",
      "mail": ""
    },
    {
      "cargo": "Team Leader",
      "nombre": "",
      "celular": "01880593 994 352 189",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "GYE (Guayaquil)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Técnico",
      "nombre": "",
      "celular": "018805997 341 156 018805994 350 673",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Team Leader",
      "nombre": "",
      "celular": "0188 0593 98 723 9436",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Jefe Mantto",
      "nombre": "Roid Miranda",
      "celular": "0188 0593 983 380 992",
      "anexo": "",
      "mail": "roid.miranda@latam.com"
    },
    {
      "cargo": "Atendimiento ATT postas XL",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Ciudad",
      "nombre": "STA",
      "celular": "NOMBRE",
      "anexo": "CELULAR",
      "mail": "MAIL"
    },
    {
      "cargo": "Francisco de Orellana",
      "nombre": "OCC",
      "celular": "DANNY MOPOCITA",
      "anexo": "",
      "mail": "manttolineaOCC@attats.cl"
    },
    {
      "cargo": "Cuenca",
      "nombre": "CUE",
      "celular": "VICENTE  ATIENCIA / BRYAN PERALTA",
      "anexo": "01880 593 98 977 6748",
      "mail": "manttolineaCUE@attats.cl"
    },
    {
      "cargo": "Catamayo",
      "nombre": "LOH",
      "celular": "CRISTIAN REYES",
      "anexo": "01880 593 99 242 8890",
      "mail": "--------"
    },
    {
      "cargo": "San cristobal",
      "nombre": "SCY",
      "celular": "ANTONIO OLIVARES",
      "anexo": "01880 593 99 242 8890",
      "mail": "-----------"
    },
    {
      "cargo": "Galapagos",
      "nombre": "GPS",
      "celular": "CARLOS ITURBIDE",
      "anexo": "01880 593 99 503 6004",
      "mail": "------------"
    },
    {
      "cargo": "Manta",
      "nombre": "MEC",
      "celular": "EDISSON ERAZO",
      "anexo": "01880 593 98 138 5385",
      "mail": "----------"
    },
    {
      "cargo": "GERENTE",
      "nombre": "GERENTE",
      "celular": "ALFREDO ATIENZA",
      "anexo": "01880 593 958919048",
      "mail": "------------"
    }
  ],
  "Brasil (JJ)": [
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "055 91 981 297 095",
      "anexo": "055 913 257 1737",
      "mail": "belmw@tam.com.br"
    },
    {
      "cargo": "FOR (Fortaleza)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "055 85 996 023 829",
      "anexo": "055 85 3392 1807",
      "mail": "formw@tam.com.br"
    },
    {
      "cargo": "REC (Recife)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "055 81 999 266 759",
      "anexo": "055 81 3322 4875",
      "mail": "grp_manutencaorecmw@latam.com"
    },
    {
      "cargo": "GIG (Rio de Janeiro)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "055 21 996 729 630",
      "anexo": "055 21 3398 2280 055 21 3398 2074",
      "mail": "gigmw@tam.com.br grp_giglc@latam.com"
    },
    {
      "cargo": "GRU (Guarulhos)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Line Control",
      "nombre": "",
      "celular": "",
      "anexo": "Land Line 055 11 4517-2944",
      "mail": "terceiros.gru@tam.com.br grp_linecontrol@latam.com"
    },
    {
      "cargo": "Line Coordinator (06:00 - 18:00)",
      "nombre": "Diego",
      "celular": "055 11 986 855 659",
      "anexo": "",
      "mail": "diego.machados@latam.com"
    },
    {
      "cargo": "Line Coordinator (18:00 - 06:00)",
      "nombre": "Mario Zuza",
      "celular": "055 11 954 690 889",
      "anexo": "",
      "mail": "mario.zuza@latam.com"
    },
    {
      "cargo": "If it is impossible to contact, try the phones below in sequence",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "GRU Manager",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "MOC BR 24h",
      "nombre": "",
      "celular": "WhatsApp NB  055 11 973 980 502  WhatsApp WB  055 11 987 575 420",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "MOC Coordinator",
      "nombre": "Anderson",
      "celular": "055 11 987 816 331",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "<",
      "nombre": "Rodrigo Putini",
      "celular": "055 11 986 392 487",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "MANTTO Brasil Director",
      "nombre": "Alexandre Peronti",
      "celular": "055 16 981 392 500",
      "anexo": "",
      "mail": ""
    }
  ],
  "Argentina (4M)": [
    {
      "cargo": "Jefe de Turno Linea AEP",
      "nombre": "",
      "celular": "054 9 11 6336 1772",
      "anexo": "*188 4034",
      "mail": "JefTurAEPMant@lan.com"
    },
    {
      "cargo": "Team Lider Linea AEP",
      "nombre": "",
      "celular": "054 9 11 5824 0326",
      "anexo": "*188 4034",
      "mail": "GrupoTeamLeaderAEP@lan.com"
    },
    {
      "cargo": "Inspectores Linea",
      "nombre": "",
      "celular": "054 9 11 7054 5331 / 5298",
      "anexo": "*188 4035 / 4008",
      "mail": "xinscalaep@lan.com"
    },
    {
      "cargo": "Focal MOC e Ingenieria",
      "nombre": "",
      "celular": "054 911 5586 1803",
      "anexo": "*188 4226 / 4247",
      "mail": "grpingAEP@lan.com"
    },
    {
      "cargo": "Jefe de Ing",
      "nombre": "Guillermo Bosz",
      "celular": "054 911 5586 1803",
      "anexo": "",
      "mail": "guillermo.bosz@latam.com"
    },
    {
      "cargo": "Jefe Linea Mantto",
      "nombre": "Guillermo Deroche",
      "celular": "054 9 11 5586 1788",
      "anexo": "*188 4062",
      "mail": "Guillermo.Deroche@lan.com"
    },
    {
      "cargo": "Jefe de Estaciones",
      "nombre": "Rolando Bermejo",
      "celular": "054 911 6365 2938",
      "anexo": "*188 4227",
      "mail": "Rolando.Bermejo@lan.com"
    },
    {
      "cargo": "Jefe Inspectores",
      "nombre": "Rodolfo Hapke",
      "celular": "054 911 5248 0313",
      "anexo": "*188 4235",
      "mail": "Rodolfo.Hapke@lan.com"
    },
    {
      "cargo": "Jefe Inspectores",
      "nombre": "Sergio Mangione",
      "celular": "054 911 5476 9738",
      "anexo": "*188 4243",
      "mail": "sergio.mangiones@latam.com"
    },
    {
      "cargo": "Subgerente Producción",
      "nombre": "Leonardo Altamiranda",
      "celular": "054 911 4160 7394",
      "anexo": "*188 4241 / 4256",
      "mail": "leonardo.altamiranda@latam.com"
    },
    {
      "cargo": "Gerente Producción",
      "nombre": "Fernando Sanchez",
      "celular": "054 911 5604 3266",
      "anexo": "*188 4267",
      "mail": "fernando.sanchez@latam.com"
    },
    {
      "cargo": "Gerente Calidad",
      "nombre": "Gabriel Pablo Hernandez",
      "celular": "054 911 3912 6258",
      "anexo": "*188 4245",
      "mail": "gabriel.hernandez@latam.com"
    },
    {
      "cargo": "Gerente Ing y Planning",
      "nombre": "Jose Luis Musci",
      "celular": "054 911 5922 6546",
      "anexo": "*188 4223",
      "mail": "jose.musci@latam.com"
    },
    {
      "cargo": "Director Mantenimiento",
      "nombre": "Jorge Sturla",
      "celular": "054 911 6949 7133",
      "anexo": "*188 4203",
      "mail": "jorge.sturla@latam.com"
    },
    {
      "cargo": "EZE (Ezeiza)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "",
      "anexo": "*188 1792 / 1795",
      "mail": "mantenimiento.eze4m@lan.com"
    },
    {
      "cargo": "Team Lider",
      "nombre": "",
      "celular": "054 911 6096 0036",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Jefe de Turno Linea",
      "nombre": "",
      "celular": "054 911 7024 0435",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Jefe Linea",
      "nombre": "",
      "celular": "054 911 4480 7791",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Jefe Estación",
      "nombre": "Diego Herrera",
      "celular": "054 911 4997 2702",
      "anexo": "*188 1790",
      "mail": "diego.herrera@latam.com"
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "054911 44800690",
      "anexo": "",
      "mail": "latam"
    },
    {
      "cargo": "BRC (Bariloche)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "054 9294 457 8520",
      "anexo": "*188 5934",
      "mail": "GrpEscala.Bariloche@lan.com"
    },
    {
      "cargo": "COR (Cordoba)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "054 9351 475 9508",
      "anexo": "*188 8152 *188 5798 (CC)",
      "mail": "grp.Escala.CORDOBA@lan.com"
    },
    {
      "cargo": "CRD (Comodora Rivadavía)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "054 929 7419 7414",
      "anexo": "*188 5935",
      "mail": "grpEscala.CRD@lan.com"
    },
    {
      "cargo": "FTE (Calafate)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "054 911 3660 5664",
      "anexo": "*188 5432",
      "mail": "Grpescala.calafate@lan.com"
    },
    {
      "cargo": "IGR (Iguazú)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "054 937 6420 6293",
      "anexo": "*188 5821",
      "mail": "Grpescala.IGUAZU@lan.com"
    },
    {
      "cargo": "MDZ (Mendoza)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "054 926 1454 1994",
      "anexo": "*188 5672 / 5901 / 8249",
      "mail": "Grpescala.Mendoza@lan.com"
    },
    {
      "cargo": "NQN (Neuquén)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "054 929 9523 6466",
      "anexo": "*188 5933",
      "mail": "Grpescalaneuquen@lan.com"
    },
    {
      "cargo": "RGL (Rio Gallegos)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "054 929 6646 5350",
      "anexo": "*188 5903 054 296 6442 164",
      "mail": "Grpescala.riogallegos@lan.com"
    },
    {
      "cargo": "SLA (Salta) LEAK",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "054 938 7507 8335",
      "anexo": "*188 5913",
      "mail": "Grpescala.Salta@lan.com"
    },
    {
      "cargo": "TUC (Tucumán)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Duty Phone",
      "nombre": "",
      "celular": "054 998 1442 1953",
      "anexo": "*188 5905 *188 5715",
      "mail": "Grpescala.Tucuman@lan.com"
    },
    {
      "cargo": "USH (Ushuaia)",
      "nombre": "",
      "celular": "",
      "anexo": "",
      "mail": ""
    },
    {
      "cargo": "Empresa Externa LASA",
      "nombre": "",
      "celular": "054 929 0146 4096",
      "anexo": "*188 5932",
      "mail": "Grpescala.ushuaia@lan.com"
    }
  ]
};

// ─────────────────────────────────────────────
// OIL CONSUMPTION MODULE
// ─────────────────────────────────────────────
const OIL_ENGINES = [
  { id: "V2500", label: "V2500",  limit: 0.30, ref: "AMM TASK 71-00-00-860-010-B" },
  { id: "CFM56", label: "CFM56",  limit: 0.60, ref: "AMM TASK 72-00-00-200-008-A" },
  { id: "PWNEO", label: "PW NEO", limit: 0.20, ref: "AMM TASK 71-00-00-910-803-A" },
  { id: "RR",    label: "R/R",    limit: 0.63, ref: "DMC-B787-A-R71-00-00-07A-030A-A" },
  { id: "CF6",   label: "CF6",    limit: 0.25, ref: "AMM TASK 71-00-00-862-020-H03" },
];

function parseOilTS(s: string): Date | null {
  if (!s || !s.trim()) return null;
  const months: Record<string,number> = {JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11};
  const m = s.trim().match(/(\d{2})-([A-Z]{3})-(\d{4})\s+(\d{2}):(\d{2})/);
  if (!m) return null;
  return new Date(Date.UTC(+m[3], months[m[2]], +m[1], +m[4], +m[5]));
}

interface OilFlight {
  name: string; dep: string; arr: string;
  depActual: Date; arrActual: Date;
  blockHrs: number; oil1: number; oil2: number;
}

const OIL_SAMPLE = `LA425\tLA425\tCOMPLETE\tSCL\t07-MAY-2026 20:37 UTC\t07-MAY-2026 20:31 UTC\tAEP\t07-MAY-2026 22:40 UTC\t07-MAY-2026 22:38 UTC
LA115\tLA115\tCOMPLETE\tCPO\t07-MAY-2026 18:33 UTC\t07-MAY-2026 18:24 UTC\tSCL\t07-MAY-2026 19:51 UTC\t07-MAY-2026 19:47 UTC
LA328\tLA328\tCOMPLETE\tSCL\t07-MAY-2026 16:11 UTC\t07-MAY-2026 16:00 UTC\tCPO\t07-MAY-2026 17:43 UTC\t07-MAY-2026 17:22 UTC
LA016\tLA016\tCOMPLETE\tCCP\t07-MAY-2026 14:19 UTC\t07-MAY-2026 14:10 UTC\tSCL\t07-MAY-2026 15:15 UTC\t07-MAY-2026 15:15 UTC
LA015\tLA015\tCOMPLETE\tSCL\t07-MAY-2026 12:30 UTC\t07-MAY-2026 12:22 UTC\tCCP\t07-MAY-2026 13:39 UTC\t07-MAY-2026 13:29 UTC
LA775\tLA775\tCOMPLETE\tGIG\t06-MAY-2026 16:40 UTC\t06-MAY-2026 16:31 UTC\tSCL\t06-MAY-2026 21:30 UTC\t06-MAY-2026 23:14 UTC
LA774\tLA774\tCOMPLETE\tSCL\t06-MAY-2026 11:35 UTC\t06-MAY-2026 11:35 UTC\tGIG\t06-MAY-2026 15:40 UTC\t06-MAY-2026 15:33 UTC
LA411\tLA411\tCOMPLETE\tMVD\t05-MAY-2026 22:21 UTC\t05-MAY-2026 22:18 UTC\tSCL\t06-MAY-2026 00:59 UTC\t06-MAY-2026 00:50 UTC
LA410\tLA410\tCOMPLETE\tSCL\t05-MAY-2026 19:06 UTC\t05-MAY-2026 19:05 UTC\tMVD\t05-MAY-2026 21:31 UTC\t05-MAY-2026 21:31 UTC
LA036\tLA036\tCOMPLETE\tZCO\t05-MAY-2026 16:49 UTC\t05-MAY-2026 16:34 UTC\tSCL\t05-MAY-2026 18:12 UTC\t05-MAY-2026 18:04 UTC
LA025\tLA025\tCOMPLETE\tSCL\t05-MAY-2026 14:43 UTC\t05-MAY-2026 14:36 UTC\tZCO\t05-MAY-2026 16:03 UTC\t05-MAY-2026 16:03 UTC
LA141\tLA141\tCOMPLETE\tCJC\t05-MAY-2026 11:27 UTC\t05-MAY-2026 11:27 UTC\tSCL\t05-MAY-2026 13:30 UTC\t05-MAY-2026 13:30 UTC
LA140\tLA140\tCOMPLETE\tSCL\t05-MAY-2026 08:32 UTC\t05-MAY-2026 08:34 UTC\tCJC\t05-MAY-2026 10:41 UTC\t05-MAY-2026 10:38 UTC
LA1988\tLA1988\tCOMPLETE\tGRU\t05-MAY-2026 02:50 UTC\t05-MAY-2026 03:02 UTC\tSCL\t05-MAY-2026 07:00 UTC\t05-MAY-2026 07:34 UTC
LA3463\tLA3463\tCOMPLETE\tLDB\t04-MAY-2026 22:20 UTC\t04-MAY-2026 22:34 UTC\tGRU\t04-MAY-2026 23:35 UTC\t04-MAY-2026 23:57 UTC
LA8049\tLA8049\tCOMPLETE\tCOR\t04-MAY-2026 16:20 UTC\t04-MAY-2026 16:24 UTC\tGRU\t04-MAY-2026 19:25 UTC\t04-MAY-2026 19:25 UTC
LA8048\tLA8048\tCOMPLETE\tGRU\t04-MAY-2026 12:10 UTC\t04-MAY-2026 12:16 UTC\tCOR\t04-MAY-2026 15:30 UTC\t04-MAY-2026 15:45 UTC
LA3199\tLA3199\tCOMPLETE\tMCZ\t04-MAY-2026 05:55 UTC\t04-MAY-2026 06:10 UTC\tGRU\t04-MAY-2026 08:55 UTC\t04-MAY-2026 09:12 UTC
LA3198\tLA3198\tCOMPLETE\tGRU\t04-MAY-2026 02:10 UTC\t04-MAY-2026 02:46 UTC\tMCZ\t04-MAY-2026 05:30 UTC\t04-MAY-2026 05:30 UTC
LA3411\tLA3411\tCOMPLETE\tNVT\t03-MAY-2026 22:55 UTC\t03-MAY-2026 22:42 UTC\tGRU\t04-MAY-2026 00:20 UTC\t04-MAY-2026 00:08 UTC`;

function parseOilFlights(raw: string): OilFlight[] {
  const rows = raw.trim().split('\n').map(r => r.split('\t').map(c => c.trim()));
  const result: OilFlight[] = [];
  for (const cols of rows) {
    if (cols.length < 9) continue;
    if (cols[0].toUpperCase().includes('NAME') || cols[0].toUpperCase().includes('VUELO')) continue;
    const depA = parseOilTS(cols[5]);
    const arrA = parseOilTS(cols[8]);
    if (!depA || !arrA) continue;
    const blockMs = arrA.getTime() - depA.getTime();
    if (blockMs <= 0) continue;
    result.push({ name: cols[0], dep: cols[3], arr: cols[6], depActual: depA, arrActual: arrA, blockHrs: blockMs / 3600000, oil1: 0, oil2: 0 });
  }
  return result;
}

function fmtUTC(d: Date) {
  return d.toISOString().replace('T',' ').slice(0,16) + ' UTC';
}

// ─────────────────────────────────────────────
// BIRD STRIKE MODULE
// ─────────────────────────────────────────────
function BirdStrikeModule() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 56px)" }}>
      <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)" }}>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "#7c3aed", letterSpacing: "0.12em", marginBottom: 2 }}>// BIRD STRIKE · CHECKLIST AMM</div>
          <div style={{ fontFamily: "var(--sans)", fontSize: 16, fontWeight: 800, color: "var(--text)" }}>🐦 Bird Strike — A320 Family</div>
        </div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text3)" }}>AMM 05-51-14-200-803-A · Rev 52 · V2500 + GTF + CFM56</div>
      </div>
      <iframe
        src={`${import.meta.env.BASE_URL}birdstrike.html`}
        style={{ flex: 1, border: "none", width: "100%" }}
        title="Bird Strike Checklist"
      />
    </div>
  );
}

function OilModule() {
  const [pasteVal, setPasteVal] = useState("");
  const [flights, setFlights] = useState<OilFlight[]>([]);
  const [engId, setEngId] = useState("V2500");
  const [status, setStatus] = useState<{msg:string,ok:boolean}|null>(null);

  const eng = OIL_ENGINES.find(e => e.id === engId)!;

  const doParseFlights = (raw: string) => {
    const parsed = parseOilFlights(raw);
    if (parsed.length === 0) { setStatus({msg:"Could not parse any valid flights",ok:false}); return; }
    setFlights(parsed);
    setStatus({msg:`✓ ${parsed.length} flights loaded`,ok:true});
  };

  const loadSample = () => {
    setPasteVal(OIL_SAMPLE);
    const parsed = parseOilFlights(OIL_SAMPLE);
    const sampleOil = [0,0,0.5,0,0.5,0,1,0.5,0,0.5,0,0.5,0,0,0.5,0,0.5,0,0,0.5];
    parsed.forEach((f,i) => { f.oil1 = sampleOil[i]||0; f.oil2 = sampleOil[i]||0; });
    setFlights(parsed);
    setStatus({msg:`✓ ${parsed.length} sample flights loaded`,ok:true});
  };

  const updateOil = (idx: number, eng: 1|2, val: string) => {
    const v = parseFloat(val) || 0;
    setFlights(prev => prev.map((f,i) => i===idx ? {...f, [eng===1?'oil1':'oil2']: v} : f));
  };

  // Compute cumulative
  const computed = useMemo(() => {
    let ch=0, co1=0, co2=0;
    return flights.map((f,i) => {
      ch += f.blockHrs; co1 += f.oil1; co2 += f.oil2;
      return {...f, fc:i+1, cumulHrs:ch, cumulOil1:co1, cumulOil2:co2};
    });
  }, [flights]);

  const fh25idx = useMemo(() => {
    for (let i=0; i<computed.length; i++) if (computed[i].cumulHrs >= 25) return i;
    return computed.length - 1;
  }, [computed]);

  function rateColor(r: number) {
    if (r === 0) return "var(--text3)";
    if (r > eng.limit) return "var(--red)";
    if (r > eng.limit * 0.8) return "var(--amber)";
    return "var(--green)";
  }
  function rateStatus(r: number) {
    if (r === 0) return "";
    if (r > eng.limit) return "⚠ OVER LIMIT";
    if (r > eng.limit * 0.8) return "△ NEAR LIMIT";
    return "✓ OK";
  }
  function barPct(r: number) { return Math.min(100, eng.limit > 0 ? (r/eng.limit)*100 : 0); }

  const periods = [
    { label:"10 FC", desc:"First 10 Flight Cycles", color:"var(--accent)", idx: Math.min(9, computed.length-1) },
    { label:"20 FC", desc:"First 20 Flight Cycles", color:"var(--green)", idx: Math.min(19, computed.length-1) },
    { label:"25 FH ★", desc:"Accumulated to 25 FH", color:"var(--amber)", idx: fh25idx },
  ];

  const cardSt = { background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:10, overflow:"hidden" as const, marginBottom:16 };
  const hdrSt = { padding:"10px 16px", borderBottom:"1px solid var(--border2)", fontFamily:"var(--mono)", fontSize:10, fontWeight:700, color:"var(--text2)", textTransform:"uppercase" as const, letterSpacing:"0.1em", display:"flex", alignItems:"center", gap:8 };
  const dot = (c:string) => <span style={{width:6,height:6,borderRadius:"50%",background:c,display:"inline-block"}} />;

  return (
    <div style={{padding:"20px 24px",maxWidth:1400,margin:"0 auto"}} className="fadeIn">
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:"var(--mono)",fontSize:10,color:"#16a34a",letterSpacing:"0.12em",marginBottom:4}}>// OIL CONSUMPTION · ENGINE MONITORING</div>
        <h2 style={{fontFamily:"var(--sans)",fontWeight:800,fontSize:24,color:"var(--text)"}}>Oil Consumption Tool</h2>
      </div>

      {/* STEP 1 — PASTE */}
      <div style={cardSt}>
        <div style={hdrSt}>{dot("var(--accent)")} STEP 1 — PASTE FLIGHT DATA</div>
        <div style={{padding:16}}>
          <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text3)",marginBottom:8}}>Paste exported data (NAME · MASTER · STATUS · DEP · DEP SCHED · DEP ACTUAL · ARR · ARR SCHED · ARR ACTUAL)</div>
          <textarea value={pasteVal} onChange={e => setPasteVal(e.target.value)}
            placeholder={"LA425\tLA425\tCOMPLETE\tSCL\t07-MAY-2026 20:37 UTC\t07-MAY-2026 20:31 UTC\tAEP\t07-MAY-2026 22:40 UTC\t07-MAY-2026 22:38 UTC"}
            style={{width:"100%",height:100,background:"var(--bg)",border:"1.5px solid var(--border)",borderRadius:8,color:"var(--text)",fontFamily:"var(--mono)",fontSize:11,padding:"10px 12px",resize:"vertical",outline:"none",lineHeight:1.6}} />
          <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}>
            <button onClick={() => doParseFlights(pasteVal)} style={{padding:"6px 14px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:"var(--mono)",fontSize:11,fontWeight:600,background:"var(--accent2)",color:"white"}}>▶ Load Flights</button>
            <button onClick={loadSample} style={{padding:"6px 14px",borderRadius:6,border:"1.5px solid var(--border)",cursor:"pointer",fontFamily:"var(--mono)",fontSize:11,background:"var(--surface2)",color:"var(--text2)"}}>Load Sample</button>
            <button onClick={() => { setFlights([]); setPasteVal(""); setStatus(null); }} style={{padding:"6px 14px",borderRadius:6,border:"1.5px solid rgba(248,81,73,0.3)",cursor:"pointer",fontFamily:"var(--mono)",fontSize:11,background:"rgba(248,81,73,0.1)",color:"var(--red)"}}>↺ Clear</button>
            {status && <span style={{fontFamily:"var(--mono)",fontSize:10,color:status.ok?"var(--green)":"var(--red)"}}>{status.msg}</span>}
          </div>
        </div>
      </div>

      {flights.length > 0 && (<>

      {/* STEP 2 — ENGINE */}
      <div style={cardSt}>
        <div style={hdrSt}>{dot("var(--amber)")} STEP 2 — ENGINE TYPE &amp; LIMITS</div>
        <div style={{padding:"10px 16px",borderBottom:"1px solid var(--border2)",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap" as const}}>
          <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text3)",textTransform:"uppercase" as const,letterSpacing:"0.08em"}}>Select engine:</span>
          <div style={{display:"flex",gap:6,flexWrap:"wrap" as const}}>
            {OIL_ENGINES.map(e => (
              <button key={e.id} onClick={() => setEngId(e.id)}
                style={{padding:"4px 10px",borderRadius:5,border:"1.5px solid",cursor:"pointer",fontFamily:"var(--mono)",fontSize:10,
                  borderColor: e.id===engId ? "var(--accent)" : "var(--border)",
                  background: e.id===engId ? "rgba(88,166,255,0.12)" : "transparent",
                  color: e.id===engId ? "var(--accent)" : "var(--text2)"}}>
                {e.label}
              </button>
            ))}
          </div>
          <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text3)",marginLeft:"auto"}}>Limit: <span style={{color:"var(--amber)"}}>{eng.limit.toFixed(2)} QTS/HR</span></span>
        </div>
        <div style={{padding:"8px 16px"}}>
          <table style={{width:"100%",borderCollapse:"collapse" as const,fontFamily:"var(--mono)",fontSize:11}}>
            <thead><tr>{["Engine","Limit (QTS/HR)","AMM Reference"].map(h=><th key={h} style={{padding:"6px 10px",textAlign:"left" as const,color:"var(--text3)",fontSize:9,textTransform:"uppercase" as const,letterSpacing:"0.08em",borderBottom:"1px solid var(--border2)"}}>{h}</th>)}</tr></thead>
            <tbody>{OIL_ENGINES.map(e=><tr key={e.id} style={{background:e.id===engId?"rgba(88,166,255,0.06)":"transparent"}}>
              <td style={{padding:"7px 10px",color:e.id===engId?"var(--accent)":"var(--text)",fontWeight:e.id===engId?700:400,borderBottom:"1px solid var(--border2)"}}>{e.label}{e.id===engId?" ◀":""}</td>
              <td style={{padding:"7px 10px",color:"var(--amber)",fontFamily:"var(--mono)",borderBottom:"1px solid var(--border2)"}}>{e.limit.toFixed(2)}</td>
              <td style={{padding:"7px 10px",color:"var(--text3)",fontSize:10,borderBottom:"1px solid var(--border2)"}}>{e.ref}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>

      {/* STEP 3 — TABLE */}
      <div style={cardSt}>
        <div style={hdrSt}>{dot("var(--green)")} STEP 3 — ENTER OIL ADDED PER FLIGHT</div>
        <div style={{overflowX:"auto" as const}}>
          <table style={{width:"100%",borderCollapse:"collapse" as const,fontFamily:"var(--mono)",fontSize:11}}>
            <thead>
              <tr style={{background:"var(--surface2)",borderBottom:"1px solid var(--border)"}}>
                {["#","FLIGHT","ROUTE","DEP ACTUAL (UTC)","ARR ACTUAL (UTC)","BLOCK HRS","CUMUL HRS","OIL ENG1 (QTS)","OIL ENG2 (QTS)","CUMUL ENG1","CUMUL ENG2","PERIOD"].map((h,i)=>(
                  <th key={i} style={{padding:"8px 10px",textAlign:["BLOCK HRS","CUMUL HRS","CUMUL ENG1","CUMUL ENG2"].includes(h)?"right" as const:["OIL ENG1 (QTS)","OIL ENG2 (QTS)","PERIOD"].includes(h)?"center" as const:"left" as const,color:"var(--text3)",fontWeight:500,fontSize:9,textTransform:"uppercase" as const,letterSpacing:"0.08em",whiteSpace:"nowrap" as const}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {computed.map((f,i) => {
                const is10 = f.fc === 10;
                const is20 = f.fc === 20;
                const is25 = i === fh25idx;
                return (
                  <tr key={i} style={{borderBottom:"1px solid var(--border2)"}}>
                    <td style={{padding:"7px 10px",color:"var(--text3)",fontSize:10}}>{f.fc}</td>
                    <td style={{padding:"7px 10px",color:"var(--text)",fontWeight:500}}>{f.name}</td>
                    <td style={{padding:"7px 10px",color:"var(--text3)",fontSize:10}}>{f.dep}→{f.arr}</td>
                    <td style={{padding:"7px 10px",color:"var(--text3)",fontSize:10}}>{fmtUTC(f.depActual)}</td>
                    <td style={{padding:"7px 10px",color:"var(--text3)",fontSize:10}}>{fmtUTC(f.arrActual)}</td>
                    <td style={{padding:"7px 10px",textAlign:"right" as const,color:"var(--text)"}}>{f.blockHrs.toFixed(2)}</td>
                    <td style={{padding:"7px 10px",textAlign:"right" as const,color:"var(--text3)"}}>{f.cumulHrs.toFixed(2)}</td>
                    <td style={{padding:"7px 10px",textAlign:"center" as const}}>
                      <input type="number" min={0} step={0.1} defaultValue={f.oil1||""} placeholder="0.0"
                        onChange={e => updateOil(i,1,e.target.value)}
                        style={{width:64,background:"var(--bg)",border:"1.5px solid var(--border)",borderRadius:4,color:"var(--text)",fontFamily:"var(--mono)",fontSize:11,padding:"3px 6px",textAlign:"right" as const,outline:"none"}} />
                    </td>
                    <td style={{padding:"7px 10px",textAlign:"center" as const}}>
                      <input type="number" min={0} step={0.1} defaultValue={f.oil2||""} placeholder="0.0"
                        onChange={e => updateOil(i,2,e.target.value)}
                        style={{width:64,background:"var(--bg)",border:"1.5px solid var(--border)",borderRadius:4,color:"var(--text)",fontFamily:"var(--mono)",fontSize:11,padding:"3px 6px",textAlign:"right" as const,outline:"none"}} />
                    </td>
                    <td style={{padding:"7px 10px",textAlign:"right" as const,color:"var(--text2)"}}>{f.cumulOil1.toFixed(2)}</td>
                    <td style={{padding:"7px 10px",textAlign:"right" as const,color:"var(--text2)"}}>{f.cumulOil2.toFixed(2)}</td>
                    <td style={{padding:"7px 10px",textAlign:"center" as const}}>
                      {is10 && <span style={{display:"inline-block",padding:"1px 6px",borderRadius:3,fontSize:9,fontWeight:700,background:"rgba(88,166,255,0.15)",color:"var(--accent)",border:"1px solid rgba(88,166,255,0.3)"}}>10FC</span>}
                      {is20 && <span style={{display:"inline-block",padding:"1px 6px",borderRadius:3,fontSize:9,fontWeight:700,background:"rgba(63,185,80,0.12)",color:"var(--green)",border:"1px solid rgba(63,185,80,0.3)",marginLeft:2}}>20FC</span>}
                      {is25 && <span style={{display:"inline-block",padding:"1px 6px",borderRadius:3,fontSize:9,fontWeight:700,background:"rgba(210,153,34,0.15)",color:"var(--amber)",border:"1px solid rgba(210,153,34,0.3)",marginLeft:2}}>25FH</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* STEP 4 — SUMMARY */}
      <div style={cardSt}>
        <div style={hdrSt}>{dot("var(--red)")} CONSUMPTION SUMMARY — <span style={{color:"var(--amber)"}}>{eng.label} · Limit {eng.limit.toFixed(2)} QTS/HR</span></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,padding:16}}>
          {periods.map(p => {
            const d = computed[p.idx];
            if (!d) return null;
            const r1 = d.cumulHrs > 0 ? d.cumulOil1/d.cumulHrs : 0;
            const r2 = d.cumulHrs > 0 ? d.cumulOil2/d.cumulHrs : 0;
            const hasOil = d.cumulOil1 > 0 || d.cumulOil2 > 0;
            return (
              <div key={p.label} style={{background:"var(--surface2)",border:"1.5px solid var(--border2)",borderRadius:8,padding:14}}>
                <div style={{fontFamily:"var(--mono)",fontSize:9,color:p.color,textTransform:"uppercase" as const,letterSpacing:"0.1em",marginBottom:4}}>{p.label}</div>
                <div style={{fontFamily:"var(--mono)",fontSize:11,color:"var(--text2)",marginBottom:4}}>{p.desc}</div>
                <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)",marginBottom:10}}>{p.idx+1} FC · {d.cumulHrs.toFixed(2)} BLK HRS · Limit: {eng.limit.toFixed(2)} QTS/HR</div>
                {[{label:"ENG 1",rate:r1,oil:d.cumulOil1},{label:"ENG 2",rate:r2,oil:d.cumulOil2}].map(e => (
                  <div key={e.label} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                      <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--text3)"}}>{e.label}</span>
                      <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                        <span style={{fontFamily:"var(--mono)",fontSize:18,fontWeight:500,color:hasOil&&e.rate>0?rateColor(e.rate):"var(--text3)"}}>{hasOil&&e.rate>0?e.rate.toFixed(3):"—"}</span>
                        <span style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)"}}>QTS/HR</span>
                      </div>
                    </div>
                    <div style={{height:3,background:"var(--border)",borderRadius:2,marginTop:4,overflow:"hidden" as const}}>
                      <div style={{height:"100%",borderRadius:2,width:`${hasOil?barPct(e.rate):0}%`,background:rateColor(e.rate),transition:"width 0.4s"}} />
                    </div>
                    {hasOil && e.rate > 0 && <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--text3)",marginTop:3}}>{e.oil.toFixed(2)} QTS / {d.cumulHrs.toFixed(2)} HRS <span style={{color:rateColor(e.rate)}}>{rateStatus(e.rate)}</span></div>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      </>)}
    </div>
  );
}

function DirectorioModule() {
  const sections = Object.keys(DIRECTORIO);
  const [active, setActive] = useState(sections[0]);
  const [search, setSearch] = useState("");

  const contacts = DIRECTORIO[active] || [];
  const filtered = search.trim()
    ? contacts.filter(c => Object.values(c).some(v => v && v.toLowerCase().includes(search.toLowerCase())))
    : contacts;

  const call = (num) => {
    const clean = num.replace(/[^0-9+*#]/g, "");
    if (clean) window.open("ciscotel:" + clean);
  };

  const openMail = (m) => {
    const first = m.split(/[\s,;]+/)[0];
    if (first?.includes("@")) window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(first)}`, "_blank");
  };

  return (
    <div style={{ padding:"20px 24px", maxWidth:1200, margin:"0 auto" }} className="fadeIn">
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"#0891b2", letterSpacing:"0.12em", marginBottom:4 }}>// DIRECTORIO · CONTACTOS MOC SSC</div>
        <h2 style={{ fontFamily:"var(--sans)", fontWeight:800, fontSize:24, color:"var(--text)" }}>Directorio de Contactos</h2>
      </div>
      <input placeholder="🔍 Buscar por cargo, nombre, celular, anexo o mail..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom:16, fontSize:13 }} />
      <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:20 }}>
        <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {sections.map(s => (
            <button key={s} onClick={() => { setActive(s); setSearch(""); }}
              style={{ padding:"10px 14px", borderRadius:8, textAlign:"left", cursor:"pointer", fontFamily:"var(--mono)", fontSize:11, fontWeight: active===s ? 700 : 400, background: active===s ? "#0891b2" : "var(--surface)", color: active===s ? "white" : "var(--text2)", border: active===s ? "none" : "1.5px solid var(--border)", boxShadow: active===s ? "0 2px 8px rgba(8,145,178,0.25)" : "var(--shadow-sm)", transition:"all 0.15s" }}>
              {s} <span style={{ float:"right", opacity:0.6, fontSize:10 }}>{DIRECTORIO[s].length}</span>
            </button>
          ))}
        </div>
        <div style={{ background:"var(--surface)", border:"1.5px solid var(--border)", borderRadius:12, overflow:"hidden", boxShadow:"var(--shadow-sm)" }}>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1.4fr 0.8fr 1.4fr", gap:8, padding:"10px 16px", background:"var(--surface2)", borderBottom:"1.5px solid var(--border)", fontFamily:"var(--mono)", fontSize:9, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.1em" }}>
            <span>Cargo / Nombre</span><span>Celular</span><span>Anexo</span><span>Mail</span>
          </div>
          <div style={{ maxHeight:"65vh", overflowY:"auto" }}>
            {filtered.length === 0 && <div style={{ padding:32, textAlign:"center", color:"var(--text3)", fontFamily:"var(--mono)", fontSize:12 }}>Sin resultados</div>}
            {filtered.map((c, i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"2fr 1.4fr 0.8fr 1.4fr", gap:8, padding:"10px 16px", alignItems:"center", borderBottom:"1px solid var(--border)", background: i%2===0 ? "var(--surface)" : "var(--surface2)" }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, color:"var(--text)" }}>{c.cargo}</div>
                  {c.nombre && <div style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--text3)", marginTop:2 }}>{c.nombre}</div>}
                </div>
                <div>{c.celular ? <button onClick={() => call(c.celular)} style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--accent)", background:"rgba(29,78,216,0.07)", border:"1px solid rgba(29,78,216,0.2)", borderRadius:5, padding:"4px 8px", cursor:"pointer", width:"100%", textAlign:"left" }}>📞 {c.celular}</button> : <span style={{ color:"var(--text3)", fontSize:11 }}>—</span>}</div>
                <div>{c.anexo ? <button onClick={() => call(c.anexo)} style={{ fontFamily:"var(--mono)", fontSize:10, color:"#0891b2", background:"rgba(8,145,178,0.07)", border:"1px solid rgba(8,145,178,0.2)", borderRadius:5, padding:"4px 8px", cursor:"pointer", width:"100%" }}>☎ {c.anexo}</button> : <span style={{ color:"var(--text3)", fontSize:11 }}>—</span>}</div>
                <div>{c.mail ? <button onClick={() => openMail(c.mail)} style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--green)", background:"rgba(22,163,74,0.07)", border:"1px solid rgba(22,163,74,0.2)", borderRadius:5, padding:"4px 8px", cursor:"pointer", width:"100%", textAlign:"left", wordBreak:"break-all" }}>✉ {c.mail.split(/[\s,;]+/)[0]}</button> : <span style={{ color:"var(--text3)", fontSize:11 }}>—</span>}</div>
              </div>
            ))}
          </div>
          <div style={{ padding:"8px 16px", background:"var(--surface2)", borderTop:"1.5px solid var(--border)", fontFamily:"var(--mono)", fontSize:10, color:"var(--text3)", display:"flex", justifyContent:"space-between" }}>
            <span>{filtered.length} contacto{filtered.length!==1?"s":""}</span>
            <span>📞 = Marcar con Cisco · ✉ = Abrir Gmail</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
        <Header screen={screen} setScreen={setScreen} />
        {screen === "home"       && <HomeScreen setScreen={setScreen} />}
        {screen === "vibration"  && <VibrationModule />}
        {screen === "odor"       && <OdorModule />}
        {screen === "aog"        && <AOGModule />}
        {screen === "directorio" && <DirectorioModule />}
        {screen === "oil"        && <OilModule />}
        {screen === "birdstrike" && <BirdStrikeModule />}
      </div>
    </>
  );
}
