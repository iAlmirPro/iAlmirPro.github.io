const { useState, useEffect } = React;

// Kazakhstan flag colors: light blue (#00AFCA) and yellow (#FFC72C)
const C = {
  kaz:  '#00AFCA', kazL: '#33c8df',   // primary — Kazakh blue
  yel:  '#FFC72C', yelL: '#ffd966',   // secondary — Kazakh yellow (sun & steppe eagle)
  blu:  '#2E86DE', bluL: '#5ba8ff',   // water / depth / cold
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

/* ── Reusable Components ── */
const SectionHeader = ({ icon, label }) => (
  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28, paddingTop:24 }}>
    <span style={{ color:C.txt, fontSize:16, flexShrink:0 }}>{icon}</span>
    <span style={{ fontSize:13, letterSpacing:'0.18em', textTransform:'uppercase', color:C.txt, fontWeight:500 }}>{label}</span>
  </div>
);

const KpiCard = ({ label, value, sub, accent = C.kaz, delay = 0 }) => {
  const valColor = accent === C.kaz ? C.kazL : accent === C.yel ? C.yelL : accent === C.blu ? C.bluL : C.txt;
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

const BarRow = ({ label, value, pct, color = C.kaz }) => (
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

const DlRow = ({ mo, label, pct, color = C.kaz, dark = false }) => (
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
  const darkM = '#006d7e';
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

/* ── Kazakhstan Flag — light blue field with yellow sun (32 rays) and steppe eagle ── */
const Flag = () => (
  <div style={{ width:90, height:54, background:C.kaz, borderRadius:3, overflow:'hidden',
    boxShadow:`0 4px 24px rgba(0,175,202,.45)`, flexShrink:0, position:'relative',
    display:'flex', alignItems:'center', justifyContent:'center' }}>
    <svg width="80" height="44" viewBox="0 0 80 44" fill="none">
      {/* Sun — 32 rays */}
      {Array.from({length:32}).map((_,i) => {
        const a = (i/32)*Math.PI*2;
        const inner = i % 2 === 0 ? 7 : 8.5;
        const outer = i % 2 === 0 ? 13 : 11;
        const x1=20+inner*Math.cos(a), y1=22+inner*Math.sin(a);
        const x2=20+outer*Math.cos(a), y2=22+outer*Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.yel} strokeWidth="1.4"/>;
      })}
      <circle cx="20" cy="22" r="5.5" fill={C.yel}/>
      {/* Steppe eagle (simplified) */}
      <path d="M38 20 C42 14 52 12 60 16 C54 18 50 18 48 20 C52 20 58 18 64 20 C60 22 54 22 50 22 C54 24 60 22 64 24 C58 26 52 24 48 24 C50 26 54 26 58 28 C52 28 44 26 40 24 C38 28 36 30 34 30 C36 28 36 26 38 24 C34 24 30 26 28 26 C30 24 34 22 38 22 C36 22 34 22 32 24 C32 22 34 18 38 20Z" fill={C.yel} opacity="0.9"/>
    </svg>
  </div>
);

/* ══════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════ */
export default function Kazakhstan() {
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
            <div style={{ fontSize:10, letterSpacing:'0.28em', textTransform:'uppercase', color:C.kaz, marginBottom:14 }}>Country Dashboard 2025</div>
            <h1 style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:'clamp(44px,9vw,96px)', lineHeight:0.9, letterSpacing:'-0.02em', marginBottom:16 }}>
              Kazakh<em style={{ fontStyle:'italic', color:C.kaz, fontWeight:400 }}>stan</em>
            </h1>
            <p style={{ fontSize:14, color:C.sub, maxWidth:480, lineHeight:1.7 }}>
              A comprehensive data snapshot — geography, climate, population, economy, employment, education and politics — sourced from Bureau of National Statistics KZ, World Bank, IMF, and UN agencies.
            </p>
          </div>
          <div style={{ alignSelf:'flex-start', marginTop:6 }}>
            <Flag />
          </div>
        </div>

        {/* ══ 1. GEOGRAPHY ══ */}
        <SectionHeader icon={Icons.mountain} label="Geography & Landscape" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Total Area" value="2,724,900 km²" sub="9th largest country on Earth; larger than Western Europe" accent={C.dim} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Highest Peak" value="7,010 m" sub="Khan Tengri — Tian Shan; most northerly 7,000m peak" accent={C.kaz} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Lowest Point" value="−132 m" sub="Karagiye Depression — Caspian lowlands" accent={C.blu} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Borders" value="5 countries" sub="Russia, China, Kyrgyzstan, Uzbekistan, Turkmenistan" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Caspian Sea coastline" value="1,894 km" sub="World's largest landlocked sea; shared with Russia, Iran, Azerbaijan, Turkmenistan" accent={C.yel} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Lake Balkhash" value="16,996 km²" sub="Unique: western half fresh water, eastern half saline" accent={C.dim} delay={0.30} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Steppe coverage" value="~44%" sub="World's largest continuous steppe ecosystem" accent={C.dim} delay={0.35} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Desert & semi-desert" value="~33%" sub="Kyzylkum, Betpak-Dala, Aral Sea basin" accent={C.dim} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Arable land" value="~8.9%" sub="Mainly northern wheat belt; grain exporter" accent={C.dim} delay={0.45} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Major Terrain Zones" icon={Icons.map}>
              <BarRow label="Steppe & mixed prairie (north & centre)" value="~44%" pct={100} color={C.kaz} />
              <BarRow label="Desert & semi-desert (south & west)" value="~33%" pct={75} color={C.yel} />
              <BarRow label="Mountains (Tian Shan & Altai, south-east)" value="~12.4%" pct={28} color={C.blu} />
              <BarRow label="Agricultural land (total)" value="~77.4%" pct={100} color={C.dim} />
              <BarRow label="Forest cover" value="~1.2%" pct={3} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Kazakhstan's vastness spans five climate zones in a single country. The northern steppe is the breadbasket; the southern deserts host oil fields and the Aral Sea crisis; the Tian Shan mountains in the south-east hold glaciers, ski resorts, and the border with Kyrgyzstan and China.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Water Bodies & Natural Features" icon={Icons.water}>
              <Tbl rows={[
                ['Caspian Sea (western border, shared)', '~371,000 km² total'],
                ['Lake Balkhash (unique dual salinity)', '16,996 km²'],
                ['Aral Sea (shrinking ecological crisis)', '~14,000 km² remaining'],
                ['Irtysh River (longest river)', '4,248 km total'],
                ['Ili River (feeds Balkhash)', '1,439 km'],
                ['Tobol & Ishim rivers (north)', 'Major tributaries'],
                ['Baikonur Cosmodrome (leased to Russia)', 'Until 2050'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The Aral Sea — once the 4th largest lake in the world — has lost ~90% of its volume due to Soviet-era irrigation diversion. This is one of the world's worst human-caused ecological disasters. Lake Balkhash, with its unique dual water chemistry, remains ecologically sensitive. Baikonur's lease to Russia until 2050 means Kazakhstan hosts the world's first and largest operational space launch facility.</p>
            </Panel>
          </div>
        </div>

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-3 d-flex"><RegCard name="Astana & Akmola" type="Capital · central steppe" desc="Ultra-modern capital built from scratch since 1997. Futuristic skyline, severe winters (−30°C). Financial & administrative hub." stripe={C.kaz} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Almaty & Zhetysu" type="Commercial · mountain gateway" desc="Largest city (2M+). Financial capital in practice. Tian Shan foothills, ski resorts, international airport hub." stripe={C.yel} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Atyrau & West" type="Oil & gas · Caspian" desc="Tengiz & Kashagan mega-fields. Caspian port. Oil-driven economy; highest wages in Kazakhstan." stripe={C.kaz} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Shymkent & South" type="Industry · border hub" desc="3rd largest city. Dense population. Gateway to Uzbekistan. Significant manufacturing and trade corridor." stripe={C.yel} /></div>
        </div>

        {/* ══ 2. CLIMATE ══ */}
        <SectionHeader icon={Icons.cloudSun} label="Climate: Weather, Daylight & Rainfall" />

        <div className="row g-1 mb-4">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Annual Temp (Astana)" value="3.5°C" sub="Extreme continental; one of coldest capitals on Earth" accent={C.blu} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Record High" value="49°C" sub="Southern desert regions; extreme summer heat" accent={C.kaz} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Record Low" value="−57°C" sub="Northern steppe; brutal continental winter extremes" accent={C.blu} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Annual Rainfall (Astana)" value="~340 mm" sub="Very dry; Almaty ~600 mm; south <200 mm" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Climate type" value="BSk / Dwc" sub="Semi-arid steppe; severe continental inland" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Almaty avg" value="~10.4°C annual" sub="Warmer; foothills moderate; snow Oct–Mar" accent={C.dim} delay={0.30} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Astana summer avg" value="20°C" sub="Short hot summers Jun–Aug; dust storms frequent" accent={C.yel} delay={0.35} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Winter Dec–Feb (Astana)" value="−14°C avg" sub="Heavy snow; −40°C spells; boran (blizzard) risk" accent={C.blu} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Spring Mar–May" value="3–17°C" sub="Rapid warming; steppes bloom; flood risk from snowmelt" accent={C.kaz} delay={0.45} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Daylight Hours — Astana (51.1°N)" icon={Icons.sun}>
              {[
                { mo:'Jan', label:'8h 22m', pct:29, color:C.blu },
                { mo:'Feb', label:'9h 52m', pct:38, color:C.blu },
                { mo:'Mar', label:'11h 34m', pct:50 },
                { mo:'Apr', label:'13h 22m', pct:63 },
                { mo:'May', label:'15h 02m', pct:76 },
                { mo:'Jun', label:'16h 22m ★', pct:100, color:C.yel, dark:true },
                { mo:'Jul', label:'15h 48m', pct:93 },
                { mo:'Aug', label:'14h 10m', pct:78 },
                { mo:'Sep', label:'12h 14m', pct:58 },
                { mo:'Oct', label:'10h 20m', pct:46 },
                { mo:'Nov', label:'8h 44m', pct:32, color:C.blu },
                { mo:'Dec', label:'7h 52m ★', pct:25, color:C.blu },
              ].map(r => <DlRow key={r.mo} mo={r.mo} label={r.label} pct={r.pct} color={r.color || C.kaz} dark={r.dark} />)}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                ★ Summer solstice <strong style={{ color:C.yelL }}>16h 22m</strong> · Winter solstice <strong style={{ color:C.bluL }}>7h 52m</strong> · At 51°N — same latitude as London — but vastly harsher continental climate
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>An 8.5-hour swing between shortest and longest day is extreme for a capital city. The 8h winter days, combined with −30°C temperatures, create significant psychological and energy burden. Summer's long days (16h) enable rapid agricultural cycles on the northern steppe.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Rainfall by Region" icon={Icons.rain}>
              <p style={{ fontSize:11, color:C.sub, marginBottom:11, letterSpacing:'0.04em' }}>Annual precipitation by zone</p>
              <BarRow label="Tian Shan foothills / Almaty" value="~600 mm" pct={100} color={C.kaz} />
              <BarRow label="North steppe / Astana" value="~340 mm" pct={57} color={C.yel} />
              <BarRow label="West steppe / Aktobe" value="~270 mm" pct={45} color={C.blu} />
              <BarRow label="Kyzylkum & Betpak-Dala deserts" value="~150 mm" pct={25} color={C.dim} />
              <BarRow label="Aral Sea basin / far south" value="~100 mm" pct={17} color={C.dim} />
              <div style={{ height:1, background:C.border, margin:'14px 0' }} />
              <p style={{ fontSize:11, color:C.sub, marginBottom:11, letterSpacing:'0.04em' }}>Astana monthly pattern</p>
              <BarRow label="May–June (wettest)" value="40–50 mm" pct={100} color={C.kaz} />
              <BarRow label="Jul–Aug (drier summer)" value="~25–30 mm" pct={55} color={C.yel} />
              <BarRow label="Jan–Feb (driest)" value="15–20 mm (snow)" pct={30} color={C.blu} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>340 mm/year in Astana is genuinely arid — comparable to Damascus. The Tian Shan foothills around Almaty are far wetter due to orographic lift. Snow cover in Astana lasts 130–150 days/year — the longest of any capital city outside Scandinavia.</p>
              <GradientBar title="Monthly avg temperature — Astana (°C)" values={[-14,-13,-6,5,13,20,23,21,14,5,-5,-12]} colorStops={tempColor} unit="°" />
              <GradientBar title="Monthly rainfall — Astana (mm)" values={[18,15,18,25,35,40,38,28,22,22,20,18]} colorStops={rainColor} unit="mm" />
            </Panel>
          </div>
        </div>

        {/* ══ 3. POPULATION ══ */}
        <SectionHeader icon={Icons.people} label="Population & Demographics" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Population (Jan 2026)" value="20.5M" sub="Bureau of National Statistics KZ; growing ~1.5% per year" accent={C.kaz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Urban Population" value="~63.8%" sub="Rapid urbanisation; Almaty agglomeration expanding fast" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Median Age" value="29.7 yrs" sub="Relatively young; large youth cohort (0–14: ~29.5%)" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Population Density" value="7.5 /km²" sub="One of world's least dense countries; steppe & desert empty" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Life Expectancy" value="73.3 yrs" sub="Women 77.9 · Men 69.0 (2024 est.)" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Fertility Rate" value="2.8" sub="Above replacement; birth rate ~17.2 per 1,000" accent={C.blu} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Population Growth" icon={Icons.chart}>
              <BarRow label="1991 (independence peak)" value="16.5M" pct={80} color={C.dim} />
              <BarRow label="1999 (post-emigration trough)" value="14.9M" pct={73} color={C.dim} />
              <BarRow label="2010" value="16.2M" pct={79} color={C.blu} />
              <BarRow label="2020" value="19.0M" pct={93} color={C.yel} />
              <BarRow label="2026" value="20.5M" pct={100} color={C.kaz} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Population actually fell from 16.5M (1991) to 14.9M (1999) — a dramatic decline driven by emigration of ethnic Russians, Germans, and Ukrainians after independence. Recovery since 2000 has been strong, driven by high Kazakh birth rates and return migration. The 2026 figure of 20.5M is a record high.</p>
              <AgeBar
                title="Population age structure — male ▲ / female ▼ (% of total)"
                male={[5.48,5.17,4.51,3.39,3.22,3.67,3.96,3.78,3.43,3.01,2.75,2.68,2.04,1.24,0.99,3.25]}
                female={[5.14,4.88,4.27,3.22,3.31,3.88,4.2,4.04,3.68,3.24,2.96,3.05,2.58,1.92,1.62,5.58]}
                medianM={29.9}
                medianF={33.5}
              />
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Largest Cities (2025 est.)" icon={Icons.landmark}>
              <BarRow label="Almaty (commercial capital)" value="2,100,000+" pct={100} color={C.kaz} />
              <BarRow label="Astana (national capital)" value="1,622,000" pct={77} color={C.yel} />
              <BarRow label="Shymkent" value="1,230,000" pct={59} color={C.blu} />
              <BarRow label="Aktobe" value="520,000" pct={25} color={C.dim} />
              <BarRow label="Karaganda" value="500,000" pct={24} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Kazakhstan has three cities above 1 million — unusual for its population size. Astana's rapid growth from a small town (1997) to 1.6M in under 30 years is one of the world's fastest capital-city expansions. Almaty remains larger and dominates finance, culture, and international connectivity despite no longer being the capital.</p>
            </Panel>
          </div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Ethnic Composition (2025)" icon={Icons.people}>
              <Donut
                label="20.5M"
                sublabel="population"
                segments={[
                  { label:'Kazakh',          value:'71.5%', pct:71.5, color:C.kaz },
                  { label:'Russian',         value:'14.4%', pct:14.4, color:C.yel },
                  { label:'Uzbek',           value:'3.4%',  pct:3.4,  color:C.blu },
                  { label:'Ukrainian',       value:'1.5%',  pct:1.5,  color:'#888'},
                  { label:'Other (100+ groups)',value:'9.2%',pct:9.2,  color:C.dim },
                ]}
              />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The Kazakh share has risen from ~40% at independence (1991) to 71.5% today — driven by high birth rates and emigration of Slavic groups. This demographic shift underpins growing Kazakh-language policies. The Russian minority (14.4%) remains politically significant; Russia closely monitors their status.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Religion & Language" icon={Icons.landmark}>
              <Tbl rows={[
                ['Islam (predominantly Sunni)', '~70%'],
                ['Christianity (Orthodox)', '~26%'],
                ['Other / atheist', '~4%'],
                ['State language', 'Kazakh (mandatory shift ongoing)'],
                ['Official language (co-official)', 'Russian (widely used)'],
                ['Script transition', 'Cyrillic → Latin (by 2031)'],
                ['Recognised ethnic groups', '100+'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Kazakhstan's "Rukhani Zhangyru" (Spiritual Revival) policy is shifting public life toward Kazakh language and the Latin script. The transition is gradual — Russian remains dominant in business, government and cities. At 26% Christian, Kazakhstan has one of the largest Christian minorities in the Muslim-majority former Soviet space.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 4. ECONOMY ══ */}
        <SectionHeader icon={Icons.chart} label="Economy & Finance" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP Nominal (2024)" value="$288B" sub="World Bank 2024; all-time record; 48th globally" accent={C.kaz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP per Capita (2024)" value="$11,850" sub="Upper-middle income; highest in Central Asia" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP Growth (2024)" value="4.8%" sub="IMF confirmed; accelerating to 6.5% 2025" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP PPP per Capita (2024)" value="$35,905" sub="Trading Economics; approaching upper-middle-income threshold" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Inflation CPI (2025)" value="~10.7%" sub="IMF forecast; above NBK target band; easing from 2022 peak" accent={C.blu} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Currency" value="KZT (Tenge)" sub="~475 KZT = $1 (2025 avg)" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="GDP by Sector & Major Exports" icon={Icons.chart}>
              <Donut
                label="$288B"
                sublabel="GDP 2024"
                segments={[
                  { label:'Services (trade, finance, logistics)', value:'61.2%', pct:61.2, color:C.kaz },
                  { label:'Industry (oil, mining, manufacturing)', value:'34.1%', pct:34.1, color:C.yel },
                  { label:'Agriculture',                          value:'4.7%',  pct:4.7,  color:C.blu },
                ]}
              />
              <div style={{ height:1, background:C.border, margin:'16px 0' }} />
              <BarRow label="Oil & petroleum products" value="~60% of exports" pct={100} color={C.kaz} />
              <BarRow label="Ferrous & non-ferrous metals" value="~13%" pct={48} color={C.yel} />
              <BarRow label="Uranium (world #1 producer)" value="~6%" pct={22} color={C.blu} />
              <BarRow label="Grain & agricultural products" value="~5%" pct={18} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Oil dominates at ~60% of exports — from the Tengiz, Kashagan, and Karachaganak super-giant fields. Kazakhstan produces ~40% of global uranium yet earns only ~6% of export revenue from it (uranium is cheap). Services at 61.2% of GDP shows a diversifying economy — the Astana International Financial Centre (AIFC) is the main diversification vehicle.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Economic Indicators" icon={Icons.briefcase}>
              <Tbl rows={[
                ['National Fund of Kazakhstan (NFRK)', '~$67B (sovereign wealth fund)'],
                ['Oil production (2024)', '~1.86M barrels/day'],
                ['Uranium production (2024)', '~21,227 tonnes — world #1 (WNA)'],
                ['Wheat production (2024)', '~18M tonnes — major exporter'],
                ['Foreign direct investment (FDI, 2024)', '~$27B inflow'],
                ['Remittances received', '~1.5% of GDP (minor)'],
                ['Gini coefficient (2021)', '29.2 — low inequality'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The $67B National Fund — built from oil windfalls — is a major macroeconomic buffer, covering 23% of GDP. Kazakhstan's uranium dominance (40% of global supply) is a critical strategic asset as the nuclear renaissance accelerates. A Gini of 29.2 is genuinely low inequality — comparable to Denmark — though urban-rural gaps are significant.</p>
            </Panel>
          </div>
        </div>

        <div className="row g-1 mb-3">
          <div className="col-12 col-md-4 d-flex">
            <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:'18px 14px', textAlign:'center', flex:1 }}>
              <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>Almaty City Centre</div>
              <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:18, color:C.kazL, marginBottom:3 }}>$2,200/m²</div>
              <div style={{ fontSize:11, color:C.sub }}>Premium districts (Bostandyk); demand boosted by Russian relocation wave 2022</div>
            </div>
          </div>
          <div className="col-12 col-md-4 d-flex">
            <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:'18px 14px', textAlign:'center', flex:1 }}>
              <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>Astana (Capital)</div>
              <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:18, color:C.kazL, marginBottom:3 }}>$1,400/m²</div>
              <div style={{ fontSize:11, color:C.sub }}>New districts; government-driven demand; rapid construction supply</div>
            </div>
          </div>
          <div className="col-12 col-md-4 d-flex">
            <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:'18px 14px', textAlign:'center', flex:1 }}>
              <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>Shymkent & Regions</div>
              <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:18, color:C.kazL, marginBottom:3 }}>$600/m²</div>
              <div style={{ fontSize:11, color:C.sub }}>Significantly lower; regional cities and rural areas well below</div>
            </div>
          </div>
        </div>

        {/* ══ 5. EMPLOYMENT ══ */}
        <SectionHeader icon={Icons.briefcase} label="Employment & Wages" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Monthly Wage (2025)" value="~$821" sub="~387,600 KZT net; highest in Central Asia" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Labour Force" value="~9.3M" sub="~45% of population; 95.4% employment rate" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Unemployment" value="~4.6%" sub="Official 2026 estimate; youth unemployment ~8%" accent={C.kaz} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Informal employment" value="~20–25%" sub="Significant in agriculture, retail, construction" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Min. Wage (2025)" value="~85,000 KZT" sub="~$180/month; raised annually; below urban living wage" accent={C.blu} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Labour Participation" value="~73%" sub="Women ~68% vs men ~78%; strong for Central Asia" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Wages by Sector (avg monthly KZT, 2024)" icon={Icons.chart}>
              <BarRow label="Oil & gas extraction" value="~900,000" pct={100} color={C.kaz} />
              <BarRow label="Financial & insurance services" value="~750,000" pct={83} color={C.yel} />
              <BarRow label="IT & communications" value="~600,000" pct={67} color={C.blu} />
              <BarRow label="Mining & metallurgy" value="~550,000" pct={61} color={C.dim} />
              <BarRow label="National average (net)" value="~387,600" pct={43} color={C.dim} />
              <BarRow label="Education (teachers)" value="~250,000" pct={28} color={C.dim} />
              <BarRow label="Agriculture" value="~180,000" pct={20} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The 5× wage gap between oil workers (900K KZT) and agricultural workers (180K KZT) is a key driver of rural-to-urban migration. At ~$821/month net, Kazakhstan's average wage is the highest in Central Asia — roughly 3× Kyrgyzstan's. The oil sector creates high wages for a relatively small workforce.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Employment by Sector" icon={Icons.briefcase}>
              <Donut
                label="9.3M"
                sublabel="labour force"
                segments={[
                  { label:'Trade & services',          value:'~38%', pct:38, color:C.kaz },
                  { label:'Agriculture & forestry',    value:'~18%', pct:18, color:C.yel },
                  { label:'Industry & manufacturing',  value:'~20%', pct:20, color:C.blu },
                  { label:'Construction',              value:'~9%',  pct:9,  color:C.dim },
                  { label:'Transport & logistics',     value:'~7%',  pct:7,  color:'#555'},
                  { label:'Other (public sector etc.)', value:'~8%', pct:8,  color:C.dim },
                ]}
              />
              <div style={{ height:1, background:C.border, margin:'16px 0' }} />
              <Tbl rows={[
                ['Women in managerial roles', '~40% (high for region)'],
                ['Skilled foreign workers (est.)', '~150,000'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>18% in agriculture is high but declining — a structural shift from subsistence to urban employment is accelerating. Industry at 20% is dominated by oil & gas and metallurgy. Women in managerial roles at ~40% is exceptionally high for Central Asia — a positive legacy of Soviet gender policy.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 6. EDUCATION ══ */}
        <SectionHeader icon={Icons.graduation} label="Education & Human Development" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Literacy Rate" value="99.8%" sub="Near-universal; Soviet-era legacy maintained" accent={C.kaz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="HDI (2026 est.)" value="0.859" sub="Very High Human Development; 67th globally (Worldometer)" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Years Schooling" value="12.0 yrs" sub="Among highest in Central Asia" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Expected Schooling" value="15.8 yrs" sub="Strong government investment in education" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Education Spending" value="~3.4% GDP" sub="Below regional aspiration; rising in absolute terms" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Universities" value="~130" sub="Nazarbayev University top-ranked English-medium; Bologna process adopted" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Education Metrics" icon={Icons.graduation}>
              <BarRow label="Primary enrolment rate" value="~99%" pct={99} color={C.kaz} />
              <BarRow label="Secondary completion rate" value="~97%" pct={97} color={C.yel} />
              <BarRow label="Tertiary enrolment" value="~55%" pct={55} color={C.blu} />
              <BarRow label="PISA scores vs OECD avg" value="below average" pct={48} color={C.dim} />
              <BarRow label="Bolashak scholarship recipients" value="~10,000+ total" pct={35} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>97% secondary completion is genuinely strong. Tertiary at 55% approaches OECD levels (Kazakhstan's Central Asian peers are 30–40%). The Bolashak programme (funded foreign study) has produced a skilled professional class. PISA scores below OECD average reveal a quality gap despite high access — a key reform priority.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Education Facts" icon={Icons.landmark}>
              <Tbl rows={[
                ['Languages of instruction', 'Kazakh (primary) + Russian + English'],
                ['Trilingual education policy', 'Kazakh / Russian / English'],
                ['Nazarbayev University (NU)', 'English-medium; top regional ranking'],
                ['Bolashak international scholarship', 'Est. 1993; ~3,000 active scholars'],
                ['Bologna Process adopted', '2010; ECTS system'],
                ['Digital education platform', 'NIS (Nazarbayev Intellectual Schools)'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The trilingual policy (Kazakh / Russian / English) is ambitious and partially implemented. Nazarbayev University — modelled on Western research universities with international faculty — is Kazakhstan's prestige institution. The 130-university landscape includes many low-quality private institutions; the government is consolidating and raising standards.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 7. POLITICAL LANDSCAPE ══ */}
        <SectionHeader icon={Icons.landmark} label="Political Landscape" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="System" value="Presidential" sub="Strong executive; centralised power under Tokayev" accent={C.kaz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="President" value="K. Tokayev" sub="In office since 2019; re-elected Nov 2022 for 7-year term" accent={C.yel} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Parliament (Mazhilis)" value="98 seats" sub="Lower house; bicameral; Amanat party dominates" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Next Election" value="2029" sub="Presidential cycle 7 years post-2022 reform" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ruling Party" value="Amanat" sub="Formerly Nur Otan; rebranded 2022; dominant party-state" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Independence" value="Dec 16, 1991" sub="Last Soviet republic to declare; National holiday" accent={C.blu} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="2023 Parliamentary Election Results" icon={Icons.landmark}>
              <BarRow label="Amanat (ruling party)" value="62 seats / 53.9%" pct={100} color={C.kaz} />
              <BarRow label="Auyl (agrarian)" value="8 seats / 10.9%" pct={20} color={C.yel} />
              <BarRow label="Respublika" value="6 seats / 8.6%" pct={16} color={C.blu} />
              <BarRow label="Aq Jol (business)" value="5 seats / 8.4%" pct={15} color={C.dim} />
              <BarRow label="QHP (People's Party)" value="5 seats / 8.1%" pct={15} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Voter turnout ~54%. First multi-party election with new rules allowing independents. Amanat's 53.9% dominance reflects the lack of genuine opposition. Press freedom rank 134/180 (RSF 2024).</p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Despite multi-party branding, Kazakhstan remains a managed democracy — real power rests with the presidency. The January 2022 Qantar events (protests, crackdown, 238 deaths) marked a turning point: Tokayev consolidated power, marginalised Nazarbayev's clan, and launched a "New Kazakhstan" reform narrative.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Political Timeline" icon={Icons.chart}>
              {[
                { yr:'1991', tx:'Kazakhstan declares independence Dec 16. Nursultan Nazarbayev, first and only president, begins 28-year rule.' },
                { yr:'1997', tx:'Capital moved from Almaty to Astana (then Akmola). Massive nation-building project on the steppe begins.' },
                { yr:'2019', tx:'Nazarbayev unexpectedly resigns. Kassym-Jomart Tokayev becomes president; Nazarbayev retains "Elbasy" (Leader of the Nation) title.' },
                { yr:'2022', tx:'January: Qantar protests over fuel prices turn into nationwide unrest. 238 killed. CSTO peacekeepers deployed. Tokayev removes Nazarbayev\'s privileges.' },
                { yr:'2022', tx:'November snap election: Tokayev wins 81.3% for a new 7-year term. Constitutional reforms reduce presidential terms to one.' },
                { yr:'2023', tx:'Multi-party parliamentary elections held — first with independent candidates. New Kazakhstan reform agenda pushed forward.' },
              ].map(({ yr, tx }) => (
                <div key={yr} style={{ paddingLeft:16, borderLeft:`1px solid ${C.kaz}`, marginBottom:14 }}>
                  <div style={{ fontSize:10, letterSpacing:'0.11em', color:C.yel, textTransform:'uppercase', marginBottom:2 }}>{yr}</div>
                  <div style={{ fontSize:12.5, color:'#888', lineHeight:1.6 }}>{tx}</div>
                </div>
              ))}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The 2022 Qantar events were Kazakhstan's most significant political crisis since independence — but unlike Kyrgyzstan's revolutions, the state held and the military remained loyal. Tokayev used the crisis to fully dismantle the Nazarbayev system and consolidate sole power. "New Kazakhstan" remains aspirational rather than fully implemented.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 8. TOURISM ══ */}
        <SectionHeader icon={Icons.briefcase} label="Tourism" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="International Visitors (2024)" value="~9.7M" sub="Tourism Committee KZ 2024; recovering strongly post-COVID" accent={C.kaz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Tourism Revenue (2024)" value="~$4.5B" sub="~1.6% of GDP; government target $10B by 2030" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Top draw" value="Almaty" sub="Mountain gateway; Shymbulak ski resort; Charyn Canyon" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Visa-free countries" value="~70+" sub="Including EU Schengen zone, UK, USA, Japan" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="EXPO 2017 legacy" value="Astana hub" sub="EXPO site now houses AIFC, museums, conference venues" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="2030 visitor target" value="12M+" sub="National Tourism Development Strategy 2023–2029" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Top Visitor Origins (2024 est.)" icon={Icons.people}>
              {[
                { flag:'🇷🇺', country:'Russia',       val:'largest source; business & relocation wave',  pct:'~35%' },
                { flag:'🇨🇳', country:'China',        val:'growing rapidly; Silk Road interest',          pct:'~15%' },
                { flag:'🇺🇿', country:'Uzbekistan',   val:'cross-border; business & family',              pct:'~12%' },
                { flag:'🇩🇪', country:'Germany',      val:'business & adventure tourism',                 pct:'~5%'  },
                { flag:'🇺🇸', country:'USA',          val:'business; high-spend professionals',           pct:'~4%'  },
                { flag:'🇬🇧', country:'UK & EU',      val:'Silk Road & eco tours; finance',               pct:'~6%'  },
              ].map(({ flag, country, val, pct }) => (
                <div key={country} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0' }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{flag}</span>
                  <span style={{ fontSize:12.5, color:C.txt, flexShrink:0 }}>{country}</span>
                  <span style={{ fontSize:11, color:C.sub, flex:1 }}>{val}</span>
                  <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.txt, flexShrink:0 }}>{pct}</span>
                </div>
              ))}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Russia at ~35% remains dominant — boosted by the 2022 relocation wave when hundreds of thousands of Russians moved to Kazakhstan following the war in Ukraine. This influx drove real estate prices up and changed the visitor composition. China at ~15% is the key growth market aligned with Belt and Road connectivity.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Tourism Highlights" icon={Icons.landmark}>
              <Tbl rows={[
                ['Shymbulak ski resort (Almaty, 2,200m)', 'FIS certified; 4 gondola lines'],
                ['Charyn Canyon (Grand Canyon of Central Asia)', '300m deep; 90 km long'],
                ['Kolsai Lakes & Kaindy (submerged forest)', 'UNESCO-listed watershed'],
                ['Baikonur Cosmodrome (space tourism)', 'Cosmonaut viewings available'],
                ['Bayterek Tower & EXPO 2017 site, Astana', 'Signature futuristic architecture'],
                ['Silk Road heritage: Otrar, Taraz, Turkestan', 'Yasawi Mausoleum (UNESCO)'],
                ['Steppe nomad culture & eagle hunters', 'Berkutchi tradition; Altai region'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The Yasawi Mausoleum in Turkestan (UNESCO 2003) is Kazakhstan's most significant heritage site. Charyn Canyon rivals the American Grand Canyon in visual drama. The steppe nomad tradition — eagle hunting (berkutchi) — is a genuinely unique cultural offer. Astana's futuristic architecture, led by Norman Foster (Khan Shatyr), is increasingly a draw in itself.</p>
              <GradientBar title="Tourism intensity by month (relative)" values={[8,10,15,25,45,65,100,90,70,40,15,8]} colorStops={p => { const r=Math.round(255-(255*p/100)); const g=Math.round(255-(80*p/100)); const b=Math.round(255-(53*p/100)); return `rgb(${r},${g},${b})`; }} unit="%" />
            </Panel>
          </div>
        </div>

        {/* ══ 9. VITAL STATISTICS ══ */}
        <SectionHeader icon={Icons.people} label="Vital Statistics" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Births (2024 est.)" value="~350,000" sub="Birth rate ~17.2 per 1,000 population" accent={C.kaz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Natural Increase" value="~183,000" sub="Net population growth from births minus deaths" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ages 0–14" value="~29.5%" sub="Large youth cohort; demographic dividend building" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ages 65+" value="~8.5%" sub="Ageing slowly; pension pressure manageable for now" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Deaths (2024 est.)" value="~166,000" sub="Death rate ~8.1 per 1,000 population" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Infant Mortality" value="8.0 / 1,000" sub="Per 1,000 live births (2024 est.); improving steadily" accent={C.blu} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Causes of Death (2024 est.)" icon={Icons.chart}>
              <BarRow label="Circulatory diseases"     value="~55%" pct={100} color={C.kaz}  />
              <BarRow label="Neoplasms (cancer)"        value="~12%" pct={22}  color={C.yel} />
              <BarRow label="External causes (injuries, accidents)" value="~8%" pct={15} color={C.blu} />
              <BarRow label="Respiratory diseases"      value="~6%"  pct={11}  color={C.dim} />
              <BarRow label="Digestive diseases"        value="~5%"  pct={9}   color={C.dim} />
              <BarRow label="Infectious &amp; parasitic" value="~3%"  pct={5}   color={C.dim} />
              <BarRow label="Other"                     value="~11%" pct={20}  color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Circulatory disease at ~55% is above even the Kyrgyzstan rate (51%), reflecting similar high-salt diets, underdiagnosed hypertension, and cold-climate stress. Cancer at ~12% is below global average partly due to the younger demographic. Infant mortality at 8/1,000 is half the Kyrgyzstan rate — reflecting higher health spending.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Marriage & Vital Trends" icon={Icons.landmark}>
              <Tbl rows={[
                ['Marriage rate (per 1,000)', '~8.5'],
                ['Divorce rate (per 1,000)', '~3.2'],
                ['Avg age at first marriage (women)', '~25 yrs'],
                ['Avg age at first marriage (men)', '~27 yrs'],
                ['Maternal mortality ratio (2024 est.)', '~14 per 100,000'],
                ['Child stunting rate', '~8% (national estimate)'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Divorce at 3.2/1,000 is notably higher than Kyrgyzstan (1.8) and reflects more urbanised, economically independent women. Maternal mortality at ~14/100,000 is 3× better than Kyrgyzstan (~43), reflecting higher health system spending. The 25-year average female marriage age signals growing female education and career priorities.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 10. ECONOMIC DEPTH ══ */}
        <SectionHeader icon={Icons.chart} label="Economic Depth & Fiscal Position" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="National Fund (NFRK)" value="~$67B" sub="Sovereign wealth fund; oil windfall savings; major macro buffer" accent={C.kaz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Govt Budget (2025)" value="~−2% deficit" sub="Expansionary fiscal stance; public investment surge" accent={C.yel} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Govt Debt / GDP (2024)" value="~26%" sub="Moderate; concessional; well below IMF warning thresholds" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Credit Rating (Moody's)" value="Baa3 / Stable" sub="Investment grade; well above Kyrgyzstan's B3 speculative" accent={C.blu} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="FDI Inflow (2024)" value="~$27B" sub="Among largest FDI recipients in CIS; mostly oil sector" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Trade Balance (2024)" value="+$17.2B" sub="Exports $87.2B vs Imports $70B; structural surplus" accent={C.dim} delay={0.30} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Current Account (2024)" value="−1.3% GDP" sub="IMF 2025; widening to ~−3.5% in 2025 on lower oil prices" accent={C.dim} delay={0.35} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Foreign Reserves (2025)" value="~$37B" sub="NBK reserves excl. NFRK; ~8 months import cover" accent={C.dim} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Inflation (2025)" value="~10.7%" sub="IMF forecast; above 4–6% NBK target; consumer credit boom driver" accent={C.dim} delay={0.45} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Top Export Destinations (2024)" icon={Icons.briefcase}>
              {[
                { flag:'🇪🇺', country:'European Union',  val:'largest market; Italian, Dutch refineries', pct:'~37%' },
                { flag:'🇨🇳', country:'China',           val:'oil, metals, uranium; growing fast',        pct:'~17%' },
                { flag:'🇷🇺', country:'Russia',          val:'EAEU trade; metals & grain',                pct:'~11%' },
                { flag:'🇬🇧', country:'United Kingdom',  val:'gold refining corridor',                    pct:'~7%'  },
                { flag:'🇨🇭', country:'Switzerland',     val:'gold & commodities trading hub',            pct:'~4%'  },
                { flag:'🇺🇿', country:'Uzbekistan',      val:'growing bilateral; manufactured goods',     pct:'~3%'  },
              ].map(({ flag, country, val, pct }) => (
                <div key={country} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0' }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{flag}</span>
                  <span style={{ fontSize:12.5, color:C.txt, flexShrink:0 }}>{country}</span>
                  <span style={{ fontSize:11, color:C.sub, flex:1 }}>{val}</span>
                  <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.txt, flexShrink:0 }}>{pct}</span>
                </div>
              ))}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>EU at 37% is the dominant destination — most Kazakh oil flows to Italian and Dutch refineries via the Caspian Pipeline Consortium (CPC). Russia at 11% is declining as Kazakhstan diversifies Trans-Caspian routes post-2022. China at 17% is growing fast — the China-Kazakhstan pipeline and rail corridor are key enablers.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Fiscal Indicators" icon={Icons.chart}>
              <Tbl rows={[
                ['Govt debt / GDP (2024)', '~26% — moderate, mostly concessional'],
                ["Moody's credit rating", 'Baa3 / Stable — investment grade'],
                ['NFRK sovereign wealth fund', '~$67B — ~23% of GDP'],
                ['Tax revenue growth (2024)', '+12% YoY from VAT reform'],
                ['Oil price sensitivity', 'Budget balanced at ~$65/bbl Brent'],
                ['AIFC (Astana Intl Financial Centre)', 'Est. 2018; English-law hub; 3,500+ firms'],
                ['GDP growth Jan–Apr 2025', '+6.0% real (IMF/Bureau Statistics KZ)'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Investment-grade Baa3 is Kazakhstan's most significant fiscal achievement — it allows borrowing at far lower rates than peers like Kyrgyzstan (B3). The NFRK at $67B provides 8+ months of fiscal runway even if oil prices collapse. AIFC's English-law jurisdiction is strategically important — it allows international contract disputes to bypass Kazakhstani courts.</p>
              <GradientBar title="Trade balance 2015–2024 ($B)" values={[14.8, 10.2, 13.5, 14.7, 14.7, 6.9, 17.0, 33.4, 18.5, 17.0]} xLabels={['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']} colorStops={(p, v) => v >= 0 ? `rgb(${Math.round(255-220*p/100)},${Math.round(255-96*p/100)},${Math.round(255-191*p/100)})` : `rgb(${Math.round(255-23*p/100)},${Math.round(255-230*p/100)},${Math.round(255-211*p/100)})`} fmt={v => v > 0 ? `+${v}B` : `${v}B`} absScale={true} />
            </Panel>
          </div>
        </div>

        {/* ══ 11. ENERGY & RESOURCES ══ */}
        <SectionHeader icon={Icons.mountain} label="Energy & Resources" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Oil Production (2024)" value="1.86M bbl/day" sub="13th largest globally; Tengiz, Kashagan, Karachaganak" accent={C.kaz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Proven Oil Reserves" value="~30B barrels" sub="12th largest globally; Caspian shelf major untapped area" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Uranium Production (2024)" value="21,227 tonnes" sub="World #1; ~40% of global supply (World Nuclear Association)" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Electricity Generation (2021)" value="~104.5 TWh" sub="Coal-heavy; massive renewable transition underway" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Renewable target (2030)" value="15% of mix" sub="Wind & solar potential in steppe is world-class" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Nuclear power (planned)" value="2.4 GW" sub="Referendum 2024 approved NPP construction; Russian design" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Electricity Generation Mix (2024 est.)" icon={Icons.chart}>
              <Donut
                label="~104 TWh"
                sublabel="generated 2024"
                segments={[
                  { label:'Coal thermal (dominant)',    value:'~70%', pct:70, color:C.kaz },
                  { label:'Gas-fired power',            value:'~13%', pct:13, color:C.yel },
                  { label:'Hydro (Irtysh cascade)',     value:'~11%', pct:11, color:C.blu },
                  { label:'Wind & solar (growing)',     value:'~6%',  pct:6,  color:'#888'},
                ]}
              />
              <p style={{ fontSize:11, color:C.sub, marginTop:12, lineHeight:1.6 }}>
                Ageing Soviet coal infrastructure dominates. Major renewable projects: Zhanatas wind farm (100MW), Kapchagay hydro expansion. Nuclear power plant decision approved by referendum Oct 2024 — first NPP in Central Asia.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>70% coal makes Kazakhstan one of the most carbon-intensive grids among upper-middle-income countries. The contradiction with its green ambitions is stark. However, the steppe has world-class wind and solar resources — with the right investment, a rapid transition is technically feasible. The NPP decision signals a serious long-term pivot.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Energy & Resources Facts" icon={Icons.landmark}>
              <Tbl rows={[
                ['Oil pipeline CPC capacity', '~1.4M bbl/day to Black Sea'],
                ['Trans-Caspian Pipeline (planned)', 'Bypasses Russia; EU priority project'],
                ['Coal production', '~115Mt/year; major exporter'],
                ['Rare earth metals (2025 discovery)', 'Significant deposits confirmed; Britannica'],
                ['Natural gas reserves', '~1,869 bn cu ft — 19th globally'],
                ['Electricity export', '~2.4 TWh to Kyrgyzstan & others'],
                ['Tengizchevroil expansion (TCO FGP)', 'Targeting +260,000 bbl/day uplift'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The Trans-Caspian Pipeline is Kazakhstan's most geopolitically important energy project — it would allow Kazakh oil to reach the EU without crossing Russian territory, dramatically changing Kazakhstan's leverage. Rare earth metal discoveries in 2025 could prove transformative for the global critical minerals supply chain.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 12. INFRASTRUCTURE & DIGITAL ══ */}
        <SectionHeader icon={Icons.map} label="Infrastructure & Digital Connectivity" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Internet Penetration" value="~91%" sub="ITU 2023; rapid expansion; mobile-first majority" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Mobile Subscribers" value="~23M" sub="Above 100% penetration; Kazakhtelecom & Kcell dominant" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Road Network" value="~97,000 km" sub="~67,000 km paved; major Western Europe–China corridor" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Railway" value="~16,614 km" sub="8th largest network globally; Trans-Kazakh Railway key" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Fixed Broadband" value="~23%" sub="Growing rapidly; fiber expanding in cities" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="5G Status" value="Launching" sub="Pilots in Almaty & Astana 2024–2025; full rollout 2026 target" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Key Infrastructure Projects" icon={Icons.map}>
              <Tbl rows={[
                ['Trans-Caspian Int\'l Trade Route (TITR)', 'China–Caspian–Caucasus–EU corridor'],
                ['Western Europe–Western China highway', '8,450 km; Kazakhstan 2,800 km section'],
                ['Beineu–Shymkent gas pipeline', '1,475 km; completed; domestic supply'],
                ['Tengizchevroil FGP expansion', '+260K bbl/day oil; $36B investment'],
                ['Almaty Metro expansion', '5 new stations; Phase 2 ongoing'],
                ['Digital Kazakhstan Programme 2023–2028', 'E-gov, AI, broadband rural build-out'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Kazakhstan is the linchpin of the Trans-Caspian International Trade Route (TITR) — the key alternative to Russian rail for China-EU freight since 2022. Container volumes on this route tripled in 2022–2024. The TCO FGP expansion at $36B is the largest single investment project in Central Asian history.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Digital Indicators" icon={Icons.chart}>
              <BarRow label="Internet penetration" value="~91%" pct={91} color={C.kaz} />
              <BarRow label="Mobile penetration" value=">100%" pct={100} color={C.yel} />
              <BarRow label="Fixed broadband penetration" value="~23%" pct={23} color={C.blu} />
              <BarRow label="E-government service uptake" value="~72%" pct={72} color={C.dim} />
              <BarRow label="Social media penetration" value="~74%" pct={74} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                Mobile internet speed: 30–55 Mbps median (Ookla 2024). E-Gov Kazakhstan portal handles 85M transactions/year. Nur.kz is state internet monitoring system. Digital Tenge (CBDC) launched Nov 2023.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>91% internet penetration is impressive for a country with Kazakhstan's geography and population density (7.5/km²). The Digital Kazakhstan programme has been transformative for rural areas. The Digital Tenge CBDC is one of the first in the post-Soviet space — reflecting Kazakhstan's ambition to be a fintech leader via the AIFC.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 13. HEALTH SYSTEM ══ */}
        <SectionHeader icon={Icons.people} label="Health System" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Health Spending (% GDP)" value="~3.8%" sub="2022 WHO data; public share ~60%; rising in absolute terms" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Out-of-pocket health spending" value="~30%" sub="Share of total; lower than Kyrgyzstan (40.7%) but still high" accent={C.kaz} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Compulsory Health Insurance" value="Since 2020" sub="OSMS system; universal coverage goal by 2025" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="TB incidence (2023)" value="~12 / 100K" sub="Dramatically down from 200+/100K in early 2000s; near WHO target" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Infant mortality (2024)" value="8.0 / 1,000" sub="Improved sharply; down from 22/1,000 in 2005" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Air quality — Almaty" value="PM2.5: ~25 µg/m³" sub="5× WHO guideline; winter coal heating; mountain basin traps pollution" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Health System Facts" icon={Icons.people}>
              <Tbl rows={[
                ['OSMS compulsory insurance (since 2020)', '~80% of population covered'],
                ['Hospital beds per 1,000', '~6.1 (above world average of 2.9)'],
                ['Physicians per 1,000', '~3.8 (relatively well staffed)'],
                ['Health strategy current', 'Healthy Nation 2020–2025'],
                ['Polyclinic network', '~600+ primary care clinics nationwide'],
                ['Medical tourism (inbound)', 'Growing; cardiac & oncology centres'],
                ['COVID excess mortality', 'Significant; reported among highest in region'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>6.1 hospital beds/1,000 is above average — Soviet infrastructure remains. TB reduction from 200+/100K to ~12/100K in 20 years is one of Kazakhstan's most remarkable health achievements. OSMS launched in 2020 is still maturing; OOP at ~30% shows the transition to true universal coverage is incomplete.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Disease & Health Burden" icon={Icons.chart}>
              <BarRow label="Hypertension prevalence" value="~35%" pct={100} color={C.kaz} />
              <BarRow label="Almaty PM2.5 (WHO guideline = 5)" value="~25 µg/m³" pct={72} color={C.yel} />
              <BarRow label="OOP share of health spending" value="~30%" pct={60} color={C.blu} />
              <BarRow label="TB incidence per 100K (2023)" value="~12" pct={20} color={C.dim} />
              <BarRow label="Obesity prevalence (est.)" value="~22%" pct={44} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                NCDs — especially cardiovascular and metabolic — are the dominant health burden. Almaty's mountain bowl geography traps air pollution; winter inversions push daily PM2.5 above 100 µg/m³.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>TB at ~12/100K is approaching the WHO elimination target (&lt;10/100K) — a remarkable turnaround from the crisis of the 1990s. Hypertension at ~35% is undertreated. Almaty's air quality crisis is structurally similar to Bishkek's but at higher income level — solutions are more financially feasible.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 14. SOCIAL & INEQUALITY ══ */}
        <SectionHeader icon={Icons.people} label="Social Indicators & Inequality" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Poverty rate ($3.65/day)" value="~4.5%" sub="World Bank 2021; national line: ~2.5%; much lower than Kyrgyzstan" accent={C.kaz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gini Coefficient (2021)" value="29.2" sub="World Bank; low inequality — comparable to Germany" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Rural vs urban income gap" value="~1.8×" sub="Urban income ~80% higher than rural; significant but narrowing" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gender Inequality Index" value="0.234 (rank 65)" sub="UNDP 2022; much better than regional peers" accent={C.yel} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Women in parliament" value="~27%" sub="2023 election result; significantly above regional average" accent={C.blu} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Social Spending (% GDP)" value="~2.5%" sub="Above upper-middle-income peer average of 1.8% (IMF 2024)" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Social Cohesion & Gender" icon={Icons.people}>
              <Tbl rows={[
                ['Gini coefficient (World Bank, 2021)', '29.2 — low inequality'],
                ['Gender Inequality Index (UNDP 2022)', '0.234 — rank 65/191'],
                ['Women in labour force', '~68%'],
                ['Women in parliament (2023)', '~27% — strong regional benchmark'],
                ['Domestic violence law', 'Strengthened 2024 (Tokayev decree)'],
                ['Pension age (men/women)', '63 / 63 (equalized from 2027)'],
                ['Minimum wage purchasing power', 'Adequate in rural areas; tight in Almaty'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Women at 27% of parliament is the highest in Central Asia and a genuine achievement of the 2023 electoral reforms. Gini of 29.2 suggests fair income distribution, but wealth concentration among the oil elite is not captured by consumption Gini. Domestic violence remains a significant challenge — the 2024 law reform was widely welcomed.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Access & Basic Services" icon={Icons.chart}>
              <BarRow label="Access to clean water (urban)" value=">98%" pct={98} color={C.kaz} />
              <BarRow label="Access to clean water (rural)" value="~88%" pct={88} color={C.yel} />
              <BarRow label="Access to sanitation (urban)" value="~96%" pct={96} color={C.dim} />
              <BarRow label="Access to sanitation (rural)" value="~72%" pct={72} color={C.dim} />
              <BarRow label="Electricity access (national)" value="~100%" pct={100} color={C.blu} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Near-universal electricity and urban water access are genuine achievements. The urban-rural gap in sanitation (96% vs 72%) is a remaining infrastructure challenge — mainly in remote steppe communities. The scale of Kazakhstan's territory (2.7M km²) makes infrastructure provision physically challenging even with sufficient capital.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 15. ENVIRONMENT ══ */}
        <SectionHeader icon={Icons.water} label="Environment & Climate" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="CO₂ per capita (2022)" value="~12.6 t" sub="Well above world avg (~4.7t); coal-heavy grid; oil industry" accent={C.kaz} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Total CO₂ emissions" value="~240 Mt/yr" sub="Energy sector dominant; 0.6% of global emissions" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Aral Sea crisis" value="~90% volume lost" sub="One of world's worst ecological disasters; ongoing desertification" accent={C.blu} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Renewable energy target 2030" value="15% of mix" sub="Up from ~6% in 2024; ambitious given coal dominance" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Wind power potential" value="Vast" sub="Steppe among world's best wind resources; largely untapped" accent={C.yel} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Almaty PM2.5 (annual)" value="~25 µg/m³" sub="5× WHO guideline; mountain bowl traps pollutants in winter" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Environmental Facts" icon={Icons.water}>
              <Tbl rows={[
                ['CO₂ per capita vs world avg', '~12.6t vs ~4.7t — very high'],
                ['Protected area (% of territory)', '~4.6%'],
                ['Aral Sea restoration (North Aral)', 'Partial success: north basin recovering'],
                ['Saksaul reforestation programme', '2B trees by 2025 target'],
                ['Greenhouse gas NDC target (2030)', 'Reduce 15% vs 1990 (conditional 25%)'],
                ['Climate vulnerability', 'High — steppe, water stress, heat extremes'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>CO₂ at 12.6t/capita is 2.7× the world average and among the highest of any upper-middle-income country — the cost of oil wealth and coal dominance. The North Aral Sea restoration using the Kokaral Dam is a rare environmental success story. The 2B-tree saksaul programme aims to fight desertification — Kazakhstan loses ~1.1M ha to desertification annually.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Air Quality & Pollution Sources" icon={Icons.chart}>
              <BarRow label="Coal power plants (ageing Soviet fleet)" value="Largest source" pct={100} color={C.kaz} />
              <BarRow label="Oil & gas extraction/flaring" value="Major contributor" pct={75} color={C.yel} />
              <BarRow label="Vehicle emissions" value="Significant (Almaty/Astana)" pct={55} color={C.blu} />
              <BarRow label="Industrial metallurgy (Karaganda/Temirtau)" value="Major regional source" pct={70} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                Temirtau (ArcelorMittal Kazakhstan steel city) produces significant industrial emissions. Almaty's winter air quality consistently ranks among the 20 worst globally due to geographic basin + coal heating + vehicle fleet.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>ArcelorMittal's Temirtau steel plant — a Soviet-era facility — is a major pollution point source. Gas flaring from oil fields remains a significant issue despite reduction targets. Almaty's geography (enclosed by mountains on three sides) creates natural pollution trapping that magnifies all emission sources.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 16. BUSINESS & INVESTMENT CLIMATE ══ */}
        <SectionHeader icon={Icons.briefcase} label="Business & Investment Climate" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Corporate tax rate" value="20%" sub="Standard; reduced rates for AIFC, SEZs; oil sector higher via PSA" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="FDI inflow (2024)" value="~$27B" sub="Among CIS leaders; oil sector dominant; AIFC growing" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ease of Doing Business" value="Rank 25 / 190" sub="World Bank 2019 (last); dramatic improvement from rank 71 in 2011" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="VAT rate" value="12%" sub="Standard rate; same as Kyrgyzstan; reform discussions ongoing" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Corruption Index (CPI 2023)" value="39 / 100" sub="Transparency International; rank 93/180 — much better than Kyrgyzstan (25/100)" accent={C.kaz} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Rule of Law index" value="~Rank 75/142" sub="World Justice Project 2024; judiciary independence remains limited" accent={C.blu} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Investment Climate Summary" icon={Icons.briefcase}>
              <Tbl rows={[
                ["Moody's credit rating", 'Baa3 / Stable — investment grade'],
                ['CPI score (2023)', '39/100 — rank 93/180 — improving'],
                ['AIFC (Astana Intl Financial Centre)', 'English common law; ~3,500 registered firms'],
                ['WTO member since', '2015'],
                ['EAEU member since', '2015 — customs union with Russia'],
                ['Special Economic Zones (SEZs)', '14 SEZs with tax incentives'],
                ['Tengizchevroil (TCO)', '$36B expansion — largest FDI project'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Investment-grade Baa3 and a CPI of 39 (vs Kyrgyzstan's 25) make Kazakhstan far more attractive to foreign investors. The AIFC — using English law, arbitrated by the Astana Court — sidesteps the weak domestic judiciary and has attracted 3,500+ financial firms. Ease of doing business rank 25 (World Bank 2019) was a top-10 global improvement story over that decade.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Risks & Opportunities" icon={Icons.chart}>
              <BarRow label="Oil price dependency (60% of exports)" value="High risk" pct={80} color={C.kaz} />
              <BarRow label="Russia geopolitical risk (EAEU / proximity)" value="Elevated" pct={65} color={C.yel} />
              <BarRow label="Middle corridor transit opportunity" value="Very high" pct={90} color={C.dim} />
              <BarRow label="Uranium & critical minerals boom" value="Very high" pct={85} color={C.dim} />
              <BarRow label="Renewable energy export potential" value="High" pct={75} color={C.blu} />
              <BarRow label="AIFC financial hub ambition" value="Growing" pct={60} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The Middle Corridor — Kazakhstan's strategic opportunity post-2022 — positions the country as the indispensable land bridge between China and Europe. Uranium demand is surging globally as nuclear power returns. These two mega-trends, combined with the AIFC financial hub ambition, give Kazakhstan a uniquely compelling investment case in the 2025–2030 window.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 17. CRIME & SECURITY ══ */}
        <SectionHeader icon={Icons.landmark} label="Crime & Security" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Global Peace Index" value="~Rank 73" sub="Institute for Economics & Peace 2024; medium-high peace" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Terrorism Index" value="Low" sub="Minimal domestic terrorism; Qantar 2022 was political unrest not terrorism" accent={C.blu} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Homicide rate (2022 est.)" value="~4.8 / 100K" sub="UNODC; similar to Kyrgyzstan; declining trend" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Press Freedom (RSF 2024)" value="Rank 134 / 180" sub="Declining; journalists prosecuted; media ownership concentrated" accent={C.kaz} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Corruption Index (CPI 2023)" value="39 / 100" sub="Rank 93/180; improving; anti-corruption agency strengthened" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Qantar 2022 victims" value="238 killed" sub="Largest political violence event since independence; fully suppressed" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Crime & Security Indicators" icon={Icons.landmark}>
              <Tbl rows={[
                ['Homicide rate (2022 est.)', '~4.8 per 100,000 (UNODC)'],
                ['Global Peace Index 2024', '~Rank 73 / 163'],
                ['Political stability post-Qantar', 'Stable; CSTO presence normalised'],
                ['Rule of Law (WJP 2024)', '~Rank 75/142 — moderate'],
                ['Organised crime risk', 'Drug trafficking: Afghanistan route concern'],
                ['Cybercrime/espionage risk', 'Elevated; state monitoring systems active'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The January 2022 Qantar events — 238 killed, 10,000+ arrested — were the most serious political violence in Kazakhstan's history. The state's decisive response (including CSTO troops) stabilised the country quickly but raised human rights concerns. Unlike Kyrgyzstan's three revolutions, the Qantar events did not topple the government — the difference reflects stronger state institutions and military loyalty.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Security Context" icon={Icons.chart}>
              <BarRow label="Corruption (CPI, 100=clean)" value="39 / 100" pct={39} color={C.kaz} />
              <BarRow label="Press freedom (100=free, est.)" value="~33 / 100" pct={33} color={C.yel} />
              <BarRow label="Rule of law (WJP, 100=best)" value="~46 / 100" pct={46} color={C.blu} />
              <BarRow label="Global Peace Index (100=peaceful)" value="~65 / 100" pct={65} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                Kazakhstan has not experienced the political revolutions of Kyrgyzstan, but political repression is real. Human rights organisations document arbitrary detention, media control, and suppression of civil society. The Anti-Corruption Agency has prosecuted Nazarbayev-era officials — signalling power consolidation as much as genuine reform.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>CPI 39/100 places Kazakhstan in the upper third of the post-Soviet space for perceived corruption — well ahead of Kyrgyzstan (25), Russia (26), and Uzbekistan (33). Press freedom at rank 134 is poor — worse than Kyrgyzstan's 82. Rule of law at ~rank 75 reflects a judiciary that functions but is not independent. The overall picture is a stable authoritarian state with improving economic governance.</p>
            </Panel>
          </div>
        </div>

        <div style={{ padding:'8px 0 0', marginTop:8 }}>
          <p style={{ fontSize:10.5, color:'#555', lineHeight:1.7 }}>
            Sources: Bureau of National Statistics KZ · World Bank · IMF Art. IV May 2025 · Moody's · Transparency International CPI 2023 · IQAir · WHO Observatory 2024 · Trading Economics · World Nuclear Association 2024 · RSF Press Freedom Index 2024 · World Justice Project 2024 · UNODC · Worldometer · Britannica · Data as of May 2026.
          </p>
        </div>

      </div>
    </>
  );
}
