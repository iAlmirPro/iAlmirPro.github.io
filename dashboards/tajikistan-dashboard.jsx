const { useState, useEffect } = React;

// Tajikistan flag: green (#239F40) top, white middle, red (#C8102E) bottom + gold crown/stars
const C = {
  tj:   '#239F40', tjL: '#3dc95a',   // primary — Tajik green
  red:  '#C8102E', redL: '#f03050',  // secondary — Tajik red
  gld:  '#D4AF37', gldL: '#f0cc55',  // gold — crown & stars accent
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

const KpiCard = ({ label, value, sub, accent = C.tj, delay = 0 }) => {
  const valColor = accent === C.tj ? C.tjL : accent === C.red ? C.redL : accent === C.gld ? C.gldL : C.txt;
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

const BarRow = ({ label, value, pct, color = C.tj }) => (
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

const DlRow = ({ mo, label, pct, color = C.tj, dark = false }) => (
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
        <div style={{ position:'absolute', top:'10%', bottom:'10%', left:`${peakPct}%`, width:2, background:peakColor, transform:'translateX(-50%)', borderRadius:2 }} />
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
  // 16 cohorts span 0-80+; each cohort = 5 years; total span = 80 years
  // cohort midpoints for gradient: 2,7,12,...,77.5
  const maxVal = Math.max(...male, ...female);
  const pctM = v => (v / maxVal) * 100;
  const makeGradient = (arr, color) => {
    return arr.map((v, i) => {
      const alpha = pctM(v) / 100;
      const r = parseInt(color.slice(1,3),16);
      const g = parseInt(color.slice(3,5),16);
      const b = parseInt(color.slice(5,7),16);
      const vr = Math.round(r + (255-r)*(1-alpha));
      const vg = Math.round(g + (255-g)*(1-alpha));
      const vb = Math.round(b + (255-b)*(1-alpha));
      return `rgb(${vr},${vg},${vb}) ${(i/15)*100}%`;
    }).join(', ');
  };
  // median line position: median age / 80 * 100%
  const medMPct = Math.min((medianM / 80) * 100, 100);
  const medFPct = Math.min((medianF / 80) * 100, 100);
  const darkM = '#145a24';
  const darkF = '#a01020';
  return (
    <div style={{ marginTop:14 }}>
      {title && <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>{title}</div>}
      <div style={{ position:'relative' }}>
        {/* Male bar */}
        <div style={{ height:18, borderRadius:'4px 4px 0 0', overflow:'hidden',
          background:`linear-gradient(to right, ${makeGradient(male, maleColor)})` }} />
        {/* 2px gap */}
        <div style={{ height:2, background:C.bg }} />
        {/* Female bar */}
        <div style={{ height:18, borderRadius:'0 0 4px 4px', overflow:'hidden',
          background:`linear-gradient(to right, ${makeGradient(female, femaleColor)})` }} />
        {/* Male median line — on male bar only, 80% height centered (top:2px of 18px bar) */}
        <div style={{ position:'absolute', top:2, height:14, left:`${medMPct}%`,
          width:2, background:darkM, transform:'translateX(-50%)', borderRadius:2, pointerEvents:'none' }} />
        {/* Female median line — on female bar only, 80% height centered (top: 18+2gap+2px) */}
        <div style={{ position:'absolute', top:22, height:14, left:`${medFPct}%`,
          width:2, background:darkF, transform:'translateX(-50%)', borderRadius:2, pointerEvents:'none' }} />
      </div>
      {/* X-axis decade labels */}
      <div style={{ position:'relative', height:18, marginTop:3 }}>
        {decadeLabels.filter(age => age !== 0 && age !== 80).map(age => (
          <div key={age} style={{ position:'absolute', left:`${(age/80)*100}%`, transform:'translateX(-50%)', textAlign:'center' }}>
            <div style={{ fontSize:8, color:C.sub, lineHeight:1 }}>{age}</div>
          </div>
        ))}
      </div>
      {/* Legend */}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:3, fontSize:9, color:C.sub, flexWrap:'wrap' }}>
        <span style={{ display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ display:'inline-block', width:10, height:4, background:maleColor, borderRadius:1 }} />
          Male (median <strong style={{ color:maleColor }}>{medianM} yrs</strong>)
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ display:'inline-block', width:10, height:4, background:femaleColor, borderRadius:1 }} />
          Female (median <strong style={{ color:femaleColor }}>{medianF} yrs</strong>)
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
const rainColor = p => {
  const r = Math.round(255 - (209 * p / 100));
  const g = Math.round(255 - (121 * p / 100));
  const b = Math.round(255 - (33  * p / 100));
  return `rgb(${r},${g},${b})`;
};

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

/* Tajikistan Flag — horizontal tricolor: red top, white middle (with gold crown & 7 stars), green bottom */
const Flag = () => (
  <div style={{ width:90, height:54, borderRadius:3, overflow:'hidden',
    boxShadow:`0 4px 24px rgba(35,159,64,.45)`, flexShrink:0, position:'relative' }}>
    <div style={{ height:'33.3%', background:C.red }} />
    <div style={{ height:'33.4%', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="40" height="14" viewBox="0 0 40 14" fill="none">
        <path d="M8 7 L10 2 L12 7 L7 4 L13 4 Z" fill={C.gld} />
        {[0,1,2,3,4,5,6].map(i => (
          <circle key={i} cx={5 + i * 5} cy={10} r="1.2" fill={C.gld} />
        ))}
      </svg>
    </div>
    <div style={{ height:'33.3%', background:C.tj }} />
  </div>
);

export default function Tajikistan() {
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
            <div style={{ fontSize:10, letterSpacing:'0.28em', textTransform:'uppercase', color:C.tj, marginBottom:14 }}>Country Dashboard 2025</div>
            <h1 style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:'clamp(44px,9vw,96px)', lineHeight:0.9, letterSpacing:'-0.02em', marginBottom:16 }}>
              Tajiki<em style={{ fontStyle:'italic', color:C.tj, fontWeight:400 }}>stan</em>
            </h1>
            <p style={{ fontSize:14, color:C.sub, maxWidth:480, lineHeight:1.7 }}>
              A comprehensive data snapshot — geography, climate, population, economy, employment, education and politics — sourced from State Committee on Statistics TJ, World Bank, IMF, and UN agencies.
            </p>
          </div>
          <div style={{ alignSelf:'flex-start', marginTop:6 }}><Flag /></div>
        </div>

        {/* 1. GEOGRAPHY */}
        <SectionHeader icon={Icons.mountain} label="Geography & Landscape" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Total Area" value="144,100 km²" sub="93% mountainous; slightly larger than Greece" accent={C.dim} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Highest Peak" value="7,495 m" sub="Ismoil Somoni Peak (formerly Communism Peak) — Pamir" accent={C.tj} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Mean Elevation" value="~3,186 m" sub="Highest mean elevation of any sovereign state on Earth" accent={C.gld} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Lowest Point" value="300 m" sub="Syr Darya valley near Uzbekistan border" accent={C.red} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Borders" value="4 countries" sub="Afghanistan, China, Kyrgyzstan, Uzbekistan" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Panj River length" value="921 km" sub="Forms 1,300 km border with Afghanistan; feeds Amu Darya" accent={C.dim} delay={0.30} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Glaciers" value="~8,000+" sub="More glaciers than any country outside polar regions" accent={C.dim} delay={0.35} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Mountain coverage" value="~93%" sub="Pamir & Alay ranges; only valleys habitable" accent={C.dim} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Arable land" value="~5.96%" sub="Severely land-scarce; Fergana & Hisar valleys key" accent={C.dim} delay={0.45} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Major Terrain Zones" icon={Icons.map}>
              <BarRow label="High Pamir plateau (eastern Tajikistan)" value="~45%" pct={100} color={C.tj} />
              <BarRow label="Mountain ranges & valleys (central)" value="~48%" pct={95} color={C.gld} />
              <BarRow label="Fergana Valley strip (north)" value="~3%" pct={7} color={C.red} />
              <BarRow label="Hisar & Vakhsh valleys (south-west)" value="~4%" pct={9} color={C.dim} />
              <BarRow label="Forest cover" value="~2.9%" pct={6} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>93% mountain coverage surpasses even Kyrgyzstan (94%) in practical inhabitation challenges — Tajikistan has the world's highest mean elevation. The Pamir plateau, called the "Roof of the World," averages above 4,000m. Only 7% of land can support agriculture or dense settlement.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Water Bodies & Features" icon={Icons.water}>
              <Tbl rows={[
                ['Karakul Lake (highest saline lake)', '3,914 m altitude; 380 km²'],
                ['Sarez Lake (landslide dam, 1911)', '17 km³ volume; seismic risk'],
                ['Vakhsh River (main hydro river)', '524 km; feeds Rogun & Nurek dams'],
                ['Panj River (Afghan border)', '921 km'],
                ['Nurek Dam (tallest earthen dam globally)', '300 m; 3,000 MW'],
                ['Rogun Dam (under construction)', '335 m when complete; 3,600 MW'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Sarez Lake — formed by a 1911 earthquake landslide — holds 17 km³ of water behind a natural dam. If it failed, it would be a catastrophe for downstream Afghanistan and Uzbekistan. Rogun Dam, when complete, will be the world's tallest dam and transform Tajikistan into a major electricity exporter.</p>
            </Panel>
          </div>
        </div>
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-3 d-flex"><RegCard name="Dushanbe & Hisar" type="Capital · western valley" desc="Capital (1.2M). Hisar Valley at 823m. Administrative & commercial hub. Soviet-era layout; rapidly modernising." stripe={C.tj} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Sughd (Khujand)" type="North · Fergana strip" desc="Most prosperous region. Fergana Valley agriculture. Silk Road city Khujand (330 BC). Industry and textiles." stripe={C.gld} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Khatlon (south-west)" type="Agriculture · cotton belt" desc="Largest region by population. Vakhsh Valley cotton & fruit. Kulyab & Qurghonteppa industrial centres." stripe={C.tj} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="GBAO (Pamir)" type="Remote · Roof of World" desc="Gorno-Badakhshan Autonomous Oblast. Pamir Highway (M41). Extreme altitude; barely 200,000 people." stripe={C.gld} /></div>
        </div>

        {/* 2. CLIMATE */}
        <SectionHeader icon={Icons.cloudSun} label="Climate: Weather, Daylight & Rainfall" />
        <div className="row g-1 mb-4">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Annual Temp (Dushanbe)" value="14.7°C" sub="Continental; hot summers, cold winters; valley location" accent={C.gld} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Record High" value="48°C" sub="Southern valleys; extreme summer heat in Khatlon" accent={C.tj} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Record Low" value="−63°C" sub="Pamir plateau; most extreme cold in former Soviet space" accent={C.red} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Annual Rainfall (Dushanbe)" value="~560 mm" sub="Mountains receive 1,000–2,000 mm; Pamir as low as 60 mm" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Climate type" value="BSk / Dfa" sub="Semi-arid valleys; alpine tundra on Pamir" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Dushanbe summer avg" value="28°C" sub="Hot & dry Jul–Aug; dust from Amu Darya basin" accent={C.dim} delay={0.30} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Winter Dec–Feb (Dushanbe)" value="1–4°C" sub="Mild in capital; −25°C in mountains; heavy snow" accent={C.red} delay={0.35} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Pamir annual avg" value="−10 to −20°C" sub="Permanent permafrost above 4,000m; snow year-round" accent={C.dim} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Spring (Mar–May)" value="8–22°C" sub="Wettest season; snowmelt floods; Dushanbe blooms" accent={C.tj} delay={0.45} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Daylight Hours — Dushanbe (38.5°N)" icon={Icons.sun}>
              {[
                { mo:'Jan', label:'9h 56m', pct:40, color:C.red },
                { mo:'Feb', label:'10h 58m', pct:47, color:C.red },
                { mo:'Mar', label:'12h 08m', pct:55 },
                { mo:'Apr', label:'13h 22m', pct:66 },
                { mo:'May', label:'14h 20m', pct:76 },
                { mo:'Jun', label:'14h 50m ★', pct:100, color:C.gld, dark:true },
                { mo:'Jul', label:'14h 36m', pct:96 },
                { mo:'Aug', label:'13h 40m', pct:83 },
                { mo:'Sep', label:'12h 20m', pct:66 },
                { mo:'Oct', label:'11h 02m', pct:53 },
                { mo:'Nov', label:'10h 02m', pct:42, color:C.red },
                { mo:'Dec', label:'9h 36m ★', pct:36, color:C.red },
              ].map(r => <DlRow key={r.mo} mo={r.mo} label={r.label} pct={r.pct} color={r.color || C.tj} dark={r.dark} />)}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>At 38.5°N, Dushanbe has a relatively mild daylight swing (5h 14m) compared to Astana (8.5h). Long summer days of nearly 15h support agriculture in the valleys. The hot, dry summer coincides with maximum solar energy — Tajikistan's untapped solar potential is significant.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Rainfall by Region" icon={Icons.rain}>
              <p style={{ fontSize:11, color:C.sub, marginBottom:11, letterSpacing:'0.04em' }}>Annual precipitation by zone</p>
              <BarRow label="Western Pamir-Alay slopes" value="1,000–2,000 mm" pct={100} color={C.tj} />
              <BarRow label="Dushanbe & Hisar Valley" value="~560 mm" pct={40} color={C.gld} />
              <BarRow label="Fergana Valley strip (Sughd)" value="~300 mm" pct={22} color={C.red} />
              <BarRow label="Eastern Pamir plateau" value="~60–100 mm" pct={7} color={C.dim} />
              <div style={{ height:1, background:C.border, margin:'14px 0' }} />
              <p style={{ fontSize:11, color:C.sub, marginBottom:11, letterSpacing:'0.04em' }}>Dushanbe monthly pattern</p>
              <BarRow label="March–April (wettest)" value="70–85 mm" pct={100} color={C.tj} />
              <BarRow label="Jun–Aug (dry summer)" value="5–15 mm" pct={15} color={C.gld} />
              <BarRow label="Dec–Jan (snow/rain)" value="20–30 mm" pct={30} color={C.red} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The Pamir's extreme aridity (60mm/year) contrasts with the western slopes receiving 2,000mm. This glacial melt feeds the Amu Darya — Central Asia's most important river — making Tajikistan the region's water tower. Climate change is accelerating glacier retreat at an estimated 1% per year.</p>
              <GradientBar title="Monthly avg temperature — Dushanbe (°C)" values={[2,4,10,16,21,27,30,28,22,14,7,3]} colorStops={tempColor} unit="°" />
              <GradientBar title="Monthly rainfall — Dushanbe (mm)" values={[35,40,65,75,65,10,5,3,8,30,40,38]} colorStops={rainColor} unit="mm" />
            </Panel>
          </div>
        </div>

        {/* 3. POPULATION */}
        <SectionHeader icon={Icons.people} label="Population & Demographics" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Population (2025)" value="~10.8M" sub="Growing ~2.2% per year; ~1M abroad as migrant workers" accent={C.tj} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Urban Population" value="~28%" sub="Most rural country in Central Asia; urbanisation accelerating" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Median Age" value="~22 yrs" sub="Extremely young; 35%+ under 15; demographic bulge building" accent={C.gld} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Population Density" value="~75 /km²" sub="Concentrated in valleys; mountains nearly empty" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Life Expectancy" value="71.4 yrs" sub="Women 72.7 · Men 66.2 (2023 est.)" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Fertility Rate" value="3.45" sub="Highest in Central Asia; birth rate ~20.7 per 1,000" accent={C.red} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Population Growth" icon={Icons.chart}>
              <BarRow label="1991 (independence)" value="5.5M" pct={51} color={C.dim} />
              <BarRow label="2000 (post-civil war)" value="6.2M" pct={57} color={C.dim} />
              <BarRow label="2010" value="7.6M" pct={70} color={C.red} />
              <BarRow label="2020" value="9.5M" pct={88} color={C.gld} />
              <BarRow label="2025" value="~10.8M" pct={100} color={C.tj} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Population nearly doubled since independence (+96%) — one of the fastest growth rates in the former Soviet space — driven by a persistently high fertility rate of 3.45. The 1992–1997 civil war caused a dip from out-migration but natural increase quickly resumed. 1M+ migrant workers in Russia mean the de-facto domestic population is smaller.</p>
              <AgeBar
                title="Population age structure — male ▲ / female ▼ (% of total)"
                male={[7.03,5.54,5.58,5.53,5.44,4.6,3.44,2.85,2.57,2.3,1.98,1.27,0.81,0.46,0.49,0.59]}
                female={[6.61,5.25,5.31,5.32,5.38,4.54,3.37,2.88,2.64,2.4,2.03,1.33,0.86,0.42,0.49,0.68]}
                medianM={21.5}
                medianF={23.5}
              />
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Largest Cities (2025 est.)" icon={Icons.landmark}>
              <BarRow label="Dushanbe (capital)" value="~1,228,000" pct={100} color={C.tj} />
              <BarRow label="Khujand (Sughd region)" value="~181,000" pct={15} color={C.gld} />
              <BarRow label="Kulob (Khatlon region)" value="~105,000" pct={9} color={C.red} />
              <BarRow label="Qurghonteppa / Bokhtar" value="~100,000" pct={8} color={C.dim} />
              <BarRow label="Istaravshan (ancient Cyropolis)" value="~65,000" pct={5} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Dushanbe's primacy — holding ~11% of the entire population — is extreme even for Central Asia. No other city exceeds 200,000, reflecting the constraints of mountainous terrain on urbanisation. This makes Dushanbe the sole centre of economic, political, and cultural life — a significant vulnerability.</p>
            </Panel>
          </div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Ethnic Composition (2020)" icon={Icons.people}>
              <Donut
                label="10.8M"
                sublabel="population"
                segments={[
                  { label:'Tajik',          value:'84.3%', pct:84.3, color:C.tj  },
                  { label:'Uzbek',          value:'13.8%', pct:13.8, color:C.gld },
                  { label:'Kyrgyz',         value:'0.8%',  pct:0.8,  color:C.red },
                  { label:'Russian',        value:'0.5%',  pct:0.5,  color:'#888'},
                  { label:'Other',          value:'0.6%',  pct:0.6,  color:C.dim },
                ]}
              />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The 84% Tajik majority is one of the most ethnically homogeneous states in Central Asia. The 13.8% Uzbek minority — concentrated in Sughd and along the western border — has historically been a source of ethnic tension, particularly as Tajikistan-Uzbekistan relations normalised only after 2016.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Religion & Language" icon={Icons.landmark}>
              <Tbl rows={[
                ['Islam (predominantly Sunni)', '~96%'],
                ['Ismaili Muslims (GBAO Pamiri)', '~3%'],
                ['Christianity & other', '~1%'],
                ['State language', 'Tajik (Persian dialect; Cyrillic script)'],
                ['Inter-ethnic language', 'Russian (declining)'],
                ['Recognized minority language', 'Uzbek, Kyrgyz'],
                ['UNESCO Intangible Heritage', 'Navruz; Falak music tradition'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Tajik is a Persian dialect — making Tajikistan the only Persian-speaking country in the former Soviet Union. The Ismaili Pamiri community in GBAO follows the Aga Khan and maintains a distinct cultural identity. Religion is state-monitored: only two mosques per district are officially allowed; the Islamic Renaissance Party was banned in 2015.</p>
            </Panel>
          </div>
        </div>

        {/* 4. ECONOMY */}
        <SectionHeader icon={Icons.chart} label="Economy & Finance" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP Nominal (2025 est.)" value="~$18.8B" sub="IMF; fastest-growing in Central Asia at 8.4% in 2024" accent={C.tj} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP per Capita" value="~$1,780" sub="IMF 2025; lowest in Central Asia; lower-middle income" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP Growth (2024)" value="8.4%" sub="World Bank confirmed; services & industry led" accent={C.gld} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP PPP (2025)" value="~$62.6B" sub="PPP per capita ~$6,048 — masks remittance dependency" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Inflation CPI (2025)" value="~3.1%" sub="IMF estimate; among lowest in the region; subsidised prices" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Currency" value="TJS (Somoni)" sub="~10.9 TJS = $1 (2025 avg)" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="GDP by Sector & Major Exports" icon={Icons.chart}>
              <Donut
                label="$18.8B"
                sublabel="GDP 2025"
                segments={[
                  { label:'Services',              value:'~54%', pct:54, color:C.tj  },
                  { label:'Industry (aluminium, mining)', value:'~23%', pct:23, color:C.gld },
                  { label:'Agriculture (cotton, fruits)', value:'~23%', pct:23, color:C.red },
                ]}
              />
              <div style={{ height:1, background:C.border, margin:'16px 0' }} />
              <BarRow label="Aluminium (TALCO plant)" value="~40% of exports" pct={100} color={C.tj} />
              <BarRow label="Gold & precious metals" value="~20%" pct={50} color={C.gld} />
              <BarRow label="Cotton fibre & yarn" value="~10%" pct={25} color={C.red} />
              <BarRow label="Electricity (Rogun future)" value="~5%" pct={13} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>TALCO (Tajik Aluminium Company) — the world's largest aluminium smelter by capacity — dominates exports using cheap hydropower. Gold from mines in central Tajikistan is the second export. Agriculture employs ~50% of the workforce but generates only ~23% of GDP — a clear productivity gap.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Economic Indicators" icon={Icons.briefcase}>
              <Tbl rows={[
                ['Remittances (% of GDP)', '~49% of GDP in 2024 (World Bank — record)'],
                ['Remittances source', '~95% from Russia'],
                ['External debt (2024)', '~$3.2B; mostly China (EXIM Bank)'],
                ['Poverty rate ($4.20/day, 2025)', '~14.8% (down from 55% in 2010)'],
                ['Gini coefficient (2015)', '34.0 — moderate inequality'],
                ['Main trading partners', 'China, Russia, Kazakhstan, Turkey'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Remittances at 49% of GDP in 2024 is one of the highest in the world — only Tonga and a few Pacific islands exceed it. This extreme dependency on Russia (where ~1M Tajiks work) means the entire economy oscillates with Russian ruble exchange rates and migration policy. Poverty falling from 55% to 15% since 2010 is a major achievement driven almost entirely by remittances.</p>
            </Panel>
          </div>
        </div>

        {/* 5. EMPLOYMENT */}
        <SectionHeader icon={Icons.briefcase} label="Employment & Wages" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Monthly Wage (2024)" value="~$160" sub="~1,740 TJS; among lowest in post-Soviet space" accent={C.gld} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Labour Force (domestic)" value="~2.5M" sub="~1M+ additional working abroad in Russia mainly" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Unemployment (official)" value="~2.5%" sub="Severely understates reality; underemployment ~30%" accent={C.tj} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Informal employment" value="~50%+" sub="Agriculture, bazaar trade; no social protection" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Min. Wage (2025)" value="~400 TJS" sub="~$37/month; far below living costs even in rural areas" accent={C.red} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Labour Participation" value="~57%" sub="Women ~45% vs men ~70%; rural women severely underemployed" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Wages by Sector (monthly TJS, est.)" icon={Icons.chart}>
              <BarRow label="Mining & extraction" value="~4,500" pct={100} color={C.tj} />
              <BarRow label="Financial services" value="~3,800" pct={84} color={C.gld} />
              <BarRow label="Public administration" value="~2,200" pct={49} color={C.red} />
              <BarRow label="National average" value="~1,740" pct={39} color={C.dim} />
              <BarRow label="Education & health" value="~1,200" pct={27} color={C.dim} />
              <BarRow label="Agriculture" value="~800" pct={18} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The average wage of ~$160/month explains why ~1M Tajiks migrate to Russia, where even low-skill work pays 5–10× more. The 5.6× gap between mining (4,500 TJS) and agriculture (800 TJS) is extreme. Agriculture employs ~47% of workers but pays the lowest wages — a structural poverty trap.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Employment by Sector" icon={Icons.briefcase}>
              <Donut
                label="2.5M"
                sublabel="domestic labour"
                segments={[
                  { label:'Agriculture & livestock', value:'~47%', pct:47, color:C.tj  },
                  { label:'Trade & services',        value:'~28%', pct:28, color:C.gld },
                  { label:'Industry & mining',       value:'~11%', pct:11, color:C.red },
                  { label:'Construction',            value:'~7%',  pct:7,  color:C.dim },
                  { label:'Public sector',           value:'~7%',  pct:7,  color:'#555'},
                ]}
              />
              <div style={{ height:1, background:C.border, margin:'16px 0' }} />
              <Tbl rows={[
                ['Migrant workers abroad (est.)', '~1,000,000–1,200,000'],
                ['Remittances (2024)', '~$9.2B (~49% of GDP)'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>47% in agriculture is the highest in Central Asia — a sign of the underdeveloped non-farm economy. The ~1.2M migrants abroad represent nearly half the formal domestic labour force. When Russia imposes stricter migration rules, the economic shock is immediate and severe.</p>
            </Panel>
          </div>
        </div>

        {/* 6. EDUCATION */}
        <SectionHeader icon={Icons.graduation} label="Education & Human Development" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Literacy Rate" value="99.7%" sub="Soviet-era legacy; near-universal; rural women slightly lower" accent={C.tj} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="HDI (2023)" value="0.691" sub="Medium Human Development — rank 128th globally (UNDP)" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Years Schooling" value="~11.3 yrs" sub="Declining quality despite maintained access" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Expected Schooling" value="~11.7 yrs" sub="Among lowest expected years in post-Soviet space" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Education Spending" value="~5.2% GDP" sub="Above regional average in % terms; low in absolute $" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Universities" value="~37" sub="Tajik National University is largest; quality concerns widespread" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Education Metrics" icon={Icons.graduation}>
              <BarRow label="Primary enrolment rate" value="~98%" pct={98} color={C.tj} />
              <BarRow label="Secondary completion rate" value="~88%" pct={88} color={C.gld} />
              <BarRow label="Tertiary enrolment" value="~21%" pct={21} color={C.red} />
              <BarRow label="Girls secondary completion" value="~82%" pct={82} color={C.dim} />
              <BarRow label="PISA equivalent scores" value="well below average" pct={28} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Tertiary enrolment at 21% is the lowest in Central Asia — reflecting both poverty (many young men leave for Russia instead of studying) and limited university capacity. The gender gap in secondary completion (88% boys vs 82% girls) is a persistent challenge in rural areas where girls marry young.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Education Facts" icon={Icons.landmark}>
              <Tbl rows={[
                ['Language of instruction', 'Tajik; Russian widely used in cities'],
                ['Top study destinations abroad', 'Russia, China, Turkey, Kazakhstan'],
                ['University of Central Asia (UCA)', 'In Khorog (GBAO); Aga Khan-funded'],
                ['Child marriage rate (by 18)', '~13% of girls — significant challenge'],
                ['Aga Khan Education Network', '~200 schools in GBAO region'],
                ['Digital education gap', 'Severe; internet access only ~40% nationwide'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The Aga Khan Development Network's investment in GBAO (Pamiri region) has produced the highest literacy and gender parity outcomes in the country — a remarkable example of private development impact. Child marriage remains a serious concern, particularly in rural Khatlon, limiting girls' educational outcomes.</p>
            </Panel>
          </div>
        </div>

        {/* 7. POLITICAL LANDSCAPE */}
        <SectionHeader icon={Icons.landmark} label="Political Landscape" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="System" value="Presidential" sub="One of the world's most authoritarian regimes (Freedom House)" accent={C.red} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="President" value="E. Rahmon" sub="In power since 1994; 'Founder of Peace and National Unity'" accent={C.gld} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Parliament (Majlisi Oli)" value="63 seats" sub="Bicameral; upper senate + lower assembly; rubber-stamp body" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ruling Party" value="PDPT" sub="People's Democratic Party of Tajikistan; controls all seats" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Press Freedom (RSF 2024)" value="Rank 162/180" sub="Near-bottom globally; all media state-controlled" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Independence" value="Sep 9, 1991" sub="From Soviet Union; civil war followed 1992–1997" accent={C.tj} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Political Context" icon={Icons.landmark}>
              <BarRow label="Freedom House score (100=free)" value="4/100" pct={4} color={C.red} />
              <BarRow label="CPI score (100=clean, TI 2024)" value="~20/100" pct={20} color={C.gld} />
              <BarRow label="Press freedom (100=free, est.)" value="~10/100" pct={10} color={C.dim} />
              <BarRow label="Rule of law (WJP, 100=best)" value="~25/100" pct={25} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Freedom House classifies Tajikistan as "Not Free" with a score of 4/100 — among the lowest globally, alongside North Korea and Turkmenistan. President Rahmon has held power for 31 years. His son Rustam Emomali heads the Senate — a clear dynastic succession is being engineered. The Islamic Renaissance Party, the only significant opposition, was banned as a "terrorist organisation" in 2015.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Political Timeline" icon={Icons.chart}>
              {[
                { yr:'1991', tx:'Independence declared Sep 9. Civil war begins within months as communist and Islamist factions clash.' },
                { yr:'1992–97', tx:'Civil War kills ~50,000–100,000 and displaces 500,000+. Economy collapses. Emomali Rahmon rises to power.' },
                { yr:'1997', tx:'Peace agreement signed in Moscow. Rahmon consolidates power; opposition parties gradually suppressed.' },
                { yr:'2015', tx:'Islamic Renaissance Party banned as "terrorist organisation" — the sole significant opposition effectively eliminated.' },
                { yr:'2016', tx:'Constitutional referendum removes presidential term limits. Rahmon, 63, can rule for life.' },
                { yr:'2020', tx:'Son Rustam Emomali becomes Senate Chairman — second in line to the presidency; dynastic succession visible.' },
              ].map(({ yr, tx }) => (
                <div key={yr} style={{ paddingLeft:16, borderLeft:`1px solid ${C.tj}`, marginBottom:14 }}>
                  <div style={{ fontSize:10, letterSpacing:'0.11em', color:C.gld, textTransform:'uppercase', marginBottom:2 }}>{yr}</div>
                  <div style={{ fontSize:12.5, color:'#888', lineHeight:1.6 }}>{tx}</div>
                </div>
              ))}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Rahmon's 31-year rule is the longest of any head of state in the post-Soviet space. The 2016 removal of term limits and the grooming of his son represent a shift from authoritarian rule to dynastic succession — a pattern rare even in Central Asia. The civil war's trauma is used to justify authoritarian stability.</p>
            </Panel>
          </div>
        </div>

        {/* 8. TOURISM */}
        <SectionHeader icon={Icons.briefcase} label="Tourism" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="International Visitors (2023)" value="~1.1M" sub="Recovering post-COVID; mostly regional visitors" accent={C.tj} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Tourism Revenue" value="~$200M" sub="~1% of GDP; vast untapped potential" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Top draw" value="Pamir Highway" sub="M41 highway — most epic overland route in the world" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Visa-free / e-visa" value="~50 countries" sub="E-visa available online; significant improvement since 2018" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GBAO special permit" value="Required" sub="Additional permit for Pamir region; border zone with China/Afghanistan" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="2025 visitor target" value="2M+" sub="National Tourism Strategy; infrastructure investment key bottleneck" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Top Visitor Origins (2023 est.)" icon={Icons.people}>
              {[
                { flag:'🇺🇿', country:'Uzbekistan',  val:'cross-border; family & business', pct:'~35%' },
                { flag:'🇷🇺', country:'Russia',      val:'diaspora visits; business',       pct:'~20%' },
                { flag:'🇩🇪', country:'Germany',     val:'adventure & Pamir trekking',      pct:'~6%'  },
                { flag:'🇨🇳', country:'China',       val:'trade corridor; growing',         pct:'~5%'  },
                { flag:'🇺🇸', country:'USA',         val:'adventure tourism; high-spend',   pct:'~4%'  },
                { flag:'🇬🇧', country:'UK & EU',     val:'Silk Road; Pamir expedition',     pct:'~8%'  },
              ].map(({ flag, country, val, pct }) => (
                <div key={country} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0' }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{flag}</span>
                  <span style={{ fontSize:12.5, color:C.txt, flexShrink:0 }}>{country}</span>
                  <span style={{ fontSize:11, color:C.sub, flex:1 }}>{val}</span>
                  <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.txt, flexShrink:0 }}>{pct}</span>
                </div>
              ))}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Western adventure tourists (Germany, UK, USA) are a small but high-spending segment — they come for the Pamir, one of the world's last great travel frontiers. Regional visitors (Uzbekistan, Russia) are the volume. As Tajikistan-Uzbekistan relations improve and the Pamir Highway upgrades, tourism has genuine upside.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Tourism Highlights" icon={Icons.landmark}>
              <Tbl rows={[
                ['Pamir Highway (M41)', 'World\'s 2nd highest international road; 1,200km'],
                ['Ismoil Somoni Peak (7,495m)', 'Mountaineering; highest in former USSR'],
                ['Wakhan Corridor (Afghan border)', 'Remote; Marco Polo sheep; ancient silk route'],
                ['Istaravshan old city', 'Founded by Alexander the Great (~329 BC)'],
                ['Hissar Fortress (near Dushanbe)', '3,000 years of history; major restoration'],
                ['Fann Mountains (Sughd)', 'Turquoise lakes; trekking; low-season skiing'],
                ['Rushan & Ishkashim (GBAO villages)', 'Unique Pamiri architecture & hospitality'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The Pamir Highway is globally unique — a genuine wilderness road at 4,000–5,000m altitude bordering Afghanistan and China. Tajikistan is one of the few remaining "off the beaten track" destinations in Asia. Infrastructure limitations (accommodation, internet, roads) remain the key tourism constraint, not demand.</p>
              <GradientBar title="Tourism intensity by month (relative)" values={[8,10,18,30,50,70,100,95,90,45,15,8]} colorStops={p => { const r=Math.round(255-(220*p/100)); const g=Math.round(255-(96*p/100)); const b=Math.round(255-(191*p/100)); return `rgb(${r},${g},${b})`; }} unit="%" />
            </Panel>
          </div>
        </div>

        {/* 9. VITAL STATISTICS */}
        <SectionHeader icon={Icons.people} label="Vital Statistics" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Births (2025 est.)" value="~225,000" sub="Birth rate ~20.7 per 1,000; high but declining slowly" accent={C.tj} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Natural Increase" value="~165,000" sub="Strong net growth; low death rate ~5.7 per 1,000" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ages 0–14" value="~35%" sub="Massive youth bulge; future labour supply or unemployment risk" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ages 65+" value="~3.6%" sub="Very young age structure; minimal pension pressure for now" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Deaths (2025 est.)" value="~60,000" sub="Death rate ~5.7 per 1,000 — low; young population" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Infant Mortality" value="32.3 / 1,000" sub="Highest in Central Asia; 4× Kazakhstan rate; rural health gap" accent={C.red} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Causes of Death (est.)" icon={Icons.chart}>
              <BarRow label="Circulatory diseases"        value="~47%" pct={100} color={C.tj}  />
              <BarRow label="Respiratory diseases"        value="~12%" pct={26}  color={C.gld} />
              <BarRow label="Digestive diseases"          value="~10%" pct={21}  color={C.red} />
              <BarRow label="Infections & parasitic"      value="~9%"  pct={19}  color={C.dim} />
              <BarRow label="Injuries & accidents"        value="~7%"  pct={15}  color={C.dim} />
              <BarRow label="Cancer (neoplasms)"          value="~7%"  pct={15}  color={C.dim} />
              <BarRow label="Other"                       value="~8%"  pct={17}  color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Infant mortality at 32.3/1,000 is the highest in Central Asia — 4× Kazakhstan (8.0) and double Kyrgyzstan (14.8). This reflects extreme rural health care inaccessibility: in GBAO, a patient can be 12 hours from the nearest hospital. Respiratory deaths are elevated due to indoor burning of biomass for heating.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Marriage & Vital Trends" icon={Icons.landmark}>
              <Tbl rows={[
                ['Marriage rate (per 1,000)', '~8.2'],
                ['Divorce rate (per 1,000)', '~0.9'],
                ['Avg age at first marriage (women)', '~22 yrs'],
                ['Child marriage rate (under 18)', '~13%'],
                ['Maternal mortality ratio (2023)', '~17 per 100,000'],
                ['Child stunting rate (2022)', '~18% — significant malnutrition'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Child stunting at 18% is the highest in Central Asia and signals chronic malnutrition, particularly in rural Khatlon and GBAO. The low divorce rate (0.9) reflects both cultural norms and the practical difficulties of divorce for women. Child marriage at 13% is a significant human rights concern tied to rural poverty and limited girls' education.</p>
            </Panel>
          </div>
        </div>

        {/* 10. ECONOMIC DEPTH */}
        <SectionHeader icon={Icons.chart} label="Economic Depth & Fiscal Position" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Foreign Reserves (2025)" value="~$5.6B" sub="World Bank 2025; 8+ months import cover — record high" accent={C.tj} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Govt Budget (2025)" value="~−2.2% deficit" sub="IMF fiscal anchor; grant inflows declining as IDA transitions" accent={C.gld} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Govt Debt / GDP (2024)" value="~33%" sub="Manageable but China EXIM Bank debt raises sustainability concerns" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Rogun Dam investment" value="~$4B+ total" sub="World's tallest dam when complete; transforms energy exports" accent={C.red} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="FDI (2024)" value="~$300M" sub="Low; challenging business environment; mostly extractives" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Trade deficit (2024)" value="~−35% GDP" sub="Exports $1.7B vs Imports $6.3B; remittances fund the gap" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Top Export Destinations (2024)" icon={Icons.briefcase}>
              {[
                { flag:'🇨🇳', country:'China',       val:'largest partner; aluminium & cotton', pct:'~20%' },
                { flag:'🇨🇭', country:'Switzerland', val:'gold refining corridor',              pct:'~20%' },
                { flag:'🇪🇺', country:'EU',          val:'aluminium & textiles',                pct:'~19%' },
                { flag:'🇹🇷', country:'Turkey',      val:'textiles & cotton yarn',              pct:'~15%' },
                { flag:'🇰🇿', country:'Kazakhstan',  val:'transit & re-export corridor',        pct:'~13%' },
                { flag:'🇺🇿', country:'Uzbekistan',  val:'growing bilateral; food & goods',     pct:'~9%'  },
              ].map(({ flag, country, val, pct }) => (
                <div key={country} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0' }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{flag}</span>
                  <span style={{ fontSize:12.5, color:C.txt, flexShrink:0 }}>{country}</span>
                  <span style={{ fontSize:11, color:C.sub, flex:1 }}>{val}</span>
                  <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.txt, flexShrink:0 }}>{pct}</span>
                </div>
              ))}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>China and Switzerland both at ~20% reflects: China buys aluminium and cotton directly; Switzerland is the gold refining destination. TALCO's electricity-intensive aluminium smelting means Tajikistan essentially exports hydropower in the form of metal — electro-intensive industry as an energy monetisation strategy.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Fiscal Indicators" icon={Icons.chart}>
              <Tbl rows={[
                ['Govt debt / GDP (2024)', '~33% — moderate but China-heavy'],
                ['China EXIM Bank debt share', '~40% of total external debt'],
                ['Rogun Dam Unit 1 (commissioned)', '600 MW operational since 2018'],
                ['Rogun Dam Unit 2 (operational)', '600 MW since 2023'],
                ['Rogun total planned capacity', '3,600 MW; 335m height'],
                ['Electricity export potential', '~20–22 TWh/year at full capacity'],
                ['IDA grant graduation (planned)', 'Transitioning to loan terms ~2025–2027'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Rogun Dam is Tajikistan's generational economic bet — if completed, it would make the country an electricity exporter and reduce dependence on remittances. China's 40% share of external debt is a significant risk; Tajikistan has already ceded a gold mine to China in lieu of debt repayment. Graduating from IDA grants raises financing costs.</p>
              <GradientBar title="Trade balance 2015–2024 ($B)" values={[-2.3, -2.1, -2.0, -2.2, -2.2, -1.7, -2.1, 0.0, -2.3, -3.0]} xLabels={['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']} colorStops={(p, v) => v >= 0 ? `rgb(${Math.round(255-220*p/100)},${Math.round(255-96*p/100)},${Math.round(255-191*p/100)})` : `rgb(${Math.round(255-23*p/100)},${Math.round(255-230*p/100)},${Math.round(255-211*p/100)})`} fmt={v => v > 0 ? `+${v}B` : `${v}B`} absScale={true} />
            </Panel>
          </div>
        </div>

        {/* 11. ENERGY */}
        <SectionHeader icon={Icons.mountain} label="Energy & Resources" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Total Generation (2024 est.)" value="~22 TWh" sub="Nearly 100% hydropower; 2nd cleanest grid in world" accent={C.tj} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Nurek HPP capacity" value="3,000 MW" sub="World's tallest earthen dam (300m); Vakhsh River" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Hydro potential (untapped)" value="~80%" sub="Potential 527 TWh/yr; only 4% utilised; enormous asset" accent={C.gld} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Energy deficit (winter)" value="Seasonal" sub="Power cuts 8–12 hrs/day in rural areas Dec–Feb; aluminium smelter priority" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="CASA-1000 transmission line" value="Under construction" sub="1,300 km; exports power to Pakistan &amp; Afghanistan" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Silver deposits" value="World top-10" sub="Significant untapped silver and gold reserves" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Electricity Generation Mix" icon={Icons.chart}>
              <Donut
                label="~22 TWh"
                sublabel="generated 2024"
                segments={[
                  { label:'Large hydropower (Nurek, Rogun)', value:'~95%', pct:95, color:C.tj  },
                  { label:'Small hydro & run-of-river',      value:'~4%',  pct:4,  color:C.gld },
                  { label:'Thermal & other',                 value:'~1%',  pct:1,  color:C.red },
                ]}
              />
              <p style={{ fontSize:11, color:C.sub, marginTop:12, lineHeight:1.6 }}>95% hydropower makes Tajikistan's grid among the cleanest on Earth. Yet rural residents face 8–12 hour daily power cuts in winter because reservoirs run low and the grid is dilapidated. TALCO aluminium smelter — the single largest electricity consumer — takes priority over residential supply.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Energy & Resources Facts" icon={Icons.landmark}>
              <Tbl rows={[
                ['Rogun Dam (world\'s tallest when complete)', '335m; 3,600 MW total'],
                ['CASA-1000 project (power export)', 'To Pakistan ~1,300 MW; Afghanistan transit'],
                ['Coal reserves (Shurab basin)', 'Modest; mostly used for winter heating'],
                ['Silver (Bolshoy Kanimansur deposit)', 'One of world\'s largest silver deposits'],
                ['Antimony production', 'Significant global producer'],
                ['Oil & gas', 'Minor; small deposits in Fergana Valley'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>CASA-1000 — exporting summer surplus hydro to Afghanistan and Pakistan — is transformational: it gives Tajikistan a market for its energy abundance, revenue to fund grid repairs, and geopolitical leverage. Rogun at 3,600MW (full capacity) would generate more electricity than Tajikistan currently consumes, making large-scale export possible.</p>
            </Panel>
          </div>
        </div>

        {/* 12. INFRASTRUCTURE */}
        <SectionHeader icon={Icons.map} label="Infrastructure & Digital Connectivity" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Internet Penetration" value="~40%" sub="ITU 2022; mobile-dominant; severe rural gap" accent={C.gld} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Mobile Subscribers" value="~11M" sub="~100% mobile penetration; Tcell & Beeline dominant" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Road Network" value="~30,000 km" sub="~17,500 km paved; mountain roads close seasonally" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Railways" value="~680 km" sub="Fragmented; no direct east-west connection; Soviet geography" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Fixed Broadband" value="~3%" sub="Among lowest in Central Asia; GBAO largely offline" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Dushanbe Int'l Airport" value="Main hub" sub="Limited direct routes; Almaty & Moscow main connections" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Key Infrastructure Projects" icon={Icons.map}>
              <Tbl rows={[
                ['Rogun Dam (on Vakhsh River)', '3,600 MW; 335m; generation transformational'],
                ['CASA-1000 transmission line', '1,300km to Pakistan via Afghanistan'],
                ['Dushanbe–Kulma highway (China link)', 'Connects to Xinjiang via Murghab'],
                ['Dushanbe–Chanak road (Uzbekistan)', 'Major cross-border route rehabilitation'],
                ['Trans-Afghan Railway (planned)', 'Would connect to Indian Ocean via Iran'],
                ['Pamir Highway (M41) rehabilitation', 'World Bank-funded; critical GBAO lifeline'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Tajikistan's geography means every infrastructure project is enormously expensive — roads through 4,000m passes, tunnels through permafrost, bridges over raging rivers. China has become the dominant infrastructure funder, raising debt-trap concerns. The Trans-Afghan Railway, if ever built, would give Tajikistan Indian Ocean access for the first time.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Digital Indicators" icon={Icons.chart}>
              <BarRow label="Internet penetration" value="~40%" pct={40} color={C.tj} />
              <BarRow label="Mobile penetration" value="~100%" pct={100} color={C.gld} />
              <BarRow label="Fixed broadband" value="~3%" pct={3} color={C.red} />
              <BarRow label="Social media penetration" value="~25%" pct={25} color={C.dim} />
              <BarRow label="E-government services uptake" value="~20%" pct={20} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Internet at 40% is the second-lowest in Central Asia (above only Turkmenistan). Facebook, Telegram, and VKontakte are the dominant platforms. The government periodically blocks social media during political tensions. GBAO has severely limited connectivity — satellite internet is the primary option in many Pamir villages.</p>
            </Panel>
          </div>
        </div>

        {/* 13. HEALTH */}
        <SectionHeader icon={Icons.people} label="Health System" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Health Spending (% GDP)" value="~7.5%" sub="WHO 2021; high % but tiny absolute — ~$134 per capita" accent={C.gld} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Out-of-pocket spending" value="~64%" sub="Share of total health spend; catastrophically high; worst in region" accent={C.red} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Infant mortality (2023)" value="32.3 / 1,000" sub="Highest in Central Asia; neonatal care gap in rural areas" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="TB incidence (2023)" value="~56 / 100K" sub="High; drug-resistant TB a growing concern in rural regions" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Maternal mortality (2023)" value="~17 / 100K" sub="Improving but above Central Asian peers" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Hospital beds / 1,000" value="~5.0" sub="Soviet infrastructure remains; quality very low" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Health System Facts" icon={Icons.people}>
              <Tbl rows={[
                ['OOP share of health spending', '~64% — highest in Central Asia'],
                ['Health spend per capita', '~$134 — lowest in region'],
                ['Doctors per 1,000 population', '~1.8 — low; brain drain to Russia severe'],
                ['Aga Khan Health Services (GBAO)', 'Only functioning rural health network in Pamir'],
                ['Malnutrition (stunting under-5)', '~18%'],
                ['COVID-19 impact', 'Severely underreported; excess mortality significant'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>OOP at 64% is catastrophically high — patients pay for nearly everything themselves in a country where the average wage is $160/month. The Aga Khan Health Services network in GBAO is better than the state system in most of rural Tajikistan. Medical brain drain — doctors emigrating to Russia — is severely depleting human capital.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Disease & Health Burden" icon={Icons.chart}>
              <BarRow label="TB incidence per 100K (2023)" value="~56" pct={100} color={C.tj} />
              <BarRow label="OOP health spending share" value="64%" pct={100} color={C.red} />
              <BarRow label="Child stunting (under-5)" value="~18%" pct={32} color={C.gld} />
              <BarRow label="Infant mortality per 1,000" value="32.3" pct={57} color={C.dim} />
              <BarRow label="Access to clean water (rural)" value="~60%" pct={60} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The health data paints a stark picture: TB at 56/100K, child stunting at 18%, infant mortality at 32/1,000, and OOP at 64% all indicate a health system in crisis. Rural Tajikistan — 72% of the population — is the most medically under-served area in the former Soviet Union outside Turkmenistan.</p>
            </Panel>
          </div>
        </div>

        {/* 14. SOCIAL */}
        <SectionHeader icon={Icons.people} label="Social Indicators & Inequality" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Poverty rate ($4.20/day)" value="~14.8%" sub="World Bank 2025; down from 55% in 2010 — remittance-driven" accent={C.tj} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gini Coefficient (2015)" value="34.0" sub="Moderate inequality; remittances equalise somewhat" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Rural poverty rate" value="~20%" sub="National line 2024; urban-rural gap significant" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gender Inequality Index" value="0.420 (rank 118)" sub="UNDP; limited women's economic & political participation" accent={C.gld} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Women in parliament" value="~24%" sub="Quota system; formal representation above MENA average" accent={C.red} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Child stunting" value="~18%" sub="Highest in Central Asia; rural malnutrition crisis" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Access & Basic Services" icon={Icons.chart}>
              <BarRow label="Access to clean water (urban)" value="~93%" pct={93} color={C.tj} />
              <BarRow label="Access to clean water (rural)" value="~60%" pct={60} color={C.gld} />
              <BarRow label="Access to sanitation (urban)" value="~88%" pct={88} color={C.dim} />
              <BarRow label="Access to sanitation (rural)" value="~45%" pct={45} color={C.dim} />
              <BarRow label="Electricity access (national)" value="~98%" pct={98} color={C.red} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Access to electricity (98%) is better than access to clean water in rural areas (60%) — a paradox explained by Soviet grid infrastructure that was maintained while water supply systems degraded. Rural sanitation at 45% is the worst in Central Asia and directly linked to high child diarrhoea and stunting rates.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Social Cohesion & Gender" icon={Icons.people}>
              <Tbl rows={[
                ['Gini coefficient (2015)', '34.0 — moderate'],
                ['Gender Inequality Index (UNDP)', '0.420 — rank 118/191'],
                ['Women in labour force', '~42% — low; remittance culture'],
                ['Child marriage (under 18)', '~13% of girls'],
                ['Polygamy (informal)', 'Practised in rural areas despite being illegal'],
                ['Aga Khan Dev. Network presence', 'Critical service provider in GBAO'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The poverty reduction from 55% to 15% since 2010 is genuine but almost entirely attributable to remittances rather than structural economic development — making it fragile. When Russia tightened migration rules in 2015–2016, Tajikistan's poverty rate spiked immediately. Building non-remittance income sources is the country's core development challenge.</p>
            </Panel>
          </div>
        </div>

        {/* 15. ENVIRONMENT */}
        <SectionHeader icon={Icons.water} label="Environment & Climate" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="CO₂ per capita (2022)" value="~0.7 t" sub="Extremely low; nearly pure hydro grid; subsistence agriculture" accent={C.gld} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Glacier loss rate" value="~1% per year" sub="8,000+ glaciers losing mass; Amu Darya flows threatened" accent={C.red} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Hydro potential" value="527 TWh/yr" sub="Only ~4% utilised; world's largest untapped per-capita potential" accent={C.tj} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Sarez Lake risk" value="High" sub="Natural dam holding 17km³; failure would be regional catastrophe" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Arable land loss" value="Ongoing" sub="Erosion & desertification in lower valleys; soil degradation" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Climate vulnerability" value="Extreme" sub="Mountain country; flood, drought, landslide risks all elevated" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Environmental Facts" icon={Icons.water}>
              <Tbl rows={[
                ['CO₂ per capita vs world avg', '0.7t vs ~4.7t — one of world\'s lowest'],
                ['Glacier count', '~8,000+ — more than any non-polar state'],
                ['Amu Darya water source', '>60% originates in Tajikistan glaciers'],
                ['Land degradation (% territory)', '~50% affected by erosion or degradation'],
                ['Protected areas', '~4.2% of territory'],
                ['Climate NDC target (2030)', 'Reduce GHG 20–35% vs BAU scenario'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>At 0.7t CO₂/capita, Tajikistan is one of the world's lowest emitters — its hydropower grid and subsistence economy mean minimal industrial emissions. The glacier paradox: Tajikistan's glaciers are a global freshwater asset but climate change (caused by others) is destroying them. Over 60% of the Amu Darya — which waters Uzbekistan and Turkmenistan — originates in Tajik glaciers.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Climate Risks" icon={Icons.chart}>
              <BarRow label="Glacier retreat risk" value="Critical" pct={95} color={C.tj} />
              <BarRow label="Flash flood frequency" value="High (spring melt)" pct={80} color={C.red} />
              <BarRow label="Landslide risk (mountain slopes)" value="Very high" pct={85} color={C.gld} />
              <BarRow label="Drought risk (lower valleys)" value="Elevated" pct={65} color={C.dim} />
              <BarRow label="Earthquake risk" value="High (seismically active)" pct={75} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Tajikistan is among the world's most climate-vulnerable countries despite being among the lowest emitters — an extreme injustice. Natural disasters (floods, landslides, earthquakes) occur multiple times per year. The 1911 Sarez earthquake that created Sarez Lake shows the scale of geological risk: a similar event today near the dam could be catastrophic.</p>
            </Panel>
          </div>
        </div>

        {/* 16. BUSINESS */}
        <SectionHeader icon={Icons.briefcase} label="Business & Investment Climate" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Corporate tax rate" value="18%" sub="Standard; special rates for free economic zones" accent={C.gld} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="FDI inflow (2024)" value="~$300M" sub="Low; dominated by China in mining & infrastructure" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ease of Doing Business" value="~Rank 106/190" sub="World Bank 2019; limited reforms since" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="VAT rate" value="15%" sub="Standard; multiple exemptions; collection weak" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Corruption Index (TI 2024)" value="~20/100" sub="Rank ~162/180; pervasive corruption at all levels" accent={C.red} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Free Economic Zones" value="5 FEZs" sub="Sugd, Dangara, Ishkashim, Panj, Kulyab; limited take-up" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Investment Climate Summary" icon={Icons.briefcase}>
              <Tbl rows={[
                ['CPI score (TI 2024)', '~20/100 — rank ~162/180'],
                ['Freedom House', '"Not Free" — 4/100'],
                ['Property rights protection', 'Very weak; state can seize without recourse'],
                ['Judicial independence', 'Non-existent; courts are political instruments'],
                ['China\'s infrastructure role', 'Dominant; gold mine ceded for debt relief'],
                ['Hydropower export opportunity', 'CASA-1000 to Pakistan transformational'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>A CPI of 20/100 and total judicial dependence make Tajikistan one of the most difficult investment environments in the post-Soviet space. China has filled the gap — accepting risk others won't — but has extracted strategic concessions (mining rights, land leases). The hydropower export opportunity is the one area where risk-tolerant investors can find compelling returns.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Risks & Opportunities" icon={Icons.chart}>
              <BarRow label="Governance / rule of law risk" value="Extreme" pct={95} color={C.red} />
              <BarRow label="Russia dependency (remittances)" value="Critical" pct={100} color={C.tj} />
              <BarRow label="Hydropower export opportunity" value="World-class" pct={90} color={C.dim} />
              <BarRow label="Afghanistan border risk" value="Elevated" pct={70} color={C.gld} />
              <BarRow label="Tourism potential (untapped)" value="High" pct={75} color={C.dim} />
              <BarRow label="Mining & mineral opportunity" value="Moderate" pct={55} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The risk-reward balance is stark: extreme governance risk alongside world-class hydropower opportunity. CASA-1000 (selling electricity to Pakistan) is the highest-impact project — it would give Tajikistan hard currency income independent of Russia. The 1,400 km Afghan border adds security risk but also a trade corridor potential if Afghanistan stabilises.</p>
            </Panel>
          </div>
        </div>

        {/* 17. CRIME & SECURITY */}
        <SectionHeader icon={Icons.landmark} label="Crime & Security" />
        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Global Peace Index (2024)" value="~Rank 90" sub="Medium peace; Afghan border a persistent risk factor" accent={C.gld} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Afghanistan border" value="1,357 km" sub="Major narcotics trafficking corridor; military incidents occur" accent={C.red} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Homicide rate (est.)" value="~1.5 / 100K" sub="Low by global standards; state controls information tightly" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Press Freedom (RSF 2024)" value="Rank 162/180" sub="Near-bottom globally; no independent media exists" accent={C.tj} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Drug trafficking" value="High risk" sub="Afghanistan opiate transit route to Russia & Europe" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GBAO unrest (2022)" value="Suppressed" sub="May 2022 protests in Pamir; 25+ killed; internet blackout imposed" accent={C.dim} delay={0.30} /></div>
        </div>
        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Crime & Security Indicators" icon={Icons.landmark}>
              <Tbl rows={[
                ['Homicide rate (est.)', '~1.5 per 100,000 — very low'],
                ['Afghanistan border length', '1,357 km — primary security concern'],
                ['GBAO (Pamir) unrest (2022)', '25+ killed; Rahmon son led crackdown'],
                ['Drug trafficking (Afghanistan route)', 'Major transit country for heroin'],
                ['Political prisoners', 'Hundreds; human rights orgs document extensively'],
                ['Tajik-Kyrgyz border conflict (2021–22)', 'Military clashes; 40+ killed; resolved 2022'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The May 2022 GBAO uprising — the most serious domestic unrest since the civil war — was triggered by the killing of a local activist. Rustam Emomali (the president's son) personally oversaw the military crackdown. Internet was cut for weeks. The Tajik-Kyrgyz border war in 2021–2022 killed 40+ and displaced thousands before a peace deal was signed in 2022.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Security Context" icon={Icons.chart}>
              <BarRow label="Corruption (CPI, 100=clean)" value="~20/100" pct={20} color={C.tj} />
              <BarRow label="Press freedom (100=free, est.)" value="~8/100" pct={8} color={C.red} />
              <BarRow label="Rule of law (WJP, 100=best)" value="~22/100" pct={22} color={C.gld} />
              <BarRow label="Political rights (FH, 100=free)" value="4/100" pct={4} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>With a Freedom House score of 4/100 and RSF press freedom rank of 162/180, Tajikistan is among the world's most repressive states. The regime has survived 31 years through a combination of security force loyalty, elimination of opposition, and the civil war trauma narrative. External pressure is minimal — Russia and China are the dominant external actors, neither prioritising democracy.</p>
            </Panel>
          </div>
        </div>

        <div style={{ padding:'8px 0 0', marginTop:8 }}>
          <p style={{ fontSize:10.5, color:'#555', lineHeight:1.7 }}>
            Sources: State Committee on Statistics TJ · World Bank Economic Update 2025 · IMF · UNDP HDR 2023 · Transparency International CPI 2024 · WHO · RSF Press Freedom 2024 · World Justice Project 2024 · Freedom House 2024 · UNODC · CIA World Factbook 2025 · Data as of May 2026.
          </p>
        </div>

      </div>
    </>
  );
}
