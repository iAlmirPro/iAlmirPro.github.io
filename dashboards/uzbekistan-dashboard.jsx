const { useState, useEffect } = React;

// Uzbekistan flag: blue (#1EB4E5) top, white middle, green (#3DAA5C) bottom + red stripes, white crescent & 12 stars
const C = {
  uz:   '#1EB4E5', uzL: '#55ccf5',   // primary — Uzbek blue
  grn:  '#3DAA5C', grnL: '#5dc97c',  // secondary — Uzbek green
  blu:  '#2E86DE', bluL: '#5ba8ff',  // water / depth
  red:  '#E8192C', redL: '#ff3347',  // heat / record high
  bg:   '#000',   card: '#111',  border: '#1e1e1e',
  track:'#222',   txt:  '#fff',  sub:   '#999',  dim: '#444',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,400&family=Inter:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { overflow-x: hidden; }
  body { background: #000; }
  .dash { background:#000; color:#fff; font-family:'Inter',sans-serif; font-weight:300; line-height:1.6; padding: 0 22px 80px; max-width:1020px; margin:0 auto; }
  @keyframes up { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
  .kpi { animation: up .4s ease forwards; opacity:0; }
  .row.g-1 { --bs-gutter-x: 2px; --bs-gutter-y: 2px; margin-bottom: 2px; }
`;

const Icons = {
  mountain:   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M256 32L32 480h448L256 32zm0 77l163 291H93L256 109z"/></svg>,
  map:        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 576 512" fill="currentColor"><path d="M384 476.1L192 421.2V35.9L384 90.8v385.3zm32-1.2V88.4l127.1-42.4c5.7-1.9 11.9.3 15.3 5.3 1.7 2.5 2.6 5.5 2.6 8.5V440c0 6.1-3.9 11.5-9.7 13.4L416 474.9zM15.7 56.4L160 10.7V98.6l-128 43.4V69c0-6.1 3.9-11.5 9.7-13.4zM192 421.2L32 474.9V138.7l160-54.2v336.7z"/></svg>,
  water:      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 576 512" fill="currentColor"><path d="M269.5 69.9c11.1-7.9 25.9-7.9 37 0C329 85.4 356.5 96 384 96c26.9 0 55.4-10.1 80.4-25.1 16-9.7 36.4-8.1 50.7 4.2s18.2 31.6 11.2 48.6C520.1 140 516 159 516 178c0 49.7 20 87.5 38.2 106.9l.4.4c17 18 22.4 44.5 13.4 67.8S536.6 391 511.4 391H64c-25.2 0-47.6-15.3-56.6-38.5s-3.6-49.8 13.4-67.8l.4-.4C39 265.5 59 227.7 59 178c0-18.4-3.4-36.3-9.9-52.4-7-17-2.9-36.3 11.2-48.6S105 62.9 121 72.9C146 87.9 173.1 96 200 96c27.5 0 55-10.6 77.5-26.1z"/></svg>,
  cloudSun:   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 640 512" fill="currentColor"><path d="M294.2 1.2c5.1 2.1 8.7 6.7 9.6 12.1l18.4 107.5 107.5 18.4c5.4.9 10 4.5 12.1 9.6s1.5 10.9-1.6 15.4l-62.3 90.3 46.5 60.7c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L301.7 358l-19.9 107.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L167.7 414l-90.4 62.2c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L33.6 358 1.2 294.2c-2.1-5-1.5-10.7 1.6-15.2L65 218.7 2.8 128.4c-3.1-4.5-3.7-10.2-1.6-15.4s6.7-8.7 12.1-9.6L121.8 85 140.2 13c1-5.4 4.5-10 9.6-12.1S160.5-.6 165 2.5L256 64.9 347 2.5c4.5-3.1 10.1-3.6 15.2-1.3z"/></svg>,
  sun:        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1-192 0z"/></svg>,
  rain:       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M96 320c-53 0-96-43-96-96 0-42.5 27.6-78.6 65.9-91.2C64.7 126.1 64 119.1 64 112 64 50.1 114.1 0 176 0c43.1 0 80.5 24.3 99.8 60 14.7-17.1 36.5-28 60.2-28 44.2 0 80 35.8 80 80 0 5.5-.6 10.8-1.6 16 .5 0 1.1 0 1.6 0 53 0 96 43 96 96s-43 96-96 96H96zm-8 96c0-13.3 10.7-24 24-24s24 10.7 24 24v80c0 13.3-10.7 24-24 24s-24-10.7-24-24v-80zm120-24c13.3 0 24 10.7 24 24v80c0 13.3-10.7 24-24 24s-24-10.7-24-24v-80c0-13.3 10.7-24 24-24zm96 24c0-13.3 10.7-24 24-24s24 10.7 24 24v80c0 13.3-10.7 24-24 24s-24-10.7-24-24v-80zm120-24c13.3 0 24 10.7 24 24v80c0 13.3-10.7 24-24 24s-24-10.7-24-24v-80c0-13.3 10.7-24 24-24z"/></svg>,
  people:     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 640 512" fill="currentColor"><path d="M72 88a56 56 0 1 1 112 0A56 56 0 1 1 72 88zM64 245.7C54 256.9 48 271.8 48 288s6 31.1 16 42.3V245.7zm144.4-49.3C178.7 222.7 160 261.2 160 304c0 34.3 12 65.8 32 90.5V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V389.2C26.2 371.2 0 332.7 0 288c0-61.9 50.1-112 112-112c29.3 0 56 11.3 75.9 29.7zM320 32a64 64 0 1 1 0 128A64 64 0 1 1 320 32zM448 304c0 44.7-26.2 83.2-64 101.2V448c0 17.7-14.3 32-32 32H288c-17.7 0-32-14.3-32-32V405.2c-37.8-18-64-56.5-64-101.2c0-61.9 50.1-112 112-112h32c61.9 0 112 50.1 112 112z"/></svg>,
  chart:      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V400c0 44.2 35.8 80 80 80H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H80c-8.8 0-16-7.2-16-16V64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z"/></svg>,
  briefcase:  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M184 48H328c4.4 0 8 3.6 8 8V96H176V56c0-4.4 3.6-8 8-8zm-56 8V96H64C28.7 96 0 124.7 0 160v96H192 320 512V160c0-35.3-28.7-64-64-64H384V56c0-30.9-25.1-56-56-56H184c-30.9 0-56 25.1-56 56zM512 288H320v32c0 17.7-14.3 32-32 32H224c-17.7 0-32-14.3-32-32V288H0V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V288z"/></svg>,
  graduation: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 640 512" fill="currentColor"><path d="M320 32c-8.1 0-16.1 1.4-23.7 4.1L25 155.5c-12.1 4.7-20 16.1-20 29.1s7.9 24.4 20 29.1l272.3 119.3c7.6 2.7 15.6 4.1 23.7 4.1s16.1-1.4 23.7-4.1L571.4 241c16.6-6.3 16.6-29.7 0-36L349.7 36.1c-7.6-2.7-15.6-4.1-23.7-4.1zM128 254.7V358c0 20.5 13.7 38.5 33.2 44.2l112.1 32c10.5 3 21.5 4.5 32.7 4.5s22.2-1.5 32.7-4.5l112.1-32c19.5-5.7 33.2-23.7 33.2-44.2V254.7L346.7 308c-8.3 3-17.3 4.5-26.7 4.5s-18.4-1.5-26.7-4.5L128 254.7z"/></svg>,
  landmark:   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="currentColor"><path d="M240.1 4.2c9.8-5.6 21.9-5.6 31.8 0l208 120c9.2 5.3 14.1 15.6 12.2 26.1s-10.4 18.5-21 18.5h-24.9L448 464H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H64L66.7 168.8H41.7c-10.6 0-19.2-7.9-21-18.5s3-20.8 12.2-26.1l208-120z"/></svg>,
};

const SectionHeader = ({ icon, label }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28, paddingTop:24 }}>
    <span style={{ color:C.txt, fontSize:16, flexShrink:0 }}>{icon}</span>
    <span style={{ fontSize:13, letterSpacing:'0.18em', textTransform:'uppercase', color:C.txt, fontWeight:500 }}>{label}</span>
  </div>
);

const KpiCard = ({ label, value, sub, accent = C.uz, delay = 0 }) => {
  const valColor = accent === C.uz ? C.uzL : accent === C.grn ? C.grnL : accent === C.blu ? C.bluL : accent === C.red ? C.redL : C.txt;
  return (
    <div className="kpi" style={{
      background:C.card, border:`1px solid ${C.border}`, padding:'18px 15px 15px',
      position:'relative', overflow:'hidden', animationDelay:`${delay}s`, width:'100%', flex:1
    }}>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:accent }} />
      <div style={{ fontSize:10, letterSpacing:'0.11em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:18, lineHeight:1, marginBottom:4, color:valColor, wordBreak:'break-word' }}>{value}</div>
      <div style={{ fontSize:11, color:C.sub, lineHeight:1.4 }}>{sub}</div>
    </div>
  );
};

const Panel = ({ title, icon, children }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:'24px 20px', height:'100%' }}>
    <div style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.txt, marginBottom:16, paddingBottom:11, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ color:C.txt, flexShrink:0 }}>{icon}</span>{title}
    </div>
    {children}
  </div>
);

const BarRow = ({ label, value, pct, color = C.uz }) => (
  <div style={{ marginBottom:13 }}>
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', fontSize:12, color:C.sub, marginBottom:5, gap:4 }}>
      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{label}</span>
      <span style={{ color:C.txt, fontWeight:500, flexShrink:0, whiteSpace:'nowrap' }}>{value}</span>
    </div>
    <div style={{ height:6, background:C.track, borderRadius:3, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3 }} />
    </div>
  </div>
);

const Tbl = ({ rows }) => (
  <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
    <tbody>
      {rows.map(([l, v], i) => (
        <tr key={i} style={{ borderBottom: i < rows.length-1 ? `1px solid ${C.border}` : 'none' }}>
          <td style={{ padding:'9px 4px', fontSize:12.5, color:C.sub, width:'58%', overflowWrap:'break-word' }}>{l}</td>
          <td style={{ padding:'9px 4px', fontSize:14, color:C.txt, fontWeight:500, textAlign:'right', fontFamily:'Fraunces,serif', overflowWrap:'break-word' }}>{v}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const RegCard = ({ name, type, desc, stripe }) => (
  <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:'18px 14px', position:'relative', overflow:'hidden', height:'100%' }}>
    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:stripe }} />
    <div style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:15, color:C.txt, marginBottom:3 }}>{name}</div>
    <div style={{ fontSize:10, letterSpacing:'0.09em', textTransform:'uppercase', color:C.sub, marginBottom:9 }}>{type}</div>
    <div style={{ fontSize:12, color:'#888', lineHeight:1.6 }}>{desc}</div>
  </div>
);

const DlRow = ({ mo, label, pct, color = C.uz, dark = false }) => (
  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
    <span style={{ fontSize:10, letterSpacing:'0.05em', textTransform:'uppercase', color:C.sub, width:24, flexShrink:0 }}>{mo}</span>
    <div style={{ flex:1, height:18, background:C.track, borderRadius:3, overflow:'hidden', minWidth:0 }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3, display:'flex', alignItems:'center', paddingLeft:6 }}>
        <span style={{ fontSize:9, fontWeight:500, color: dark ? '#000' : '#fff', whiteSpace:'nowrap', overflow:'hidden' }}>{label}</span>
      </div>
    </div>
  </div>
);

/* ── Gradient Bar (temperature / rainfall / tourism timeline) ── */
const GradientBar = ({ title, values, colorStops, unit = '', height = 22, xLabels, fmt, invertPeak = false, absScale = false }) => {
  const defaultLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const labels = xLabels || defaultLabels;
  const n = values.length;
  const min = Math.min(...values), max = Math.max(...values);
  const absMax = Math.max(...values.map(Math.abs));
  const peakIdx = invertPeak ? values.indexOf(min) : values.indexOf(max);
  // absScale: color intensity based on distance from zero (most extreme = most saturated)
  const pct = v => absScale ? (Math.abs(v) / absMax) * 100 : ((v - min) / (max - min)) * 100;
  const gradient = values.map((v, i) => {
    const p = pct(v);
    return `${colorStops(p, v)} ${(i / (n - 1)) * 100}%`;
  }).join(', ');
  // peak = most extreme absolute value
  const peakIdx2 = absScale ? values.reduce((a,b,i,arr) => Math.abs(arr[i]) > Math.abs(arr[a]) ? i : a, 0) : peakIdx;
  const usePeakIdx = absScale ? peakIdx2 : peakIdx;
  const peakPct = (usePeakIdx / (n - 1)) * 100;
  const labelColor = C.sub;
  const peakColor = colorStops(100, absScale ? values[usePeakIdx] : (invertPeak ? min : max)).replace(/rgb\((\d+),(\d+),(\d+)\)/, (_, r, g, b) => `rgb(${Math.round(r*0.45)},${Math.round(g*0.45)},${Math.round(b*0.45)})`);
  return (
    <div style={{ marginTop:14 }}>
      {title && <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>{title}</div>}
      <div style={{ position:'relative', height, borderRadius:4, overflow:'hidden', background:`linear-gradient(to right, ${gradient})` }}>
        <div style={{ position:'absolute', top:'10%', bottom:'10%', left:`${peakPct}%`, width:1, background:peakColor, transform:'translateX(-50%)', borderRadius:1 }} />
      </div>
      <div style={{ display:'flex', marginTop:4 }}>
        {labels.map((l, i) => (
          <div key={l} style={{ textAlign:'center', flex:1 }}>
            <div style={{ fontSize:8, color: i===usePeakIdx ? '#fff' : labelColor, fontWeight: i===usePeakIdx ? 600 : 300, lineHeight:1 }}>{l}</div>
            <div style={{ fontSize:8, color: i===usePeakIdx ? '#fff' : labelColor, lineHeight:1.4 }}>{fmt ? fmt(values[i]) : `${values[i]}${unit}`}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Age Structure Bar (population pyramid as two stacked gradient bars) ── */
const AgeBar = ({ title, male, female, medianM, medianF }) => {
  const maleColor = '#2E86DE';
  const femaleColor = '#E8192C';
  const decadeLabels = [0,10,20,30,40,50,60,70,80];
  const maxVal = Math.max(...male, ...female);
  const barH = 26;
  const chunkColor = (v, hex) => {
    const alpha = (v / maxVal);
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgb(${Math.round(153+(r-153)*alpha)},${Math.round(153+(g-153)*alpha)},${Math.round(153+(b-153)*alpha)})`;
  };
  const medMPct = Math.min((medianM / 80) * 100, 100);
  const medFPct = Math.min((medianF / 80) * 100, 100);
  const darkM = '#0e6d8c';
  const darkF = '#a01020';
  const renderBar = (arr, color, radius) => (
    <div style={{ height:barH, borderRadius:radius, overflow:'hidden', display:'flex' }}>
      {arr.map((v, i) => (
        <div key={i} style={{
          flex:1, background:chunkColor(v, color),
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:7, color:'rgba(255,255,255,0.85)', fontWeight:600, lineHeight:1
        }}>
          {v.toFixed(1)}
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ marginTop:14 }}>
      {title && <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>{title}</div>}
      <div style={{ position:'relative' }}>
        {renderBar(male, maleColor, '4px 4px 0 0')}
        <div style={{ height:2, background:C.bg }} />
        {renderBar(female, femaleColor, '0 0 4px 4px')}
        <div style={{ position:'absolute', top:2, height:barH-4, left:`${medMPct}%`,
          width:1, background:darkM, transform:'translateX(-50%)', borderRadius:1, pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:barH+4, height:barH-4, left:`${medFPct}%`,
          width:1, background:darkF, transform:'translateX(-50%)', borderRadius:1, pointerEvents:'none' }} />
      </div>
      {/* X-axis decade labels */}
      <div style={{ position:'relative', height:18, marginTop:3 }}>
        {decadeLabels.filter(age => age !== 0 && age !== 80).map(age => (
          <div key={age} style={{ position:'absolute', left:`${(age/80)*100}%`, transform:'translateX(-50%)', textAlign:'center' }}>
            <div style={{ fontSize:8, color:C.sub, lineHeight:1 }}>{age}y</div>
          </div>
        ))}
      </div>
      {/* Legend — centered */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, marginTop:3, fontSize:9, color:C.sub, flexWrap:'wrap' }}>
        <span style={{ display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ display:'inline-block', width:10, height:4, background:maleColor, borderRadius:1 }} />
          Male (median <strong style={{ color:maleColor }}>{medianM} yrs<span style={{ color:C.sub, fontWeight:300 }}>)</span></strong>
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ display:'inline-block', width:10, height:4, background:femaleColor, borderRadius:1 }} />
          Female (median <strong style={{ color:femaleColor }}>{medianF} yrs<span style={{ color:C.sub, fontWeight:300 }}>)</span></strong>
        </span>
      </div>
    </div>
  );
};
const tempColor = p => {
  if (p < 25) return `rgb(${Math.round(40+p*0.8)},${Math.round(60+p*0.4)},${Math.round(180-p*0.8)})`;
  if (p < 50) { const t=(p-25)/25; return `rgb(${Math.round(60+t*130)},${Math.round(80+t*80)},${Math.round(160-t*100)})`; }
  if (p < 75) { const t=(p-50)/25; return `rgb(${Math.round(190+t*50)},${Math.round(160-t*80)},${Math.round(60-t*40)})`; }
  const t=(p-75)/25; return `rgb(${Math.round(240-t*30)},${Math.round(80-t*60)},${Math.round(20)})`;
};
const rainColor = p => `rgb(${Math.round(153-107*p/100)},${Math.round(153-19*p/100)},${Math.round(153+69*p/100)})`;

