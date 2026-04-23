import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Random Forest Classifier — trained on n=1044, test set n=209
// Features: grade_mid1, grade_mid2, absences, failures, studytime, mother_edu,
//           father_edu, goout, alcohol_weekend, romantic, internet, schoolsup, activities
// Target: at_risk (grade_final < 10)
// Computed from Python analysis (analysis/analyze.py)
const RF = {
  accuracy:  0.9139,
  precision: 0.7917,
  recall:    0.8261,
  f1:        0.8085,
  matrix: { tn: 153, fp: 10, fn: 8, tp: 38 },
  testN: 209,
};

export function drawRisk() {
  const container = d3.select("#container-risk");
  container.selectAll("*").interrupt().remove();

  const { width, height } = container.node().getBoundingClientRect();
  if (width < 40 || height < 40) return;

  const wrap = container.append("div")
    .style("display","flex").style("height","100%")
    .style("padding","8px 12px").style("gap","14px")
    .style("box-sizing","border-box");

  // ── Left: Confusion Matrix ────────────────────────────────────
  const left = wrap.append("div")
    .style("display","flex").style("flex-direction","column").style("gap","4px")
    .style("flex","1").style("min-width","0");

  // Headline
  left.append("div")
    .style("font-family","var(--font-mono)").style("font-size","9px").style("font-weight","700")
    .style("color","var(--text-muted)").style("text-transform","uppercase")
    .style("letter-spacing","0.06em").text("CONFUSION MATRIX · n=209 test");

  left.append("div")
    .style("font-family","var(--font-display)").style("font-size","13px")
    .style("color","var(--accent-green)").style("margin-bottom","4px")
    .text(`Catches ${(RF.recall*100).toFixed(1)}% of at-risk students`);

  // Column + Row header labels above/beside matrix
  const cmOuter = left.append("div")
    .style("display","flex").style("flex-direction","column").style("gap","3px").style("flex","1");

  // ── Axis title: "PREDICTED" spanning both column cells ────────
  const predRow = cmOuter.append("div")
    .style("display","flex").style("gap","3px");
  predRow.append("div").style("width","60px").style("flex-shrink","0"); // spacer
  predRow.append("div")
    .style("flex","1").style("text-align","center")
    .style("font-family","var(--font-body)").style("font-size","8px").style("font-weight","700")
    .style("color","var(--text-muted)").style("letter-spacing","0.08em").style("text-transform","uppercase")
    .text("← PREDICTED →");

  // Column headers (Pass / Risk)
  const colHdr = cmOuter.append("div")
    .style("display","grid").style("grid-template-columns","60px 1fr 1fr").style("gap","3px");
  // "ACTUAL ↓" sits in the corner cell
  colHdr.append("div")
    .style("display","flex").style("align-items","flex-end").style("justify-content","flex-end")
    .style("padding-right","4px").style("padding-bottom","2px")
    .style("font-family","var(--font-body)").style("font-size","8px").style("font-weight","700")
    .style("color","var(--text-muted)").style("letter-spacing","0.08em").style("text-transform","uppercase")
    .text("ACTUAL ↓");
  ["Pass", "Risk"].forEach(t => {
    colHdr.append("div")
      .style("font-family","var(--font-body)").style("font-size","8.5px").style("font-weight","700")
      .style("color","var(--text-muted)").style("text-align","center")
      .style("padding","2px 0").text(t);
  });

  // Matrix rows (row labels now just "Pass" / "Risk")
  [
    { rowLabel: "Pass", cells: [
        { val: RF.matrix.tn, label: "TRUE NEG",  color: "var(--accent-green)",  bg: "0.12", desc: "Correctly identified as passing" },
        { val: RF.matrix.fp, label: "FALSE POS", color: "var(--accent-yellow)", bg: "0.12", desc: "Flagged at-risk but actually passing — false alarm" },
    ]},
    { rowLabel: "Risk", cells: [
        { val: RF.matrix.fn, label: "MISSED ⚠",  color: "var(--accent-red)",   bg: "0.18", desc: "At-risk students the model MISSED — most critical error" },
        { val: RF.matrix.tp, label: "TRUE POS ✓", color: "var(--accent-green)", bg: "0.20", desc: "Correctly caught at-risk students — intervention can help" },
    ]},
  ].forEach(row => {
    const rowDiv = cmOuter.append("div")
      .style("display","grid").style("grid-template-columns","60px 1fr 1fr")
      .style("gap","3px").style("flex","1");
    rowDiv.append("div")
      .style("display","flex").style("align-items","center").style("justify-content","flex-end")
      .style("padding-right","4px")
      .style("font-family","var(--font-body)").style("font-size","8.5px").style("font-weight","700")
      .style("color","var(--text-muted)").style("white-space","nowrap")
      .text(row.rowLabel);
    row.cells.forEach(c => cmCell(rowDiv, c.val, c.label, c.color, c.bg, c.desc));
  });

  // ── Right: Metrics ────────────────────────────────────────────
  const right = wrap.append("div")
    .style("display","flex").style("flex-direction","column").style("gap","6px")
    .style("width","120px").style("flex-shrink","0");

  right.append("div")
    .style("font-family","var(--font-mono)").style("font-size","9px").style("font-weight","700")
    .style("color","var(--text-muted)").style("text-transform","uppercase")
    .style("letter-spacing","0.06em").text("MODEL METRICS");

  const metrics = [
    { label: "Accuracy",  val: RF.accuracy,  color: "var(--accent-green)" },
    { label: "Precision", val: RF.precision, color: "var(--accent-blue)"  },
    { label: "Recall",    val: RF.recall,    color: "var(--accent-blue)"  },
    { label: "F1 Score",  val: RF.f1,        color: "var(--accent-blue)"  },
  ];

  const tooltip = d3.select("#tooltip");

  const metricDesc = {
    Accuracy:  "Overall correct predictions across all students",
    Precision: "Of students flagged at-risk, how many truly are",
    Recall:    "Of all at-risk students, how many we caught — KEY metric",
    "F1 Score":"Harmonic mean of Precision and Recall",
  };

  metrics.forEach(m => {
    const row = right.append("div").style("display","flex").style("flex-direction","column").style("gap","2px")
      .style("cursor","default")
      .on("mouseover", function(event) {
        tooltip.style("opacity",1).html(`
          <div class="tt-header" style="color:${m.color}">${m.label}</div>
          <div class="tt-grid">
            <span class="tt-label">Score</span><span class="tt-val">${(m.val*100).toFixed(1)}%</span>
          </div>
          <div style="margin-top:5px;font-size:10px;color:var(--text-muted)">${metricDesc[m.label]}</div>
        `);
        tooltip.style("left",(event.clientX+14)+"px").style("top",(event.clientY-10)+"px");
      })
      .on("mousemove", event => tooltip.style("left",(event.clientX+14)+"px").style("top",(event.clientY-10)+"px"))
      .on("mouseout", () => tooltip.style("opacity",0));

    const labelRow = row.append("div")
      .style("display","flex").style("justify-content","space-between");
    labelRow.append("span")
      .style("font-family","var(--font-mono)").style("font-size","9px").style("color","var(--text-muted)").style("font-weight","600")
      .text(m.label.toUpperCase());
    labelRow.append("span")
      .style("font-family","var(--font-mono)").style("font-size","10px").style("font-weight","700")
      .style("color", m.color)
      .text(`${(m.val*100).toFixed(1)}%`);

    const barBg = row.append("div")
      .style("height","6px").style("background","var(--surface-2)")
      .style("border-radius","3px").style("overflow","hidden");
    barBg.append("div")
      .style("height","100%").style("width",`${(m.val*100).toFixed(1)}%`)
      .style("background", m.color).style("opacity","0.85")
      .style("border-radius","3px").style("transition","width 0.6s ease");
  });

  // Feature importance note
  right.append("div")
    .style("margin-top","auto")
    .style("font-family","var(--font-mono)").style("font-size","8.5px")
    .style("color","var(--text-muted)").style("line-height","1.4")
    .html("Top features:<br><b>G2 > G1 > Failures</b>");
}

