import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// K-Means (k=3) on [studytime, absences, goout, alcohol_weekend] — n=1044
// health / freetime are estimated per-cluster means (not clustering variables)
const CLUSTERS = [
  {
    id:        1,
    name:      "Focused Achievers",
    subtitle:  "High study time, low risk",
    initial:   "F",
    color:     "var(--accent-green)",
    n:         207,
    grade:     12.52,
    studytime: 3.28,
    absences:  3.20,
    goout:     2.82,
    alcohol:   1.67,
    health:    3.6,
    freetime:  2.6,
    at_risk:   0.126,
    insight:   "Highest study time, best outcomes",
  },
  {
    id:        0,
    name:      "Average Learners",
    subtitle:  "Balanced profile",
    initial:   "A",
    color:     "var(--accent-blue)",
    n:         524,
    grade:     11.34,
    studytime: 1.64,
    absences:  3.28,
    goout:     2.67,
    alcohol:   1.69,
    health:    3.5,
    freetime:  3.2,
    at_risk:   0.214,
    insight:   "Largest group, moderate engagement",
  },
  {
    id:        2,
    name:      "Social Risk Group",
    subtitle:  "High absences & alcohol",
    initial:   "S",
    color:     "var(--accent-orange)",
    n:         313,
    grade:     10.56,
    studytime: 1.66,
    absences:  7.18,
    goout:     4.20,
    alcohol:   3.68,
    health:    3.2,
    freetime:  3.7,
    at_risk:   0.294,
    insight:   "Highest dropout risk — 29.4% at-risk",
  },
];

// Weighted averages across all clusters (default state — neutral grey palette)
const ALL = {
  name:      "All Students",
  color:     "var(--text-secondary)",
  n:         1044,
  grade:     11.34,
  studytime: 1.97,
  absences:  4.43,
  goout:     3.16,
  alcohol:   2.28,
  health:    3.43,
  freetime:  3.23,
  at_risk:   0.221,
  insight:   "All 1,044 students — click a tab to filter by cluster",
};

// Ordered by importance (K-Means clustering variables first)
const ATTRS = [
  { key: "studytime", label: "Study Time",    max: 4,  unit: "/4" },
  { key: "absences",  label: "Absences",      max: 15, unit: " d" },
  { key: "goout",     label: "Goes Out",      max: 5,  unit: "/5" },
  { key: "alcohol",   label: "Alcohol",       max: 5,  unit: "/5" },
  { key: "health",    label: "Health Status", max: 5,  unit: "/5" },
  { key: "freetime",  label: "Free Time",     max: 5,  unit: "/5" },
];

let activeCluster = null;

export function drawPersonas() {
  const container = d3.select("#container-personas");
  container.selectAll("*").interrupt().remove();

  const { width, height } = container.node().getBoundingClientRect();
  if (width < 40 || height < 40) return;

  const total = CLUSTERS.reduce((s, c) => s + c.n, 0);
  const tooltip = d3.select("#tooltip");

  const attrRowH = 30;
  const nAttrs = Math.min(5, Math.max(4, Math.floor((height - 150) / attrRowH)));
  const attrsToShow = ATTRS.slice(0, nAttrs);

  const wrap = container.append("div")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("padding", "8px 10px 8px 10px")
    .style("height", "100%")
    .style("box-sizing", "border-box")
    .style("overflow", "hidden");

  // ── Tab row ─────────────────────────────────────────────────────
  const tabRow = wrap.append("div")
    .style("display", "flex")
    .style("flex-shrink", "0")
    .style("margin-bottom", "10px")
    .style("box-shadow", "inset 0 -1px 0 var(--border)");

  CLUSTERS.forEach(cl => {
    const tab = tabRow.append("div")
      .datum(cl)
      .style("flex", "1")
      .style("display", "flex")
      .style("align-items", "center")
      .style("justify-content", "center")
      .style("gap", "5px")
      .style("padding", "6px 4px 8px 4px")
      .style("cursor", "pointer")
      .style("font-family", "var(--font-body)")
      .style("font-size", "10.5px")
      .style("font-weight", "600")
      .style("transition", "color 0.15s ease, border-color 0.15s ease")
      .style("user-select", "none")
      .style("min-width", "0");

    tab.append("span")
      .style("width", "16px").style("height", "16px").style("flex-shrink", "0")
      .style("border-radius", "50%")
      .style("background", cl.color)
      .style("display", "inline-flex").style("align-items", "center").style("justify-content", "center")
      .style("font-size", "9.5px").style("color", "white").style("font-weight", "700")
      .text(cl.initial);

    tab.append("span")
      .style("white-space", "nowrap").style("overflow", "hidden").style("text-overflow", "ellipsis")
      .text(cl.name);

    applyTabStyle(tab, cl, activeCluster?.id === cl.id);

    tab.on("click", function(event, d) {
      activeCluster = activeCluster?.id === d.id ? null : d;
      tabRow.selectAll("div").each(function(db) {
        applyTabStyle(d3.select(this), db, activeCluster?.id === db.id);
      });
      renderStats(statsPanel, activeCluster || ALL, total, tooltip, attrsToShow);
    });
  });

  // ── Stats panel ─────────────────────────────────────────────────
  const statsPanel = wrap.append("div")
    .style("flex", "1")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("gap", "6px")
    .style("min-height", "0");

  renderStats(statsPanel, activeCluster || ALL, total, tooltip, attrsToShow);
}

function applyTabStyle(tab, cl, isActive) {
  tab
    .style("border-bottom", isActive ? `3px solid ${cl.color}` : "3px solid transparent")
    .style("color", isActive ? cl.color : "var(--text-muted)");
}

function renderStats(panel, data, total, tooltip, attrsToShow) {
  panel.selectAll("*").remove();

  const color = data.name === "All Students" ? "var(--text-secondary)" : data.color;
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
    .style("font-family", "var(--font-mono)").style("font-size", "9px")
    .style("color", "var(--text-muted)").style("white-space", "nowrap").style("flex-shrink", "0")
    .text(`n = ${data.n.toLocaleString()} (${(data.n / total * 100).toFixed(0)}%)`);

  // AT-RISK badge — inline trong header, thay thế vị trí cũ ở cuối
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
      tooltip.style("left", (event.clientX + 14) + "px").style("top", (event.clientY - 10) + "px");
    })
    .on("mousemove", event =>
      tooltip.style("left", (event.clientX + 14) + "px").style("top", (event.clientY - 10) + "px"))
    .on("mouseout", () => tooltip.style("opacity", 0))
    .call(el => {
      el.append("span")
        .style("font-family", "var(--font-mono)").style("font-size", "8px").style("font-weight", "700")
        .style("color", "var(--text-muted)").text("AT-RISK ");
      el.append("span")
        .style("font-family", "var(--font-mono)").style("font-size", "10px").style("font-weight", "700")
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
    .style("font-family", "var(--font-mono)").style("font-size", "9px")
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
      .style("font-family", "var(--font-mono)").style("font-size", "9px").style("font-weight", "500")
      .style("color", "var(--text-muted)")
      .text(attr.label + ": ");

    labelLine.append("span")
      .style("font-family", "var(--font-mono)").style("font-size", "9px").style("font-weight", "700")
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