import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { drawScatter }     from "./charts/scatter.js";
import { drawImportance }  from "./charts/importance.js";
import { drawPersonas }    from "./charts/personas.js";
import { drawRisk }        from "./charts/risk.js";
import { drawProgression } from "./charts/progression.js";
import { drawHistogram }   from "./charts/histogram.js";

// ── Theme initialization (persists across reloads, respects OS preference) ──
const savedTheme = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
document.documentElement.setAttribute("data-theme", initialTheme);

// ── View configuration ───────────────────────────────────────────
const VIEW_CONFIG = {
  sex: {
    label:      "Gender",
    field:      "sex",
    values:     ["f", "m"],
    chipLabels: ["Female", "Male"],
    colors:     ["var(--accent-purple)", "var(--accent-blue)"],
    insightLabel: "GENDER GAP",
    scatterTitle: "Grade Distribution by Gender",
  },
  school: {
    label:      "School",
    field:      "school",
    values:     ["gp", "ms"],
    chipLabels: ["Gabriel Pereira", "Mousinho da Silveira"],
    colors:     ["var(--accent-blue)", "var(--accent-green)"],
    insightLabel: "SCHOOL COMPARISON",
    scatterTitle: "Performance by School",
  },
  internet: {
    label:      "Internet Access",
    field:      "internet",
    values:     [1, 0],
    chipLabels: ["Has Internet", "No Internet"],
    colors:     ["var(--accent-green)", "var(--accent-red)"],
    insightLabel: "DIGITAL DIVIDE",
    scatterTitle: "Internet Access vs Academic Performance",
  },
  higher: {
    label:      "Higher Education",
    field:      "higher",
    values:     [1, 0],
    chipLabels: ["Wants Higher Edu", "No Goal"],
    colors:     ["var(--accent-blue)", "var(--text-muted)"],
    insightLabel: "ASPIRATION EFFECT",
    scatterTitle: "Higher Education Goal vs Performance",
  },
};

// ── State ────────────────────────────────────────────────────────
let allData        = [];
let currentView    = "sex";
let currentSubject = "all";
let activeChips    = new Set(VIEW_CONFIG[currentView].values.map(String));
let scatterXField  = "grade_mid1";
let histGrade      = "grade_final";
window.__viewField__  = VIEW_CONFIG[currentView].field;
window.__viewColors__ = VIEW_CONFIG[currentView].colors;
window.__viewValues__ = VIEW_CONFIG[currentView].values;
window.__viewLabels__ = VIEW_CONFIG[currentView].chipLabels;

// ── CSV load & coerce ────────────────────────────────────────────
d3.csv("data/clean_students.csv", d => ({
  school:         (d.school||"").toLowerCase(),
  sex:            (d.sex||"").toLowerCase(),
  age:            +d.age,
  address:        (d.address||"").toLowerCase(),
  famsize:        (d.famsize||"").toLowerCase(),
  pstatus:        (d.pstatus||"").toLowerCase(),
  mother_edu:     +d.mother_edu,
  father_edu:     +d.father_edu,
  mother_job:     (d.mother_job||"").toLowerCase(),
  father_job:     (d.father_job||"").toLowerCase(),
  reason:         (d.reason||"").toLowerCase(),
  guardian:       (d.guardian||"").toLowerCase(),
  traveltime:     +d.traveltime,
  studytime:      +d.studytime,
  failures:       +d.failures,
  schoolsup:      +d.schoolsup,
  famsup:         +d.famsup,
  paid:           +d.paid,
  activities:     +d.activities,
  nursery:        +d.nursery,
  higher:         +d.higher,
  internet:       +d.internet,
  romantic:       +d.romantic,
  famrel:         +d.famrel,
  freetime:       +d.freetime,
  goout:          +d.goout,
  alcohol_weekday:  +d.alcohol_weekday,
  alcohol_weekend:  +d.alcohol_weekend,
  health:         +d.health,
  absences:       +d.absences,
  grade_mid1:     +d.grade_mid1,
  grade_mid2:     +d.grade_mid2,
  grade_final:    +d.grade_final,
  at_risk:        +d.at_risk,
  subject:        (d.subject||"").toLowerCase(),
  cluster:        +d.cluster,
})).then(data => {
  allData = data;
  buildViewSwitcher();
  buildChipBar();
  update();
  setupResizeObserver();
}).catch(err => {
  document.body.innerHTML = `<div style="padding:2rem;color:red;font-family:monospace">
    Error loading data: ${err.message}<br>
    Make sure to run: <b>python -m http.server 8000 --directory web</b>
  </div>`;
});

