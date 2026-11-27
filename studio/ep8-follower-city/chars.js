/* Ep. 5 additions (all opt-in; default output is identical to the Ep. 4 kit file):
   - drip({chest}) : SVG string drawn between torso and arms (folder tucked under crossed arms)
   - human({walk:{phase,amp}}) : leg walk cycle, same maths as the monk's legsAt
   - human({arms:'custom',la,ra,lhand,rprop:'phone'|'gimbal'|null,gs,gflip}) : free arm joints with the kit's own limb/hand/phone/gimbal drawing
   Ep. 8 additions (opt-in): drip({fit:'street'}) bomber jacket, chest patch, crossbody bag; hair:'quiff'|'curly'|'side'|'bun'|'pony'|'long'|'fade', human({shades:1}) sunglasses, human({chain:1}) gold chain, human({badge:false}) blazer without the FOUNDER lanyard */
/* CreatorChahiye character library (used in Ep. 4). Load in an HTML page; every function returns an SVG string.
   Coordinate space for every character: viewBox 0 0 520 900, feet at y≈880. Scale by setting the wrapper div width.
   Fonts expected: Outfit and Baloo 2 (Google Fonts). */
const C=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)), P=(t,a,b)=>C((t-a)/(b-a));
const eo=x=>1-Math.pow(1-x,3), eio=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2, ei=x=>x*x*x;
const ex=x=>x>=1?1:1-Math.pow(2,-10*x);
const eb=x=>{const c1=1.6,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const L=(a,b,k)=>a+(b-a)*k, LJ=(A,B,k)=>A.map((p,i)=>[L(p[0],B[i][0],k),L(p[1],B[i][1],k)]);
const blink=(t,ts)=>{for(const b of ts){const p=P(t,b,b+.14);if(p>0&&p<1)return Math.sin(p*Math.PI)}return 0};
const limb=(j,w,c)=>`<path d="M${j[0][0]} ${j[0][1]} Q${j[1][0]} ${j[1][1]} ${j[2][0]} ${j[2][1]}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;

/* ===== DRIP MONK (mascot) =====
   drip({phase,amp,ra,la,point,shades,mouth:'smirk'|'grin',tilt,bob,tw})
   Walk: phase=t*2π*1.05, amp 0..1. Moonwalk: negative phase while moving left.
   Arms: CROSS_R/CROSS_L (arms crossed), WIND_R -> PUSH_R + point:1 (one-finger tap), SHADE_R + shades:1 (adjust sunglasses). */
const CROSS_L=[[186,404],[168,500],[332,478]], CROSS_R=[[316,404],[334,492],[176,470]];
const PUSH_R=[[316,404],[398,428],[468,408]], WIND_R=[[316,404],[350,470],[300,450]], SHADE_R=[[316,404],[372,330],[338,236]];
function legsAt(phase,amp){const s=Math.sin(phase),c=Math.cos(phase);
  const lf=[210+30*s*amp,858-18*Math.max(0,c)*amp], rf=[294-30*s*amp,858-18*Math.max(0,-c)*amp];
  return {ll:[[218,750],[(218+lf[0])/2+6,(750+lf[1])/2],lf], rl:[[284,750],[(284+rf[0])/2+6,(750+rf[1])/2],rf]}}
function monkHead(o){
  const mouth=o.mouth==='grin'?`<path d="M266 326 Q300 360 336 322 Q300 342 266 326Z" fill="#3A2416"/>`
   :`<path d="M268 330 Q302 348 334 322" stroke="#3A2416" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M334 322 L340 316" stroke="#3A2416" stroke-width="5" stroke-linecap="round"/>`;
  return `<g transform="rotate(${o.tilt||0} 250 300)">
   <circle cx="116" cy="262" r="54" fill="url(#mfur)"/><circle cx="116" cy="262" r="33" fill="#F0D6BE"/>
   <path d="M126 248 A16 16 0 1 0 128 276" stroke="#B88C6A" stroke-width="7" fill="none" stroke-linecap="round"/>
   <circle cx="250" cy="242" r="136" fill="url(#mfur)"/>
   <path d="M372 190 A136 136 0 0 1 360 330" stroke="#FFB27A" stroke-width="6" fill="none" opacity=".7" stroke-linecap="round"/>
   <circle cx="248" cy="98" r="38" fill="url(#mfur)"/>
   <path d="M214 118 Q248 132 282 118" stroke="#FF6A00" stroke-width="12" fill="none" stroke-linecap="round"/>
   <path d="M236 68 C 238 40, 266 26, 292 36 C 270 40, 258 52, 258 70Z" fill="url(#mfur)"/>
   <path d="M230 84 Q240 72 256 70" stroke="#D9C2AC" stroke-width="4" fill="none" stroke-linecap="round"/>
   <path d="M190 262 C 186 190, 250 170, 286 196 C 322 170, 380 196, 374 262 C 380 340, 330 384, 284 384 C 230 384, 192 340, 190 262Z" fill="url(#mface)"/>
   <ellipse cx="298" cy="318" rx="64" ry="44" fill="#FFE6D0"/>
   <ellipse cx="290" cy="298" rx="5" ry="3.5" fill="#6B4228"/><ellipse cx="308" cy="298" rx="5" ry="3.5" fill="#6B4228"/>
   ${mouth}
   <path d="M152 236 L198 230" stroke="#120C0A" stroke-width="7" stroke-linecap="round"/>
   <path d="M200 214 Q200 206 210 206 L262 206 Q270 206 268 216 L262 250 Q258 266 240 266 L222 266 Q206 266 203 250 Z" fill="url(#mgl)"/>
   <path d="M280 206 L344 206 Q354 206 352 216 L346 250 Q342 266 324 266 L300 266 Q284 266 281 250 L278 216 Q278 206 280 206Z" fill="url(#mgl)"/>
   <path d="M266 214 Q273 208 280 214" stroke="#0A0908" stroke-width="9" fill="none"/>
   <path d="M198 208 L354 206" stroke="#0A0908" stroke-width="10" stroke-linecap="round"/>
   <path d="M214 222 L236 244 M294 222 L314 242" stroke="#fff" stroke-width="6" opacity=".35" stroke-linecap="round"/></g>`}
