import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { positionTooltip } from "./utils.js";

// Real Pearson r values from Python analysis (combined Math + Portuguese, n=1044)
// Showing top 10 by |r|; 5 weaker correlates (|r| < 0.10) are omitted from the
// lollipop visual but remain in REPORT.md Table 3 for full academic disclosure.
const FIELDS_PEARSON = [
  { key: "grade_mid2",      label: "Midterm 2 (G2)",    r:  0.9107 },
  { key: "grade_mid1",      label: "Midterm 1 (G1)",    r:  0.8091 },
  { key: "failures",        label: "Past Failures",     r: -0.3831 },
  { key: "mother_edu",      label: "Mother Education",  r:  0.2015 },
  { key: "studytime",       label: "Study Time",        r:  0.1616 },
  { key: "father_edu",      label: "Father Education",  r:  0.1598 },
  { key: "alcohol_weekday", label: "Weekday Alcohol",   r: -0.1296 },
  { key: "age",             label: "Age",               r: -0.1253 },
  { key: "alcohol_weekend", label: "Weekend Alcohol",   r: -0.1157 },
  { key: "traveltime",      label: "Travel Time",       r: -0.1026 },
];

// Random Forest gini importance from the same Python analysis. Values sum to 1
// across the RF's 13 input features; we show the top 10. Unlike Pearson, RF
// importance has no sign — it captures non-linear and threshold effects, e.g.
// `absences` jumps from rank 15 in Pearson (|r| = 0.046) to rank 4 here because
// absences matter only above a threshold the linear coefficient understates.
const FIELDS_RF = [
  { key: "grade_mid2",      label: "Midterm 2 (G2)",          v: 0.4272 },
  { key: "grade_mid1",      label: "Midterm 1 (G1)",          v: 0.2781 },
  { key: "failures",        label: "Past Failures",           v: 0.0572 },
  { key: "absences",        label: "Absences",                v: 0.0518 },
  { key: "goout",           label: "Goes Out",                v: 0.0323 },
  { key: "father_edu",      label: "Father Education",        v: 0.0285 },
  { key: "alcohol_weekend", label: "Weekend Alcohol",         v: 0.0279 },
  { key: "mother_edu",      label: "Mother Education",        v: 0.0259 },
  { key: "studytime",       label: "Study Time",              v: 0.0206 },
  { key: "romantic",        label: "Romantic Relationship",   v: 0.0136 },
];

