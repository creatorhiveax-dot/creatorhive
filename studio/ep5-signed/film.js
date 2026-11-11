'use strict';
/* CreatorChahiye Ep. 5 "Signed." : frame-accurate film. render(t) draws the frame for time t (seconds). Stateless, so renders are resumable. */
const W=1080,H=1920,BEAT=60/110,FLOOR=1500,CS=.8,MS=.58,CX=800,TAU=Math.PI*2;
const stage=document.getElementById('stage');

/* ---------- helpers ---------- */
const es=x=>(1-Math.cos(Math.PI*C(x)))/2;                       // sine in-out (slow drifts)
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const toHex=a=>'#'+a.map(v=>Math.round(C(v,0,255)).toString(16).padStart(2,'0')).join('');
function mixv(a,b,k){
  if(typeof a==='number')return L(a,b,k);
  if(typeof a==='string')return a[0]==='#'?toHex(hex(a).map((v,i)=>L(v,hex(b)[i],k))):(k<.5?a:b);
  if(Array.isArray(a))return a.map((x,i)=>mixv(x,b[i],k));
  const o={};for(const key in a)o[key]=mixv(a[key],b[key],k);return o}
/* keyframes: [[time,value,ease?]...]; ease belongs to the segment that ENDS at that key */
function K(t,keys){
  if(t<=keys[0][0])return keys[0][1];
  for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const a=keys[i-1],b=keys[i];return mixv(a[1],b[1],(b[2]||eio)(P(t,a[0],b[0])))}
  return keys[keys.length-1][1]}