function drip(o){
  const fur='url(#mfur)';
  const defs=`<defs><linearGradient id="mfur" gradientUnits="userSpaceOnUse" x1="140" y1="60" x2="400" y2="430"><stop offset="0" stop-color="#FFFDF8"/><stop offset="1" stop-color="#E2CBB4"/></linearGradient>
   <linearGradient id="mface" gradientUnits="userSpaceOnUse" x1="200" y1="190" x2="370" y2="380"><stop offset="0" stop-color="#FFF4EA"/><stop offset="1" stop-color="#F3D2B6"/></linearGradient>
   <linearGradient id="mgl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A2E2A"/><stop offset="1" stop-color="#050404"/></linearGradient>
   <linearGradient id="mrb" gradientUnits="userSpaceOnUse" x1="140" y1="380" x2="380" y2="780"><stop offset="0" stop-color="#FF9142"/><stop offset="1" stop-color="#D24C00"/></linearGradient>
   <linearGradient id="mhd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4A3F38"/><stop offset=".6" stop-color="#1E1916"/><stop offset="1" stop-color="#0F0C0B"/></linearGradient>
   <filter id="mbl"><feGaussianBlur stdDeviation="12"/></filter></defs>`;
  const lg=o.ll?{ll:o.ll,rl:o.rl}:legsAt(o.phase||0,o.amp||0);
  const shoe=(p)=>`<g transform="translate(${p[0]} ${p[1]})"><rect x="-42" y="-18" width="94" height="44" rx="20" fill="#FAF7F2"/><rect x="-42" y="16" width="94" height="14" rx="7" fill="#FF6A00"/><path d="M-16 -6 L22 -6" stroke="#C9B9A8" stroke-width="4" stroke-linecap="round"/></g>`;
  const legs=limb(lg.ll,44,'#3A312C')+limb(lg.rl,44,'#453B35')+`<path d="M${lg.rl[0][0]+18} ${lg.rl[0][1]} Q${lg.rl[1][0]+20} ${lg.rl[1][1]} ${lg.rl[2][0]+18} ${lg.rl[2][1]-14}" stroke="#FF9142" stroke-width="4" fill="none" opacity=".55"/>`+shoe(lg.ll[2])+shoe(lg.rl[2]);
  const street=`<path d="M200 386 Q250 420 300 386" stroke="#1A1614" stroke-width="30" fill="none"/>
   <path d="M170 382 Q250 360 330 382 Q356 396 354 440 L350 760 Q250 786 150 760 L146 440 Q144 396 170 382Z" fill="url(#mhd)"/>
   <rect x="150" y="742" width="200" height="34" rx="10" fill="#151210"/><path d="M154 752 H346 M154 764 H346" stroke="#FF6A00" stroke-width="3" opacity=".8"/>
   <path d="M250 410 V744" stroke="#0E0C0B" stroke-width="9"/><path d="M250 410 V744" stroke="#FF6A00" stroke-width="4"/><rect x="244" y="448" width="12" height="22" rx="4" fill="#FF9142"/>
   <path d="M330 384 Q356 398 354 440 L350 756" stroke="#FF9142" stroke-width="5" fill="none" opacity=".6"/>
   <path d="M186 404 L338 676" stroke="#0E0C0B" stroke-width="26" stroke-linecap="round"/><path d="M186 404 L338 676" stroke="url(#mrb)" stroke-width="18" stroke-linecap="round"/>
   <g transform="rotate(-8 316 690)"><rect x="276" y="654" width="84" height="64" rx="16" fill="url(#mrb)"/><rect x="276" y="654" width="84" height="22" rx="10" fill="#A93A00"/><circle cx="318" cy="700" r="6" fill="#FAF7F2"/></g>
   <circle cx="200" cy="586" r="24" fill="#FF6A00"/><text x="200" y="597" text-anchor="middle" font-family="Outfit" font-weight="800" font-size="30" fill="#FAF7F2">C</text>
   <path d="M192 396 Q250 440 308 396" stroke="#1A1614" stroke-width="14" fill="none"/><path d="M194 400 Q250 442 306 400" stroke="#FF6A00" stroke-width="3.5" fill="none"/><ellipse cx="188" cy="400" rx="26" ry="32" fill="#1A1614"/><ellipse cx="312" cy="400" rx="26" ry="32" fill="#1A1614"/><ellipse cx="188" cy="400" rx="14" ry="18" fill="none" stroke="#FF6A00" stroke-width="4"/><ellipse cx="312" cy="400" rx="14" ry="18" fill="none" stroke="#FF6A00" stroke-width="4"/>`;
  const torso=o.fit==='street'?street:`<path d="M200 386 Q250 420 300 386" stroke="#1A1614" stroke-width="30" fill="none"/>
   <path d="M170 382 Q250 360 330 382 Q356 396 354 440 L350 770 Q250 796 150 770 L146 440 Q144 396 170 382Z" fill="url(#mhd)"/>
   <path d="M196 600 Q250 584 304 600 L300 676 Q250 690 200 676Z" fill="#14110F" opacity=".7"/>
   <path d="M330 384 Q356 398 354 440 L350 764" stroke="#FF9142" stroke-width="5" fill="none" opacity=".7"/>
   <path d="M168 386 Q200 374 232 382 L348 690 Q334 712 304 704 L178 432Z" fill="url(#mrb)"/>
   <path d="M200 400 L318 690" stroke="#A93A00" stroke-width="4" opacity=".6"/>
   <path d="M192 396 Q250 440 308 396" stroke="#1A1614" stroke-width="14" fill="none"/><ellipse cx="188" cy="400" rx="26" ry="32" fill="#1A1614"/><ellipse cx="312" cy="400" rx="26" ry="32" fill="#1A1614"/><ellipse cx="188" cy="400" rx="14" ry="18" fill="none" stroke="#FF6A00" stroke-width="4"/><ellipse cx="312" cy="400" rx="14" ry="18" fill="none" stroke="#FF6A00" stroke-width="4"/>`;
  const H=(p)=>`<circle cx="${p[0]}" cy="${p[1]}" r="23" fill="${fur}"/>`+(o.fit==='street'?`<circle cx="${p[0]}" cy="${p[1]}" r="27" fill="none" stroke="#FF6A00" stroke-width="5" stroke-dasharray="20 200" stroke-dashoffset="-60"/>`:'');
  const ra=o.ra||CROSS_R, la=o.la||CROSS_L, pt=o.point||0, sh=o.shades||0;
  const armR=limb(ra,46,'#2E2622')+H(ra[2])+(pt>0?`<rect x="${ra[2][0]+8}" y="${ra[2][1]-8}" width="${40*pt}" height="16" rx="8" fill="${fur}"/>`:'')+(sh>0?`<rect x="${ra[2][0]-7}" y="${ra[2][1]-34*sh}" width="15" height="${34*sh}" rx="7.5" fill="${fur}"/>`:'');
  const armL=limb(la,46,'#2A2320')+H(la[2]);
  const tw=o.tw||0;
  const tail=`<path d="M186 ${620+Math.sin(tw)*6} C 96 660, 66 ${540+Math.sin(tw)*14}, 118 518 C 150 506, 166 548, 138 554" stroke="${fur}" stroke-width="20" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 520 900" width="100%" style="overflow:visible">${defs}
   <ellipse cx="255" cy="884" rx="150" ry="20" fill="#000" opacity=".55" filter="url(#mbl)"/>
   <g transform="translate(0 ${o.bob||0})">${tail}${legs}${torso}${o.chest||''}${sh>0?armL:armR+armL}${monkHead(o)}${sh>0?armR:''}</g></svg>`}

