'use strict';
/* CreatorChahiye Ep. 6 "Raat ke 3 baje." : a plain ghost story that freezes into a CreatorChahiye hook.
   render(t) draws the frame for time t (seconds). Stateless, so renders are resumable. */
const W=1080,H=1920,BEAT=60/110,FLOOR=1500,CS=.8,GS=.82,MS=.6,TAU=Math.PI*2;
const stage=document.getElementById('stage');

/* ---------- helpers ---------- */
const es=x=>(1-Math.cos(Math.PI*C(x)))/2;
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const toHex=a=>'#'+a.map(v=>Math.round(C(v,0,255)).toString(16).padStart(2,'0')).join('');
function mixv(a,b,k){
  if(typeof a==='number')return L(a,b,k);
  if(typeof a==='string')return a[0]==='#'?toHex(hex(a).map((v,i)=>L(v,hex(b)[i],k))):(k<.5?a:b);
  if(Array.isArray(a))return a.map((x,i)=>mixv(x,b[i],k));
  const o={};for(const key in a)o[key]=mixv(a[key],b[key],k);return o}
function K(t,keys){
  if(t<=keys[0][0])return keys[0][1];
  for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const a=keys[i-1],b=keys[i];return mixv(a[1],b[1],(b[2]||eio)(P(t,a[0],b[0])))}
  return keys[keys.length-1][1]}
