import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { positionTooltip } from "./utils.js";

const FIELD_LABELS = {
  grade_mid1:       "Midterm 1 (G1)",
  grade_mid2:       "Midterm 2 (G2)",
  failures:         "Past Failures",
  mother_edu:       "Mother Education",
  studytime:        "Study Time",
  father_edu:       "Father Education",
  alcohol_weekday:  "Weekday Alcohol",
  age:              "Student Age",
  alcohol_weekend:  "Weekend Alcohol",
  traveltime:       "Travel Time",
  goout:            "Goes Out",
  health:           "Health Status",
  freetime:         "Free Time",
  famrel:           "Family Relations",
  absences:         "Absences",
};

export function drawScatter(data, xField = "grade_mid1") {
  const container = d3.select("#container-scatter");
  container.selectAll("*").interrupt().remove();
  if (!data || data.length === 0) {
    container.append("div").style("padding","20px").style("color","var(--text-muted)").text("No data for this filter.");
    return;
  }

  const { width, height } = container.node().getBoundingClientRect();
  if (width < 40 || height < 40) return;

  const margin = { top: 10, right: 20, bottom: 40, left: 44 };
  const W = width  - margin.left - margin.right;
  const H = height - margin.top  - margin.bottom;

  const viewField  = window.__viewField__  || "sex";
  const viewColors = window.__viewColors__ || ["var(--accent-purple)", "var(--accent-blue)"];
  const viewValues = (window.__viewValues__ || []).map(String);
  const viewLabels =  window.__viewLabels__ || [];
  const labelMap   = Object.fromEntries(viewValues.map((v,i) => [v, viewLabels[i] || v]));

  // Scales
  const xDomain = xField === "grade_mid1" || xField === "grade_mid2"
    ? [0, 20] : d3.extent(data, d => d[xField]).map((v,i) => i===0 ? v-0.5 : v+0.5);
  const xScale = d3.scaleLinear().domain(xDomain).range([0, W]).nice();
  const yScale = d3.scaleLinear().domain([0, 20]).range([H, 0]);

  // Color scale from current view
  const allVals  = [...new Set(data.map(d => String(d[viewField])))];
  const colorMap = {};
  allVals.forEach((v, i) => colorMap[v] = viewColors[i % viewColors.length]);

  // Keep a reference to the SVG element so we can draw the top strip on it directly
  const svgEl = container.append("svg").attr("width", width).attr("height", height);
  const svg   = svgEl.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Grid lines
  svg.append("g").attr("class","grid-lines")
    .selectAll("line").data(yScale.ticks(5)).join("line")
    .attr("class","grid-line")
    .attr("x1",0).attr("x2",W)
    .attr("y1",d => yScale(d)).attr("y2",d => yScale(d));

  // Pass threshold line at y=10
  svg.append("line")
    .attr("x1",0).attr("x2",W)
    .attr("y1",yScale(10)).attr("y2",yScale(10))
    .attr("stroke","var(--accent-red)").attr("stroke-dasharray","5,4")
    .attr("stroke-width",1).attr("opacity",0.5);
  svg.append("text")
    .attr("x",W-2).attr("y",yScale(10)-4)
    .attr("text-anchor","end")
    .style("font-family","var(--font-mono)").style("font-size","9px")
    .style("fill","var(--accent-red)").style("opacity","0.7")
    .text("PASS THRESHOLD");

  // Regression line only (annotation moves to top strip)
  const reg = linearRegression(data, xField);
  if (reg) {
    const x1 = xScale.domain()[0], x2 = xScale.domain()[1];
    svg.append("line").attr("class","reg-line")
      .attr("x1",xScale(x1)).attr("y1",yScale(reg.slope*x1 + reg.intercept))
      .attr("x2",xScale(x2)).attr("y2",yScale(reg.slope*x2 + reg.intercept))
      .attr("stroke","var(--text-muted)");
  }

  // Scatter dots
  const jitter = d3.randomNormal(0, 0.35);
  const tooltip = d3.select("#tooltip");

  svg.append("g").attr("class","dots")
    .selectAll("circle").data(data).join("circle")
    .attr("class","dot")
    .attr("cx", d => xScale(+d[xField] + jitter()))
    .attr("cy", d => yScale(d.grade_final))
    .attr("r",  2.5)
    .attr("fill", d => colorMap[String(d[viewField])] || "var(--text-muted)")
    .attr("opacity", 0.45)
    .attr("stroke","none")
    .on("mouseover", function(event, d) {
      d3.select(this).attr("r", 5).attr("opacity", 1);
      const color = colorMap[String(d[viewField])] || "var(--accent-blue)";
      tooltip.style("opacity", 1).html(`
        <div class="tt-header" style="color:${color}">
          ${d.school.toUpperCase()} · ${d.sex === "f" ? "Female" : "Male"}
        </div>
        <div class="tt-grid">
          <span class="tt-label">G1 (mid-1)</span><span class="tt-val">${d.grade_mid1}/20</span>
          <span class="tt-label">G2 (mid-2)</span><span class="tt-val">${d.grade_mid2}/20</span>
          <span class="tt-label">G3 (final)</span><span class="tt-val">${d.grade_final}/20</span>
          <span class="tt-label">Absences</span><span class="tt-val">${d.absences} days</span>
          <span class="tt-label">Study time</span><span class="tt-val">Level ${d.studytime}/4</span>
          <span class="tt-label">Failures</span><span class="tt-val">${d.failures}</span>
        </div>
        <div class="tt-badge ${d.at_risk ? 'risk' : 'pass'}">${d.at_risk ? '⚠ At Risk (G3 < 10)' : '✓ Passing'}</div>
      `);
    })
    .on("mousemove", event => {
      positionTooltip(tooltip, event);
    })
    .on("mouseout", function() {
      d3.select(this).attr("r", 2.5).attr("opacity", 0.45);
      tooltip.style("opacity", 0);
    });

  // Axes
  const xLabel = FIELD_LABELS[xField] || xField;
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${H})`).call(
    d3.axisBottom(xScale).ticks(6).tickSizeOuter(0)
  );
  svg.append("g").attr("class","axis").call(
    d3.axisLeft(yScale).ticks(5).tickSizeOuter(0)
  );
  svg.append("text").attr("x", W/2).attr("y", H + 34)
    .attr("text-anchor","middle")
    .style("font-family","var(--font-mono)").style("font-size","10px").style("font-weight","600")
    .style("fill","var(--text-muted)").text(xLabel.toUpperCase());
  svg.append("text").attr("transform","rotate(-90)")
    .attr("x",-H/2).attr("y",-34).attr("text-anchor","middle")
    .style("font-family","var(--font-mono)").style("font-size","10px").style("font-weight","600")
    .style("fill","var(--text-muted)").text("FINAL GRADE (G3)");

  // ── Header stat: r / R² ─────────────────────────────────────────
  const statEl = document.getElementById("scatter-stat");
  if (statEl) statEl.textContent = reg ? `r = ${reg.r.toFixed(3)}  ·  R² = ${(reg.r**2).toFixed(3)}` : "";

  // ── Header legend ───────────────────────────────────────────────
  const legendEl = document.getElementById("scatter-legend");
  if (legendEl) {
    legendEl.innerHTML = "";
    const legendData = allVals.filter(v => data.some(d => String(d[viewField]) === v));
    legendData.forEach(v => {
      const lbl = labelMap[v] || v;
      const item = document.createElement("span");
      item.className = "scatter-legend-item";
      const dot = document.createElement("span");
      dot.className = "scatter-legend-dot";
      dot.style.backgroundColor = colorMap[v];
      item.appendChild(dot);
      item.appendChild(document.createTextNode(lbl));
      legendEl.appendChild(item);
    });
  }
}

function linearRegression(data, xField) {
  const pts = data.filter(d => !isNaN(d[xField]) && !isNaN(d.grade_final));
  if (pts.length < 5) return null;
  const n  = pts.length;
  const sx = d3.sum(pts, d => d[xField]);
  const sy = d3.sum(pts, d => d.grade_final);
  const sxy= d3.sum(pts, d => d[xField]*d.grade_final);
  const sx2= d3.sum(pts, d => d[xField]**2);
  const slope     = (n*sxy - sx*sy) / (n*sx2 - sx**2);
  const intercept = (sy - slope*sx) / n;
  const r = pearsonR(pts.map(d=>d[xField]), pts.map(d=>d.grade_final));
  return { slope, intercept, r };
}

function pearsonR(xs, ys) {
  const n  = xs.length;
  const mx = d3.mean(xs), my = d3.mean(ys);
  const num = d3.sum(xs.map((x,i) => (x-mx)*(ys[i]-my)));
  const den = Math.sqrt(d3.sum(xs.map(x=>(x-mx)**2)) * d3.sum(ys.map(y=>(y-my)**2)));
  return den === 0 ? 0 : num/den;
}
