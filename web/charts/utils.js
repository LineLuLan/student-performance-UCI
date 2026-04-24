export function positionTooltip(tooltip, event) {
  const el = tooltip.node();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const tw = el.offsetWidth  || 220;
  const th = el.offsetHeight || 160;
  // Horizontal: right of cursor; flip left when near right edge
  const x = event.clientX + 14 + tw + 8 > vw
    ? Math.max(8, event.clientX - tw - 14)
    : event.clientX + 14;
  // Vertical: ABOVE cursor by default (bottom-aligns tooltip to cursor)
  // Only flip below when near the top of the viewport
  const y = event.clientY - th - 10 < 8
    ? event.clientY + 20
    : event.clientY - th - 10;
  tooltip.style("left", x + "px").style("top", y + "px");
}
