import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// K-Means (k=3) on [studytime, absences, goout, alcohol_weekend] — n=1044
// Computed from Python analysis (analysis/analyze.py)
const CLUSTERS = [
  {
    id:        1,
    name:      "Focused Achievers",
    subtitle:  "High study time, low risk",
    initial:   "F",
    color:     "var(--accent-green)",
    n:         207,
    grade:     12.52,
    studytime: 3.28,   // out of 4
    absences:  3.20,   // days (use max 15 for bar)
    goout:     2.82,   // out of 5
    alcohol:   1.67,   // out of 5
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
    at_risk:   0.294,
    insight:   "Highest dropout risk — 29.4% at-risk",
  },
];

const ATTRS = [
  { key: "studytime", label: "Study Time", max: 4,  unit: "/4"  },
  { key: "absences",  label: "Absences",   max: 12, unit: " d"  },
  { key: "goout",     label: "Goes Out",   max: 5,  unit: "/5"  },
  { key: "alcohol",   label: "Alcohol",    max: 5,  unit: "/5"  },
];

export function drawPersonas() {
  const container = d3.select("#container-personas");
  container.selectAll("*").interrupt().remove();

  const { width, height } = container.node().getBoundingClientRect();
  if (width < 40 || height < 40) return;

  const colW  = Math.floor(width / 3) - 4;
  const total = CLUSTERS.reduce((s, c) => s+c.n, 0);
  const tooltip = d3.select("#tooltip");

  const wrap = container.append("div")
    .style("display","flex").style("gap","6px").style("padding","8px 10px")
    .style("height","100%").style("box-sizing","border-box").style("align-items","stretch");

  CLUSTERS.forEach(cl => {
    const col = wrap.append("div")
      .style("flex","1").style("display","flex").style("flex-direction","column")
      .style("gap","6px").style("min-width","0");

    // ── Header badge ───────────────────────────────────────────
    const hdr = col.append("div")
      .style("display","flex").style("align-items","center").style("gap","8px")
      .style("padding","8px 10px")
      .style("background",`color-mix(in srgb, ${cl.color} 10%, transparent)`)
      .style("border-radius","8px")
      .style("border",`1px solid color-mix(in srgb, ${cl.color} 25%, transparent)`);

    hdr.append("div")
      .style("width","28px").style("height","28px")
      .style("border-radius","50%")
      .style("background", cl.color)
      .style("display","flex").style("align-items","center").style("justify-content","center")
      .style("font-family","var(--font-display)").style("font-size","14px")
      .style("color","white").style("flex-shrink","0")
      .text(cl.initial);

    const hdrText = hdr.append("div").style("min-width","0");
    hdrText.append("div")
      .style("font-family","var(--font-body)").style("font-size","11px").style("font-weight","700")
      .style("color","var(--text-primary)").style("line-height","1.2")
      .style("white-space","nowrap").style("overflow","hidden").style("text-overflow","ellipsis")
      .text(cl.name);
    hdrText.append("div")
      .style("font-family","var(--font-mono)").style("font-size","9px")
      .style("color","var(--text-muted)").style("margin-top","1px")
      .text(`n = ${cl.n.toLocaleString()} (${(cl.n/total*100).toFixed(0)}%)`);

    // ── Grade hero ─────────────────────────────────────────────
    const gradeBox = col.append("div")
      .style("text-align","center").style("padding","4px 0");
    gradeBox.append("div")
      .style("font-family","var(--font-display)").style("font-size","28px").style("font-weight","700")
      .style("color", cl.color).style("line-height","1")
      .text(cl.grade.toFixed(1));
    gradeBox.append("div")
      .style("font-family","var(--font-mono)").style("font-size","9px")
      .style("color","var(--text-muted)").style("letter-spacing","0.05em")
      .text("AVG FINAL GRADE / 20");

    // ── Attribute bars ─────────────────────────────────────────
    const attrBox = col.append("div")
      .style("display","flex").style("flex-direction","column").style("gap","5px")
      .style("flex","1");

    ATTRS.forEach(attr => {
      const row = attrBox.append("div")
        .style("display","flex").style("flex-direction","column").style("gap","2px");
      const labelRow = row.append("div")
        .style("display","flex").style("justify-content","space-between")
        .style("align-items","baseline");
      labelRow.append("span")
        .style("font-family","var(--font-mono)").style("font-size","9px").style("font-weight","600")
        .style("color","var(--text-muted)").style("text-transform","uppercase")
        .text(attr.label);
      labelRow.append("span")
        .style("font-family","var(--font-mono)").style("font-size","10px").style("font-weight","700")
        .style("color", cl.color)
        .text(`${cl[attr.key].toFixed(1)}${attr.unit}`);
      const barBg = row.append("div")
        .style("height","5px").style("background","var(--surface-2)")
        .style("border-radius","3px").style("overflow","hidden");
      barBg.append("div")
        .style("height","100%")
        .style("width", `${(cl[attr.key]/attr.max*100).toFixed(1)}%`)
        .style("background", cl.color).style("opacity","0.8")
        .style("border-radius","3px")
        .style("transition","width 0.6s ease");
    });

    // ── Risk badge ─────────────────────────────────────────────
    const riskPct = (cl.at_risk * 100).toFixed(1);
    const riskColor = cl.at_risk < 0.15 ? "var(--accent-green)" : cl.at_risk < 0.25 ? "var(--accent-yellow)" : "var(--accent-red)";
    col.append("div")
      .style("display","flex").style("align-items","center").style("justify-content","space-between")
      .style("background",`color-mix(in srgb, ${riskColor} 10%, transparent)`)
      .style("border","1px solid").style("border-color",`color-mix(in srgb, ${riskColor} 20%, transparent)`)
      .style("border-radius","6px").style("padding","5px 8px")
      .on("mouseover", function(event) {
        tooltip.style("opacity",1).html(`
          <div class="tt-header" style="color:${cl.color}">${cl.name}</div>
          <div class="tt-grid">
            <span class="tt-label">At-risk rate</span><span class="tt-val">${riskPct}%</span>
            <span class="tt-label">N at-risk</span><span class="tt-val">${Math.round(cl.n*cl.at_risk)}</span>
          </div>
          <div style="margin-top:5px;font-size:10px;color:var(--text-muted)">${cl.insight}</div>
        `);
        tooltip.style("left",(event.clientX+14)+"px").style("top",(event.clientY-10)+"px");
      })
      .on("mousemove", event => tooltip.style("left",(event.clientX+14)+"px").style("top",(event.clientY-10)+"px"))
      .on("mouseout", () => tooltip.style("opacity",0))
      .call(el => {
        el.append("span")
          .style("font-family","var(--font-mono)").style("font-size","9px").style("font-weight","700")
          .style("color","var(--text-muted)").text("AT-RISK");
        el.append("span")
          .style("font-family","var(--font-mono)").style("font-size","11px").style("font-weight","700")
          .style("color", riskColor).text(`${riskPct}%`);
      });
  });
}
