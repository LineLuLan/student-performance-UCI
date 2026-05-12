import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { positionTooltip } from "./utils.js";

// K-Means (k=3) on [studytime, absences, goout, alcohol_weekend]
// One fit per Subject toggle state. Clusters are sorted by at_risk ascending
// inside analyze.py and tagged with a semantic key, so "Focused Achievers"
// always means the lowest-at-risk cluster regardless of which subject is shown.
const CLUSTER_META = [
  {
    semantic: "focused",
    name:     "Focused Achievers",
    subtitle: "High study time, low risk",
    initial:  "F",
    color:    "var(--accent-green)",
    insight:  "Highest study time, best outcomes",
  },
  {
    semantic: "average",
    name:     "Average Learners",
    subtitle: "Balanced profile",
    initial:  "A",
    color:    "var(--accent-blue)",
    insight:  "Largest group, moderate engagement",
  },
  {
    semantic: "social_risk",
    name:     "Social Risk Group",
    subtitle: "High absences & alcohol",
    initial:  "S",
    color:    "var(--accent-orange)",
    insight:  "Highest dropout risk in this cohort",
  },
];

// Per-subject K-Means stats. Keys are the semantic identifiers; values are the
// numeric cluster characteristics from analyze.py. To refresh, re-run analyze.py
// and copy the ===CLUSTERS===, ===CLUSTERS_MATH===, ===CLUSTERS_POR=== blocks.
const CLUSTER_STATS_BY_SUBJECT = {
  all: {
    focused:     { n: 207, grade: 12.52, studytime: 3.28, absences: 3.20, goout: 2.82, alcohol: 1.67, health: 3.55, freetime: 3.00, at_risk: 0.126 },
    average:     { n: 524, grade: 11.34, studytime: 1.64, absences: 3.28, goout: 2.67, alcohol: 1.69, health: 3.49, freetime: 3.07, at_risk: 0.214 },
    social_risk: { n: 313, grade: 10.56, studytime: 1.66, absences: 7.18, goout: 4.20, alcohol: 3.68, health: 3.63, freetime: 3.54, at_risk: 0.294 },
  },
  math: {
    focused:     { n:  86, grade: 11.40, studytime: 3.30, absences: 4.13, goout: 2.83, alcohol: 1.65, health: 3.52, freetime: 3.00, at_risk: 0.233 },
    average:     { n: 202, grade: 10.39, studytime: 1.68, absences: 4.79, goout: 2.63, alcohol: 1.76, health: 3.54, freetime: 3.12, at_risk: 0.322 },
    social_risk: { n: 107, grade:  9.67, studytime: 1.69, absences: 8.72, goout: 4.24, alcohol: 3.80, health: 3.61, freetime: 3.64, at_risk: 0.421 },
  },
  portuguese: {
    focused:     { n: 125, grade: 13.23, studytime: 3.27, absences: 2.50, goout: 2.87, alcohol: 1.76, health: 3.59, freetime: 3.04, at_risk: 0.064 },
    average:     { n: 313, grade: 11.92, studytime: 1.63, absences: 2.40, goout: 2.65, alcohol: 1.66, health: 3.46, freetime: 3.02, at_risk: 0.150 },
    social_risk: { n: 211, grade: 11.09, studytime: 1.58, absences: 6.22, goout: 4.16, alcohol: 3.51, health: 3.61, freetime: 3.50, at_risk: 0.213 },
  },
};

const SUBJECT_LABEL = { all: "all subjects", math: "Math only", portuguese: "Portuguese only" };

// Ordered by importance (K-Means clustering variables first)
const ATTRS = [
  { key: "studytime", label: "Study Time",    max: 4,  unit: "/4" },
  { key: "absences",  label: "Absences",      max: 15, unit: " d" },
  { key: "goout",     label: "Goes Out",      max: 5,  unit: "/5" },
  { key: "alcohol",   label: "Alcohol",       max: 5,  unit: "/5" },
  { key: "health",    label: "Health Status", max: 5,  unit: "/5" },
  { key: "freetime",  label: "Free Time",     max: 5,  unit: "/5" },
];

let activeSemantic = null;        // persists across redraws (per semantic key, not raw id)
let lastSubject    = "all";        // reset activeSemantic when subject changes

