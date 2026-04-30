import React from 'react';

const polarToCartesian = (cx, cy, r, deg) => {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const arcPath = (cx, cy, rOuter, rInner, startDeg, endDeg) => {
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  const oStart = polarToCartesian(cx, cy, rOuter, endDeg);
  const oEnd = polarToCartesian(cx, cy, rOuter, startDeg);
  const iStart = polarToCartesian(cx, cy, rInner, startDeg);
  const iEnd = polarToCartesian(cx, cy, rInner, endDeg);
  return [
    `M ${oStart.x} ${oStart.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${oEnd.x} ${oEnd.y}`,
    `L ${iStart.x} ${iStart.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${iEnd.x} ${iEnd.y}`,
    'Z',
  ].join(' ');
};

const DonutChart = ({
  segments = [],
  size = 220,
  thickness = 36,
  gap = 2,
  centerLabel,
  centerValue,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 4;
  const rInner = rOuter - thickness;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  let cursor = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((seg) => {
      const sweep = (seg.value / total) * 360;
      const start = cursor + gap / 2;
      const end = cursor + sweep - gap / 2;
      cursor += sweep;
      return { ...seg, start, end };
    });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={(rOuter + rInner) / 2} stroke="#f1f5f9" strokeWidth={thickness} fill="none" />
        {arcs.map((seg) => (
          <path key={seg.name} d={arcPath(cx, cy, rOuter, rInner, seg.start, seg.end)} fill={seg.color} />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          {centerLabel && <p className="text-xs text-slate-500">{centerLabel}</p>}
          {centerValue !== undefined && (
            <p className="text-2xl font-bold text-slate-900">{centerValue}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