export function drawImportance(data, activeField = "grade_mid1", mode = "pearson") {
  const container = d3.select("#container-importance");
  container.selectAll("*").interrupt().remove();
  if (!data || data.length === 0) return;

  const { width, height } = container.node().getBoundingClientRect();
  if (width < 40 || height < 40) return;

  const margin = { top: 8, right: 45, bottom: 10, left: 124 };
  const W = width  - margin.left - margin.right;
  const H = height - margin.top  - margin.bottom;

  // ── Per-mode dataset and scale config ────────────────────────────
  const isPearson = mode !== "rf";
  const FIELDS = isPearson ? FIELDS_PEARSON : FIELDS_RF;
  const accessor = d => isPearson ? d.r : d.v;
  const maxAbs   = d3.max(FIELDS, d => Math.abs(accessor(d)));
  // Pearson is diverging around zero; RF is always non-negative.
  const xScale = isPearson
    ? d3.scaleLinear().domain([-maxAbs * 1.05, maxAbs * 1.05]).range([0, W])
    : d3.scaleLinear().domain([0,              maxAbs * 1.05]).range([0, W]);
  const yScale = d3.scaleBand().domain(FIELDS.map(d => d.key)).range([0, H]).padding(0.35);

  // ── Per-mode colour function: green/red by sign in Pearson, single blue in RF
  const colorOf = d => {
    if (!isPearson) return "var(--accent-blue)";
    return accessor(d) >= 0 ? "var(--accent-green)" : "var(--accent-red)";
  };

  const svg = container.append("svg")
    .attr("width", width).attr("height", height)
    .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Zero / origin line — meaningful in Pearson, marks the left edge in RF
  svg.append("line")
    .attr("x1", xScale(0)).attr("x2", xScale(0))
    .attr("y1", 0).attr("y2", H)
    .attr("stroke", "var(--border)").attr("stroke-width", 1.2);

  const tooltip = d3.select("#tooltip");

  const groups = svg.selectAll(".lollipop-g").data(FIELDS).join("g")
    .attr("class", "lollipop-g")
    .attr("transform", d => `translate(0,${yScale(d.key)})`);

  // Stems
  groups.append("line").attr("class", "lollipop-line")
    .attr("x1", xScale(0)).attr("x2", d => xScale(accessor(d)))
    .attr("y1", yScale.bandwidth() / 2).attr("y2", yScale.bandwidth() / 2)
    .attr("stroke", colorOf)
    .attr("opacity", 0.7);

  // Dots
  groups.append("circle")
    .attr("class", d => `lollipop-dot${d.key === activeField ? " active-field" : ""}`)
    .attr("cx", d => xScale(accessor(d))).attr("cy", yScale.bandwidth() / 2)
    .attr("r", d => d.key === activeField ? 7 : 5.5)
    .attr("fill", colorOf)
    .attr("stroke", d => d.key === activeField ? "var(--text-primary)" : "none")
    .attr("stroke-width", d => d.key === activeField ? 2 : 0)
    .style("cursor", "pointer")
    .on("click", (event, d) => {
      if (window.onFactorClick) window.onFactorClick(d.key, d.label);
    })
    .on("mouseover", function(event, d) {
      d3.select(this).attr("r", 8);
      const colour = colorOf(d);
      const v = accessor(d);
      const inner = isPearson
        ? `<div class="tt-grid">
             <span class="tt-label">Pearson r</span><span class="tt-val">${v.toFixed(4)}</span>
             <span class="tt-label">Direction</span><span class="tt-val">${v >= 0 ? "↑ positive" : "↓ negative"}</span>
             <span class="tt-label">R² impact</span><span class="tt-val">${(v ** 2 * 100).toFixed(1)}%</span>
           </div>`
        : `<div class="tt-grid">
             <span class="tt-label">RF importance</span><span class="tt-val">${v.toFixed(4)}</span>
             <span class="tt-label">Share</span><span class="tt-val">${(v * 100).toFixed(1)}% of forest</span>
             <span class="tt-label">Type</span><span class="tt-val">non-linear, no sign</span>
           </div>`;
      tooltip.style("opacity", 1).html(`
        <div class="tt-header" style="color:${colour}">${d.label}</div>
        ${inner}
        <div style="margin-top:5px;font-size:10px;color:var(--text-muted)">Click to explore in scatter →</div>
      `);
    })
    .on("mousemove", event => positionTooltip(tooltip, event))
    .on("mouseout", function(event, d) {
      d3.select(this).attr("r", d.key === activeField ? 7 : 5.5);
      tooltip.style("opacity", 0);
    });

  // Value labels next to dots
  groups.append("text")
    .attr("x", d => {
      const v = accessor(d);
      if (isPearson) return xScale(v) + (v >= 0 ? 9 : -9);
      return xScale(v) + 9; // RF: always extend right
    })
    .attr("y", yScale.bandwidth() / 2 + 3.5)
    .attr("text-anchor", d => (isPearson && accessor(d) < 0) ? "end" : "start")
    .style("font-family", "var(--font-body)").style("font-size", "11px").style("font-weight", "700")
    .style("fill", colorOf)
    .text(d => isPearson ? accessor(d).toFixed(3) : accessor(d).toFixed(3));

  // Field labels
  groups.append("text")
    .attr("x", -8).attr("y", yScale.bandwidth() / 2 + 4)
    .attr("text-anchor", "end")
    .style("font-family", "var(--font-body)").style("font-size", "11.5px")
    .style("fill", d => d.key === activeField ? "var(--text-primary)" : "var(--text-secondary)")
    .style("font-weight", d => d.key === activeField ? "700" : "500")
    .text(d => d.label);

  // Footnote — academic transparency about the truncation / mode
  const footnote = isPearson
    ? "Showing top 10 of 15 numeric features · 5 omitted with |r| < 0.10"
    : "Showing top 10 of 13 RF input features by gini importance · non-linear, no sign";
  container.append("div")
    .style("font-family", "var(--font-mono)").style("font-size", "9.5px")
    .style("color", "var(--text-muted)").style("padding", "4px 0 0 124px")
    .style("opacity", "0.7").style("letter-spacing", "0.02em")
    .text(footnote);

  // Legend — rendered in card-header via DOM. Different swatches per mode.
  const lgEl = document.getElementById("importance-legend");
  if (lgEl) {
    lgEl.innerHTML = "";
    const swatches = isPearson
      ? [["var(--accent-green)", "Boost Grade"], ["var(--accent-red)", "Lower Grade"]]
      : [["var(--accent-blue)",  "RF Importance (non-linear)"]];
    swatches.forEach(([color, label]) => {
      const item = document.createElement("span");
      item.className = "scatter-legend-item";
      const dot = document.createElement("span");
      dot.className = "scatter-legend-dot";
      dot.style.backgroundColor = color;
      item.appendChild(dot);
      item.appendChild(document.createTextNode(label));
      lgEl.appendChild(item);
    });
  }
}