export function drawPersonas(subject = "all") {
  if (subject !== lastSubject) {   // subject changed → reset selection so the
    activeSemantic = null;         // user sees the "All Students" rollup again
    lastSubject    = subject;
  }

  const stats = CLUSTER_STATS_BY_SUBJECT[subject] || CLUSTER_STATS_BY_SUBJECT.all;
  // Merge meta (names, colours) with this subject's numeric stats
  const CLUSTERS = CLUSTER_META.map(m => ({ ...m, ...stats[m.semantic] }));

  // Weighted-average "All Students" rollup for the default (no-tab-selected) state
  const totalN = CLUSTERS.reduce((s, c) => s + c.n, 0);
  const wavg = key => CLUSTERS.reduce((s, c) => s + c.n * c[key], 0) / totalN;
  const ALL = {
    name:      `All Students · ${SUBJECT_LABEL[subject]}`,
    color:     "var(--text-secondary)",
    n:         totalN,
    grade:     wavg("grade"),
    studytime: wavg("studytime"),
    absences:  wavg("absences"),
    goout:     wavg("goout"),
    alcohol:   wavg("alcohol"),
    health:    wavg("health"),
    freetime:  wavg("freetime"),
    at_risk:   CLUSTERS.reduce((s, c) => s + c.n * c.at_risk, 0) / totalN,
    insight:   "Click a tab to filter to a cluster",
  };

  const container = d3.select("#container-personas");
  container.selectAll("*").interrupt().remove();

  const { width, height } = container.node().getBoundingClientRect();
  if (width < 40 || height < 40) return;

  const tooltip = d3.select("#tooltip");
  const attrRowH = 30;
  const nAttrs = Math.min(5, Math.max(4, Math.floor((height - 150) / attrRowH)));
  const attrsToShow = ATTRS.slice(0, nAttrs);

  const wrap = container.append("div")
    .style("display", "flex").style("flex-direction", "column")
    .style("padding", "8px 10px 8px 10px").style("height", "100%")
    .style("box-sizing", "border-box").style("overflow", "hidden");

  // ── Tab row ─────────────────────────────────────────────────────
  const tabRow = wrap.append("div")
    .style("display", "flex").style("flex-shrink", "0")
    .style("margin-bottom", "10px")
    .style("box-shadow", "inset 0 -1px 0 var(--border)");

  CLUSTERS.forEach(cl => {
    const tab = tabRow.append("div").datum(cl)
      .style("flex", "1").style("display", "flex")
      .style("align-items", "center").style("justify-content", "center")
      .style("gap", "5px").style("padding", "6px 4px 8px 4px")
      .style("cursor", "pointer")
      .style("font-family", "var(--font-body)").style("font-size", "10.5px")
      .style("font-weight", "600")
      .style("transition", "color 0.15s ease, border-color 0.15s ease")
      .style("user-select", "none").style("min-width", "0");

    tab.append("span")
      .style("width", "16px").style("height", "16px").style("flex-shrink", "0")
      .style("border-radius", "50%").style("background", cl.color)
      .style("display", "inline-flex").style("align-items", "center").style("justify-content", "center")
      .style("font-size", "9.5px").style("color", "var(--bg)").style("font-weight", "700")
      .text(cl.initial);

    tab.append("span")
      .style("white-space", "nowrap").style("overflow", "hidden").style("text-overflow", "ellipsis")
      .text(cl.name);

    applyTabStyle(tab, cl, activeSemantic === cl.semantic);

    tab.on("click", function(event, d) {
      activeSemantic = activeSemantic === d.semantic ? null : d.semantic;
      tabRow.selectAll("div").each(function(db) {
        applyTabStyle(d3.select(this), db, activeSemantic === db.semantic);
      });
      const selected = activeSemantic
        ? CLUSTERS.find(c => c.semantic === activeSemantic)
        : ALL;
      renderStats(statsPanel, selected, totalN, tooltip, attrsToShow);
    });
  });

  // ── Stats panel ─────────────────────────────────────────────────
  const statsPanel = wrap.append("div")
    .style("flex", "1").style("display", "flex").style("flex-direction", "column")
    .style("gap", "6px").style("min-height", "0");

  const initial = activeSemantic
    ? CLUSTERS.find(c => c.semantic === activeSemantic)
    : ALL;
  renderStats(statsPanel, initial, totalN, tooltip, attrsToShow);
}

function applyTabStyle(tab, cl, isActive) {
  tab
    .style("border-bottom", isActive ? `3px solid ${cl.color}` : "3px solid transparent")
    .style("color", isActive ? cl.color : "var(--text-muted)");
}

