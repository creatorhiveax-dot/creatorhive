'use strict';
/* CreatorChahiye Ep. 7 "Planchette" : a 3 AM planchette story that spells its way into a CreatorChahiye hook.
   render(t) draws the frame for time t (seconds). Stateless, so renders are resumable. */
const W=1080,H=1920,BEAT=60/110,TAU=Math.PI*2;
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
let GU=0;
function ghost(o){
  const i='gh'+(GU++), t=o.t||0, part=o.part||0, lift=o.lift==null?1:o.lift, eyes=o.eyes||0, edx=o.edx||0, reach=o.reach||0;
  const N=18; let jag=[];for(let j=0;j<=N;j++){const x=112+(296)*j/N; jag.push([x,846+(j%2?-16:9)+Math.sin(t*2.7+j*1.9)*5])}
  const hem=jag.map(p=>`L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' '), bord=jag.map((p,j)=>`${j?'L':'M'}${p[0].toFixed(1)} ${(p[1]-20).toFixed(1)}`).join(' ');
  const SH=[[186,410],[334,410]]; let EL=[LJ([[168,520]],[[180,356]],reach)[0],LJ([[352,520]],[[340,356]],reach)[0]], HA=[LJ([[160,626]],[[200,248]],reach)[0],LJ([[360,626]],[[320,248]],reach)[0]];
  [o.hand0,o.hand1].forEach((hh,k)=>{if(hh){HA[k]=hh;const s=SH[k],mx=(s[0]+hh[0])/2,my=(s[1]+hh[1])/2;EL[k]=[mx+(k?24:-24),my+30]}});
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
const GRAIN=(()=>{const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d'),d=x.createImageData(512,512);let s=20261;const r=()=>{s|=0;s=s+0x6D2B79F5|0;let q=Math.imul(s^s>>>15,1|s);q=q+Math.imul(q^q>>>7,61|q)^q;return((q^q>>>14)>>>0)/4294967296};
  for(let i=0;i<d.data.length;i+=4){const v=128+(r()+r()+r()-1.5)*120;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0);return c.toDataURL('image/png')})();
const gst=document.createElement('style');gst.textContent=`.grain{background-image:url(${GRAIN});background-size:256px 256px}`;document.head.appendChild(gst);
const fx=(f,hor)=>`<div class="abs" style="inset:0;background:radial-gradient(ellipse 74% 62% at 50% 47%,rgba(0,0,0,0) 52%,rgba(0,0,0,.36) 78%,rgba(0,0,0,.8) 100%)"></div>
  <div class="abs grain" style="inset:0;opacity:${hor?.15:.11};mix-blend-mode:overlay;background-position:${Math.floor(rnd(f)*256)}px ${Math.floor(rnd(f+.5)*256)}px"></div>`;

/* ---------- timeline (seconds). Narration slots are in VO below; sound.py places each line at its slot. ---------- */
const G0=31.0, g=n=>G0+n*BEAT;
const T={
  A0:0, B0:4.6, C0:8.6, D0:12.6, E0:16.4, F0:19.0, G0s:23.2, H0:26.2, boom:31.0,
  haan0:12.95, haan1:13.95, door:16.9, payal0:19.15, payStep:.65, cre0:26.35, creStep:.34, hand0:28.85, hand1:29.4, out:29.6, eyes0:29.85,
  wave0:34.0, wave1:35.6, take:35.9, faint:g(22.6), shades:g(24.2), END:46.6,
  t1:[.35,4.1], t2:[4.9,8.4], t3:[9.0,12.3], t4:[14.05,16.25], t5:[16.7,18.9], t7:[23.55,26.05],
  j1:[33.7,35.95], j2:[36.15,38.05], j3:[38.25,40.1], ctaA:40.35, ctaB:40.75, logo:41.15, url:41.7
};
/* narration: id, start, Devanagari text sent to the voice, style */
const VO=[
  ['n1',.35,'कहते हैं... रात के तीन बजे... प्लैंचेट खेलो...','dark'],
  ['n2',4.55,'तो कोई ना कोई... ज़रूर आता है।','dark'],
  ['n3',8.95,'कबीर ने पूछा... कोई है?','dark'],
  ['n4',14.1,'गिलास... ख़ुद चला।','dark'],
  ['n5',16.7,'उसने पूछा... तुम कौन हो?','dark'],
  ['n6',22.6,'पायल।','whisper'],
  ['n7',23.6,'तुम्हें... क्या चाहिए?','dark'],
  ['n8',29.85,'उसे भी...','whisper'],
  ['n9',31.3,'एक क्रिएटर चाहिए था।','warm'],
  ['n10',36.2,'ब्रैंड्स को सही क्रिएटर्स... और क्रिएटर्स को सही ब्रैंड्स।','warm'],
  ['n11',40.8,'क्रिएटर चाहिए? क्रिएटर चाहिए डॉट कॉम।','warm']];

/* ---------- the planchette board (close-up, screen space) ---------- */
const LET={};
'ABCDEFGHIJKLM'.split('').forEach((c,i)=>{const x=126+i*69;LET[c]=[x,872+Math.pow((x-540)/414,2)*44]});
'NOPQRSTUVWXYZ'.split('').forEach((c,i)=>{const x=156+i*64;LET[c]=[x,1000+Math.pow((x-540)/384,2)*44]});
'1234567890'.split('').forEach((c,i)=>{LET[c]=[236+i*67.5,1150]});
LET.HAAN=[232,700]; LET.NAHI=[848,700]; LET.MID=[540,1290]; LET.ALVIDA=[540,1450];
const GOFF=62;   // the glass rests just below the letter it points at
const PAY='PAYAL'.split(''), CRE='CREATOR'.split('');
const glassKeys=(()=>{const k=[[0,LET.MID],[T.haan0,LET.MID],[T.haan1,LET.HAAN]];
  let t0=T.payal0;PAY.forEach((c,i)=>{const a=t0+i*T.payStep;k.push([a,k[k.length-1][1]],[a+.42,LET[c]])});
  k.push([T.cre0-.2,LET.L]);t0=T.cre0;CRE.forEach((c,i)=>{const a=t0+i*T.creStep;k.push([a,k[k.length-1][1]],[a+.24,LET[c]])});
  return k})();
const glassAt=t=>{const p=K(t,glassKeys);return [p[0],p[1]+(p===LET.MID?0:GOFF*K(t,[[0,0],[T.haan0,0],[T.haan1,1]]))]};
const flame=t=>t<T.out?1:1-P(t,T.out,T.out+.16);
function activeLetter(t){let a=null;
  PAY.forEach((c,i)=>{const at=T.payal0+i*T.payStep+.42;if(t>=at&&t<at+.5)a=[c,Math.sin(P(t,at,at+.5)*Math.PI)]});
  CRE.forEach((c,i)=>{const at=T.cre0+i*T.creStep+.24;if(t>=at&&t<at+.4)a=[c,Math.sin(P(t,at,at+.4)*Math.PI)]});
  return a}
const typed=(t,word,t0,step,mv)=>{let n=0;word.forEach((_,i)=>{if(t>=t0+i*step+mv)n=i+1});return n};
function board(t){
  const gp=glassAt(t), fl=flame(t), ff=1+.08*Math.sin(t*29)+.05*Math.sin(t*13.7), bend=K(t,[[T.haan0,0],[T.haan0+.2,1],[T.haan1+.4,1],[T.haan1+1.2,0]])+(t>T.cre0&&t<T.out?.7:0);
  const push=K(t,[[T.A0,1.0],[T.B0-.01,1.08,es],[T.C0,1.04],[T.D0-.01,1.1,es],[T.D0,1.06],[T.E0-.01,1.16,es],[T.F0,1.02],[T.G0s-.01,1.1,es],[T.H0,1.05],[T.boom,1.22,es]]);
  const rot=K(t,[[0,-1.5],[T.B0,.5,es],[T.C0,-.8],[T.D0,.6,es],[T.F0,-1],[T.G0s,.4,es],[T.H0,-.6],[T.boom,1.2,es]]);
  const shake=t>T.H0?Math.sin(t*57)*1.6:t>T.haan0?Math.sin(t*49)*.9:0;
  const act=activeLetter(t);
  const letters=Object.entries(LET).filter(([c])=>c.length===1).map(([c,[x,y]],i)=>{const big=/[A-Z]/.test(c), r=(rnd(i+7)-.5)*10, on=act&&act[0]===c?act[1]:0;
    return `${on>0?`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="40" fill="#FF8A2A" opacity="${f3(.35*on)}" filter="url(#bbl)"/>`:''}<text x="${x.toFixed(1)}" y="${(y+20).toFixed(1)}" transform="rotate(${r.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" text-anchor="middle" font-family="Outfit" font-weight="700" font-size="${big?60:46}" fill="${on>0?'#7A2E08':'#2B1D14'}" opacity=".88">${c}</text>`}).join('');
  const word=(w,x,y,s)=>`<text x="${x}" y="${y}" text-anchor="middle" font-family="Outfit" font-weight="800" font-size="${s}" letter-spacing="4" fill="#2B1D14" opacity=".85">${w}</text>`;
  // Kabir's hand on the glass, from the bottom of frame
  const base=[760,2140], dx=base[0]-gp[0], dy=base[1]-gp[1], dl=Math.hypot(dx,dy), ux=dx/dl, uy=dy/dl, tr=t>T.D0?Math.sin(t*61)*2.2:0;
  const hx=gp[0]+ux*150+tr, hy=gp[1]+uy*150, tip=[gp[0]+ux*10+tr*.5,gp[1]+uy*10];
  const kabir=`<g><path d="M${base[0]} ${base[1]} L${(hx+ux*70).toFixed(1)} ${(hy+uy*70).toFixed(1)}" stroke="#000" stroke-width="170" opacity=".22" stroke-linecap="round" transform="translate(26 30)"/>
    <path d="M${base[0]} ${base[1]} L${(hx+ux*86).toFixed(1)} ${(hy+uy*86).toFixed(1)}" stroke="url(#bsl)" stroke-width="160" stroke-linecap="round"/>
    <ellipse cx="${hx.toFixed(1)}" cy="${hy.toFixed(1)}" rx="58" ry="52" fill="url(#bsk)"/>
    <path d="M${hx.toFixed(1)} ${hy.toFixed(1)} L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}" stroke="#A86A43" stroke-width="28" stroke-linecap="round"/>
    <ellipse cx="${(tip[0]+ux*6).toFixed(1)}" cy="${(tip[1]+uy*6).toFixed(1)}" rx="9" ry="7" fill="#E3B597" opacity=".7"/>
    <path d="M${(hx-uy*40).toFixed(1)} ${(hy+ux*40).toFixed(1)} q${(ux*30).toFixed(1)} ${(uy*30).toFixed(1)} ${(-uy*8).toFixed(1)} ${(ux*8).toFixed(1)}" stroke="#7A4528" stroke-width="5" fill="none" opacity=".5"/></g>`;
  // Payal's hand, from the top
  const hk=eo(P(t,T.hand0,T.hand1)), pb=[372,-160], ptip=[gp[0]-34,gp[1]-30], pw=[L(pb[0],ptip[0]-60,hk),L(pb[1],ptip[1]-120,hk)];
  const hair=hk>0?`<path d="M260 -60 L820 -60 C800 ${40+120*hk} 790 ${60+170*hk} 760 ${80+210*hk} L700 ${70+170*hk} L650 ${90+220*hk} L600 ${70+160*hk} L540 ${95+230*hk} L480 ${70+170*hk} L420 ${90+220*hk} L360 ${70+180*hk} L300 ${80+200*hk} C280 ${60+160*hk} 266 ${40+100*hk} 260 -60Z" fill="#05060A" opacity="${f3(.92*hk)}"/>`:'';
  const payal=hk>0?`<g opacity="${f3(hk)}"><path d="M${pb[0]} ${pb[1]} L${pw[0].toFixed(1)} ${pw[1].toFixed(1)}" stroke="#A3AFB5" stroke-width="64" stroke-linecap="round"/><ellipse cx="${pw[0].toFixed(1)}" cy="${(pw[1]+8).toFixed(1)}" rx="46" ry="40" fill="#AEB9BE"/>
    ${[-26,-8,10,28].map((o,j)=>{const ex=pw[0]+o+L(0,60,hk)*(.6+j*.15), ey=pw[1]+L(40,118,hk)-Math.abs(o)*.6;return `<path d="M${(pw[0]+o*.5).toFixed(1)} ${(pw[1]+20).toFixed(1)} Q${(pw[0]+o).toFixed(1)} ${(ey-40).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="#97A3AA" stroke-width="15" fill="none" stroke-linecap="round"/>`}).join('')}</g>`:'';
  const smoke=t>T.out?(()=>{const q=P(t,T.out,T.out+1.4);return `<path d="M146 548 C${136+Math.sin(q*8)*12} ${500-q*80} 160 ${430-q*120} ${140+Math.sin(q*6)*18} ${360-q*170}" stroke="#B9AFA6" stroke-width="${6+q*10}" fill="none" opacity="${f3(.45*Math.sin(q*Math.PI))}" stroke-linecap="round"/>`})():'';
  const dark=L(.93,.0,fl);
  const eyes=eo(P(t,T.eyes0,T.eyes0+.45));
  return `<div class="abs" style="inset:0;background-color:#0B0706;overflow:hidden">
   <div class="abs" style="inset:0;transform-origin:50% 60%;transform:scale(${push.toFixed(4)}) rotate(${rot.toFixed(3)}deg) translate(${shake.toFixed(2)}px,0)">
    <div class="abs" style="left:-200px;top:-200px;width:1480px;height:2320px;background:radial-gradient(ellipse 60% 50% at 30% 30%,#4A2A18 0%,#2A170D 45%,#120A06 100%)"></div>
    <div class="abs" style="left:-200px;top:-200px;width:1480px;height:2320px;opacity:.35;background:repeating-linear-gradient(90deg,rgba(0,0,0,0) 0 70px,rgba(0,0,0,.25) 70px 73px,rgba(0,0,0,0) 73px 160px)"></div>
    <svg class="abs" style="left:0;top:0;overflow:visible" width="1080" height="1920" viewBox="0 0 1080 1920"><defs>
      <linearGradient id="bpap" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3EBDD"/><stop offset=".6" stop-color="#E7DCC9"/><stop offset="1" stop-color="#D6C8B1"/></linearGradient>
      <radialGradient id="bgl" cx=".42" cy=".38" r=".62"><stop offset="0" stop-color="#F2F4F5"/><stop offset=".5" stop-color="#B9C0C5"/><stop offset=".8" stop-color="#7E878D"/><stop offset="1" stop-color="#4E555A"/></radialGradient>
      <linearGradient id="bsk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#BC7B50"/><stop offset="1" stop-color="#8E5534"/></linearGradient>
      <linearGradient id="bsl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D8C8B6"/><stop offset=".5" stop-color="#F3EADF"/><stop offset="1" stop-color="#CDBBA6"/></linearGradient>
      <radialGradient id="bflg"><stop offset="0" stop-color="#FFD58A" stop-opacity=".9"/><stop offset=".4" stop-color="#FF9A3C" stop-opacity=".3"/><stop offset="1" stop-color="#FF8A2A" stop-opacity="0"/></radialGradient>
      <filter id="bbl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter></defs>
     <g transform="rotate(-2 540 1040)"><rect x="76" y="566" width="928" height="962" rx="6" fill="#000" opacity=".4" transform="translate(16 22)" filter="url(#bbl)"/>
      <rect x="76" y="566" width="928" height="962" rx="6" fill="url(#bpap)"/>
      <path d="M540 566 V1528 M76 1046 H1004" stroke="#BCA98F" stroke-width="3" opacity=".55"/>
      <circle cx="820" cy="1420" r="80" fill="none" stroke="#B08B62" stroke-width="10" opacity=".22"/>
      ${[LET.HAAN,LET.NAHI].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="120" ry="62" fill="none" stroke="#2B1D14" stroke-width="5" opacity=".7"/>`).join('')}
      ${word('HAAN',LET.HAAN[0],LET.HAAN[1]+20,56)}${word('NAHI',LET.NAHI[0],LET.NAHI[1]+20,56)}${word('ALVIDA',LET.ALVIDA[0],LET.ALVIDA[1]+16,48)}
      <circle cx="${LET.MID[0]}" cy="${LET.MID[1]}" r="74" fill="none" stroke="#2B1D14" stroke-width="5" opacity=".7" stroke-dasharray="14 10"/>
      ${letters}</g>
     <!-- candle -->
     <circle cx="146" cy="572" r="${(380*ff*fl).toFixed(1)}" fill="url(#bflg)" opacity="${f3(.55*fl)}"/>
     <circle cx="146" cy="572" r="52" fill="#EFE6D8"/><circle cx="146" cy="572" r="44" fill="#E2D6C3"/><circle cx="146" cy="572" r="6" fill="#2A1A10"/>
     ${fl>0?`<path d="M146 572 C${(158+14*bend).toFixed(1)} ${(556-6*bend).toFixed(1)} ${(166+40*bend).toFixed(1)} ${(530-10*bend).toFixed(1)} ${(146+46*bend*fl).toFixed(1)} ${(500-30*ff*fl+16*bend).toFixed(1)} C${(130+30*bend).toFixed(1)} ${(530-8*bend).toFixed(1)} ${(134+10*bend).toFixed(1)} ${556} 146 572Z" fill="#FFE2A0" opacity="${f3(fl)}"/>`:''}${smoke}
     <!-- glass (upside down) -->
     <g transform="translate(${gp[0].toFixed(1)} ${gp[1].toFixed(1)})"><circle r="62" fill="#000" opacity=".35" transform="translate(10 14)" filter="url(#bbl)"/><circle r="58" fill="url(#bgl)"/><circle r="45" fill="none" stroke="#E9EDEF" stroke-width="3" opacity=".7"/><circle r="31" fill="#9AA3A9" opacity=".5"/><path d="M-31 -36 A48 48 0 0 1 23 -42" stroke="#fff" stroke-width="6" fill="none" opacity=".75" stroke-linecap="round"/></g>
     ${kabir}${payal}${hair}
    </svg>
    <div class="abs" style="inset:-200px;background:radial-gradient(circle at ${146+200}px ${572+200}px,rgba(10,6,4,0) 0%,rgba(10,6,4,${f3(.25*fl)}) 30%,rgba(10,6,4,${f3(.72*fl+.2*(1-fl))}) 75%)"></div>
    <div class="abs" style="inset:-200px;background:#050407;opacity:${f3(dark)}"></div>
    ${eyes>0?`<svg class="abs" style="left:0;top:0;overflow:visible;opacity:${f3(eyes)}" width="1080" height="1920"><defs><filter id="beg" x="-100%" y="-200%" width="300%" height="500%"><feGaussianBlur stdDeviation="10"/></filter></defs>
      <path d="M300 -40 L780 -40 C770 160 790 380 740 560 L690 520 L660 580 L620 520 L590 600 L560 360 C560 250 520 250 520 360 L490 600 L460 520 L420 580 L390 520 L340 560 C290 380 310 160 300 -40Z" fill="#05060A"/>
      ${[470,610].map(x=>`<ellipse cx="${x}" cy="318" rx="34" ry="18" fill="#CFE9E2" opacity=".8" filter="url(#beg)"/><path d="M${x-20} 320 Q${x} 302 ${x+20} 318 Q${x} 330 ${x-20} 320Z" fill="#F2FBF8"/>`).join('')}</svg>`:''}
   </div></div>`}

/* ---------- the room ---------- */
const MOODS={night:{w0:'#05070D',w1:'#0B101C',fl:'#040509',beam:'#5E76C4',beamO:.12,dim:.66,cb:.62,cs:.7,glow:0,spot:0},
             warm:{w0:'#130906',w1:'#3A1E0E',fl:'#0D0604',beam:'#FF9142',beamO:.2,dim:.04,cb:1.02,cs:1.04,glow:.85,spot:1}};
const mood=t=>K(t,[[0,MOODS.night],[T.boom,MOODS.night],[T.boom+.26,MOODS.warm,eo]]);
const doorK=t=>K(t,[[0,0],[T.door,0],[T.door+.9,.16,eo]]);
function room(t,m){
  const dk=doorK(t), edge=L(270,96,dk), dimB=1-m.dim*.6, rat=t>T.G0s&&t<T.H0?Math.sin(t*38)*3*Math.sin(P(t,T.G0s,T.H0)*Math.PI):0;
  const slats=[...Array(7)].map((_,i)=>`<rect x="672" y="${(500+i*44+rat*(i%2?1:-1)).toFixed(1)}" width="292" height="17" fill="#07060B" opacity=".62"/>`).join('');
  return `<svg class="abs" style="left:-500px;top:-500px" width="2100" height="2900" viewBox="-500 -500 2100 2900">
  <defs>
   <linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m.w0}"/><stop offset="1" stop-color="${m.w1}"/></linearGradient>
   <linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m.fl}"/><stop offset="1" stop-color="#030303"/></linearGradient>
   <radialGradient id="gglow" cx="620" cy="1080" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#8A4418" stop-opacity=".55"/><stop offset="1" stop-color="#8A4418" stop-opacity="0"/></radialGradient>
   <linearGradient id="gbeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${m.beam}" stop-opacity=".5"/><stop offset="1" stop-color="${m.beam}" stop-opacity="1"/></linearGradient>
   <linearGradient id="gglass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22326A"/><stop offset="1" stop-color="#141C40"/></linearGradient>
   <linearGradient id="gspot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFB066" stop-opacity="0"/><stop offset=".45" stop-color="#FFB066" stop-opacity=".1"/><stop offset="1" stop-color="#FFB066" stop-opacity=".2"/></linearGradient>
   <linearGradient id="gpot" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#B9562E"/><stop offset="1" stop-color="#7E3319"/></linearGradient>
   <filter id="fb8" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
   <filter id="fb20" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="20"/></filter>
   <clipPath id="cwin"><rect x="672" y="484" width="292" height="304"/></clipPath>
  </defs>
  <rect x="-500" y="-500" width="2100" height="1920" fill="url(#gw)"/>
  <rect x="-500" y="-500" width="2100" height="1920" fill="url(#gglow)" opacity="${f3(m.glow)}"/>
  <rect x="656" y="468" width="324" height="336" rx="10" fill="#120A07"/>
  <g clip-path="url(#cwin)"><rect x="672" y="484" width="292" height="304" fill="url(#gglass)"/>
   <circle cx="902" cy="548" r="46" fill="#C9D2F2" opacity=".14"/><circle cx="902" cy="548" r="29" fill="#DCE1F2" opacity=".92"/>${slats}
   <rect x="672" y="484" width="292" height="304" fill="#FF9142" opacity="${f3(m.glow*.16)}"/></g>
  <rect x="811" y="476" width="14" height="320" fill="#120A07"/>
  <!-- light switch -->
  <rect x="286" y="1172" width="34" height="54" rx="6" fill="#D9CFC2" style="filter:brightness(${f3(L(.35,1,1-m.dim))})"/><rect x="298" y="${t>=T.boom?1184:1196}" width="10" height="18" rx="3" fill="#8A7F76"/>
  <!-- door -->
  <rect x="12" y="680" width="268" height="745" rx="6" fill="#170D08"/>
  <rect x="96" y="700" width="164" height="725" fill="#030203" opacity="${dk>0?1:0}"/>
  <g style="filter:brightness(${f3(dimB)})">
   <path d="M22 ${690-34*dk} L${edge} 690 L${edge} 1425 L22 ${1425+78*dk}Z" fill="#2B180E"/>
   <g opacity="${f3(1-dk*.4)}"><rect x="${L(56,34,dk)}" y="762" width="${L(182,48,dk)}" height="270" rx="8" fill="none" stroke="#150B06" stroke-width="5"/><rect x="${L(56,34,dk)}" y="1082" width="${L(182,48,dk)}" height="300" rx="8" fill="none" stroke="#150B06" stroke-width="5"/></g>
   <ellipse cx="${L(230,84,dk)}" cy="1074" rx="${L(11,4.5,dk)}" ry="11" fill="#CBA47C"/>
  </g>
  <rect x="-500" y="1420" width="2100" height="980" fill="url(#gf)"/>
  <path d="M-500 1421 H1600" stroke="#fff" stroke-opacity=".05" stroke-width="2"/>
  <path d="M657 520 L968 520 L842 1516 L322 1516Z" fill="url(#gbeam)" opacity="${f3(m.beamO)}"/>
  <g opacity="${f3(m.spot)}"><path d="M630 -500 L770 -500 L960 1516 L440 1516Z" fill="url(#gspot)" filter="url(#fb20)"/><ellipse cx="700" cy="1514" rx="290" ry="40" fill="#FFB066" opacity=".26" filter="url(#fb20)"/></g>
  <g style="filter:brightness(${f3(dimB)}) saturate(${f3(1-m.dim*.5)})"><path d="M968 1330 Q896 1292 912 1196 Q976 1238 982 1330Z" fill="#2F5A30"/><path d="M990 1330 Q1064 1292 1058 1184 Q996 1240 984 1330Z" fill="#37663A"/><path d="M970 1332 Q948 1250 986 1174 Q1016 1250 994 1332Z" fill="#467A42"/>
   <path d="M940 1328 L1020 1328 L1009 1432 L951 1432Z" fill="url(#gpot)"/><rect x="936" y="1322" width="88" height="14" rx="5" fill="#C9653A"/></g>
  </svg>`}
function calendar(m){
  return `<div class="abs" style="left:108px;top:290px;width:220px;height:210px;filter:brightness(${f3(1-m.dim*.7)}) saturate(${f3(1-m.dim*.6)})">
    <div class="abs" style="inset:0;border-radius:22px;box-shadow:0 16px 34px rgba(0,0,0,.5)"></div>
    <div class="abs" style="inset:0;border-radius:22px;overflow:hidden;background:linear-gradient(160deg,#F7F2EB,#D6CEC3)">
    <div style="height:56px;background:#D0424F;color:#FBEDEA;font-weight:700;font-size:31px;text-align:center;line-height:53px">Nov</div>
    <div style="text-align:center;font-weight:800;font-size:108px;line-height:146px;color:#17100D;letter-spacing:-.03em">13</div></div></div>`}
function table(t,m){
  const fl=flame(t)*(t<T.boom?1:0), ff=1+.08*Math.sin(t*29), gp=t<T.boom?680:690;
  return `<svg class="abs" style="left:540px;top:1160px;overflow:visible" width="280" height="380" viewBox="540 1160 280 380">
  <defs><radialGradient id="tfl"><stop offset="0" stop-color="#FFD58A" stop-opacity=".7"/><stop offset=".35" stop-color="#FF9A3C" stop-opacity=".22"/><stop offset="1" stop-color="#FF8A2A" stop-opacity="0"/></radialGradient></defs>
  <g style="filter:brightness(${f3(1-m.dim*.45)})">
  <ellipse cx="677" cy="1506" rx="78" ry="10" fill="#000" opacity=".5"/>
  <rect x="668" y="1256" width="18" height="246" fill="#1A110C"/><rect x="681" y="1256" width="5" height="246" fill="#FF9142" opacity=".22"/>
  <rect x="630" y="1494" width="94" height="13" rx="6.5" fill="#1F140E"/>
  <rect x="590" y="1244" width="174" height="16" rx="8" fill="#2A1A11"/><rect x="592" y="1244" width="170" height="5" rx="2.5" fill="#6A4126" opacity=".85"/>
  <path d="M614 1244 L740 1244 L734 1239 L620 1239Z" fill="#E9DFCF"/>
  <rect x="${gp-9}" y="1227" width="18" height="14" rx="3" fill="#B9C0C5"/><rect x="${gp-9}" y="1227" width="18" height="4" rx="2" fill="#E9EDEF"/>
  <rect x="603" y="1214" width="14" height="27" rx="3" fill="#EFE6D8"/></g>
  ${fl>0?`<circle cx="610" cy="1206" r="${(150*ff).toFixed(1)}" fill="url(#tfl)" opacity="${f3(fl)}"/><path d="M610 ${(1196-8*ff).toFixed(1)} C615 1203 615 1212 610 1212 C605 1212 605 1203 610 ${(1196-8*ff).toFixed(1)}Z" fill="#FFE2A0"/>`:''}
  </svg>`}

/* ---------- characters ---------- */
const CXK=820, CS=.8, FLOOR=1500, GXP=500, GS=.82, MXP=170, MS=.6;
const charAt=(svg,x,sc,cxl,m,extra='')=>`<div class="abs" style="left:${px(x-cxl*sc)};top:${px(FLOOR-880*sc)};width:${520*sc}px;filter:brightness(${f3(m.cb)}) saturate(${f3(m.cs)});${extra}">${svg}</div>`;
const BOARD_L=[[150,404],[82,470],[86,556]], FEAR_R=[[370,404],[396,500],[330,520]], IDLE_R=[[370,404],[392,520],[374,620]], IDLE_L=[[150,404],[128,520],[146,620]];
function kabirEl(t,m){
  const boom=t>=T.boom;
  const o={arms:'custom',la:boom?K(t,[[T.boom,BOARD_L],[T.boom+.35,[[150,404],[110,490],[150,560]],eo]]):BOARD_L,ra:t<T.E0?IDLE_R:FEAR_R,lhand:true,rprop:null,
    ringGlow:boom?L(.2,1,eo(P(t,T.boom,T.boom+.3))):(t>T.G0s&&t<T.H0?(Math.sin(t*23)>.6?.5:.12):.12),
    look:K(t,[[0,[-6,6]],[T.B0+1.2,[-6,6]],[T.B0+1.6,[0,0]],[T.E0,[-10,0]],[T.door+.1,[-11,-2],eo],[T.E0+2.2,[-11,-2]],[T.G0s,[-4,6]],[T.G0s+1.2,[-11,0]],[T.G0s+1.6,[2,-4]],
      [T.boom,[0,-2]],[T.boom+.6,[-11,0]],[T.take-.2,[-11,0]],[T.take,[0,1],eo],[T.take+.9,[0,1]],[T.take+1.1,[-11,0]],[T.faint,[-11,0]]]),
    lid:Math.min(1,K(t,[[0,.15],[T.E0,.15],[T.E0+.1,0],[T.faint,0],[T.faint+.25,1]])+blink(t,[2.0,6.6,20.1,24.9,37.4,39.6])),
    brow:S(t,[[0,'worry'],[T.E0,'up'],[T.G0s,'worry'],[T.boom,'up'],[T.take+.3,'skep'],[T.take+1.0,'up']]),
    mouth:S(t,[[0,'smirk'],[T.B0+2,'flat'],[T.E0,'o'],[T.G0s,'frown'],[T.boom,'o'],[T.take+.2,'flat'],[T.take+1.0,'o']]),
    squash:K(t,[[0,0],[T.E0,0],[T.E0+.15,.4,eo],[T.E0+1.5,.25],[T.boom,.25],[T.boom+.12,.7,eo],[T.boom+.6,.2]]),
    headDy:K(t,[[T.boom,0],[T.boom+.12,-10,eo],[T.boom+.5,0]]),
    bob:(t>T.D0&&t<T.boom+1.5?Math.sin(t*47)*1.4:0),
    tilt:K(t,[[0,0],[T.take,0],[T.take+.2,4],[T.take+.9,4],[T.take+1.1,0]])};
  const fk=ei(P(t,T.faint,T.faint+.55)), bounce=t>T.faint+.55?Math.exp(-(t-T.faint-.55)*10)*Math.sin((t-T.faint-.55)*30)*3:0;
  return charAt(CR(o),CXK,CS,260,m,`transform-origin:${260*CS}px ${880*CS}px;transform:rotate(${(fk*82+bounce).toFixed(2)}deg)`)}
function payalEl(t,m){
  if(t<T.boom)return '';
  const wk=P(t,T.wave0,T.wave1), wav=wk>0&&wk<1?Math.sin(wk*Math.PI*6)*16:0, up=Math.sin(Math.min(1,wk)*Math.PI);
  const o={t,part:1,lift:1,eyes:1,reach:0,bob:Math.sin(t*1.5)*4,hand1:K(t,[[T.boom,[406,573]],[T.boom+.6,[406,573]],[T.boom+1.0,[370,600],eo]]),
    hand0:wk>0&&wk<1?[L(150,120,up)+wav,L(626,330,up)]:null, edx:K(t,[[T.boom,0],[T.boom+.5,14],[T.take,14],[T.take+.3,10]]), friendly:1};
  return charAt(ghost(o),GXP,GS,260,m,`top:${px(FLOOR-10-880*GS)}`)}
function monkEl(t,m){
  if(t<T.boom)return '';
  const o={tw:t*4.2,mouth:S(t,[[0,'smirk'],[T.boom+1,'grin'],[T.take,'smirk'],[T.shades,'grin']])};
  o.ra=K(t,[[T.boom,PUSH_R],[T.boom+.7,PUSH_R],[T.boom+1.1,CROSS_R,eo]]); o.point=K(t,[[T.boom+.7,1],[T.boom+.9,0]]);
  o.bob=-Math.abs(Math.sin((t-G0)*Math.PI/BEAT/2))*3*(t<T.faint?1:0);
  if(t>=T.shades){const k=eo(P(t,T.shades,T.shades+.3));o.ra=LJ(CROSS_R,SHADE_R,k).map((p,i)=>i===2?[p[0],p[1]-6*Math.sin(P(t,T.shades+.3,T.shades+.62)*Math.PI)]:p);
    o.shades=eo(P(t,T.shades+.12,T.shades+.34));o.tilt=-4*Math.sin(P(t,T.shades+.1,T.shades+.62)*Math.PI/2)}
  return charAt(drip(o),MXP,MS,250,m)}

/* ---------- wide shot ---------- */
const camW=t=>t<T.boom?K(t,[[T.B0,[700,1080,1.28]],[T.C0,[690,1060,1.32],es],[T.E0,[560,1010,1.06]],[T.F0,[600,1030,1.14],es],[T.G0s,[720,1050,1.3]],[T.H0,[730,1030,1.4],es]])
  :K(t,[[T.boom,[560,1010,1.06]],[T.boom+.5,[540,980,1.0],eo],[T.take,[540,980,1.0]],[T.ctaA,[540,1000,1.0]]]);
function wide(t){
  HU=0;GU=0;
  const m=mood(t), c=camW(t), fl=t<T.boom?flame(t):0;
  let w=room(t,m)+payalEl(t,m)+monkEl(t,m)+kabirEl(t,m)+table(t,m);
  if(t<T.boom)w+=`<div class="abs" style="left:110px;top:700px;width:1140px;height:1140px;border-radius:50%;background:radial-gradient(circle,rgba(255,150,70,${f3(.2*fl)}) 0%,rgba(255,150,70,0) 62%);mix-blend-mode:screen"></div>`;
  const lights=t>=T.boom?1-eo(P(t,T.boom,T.boom+.26)):0;
  return `<div class="abs" style="left:0;top:0;width:1080px;height:1920px;transform-origin:0 0;transform:translate(540px,960px) scale(${c[2].toFixed(5)}) translate(${px(-c[0])},${px(-c[1])})">${w}</div>`+
    (lights>0?`<div class="abs" style="inset:0;background:#050304;opacity:${f3(lights*.7)}"></div>`:'')}

/* ---------- on-screen text ---------- */
const line=(t,txt,cls,top,size,r,extra='')=>{const [t0,t1]=r, k=P(t,t0,t0+.45), out=ei(P(t,t1,t1+.3)); if(k<=0||out>=1)return '';
  return `<div class="abs hl ${cls}" style="left:0;width:1080px;text-align:center;top:${px(top-out*24)};font-size:${size}px;opacity:${f3(eo(P(k,0,.6))*(1-out))};transform:translateY(${px((1-eo(k))*26)});${extra}">${txt}</div>`};
function spelled(t){
  let h='';
  const pn=typed(t,PAY,T.payal0,T.payStep,.42), cn=typed(t,CRE,T.cre0,T.creStep,.24);
  const show=(w,n,t1,orangeTail)=>{const out=ei(P(t,t1,t1+.3));if(n===0||out>=1)return '';
    const chars=w.slice(0,n).map((c,i)=>{const at=(w===PAY?T.payal0+i*T.payStep+.42:T.cre0+i*T.creStep+.24), k=P(t,at,at+.22);return `<span style="display:inline-block;opacity:${f3(eo(k))};transform:translateY(${px((1-eo(k))*-18)}) scale(${L(1.3,1,eo(k)).toFixed(3)})">${c}</span>`}).join('');
    return `<div class="abs hl" style="left:0;width:1080px;text-align:center;top:${px(300-out*20)};font-size:118px;letter-spacing:.22em;color:#F2E9DA;opacity:${f3(1-out)};text-shadow:0 0 30px rgba(255,170,90,.35),0 6px 30px rgba(0,0,0,.6)">${chars}${orangeTail||''}</div>`};
  h+=show(PAY,pn,T.G0s+.05);
  let tail='';
  if(t>=T.boom){const k=P(t,T.boom,T.boom+.5);tail=`<div style="font-size:110px;letter-spacing:.06em;color:#FF6A00;margin-top:10px;opacity:${f3(eo(k))};transform:scale(${L(.85,1,eb(k)).toFixed(3)})">CHAHIYE?</div>`}
  h+=show(CRE,cn,T.j1[0]-.25,tail);
  return h}
function ui(t){
  let h='';
  h+=line(t,'Raat ke 3 baje...','cream',300,112,T.t1);
  h+=line(t,'Koi zaroor aata hai.','cream',300,100,T.t2);
  h+=line(t,'Koi hai?','cream',300,124,T.t3);
  h+=line(t,'Glass khud chala.','cream',300,110,T.t4);
  h+=line(t,'Tum kaun ho?','cream',300,120,T.t5);
  h+=line(t,'Tumhe kya chahiye?','cream',300,104,T.t7);
  h+=spelled(t);
  h+=line(t,'Bhoot ko bhi','cream',290,104,T.j1)+line(t,'creator chahiye.','orange',402,104,[T.j1[0]+.35,T.j1[1]]);
  h+=line(t,'Brands ko','cream',290,104,T.j2)+line(t,'sahi creators.','orange',402,104,[T.j2[0]+.3,T.j2[1]]);
  h+=line(t,'Creators ko','cream',290,104,T.j3)+line(t,'sahi brands.','orange',402,104,[T.j3[0]+.3,T.j3[1]]);
  if(t>T.ctaA){const fade=(t0,d=.5)=>f3(eo(P(t,t0,t0+d))), rise=t0=>px((1-eo(P(t,t0,t0+.5)))*20);
    h+=`<div class="abs" style="left:540px;top:330px;opacity:${fade(T.ctaA)};transform:translate(-50%,${rise(T.ctaA)})"><div class="cta" style="font-size:44px;padding:20px 48px 24px">Brands: brief bhejo</div></div>`;
    if(t>T.ctaB)h+=`<div class="abs" style="left:540px;top:446px;opacity:${fade(T.ctaB)};transform:translate(-50%,${rise(T.ctaB)})"><div class="pill" style="font-size:34px;padding:13px 32px 15px;background:rgba(10,9,8,.5);border:2px solid #FAF7F2">Creators: free join karo</div></div>`;
    if(t>T.logo){const k=P(t,T.logo,T.logo+.8);h+=`<div class="abs" style="left:0;width:1080px;top:566px;text-align:center;opacity:${f3(es(k))};transform:scale(${L(.96,1,eo(k)).toFixed(4)});white-space:nowrap;line-height:1"><span style="font-weight:800;font-size:84px;letter-spacing:-.04em;color:#FAF7F2">Creator</span><span style="font-family:'Baloo 2';font-weight:800;font-size:90px;color:#FF6A00;position:relative;top:4px;margin-left:14px">चाहिए?</span></div>`}
    if(t>T.url)h+=`<div class="abs" style="left:0;width:1080px;top:688px;text-align:center;font-weight:400;font-size:35px;letter-spacing:.02em;color:#B9AFA6;opacity:${fade(T.url,.55)}">creatorchahiye.com</div>`}
  return h}

/* ---------- frame ---------- */
const isCU=t=>(t<T.B0)||(t>=T.C0&&t<T.E0)||(t>=T.F0&&t<T.G0s)||(t>=T.H0&&t<T.boom);
function render(t){
  t=C(t,0,T.END); const f=Math.round(t*60);
  const cu=isCU(t);
  let h=cu?board(t):wide(t);
  h+=`<div class="abs" style="left:0;top:0;width:1080px;height:${t>=T.boom?860:640}px;background:linear-gradient(180deg,rgba(4,3,3,${t>=T.boom?.62:.55}),rgba(4,3,3,0))"></div>`;
  stage.innerHTML=h+ui(t)+fx(f,t<T.boom);
}
window.render=render; window.DURATION=T.END; window.TL=T;
window.cues=()=>({T,BEAT,G0,END:T.END,VO,
  payalArr:PAY.map((_,i)=>+(T.payal0+i*T.payStep+.42).toFixed(3)),payalMove:PAY.map((_,i)=>+(T.payal0+i*T.payStep).toFixed(3)),
  creArr:CRE.map((_,i)=>+(T.cre0+i*T.creStep+.24).toFixed(3)),creMove:CRE.map((_,i)=>+(T.cre0+i*T.creStep).toFixed(3))});

/* ---------- thumbnail ---------- */
function renderThumb(){
  const t=T.hand1+.1;
  stage.innerHTML=board(t)+`<div class="abs" style="left:0;top:0;width:1080px;height:720px;background:linear-gradient(180deg,rgba(4,3,3,.8),rgba(4,3,3,0))"></div>
   <div class="abs hl cream" style="left:0;width:1080px;text-align:center;top:300px;font-size:116px">Raat 3 baje.</div>
   <div class="abs hl" style="left:0;width:1080px;text-align:center;top:420px;font-size:104px;color:#FF6A00">Planchette.</div>`+fx(5,true)}
window.renderThumb=renderThumb;
render(0);