const Donut = ({ segments, label, sublabel, size = 160 }) => {
  const r = 54, cx = 80, cy = 80, stroke = 22;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const slices = segments.map(s => {
    const dash = (s.pct / 100) * circ;
    const gap  = circ - dash;
    const rot  = (offset / 100) * 360 - 90;
    offset += s.pct;
    return { ...s, dash, gap, rot };
  });
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
      <div style={{ position:'relative', flexShrink:0 }}>
        <svg width={size} height={size} viewBox="0 0 160 160">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.track} strokeWidth={stroke} />
          {slices.map((s, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth={stroke}
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={0}
              transform={`rotate(${s.rot} ${cx} ${cy})`}
            />
          ))}
        </svg>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none' }}>
          <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:22, lineHeight:1, color:C.txt }}>{label}</div>
          {sublabel && <div style={{ fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginTop:3 }}>{sublabel}</div>}
        </div>
      </div>
      <div style={{ flex:1, minWidth:120 }}>
        {segments.map((s, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:s.color, flexShrink:0 }} />
            <span style={{ fontSize:11, color:C.sub, flex:1, lineHeight:1.3 }}>{s.label}</span>
            <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:12, color:C.txt }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* Uzbekistan flag: blue / white / green horizontal stripes with red separators, crescent & 12 stars */
