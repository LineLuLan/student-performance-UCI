import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { positionTooltip } from "./utils.js";

const GROUP_CONFIG = {
  sex:      { values: ["f","m"],      labels: ["Female","Male"],      colors: ["var(--accent-purple)","var(--accent-blue)"] },
  school:   { values: ["gp","ms"],    labels: ["Gabriel Pereira","MS Silveira"], colors: ["var(--accent-blue)","var(--accent-green)"] },
  subject:  { values: ["math","portuguese"], labels: ["Math","Portuguese"], colors: ["var(--accent-yellow)","var(--accent-blue)"] },
  internet: { values: [1,0],          labels: ["Has Internet","No Internet"], colors: ["var(--accent-green)","var(--accent-red)"] },
  higher:   { values: [1,0],          labels: ["Wants Higher Edu","No Goal"],  colors: ["var(--accent-blue)","var(--text-muted)"] },
};

const PERIODS = [
  { key: "grade_mid1",  label: "G1 (Period 1)" },
  { key: "grade_mid2",  label: "G2 (Period 2)" },
  { key: "grade_final", label: "G3 (Final)" },
];

export function drawProgression(data, groupBy = "sex") {
  const container = d3.select("#container-progression");
  container.selectAll("*").interrupt().remove();
  if (!data || data.length === 0) {
    container.append("div").style("padding","20px").style("color","var(--text-muted)").text("No data.");
    return;
  }

  const { width, height } = container.node().getBoundingClientRect();
  if (width < 40 || height < 40) return;

  const cfg = GROUP_CONFIG[groupBy] || GROUP_CONFIG.sex;
  const maxLabelLen = d3.max(cfg.labels, l => l.split(" ")[0].length) * 7 + 16;
  const margin = { top: 22, right: Math.max(60, maxLabelLen), bottom: 36, left: 38 };
  const W = width  - margin.left - margin.right;
  const H = height - margin.top  - margin.bottom;

  // ── Pre-compute stats for ALL groups first (needed for tight Y-domain) ──
  const groupStats = cfg.values.map((val, gi) => {
    const grp = data.filter(d => String(d[groupBy]) === String(val));
    if (grp.length === 0) return null;
    const stats = PERIODS.map(p => {
      const vals = grp.map(d => d[p.key]).filter(v => !isNaN(v));
      const mu = d3.mean(vals) || 0;
      const sd = d3.deviation(vals) || 0;
      return { p: p.key, mu, sd, lo: mu - sd, hi: mu + sd, n: vals.length };
    });
    return { val, gi, color: cfg.colors[gi], stats };
  }).filter(Boolean);

  // Y-domain: based on MEAN lines (not std bands) + fixed 1.5-grade buffer
  // This zooms the axis to where the lines actually are, making small differences visible
  let muLo = Infinity, muHi = -Infinity;
  groupStats.forEach(({ stats }) => stats.forEach(s => {
    muLo = Math.min(muLo, s.mu);
    muHi = Math.max(muHi, s.mu);
  }));
  const yMin = isFinite(muLo) ? Math.max(0,  Math.floor(muLo - 1.5)) : 0;
  const yMax = isFinite(muHi) ? Math.min(20, Math.ceil(muHi  + 1.5)) : 20;

  const xScale = d3.scalePoint().domain(PERIODS.map(p=>p.key)).range([0, W]).padding(0.4);
  const yScale = d3.scaleLinear().domain([yMin, yMax]).range([H, 0]);

  const svg = container.append("svg")
    .attr("width", width).attr("height", height)
    .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  svg.append("defs").append("clipPath").attr("id","prog-clip")
    .append("rect").attr("width",W).attr("height",H);

  // Grid lines — minimal, 3 reference lines max
  svg.append("g").selectAll("line").data(yScale.ticks(3)).join("line")
    .attr("class","grid-line").attr("x1",0).attr("x2",W)
    .attr("y1",d=>yScale(d)).attr("y2",d=>yScale(d));

  // Pass threshold — only if 10 is within domain
  if (yMin <= 10 && 10 <= yMax) {
    svg.append("line")
      .attr("x1",0).attr("x2",W).attr("y1",yScale(10)).attr("y2",yScale(10))
      .attr("stroke","var(--accent-red)").attr("stroke-dasharray","4,4")
      .attr("stroke-width",1).attr("opacity",0.4);
    svg.append("text")
      .attr("x", 4).attr("y", yScale(10) - 3)
      .style("font-family","var(--font-mono)").style("font-size","10px").style("font-weight","700")
      .style("fill","var(--accent-red)").style("opacity","0.85")
      .text("PASS ≥10");
  }

  // ── Spaghetti background — fewer lines, more subtle ─────────
  const sample = data.length > 120 ? d3.shuffle([...data]).slice(0,120) : data;
  const lineGen     = d3.line().x(d=>xScale(d.p)).y(d=>yScale(d.v)).defined(d=>!isNaN(d.v));
  const meanLineGen = d3.line().x(d=>xScale(d.p)).y(d=>yScale(d.mu));

  svg.append("g").attr("clip-path","url(#prog-clip)")
    .attr("pointer-events","none")
    .selectAll("path").data(sample).join("path")
    .attr("class","spaghetti-line")
    .attr("d", d => lineGen(PERIODS.map(p => ({ p: p.key, v: d[p.key] }))))
    .attr("stroke","var(--text-muted)").attr("stroke-width",0.6).attr("opacity",0.05);

  // ── Group mean lines & std bands ─────────────────────────────
  // Decorative layers (bands + mean lines) get pointer-events="none" as an
  // SVG attribute (not CSS style) so they never intercept hover events meant
  // for the mean dots underneath — previously the second group's translucent
  // std band would steal hover from the first group's dot when both sat close
  // together in the same period.
  const tooltip = d3.select("#tooltip");

  // Compute small horizontal offsets for dots that would otherwise overlap.
  // At each period, if two groups' means are within `overlapThreshold` grade
  // points (the visible dot diameter projected onto the y-axis), stagger their
  // dots ±4 px so both stay individually hoverable. The mean LINES and BANDS
  // are unaffected — only the dot positions are nudged.
  const dotXOffset = {}; // `${gIdx}_${periodIdx}` -> pixel offset
  const overlapThresholdPx = 14; // dot dia (12) + a couple of px of breathing room
  PERIODS.forEach((p, pi) => {
    const pts = groupStats
      .map((g, gi) => ({ gi, y: yScale(g.stats[pi].mu) }))
      .sort((a, b) => a.y - b.y);
    for (let k = 1; k < pts.length; k++) {
      if (Math.abs(pts[k].y - pts[k - 1].y) < overlapThresholdPx) {
        dotXOffset[`${pts[k - 1].gi}_${pi}`] = -4;
        dotXOffset[`${pts[k].gi}_${pi}`]     = +4;
      }
    }
  });

  groupStats.forEach(({ val, gi, color, stats }, gIdx) => {
    // Std dev band — higher opacity for readability
    const areaGen = d3.area()
      .x(d => xScale(d.p))
      .y0(d => yScale(Math.max(yMin, d.lo)))
      .y1(d => yScale(Math.min(yMax, d.hi)));
    svg.append("path")
      .datum(stats)
      .attr("class","std-band")
      .attr("d", areaGen)
      .attr("fill", color)
      .attr("pointer-events","none")
      .style("opacity", "0.15");

    // Mean line
    svg.append("path")
      .datum(stats)
      .attr("class","mean-line")
      .attr("d", meanLineGen(stats))
      .attr("stroke", color)
      .attr("stroke-width", 3)
      .attr("pointer-events","none");

    // Dots — no grade labels, just tooltip on hover
    stats.forEach((s, pi) => {
      const xOff = dotXOffset[`${gIdx}_${pi}`] || 0;
      svg.append("circle").attr("class","mean-dot")
        .attr("cx", xScale(s.p) + xOff).attr("cy", yScale(s.mu))
        .attr("r", 6).attr("fill", color).attr("stroke","var(--surface)").attr("stroke-width",2.5)
        .on("mouseover", function(event) {
          const trend = pi > 0 ? (s.mu - stats[pi-1].mu).toFixed(2) : null;
          tooltip.style("opacity",1).html(`
              <div class="tt-header" style="color:${color}">${cfg.labels[gi]} · ${PERIODS[pi].label}</div>
              <div class="tt-grid">
                <span class="tt-label">Mean grade</span><span class="tt-val">${s.mu.toFixed(2)}/20</span>
                <span class="tt-label">Std dev</span><span class="tt-val">±${s.sd.toFixed(2)}</span>
                <span class="tt-label">N students</span><span class="tt-val">${s.n}</span>
                ${trend!==null?`<span class="tt-label">Change</span><span class="tt-val" style="color:${+trend>=0?"var(--accent-green)":"var(--accent-red)"}">${+trend>=0?"+":""}${trend}</span>`:""}
              </div>
            `);
          positionTooltip(tooltip, event);
        })
        .on("mousemove", event => positionTooltip(tooltip, event))
        .on("mouseout", () => tooltip.style("opacity",0));
    });

    // End label in right margin — staggered if too close to a previous group's label
    const lastS = stats[2];
    const rawLy = yScale(lastS.mu);
    // Find the nearest already-rendered label y and push down if overlapping
    const usedLy = groupStats.slice(0, gIdx).map(g => yScale(g.stats[2].mu));
    let ly = rawLy + 4;
    usedLy.forEach(prev => {
      if (Math.abs(ly - (prev + 4)) < 13) ly = prev + 4 + 13;
    });
    svg.append("text")
      .attr("x", xScale(lastS.p) + 10).attr("y", ly)
      .style("font-family","var(--font-body)").style("font-size","10px").style("font-weight","600")
      .style("fill", color)
      .text(cfg.labels[gi].split(" ")[0]);
    // Connector from mean line to label
    svg.append("line")
      .attr("x1", xScale(lastS.p) + 6).attr("x2", xScale(lastS.p) + 9)
      .attr("y1", rawLy).attr("y2", rawLy)
      .attr("stroke", color).attr("stroke-width", 1.5).attr("opacity", 0.6);
  });

  // ── Axes ─────────────────────────────────────────────────────
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${H})`).call(
    d3.axisBottom(xScale).tickFormat(d => {
      const p = PERIODS.find(pp=>pp.key===d);
      return p ? p.label : d;
    }).tickSizeOuter(0)
  );
  svg.append("g").attr("class","axis").call(
    d3.axisLeft(yScale).ticks(5).tickSizeOuter(0)
  );

  svg.append("text").attr("transform","rotate(-90)")
    .attr("x",-H/2).attr("y",-28).attr("text-anchor","middle")
    .style("font-family","var(--font-mono)").style("font-size","11px").style("font-weight","700")
    .style("fill","var(--text-muted)").text("AVERAGE GRADE");

  // Overall trend annotation
  const g1mean = d3.mean(data, d => d.grade_mid1) || 0;
  const g3mean = d3.mean(data, d => d.grade_final) || 0;
  const diff   = g3mean - g1mean;
  svg.append("text")
    .attr("x", W - 4).attr("y", 11)
    .attr("text-anchor","end")
    .style("font-family","var(--font-mono)").style("font-size","11px").style("font-weight","700")
    .style("fill", diff >= 0 ? "var(--accent-green)" : "var(--accent-red)")
    .text(`G1→G3: ${diff>=0?"+":""}${diff.toFixed(2)}`);

  // No-significant-gap annotation: when ≥2 groups overlap closely at G3,
  // tell the viewer this is real data (flat lines aren't a bug).
  if (groupStats.length >= 2) {
    const g3means = groupStats.map(g => g.stats[2].mu);
    const gap = Math.max(...g3means) - Math.min(...g3means);
    if (gap < 0.3) {
      svg.append("text")
        .attr("x", W - 4).attr("y", 25)
        .attr("text-anchor","end")
        .style("font-family","var(--font-body)").style("font-size","10px").style("font-style","italic")
        .style("fill","var(--text-muted)")
        .text("≈ no significant gap");
    }
  }
}