const S=(t,keys)=>{let v=keys[0][1];for(const k of keys)if(t>=k[0])v=k[1];return v};
const rnd=i=>{let x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const px=v=>v.toFixed(2)+'px', f3=v=>v.toFixed(3);

/* ---------- timeline ---------- */
const G0=18.0, g=n=>G0+n*BEAT;
const T={
  hook0:.15, hook1:3.45, walkA1:3.95, ch1:3.82, chT0:3.9, chT1:5.6, walkB0:5.0, walkB1:5.7, ch2:5.62, crickets:5.72,
  koi0:6.15, koi1:7.75, winOff:6.4, flick:7.7, sh0:7.95, sh1:9.25, off:9.32, turn:9.36, relief:9.8, kuch0:9.95, kuch1:11.4,
  diya:11.3, gIn0:11.45, gIn1:12.05, see:11.85, cu0:12.35, cu1:14.45, pair0:12.6, pair1:14.25,
  lift0:14.6, lift1:15.5, part0:15.05, part1:15.75, lunge0:15.95, freeze:16.33,
  pause:16.4, ruk0:16.6, ruk1:19.4, pull0:17.9, pull1:19.15, point:19.2,
  hk0:g(3), hk1:g(9.4), sc0:g(10), sc1:g(10.8), end0:g(16), ctaA:g(16.6), ctaB:g(17.1), logo:g(17.6), url:g(18.3),
  gag:g(20.5), take:g(21.6), moon0:g(22), moon1:g(24), END:32.6
};

/* ---------- lights ---------- */
const lamp=t=>{
  let v=1-.035*Math.max(0,Math.sin(t*23.7)*Math.sin(t*7.1));
  if(t>=T.flick&&t<T.flick+.5)v*=K(t,[[T.flick,1],[T.flick+.06,.45],[T.flick+.14,.5],[T.flick+.2,.8],[T.flick+.28,.4],[T.flick+.38,.75],[T.flick+.5,1]]);
  if(t>=T.off-.05&&t<T.off+.3)v*=K(t,[[T.off-.05,1],[T.off+.04,.08],[T.off+.16,.08],[T.off+.3,1]]);
  return v};
const shadowK=t=>t<T.turn?es(P(t,T.sh0,T.sh1)):0;

/* ---------- peepal leaves (seeded) ---------- */
const LEAVES=(()=>{const cl=[[620,600,120,26],[740,500,140,34],[880,470,150,36],[1020,540,140,30],[690,720,120,22],[860,690,150,30],[1010,710,120,24],[560,730,90,14],[1120,640,110,18]];
  const a=[];let s=1;cl.forEach(c=>{for(let j=0;j<c[3];j++){const r=Math.sqrt(rnd(s++))*c[2],th=rnd(s++)*TAU;
    a.push({x:c[0]+Math.cos(th)*r,y:c[1]+Math.sin(th)*r*.8,rot:-40+rnd(s++)*80,sc:.55+rnd(s++)*.45,sh:rnd(s++),ph:rnd(s++)*TAU,rim:rnd(s++)})}});
  return a.sort((p,q)=>p.sh-q.sh)})();
const LEAF='M0 0 C16 4 27 22 19 40 C13 52 4 58 0 78 C-4 58 -13 52 -19 40 C-27 22 -16 4 0 0Z';

/* ---------- the night lane ---------- */
function nightBack(t,lp){
  const win=1-P(t,T.winOff,T.winOff+.08), wind=Math.sin(t*.9)*.6+Math.sin(t*2.3)*.4;
  const leaves=LEAVES.map(l=>{const sw=Math.sin(t*1.25+l.ph)*(4+3*wind)+Math.sin(t*3.1+l.ph*2)*1.2;
    const c=toHex(hex('#0B1512').map((v,i)=>v+l.sh*[14,22,16][i]));
    return `<path d="${LEAF}" transform="translate(${(l.x+sw*.6).toFixed(1)} ${l.y.toFixed(1)}) rotate(${(l.rot+sw).toFixed(1)}) scale(${l.sc.toFixed(3)})" fill="${c}"${l.rim>.8?' stroke="#41574E" stroke-width="2" stroke-opacity=".55"':''}/>`}).join('');
  const roots=[[680,700,980],[742,640,1010],[905,700,1060],[1060,720,1000]].map(([x,y0,y1],i)=>{const s=Math.sin(t*1.1+i*1.7)*10;return `<path d="M${x} ${y0} Q${x+s} ${(y0+y1)/2} ${x+s*1.6} ${y1}" stroke="#0E1418" stroke-width="5" fill="none" stroke-linecap="round"/>`}).join('');
  const dk=P(t,T.diya,T.diya+.16), fl=1-dk, ff=1+.12*Math.sin(t*31)+.08*Math.sin(t*17);
  const smoke=t>T.diya&&t<T.diya+2.2?(()=>{const q=P(t,T.diya,T.diya+2.2);return `<path d="M900 ${1456-q*10} C${890+Math.sin(q*9)*10} ${1420-q*60} ${912} ${1380-q*90} ${896+Math.sin(q*7)*14} ${1330-q*130}" stroke="#AAB4BA" stroke-width="${4+q*6}" fill="none" opacity="${f3(.4*Math.sin(q*Math.PI))}" stroke-linecap="round"/>`})():'';
  return `<svg class="abs" style="left:-500px;top:-500px" width="2100" height="2900" viewBox="-500 -500 2100 2900">
  <defs>
   <linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020307"/><stop offset=".55" stop-color="#060A12"/><stop offset="1" stop-color="#16202F"/></linearGradient>
   <radialGradient id="nmoon"><stop offset="0" stop-color="#C9D6E0" stop-opacity=".32"/><stop offset=".35" stop-color="#9FB0C0" stop-opacity=".12"/><stop offset="1" stop-color="#9FB0C0" stop-opacity="0"/></radialGradient>
   <linearGradient id="nwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1A2230"/><stop offset="1" stop-color="#10151E"/></linearGradient>
   <radialGradient id="nwlit" cx="420" cy="1200" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#A9BEB1" stop-opacity=".5"/><stop offset=".6" stop-color="#7F988C" stop-opacity=".14"/><stop offset="1" stop-color="#7F988C" stop-opacity="0"/></radialGradient>
   <linearGradient id="ntrunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1C242C"/><stop offset=".3" stop-color="#11161B"/><stop offset="1" stop-color="#07090C"/></linearGradient>
   <radialGradient id="ndiya"><stop offset="0" stop-color="#FFC266" stop-opacity=".55"/><stop offset="1" stop-color="#FF8A2A" stop-opacity="0"/></radialGradient>
   <filter id="nb6" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>
   <clipPath id="nwallc"><rect x="-500" y="1030" width="2100" height="410"/></clipPath>
  </defs>
  <rect x="-500" y="-500" width="2100" height="2000" fill="url(#nsky)"/>
  ${[...Array(26)].map((_,i)=>`<circle cx="${(-400+rnd(i+50)*1900).toFixed(0)}" cy="${(-300+rnd(i+90)*1050).toFixed(0)}" r="${(1+rnd(i+130)*1.6).toFixed(1)}" fill="#C9D4E2" opacity="${f3(.25+.35*rnd(i+170)*(.7+.3*Math.sin(t*1.7+i)))}"/>`).join('')}
  <circle cx="400" cy="600" r="150" fill="url(#nmoon)"/><circle cx="400" cy="600" r="44" fill="#D6DFE6"/><circle cx="388" cy="590" r="10" fill="#BAC6CF" opacity=".55"/><circle cx="414" cy="614" r="6" fill="#BAC6CF" opacity=".5"/>
  <path d="M122 738 Q700 870 1600 700" stroke="#05070B" stroke-width="3" fill="none"/><path d="M122 752 Q700 890 1600 722" stroke="#05070B" stroke-width="2.5" fill="none"/><path d="M-500 690 Q-200 790 122 740" stroke="#05070B" stroke-width="3" fill="none"/>
  <!-- rooftops -->
  <path d="M-500 1030 L-500 860 L310 860 L310 900 L640 900 L640 840 L1600 840 L1600 1030Z" fill="#070A10"/>
  <rect x="28" y="796" width="104" height="58" rx="6" fill="#070A10"/><path d="M40 854 L44 862 M120 854 L116 862" stroke="#070A10" stroke-width="6"/>
  <rect x="300" y="886" width="350" height="16" fill="#0A0E16"/>
  <rect x="470" y="930" width="42" height="56" fill="#E8C77A" opacity="${f3(.55*win)}"/><rect x="470" y="930" width="42" height="56" fill="none" stroke="#070A10" stroke-width="5"/><path d="M491 930 V986" stroke="#070A10" stroke-width="4"/>
  <circle cx="491" cy="958" r="60" fill="#E8C77A" opacity="${f3(.08*win)}" filter="url(#nb6)"/>
  <!-- wall -->
  <rect x="-500" y="1030" width="2100" height="410" fill="url(#nwall)"/>
  <rect x="-500" y="1016" width="2100" height="22" fill="#1C2330"/><rect x="-500" y="1016" width="2100" height="3" fill="#3A4556" opacity=".6"/>
  <g opacity=".5"><path d="M60 1120 h120 v70 h-90 z" fill="#1A2130"/><path d="M640 1210 h150 v60 h-120z" fill="#1A2130"/><path d="M-80 1300 h110 v80 h-110z" fill="#10151E"/>
   <path d="M520 1046 l-14 60 l18 40 l-10 60" stroke="#080B11" stroke-width="3" fill="none"/><path d="M180 1260 l30 40 l-6 50" stroke="#080B11" stroke-width="3" fill="none"/>
   <rect x="300" y="1040" width="26" height="380" fill="#090C12" opacity=".5"/><rect x="760" y="1040" width="18" height="300" fill="#090C12" opacity=".4"/></g>
  <rect x="-500" y="1030" width="2100" height="410" fill="url(#nwlit)" opacity="${f3(lp)}"/>
  <g clip-path="url(#nwallc)" filter="url(#nb6)">${wallShadows(t,lp)}</g>
  <!-- road -->
  <rect x="-500" y="1440" width="2100" height="960" fill="#080B10"/><rect x="-500" y="1436" width="2100" height="16" fill="#161C26"/>
  <ellipse cx="250" cy="1510" rx="360" ry="70" fill="#9FB7A8" opacity="${f3(.2*lp)}" filter="url(#nb6)"/>
  <!-- lamp post -->
  <g transform="translate(-110 0)">
  <path d="M232 1500 V742" stroke="#151A21" stroke-width="18"/><path d="M232 760 Q236 722 300 724 L326 726" stroke="#151A21" stroke-width="10" fill="none"/>
  <path d="M304 724 L352 724 L344 748 L312 748Z" fill="#1E242C"/><ellipse cx="328" cy="752" rx="20" ry="7" fill="#E9F3E1" opacity="${f3(.2+.8*lp)}"/>
  <circle cx="328" cy="760" r="70" fill="#D9EBD6" opacity="${f3(.22*lp)}" filter="url(#nb6)"/></g>
  <!-- peepal -->
  ${roots}
  <path d="M790 878 Q720 760 650 640 M790 878 Q770 700 750 560 M1010 850 Q950 700 900 600 M1010 850 Q1060 740 1090 640 M880 1060 Q870 960 880 820" stroke="#0E1419" stroke-width="24" fill="none" stroke-linecap="round"/>
  <path d="M840 1470 C862 1360 858 1240 836 1130 C818 1040 800 960 770 870 L812 860 C850 940 880 1010 900 1060 C920 990 960 900 1006 838 L1044 858 C1000 940 968 1030 958 1130 C950 1240 972 1380 1010 1470Z" fill="url(#ntrunk)"/>
  <path d="M796 1474 Q838 1446 856 1404 L986 1404 Q1006 1446 1064 1474Z" fill="#11171C"/>
  <path d="M868 1440 C880 1340 876 1230 858 1130 M928 1440 C922 1340 930 1220 948 1120" stroke="#2A343D" stroke-width="3" fill="none" opacity=".6"/>
  ${[1236,1250,1264].map((y,i)=>`<path d="M846 ${y} Q902 ${y+16} 962 ${y-2}" stroke="#6E2A22" stroke-width="${i==1?5:3.5}" fill="none" opacity=".85"/>`).join('')}
  <path d="M916 1252 l10 34 M922 1254 l2 40" stroke="#6E2A22" stroke-width="3" opacity=".7"/>
  ${leaves}
  <!-- diya -->
  <path d="M880 1462 Q900 1480 920 1462 Z" fill="#5A3420"/><path d="M880 1462 H920" stroke="#7A4A2C" stroke-width="3"/>
  ${fl>0?`<circle cx="900" cy="1446" r="${(60*ff*fl).toFixed(1)}" fill="url(#ndiya)"/><path d="M900 ${1460-22*ff*fl} C${906} ${1452} ${905} ${1461} 900 1461 C895 1461 894 1452 900 ${1460-22*ff*fl}Z" fill="#FFD27A"/>`:''}${smoke}
  </svg>`}

function wallShadows(t,lp){
  const mx=manX(t), sx=mx+84, k=shadowK(t);
  let s=`<g opacity="${f3(.62*lp)}" fill="#020305"><ellipse cx="${sx}" cy="1012" rx="120" ry="26"/><path d="M${sx-62} 1010 Q${sx} 950 ${sx+62} 1010Z"/><ellipse cx="${sx}" cy="1080" rx="70" ry="82"/><path d="M${sx-118} 1170 Q${sx} 1130 ${sx+118} 1170 L${sx+120} 1440 L${sx-120} 1440Z"/></g>`;
  if(k>0){const gx=sx+206, dy=(1-k)*560, ar=es(P(t,T.sh0+.6,T.sh1+.05));
    s+=`<g opacity="${f3(.92*lp)}" fill="#010203" transform="translate(0 ${dy.toFixed(1)})">
      <path d="M${gx-74} 1000 C${gx-84} 920 ${gx-40} 880 ${gx} 880 C${gx+44} 880 ${gx+86} 920 ${gx+76} 1000 C${gx+92} 1110 ${gx+104} 1230 ${gx+120} 1330 L${gx-130} 1330 C${gx-110} 1230 ${gx-92} 1110 ${gx-74} 1000Z"/>
      <path d="M${gx-110} 1240 L${gx+110} 1240 L${gx+150} 1440 L${gx-150} 1440Z"/>
      <path d="M${gx-60} 1110 Q${gx-100-20*ar} ${1060-40*ar} ${gx-118-30*ar} ${1040-60*ar}" stroke="#010203" stroke-width="22" fill="none" stroke-linecap="round"/>
      ${[-26,-10,6,22].map(a=>{const bx=gx-118-30*ar, by=1040-60*ar, an=(200+a)*Math.PI/180;return `<path d="M${bx} ${by} l${(Math.cos(an)*58).toFixed(1)} ${(Math.sin(an)*58).toFixed(1)}" stroke="#010203" stroke-width="7" stroke-linecap="round"/>`}).join('')}</g>`}
  return s}

/* ---------- the walker ---------- */
const manX=t=>t<T.walkB0?K(t,[[0,40],[T.walkA1,300,eo]]):K(t,[[T.walkB0,300],[T.walkB1,330,eo]]);
const walkAmp=t=>t<T.walkB0?K(t,[[0,.8],[T.walkA1-.35,.8],[T.walkA1,0]]):K(t,[[T.walkB0,0],[T.walkB0+.12,.75],[T.walkB1-.1,.75],[T.walkB1,0,eo]]);
const walkPh=t=>t<T.walkB0?TAU*1.5*t:TAU*1.5*(t-T.walkB0);
const TORCH_R=[[372,404],[430,486],[366,470]], IDLE_L=[[150,404],[128,520],[146,620]], FEAR_L=[[150,404],[118,500],[168,560]];
function manState(t){
  const amp=walkAmp(t), ph=walkPh(t), shiver=t>T.see&&t<T.freeze?1:0;
  return {ring:0,arms:'custom',rprop:'phone',phoneGlow:1.3,walk:{phase:ph,amp},
    ra:TORCH_R, la:K(t,[[0,IDLE_L],[T.see,IDLE_L],[T.see+.3,FEAR_L,eo]]), lhand:true,
    bob:-Math.abs(Math.sin(ph))*6*amp+Math.sin(t*46)*1.6*shiver,
    look:K(t,[[0,[8,2]],[T.ch1,[8,2]],[T.ch1+.12,[-10,-3],eo],[4.6,[-10,-3]],[4.75,[10,-2],eo],[T.walkB0,[8,2]],[T.ch2,[8,2]],[T.ch2+.1,[-11,0],eo],
      [6.6,[-11,0]],[7.0,[11,-1]],[7.4,[-6,2]],[T.flick,[-6,2]],[T.sh0+.3,[11,0],es],[T.turn-.02,[11,0]],[T.turn+.05,[11,-2],eo],[T.relief,[2,3]],
      [10.5,[-6,3]],[10.8,[5,3]],[11.1,[0,2]],[T.see-.25,[0,2]],[T.see,[10,-3],eo],[T.freeze,[10,-4]]]),
    lid:Math.min(1,K(t,[[0,.22],[T.ch1,.22],[T.ch1+.1,0,eo],[T.walkB0,.1],[T.ch2,.1],[T.ch2+.08,0],[T.relief,0],[T.relief+.18,.85],[T.relief+.55,.85],[T.relief+.75,.2],[T.see-.1,.2],[T.see,0]])
      +blink(t,[1.6,3.1,6.9,10.95])),
    brow:S(t,[[0,''],[T.ch1+.05,'up'],[T.walkB0,''],[T.ch2+.05,'worry'],[T.relief+.2,''],[T.see,'up']]),
    mouth:S(t,[[0,'flat'],[T.ch2+.1,'o'],[6.9,'flat'],[T.sh0+.6,'frown'],[T.turn+.05,'o'],[T.relief+.15,'smirk'],[T.see,'o']]),
    squash:K(t,[[0,0],[T.relief,0],[T.relief+.2,.6],[T.relief+.7,.6],[T.relief+1.0,0],[T.see,0],[T.see+.15,.35,eo]]),
    headDy:K(t,[[T.relief,0],[T.relief+.2,8],[T.relief+.7,8],[T.relief+1,0],[T.see,0],[T.see+.15,-6,eo]]),
    tilt:K(t,[[0,0],[T.sh0,0],[T.sh1,2],[T.turn,2],[T.turn+.08,7,eo],[T.relief,3],[10.35,0],[10.5,-4],[10.65,4],[10.8,-3],[10.95,0],[T.see,0],[T.see+.15,-5,eo]])
      +Math.sin(t*41)*.8*shiver,
    sway:Math.sin(t*1.7)*1.4}}
function manEl(t,lp){
  const x=manX(t), o=manState(t), b=.42+.5*lp;
  // torch beam from the phone
  const hx=x+(o.ra[2][0]-260)*CS, hy=FLOOR-(880-o.ra[2][1]-(o.bob||0))*CS-46;
  const beam=`<svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="1920"><defs><linearGradient id="nbeam" gradientUnits="userSpaceOnUse" x1="${hx}" y1="${hy}" x2="${hx+380}" y2="1500"><stop offset="0" stop-color="#E9F1E6" stop-opacity=".34"/><stop offset="1" stop-color="#E9F1E6" stop-opacity="0"/></linearGradient></defs>
    <path d="M${hx-6} ${hy} L${hx+8} ${hy-6} L${hx+520} 1470 L${hx+150} 1560Z" fill="url(#nbeam)"/><ellipse cx="${hx+330}" cy="1512" rx="190" ry="34" fill="#E9F1E6" opacity=".09"/></svg>`;
  return `<div class="abs" style="left:${px(x-260*CS)};top:${px(FLOOR-880*CS)};width:${520*CS}px;filter:brightness(${f3(b)}) saturate(.5) contrast(1.04)">${CR(o)}</div>`+beam}

/* ---------- the ghost ---------- */
let GU=0;
function ghost(o){
  const i='gh'+(GU++), t=o.t||0, part=o.part||0, lift=o.lift==null?1:o.lift, eyes=o.eyes||0, edx=o.edx||0, reach=o.reach||0;
  const N=18; let jag=[];for(let j=0;j<=N;j++){const x=112+(296)*j/N; jag.push([x,846+(j%2?-16:9)+Math.sin(t*2.7+j*1.9)*5])}
  const hem=jag.map(p=>`L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' '), bord=jag.map((p,j)=>`${j?'L':'M'}${p[0].toFixed(1)} ${(p[1]-20).toFixed(1)}`).join(' ');
  const SH=[[186,410],[334,410]], EL=[LJ([[168,520]],[[180,356]],reach)[0],LJ([[352,520]],[[340,356]],reach)[0]], HA=[LJ([[160,626]],[[200,248]],reach)[0],LJ([[360,626]],[[320,248]],reach)[0]];
  const arm=(k)=>{const s=SH[k],e=EL[k],h=HA[k],d=Math.atan2(h[1]-e[1],h[0]-e[0]);
    return `<path d="M${s[0]} ${s[1]} Q${e[0]} ${e[1]} ${h[0]} ${h[1]}" stroke="url(#${i}sk)" stroke-width="28" fill="none" stroke-linecap="round"/>`+
      [-.42,-.14,.14,.42].map((a,j)=>{const an=d+a*(1+.5*reach),ln=[44,52,50,40][j];return `<path d="M${h[0]} ${h[1]} q${(Math.cos(an-.2)*ln*.55).toFixed(1)} ${(Math.sin(an-.2)*ln*.55).toFixed(1)} ${(Math.cos(an)*ln).toFixed(1)} ${(Math.sin(an)*ln).toFixed(1)}" stroke="#97A3AA" stroke-width="8" fill="none" stroke-linecap="round"/>`}).join('')+
      `<circle cx="${h[0]}" cy="${h[1]}" r="17" fill="#A9B4BA"/>`};
  const wv=k=>Math.sin(t*1.6+k)*7, rag=(x0,x1,y,n,s)=>{let p='';for(let j=0;j<=n;j++){const x=x0+(x1-x0)*j/n;p+=` L${x.toFixed(1)} ${(y+(j%2?-26:14)+wv(j*s)).toFixed(1)}`}return p};
  const curtL=`M258 96 C204 98 176 150 174 240 C172 330 184 430 176 530${rag(176,262,540,4,1.3)} C262 400 262 250 258 96Z`;
  const strands=(m)=>[196,218,240].map((x,j)=>`<path d="M${m?520-x:x} 130 C${m?520-x+6:x-6} 260 ${m?520-x-4:x+4} 420 ${m?520-x+wv(j)*.5:x+wv(j)*.5} 520" stroke="#262C36" stroke-width="3" fill="none" opacity=".8"/>`).join('');
  const lx=-62*part, rot=11*part;
  return `<svg viewBox="0 0 520 900" width="100%" style="overflow:visible"><defs>
   <linearGradient id="${i}sr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E4E9EA"/><stop offset=".6" stop-color="#C4CDD0"/><stop offset="1" stop-color="#8F9BA2"/></linearGradient>
   <linearGradient id="${i}sk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#BAC5CA"/><stop offset="1" stop-color="#8A969D"/></linearGradient>
   <linearGradient id="${i}hr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1A1F27"/><stop offset="1" stop-color="#050609"/></linearGradient>
   <radialGradient id="${i}fc" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#030405"/><stop offset=".75" stop-color="#0B0E12"/><stop offset="1" stop-color="#3A434B"/></radialGradient>
   <filter id="${i}gl" x="-80%" y="-200%" width="260%" height="500%"><feGaussianBlur stdDeviation="9"/></filter><filter id="${i}bl"><feGaussianBlur stdDeviation="12"/></filter></defs>
   <ellipse cx="262" cy="886" rx="130" ry="14" fill="#000" opacity=".45" filter="url(#${i}bl)"/>
   <g transform="translate(0 ${(o.bob||0).toFixed(2)})">
    <path d="M128 260 C124 400 116 520 102 650${rag(102,418,660,8,.9)} C404 520 396 400 392 260Z" fill="url(#${i}hr)"/>
    <path d="M152 520 C140 640 120 760 112 846 ${hem} C400 760 382 640 370 520Z" fill="url(#${i}sr)"/>
    <path d="${bord}" stroke="#6B3A34" stroke-width="9" fill="none" opacity=".75"/>
    <path d="M200 560 C196 680 186 780 182 836 M262 560 V840 M322 560 C330 680 336 780 340 836" stroke="#7F8B92" stroke-width="5" fill="none" opacity=".35"/>
    <path d="M186 386 Q260 364 334 386 Q362 404 366 470 L372 548 L148 548 L156 470 Q160 404 186 386Z" fill="url(#${i}sr)"/>
    <path d="M190 392 L250 384 L376 556 L320 560Z" fill="#D5DCDE"/><path d="M320 560 L376 556" stroke="#6B3A34" stroke-width="8" opacity=".75"/><path d="M250 384 L376 556" stroke="#6B3A34" stroke-width="6" opacity=".6"/>
    ${reach<.5?arm(0)+arm(1):''}
    <g transform="rotate(${(9*(1-lift)).toFixed(2)} 260 340) translate(0 ${(30*(1-lift)).toFixed(2)})">
     <path d="M260 90 C170 92 122 160 120 262 C118 300 120 330 124 360 L396 360 C400 330 402 300 400 262 C398 160 350 92 260 90Z" fill="url(#${i}hr)"/>
     <path d="M260 90 C170 92 122 160 120 262" stroke="#55626F" stroke-width="4" fill="none" opacity=".55"/>
     <ellipse cx="260" cy="224" rx="84" ry="104" fill="url(#${i}fc)"/>
     ${eyes>0?`<g opacity="${f3(eyes)}"><ellipse cx="${226+edx}" cy="214" rx="30" ry="16" fill="#CFE9E2" opacity=".75" filter="url(#${i}gl)"/><ellipse cx="${294+edx}" cy="214" rx="30" ry="16" fill="#CFE9E2" opacity=".75" filter="url(#${i}gl)"/>
       <path d="M${208+edx} 216 Q${226+edx} 200 ${244+edx} 214 Q${226+edx} 225 ${208+edx} 216Z" fill="#F2FBF8"/><path d="M${276+edx} 214 Q${294+edx} 200 ${312+edx} 216 Q${294+edx} 225 ${276+edx} 214Z" fill="#F2FBF8"/></g>`:''}
     <g transform="translate(${lx.toFixed(2)} 0) rotate(${(-rot).toFixed(2)} 258 96)"><path d="${curtL}" fill="url(#${i}hr)"/><path d="M258 96 C204 98 176 150 174 240 C172 330 184 430 176 530" stroke="#55626F" stroke-width="3" fill="none" opacity=".5"/>${strands(0)}</g>
     <g transform="translate(${(-lx).toFixed(2)} 0) rotate(${rot.toFixed(2)} 262 96) translate(520 0) scale(-1 1)"><path d="${curtL}" fill="url(#${i}hr)"/><path d="M258 96 C204 98 176 150 174 240 C172 330 184 430 176 530" stroke="#55626F" stroke-width="3" fill="none" opacity=".5"/>${strands(0)}</g>
     <path d="M196 124 Q258 92 322 124" stroke="#3E4856" stroke-width="5" fill="none" opacity=".55" stroke-linecap="round"/>
    </g>
    ${reach>=.5?arm(0)+arm(1):''}
   </g></svg>`}
function ghostState(t,ov){
  const k=ei(P(t,T.lunge0,T.freeze));
  const o={t,part:es(P(t,T.part0,T.part1)),lift:es(P(t,T.lift0,T.lift1)),eyes:eo(P(t,T.part0+.35,T.part1+.1)),reach:eo(P(t,T.lunge0,T.freeze-.05)),bob:Math.sin(t*1.5)*5};
  if(ov)Object.assign(o,ov);
  return {o,op:eo(P(t,T.gIn0,T.gIn1)),k}}
function ghostEl(t,ov){
  if(t<T.gIn0)return '';
  const s=ghostState(t,ov), x=790, sc=L(1,1.5,s.k), hy=222*GS;
  return `<div class="abs" style="left:${px(x-260*GS)};top:${px(FLOOR-10-880*GS)};width:${520*GS}px;opacity:${f3(s.op)};transform-origin:${260*GS}px ${hy}px;transform:translateY(${px(-30*s.k)}) scale(${sc.toFixed(4)});filter:brightness(${f3(.82+.12*lamp(t))})">${ghost(s.o)}</div>`}

/* ---------- fog ---------- */
function fog(t,front){
  let s='';const n=front?3:4;
  for(let i=0;i<n;i++){const sp=front?28+i*9:14+i*6, w=front?1000:1200, x=((t*sp+rnd(i+(front?9:1))*1800)%2000)-600, y=front?1430+i*60:1300+i*48;
    s+=`<div class="abs" style="left:${px(x)};top:${px(y)};width:${w}px;height:${front?260:220}px;background:radial-gradient(ellipse at center,rgba(150,170,180,${front?.11:.14}) 0%,rgba(150,170,180,0) 68%)"></div>`}
  return s}

/* ---------- camera ---------- */
const cam=t=>K(t,[[0,[540,960,1.0]],[3.6,[500,990,1.07],es],[5.6,[410,1040,1.14],es],[T.flick,[430,1040,1.18]],[T.turn-.04,[480,1030,1.24],es],[T.turn+.06,[494,1026,1.21],eo],
  [11.15,[470,1020,1.12],es],[T.cu0,[620,1000,1.05],eio],[T.cu1-.01,[620,1000,1.05]],[T.cu1,[600,1050,1.32]],[T.lunge0,[650,1000,1.52],es],[T.freeze,[782,928,2.5],ei]]);

/* ---------- close-up: the feet ---------- */
function closeup(t){
  if(t<T.cu0||t>=T.cu1)return '';
  const q=P(t,T.cu0,T.cu1), push=1+.07*es(q), gx=-120*eio(P(t,T.cu0+.25,T.cu1-.15)), back=-150*eio(P(t,T.cu0+.35,T.cu0+1.5)), stepUp=Math.sin(P(t,T.cu0+.35,T.cu0+.9)*Math.PI)*28;
  const foot=(x0,y0,sh)=>`<g transform="translate(${x0} ${y0})" style="filter:brightness(${sh})"><path d="M0 0 C-20 -2 -26 -30 -16 -54 C-8 -80 2 -120 8 -158 L76 -162 C98 -120 142 -92 198 -70 C232 -58 262 -50 284 -36 C300 -26 300 -6 284 -2 Z" fill="url(#cusk)"/>
     ${[[284,-20,17],[262,-12,12],[245,-8,10],[230,-6,9],[217,-4,8]].map(([x,y,r])=>`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.9}" fill="url(#cusk)" stroke="#6E7B82" stroke-width="2.5"/>`).join('')}
     <ellipse cx="290" cy="-26" rx="7" ry="5" fill="#D8E0E3" opacity=".8"/><circle cx="44" cy="-118" r="11" fill="#9BA7AD" opacity=".6"/>
     <path d="M30 -4 C90 -18 150 -16 200 -6" stroke="#5E6A70" stroke-width="7" fill="none" opacity=".55" stroke-linecap="round"/><path d="M-10 -2 H292" stroke="#4E585E" stroke-width="4" opacity=".6"/>
     <path d="M30 -150 Q72 -128 112 -152" stroke="#C9CFD4" stroke-width="6" fill="none"/>${[40,58,76,94].map((x,j)=>`<g transform="translate(${x} ${-140+Math.abs(x-72)*.2})"><line y2="10" stroke="#C9CFD4" stroke-width="2"/><circle cy="16" r="7" fill="#D7DDE1"/><path d="M-4 18 h8" stroke="#6E7B82" stroke-width="2"/></g>`).join('')}</g>`;
  const sneak=(x0,y0)=>`<g transform="translate(${x0} ${y0})"><path d="M0 0 L0 -560 L170 -560 L170 -60 Z" fill="#2E2F28"/><path d="M-10 -70 C-14 -96 10 -110 60 -108 L150 -96 C200 -88 236 -60 244 -26 L246 0 L-10 0Z" fill="#F2EDE6"/><rect x="-12" y="-10" width="262" height="22" rx="11" fill="#FF6A00"/><path d="M80 -98 L140 -86" stroke="#C9B9A8" stroke-width="5" stroke-linecap="round"/></g>`;
  const dust=[0,1,2,3,4,5].map(j=>{const st=T.cu0+.6+j*.22,p=P(t,st,st+1.1);if(p<=0||p>=1)return '';return `<circle cx="${(700+gx+j*40+p*80).toFixed(1)}" cy="${(1300-p*70-j*6).toFixed(1)}" r="${(14+p*40).toFixed(1)}" fill="#8C979E" opacity="${f3(.16*Math.sin(p*Math.PI))}"/>`}).join('');
  const prints=[0,1,2].map(j=>`<g transform="translate(${930+j*170} ${1340+j*22})" opacity="${f3(.35-j*.08)}"><ellipse cx="0" cy="0" rx="70" ry="16" fill="#05070A"/>${[0,1,2,3,4].map(k=>`<circle cx="${70+k*3}" cy="${-14+k*7}" r="6" fill="#05070A"/>`).join('')}</g>`).join('');
  const hemJ=[...Array(18)].map((_,j)=>`L${(1060-j*44).toFixed(0)} ${(1032+(j%2?-26:16)+Math.sin(t*5+j)*10).toFixed(1)}`).join(' ');
  return `<div class="abs" style="inset:0;background-color:#06080C;overflow:hidden">
   <div class="abs" style="inset:0;transform-origin:52% 66%;transform:scale(${push.toFixed(4)})">
    <div class="abs" style="left:-80px;top:-80px;width:1240px;height:1240px;background:radial-gradient(ellipse 70% 60% at 22% 64%,#1B2330 0%,#0E131B 55%,#06080C 100%)"></div>
    <div class="abs" style="left:-80px;top:1040px;width:1240px;height:960px;background:linear-gradient(180deg,#151B23 0%,#0C1016 40%,#05070A 100%)"></div>
    <div class="abs" style="left:-80px;top:1040px;width:1240px;height:700px;background:radial-gradient(ellipse 55% 50% at 22% 30%,rgba(170,190,178,.2),rgba(170,190,178,0) 70%)"></div>
    <svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="1920" viewBox="0 0 1080 1920"><defs>
      <linearGradient id="cusk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C3CDD2"/><stop offset="1" stop-color="#7F8C93"/></linearGradient>
      <linearGradient id="cusr" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7E898E"/><stop offset=".3" stop-color="#626D73"/><stop offset="1" stop-color="#2A3238"/></linearGradient></defs>
     ${[...Array(40)].map((_,j)=>`<ellipse cx="${(rnd(j+300)*1080).toFixed(0)}" cy="${(1330+rnd(j+340)*560).toFixed(0)}" rx="${(2+rnd(j+380)*6).toFixed(1)}" ry="${(1+rnd(j+420)*3).toFixed(1)}" fill="#2A323B" opacity=".6"/>`).join('')}
     ${prints}
     <g transform="translate(${back.toFixed(1)} ${(-stepUp).toFixed(1)})">${sneak(70,1322)}</g><g transform="translate(${(back*.7).toFixed(1)} 0)">${sneak(-60,1352)}</g>
     <g transform="translate(${gx.toFixed(1)} 0)"><g transform="translate(380 1318) scale(1.6)">${foot(0,0,.8)}</g><g transform="translate(440 1344) scale(1.6)">${foot(0,0,1)}</g>
      <path d="M330 -40 L1080 -40 L1080 1010 ${hemJ} L330 1020 Z" fill="url(#cusr)"/>
      <path d="M330 966 ${[...Array(18)].map((_,j)=>`L${(330+j*44).toFixed(0)} ${(986+(j%2?-22:12)+Math.sin(t*5+j*.7)*8).toFixed(1)}`).join(' ')}" stroke="#6B3A34" stroke-width="12" fill="none" opacity=".7"/>
      <path d="M470 0 C480 400 470 760 490 1000 M700 0 C690 400 710 760 700 1010 M900 0 C910 400 900 760 920 1000" stroke="#3E484F" stroke-width="9" fill="none" opacity=".35"/></g>
     ${dust}
    </svg>
    ${fog(t*1.6,true)}
   </div></div>`}

/* ---------- the horror frame ---------- */
function horror(t,ov){
  GU=0; HU=0;
  const lp=lamp(t), c=cam(t), fz=t>=T.freeze-1e-6;
  let w=nightBack(t,lp)+fog(t,false)+ghostEl(t,ov)+manEl(t,lp)+fog(t,true);
  w+=`<svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="1920"><defs><linearGradient id="ncone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCEBD7" stop-opacity=".5"/><stop offset="1" stop-color="#DCEBD7" stop-opacity="0"/></linearGradient></defs>
    <path d="M198 754 L240 754 L560 1520 L-110 1520Z" fill="url(#ncone)" opacity="${f3(.2*lp)}"/></svg>`;
  let h=`<div class="abs" style="left:0;top:0;width:1080px;height:1920px;transform-origin:0 0;transform:translate(540px,960px) scale(${c[2].toFixed(5)}) translate(${px(-c[0])},${px(-c[1])})">${w}</div>`;
  h+=closeup(t);
  h+=`<div class="abs" style="inset:0;background:radial-gradient(ellipse 72% 58% at 50% 50%,rgba(0,0,0,0) 45%,rgba(0,0,0,.45) 75%,rgba(0,0,0,.9) 100%)"></div>`;
  return h}

/* ---------- warm CreatorChahiye room (Ep. 4/5 set) ---------- */
function warmRoom(t){
  const slats=[...Array(7)].map((_,i)=>`<rect x="672" y="${500+i*44}" width="292" height="17" fill="#07060B" opacity=".62"/>`).join('');
  return `<svg class="abs" style="left:-500px;top:-500px" width="2100" height="2900" viewBox="-500 -500 2100 2900"><defs>
   <linearGradient id="wgw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#130906"/><stop offset="1" stop-color="#3A1E0E"/></linearGradient>
   <linearGradient id="wgf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0D0604"/><stop offset="1" stop-color="#030303"/></linearGradient>
   <radialGradient id="wglow" cx="640" cy="1080" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8A4418" stop-opacity=".55"/><stop offset="1" stop-color="#8A4418" stop-opacity="0"/></radialGradient>
   <linearGradient id="wglass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22326A"/><stop offset="1" stop-color="#141C40"/></linearGradient>
   <linearGradient id="wspot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB066" stop-opacity="0"/><stop offset=".45" stop-color="#FFB066" stop-opacity=".1"/><stop offset="1" stop-color="#FFB066" stop-opacity=".2"/></linearGradient>
   <linearGradient id="wpot" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B9562E"/><stop offset="1" stop-color="#7E3319"/></linearGradient>
   <filter id="wb20" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="20"/></filter><clipPath id="wcwin"><rect x="672" y="484" width="292" height="304"/></clipPath></defs>
  <rect x="-500" y="-500" width="2100" height="1920" fill="url(#wgw)"/><rect x="-500" y="-500" width="2100" height="1920" fill="url(#wglow)" opacity=".85"/>
  <rect x="656" y="468" width="324" height="336" rx="10" fill="#120A07"/><g clip-path="url(#wcwin)"><rect x="672" y="484" width="292" height="304" fill="url(#wglass)"/><circle cx="902" cy="548" r="29" fill="#DCE1F2" opacity=".92"/>${slats}<rect x="672" y="484" width="292" height="304" fill="#FF9142" opacity=".14"/></g><rect x="811" y="476" width="14" height="320" fill="#120A07"/>
  <rect x="12" y="680" width="268" height="745" rx="6" fill="#170D08"/><path d="M22 690 L270 690 L270 1425 L22 1425Z" fill="#2B180E"/><rect x="56" y="762" width="182" height="270" rx="8" fill="none" stroke="#150B06" stroke-width="5"/><rect x="56" y="1082" width="182" height="300" rx="8" fill="none" stroke="#150B06" stroke-width="5"/><ellipse cx="230" cy="1074" rx="11" ry="11" fill="#CBA47C"/>
  <rect x="-500" y="1420" width="2100" height="980" fill="url(#wgf)"/><path d="M-500 1421 H1600" stroke="#fff" stroke-opacity=".05" stroke-width="2"/>
  <path d="M650 -500 L790 -500 L940 1516 L500 1516Z" fill="url(#wspot)" filter="url(#wb20)"/><ellipse cx="720" cy="1514" rx="250" ry="40" fill="#FFB066" opacity=".26" filter="url(#wb20)"/>
  <ellipse cx="330" cy="1514" rx="200" ry="34" fill="#FF8A3A" opacity=".16" filter="url(#wb20)"/>
  <g><path d="M968 1330 Q896 1292 912 1196 Q976 1238 982 1330Z" fill="#2F5A30"/><path d="M990 1330 Q1064 1292 1058 1184 Q996 1240 984 1330Z" fill="#37663A"/><path d="M970 1332 Q948 1250 986 1174 Q1016 1250 994 1332Z" fill="#467A42"/><path d="M940 1328 L1020 1328 L1009 1432 L951 1432Z" fill="url(#wpot)"/><rect x="936" y="1322" width="88" height="14" rx="5" fill="#C9653A"/></g></svg>`}

/* ---------- the paused reel on a phone ---------- */
const PH={x:570,y:884,w:300,h:533};
function monkEl(t){
  const o={tw:t*4.2,mouth:S(t,[[0,'smirk'],[T.point,'grin'],[T.hk1,'smirk'],[T.end0,'grin'],[T.gag+.3,'smirk']])};
  let x=330;
  o.ra=K(t,[[T.point-.05,CROSS_R],[T.point+.3,PUSH_R,eo],[T.hk1-.2,PUSH_R],[T.hk1+.2,CROSS_R]]);
  o.point=K(t,[[T.point+.1,0],[T.point+.3,1],[T.hk1-.2,1],[T.hk1,0]]);
  o.tilt=K(t,[[T.point,0],[T.point+.3,-3],[T.hk1,0],[T.take,0],[T.take+.25,7,eo],[T.moon0,7],[T.moon0+.3,-3]]);
  o.bob=t<T.gag?-Math.abs(Math.sin((t-G0)*Math.PI/BEAT/2))*3:0;
  if(t>=T.moon0){x=K(t,[[T.moon0,330],[T.moon1,170,es]]);const amp=K(t,[[T.moon0,0],[T.moon0+.14,1],[T.moon1-.18,1],[T.moon1,0]]),ph=-TAU*2.2*(t-T.moon0);
    Object.assign(o,legsAt(ph,amp));o.bob=-Math.abs(Math.sin(ph))*5*amp}
  const op=eo(P(t,T.pull0+.35,T.pull0+.9));
  return `<div class="abs" style="left:${px(x-250*MS)};top:${px(FLOOR-880*MS)};width:${520*MS}px;opacity:${f3(op)}">${drip(o)}</div>`}
function pausedReel(t){
  const e=eio(P(t,T.pull0,T.pull1)), sc=L(1,PH.w/1080,e), x=L(0,PH.x,e), y=L(0,PH.y,e), r=L(0,34,e)/sc;
  const gz=t>=T.gag?{edx:-18*es(P(t,T.gag+.05,T.gag+.5))}:null;
  const pz=eo(P(t,T.pause,T.pause+.25)), pzs=L(1.25,1,eb(P(t,T.pause,T.pause+.3)));
  const frame=`<div class="abs" style="left:${px(x)};top:${px(y)};width:1080px;height:1920px;transform-origin:0 0;transform:scale(${sc.toFixed(5)});border-radius:${r.toFixed(1)}px;overflow:hidden;background-color:#06080C;filter:grayscale(.35) brightness(.92)">
     ${horror(T.freeze,gz)}
     <div class="abs" style="left:450px;top:1250px;width:180px;height:180px;border-radius:50%;background:rgba(10,9,8,.55);border:3px solid rgba(250,247,242,.35);opacity:${f3(pz)};transform:scale(${pzs.toFixed(4)});display:flex;align-items:center;justify-content:center;gap:26px">
      <span style="width:24px;height:76px;border-radius:7px;background:#FAF7F2"></span><span style="width:24px;height:76px;border-radius:7px;background:#FAF7F2"></span></div>
     <div class="abs" style="left:60px;right:60px;top:1840px;height:12px;border-radius:6px;background:rgba(250,247,242,.25);opacity:${f3(e)}"><div style="width:52%;height:100%;border-radius:6px;background:#FAF7F2"></div></div></div>`;
  if(e<=0)return frame;
  const b=14;
  return `<div class="abs" style="left:${PH.x+PH.w/2-6}px;top:${PH.y+PH.h}px;width:12px;height:${FLOOR-PH.y-PH.h-14}px;background:#2A2523;opacity:${f3(e)}"></div>
    <svg class="abs" style="left:0;top:0;overflow:visible;opacity:${f3(e)}" width="1080" height="1920"><path d="M${PH.x+PH.w/2} ${PH.y+PH.h+40} L${PH.x+PH.w/2-70} ${FLOOR} M${PH.x+PH.w/2} ${PH.y+PH.h+40} L${PH.x+PH.w/2+70} ${FLOOR}" stroke="#2A2523" stroke-width="9" stroke-linecap="round"/><ellipse cx="${PH.x+PH.w/2}" cy="${FLOOR+6}" rx="110" ry="12" fill="#000" opacity=".45"/></svg>
    <div class="abs" style="left:${PH.x-b}px;top:${PH.y-b}px;width:${PH.w+2*b}px;height:${PH.h+2*b}px;border-radius:${34+b}px;background:#14110F;border:3px solid #5A4D45;box-shadow:0 30px 60px rgba(0,0,0,.6);opacity:${f3(e)}"></div>
    ${frame}
    <div class="abs" style="left:${PH.x+PH.w/2-34}px;top:${PH.y+8}px;width:68px;height:14px;border-radius:7px;background:#14110F;opacity:${f3(e)}"></div>`}

/* ---------- on-screen text ---------- */
const line=(t,txt,cls,top,size,t0,t1,extra='')=>{const k=P(t,t0,t0+.45), out=ei(P(t,t1,t1+.3)); if(k<=0||out>=1)return '';
  return `<div class="abs hl ${cls}" style="left:0;width:1080px;text-align:center;top:${px(top-out*24)};font-size:${size}px;opacity:${f3(eo(P(k,0,.6))*(1-out))};transform:translateY(${px((1-eo(k))*26)});${extra}">${txt}</div>`};
function ui(t){
  let h='';
  h+=line(t,'Raat ke 3 baje.','cream',300,116,T.hook0,T.hook1);
  h+=line(t,'Chhan... chhan...','cream',300,108,T.chT0,T.chT1);
  h+=line(t,'Koi hai?','cream',300,124,T.koi0,T.koi1);
  h+=line(t,'Kuch nahi hai.','cream',300,116,T.kuch0,T.kuch1);
  h+=line(t,'Pair... ulte the.','cream',300,116,T.pair0,T.pair1);
  h+=line(t,'Ruk gaye na?','cream',300,132,T.ruk0,T.ruk1);
  h+=line(t,'Isse kehte hain','cream',290,104,T.hk0,T.hk1)+line(t,'hook.','orange',402,150,T.hk0+.4,T.hk1);
  if(t>=T.sc0){const e=eio(P(t,T.end0,T.end0+.75)), a=P(t,T.sc0,T.sc0+.5), b=P(t,T.sc1,T.sc1+.5);
    h+=`<div class="abs" style="left:0;width:1080px;top:${px(L(290,236,e))};transform-origin:50% 0;transform:scale(${L(1,.74,e).toFixed(4)})">
      <div class="hl cream" style="text-align:center;font-size:104px;opacity:${f3(eo(P(a,0,.6)))};transform:translateY(${px((1-eo(a))*26)})">Scroll rokne wale</div>
      ${b>0?`<div class="hl orange" style="text-align:center;font-size:104px;margin-top:10px;opacity:${f3(eo(P(b,0,.6)))};transform:translateY(${px((1-eo(b))*26)}) scale(${L(.94,1,eb(b)).toFixed(4)})">creators chahiye?</div>`:''}</div>`;
    const fade=(t0,d=.5)=>f3(eo(P(t,t0,t0+d))), rise=t0=>px((1-eo(P(t,t0,t0+.5)))*20);
    if(t>T.ctaA)h+=`<div class="abs" style="left:540px;top:470px;opacity:${fade(T.ctaA)};transform:translate(-50%,${rise(T.ctaA)})"><div class="cta" style="font-size:40px;padding:18px 44px 22px">Brands: brief bhejo</div></div>`;
    if(t>T.ctaB)h+=`<div class="abs" style="left:540px;top:572px;opacity:${fade(T.ctaB)};transform:translate(-50%,${rise(T.ctaB)})"><div class="pill" style="font-size:32px;padding:12px 30px 14px;background:rgba(10,9,8,.5);border:2px solid #FAF7F2">Creators: free join karo</div></div>`;
    if(t>T.logo){const k=P(t,T.logo,T.logo+.8);h+=`<div class="abs" style="left:0;width:1080px;top:672px;text-align:center;opacity:${f3(es(k))};transform:scale(${L(.96,1,eo(k)).toFixed(4)});white-space:nowrap;line-height:1"><span style="font-weight:800;font-size:76px;letter-spacing:-.04em;color:#FAF7F2">Creator</span><span style="font-family:'Baloo 2';font-weight:800;font-size:82px;color:#FF6A00;position:relative;top:4px;margin-left:14px">चाहिए?</span></div>`}
    if(t>T.url)h+=`<div class="abs" style="left:0;width:1080px;top:782px;text-align:center;font-weight:400;font-size:33px;letter-spacing:.02em;color:#B9AFA6;opacity:${fade(T.url,.55)}">creatorchahiye.com</div>`}
  return h}

/* ---------- grain + vignette ---------- */
const GRAIN=(()=>{const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d'),d=x.createImageData(512,512);let s=20261;const r=()=>{s|=0;s=s+0x6D2B79F5|0;let q=Math.imul(s^s>>>15,1|s);q=q+Math.imul(q^q>>>7,61|q)^q;return((q^q>>>14)>>>0)/4294967296};
  for(let i=0;i<d.data.length;i+=4){const v=128+(r()+r()+r()-1.5)*120;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0);return c.toDataURL('image/png')})();
const gst=document.createElement('style');gst.textContent=`.grain{background-image:url(${GRAIN});background-size:256px 256px}`;document.head.appendChild(gst);
const fx=(f,hor)=>`<div class="abs" style="inset:0;background:radial-gradient(ellipse 74% 62% at 50% 47%,rgba(0,0,0,0) 52%,rgba(0,0,0,.36) 78%,rgba(0,0,0,.8) 100%)"></div>
  <div class="abs grain" style="inset:0;opacity:${hor?.15:.11};mix-blend-mode:overlay;background-position:${Math.floor(rnd(f)*256)}px ${Math.floor(rnd(f+.5)*256)}px"></div>`;

/* ---------- frame ---------- */
function render(t){
  t=C(t,0,T.END); const f=Math.round(t*60);
  let h;
  if(t<T.freeze)h=horror(t);
  else{const e=P(t,T.pull0,T.pull1);
    h=(e>0?`<div class="abs" style="inset:0">${warmRoom(t)}</div>`+monkEl(t):'')+pausedReel(t);}
  stage.innerHTML=h+ui(t)+fx(f,t<T.pull1);
}
window.render=render; window.DURATION=T.END; window.TL=T;
window.cues=()=>{
  const steps=(t0,t1,rate)=>{const a=[];for(let n=1;;n++){const x=t0+n/(rate*2);if(x>t1-.08)break;a.push(+x.toFixed(3))}return a};
  return {T,BEAT,G0,END:T.END,stepsA:steps(0,T.walkA1,1.5),stepsB:steps(T.walkB0,T.walkB1,1.5),moonSteps:steps(T.moon0,T.moon1,2.2)}};
render(0);

/* ---------- thumbnail (1080x1920; key content inside the centre 3:4 crop of the profile grid) ---------- */
function renderThumb(){
  const t=12.25;
  stage.innerHTML=horror(t)+`<div class="abs" style="left:0;top:0;width:1080px;height:760px;background:linear-gradient(180deg,rgba(2,3,6,.85),rgba(2,3,6,0))"></div>
   <div class="abs hl cream" style="left:0;width:1080px;text-align:center;top:300px;font-size:120px">Raat ke 3 baje...</div>`+fx(5,true)}
window.renderThumb=renderThumb;