function renderStats(panel, data, total, tooltip, attrsToShow) {
  panel.selectAll("*").remove();

  const color = data.name.startsWith("All Students") ? "var(--text-secondary)" : data.color;
  const riskPct = (data.at_risk * 100).toFixed(1);
  const riskColor = data.at_risk < 0.15
    ? "var(--accent-green)"
    : data.at_risk < 0.25 ? "var(--accent-yellow)" : "var(--accent-red)";

  // ── Header: name | n= | AT-RISK badge ───────────────────────────
  const hdr = panel.append("div")
    .style("display", "flex").style("align-items", "center")
    .style("gap", "6px").style("flex-shrink", "0");

  hdr.append("div")
    .style("font-family", "var(--font-body)").style("font-size", "12px").style("font-weight", "700")
    .style("color", color).style("line-height", "1.2").style("flex", "1")
    .style("white-space", "nowrap").style("overflow", "hidden").style("text-overflow", "ellipsis")
    .text(data.name);

  hdr.append("div")
    .style("font-family", "var(--font-mono)").style("font-size", "10.5px")
    .style("color", "var(--text-muted)").style("white-space", "nowrap").style("flex-shrink", "0")
    .text(`n = ${data.n.toLocaleString()} (${(data.n / total * 100).toFixed(0)}%)`);

  hdr.append("div")
    .style("display", "flex").style("align-items", "center").style("gap", "4px")
    .style("background", `color-mix(in srgb, ${riskColor} 10%, transparent)`)
    .style("border", "1px solid").style("border-color", `color-mix(in srgb, ${riskColor} 20%, transparent)`)
    .style("border-radius", "6px").style("padding", "2px 6px").style("flex-shrink", "0")
    .style("cursor", "default")
    .on("mouseover", function(event) {
      tooltip.style("opacity", 1).html(`
        <div class="tt-header" style="color:${color}">${data.name}</div>
        <div class="tt-grid">
          <span class="tt-label">At-risk rate</span><span class="tt-val">${riskPct}%</span>
          <span class="tt-label">N at-risk</span><span class="tt-val">${Math.round(data.n * data.at_risk)}</span>
        </div>
        <div style="margin-top:5px;font-size:10px;color:var(--text-muted)">${data.insight}</div>
      `);
      positionTooltip(tooltip, event);
    })
    .on("mousemove", event => positionTooltip(tooltip, event))
    .on("mouseout", () => tooltip.style("opacity", 0))
    .call(el => {
      el.append("span")
        .style("font-family", "var(--font-mono)").style("font-size", "10px").style("font-weight", "700")
        .style("color", "var(--text-muted)").text("AT-RISK ");
      el.append("span")
        .style("font-family", "var(--font-mono)").style("font-size", "11.5px").style("font-weight", "700")
        .style("color", riskColor).text(`${riskPct}%`);
    });

  // ── Grade hero ────────────────────────────────────────────────
  const gradeRow = panel.append("div")
    .style("display", "flex").style("align-items", "baseline")
    .style("gap", "6px").style("flex-shrink", "0");

  gradeRow.append("div")
    .style("font-family", "var(--font-display)").style("font-size", "24px").style("font-weight", "700")
    .style("color", color).style("line-height", "1")
    .text(data.grade.toFixed(1));

  gradeRow.append("div")
    .style("font-family", "var(--font-mono)").style("font-size", "10.5px").style("font-weight", "600")
    .style("color", "var(--text-muted)").style("letter-spacing", "0.05em")
    .text("AVG FINAL GRADE / 20");

  // ── Attribute bars ────────────────────────────────────────────
  const attrBox = panel.append("div")
    .style("display", "flex").style("flex-direction", "column")
    .style("gap", "4px").style("flex", "1").style("min-height", "0").style("overflow", "hidden");

  attrsToShow.forEach(attr => {
    const row = attrBox.append("div")
      .style("display", "flex").style("flex-direction", "column").style("gap", "4px");

    const labelLine = row.append("div")
      .style("display", "flex").style("align-items", "baseline").style("gap", "0");

    labelLine.append("span")
      .style("font-family", "var(--font-mono)").style("font-size", "10.5px").style("font-weight", "500")
      .style("color", "var(--text-muted)")
      .text(attr.label + ": ");

    labelLine.append("span")
      .style("font-family", "var(--font-mono)").style("font-size", "10.5px").style("font-weight", "700")
      .style("color", color)
      .text(`${data[attr.key].toFixed(1)}${attr.unit}`);

    const barBg = row.append("div")
      .style("height", "6px").style("background", "var(--surface-2)")
      .style("border-radius", "20px").style("overflow", "hidden");

    barBg.append("div")
      .style("height", "100%")
      .style("width", `${(data[attr.key] / attr.max * 100).toFixed(1)}%`)
      .style("background", color).style("opacity", "0.85")
      .style("border-radius", "20px")
      .style("transition", "width 0.4s ease");
  });
}
