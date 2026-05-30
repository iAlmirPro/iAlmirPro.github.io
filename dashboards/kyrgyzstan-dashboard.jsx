const { useState, useEffect } = React;

// Kyrgyzstan flag colors: red (#E8192C) and yellow (#F0B830)
const C = {
  kg:   '#E8192C', kgL: '#ff3347',   // primary — Kyrgyz red
  yel:  '#F0B830', yelL: '#ffd060',   // secondary — Kyrgyz yellow (tunduk)
  blu:  '#2E86DE', bluL: '#5ba8ff',   // water / cold
  bg:   '#000',   card: '#111',  border: '#1e1e1e',
  track:'#222',   txt:  '#fff',  sub:   '#999',  dim: '#444',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,400&family=Inter:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
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

/* ── Reusable Components ── */
const SectionHeader = ({ icon, label }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28, paddingTop:24 }}>
    <span style={{ color:C.txt, fontSize:16, flexShrink:0 }}>{icon}</span>
    <span style={{ fontSize:13, letterSpacing:'0.18em', textTransform:'uppercase', color:C.txt, fontWeight:500 }}>{label}</span>
  </div>
);

const KpiCard = ({ label, value, sub, accent = C.kg, delay = 0 }) => {
  const valColor = accent === C.kg ? C.kgL : accent === C.yel ? C.yelL : accent === C.blu ? C.bluL : C.txt;
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

const BarRow = ({ label, value, pct, color = C.kg }) => (
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

const DlRow = ({ mo, label, pct, color = C.kg, dark = false }) => (
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
  const darkM = '#1a5fa0';
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

/* ── Donut Chart ── */
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

/* ── Kyrgyzstan Flag — red field, yellow tunduk (yurt crown) symbol ── */
const Flag = () => (
  <div style={{ width:90, height:54, background:C.kg, borderRadius:3, overflow:'hidden',
    boxShadow:`0 4px 24px rgba(232,25,44,.45)`, flexShrink:0, position:'relative',
    display:'flex', alignItems:'center', justifyContent:'center' }}>
    {/* Tunduk — stylised yurt crown: outer circle + 40-ray sun */}
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      {/* outer ring */}
      <circle cx="22" cy="22" r="20" stroke={C.yel} strokeWidth="2.5" fill="none"/>
      {/* 40 rays from centre */}
      {Array.from({length:40}).map((_,i)=>{
        const a = (i/40)*Math.PI*2;
        const x1=22+7*Math.cos(a), y1=22+7*Math.sin(a);
        const x2=22+18*Math.cos(a), y2=22+18*Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.yel} strokeWidth="1.2"/>;
      })}
      {/* inner circle */}
      <circle cx="22" cy="22" r="6" stroke={C.yel} strokeWidth="2" fill="none"/>
    </svg>
  </div>
);

/* ══════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════ */
export default function Kyrgyzstan() {
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

        {/* ── HERO ── */}
        <div style={{ padding:'20px 0 0', display:'grid', gridTemplateColumns:'1fr auto', alignItems:'end', gap:32, marginBottom:8 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:'0.28em', textTransform:'uppercase', color:C.kg, marginBottom:14 }}>Country Dashboard 2025</div>
            <h1 style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:'clamp(44px,9vw,96px)', lineHeight:0.9, letterSpacing:'-0.02em', marginBottom:16 }}>
              Kyrgy<em style={{ fontStyle:'italic', color:C.kg, fontWeight:400 }}>zstan</em>
            </h1>
            <p style={{ fontSize:14, color:C.sub, maxWidth:480, lineHeight:1.7 }}>
              A comprehensive data snapshot — geography, climate, population, economy, employment, education and politics — sourced from NSC KR, World Bank, IMF, CIA World Factbook, and UN.
            </p>
          </div>
          <div style={{ alignSelf:'flex-start', marginTop:6 }}>
            <Flag />
          </div>
        </div>

        {/* ══ 1. GEOGRAPHY ══ */}
        <SectionHeader icon={Icons.mountain} label="Geography & Landscape" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Total Area" value="199,951 km²" sub="Landlocked; slightly smaller than the UK" accent={C.dim} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Mean Elevation" value="2,988 m" sub="One of the highest-elevated countries on Earth" accent={C.yel} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Highest Peak" value="7,439 m" sub="Jengish Chokusu (Victory Peak) — Tian Shan" accent={C.kg} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Lowest Point" value="394 m" sub="Kara-Daryya river valley in the south-west" accent={C.blu} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Borders" value="4 countries" sub="Kazakhstan, China, Tajikistan, Uzbekistan" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Lake Issyk-Kul" value="6,236 km²" sub="World's 2nd largest alpine lake; never freezes" accent={C.dim} delay={0.30} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Glaciers" value="~8,000" sub="Cover ~4% of territory; vital freshwater source" accent={C.dim} delay={0.35} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Mountain coverage" value="~94%" sub="Tian Shan & Pamir-Alay ranges dominate" accent={C.dim} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Arable land" value="6.7%" sub="Limited flat land; agriculture in valleys only" accent={C.dim} delay={0.45} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Major Terrain Zones" icon={Icons.map}>
              <BarRow label="Mountains (Tian Shan & Pamir-Alay)" value="~94%" pct={100} color={C.kg} />
              <BarRow label="Pasture & alpine meadow (jailoo)" value="~40%" pct={40} color={C.yel} />
              <BarRow label="Valleys & plains (Chui, Fergana, Talas)" value="~6%" pct={6} color={C.blu} />
              <BarRow label="Forest cover" value="~5.6%" pct={6} color={C.dim} />
              <BarRow label="Permanent glaciers & snowfields" value="~4%" pct={4} color={C.dim} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>94% mountain cover is among the highest globally — only Tajikistan and Bhutan exceed it. The tiny 6% of flat valley land supports almost all agriculture and 90% of the population.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Water Bodies" icon={Icons.water}>
              <Tbl rows={[
                ['Lake Issyk-Kul (alpine saline lake)', '6,236 km²'],
                ['Lake Song-Kol (high plateau, 3,016 m)', '270 km²'],
                ['Naryn River (main river, feeds Toktogul)', '807 km'],
                ['Toktogul Reservoir (hydro)', '284 km²'],
                ['Kara Darya / Syr Darya source', 'Fergana Valley'],
                ['Number of rivers & streams', '~35,000'],
              ]} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Issyk-Kul at 6,236 km² is the world's 2nd largest alpine lake — a significant asset. With ~35,000 rivers, Kyrgyzstan is one of Central Asia's main freshwater sources, giving it strategic leverage over downstream neighbours.</p>
            </Panel>
          </div>
        </div>

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-3 d-flex"><RegCard name="Bishkek & Chui" type="Capital · northern valley" desc="Capital city (1.1M). Temperate valley at 800 m. Administrative & economic centre. Soviet-era boulevards and modern bazaars." stripe={C.kg} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Issyk-Kul Region" type="Tourism · alpine lake" desc="The 'Pearl of Central Asia'. Warm saline lake, ski resorts, ancient petroglyphs. Year-round destination." stripe={C.yel} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Osh & Fergana Valley" type="South · trade hub" desc="Kyrgyzstan's 2nd city. Ancient Silk Road node. Dense population, multicultural; gateway to southern regions." stripe={C.kg} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Naryn & Tian Shan" type="Highland · remote" desc="Extreme altitude. Nomadic yurt culture. Toktogul hydro dam. Gateway to China via Torugart pass." stripe={C.yel} /></div>
        </div>

        {/* ══ 2. CLIMATE ══ */}
        <SectionHeader icon={Icons.cloudSun} label="Climate: Weather, Daylight & Rainfall" />

        <div className="row g-1 mb-4">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Annual Temp (Bishkek)" value="10.5°C" sub="Continental; warm summers, cold winters" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Record High" value="43°C" sub="Osh / Fergana Valley summer extremes" accent={C.kg} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Record Low" value="−53.6°C" sub="Naryn highland winter; extreme cold spells" accent={C.blu} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Annual Rainfall (Bishkek)" value="~443 mm" sub="Mountains receive 800–1,200 mm; south as low as 250 mm" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Climate type" value="Dsa / BSk" sub="Alpine; semi-arid valleys; continental highland" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Issyk-Kul avg" value="~7°C annual" sub="Thermally moderated by lake; never drops below −7°C lakeside" accent={C.dim} delay={0.30} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Bishkek summer avg" value="26°C" sub="Hot & dry Jun–Aug; dust storms possible" accent={C.yel} delay={0.35} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Winter Dec–Feb" value="−8–2°C" sub="Cold, moderate snow in Bishkek; heavy snow in mountains" accent={C.blu} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Spring Mar–May" value="5–20°C" sub="Wettest season; Tian Shan blooms; melt floods possible" accent={C.kg} delay={0.45} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Daylight Hours — Bishkek (42.9°N)" icon={Icons.sun}>
              {[
                { mo:'Jan', label:'9h 40m', pct:38, color:C.blu },
                { mo:'Feb', label:'10h 52m', pct:46, color:C.blu },
                { mo:'Mar', label:'12h 10m', pct:55 },
                { mo:'Apr', label:'13h 34m', pct:67 },
                { mo:'May', label:'14h 44m', pct:78 },
                { mo:'Jun', label:'15h 22m ★', pct:100, color:C.yel, dark:true },
                { mo:'Jul', label:'15h 02m', pct:95 },
                { mo:'Aug', label:'13h 50m', pct:80 },
                { mo:'Sep', label:'12h 20m', pct:64 },
                { mo:'Oct', label:'10h 50m', pct:50 },
                { mo:'Nov', label:'9h 46m', pct:39, color:C.blu },
                { mo:'Dec', label:'9h 12m ★', pct:30, color:C.blu },
              ].map(r => <DlRow key={r.mo} mo={r.mo} label={r.label} pct={r.pct} color={r.color || C.kg} dark={r.dark} />)}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                ★ Summer solstice <strong style={{ color:C.yelL }}>15h 22m</strong> · Winter solstice <strong style={{ color:C.bluL }}>9h 12m</strong> · At 43°N, similar to southern Spain but altitude dramatically alters climate
              </p>
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>A 6h swing between shortest and longest day is typical for 43°N. Long summer days of 15h support outdoor tourism and agriculture; short winter days of 9h increase heating demand and energy pressure on the already-strained grid.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Rainfall by Region" icon={Icons.rain}>
              <p style={{ fontSize:11, color:C.sub, marginBottom:11, letterSpacing:'0.04em' }}>Annual precipitation by zone</p>
              <BarRow label="Western Tian Shan slopes (Talas)" value="800–1,200 mm" pct={100} color={C.kg} />
              <BarRow label="Bishkek & Chui valley" value="~443 mm" pct={43} color={C.yel} />
              <BarRow label="Issyk-Kul basin" value="~270 mm" pct={27} color={C.blu} />
              <BarRow label="Naryn highland" value="~250 mm" pct={25} color={C.dim} />
              <BarRow label="Osh / southern Fergana" value="~250 mm" pct={22} color={C.dim} />
              <div style={{ height:1, background:C.border, margin:'14px 0' }} />
              <p style={{ fontSize:11, color:C.sub, marginBottom:11, letterSpacing:'0.04em' }}>Bishkek monthly pattern</p>
              <BarRow label="April–May (wettest)" value="55–65 mm" pct={100} color={C.kg} />
              <BarRow label="Jun–Aug (drier)" value="20–30 mm" pct={40} color={C.yel} />
              <BarRow label="Jan–Feb (driest)" value="15–20 mm" pct={25} color={C.blu} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                Snow cover in Bishkek ~30–50 days/year. Mountain passes closed Oct–May. Issyk-Kul never freezes due to salinity and thermal mass.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>443 mm/year in Bishkek is semi-arid — comparable to Madrid. However the mountain zones receiving 800–1,200 mm feed the rivers and glaciers that supply all of Central Asia's water. Climate change is reducing this snowpack.</p>
              <GradientBar title="Monthly avg temperature — Bishkek (°C)" values={[-3,-1,6,13,19,25,27,26,19,11,3,-2]} colorStops={tempColor} unit="°" />
              <GradientBar title="Monthly rainfall — Bishkek (mm)" values={[25,28,55,65,55,25,20,15,20,35,30,28]} colorStops={rainColor} unit="mm" />
            </Panel>
          </div>
        </div>

        {/* ══ 3. POPULATION ══ */}
        <SectionHeader icon={Icons.people} label="Population & Demographics" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Population (2025)" value="7.3M" sub="Growing ~1.8% per year; diaspora ~1M abroad" accent={C.kg} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Urban Population" value="37.5%" sub="Mostly rural; rapid urbanisation around Bishkek" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Median Age" value="27.7 yrs" sub="Very young population; 34% under 15" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Population Density" value="36.5 /km²" sub="Concentrated in valleys; mountains mostly empty" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Life Expectancy" value="72.8 yrs" sub="Women 76.7 · Men 68.8 (2024)" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Fertility Rate" value="3.0" sub="Above replacement; birth rate ~22 per 1,000" accent={C.blu} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Population Growth" icon={Icons.chart}>
              <BarRow label="1991 (independence)" value="4.4M" pct={60} color={C.dim} />
              <BarRow label="2000" value="4.9M" pct={67} color={C.dim} />
              <BarRow label="2010" value="5.6M" pct={77} color={C.blu} />
              <BarRow label="2020" value="6.6M" pct={90} color={C.yel} />
              <BarRow label="2025" value="7.3M" pct={100} color={C.kg} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Population dipped slightly in 1990s due to emigration of ethnic Russians and Germans. Strong natural growth since 2000 driven by high birth rate.</p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Growing from 4.4M to 7.3M since 1991 (+66%) is strong but partly offset by emigration — an estimated 800K–1M Kyrgyz live abroad. Net growth reflects a high birth rate of ~22/1,000, well above the OECD average of ~10/1,000.</p>
              <AgeBar
                title="Population age structure — male ▲ / female ▼ (% of total)"
                male={[6.28,5.91,4.7,3.93,4.0,4.4,4.3,3.38,2.74,2.39,2.17,1.97,1.51,0.9,0.51,0.81]}
                female={[5.96,5.61,4.51,3.79,3.84,4.24,4.28,3.36,2.77,2.55,2.38,2.27,1.84,1.22,0.77,0.92]}
                medianM={26.7}
                medianF={29.5}
              />
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Largest Cities (2025)" icon={Icons.landmark}>
              <BarRow label="Bishkek (capital)" value="1,074,000" pct={100} color={C.kg} />
              <BarRow label="Osh (southern capital)" value="345,000" pct={32} color={C.yel} />
              <BarRow label="Jalal-Abad" value="122,000" pct={11} color={C.blu} />
              <BarRow label="Karakol" value="75,000" pct={7} color={C.dim} />
              <BarRow label="Tokmok" value="60,000" pct={6} color={C.dim} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Bishkek at 1.07M holds ~15% of the total population — a moderate primacy ratio. Osh (345K) is the only other city above 100K. This urban concentration means most infrastructure investment flows to the capital, widening the rural-urban gap.</p>
            </Panel>
          </div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Ethnic Composition (2025)" icon={Icons.people}>
              <Donut
                label="7.3M"
                sublabel="population"
                segments={[
                  { label:'Kyrgyz',           value:'75.9%', pct:75.9, color:C.kg  },
                  { label:'Uzbek',            value:'14.5%', pct:14.5, color:C.yel },
                  { label:'Russian',          value:'5.1%',  pct:5.1,  color:C.blu },
                  { label:'Dungan',           value:'1.1%',  pct:1.1,  color:'#888'},
                  { label:'Other (90+ groups)',value:'3.4%', pct:3.4,  color:C.dim },
                ]}
              />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>A 76% Kyrgyz majority is relatively consolidated for Central Asia. The 14.5% Uzbek minority is concentrated in the south — ethnic tensions led to serious violence in Osh in 2010. Managing this diversity well is a defining governance challenge.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Religion & Language" icon={Icons.landmark}>
              <Tbl rows={[
                ['Islam (predominantly Sunni)', '~90%'],
                ['Christianity (Orthodox)', '~7%'],
                ['Other / none', '~3%'],
                ['State language', 'Kyrgyz'],
                ['Official language (co-official)', 'Russian'],
                ['Script', 'Cyrillic (Kyrgyz & Russian)'],
                ['Recognised ethnic groups', '90+'],
              ]} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>~90% Muslim but historically tolerant and secular compared to regional peers. Russian remains widely used in business and government despite Kyrgyz being the state language. The Latin script transition is slow — most still use Cyrillic.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 4. ECONOMY ══ */}
        <SectionHeader icon={Icons.chart} label="Economy & Finance" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP Nominal (2025)" value="$17.5B" sub="World Bank 2024 actual; fastest growing in Central Asia" accent={C.kg} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP per Capita" value="$2,420" sub="World Bank 2024; lower-middle income" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP Growth (2024)" value="8.6%" sub="Record pace; re-export trade & services boom" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP PPP (2025)" value="~$46B" sub="PPP per capita ~$6,400 (World Bank 2024)" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Inflation CPI (2025)" value="~8%" sub="2025 IMF estimate; above NBKR 5–7% target range" accent={C.blu} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Currency" value="KGS (Som)" sub="~89 KGS = $1 (2025)" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="GDP by Sector & Major Exports" icon={Icons.chart}>
              <Donut
                label="$17.5B"
                sublabel="GDP 2025"
                segments={[
                  { label:'Services (incl. re-export)', value:'52%', pct:52, color:C.kg  },
                  { label:'Industry & mining',          value:'31.2%', pct:31.2, color:C.yel },
                  { label:'Agriculture',                value:'14.6%', pct:14.6, color:C.blu },
                  { label:'Construction & other',       value:'9.7%',  pct:9.7,  color:'#555'},
                ]}
              />
              <div style={{ height:1, background:C.border, margin:'16px 0' }} />
              <BarRow label="Gold (Kumtor & other mines)" value="~30% of exports" pct={100} color={C.kg} />
              <BarRow label="Re-exported goods (China→CIS)" value="~25%" pct={83} color={C.yel} />
              <BarRow label="Agricultural produce" value="~10%" pct={33} color={C.blu} />
              <BarRow label="Textiles & garments" value="~8%" pct={27} color={C.dim} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Services at 52% are heavily driven by re-export trade — Chinese goods resold into Russia and CIS. Gold represents 30% of exports but comes from a single mine (Kumtor, now state-owned). This extreme concentration makes GDP fragile — one mine shutdown or trade disruption can move the needle significantly.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Economic Indicators" icon={Icons.briefcase}>
              <Tbl rows={[
                ['Remittances (% of GDP)', '~24% of GDP (World Bank 2024)'],
                ['Kumtor gold mine (% of GDP)', '~5–8%'],
                ['External debt (2025)', '~$5.2B'],
                ['Poverty rate (national line, 2023)', '~29.8%'],
                ['Foreign reserves (2025)', '~$3.8B'],
                ['Gini coefficient', '29.7 (relatively low)'],
                ['Main trading partners', 'Russia, China, Kazakhstan'],
              ]} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Remittances at ~24% of GDP are extremely high — ranking Kyrgyzstan among the world's top 10 most remittance-dependent economies. A Gini of 29.7 is low (good equality) — comparable to Sweden — but the absolute poverty rate of ~30% shows inequality in consumption, not just income.</p>
            </Panel>
          </div>
        </div>

        <div className="row g-1 mb-3">
          <div className="col-12 col-md-4 d-flex">
            <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:'18px 14px', textAlign:'center', flex:1 }}>
              <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>Bishkek City Centre</div>
              <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:18, color:C.kgL, marginBottom:3 }}>$800/m²</div>
              <div style={{ fontSize:11, color:C.sub }}>Premium apartments; rising demand post-2022 migration wave</div>
            </div>
          </div>
          <div className="col-12 col-md-4 d-flex">
            <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:'18px 14px', textAlign:'center', flex:1 }}>
              <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>Bishkek Suburbs</div>
              <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:18, color:C.kgL, marginBottom:3 }}>$450/m²</div>
              <div style={{ fontSize:11, color:C.sub }}>Rapidly expanding; new micro-districts under construction</div>
            </div>
          </div>
          <div className="col-12 col-md-4 d-flex">
            <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:'18px 14px', textAlign:'center', flex:1 }}>
              <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>Osh & Regions</div>
              <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:18, color:C.kgL, marginBottom:3 }}>$200/m²</div>
              <div style={{ fontSize:11, color:C.sub }}>Southern cities and rural areas significantly lower</div>
            </div>
          </div>
        </div>

        {/* ══ 5. EMPLOYMENT ══ */}
        <SectionHeader icon={Icons.briefcase} label="Employment & Wages" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Monthly Wage (2025)" value="~$265" sub="~23,500 KGS; significant rural-urban gap" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Labour Force" value="~2.9M" sub="~39% of population" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Unemployment" value="~3.5%" sub="ILO modelled estimate (2025); official NSC reports ~2.7%" accent={C.kg} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Informal employment" value="~25–30%" sub="Bazaar trade, agriculture, services" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Min. Wage (2025)" value="2,460 KGS" sub="~$28/month; below living wage" accent={C.blu} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Labour Participation" value="~60%" sub="Women 48% vs men 73%" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Wages by Sector (avg monthly KGS)" icon={Icons.chart}>
              <BarRow label="Financial services & insurance" value="~65,000" pct={100} color={C.kg} />
              <BarRow label="IT & communications" value="~55,000" pct={85} color={C.yel} />
              <BarRow label="Mining & extraction" value="~45,000" pct={69} color={C.blu} />
              <BarRow label="Public administration" value="~28,000" pct={43} color={C.dim} />
              <BarRow label="National average" value="~23,500" pct={36} color={C.dim} />
              <BarRow label="Education" value="~18,000" pct={28} color={C.dim} />
              <BarRow label="Agriculture" value="~12,000" pct={18} color={C.dim} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The 5× gap between finance (65K KGS) and agriculture (12K KGS) is very wide. The national average of ~23,500 KGS (~$265) is among the lowest in the post-Soviet space and is the primary driver of the large emigrant worker population.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Employment by Sector" icon={Icons.briefcase}>
              <Donut
                label="2.9M"
                sublabel="labour force"
                segments={[
                  { label:'Trade & services',          value:'~28%', pct:28, color:C.kg  },
                  { label:'Agriculture & livestock',   value:'~27%', pct:27, color:C.yel },
                  { label:'Public sector & education', value:'~12%', pct:12, color:C.blu },
                  { label:'Construction',              value:'~10%', pct:10, color:C.dim },
                  { label:'Industry & manufacturing',  value:'~9%',  pct:9,  color:'#555'},
                  { label:'Other',                     value:'~14%', pct:14, color:C.dim },
                ]}
              />
              <div style={{ height:1, background:C.border, margin:'16px 0' }} />
              <Tbl rows={[
                ['Migrant workers abroad (est.)', '~800,000–1,000,000'],
                ['Remittances (2024)', '~$4.2B (~24% of GDP)'],
              ]} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>~27% in agriculture is high by middle-income standards — it signals a large subsistence farming sector. The ~1M migrant workers abroad represent ~35% of the domestic labour force, making remittances more economically significant than most formal sectors.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 6. EDUCATION ══ */}
        <SectionHeader icon={Icons.graduation} label="Education & Human Development" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Literacy Rate" value="99.5%" sub="Soviet-era legacy; near-universal literacy" accent={C.kg} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="HDI (2024)" value="0.720" sub="High Human Development — rank 111th globally" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Years Schooling" value="11.0 yrs" sub="Steady improvement since 2000" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Expected Schooling" value="13.5 yrs" sub="Girls and boys near parity at primary level" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Education Spending" value="~5.5% GDP" sub="Above regional average; priority of govt" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Universities" value="~55" sub="American University of Central Asia among top English-medium" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Education Metrics" icon={Icons.graduation}>
              <BarRow label="Primary enrolment rate" value="99.1%" pct={99} color={C.kg} />
              <BarRow label="Secondary completion rate" value="~92%" pct={92} color={C.yel} />
              <BarRow label="Tertiary enrolment" value="~38%" pct={38} color={C.blu} />
              <BarRow label="PISA reading (vs OECD avg)" value="well below" pct={35} color={C.dim} />
              <BarRow label="PISA math (vs OECD avg)" value="well below" pct={32} color={C.dim} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>99% primary enrolment and 92% secondary completion are strong — a Soviet legacy. However tertiary at 38% is below regional peers (Kazakhstan ~55%). PISA scores well below OECD average signal quality issues despite near-universal access.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Education Facts" icon={Icons.landmark}>
              <Tbl rows={[
                ['Languages of instruction', 'Kyrgyz & Russian'],
                ['School year', 'September to May'],
                ['Top study destinations abroad', 'Russia, Turkey, Kazakhstan'],
                ['Student-teacher ratio (primary)', '~21:1'],
                ['American Univ. Central Asia (AUCA)', 'Est. 1993, English-medium'],
                ['STEM push program', '"Digital Kyrgyzstan 2024"'],
              ]} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>A 21:1 student-teacher ratio is manageable but rising. The top study destinations (Russia, Turkey) reflect geopolitical ties. AUCA's English-medium model is increasingly important as English proficiency becomes a job market differentiator.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 7. POLITICAL LANDSCAPE ══ */}
        <SectionHeader icon={Icons.landmark} label="Political Landscape" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="System" value="Presidential" sub="Strong presidency since 2021 constitutional reform" accent={C.kg} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="President" value="S. Japarov" sub="In power since Jan 2021; re-elected 2024" accent={C.yel} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Parliament (Jogorku Kenesh)" value="90 seats" sub="Unicameral; mixed system since 2021" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Next Election" value="2028" sub="Presidential & parliamentary cycle" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ruling Party" value="Ata-Jurt Kyrgyzstan" sub="Nationalist; populist orientation" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Independence" value="Aug 31, 1991" sub="From the Soviet Union; national holiday" accent={C.blu} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="2021 Parliamentary Election Results" icon={Icons.landmark}>
              <BarRow label="Ata-Jurt Kyrgyzstan" value="28 seats / 17.7%" pct={100} color={C.kg} />
              <BarRow label="Ishenim" value="24 seats / 14.8%" pct={86} color={C.yel} />
              <BarRow label="Yntymak" value="14 seats / 12.5%" pct={71} color={C.blu} />
              <BarRow label="SDPK" value="10 seats / 7.1%" pct={36} color={C.dim} />
              <BarRow label="Butun Kyrgyzstan" value="8 seats / 7.2%" pct={29} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Voter turnout ~33.7% — historically low. New constitution approved April 2021 strengthened presidential powers and created a Cabinet-of-Ministers system. RSF press freedom index 2024: rank 82.</p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>33.7% voter turnout is critically low — suggesting deep public disillusionment. No party exceeded 18% of the vote, reflecting fragmented politics. The 2021 constitution shift to a strong presidential system reversed the 2010 parliamentary model adopted after the second revolution.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Political Timeline" icon={Icons.chart}>
              {[
                { yr:'1991', tx:'Kyrgyzstan declares independence from the USSR on Aug 31. Askar Akayev becomes first president.' },
                { yr:'2005', tx:'"Tulip Revolution" ousts Akayev. First of three popular uprisings to topple a sitting president.' },
                { yr:'2010', tx:'Second revolution. Kurmanbek Bakiyev flees. Parliamentary republic adopted; ethnic clashes in Osh kill hundreds.' },
                { yr:'2017', tx:'First peaceful transfer of power as Almazbek Atambayev steps down. Sooronbay Jeenbekov elected.' },
                { yr:'2020', tx:'Third revolution. Jeenbekov ousted after disputed elections. Sadyr Japarov released from prison and rises to power.' },
                { yr:'2021', tx:'Japarov wins presidential election with 79%. New constitution shifts to strong presidential system.' },
              ].map(({ yr, tx }) => (
                <div key={yr} style={{ paddingLeft:16, borderLeft:`1px solid ${C.kg}`, marginBottom:14 }}>
                  <div style={{ fontSize:10, letterSpacing:'0.11em', color:C.yel, textTransform:'uppercase', marginBottom:2 }}>{yr}</div>
                  <div style={{ fontSize:12.5, color:'#888', lineHeight:1.6 }}>{tx}</div>
                </div>
              ))}
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Three revolutions in 15 years is unique globally — no other post-Soviet state has toppled as many governments via popular uprising. Each revolution followed disputed elections, pointing to systemic electoral fraud as the root cause rather than ideology.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 8. TOURISM ══ */}
        <SectionHeader icon={Icons.briefcase} label="Tourism" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Foreign Visitors (2024)" value="3.66M" sub="Official registered tourists 2024 (NSC KR); 8.9M total arrivals incl. same-day" accent={C.kg} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Tourism Revenue (2024)" value="~$1.2B" sub="~8% of GDP; growing sector" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Top draw" value="Issyk-Kul" sub="50%+ of all visitors; year-round resort" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Visa-free countries" value="~60+" sub="Including EU, UK, USA, Japan" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Active tour operators" value="~400+" sub="Ecotourism & trekking specialised" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="2025 target" value="5M visitors" sub="National tourism strategy goal" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Top Visitor Origins (2024)" icon={Icons.people}>
              {[
                { flag:'🇷🇺', country:'Russia',         val:'largest source market',       pct:'~38%' },
                { flag:'🇰🇿', country:'Kazakhstan',     val:'frequent short-stay visitors', pct:'~22%' },
                { flag:'🇨🇳', country:'China',          val:'growing rapidly',              pct:'~12%' },
                { flag:'🇩🇪', country:'Germany',        val:'trekking & adventure travel',  pct:'~5%'  },
                { flag:'🇺🇸', country:'USA',            val:'high-spend, long-stay',        pct:'~4%'  },
                { flag:'🇬🇧', country:'United Kingdom', val:'Silk Road & eco tourism',      pct:'~3%'  },
              ].map(({ flag, country, val, pct }) => (
                <div key={country} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0' }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{flag}</span>
                  <span style={{ fontSize:12.5, color:C.txt, flexShrink:0 }}>{country}</span>
                  <span style={{ fontSize:11, color:C.sub, flex:1 }}>{val}</span>
                  <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.txt, flexShrink:0 }}>{pct}</span>
                </div>
              ))}
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Russia (38%) and Kazakhstan (22%) together represent 60% of visitors — a high concentration risk. Western visitors spend more per trip but remain a small share. Diversifying toward Europe and East Asia is the key strategic goal for sustainable tourism growth.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Tourism Highlights" icon={Icons.landmark}>
              <Tbl rows={[
                ['Issyk-Kul resort zone', 'UNESCO Biosphere Reserve'],
                ['Song-Kol plateau (jailoo nomadism)', '3,016 m altitude'],
                ['World Nomad Games (biennial)', 'Bishkek / Issyk-Kul'],
                ['Tash Rabat caravanserai (15th c.)', 'UNESCO candidate'],
                ['Ski resort — Karakol', 'Expanding; FIS ranked'],
                ['CBT (community-based tourism)', 'Present in 100+ villages'],
                ['Tourism strategy 2030 investment', '>$500M target'],
              ]} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Issyk-Kul as a UNESCO Biosphere Reserve and the World Nomad Games are globally unique assets. CBT presence in 100+ villages shows strong community tourism infrastructure — rare for the region. The $500M 2030 investment target is ambitious but achievable given the growth trajectory.</p>
              <GradientBar title="Tourism intensity by month (relative)" values={[15,18,25,35,55,70,100,95,60,35,20,12]} colorStops={p => { const r=Math.round(255-(23*p/100)); const g=Math.round(255-(230*p/100)); const b=Math.round(255-(211*p/100)); return `rgb(${r},${g},${b})`; }} unit="%" />
            </Panel>
          </div>
        </div>

        {/* ══ 9. VITAL STATISTICS ══ */}
        <SectionHeader icon={Icons.people} label="Vital Statistics" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Births (2024 est.)" value="~160,000" sub="Birth rate ~22 per 1,000 population" accent={C.kg} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Natural Increase" value="~113,000" sub="Strong net growth per year" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ages 0–14" value="~34%" sub="Large youth cohort driving future growth" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ages 65+" value="~5.2%" sub="Very young age structure overall" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Deaths (2024 est.)" value="~47,000" sub="Death rate ~6.5 per 1,000 population" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Infant Mortality" value="14.8 / 1,000" sub="Per 1,000 live births; declining but above EU avg" accent={C.blu} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Causes of Death (2024)" icon={Icons.chart}>
              <BarRow label="Circulatory diseases"     value="~51%" pct={100} color={C.kg}  />
              <BarRow label="Neoplasms (cancer)"        value="~10%" pct={20}  color={C.yel} />
              <BarRow label="Respiratory diseases"      value="~9%"  pct={18}  color={C.blu} />
              <BarRow label="Digestive diseases"        value="~8%"  pct={16}  color={C.dim} />
              <BarRow label="Accidents & injuries"      value="~7%"  pct={14}  color={C.dim} />
              <BarRow label="Infectious & parasitic"    value="~4%"  pct={8}   color={C.dim} />
              <BarRow label="Other"                     value="~11%" pct={22}  color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Cardiovascular disease is the leading cause of death. Tuberculosis (TB) remains a significant public health concern. Maternal mortality improved but still above Central Asian peers.</p>
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Circulatory disease at ~51% is very high — the global average is ~32%. This reflects limited preventive care, high-salt diets, and physical inactivity. Cancer at ~10% is below the global ~19%, partly due to the young population. TB at 59.9/100K is 6× the WHO elimination target of &lt;10/100K.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Marriage & Vital Trends" icon={Icons.landmark}>
              <Tbl rows={[
                ['Marriage rate (per 1,000)', '~9.0'],
                ['Divorce rate (per 1,000)', '~1.8'],
                ['Avg age at first marriage (women)', '~23 yrs'],
                ['Avg age at first marriage (men)', '~25 yrs'],
                ['Maternal mortality ratio (2024)', '~43 per 100,000'],
                ['Child stunting rate (2024)', '~9.3%'],
              ]} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>A marriage rate of 9.0/1,000 is high (global avg ~5.5) — reflecting a young, tradition-oriented society. Divorce at 1.8/1,000 is low (global avg ~2.5). Maternal mortality of ~43/100,000 is improving but still 4× higher than in Central European peers. Child stunting at 9.3% signals chronic undernutrition in rural areas.</p>
            </Panel>
          </div>
        </div>


        {/* ══ 10. ECONOMIC DEPTH ══ */}
        <SectionHeader icon={Icons.chart} label="Economic Depth & Fiscal Position" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Foreign Reserves (Oct 2024)" value="$4.8B" sub="Record high since 2010; covers 4.7 months of imports (EBRD)" accent={C.kg} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Govt Budget (2025)" value="+2.2% surplus" sub="First surplus in recent history; strong tax revenue growth" accent={C.yel} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Eurobond (May 2025)" value="$700M" sub="Debut issue; 5-yr, 7.75% coupon; demand 3× oversubscribed" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Credit Rating (Moody's)" value="B3 / Positive" sub="Outlook upgraded to Positive Oct 2025 — first-ever positive outlook" accent={C.blu} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Govt Debt / GDP (2024)" value="25.9%" sub="Record low; down from 64% in 2020 (Trading Economics / Ministry of Economy)" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="FDI (2024)" value="$873M" sub="Up YoY; hindered by asset nationalisations & weak property rights" accent={C.dim} delay={0.30} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="External Debt (2025)" value="$12.8B" sub="~73% of GDP; mostly concessional from China, World Bank, ADB" accent={C.dim} delay={0.35} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Trade Balance (2024)" value="−$6.2B" sub="Chronic deficit; exports $3.2B vs imports $9.4B" accent={C.dim} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Current Account (2024)" value="−25.2% GDP" sub="IMF 2025 Art. IV; adjusted for unrecorded re-exports ~−8% GDP" accent={C.dim} delay={0.45} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Top Export Destinations (2024)" icon={Icons.briefcase}>
              {[
                { flag:'🇨🇳', country:'China',       val:'largest trading partner',          pct:'~30%' },
                { flag:'🇰🇿', country:'Kazakhstan',  val:'re-export transit corridor',        pct:'~18%' },
                { flag:'🇷🇺', country:'Russia',       val:'gold & goods exports',             pct:'~15%' },
                { flag:'🇺🇿', country:'Uzbekistan',  val:'growing bilateral trade',           pct:'~10%' },
                { flag:'🇨🇭', country:'Switzerland', val:'refined gold (Kumtor)',             pct:'~8%'  },
                { flag:'🇬🇧', country:'UK & EU',     val:'textiles & garments',              pct:'~7%'  },
              ].map(({ flag, country, val, pct }) => (
                <div key={country} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0'}}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{flag}</span>
                  <span style={{ fontSize:12.5, color:C.txt, flexShrink:0 }}>{country}</span>
                  <span style={{ fontSize:11, color:C.sub, flex:1 }}>{val}</span>
                  <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.txt, flexShrink:0 }}>{pct}</span>
                </div>
              ))}
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>China at 30% creates a high single-partner dependency. The re-export model is lucrative but fragile — Western sanctions on Russia have already disrupted some corridors. Switzerland at ~8% reflects gold refining: Kumtor's gold is processed there, not domestically.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Fiscal Indicators" icon={Icons.chart}>
              <Tbl rows={[
                ['Govt debt / GDP (2024)', '25.9% — record low'],
                ['Govt debt / GDP (2020 peak)', '~64%'],
                ['Budget surplus (2025)', '+2.2% of GDP'],
                ['Tax revenue growth (Jan–Aug 2024)', '+18% YoY'],
                ['Debt servicing costs', 'Low — mostly concessional'],
                ['Eurobond coupon rate (2025)', '7.75% / 5-year maturity'],
                ['GDP growth Jan–Jul 2025', '+11.5% real (Ministry of Finance)'],
              ]} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>25.9% debt/GDP is genuinely low — below the IMF's 40% warning threshold and down from a dangerous 64% in 2020. The +2.2% budget surplus is the first in recent history. A 7.75% Eurobond coupon is elevated (reflecting B3 rating risk) but the 3× oversubscription shows investor confidence is building.</p>
              <GradientBar title="Trade balance 2015–2024 ($B)" values={[-2.0, -1.8, -2.1, -2.3, -2.6, -1.6, -2.7, -5.0, -8.7, -6.2]} xLabels={['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']} colorStops={(p, v) => v >= 0 ? `rgb(${Math.round(255-220*p/100)},${Math.round(255-96*p/100)},${Math.round(255-191*p/100)})` : `rgb(${Math.round(255-23*p/100)},${Math.round(255-230*p/100)},${Math.round(255-211*p/100)})`} fmt={v => v > 0 ? `+${v}B` : `${v}B`} absScale={true} />
            </Panel>
          </div>
        </div>

        {/* ══ 11. ENERGY & RESOURCES ══ */}
        <SectionHeader icon={Icons.mountain} label="Energy & Resources" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Total Power Generation (2024)" value="14.7 TWh" sub="Of which 12.93 TWh hydro + 1.76 TWh coal (Times of Central Asia)" accent={C.blu} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Installed Hydro Capacity" value="3.26 GW" sub="7 large HPPs on Naryn River + 12 smaller plants (Climatescope 2024)" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Hydro potential (untapped)" value="~90%" sub="Potential 142 TWh/yr; producing ~10% — one of world's highest untapped resources" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Clean energy investment (2024)" value="~$300M" sub="Climatescope 2024; focused on hydro expansion" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Electricity Consumption (2024)" value="18.3 TWh" sub="Demand exceeds generation — 3.63 TWh imported in 2024" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Energy deficit declared" value="2023–2026" sub="State of emergency in energy sector Aug 2023 – Dec 2026 (government decree)" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Electricity Generation Mix (2024)" icon={Icons.chart}>
              <Donut
                label="14.7 TWh"
                sublabel="generated 2024"
                segments={[
                  { label:'Hydropower (large HPPs)',       value:'87%', pct:87, color:C.blu },
                  { label:'Coal thermal plants',           value:'12%', pct:12, color:C.kg },
                  { label:'Small hydro & solar',           value:'1%',  pct:1,  color:C.yel },
                ]}
              />
              <p style={{ fontSize:11, color:C.sub, marginTop:12, lineHeight:1.6 }}>
                Kyrgyzstan imports 3.63 TWh/year from Kazakhstan & Uzbekistan to cover its deficit. Kambarata-2 HPP (2nd unit, 120 MW) under construction. Planned Kambarata-1 (1.9 GW) would transform the energy balance.
              </p>
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>87% hydro is one of the cleanest grids in the world — comparable to Norway. But it creates drought vulnerability: the 2021–2023 water shortages triggered the state of energy emergency. The deficit of 3.63 TWh/year must be imported, undermining energy sovereignty.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Energy & Resources Facts" icon={Icons.landmark}>
              <Tbl rows={[
                ['Electricity avg price (2024)', '~$32/MWh (Climatescope)'],
                ['Transmission losses (2020)', '~18% (down from 28% in 2010)'],
                ['Coal deposits', '~70 deposits; production ~2.4Mt/yr'],
                ['Gold production (Kumtor)', '~15–17 tonnes/yr; ~35% of exports'],
                ['Silver reserves', 'Significant; growing export share'],
                ['Oil & gas', 'Minor domestic production; mostly imported'],
                ['China–KG–Uzbekistan railway', 'Under construction; transforms logistics'],
              ]} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>$32/MWh is very cheap electricity — among the lowest in the region. 18% transmission losses are improving but still high (world best practice is ~5%). Gold's 35% export share is a critical single-commodity risk. The China-KG-Uzbekistan railway, when complete, will be the most transformative infrastructure project since independence.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 12. INFRASTRUCTURE & DIGITAL ══ */}
        <SectionHeader icon={Icons.map} label="Infrastructure & Digital Connectivity" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Internet Penetration" value="~79.8%" sub="ITU 2022; mobile broadband 92.1%; 4G covers 98.8% of localities" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Mobile Subscribers" value="~7M" sub="Near 100% penetration; dominated by MegaCom (37%) & Beeline (36%)" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Road Network" value="~34,000 km" sub="~18,000 km paved; 2,000 km newly asphalted 2021–2024" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Railway (narrow gauge)" value="~424 km" sub="Limited Soviet-era network; CKU railway will add ~270 km" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Fixed Broadband" value="6.5%" sub="Very low; fiber expanding in Bishkek; rural gap significant" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="5G status" value="Delayed" sub="Launch planned but not yet deployed as of 2025" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Key Infrastructure Projects" icon={Icons.map}>
              <Tbl rows={[
                ['China–Kyrgyzstan–Uzbekistan railway', '~270 km; under construction 2024+'],
                ['Kambarata-1 HPP (planned)', '1.9 GW; transformational project'],
                ['Bishkek–Osh highway (Phase 4)', 'Ongoing; main north-south artery'],
                ['North–South alt. highway (Phase 3)', 'Kochkor–Epkin section under way'],
                ['World Bank Air Quality project', '$50M approved Nov 2023 for Bishkek'],
                ['Digital Kyrgyzstan 2024–2028 roadmap', 'Rural broadband & e-gov focus'],
              ]} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The CKU railway is the most significant project — it connects China to Uzbekistan through Kyrgyzstan, making the country a transit hub rather than a geographic dead end. Kambarata-1 would double generation capacity. Both projects together could structurally transform the economy within a decade.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Digital Indicators" icon={Icons.chart}>
              <BarRow label="Internet penetration (ITU 2022)" value="79.8%" pct={80} color={C.kg} />
              <BarRow label="Mobile broadband penetration" value="92.1%" pct={92} color={C.yel} />
              <BarRow label="4G locality coverage" value="98.8%" pct={99} color={C.blu} />
              <BarRow label="Fixed broadband penetration" value="6.5%" pct={7} color={C.dim} />
              <BarRow label="Instagram users (% of population)" value="~43%" pct={43} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                Mobile internet speed: 25–37 Mbps median (Ookla 2024). TikTok blocked since April 2024 by GKNB order. "Digital Kyrgyzstan" programme active since 2019.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>79.8% internet penetration is good for the income level — above Central Asian peers. 4G at 98.8% locality coverage is impressive. Fixed broadband at 6.5% is very low — most users rely entirely on mobile, making network quality critical. TikTok's block signals growing government control of digital space.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 13. HEALTH SYSTEM ══ */}
        <SectionHeader icon={Icons.people} label="Health System" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Health Spending (% GDP)" value="~4.5%" sub="2019 figure (WHO); public share ~51%; OOP 40.7% of health spend" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Out-of-pocket health spending" value="40.7%" sub="Share of total health spending 2021 (WHO Observatory 2024); leads to catastrophic costs" accent={C.kg} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Health Spend per Capita" value="Lowest in WHO Europe" sub="Per-capita public PHC spending lowest in WHO European Region (WHO 2023)" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="TB incidence (2023)" value="59.9 / 100K" sub="4,183 new cases; down from 68.7/100K in 2021 (UN Kyrgyzstan)" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="TB mortality (2023)" value="2.6 / 100K" sub="182 deaths; declining trend (National Centre for Phthisiology)" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Air quality — Bishkek" value="PM2.5: ~35 µg/m³" sub="7× WHO guideline in winter; among most polluted cities — WB $50M project" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Health System Facts" icon={Icons.people}>
              <Tbl rows={[
                ['Mandatory health insurance coverage', '~70% of population'],
                ['State-guaranteed medicines list', '~70 medicines at 50% subsidy'],
                ['Hospital bed closures since 1997', 'Extensive reductions ongoing'],
                ['Doctor & nurse numbers', 'Low and falling; ageing workforce'],
                ['Health strategy current', 'Healthy Person – Prosperous Country 2019–2030'],
                ['COVID excess mortality', 'Lower than most European countries'],
                ['HIV/AIDS — access to treatment', 'Ongoing concern (WHO 2024)'],
              ]} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Having the lowest per-capita public health spending in the WHO European Region is alarming — it means the system is critically underfunded. ~70% insurance coverage sounds reasonable but the 40.7% OOP share shows coverage is shallow. Hospital bed reductions since 1997 have not been offset by primary care investment.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Disease & Health Burden" icon={Icons.chart}>
              <BarRow label="TB incidence per 100,000 (2023)" value="59.9" pct={100} color={C.kg} />
              <BarRow label="Hypertension prevalence (est.)" value="~35%" pct={58} color={C.yel} />
              <BarRow label="Bishkek PM2.5 (WHO guideline = 5)" value="~35 µg/m³" pct={85} color={C.blu} />
              <BarRow label="OOP share of health spending" value="40.7%" pct={68} color={C.dim} />
              <BarRow label="Rural health access gap" value="Significant" pct={50} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                NCDs (cardiovascular, diabetes, respiratory) are the main cause of mortality and morbidity. Air pollution in Bishkek peaks in winter due to coal heating — daily PM2.5 regularly exceeds 200 µg/m³.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>TB at 59.9/100K is the headline concern — 6× the WHO elimination target of &lt;10. PM2.5 of ~35 µg/m³ annual mean (peaking at 200+ in winter) causes an estimated 1,200–1,500 premature deaths per year in Bishkek alone. Hypertension at ~35% prevalence is very high and undertreated.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 14. SOCIAL & INEQUALITY ══ */}
        <SectionHeader icon={Icons.people} label="Social Indicators & Inequality" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Poverty rate (national line)" value="~29.8%" sub="2023 national line (verified); World Bank $3.65/day: ~18%" accent={C.kg} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gini Coefficient (2020)" value="29.7" sub="World Bank national consumption Gini; moderate inequality" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Rural vs urban income gap" value="Significant" sub="Rural poverty ~2× higher than urban; 62% of population is rural" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gender Inequality Index" value="0.370 (rank 87)" sub="UNDP 2021; 87th out of 191 countries" accent={C.yel} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Women in parliament" value="16.5%" sub="2020 figure; below regional average" accent={C.blu} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Global Gender Gap Index" value="0.700 (rank 86)" sub="WEF 2022; 86th out of 146" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Social Cohesion & Gender" icon={Icons.people}>
              <Tbl rows={[
                ['Gini coefficient (World Bank, 2020)', '29.7 (moderate)'],
                ['Gender Inequality Index (UNDP 2021)', '0.370 — rank 87/191'],
                ['Women in labour force (2022)', '~57% (Wikipedia/ILO)'],
                ['Women in parliament (2020)', '16.5%'],
                ['Bride kidnapping (ala kachuu)', 'Still practiced in rural areas'],
                ['Contraceptive prevalence rate', '~36% (est.)'],
                ['Social mobility index', 'Limited data; constrained by poverty'],
              ]} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>A Gini of 29.7 (moderate/good) contrasts sharply with 30% poverty — this apparent contradiction is explained by relatively equal distribution of a very low income base. Women's 57% labour force participation is higher than reported in many Muslim-majority countries but the gender pay gap remains large. Bride kidnapping (ala kachuu) is illegal but still practiced — a significant human rights concern.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Access & Basic Services" icon={Icons.chart}>
              <BarRow label="Access to clean water (urban)" value=">95%" pct={95} color={C.kg} />
              <BarRow label="Access to clean water (rural)" value="~75%" pct={75} color={C.yel} />
              <BarRow label="Access to sanitation (urban)" value="~90%" pct={90} color={C.dim} />
              <BarRow label="Access to sanitation (rural)" value="~55%" pct={55} color={C.dim} />
              <BarRow label="Electricity access (national)" value="~99%" pct={99} color={C.blu} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                Urban-rural disparities are among the most pronounced in Central Asia. Climate change threatens water access as glaciers (covering 4% of territory) recede.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The 20-percentage-point gap between urban (95%) and rural (75%) clean water access reflects severe underinvestment in rural infrastructure. Electricity at ~99% is a genuine achievement. Sanitation gaps in rural areas (~55%) are linked to high rates of diarrheal disease and child stunting.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 15. ENVIRONMENT ══ */}
        <SectionHeader icon={Icons.water} label="Environment & Climate" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="CO₂ per capita (2022)" value="1.48 t" sub="Well below world average of ~4.7t; low-carbon hydro economy (Worldometer)" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Hydropower potential" value="142 TWh/yr" sub="Only ~10% utilised; one of highest untapped potentials per capita globally" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Total CO₂ (2022)" value="10.3 Mt" sub="+1.4% YoY; energy sector ~60–70% of emissions (Worldometer / IQAir)" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Glacier area loss" value="~20%" sub="Glaciers shrank ~20% in recent decades; risk of disappearing by 2100 (IQAir)" accent={C.blu} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Water stress" value="High in south" sub="Fergana Valley faces irrigation pressure; glacier melt threatens long-term supply" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Bishkek PM2.5 (annual mean)" value="~35 µg/m³" sub="7× WHO guideline of 5 µg/m³; winter peaks >200 µg/m³ (World Bank 2023)" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Environmental Facts" icon={Icons.water}>
              <Tbl rows={[
                ['CO₂ per capita vs world avg', '1.48t vs ~4.7t — very low'],
                ['Energy sector share of GHG', '~60–70% of national emissions'],
                ['Protected area (% of territory)', '~8%'],
                ['Glacier count', '~8,000 glaciers covering ~4% of land'],
                ['Annual glacier retreat (est.)', 'Accelerating; contributing to water risk'],
                ['Climate vulnerability index', 'High — mountain country, weather-dependent hydro'],
              ]} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>CO₂ at 1.48t/capita is exceptionally low — 3× below the world average and comparable to sub-Saharan Africa, but for entirely positive reasons (hydro dominance). The 20% glacier loss is the most serious long-term threat — glaciers feed the rivers that irrigate all of Central Asia's farmland.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Air Quality & Pollution Sources" icon={Icons.chart}>
              <BarRow label="Residential coal heating (Bishkek)" value="Largest source" pct={100} color={C.kg} />
              <BarRow label="Vehicle emissions" value="Major contributor" pct={65} color={C.yel} />
              <BarRow label="Thermal power plants" value="Significant" pct={55} color={C.blu} />
              <BarRow label="Construction & industry dust" value="Moderate" pct={35} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                World Bank $50M Air Quality Improvement Project approved Nov 2023 targeting PM2.5 reduction and green heating transition. Bishkek consistently ranks among Central Asia's most polluted cities in winter.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Coal heating is the single largest source of Bishkek's winter air pollution crisis. The World Bank $50M project targets transition to cleaner heating systems. Without intervention, winter PM2.5 will worsen as the city grows. Vehicle fleet age (~15 years average) is a secondary but growing contributor.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 16. BUSINESS & INVESTMENT CLIMATE ══ */}
        <SectionHeader icon={Icons.briefcase} label="Business & Investment Climate" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Corporate tax rate" value="10%" sub="One of the lowest in Central Asia; 0% for IT Park residents" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="FDI inflow (2024)" value="$873M" sub="KnowYourCountry 2024; growing but constrained by nationalisation risks" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ease of Doing Business" value="Rank 80 / 190" sub="World Bank 2019 (last published); improved from 70 in 2018" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="VAT rate" value="12%" sub="Standard rate; reduced for some sectors" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Corruption Index (CPI 2024)" value="25 / 100" sub="Transparency International 2024; rank ~142/180 — declined from 26 in 2023" accent={C.kg} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Rule of Law index" value="Rank 101/142" sub="World Justice Project 2024; fundamental rights declining" accent={C.blu} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Investment Climate Summary" icon={Icons.briefcase}>
              <Tbl rows={[
                ["Moody's credit rating (Oct 2025)", "B3 / Positive outlook — first ever"],
                ['CPI score (2024)', '25/100 — rank ~142/180'],
                ['World Justice Project (2024)', 'Rank 101/142'],
                ['Kumtor gold mine (nationalised)', '2021; ~35% of exports affected'],
                ['IT Park Kyrgyzstan (est. 2018)', '0% income tax; 5% social contributions'],
                ['WTO member since', '1998 — earliest in Central Asia'],
                ['EAEU member since', '2015 — customs union with Russia, Kazakhstan'],
              ]} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>A CPI score of 25/100 means corruption is pervasive — bribes are expected in public services, courts, and licensing. The B3/Positive Moody's rating is the floor of investable territory. WTO membership since 1998 (earliest in Central Asia) is an underused asset. IT Park's 0% tax regime has attracted ~500 tech companies — a bright spot in an otherwise difficult business environment.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Risks & Opportunities" icon={Icons.chart}>
              <BarRow label="Corruption risk (CPI rank ~142)" value="Very high" pct={85} color={C.kg} />
              <BarRow label="Political stability risk" value="High (3 revolutions since 2005)" pct={75} color={C.yel} />
              <BarRow label="Re-export trade opportunity" value="Significant" pct={80} color={C.dim} />
              <BarRow label="Hydropower export potential" value="Very high" pct={90} color={C.dim} />
              <BarRow label="Tourism growth potential" value="High" pct={70} color={C.blu} />
              <BarRow label="IT & textile sector growth" value="Growing" pct={55} color={C.dim} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The risk-opportunity balance is striking: extreme corruption and political instability sit alongside extraordinary hydropower and re-export potential. Investors who can manage the governance risk find very low costs and strategic access to both Chinese goods and Russian/CIS markets.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 17. CRIME & SECURITY ══ */}
        <SectionHeader icon={Icons.landmark} label="Crime & Security" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Terrorism Index" value="0.00" sub="No terrorism incidents recorded in recent years (Trading Economics / GPI)" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Global Peace Index" value="~Rank 95" sub="Institute for Economics & Peace 2024; classified as medium peace" accent={C.blu} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Homicide rate (est. ~2022)" value="~4.5 / 100K" sub="Knoema / UNODC; declined from 5.2/100K in 2015 — moderate by global standards" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Press Freedom (RSF 2024)" value="Rank 82 / 180" sub="Declining; journalists detained; TikTok blocked 2024" accent={C.kg} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Suicide rate (est.)" value="~9–10 / 100K" sub="WHO / World Bank data; elevated in rural areas; mental health services limited" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="TB incidence (proxy health-crime)" value="59.9 / 100K" sub="High TB rate reflects incarceration conditions & social deprivation" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Crime & Security Indicators" icon={Icons.landmark}>
              <Tbl rows={[
                ['Homicide rate (~2022)', '~4.5 per 100,000 (Knoema)'],
                ['Global Peace Index 2024', '~Rank 95 / 163'],
                ['Terrorism Index (Trading Econ.)', '0.00 — no incidents'],
                ['Rule of Law (WJP 2024)', 'Rank 101/142 — declining'],
                ["Political stability (Moody's)", "Unstable domestic situation — noted by Moody's"],
                ['Drug trafficking route', 'Afghanistan–Central Asia corridor risk'],
              ]} />
            
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Homicide at ~4.5/100K is moderate — below Russia (~5.5) but above Western Europe (~1). The terrorism index of 0.00 is a genuine positive — no domestic terrorism in recent years. Drug trafficking risk is real: Kyrgyzstan sits on the Afghanistan-Russia heroin corridor. Political stability is the greatest security risk — three governments have been overthrown since 2005.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Security Context" icon={Icons.chart}>
              <BarRow label="Corruption (CPI, 100=clean)" value="25 / 100" pct={25} color={C.kg} />
              <BarRow label="Press freedom (100=free, est.)" value="~45 / 100" pct={45} color={C.yel} />
              <BarRow label="Rule of law (WJP, 100=best)" value="~38 / 100" pct={38} color={C.blu} />
              <BarRow label="Global Peace Index score (est.)" value="~1.8 / 5" pct={64} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                Kyrgyzstan has experienced 3 revolutions (2005, 2010, 2020) and significant ethnic unrest (Osh 2010). Despite political volatility, daily crime rates remain moderate. Bribery is pervasive across all sectors. Drug trafficking via the Afghanistan corridor is a regional security concern.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>CPI of 25/100 places Kyrgyzstan in the bottom third globally for corruption. Press freedom at rank 82 is the best in Central Asia (Kazakhstan 151, Uzbekistan 158, Tajikistan 162) — a relative but not absolute positive. Rule of law at rank 101 reflects selective justice and weak judicial independence.</p>
            </Panel>
          </div>
        </div>

        <div style={{ padding:'8px 0 0', marginTop:8 }}>
          <p style={{ fontSize:10.5, color:'#555', lineHeight:1.7 }}>
            Sources: NSC KR · World Bank · IMF 2025 Art. IV · EBRD Transition Report 2024 · Moody's · Transparency International CPI 2024 · IQAir · WHO/Euro Observatory 2024 · Climatescope 2024 · Times of Central Asia · Trading Economics · Freedom House · World Justice Project 2024 · UNODC · Worldometer · Data as of May 2026.
          </p>
        </div>

      </div>
    </>
  );
}
