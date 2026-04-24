export function positionTooltip(tooltip, event) {
  const el = tooltip.node();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tw = el.offsetWidth  || 220;
  const th = el.offsetHeight || 160;
  const pad = 8;
  // Horizontal: right of cursor; flip left when near right edge
  let x = event.clientX + 14 + tw + pad > vw
    ? event.clientX - tw - 14
    : event.clientX + 14;
  // Vertical: ABOVE cursor by default (bottom-aligns tooltip to cursor)
  // Only flip below when near the top of the viewport
  let y = event.clientY - th - 10 < pad
    ? event.clientY + 20
    : event.clientY - th - 10;
  // Final clamp so the tooltip can never overflow the viewport on any edge
  x = Math.max(pad, Math.min(x, vw - tw - pad));
  y = Math.max(pad, Math.min(y, vh - th - pad));
  tooltip.style("left", x + "px").style("top", y + "px");
}