// ── Build UI ─────────────────────────────────────────────────────
function buildViewSwitcher() {
  const container = document.getElementById("view-switcher");
  container.innerHTML = "";
  Object.entries(VIEW_CONFIG).forEach(([key, cfg]) => {
    const btn = document.createElement("button");
    btn.className = "view-btn" + (key === currentView ? " active" : "");
    btn.textContent = cfg.label;
    btn.addEventListener("click", () => switchView(key));
    container.appendChild(btn);
  });
}

function buildChipBar() {
  const view = VIEW_CONFIG[currentView];
  const bar  = document.getElementById("chip-bar");
  bar.innerHTML = "";
  view.values.forEach((val, i) => {
    const active = activeChips.has(String(val));
    const chip = document.createElement("div");
    chip.className = "chip" + (active ? "" : " inactive");
    chip.textContent = view.chipLabels[i];
    chip.style.background    = active ? colorMix(view.colors[i], 0.15) : "";
    chip.style.color         = active ? view.colors[i] : "";
    chip.style.borderColor   = active ? colorMix(view.colors[i], 0.4) : "";
    chip.setAttribute("role", "button");
    chip.setAttribute("tabindex", "0");
    chip.setAttribute("aria-pressed", active ? "true" : "false");
    chip.setAttribute("aria-label", `${active ? "Hide" : "Show"} ${view.chipLabels[i]}`);
    chip.addEventListener("click", () => toggleChip(val));
    chip.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleChip(val);
      }
    });
    bar.appendChild(chip);
  });
}