/* ===== HUMANS =====
   FD({...}) = The Founder, CR({...}) = The Creator. Options:
   lid 0..1 (eyelids, 1 = closed), look:[dx,dy], brow:'up'|'worry'|'skep', mouth:'smirk'|'smile'|'grin'|'flat'|'o'|'frown'|'yawn',
   tilt, headDy, squash 0..1, bob, sway, phoneGlow 0..1.5,
   arms: Founder 'founder' (box + phone) | 'bump' (fist-bump, bumpK 0..1) | 'idle' | 'read';
         Creator 'creator' (gimbal, gimbal 0..1, rec) | 'bumpL' (bumpK) | 'idle' | 'read'; ringGlow 0..1 for the creator's ring light. */
let HU=0;
function hface(o,skinId){
  const ink='#1A0E08';const[lx,ly]=o.look||[0,0];const lid=Math.min(1,o.lid||0);let s='';
  for(const sx of[-1,1]){const x=260+sx*46+lx,y=262+ly;
    s+=`<ellipse cx="${x}" cy="${y}" rx="13" ry="17" fill="${ink}"/><circle cx="${x+4}" cy="${y-6}" r="4.5" fill="#fff" opacity=".9"/>`;
    if(lid>0){const h=34*lid;s+=`<rect x="${x-18}" y="${y-20}" width="36" height="${h+3}" fill="url(#${skinId})"/><path d="M${x-16} ${y-18+h} Q${x} ${y-14+h} ${x+16} ${y-18+h}" stroke="${ink}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`}
    const b=o.brow; const lift=b==='up'?-10:0; const inner=b==='worry'?-9:0; const sk=b==='skep'&&sx>0?-9:0;
    const yo=y-34+lift+sk, yi=y-34+lift+sk+inner;
    s+= sx<0?`<path d="M${x-18} ${yo} Q${x} ${y-42+lift+sk} ${x+18} ${yi}" stroke="#1A1210" stroke-width="7" fill="none" stroke-linecap="round"/>`
             :`<path d="M${x-18} ${yi} Q${x} ${y-42+lift+sk} ${x+18} ${yo}" stroke="#1A1210" stroke-width="7" fill="none" stroke-linecap="round"/>`}
  s+=`<path d="M256 284 Q252 302 262 304" stroke="#7A4528" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`;
  const m=o.mouth||'smirk';
  s+= m==='smile'?`<path d="M238 326 Q260 344 282 326" stroke="${ink}" stroke-width="6" fill="none" stroke-linecap="round"/>`
     :m==='grin'?`<path d="M234 320 Q260 356 288 320 Q260 334 234 320Z" fill="${ink}"/><path d="M246 336 Q260 346 274 336" stroke="#E8836A" stroke-width="5" fill="none" stroke-linecap="round"/>`
     :m==='flat'?`<path d="M244 330 L276 330" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>`
     :m==='o'?`<ellipse cx="260" cy="330" rx="9" ry="12" fill="${ink}"/>`
     :m==='frown'?`<path d="M244 334 Q260 324 276 334" stroke="${ink}" stroke-width="6" fill="none" stroke-linecap="round"/>`
     :m==='yawn'?`<ellipse cx="260" cy="330" rx="14" ry="20" fill="${ink}"/>`
     :`<path d="M240 330 Q264 340 284 322" stroke="${ink}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  return s}
function human(o){
  const i='h'+(HU++);const sk=o.skin;const hand=(p)=>`<circle cx="${p[0]}" cy="${p[1]}" r="22" fill="url(#sk${i})"/>`;
  const defs=`<defs><linearGradient id="sk${i}" gradientUnits="userSpaceOnUse" x1="140" y1="80" x2="390" y2="380"><stop offset="0" stop-color="${sk[0]}"/><stop offset="1" stop-color="${sk[1]}"/></linearGradient>
   <linearGradient id="hr${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A2A22"/><stop offset="1" stop-color="#120C09"/></linearGradient>
   <linearGradient id="bz${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4A403A"/><stop offset=".6" stop-color="#221D1A"/><stop offset="1" stop-color="#121010"/></linearGradient>
   <linearGradient id="hd${i}" gradientUnits="userSpaceOnUse" x1="120" y1="380" x2="400" y2="720"><stop offset="0" stop-color="${o.hoodie?o.hoodie[0]:'#000'}"/><stop offset="1" stop-color="${o.hoodie?o.hoodie[1]:'#000'}"/></linearGradient>
   <linearGradient id="bx${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFA15A"/><stop offset="1" stop-color="#D64E00"/></linearGradient>
   <radialGradient id="rg${i}"><stop offset=".86" stop-color="#FFE7CF" stop-opacity="0"/><stop offset=".93" stop-color="#FFE7CF" stop-opacity=".35"/><stop offset="1" stop-color="#FFE7CF" stop-opacity="0"/></radialGradient>
   <filter id="bl${i}"><feGaussianBlur stdDeviation="12"/></filter></defs>`;
  let back='',torso='',arms='',legs='',hairBack='',hairFront='',hat='',acc='',props='';
  if(o.ring){const g=o.ringGlow==null?1:o.ringGlow;back+=`<circle cx="260" cy="250" r="232" fill="url(#rg${i})" opacity="${g}"/><circle cx="260" cy="250" r="206" fill="none" stroke="#FFF4E6" stroke-width="14" opacity="${.25+.75*g}"/><circle cx="260" cy="250" r="206" fill="none" stroke="#fff" stroke-width="3" opacity="${g}"/>`}
  const pc=o.pants||'#2B2724';
  const wk=o.walk||{phase:0,amp:0}, ws=Math.sin(wk.phase)*wk.amp, wc=Math.cos(wk.phase)*wk.amp;
  const lfx=220+26*ws, lfy=852-16*Math.max(0,wc), rfx=300-26*ws, rfy=852-16*Math.max(0,-wc);
  legs+=limb([[226,690],[(226+lfx)/2-1,(690+lfy)/2+19],[lfx,lfy]],52,pc)+limb([[294,690],[(294+rfx)/2+1,(690+rfy)/2+19],[rfx,rfy]],52,pc)+`<path d="M318 700 Q${322+(rfx-300)/2} 790 ${322+(rfx-300)} ${846+(rfy-852)}" stroke="#FF9142" stroke-width="4" fill="none" opacity=".45"/>`;
  const shoe=(x,dy=0)=>o.shoe==='loafer'?`<g transform="translate(${x} ${860+dy})"><path d="M-36 -10 Q-36 -22 -20 -22 L24 -22 Q50 -20 52 2 L52 12 L-36 12Z" fill="#4A2E1E"/><rect x="-36" y="8" width="88" height="8" rx="4" fill="#2A1A10"/></g>`
      :`<g transform="translate(${x} ${858+dy})"><rect x="-42" y="-18" width="94" height="44" rx="20" fill="#FAF7F2"/><rect x="-42" y="16" width="94" height="14" rx="7" fill="#FF6A00"/><path d="M-16 -6 L22 -6" stroke="#C9B9A8" stroke-width="4" stroke-linecap="round"/></g>`;
  legs+=shoe(lfx-6,lfy-852)+shoe(rfx+4,rfy-852);
  torso+=`<rect x="236" y="330" width="48" height="60" rx="20" fill="${sk[1]}"/>`;
  const sw=o.sway||0;
  if(o.outfit==='blazer'){
    torso+=`<path d="M150 386 Q260 362 370 386 Q396 400 392 452 L382 694 Q260 716 138 694 L128 452 Q124 400 150 386Z" fill="url(#bz${i})"/>
     <path d="M222 380 L260 476 L298 380Z" fill="#F3EADF"/>
     <path d="M206 384 L260 500 L236 384Z" fill="#332C28"/><path d="M314 384 L260 500 L284 384Z" fill="#2A2421"/>
     <path d="M370 388 Q394 402 392 452 L382 690" stroke="#FF9142" stroke-width="5" fill="none" opacity=".55"/>
     <circle cx="262" cy="560" r="7" fill="#0E0C0B"/><circle cx="262" cy="610" r="7" fill="#0E0C0B"/>`;
    if(o.badge!==false)acc+=`<g transform="rotate(${sw} 262 384)"><path d="M232 384 L262 520 L290 384" stroke="#FF6A00" stroke-width="9" fill="none" stroke-linejoin="round"/><g transform="rotate(-4 262 560)"><rect x="232" y="516" width="62" height="84" rx="10" fill="#FAF7F2"/><rect x="232" y="516" width="62" height="20" rx="8" fill="#FF6A00"/><text x="263" y="572" text-anchor="middle" font-family="Outfit" font-weight="800" font-size="12" fill="#0A0908">FOUNDER</text><rect x="246" y="580" width="34" height="5" rx="2.5" fill="#C9B9A8"/></g></g>`;
  } else {
    torso+=`<ellipse cx="260" cy="392" rx="96" ry="40" fill="${o.hoodie[1]}"/>
     <path d="M140 390 Q260 358 380 390 Q410 406 406 462 L394 702 Q260 726 126 702 L114 462 Q110 406 140 390Z" fill="url(#hd${i})"/>
     <path d="M196 600 Q260 584 324 600 L318 680 Q260 694 202 680Z" fill="#000" opacity=".12"/>
     <path d="M380 392 Q408 408 404 462 L392 698" stroke="#FFD2AE" stroke-width="5" fill="none" opacity=".5"/>
     <path d="M240 396 Q${238+sw} 444 ${236+sw*2} 490 M282 396 Q${284+sw} 444 ${286+sw*2} 490" stroke="${o.string||'#FF6A00'}" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="${236+sw*2}" cy="494" r="6" fill="${o.string||'#FF6A00'}"/><circle cx="${286+sw*2}" cy="494" r="6" fill="${o.string||'#FF6A00'}"/>`;
    if(o.chain)acc+=`<path d="M204 396 Q262 478 318 396" stroke="#E8B84A" stroke-width="8" fill="none"/><path d="M204 396 Q262 478 318 396" stroke="#FFF1B8" stroke-width="2.5" fill="none" opacity=".7" stroke-dasharray="6 8"/><circle cx="262" cy="440" r="14" fill="#E8B84A" stroke="#B8862A" stroke-width="3"/><text x="262" y="446" text-anchor="middle" font-family="Outfit" font-weight="800" font-size="15" fill="#5A3A08">R</text>`;
    acc+=`<path d="M196 384 Q260 430 324 384" stroke="#141110" stroke-width="15" fill="none"/><ellipse cx="192" cy="388" rx="27" ry="33" fill="#141110"/><ellipse cx="328" cy="388" rx="27" ry="33" fill="#141110"/><ellipse cx="192" cy="388" rx="14" ry="18" fill="none" stroke="#FF6A00" stroke-width="4"/><ellipse cx="328" cy="388" rx="14" ry="18" fill="none" stroke="#FF6A00" stroke-width="4"/>`;
  }
  const sl=o.outfit==='blazer'?'#2E2724':o.hoodie[1];
  const box=()=>`<g transform="rotate(-6 120 600)"><rect x="66" y="548" width="120" height="104" rx="10" fill="url(#bx${i})"/><path d="M66 572 L186 572" stroke="#B84300" stroke-width="4"/><rect x="92" y="592" width="68" height="34" rx="6" fill="#FAF7F2"/><path d="M104 604 L148 604 M104 614 L136 614" stroke="#C9B9A8" stroke-width="4" stroke-linecap="round"/><path d="M186 552 L198 546 L198 646 L186 652Z" fill="#9A3A00"/></g>`;
  const phoneR=(x,y,r=-14,g=0)=>`<g transform="rotate(${r} ${x} ${y})"><rect x="${x-26}" y="${y-50}" width="52" height="94" rx="12" fill="#14110F" stroke="#5A4D45" stroke-width="3"/><rect x="${x-20}" y="${y-40}" width="40" height="70" rx="7" fill="#FFB27A" opacity="${.55+.45*Math.min(1,g)}"/></g>`;
  const a=o.arms||'idle';const pg=o.phoneGlow||0;
  if(a==='founder'){props+=box();arms+=limb([[152,404],[118,512],[176,600]],46,sl)+hand([176,600])+limb([[368,404],[408,500],[330,512]],46,sl)+phoneR(318,470,-14,pg)+hand([330,512])}
  else if(a==='bump'){props+=box();arms+=limb([[152,404],[118,512],[176,600]],46,sl)+hand([176,600]);const k=o.bumpK||0;arms+=limb([[368,404],[L(408,440,k),L(500,470,k)],[L(330,505,k),L(512,470,k)]],46,sl)+hand([L(330,505,k),L(512,470,k)])}
  else if(a==='idle'){arms+=limb([[150,404],[128,520],[146,620]],46,sl)+hand([146,620])+limb([[370,404],[392,520],[374,620]],46,sl)+phoneR(372,600,8,pg)+hand([374,620])}
  else if(a==='read'){arms+=limb([[148,404],[132,520],[196,604]],46,sl)+limb([[372,404],[400,500],[312,500]],46,sl)+phoneR(300,456,-10,pg)+hand([312,500])}
  else if(a==='bumpL'){const k=o.bumpK||0;arms+=limb([[148,404],[L(132,90,k),L(520,480,k)],[L(196,18,k),L(604,500,k)]],46,sl)+hand([L(196,18,k),L(604,500,k)]);arms+=limb([[372,404],[446,430],[470,352]],46,sl)+`<rect x="462" y="210" width="16" height="150" rx="8" fill="#2A2523"/><circle cx="470" cy="214" r="13" fill="#3A322D"/><g transform="rotate(4 470 160)"><rect x="440" y="108" width="62" height="108" rx="12" fill="#14110F" stroke="#5A4D45" stroke-width="3"/><circle cx="458" cy="124" r="5" fill="#FF3D3D"/></g>`+hand([470,352])}
  else if(a==='creator'){const k=o.gimbal==null?1:o.gimbal;const exx=L(400,446,k),ey=L(500,430,k),hx=L(330,470,k),hy=L(520,352,k);
    arms+=limb([[148,404],[132,520],[196,604]],46,sl)+`<path d="M190 588 Q214 576 236 590" stroke="#000" stroke-opacity=".2" stroke-width="6" fill="none"/>`;
    arms+=limb([[372,404],[exx,ey],[hx,hy]],46,sl)+`<rect x="${hx-8}" y="${hy-142}" width="16" height="150" rx="8" fill="#2A2523"/><circle cx="${hx}" cy="${hy-138}" r="13" fill="#3A322D"/><g transform="rotate(4 ${hx} ${hy-192})"><rect x="${hx-30}" y="${hy-244}" width="62" height="108" rx="12" fill="#14110F" stroke="#5A4D45" stroke-width="3"/><circle cx="${hx-12}" cy="${hy-228}" r="5" fill="${o.rec===false?'#5A4D45':'#FF3D3D'}"/></g>`+hand([hx,hy])}
  else if(a==='custom'){const la=o.la,ra=o.ra,s=o.gs||0,f=o.gflip||0;
    arms+=limb(la,46,sl)+(o.lhand===false?`<path d="M190 588 Q214 576 236 590" stroke="#000" stroke-opacity=".2" stroke-width="6" fill="none"/>`:hand(la[2]));
    arms+=limb(ra,46,sl);const hx=ra[2][0],hy=ra[2][1];
    if(o.rprop==='phone')arms+=phoneR(hx-2,hy-20,8,pg);
    else if(o.rprop==='gimbal'){const pw=L(52,62,s),ph=L(94,108,s),cy=hy-L(20,190,s),cx=hx+L(-2,1,s),rot=L(8,4,s),sx=Math.max(.05,Math.abs(1-2*f));
      if(s>.01){const top=cy+ph/2-8;arms+=`<rect x="${hx-8}" y="${top}" width="16" height="${hy+8-top}" rx="8" fill="#2A2523"/><circle cx="${hx}" cy="${top+4}" r="${13*Math.min(1,s*2.5)}" fill="#3A322D"/>`}
      arms+=`<g transform="translate(${cx} ${cy}) rotate(${rot}) scale(${sx} 1)"><rect x="${-pw/2}" y="${-ph/2}" width="${pw}" height="${ph}" rx="12" fill="#14110F" stroke="#5A4D45" stroke-width="3"/>${f<.5?`<rect x="${-pw/2+6}" y="${-ph/2+10}" width="${pw-12}" height="${ph-24}" rx="7" fill="#FFB27A" opacity="${.55+.45*Math.min(1,pg)}"/>`:`<circle cx="${-pw/2+18}" cy="${-ph/2+16}" r="5" fill="${o.rec===false?'#5A4D45':'#FF3D3D'}"/>`}</g>`}
    arms+=hand(ra[2])}
  if(o.hair==='bob')hairBack=`<path d="M118 240 C108 110,200 56,262 58 C330 56,416 108,404 240 L408 352 Q388 376 352 360 L346 270 L176 270 L170 360 Q134 376 114 352 Z" fill="url(#hr${i})"/>`;
  const head=`<ellipse cx="134" cy="262" rx="22" ry="28" fill="${sk[1]}"/><ellipse cx="386" cy="262" rx="22" ry="28" fill="${sk[1]}"/>
    <ellipse cx="260" cy="230" rx="128" ry="142" fill="url(#sk${i})"/>
    <path d="M372 150 A128 142 0 0 1 372 316" stroke="#FFB27A" stroke-width="6" fill="none" opacity=".55" stroke-linecap="round"/>
    <ellipse cx="200" cy="300" rx="22" ry="12" fill="#E07A5A" opacity=".16"/><ellipse cx="320" cy="300" rx="22" ry="12" fill="#E07A5A" opacity=".16"/>`;
  if(o.hair==='bob')hairFront=`<path d="M132 232 C128 118,212 66,282 72 C352 78,398 130,390 232 C368 168,312 144,262 154 C214 162,164 196,132 232Z" fill="url(#hr${i})"/><path d="M250 80 Q236 120 238 156" stroke="#6A5244" stroke-width="4" fill="none" opacity=".6"/>`;
  const CAP='M134 214 C128 114 200 72 264 72 C332 74 394 120 388 214 C378 172 340 150 296 146 L222 146 C180 152 146 178 134 214Z';
  if(o.hair==='fade')hairFront=`<path d="M128 228 C120 108 196 60 264 60 C336 60 402 110 392 228 L378 226 C374 190 360 170 336 164 C306 172 282 158 256 168 C226 160 196 170 172 168 C150 180 140 200 142 226Z" fill="url(#hr${i})"/>${[170,200,232,264,296,326,352].map((x,k)=>`<path d="M${x} ${150+(k%2)*6} q8 -18 18 -22" stroke="#4E3A2E" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`).join('')}`;
  if(o.hair==='quiff')hairFront=`<path d="${CAP}" fill="url(#hr${i})"/><path d="M176 150 C170 66 250 28 318 46 C368 60 392 102 380 150 C356 110 318 96 284 100 C246 92 206 112 176 150Z" fill="url(#hr${i})"/><path d="M214 110 C250 64 310 58 350 84" stroke="#7A5A44" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>`;
  if(o.hair==='curly'){let c='';for(let k=0;k<11;k++){const a=(200+k*14)*Math.PI/180;c+=`<circle cx="${(260+124*Math.cos(a)).toFixed(1)}" cy="${(205+118*Math.sin(a)).toFixed(1)}" r="${30+(k%3)*4}" fill="url(#hr${i})"/>`}
    hairFront=`<path d="${CAP}" fill="url(#hr${i})"/>`+c+[[220,98],[290,96],[256,82]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="30" fill="url(#hr${i})"/>`).join('')}
  if(o.hair==='side')hairFront=`<path d="M134 216 C126 112 206 68 274 72 C346 76 398 128 388 216 C376 168 330 126 230 150 C190 160 152 184 134 216Z" fill="url(#hr${i})"/><path d="M210 82 C214 110 220 130 230 150" stroke="#6A5244" stroke-width="4" fill="none" opacity=".7"/>`;
  if(o.hair==='bun')hairFront=`<circle cx="262" cy="62" r="44" fill="url(#hr${i})"/><path d="${CAP}" fill="url(#hr${i})"/><path d="M232 70 Q262 52 292 70" stroke="#6A5244" stroke-width="4" fill="none" opacity=".6"/>`;
  if(o.hair==='pony'){hairBack=`<path d="M352 150 C420 170 436 260 414 360 C404 402 380 412 372 386 C392 320 386 240 340 196Z" fill="url(#hr${i})"/>`;hairFront=`<path d="${CAP}" fill="url(#hr${i})"/><circle cx="364" cy="160" r="14" fill="#FF6A00"/>`}
  if(o.hair==='long'){hairBack=`<path d="M120 240 C110 110 200 58 262 58 C330 58 414 110 404 240 L414 420 Q380 452 344 420 L346 270 L176 270 L176 420 Q140 452 108 420 Z" fill="url(#hr${i})"/>`;hairFront=`<path d="M132 232 C128 118 212 66 282 72 C352 78 398 130 390 232 C368 168 312 144 262 154 C214 162 164 196 132 232Z" fill="url(#hr${i})"/>`}
  if(o.hair==='messy')hairFront=`<path d="M150 190 L176 226 L192 186 L214 222 L236 184 L258 220 L282 184 L302 220 L326 186 L344 222 L370 190 L370 150 L150 150Z" fill="url(#hr${i})"/>`;
  if(o.hat==='bucket')hat=`<path d="M168 150 Q172 70 260 66 Q348 70 352 150Z" fill="${o.hatC[0]}"/><path d="M168 138 L352 138 L352 154 L168 154Z" fill="${o.hatC[2]}"/><ellipse cx="260" cy="156" rx="170" ry="34" fill="${o.hatC[1]}"/><path d="M110 164 Q260 196 410 164" stroke="#000" stroke-opacity=".18" stroke-width="5" fill="none"/>`;
  const gx=(o.look?o.look[0]:0);
  const glasses=o.glasses?`<circle cx="${214+gx}" cy="262" r="30" fill="none" stroke="#D9A441" stroke-width="4"/><circle cx="${306+gx}" cy="262" r="30" fill="none" stroke="#D9A441" stroke-width="4"/><path d="M${244+gx} 258 Q260 248 ${276+gx} 258" stroke="#D9A441" stroke-width="4" fill="none"/><path d="M184 258 L140 250 M336 258 L380 250" stroke="#D9A441" stroke-width="3.5"/>`:'';
  const shades=o.shades?`<path d="M168 238 Q172 226 186 226 L238 226 Q250 226 250 238 L246 270 Q242 290 220 290 L196 290 Q174 290 170 270Z" fill="#0E0C0B"/><path d="M270 238 Q270 226 282 226 L334 226 Q348 226 352 238 L350 270 Q346 290 324 290 L300 290 Q278 290 274 270Z" fill="#0E0C0B"/><path d="M248 236 Q260 228 272 236" stroke="#0E0C0B" stroke-width="7" fill="none"/><path d="M168 234 L136 228 M352 234 L384 228" stroke="#0E0C0B" stroke-width="6"/><path d="M186 240 L214 270 M290 240 L316 268" stroke="#fff" stroke-width="6" opacity=".3" stroke-linecap="round"/><path d="M168 232 Q210 220 250 232" stroke="#E8B84A" stroke-width="3" fill="none" opacity=".8"/><path d="M270 232 Q312 220 352 232" stroke="#E8B84A" stroke-width="3" fill="none" opacity=".8"/>`:'';
  const headG=`<g transform="rotate(${o.tilt||0} 260 360) translate(0 ${o.headDy||0})">${hairBack}${head}${hface(o,'sk'+i)}${glasses}${shades}${hairFront}${hat}</g>`;
  const sq=o.squash||0;
  return `<svg viewBox="0 0 520 900" width="100%" style="overflow:visible">${defs}<ellipse cx="262" cy="884" rx="160" ry="20" fill="#000" opacity=".55" filter="url(#bl${i})"/>
    <g transform="translate(260 880) scale(${1+sq*.04} ${1-sq*.06}) translate(-260 -880) translate(0 ${o.bob||0})">${back}${legs}${props}${torso}${acc}${arms}${headG}</g></svg>`}
