const { useState, useEffect } = React;

// Turkmenistan flag colors: green (#009A44), red (#C8102E), with crescent & stars in white
const C = {
  tm:   '#009A44', tmL: '#00c857',   // primary — Turkmen green
  red:  '#C8102E', redL: '#f03050',   // secondary — Turkmen red (left stripe)
  yel:  '#F5C518', yelL: '#ffd84d',   // tertiary — warm accent / opportunity
  blu:  '#2E86DE', bluL: '#5ba8ff',   // water / cold / fiscal
  bg:   '#000',   card: '#111',  border: '#1e1e1e',
  track:'#222',   txt:  '#fff',  sub:   '#999',  dim: '#444',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,400&family=Inter:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { overflow-x: hidden; background: #000; }
  .dash { background:#000; color:#fff; font-family:'Inter',sans-serif; font-weight:300; line-height:1.6; padding: 0 22px 80px; max-width:1020px; margin:0 auto; overflow-x: hidden; }
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

const KpiCard = ({ label, value, sub, accent = C.tm, delay = 0 }) => {
  const valColor = accent === C.tm ? C.tmL : accent === C.red ? C.redL : accent === C.yel ? C.yelL : accent === C.blu ? C.bluL : C.txt;
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

const BarRow = ({ label, value, pct, color = C.tm }) => (
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

const DlRow = ({ mo, label, pct, color = C.tm, dark = false }) => (
  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
    <span style={{ fontSize:10, letterSpacing:'0.05em', textTransform:'uppercase', color:C.sub, width:24, flexShrink:0 }}>{mo}</span>
    <div style={{ flex:1, height:18, background:C.track, borderRadius:3, overflow:'hidden', minWidth:0 }}>
      <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:3, display:'flex', alignItems:'center', paddingLeft:6 }}>
        <span style={{ fontSize:9, fontWeight:500, color: dark ? '#000' : '#fff', whiteSpace:'nowrap', overflow:'hidden' }}>{label}</span>
      </div>
    </div>
  </div>
);

/* ── Gradient Bar ── */
const GradientBar = ({ title, values, colorStops, unit = '', height = 22, xLabels, fmt, invertPeak = false, absScale = false }) => {
  const defaultLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const labels = xLabels || defaultLabels;
  const n = values.length;
  const min = Math.min(...values), max = Math.max(...values);
  const absMax = Math.max(...values.map(Math.abs));
  const peakIdx = invertPeak ? values.indexOf(min) : values.indexOf(max);
  const pct = v => absScale ? (Math.abs(v) / absMax) * 100 : ((v - min) / (max - min)) * 100;
  const gradient = values.map((v, i) => {
    const p = pct(v);
    return `${colorStops(p, v)} ${(i / (n - 1)) * 100}%`;
  }).join(', ');
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

/* ── Age Structure Bar ── */
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
  const darkM = '#1a5fa0';
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

/* ── Turkmenistan Flag — green field, red left stripe with carpet gul motifs, crescent & stars ── */
const Flag = () => (
  <div style={{ width:90, height:54, borderRadius:3, overflow:'hidden',
    boxShadow:`0 4px 24px rgba(0,154,68,.40)`, flexShrink:0, position:'relative',
    display:'flex' }}>
    {/* Red stripe with carpet guls (simplified) */}
    <div style={{ width:16, background:C.red, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'space-around', paddingTop:3, paddingBottom:3 }}>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{ width:9, height:7, borderRadius:1, border:`1px solid rgba(255,255,255,0.5)`, background:'rgba(255,255,255,0.15)' }} />
      ))}
    </div>
    {/* Thin white divider */}
    <div style={{ width:2, background:'#fff' }} />
    {/* Green field */}
    <div style={{ flex:1, background:C.tm, display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
      {/* Crescent */}
      <svg width="20" height="20" viewBox="0 0 20 20">
        <path d="M10 2 A8 8 0 1 1 10 18 A5 5 0 1 0 10 2 Z" fill="white" />
        <circle cx="14" cy="5" r="1.2" fill="white" />
        <circle cx="16" cy="7.5" r="1.2" fill="white" />
        <circle cx="16.5" cy="10.5" r="1.2" fill="white" />
        <circle cx="15" cy="13" r="1.2" fill="white" />
        <circle cx="12.5" cy="15" r="1.2" fill="white" />
      </svg>
    </div>
  </div>
);

/* ══════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════ */
export default function Turkmenistan() {
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
        <div style={{ padding:'20px 0 0', display:'grid', gridTemplateColumns:'1fr minmax(0,96px)', alignItems:'end', gap:16, marginBottom:8 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:'0.28em', textTransform:'uppercase', color:C.tm, marginBottom:14 }}>Country Dashboard 2025</div>
            <h1 style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:'clamp(44px,9vw,96px)', lineHeight:0.9, letterSpacing:'-0.02em', marginBottom:16 }}>
              Turkme<em style={{ fontStyle:'italic', color:C.tm, fontWeight:400 }}>nistan</em>
            </h1>
            <p style={{ fontSize:14, color:C.sub, maxWidth:480, lineHeight:1.7 }}>
              A comprehensive data snapshot — geography, climate, population, economy, energy and politics — sourced from IMF, World Bank, ADB, Enerdata, Freedom House, and UN. Data quality caveats apply: Turkmenistan restricts statistical transparency.
            </p>
          </div>
          <div style={{ alignSelf:'flex-start', marginTop:6 }}>
            <Flag />
          </div>
        </div>


        {/* ── AT A GLANCE ── */}
        {(() => {
          const mapRef = React.useRef(null);
          const [mapLoaded, setMapLoaded] = React.useState(false);

          useEffect(() => {
            let cancelled = false;
            async function drawMap() {
              try {
                if (!document.getElementById('d3-cdn')) {
                  await new Promise((res, rej) => {
                    const s = document.createElement('script'); s.id='d3-cdn';
                    s.src='https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js';
                    s.onload=res; s.onerror=rej; document.head.appendChild(s);
                  });
                }
                if (!document.getElementById('topo-cdn')) {
                  await new Promise((res, rej) => {
                    const s = document.createElement('script'); s.id='topo-cdn';
                    s.src='https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js';
                    s.onload=res; s.onerror=rej; document.head.appendChild(s);
                  });
                }
                const world = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json').then(r=>r.json());
                if (cancelled) return;
                const d3=window.d3, topojson=window.topojson;
                const countries=topojson.feature(world,world.objects.countries);
                const W=960,H=540,TM=795;
                const proj=d3.geoMercator().center([59.6,39.2]).scale(2900).translate([W/2,H/2]);
                const path=d3.geoPath().projection(proj);
                const svg=d3.select(mapRef.current);
                svg.selectAll('*').remove();
                svg.append('rect').attr('width',W).attr('height',H).attr('fill','#1a3a5c');
                svg.append('g').selectAll('path').data(countries.features).join('path')
                  .attr('d',path).attr('fill',d=>+d.id===TM?C.tm:'#1a1a1a')
                  .attr('stroke','#fff').attr('stroke-width',0.3);
                const tmF=countries.features.find(d=>+d.id===TM);
                if(tmF) svg.append('path').datum(tmF).attr('d',path).attr('fill',C.tm).attr('stroke','#fff').attr('stroke-width',0.8);
                const labels=[
                  {name:'UZBEKISTAN',x:736,y:176},{name:'KAZAKHSTAN',x:885,y:79},
                  {name:'IRAN',x:345,y:426},{name:'AFGHANISTAN',x:818,y:455}
                ];
                labels.forEach(({name,x,y})=>{
                  svg.append('text').attr('x',x).attr('y',y).attr('text-anchor','middle')
                    .attr('fill','#fff').attr('font-size',12).attr('font-family','Inter,sans-serif')
                    .attr('letter-spacing',2).text(name);
                });
                const [ax,ay]=proj([58.38,37.95]);
                svg.append('circle').attr('cx',ax).attr('cy',ay).attr('r',6).attr('fill','#F5C518').attr('opacity',0.2);
                svg.append('circle').attr('cx',ax).attr('cy',ay).attr('r',3.5).attr('fill','#F5C518');
                svg.append('text').attr('x',ax+8).attr('y',ay+4).attr('fill','#F5C518')
                  .attr('font-size',22).attr('font-family','Inter,sans-serif').attr('font-weight',500).text('Ashgabat');
                if(!cancelled) setMapLoaded(true);
              } catch(e){console.error('map',e);}
            }
            drawMap();
            return ()=>{cancelled=true;};
          }, []);

          const fasvg = (vb, d) => <svg xmlns="http://www.w3.org/2000/svg" viewBox={vb} width="24" height="24" fill="#fff"><path d={d}/></svg>;

          const tiles = [
            { icon: fasvg('0 0 512 512', 'M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64L0 400c0 44.2 35.8 80 80 80l400 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 416c-8.8 0-16-7.2-16-16L64 64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z'), label: 'GDP', value: '$17.5B', note: 'World Bank 2024' },
            { icon: fasvg('0 0 320 512', 'M160 0c17.7 0 32 14.3 32 32l0 35.7c1.6 .2 3.1 .4 4.7 .7c.4 .1 .7 .1 1.1 .2l48 8.8c17.4 3.2 28.9 19.9 25.7 37.2s-19.9 28.9-37.2 25.7l-47.5-8.7c-31.3-4.6-58.9-1.5-78.3 6.2s-27.2 18.3-29 28.1c-2 10.7-.5 16.7 1.2 20.4c1.8 3.9 5.5 8.3 12.8 13.2c16.3 10.7 41.3 17.7 73.7 26.3l2.9 .8c28.6 7.6 63.6 16.8 89.6 33.8c14.2 9.3 27.6 21.9 35.9 39.5c8.5 17.9 10.3 37.9 6.4 59.2c-6.9 38-33.1 63.4-65.6 76.7c-13.7 5.6-28.6 9.2-44.4 11l0 33.4c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-34.9c-.4-.1-.9-.1-1.3-.2l-.2 0s0 0 0 0c-24.4-3.8-64.5-14.3-91.5-26.3c-16.1-7.2-23.4-26.1-16.2-42.2s26.1-23.4 42.2-16.2c20.9 9.3 55.3 18.5 75.2 21.6c31.9 4.7 58.2 2 76-5.3c16.9-6.9 24.6-16.9 26.8-28.9c1.9-10.6 .4-16.7-1.3-20.4c-1.9-4-5.6-8.4-13-13.3c-16.4-10.7-41.5-17.7-74-26.3l-2.8-.7s0 0 0 0C119.4 279.3 84.4 270 58.4 253c-14.2-9.3-27.5-22-35.8-39.6c-8.4-17.9-10.1-37.9-6.1-59.2C23.7 116 52.3 91.2 84.8 78.3c13.3-5.3 27.9-8.9 43.2-11L128 32c0-17.7 14.3-32 32-32z'), label: 'GDP per Capita', value: '$2,420', note: 'Lower-middle income' },
            { icon: fasvg('0 0 576 512', 'M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32l160 0c17.7 0 32 14.3 32 32l0 160c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-82.7L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160 384 160z'), label: 'GDP Growth', value: '8.6%', note: '2024 record pace' },
            { icon: fasvg('0 0 640 512', 'M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z'), label: 'Population', value: '6.2M', note: '2025 estimate' },
            { icon: fasvg('0 0 576 512', 'M0 112.5L0 422.3c0 18 10.1 35 27 41.3c87 32.5 174 10.3 261-11.9c79.8-20.3 159.6-40.7 239.3-18.9c23 6.3 48.7-9.5 48.7-33.4l0-309.9c0-18-10.1-35-27-41.3C462 15.9 375 38.1 288 60.3C208.2 80.6 128.4 100.9 48.7 79.1C25.6 72.8 0 88.6 0 112.5zM288 352c-44.2 0-80-43-80-96s35.8-96 80-96s80 43 80 96s-35.8 96-80 96zM64 352c35.3 0 64 28.7 64 64l-64 0 0-64zm64-208c0 35.3-28.7 64-64 64l0-64 64 0zM512 304l0 64-64 0c0-35.3 28.7-64 64-64zM448 96l64 0 0 64c-35.3 0-64-28.7-64-64z'), label: 'Currency', value: 'TMT Manat', note: '~3.5 TMT = $1' },
            { icon: fasvg('0 0 448 512', 'M0 80L0 229.5c0 17 6.7 33.3 18.7 45.3l176 176c25 25 65.5 25 90.5 0L418.7 317.3c25-25 25-65.5 0-90.5l-176-176c-12-12-28.3-18.7-45.3-18.7L48 32C21.5 32 0 53.5 0 80zm112 32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z'), label: 'Inflation', value: '~8%', note: '2025 IMF est.' },
            { icon: fasvg('0 0 576 512', 'M112 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm40 304l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-223.1L59.4 304.5c-9.1 15.1-28.8 20-43.9 10.9s-20-28.8-10.9-43.9l58.3-97c17.4-28.9 48.6-46.6 82.3-46.6l29.7 0c33.7 0 64.9 17.7 82.3 46.6l44.9 74.7c-16.1 17.6-28.6 38.5-36.6 61.5c-1.9-1.8-3.5-3.9-4.9-6.3L232 256.9 232 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-128-16 0zM432 224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zm59.3 107.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L432 345.4l-36.7-36.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L409.4 368l-36.7 36.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L432 390.6l36.7 36.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L454.6 368l36.7-36.7z'), label: 'Unemployment', value: '~3.5%', note: 'Official est.' },
            { icon: fasvg('0 0 576 512', 'M249.6 471.5c10.8 3.8 22.4-4.1 22.4-15.5l0-377.4c0-4.2-1.6-8.4-5-11C247.4 52 202.4 32 144 32C93.5 32 46.3 45.3 18.1 56.1C6.8 60.5 0 71.7 0 83.8L0 454.1c0 11.9 12.8 20.2 24.1 16.5C55.6 460.1 105.5 448 144 448c33.9 0 79 14 105.6 23.5zm76.8 0C353 462 398.1 448 432 448c38.5 0 88.4 12.1 119.9 22.6c11.3 3.8 24.1-4.6 24.1-16.5l0-370.3c0-12.1-6.8-23.3-18.1-27.6C529.7 45.3 482.5 32 432 32c-58.4 0-103.4 20-123 35.6c-3.3 2.6-5 6.8-5 11L304 456c0 11.4 11.7 19.3 22.4 15.5z'), label: 'Literacy', value: '99.7%', note: 'UNESCO 2023' },
            { icon: fasvg('0 0 640 512', 'M351.2 4.8c3.2-2 6.6-3.3 10-4.1c4.7-1 9.6-.9 14.1 .1c7.7 1.8 14.8 6.5 19.4 13.6L514.6 194.2c8.8 13.1 13.4 28.6 13.4 44.4l0 73.5c0 6.9 4.4 13 10.9 15.2l79.2 26.4C631.2 358 640 370.2 640 384l0 96c0 9.9-4.6 19.3-12.5 25.4s-18.1 8.1-27.7 5.5L431 465.9c-56-14.9-95-65.7-95-123.7L336 224c0-17.7 14.3-32 32-32s32 14.3 32 32l0 80c0 8.8 7.2 16 16 16s16-7.2 16-16l0-84.9c0-7-1.8-13.8-5.3-19.8L340.3 48.1c-1.7-3-2.9-6.1-3.6-9.3c-1-4.7-1-9.6 .1-14.1c1.9-8 6.8-15.2 14.3-19.9zm-62.4 0c7.5 4.6 12.4 11.9 14.3 19.9c1.1 4.6 1.2 9.4 .1 14.1c-.7 3.2-1.9 6.3-3.6 9.3L213.3 199.3c-3.5 6-5.3 12.9-5.3 19.8l0 84.9c0 8.8 7.2 16 16 16s16-7.2 16-16l0-80c0-17.7 14.3-32 32-32s32 14.3 32 32l0 118.2c0 58-39 108.7-95 123.7l-168.7 45c-9.6 2.6-19.9 .5-27.7-5.5S0 490 0 480l0-96c0-13.8 8.8-26 21.9-30.4l79.2-26.4c6.5-2.2 10.9-8.3 10.9-15.2l0-73.5c0-15.8 4.7-31.2 13.4-44.4L245.2 14.5c4.6-7.1 11.7-11.8 19.4-13.6c4.6-1.1 9.4-1.2 14.1-.1c3.5 .8 6.9 2.1 10 4.1z'), label: 'Religion', value: '~93% Muslim', note: 'Predominantly Sunni' },
            { icon: fasvg('0 0 640 512', 'M0 128C0 92.7 28.7 64 64 64l192 0 48 0 16 0 256 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64l-256 0-16 0-48 0L64 448c-35.3 0-64-28.7-64-64L0 128zm320 0l0 256 256 0 0-256-256 0zM178.3 175.9c-3.2-7.2-10.4-11.9-18.3-11.9s-15.1 4.7-18.3 11.9l-64 144c-4.5 10.1 .1 21.9 10.2 26.4s21.9-.1 26.4-10.2l8.9-20.1 73.6 0 8.9 20.1c4.5 10.1 16.3 14.6 26.4 10.2s14.6-16.3 10.2-26.4l-64-144zM160 233.2L179 276l-38 0 19-42.8zM448 164c11 0 20 9 20 20l0 4 44 0 16 0c11 0 20 9 20 20s-9 20-20 20l-2 0-1.6 4.5c-8.9 24.4-22.4 46.6-39.6 65.4c.9 .6 1.8 1.1 2.7 1.6l18.9 11.3c9.5 5.7 12.5 18 6.9 27.4s-18 12.5-27.4 6.9l-18.9-11.3c-4.5-2.7-8.8-5.5-13.1-8.5c-10.6 7.5-21.9 14-34 19.4l-3.6 1.6c-10.1 4.5-21.9-.1-26.4-10.2s.1-21.9 10.2-26.4l3.6-1.6c6.4-2.9 12.6-6.1 18.5-9.8l-12.2-12.2c-7.8-7.8-7.8-20.5 0-28.3s20.5-7.8 28.3 0l14.6 14.6 .5 .5c12.4-13.1 22.5-28.3 29.8-45L448 228l-72 0c-11 0-20-9-20-20s9-20 20-20l52 0 0-4c0-11 9-20 20-20z'), label: 'Language', value: 'Turkmen', note: 'Russian widely used' },
            { icon: fasvg('0 0 512 512', 'M228.3 469.1L47.6 300.4c-4.2-3.9-8.2-8.1-11.9-12.4l87 0c22.6 0 43-13.6 51.7-34.5l10.5-25.2 49.3 109.5c3.8 8.5 12.1 14 21.4 14.1s17.8-5 22-13.3L320 253.7l1.7 3.4c9.5 19 28.9 31 50.1 31l104.5 0c-3.7 4.3-7.7 8.5-11.9 12.4L283.7 469.1c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9zM503.7 240l-132 0c-3 0-5.8-1.7-7.2-4.4l-23.2-46.3c-4.1-8.1-12.4-13.3-21.5-13.3s-17.4 5.1-21.5 13.3l-41.4 82.8L205.9 158.2c-3.9-8.7-12.7-14.3-22.2-14.1s-18.1 5.9-21.8 14.8l-31.8 76.3c-1.2 3-4.2 4.9-7.4 4.9L16 240c-2.6 0-5 .4-7.3 1.1C3 225.2 0 208.2 0 190.9l0-5.8c0-69.9 50.5-129.5 119.4-141C165 36.5 211.4 51.4 244 84l12 12 12-12c32.6-32.6 79-47.5 124.6-39.9C461.5 55.6 512 115.2 512 185.1l0 5.8c0 16.9-2.8 33.5-8.3 49.1z'), label: 'Life Expectancy', value: '70.6 yrs', note: 'WHO 2023' },
            { icon: fasvg('0 0 512 512', 'M352 256c0 22.2-1.2 43.6-3.3 64l-185.3 0c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64l185.3 0c2.2 20.4 3.3 41.8 3.3 64zm28.8-64l123.1 0c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64l-123.1 0c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32l-116.7 0c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0l-176.6 0c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0L18.6 160C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192l123.1 0c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64L8.1 320C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6l176.6 0c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352l116.7 0zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6l116.7 0z'), label: 'HDI', value: '0.745', note: 'Rank 97 globally' },
            { icon: fasvg('0 0 512 512', 'M240.1 4.2c9.8-5.6 21.9-5.6 31.8 0l171.8 98.1L448 104l0 .9 47.9 27.4c12.6 7.2 18.8 22 15.1 36s-16.4 23.8-30.9 23.8L32 192c-14.5 0-27.2-9.8-30.9-23.8s2.5-28.8 15.1-36L64 104.9l0-.9 4.4-1.6L240.1 4.2zM64 224l64 0 0 192 40 0 0-192 64 0 0 192 48 0 0-192 64 0 0 192 40 0 0-192 64 0 0 196.3c.6 .3 1.2 .7 1.8 1.1l48 32c11.7 7.8 17 22.4 12.9 35.9S494.1 512 480 512L32 512c-14.1 0-26.5-9.2-30.6-22.7s1.1-28.1 12.9-35.9l48-32c.6-.4 1.2-.7 1.8-1.1L64 224z'), label: 'Government', value: 'Presidential', note: 'Authoritarian system' },
            { icon: fasvg('0 0 384 512', 'M372.5 256.5l-.7-1.9C337.8 160.8 282 76.5 209.1 8.5l-3.3-3C202.1 2 197.1 0 192 0s-10.1 2-13.8 5.5l-3.3 3C102 76.5 46.2 160.8 12.2 254.6l-.7 1.9C3.9 277.3 0 299.4 0 321.6C0 426.7 86.8 512 192 512s192-85.3 192-190.4c0-22.2-3.9-44.2-11.5-65.1zm-90.8 49.5c4.1 9.3 6.2 19.4 6.2 29.5c0 53-43 96.5-96 96.5s-96-43.5-96-96.5c0-10.1 2.1-20.3 6.2-29.5l1.9-4.3c15.8-35.4 37.9-67.7 65.3-95.1l8.9-8.9c3.6-3.6 8.5-5.6 13.6-5.6s10 2 13.6 5.6l8.9 8.9c27.4 27.4 49.6 59.7 65.3 95.1l1.9 4.3z'), label: 'Gas Reserves', value: 'World #4', note: '~7.5 trillion m³' },
            { icon: fasvg('0 0 512 512', 'M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8l0 378.1C394 378 431.1 230.1 432 141.4L256 66.8s0 0 0 0z'), label: 'Neutrality', value: 'UN Recognised', note: 'Permanent since 1995' },
            { icon: fasvg('0 0 512 512', 'M352 256c0 22.2-1.2 43.6-3.3 64l-185.3 0c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64l185.3 0c2.2 20.4 3.3 41.8 3.3 64zm28.8-64l123.1 0c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64l-123.1 0c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32l-116.7 0c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0l-176.6 0c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0L18.6 160C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192l123.1 0c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64L8.1 320C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6l176.6 0c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352l116.7 0zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6l116.7 0z'), label: 'Area', value: '488,100 km²', note: 'Mostly Karakum Desert' },
          ];

          return (
            <div style={{ margin:'28px 0 8px' }}>
              <div style={{ fontSize:10, letterSpacing:'0.28em', textTransform:'uppercase', color:C.sub, marginBottom:14 }}>At a glance</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:3 }}>
                {tiles.map(({ icon, label, value, note }) => (
                  <div key={label} style={{ background:C.tm, border:`1px solid ${C.border}`, padding:'14px 8px 12px', position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center' }}>
                    <div style={{ marginBottom:7, lineHeight:1 }}>{icon}</div>
                    <div style={{ fontSize:8.5, letterSpacing:'0.08em', textTransform:'uppercase', color:'#fff', marginBottom:4 }}>{label}</div>
                    <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:12, color:'#fff', marginBottom:3, wordBreak:'break-word' }}>{value}</div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.75)', lineHeight:1.3 }}>{note}</div>
                  </div>
                ))}
                <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:'14px 12px 12px', position:'relative', overflow:'hidden', gridColumn:'span 4' }}>
                  <div style={{ fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:8 }}>Shape & Location</div>
                  <div style={{ position:'relative', width:'100%', aspectRatio:'16/9', overflow:'hidden', borderRadius:4 }}>
                    <svg ref={mapRef} viewBox="0 0 960 540" style={{ width:'100%', height:'100%', display:'block' }} />
                    {!mapLoaded && <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:C.sub, fontSize:11 }}>Loading map…</div>}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ══ 1. GEOGRAPHY ══ */}
        <SectionHeader icon={Icons.mountain} label="Geography & Landscape" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Total Area" value="488,100 km²" sub="5th largest country in Central Asia; larger than Spain + Portugal" accent={C.dim} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Karakum Desert" value="~80%" sub="One of the world's largest sand deserts — covers most of the country" accent={C.yel} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Highest Peak" value="3,139 m" sub="Aýrybaba — Kugitang Range in far east (Lebap)" accent={C.tm} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Caspian Sea coastline" value="~1,768 km" sub="Western border; key for energy transport and trade" accent={C.blu} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Borders" value="5 countries" sub="Kazakhstan, Uzbekistan, Afghanistan, Iran, Caspian Sea" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Amu Darya river" value="2,400 km" sub="Shared with Uzbekistan; 90% of Turkmenistan's freshwater supply" accent={C.dim} delay={0.30} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Karakum Canal" value="1,375 km" sub="World's longest irrigation canal; diverts Amu Darya water" accent={C.dim} delay={0.35} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Arable land" value="~3.9%" sub="Desert conditions; all farming relies on irrigation" accent={C.dim} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Population density" value="~16 /km²" sub="Among the lowest in Asia; vast empty desert interior" accent={C.dim} delay={0.45} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Major Terrain Zones" icon={Icons.map}>
              <BarRow label="Karakum Desert (central & east)" value="~80%" pct={100} color={C.yel} />
              <BarRow label="Kopet Dag mountain range (south)" value="~10%" pct={12} color={C.tm} />
              <BarRow label="Amu Darya delta & Caspian plains" value="~7%" pct={9} color={C.blu} />
              <BarRow label="Irrigated oases & agricultural land" value="~3.9%" pct={5} color={C.dim} />
              <BarRow label="Kugitang & Barsuki uplands (east)" value="~3%" pct={4} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>80% desert coverage is extreme — only Saudi Arabia and Libya have comparable proportions among populous nations. The tiny irrigated oases along the Kopet Dag foothills and Amu Darya delta contain almost all agriculture and most of the population.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Water Bodies & Features" icon={Icons.water}>
              <Tbl rows={[
                ['Amu Darya (Oxus) River', '2,400 km; eastern border'],
                ['Caspian Sea (western border)', '1,768 km coastline'],
                ['Karakum Canal (irrigation)', '1,375 km; Soviet-era'],
                ['Lake Sarygamysh (saline)', '~3,500 km²'],
                ['Darvaza Gas Crater (Door to Hell)', 'Burning since 1971'],
                ['Repetek Biosphere Reserve', 'UNESCO 2023'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>90% of freshwater comes from the Amu Darya — extreme single-source dependence. The Karakum Canal, built in the Soviet era, enabled cotton farming but contributed to the Aral Sea catastrophe. The Darvaza gas crater (burning since 1971) is the country's most famous natural landmark, drawing rare eco-tourists.</p>
            </Panel>
          </div>
        </div>

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-3 d-flex"><RegCard name="Ashgabat" type="Capital · white marble city" desc="Population ~950K. World record for most white marble buildings. Kopet Dag foothills; sharp contrast with surrounding desert." stripe={C.tm} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Mary (Merv)" type="Ancient Silk Road · gas hub" desc="Ancient city of Merv (UNESCO). Near Galkynysh — world's 2nd largest gas field. Historic oasis city." stripe={C.yel} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Türkmenabat (Chärjew)" type="East · Uzbek border" desc="2nd largest city. On Amu Darya river. Trade gateway to Uzbekistan. Refinery and chemical industry." stripe={C.tm} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Balkan (Caspian coast)" type="Energy · Turkmenbashi" desc="Oil refining hub. Avaza beach resort (state-built). Caspian port; key for potential Trans-Caspian pipeline." stripe={C.blu} /></div>
        </div>

        {/* ══ 2. CLIMATE ══ */}
        <SectionHeader icon={Icons.cloudSun} label="Climate: Weather, Daylight & Rainfall" />

        <div className="row g-1 mb-4">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Annual Temp (Ashgabat)" value="17.5°C" sub="Continental desert; extreme hot summers, mild winters" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Record High" value="50°C" sub="Karakum desert interior; July extremes" accent={C.red} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Record Low" value="−36°C" sub="Northern Dashoguz region; winter cold snaps" accent={C.blu} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Annual Rainfall (Ashgabat)" value="~225 mm" sub="Semi-arid; Karakum gets as little as 80 mm; Kopet Dag 300 mm+" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Climate type" value="BWk / BSk" sub="Cold desert & steppe; extreme continental" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Wettest month (Ashgabat)" value="March ~72 mm" sub="Spring is the rainy season; summer virtually dry" accent={C.dim} delay={0.30} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Summer Jul–Aug" value="35–42°C" sub="Extreme heat; Karakum among hottest deserts in Asia" accent={C.red} delay={0.35} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Winter Dec–Feb" value="1–8°C" sub="Mild in south; harsh in northern Dashoguz (avg −2°C)" accent={C.blu} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Annual sunshine" value="~3,000 hrs" sub="One of the sunniest countries in Central Asia" accent={C.yel} delay={0.45} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Daylight Hours — Ashgabat (37.9°N)" icon={Icons.sun}>
              {[
                { mo:'Jan', label:'9h 51m', pct:38, color:C.blu },
                { mo:'Feb', label:'10h 59m', pct:46, color:C.blu },
                { mo:'Mar', label:'12h 12m', pct:55 },
                { mo:'Apr', label:'13h 32m', pct:66 },
                { mo:'May', label:'14h 38m', pct:77 },
                { mo:'Jun', label:'15h 12m ★', pct:100, color:C.yel, dark:true },
                { mo:'Jul', label:'14h 54m', pct:92 },
                { mo:'Aug', label:'13h 44m', pct:78 },
                { mo:'Sep', label:'12h 17m', pct:63 },
                { mo:'Oct', label:'10h 52m', pct:50 },
                { mo:'Nov', label:'9h 55m', pct:40, color:C.blu },
                { mo:'Dec', label:'9h 26m ★', pct:31, color:C.blu },
              ].map(r => <DlRow key={r.mo} mo={r.mo} label={r.label} pct={r.pct} color={r.color || C.tm} dark={r.dark} />)}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                ★ Summer solstice <strong style={{ color:C.yelL }}>15h 12m</strong> · Winter solstice <strong style={{ color:C.bluL }}>9h 26m</strong> · At 38°N — similar latitude to Turkey, Spain; intense summer solar radiation amplifies desert heat.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>3,000+ sunshine hours/year is exceptional. Ashgabat receives more summer sun than Madrid. This solar potential is almost entirely untapped — Turkmenistan relies 100% on gas for power generation despite theoretically ideal solar conditions.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Rainfall by Region" icon={Icons.rain}>
              <p style={{ fontSize:11, color:C.sub, marginBottom:11, letterSpacing:'0.04em' }}>Annual precipitation by zone</p>
              <BarRow label="Kopet Dag mountains (south)" value="300 mm" pct={100} color={C.tm} />
              <BarRow label="Ashgabat & foothills" value="~225 mm" pct={75} color={C.yel} />
              <BarRow label="Türkmenabat / Amu Darya" value="~150 mm" pct={50} color={C.blu} />
              <BarRow label="Karakum central desert" value="~80 mm" pct={27} color={C.dim} />
              <BarRow label="Northern Dashoguz (Aral region)" value="~100 mm" pct={33} color={C.dim} />
              <div style={{ height:1, background:C.border, margin:'14px 0' }} />
              <p style={{ fontSize:11, color:C.sub, marginBottom:11, letterSpacing:'0.04em' }}>Ashgabat monthly pattern</p>
              <BarRow label="March–April (wettest)" value="50–72 mm" pct={100} color={C.tm} />
              <BarRow label="Oct–Nov (secondary wet)" value="17–30 mm" pct={42} color={C.yel} />
              <BarRow label="Jun–Aug (virtually dry)" value="2–7 mm" pct={7} color={C.blu} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>225 mm/year is arid — comparable to Cairo or Las Vegas. The 80 mm Karakum interior is among the driest inhabited places on Earth. Without the Amu Darya and the Karakum Canal, agriculture would be impossible across 95% of the country.</p>
              <GradientBar title="Monthly avg temperature — Ashgabat (°C)" values={[4,6,11,18,24,30,33,32,25,18,11,5]} colorStops={tempColor} unit="°" />
              <GradientBar title="Monthly rainfall — Ashgabat (mm)" values={[30,32,72,55,30,6,3,2,7,25,28,30]} colorStops={rainColor} unit="mm" />
            </Panel>
          </div>
        </div>

        {/* ══ 3. POPULATION ══ */}
        <SectionHeader icon={Icons.people} label="Population & Demographics" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Population (2025 est.)" value="~7.55M" sub="Official data unreliable; real population may be lower (emigration)" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Urban Population" value="~54%" sub="Mostly Ashgabat; rapid forced relocation to capital" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Median Age" value="27.3 yrs" sub="Young population; 25% under 15 years" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Population Growth" value="~1.8% /yr" sub="Natural increase; net emigration estimated 1.5/1,000" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Life Expectancy" value="70.1 yrs" sub="Men 68.8 · Women 75.5 (2024 est.)" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Fertility Rate" value="~2.1" sub="At replacement level; declining from 3+ in 1990s" accent={C.blu} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Population Growth" icon={Icons.chart}>
              <BarRow label="1991 (independence)" value="3.7M" pct={49} color={C.dim} />
              <BarRow label="2000" value="4.5M" pct={60} color={C.dim} />
              <BarRow label="2010" value="5.3M" pct={70} color={C.blu} />
              <BarRow label="2020" value="6.3M" pct={84} color={C.yel} />
              <BarRow label="2025 est." value="~7.55M" pct={100} color={C.tm} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Growth from 3.7M to 7.5M since independence (+103%) is strong. However, official statistics are unreliable — the government has not published full census results. An estimated 1–2M Turkmen live abroad, primarily in Russia, Turkey, and Uzbekistan. The true domestic population may be closer to 6M.</p>
              <AgeBar
                title="Population age structure — male vs. female (% of total)"
                male={[5.9,5.5,4.8,4.2,3.9,3.7,3.3,2.9,2.5,2.1,1.8,1.5,1.1,0.7,0.4,0.5]}
                female={[5.6,5.2,4.6,4.0,3.7,3.6,3.3,2.9,2.6,2.2,1.9,1.7,1.4,0.9,0.6,0.8]}
                medianM={27.0}
                medianF={29.5}
              />
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Largest Cities (2024 est.)" icon={Icons.landmark}>
              <BarRow label="Ashgabat (capital)" value="~950,000" pct={100} color={C.tm} />
              <BarRow label="Türkmenabat (Chärjew)" value="~370,000" pct={39} color={C.yel} />
              <BarRow label="Daşoguz (Dashoguz)" value="~280,000" pct={29} color={C.blu} />
              <BarRow label="Mary (Merv)" value="~175,000" pct={18} color={C.dim} />
              <BarRow label="Balkanabat (Nebitdag)" value="~110,000" pct={12} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Ashgabat holds roughly 13% of the total population. The government has invested massively in the capital — white marble boulevards, world-record fountains, Olympic complexes — while regional cities remain underdeveloped. Urban-rural population movement is partly state-controlled.</p>
            </Panel>
          </div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Ethnic Composition (2025 est.)" icon={Icons.people}>
              <Donut
                label="7.5M"
                sublabel="population"
                segments={[
                  { label:'Turkmen',          value:'85%',  pct:85,  color:C.tm  },
                  { label:'Uzbek',            value:'5%',   pct:5,   color:C.yel },
                  { label:'Russian',          value:'4%',   pct:4,   color:C.blu },
                  { label:'Kazakh',           value:'1.8%', pct:1.8, color:'#888'},
                  { label:'Other minorities', value:'4.2%', pct:4.2, color:C.dim },
                ]}
              />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>85% Turkmen is one of the most ethnically homogeneous nations in Central Asia. The Russian population has fallen from ~18% in 1939 to ~4% today — steady emigration driven by economic stagnation and cultural restrictions. Ethnic minorities face significant restrictions on language and cultural expression under the current regime.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Religion & Language" icon={Icons.landmark}>
              <Tbl rows={[
                ['Islam (predominantly Sunni)', '~89%'],
                ['Christianity (Orthodox)', '~9%'],
                ['Other / none', '~2%'],
                ['State language', 'Turkmen'],
                ['Script', 'Latin (since 1993; Cyrillic still widely used)'],
                ['Russian language status', 'No official status since 1996'],
                ['Recognised ethnic groups', '27+'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>89% Muslim but religion is state-controlled — the regime regulates mosques and restricts religious expression while using Islamic imagery for legitimacy. The switch from Cyrillic to Latin in 1993 was abrupt; many citizens still use Cyrillic in everyday life. Russian has been systematically downgraded despite still being used widely in commerce.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 4. ECONOMY ══ */}
        <SectionHeader icon={Icons.chart} label="Economy & Finance" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP Nominal (2025 est.)" value="~$65B" sub="IMF/World Bank; official figures unreliable — state-controlled data" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP per Capita (2025)" value="~$8,250" sub="World Bank GNI per capita; upper-middle income classification" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP Growth (2024)" value="3.0%" sub="IMF Art. IV 2025; slowed from 4.5% in 2023; weak hydrocarbon exports" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP PPP (2025 est.)" value="~$150B" sub="PPP per capita ~$20,000 (IMF 2025 estimate)" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Inflation CPI (2024)" value="~3.8%" sub="Official; real inflation likely higher due to parallel forex market" accent={C.blu} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Currency" value="TMT (Manat)" sub="~3.5 TMT = $1 (official); parallel rate significantly weaker" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="GDP by Sector & Major Exports" icon={Icons.chart}>
              <Donut
                label="~$65B"
                sublabel="GDP 2025"
                segments={[
                  { label:'Industry (incl. gas & oil)', value:'~50%', pct:50, color:C.tm  },
                  { label:'Services',                   value:'~38%', pct:38, color:C.yel },
                  { label:'Agriculture (cotton, wheat)', value:'~12%', pct:12, color:C.blu },
                ]}
              />
              <div style={{ height:1, background:C.border, margin:'16px 0' }} />
              <BarRow label="Natural gas (pipeline to China)" value="~65% of exports" pct={100} color={C.tm} />
              <BarRow label="Crude oil & petroleum products" value="~20%" pct={31} color={C.yel} />
              <BarRow label="Petrochemicals & fertilizers" value="~8%" pct={12} color={C.blu} />
              <BarRow label="Cotton fiber & textiles" value="~5%" pct={8} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Natural gas at 65% of exports is extreme single-commodity dependency — comparable to Libya or Kuwait. China absorbs ~66% of all exports via the Central Asia–China Gas Pipeline. This bilateral lock-in gives China enormous pricing leverage. The 2020 gas price dispute with China forced a painful renegotiation that highlighted the structural vulnerability.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Economic Indicators" icon={Icons.briefcase}>
              <Tbl rows={[
                ['Govt debt / GDP (2024)', '3.6% — among lowest globally'],
                ['Budget surplus (2024)', '+0.8% of GDP'],
                ['Current account surplus (2024)', '+4.4% of GDP'],
                ['Tax revenue from oil & gas', '40.4% of total budget revenues'],
                ['SOE share of total turnover (2023)', '59.2% — highly state-dominated'],
                ['Foreign reserves (est.)', 'Opaque; official ~$4B+'],
                ['Main trading partner', 'China (66% of exports)'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>A 3.6% debt-to-GDP ratio is remarkably low — one of the lowest in the world. However this reflects gas windfalls rather than fiscal discipline; spending efficiency is poor. The IMF has not relied on Turkmenistan's official statistics since 2020–2021, using independent methodology instead — a significant credibility warning.</p>
            </Panel>
          </div>
        </div>

        <div className="row g-1 mb-3">
          <div className="col-12 col-md-4 d-flex">
            <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:'18px 14px', textAlign:'center', flex:1 }}>
              <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>Ashgabat City Centre</div>
              <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:18, color:C.tmL, marginBottom:3 }}>$600–900/m²</div>
              <div style={{ fontSize:11, color:C.sub }}>Premium Soviet & marble-era apartments; expat/diplomat demand</div>
            </div>
          </div>
          <div className="col-12 col-md-4 d-flex">
            <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:'18px 14px', textAlign:'center', flex:1 }}>
              <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>Ashgabat Suburbs / New Districts</div>
              <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:18, color:C.tmL, marginBottom:3 }}>$250–450/m²</div>
              <div style={{ fontSize:11, color:C.sub }}>State-built white marble complexes; growing but market opaque</div>
            </div>
          </div>
          <div className="col-12 col-md-4 d-flex">
            <div style={{ background:C.card, border:`1px solid ${C.border}`, padding:'18px 14px', textAlign:'center', flex:1 }}>
              <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>Regional Cities</div>
              <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:18, color:C.tmL, marginBottom:3 }}>$80–180/m²</div>
              <div style={{ fontSize:11, color:C.sub }}>Mary, Türkmenabat; market underdeveloped; private ownership restricted</div>
            </div>
          </div>
        </div>

        {/* ══ 5. EMPLOYMENT ══ */}
        <SectionHeader icon={Icons.briefcase} label="Employment & Wages" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Monthly Wage (est.)" value="~$500–700" sub="Official: ~$600 incl. subsidies; purchasing power distorted by price controls" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Labour Force" value="~2.4M" sub="~32% of population; large informal and subsistence sector" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Unemployment" value="~4.2%" sub="IMF/ILO 2024; real rate likely higher; underemployment widespread" accent={C.tm} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Public sector employment" value="~70%+" sub="Dominates economy; private sector extremely limited" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Minimum wage" value="~TMT 1,215" sub="~$350/month (official rate); subsidised goods compress cost of living" accent={C.blu} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Emigrant workers abroad" value="~1–2M est." sub="Mostly in Russia, Turkey; true figure concealed by government" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Employment by Sector" icon={Icons.chart}>
              <Donut
                label="~2.4M"
                sublabel="labour force"
                segments={[
                  { label:'Agriculture & livestock', value:'~44%', pct:44, color:C.yel },
                  { label:'Services & public sector', value:'~41%', pct:41, color:C.tm  },
                  { label:'Industry & construction',  value:'~15%', pct:15, color:C.blu },
                ]}
              />
              <div style={{ height:1, background:C.border, margin:'16px 0' }} />
              <Tbl rows={[
                ['Wage increase announced (2024)', '+10.6% nominal average'],
                ['Public sector wage share of GDP', 'High; but real value eroded by inflation'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>44% in agriculture is extremely high for an upper-middle-income country — it signals a largely subsistence and state-farm economy. The absence of a meaningful private sector (SOEs dominate 59% of turnover) means most employment is effectively state-directed. Independent unionisation is illegal.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Wages by Sector (estimated monthly)" icon={Icons.briefcase}>
              <BarRow label="Oil & gas industry" value="~TMT 3,500–5,000" pct={100} color={C.tm} />
              <BarRow label="Finance & banking" value="~TMT 2,500" pct={56} color={C.yel} />
              <BarRow label="Construction" value="~TMT 1,800" pct={40} color={C.blu} />
              <BarRow label="Public administration" value="~TMT 1,500" pct={34} color={C.dim} />
              <BarRow label="Education & health" value="~TMT 1,200–1,500" pct={30} color={C.dim} />
              <BarRow label="Agriculture" value="~TMT 800–1,000" pct={20} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Wage data in Turkmenistan is unreliable — the government sets wages centrally and prohibits independent labour reporting. A large parallel economy exists outside official statistics. The real standard of living is partially sustained by heavily subsidised energy, food, and utilities, which mask low nominal wages.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 6. EDUCATION ══ */}
        <SectionHeader icon={Icons.graduation} label="Education & Human Development" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Literacy Rate" value="~99.7%" sub="Soviet-era legacy; near-universal basic literacy" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="HDI (2023)" value="0.764" sub="High Human Development — rank 94th globally (UNDP 2023)" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Expected Schooling" value="~11.2 yrs" sub="Soviet system maintained; but quality deteriorated post-1991" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Education Spending" value="~3.1% GDP" sub="Below regional peers; curriculum controlled by state" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Universities" value="~30+" sub="Mostly state-run; international partnerships extremely limited" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Study abroad" value="Restricted" sub="Citizens face exit bans and bureaucratic obstacles to overseas study" accent={C.red} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Education Metrics" icon={Icons.graduation}>
              <BarRow label="Primary enrolment rate" value="~98%" pct={98} color={C.tm} />
              <BarRow label="Secondary completion rate" value="~88%" pct={88} color={C.yel} />
              <BarRow label="Tertiary enrolment" value="~25%" pct={25} color={C.blu} />
              <BarRow label="PISA participation" value="Not assessed" pct={20} color={C.dim} />
              <BarRow label="International accreditation" value="Very limited" pct={15} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Literacy near 100% is a genuine Soviet legacy achievement. However the quality of education has declined since 1991 — the school year was shortened to 9 years under Niyazov (partially reversed). Tertiary enrolment at ~25% is below Kazakhstan (55%) and Uzbekistan (~40%). Turkmenistan does not participate in international assessments (PISA, TIMSS).</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Education Facts" icon={Icons.landmark}>
              <Tbl rows={[
                ['Language of instruction', 'Turkmen (Russian phased out)'],
                ['School year', 'September to May'],
                ['University entrance', 'State-controlled; nepotism widespread'],
                ['Top study destinations (unofficial)', 'Russia, Turkey, Belarus'],
                ['Ruhnama', 'State ideology text; formerly mandatory'],
                ['Internet access in schools', 'Limited; internet widely censored'],
                ['Education reforms', 'Ongoing since 2022; quality uncertain'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Education under Niyazov was severely degraded — the Ruhnama (his spiritual guide) replaced core subjects. Berdimuhamedov reversed the most extreme distortions but the system remains ideologically controlled. Citizens who seek higher education abroad risk losing jobs and face returning to a non-functioning private labour market.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 7. POLITICAL LANDSCAPE ══ */}
        <SectionHeader icon={Icons.landmark} label="Political Landscape" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="System" value="Presidential" sub="Consolidated authoritarian; no independent institutions" accent={C.red} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="President" value="S. Berdimuhamedov" sub="Since March 2022; son of former president Gurbanguly" accent={C.yel} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="National Leader" value="G. Berdimuhamedov" sub="Father; chairs Halk Maslahaty (supreme body); retains real power" accent={C.tm} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Legislature (Mejlis)" value="125 seats" sub="Rubber-stamp; unicameral since 2023 constitutional change" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Freedom House Rating" value="Not Free (1/100)" sub="Consistently bottom-ranked; no political rights or civil liberties" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Independence" value="Oct 27, 1991" sub="From the Soviet Union; declared neutrality recognized by UN 1995" accent={C.blu} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="2022 Presidential Election Results" icon={Icons.landmark}>
              <BarRow label="Serdar Berdimuhamedov (official)" value="72.97%" pct={100} color={C.tm} />
              <BarRow label="Khydyr Nunnayev" value="11.09%" pct={15} color={C.yel} />
              <BarRow label="Agajan Bekmyradov" value="7.29%" pct={10} color={C.blu} />
              <BarRow label="Other candidates (5 total)" value="8.65%" pct={12} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Voter turnout officially reported at 97.12% — a figure that itself signals state fabrication. No international election observers assessed the vote as free or fair. The eight other candidates were considered non-competitive by all independent observers. RSF Press Freedom Index 2024: rank 175 of 180.</p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>A 73% result with 97% turnout matches the historical pattern of Soviet-era show elections. Gurbanguly Berdimuhamedov's son winning power continues Central Asia's only dynastic succession. The 2023 constitution elevated the Halk Maslahaty above the presidency, cementing the father's supreme authority.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Political Timeline" icon={Icons.chart}>
              {[
                { yr:'1991', tx:'Turkmenistan declares independence from USSR on Oct 27. Saparmurat Niyazov ("Turkmenbashi") continues as president.' },
                { yr:'1995', tx:'UN General Assembly recognises Turkmenistan\'s "permanent neutrality" — a unique foreign policy status.' },
                { yr:'2006', tx:'Niyazov dies suddenly. Gurbanguly Berdimuhamedov takes power, initially as acting president.' },
                { yr:'2008', tx:'New constitution eliminates the People\'s Council; Berdimuhamedov consolidates control with presidential powers expanded.' },
                { yr:'2022', tx:'Gurbanguly "retires" in favour of son Serdar Berdimuhamedov, who wins election with 73%. First dynastic succession in post-Soviet Central Asia.' },
                { yr:'2023', tx:'Constitutional changes create Halk Maslahaty as supreme governing body, chaired by Gurbanguly. Father retains real power.' },
              ].map(({ yr, tx }) => (
                <div key={yr} style={{ paddingLeft:16, borderLeft:`1px solid ${C.tm}`, marginBottom:14 }}>
                  <div style={{ fontSize:10, letterSpacing:'0.11em', color:C.yel, textTransform:'uppercase', marginBottom:2 }}>{yr}</div>
                  <div style={{ fontSize:12.5, color:'#888', lineHeight:1.6 }}>{tx}</div>
                </div>
              ))}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Turkmenistan is one of the world's most closed states — ranked alongside North Korea for press freedom (175/180). The dynastic transfer of power to Serdar while Gurbanguly retains supreme authority is a novel governance structure with no parallel in the post-Soviet space. Permanent neutrality status prevents NATO or CSTO membership.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 8. TOURISM ══ */}
        <SectionHeader icon={Icons.briefcase} label="Tourism" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="International Visitors" value="~10,000–20,000" sub="Extremely low; visa restrictions, limited access, no independent press" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Tourism Revenue" value="Minimal" sub="Not publicly reported; state controls all tourism infrastructure" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Top draw" value="Darvaza Crater" sub="'Door to Hell' — gas crater burning since 1971; remote Karakum" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Visa access" value="Extremely restrictive" sub="Prior approval required; letter of invitation mandatory; no e-visa for most" accent={C.red} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avaza resort (Caspian)" value="State-built" sub="$2B+ invested since 2007; mostly domestic tourists; few foreign visitors" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ancient Merv" value="UNESCO WHSite" sub="Inscribed 1999; one of Central Asia's greatest Silk Road cities" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Top Visitor Origins (est.)" icon={Icons.people}>
              {[
                { flag:'🇷🇺', country:'Russia',       val:'diaspora visits & business',           pct:'~30%' },
                { flag:'🇹🇷', country:'Turkey',       val:'business & construction workers',       pct:'~25%' },
                { flag:'🇨🇳', country:'China',        val:'gas pipeline & energy business',        pct:'~15%' },
                { flag:'🇺🇿', country:'Uzbekistan',   val:'cross-border; Amu Darya region',        pct:'~12%' },
                { flag:'🇩🇪', country:'Germany & EU', val:'adventure / Silk Road tourism',         pct:'~10%' },
                { flag:'🇺🇸', country:'USA',          val:'very limited; complex visa process',    pct:'~3%'  },
              ].map(({ flag, country, val, pct }) => (
                <div key={country} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0' }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{flag}</span>
                  <span style={{ fontSize:12.5, color:C.txt, flexShrink:0 }}>{country}</span>
                  <span style={{ fontSize:11, color:C.sub, flex:1 }}>{val}</span>
                  <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.txt, flexShrink:0 }}>{pct}</span>
                </div>
              ))}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Tourism is structurally suppressed. Visa requirements (invitation letter, government approval) make Turkmenistan one of the hardest countries to enter. Most "visitors" are business travelers and diaspora. True leisure tourism is tiny. The government has expressed interest in opening tourism but has taken no substantive steps.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Tourism Highlights" icon={Icons.landmark}>
              <Tbl rows={[
                ['Darvaza Gas Crater (Door to Hell)', 'Burning crater since 1971; remote'],
                ['Ancient Merv (Margush)', 'UNESCO WHS 1999; 4 millennia of history'],
                ['Nisa — ancient Parthian city', 'UNESCO WHS 1999'],
                ['Kunya-Urgench — medieval minaret', 'UNESCO WHS 2005'],
                ['Avaza National Tourist Zone', 'Caspian coast; $2B+ state investment'],
                ['Yangykala canyon', 'Spectacular red canyon; remote'],
                ['Köwata underground lake', 'Natural sulphurous underground lake'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Three UNESCO World Heritage sites, the iconic Door to Hell crater, and spectacular desert canyons give Turkmenistan genuinely world-class tourism assets. The bottleneck is entirely political — visa policy, no independent operators, state-controlled accommodation, and no internet access for visitors. The potential is enormous; the realisation is near-zero.</p>
              <GradientBar title="Tourism intensity by month (relative)" values={[31,34,69,92,85,54,38,38,62,100,69,28]} colorStops={p => `rgb(${Math.round(153+79*p/100)},${Math.round(153-128*p/100)},${Math.round(153-109*p/100)})`} unit="%" />
            </Panel>
          </div>
        </div>

        {/* ══ 9. VITAL STATISTICS ══ */}
        <SectionHeader icon={Icons.people} label="Vital Statistics" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Births (2024 est.)" value="~130,000" sub="Birth rate ~17.5 per 1,000 population; declining from 30+ in 1990s" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Natural Increase" value="~87,000" sub="Positive natural growth; offset partly by emigration" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ages 0–14" value="~25.4%" sub="Young but declining share — fertility rate approaching replacement" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ages 65+" value="~5.4%" sub="Very small elderly cohort; social security system underdeveloped" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Deaths (2024 est.)" value="~43,000" sub="Death rate ~5.8 per 1,000; lower than Central Asian peers" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Infant Mortality" value="~37.6 / 1,000" sub="Per 1,000 live births (2022); high — twice the global middle-income average" accent={C.red} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Causes of Death (est.)" icon={Icons.chart}>
              <BarRow label="Circulatory diseases"        value="~55%" pct={100} color={C.red}  />
              <BarRow label="Respiratory diseases"         value="~12%" pct={22}  color={C.yel} />
              <BarRow label="Neoplasms (cancer)"           value="~9%"  pct={16}  color={C.tm}  />
              <BarRow label="Digestive diseases"           value="~7%"  pct={13}  color={C.dim} />
              <BarRow label="Accidents & injuries"         value="~6%"  pct={11}  color={C.dim} />
              <BarRow label="Infectious & parasitic"       value="~5%"  pct={9}   color={C.dim} />
              <BarRow label="Other"                        value="~6%"  pct={11}  color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Cardiovascular disease at ~55% — above the global average of ~32% — reflects limited preventive care, high-salt diet, physical inactivity. Note: Turkmenistan's health data has historically been manipulated (COVID deaths denied in 2020). Infant mortality at 37.6/1,000 is strikingly high for an upper-middle income country — over 3× the global upper-middle income average of ~11/1,000.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Marriage & Vital Trends" icon={Icons.landmark}>
              <Tbl rows={[
                ['Marriage rate (est. per 1,000)', '~7.5'],
                ['Divorce rate (est. per 1,000)', '~1.2'],
                ['Avg age at first marriage (women)', '~22 yrs'],
                ['Avg age at first marriage (men)', '~24 yrs'],
                ['Maternal mortality ratio (est.)', '~50–65 per 100,000'],
                ['Child stunting (2019 MICS)', '~11%'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Maternal mortality of ~50–65 per 100,000 is high — reflecting poor access to quality obstetric care outside Ashgabat. Child stunting at 11% signals nutrition deficits in rural areas despite official claims of food security. All vital statistics carry significant reliability concerns — data is not independently verified and the government restricts international health monitors.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 10. ECONOMIC DEPTH ══ */}
        <SectionHeader icon={Icons.chart} label="Economic Depth & Fiscal Position" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Govt Debt / GDP (2024)" value="3.6%" sub="IMF Art. IV 2025; down from 5.8% in 2023 — extremely low" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Budget Surplus (2024)" value="+0.8% GDP" sub="IMF 2025; smaller than 2023 (+1.3%) due to lower gas revenues" accent={C.yel} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Current Account (2024)" value="+4.4% GDP" sub="IMF 2025; narrowed from +5.9% in 2023; hydrocarbon export slowdown" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Natural Gas Reserves" value="13–14 tcm" sub="4th largest proven reserves globally (BP / Cedigaz); Galkynysh field key" accent={C.blu} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gas Production (2024)" value="96.3 bcm" sub="Enerdata 2024; down 1.7% YoY; doubled since 2010" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Oil Reserves" value="0.6 Bbbl" sub="44th globally; daily production ~252,000 bbl; declining older fields" accent={C.dim} delay={0.30} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gas export to China (2024)" value="~66% of exports" sub="Central Asia–China Gas Pipeline (Lines A/B/C); Line D planned" accent={C.dim} delay={0.35} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Trade Balance (2024)" value="~Surplus" sub="Exports ~$10B vs imports ~$4B; but data unreliable" accent={C.dim} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="SOE dominance (2023)" value="59.2%" sub="Share of total economic turnover; private sector extremely limited" accent={C.dim} delay={0.45} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Top Export Destinations (2021 data)" icon={Icons.briefcase}>
              {[
                { flag:'🇨🇳', country:'China',       val:'dominant gas importer; Lines A/B/C',   pct:'~66%' },
                { flag:'🇹🇷', country:'Turkey',      val:'gas & petrochemicals',                 pct:'~9%'  },
                { flag:'🇺🇿', country:'Uzbekistan',  val:'gas, electricity, trade',              pct:'~9%'  },
                { flag:'🇬🇪', country:'Georgia',     val:'re-export & regional trade',           pct:'~3%'  },
                { flag:'🇷🇺', country:'Russia',      val:'residual gas & goods',                 pct:'~2%'  },
                { flag:'🇧🇷', country:'Brazil & EU', val:'petrochemicals, cotton',               pct:'~5%'  },
              ].map(({ flag, country, val, pct }) => (
                <div key={country} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0' }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{flag}</span>
                  <span style={{ fontSize:12.5, color:C.txt, flexShrink:0 }}>{country}</span>
                  <span style={{ fontSize:11, color:C.sub, flex:1 }}>{val}</span>
                  <span style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.txt, flexShrink:0 }}>{pct}</span>
                </div>
              ))}
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>China at 66% creates the most extreme bilateral export dependency of any energy-exporting nation. The 2020 price dispute — when China sharply cut purchase prices and volumes — caused a severe economic contraction. Diversification via TAPI (Turkmenistan–Afghanistan–Pakistan–India) pipeline and Trans-Caspian routes is strategically critical but blocked by geopolitics.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Fiscal Indicators" icon={Icons.chart}>
              <Tbl rows={[
                ['Gas revenue share of budget', '40.4% of total revenues (2024)'],
                ['Non-state sector tax share', 'Only 10.8% of revenues (2024)'],
                ['Govt debt / GDP (2024)', '3.6% — record low'],
                ['GDP growth (2024)', '3.0% — slowed from 4.5% in 2023'],
                ['Gas production (2024)', '96.3 bcm — down 1.7% YoY'],
                ['Galkynysh field reserves', '~26 tcm (world\'s 2nd largest single field)'],
                ['TAPI pipeline (planned)', '33 bcm/yr capacity; under development'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>40.4% of budget revenues from gas is dangerously concentrated — any China price cut or demand slowdown cascades immediately into fiscal stress. Non-state revenue at 10.8% reflects near-total absence of a private economy. Galkynysh at ~26 tcm is potentially one of the world's largest gas fields — a generational asset if monetised effectively.</p>
              <GradientBar title="Gas production 2015–2024 (bcm)" values={[72, 66, 62, 58, 62, 62, 72, 82, 98, 96]} xLabels={['2015','2016','2017','2018','2019','2020','2021','2022','2023','2024']} colorStops={p => { const r=Math.round(255-(255*p/100)); const g=Math.round(255-(101*p/100)); const b=Math.round(255-(188*p/100)); return `rgb(${r},${g},${b})`; }} fmt={v => `${v}B`} />
            </Panel>
          </div>
        </div>

        {/* ══ 11. ENERGY & RESOURCES ══ */}
        <SectionHeader icon={Icons.mountain} label="Energy & Resources" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gas Reserves (proven)" value="13–14 tcm" sub="4th largest globally; Galkynysh alone ~26 tcm (2nd largest field)" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gas Production (2024)" value="96.3 bcm" sub="Enerdata; doubled since 2010; potential far exceeds output" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gas to electricity" value="100%" sub="All electricity generated from natural gas; no hydro, solar, or nuclear" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Solar potential" value="Untapped" sub="3,000+ hrs/year sunshine; 0% solar in power mix despite ideal conditions" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Total energy consumption" value="43 Mtoe (2024)" sub="Enerdata; +6%/yr since 2020; heavily subsidised domestic prices" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Energy subsidy (domestic)" value="Near-zero tariffs" sub="Electricity, gas, water nearly free for citizens until 2019 reforms; still very cheap" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Energy Generation Mix (2024)" icon={Icons.chart}>
              <Donut
                label="Gas"
                sublabel="100% of power"
                segments={[
                  { label:'Natural gas (all power plants)',  value:'100%', pct:100, color:C.tm },
                  { label:'Renewables (solar/wind)',         value:'0%',   pct:0,   color:C.yel },
                  { label:'Other',                           value:'0%',   pct:0,   color:C.dim },
                ]}
              />
              <p style={{ fontSize:11, color:C.sub, marginTop:12, lineHeight:1.6 }}>100% dependence on a single fuel for power generation is structurally extreme — even more concentrated than oil-state peers. Domestic gas prices are among the world's cheapest, creating wasteful consumption. Energy intensity per unit of GDP is very high. TAPI pipeline (Turkmenistan–Afghanistan–Pakistan–India, 33 bcm/yr) remains under development.</p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Gas dominance creates paradox: Turkmenistan has ideal solar conditions (3,000+ hrs/year) but installs zero solar capacity because gas is so cheap domestically. The government aims to cut GHG 20% by 2030 — achievable only with renewable deployment. Methane flaring and leakage are additional climate concerns.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Energy & Resources Facts" icon={Icons.landmark}>
              <Tbl rows={[
                ['Galkynysh field (SE Turkmenistan)', 'World\'s 2nd largest gas field'],
                ['Oil production (daily, 2024 est.)', '~252,000 barrels/day'],
                ['Main oil fields', 'Cheleken, Nebit Dag, Caspian offshore'],
                ['Cotton production', 'Major crop; state-controlled harvest quota'],
                ['Sulphur & chemical minerals', 'Significant deposits; growing exports'],
                ['Trans-Caspian Gas Pipeline (TCGP)', 'Proposed; blocked by Iran/Russia'],
                ['TAPI pipeline (TM-AF-PK-IN)', '33 bcm capacity; under development'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The TAPI pipeline is Turkmenistan's most important strategic project — connecting to 1.5B+ people in South Asia. Iran and Russia have historically blocked the Trans-Caspian pipeline (competing gas routes). The Galkynysh field alone could supply Europe's entire gas demand for decades — the geopolitical barriers to monetisation, not resource scarcity, are the binding constraint.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 12. INFRASTRUCTURE & DIGITAL ══ */}
        <SectionHeader icon={Icons.map} label="Infrastructure & Digital Connectivity" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Internet Penetration" value="~34%" sub="Among the lowest in Central Asia; heavily censored and monitored" accent={C.red} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Mobile Subscribers" value="~9.5M" sub="Multiple SIMs common; 3G dominant; 4G expanding slowly" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Road Network" value="~58,500 km" sub="~18,000 km paved; improving with Chinese-funded projects" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Railway" value="~5,113 km" sub="Soviet-era + new; Lapis Lazuli corridor to Afghanistan/Europe" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="VPN usage" value="Very high" sub="Most social media and news sites blocked; VPNs widely used despite being illegal" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Internet censorship" value="Pervasive" sub="Among world's most censored; Freedom House rates internet 'Not Free'" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Key Infrastructure Projects" icon={Icons.map}>
              <Tbl rows={[
                ['TAPI Pipeline (TM-AF-PK-IN)', '33 bcm/yr; under construction in TM segment'],
                ['Central Asia–China Pipeline Line D', 'Planned; adds capacity via Tajikistan'],
                ['Lapis Lazuli Corridor (rail)', 'TM–AF–Iran–Turkey–Europe route'],
                ['Ashgabat Port expansion', 'Caspian; completed new terminal 2018'],
                ['Avaza Special Economic Zone', 'Caspian coast tourism & trade'],
                ['Turkmenistan–China gas metering', 'New measurement infrastructure 2022'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The Lapis Lazuli corridor is Turkmenistan's most ambitious connectivity play — linking Ashgabat to European markets via Afghanistan, Iran, and Turkey without passing through Russia or China. The limiting factor is Afghanistan's instability. TAPI, if completed, would be transformational for the entire region.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Digital Indicators" icon={Icons.chart}>
              <BarRow label="Internet penetration" value="~34%" pct={34} color={C.red} />
              <BarRow label="Mobile phone penetration" value="~125%" pct={100} color={C.tm} />
              <BarRow label="Social media blocked (WhatsApp, Telegram)" value="Yes" pct={80} color={C.yel} />
              <BarRow label="International news sites accessible" value="Most blocked" pct={70} color={C.dim} />
              <BarRow label="Fixed broadband penetration" value="~6%" pct={6} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                Internet monitored by TMCELL (state monopoly). VPNs illegal but widely used. Freedom House: "Not Free" (score 5/100). Mobile speeds: 10–20 Mbps typical.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>34% internet penetration vs Central Asian peers (Kazakhstan 91%, Uzbekistan 79%) reveals the digital isolation strategy. A state telecom monopoly allows complete surveillance of all communications. The digital gap suppresses productivity, education quality, and private sector formation.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 13. HEALTH SYSTEM ══ */}
        <SectionHeader icon={Icons.people} label="Health System" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Health Spending (% GDP)" value="~5.2%" sub="World Bank est.; public spending low; OOP significant" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Infant Mortality (2022)" value="37.6 / 1,000" sub="High for income level; 3× upper-middle-income average; improving slowly" accent={C.red} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Life expectancy (2023)" value="70.1 yrs" sub="Men 68.8 / Women 75.5; below Central Asian peers Kazakhstan & Uzbekistan" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="COVID transparency" value="Denied outbreak" sub="Govt refused to acknowledge COVID; cases reported only as 'pneumonia'" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="TB incidence (est.)" value="~55–80 / 100K" sub="Estimated; true data withheld; concern among aid organisations" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="International health access" value="Severely restricted" sub="WHO, MSF, and ICRC face access limitations; data unreliable" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Health System Facts" icon={Icons.people}>
              <Tbl rows={[
                ['Health system model', 'State-run; free in theory; OOP in practice'],
                ['COVID acknowledgement', 'Denied until 2021; cases coded as "pneumonia"'],
                ['Mental health care', 'Minimal; stigmatised; no independent advocacy'],
                ['Ashgabat polyclinics', 'Modern showpiece facilities; uneven quality'],
                ['Rural health access', 'Poor; significant urban-rural gap'],
                ['International NGO access', 'Restricted; MSF expelled 2010'],
                ['Maternal health programme', 'Active but data not publicly verifiable'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Turkmenistan denied the existence of COVID-19 throughout 2020, requiring citizens with symptoms to be hospitalized as "pneumonia" cases. This exemplifies the systemic problem — health data is a political instrument. Ashgabat has showcase polyclinics; rural areas lack basic supplies. The infant mortality rate of 37.6/1,000 is the clearest objective indicator of system failure.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Disease & Health Burden" icon={Icons.chart}>
              <BarRow label="Cardiovascular disease (share of deaths)" value="~55%" pct={100} color={C.red} />
              <BarRow label="Infant mortality /1,000 (vs peer avg ~11)" value="37.6" pct={74} color={C.yel} />
              <BarRow label="TB incidence / 100K (est.)" value="~55–80" pct={85} color={C.tm} />
              <BarRow label="Child stunting (2019 MICS)" value="~11%" pct={22} color={C.dim} />
              <BarRow label="OOP share of health spending" value="Significant" pct={45} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                Niyazov ordered the closure of all rural hospitals in 2005 (reversed by Berdimuhamedov). TB data is not shared with WHO, making the 55–80/100K estimate uncertain. Air quality in Ashgabat is affected by gas flaring and industry; no independent monitoring.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Infant mortality at 37.6/1,000 stands out as the most damning statistic for a country claiming upper-middle income status. For comparison, Kazakhstan is at ~8/1,000. The likely explanation is severe underfunding of rural perinatal care, combined with politically inflated income statistics.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 14. SOCIAL & INEQUALITY ══ */}
        <SectionHeader icon={Icons.people} label="Social Indicators & Inequality" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Poverty rate (official)" value="~0.2%" sub="2018 official; absurdly low — international estimates suggest 25–40% real poverty" accent={C.red} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="HDI (2023)" value="0.764 (rank 94)" sub="UNDP; 'High Human Development'; driven by income metric — other indicators lower" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gender restrictions (2022)" value="New laws enacted" sub="April 2022: significant new restrictions on women's clothing, movement, employment" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Women in parliament" value="~26%" sub="Quota system; parliament has no real power — decorative gender balance" accent={C.yel} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Freedom House (2024)" value="1 / 100" sub="Among worst globally alongside North Korea, Eritrea, Cuba" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Exit restrictions" value="Active" sub="Citizens under 40 restricted from leaving; travel bans used as control mechanism" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Social Cohesion & Gender" icon={Icons.people}>
              <Tbl rows={[
                ['Freedom House rating (2024)', '1/100 — "Not Free"'],
                ['Gender restrictions (2022)', 'Women barred from driving, new dress code'],
                ['LGBTQ+ rights', 'Illegal; criminalized; up to 2 years imprisonment'],
                ['Civil society', 'Practically nonexistent; GONGOs only'],
                ['Political prisoners', 'Hundreds estimated; conditions opaque'],
                ['Domestic violence laws', 'Weak; limited enforcement'],
                ['Exit bans', 'Citizens under 40 restricted from travel abroad'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The 2022 gender restrictions are particularly alarming: women were prohibited from driving, dress codes were tightened, and employment in certain sectors restricted. This represents a sharp regression even from the already repressive pre-2022 baseline. Combined with travel restrictions, Turkmenistan has the most constrained civil environment in Central Asia.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Access & Basic Services" icon={Icons.chart}>
              <BarRow label="Electricity access (national)" value="~100%" pct={100} color={C.tm} />
              <BarRow label="Access to clean water (urban)" value="~97%" pct={97} color={C.yel} />
              <BarRow label="Access to clean water (rural)" value="~83%" pct={83} color={C.dim} />
              <BarRow label="Access to sanitation (urban)" value="~93%" pct={93} color={C.blu} />
              <BarRow label="Access to sanitation (rural)" value="~62%" pct={62} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                Gas and electricity are nearly free for citizens — heavily subsidised since independence. Water from the Karakum Canal reaches most of the country. Despite these provision levels, the quality of services is poor and unreliable outside Ashgabat.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>100% electricity access and cheap energy are genuine social achievements — gas wealth enables universal provision. However the Amu Darya's water flow is declining, threatening the 90% dependence on this single source. Sanitation gaps in rural areas (38% without adequate sanitation) link to high child stunting and diarrhoeal disease.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 15. ENVIRONMENT ══ */}
        <SectionHeader icon={Icons.water} label="Environment & Climate" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="CO₂ per capita (est.)" value="~9–12 t" sub="High for income level; gas-intensive economy; near-zero renewables" accent={C.red} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GHG reduction target" value="20% by 2030" sub="NDC commitment; primarily through methane reduction and efficiency" accent={C.tm} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Aral Sea catastrophe" value="Active" sub="Northern Turkmenistan severely affected; desiccation ongoing; salt storms increasing" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Desertification trend" value="Accelerating" sub="Karakum expanding; Amu Darya flow declining due to upstream use" accent={C.yel} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Darvaza gas crater" value="Burning since 1971" sub="Soviet drilling accident; estimated 20M+ m³ gas wasted per year" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Methane leakage" value="Among worst globally" sub="OGCI satellite data; gas infrastructure leakage major climate concern" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Environmental Facts" icon={Icons.water}>
              <Tbl rows={[
                ['Aral Sea Turkmen sector', 'Almost entirely desiccated'],
                ['Cotton irrigation (Amu Darya)', 'Major contributor to Aral Sea loss'],
                ['Darvaza crater gas waste', '~20M m³/year burned (est.)'],
                ['Methane satellite ranking', 'Among top emitters per unit of GDP'],
                ['Protected areas (% territory)', '~3–4%'],
                ['CO₂ targets (NDC 2030)', '20% reduction below 2010 baseline'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The Aral Sea was once the world's 4th largest lake; now a salt flat. Turkmenistan's cotton irrigation — continuing the Soviet-era model — is a primary cause. Methane leakage from the gas network is a major unaddressed climate issue; satellite data (OGCI) consistently places Turkmenistan among the worst per-capita methane emitters.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Pollution & Environmental Risks" icon={Icons.chart}>
              <BarRow label="Methane leakage (gas infrastructure)" value="Very High" pct={90} color={C.red} />
              <BarRow label="Aral Sea desiccation impact" value="Severe in north" pct={80} color={C.yel} />
              <BarRow label="Desertification risk (land degradation)" value="High" pct={75} color={C.tm} />
              <BarRow label="Water scarcity risk (Amu Darya decline)" value="Increasing" pct={65} color={C.blu} />
              <BarRow label="Air quality (Ashgabat, industry)" value="Moderate concern" pct={40} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                Temperature in Turkmenistan has risen ~1°C in 25 years. Climate projections show the Karakum becoming even hotter and drier. A 2°C global warming scenario would place Ashgabat's summer highs above 50°C regularly — a potential civilizational threat.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Turkmenistan is in the paradoxical position of holding vast gas wealth while facing extreme climate vulnerability from that same gas use. The Darvaza crater alone wastes enough gas each year to supply thousands of homes. Addressing methane leakage is the highest-return climate intervention available.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 16. BUSINESS & INVESTMENT CLIMATE ══ */}
        <SectionHeader icon={Icons.briefcase} label="Business & Investment Climate" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Corporate tax rate" value="~8%" sub="Nominal rate; in practice state partnerships required for any meaningful business" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="FDI inflows (est.)" value="Very low" sub="No reliable data; dominated by gas sector investments from China/Russia" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ease of Doing Business" value="Not ranked" sub="World Bank halted Doing Business rankings; conditions among worst in region" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Corruption Index (CPI 2024)" value="~18 / 100" sub="Transparency International; rank ~169/180 — among the world's most corrupt" accent={C.red} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Property rights" value="Very weak" sub="State owns all land; private property in housing permitted but insecure" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Dual exchange rate" value="Active" sub="Official 3.5 TMT/$1 vs parallel market; creates corruption opportunities" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Investment Climate Summary" icon={Icons.briefcase}>
              <Tbl rows={[
                ['CPI score (est. 2024)', '~18/100 — rank ~169/180'],
                ['Freedom House economic freedom', 'Near-zero private sector'],
                ['IMF data reliability warning', 'Active since 2020/21'],
                ['State ownership of key sectors', 'Gas, oil, telecoms, banking, land'],
                ['International joint ventures', 'Required for most investments; risky'],
                ['Dual exchange rate premium', 'Significant; distorts business calc.'],
                ['WTO membership', 'Observer since 1994; not a full member'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>A CPI score of ~18/100 places Turkmenistan among the bottom 10 countries globally for corruption — comparable to South Sudan and Venezuela. The dual exchange rate enables systematic extraction from any business dealing with foreign currency. Most significant foreign investments require sharing revenues with state entities controlled by the Berdimuhamedov family.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Risks & Opportunities" icon={Icons.chart}>
              <BarRow label="Corruption & opacity risk" value="Extreme" pct={95} color={C.red} />
              <BarRow label="Political risk (no rule of law)" value="Very High" pct={90} color={C.yel} />
              <BarRow label="Natural gas opportunity (4th reserves)" value="Enormous" pct={100} color={C.tm} />
              <BarRow label="TAPI pipeline potential" value="Transformational" pct={85} color={C.dim} />
              <BarRow label="Solar energy potential (untapped)" value="Very high" pct={80} color={C.dim} />
              <BarRow label="Agri-processing & fertilizers" value="Growing" pct={45} color={C.blu} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>The fundamental Turkmenistan paradox: extraordinary resource endowment (4th gas reserves globally, ideal solar, strategic transit position) combined with among the world's worst governance environment. International energy companies (Eni, Petronas, ExxonMobil) operate only via tightly controlled joint ventures. Genuine diversification requires political reform that the regime has no incentive to pursue.</p>
            </Panel>
          </div>
        </div>

        {/* ══ 17. CRIME & SECURITY ══ */}
        <SectionHeader icon={Icons.landmark} label="Crime & Security" />

        <div className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Global Peace Index (2024)" value="~Rank 91" sub="IEP 2024; medium peace; authoritarian stability suppresses visible crime" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Press Freedom (RSF 2024)" value="Rank 175/180" sub="5th worst globally; alongside North Korea, Vietnam, China" accent={C.red} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Terrorism index" value="Very Low" sub="No independent terrorism recorded; regime suppresses all dissent violently" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Political prisoners" value="Hundreds est." sub="Exact numbers unknown; enforced disappearances documented by Amnesty" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Drug trafficking risk" value="High transit" sub="Afghanistan corridor; Central Asian drug route; law enforcement politicised" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Torture in detention" value="Documented" sub="Amnesty International, HRW; systematic use of torture; no independent oversight" accent={C.dim} delay={0.30} /></div>
        </div>

        <div className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Crime & Security Indicators" icon={Icons.landmark}>
              <Tbl rows={[
                ['Homicide rate (est.)', 'Very low reported; unreliable data'],
                ['Political prisoners (Amnesty est.)', 'Hundreds; possibly 2,000+'],
                ['Enforced disappearances', 'Documented ongoing practice'],
                ['Drug trafficking', 'Afghanistan–Russia corridor transits TM'],
                ['Border security', 'Highly militarised; shoot-to-kill reported'],
                ['Foreign journalists', 'Banned; none based in-country'],
              ]} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Reported crime is very low — but this reflects total information control, not genuine safety. Political opponents face disappearance, torture, and imprisonment without trial. The border with Afghanistan is one of the world's most militarised. Drug trafficking through Turkmenistan is significant — the regime profits from selective enforcement rather than genuine interdiction.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Security Context" icon={Icons.chart}>
              <BarRow label="Corruption (CPI, 100=clean)" value="~18 / 100" pct={18} color={C.red} />
              <BarRow label="Press freedom (100=free, est.)" value="~3 / 100" pct={3} color={C.yel} />
              <BarRow label="Rule of law (WJP, 100=best)" value="~10 / 100" pct={10} color={C.tm} />
              <BarRow label="Civil liberties (Freedom House)" value="1 / 40" pct={2} color={C.dim} />
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>
                Turkmenistan is consistently ranked as one of the world's most repressive states — comparable to North Korea and Eritrea. The Berdimuhamedov family controls all state institutions, the media, the security forces, and all significant economic assets. No independent civil society, opposition party, or free press exists. Amnesty International reports enforced disappearances as standard practice for political opponents.
              </p>
              <p style={{ fontSize:11, color:C.sub, marginTop:10, lineHeight:1.6 }}>Press freedom rank 175/180 — worse than Russia, China, and Iran — underscores the information blackout. All indicators of civil freedom are at or near zero. The paradox is that gas wealth funds a stable authoritarian system that has no incentive to reform. GDP growth disguises zero social or political development.</p>
            </Panel>
          </div>
        </div>

        <div style={{ padding:'8px 0 0', marginTop:8 }}>
          <p style={{ fontSize:10.5, color:'#555', lineHeight:1.7 }}>
            Sources: IMF Art. IV 2025 · World Bank · ADB Country Partnership Strategy 2024–2028 · Enerdata 2024 · Freedom House 2024 · RSF Press Freedom Index 2024 · Transparency International CPI 2024 · UNDP HDR 2023 · Oxford Institute for Energy Studies 2024 · Worldometer · CIA World Factbook · UN WPP 2024 · BTI 2026 Turkmenistan Report · Note: Data quality is limited — Turkmenistan restricts independent statistical verification. All figures should be treated with caution. Data as of May 2026.
          </p>
        </div>

      </div>
    </>
  );
}