const Flag = () => (
  <div style={{ width:90, height:54, borderRadius:3, overflow:'hidden',
    boxShadow:`0 4px 24px rgba(30,180,229,.45)`, flexShrink:0, position:'relative' }}>
    <div style={{ height:'30%', background:C.uz, display:'flex', alignItems:'center', paddingLeft:5 }}>
      <svg width="24" height="10" viewBox="0 0 24 10" fill="none">
        <path d="M4 5 A3.5 3.5 0 0 1 11 5 A2.8 2.8 0 0 0 4 5Z" fill="#fff" />
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
          <circle key={i} cx={14 + (i % 4) * 3} cy={i < 4 ? 2 : i < 8 ? 5 : 8} r="0.7" fill="#fff" />
        ))}
      </svg>
    </div>
    <div style={{ height:'3%', background:'#c8102e' }} />
    <div style={{ height:'30%', background:'#fff' }} />
    <div style={{ height:'4%', background:'#c8102e' }} />
    <div style={{ height:'33%', background:C.grn }} />
  </div>
);

export default function Uzbekistan() {
  useEffect(() => {
    if (!document.getElementById('bs-cdn')) {
      const l = document.createElement('link');
      l.id='bs-cdn'; l.rel='stylesheet';
      l.href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
      document.head.appendChild(l);
    }
  }, []);

  return (
    <>
      <style>{css}</style>
      <div className="dash">

        {/* HERO */}
        <div style={{ padding:'20px 0 0', display:'grid', gridTemplateColumns:'1fr auto', alignItems:'end', gap:32, marginBottom:8 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:'0.28em', textTransform:'uppercase', color:C.uz, marginBottom:14 }}>Country Dashboard 2025</div>
            <h1 style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:'clamp(44px,9vw,96px)', lineHeight:0.9, letterSpacing:'-0.02em', marginBottom:16 }}>
              Uzbeki<em style={{ fontStyle:'italic', color:C.uz, fontWeight:400 }}>stan</em>
            </h1>
            <p style={{ fontSize:14, color:C.sub, maxWidth:480, lineHeight:1.7 }}>
              A comprehensive data snapshot — geography, climate, population, economy, employment, education and politics — sourced from Statistics Agency of Uzbekistan, World Bank, IMF, and UN agencies.
            </p>
          </div>
          <div style={{ alignSelf:'flex-start', marginTop:6 }}><Flag /></div>
        </div>

        {/* 1. GEOGRAPHY */}
        <SectionHeader icon={Icons.mountain} label="Geography & Landscape" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Total Area" value="447,400 km²" sub="Doubly landlocked; larger than Spain; 56th globally" accent={C.dim} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Highest Peak" value="4,643 m" sub="Khazret Sultan — Hissar Range; Tajik border" accent={C.uz} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Lowest Point" value="−12 m" sub="Sariqarnish Kuli depression (Aral Sea basin)" accent={C.blu} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Borders" value="5 countries" sub="Kazakhstan, Kyrgyzstan, Tajikistan, Afghanistan, Turkmenistan" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Fergana Valley" value="~22,000 km²" sub="Most densely populated region; 14M+ people in shared basin" accent={C.grn} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Kyzylkum Desert" value="~300,000 km²" sub="World's 11th largest desert; occupies central Uzbekistan" accent={C.dim} delay={0.30} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Aral Sea (Uzbek portion)" value="~6,000 km²" sub="Was 68,000 km²; 91% lost to irrigation diversion" accent={C.dim} delay={0.35} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Doubly landlocked" value="One of 2 globally" sub="Only Liechtenstein also doubly landlocked; logistic challenge" accent={C.dim} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Arable land" value="~10.1%" sub="Fergana & Zerafshan valleys; highly irrigated" accent={C.dim} delay={0.45} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Major Terrain Zones" icon={Icons.map}>
              <BarRow label="Desert & semi-desert (Kyzylkum)" value="~80%" pct={100} color={C.uz} />
              <BarRow label="Steppe (north & centre)" value="~10%" pct={13} color={C.grn} />
              <BarRow label="Mountains (east & south-east)" value="~8%" pct={10} color={C.blu} />
              <BarRow label="Fergana Valley (intensively farmed)" value="~5%" pct={6} color={C.dim} />
              <BarRow label="Irrigated agricultural land" value="~10.1%" pct={13} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>80% desert makes Uzbekistan appear barren, but the Fergana Valley — shared with Kyrgyzstan and Tajikistan — is among Central Asia's most productive agricultural zones. The Kyzylkum Desert contains significant gold deposits (Muruntau mine — world's largest open-pit gold mine) and natural gas reserves.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Water Bodies & Features" icon={Icons.water}>
              <Tbl rows={[
                ['Amu Darya (Oxus) — main river', '2,400 km; originates in Tajikistan'],
                ['Syr Darya — northern river', '2,212 km; both feed the dying Aral Sea'],
                ['Aral Sea (former)', 'Was 4th largest lake; now ~9% of original size'],
                ['Charvak Reservoir (near Tashkent)', '~35 km²; hydropower & recreation'],
                ['Fergana Valley irrigation canals', '>10,000 km of Soviet-era canals'],
                ['Muruntau gold mine (Kyzylkum)', "World's largest open-pit gold mine"],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The Aral Sea disaster — shared with Kazakhstan — is one of the world's worst ecological catastrophes. Soviet cotton irrigation drained both the Amu Darya and Syr Darya, shrinking the sea by 91%. The exposed seabed (Aralkum desert) now generates toxic salt dust storms affecting millions. Uzbekistan has taken global leadership in Aral Sea advocacy.</p>
            </Panel>
          </div>
        </div>
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-3 d-flex"><RegCard name="Tashkent Region" type="Capital · industrial hub" desc="Capital (3M+). Major Soviet industrial city. Modernising rapidly under Mirziyoyev. Central Asia's largest city." stripe={C.uz} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Samarkand & Zerafshan" type="Tourism · silk road" desc="UNESCO World Heritage city. Registan, Bibi-Khanym Mosque. Was capital of Tamerlane's empire. 2M visitors/yr." stripe={C.grn} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Fergana Valley (east)" type="Agriculture · dense" desc="Namangan, Fergana, Andijan cities. Cotton, silk, fruit. ~14M people in shared basin. Most contested region." stripe={C.uz} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Bukhara & Khorezm" type="Heritage · west" desc="Ancient oasis cities on Silk Road. Bukhara old city (UNESCO). Natural gas fields. Khiva walled city." stripe={C.grn} /></div>
        </div>

        {/* 2. CLIMATE */}
        <SectionHeader icon={Icons.cloudSun} label="Climate: Weather, Daylight & Rainfall" />
        <div className="row g-1 mb-4">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Annual Temp (Tashkent)" value="14.8°C" sub="Continental; hot dry summers, cold winters" accent={C.grn} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Record High" value="48°C" sub="Fergana Valley & southern deserts; extreme summer heat" accent={C.red} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Record Low" value="−38°C" sub="Tashkent 1969; northern Karakalpakstan extreme winters" accent={C.blu} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Annual Rainfall (Tashkent)" value="~370 mm" sub="Most falls Oct–Apr; hot dry summers; south as low as 80 mm" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Climate type" value="BSk / BWk" sub="Semi-arid steppe; hot desert in south; severe continental" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Tashkent summer avg" value="28°C" sub="Sunny 300 days/year; dust storms from Kyzylkum common" accent={C.dim} delay={0.30} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Winter Dec–Feb" value="−2–4°C avg" sub="Snow possible; Tashkent mild; Fergana colder; mountains −20°C" accent={C.blu} delay={0.35} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Samarkand annual avg" value="13.5°C" sub="Slightly cooler than Tashkent; more rainfall from Zerafshan" accent={C.dim} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Spring Mar–May" value="8–24°C" sub="Brief, pleasant; flowering steppes; snowmelt flood risk" accent={C.uz} delay={0.45} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Daylight Hours — Tashkent (41.3°N)" icon={Icons.sun}>
              {[
                { mo:'Jan', label:'9h 28m', pct:37, color:C.blu },
                { mo:'Feb', label:'10h 38m', pct:45, color:C.blu },
                { mo:'Mar', label:'12h 00m', pct:54 },
                { mo:'Apr', label:'13h 26m', pct:66 },
                { mo:'May', label:'14h 36m', pct:78 },
                { mo:'Jun', label:'15h 10m ★', pct:100, color:C.grn, dark:true },
                { mo:'Jul', label:'14h 50m', pct:96 },
                { mo:'Aug', label:'13h 40m', pct:82 },
                { mo:'Sep', label:'12h 10m', pct:64 },
                { mo:'Oct', label:'10h 42m', pct:51 },
                { mo:'Nov', label:'9h 34m', pct:38, color:C.blu },
                { mo:'Dec', label:'9h 04m ★', pct:33, color:C.blu },
              ].map(r => <DlRow key={r.mo} mo={r.mo} label={r.label} pct={r.pct} color={r.color || C.uz} dark={r.dark} />)}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                ★ Summer solstice <strong style={{ color:C.grnL }}>15h 10m</strong> · Winter solstice <strong style={{ color:C.bluL }}>9h 04m</strong> · 300 sunny days/year in Tashkent — excellent solar energy potential
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Tashkent's 300 sunny days and abundant flat desert land give Uzbekistan world-class solar energy potential. The government is developing 42 renewable projects totalling $9.5B — one of Central Asia's most ambitious clean energy programmes.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Rainfall by Region" icon={Icons.rain}>
              <p style={{ fontSize:11, color:C.sub, marginBottom:11, letterSpacing:'0.04em' }}>Annual precipitation by zone</p>
              <BarRow label="Fergana Valley mountain flanks" value="~600 mm" pct={100} color={C.uz} />
              <BarRow label="Tashkent & Zerafshan Valley" value="~370 mm" pct={62} color={C.grn} />
              <BarRow label="Samarkand & Bukhara" value="~270 mm" pct={45} color={C.blu} />
              <BarRow label="Kyzylkum Desert (centre)" value="~100–150 mm" pct={22} color={C.dim} />
              <BarRow label="Karakalpakstan (Aral basin)" value="~80 mm" pct={13} color={C.dim} />
              <div style={{ height:1, background:C.border, margin:'14px 0' }} />
              <p style={{ fontSize:11, color:C.sub, marginBottom:11, letterSpacing:'0.04em' }}>Tashkent seasonal pattern</p>
              <BarRow label="March–April (wettest)" value="50–60 mm" pct={100} color={C.uz} />
              <BarRow label="Jun–Sep (very dry)" value="3–8 mm" pct={10} color={C.grn} />
              <BarRow label="Jan–Feb (snow possible)" value="20–30 mm" pct={40} color={C.blu} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Almost zero rainfall in summer (3–8mm/month Jun–Sep) means agriculture is entirely dependent on irrigation from the Amu Darya and Syr Darya — the same rivers that once filled the Aral Sea. Water stress is Uzbekistan's most critical long-term environmental and economic challenge.</p>
              <GradientBar title="Monthly avg temperature — Tashkent (°C)" values={[-1,2,9,16,22,28,30,28,22,14,6,0]} colorStops={tempColor} unit="°" />
              <GradientBar title="Monthly rainfall — Tashkent (mm)" values={[28,30,40,45,25,8,4,3,5,20,25,30]} colorStops={rainColor} unit="mm" />
            </Panel>
          </div>
        </div>

        {/* 3. POPULATION */}
        <SectionHeader icon={Icons.people} label="Population & Demographics" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Population (2026 est.)" value="~37.7M" sub="Worldometer; largest in Central Asia; growing ~1.8%/year" accent={C.uz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Urban Population" value="~47.9%" sub="Urbanisation accelerating; Tashkent agglomeration 4M+" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Median Age" value="27 yrs" sub="Young population; ~29% under 15; large working-age cohort" accent={C.grn} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Population Density" value="89 /km²" sub="High relative to regional peers; Fergana Valley ~900/km²" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Life Expectancy" value="~75 yrs" sub="Women ~77 · Men ~73; improving steadily" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Fertility Rate" value="~2.8" sub="Declining from 3.8 in 2000; still above replacement" accent={C.blu} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Population Growth" icon={Icons.chart}>
              <BarRow label="1991 (independence)" value="20.5M" pct={54} color={C.dim} />
              <BarRow label="2000" value="24.6M" pct={65} color={C.dim} />
              <BarRow label="2010" value="29.1M" pct={77} color={C.blu} />
              <BarRow label="2020" value="34.9M" pct={93} color={C.grn} />
              <BarRow label="2026" value="~37.7M" pct={100} color={C.uz} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Uzbekistan's population nearly doubled since independence — from 20.5M to 37.7M (+84%). Unlike Kazakhstan, it did not suffer post-Soviet emigration collapse; natural growth remained high throughout. With 37.7M people, Uzbekistan accounts for ~50% of Central Asia's total population.</p>
              <AgeBar
                title="Population age structure — male ▲ / female ▼ (% of total)"
                male={[5.5,5.2,4.95,4.75,4.5,4.25,4.0,3.6,3.15,2.75,2.4,2.1,1.75,1.3,0.95,1.4]}
                female={[5.2,4.95,4.7,4.55,4.35,4.15,3.95,3.55,3.1,2.75,2.4,2.1,1.75,1.4,1.1,1.8]}
                medianM={27.9}
                medianF={29.5}
              />
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Largest Cities (2025 est.)" icon={Icons.landmark}>
              <BarRow label="Tashkent (capital)" value="3,000,000+" pct={100} color={C.uz} />
              <BarRow label="Namangan (Fergana Valley)" value="~700,000" pct={23} color={C.grn} />
              <BarRow label="Samarkand (ancient capital)" value="~600,000" pct={20} color={C.blu} />
              <BarRow label="Andijan (Fergana Valley)" value="~560,000" pct={19} color={C.dim} />
              <BarRow label="Bukhara (Silk Road oasis)" value="~340,000" pct={11} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Tashkent at 3M+ is Central Asia's largest city — but notably, the Fergana Valley cities (Namangan, Andijan, Fergana city) together hold more people than Tashkent. The Valley's extreme density (~900/km²) creates significant pressure on water, land, and employment — making it Central Asia's most politically sensitive zone.</p>
            </Panel>
          </div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Ethnic Composition (2021)" icon={Icons.people}>
              <Donut
                label="37.7M"
                sublabel="population"
                segments={[
                  { label:'Uzbek',          value:'83.8%', pct:83.8, color:C.uz  },
                  { label:'Tajik',          value:'4.8%',  pct:4.8,  color:C.grn },
                  { label:'Kazakh',         value:'2.5%',  pct:2.5,  color:C.blu },
                  { label:'Russian',        value:'2.3%',  pct:2.3,  color:'#888'},
                  { label:'Other (Kyrgyz, Tatar, Korean, etc.)', value:'6.6%', pct:6.6, color:C.dim },
                ]}
              />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The Tajik share (4.8%) is likely significantly underreported — Samarkand and Bukhara have historically large Tajik-speaking populations. Many Tajik-speakers registered as Uzbek during Soviet-era censuses. This is a cultural and political sensitivity in Uzbek-Tajik relations.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Religion & Language" icon={Icons.landmark}>
              <Tbl rows={[
                ['Islam (predominantly Sunni Hanafi)', '~88%'],
                ['Eastern Orthodox Christian', '~9%'],
                ['Other / atheist', '~3%'],
                ['State language', 'Uzbek (Latin script since 1993)'],
                ['Widely spoken', 'Russian (cities, older generations)'],
                ['Recognised minority', 'Tajik, Kazakh, Kyrgyz, Russian'],
                ['UNESCO heritage cities', 'Samarkand, Bukhara, Khiva, Shakhrisabz'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Uzbekistan's Hanafi Sunni Islam is generally moderate — a secular tradition reinforced under Karimov (1991–2016). Mirziyoyev has cautiously opened religious expression while maintaining state control. The Uzbek Latin script transition (from Cyrillic) is ongoing — most adults still use Cyrillic while youth learn Latin.</p>
            </Panel>
          </div>
        </div>

        {/* 4. ECONOMY */}
        <SectionHeader icon={Icons.chart} label="Economy & Finance" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP Nominal (2025)" value="~$133B" sub="IMF/President Mirziyoyev address; record high; 58th globally" accent={C.uz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP per Capita (2025)" value="~$3,500" sub="Lower-middle income; targeting upper-middle by 2030" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP Growth (2025)" value="7.7%" sub="World Bank confirmed; record; exports, consumption & FDI led" accent={C.grn} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP PPP (2026 est.)" value="~$552B" sub="PPP per capita ~$14,179 — reflects large informal economy" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Inflation CPI (2025)" value="~7.3%" sub="Cooling from 12%+ in 2022; Central Bank target 5% by 2028" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Currency" value="UZS (Sum)" sub="~12,800 UZS = $1 (2025 avg); free float since 2017" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="GDP by Sector & Major Exports" icon={Icons.chart}>
              <Donut
                label="$133B"
                sublabel="GDP 2025"
                segments={[
                  { label:'Services (trade, finance, tourism)', value:'~49%', pct:49, color:C.uz  },
                  { label:'Industry (mining, manufacturing)',   value:'~34%', pct:34, color:C.grn },
                  { label:'Agriculture (cotton, wheat, fruit)', value:'~17%', pct:17, color:C.blu },
                ]}
              />
              <div style={{ height:1, background:C.border, margin:'16px 0' }} />
              <BarRow label="Gold (Muruntau — world #1 open-pit)" value="~35% of exports" pct={100} color={C.uz} />
              <BarRow label="Natural gas & energy products" value="~15%" pct={43} color={C.grn} />
              <BarRow label="Copper, zinc, uranium" value="~10%" pct={29} color={C.blu} />
              <BarRow label="Cotton fibre & textiles" value="~8%" pct={23} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Muruntau gold mine (Kyzylkum Desert) is the world's largest open-pit gold mine — producing ~70 tonnes/year. Gold at 35% of exports makes Uzbekistan highly exposed to gold price swings. The 7.7% GDP growth in 2025 is driven by a rare combination: natural resources, manufacturing, services, and FDI all expanding simultaneously.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Economic Indicators" icon={Icons.briefcase}>
              <Tbl rows={[
                ['Remittances (% of GDP, 2025)', '~13.9B (~10% of GDP); from Russia mainly'],
                ['Gold production (Muruntau)', '~70 tonnes/year — world\'s largest mine'],
                ['Foreign reserves (2025)', '>$55B — record; strong macro buffer'],
                ['FDI inflow (2025)', '~$39.7B — record; manufacturing-led'],
                ['Poverty rate ($3.65/day, 2025)', '~5.1% — dramatic improvement from ~27% in 2016'],
                ['Gini coefficient', '~33.0 — moderate'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The poverty reduction since Mirziyoyev's reforms began in 2016 is extraordinary — from ~27% to 5.1% in under a decade. FDI at $39.7B in 2025 is the highest in Central Asia by far. Gold reserves of $55B+ provide unprecedented macro stability for a lower-middle income country. The "Uzbekistan 2030" strategy aims to reach $220–230B GDP — now likely achievable by 2027–28.</p>
            </Panel>
          </div>
        </div>

        {/* 5. EMPLOYMENT */}
        <SectionHeader icon={Icons.briefcase} label="Employment & Wages" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Monthly Wage (2025)" value="~$450" sub="~5.7M UZS; rising rapidly; tripled since 2016 in USD terms" accent={C.grn} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Labour Force" value="~21.4M" sub="~55% of population; 53.2% employment rate (2020)" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Unemployment (2024)" value="~6.3%" sub="Official; youth unemployment ~15%; significant underemployment" accent={C.uz} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Informal employment" value="~40%+" sub="Cotton agriculture, bazaar, construction; improving with formalisation push" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Min. Wage (2025)" value="~1,050,000 UZS" sub="~$82/month; raised multiple times since 2016" accent={C.blu} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Labour migration abroad" value="~2M workers" sub="Mostly to Russia; remittances ~$13.9B (2025)" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Wages by Sector (monthly UZS, est. 2024)" icon={Icons.chart}>
              <BarRow label="Mining & extraction (gold, gas)" value="~12,000,000" pct={100} color={C.uz} />
              <BarRow label="Financial & IT services" value="~9,000,000" pct={75} color={C.grn} />
              <BarRow label="Public administration" value="~5,500,000" pct={46} color={C.blu} />
              <BarRow label="National average" value="~5,700,000" pct={48} color={C.dim} />
              <BarRow label="Education & health" value="~4,200,000" pct={35} color={C.dim} />
              <BarRow label="Agriculture (cotton, wheat)" value="~2,800,000" pct={23} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Wages have tripled in USD terms since 2016 — one of the fastest wage growth rates globally. The 4.3× gap between mining (~$940/month) and agriculture (~$220/month) explains rural-urban migration pressure. With 37.7M people and a young population, job creation is the government's most pressing economic challenge.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Employment by Sector" icon={Icons.briefcase}>
              <Donut
                label="21.4M"
                sublabel="labour force"
                segments={[
                  { label:'Agriculture',               value:'~26%', pct:26, color:C.uz  },
                  { label:'Trade & services',          value:'~35%', pct:35, color:C.grn },
                  { label:'Industry & manufacturing',  value:'~13%', pct:13, color:C.blu },
                  { label:'Construction',              value:'~11%', pct:11, color:C.dim },
                  { label:'Transport & logistics',     value:'~8%',  pct:8,  color:'#555'},
                  { label:'Other',                     value:'~7%',  pct:7,  color:C.dim },
                ]}
              />
              <div style={{ height:1, background:C.border, margin:'16px 0' }} />
              <Tbl rows={[
                ['Migrant workers abroad (est.)', '~2,000,000'],
                ['Remittances (2025)', '~$13.9B (~10% of GDP)'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Agriculture at 26% is declining as manufacturing expands — a healthy structural shift. The government's "1 million programmers" AI initiative and free economic zones are creating new digital employment. 2M migrant workers abroad represent 9% of the labour force — significant but far less dependent than Tajikistan (45%).</p>
            </Panel>
          </div>
        </div>

        {/* 6. EDUCATION */}
        <SectionHeader icon={Icons.graduation} label="Education & Human Development" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Literacy Rate" value="99.9%" sub="Near-universal; Soviet legacy maintained and strengthened" accent={C.uz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="HDI (2022)" value="0.757" sub="High Human Development — rank 106th globally (UNDP)" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Years Schooling" value="~12.0 yrs" sub="Improving; free 12-year education system" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Expected Schooling" value="~14.5 yrs" sub="New branch campuses of foreign universities" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Education Spending" value="~5% GDP" sub="Rising; international branch universities flagship reform" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Foreign university branches" value="~20+" sub="Inha, Webster, Turin, MSU branches; unprecedented for region" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Education Metrics" icon={Icons.graduation}>
              <BarRow label="Primary enrolment rate" value="~99%" pct={99} color={C.uz} />
              <BarRow label="Secondary completion rate" value="~94%" pct={94} color={C.grn} />
              <BarRow label="Tertiary enrolment" value="~33%" pct={33} color={C.blu} />
              <BarRow label="PISA scores vs OECD avg" value="below average" pct={42} color={C.dim} />
              <BarRow label="1 Million Programmers initiative" value="2025 target" pct={60} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Tertiary enrolment at 33% has roughly doubled since 2016 — Karimov-era universities were heavily restricted. The 20+ international branch campuses (including Inha University Korea, Webster University USA, Turin Polytechnic) is the most ambitious higher education reform in post-Soviet Central Asia. The "1 million programmers" AI initiative targets a digital workforce.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Education Facts" icon={Icons.landmark}>
              <Tbl rows={[
                ['Script system', 'Latin (official since 1993); Cyrillic still widely used'],
                ['Instruction languages', 'Uzbek (primary); Russian medium schools available'],
                ['Branch university campuses', '20+: Inha (Korea), Turin Poly, Webster (US)'],
                ['New Uzbekistan University', 'Est. 2022; English-medium; Mirziyoyev flagship'],
                ['Presidential schools (elite)', '14 across the country; competitive entry'],
                ['International Math Olympiad medals', 'Strong track record; top-ranked in Asia'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>International branch campuses are Uzbekistan's most distinctive education reform — no other lower-middle-income country has attracted this many prestigious foreign institutions. New Uzbekistan University (2022) is modelled on Western research universities and taught entirely in English — a signal of the country's ambition to compete globally for talent and investment.</p>
            </Panel>
          </div>
        </div>

        {/* 7. POLITICAL LANDSCAPE */}
        <SectionHeader icon={Icons.landmark} label="Political Landscape" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="System" value="Presidential" sub="Authoritarian but reforming; Mirziyoyev's opening far exceeds Karimov" accent={C.uz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="President" value="Sh. Mirziyoyev" sub="In power since 2016; re-elected 2023 after constitutional reform" accent={C.grn} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Parliament (Oliy Majlis)" value="150 seats" sub="Lower house; 5 parties all loyal to government" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Next Election" value="2030" sub="7-year term from 2023; constitutional reform reset term count" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ruling Party" value="Liberal Democratic" sub="UzLiDeP; largest party; Mirziyoyev's vehicle" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Independence" value="Sep 1, 1991" sub="From Soviet Union; national holiday — Independence Day" accent={C.blu} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="2023 Presidential Election" icon={Icons.landmark}>
              <BarRow label="Shavkat Mirziyoyev (UzLiDeP)" value="87.1%" pct={100} color={C.uz} />
              <BarRow label="Other candidates (4 total)" value="12.9% combined" pct={13} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Voter turnout ~80% (official). Constitutional reform of 2023 reset term count — allowing Mirziyoyev to serve until 2037. Four other candidates participated but were widely seen as cosmetic opposition. Press freedom rank 140/180 (RSF 2024) — better than Tajikistan but limited genuine media freedom. However, Karimov-era political prisoners have been released, internet is uncensored, and civil society has opened markedly.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Political Timeline" icon={Icons.chart}>
              {[
                { yr:'1991', tx:'Independence declared Sep 1. Islam Karimov becomes first president, ruling until his death in 2016.' },
                { yr:'2005', tx:'Andijan massacre: security forces kill 200–1,500 protesters (est. varies). Uzbekistan expelled from US base.' },
                { yr:'2016', tx:'Karimov dies. Shavkat Mirziyoyev, PM, becomes president. Immediate opening of economy and society begins.' },
                { yr:'2017', tx:'Currency liberalised (free float). Borders opened with neighbours. Political prisoners released. Tourism opened.' },
                { yr:'2022', tx:'Record FDI, growth, and poverty reduction. Karakalpakstan unrest: protests over autonomy killed 18; suppressed.' },
                { yr:'2023', tx:'Constitutional reform; Mirziyoyev re-elected with 87%; "Uzbekistan 2030" strategy launched; WTO accession push.' },
              ].map(({ yr, tx }) => (
                <div key={yr} style={{ paddingLeft:16, borderLeft:`1px solid ${C.uz}`, marginBottom:14 }}>
                  <div style={{ fontSize:10, letterSpacing:'0.11em', color:C.grn, textTransform:'uppercase', marginBottom:2 }}>{yr}</div>
                  <div style={{ fontSize:12.5, color:'#888', lineHeight:1.6 }}>{tx}</div>
                </div>
              ))}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The contrast between Karimov (1991–2016) and Mirziyoyev is one of the most dramatic policy reversals in post-Soviet history. Karimov presided over one of the world's most repressive regimes (boiling dissidents alive was reported); Mirziyoyev has opened the economy, released political prisoners, and welcomed foreign investment — though the state remains authoritarian.</p>
            </Panel>
          </div>
        </div>

        {/* 8. TOURISM */}
        <SectionHeader icon={Icons.briefcase} label="Tourism" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="International Visitors (2024)" value="~7.5M" sub="Tourism Committee UZ; fastest-growing in region; up from 2.7M in 2018" accent={C.uz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Tourism Revenue (2024)" value="~$3.5B" sub="~3% of GDP; target $5B by 2026" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Top draw" value="Samarkand" sub="Registan, Bibi-Khanym; UNESCO World Heritage; ~2M visits" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Visa-free countries" value="~90+" sub="Massive expansion since 2018; including EU, USA, China, Japan" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="UNESCO World Heritage sites" value="4 sites" sub="Samarkand, Bukhara, Shakhrisabz, Itchan Kala (Khiva)" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="2030 visitor target" value="15M" sub="National tourism strategy; hotel investment boom underway" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Top Visitor Origins (2024 est.)" icon={Icons.people}>
              {[
                { flag:'🇰🇿', country:'Kazakhstan',  val:'cross-border; largest neighbour market', pct:'~28%' },
                { flag:'🇷🇺', country:'Russia',      val:'business & cultural tourism',           pct:'~18%' },
                { flag:'🇨🇳', country:'China',       val:'Silk Road heritage; fastest growing',   pct:'~12%' },
                { flag:'🇩🇪', country:'Germany',     val:'heritage & adventure travel',           pct:'~6%'  },
                { flag:'🇺🇸', country:'USA',         val:'high-spend; Silk Road explorer',        pct:'~5%'  },
                { flag:'🇬🇧', country:'UK & EU',     val:'Registan, Bukhara; art history tours',  pct:'~8%'  },
              ].map(({ flag, country, val, pct }) => (
                <div key={country} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0' }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{flag}</span>
                  <span style={{ fontSize:12.5, color:C.txt, flexShrink:0 }}>{country}</span>
                  <span style={{ fontSize:11, color:C.sub, flex:1 }}>{val}</span>
                  <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.txt, flexShrink:0 }}>{pct}</span>
                </div>
              ))}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Tourism has been Uzbekistan's most dramatic reform success story — visitors grew from 2.7M (2018) to 7.5M (2024) — a near-3× increase in 6 years. The Silk Road trio of Samarkand, Bukhara, and Khiva is a world-class heritage destination finally opened to the world. Chinese tourism is the key growth market.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Tourism Highlights" icon={Icons.landmark}>
              <Tbl rows={[
                ['Registan (Samarkand)', 'World\'s most magnificent Islamic ensemble'],
                ['Itchan Kala, Khiva (UNESCO)', 'Living walled city; medieval Islamic city'],
                ['Bukhara old city (UNESCO)', '140 listed monuments; Kalon Minaret'],
                ['Shah-i-Zinda necropolis (Samarkand)', 'Avenue of mausoleums; stunning tilework'],
                ['Aydarkul Lake (Kyzylkum)', 'Desert lake; yurt camping; flamingos'],
                ['Fergana Valley crafts (silk, ceramics)', 'Ikat silk weaving; UNESCO heritage'],
                ['Aral Sea tours (Moynaq)', 'Ship graveyard; environmental tourism'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Uzbekistan has arguably the richest concentration of Islamic architectural heritage anywhere in the world — Samarkand's Registan rivals the Taj Mahal in grandeur. The Aral Sea ship graveyard at Moynaq has become a haunting but significant eco-tourism site — a monument to the world's worst man-made ecological disaster. With 4 UNESCO sites and 90+ visa-free countries, the runway for growth is enormous.</p>
              <GradientBar title="Tourism intensity by month (relative)" values={[15,20,45,85,100,80,65,70,90,85,30,15]} colorStops={p => `rgb(${Math.round(153+79*p/100)},${Math.round(153-128*p/100)},${Math.round(153-109*p/100)})`} unit="%" />
            </Panel>
          </div>
        </div>

        {/* 9. VITAL STATISTICS */}
        <SectionHeader icon={Icons.people} label="Vital Statistics" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Births (2025 est.)" value="~680,000" sub="Birth rate ~18 per 1,000; declining but still high" accent={C.uz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Natural Increase" value="~500,000" sub="Large absolute growth from young population base" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ages 0–14" value="~29%" sub="Large but declining youth cohort; fertility falling" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ages 65+" value="~5.5%" sub="Ageing slowly; pension costs manageable for now" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Deaths (2025 est.)" value="~180,000" sub="Death rate ~4.8 per 1,000 — low; young population" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Infant Mortality" value="~15 / 1,000" sub="Improving; down from 38/1,000 in 2000; still above EU" accent={C.blu} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Causes of Death (est.)" icon={Icons.chart}>
              <BarRow label="Circulatory diseases"      value="~55%" pct={100} color={C.uz}  />
              <BarRow label="Cancer (neoplasms)"         value="~11%" pct={20}  color={C.grn} />
              <BarRow label="Respiratory diseases"       value="~8%"  pct={15}  color={C.blu} />
              <BarRow label="External causes (accidents)" value="~6%" pct={11}  color={C.dim} />
              <BarRow label="Digestive diseases"         value="~5%"  pct={9}   color={C.dim} />
              <BarRow label="Infectious diseases"        value="~4%"  pct={7}   color={C.dim} />
              <BarRow label="Other"                      value="~11%" pct={20}  color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Circulatory disease at ~55% is above the global average (32%), driven by high hypertension prevalence, high-salt diets, and historically limited preventive care. Infant mortality falling from 38 to ~15/1,000 since 2000 is one of Uzbekistan's most significant health achievements — better than Tajikistan (32) but still above Kazakhstan (8).</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Marriage & Vital Trends" icon={Icons.landmark}>
              <Tbl rows={[
                ['Marriage rate (per 1,000)', '~8.5'],
                ['Divorce rate (per 1,000)', '~1.5'],
                ['Avg age at first marriage (women)', '~23 yrs'],
                ['Avg age at first marriage (men)', '~25 yrs'],
                ['Maternal mortality ratio (2023 est.)', '~29 per 100,000'],
                ['Child stunting rate', '~8.5% — declining; above world avg'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Maternal mortality at ~29/100,000 is improving but still 2× Kazakhstan. Uzbekistan was the first Central Asian country to formally abolish forced labour in cotton harvesting (2021) — a significant human rights milestone, addressing a practice that affected millions of students and public workers annually.</p>
            </Panel>
          </div>
        </div>

        {/* 10. ECONOMIC DEPTH */}
        <SectionHeader icon={Icons.chart} label="Economic Depth & Fiscal Position" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Foreign Reserves (2025)" value=">$55B" sub="Record; includes gold; ~5 months import cover; strong buffer" accent={C.uz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Govt Debt / GDP (2025)" value="~28%" sub="World Bank; manageable; mostly concessional IFI lending" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="FDI Inflow (2025)" value="~$39.7B" sub="Record; Central Asia leader; manufacturing & energy dominate" accent={C.grn} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Exports (2025)" value="~$33.8B" sub="+23% YoY; gold, gas, copper, uranium, textiles, food" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Imports (2025)" value="~$47.4B" sub="Machinery, equipment, chemicals; trade deficit funded by FDI" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Current Account (2025)" value="~−3.3% GDP" sub="World Bank; narrowing; investment-driven import surge" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Top Export Destinations (2024)" icon={Icons.briefcase}>
              {[
                { flag:'🇨🇭', country:'Switzerland',  val:'gold refining corridor (Muruntau)', pct:'~27%' },
                { flag:'🇬🇧', country:'UK',           val:'gold & commodities',               pct:'~16%' },
                { flag:'🇷🇺', country:'Russia',       val:'manufactured goods & food',        pct:'~13%' },
                { flag:'🇨🇳', country:'China',        val:'raw materials; Belt & Road',       pct:'~9%'  },
                { flag:'🇰🇿', country:'Kazakhstan',   val:'transit & bilateral trade',        pct:'~6%'  },
                { flag:'🇦🇫', country:'Afghanistan',  val:'electricity & goods exports',      pct:'~4%'  },
              ].map(({ flag, country, val, pct }) => (
                <div key={country} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0' }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{flag}</span>
                  <span style={{ fontSize:12.5, color:C.txt, flexShrink:0 }}>{country}</span>
                  <span style={{ fontSize:11, color:C.sub, flex:1 }}>{val}</span>
                  <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.txt, flexShrink:0 }}>{pct}</span>
                </div>
              ))}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Switzerland (27%) and UK (16%) together account for 43% of exports — almost entirely because gold is refined in Switzerland and traded in London. This concentration means Uzbekistan's export figures are highly sensitive to gold prices. Afghanistan at 4% is notable — Uzbekistan exports electricity and consumer goods, giving it economic leverage over a fragile neighbour.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Fiscal Indicators" icon={Icons.chart}>
              <Tbl rows={[
                ['Govt debt / GDP (2025)', '~28% — moderate; IFI concessional majority'],
                ['Foreign reserves', '>$55B — record; gold-heavy'],
                ['GDP growth target 2030', '$220–230B nominal GDP'],
                ['Investment / GDP ratio (2025)', '~31.9% — very high; construction boom'],
                ['WTO accession target', '2026 (in negotiation)'],
                ['Free economic zones (FEZs)', '~20 FEZs; 500+ resident companies'],
                ['GDP growth Jan–Sep 2025 (official)', '+7.7% — record pace'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Investment at 31.9% of GDP is exceptionally high — it is the engine of Uzbekistan's growth story. This is being funded by FDI ($39.7B), multilateral lending (IDB, ADB, World Bank), and the sovereign wealth fund. WTO accession would be the most significant trade reform since independence — opening markets and requiring legal modernisation.</p>
              <GradientBar title="Trade balance 2015–2024 ($B)" values={[-4.5, -4.8, -5.2, -7.0, -8.1, -8.1, -11.5, -13.7, -15.2, -13.6]} xLabels={['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']} colorStops={(p, v) => v >= 0 ? `rgb(${Math.round(153-118*p/100)},${Math.round(153+6*p/100)},${Math.round(153-89*p/100)})` : `rgb(${Math.round(153+79*p/100)},${Math.round(153-128*p/100)},${Math.round(153-109*p/100)})`} fmt={v => v > 0 ? `+${v}B` : `${v}B`} absScale={true} />
            </Panel>
          </div>
        </div>

        {/* 11. ENERGY */}
        <SectionHeader icon={Icons.mountain} label="Energy & Resources" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Electricity Generation" value="~75 TWh/yr" sub="Coal & gas dominant; massive renewable transition underway" accent={C.uz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Natural gas reserves" value="~1.1 trillion m³" sub="Large domestic reserves; production declining; priority domestic use" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gold production (Muruntau)" value="~70 tonnes/yr" sub="World's largest open-pit mine; Kyzylkum Desert" accent={C.grn} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Renewable investment (2025)" value="$9.5B — 42 projects" sub="Solar, wind, hydro; Forum 'Powering the Future' Dec 2025" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Solar potential" value="World-class" sub="300+ sunny days; flat desert terrain; ideal for utility-scale solar" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Nuclear power (planned)" value="2.4 GW" sub="Rosatom contract signed; site near Tuzkan Lake; 2030+ target" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Electricity Generation Mix (2024 est.)" icon={Icons.chart}>
              <Donut
                label="~75 TWh"
                sublabel="generated 2024"
                segments={[
                  { label:'Natural gas (dominant)',    value:'~80%', pct:80, color:C.uz  },
                  { label:'Hydro (rivers & reservoirs)', value:'~11%', pct:11, color:C.blu },
                  { label:'Coal',                      value:'~5%',  pct:5,  color:'#666'},
                  { label:'Solar & wind (growing)',    value:'~4%',  pct:4,  color:C.grn },
                ]}
              />
              <p style={{ fontSize:11, color:C.sub, marginTop:12, lineHeight:1.6 }}>80% gas-fired is relatively clean compared to Kazakhstan's coal-heavy grid. However, natural gas production is declining (~7%/year) — making the $9.5B renewable push urgent. Uzbekistan has signed deals for 20GW of solar and wind by 2030. The Rosatom nuclear plant would provide baseload power independence.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Energy & Resources Facts" icon={Icons.landmark}>
              <Tbl rows={[
                ['Natural gas production', '~49 billion m³/year (declining)'],
                ['Oil production', '~55,000 bbl/day (minor)'],
                ['Uranium production (2024)', '~3,500 tonnes/year — world top-10'],
                ['Copper (Almalyk mine)', 'Major producer; expanding capacity'],
                ['Coal reserves', 'Modest; ~3.3 billion tonnes'],
                ['Muruntau gold mine annual output', '~70 tonnes — world\'s largest open-pit'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Uzbekistan is a critical minerals powerhouse: gold, uranium, copper, zinc, natural gas. Muruntau's 70-tonne annual output makes it the single most economically important asset in Central Asia. Uranium production, while smaller than Kazakhstan's, positions Uzbekistan well in the nuclear energy renaissance. Declining gas production makes the renewable transition existentially important.</p>
            </Panel>
          </div>
        </div>

        {/* 12. INFRASTRUCTURE */}
        <SectionHeader icon={Icons.map} label="Infrastructure & Digital Connectivity" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Internet Penetration" value="~76%" sub="ITU 2023; rapidly expanding; mobile-first" accent={C.grn} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Mobile Subscribers" value="~37M" sub="~100% penetration; Ucell, Beeline, Uzmobile major operators" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Road Network" value="~186,000 km" sub="~40,000 km paved; major expansion underway" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Railway Network" value="~4,643 km" sub="Electrified; high-speed Afrosiyob (Tashkent–Samarkand–Bukhara)" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="High-speed rail" value="Afrosiyob" sub="250 km/h; Tashkent to Bukhara in 2.5h; Spanish Talgo technology" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="5G Status" value="Piloting" sub="Tashkent & Samarkand pilots 2024–2025; national rollout planned" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Key Infrastructure Projects" icon={Icons.map}>
              <Tbl rows={[
                ['China–Kyrgyzstan–Uzbekistan Railway', 'Under construction; China-UZ connectivity'],
                ['Trans-Afghan Railway (planned)', 'Would reach Indian Ocean via Afghanistan-Iran'],
                ['Tashkent Metro expansion', 'New lines; reaching outer districts'],
                ['Navoi Free Economic Zone (logistics)', 'Central Asia\'s largest FEZ; manufacturing hub'],
                ['Rogun Dam electricity import (TJ)', 'CASA-1000 will supply Uzbekistan too'],
                ['Digital Uzbekistan 2030 programme', 'E-government, AI, broadband, fintech'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The China-Kyrgyzstan-Uzbekistan Railway is the most transformative infrastructure project in Central Asia — it will create a direct rail link from China to Uzbekistan that bypasses Russia entirely. Combined with the Trans-Afghan Railway potential, Uzbekistan could become the genuine hub of a new Silk Road corridor linking East Asia to the Indian Ocean.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Digital Indicators" icon={Icons.chart}>
              <BarRow label="Internet penetration" value="~76%" pct={76} color={C.uz} />
              <BarRow label="Mobile penetration" value="~100%" pct={100} color={C.grn} />
              <BarRow label="E-government service uptake" value="~65%" pct={65} color={C.blu} />
              <BarRow label="Social media penetration" value="~60%" pct={60} color={C.dim} />
              <BarRow label="Fixed broadband" value="~20%" pct={20} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Uzbekistan's internet is uncensored — a dramatic change from the Karimov era. 76% penetration is growing fast and social media (Instagram, Telegram) are widely used. The "1 million programmers" initiative and Uzbekistan's growing IT park exports (~$500M in IT services) suggest a digital economy is genuinely taking root.</p>
            </Panel>
          </div>
        </div>

        {/* 13. HEALTH */}
        <SectionHeader icon={Icons.people} label="Health System" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Health Spending (% GDP)" value="~6.3%" sub="WHO 2022; public share growing; universal health system reform underway" accent={C.grn} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Out-of-pocket spending" value="~35%" sub="Share of total; high but improving; state insurance expanding" accent={C.uz} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Infant mortality (2025 est.)" value="~15 / 1,000" sub="Improving; down from 38/1,000 in 2000; still above EU" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="TB incidence (2023)" value="~40 / 100K" sub="High but declining; drug-resistant TB concern in prisons" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Life expectancy" value="~75 yrs" sub="One of highest in region; improving under Mirziyoyev reforms" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Doctors per 1,000" value="~2.4" sub="Below Soviet peak; brain drain concern; salary increases helping" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Health System Facts" icon={Icons.people}>
              <Tbl rows={[
                ['Compulsory health insurance', 'In development; phased introduction 2025+'],
                ['Hospital beds per 1,000', '~4.5 — reasonable stock; quality issue'],
                ['Forced labour in cotton (abolished)', '2021 — ILO confirmed; major reform'],
                ['Child nutrition — stunting', '~8.5% (under-5); improving'],
                ['Karakalpakstan health outcomes', 'Worst in country; Aral Sea dust health crisis'],
                ['Tashkent air quality', 'PM2.5 ~20 µg/m³ annual; urban pollution growing'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Karakalpakstan (Aral Sea region) has the worst health outcomes in Uzbekistan — the toxic salt dust from the exposed Aralkum Desert causes severe respiratory disease, cancer, and maternal health crises. This is a direct consequence of the Aral Sea disaster. Abolishing forced cotton labour in 2021 removed a major human rights stain and improved rural health outcomes.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Disease & Health Burden" icon={Icons.chart}>
              <BarRow label="Hypertension prevalence" value="~32%" pct={100} color={C.uz} />
              <BarRow label="TB incidence per 100K (2023)" value="~40" pct={71} color={C.grn} />
              <BarRow label="OOP health spending share" value="~35%" pct={55} color={C.blu} />
              <BarRow label="Tashkent PM2.5 (WHO guideline=5)" value="~20 µg/m³" pct={57} color={C.dim} />
              <BarRow label="Aral Sea toxic dust affected pop." value="~2M in Karakalpakstan" pct={45} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>TB at 40/100K is high but improving — Uzbekistan has run one of the most effective TB control programmes in the region. The Aral Sea dust crisis affecting ~2M Karakalpak people is a chronic, unfixable public health disaster — the sea cannot be restored and the exposed seabed will blow dust for generations.</p>
            </Panel>
          </div>
        </div>

        {/* 14. SOCIAL */}
        <SectionHeader icon={Icons.people} label="Social Indicators & Inequality" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Poverty rate ($3.65/day, 2025)" value="~5.1%" sub="Statistics Agency; down from ~27% in 2016 — Mirziyoyev-era reform" accent={C.uz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gini Coefficient" value="~33.0" sub="Moderate inequality; rising inequality a risk as economy grows" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Rural-urban income gap" value="~1.6×" sub="Urban incomes ~60% higher; rural employment main challenge" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gender Inequality Index" value="0.240 (rank 68)" sub="UNDP 2022; better than Tajikistan; improving rapidly" accent={C.grn} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Women in parliament" value="~32%" sub="2024 election result; well above regional average" accent={C.blu} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Mahalla system" value="~10,000 units" sub="Traditional community governance; welfare delivery at local level" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Access & Basic Services" icon={Icons.chart}>
              <BarRow label="Access to clean water (urban)" value="~97%" pct={97} color={C.uz} />
              <BarRow label="Access to clean water (rural)" value="~80%" pct={80} color={C.grn} />
              <BarRow label="Access to sanitation (urban)" value="~95%" pct={95} color={C.dim} />
              <BarRow label="Access to sanitation (rural)" value="~68%" pct={68} color={C.dim} />
              <BarRow label="Electricity access (national)" value="~100%" pct={100} color={C.blu} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Rural sanitation at 68% is a key infrastructure gap — directly linked to child health outcomes. The mahalla (neighbourhood committee) system is uniquely Uzbek — it provides community welfare, social pressure for compliance, and local governance simultaneously. It was used effectively during COVID-19 for food distribution and monitoring.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Social Cohesion & Gender" icon={Icons.people}>
              <Tbl rows={[
                ['Gini (Statistics Agency, 2021)', '~33.0 — moderate'],
                ['Women in parliament (2024)', '~32% — highest in Central Asia'],
                ['Gender Inequality Index (UNDP)', '0.240 — rank 68/191'],
                ['Women in labour force', '~47% — improving'],
                ['Forced cotton labour (abolished)', '2021; confirmed by ILO'],
                ['Karakalpak autonomy status', 'Autonomous Republic; 2022 unrest suppressed'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Women in parliament at 32% is the highest in Central Asia — reflecting genuine quota-backed progress. The abolition of forced cotton labour was a landmark; for decades, millions of teachers, students, and public servants were mobilised each autumn for cotton harvesting — a Soviet-era practice that persisted long after independence. Its end in 2021 was transformative for rural women in particular.</p>
            </Panel>
          </div>
        </div>

        {/* 15. ENVIRONMENT */}
        <SectionHeader icon={Icons.water} label="Environment & Climate" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="CO₂ per capita (2022)" value="~3.8 t" sub="Below world avg (~4.7t); gas-heavy grid cleaner than coal" accent={C.grn} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Aral Sea volume lost" value="~91%" sub="Was world's 4th largest lake; irreversible catastrophe" accent={C.uz} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Renewable energy target 2030" value="40% of mix" sub="Up from ~4% in 2024; $9.5B in 42 projects committed 2025" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Water stress level" value="Extreme" sub="Both Amu Darya & Syr Darya heavily over-abstracted for irrigation" accent={C.blu} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Aralkum toxic dust" value="~150,000 km² exposed" sub="Former seabed; salt & pesticide dust; 2M people affected" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Solar irradiation" value="~1,700–2,200 kWh/m²" sub="Among highest globally; ideal for large-scale solar farms" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Environmental Facts" icon={Icons.water}>
              <Tbl rows={[
                ['CO₂ per capita vs world avg', '~3.8t vs ~4.7t — moderate'],
                ['Aral Sea (Uzbek side)', 'South Aral Sea — completely desiccated'],
                ['UN Special Programme for Aral Sea', 'IFAS fund; Uzbekistan chairs rotating'],
                ['Saksaul tree planting', 'Largest afforestation in Central Asia'],
                ['NDC target (2030)', 'Reduce GHG intensity 35% vs 2010'],
                ['Protected areas', '~3.7% of territory — below average'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Uzbekistan has taken a global leadership role on the Aral Sea crisis — Mirziyoyev has addressed the UN General Assembly on it multiple times. The saksaul afforestation programme (planting drought-resistant trees on the exposed seabed) is the most practical mitigation measure available — it reduces dust emissions while creating a new ecosystem.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Water Stress & Pollution" icon={Icons.chart}>
              <BarRow label="Amu Darya water use vs flow" value="Over-abstracted" pct={95} color={C.uz} />
              <BarRow label="Irrigation efficiency (Soviet canals)" value="~40% (very poor)" pct={40} color={C.grn} />
              <BarRow label="Tashkent PM2.5 vs WHO (5 µg/m³)" value="~20 µg/m³ (4× over)" pct={57} color={C.blu} />
              <BarRow label="Aralkum dust events per year" value="~30 major events" pct={60} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Water is Uzbekistan's most existential environmental challenge. Soviet-era irrigation canals waste 60% of the water they carry — efficiency improvements could free enormous volumes without new supply. Climate change is reducing the glacial meltwater from Tajikistan and Kyrgyzstan that feeds the rivers, making the crisis worse each decade.</p>
            </Panel>
          </div>
        </div>

        {/* 16. BUSINESS */}
        <SectionHeader icon={Icons.briefcase} label="Business & Investment Climate" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Corporate tax rate" value="15%" sub="Standard rate (reduced from 20% in 2023); FEZ residents lower" accent={C.grn} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="FDI inflow (2025)" value="~$39.7B" sub="Record; Central Asia leader; manufacturing, energy, construction" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ease of Doing Business" value="~Rank 69/190" sub="World Bank 2019; massive improvement from rank 166 in 2012" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="VAT rate" value="12%" sub="Reduced from 20% in 2019; significant tax reform package" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Corruption Index (TI 2023)" value="33/100" sub="Rank 121/180; improving from 21/100 in 2016 under Karimov" accent={C.uz} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="WTO accession" value="Target 2026" sub="Observer since 1994; 30+ year process nearing completion" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Investment Climate Summary" icon={Icons.briefcase}>
              <Tbl rows={[
                ["Fitch credit rating", 'BB- / Stable (sub-investment grade but improving)'],
                ['CPI score (TI 2023)', '33/100 — rank 121/180; improving rapidly'],
                ['Free Economic Zones', '~20 FEZs; Navoi (aviation), Urgut, IT Parks'],
                ['IT Park Uzbekistan', '500+ companies; 0% income tax; growing exports'],
                ['Currency liberalisation (2017)', 'Free float ended black market; FDI unlocked'],
                ['WTO observer since', '1994 — accession now actively negotiated'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Uzbekistan's reform trajectory since 2016 is the most dramatic business climate improvement in post-Soviet history — Ease of Doing Business improved from rank 166 to 69 in 7 years. Currency liberalisation in 2017 was the single most impactful reform, immediately unlocking FDI. The remaining challenges are judiciary independence and anti-corruption enforcement.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Risks & Opportunities" icon={Icons.chart}>
              <BarRow label="Silk Road tourism opportunity" value="World-class" pct={95} color={C.uz} />
              <BarRow label="China-KG-UZ railway opportunity" value="Transformational" pct={90} color={C.grn} />
              <BarRow label="Renewable energy export potential" value="Very high" pct={85} color={C.dim} />
              <BarRow label="Russia geopolitical risk" value="Moderate (less exposed than KZ)" pct={50} color={C.blu} />
              <BarRow label="Water scarcity long-term risk" value="Critical" pct={90} color={C.dim} />
              <BarRow label="Reform reversal / governance risk" value="Moderate" pct={45} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Uzbekistan's opportunity set is exceptional: the largest population in Central Asia, world-class heritage tourism, critical minerals, and the new Silk Road pivot. Water scarcity is the overriding long-term risk — without fundamental irrigation reform and upstream glacier preservation, economic growth may hit a physical water ceiling by the 2040s.</p>
            </Panel>
          </div>
        </div>

        {/* 17. CRIME & SECURITY */}
        <SectionHeader icon={Icons.landmark} label="Crime & Security" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Global Peace Index (2024)" value="~Rank 81" sub="IEP; medium-high peace; improving under Mirziyoyev" accent={C.grn} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Afghanistan border" value="137 km" sub="Terrorism & drug trafficking risk; Uzbekistan maintains strong border" accent={C.uz} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Homicide rate (est.)" value="~2.5 / 100K" sub="Low; declining; state security apparatus effective" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Press Freedom (RSF 2024)" value="Rank 140/180" sub="Improving from 165/180 in 2016; still limited but opening" accent={C.uz} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Karakalpakstan unrest (2022)" value="18 killed" sub="Autonomy protests; suppressed; internet cut; some reforms followed" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Andijan massacre (2005)" value="Historical" sub="200–1,500 killed; Karimov-era; Uzbekistan expelled from US base" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Crime & Security Indicators" icon={Icons.landmark}>
              <Tbl rows={[
                ['Homicide rate (est.)', '~2.5 per 100,000 — low'],
                ['Global Peace Index 2024', '~Rank 81 / 163'],
                ['Afghanistan border security', 'Well-managed; military hardware investment'],
                ['Drug trafficking', 'Transit country for Afghan opiates; contained'],
                ['Political prisoners', 'Hundreds released (Karimov-era); new arrests fewer'],
                ['Fergana Valley ethnic tensions', 'Improved; borders open since 2017'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The opening of Uzbek-Kyrgyz and Uzbek-Tajik borders since 2017 has transformed security dynamics in the Fergana Valley — the region went from armed clashes over water and land to functional cross-border trade. Uzbekistan's management of the Afghan border (137km) is considered effective — the country has avoided significant spillover from Afghanistan's Taliban takeover.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Security Context" icon={Icons.chart}>
              <BarRow label="Corruption (CPI, 100=clean)" value="33/100" pct={33} color={C.uz} />
              <BarRow label="Press freedom (100=free, est.)" value="~28/100" pct={28} color={C.grn} />
              <BarRow label="Rule of law (WJP, 100=best)" value="~34/100" pct={34} color={C.blu} />
              <BarRow label="Political rights (FH, improving)" value="~20/100" pct={20} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Uzbekistan's security environment has improved dramatically since 2016 but remains authoritarian. CPI at 33/100 is better than Kazakhstan (39) was a decade ago — on the same improvement trajectory. Press freedom at rank 140 is poor but far better than Tajikistan (162) or Turkmenistan (178). The Mirziyoyev reform story is real but incomplete — the judiciary remains unfree and civil society tightly managed.</p>
            </Panel>
          </div>
        </div>

        <div style={{ padding:'8px 0 0', marginTop:8 }}>
          <p style={{ fontSize:10.5, color:'#555', lineHeight:1.7 }}>
            Sources: Statistics Agency of Uzbekistan · World Bank 2025 · IMF · UNDP HDR 2022 · Transparency International CPI 2023 · WHO · RSF Press Freedom 2024 · World Justice Project 2024 · Freedom House 2024 · ILO · Eurasian Star Country Report 2026 · Euronews · Data as of May 2026.
          </p>
        </div>

      </div>
    </>
  );
}