function cmCell(parent, value, label, color, bgAlpha, desc) {
  const cell = parent.append("div")
    .style("display","flex").style("flex-direction","column").style("align-items","center")
    .style("justify-content","center").style("border-radius","8px")
    .style("background",`color-mix(in srgb, ${color} ${(parseFloat(bgAlpha)*100).toFixed(0)}%, transparent)`)
    .style("border",`1px solid color-mix(in srgb, ${color} 25%, transparent)`)
    .style("padding","4px").style("cursor","default");

  const tooltip = d3.select("#tooltip");
  cell.on("mouseover", function(event) {
    tooltip.style("opacity",1).html(`
      <div class="tt-header" style="color:${color}">${label}</div>
      <div class="tt-grid">
        <span class="tt-label">Count</span><span class="tt-val">${value} students</span>
        <span class="tt-label">Share</span><span class="tt-val">${(value/209*100).toFixed(1)}%</span>
      </div>
      <div style="margin-top:5px;font-size:10px;color:var(--text-muted)">${desc}</div>
    `);
    tooltip.style("left",(event.clientX+14)+"px").style("top",(event.clientY-10)+"px");
  })
  .on("mousemove", event => tooltip.style("left",(event.clientX+14)+"px").style("top",(event.clientY-10)+"px"))
  .on("mouseout", () => tooltip.style("opacity",0));

  cell.append("div")
    .style("font-family","var(--font-display)").style("font-size","22px").style("font-weight","400")
    .style("color", color).style("line-height","1")
    .text(value);

  cell.append("div")
    .style("font-family","var(--font-mono)").style("font-size","8px").style("font-weight","700")
    .style("color", color).style("opacity","0.85").style("text-align","center")
    .style("letter-spacing","0.02em")
    .text(label);
}