// ── Subject toggle ───────────────────────────────────────────────
document.getElementById("subject-toggle").addEventListener("click", e => {
  const btn = e.target.closest(".subj-btn");
  if (!btn) return;
  document.querySelectorAll(".subj-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  currentSubject = btn.dataset.subj;
  update();
});

// ── Theme toggle ─────────────────────────────────────────────────
const themeBtn = document.getElementById("theme-toggle");
themeBtn.setAttribute("aria-pressed", document.documentElement.dataset.theme === "dark" ? "true" : "false");
themeBtn.addEventListener("click", () => {
  const html = document.documentElement;
  const next = html.dataset.theme === "dark" ? "light" : "dark";
  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  themeBtn.setAttribute("aria-pressed", next === "dark" ? "true" : "false");
  drawAll(getFilteredData());
});

// ── Grade toggle (histogram) ─────────────────────────────────────
document.getElementById("grade-toggle").addEventListener("click", e => {
  const btn = e.target.closest(".tgl-btn");
  if (!btn) return;
  document.querySelectorAll(".tgl-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  histGrade = btn.dataset.grade;
  drawHistogram(getFilteredData(), histGrade);
});

// ── Progression group-by select ──────────────────────────────────
document.getElementById("progression-select").addEventListener("change", e => {
  drawProgression(getFilteredData(), e.target.value);
});

// ── Data filtering ───────────────────────────────────────────────
function getFilteredData() {
  let data = allData;
  if (currentSubject !== "all") data = data.filter(d => d.subject === currentSubject);
  const view = VIEW_CONFIG[currentView];
  if (activeChips.size > 0 && activeChips.size < view.values.length) {
    data = data.filter(d => activeChips.has(String(d[view.field])));
  }
  return data;
}

// ── Interaction handlers ─────────────────────────────────────────
function switchView(key) {
  currentView = key;
  const view  = VIEW_CONFIG[key];
  activeChips = new Set(view.values.map(String));
  window.__viewField__  = view.field;
  window.__viewColors__ = view.colors;
  window.__viewValues__ = view.values;
  window.__viewLabels__ = view.chipLabels;
  buildViewSwitcher();
  buildChipBar();
  update();
}

function toggleChip(val) {
  const s = String(val);
  if (activeChips.has(s)) {
    if (activeChips.size === 1) return; // last chip — nothing changes
    activeChips.delete(s);
  } else {
    activeChips.add(s);
  }
  buildChipBar();
  update();
}

// Called from importance.js when a lollipop dot is clicked
window.onFactorClick = function(field, label) {
  scatterXField = field;
  const titleEl = document.getElementById("scatter-title");
  if (titleEl) titleEl.textContent = `${label} vs Final Grade G3`;
  drawScatter(getFilteredData(), scatterXField);
  drawImportance(allData, scatterXField);
};

// ── Update cycle ─────────────────────────────────────────────────
function update() {
  const data = getFilteredData();
  updateKPI(data);
  updateInsight(data);
  drawAll(data);
}

function drawAll(data) {
  drawScatter(data, scatterXField);
  drawImportance(allData, scatterXField);
  drawProgression(data, document.getElementById("progression-select").value);
  drawHistogram(data, histGrade);
  drawPersonas();
  drawRisk();
}

// ── KPI ──────────────────────────────────────────────────────────
function updateKPI(data) {
  const n    = data.length;
  const avg  = d3.mean(data, d => d.grade_final) || 0;
  const pass = data.filter(d => d.grade_final >= 10).length;
  const abs  = d3.mean(data, d => d.absences) || 0;
  const risk = data.filter(d => d.at_risk === 1).length;

  document.getElementById("kpi-total").innerHTML = n.toLocaleString();
  document.getElementById("kpi-grade").innerHTML = `${avg.toFixed(1)} <span class="kpi-unit">/20</span>`;
  document.getElementById("kpi-pass").innerHTML  = `${(pass/n*100).toFixed(0)}<span class="kpi-unit">%</span>`;
  document.getElementById("kpi-absent").innerHTML= `${abs.toFixed(1)} <span class="kpi-unit">days</span>`;
  document.getElementById("kpi-risk").innerHTML  = `${(risk/n*100).toFixed(0)}<span class="kpi-unit">%</span>`;
  document.getElementById("kpi-factor").textContent = "Past Failures";
}

// ── Insight strip ─────────────────────────────────────────────────
function updateInsight(data) {
  const view   = VIEW_CONFIG[currentView];
  const groups = view.values.map(v => ({
    label: view.chipLabels[view.values.indexOf(v)],
    mean:  d3.mean(data.filter(d => String(d[view.field]) === String(v)), d => d.grade_final) || 0,
  }));
  const diff   = groups[0].mean - groups[1].mean;
  const leader = diff >= 0 ? groups[0].label : groups[1].label;
  const diffStr = Math.abs(diff) < 0.05 ? "virtually equal" : `${Math.abs(diff).toFixed(1)} pts higher`;

  document.getElementById("insight-label").textContent = view.insightLabel;
  document.getElementById("insight-stat").textContent  = diffStr === "virtually equal" ? "" : `+${Math.abs(diff).toFixed(1)} pts`;
  document.getElementById("insight-desc").textContent  =
    diffStr === "virtually equal"
      ? "both groups perform similarly"
      : `avg grade: ${groups[0].label} ${groups[0].mean.toFixed(1)} · ${groups[1].label} ${groups[1].mean.toFixed(1)}`;
}

// ── Resize ───────────────────────────────────────────────────────
function setupResizeObserver() {
  const ro = new ResizeObserver(() => drawAll(getFilteredData()));
  document.querySelectorAll(".card-body").forEach(el => ro.observe(el));
}

// ── Utility ──────────────────────────────────────────────────────
function colorMix(cssVar, alpha) {
  return `color-mix(in srgb, ${cssVar} ${(alpha*100).toFixed(0)}%, transparent)`;
}