const FOUNDER={outfit:'blazer',skin:['#DCA57E','#B07650'],hair:'bob',glasses:true,shoe:'loafer'};
const CREATOR={outfit:'hoodie',hoodie:['#F3EADF','#D8C8B6'],string:'#FF6A00',skin:['#BC7B50','#8E5534'],hair:'messy',hat:'bucket',hatC:['#FF7A1A','#E86400','#C24E00'],ring:1,pants:'#3A3A30'};
const FD=o=>human({...FOUNDER,...o}), CR=o=>human({...CREATOR,...o});

/* ===== DRIP MONK 2.0 (Ep. 8 redesign) =====
   monk2({...}) takes the same options as drip(): phase/amp or ll/rl (legs), ra/la (arms, e.g. CROSS_R/CROSS_L/PUSH_R/SHADE_R),
   point, shades (hand at the visor), mouth 'smirk'|'grin', tilt, bob, tw (tail). Same 520x900 box, feet at y~880. */
function monk2(o){
  const defs=`<defs><linearGradient id="n2fur" gradientUnits="userSpaceOnUse" x1="120" y1="90" x2="400" y2="420"><stop offset="0" stop-color="#D98A4E"/><stop offset="1" stop-color="#9A4F24"/></linearGradient>
   <linearGradient id="n2face" gradientUnits="userSpaceOnUse" x1="180" y1="210" x2="340" y2="390"><stop offset="0" stop-color="#FBE6CF"/><stop offset="1" stop-color="#EEC9A3"/></linearGradient>
   <linearGradient id="n2lens" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD27A"/><stop offset=".45" stop-color="#FF6A00"/><stop offset="1" stop-color="#9E2F6E"/></linearGradient>
   <linearGradient id="n2puf" gradientUnits="userSpaceOnUse" x1="120" y1="390" x2="380" y2="760"><stop offset="0" stop-color="#3A3530"/><stop offset=".55" stop-color="#1C1916"/><stop offset="1" stop-color="#0E0C0B"/></linearGradient>
   <linearGradient id="n2pant" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4A4B52"/><stop offset="1" stop-color="#2E2F35"/></linearGradient>
   <filter id="n2bl"><feGaussianBlur stdDeviation="12"/></filter></defs>`;
  const lg=o.ll?{ll:o.ll,rl:o.rl}:legsAt(o.phase||0,o.amp||0);
  const shoe=p=>`<g transform="translate(${p[0]} ${p[1]})"><path d="M-40 -40 Q-40 -58 -22 -58 L14 -58 Q30 -58 34 -40 L54 -6 Q60 14 44 18 L-40 18Z" fill="#FAF7F2"/><path d="M-40 10 H52" stroke="#151210" stroke-width="14" stroke-linecap="round"/><path d="M-20 -30 Q8 -16 40 -24" stroke="#FF6A00" stroke-width="8" fill="none" stroke-linecap="round"/><rect x="-36" y="-58" width="30" height="20" rx="6" fill="#FF6A00"/></g>`;
  const legs=limb(lg.ll,56,'url(#n2pant)')+limb(lg.rl,56,'#33343A')+`<rect x="${lg.ll[1][0]-34}" y="${lg.ll[1][1]-14}" width="26" height="34" rx="6" fill="#2A2B30"/><rect x="${lg.rl[1][0]+10}" y="${lg.rl[1][1]-14}" width="26" height="34" rx="6" fill="#2A2B30"/>`+shoe(lg.ll[2])+shoe(lg.rl[2]);
  const tw=o.tw||0;
  const tail=`<path d="M170 650 C70 690 46 ${560+Math.sin(tw)*16} 100 528 C138 506 160 552 128 562" stroke="url(#n2fur)" stroke-width="24" fill="none" stroke-linecap="round"/><path d="M104 600 l18 -12" stroke="#FF6A00" stroke-width="22" stroke-linecap="round" transform="rotate(${(Math.sin(tw)*4).toFixed(1)} 100 560)"/>`;
  const torso=`<path d="M150 402 Q255 372 360 402 Q398 424 392 474 L384 744 Q255 778 126 744 L118 474 Q112 424 150 402Z" fill="url(#n2puf)"/>
   ${[478,548,618,688].map(y=>`<path d="M${124+(y-470)*.02} ${y} Q255 ${y+22} ${386-(y-470)*.02} ${y}" stroke="#000" stroke-width="5" fill="none" opacity=".45"/><path d="M${124+(y-470)*.02} ${y-6} Q255 ${y+16} ${386-(y-470)*.02} ${y-6}" stroke="#fff" stroke-width="3" fill="none" opacity=".08"/>`).join('')}
   <path d="M255 420 V748" stroke="#0A0908" stroke-width="8"/><path d="M255 420 V748" stroke="#6A625C" stroke-width="2.5"/>
   <path d="M360 404 Q394 426 390 474 L382 740" stroke="#FF9142" stroke-width="5" fill="none" opacity=".55"/>
   <path d="M214 404 Q255 444 296 404 L292 392 Q255 420 218 392Z" fill="#FAF7F2"/>
   <path d="M168 400 Q255 452 342 400 L334 362 Q255 410 176 362Z" fill="#1C1916"/><path d="M180 384 Q255 428 330 384" stroke="#FF6A00" stroke-width="10" fill="none" stroke-linecap="round"/>
   <path d="M184 380 Q255 470 326 380" stroke="#FF6A00" stroke-width="12" fill="none"/><rect x="164" y="370" width="34" height="48" rx="14" fill="#FF6A00"/><rect x="312" y="370" width="34" height="48" rx="14" fill="#FF6A00"/><rect x="172" y="380" width="18" height="28" rx="8" fill="#1C1916"/><rect x="320" y="380" width="18" height="28" rx="8" fill="#1C1916"/>
   <g transform="translate(332 620) rotate(-6)"><rect x="-26" y="-20" width="52" height="30" rx="8" fill="#FF6A00"/><text x="0" y="4" text-anchor="middle" font-family="Outfit" font-weight="800" font-size="20" fill="#0A0908">CC</text></g>`;
  const H=p=>`<circle cx="${p[0]}" cy="${p[1]}" r="25" fill="url(#n2fur)"/><path d="M${p[0]-12} ${p[1]+4} q12 8 24 0" stroke="#7A3A18" stroke-width="3" fill="none" opacity=".6"/>`;
  const ra=o.ra||CROSS_R, la=o.la||CROSS_L, pt=o.point||0, sh=o.shades||0;
  const armR=limb(ra,54,'#2A2622')+`<circle cx="${(ra[1][0]+ra[2][0])/2}" cy="${(ra[1][1]+ra[2][1])/2}" r="4" fill="#000" opacity="0"/>`+H(ra[2])+(pt>0?`<rect x="${ra[2][0]+10}" y="${ra[2][1]-9}" width="${44*pt}" height="18" rx="9" fill="url(#n2fur)"/>`:'')+(sh>0?`<rect x="${ra[2][0]-8}" y="${ra[2][1]-36*sh}" width="16" height="${36*sh}" rx="8" fill="url(#n2fur)"/>`:'');
  const armL=limb(la,54,'#24201D')+H(la[2]);
  const mouth=o.mouth==='grin'?`<path d="M224 342 Q255 378 288 340 Q255 356 224 342Z" fill="#4A2412"/><path d="M236 350 Q255 360 274 350" stroke="#E8836A" stroke-width="4" fill="none"/>`
    :`<path d="M226 346 Q258 362 286 338" stroke="#4A2412" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M286 338 L292 332" stroke="#4A2412" stroke-width="5" stroke-linecap="round"/>`;
  const head=`<g transform="rotate(${o.tilt||0} 255 330)">
   <circle cx="118" cy="252" r="54" fill="url(#n2fur)"/><circle cx="118" cy="252" r="32" fill="#E9A88A"/><circle cx="392" cy="252" r="54" fill="url(#n2fur)"/><circle cx="392" cy="252" r="32" fill="#E9A88A"/><circle cx="412" cy="290" r="6" fill="#FF6A00"/>
   <circle cx="255" cy="238" r="134" fill="url(#n2fur)"/>
   <path d="M188 128 C196 56 276 30 334 62 C346 70 352 80 352 90 C324 74 296 78 280 102 C264 82 228 90 206 122Z" fill="#6E3415"/><path d="M226 92 C250 64 300 56 330 74" stroke="#C97A42" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
   <path d="M378 196 A134 134 0 0 1 362 320" stroke="#FFC08A" stroke-width="6" fill="none" opacity=".55" stroke-linecap="round"/>
   <path d="M255 388 C168 388 136 328 146 276 C152 236 188 210 222 220 C238 225 248 236 255 248 C262 236 272 225 288 220 C322 210 358 236 364 276 C374 328 342 388 255 388Z" fill="url(#n2face)"/>
   <ellipse cx="255" cy="334" rx="66" ry="44" fill="#FFF1E2"/><ellipse cx="244" cy="312" rx="6" ry="4" fill="#7A3A18"/><ellipse cx="266" cy="312" rx="6" ry="4" fill="#7A3A18"/>${mouth}
   <path d="M132 236 L160 232 M350 232 L378 236" stroke="#0E0C0B" stroke-width="8" stroke-linecap="round"/>
   <path d="M152 236 Q162 206 204 206 L306 206 Q350 206 360 236 L352 272 Q346 294 316 294 L282 294 Q266 294 260 278 Q255 270 250 278 Q244 294 228 294 L194 294 Q164 294 158 272Z" fill="url(#n2lens)"/>
   <path d="M150 230 Q160 200 204 200 L306 200 Q352 200 362 230" stroke="#0E0C0B" stroke-width="10" fill="none" stroke-linecap="round"/>
   <path d="M176 232 L212 276 M196 228 L224 262 M290 228 L328 274" stroke="#fff" stroke-width="7" opacity=".38" stroke-linecap="round"/></g>`;
  return `<svg viewBox="0 0 520 900" width="100%" style="overflow:visible">${defs}
   <ellipse cx="255" cy="886" rx="160" ry="20" fill="#000" opacity=".55" filter="url(#n2bl)"/>
   <g transform="translate(0 ${o.bob||0})">${tail}${legs}${torso}${o.chest||''}${sh>0?armL:armR+armL}${head}${sh>0?armR:''}</g></svg>`}