const S=(t,keys)=>{let v=keys[0][1];for(const k of keys)if(t>=k[0])v=k[1];return v};   // step values (strings)
const rnd=i=>{let x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const inout=(t,a,b,din=.3,dout=.25)=>Math.min(P(t,a,a+din),1-P(t,b,b+dout));          // 0..1 visibility envelope
const px=v=>v.toFixed(2)+'px';

/* ---------- timeline (seconds) ---------- */
const G0=16.4, g=n=>G0+n*BEAT;                // beat grid that restarts on the SIGNED stamp
const T={
  buzz:[.27,.55,.82,1.09,1.36], h2:1.64, hookOut:3.05, pan0:3.0, pan1:3.85,
  b:[3.27,4.77,6.27,7.77], tub:8.32, stare0:8.7, flick:9.42, slump:9.62, door:9.9,
  mIn0:10.25, mIn1:11.35, place0:11.35, place1:11.74, tap:11.96, open0:12.0, card0:12.05, cardOut:13.72, nm0:11.45, nm1:13.1,
  pen0:13.3, cu0:13.9, cu1:14.3, penIn:14.3, sig0:14.68, sig1:15.98, stamp:G0, cuOut0:17.5, cuOut1:17.85,
  exhale:17.72, smile:18.12, signed0:17.9, signed1:19.35,
  fly0:g(4), flyGap:.13, flyDur:.72, gim0:19.0, gim1:19.72, moon0:19.9, moon1:20.8,
  cards:[g(7),g(8.5),g(10),g(11.5)], cardsOut:24.15,
  fIn0:23.45, fIn1:24.55, fit:g(15), fitOut:26.25, hand0:25.0, hand1:25.6, nod:25.68, pay:g(17), payOut:27.15,
  tag1:g(20), tag2:g(22), end0:30.0, badge:30.12, cta:30.38, logo:30.68, url:30.9, shades:30.85, END:33.0
};
const BUB=[['Rate thoda kam','karo na?'],['Contract mein ye','clause bhi...'],['Payment next month,','pakka.'],['Gym supplement','promote karoge?']];
const BENEFITS=['Dedicated manager','Rates negotiate hum karenge','Contracts, payments: sorted','Sirf right-fit brands'];

/* ---------- lighting moods ---------- */
const MOODS={
  night:{w0:'#06080F',w1:'#0C1222',fl:'#05060A',beam:'#5E76C4',beamO:.15,dim:.62,cb:.8,cs:.8,glow:0,spot:0},
  door:{w0:'#150B07',w1:'#35190C',fl:'#0C0605',beam:'#FF9142',beamO:.17,dim:.16,cb:.96,cs:1,glow:.6,spot:0},
  spot:{w0:'#130906',w1:'#3A1E0E',fl:'#0D0604',beam:'#FF9142',beamO:.24,dim:.04,cb:1.03,cs:1.04,glow:.85,spot:1}};
const mood=t=>K(t,[[0,MOODS.night],[T.door,MOODS.night],[T.door+1.0,MOODS.door,eo],[T.cu1,MOODS.door],[T.cuOut0,MOODS.spot]]);
const doorK=t=>eio(P(t,T.door,T.door+.75));

/* ---------- camera ---------- */
const cam=t=>K(t,[[0,[800,913,.92]],[T.pan0,[800,917,.95],es],[T.pan1,[540,960,1.0]],[T.b[3]+.4,[546,966,1.018],es],[9.6,[606,1004,1.09],es],
  [T.door+.8,[540,960,1.0]],[12.1,[540,960,1.0]],[13.2,[548,968,1.03],es],[T.cu1+.02,[690,1180,1.5],ei],[T.cu1+.03,[676,1052,1.17]],[T.cuOut0,[676,1052,1.17]],
  [19.3,[676,1052,1.15],es],[20.35,[540,960,1.0]],[T.pay,[540,960,1.0]],[T.end0,[540,978,1.04],es],[T.end0+.95,[540,820,.8]]]);

/* ---------- room set (world coordinates = screen coordinates at the neutral camera) ---------- */
function room(t,m){
  const dk=doorK(t), edge=L(270,96,dk), dimB=1-m.dim*.6;
  const slats=[...Array(7)].map((_,i)=>`<rect x="672" y="${500+i*44}" width="292" height="17" fill="#07060B" opacity=".62"/>`).join('');
  const sp=K(t,[[0,[800,235]],[T.pay+.4,[800,235]],[T.tag1+.2,[545,560]]]), so=m.spot;
  return `<svg class="abs" style="left:-500px;top:-500px" width="2100" height="2900" viewBox="-500 -500 2100 2900">
  <defs>
   <linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m.w0}"/><stop offset="1" stop-color="${m.w1}"/></linearGradient>
   <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m.fl}"/><stop offset="1" stop-color="#030303"/></linearGradient>
   <radialGradient id="gglow" cx="620" cy="1080" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8A4418" stop-opacity=".55"/><stop offset="1" stop-color="#8A4418" stop-opacity="0"/></radialGradient>
   <linearGradient id="gbeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m.beam}" stop-opacity=".5"/><stop offset="1" stop-color="${m.beam}" stop-opacity="1"/></linearGradient>
   <linearGradient id="gdoor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFDCA8"/><stop offset=".55" stop-color="#FFB56E"/><stop offset="1" stop-color="#FF8F43"/></linearGradient>
   <linearGradient id="gspill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C56A2C" stop-opacity=".75"/><stop offset="1" stop-color="#8A4418" stop-opacity=".25"/></linearGradient>
   <linearGradient id="gglass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22326A"/><stop offset="1" stop-color="#141C40"/></linearGradient>
   <linearGradient id="gspot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB066" stop-opacity="0"/><stop offset=".45" stop-color="#FFB066" stop-opacity=".1"/><stop offset="1" stop-color="#FFB066" stop-opacity=".2"/></linearGradient>
   <linearGradient id="gpot" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B9562E"/><stop offset="1" stop-color="#7E3319"/></linearGradient>
   <filter id="fb8" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
   <filter id="fb20" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="20"/></filter>
   <clipPath id="cwin"><rect x="672" y="484" width="292" height="304"/></clipPath>
  </defs>
  <rect x="-500" y="-500" width="2100" height="1920" fill="url(#gw)"/>
  <rect x="-500" y="-500" width="2100" height="1920" fill="url(#gglow)" opacity="${m.glow}"/>
  <!-- window -->
  <rect x="656" y="468" width="324" height="336" rx="10" fill="#120A07"/>
  <g clip-path="url(#cwin)"><rect x="672" y="484" width="292" height="304" fill="url(#gglass)"/>
   <circle cx="902" cy="548" r="46" fill="#C9D2F2" opacity=".14"/><circle cx="902" cy="548" r="29" fill="#DCE1F2" opacity=".92"/>${slats}
   <rect x="672" y="484" width="292" height="304" fill="#FF9142" opacity="${m.glow*.16}"/></g>
  <rect x="811" y="476" width="14" height="320" fill="#120A07"/>
  <!-- shelf (only seen in the wide hook framing) -->
  <g style="filter:brightness(${dimB})"><rect x="1130" y="700" width="210" height="12" rx="4" fill="#24150D"/><rect x="1150" y="630" width="22" height="70" rx="3" fill="#7A3A1C"/><rect x="1175" y="618" width="18" height="82" rx="3" fill="#C9B9A8"/><rect x="1196" y="640" width="24" height="60" rx="3" fill="#3A2A22"/><circle cx="1282" cy="672" r="27" fill="#1B1512"/><circle cx="1282" cy="672" r="15" fill="#2E2520"/><circle cx="1276" cy="666" r="5" fill="#6C86D8" opacity=".5"/></g>
  <!-- door -->
  <rect x="12" y="680" width="268" height="745" rx="6" fill="#170D08"/>
  <rect x="96" y="700" width="164" height="725" fill="url(#gdoor)" opacity="${dk>0?1:0}"/>
  <rect x="60" y="640" width="260" height="840" fill="#FFB56E" opacity="${dk*.16}" filter="url(#fb20)"/>
  <g style="filter:brightness(${L(dimB,1,dk*.5)})">
   <path d="M22 ${690-34*dk} L${edge} 690 L${edge} 1425 L22 ${1425+78*dk}Z" fill="#2B180E"/>
   <path d="M22 ${690-34*dk} L${edge} 690 L${edge} 1425 L22 ${1425+78*dk}Z" fill="#000" opacity="${dk*.35}"/>
   <g opacity="${1-dk*.4}"><rect x="${L(56,34,dk)}" y="762" width="${L(182,48,dk)}" height="270" rx="8" fill="none" stroke="#150B06" stroke-width="5"/><rect x="${L(56,34,dk)}" y="1082" width="${L(182,48,dk)}" height="300" rx="8" fill="none" stroke="#150B06" stroke-width="5"/></g>
   <ellipse cx="${L(230,84,dk)}" cy="1074" rx="${L(11,4.5,dk)}" ry="11" fill="#CBA47C"/>
  </g>
  <!-- floor -->
  <rect x="-500" y="1420" width="2100" height="980" fill="url(#gf)"/>
  <path d="M-500 1421 H1600" stroke="#fff" stroke-opacity=".05" stroke-width="2"/>
  <path d="M${edge} 1425 L262 1425 L790 1960 L-120 1960 L-120 1560Z" fill="url(#gspill)" opacity="${dk*.85}"/>
  <!-- moon / warm beam from the window -->
  <path d="M657 520 L968 520 L842 1516 L322 1516Z" fill="url(#gbeam)" opacity="${m.beamO}"/>
  <ellipse cx="800" cy="1512" rx="255" ry="27" fill="#FF8A3A" opacity="${.05+.16*m.glow}" filter="url(#fb8)"/>
  <!-- spotlight -->
  <g opacity="${so}"><path d="M${sp[0]-70} -500 L${sp[0]+70} -500 L${sp[0]+sp[1]} 1516 L${sp[0]-sp[1]} 1516Z" fill="url(#gspot)" filter="url(#fb20)"/>
   <ellipse cx="${sp[0]}" cy="1514" rx="${sp[1]+30}" ry="40" fill="#FFB066" opacity=".26" filter="url(#fb20)"/></g>
  <!-- plant -->
  <g style="filter:brightness(${dimB}) saturate(${1-m.dim*.5})"><path d="M968 1330 Q896 1292 912 1196 Q976 1238 982 1330Z" fill="#2F5A30"/><path d="M990 1330 Q1064 1292 1058 1184 Q996 1240 984 1330Z" fill="#37663A"/><path d="M970 1332 Q948 1250 986 1174 Q1016 1250 994 1332Z" fill="#467A42"/>
   <path d="M940 1328 L1020 1328 L1009 1432 L951 1432Z" fill="url(#gpot)"/><rect x="936" y="1322" width="88" height="14" rx="5" fill="#C9653A"/></g>
  </svg>`}

function calendar(t,m){
  const months=['Jan','Feb','Mar','Apr'], tf=[T.b[2]+.42,T.b[2]+.80,T.b[2]+1.10], dur=.36;
  let idx=0,p=0; tf.forEach((x,i)=>{if(t>=x+dur)idx=i+1; else if(t>=x){idx=i;p=es(P(t,x,x+dur))}});
  const face=(mn,extra='')=>`<div class="abs" style="inset:0;border-radius:22px;overflow:hidden;background:linear-gradient(160deg,#F7F2EB,#D6CEC3);${extra}">
    <div style="height:56px;background:#D0424F;color:#FBEDEA;font-weight:700;font-size:31px;text-align:center;line-height:53px">${mn}</div>
    <div style="text-align:center;font-weight:800;font-size:108px;line-height:146px;color:#17100D;letter-spacing:-.03em">1</div></div>`;
  return `<div class="abs" style="left:108px;top:290px;width:220px;height:210px;perspective:900px;opacity:${es(P(t,T.pan0+.05,T.pan0+.5)).toFixed(3)};filter:brightness(${1-m.dim*.62}) saturate(${1-m.dim*.6});">
    <div class="abs" style="inset:0;border-radius:22px;box-shadow:0 16px 34px rgba(0,0,0,.5)"></div>
    ${face(months[Math.min(3,idx+(p>0?1:0))])}
    ${p>0?face(months[idx],`transform-origin:50% 0;transform:rotateX(${p*172}deg);backface-visibility:hidden;filter:brightness(${1-p*.9});box-shadow:0 ${10+p*30}px 30px rgba(0,0,0,.4)`):''}</div>`}

function table(m){return `<svg class="abs" style="left:560px;top:1220px;filter:brightness(${1-m.dim*.45})" width="240" height="320" viewBox="560 1220 240 320">
  <ellipse cx="677" cy="1506" rx="78" ry="10" fill="#000" opacity=".5"/>
  <rect x="668" y="1256" width="18" height="246" fill="#1A110C"/><rect x="681" y="1256" width="5" height="246" fill="#FF9142" opacity=".22"/>
  <rect x="630" y="1494" width="94" height="13" rx="6.5" fill="#1F140E"/>
  <rect x="590" y="1244" width="174" height="16" rx="8" fill="#2A1A11"/><rect x="592" y="1244" width="170" height="5" rx="2.5" fill="#6A4126" opacity=".85"/></svg>`}

/* ---------- characters ---------- */
const charAt=(svg,x,sc,cxl,m,extra='')=>`<div class="abs" style="left:${px(x-cxl*sc)};top:${px(FLOOR-880*sc)};width:${520*sc}px;filter:brightness(${m.cb.toFixed(3)}) saturate(${m.cs.toFixed(3)});${extra}">${svg}</div>`;
const crPt=(lx,ly)=>[CX+(lx-260)*CS,FLOOR-(880-ly)*CS];
const mkPt=(mx,lx,ly,bob=0)=>[mx+(lx-250)*MS,FLOOR-(880-ly-bob)*MS];
const IDLE_L=[[150,404],[128,520],[146,620]], IDLE_R=[[370,404],[392,520],[374,620]], READ_R=[[372,404],[404,506],[322,512]],
      POCKET_L=[[148,404],[132,520],[196,604]], GIM_R=[[372,404],[446,430],[470,352]], SIGN_L=[[150,404],[106,498],[152,552]];

function creator(t,m,ov){
  const B=T.b, hop=K(t,[[T.smile+.06,0],[T.smile+.2,-16,eo],[T.smile+.36,0,ei]]);
  const o={
    look:K(t,[[0,[0,-2]],[T.buzz[0],[0,-2]],[T.buzz[0]+.1,[0,-9],eo],[T.buzz[1],[0,-9]],[T.buzz[1]+.1,[-10,-5],eo],[T.buzz[2],[-10,-5]],[T.buzz[2]+.1,[10,-5],eo],
      [T.buzz[3],[10,-5]],[T.buzz[3]+.1,[-11,4],eo],[T.buzz[4],[-11,4]],[T.buzz[4]+.1,[11,4],eo],[1.95,[11,4]],[2.07,[-9,-3],eo],[2.3,[-9,-3]],[2.42,[8,-6],eo],[2.62,[8,-6]],[2.8,[0,0]],
      [B[0]+.1,[0,0]],[B[0]+.3,[-9,-6],eo],[B[0]+.75,[-9,-6]],[B[0]+1.05,[-3,7]],[B[1],[-3,6]],[B[1]+.25,[4,6],eo],[B[1]+.55,[3,9]],[B[1]+1.2,[-4,10]],
      [B[2]+.1,[-4,6]],[B[2]+.32,[-10,-8],eo],[B[3],[-10,-8]],[B[3]+.25,[-9,-6],eo],[T.tub-.1,[-9,-6]],[T.tub+.12,[-10,7],eo],[T.stare0,[-10,7]],[T.stare0+.42,[0,0]],
      [T.door+.05,[0,2]],[T.door+.3,[-11,0],eo],[T.mIn0,[-11,0]],[T.mIn1,[-9,4],es],[T.tap-.1,[-9,5]],[T.tap+.1,[-8,8],eo],[T.card0+.15,[-8,8]],[T.card0+.55,[-10,-5]],
      [T.pen0,[-10,-5]],[T.pen0+.3,[-7,9]],[T.cu1,[-7,9]],[T.cuOut0,[0,4]],[T.smile,[0,2]],[T.smile+.3,[0,0]],[T.fly0+.1,[0,0]],[T.fly0+.45,[-9,-4]],[T.fly0+1.3,[-10,3],es],
      [T.gim0+.5,[-10,3]],[T.gim1,[7,-6]],[21.3,[7,-6]],[21.5,[0,0]],[22.1,[0,0]],[22.3,[7,-6]],[T.fIn0+.3,[7,-6]],[T.fIn0+.6,[-10,0]],[T.fit+.2,[-10,0]],[T.fit+.45,[-8,-8]],
      [T.hand0+.2,[-8,-8]],[T.hand1,[-7,8]],[T.nod+.4,[-7,7]],[T.nod+.7,[-10,0]],[T.pay+.1,[-10,0]],[T.pay+.4,[-9,-10]],[T.tag1-.5,[-9,-10]],[T.tag1-.1,[0,0]]]),
    lid:Math.min(1,K(t,[[0,0],[B[0]+.7,0],[B[0]+1.05,.5],[B[1],.38],[B[1]+.2,.05],[B[2],.1],[B[2]+.3,.3],[B[3],.3],[B[3]+.2,.12],[T.stare0,.15],[T.stare0+.4,.48],
      [T.slump,.48],[T.slump+.22,.74],[T.door+.05,.74],[T.door+.25,0,eo],[T.pen0,0],[T.pen0+.3,.22],[T.cuOut0,.4],[T.exhale,.4],[T.exhale+.14,1],[T.smile-.1,1],[T.smile+.08,0,eo],
      [T.smile+.3,.16],[T.fly0,.1],[T.fly0+.3,0],[T.gim1,.08],[T.nod,.08],[T.nod+.15,.5],[T.nod+.4,.1]])
      +blink(t,[2.05,4.05,5.6,7.3,10.9,12.9,19.6,20.9,22.6,24.2,26.5,28.3,29.6,31.1])+.52*es(1-Math.abs(P(t,9.12,9.44)*2-1))*(t>9.12&&t<9.44?1:0)),
    brow:S(t,[[0,'worry'],[B[1]+.2,'up'],[B[2]+.1,'worry'],[T.stare0+.15,'skep'],[T.slump,'worry'],[T.door+.2,'up'],[T.pen0+.1,''],[T.smile,'up'],[T.smile+.6,''],[T.fit+.45,'up'],[T.hand0,''],[T.pay+.4,'up'],[T.tag1-.2,'']]),
    mouth:S(t,[[0,'flat'],[T.buzz[4]+.1,'o'],[2.75,'flat'],[B[0]+.85,'frown'],[B[1]+.25,'o'],[B[2]+.1,'flat'],[T.slump,'frown'],[T.door+.25,'o'],[T.mIn0+.5,'flat'],[T.card0+.5,'o'],[T.pen0+.1,'flat'],
      [T.exhale+.1,'o'],[T.smile,'smile'],[T.smile+.22,'grin'],[T.fly0+.2,'smile'],[T.nod,'grin'],[T.nod+.8,'smile'],[T.pay+.4,'grin'],[T.tag1-.2,'smile']]),
    squash:K(t,[[0,0],[B[0]+.75,0],[B[0]+1.1,.75],[B[1],.5],[B[1]+.25,.12],[B[2],.2],[B[3],.3],[T.slump,.3],[T.slump+.22,1,eo],[T.door+.05,1],[T.door+.4,0,eb],
      [T.exhale,0],[T.exhale+.16,.65],[T.smile-.05,.65],[T.smile+.12,0,eo]]),
    headDy:K(t,[[0,0],[B[0]+.75,0],[B[0]+1.1,11],[B[1],8],[B[1]+.25,2],[B[2]+.3,-3],[B[3],0],[T.slump,2],[T.slump+.22,17,eo],[T.door+.05,17],[T.door+.4,0,eb],
      [T.pen0,0],[T.pen0+.35,6],[T.cu1,6],[T.cuOut0,0],[T.exhale,0],[T.exhale+.16,9],[T.smile-.05,9],[T.smile+.12,-3,eo],[T.smile+.5,0],[T.nod+.02,0],[T.nod+.17,10],[T.nod+.4,0]]),
    tilt:K(t,[[0,0],[T.stare0,0],[T.stare0+.45,-3.5],[T.slump,-3.5],[T.slump+.22,3],[T.door+.3,0],[T.smile,0],[T.smile+.3,3],[T.fly0,0],[T.gim1-.2,0],[T.gim1+.3,3.5],[T.fIn0+.4,3.5],[T.fIn0+.8,-2],[T.tag1-.4,-2],[T.tag1,0]])
      +(t>T.gim1&&t<T.fIn0?Math.sin((t-T.gim1)*TAU/2.2)*1.6:0),
    bob:hop+(t>T.gim1&&t<T.end0?-Math.abs(Math.sin((t-G0)*Math.PI/BEAT/2))*4:0),
    sway:Math.sin(t*1.7)*1.6+K(t,[[T.smile+.06,0],[T.smile+.2,5],[T.smile+.5,0]]),
    ringGlow:K(t,[[0,.55],[T.flick,.55]])*(t>=T.flick&&t<T.door?S(t,[[T.flick,.25],[T.flick+.05,1],[T.flick+.1,.12],[T.flick+.17,.8],[T.flick+.22,.1],[T.flick+.3,.6],[T.flick+.35,.3]]):1)
      *K(t,[[T.door,1],[T.door+.01,.3],[T.door+.9,.75],[T.cu1,.75],[T.cuOut0,1.82]])*(t>T.cuOut0?.96+.04*Math.sin(t*2.4):1),
    phoneGlow:K(t,[[0,.4],[T.b[1],.4],[T.b[1]+.3,1.2],[T.b[2],1.2],[T.b[2]+.3,.4]])
  };
  o.ringGlow=Math.min(1,o.ringGlow);
  // arms
  if(t<T.gim1){
    o.arms='custom'; o.lhand=true; o.rprop='phone';
    o.ra=K(t,[[0,IDLE_R],[B[1]+.05,IDLE_R],[B[1]+.3,READ_R,eo],[B[2]-.05,READ_R],[B[2]+.3,IDLE_R],[T.gim0,IDLE_R],[T.gim1,GIM_R]]);
    o.la=K(t,[[0,IDLE_L],[T.pen0,IDLE_L],[T.pen0+.38,SIGN_L],[T.cu1+.1,SIGN_L],[T.cuOut0,IDLE_L],[T.gim0,IDLE_L],[T.gim1-.1,POCKET_L]]);
    if(t>T.gim0){o.rprop='gimbal';o.gflip=eio(P(t,T.gim0+.05,T.gim0+.4));o.gs=eb(P(t,T.gim0+.34,T.gim1));o.lhand=t<T.gim1-.14}
  } else {o.arms='creator';o.gimbal=1}
  if(ov)Object.assign(o,ov);
  return charAt(CR(o),CX,CS,260,m)}

const TRAY_L=[[186,404],[112,454],[50,378]], PLACE_R=[[316,404],[408,398],[500,412]], TAP_R=[[316,404],[402,420],[470,402]], WINDUP_R=[[316,404],[362,452],[330,420]];
const CHEST=`<g transform="rotate(-13 262 512)"><rect x="192" y="418" width="146" height="190" rx="13" fill="#15110F" stroke="#3A322D" stroke-width="3"/><rect x="326" y="418" width="12" height="190" rx="6" fill="#FF6A00"/><rect x="212" y="442" width="56" height="8" rx="4" fill="#FF9142" opacity=".75"/></g>`;
function monkState(t){
  if(t<T.mIn0-.25)return null;
  const o={tw:t*4.2,mouth:S(t,[[0,'smirk'],[T.tap,'grin'],[T.card0+1.0,'smirk'],[T.cuOut0,'grin'],[T.moon1+.3,'smirk'],[T.fIn0+.2,'grin'],[T.fIn0+1.4,'smirk'],[T.shades,'grin']])};
  let x=470,op=1;
  if(t<T.mIn1+.05){
    x=K(t,[[T.mIn0,178],[T.mIn1,470,es]]); op=eo(P(t,T.mIn0-.2,T.mIn0+.15));
    const amp=K(t,[[T.mIn0,0],[T.mIn0+.14,1.35],[T.mIn1-.22,1.35],[T.mIn1,0]]), ph=TAU*2.1*(t-T.mIn0);
    Object.assign(o,legsAt(ph,amp)); o.bob=-Math.abs(Math.sin(ph))*9*Math.min(1,amp); o.tilt=Math.sin(ph)*3.2*Math.min(1,amp);
  }
  if(t<T.place0)o.chest=CHEST;
  if(t<T.cu1+.1){
    o.ra=K(t,[[T.place0,CROSS_R],[T.place1,PLACE_R],[T.place1+.05,PLACE_R],[T.tap-.1,WINDUP_R],[T.tap,TAP_R,ei],[T.tap+.3,TAP_R],[T.tap+.7,CROSS_R]]);
    o.point=K(t,[[T.tap-.14,0],[T.tap-.04,1],[T.tap+.3,1],[T.tap+.5,0]]);
    o.tilt=(o.tilt||0)+K(t,[[T.tap-.1,0],[T.tap,4,ei],[T.tap+.4,0]]);
  } else {
    o.la=TRAY_L;
    if(t>=T.moon0&&t<T.moon1+.05){x=K(t,[[T.moon0,470],[T.moon1,232,es]]);const amp=K(t,[[T.moon0,0],[T.moon0+.14,1],[T.moon1-.18,1],[T.moon1,0]]),ph=-TAU*2.2*(t-T.moon0);
      Object.assign(o,legsAt(ph,amp));o.bob=-Math.abs(Math.sin(ph))*5*amp;o.tilt=-3*amp}
    else if(t>=T.moon1){x=232;o.bob=-Math.abs(Math.sin((t-G0)*Math.PI/BEAT/2))*3*(t<T.end0?1:0)}
    // "this way" for the founder
    o.ra=K(t,[[T.fIn0+.15,CROSS_R],[T.fIn0+.45,PUSH_R,eo],[T.fIn0+1.15,PUSH_R],[T.fIn0+1.5,CROSS_R]]);
    o.point=K(t,[[T.fIn0+.3,0],[T.fIn0+.45,1],[T.fIn0+1.15,1],[T.fIn0+1.3,0]]);
    if(t>=T.shades){const k=eo(P(t,T.shades,T.shades+.3));o.ra=LJ(CROSS_R,SHADE_R,k).map((p,i)=>i===2?[p[0],p[1]-6*Math.sin(P(t,T.shades+.3,T.shades+.62)*Math.PI)]:p);
      o.shades=eo(P(t,T.shades+.12,T.shades+.34));o.tilt=-4*Math.sin(P(t,T.shades+.1,T.shades+.62)*Math.PI/2)}
  }
  return {x,op,o}}

function founderState(t){
  if(t<T.fIn0-.2)return null;
  const x=K(t,[[T.fIn0,178],[T.fIn1,440,es]]), amp=K(t,[[T.fIn0,0],[T.fIn0+.14,1],[T.fIn1-.2,1],[T.fIn1,0]]), ph=TAU*2.7*(t-T.fIn0);
  const REST_R=[[368,404],[412,506],[394,588]], GIVE_R=[[368,404],[452,476],[532,546]], DOWN_R=[[368,404],[396,520],[380,618]];
  const o={arms:'custom',la:IDLE_L,lhand:true,rprop:null,walk:{phase:ph,amp},bob:-Math.abs(Math.sin(ph))*7*amp,
    ra:K(t,[[T.hand0,REST_R],[T.hand1,GIVE_R],[T.hand1+.15,GIVE_R],[T.hand1+.55,DOWN_R]]),
    look:K(t,[[T.fIn0,[6,0]],[T.fIn1,[9,0]],[T.fit+.2,[9,0]],[T.fit+.45,[8,-8]],[T.hand0,[8,-8]],[T.hand0+.25,[9,4]],[T.nod+.4,[9,0]],[T.pay+.1,[9,0]],[T.pay+.4,[2,-10]],[T.tag1-.5,[2,-10]],[T.tag1-.1,[0,0]]]),
    lid:K(t,[[T.nod-.15,0],[T.nod,.5],[T.nod+.28,.08]])+blink(t,[24.0,25.3,27.0,28.9,30.5]),
    mouth:S(t,[[0,'smirk'],[T.fIn1,'smile'],[T.nod-.1,'grin'],[T.nod+.8,'smile']]), brow:S(t,[[0,''],[T.fit+.4,'up'],[T.hand0,''],[T.pay+.4,'up'],[T.tag1-.2,'']]),
    headDy:K(t,[[T.nod-.15,0],[T.nod,10],[T.nod+.28,0]]), sway:Math.sin(ph)*3*amp, tilt:K(t,[[T.fIn1,0],[T.fIn1+.3,2.5],[T.tag1-.3,2.5],[T.tag1,0]])};
  return {x,op:eo(P(t,T.fIn0-.15,T.fIn0+.2)),o}}

/* ---------- five phones ---------- */
const PH=[{x:800,y:600,label:'Creator',n:3},{x:548,y:806,label:'Manager',n:12},{x:1052,y:806,label:'Accountant',n:7},{x:488,y:1108,label:'Lawyer',n:5},{x:1112,y:1108,label:'Editor',n:24}];
const ICONS=[
 `<circle cx="54" cy="98" r="29" fill="none" stroke="#3A1A08" stroke-width="6"/><path d="M46 82 L72 98 L46 114Z" fill="#3A1A08"/>`,
 `<path d="M26 72 H82 Q90 72 90 80 V108 Q90 116 82 116 H52 L36 130 V116 H26 Q18 116 18 108 V80 Q18 72 26 72Z" fill="#3A1A08"/><circle cx="38" cy="94" r="5" fill="#FFB27A"/><circle cx="54" cy="94" r="5" fill="#FFB27A"/><circle cx="70" cy="94" r="5" fill="#FFB27A"/>`,
 `<text x="54" y="120" text-anchor="middle" font-family="Outfit" font-weight="800" font-size="66" fill="#3A1A08">₹</text>`,
 `<path d="M30 64 H66 L82 80 V132 H30Z" fill="#3A1A08"/><path d="M66 64 V80 H82" fill="#7A4A2A"/><path d="M40 94 H72 M40 106 H72 M40 118 H60" stroke="#FFB27A" stroke-width="5" stroke-linecap="round"/>`,
 `<rect x="20" y="74" width="68" height="12" rx="6" fill="#3A1A08"/><rect x="20" y="92" width="44" height="12" rx="6" fill="#3A1A08"/><rect x="20" y="110" width="58" height="12" rx="6" fill="#3A1A08"/><path d="M68 66 V130" stroke="#C24E00" stroke-width="5" stroke-linecap="round"/>`];
const orbit=(i,t)=>{const a=1.35*(t-3)+i*TAU/5-Math.PI/2;return {x:CX+168*Math.cos(a),y:792+40*Math.sin(a),z:Math.sin(a),rot:Math.cos(a)*7}};
function trayPos(t){const ms=monkState(t);return mkPt(ms?ms.x:470,42,352,ms&&ms.o.bob||0)}
function phoneState(i,t){
  const b=T.buzz[i], s={glow:.35,sh:0,lab:0,badge:0,z:1,op:1};
  const hook={x:PH[i].x+Math.sin(t*1.3+i*1.9)*7,y:PH[i].y+Math.sin(t*1.7+i*2.6)*11,sc:1,rot:Math.sin(t*1.1+i)*3.5};
  // hook buzz
  const d=t-b; if(d>=0){const dec=Math.exp(-d*5.2);s.sh=Math.sin(d*TAU*21)*7*dec;s.glow=.35+.65*Math.max(dec,.45);hook.sc=1+.13*Math.exp(-d*9);s.badge=eb(P(d,0,.22));s.lab=eo(P(d,.03,.3))}
  let cur=hook;
  if(t>=T.pan0){
    const k=eio(P(t,T.pan0+i*.05,T.pan1+i*.05)), ob=orbit(i,t), dep=1+.1*ob.z;
    cur={x:L(hook.x,ob.x,k),y:L(hook.y,ob.y,k),sc:L(1,.44*dep,k),rot:L(hook.rot,ob.rot,k)}; s.z=k<.5?1:ob.z; s.lab*=1-P(t,T.hookOut,T.hookOut+.22);
    s.glow=L(s.glow,.3,k);
    // a brand pings: one phone lights up and buzzes
    T.b.forEach((bt,j)=>{if((j+1)%5===i){const e=t-bt;if(e>=0&&e<1){const dec=Math.exp(-e*5);s.glow=Math.max(s.glow,.3+.7*dec);s.sh=Math.sin(e*TAU*21)*9*dec;cur.sc*=1+.25*Math.exp(-e*8)}}});
    if(t>=T.door)s.glow*=L(1,.75,P(t,T.door,T.door+1));
  }
  // fly to the monk's tray
  const tf=T.fly0+i*T.flyGap;
  if(t>=tf){
    const k=P(t,tf,tf+T.flyDur), e=eio(k), st=orbit(i,tf), tp=trayPos(t), ex_=tp[0]+(i-2)*28, ey=tp[1]-6-.27*98, mx_=(st.x+ex_)/2, my=Math.min(st.y,ey)-170-i*16;
    const a=1-e; cur={x:a*a*st.x+2*a*e*mx_+e*e*ex_, y:a*a*st.y+2*a*e*my+e*e*ey - (k>=1?0:0), sc:L(.44*(1+.1*st.z),.27,e), rot:L(st.rot,(i-2)*-2.5,e)+Math.sin(e*Math.PI)*-24};
    if(k>=1){const q=t-tf-T.flyDur;cur.y+=-7*Math.exp(-q*9)*Math.abs(Math.cos(q*16));cur.rot=(i-2)*-2.5+Math.sin(t*2.1+i)*1.2}
    s.z=2; s.glow=L(.35,.6,e); s.sh=0;
  }
  return {...cur,...s}}
function phoneEl(i,s){
  const arcs=s.sh?[0,1].map(j=>{const r=74+j*20,o=Math.min(1,Math.abs(s.sh)/5)*(.75-j*.3);return `<path d="M${54-r*.8} ${98-r*.5} Q${54-r*1.05} 98 ${54-r*.8} ${98+r*.5} M${54+r*.8} ${98-r*.5} Q${54+r*1.05} 98 ${54+r*.8} ${98+r*.5}" stroke="#FFB27A" stroke-width="5" fill="none" stroke-linecap="round" opacity="${o.toFixed(3)}"/>`}).join(''):'';
  const svg=`<svg width="108" height="196" viewBox="0 0 108 196" style="overflow:visible;display:block">
   <rect x="-4" y="6" width="116" height="200" rx="26" fill="#000" opacity=".35"/>
   <rect x="0" y="0" width="108" height="196" rx="22" fill="#14110F" stroke="#5A4D45" stroke-width="3.5"/>
   <rect x="8" y="9" width="92" height="178" rx="15" fill="#FF9A52"/><rect x="8" y="9" width="92" height="178" rx="15" fill="#FFD2A8" opacity="${(.15+.6*s.glow).toFixed(3)}"/>
   <rect x="8" y="9" width="92" height="178" rx="15" fill="#0A0908" opacity="${(.55*(1-s.glow)).toFixed(3)}"/>
   <rect x="40" y="15" width="28" height="7" rx="3.5" fill="#14110F"/>${ICONS[i]}${arcs}
   ${s.badge>0?`<g transform="translate(98 8) scale(${s.badge.toFixed(3)})"><circle r="21" fill="#FF3D3D" stroke="#14110F" stroke-width="4"/><text y="8" text-anchor="middle" font-family="Outfit" font-weight="800" font-size="23" fill="#fff">${PH[i].n}</text></g>`:''}</svg>`;
  let h=`<div class="abs" style="left:${px(s.x-54)};top:${px(s.y-98)};opacity:${s.op};transform:rotate(${(s.rot+s.sh).toFixed(2)}deg) scale(${s.sc.toFixed(4)})">${svg}</div>`;
  if(s.lab>0.01)h+=`<div class="abs" style="left:${px(s.x)};top:${px(s.y+112)};opacity:${s.lab.toFixed(3)};transform:translate(-50%,${((1-s.lab)*14).toFixed(1)}px)"><div class="pill" style="font-size:31px;padding:7px 22px 9px">${PH[i].label}</div></div>`;
  return h}

/* ---------- props ---------- */
function folderEl(x,y,w,h,rot,open=0){
  const flat=h<30;
  return `<div class="abs" style="left:${px(x-w/2)};top:${px(y-h/2)};width:${px(w)};height:${px(h)};transform:rotate(${rot.toFixed(2)}deg);border-radius:${flat?5:9}px;background:#15110F;border:${flat?0:1.5}px solid #3A322D;box-shadow:0 6px 14px rgba(0,0,0,.4);overflow:visible">
   <div class="abs" style="right:0;top:0;bottom:0;width:${flat?9:7}px;background:#FF6A00;border-radius:0 ${flat?5:9}px ${flat?5:9}px 0"></div>
   ${flat&&open>0?`<div class="abs" style="left:8px;right:14px;top:-3px;height:5px;background:#FAF7F2;border-radius:2px"></div>`:''}
   ${flat?`<div class="abs" style="left:0;top:${open>0?-4:0}px;width:100%;height:6px;background:#221B17;border-radius:4px;border-top:1.5px solid #4A3F38;transform-origin:0 50%;transform:rotate(${(-open*62).toFixed(2)}deg)"><div class="abs" style="right:0;top:0;bottom:0;width:9px;background:#FF6A00;border-radius:0 4px 4px 0"></div></div>`:''}</div>`}
function trayEl(t){const p=trayPos(t);return `<div class="abs" style="left:${px(p[0]-76)};top:${px(p[1]-6)};width:152px;height:11px;border-radius:5px;background:#15110F;border-top:1.5px solid #4A3F38;box-shadow:0 8px 14px rgba(0,0,0,.45)"><div class="abs" style="left:0;top:0;bottom:0;width:10px;background:#FF6A00;border-radius:5px 0 0 5px"></div></div>`}
function heroCard(t){
  const k=P(t,T.card0,T.card0+.6), out=ei(P(t,T.cardOut,T.cardOut+.3)); if(k<=0||out>=1)return '';
  const e=eo(k), x=L(L(667,366,eio(k)),640,out), y=L(L(1220,742,e)-Math.sin(k*Math.PI)*30+Math.sin((t-T.card0)*1.9)*5*e,1200,out), sc=L(.08,1,eb(k))*L(1,.1,out), rot=L(-12,-3,e);
  const sheen=P(t,T.card0+.45,T.card0+1.25);
  return `<div class="abs" style="left:${px(x-260)};top:${px(y-160)};width:520px;height:320px;transform:rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(4)});opacity:${(eo(P(k,0,.25))*(1-P(out,.55,1))).toFixed(3)};border-radius:30px;overflow:hidden;
     background:linear-gradient(135deg,#241C18 0%,#14100E 55%,#0C0A09 100%);border:2px solid rgba(255,145,66,.5);box-shadow:0 30px 70px rgba(0,0,0,.6),0 0 60px rgba(255,106,0,.14)">
    <div class="abs" style="left:0;top:0;bottom:0;width:14px;background:linear-gradient(180deg,#FF9142,#FF6A00)"></div>
    <div class="abs" style="left:-140px;top:-60px;width:110px;height:460px;transform:translateX(${(sheen*900).toFixed(1)}px) rotate(20deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent)"></div>
    <div class="abs" style="left:50px;top:44px;display:flex;align-items:center;gap:12px;font-weight:700;font-size:32px;letter-spacing:-.02em;color:#D8CEC4"><span style="width:16px;height:16px;border-radius:50%;background:#FF6A00;display:inline-block"></span>CreatorChahiye</div>
    <div class="abs" style="left:46px;top:104px;font-weight:800;font-size:106px;letter-spacing:-.045em;line-height:1;color:#FAF7F2">Exclusive</div>
    <div class="abs" style="left:50px;bottom:44px;width:120px;height:9px;border-radius:5px;background:#FF6A00"></div>
    <div class="abs" style="right:44px;bottom:36px;width:64px;height:46px;border-radius:10px;border:2px solid rgba(255,145,66,.55);background:linear-gradient(135deg,rgba(255,145,66,.28),rgba(255,145,66,.06))"></div></div>`}
function paper(t){
  const B=T.b, u=eo(P(t,B[1]+.28,B[1]+1.05))*(1-ei(P(t,B[2]-.12,B[2]+.16))); if(u<=0)return '';
  const top=crPt(322,512)[1]+16, cx=crPt(318,500)[0], V=FLOOR-top, F=640, len=u*(V+F), l1=Math.min(len,V), l2=Math.max(0,len-V), vx=-.86, vy=.5, hw=50;
  let s=`<rect x="${cx-hw}" y="${top}" width="${hw*2}" height="${l1}" fill="url(#gpap)"/>`;
  for(let d=16;d<l1-6;d+=21){const w=[70,58,74,44,66,72,38][Math.round(d/21)%7];s+=`<rect x="${cx-hw+13}" y="${top+d}" width="${w}" height="6" rx="3" fill="#B9AEA2"/>`}
  let ex_=cx, ey=top+l1;
  if(l2>0){ex_=cx+vx*l2;ey=FLOOR+vy*l2;
    s+=`<path d="M${cx-hw} ${FLOOR} L${cx+hw} ${FLOOR} L${ex_+hw} ${ey} L${ex_-hw} ${ey}Z" fill="#E6DCCF"/><path d="M${cx-hw} ${FLOOR} H${cx+hw}" stroke="#A89C8F" stroke-width="3"/>`;
    for(let d=18;d<l2-8;d+=23){const w=[70,58,74,44,66,72,38][Math.round(d/23)%7];s+=`<path d="M${cx-hw+13+vx*d} ${FLOOR+vy*d} h${w}" stroke="#B0A498" stroke-width="5.5" stroke-linecap="round"/>`}}
  const rr=17, ra=len*.9;
  s+=`<g transform="translate(${ex_} ${ey})"><rect x="${-hw-3}" y="${-rr}" width="${hw*2+6}" height="${rr*2}" rx="${rr}" fill="#F4EDE3"/><rect x="${-hw-3}" y="${-rr}" width="${hw*2+6}" height="${rr*2}" rx="${rr}" fill="none" stroke="#B9AEA2" stroke-width="2.5"/>
     <g transform="translate(${hw-12} 0) rotate(${ra})"><circle r="9" fill="none" stroke="#A89C8F" stroke-width="3"/><path d="M0 0 L8 0" stroke="#A89C8F" stroke-width="3"/></g></g>`;
  return `<svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><linearGradient id="gpap" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#EDE4D8"/><stop offset=".5" stop-color="#FBF8F3"/><stop offset="1" stop-color="#E4DACD"/></linearGradient></defs>${s}</svg>`}
function tub(t,m){
  if(t<T.tub-.5||t>T.door+.9)return '';
  const k=P(t,T.tub-.42,T.tub), y=L(700,1514,ei(k)), d=t-T.tub, sq=d>0?.2*Math.exp(-d*9)*Math.cos(d*22):0, out=ei(P(t,T.door+.25,T.door+.85));
  return `<div class="abs" style="left:${px(446-90-out*120)};top:${px(y-230)};width:180px;height:230px;opacity:${(P(t,T.tub-.42,T.tub-.3)*(1-out)).toFixed(3)};transform-origin:50% 100%;transform:scale(${(1+sq*.5).toFixed(4)},${(1-sq).toFixed(4)}) rotate(${(d>0?-3*Math.exp(-d*6)*Math.cos(d*18):-5).toFixed(2)}deg);filter:brightness(${(m.cb+.05).toFixed(3)})">
   <svg width="180" height="230" viewBox="-90 -230 180 230" style="overflow:visible"><ellipse cx="0" cy="0" rx="86" ry="10" fill="#000" opacity=".5"/>
    <rect x="-70" y="-196" width="140" height="196" rx="16" fill="#1B1614"/><rect x="-78" y="-226" width="156" height="42" rx="12" fill="#2E2723"/><path d="M-78 -196 H78" stroke="#14110F" stroke-width="4"/>
    <rect x="-70" y="-160" width="140" height="112" fill="#FAF7F2"/><rect x="-70" y="-160" width="140" height="10" fill="#FF6A00"/>
    <g fill="#17100D"><rect x="-30" y="-128" width="60" height="9" rx="4"/><rect x="-44" y="-140" width="13" height="33" rx="4"/><rect x="31" y="-140" width="13" height="33" rx="4"/><rect x="-55" y="-134" width="9" height="21" rx="3"/><rect x="46" y="-134" width="9" height="21" rx="3"/></g>
    <text x="0" y="-66" text-anchor="middle" font-family="Outfit" font-weight="900" font-size="25" letter-spacing="-.5" fill="#17100D">MASS XXL</text>
    <path d="M56 -190 V-10" stroke="#FF9142" stroke-width="4" opacity=".3"/></svg></div>`}
function goldParticles(t,t0,n,cx,cy,sx,sy,seed){
  let s='';
  for(let j=0;j<n;j++){
    const r=k=>rnd(seed+j*7.13+k), st=t0+r(1)*1.0, life=1.5+r(2)*1.1, p=(t-st)/life; if(p<=0||p>=1)continue;
    const x=cx+(r(3)-.5)*sx+Math.sin(p*4.4+r(4)*6)*20, y=cy+(r(5)-.5)*sy-(150+r(6)*330)*Math.pow(p,.85), sz=5+r(7)*r(7)*15, o=Math.pow(Math.sin(p*Math.PI),.8)*(.5+.45*r(8));
    s+=`<div class="abs" style="left:${px(x-sz)};top:${px(y-sz)};width:${(sz*2).toFixed(1)}px;height:${(sz*2).toFixed(1)}px;opacity:${o.toFixed(3)};background:radial-gradient(circle,#FFF6D6 0%,#F8CC62 26%,rgba(246,196,83,.34) 48%,rgba(246,196,83,0) 70%)"></div>`}
  return s}

/* ---------- signing close-up ---------- */
const SIG_D='M118 716 C110 640 190 610 196 668 C200 712 150 730 150 690 C152 650 210 690 236 700 C262 708 262 652 284 668 C300 680 290 712 316 700 C350 684 344 596 372 606 C398 616 340 722 384 704 C414 692 424 662 444 680 C460 696 462 712 486 694 C510 676 524 690 544 688 C580 684 606 654 626 632 C650 606 668 640 620 676 C540 736 300 752 96 748';
const SIG=(()=>{const ns='http://www.w3.org/2000/svg',sv=document.createElementNS(ns,'svg'),p=document.createElementNS(ns,'path');sv.setAttribute('style','position:absolute;width:0;height:0');p.setAttribute('d',SIG_D);sv.appendChild(p);document.body.appendChild(sv);
  const n=p.getTotalLength(),pts=[];for(let i=0;i<=600;i++){const q=p.getPointAtLength(n*i/600);pts.push([q.x,q.y])}sv.remove();return pts})();
const sigAt=k=>{const f=C(k)*600,i=Math.min(599,Math.floor(f)),a=SIG[i],b=SIG[i+1];return [L(a[0],b[0],f-i),L(a[1],b[1],f-i)]};
const sigK=t=>{const x=P(t,T.sig0,T.sig1);return .82*es(x)+.18*x};
function closeup(t){
  const a=Math.min(es(P(t,T.cu0,T.cu1)),1-es(P(t,T.cuOut0,T.cuOut1))); if(a<=0)return '';
  const push=1+.07*P(t,T.cu0,T.cuOut1), k=sigK(t), SX=22, SY=36, tip0=sigAt(k), d=t-T.stamp;
  const bump=d>0?5*Math.exp(-d*13)*Math.cos(d*38):0;
  // pen hand: arrive, sign, lift away
  const arr=1-eo(P(t,T.penIn-.15,T.sig0-.06)), lift=eio(P(t,T.sig1+.02,T.sig1+.6));
  const tx=tip0[0]+SX+arr*330+lift*640, ty=tip0[1]+SY+arr*470+lift*640-Math.sin(lift*Math.PI)*70, dx=.5,dy=.866,nx=.866,ny=-.5, at=(q,w=0)=>`${(tx+dx*q+nx*w).toFixed(1)} ${(ty+dy*q+ny*w).toFixed(1)}`;
  const hand=`<g><path d="M${at(250,-6)} L${at(900,-90)}" stroke="#000" stroke-width="200" stroke-linecap="round" opacity=".16" transform="translate(22 30)"/>
    <path d="M${at(262,-6)} L${at(900,-90)}" stroke="url(#gsl)" stroke-width="196" stroke-linecap="butt"/><path d="M${at(248,-6)} L${at(292,-10)}" stroke="#CDBBA6" stroke-width="204" stroke-linecap="round"/>
    <circle cx="${(tx+dx*150+nx*-8).toFixed(1)}" cy="${(ty+dy*150+ny*-8).toFixed(1)}" r="84" fill="url(#gsk)"/>
    <path d="M${at(30)} L${at(330)}" stroke="#15110F" stroke-width="32" stroke-linecap="round"/><path d="M${at(52)} L${at(72)}" stroke="#FF6A00" stroke-width="32"/>
    <path d="M${at(0)} L${at(36,10)} L${at(36,-10)}Z" fill="#CDBFAF"/><path d="M${at(0)} L${at(12,3.4)} L${at(12,-3.4)}Z" fill="#15110F"/>
    <path d="M${at(84,8)} L${at(300,8)}" stroke="#fff" stroke-width="5" opacity=".12" stroke-linecap="round"/>
    <circle cx="${(tx+dx*104+nx*20).toFixed(1)}" cy="${(ty+dy*104+ny*20).toFixed(1)}" r="33" fill="url(#gsk)"/><circle cx="${(tx+dx*128+nx*-30).toFixed(1)}" cy="${(ty+dy*128+ny*-30).toFixed(1)}" r="36" fill="url(#gsk)"/></g>`;
  const bars=[600,556,612,500,580,318].map((w,i)=>`<rect x="64" y="${330+i*52}" width="${w}" height="18" rx="9" fill="#DDD3C6"/>`).join('');
  // stamp
  const sk=P(t,T.stamp-.24,T.stamp), ssc=d<0?L(1.75,1,ei(sk)):1-.05*Math.sin(P(d,0,.2)*Math.PI), sop=d<0?es(P(sk,0,.8)):1;
  const stamp=sk>0?`<div class="abs" style="left:300px;top:404px;width:410px;height:138px;transform:rotate(-9deg) scale(${ssc.toFixed(4)});opacity:${sop.toFixed(3)};background:#FF6A00;border:10px solid #FAF7F2;border-radius:32px;
     box-shadow:0 ${(d<0?40*(1-sk)+10:8).toFixed(1)}px ${(d<0?50:18)}px rgba(0,0,0,.38),0 0 0 2.5px rgba(26,14,8,.55);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:94px;letter-spacing:.015em;color:#0A0908;line-height:1"><span style="margin-top:-6px">SIGNED</span></div>
     ${d>0&&d<.6?`<div class="abs" style="left:${505-240-d*260}px;top:${473-110-d*120}px;width:${480+d*520}px;height:${220+d*240}px;border-radius:50%;border:3px solid rgba(26,14,8,${(.2*(1-P(d,0,.6))).toFixed(3)});transform:rotate(-9deg)"></div>`:''}`:'';
  return `<div class="abs" style="inset:0;opacity:${a.toFixed(4)};background-color:#1A0D07;overflow:hidden">
   <div class="abs" style="inset:0;transform:scale(${push.toFixed(5)});transform-origin:54% 58%">
    <div class="abs" style="inset:-60px;background:radial-gradient(ellipse 78% 62% at 52% 50%,#5A2F16 0%,#3A1E0E 38%,#1C0E07 72%,#0C0604 100%)"></div>
    <div class="abs" style="inset:-60px;opacity:.5;background:repeating-linear-gradient(93deg,rgba(0,0,0,0) 0 46px,rgba(0,0,0,.16) 46px 49px,rgba(0,0,0,0) 49px 118px,rgba(255,170,110,.035) 118px 121px)"></div>
    <div class="abs" style="left:-430px;top:392px;width:560px;height:1120px;transform:rotate(-3.2deg);border-radius:30px;background:linear-gradient(90deg,#120E0C,#1D1714);box-shadow:0 30px 60px rgba(0,0,0,.5)"></div>
    <div class="abs" style="left:92px;top:412px;width:900px;height:1090px;transform:rotate(-2deg);border-radius:30px;background:linear-gradient(135deg,#1E1815,#120E0C);border:2px solid rgba(255,255,255,.05);box-shadow:0 40px 80px rgba(0,0,0,.6)">
      <div class="abs" style="right:0;top:0;bottom:0;width:16px;border-radius:0 30px 30px 0;background:linear-gradient(180deg,#FF9142,#FF6A00)"></div>
      <div class="abs" style="left:-6px;top:30px;bottom:30px;width:14px;border-radius:7px;background:#0B0908"></div></div>
    <div class="abs" style="left:170px;top:${(478+bump).toFixed(2)}px;width:740px;height:950px;transform:rotate(-1.2deg)">
      <div class="abs" style="inset:0;border-radius:14px;background:linear-gradient(172deg,#F8F3EB 0%,#EFE7DB 60%,#E4DACC 100%);box-shadow:0 14px 34px rgba(0,0,0,.45)"></div>
      <div class="abs" style="left:64px;top:66px;display:flex;align-items:center;gap:13px;font-weight:700;font-size:37px;letter-spacing:-.02em;color:#6B6058"><span style="width:19px;height:19px;border-radius:50%;background:#FF6A00;display:inline-block"></span>CreatorChahiye</div>
      <div class="abs" style="left:58px;top:118px;font-weight:800;font-size:124px;letter-spacing:-.045em;line-height:1;color:#1A0E08">Exclusive</div>
      <div class="abs" style="left:64px;top:262px;width:104px;height:10px;border-radius:5px;background:#FF6A00"></div>
      <svg class="abs" style="left:0;top:0;overflow:visible" width="740" height="950" viewBox="0 0 740 950">
        <defs><linearGradient id="gsk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#BC7B50"/><stop offset="1" stop-color="#8E5534"/></linearGradient>
         <linearGradient id="gsl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E4D6C5"/><stop offset=".5" stop-color="#F3EADF"/><stop offset="1" stop-color="#D8C8B6"/></linearGradient></defs>
        ${bars}
        <path d="M64 786 H676" stroke="#1A0E08" stroke-width="3" opacity=".75"/><path d="M66 742 l18 18 m0 -18 l-18 18" stroke="#1A0E08" stroke-width="4" stroke-linecap="round" opacity=".7"/>
        <text x="64" y="826" font-family="Outfit" font-weight="500" font-size="26" fill="#8A7F76" letter-spacing=".3">Creator signature</text>
        ${k>0?`<path d="${SIG_D}" transform="translate(${SX} ${SY})" pathLength="1" stroke="#1A0E08" stroke-width="9.5" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 2" stroke-dashoffset="${(1-k).toFixed(5)}"/>`:''}
      </svg>
      ${stamp}
      <svg class="abs" style="left:0;top:0;overflow:visible" width="740" height="950" viewBox="0 0 740 950">${hand}</svg>
    </div>
    <div class="abs" style="inset:-60px;background:radial-gradient(ellipse 70% 55% at 52% 48%,rgba(255,176,102,.10),rgba(255,176,102,0) 70%)"></div>
   </div>
   ${goldParticles(t,T.stamp+.04,46,560,1010,640,330,11)}
  </div>`}

/* ---------- world ---------- */
function world(t){
  const m=mood(t), c=cam(t), ms=monkState(t), fs=founderState(t), dimEnd=es(P(t,T.end0,T.end0+.8));
  const phones=[0,1,2,3,4].map(i=>({i,s:phoneState(i,t)}));
  const back=phones.filter(p=>p.s.z<0).map(p=>phoneEl(p.i,p.s)).join(''), front=phones.filter(p=>p.s.z>=0&&p.s.z<2).sort((a,b)=>a.s.z-b.s.z).map(p=>phoneEl(p.i,p.s)).join(''),
        tray=phones.filter(p=>p.s.z>=2).map(p=>phoneEl(p.i,p.s)).join('');
  let h=room(t,m)+calendar(t,m);
  const heroDim=es(P(t,T.tag1-.7,T.tag1-.05));
  if(heroDim>0)h+=`<div class="abs" style="left:-500px;top:-500px;width:2100px;height:1500px;opacity:${(heroDim*.94).toFixed(3)};background:linear-gradient(180deg,#070605 0%,#070605 64%,rgba(7,6,5,0) 94%)"></div>`;
  h+=`<div class="abs" style="left:-500px;top:-500px;width:2100px;height:2900px;background:#070605;opacity:${(dimEnd*.6).toFixed(3)}"></div>`;
  if(fs)h+=charAt(FD(fs.o),fs.x,CS,260,m,`opacity:${fs.op.toFixed(3)}`);
  if(ms){h+=charAt(drip(ms.o),ms.x,MS,250,m,`opacity:${ms.op.toFixed(3)}`);
    if(t>T.cu1)h+=trayEl(t)+tray;
    const tg=inout(t,T.nm0,T.nm1,.35,.3); if(tg>0)h+=`<div class="abs" style="left:${px(ms.x-34)};top:${px(950+(1-eo(P(t,T.nm0,T.nm0+.35)))*12)};opacity:${tg.toFixed(3)};transform:translateX(-50%)"><div class="pill" style="font-size:31px;padding:11px 26px 13px">CreatorChahiye</div></div>`}
  h+=back+creator(t,m)+front+table(m);
  // sigh puff
  const sg=P(t,T.b[0]+.95,T.b[0]+1.6); if(sg>0&&sg<1){const q=crPt(250,340);h+=`<div class="abs" style="left:${px(q[0]-20-sg*46)};top:${px(q[1]+sg*26)};width:${(26+sg*40).toFixed(1)}px;height:${(18+sg*26).toFixed(1)}px;border-radius:50%;background:#C9D2F2;opacity:${(.22*Math.sin(sg*Math.PI)).toFixed(3)};filter:blur(5px)"></div>`}
  // folder: monk's hand -> table -> opens
  if(t>=T.place0&&t<T.cu1+.05){
    const k=eio(P(t,T.place0+.04,T.place1)), a=mkPt(470,265,513);
    h+=k<1?folderEl(L(a[0],667,k),L(a[1],1236,k)-Math.sin(k*Math.PI)*52,L(85,126,k),L(110,14,k),L(-13,0,k)):folderEl(667,1236,126,14,0,eo(P(t,T.open0,T.open0+.34)));
    // pen
    const pk=P(t,T.pen0+.3,T.pen0+.38); const hp=crPt(...K(t,[[T.pen0,IDLE_L],[T.pen0+.38,SIGN_L]])[2]);
    if(t>T.open0+.2)h+=`<div class="abs" style="left:${px(pk>0?hp[0]-22:738)};top:${px(pk>0?hp[1]-26:1236)};width:30px;height:5px;border-radius:3px;background:#15110F;border-right:6px solid #FF6A00;transform:rotate(${pk>0?-58:0}deg);opacity:${eo(P(t,T.open0+.2,T.open0+.4)).toFixed(3)}"></div>`}
  h+=heroCard(t)+paper(t)+tub(t,m);
  // product box: in the founder's hand, then on the table
  if(fs){const hp_=[fs.x+(fs.o.ra[2][0]-260)*CS,FLOOR-(880-fs.o.ra[2][1]-fs.o.bob)*CS], rel=eio(P(t,T.hand1-.05,T.hand1+.18));
    const bx=L(hp_[0]+12,676,rel), by=L(hp_[1]-26,1203,rel), d=t-T.hand1-.18, sq=d>0?.1*Math.exp(-d*12)*Math.cos(d*26):0;
    h+=`<div class="abs" style="left:${px(bx-50)};top:${px(by-43)};opacity:${fs.op.toFixed(3)};transform-origin:50% 100%;transform:rotate(${L(-6,0,rel).toFixed(2)}deg) scale(${(1+sq*.5).toFixed(4)},${(1-sq).toFixed(4)});filter:brightness(${m.cb.toFixed(3)})">
     <svg width="106" height="86" viewBox="64 546 136 108" style="overflow:visible;display:block"><defs><linearGradient id="gbx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFA15A"/><stop offset="1" stop-color="#D64E00"/></linearGradient></defs>
      <rect x="66" y="548" width="120" height="104" rx="10" fill="url(#gbx)"/><path d="M66 572 L186 572" stroke="#B84300" stroke-width="4"/><rect x="92" y="592" width="68" height="34" rx="6" fill="#FAF7F2"/><path d="M104 604 L148 604 M104 614 L136 614" stroke="#C9B9A8" stroke-width="4" stroke-linecap="round"/><path d="M186 552 L198 546 L198 646 L186 652Z" fill="#9A3A00"/></svg></div>`;
    if(rel<.6)h+=`<div class="abs" style="left:${px(hp_[0]-17.6)};top:${px(hp_[1]-17.6)};width:35.2px;height:35.2px;border-radius:50%;background:linear-gradient(135deg,#DCA57E,#B07650);opacity:${fs.op.toFixed(3)};filter:brightness(${m.cb.toFixed(3)})"></div>`}
  // gold drifting up in the room right after the cut back
  h+=goldParticles(t,T.cuOut0-.1,26,740,1260,420,260,77);
  return `<div class="abs" style="left:0;top:0;width:1080px;height:1920px;transform-origin:0 0;transform:translate(540px,960px) scale(${c[2].toFixed(5)}) translate(${px(-c[0])},${px(-c[1])})">${h}</div>`}

/* ---------- on-screen text ---------- */
const TICK=`<span class="tick"><svg width="24" height="24" viewBox="0 0 24 24"><path d="M5 12.5 L10 17.5 L19 7.5" stroke="#0A2A18" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
function ui(t,f){
  let h='';
  // top scrim so headlines sit clean on the wall
  const scr=inout(t,-1,T.hookOut,.1,.5)*.5;
  if(scr>0)h+=`<div class="abs" style="left:0;top:0;width:1080px;height:1000px;opacity:${scr.toFixed(3)};background:linear-gradient(180deg,rgba(8,7,6,.86) 0%,rgba(8,7,6,.7) 34%,rgba(8,7,6,.34) 60%,rgba(8,7,6,0) 100%)"></div>`;
  // hook
  if(t<T.hookOut+.4){const out=ei(P(t,T.hookOut,T.hookOut+.3)), a=eo(P(t,-.12,.3)), b=P(t,T.h2,T.h2+.34);
    h+=`<div class="abs hl cream" style="left:0;width:1080px;text-align:center;top:${px(250+(1-a)*26-out*30)};font-size:122px;opacity:${(a*(1-out)).toFixed(3)}">Ek creator.</div>`;
    if(b>0)h+=`<div class="abs hl orange" style="left:0;width:1080px;text-align:center;top:${px(372-out*30)};font-size:122px;opacity:${(eo(P(b,0,.5))*(1-out)).toFixed(3)};transform:scale(${L(.86,1,eb(b)).toFixed(4)})">Paanch kaam.</div>`}
  // brand bubbles
  BUB.forEach((ln,i)=>{const t0=T.b[i], t1=i<3?T.b[i+1]:T.door+.05, k=P(t,t0,t0+.36), out=P(t,t1,t1+.3); if(k<=0||out>=1)return;
    h+=`<div class="abs" style="left:66px;bottom:${px(H-716+eo(out)*70)};opacity:${(eo(P(k,0,.5))*(1-out)).toFixed(3)};transform-origin:6% 100%;transform:translateY(${px((1-eo(k))*34)}) scale(${L(.88,1,eb(k)).toFixed(4)})"><div class="blabel">Brand</div><div class="bubble">${ln.join('<br>')}</div></div>`});
  // Signed.
  {const k=P(t,T.signed0,T.signed0+.5), out=ei(P(t,T.signed1,T.signed1+.3)); if(k>0&&out<1)
    h+=`<div class="abs hl cream" style="left:62px;top:${px(346-out*26)};font-size:170px;opacity:${(eo(P(k,0,.5))*(1-out)).toFixed(3)};transform-origin:0 80%;transform:translateY(${px((1-eo(k))*30)}) scale(${L(.92,1,eb(k)).toFixed(4)})">Signed<span class="orange" style="margin-left:.03em">.</span></div>`}
  // benefit cards
  BENEFITS.forEach((tx,i)=>{const t0=T.cards[i], k=P(t,t0,t0+.42), out=ei(P(t,T.cardsOut+i*.05,T.cardsOut+.3+i*.05)); if(k<=0||out>=1)return;
    const focus=i<3?1-.4*es(P(t,T.cards[i+1]-.05,T.cards[i+1]+.3))*(1-es(P(t,T.cards[3]+.7,T.cards[3]+1.05))):1;
    h+=`<div class="abs" style="left:${px(62-(1-ex(k))*420-out*80)};top:${520+i*98}px;opacity:${(eo(P(k,0,.4))*(1-out)).toFixed(3)};filter:brightness(${focus.toFixed(3)})"><div class="bcard">${TICK}<span>${tx}</span></div></div>`});
  // audience fit sticker
  {const k=P(t,T.fit,T.fit+.4), out=ei(P(t,T.fitOut,T.fitOut+.28)); if(k>0&&out<1){const tq=f/60, n=Math.round(L(58,94,eo(P(tq,T.fit+.08,T.fit+.7))));
    h+=`<div class="abs" style="left:608px;top:${px(736-out*30)};opacity:${(eo(P(k,0,.4))*(1-out)).toFixed(3)};transform:translate(-50%,-50%) rotate(${L(-14,-5,eb(k)).toFixed(2)}deg) scale(${L(.4,1,eb(k)).toFixed(4)})"><div class="sticker">Audience fit<span style="background:#0A0908;color:#FF9142;border-radius:16px;padding:0 14px 2px;font-variant-numeric:tabular-nums">${n}%</span></div></div>`}}
  // payment credited
  {const k=P(t,T.pay,T.pay+.45), out=ei(P(t,T.payOut,T.payOut+.3)); if(k>0&&out<1)
    h+=`<div class="abs" style="left:540px;top:${px(322-(1-eb(k))*70-out*40)};opacity:${(eo(P(k,0,.45))*(1-out)).toFixed(3)};transform:translateX(-50%)"><div class="pay"><span style="width:66px;height:66px;border-radius:18px;background:#1C5A3B;display:inline-flex;align-items:center;justify-content:center;font-size:42px;font-weight:700;color:#3DDC84">₹</span>Payment credited</div></div>`}
  // tagline -> end card
  if(t>=T.tag1){const a=P(t,T.tag1,T.tag1+.5), b=P(t,T.tag2,T.tag2+.5), e=eio(P(t,T.end0,T.end0+.75));
    h+=`<div class="abs" style="left:0;width:1080px;top:${px(L(304,340,e))};transform-origin:50% 0;transform:scale(${L(1,.7,e).toFixed(4)})">
      <div class="hl cream" style="text-align:center;font-size:124px;opacity:${eo(P(a,0,.6)).toFixed(3)};transform:translateY(${px((1-eo(a))*30)})">Right fit.</div>
      ${b>0?`<div class="hl orange" style="text-align:center;font-size:124px;margin-top:6px;opacity:${eo(P(b,0,.6)).toFixed(3)};transform:translateY(${px((1-eo(b))*30)}) scale(${L(.94,1,eb(b)).toFixed(4)})">Right audience.</div>`:''}</div>`;
    const fade=(t0,d=.5)=>eo(P(t,t0,t0+d)), rise=(t0,d=.5)=>px((1-eo(P(t,t0,t0+d)))*20);
    if(t>T.badge)h+=`<div class="abs" style="left:540px;top:${px(262)};opacity:${fade(T.badge).toFixed(3)};transform:translate(-50%,${rise(T.badge)})"><div class="pill" style="font-size:30px;padding:10px 26px 12px;background:rgba(255,106,0,.12);border-color:#FF6A00;display:flex;align-items:center;gap:11px"><span style="width:13px;height:13px;border-radius:50%;background:#FF6A00;display:inline-block"></span>CreatorChahiye Exclusive</div></div>`;
    if(t>T.cta)h+=`<div class="abs" style="left:540px;top:556px;opacity:${fade(T.cta).toFixed(3)};transform:translate(-50%,${rise(T.cta)})"><div class="cta">Exclusive signing ke liye apply karo</div></div>`;
    if(t>T.logo){const k=P(t,T.logo,T.logo+.8);h+=`<div class="abs" style="left:0;width:1080px;top:700px;text-align:center;opacity:${es(k).toFixed(3)};transform:scale(${L(.96,1,eo(k)).toFixed(4)});white-space:nowrap;line-height:1"><span style="font-weight:800;font-size:82px;letter-spacing:-.04em;color:#FAF7F2">Creator</span><span style="font-family:'Baloo 2';font-weight:800;font-size:88px;color:#FF6A00;position:relative;top:4px;margin-left:16px">चाहिए?</span></div>`}
    if(t>T.url)h+=`<div class="abs" style="left:0;width:1080px;top:816px;text-align:center;font-weight:400;font-size:35px;letter-spacing:.02em;color:#B9AFA6;opacity:${fade(T.url,.55).toFixed(3)}">creatorchahiye.com</div>`}
  return h}

/* ---------- film grain + vignette ---------- */
const GRAIN=(()=>{const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d'),d=x.createImageData(512,512);let s=20251;const r=()=>{s|=0;s=s+0x6D2B79F5|0;let q=Math.imul(s^s>>>15,1|s);q=q+Math.imul(q^q>>>7,61|q)^q;return((q^q>>>14)>>>0)/4294967296};
  for(let i=0;i<d.data.length;i+=4){const v=128+(r()+r()+r()-1.5)*120;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0);return c.toDataURL('image/png')})();
const gst=document.createElement('style');gst.textContent=`.grain{background-image:url(${GRAIN});background-size:256px 256px}`;document.head.appendChild(gst);
function fx(f){
  return `<div class="abs" style="inset:0;background:radial-gradient(ellipse 74% 62% at 50% 47%,rgba(0,0,0,0) 52%,rgba(0,0,0,.36) 78%,rgba(0,0,0,.8) 100%)"></div>
  <div class="abs grain" style="inset:0;opacity:.11;mix-blend-mode:overlay;background-position:${Math.floor(rnd(f)*256)}px ${Math.floor(rnd(f+.5)*256)}px"></div>`}

/* ---------- frame ---------- */
function render(t){
  t=C(t,0,T.END); HU=0; const f=Math.round(t*60);
  const cuFull=t>T.cu1&&t<T.cuOut0;
  stage.innerHTML=(cuFull?'':world(t))+closeup(t)+ui(t,f)+fx(f)}
window.render=render; window.DURATION=T.END; window.TL=T;

/* sound cue sheet (read by sound.py) */
window.cues=()=>{
  const steps=(t0,t1,rate)=>{const a=[];for(let n=1;;n++){const x=t0+n/(rate*2);if(x>t1-.12)break;a.push(+x.toFixed(3))}return a};
  return {T,BEAT,G0,END:T.END,monkSteps:steps(T.mIn0,T.mIn1,2.1),moonSteps:steps(T.moon0,T.moon1,2.2),founderSteps:steps(T.fIn0,T.fIn1,2.7),
    flips:[T.b[2]+.42,T.b[2]+.80,T.b[2]+1.10],lands:[0,1,2,3,4].map(i=>+(T.fly0+i*T.flyGap+T.flyDur).toFixed(3))}};
render(0);

/* ---------- thumbnail (1080x1920, key content inside the centre crop of the profile grid) ---------- */
function renderThumb(){
  HU=0; const m={...MOODS.night,cb:1,cs:1,beamO:.2,dim:.5}, t=2.3;
  const ph=[0,1,2,3,4].map(i=>{const s=phoneState(i,t);return phoneEl(i,{...s,x:PH[i].x,y:PH[i].y+(i===0?28:0),rot:[0,-5,5,-4,4][i],sh:2.2,glow:1,lab:1,badge:1,sc:1})}).join('');
  const w=room(t,m)+creator(t,m,{look:[0,-1],lid:0,brow:'worry',mouth:'o',ringGlow:1,squash:0,headDy:0,tilt:0,sway:0})+ph+table(m);
  stage.innerHTML=`<div class="abs" style="left:0;top:0;width:1080px;height:1920px;transform-origin:0 0;transform:translate(540px,960px) scale(1) translate(-800px,-985px)">${w}</div>
   <div class="abs" style="left:0;top:0;width:1080px;height:900px;background:linear-gradient(180deg,rgba(8,7,6,.8) 0%,rgba(8,7,6,.55) 45%,rgba(8,7,6,0) 100%)"></div>
   <div class="abs hl cream" style="left:0;width:1080px;text-align:center;top:238px;font-size:120px">Ek creator.</div>
   <div class="abs hl orange" style="left:0;width:1080px;text-align:center;top:354px;font-size:120px">Paanch kaam.</div>
   <div class="abs" style="left:0;width:1080px;top:1556px;text-align:center;white-space:nowrap;line-height:1"><span style="font-weight:800;font-size:60px;letter-spacing:-.04em;color:#FAF7F2">Creator</span><span style="font-family:'Baloo 2';font-weight:800;font-size:64px;color:#FF6A00;position:relative;top:3px;margin-left:12px">चाहिए?</span></div>
   ${fx(7)}`}
window.renderThumb=renderThumb;
