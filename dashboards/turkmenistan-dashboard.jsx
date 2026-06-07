const { useState, useEffect } = React;

/* ── Political Era Timeline data ── */
const ERAS = [
  { id:'russian', label:'Russian Empire', short:'Tsarist Rule', start:1900, end:1917, color:'#8B5E3C', colorL:'#b07d52',
    desc:'Transcaspia and Merv under Tsarist colonial rule. The region was incorporated into the Russian Empire in the 1880s. Cotton cultivation expanded. Trans-Caspian Railway linked Ashgabat to the wider empire.',
    events:['1881 — Battle of Geok Tepe; Russian conquest complete','1885 — Mary (Merv) annexed; Trans-Caspian Railway construction begins','1905 — Railway reaches Tashkent; trade corridor established'] },
  { id:'civil', label:'Revolutionary Period', short:'Revolution & Resistance', start:1917, end:1924, color:'#C8102E', colorL:'#f03050',
    desc:'Bolshevik takeover. Basmachi resistance fought Soviet rule across Central Asia. British forces briefly occupied Ashgabat (1918–1919) in opposition to the Bolsheviks. Short-lived Ashgabat Committee attempted independence.',
    events:['1917 — Bolsheviks seize power; Ashgabat Committee declares autonomy','1918–1919 — British occupation of Ashgabat (anti-Bolshevik)','1920 — Red Army secures Transcaspia; Soviet power established'] },
  { id:'early_soviet', label:'Early Soviet', short:'Turkmen SSR Founded', start:1924, end:1953, color:'#C8102E', colorL:'#f03050',
    desc:'Turkmen SSR established 1924. Forced collectivisation and cotton monoculture imposed. Karakum Canal construction began. Stalinist purges decimated local leadership. WWII: Turkmen soldiers served in Red Army.',
    events:['1924 — Turkmen SSR created','1930s — Forced collectivisation; cotton monoculture','1937–38 — Stalinist purges; local elites eliminated','1954 — Karakum Canal construction begins (Soviet-era megaproject)'] },
  { id:'mature_soviet', label:'Soviet Maturity', short:'Khrushchev–Brezhnev Era', start:1953, end:1985, color:'#E8192C', colorL:'#ff3347',
    desc:'Relative stability. Natural gas discovered and developed on massive scale. Karakum Canal extended across the republic. Ashgabat rebuilt after the devastating 1948 earthquake. Gas pipeline to Russia established.',
    events:['1948 — Ashgabat earthquake kills 110,000–176,000','1966 — Major gas fields opened; pipeline to USSR established','1981 — Karakum Canal fully completed — 1,375 km'] },
  { id:'glasnost', label:'Glasnost & Perestroika', short:'Late Soviet', start:1985, end:1991, color:'#F0B830', colorL:'#ffd060',
    desc:'Gorbachev reforms allow limited openness. Turkmen national consciousness rises slowly. Saparmurat Niyazov becomes First Secretary 1985. Referendum on Union Treaty (March 1991) heavily favoured preserving the USSR.',
    events:['1985 — Niyazov becomes First Secretary of Turkmen Communist Party','1990 — Sovereignty declared','1991 — Referendum (March): 97.9% voted to preserve reformed USSR'] },
  { id:'independence', label:'Independence', short:'Post-Soviet Transition', start:1991, end:2000, color:'#009A44', colorL:'#00c857',
    desc:'Independence declared 27 Oct 1991. Niyazov becomes president for life (Turkmenbashi — "Father of Turkmen"). Cult of personality begins immediately. "Eternal Neutrality" status granted by UN 1995. Economy stabilised by gas exports.',
    events:['1991 — Independence declared (27 Oct)','1992 — New Constitution; Niyazov president for life','1995 — UN grants Turkmenistan permanent neutrality status','1999 — Parliament declares Niyazov president for life (again)'] },
  { id:'niyazov', label:'Niyazov Era', short:'Turkmenbashi Cult', start:2000, end:2006, color:'#555', colorL:'#777',
    desc:'Most extreme cult of personality in post-Soviet space. Ruhnama (Book of the Soul) made mandatory reading for all state exams. Month and day names renamed after Niyazov and his family. Golden rotating statue in Ashgabat. Internet near-nonexistent.',
    events:['2002 — Assassination attempt on Niyazov (Oct); mass arrests follow','2002 — Month names changed: Jan → Turkmenbashi, Apr → Gurbansoltan','2005 — All hospitals outside Ashgabat closed','2006 — Niyazov dies of heart failure (Dec 21)'] },
  { id:'berdymukhamedov_g', label:'Gurbanguly Era', short:'Managed Opening', start:2007, end:2022, color:'#009A44', colorL:'#00c857',
    desc:'Gurbanguly Berdimuhamedov becomes president. Some loosening: hospitals reopened, Ruhnama dethroned, month names restored. New Ashgabat marble city construction intensified. China pipeline (CAGP) opened 2009. Still deeply authoritarian.',
    events:['2007 — Berdimuhamedov elected; hospitals reopened','2009 — Central Asia–China Gas Pipeline opens; game-changer for exports','2015 — Guinness record: most white marble buildings in Ashgabat','2022 — Gurbanguly elevated to Khalk Maslahaty chair; son Serdar elected president'] },
  { id:'serdar', label:'Serdar Era', short:'Dynasty Continues', start:2022, end:2025, color:'#009A44', colorL:'#00c857',
    desc:'Serdar Berdimuhamedov (son) elected president March 2022. Father Gurbanguly retains power as "National Leader" and Khalk Maslahaty (supreme body) chair. Dynastic power transfer unique in Central Asia. Economy stable on gas revenues.',
    events:['2022 — Serdar elected president (73% vote)','2023 — Gurbanguly declared "Arkadagy" (Beloved Patron) by constitution','2023 — Unicameral Mejlis replaces bicameral legislature','2024 — New Iran gas deal signed; 10 bcm/year'] },
];
const ERA_TOTAL = 2025 - 1900;

// Turkmenistan flag: green (#009A44) with crescent & 5 stars; red carpet stripe (left)
const C = {
  tm:   '#009A44', tmL: '#00c857',   // primary — Turkmen green
  yel:  '#F5C518', yelL: '#ffd84d',  // secondary — gold/star
  blu:  '#2E86DE', bluL: '#5ba8ff',  // water / depth
  red:  '#C8102E', redL: '#f03050',  // heat / record high
  bg:   '#000',   card: '#111',  border: '#1e1e1e',
  track:'#222',   txt:  '#fff',  sub:   '#999',  dim: '#444',
};

const tempColor = (p) => {
  const r = Math.round(46  + (232-46) * p/100);
  const g = Math.round(134 + (25 -134)* p/100);
  const b = Math.round(222 + (25 -222)* p/100);
  return `rgb(${r},${g},${b})`;
};
const rainColor = p => `rgb(${Math.round(153-107*p/100)},${Math.round(153-19*p/100)},${Math.round(153+69*p/100)})`;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,400&family=Inter:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { overflow-x: hidden; }
  body { background: #000; }
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

const SectionHeader = ({ icon, label }) => (
  <div id="section" className="row my-3">
    <div className="col-12 d-flex align-items-center gap-2">
      <span style={{ color:C.txt, fontSize:16, flexShrink:0 }}>{icon}</span>
      <span style={{ fontSize:13, letterSpacing:'0.18em', textTransform:'uppercase', color:C.txt, fontWeight:500 }}>{label}</span>
    </div>
  </div>
);

const KpiCard = ({ label, value, sub, accent = C.tm, delay = 0, size = 18 }) => {
  const valColor = accent === C.tm ? C.tmL : accent === C.yel ? C.yelL : accent === C.red ? C.redL : accent === C.blu ? C.bluL : C.txt;
  return (
    <div className="kpi" style={{
      background:C.card, border:`1px solid ${C.border}`, padding:'18px 15px 15px',
      position:'relative', overflow:'hidden', animationDelay:`${delay}s`, width:'100%', flex:1
    }}>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:accent }} />
      <div style={{ fontSize:10, letterSpacing:'0.11em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:size, lineHeight:1, marginBottom:4, color:valColor, wordBreak:'break-word' }}>{value}</div>
      <div style={{ fontSize:11, color:C.sub, lineHeight:1.4 }}>{sub}</div>
    </div>
  );
};

const Panel = ({ title, icon, children }) => (
  <div id="panel" style={{ background:C.card, border:`1px solid ${C.border}`, padding:'20px 20px', height:'100%' }}>
    <div id="title" style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:13, color:C.txt, marginBottom:16, paddingBottom:11, borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:8 }}>
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
  <table id="paneltbl" style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
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
    <div id="subnote" style={{ fontSize:12, color:'#888', lineHeight:1.6 }}>{desc}</div>
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

