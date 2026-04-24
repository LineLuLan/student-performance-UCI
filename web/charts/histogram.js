import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { positionTooltip } from "./utils.js";

const GRADE_LABELS = {
  grade_mid1:  "G1 (Period 1)",
  grade_mid2:  "G2 (Period 2)",
  grade_final: "G3 (Final)",
};

export function drawHistogram(data, gradeField = "grade_final") {
  const container = d3.select("#container-histogram");
  container.selectAll("*").interrupt().remove();
  if (!data || data.length === 0) return;

  const { width, height } = container.node().getBoundingClientRect();
  if (width < 40 || height < 40) return;

  const margin = { top: 18, right: 14, bottom: 36, left: 40 };
  const W = width  - margin.left - margin.right;
  const H = height - margin.top  - margin.bottom;

  const vals = data.map(d => d[gradeField]).filter(v => !isNaN(v));

  // Bins: 0-20, one per grade point
  const xScale = d3.scaleLinear().domain([0, 21]).range([0, W]);
  const binner  = d3.bin().value(d=>d).domain([0,20]).thresholds(d3.range(0,21));
  const bins    = binner(vals);
  const yMax    = d3.max(bins, d => d.length);
  const yScale  = d3.scaleLinear().domain([0, yMax * 1.12]).range([H, 0]);

  const svg = container.append("svg")
    .attr("width", width).attr("height", height)
    .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Grid
  svg.append("g").selectAll("line").data(yScale.ticks(4)).join("line")
    .attr("class","grid-line").attr("x1",0).attr("x2",W)
    .attr("y1",d=>yScale(d)).attr("y2",d=>yScale(d));

  const tooltip = d3.select("#tooltip");

  // Pass / fail coloring
  const barColor = d => d.x0 >= 10 ? "var(--accent-green)" : "var(--accent-red)";

  // Bars
  svg.selectAll(".hist-bar").data(bins).join("rect")
    .attr("class","hist-bar")
    .attr("x", d => xScale(d.x0) + 1)
    .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 2))
    .attr("y", d => yScale(d.length))
    .attr("height", d => H - yScale(d.length))
    .attr("fill", barColor)
    .attr("opacity", 0.7)
    .attr("rx", 2)
    .on("mouseover", function(event, d) {
      d3.select(this).attr("opacity",1);
      const pct = (d.length / vals.length * 100).toFixed(1);
      const passfail = d.x0 >= 10 ? "Passing" : "At Risk";
      tooltip.style("opacity",1).html(`
        <div class="tt-header" style="color:${d.x0>=10?"var(--accent-green)":"var(--accent-red)"}">
          Grade ${d.x0} · ${passfail}
        </div>
        <div class="tt-grid">
          <span class="tt-label">Students</span><span class="tt-val">${d.length}</span>
          <span class="tt-label">Share</span><span class="tt-val">${pct}%</span>
          <span class="tt-label">Field</span><span class="tt-val">${GRADE_LABELS[gradeField]}</span>
        </div>
      `);
    })
    .on("mousemove", event => {
      positionTooltip(tooltip, event);
    })
    .on("mouseout", function() {
      d3.select(this).attr("opacity",0.7);
      tooltip.style("opacity",0);
    });

  // KDE overlay
  const bandwidth = 1.2;
  const kdePoints = d3.range(0, 20.2, 0.2).map(x => ({ x, y: kernelDensity(vals, x, bandwidth) }));
  const kdeMax = d3.max(kdePoints, d=>d.y);
  const kdeYScale = d3.scaleLinear().domain([0, kdeMax]).range([H, yMax*1.12*0.05]);
  // Normalize KDE to fit histogram scale
  const kdePeakBin = d3.max(bins, d=>d.length);
  const kdeScale   = kdeMax > 0 ? kdePeakBin / kdeMax * 0.85 : 1;

  const kdeYScaleN = d3.scaleLinear().domain([0, kdeMax]).range([H, yScale(kdePeakBin*0.85)]);

  const kdeLineGen = d3.line().x(d=>xScale(d.x)).y(d=>kdeYScaleN(d.y)).curve(d3.curveBasis);
  svg.append("path")
    .datum(kdePoints)
    .attr("class","kde-line")
    .attr("d", kdeLineGen)
    .attr("stroke","var(--text-primary)").attr("opacity",0.5)
    .attr("stroke-dasharray","none");

  // Pass threshold line
  svg.append("line").attr("class","threshold-line")
    .attr("x1",xScale(10)).attr("x2",xScale(10))
    .attr("y1",0).attr("y2",H)
    .attr("stroke","var(--text-secondary)").attr("stroke-width",1.5).attr("opacity",0.6);
  svg.append("text")
    .attr("x",xScale(10)+3).attr("y",12)
    .style("font-family","var(--font-mono)").style("font-size","9px").style("font-weight","600")
    .style("fill","var(--text-secondary)").style("opacity","0.7")
    .text("PASS (≥10)");

  // G3=0 annotation (only for grade_final)
  if (gradeField === "grade_final") {
    const zeroCount = vals.filter(v=>v===0).length;
    if (zeroCount > 0) {
      svg.append("text")
        .attr("x",xScale(0)+2).attr("y",yScale(zeroCount)-6)
        .style("font-family","var(--font-mono)").style("font-size","9px")
        .style("fill","var(--accent-yellow)")
        .text(`${zeroCount} withdrew`);
    }
  }

  // Stats annotation — top-left so it never collides with the "PASS (≥10)" label
  const mu  = d3.mean(vals) || 0;
  const med = d3.median(vals) || 0;
  svg.append("text")
    .attr("x",4).attr("y",14)
    .attr("text-anchor","start")
    .style("font-family","var(--font-mono)").style("font-size","9px")
    .style("fill","var(--text-muted)")
    .text(`avg ${mu.toFixed(1)}  ·  med ${med.toFixed(0)}`);

  // Axes
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${H})`).call(
    d3.axisBottom(xScale).ticks(10).tickSizeOuter(0)
  );
  svg.append("g").attr("class","axis").call(
    d3.axisLeft(yScale).ticks(4).tickSizeOuter(0)
  );
  svg.append("text").attr("x",W/2).attr("y",H+32)
    .attr("text-anchor","middle")
    .style("font-family","var(--font-mono)").style("font-size","9px").style("font-weight","600")
    .style("fill","var(--text-muted)").text(`${GRADE_LABELS[gradeField].toUpperCase()} SCORE`);
}

function kernelDensity(data, x, bandwidth) {
  return d3.mean(data, v => epanechnikov((x - v) / bandwidth) / bandwidth);
}
function epanechnikov(u) {
  return Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0;
}
