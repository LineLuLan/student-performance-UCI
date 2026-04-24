import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { positionTooltip } from "./utils.js";

// Real Pearson r values from Python analysis (combined Math + Portuguese, n=1044)
const FIELDS = [
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
  { key: "goout",           label: "Goes Out",          r: -0.0979 },
  { key: "health",          label: "Health Status",     r: -0.0801 },
  { key: "freetime",        label: "Free Time",         r: -0.0649 },
  { key: "famrel",          label: "Family Relations",  r:  0.0545 },
  { key: "absences",        label: "Absences",          r: -0.0457 },
];

export function drawImportance(data, activeField = "grade_mid1") {
  const container = d3.select("#container-importance");
  container.selectAll("*").interrupt().remove();
  if (!data || data.length === 0) return;

  const { width, height } = container.node().getBoundingClientRect();
  if (width < 40 || height < 40) return;

  const margin = { top: 8, right: 45, bottom: 10, left: 124 };
  const W = width  - margin.left - margin.right;
  const H = height - margin.top  - margin.bottom;

  const maxAbs = d3.max(FIELDS, d => Math.abs(d.r));
  const xScale = d3.scaleLinear().domain([-maxAbs*1.05, maxAbs*1.05]).range([0, W]);
  const yScale = d3.scaleBand().domain(FIELDS.map(d=>d.key)).range([0,H]).padding(0.35);

  const svg = container.append("svg")
    .attr("width", width).attr("height", height)
    .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Zero line
  svg.append("line")
    .attr("x1", xScale(0)).attr("x2", xScale(0))
    .attr("y1", 0).attr("y2", H)
    .attr("stroke", "var(--border)").attr("stroke-width", 1.2);

  const tooltip = d3.select("#tooltip");

  const groups = svg.selectAll(".lollipop-g").data(FIELDS).join("g")
    .attr("class","lollipop-g").attr("transform",d => `translate(0,${yScale(d.key)})`);

  // Stems
  groups.append("line").attr("class","lollipop-line")
    .attr("x1", xScale(0)).attr("x2", d => xScale(d.r))
    .attr("y1", yScale.bandwidth()/2).attr("y2", yScale.bandwidth()/2)
    .attr("stroke", d => d.r >= 0 ? "var(--accent-green)" : "var(--accent-red)")
    .attr("opacity", 0.7);

  // Dots
  groups.append("circle").attr("class", d => `lollipop-dot${d.key===activeField?" active-field":""}`)
    .attr("cx", d => xScale(d.r)).attr("cy", yScale.bandwidth()/2)
    .attr("r", d => d.key===activeField ? 7 : 5.5)
    .attr("fill", d => d.r >= 0 ? "var(--accent-green)" : "var(--accent-red)")
    .attr("stroke", d => d.key===activeField ? "var(--text-primary)" : "none")
    .attr("stroke-width", d => d.key===activeField ? 2 : 0)
    .style("cursor","pointer")
    .on("click", (event, d) => {
      if (window.onFactorClick) window.onFactorClick(d.key, d.label);
    })
    .on("mouseover", function(event, d) {
      d3.select(this).attr("r", 8);
      const direction = d.r >= 0 ? "positive" : "negative";
      const sign = d.r >= 0 ? "↑" : "↓";
      tooltip.style("opacity",1).html(`
        <div class="tt-header" style="color:${d.r>=0?"var(--accent-green)":"var(--accent-red)"}">
          ${d.label}
        </div>
        <div class="tt-grid">
          <span class="tt-label">Pearson r</span><span class="tt-val">${d.r.toFixed(4)}</span>
          <span class="tt-label">Direction</span><span class="tt-val">${sign} ${direction}</span>
          <span class="tt-label">R² impact</span><span class="tt-val">${(d.r**2*100).toFixed(1)}%</span>
        </div>
        <div style="margin-top:5px;font-size:10px;color:var(--text-muted)">Click to explore in scatter →</div>
      `);
    })
    .on("mousemove", event => {
      positionTooltip(tooltip, event);
    })
    .on("mouseout", function(event, d) {
      d3.select(this).attr("r", d.key===activeField ? 7 : 5.5);
      tooltip.style("opacity",0);
    });

  // r-value labels — same font-body as field labels for visual consistency
  groups.append("text")
    .attr("x", d => xScale(d.r) + (d.r>=0 ? 9 : -9))
    .attr("y", yScale.bandwidth()/2 + 3.5)
    .attr("text-anchor", d => d.r>=0 ? "start" : "end")
    .style("font-family","var(--font-body)").style("font-size","9.5px").style("font-weight","600")
    .style("fill", d => d.r>=0 ? "var(--accent-green)" : "var(--accent-red)")
    .text(d => d.r.toFixed(3));

  // Field labels
  groups.append("text")
    .attr("x",-8).attr("y", yScale.bandwidth()/2 + 4)
    .attr("text-anchor","end")
    .style("font-family","var(--font-body)").style("font-size","10.5px").style("font-weight","500")
    .style("fill", d => d.key===activeField ? "var(--text-primary)" : "var(--text-secondary)")
    .style("font-weight", d => d.key===activeField ? "700" : "500")
    .text(d => d.label);

  // Legend — rendered in card-header via DOM
  const lgEl = document.getElementById("importance-legend");
  if (lgEl) {
    lgEl.innerHTML = "";
    [["var(--accent-green)", "Boost Grade"], ["var(--accent-red)", "Lower Grade"]].forEach(([color, label]) => {
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