const GradientBar = ({ title, values, colorStops, unit = '', height = 22, xLabels, fmt, absScale = false }) => {
  const defaultLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const labels = xLabels || defaultLabels;
  const n = values.length;
  const min = Math.min(...values), max = Math.max(...values);
  const absMax = Math.max(...values.map(Math.abs));
  const peakIdx = values.indexOf(max);
  const pct = v => absScale ? (Math.abs(v) / absMax) * 100 : ((v - min) / (max - min)) * 100;
  const gradient = values.map((v, i) => {
    const p = pct(v);
    return `${colorStops(p, v)} ${(i / (n - 1)) * 100}%`;
  }).join(', ');
  const usePeakIdx = absScale ? values.reduce((a,b,i,arr) => Math.abs(arr[i]) > Math.abs(arr[a]) ? i : a, 0) : peakIdx;
  const peakPct = Math.max(1, Math.min(99, (usePeakIdx / (n - 1)) * 100));
  const labelColor = C.sub;
  const peakColor = colorStops(100, absScale ? values[usePeakIdx] : max).replace(/rgb\((\d+),(\d+),(\d+)\)/, (_, r, g, b) => `rgb(${Math.round(r*0.45)},${Math.round(g*0.45)},${Math.round(b*0.45)})`);
  return (
    <div style={{ marginTop:14 }}>
      {title && <div style={{ fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:C.sub, marginBottom:6 }}>{title}</div>}
      <div style={{ position:'relative' }}>
        <div style={{ height, borderRadius:4, overflow:'hidden', background:`linear-gradient(to right, ${gradient})` }} />
        <div style={{ position:'absolute', top:'10%', height:'80%', left:`${peakPct}%`, width:1, background:peakColor, transform:'translateX(-50%)', borderRadius:1, top:Math.round(height*0.1), height:Math.round(height*0.8) }} />
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


const Donut = ({ label, sublabel, segments }) => {
  const cx = 60, cy = 60, r = 44, stroke = 16;
  const total = segments.reduce((s, seg) => s + seg.pct, 0);
  let cumulative = 0;
  const slices = segments.map(seg => {
    const dash = (seg.pct / total) * 2 * Math.PI * r;
    const gap = 2 * Math.PI * r - dash;
    const rot = (cumulative / total) * 360 - 90;
    cumulative += seg.pct;
    return { ...seg, dash, gap, rot };
  });
  return (
    <div style={{ display:'flex', gap:16, alignItems:'center', flexWrap:'wrap' }}>
      <div style={{ position:'relative', width:120, height:120, flexShrink:0 }}>
        <svg viewBox="0 0 120 120" style={{ width:'100%', height:'100%' }}>
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

/* Turkmenistan flag: green with left red carpet stripe, crescent & 5 stars */
const Flag = () => (
  <div style={{ width:90, height:54, borderRadius:3, overflow:'hidden',
    boxShadow:`0 4px 24px rgba(0,154,68,.45)`, flexShrink:0, position:'relative', display:'flex' }}>
    {/* Red carpet stripe on left (~1/5 width) */}
    <div style={{ width:'20%', background:'#C8102E', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', gap:2 }}>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{ width:8, height:4, borderRadius:1, background:'rgba(255,255,255,0.3)' }} />
      ))}
    </div>
    {/* Main green field */}
    <div style={{ flex:1, background:'#009A44', display:'flex', alignItems:'center', paddingLeft:6 }}>
      <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
        {/* Crescent */}
        <path d="M8 12 A5 5 0 0 1 18 12 A4 4 0 0 0 8 12Z" fill="#fff" />
        {/* 5 stars */}
        {[0,1,2,3,4].map(i => (
          <text key={i} x={21} y={3 + i*5} fontSize="4" fill="#fff" textAnchor="middle">&#9733;</text>
        ))}
      </svg>
    </div>
  </div>
);

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

        {/* TOP */}
        <div id="top" style={{ padding:'20px 0 0', display:'grid', gridTemplateColumns:'1fr minmax(0,96px)', alignItems:'end', gap:16, marginBottom:8 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:'0.28em', textTransform:'uppercase', color:C.tm, marginBottom:14 }}>Country Dashboard 2025</div>
            <h1 style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:'clamp(44px,9vw,96px)', lineHeight:0.9, letterSpacing:'-0.02em', marginBottom:16 }}>
              Turkme<em style={{ fontStyle:'italic', color:C.tm, fontWeight:400 }}>nistan</em>
            </h1>
            <p style={{ fontSize:14, color:C.sub, maxWidth:480, lineHeight:1.7 }}>
              A comprehensive data snapshot — geography, climate, population, economy, employment, education and politics — sourced from World Bank, IMF, UN agencies, and verified data providers.
            </p>
          </div>
          <div style={{ alignSelf:'flex-start', marginTop:6 }}><Flag /></div>
        </div>

        {/* ── AT A GLANCE ── */}
        {(() => {
          const mapRef = React.useRef(null);
          const [mapLoaded, setMapLoaded] = React.useState(false);

          React.useEffect(() => {
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
                const proj=d3.geoMercator().center([58.5,39.5]).scale(2600).translate([W/2,H/2]);
                const path=d3.geoPath().projection(proj);
                const svg=d3.select(mapRef.current);
                svg.selectAll('*').remove();
                svg.append('rect').attr('width',W).attr('height',H).attr('fill','#0a1a2c');
                svg.append('g').selectAll('path').data(countries.features).join('path')
                  .attr('d',path).attr('fill',d=>+d.id===TM?C.tm:'#1a1a1a')
                  .attr('stroke','#fff').attr('stroke-width',0.3);
                const tmF=countries.features.find(d=>+d.id===TM);
                if(tmF) svg.append('path').datum(tmF).attr('d',path).attr('fill',C.tm).attr('stroke','#fff').attr('stroke-width',0.8);
                const labels=[
                  {name:'UZBEKISTAN',x:760,y:160},{name:'KAZAKHSTAN',x:530,y:90},
                  {name:'AFGHANISTAN',x:800,y:450},{name:'IRAN',x:530,y:500},
                  {name:'CASPIAN SEA',x:145,y:250}
                ];
                labels.forEach(({name,x,y})=>{
                  svg.append('text').attr('x',x).attr('y',y).attr('text-anchor','middle')
                    .attr('fill','#fff').attr('font-size',12).attr('font-family','Inter,sans-serif')
                    .attr('letter-spacing',2).text(name);
                });
                const axy=proj([58.38,37.95]);
                const ax=axy[0], ay=axy[1];
                svg.append('circle').attr('cx',ax).attr('cy',ay).attr('r',6).attr('fill',C.yel).attr('opacity',0.2);
                svg.append('circle').attr('cx',ax).attr('cy',ay).attr('r',3.5).attr('fill',C.yel);
                svg.append('text').attr('x',ax+8).attr('y',ay+4).attr('fill',C.yel)
                  .attr('font-size',22).attr('font-family','Inter,sans-serif').attr('font-weight',500).text('Ashgabat');
                if(!cancelled) setMapLoaded(true);
              } catch(e){console.error('map',e);}
            }
            drawMap();
            // Set up timeline clicks after render
            var ERA_COLORS = ERAS.map(function(e){ return { color: e.color, colorL: e.colorL }; });
            var ERA_COUNT = ERAS.length;
            var active = null;
            function selectEra(i) {
              var segs = document.querySelectorAll('.era-seg');
              var legs = document.querySelectorAll('.era-leg-lbl');
              if (active === i) { i = null; }
              var ph = document.getElementById('era-placeholder');
              if (ph) ph.style.display = (i === null) ? 'block' : 'none';
              for (var k = 0; k < ERA_COUNT; k++) {
                var p = document.getElementById('era-panel-' + k);
                if (p) p.style.display = (k === i) ? 'block' : 'none';
                if (segs[k]) segs[k].style.background = (k === i) ? ERA_COLORS[k].colorL : ERA_COLORS[k].color;
                if (legs[k]) legs[k].style.color = (k === i) ? ERA_COLORS[k].colorL : '#999';
              }
              active = i;
            }
            document.querySelectorAll('.era-seg').forEach(function(el) {
              el.addEventListener('click', function(){ selectEra(parseInt(el.getAttribute('data-era'))); });
            });
            document.querySelectorAll('.era-leg').forEach(function(el) {
              el.addEventListener('click', function(){ selectEra(parseInt(el.getAttribute('data-era'))); });
            });
            return ()=>{cancelled=true;};
          }, []);

          const fasvg = (vb, d) => <svg xmlns="http://www.w3.org/2000/svg" viewBox={vb} width="24" height="24" fill="#fff"><path d={d}/></svg>;
          const tiles = [
            { icon: fasvg('0 0 512 512', 'M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64L0 400c0 44.2 35.8 80 80 80l400 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L80 416c-8.8 0-16-7.2-16-16L64 64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z'), label: 'GDP', value: '~$64B', note: 'World Bank 2024 current USD' },
            { icon: fasvg('0 0 320 512', 'M160 0c17.7 0 32 14.3 32 32l0 35.7c1.6 .2 3.1 .4 4.7 .7c.4 .1 .7 .1 1.1 .2l48 8.8c17.4 3.2 28.9 19.9 25.7 37.2s-19.9 28.9-37.2 25.7l-47.5-8.7c-31.3-4.6-58.9-1.5-78.3 6.2s-27.2 18.3-29 28.1c-2 10.7-.5 16.7 1.2 20.4c1.8 3.9 5.5 8.3 12.8 13.2c16.3 10.7 41.3 17.7 73.7 26.3l2.9 .8c28.6 7.6 63.6 16.8 89.6 33.8c14.2 9.3 27.6 21.9 35.9 39.5c8.5 17.9 10.3 37.9 6.4 59.2c-6.9 38-33.1 63.4-65.6 76.7c-13.7 5.6-28.6 9.2-44.4 11l0 33.4c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-34.9c-.4-.1-.9-.1-1.3-.2l-.2 0s0 0 0 0c-24.4-3.8-64.5-14.3-91.5-26.3c-16.1-7.2-23.4-26.1-16.2-42.2s26.1-23.4 42.2-16.2c20.9 9.3 55.3 18.5 75.2 21.6c31.9 4.7 58.2 2 76-5.3c16.9-6.9 24.6-16.9 26.8-28.9c1.9-10.6 .4-16.7-1.3-20.4c-1.9-4-5.6-8.4-13-13.3c-16.4-10.7-41.5-17.7-74-26.3l-2.8-.7s0 0 0 0C119.4 279.3 84.4 270 58.4 253c-14.2-9.3-27.5-22-35.8-39.6c-8.4-17.9-10.1-37.9-6.1-59.2C23.7 116 52.3 91.2 84.8 78.3c13.3-5.3 27.9-8.9 43.2-11L128 32c0-17.7 14.3-32 32-32z'), label: 'GDP per Capita', value: '~$7,900', note: 'World Bank 2024: $7,919 current USD' },
            { icon: fasvg('0 0 576 512', 'M384 160c-17.7 0-32-14.3-32-32s14.3-32 32-32l160 0c17.7 0 32 14.3 32 32l0 160c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-82.7L342.6 374.6c-12.5 12.5-32.8 12.5-45.3 0L192 269.3 54.6 406.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160c12.5-12.5 32.8-12.5 45.3 0L320 306.7 466.7 160 384 160z'), label: 'GDP Growth', value: '6.3%', note: 'Official 2024 (World Bank); IMF: ~3%' },
            { icon: fasvg('0 0 640 512', 'M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z'), label: 'Population', value: '~7.5M', note: 'World Bank 2024: 7,494,498' },
            { icon: fasvg('0 0 576 512', 'M0 112.5L0 422.3c0 18 10.1 35 27 41.3c87 32.5 174 10.3 261-11.9c79.8-20.3 159.6-40.7 239.3-18.9c23 6.3 48.7-9.5 48.7-33.4l0-309.9c0-18-10.1-35-27-41.3C462 15.9 375 38.1 288 60.3C208.2 80.6 128.4 100.9 48.7 79.1C25.6 72.8 0 88.6 0 112.5zM288 352c-44.2 0-80-43-80-96s35.8-96 80-96s80 43 80 96s-35.8 96-80 96zM64 352c35.3 0 64 28.7 64 64l-64 0 0-64zm64-208c0 35.3-28.7 64-64 64l0-64 64 0zM512 304l0 64-64 0c0-35.3 28.7-64 64-64zM448 96l64 0 0 64c-35.3 0-64-28.7-64-64z'), label: 'Currency', value: 'TMT Manat', note: '3.5 TMT = $1 (fixed peg since 2014)' },
            { icon: fasvg('0 0 448 512', 'M0 80L0 229.5c0 17 6.7 33.3 18.7 45.3l176 176c25 25 65.5 25 90.5 0L418.7 317.3c25-25 25-65.5 0-90.5l-176-176c-12-12-28.3-18.7-45.3-18.7L48 32C21.5 32 0 53.5 0 80zm112 32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z'), label: 'Inflation', value: '~3.8%', note: 'World Bank Dec 2024 (y/y); heavily subsidised prices' },
            { icon: fasvg('0 0 576 512', 'M112 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm40 304l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-223.1L59.4 304.5c-9.1 15.1-28.8 20-43.9 10.9s-20-28.8-10.9-43.9l58.3-97c17.4-28.9 48.6-46.6 82.3-46.6l29.7 0c33.7 0 64.9 17.7 82.3 46.6l44.9 74.7c-16.1 17.6-28.6 38.5-36.6 61.5c-1.9-1.8-3.5-3.9-4.9-6.3L232 256.9 232 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-128-16 0zM432 224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zm59.3 107.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L432 345.4l-36.7-36.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L409.4 368l-36.7 36.7c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L432 390.6l36.7 36.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L454.6 368l36.7-36.7z'), label: 'Unemployment', value: '~4.2%', note: 'ADB 2024 modelled; true rate likely higher' },
            { icon: fasvg('0 0 576 512', 'M249.6 471.5c10.8 3.8 22.4-4.1 22.4-15.5l0-377.4c0-4.2-1.6-8.4-5-11C247.4 52 202.4 32 144 32C93.5 32 46.3 45.3 18.1 56.1C6.8 60.5 0 71.7 0 83.8L0 454.1c0 11.9 12.8 20.2 24.1 16.5C55.6 460.1 105.5 448 144 448c33.9 0 79 14 105.6 23.5zm76.8 0C353 462 398.1 448 432 448c38.5 0 88.4 12.1 119.9 22.6c11.3 3.8 24.1-4.6 24.1-16.5l0-370.3c0-12.1-6.8-23.3-18.1-27.6C529.7 45.3 482.5 32 432 32c-58.4 0-103.4 20-123 35.6c-3.3 2.6-5 6.8-5 11L304 456c0 11.4 11.7 19.3 22.4 15.5z'), label: 'Literacy', value: '~99.7%', note: 'UNESCO/World Bank; Soviet legacy' },
            { icon: fasvg('0 0 640 512', 'M351.2 4.8c3.2-2 6.6-3.3 10-4.1c4.7-1 9.6-.9 14.1 .1c7.7 1.8 14.8 6.5 19.4 13.6L514.6 194.2c8.8 13.1 13.4 28.6 13.4 44.4l0 73.5c0 6.9 4.4 13 10.9 15.2l79.2 26.4C631.2 358 640 370.2 640 384l0 96c0 9.9-4.6 19.3-12.5 25.4s-18.1 8.1-27.7 5.5L431 465.9c-56-14.9-95-65.7-95-123.7L336 224c0-17.7 14.3-32 32-32s32 14.3 32 32l0 80c0 8.8 7.2 16 16 16s16-7.2 16-16l0-84.9c0-7-1.8-13.8-5.3-19.8L340.3 48.1c-1.7-3-2.9-6.1-3.6-9.3c-1-4.7-1-9.6 .1-14.1c1.9-8 6.8-15.2 14.3-19.9zm-62.4 0c7.5 4.6 12.4 11.9 14.3 19.9c1.1 4.6 1.2 9.4 .1 14.1c-.7 3.2-1.9 6.3-3.6 9.3L213.3 199.3c-3.5 6-5.3 12.9-5.3 19.8l0 84.9c0 8.8 7.2 16 16 16s16-7.2 16-16l0-80c0-17.7 14.3-32 32-32s32 14.3 32 32l0 118.2c0 58-39 108.7-95 123.7l-168.7 45c-9.6 2.6-19.9 .5-27.7-5.5S0 490 0 480l0-96c0-13.8 8.8-26 21.9-30.4l79.2-26.4c6.5-2.2 10.9-8.3 10.9-15.2l0-73.5c0-15.8 4.7-31.2 13.4-44.4L245.2 14.5c4.6-7.1 11.7-11.8 19.4-13.6c4.6-1.1 9.4-1.2 14.1-.1c3.5 .8 6.9 2.1 10 4.1z'), label: 'Religion', value: '~89% Muslim', note: 'Sunni majority; officially secular state' },
            { icon: fasvg('0 0 640 512', 'M0 128C0 92.7 28.7 64 64 64l192 0 48 0 16 0 256 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64l-256 0-16 0-48 0L64 448c-35.3 0-64-28.7-64-64L0 128zm320 0l0 256 256 0 0-256-256 0zM178.3 175.9c-3.2-7.2-10.4-11.9-18.3-11.9s-15.1 4.7-18.3 11.9l-64 144c-4.5 10.1 .1 21.9 10.2 26.4s21.9-.1 26.4-10.2l8.9-20.1 73.6 0 8.9 20.1c4.5 10.1 16.3 14.6 26.4 10.2s14.6-16.3 10.2-26.4l-64-144zM160 233.2L179 276l-38 0 19-42.8zM448 164c11 0 20 9 20 20l0 4 44 0 16 0c11 0 20 9 20 20s-9 20-20 20l-2 0-1.6 4.5c-8.9 24.4-22.4 46.6-39.6 65.4c.9 .6 1.8 1.1 2.7 1.6l18.9 11.3c9.5 5.7 12.5 18 6.9 27.4s-18 12.5-27.4 6.9l-18.9-11.3c-4.5-2.7-8.8-5.5-13.1-8.5c-10.6 7.5-21.9 14-34 19.4l-3.6 1.6c-10.1 4.5-21.9-.1-26.4-10.2s.1-21.9 10.2-26.4l3.6-1.6c6.4-2.9 12.6-6.1 18.5-9.8l-12.2-12.2c-7.8-7.8-7.8-20.5 0-28.3s20.5-7.8 28.3 0l14.6 14.6 .5 .5c12.4-13.1 22.5-28.3 29.8-45L448 228l-72 0c-11 0-20-9-20-20s9-20 20-20l52 0 0-4c0-11 9-20 20-20z'), label: 'Language', value: 'Turkmen', note: 'Oghuz Turkic; Latin script since 1993' },
            { icon: fasvg('0 0 512 512', 'M228.3 469.1L47.6 300.4c-4.2-3.9-8.2-8.1-11.9-12.4l87 0c22.6 0 43-13.6 51.7-34.5l10.5-25.2 49.3 109.5c3.8 8.5 12.1 14 21.4 14.1s17.8-5 22-13.3L320 253.7l1.7 3.4c9.5 19 28.9 31 50.1 31l104.5 0c-3.7 4.3-7.7 8.5-11.9 12.4L283.7 469.1c-7.5 7-17.4 10.9-27.7 10.9s-20.2-3.9-27.7-10.9zM503.7 240l-132 0c-3 0-5.8-1.7-7.2-4.4l-23.2-46.3c-4.1-8.1-12.4-13.3-21.5-13.3s-17.4 5.1-21.5 13.3l-41.4 82.8L205.9 158.2c-3.9-8.7-12.7-14.3-22.2-14.1s-18.1 5.9-21.8 14.8l-31.8 76.3c-1.2 3-4.2 4.9-7.4 4.9L16 240c-2.6 0-5 .4-7.3 1.1C3 225.2 0 208.2 0 190.9l0-5.8c0-69.9 50.5-129.5 119.4-141C165 36.5 211.4 51.4 244 84l12 12 12-12c32.6-32.6 79-47.5 124.6-39.9C461.5 55.6 512 115.2 512 185.1l0 5.8c0 16.9-2.8 33.5-8.3 49.1z'), label: 'Life Expectancy', value: '~70 yrs', note: 'Women ~73 / Men ~67 (UNDP HDR 2023)' },
            { icon: fasvg('0 0 512 512', 'M352 256c0 22.2-1.2 43.6-3.3 64l-185.3 0c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64l185.3 0c2.2 20.4 3.3 41.8 3.3 64zm28.8-64l123.1 0c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64l-123.1 0c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32l-116.7 0c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0l-176.6 0c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0L18.6 160C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192l123.1 0c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64L8.1 320C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6l176.6 0c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352l116.7 0zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6l116.7 0z'), label: 'HDI', value: '0.764', note: 'Rank 95/193 (UNDP HDR 2023); 2nd in CA' },
            { icon: fasvg('0 0 512 512', 'M240.1 4.2c9.8-5.6 21.9-5.6 31.8 0l171.8 98.1L448 104l0 .9 47.9 27.4c12.6 7.2 18.8 22 15.1 36s-16.4 23.8-30.9 23.8L32 192c-14.5 0-27.2-9.8-30.9-23.8s2.5-28.8 15.1-36L64 104.9l0-.9 4.4-1.6L240.1 4.2zM64 224l64 0 0 192 40 0 0-192 64 0 0 192 48 0 0-192 64 0 0 192 40 0 0-192 64 0 0 196.3c.6 .3 1.2 .7 1.8 1.1l48 32c11.7 7.8 17 22.4 12.9 35.9S494.1 512 480 512L32 512c-14.1 0-26.5-9.2-30.6-22.7s1.1-28.1 12.9-35.9l48-32c.6-.4 1.2-.7 1.8-1.1L64 224z'), label: 'Government', value: 'Authoritarian', note: 'Presidential; dynastic Berdimuhamedov rule' },
            { icon: fasvg('0 0 384 512', 'M372.5 256.5l-.7-1.9C337.8 160.8 282 76.5 209.1 8.5l-3.3-3C202.1 2 197.1 0 192 0s-10.1 2-13.8 5.5l-3.3 3C102 76.5 46.2 160.8 12.2 254.6l-.7 1.9C3.9 277.3 0 299.4 0 321.6C0 426.7 86.8 512 192 512s192-85.3 192-190.4c0-22.2-3.9-44.2-11.5-65.1zm-90.8 49.5c4.1 9.3 6.2 19.4 6.2 29.5c0 53-43 96.5-96 96.5s-96-43.5-96-96.5c0-10.1 2.1-20.3 6.2-29.5l1.9-4.3c15.8-35.4 37.9-67.7 65.3-95.1l8.9-8.9c3.6-3.6 8.5-5.6 13.6-5.6s10 2 13.6 5.6l8.9 8.9c27.4 27.4 49.6 59.7 65.3 95.1l1.9 4.3z'), label: 'Gas Reserves', value: '#4 World', note: '13–14 tcm proven (BP/Cedigaz 2024 est.)' },
            { icon: fasvg('0 0 512 512', 'M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2c-.5 99.2-41.3 280.7-213.6 363.2c-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0zm0 66.8l0 378.1C394 378 431.1 230.1 432 141.4L256 66.8s0 0 0 0z'), label: 'Neutrality', value: 'Permanent', note: 'UN-recognised since 1995; only such state' },
            { icon: fasvg('0 0 512 512', 'M352 256c0 22.2-1.2 43.6-3.3 64l-185.3 0c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64l185.3 0c2.2 20.4 3.3 41.8 3.3 64zm28.8-64l123.1 0c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64l-123.1 0c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32l-116.7 0c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0l-176.6 0c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0L18.6 160C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192l123.1 0c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64L8.1 320C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6l176.6 0c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352l116.7 0zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6l116.7 0z'), label: 'Area', value: '488,100 km²', note: 'Landlocked; 5th-largest in FSU' },
          ];

          return (
            <div id="glance" style={{ margin:'28px 0 8px' }}>
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
                {/* Map tile */}
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

        {/* 1. GEOGRAPHY */}
        <SectionHeader icon={Icons.mountain} label="Geography & Landscape" />
        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Total Area" value="488,100 km²" sub="5th largest in former Soviet Union; larger than Spain" accent={C.dim} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Highest Peak" value="3,139 m" sub="Aýrybaba — Köýtendag Range; SE corner on Uzbekistan border (CIA WF; Turkmenistan govt)" accent={C.tm} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Caspian Sea coastline" value="~1,768 km" sub="Significant western border; fishing & oil platform access" accent={C.blu} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Borders" value="5 countries" sub="Kazakhstan, Uzbekistan, Afghanistan, Iran + Caspian Sea (Azerbaijan)" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Karakum Desert" value="~350,000 km²" sub="~70% of country; 12th largest desert globally; Black Sand" accent={C.yel} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Karakum Canal" value="1,375 km" sub="World's longest irrigation canal; diverts Amu Darya water" accent={C.dim} delay={0.30} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Darvaza Gas Crater" value="70m wide" sub="'Door to Hell' — burning since 1971 (Soviet drilling accident); top attraction" accent={C.dim} delay={0.35} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Landlocked" value="Yes" sub="No sea access; Caspian is an inland lake; dependent on pipelines & railways" accent={C.dim} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Lowest Point" value="−81 m" sub="Vpadina Akchanaya depression (CIA WF 2024); Sarygamysh lake has dropped to −110 m" accent={C.blu} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Arable land" value="3.4%" sub="World Bank/FAO 2023; CIA WF 2018 est.: 4.1%; heavily irrigated via Karakum Canal" accent={C.dim} delay={0.45} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Major Terrain Zones" icon={Icons.map}>
              <BarRow label="Karakum Desert — central & western (CIA WF/CountryReports)" value="~80%" pct={100} color={C.yel} />
              <BarRow label="Karakalpak steppe / northern plains (est.; unverified — no official terrain % breakdown published)" value="~8%" pct={10} color={C.tm} />
              <BarRow label="Kopet Dag mountains — south, Iran border (est.; unverified)" value="~5%" pct={6} color={C.blu} />
              <BarRow label="Köýtendag range — SE, Uzbekistan border (est.; unverified)" value="~2%" pct={3} color={C.dim} />
              <BarRow label="Irrigated Amu Darya & river oasis floodplain (est.; unverified)" value="~4%" pct={5} color={C.dim} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>CIA WF and multiple sources confirm ~80% of Turkmenistan is Karakum Desert — the 12th largest in the world. The Kopet Dag mountains along the Iranian border are seismically active — the 1948 Ashgabat earthquake killed 110,000–176,000 people. Border lengths (CIA WF 2024): Afghanistan 744 km · Iran 992 km · Uzbekistan 1,621 km · Kazakhstan 413 km · Caspian Sea 1,768 km.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Water Bodies & Features" icon={Icons.water}>
              <Tbl rows={[
                ['Amu Darya (Oxus) — eastern border', '~700 km forms border with Uzbekistan/Afghanistan (CIA WF)'],
                ['Karakum Canal', '1,375 km; diverts Amu Darya; completed 1981 (UNDP confirmed)'],
                ['Caspian Sea (west)', 'Inland salt lake; 1,768 km coastline (CIA WF 2024); oil & gas'],
                ['Murghab (Morghab) River', 'Flows north from Afghanistan; feeds Mary/Merv oasis (Britannica)'],
                ['Tejen River', 'Flows north from Afghanistan through Ahal province (Wikipedia Ahal Region)'],
                ['Darvaza Gas Crater ("Door to Hell")', '70m-wide crater; burning continuously since 1971 (multiple sources confirmed)'],
              ]} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>The Karakum Canal is one of the Soviet Union's most ambitious engineering projects and one of its most environmentally destructive — it diverts 10–12 km³ of water annually from the Amu Darya, contributing to the Aral Sea's collapse and waterlogging 400,000+ hectares of farmland with salt. Despite this, the canal is existential for Turkmenistan's agriculture and the oasis cities of Mary and Tejen.</p>
            </Panel>
          </div>
        </div>
        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-3 d-flex"><RegCard name="Ashgabat" type="Capital · marble city" desc="Capital of ~1M+. Rebuilt after 1948 earthquake. Now world's highest density of white marble buildings (Guinness 2015). Surreal urban showcase." stripe={C.tm} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Mary (Merv)" type="Gas hub · ancient city" desc="UNESCO World Heritage Site — ruins of ancient Merv, one of Silk Road's greatest cities. Surrounded by Galkynysh mega gas field." stripe={C.yel} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Türkmenabat (East)" type="Industry · border" desc="Uzbek border city. Chemical plants, fertiliser production. Main crossing to Uzbekistan. 2nd largest city ~800,000." stripe={C.tm} /></div>
          <div className="col-6 col-md-3 d-flex"><RegCard name="Balkan Province (Caspian)" type="Oil · gas · Caspian port" desc="Turkmenbashi (former Krasnovodsk): Caspian Sea port, oil refinery. Gateway to Caspian Basin hydrocarbon exports." stripe={C.yel} /></div>
        </div>

        {/* 2. CLIMATE */}
        <SectionHeader icon={Icons.cloudSun} label="Climate: Weather, Daylight & Rainfall" />
        <div id="item" className="row g-1 mb-4">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Annual Temp (Ashgabat)" value="17.7°C" sub="1991–2020 mean (climatestotravel.com 1991–2020 normals)" accent={C.yel} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Record High (Ashgabat)" value="47.2°C" sub="June 2015 (climatestotravel.com); inland Karakum extreme records reach ~50°C (Kerki station 51.7°C, 1983)" accent={C.red} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Record Low" value="−29.1°C" sub="Daşoguz station, Jan 2008 (worlddata.info); Ashgabat record −24.1°C (Jan 1969, climatestotravel)" accent={C.blu} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Annual Rainfall (Ashgabat)" value="220 mm" sub="1991–2020 average (climatestotravel.com); most falls Nov–Apr; summer near-zero" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Climate type (Koppen)" value="BSk" sub="Cold semi-arid steppe — confirmed climatestotravel, nomadseason, weather-atlas (1991–2020)" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ashgabat July avg" value="31.4°C" sub="1991–2020 July mean (climatestotravel.com); July max avg 38.4°C; 2,655 sunshine hrs/yr" accent={C.dim} delay={0.30} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ashgabat January avg" value="4.4°C" sub="1991–2020 January mean (climatestotravel.com); min avg −0.1°C; cold nights, mild days" accent={C.blu} delay={0.35} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Mary (south-east) annual avg" value="~17°C" sub="Weatherbase confirmed; July avg 30.6°C; annual precip ~160 mm (climatestotravel.com/mary)" accent={C.dim} delay={0.40} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Spring Mar–May" value="11–24°C" sub="Mar mean 11.5°C, May mean 24°C (climatestotravel 1991–2020); best travel season" accent={C.tm} delay={0.45} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
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
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>
                ★ Summer solstice <strong style={{ color:C.yelL }}>15h 12m</strong> · Winter solstice <strong style={{ color:C.bluL }}>9h 26m</strong> · At 38°N — similar latitude to Turkey, Spain; intense summer solar radiation amplifies desert heat.
              </p>
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>3,000+ sunshine hours/year is exceptional. Ashgabat receives more summer sun than Madrid. This solar potential is almost entirely untapped — Turkmenistan relies 100% on gas for power generation despite theoretically ideal solar conditions.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Rainfall by Region" icon={Icons.rain}>
              <p style={{ fontSize:11, color:C.sub, marginBottom:11, letterSpacing:'0.04em' }}>Annual precipitation by zone</p>
              <BarRow label="Kopet Dag mountains — south (Blue Green Atlas: 300–400 mm)" value="~300 mm" pct={100} color={C.tm} />
              <BarRow label="Ashgabat (climatestotravel.com 1991–2020)" value="220 mm" pct={73} color={C.yel} />
              <BarRow label="Mary/Merv oasis — SE (climatestotravel.com/mary)" value="~160 mm" pct={53} color={C.blu} />
              <BarRow label="Karakum Desert centre (est.; unverified — Blue Green Atlas: 'two-thirds receives less than 150mm')" value="~80–150 mm" pct={33} color={C.dim} />
              <BarRow label="Caspian coast (est.; unverified — no station data fetched)" value="~100–120 mm" pct={37} color={C.dim} />
              <div style={{ height:1, background:C.border, margin:'14px 0' }} />
              <p style={{ fontSize:11, color:C.sub, marginBottom:11, letterSpacing:'0.04em' }}>Ashgabat seasonal pattern</p>
              <BarRow label="March (wettest month — climatestotravel.com 1991–2020)" value="42 mm" pct={100} color={C.tm} />
              <BarRow label="Jul–Aug (driest — climatestotravel.com)" value="2–3 mm" pct={7} color={C.yel} />
              <BarRow label="Jan–Feb (winter — climatestotravel.com)" value="21–33 mm" pct={57} color={C.blu} />
              <GradientBar title="Monthly mean temperature — Ashgabat (°C) · 1991–2020 normals (climatestotravel.com)" values={[4.4,6.2,11.5,17.8,24.0,29.2,31.4,29.8,24.5,17.6,10.4,5.4]} colorStops={tempColor} unit="°" />
              <GradientBar title="Monthly rainfall — Ashgabat (mm) · 1991–2020 normals (climatestotravel.com)" values={[21,33,42,33,23,8,3,2,3,12,23,18]} colorStops={rainColor} unit="mm" />
            </Panel>
          </div>
        </div>

        {/* 3. POPULATION */}
        <SectionHeader icon={Icons.people} label="Population & Demographics" />
        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Population (2024)" value="~7.5M" sub="World Bank 2024: 7,494,498; 2022 census: 7,057,841 (stat.gov.tm)" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Urban Population" value="47.1%" sub="2022 census (stat.gov.tm); majority still rural — 52.9% rural" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Median Age" value="♂ 27 · ♀ 29.5" sub="Overall 26.6 yrs (2024) — UN WPP 2024 via worldpopulationreview.com" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Population Density" value="16 /km²" sub="World Bank 2024 (Worldometer WPP 2024; land area 469,930 km²)" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Life Expectancy" value="~70 yrs" sub="Women ~73 · Men ~67; significant gender gap (UNDP HDR 2023)" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Fertility Rate" value="2.69" sub="UN WPP 2024 Revision (OSW Centre for Eastern Studies, 2025); declining trend" accent={C.blu} delay={0.30} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Population Growth" icon={Icons.chart}>
              <BarRow label="1991 (independence) — World Bank est." value="~3.7M" pct={49} color={C.dim} />
              <BarRow label="2000 — World Bank est." value="~4.5M" pct={60} color={C.dim} />
              <BarRow label="2010 — World Bank est." value="~4.9M" pct={65} color={C.blu} />
              <BarRow label="2022 (census — stat.gov.tm)" value="7,057,841" pct={94} color={C.yel} />
              <BarRow label="2024 (World Bank WDI)" value="7,494,498" pct={100} color={C.tm} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan's population nearly doubled since independence — from ~3.7M to 7.5M (+103%). The 2022 census (first comprehensive count since 1995) revealed population was significantly larger than previously reported. Turkmenistan ranks 5th smallest among FSU states by population. Under-15 age group: 25.44% (CIA WF 2020 est.) — not 31% as previously stated.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Largest Cities (est. 2024)" icon={Icons.landmark}>
              <BarRow label="Ashgabat (capital — 2022 census stat.gov.tm)" value="1,030,063" pct={100} color={C.tm} />
              <BarRow label="Türkmenabat (2022 census — Wikipedia)" value="~231,000" pct={22} color={C.yel} />
              <BarRow label="Daşoguz city (est.; unverified — city-level data not released in 2022 census results)" value="est. ~150–180,000" pct={16} color={C.blu} />
              <BarRow label="Mary city (2022 official census)" value="167,027" pct={16} color={C.dim} />
              <BarRow label="Balkanabat (2022 census official PDF stat.gov.tm)" value="~123,190" pct={12} color={C.dim} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>est. 2024 — no inter-census registry; city boundaries vary by source.</p>
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Ashgabat (1,030,063 per 2022 census) is the only true city — all others are significantly smaller than previously reported. Türkmenabat at ~231,000 and Mary at 167,027 are regional capitals. Daşoguz city-level data was not released in the 2022 census summary — the estimate here is derived from the Daşoguz region total of 1,550,354, with urban share ~22% per census. Previous training-data estimates for Türkmenabat (~750K) and Mary (~450K) were dramatically wrong.</p>
            </Panel>
          </div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Ethnic Composition" icon={Icons.people}>
              <Donut
                label="7.5M"
                sublabel="population"
                segments={[
                  { label:'Turkmen',          value:'86.7%', pct:86.7, color:C.tm  },
                  { label:'Uzbek',            value:'9.1%',  pct:9.1,  color:C.yel },
                  { label:'Russian',          value:'1.6%',  pct:1.6,  color:C.blu },
                  { label:'Other (Baloch 1.2%, others 1.3%)', value:'2.5%', pct:2.5, color:C.dim },
                ]}
              />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>2022 census; official; minority shares likely underreported.</p>
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Source: 2022 census (Wikipedia Turkmenistan article, citing official census). Turkmen 86.7%, Uzbek 9.1% (642,476 persons — Uzbeks article), Russian 1.6% (114,447 — Russians in TM article). V1 figures (Turkmen 85%, Uzbek 5%, Russian 4%) were wrong — the Uzbek minority is much larger than previously reported, and the Russian minority has declined sharply since independence.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Religion & Language" icon={Icons.landmark}>
              <Tbl rows={[
                ['Islam (predominantly Sunni Hanafi)', '95.8% (Wikipedia TM, 2020)'],
                ['No religion', '3.0% (Wikipedia TM, 2020)'],
                ['Christianity (Russian Orthodox, etc.)', '1.1% (Wikipedia TM, 2020)'],
                ['State language', 'Turkmen (Oghuz Turkic; Latin script since 1993)'],
                ['Widely spoken', 'Russian (urban elites, Soviet-era generation)'],
                ['Ruhnama (Niyazov-era)', 'Phased out after 2007; replaced Quran in some contexts'],
                ['UNESCO heritage', 'Ancient Merv (1999); Parthian Nisa (2007); Köneürgench (2005)'],
              ]} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan is constitutionally secular but Islam is deeply embedded in culture. Niyazov's cult imposed the Ruhnama (his "Book of the Soul") as required reading for all state exams; it even appeared in a mosque alongside the Quran. Berdimuhamedov quietly removed the most extreme elements after 2007 while maintaining tight state control over all religious practice.</p>
            </Panel>
          </div>
        </div>

        {/* 4. ECONOMY */}
        <SectionHeader icon={Icons.chart} label="Economy & Finance" />
        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP Nominal (2024)" value="~$64B" sub="World Bank 2024: $64.24B; official growth 6.3% YoY; gas-dependent" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP per Capita (2024)" value="~$7,900" sub="World Bank 2024: $7,919 current USD; upper-middle income threshold" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP Growth (2024)" value="6.3% (official)" sub="World Bank; IMF estimates only ~3% — significant data uncertainty" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="GDP PPP (2024 est.)" value="~$191B" sub="World Economics PPP estimate 2025; $17,953 PPP per capita (WB data)" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Inflation CPI (Dec 2024)" value="3.8%" sub="World Bank year-on-year; higher than 1.4% in Dec 2023; heavily subsidised prices distort figure" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Currency" value="TMT Manat" sub="3.5 TMT = $1 USD (official fixed peg since 2014; black market rates diverge)" accent={C.dim} delay={0.30} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="GDP by Sector & Major Exports" icon={Icons.chart}>
              <Donut
                label="$64B"
                sublabel="GDP 2024"
                segments={[
                  { label:'Natural gas, oil & petrochemicals (Trading Economics: >60%)', value:'~60%', pct:60, color:C.tm  },
                  { label:'Services (ADB 2021: 51.1%; FocusEconomics 2021: 47.8%)', value:'~47%', pct:47, color:C.yel },
                  { label:'Agriculture (ADB: 11.8%; CIA WF: 7.5%)',                   value:'~11%', pct:11, color:C.blu },
                  { label:'Construction & other',                                       value:'~8%',  pct:8,  color:C.dim },
                ]}
              />
              <div style={{ height:1, background:C.border, margin:'16px 0' }} />
              <BarRow label="Natural gas, oil & oil products (World Bank 2024)" value="84.9% of exports" pct={100} color={C.tm} />
              <BarRow label="Cotton fibre & textiles (est.; unverified — no recent OEC/customs data confirmed)" value="~5–7%" pct={6} color={C.yel} />
              <BarRow label="Fertilisers & petrochemicals (est.; unverified)" value="~3–5%" pct={4} color={C.blu} />
              <BarRow label="Electricity exports (est.; unverified — UNECE: 27.6% of production exported in 2023)" value="~1–2%" pct={2} color={C.dim} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Natural gas dominates Turkmenistan's economy to an exceptional degree — 84.9% of exports in 2024 were hydrocarbons. China is the dominant buyer, purchasing ~80% of Turkmenistan's gas exports via the Central Asia–China Gas Pipeline. This dependence on a single commodity exported via a single route to a single buyer creates extreme strategic vulnerability.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Economic Indicators" icon={Icons.briefcase}>
              <Tbl rows={[
                ['Government debt/GDP (2024)', '~3.6% — very low; debt reduction from 5.8% in 2023 (IMF 2025)'],
                ['Budget surplus (2024)', '0.8% of GDP (World Bank)'],
                ['Gas exports revenue (est.)', '~$9–10B annually (BP/government est.)'],
                ['Main export partner', 'China (~80% of gas; via CAGP)'],
                ['Cotton production (USDA 2024/25)', '~348,000 tonnes/year; state-mandated quotas; declining'],
                ['Gini coefficient', '40.8 (World Bank 1998 — only available data; no recent figure published)'],
              ]} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan's government finances look strong on paper — very low debt and a budget surplus — but are entirely dependent on gas prices and China's appetite for imports. State subsidies on energy, food, and housing keep official inflation low but distort the economy and mask real living standards. The Manat's fixed peg to the dollar creates a black market with divergent rates.</p>
            </Panel>
          </div>
        </div>

        {/* 5. EMPLOYMENT */}
        <SectionHeader icon={Icons.briefcase} label="Employment & Wages" />
        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Avg Monthly Wage (est.)" value="~$320" sub="~1,120 TMT at official rate; est.; unverified — Turkmenistan does not publish official average wage data" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Labour Force (2024)" value="2,444,797" sub="World Bank WDI 2024 (ILO modelled estimate)" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Unemployment (2024)" value="4.3%" sub="ILO modelled 2024 (BEARR/ILO dataset); youth unemployment 9.3% (FRED/WB 2024)" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Agriculture employment" value="42–44%" sub="World Bank overview 2024: 42.5%; CIA WF/Wikipedia 2018 est: 44.2% (ILO modelled)" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Cotton forced labour" value="Ongoing (est.)" sub="Cotton Campaign 2025; ILO monitoring; 84% of cotton exports go to Turkey (UN Comtrade 2020–2023)" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Labour emigration" value="Significant" sub="est.; unverified — no official registry; ILO/migration est. 700K–1M; mainly Turkey, Russia, UAE" accent={C.dim} delay={0.30} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Wages by Sector (monthly TMT, est.)" icon={Icons.chart}>
              <BarRow label="Gas & energy sector" value="~5,000 TMT (~$1,430)" pct={100} color={C.tm} />
              <BarRow label="Banking & finance" value="~3,500 TMT (~$1,000)" pct={70} color={C.yel} />
              <BarRow label="National avg (official est.)" value="~1,120 TMT (~$320)" pct={22} color={C.dim} />
              <BarRow label="Public administration" value="~1,300 TMT (~$370)" pct={26} color={C.blu} />
              <BarRow label="Education & health" value="~900 TMT (~$260)" pct={18} color={C.dim} />
              <BarRow label="Agriculture (cotton)" value="~500 TMT (~$143)" pct={10} color={C.dim} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>est. — Turkmenistan does not publish sectoral wage data; all figures modelled from ILO/UN est.</p>
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>The gas sector pays dramatically more than other industries, creating sharp social stratification. Cotton agriculture, with mandatory state quotas and mobilised labour, represents one of the most exploitative employment systems in Central Asia. Government-set price subsidies mask wages' real purchasing power — cheap gas, electricity and bread make official wages stretch further than the dollar figure suggests.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Employment by Sector (est.)" icon={Icons.briefcase}>
              <Donut
                label="2.44M"
                sublabel="labour force"
                segments={[
                  { label:'Agriculture (WB 2024: 42.5%; CIA WF 2018: 44.2%)', value:'~43%', pct:43, color:C.tm  },
                  { label:'Services (CIA WF/Wikipedia 2018 est.)',              value:'~41%', pct:41, color:C.yel },
                  { label:'Industry & gas sector (CIA WF 2018 est.)',           value:'~15%', pct:15, color:C.blu },
                  { label:'Other (est.; unverified)',                           value:'~1%',  pct:1,  color:C.dim },
                ]}
              />
              <div style={{ height:1, background:C.border, margin:'16px 0' }} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>est. — no official labour force survey published; ILO modelled.</p>
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan's labour market is uniquely opaque — the government releases almost no official data. The state dominates employment through its gas company (Türkmengaz), cotton sector, public administration, and construction projects. Private enterprise exists but is constrained by bureaucracy, corruption, and limited access to finance. Labour emigration to Turkey and UAE has become an important economic safety valve.</p>
            </Panel>
          </div>
        </div>

        {/* 6. EDUCATION */}
        <SectionHeader icon={Icons.graduation} label="Education & Human Development" />
        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Literacy Rate" value="99.4%" sub="UNESCO/World Bank 2005 — most recent data point available; no post-2005 survey published" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="HDI (2023)" value="0.764" sub="Rank 95/193 — High Human Development (UNDP HDR 2024); 2nd in CA after Kazakhstan" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Mean Years Schooling" value="~10.3 yrs" sub="UNDP HDR 2023; below regional peer Kazakhstan" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Expected Schooling" value="~13.4 yrs" sub="UNDP HDR 2023 est. — unverified against Turkmen national data" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Education Spending (est.)" value="~3% GDP" sub="est.; unverified — UN CCA 2023 cited qualitatively; Turkmenistan does not publish official education spending data" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Higher Education Access" value="Very restricted" sub="4/5 university places via bribery (BTI 2024); tertiary enrolment 15.6% (UNESCO/WB 2020)" accent={C.dim} delay={0.30} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Education Metrics" icon={Icons.graduation}>
              <BarRow label="Primary enrolment rate (est.; unverified — no recent UNESCO data confirmed)" value="~95%" pct={95} color={C.tm} />
              <BarRow label="Secondary enrollment rate (est.; unverified — no recent UNESCO data confirmed)" value="~84%" pct={84} color={C.yel} />
              <BarRow label="Tertiary enrolment (UNESCO/World Bank 2020)" value="15.6%" pct={16} color={C.blu} />
              <BarRow label="R&D spending (% of GDP, 2021)" value="0.13% — lowest in CA" pct={5} color={C.dim} />
              <BarRow label="Scientific publications per million" value="2 (vs 202 in KZ)" pct={2} color={C.dim} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Tertiary enrolment at 8–10% is the lowest in Central Asia — a direct consequence of highly restricted university admission. According to the Bertelsmann Stiftung BTI 2024, at least 4 out of 5 university spots are filled through bribery, pricing out qualified but poor students. Research output is negligible: only 2 scientific publications per million people vs 202 in Kazakhstan. The education system produces graduates but not researchers.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Education Facts" icon={Icons.landmark}>
              <Tbl rows={[
                ['Script system', 'Latin (official since 1993); Cyrillic still common'],
                ['Instruction language', 'Turkmen (primary); Russian-medium schools declining'],
                ['Niyazov-era disruption', '2000s: hospitals closed outside Ashgabat; schools similarly affected'],
                ['Ruhnama requirement', 'Niyazov\'s book made mandatory in all exams until 2007'],
                ['Foreign study', 'Permitted but limited; Turkey is main destination'],
                ['PhD students (2015)', 'Only 159 — vs 3,603 in Kazakhstan (UNESCO)'],
              ]} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Niyazov's bizarre education "reforms" in the early 2000s — including closing all schools and hospitals outside Ashgabat, replacing the national curriculum with the Ruhnama, and requiring all state workers to repass exams with Ruhnama content — set back Turkmenistan's human development dramatically. Berdimuhamedov reversed these decisions after 2007, but the damage to educational quality, research capacity, and public health infrastructure persists.</p>
            </Panel>
          </div>
        </div>

        {/* 7. POLITICAL */}
        <SectionHeader icon={Icons.landmark} label="Political Landscape" />
        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="System" value="Presidential" sub="Consolidated authoritarian; dynastic rule; no genuine opposition" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="President" value="Serdar Berdymukh." sub="In power since March 2022; son of former president Gurbanguly Berdimuhamedov" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="'National Leader'" value="Gurbanguly Berdymukh." sub="Father; chairs Khalk Maslahaty (supreme body); declared 'Arkadagy' (Beloved Patron) 2023" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Permanent Neutrality" value="Since 1995" sub="UN-recognised; only state with this status; no military alliances" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Freedom House Score" value="1/100" sub="Not Free; Near-total denial of political rights & civil liberties (FH 2024)" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Independence" value="Oct 27, 1991" sub="From Soviet Union; national holiday — Independence Day" accent={C.blu} delay={0.30} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="2022 Presidential Election" icon={Icons.landmark}>
              <BarRow label="Serdar Berdimuhamedov (official result)" value="72.97%" pct={100} color={C.tm} />
              <BarRow label="Other candidates (5 candidates; all regime-aligned)" value="27% combined" pct={27} color={C.dim} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>The March 2022 election was entirely stage-managed. All candidates were drawn from state structures loyal to the Berdimuhamedov family. Gurbanguly — outgoing president — simultaneously created the new Khalk Maslahaty (supreme body above the parliament) and installed himself as its chair, retaining effective power while ceding the presidency to his son. The OSCE did not issue a full monitoring report due to restrictions.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Political Timeline" icon={Icons.chart}>
              {[
                { yr:'1991', tx:'Independence from USSR (Oct 27). Niyazov becomes president for life — Turkmenbashi ("Father of all Turkmen").' },
                { yr:'1995', tx:'UN grants Turkmenistan permanent neutrality — the only nation with such status. Membership of no military bloc.' },
                { yr:'2002', tx:'Failed assassination attempt on Niyazov; mass arrests, show trials, thousands imprisoned or exiled.' },
                { yr:'2006', tx:'Niyazov dies (Dec 21). Gurbanguly Berdimuhamedov assumes power; begins cautious liberalisation.' },
                { yr:'2009', tx:'Central Asia-China Gas Pipeline (CAGP) opens — transformational; breaks Russian pipeline monopoly.' },
                { yr:'2022', tx:'Gurbanguly transfers presidency to son Serdar; retains power via Khalk Maslahaty. Dynastic duopoly established.' },
                { yr:'2024', tx:'New gas deal with Iran signed: 10 bcm/year; new pipeline construction planned; modest export diversification.' },
              ].map(({ yr, tx }) => (
                <div key={yr} style={{ paddingLeft:16, borderLeft:`1px solid ${C.tm}`, marginBottom:14 }}>
                  <div style={{ fontSize:10, letterSpacing:'0.11em', color:C.tmL, textTransform:'uppercase', marginBottom:2 }}>{yr}</div>
                  <div style={{ fontSize:12.5, color:'#888', lineHeight:1.6 }}>{tx}</div>
                </div>
              ))}
            </Panel>
          </div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12">
            <Panel title="125 Years of Governance — Interactive Era Timeline (1900–2025)" icon={Icons.chart}>

              {/* Era bar — data-era index used by vanilla JS below */}
              <div style={{ display:'flex', height:40, borderRadius:4, overflow:'hidden' }}>
                {ERAS.map((era, i) => (
                  <div key={era.id}
                    data-era={i}
                    className="era-seg"
                    title={`${era.label} (${era.start}–${era.end})`}
                    style={{ width:`${((era.end - era.start) / ERA_TOTAL) * 100}%`, background:era.color, cursor:'pointer', transition:'background 0.2s', flexShrink:0, borderRight:'1px solid #000' }}
                  />
                ))}
              </div>

              {/* Year labels — % positions match bar since gap removed */}
              <div style={{ position:'relative', height:28, marginTop:5 }}>
                {ERAS.map((era, i) => {
                  const left = ((era.start - 1900) / ERA_TOTAL) * 100;
                  const isFirst = i === 0;
                  return (
                    <div key={era.id} style={{
                      position:'absolute', left:`${left}%`, top:0,
                      transform: isFirst ? 'scaleX(-1) scaleY(-1)' : 'translateX(-50%) scaleX(-1) scaleY(-1)',
                      fontSize:9, color:C.sub, whiteSpace:'nowrap',
                      writingMode:'vertical-lr',
                    }}>{era.start}</div>
                  );
                })}
                <div style={{ position:'absolute', right:0, top:0, fontSize:9, color:C.sub, whiteSpace:'nowrap', writingMode:'vertical-lr', transform:'scaleX(-1) scaleY(-1)' }}>2025</div>
              </div>

              {/* Placeholder shown when nothing selected */}
              <div id="era-placeholder" style={{ background:C.bg, border:`1px solid ${C.border}`, padding:'8px 16px', borderRadius:2, marginTop:12, fontSize:11, color:C.sub, textAlign:'center' }}>
                Click any era above to see details and key events.
              </div>

              {/* All era detail panels — hidden by default, shown by JS */}
              {ERAS.map((era, i) => (
                <div key={era.id} id={`era-panel-${i}`}
                  style={{ display:'none', background:C.bg, border:`1px solid ${C.border}`, borderLeft:`3px solid ${era.color}`, padding:'16px 18px', borderRadius:2, marginTop:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8, flexWrap:'wrap', gap:6 }}>
                    <div>
                      <div style={{ fontSize:10, letterSpacing:'0.15em', textTransform:'uppercase', color:era.colorL, marginBottom:3 }}>{era.start} – {era.end}</div>
                      <div style={{ fontFamily:'Fraunces,serif', fontWeight:700, fontSize:17, color:C.txt }}>{era.label}</div>
                    </div>
                    <div style={{ fontFamily:'Fraunces,serif', fontWeight:900, fontSize:24, color:era.color, opacity:0.4 }}>{era.end - era.start}y</div>
                  </div>
                  <p style={{ fontSize:12, color:C.sub, lineHeight:1.7, marginBottom:12 }}>{era.desc}</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {era.events.map((ev, j) => (
                      <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
                        <div style={{ width:4, height:4, borderRadius:'50%', background:era.colorL, marginTop:5, flexShrink:0 }} />
                        <div style={{ fontSize:11.5, color:C.txt, lineHeight:1.5 }}>{ev}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:14 }}>
                {ERAS.map((era, i) => (
                  <div key={era.id} data-era={i} className="era-leg"
                    style={{ display:'flex', alignItems:'center', gap:5, cursor:'pointer' }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:era.color, flexShrink:0 }} />
                    <span className={`era-leg-lbl era-leg-lbl-${i}`} style={{ fontSize:10, color:C.sub, letterSpacing:'0.05em' }}>{era.short}</span>
                  </div>
                ))}
              </div>

              {/* Vanilla JS — survives renderToStaticMarkup */}
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:14, marginBottom:0, lineHeight:1.6 }}>Turkmenistan has been governed by only three men since independence: Niyazov (1991–2006), Gurbanguly Berdimuhamedov (2007–2022), and now his son Serdar — while Gurbanguly retains real power above. This represents one of the world's most consolidated authoritarian successions, unique in that the father engineered a dynastic transfer while alive and retaining power.</p>
            </Panel>
          </div>
        </div>

        {/* 8. TOURISM */}
        <SectionHeader icon={Icons.briefcase} label="Tourism" />
        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="International Visitors (est.)" value="~10,000–50,000/yr" sub="No official tourism statistics published; one of the world's least-visited countries; strict visa regime" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Visa Policy" value="Very Restrictive" sub="Visa required for almost all nationalities; letter of invitation needed; restricted zones; strict oversight" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="UNESCO sites" value="4 listed" sub="Ancient Merv; Parthian fortresses (Nisa); Köneürgench; Cold Winter Deserts of Turan (2023)" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Darvaza Gas Crater" value="#1 attraction" sub="'Door to Hell' — burning 70m pit since 1971; iconic; government tried to extinguish 2022 (failed)" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ashgabat" value="Marble capital" sub="Guinness record: most white marble buildings; surreal Soviet-Turkmen architecture; restricted photography" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ancient Merv (Mary)" value="UNESCO 1999" sub="One of greatest Silk Road cities; Sultan Sanjar mausoleum; accessible from Mary city" accent={C.dim} delay={0.30} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Tourism Highlights" icon={Icons.map}>
              <Tbl rows={[
                ['Darvaza Gas Crater', '70m-wide burning pit; best visited at night; Karakum Desert'],
                ['Ancient Merv (Mary)', 'UNESCO 1999; Silk Road\'s greatest oasis city; Sultan Sanjar Mausoleum'],
                ['Köneürgench (North)', 'UNESCO 2005; ruined capital of ancient Khwarezm empire'],
                ['Nisa (Parthian Fortresses)', 'UNESCO 2007; near Ashgabat; Parthian Empire capital'],
                ['Ashgabat marble city', 'Surreal white-marble showcase; Independence Monument; Neutrality Arch'],
                ['Caspian Sea (Avaza)', 'Government resort zone near Turkmenbashi; beach tourism'],
                ['Yangykala Canyon', 'Spectacular pink-red canyon; remote Balkan province; Caspian region'],
              ]} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan has extraordinary tourism potential — the Darvaza crater, Merv's ruins, the surreal marble capital, and remote desert landscapes are genuinely world-class. Yet the country receives almost no tourists. The government's restrictive visa policy, mandatory minders for foreigners, and surveillance culture have made it one of the world's least-visited nations. This represents an enormous untapped opportunity — if political will to open tourism were to emerge.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Best Travel Months" icon={Icons.cloudSun}>
              <GradientBar title="Monthly temperature range — Ashgabat (°C)" values={[3,5,11,18,24,30,33,31,24,16,9,4]} colorStops={tempColor} unit="°" />
              <div style={{ height:1, background:C.border, margin:'16px 0' }} />
              <p style={{ fontSize:11, color:C.sub, marginBottom:11 }}>Best months for travel</p>
              <BarRow label="April–May (ideal)" value="12–24°C, blooming desert" pct={100} color={C.tm} />
              <BarRow label="September–October (good)" value="15–25°C, cooler" pct={85} color={C.yel} />
              <BarRow label="March (shoulder)" value="8–18°C, some rain" pct={65} color={C.blu} />
              <BarRow label="Jun–Aug (difficult)" value="30–45°C, extreme heat" pct={15} color={C.dim} />
              <BarRow label="Dec–Jan (cold/mild)" value="0–8°C; snow possible N" pct={40} color={C.dim} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Spring (April–May) is by far the best time to visit — the desert blooms briefly with wildflowers, temperatures are pleasant, and the Karakum's landscapes are at their most dramatic. The Darvaza crater is most spectacular visited at night in any season. The extreme summer heat (regularly 35–45°C) makes June–August physically dangerous for outdoor exploration.</p>
            </Panel>
          </div>
        </div>

        {/* 9. VITAL STATISTICS */}
        <SectionHeader icon={Icons.people} label="Vital Statistics" />
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12">
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderLeft:`3px solid ${C.dim}`, padding:'16px 20px' }}>
              <div style={{ fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:C.dim, marginBottom:8 }}>Data suppressed by government</div>
              <p style={{ fontSize:13, color:C.txt, lineHeight:1.7, marginBottom:0 }}>
                Turkmenistan does not publish vital statistics. Cause-of-death data, marriage and divorce rates, birth registrations, and mortality breakdowns are not released by official sources. The government has actively suppressed health reporting since the Niyazov era — including officially renaming diseases to avoid recording them. No internationally verified substitute dataset exists for this section.
              </p>
            </div>
          </div>
        </div>

        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Life Expectancy (2023)" value="~70.1 yrs" sub="UNDP HDR 2023: 70.1 yrs; Men 66.9 / Women 72.8 — large gender gap" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Infant Mortality (2023)" value="31.2 / 1,000" sub="World Bank 2023 (UN inter-agency group UNICEF/WHO/WB); declining trend" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Health Spending (est.)" value="~5.5% of GDP" sub="est.; unverified — WHO/UN est.; no official figure published by Turkmenistan" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Niyazov hospital closures" value="Historical" sub="2000s: all hospitals outside Ashgabat closed; restored post-2007 but quality gap persists" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Maternal Mortality (2020)" value="5.15 / 100,000" sub="Our World in Data / WHO 2020; 7 total maternal deaths in 2023 (OWID); improving" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="COVID-19 policy" value="Denied pandemic" sub="Govt refused to acknowledge COVID-19 officially; no lockdown announced; data unverified" accent={C.dim} delay={0.30} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Key Health Indicators" icon={Icons.water}>
              <Tbl rows={[
                ['Life expectancy at birth (2023)', '70.1 yrs — Men 66.9 / Women 72.8 (UNDP HDR 2023)'],
                ['Infant mortality (2023)', '31.2/1,000 — World Bank/UN inter-agency 2023'],
                ['Under-5 mortality (2020)', '41.8/1,000 — World Bank/UNICEF/WHO 2020'],
                ['Maternal mortality (2020)', '5.15/100,000 — Our World in Data/WHO 2020'],
                ['Physicians per 1,000 (est.; unverified)', '~2.2 (WHO est. — Turkmenistan does not publish)'],
                ['TB incidence (per 100K) (est.; unverified)', '~70 — above average; no confirmed source fetched'],
              ]} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan's health data is systematically unreliable — the government restricts reporting to maintain the image of a healthy, thriving nation. Niyazov's bizarre 2005 decree closing all hospitals outside Ashgabat (claiming people could just go to the capital) remains the worst deliberate healthcare disruption in post-Soviet history. Berdimuhamedov reversed it in 2007, but regional healthcare quality has not recovered to Soviet levels.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Social & Health Context" icon={Icons.chart}>
              <BarRow label="Life expectancy (men) — UNDP HDR 2023" value="66.9 yrs" pct={67} color={C.blu} />
              <BarRow label="Life expectancy (women) — UNDP HDR 2023" value="72.8 yrs" pct={73} color={C.red} />
              <BarRow label="HDI health index (UNDP 2023)" value="0.78" pct={78} color={C.tm} />
              <BarRow label="Inequality-adj. life exp. index (UNDP 2021)" value="0.622" pct={62} color={C.dim} />
              <BarRow label="Urban clean water access (est.; unverified)" value="~97%" pct={97} color={C.yel} />
              <BarRow label="Rural clean water access (est.; unverified)" value="~75%" pct={75} color={C.dim} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>The 20% disparity in life expectancy between men and women is the highest in Central Asia (UNDP analysis 2024). This reflects high male mortality from alcohol, tobacco, occupational hazards, and road accidents. The state's heavy subsidies on tobacco and alcohol paradoxically contribute to male mortality while keeping them politically loyal.</p>
            </Panel>
          </div>
        </div>

        {/* 10. ENERGY */}
        <SectionHeader icon={Icons.mountain} label="Energy & Resources" />
        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Natural Gas Reserves" value="#4 World" sub="13–14 tcm proven (BP/Cedigaz 2024 est. — official claim 27+ tcm, widely disputed)" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gas Production (2023)" value="~76 bcm/yr" sub="UNECE 2025; Galkynysh field dominant; below Soviet-era records" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gas exports (2024)" value="~45 bcm/yr" sub="OIES estimate; ~80% to China (CAGP); remainder Iran, Uzbekistan" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Oil production" value="~194,000 bbl/day" sub="UNECE 2025; Caspian offshore and onshore; small by regional standards" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Galkynysh Gas Field" value="World #2 (est.)" sub="Estimated world's 2nd-largest gas field; South Yolotan province; opened 2013" accent={C.yel} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Renewables (current)" value="<1% of mix" sub="Virtually no renewable generation; 99%+ from natural gas; solar potential vast but untapped" accent={C.dim} delay={0.30} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Electricity Generation Mix (2024 est.)" icon={Icons.chart}>
              <Donut
                label="~32 TWh"
                sublabel="generated 2024 est."
                segments={[
                  { label:'Natural gas (dominant)', value:'~99%', pct:99, color:C.tm  },
                  { label:'Hydro (minor)',           value:'~1%',  pct:1,  color:C.blu },
                ]}
              />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>2024 est. — Enerdata; fuel-type split modelled, not officially published</p>
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:12, marginBottom:0, lineHeight:1.6 }}>Turkmenistan is 99%+ dependent on natural gas for electricity — the most gas-concentrated power mix in the world. Domestic gas and electricity prices are heavily subsidised (among the cheapest in the world), creating a perverse incentive against energy efficiency. While gas reserves are immense, the country's carbon intensity is 152% above the global average — the highest in Central Asia (UNECE 2025). No significant renewables capacity exists despite extraordinary solar potential.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Energy & Resources Facts" icon={Icons.landmark}>
              <Tbl rows={[
                ['Proven gas reserves (BP/Cedigaz est.)', '13–14 tcm — 4th globally (~7% of world total)'],
                ['Galkynysh (South Yolotan) field', 'Est. 2nd-largest single gas field globally'],
                ['Gas pipeline to China (CAGP)', 'Lines A-B-C open; Line D stalled; 40 bcm/yr capacity'],
                ['TAPI pipeline (planned)', 'Turkmenistan-Afghanistan-Pakistan-India; long-delayed'],
                ['Trans-Caspian Gas Pipeline', 'Proposed under Caspian Sea to Azerbaijan/EU; contested by Russia/Iran'],
                ['Cotton production', '~1.2M tonnes/yr; state monopoly; state-set price'],
              ]} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>The Trans-Caspian Gas Pipeline (TCP) is Turkmenistan's biggest strategic prize — a subsea pipeline to Azerbaijan would allow exports to Europe, breaking total dependence on China. But Russia and Iran have blocked it for decades on spurious "environmental" grounds (they are strategic competitors). The TAPI pipeline to South Asia has been in planning since the 1990s; construction of the Turkmen section is underway but Afghan section remains stalled.</p>
            </Panel>
          </div>
        </div>

        {/* 11. INFRASTRUCTURE */}
        <SectionHeader icon={Icons.map} label="Infrastructure & Digital Connectivity" />
        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Internet Penetration (Jan 2025)" value="34.9%" sub="DataReportal Digital 2025; 2.64M users; lowest in Central Asia; social media 3.2% only" accent={C.dim} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Press Freedom (RSF 2024)" value="Rank 175/180" sub="Near-bottom globally; between Vietnam and Iran; all media state-controlled" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Road Network (est.; unverified)" value="~58,000 km" sub="est.; unverified — CIA WF cited but not directly fetched; Ashgabat2013Türkmenabat motorway (970 km) opened Apr 2026 (Wikipedia)" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Railway Network" value="4,980 km" sub="Wikipedia / Turkmendemiryollary; 37th globally (was ~3,115 km in v1 — corrected); state-owned" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Main Port" value="Turkmenbashi" sub="Caspian Sea port; ferry links to Azerbaijan; oil terminal; international trade hub" accent={C.yel} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ashgabat International Airport" value="Opened 2016" sub="Gleaming new terminal built with gas revenues; bird-shaped design; low utilisation" accent={C.dim} delay={0.30} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Key Infrastructure & Connectivity" icon={Icons.map}>
              <Tbl rows={[
                ['Central Asia-China Gas Pipeline (CAGP)', 'Lines A,B,C open (40 bcm); Line D stalled (China financing paused)'],
                ['Caspian Trans-national Corridor', 'Rail ferry Turkmenbashi-Azerbaijan; connects to European rail'],
                ['Lapis Lazuli Corridor', 'Trade route: Turkmenistan→Afghanistan→Pakistan→Turkey; operational'],
                ['TAPI Pipeline (under construction)', 'Turkmenistan→Afghanistan→Pakistan→India; TM section done; AF stalled'],
                ['Ashgabat Agreement (transit)', '6-country road/rail transport corridor; TM central hub'],
                ['VPN ban', 'Citizens fined for using VPNs; internet heavily filtered and monitored'],
              ]} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Despite physical infrastructure investment (gas pipelines, roads, the new airport), Turkmenistan's digital and information infrastructure is deliberately impoverished. Internet speeds are among the world's slowest, VPN use is criminalised, and social media is blocked. The government fears uncontrolled information flows — a rational calculus for a regime dependent on cult of personality and information control.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Digital & Media Indicators" icon={Icons.chart}>
              <BarRow label="Internet access (DataReportal Jan 2025)" value="34.9%" pct={35} color={C.tm} />
              <BarRow label="Mobile subscriptions (DataReportal Jan 2025)" value="~68%" pct={68} color={C.yel} />
              <BarRow label="Press freedom (100=free; RSF rank 175)" value="~5/100 est." pct={5} color={C.dim} />
              <BarRow label="Social media access (DataReportal 2025)" value="3.2%" pct={3} color={C.dim} />
              <BarRow label="Fixed broadband (World Bank 2022)" value="5.2%" pct={5} color={C.dim} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan is the world's 3rd most censored country after North Korea and Eritrea (RSF 2024). All domestic media is state-owned and produces nothing but government propaganda. Approximately two dozen small newspapers contain only praise for the president and official announcements. The internet, where accessible, is filtered to block all independent news, foreign social media, and opposition sites. Citizens found with opposition content face serious legal consequences.</p>
            </Panel>
          </div>
        </div>

        {/* 12. GENDER & SOCIETY */}
        <SectionHeader icon={Icons.people} label="Social Indicators & Inequality" />
        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Freedom House (2024)" value="1/100" sub="Not Free; near-total denial of political rights and civil liberties" accent={C.dim} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gender Inequality Index (est.)" value="~0.266" sub="est.; unverified — UNDP HDR cited but no confirmed search result for Turkmenistan GII value" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Women in parliament (Feb 2024)" value="25.6%" sub="UN Women Data Hub Feb 2024; formally reported; opposition parties absent — does not reflect real power" accent={C.tm} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Cotton forced labour" value="Ongoing (est.)" sub="Public sector workers mobilised for harvest annually; ILO monitoring; distinct from Uzbekistan (which abolished)" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="LGBTQ+ rights" value="Criminalised" sub="Same-sex relations illegal; up to 2 years imprisonment; no legal recognition" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Corruption (TI CPI 2023)" value="18/100" sub="Rank 170/180; systemic; no independent anti-corruption body; Berdimuhamedov family" accent={C.dim} delay={0.30} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Human Rights Overview" icon={Icons.landmark}>
              <BarRow label="Corruption Perception Index (100=clean)" value="18/100" pct={18} color={C.tm} />
              <BarRow label="Press Freedom (100=free; RSF rank 175)" value="~5/100 est." pct={5} color={C.yel} />
              <BarRow label="Political rights (FH 2024, 100=best)" value="1/100" pct={1} color={C.dim} />
              <BarRow label="Rule of law (WJP est.; unverified — WJP not fetched)" value="~25/100 est." pct={25} color={C.blu} />
              <BarRow label="Civil liberties (FH 2024, 100=best)" value="4/100" pct={4} color={C.dim} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan ranks among the world's 5 most repressive states alongside North Korea, Eritrea, Syria, and South Sudan. The Berdimuhamedov family and its allies control all significant economic and political assets. Corruption is not merely endemic — it is systemic and semi-formalised, with known "prices" for official positions, school places, and passports. No independent civil society, trade unions, or political parties are permitted.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Risks & Opportunities" icon={Icons.chart}>
              <BarRow label="Gas export diversification (TAPI, TCP)" value="Critical priority" pct={90} color={C.tm} />
              <BarRow label="Galkynysh gas field development" value="Transformational" pct={85} color={C.yel} />
              <BarRow label="China dependency risk" value="Extreme (~80% exports)" pct={95} color={C.dim} />
              <BarRow label="Tourism potential (underdeveloped)" value="High" pct={70} color={C.blu} />
              <BarRow label="Governance/transparency risk" value="Very high" pct={90} color={C.dim} />
              <BarRow label="Climate change / desertification" value="High (80% desert)" pct={75} color={C.dim} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan's strategic opportunity is clear — vast gas reserves, a central geographic position, and extraordinary tourist landscapes. But the governance model is a structural risk multiplier: single-family control, extreme opacity, and zero diversification from gas revenues. The regime's survival strategy (subsidies, nationalism, isolation) inhibits the very economic reform needed to translate gas wealth into human development.</p>
            </Panel>
          </div>
        </div>

        {/* 13. ENVIRONMENT */}
        <SectionHeader icon={Icons.water} label="Environment" />
        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="CO₂ per capita (2021)" value="~14.1 t" sub="World Bank 2021; among highest in region — gas-heavy economy; subsidised domestic consumption" accent={C.dim} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Methane emissions" value="Top 5 globally" sub="Turkmenistan ranked 4th–5th globally for methane leaks from gas infrastructure (UNEP/IEA); Galkynysh field a major source" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Karakum Desert" value="~70% of land" sub="12th-largest desert globally; expanding due to overuse of Amu Darya water via Karakum Canal" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Aral Sea impact" value="Northern TM affected" sub="Sarygamysh Lake (former Aral drainage) now saline; dust storms from exposed Aral seabed reach N. Turkmenistan" accent={C.blu} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Gas flaring" value="Significant (est.)" sub="est.; unverified — Turkmenistan does not publish flaring data; satellite data (Global Gas Flaring Tracker) confirms major flaring" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Renewable energy" value="~0%" sub="Near-zero renewable capacity; 100% gas-fired power; government has stated solar targets but no capacity installed as of 2024" accent={C.dim} delay={0.30} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Key Environmental Pressures" icon={Icons.water}>
              <BarRow label="Methane leaks from gas infrastructure (UNEP/IEA — satellite confirmed)" value="Severe" pct={95} color={C.dim} />
              <BarRow label="Karakum Canal water losses — waterlogging & salinisation (est.; unverified)" value="High" pct={80} color={C.dim} />
              <BarRow label="Aral Sea dust storm impact on N. Turkmenistan (est.; unverified)" value="Moderate" pct={55} color={C.yel} />
              <BarRow label="Gas flaring — CO₂ & black carbon (est.; satellite data only)" value="High" pct={75} color={C.dim} />
              <BarRow label="Desertification rate (est.; unverified — no official land degradation data published)" value="Ongoing" pct={60} color={C.dim} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan does not publish environmental monitoring data. All assessments rely on satellite observations, international agency estimates, and academic studies. The government has suppressed reporting of the Darvaza crater's environmental impact and methane leakage rates from ageing Soviet-era gas infrastructure — both significant climate concerns. Turkmenistan signed the Paris Agreement but has not submitted credible NDC implementation reports.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Environmental Facts" icon={Icons.map}>
              <Tbl rows={[
                ['CO₂ total emissions (World Bank 2021)', '~71M tonnes — 4.2% of GDP carbon intensity'],
                ['Methane global rank (UNEP/IEA satellite)', 'Top 5; Galkynysh & Dauletabad fields major sources'],
                ['Karakum Canal evaporation loss (est.)', '~30–40% of diverted water lost to evaporation'],
                ['Sarygamysh Lake salinity', 'Rising; former Aral drainage now salt lake; fish-free'],
                ['Forest cover', '~8.8% (World Bank 2021); mostly saxaul shrubland'],
                ['Paris Agreement status', 'Ratified 2016; NDC submitted but implementation unverified'],
                ['Darvaza crater (methane)', 'Burning since 1971; attempted extinguishing 2022 failed; methane leak volume unknown — government does not disclose'],
              ]} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan's per-capita CO₂ of ~14 tonnes is among the highest in Central Asia and well above the global average of ~4.7 tonnes — driven by heavily subsidised domestic gas consumption (near-zero price to citizens) and an economy with zero energy efficiency incentives. The methane leakage from Turkmenistan's gas infrastructure is a global climate issue, not just a national one — satellite data from UNEP and IEA consistently identifies it as a top-5 emitter.</p>
            </Panel>
          </div>
        </div>

        {/* 14. BUSINESS */}
        <SectionHeader icon={Icons.briefcase} label="Business & Investment" />
        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Ease of Doing Business (2020)" value="Rank 125/190" sub="World Bank DB 2020 (index discontinued after 2021); construction permits & trading across borders weakest" accent={C.dim} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Economic Freedom (Heritage 2024)" value="~40/100" sub="est.; unverified — Turkmenistan excluded from Heritage Index 2024; estimate based on BTI scores and prior Heritage ratings" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Corruption (TI CPI 2023)" value="18/100" sub="Rank 170/180; bribes required for virtually all business interactions; no rule of law for private enterprise" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="FDI (est.)" value="Minimal" sub="No official FDI data published; state dominates all significant economic activity; foreign firms need government partner" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Bertelsmann BTI 2024" value="3.6 / 10" sub="Market economy score; state controls prices, banking, currency, land and major industry; private sector heavily constrained" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Internet freedom" value="Not Free" sub="Freedom House Internet Freedom 2024; VPN criminalised; social media blocked; slowest internet in Central Asia" accent={C.dim} delay={0.30} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Investment Climate Summary" icon={Icons.landmark}>
              <Tbl rows={[
                ['Ease of Doing Business rank (WB 2020)', '125/190 — registering property & getting credit worst'],
                ['Bertelsmann BTI market economy (2024)', '3.6/10 — among lowest in post-Soviet space'],
                ['Private sector share of GDP (est.)', '~25% — heavily state-dominated; gas sector 100% state'],
                ['Banking system', 'State-owned; no independent central bank policy; access to credit extremely limited for private firms'],
                ['Currency convertibility', 'Official peg 3.5 TMT=$1; parallel market diverges; capital controls restrict repatriation'],
                ['Land ownership', 'No private land ownership; 50-year leases only; state can revoke without compensation'],
                ['Contract enforcement (est.; unverified)', 'Effectively unenforceable; courts not independent; no foreign arbitration recognised in practice'],
              ]} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan's business environment is defined by the absence of rule of law. Contracts are unenforceable without government backing, the banking system is a state tool, and currency controls make profit repatriation effectively impossible. Foreign firms that have entered (mostly Chinese, Turkish, and Russian contractors) operate on government concessions rather than competitive market terms. The only reliable sector for foreign capital is construction — and only for firms with direct presidential-level connections.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Risks & Opportunities" icon={Icons.chart}>
              <BarRow label="Gas export diversification (TAPI, TCP pipeline)" value="Critical priority" pct={90} color={C.tm} />
              <BarRow label="Galkynysh mega-field development potential" value="Transformational" pct={85} color={C.yel} />
              <BarRow label="China single-buyer dependency risk" value="Extreme" pct={95} color={C.dim} />
              <BarRow label="Tourism potential (severely underdeveloped)" value="High" pct={70} color={C.blu} />
              <BarRow label="Governance & transparency risk" value="Very high" pct={90} color={C.dim} />
              <BarRow label="Climate / methane liability risk" value="Growing" pct={65} color={C.dim} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan's core strategic opportunity is clear: world-class gas reserves, a central geographic position between China, Russia, South Asia and Europe, and untapped tourism. The binding constraint is governance — single-family control, opacity, and zero market reform inhibit every one of these opportunities. The TAPI pipeline (Turkmenistan-Afghanistan-Pakistan-India), if ever completed, would be transformational; it has been "under construction" since 2015 with no delivery timeline confirmed.</p>
            </Panel>
          </div>
        </div>

        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Total Exports (2024)" value="~$12.4B" sub="FocusEconomics; gas dominant; lower than 2023 due to reduced prices" accent={C.tm} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Total Imports (2024)" value="~$3.8B" sub="FocusEconomics; machinery, construction materials, consumer goods" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Trade surplus" value="~$8.6B" sub="Structural surplus from gas exports; very low import demand due to state subsidies" accent={C.yel} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Main export partner (2024)" value="China 69.4%" sub="World's Top Exports 2024; Uzbekistan 10.7%, Turkey 7.7%" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="FDI (est.)" value="Minimal" sub="Business environment ranked among worst globally; state dominance; no FDI data published" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Remittances (est.)" value="~2–3% of GDP" sub="No official data; estimated from diaspora in Turkey, Russia; not a major revenue source" accent={C.dim} delay={0.30} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Export Destinations (est.)" icon={Icons.chart}>
              <BarRow label="China — natural gas via CAGP (World's Top Exports 2024)" value="69.4%" pct={100} color={C.tm} />
              <BarRow label="Uzbekistan — gas, electricity (World's Top Exports 2024)" value="10.7%" pct={15} color={C.yel} />
              <BarRow label="Turkey — cotton yarn, textiles (World's Top Exports 2024)" value="7.7%" pct={11} color={C.blu} />
              <BarRow label="Greece (World's Top Exports 2024)" value="2.3%" pct={3} color={C.dim} />
              <BarRow label="Russia + others" value="~10%" pct={14} color={C.dim} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>est. — Turkmenistan does not publish official trade data; estimates from partner countries' import records. China's share is the most extreme bilateral trade dependence of any major energy producer in the world — Chinese price cuts in 2015–2016 sent Turkmenistan into economic crisis.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Key Trade & Fiscal Facts" icon={Icons.landmark}>
              <Tbl rows={[
                ['Hydrocarbon share of exports (2024)', '84.9% — World Bank; petroleum gas $4.88B + refined petroleum $808M'],
                ['Fertilisers (2022 ITC data)', '4.8% of exports — nitrogenous fertilisers $279M (OEC)'],
                ['Cotton exports (2022 ITC data)', '1.9% — non-retail cotton yarn $170M (OEC)'],
                ['Government debt/GDP (2024)', '~3.6% — very low (IMF 2025)'],
                ['Budget surplus (2024)', '0.8% of GDP (World Bank)'],
                ['Budget revenue (2024)', '14.5% of GDP — low (World Bank)'],
                ['Currency peg', '3.5 TMT = $1 USD (fixed since 2014/2015; FocusEconomics)'],
                ['WTO membership', 'Observer status since 2020 (ITC Trade Profile)'],
              ]} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan's fiscal situation appears robust on paper but entirely reflects gas export windfalls. Budget revenue at just 14.5% of GDP is unusually low — the state owns revenue-generating assets directly rather than taxing private activity. The fixed currency peg artificially cheapens imports while distorting the broader economy.</p>
              <GradientBar title="Trade balance 2015–2024 ($B est.)" values={[1.2, 1.0, 2.1, 3.5, 4.2, 2.8, 3.5, 5.4, 8.0, 8.6]} xLabels={['2015','2016','2017','2018','2019','2020','2021','2022','2023','2024']} colorStops={(p, v) => v >= 0 ? `rgb(${Math.round(153-118*p/100)},${Math.round(153+6*p/100)},${Math.round(153-89*p/100)})` : `rgb(${Math.round(153+79*p/100)},${Math.round(153-128*p/100)},${Math.round(153-109*p/100)})`} fmt={v => v > 0 ? `+${v}B` : `${v}B`} absScale={true} />
              <div style={{ fontSize:9, letterSpacing:'0.06em', textTransform:'uppercase', color:C.dim, marginTop:5, lineHeight:1.5 }}>Official trade data not fully published · Modelled from export/import estimates · Unverified</div>
            </Panel>
          </div>
        </div>

        {/* 15. CRIME & SECURITY */}
        <SectionHeader icon={Icons.landmark} label="Crime & Security" />
        <div id="item" className="row g-1 mb-3">
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Homicide rate (est.)" value="~2–3 / 100K" sub="UNODC modelled est. — Turkmenistan does not publish official crime statistics" accent={C.dim} delay={0.05} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Afghanistan border" value="744 km" sub="Drug trafficking route; Turkmenistan-Afghanistan border; significant opiate transit" accent={C.dim} delay={0.10} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Corruption (TI CPI 2023)" value="Rank 170/180" sub="Score 18/100; systemic; only 10 countries ranked lower globally (TI 2023)" accent={C.dim} delay={0.15} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Press Freedom (RSF 2024)" value="Rank 175/180" sub="5th worst globally; near-total information blackout" accent={C.dim} delay={0.20} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Political prisoners" value="Unknown" sub="No independent monitoring permitted; Amnesty/HRW report hundreds of disappeared" accent={C.dim} delay={0.25} /></div>
          <div className="col-6 col-md-4 d-flex"><KpiCard label="Permanent neutrality" value="Strategic buffer" sub="UN-recognised neutrality since 1995; no foreign military bases; avoids regional conflicts" accent={C.tm} delay={0.30} /></div>
        </div>
        <div id="item" className="row gy-3 mb-3">
          <div className="col-12 col-md-6">
            <Panel title="Crime & Security Indicators" icon={Icons.landmark}>
              <Tbl rows={[
                ['Homicide rate (est.)', '~2–3 per 100,000 (UNODC modelled — no official data)'],
                ['Afghanistan border (drug transit)', '744 km border; significant heroin/opium transit'],
                ['Terrorism (GTI 2024)', 'Low terrorism threat; state security apparatus effective'],
                ['Political prisoners', 'Hundreds estimated (HRW/AI); no access to verify'],
                ['Corruption (TI 2023)', 'Rank 170/180; score 18/100'],
                ['Permanent neutrality (since 1995)', 'No military alliances; no foreign bases; no NATO/CSTO'],
              ]} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan's "security" is paradoxical — it is one of the world's most repressive states where street crime is low (the pervasive security apparatus deters ordinary crime) but state violence against citizens is endemic. The Afghan border represents a significant drug trafficking challenge. Permanent neutrality — the country's signature foreign policy — means it has avoided both NATO and CSTO entanglements, though critics argue it primarily serves to insulate the regime from external pressure.</p>
            </Panel>
          </div>
          <div className="col-12 col-md-6">
            <Panel title="Security Context" icon={Icons.chart}>
              <BarRow label="Corruption (CPI, 100=clean)" value="18/100" pct={18} color={C.tm} />
              <BarRow label="Press freedom (100=free, est.)" value="~5/100" pct={5} color={C.yel} />
              <BarRow label="Political rights (FH 2024, 100=best)" value="1/100" pct={1} color={C.dim} />
              <BarRow label="Civil liberties (FH 2024, 100=best)" value="4/100" pct={4} color={C.dim} />
              <p id="subnote" style={{ fontSize:11, color:C.sub, marginTop:10, marginBottom:0, lineHeight:1.6 }}>Turkmenistan's governance scores represent some of the world's worst: TI CPI of 18/100 (rank 170/180) places it alongside states such as South Sudan and Haiti. Freedom House's combined score of 5/100 is the lowest in Central Asia — lower even than Tajikistan. The absence of any independent monitoring makes all figures estimates — the government denies all negative reporting as foreign interference. The contrast with Uzbekistan's reform trajectory since 2016 is stark.</p>
            </Panel>
          </div>
        </div>

        <div id="footer" style={{ padding:'8px 0 0', marginTop:8 }}>
          <p style={{ fontSize:10.5, color:'#555', lineHeight:1.7 }}>
            Sources: World Bank 2024–2025 · IMF Article IV June 2025 · UNDP HDR 2023/2024 · Transparency International CPI 2023 · WHO · RSF Press Freedom 2024 · Freedom House 2024 · Bertelsmann Stiftung BTI 2024 · UN Common Country Analysis (CCA) Turkmenistan 2023 · OIES Energy Comment Sept 2024 · UNECE Energy Policy Brief 2025 · ADB · FocusEconomics · Blue Green Atlas · CIA World Factbook · Data verified June 2026.
          </p>
          <p style={{ fontSize:9.5, color:'#444', marginTop:6, lineHeight:1.6, textAlign:'center' }}>
            Generated June 2026 · Claude Sonnet 4.6 (Anthropic) · iAlmirPro
          </p>
        </div>

      </div>
    </>
  );
}
