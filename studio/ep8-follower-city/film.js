'use strict';
/* CreatorChahiye Ep. 8 "Follower City": a city where followers are money, until the night fake followers are deleted.
   Narrated (voice file in audio/). Cuts and word captions are timed from WORDS (speech-to-text of that file).
   render(t) draws the frame for time t (seconds). Stateless, so renders are resumable. */
const W=1080,H=1920,TAU=Math.PI*2;
const stage=document.getElementById('stage');

/* ---------- helpers ---------- */
const es=x=>(1-Math.cos(Math.PI*C(x)))/2;
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const toHex=a=>'#'+a.map(v=>Math.round(C(v,0,255)).toString(16).padStart(2,'0')).join('');
const mixc=(a,b,k)=>toHex(hex(a).map((v,i)=>L(v,hex(b)[i],k)));
function mixv(a,b,k){if(typeof a==='number')return L(a,b,k);if(typeof a==='string')return a[0]==='#'?mixc(a,b,k):(k<.5?a:b);if(Array.isArray(a))return a.map((x,i)=>mixv(x,b[i],k));const o={};for(const key in a)o[key]=mixv(a[key],b[key],k);return o}
function K(t,keys){if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const a=keys[i-1],b=keys[i];return mixv(a[1],b[1],(b[2]||eio)(P(t,a[0],b[0])))}return keys[keys.length-1][1]}
const S=(t,keys)=>{let v=keys[0][1];for(const k of keys)if(t>=k[0])v=k[1];return v};
const rnd=i=>{let x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const px=v=>v.toFixed(2)+'px', f3=v=>v.toFixed(3), fmt=n=>Math.round(n).toLocaleString('en-US');
const norm=s=>s.toLowerCase().replace(/[.,?!"]+$/,'');
const wordAt=(txt,n=0)=>{let c=0;for(const w of WORDS)if(norm(w[0])===norm(txt)){if(c===n)return w[1];c++}throw new Error('word not found: '+txt+' #'+n)};
const pop=(t,t0,d=.35)=>eb(P(t,t0,t0+d)), fin=(t,t0,d=.3)=>eo(P(t,t0,t0+d));
const abs=(x,y,inner,extra='')=>`<div class="abs" style="left:${px(x)};top:${px(y)};${extra}">${inner}</div>`;
const label=(txt,bg='#FF6A00',fg='#0A0908',fs=44)=>`<div style="display:inline-block;white-space:nowrap;background:${bg};color:${fg};font-weight:800;font-size:${fs}px;letter-spacing:-.03em;padding:${fs*.22}px ${fs*.55}px ${fs*.3}px;border-radius:${fs*.5}px;box-shadow:0 12px 30px rgba(0,0,0,.45)">${txt}</div>`;
const TICK=s=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#2F8CFF"/><path d="M6.5 12.5 L10.4 16.2 L17.6 8.4" stroke="#fff" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const GTICK=s=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#3DDC84"/><path d="M6.5 12.5 L10.4 16.2 L17.6 8.4" stroke="#0A2A18" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const FOLLOW=s=>`<svg width="${s}" height="${s}" viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="#FF6A00" stroke="#FFD2A8" stroke-width="2"/><circle cx="17" cy="15" r="5.5" fill="#FAF7F2"/><path d="M8 30 C9 22 25 22 26 30Z" fill="#FAF7F2"/><path d="M29 13 V23 M24 18 H34" stroke="#FAF7F2" stroke-width="3" stroke-linecap="round"/></svg>`;

/* ---------- people ---------- */
let XU=0;
const EXTRA=[
 {outfit:'hoodie',hoodie:['#6FA8DC','#3D6E9E'],string:'#FAF7F2',skin:['#C98B62','#9A6240'],hair:'curly',pants:'#2B2724'},
 {outfit:'hoodie',hoodie:['#9BCB7A','#5E8C45'],string:'#FAF7F2',skin:['#E0B48E','#B9845C'],hair:'pony',pants:'#3A3430'},
 {outfit:'hoodie',hoodie:['#E57A8A','#B04A5C'],string:'#FAF7F2',skin:['#A86A43','#7A4528'],hair:'side',pants:'#2B2724',glasses:true},
 {outfit:'hoodie',hoodie:['#B9A4E0','#7D67A8'],string:'#FAF7F2',skin:['#DCA57E','#B07650'],hair:'bun',pants:'#2E2A36'},
 {outfit:'hoodie',hoodie:['#F2C14E','#C99418'],string:'#FAF7F2',skin:['#BC7B50','#8E5534'],hair:'fade',pants:'#2B2724'},
 {outfit:'hoodie',hoodie:['#7FD1C7','#3E9489'],string:'#FAF7F2',skin:['#E8C4A0','#C0946A'],hair:'long',pants:'#2B2724'}];
const SUIT=[{outfit:'blazer',badge:false,skin:['#C98B62','#9A6240'],hair:'side',shoe:'loafer'},{outfit:'blazer',badge:false,skin:['#E0B48E','#B9845C'],hair:'bun',shoe:'loafer'},
            {outfit:'blazer',badge:false,skin:['#A86A43','#7A4528'],hair:'fade',glasses:true,shoe:'loafer'},{outfit:'blazer',badge:false,skin:['#DCA57E','#B07650'],hair:'long',shoe:'loafer'}];
const ROCKY={outfit:'hoodie',hoodie:['#2E2924','#141110'],string:'#E8B84A',skin:['#D9A27A','#B07650'],hair:'quiff',pants:'#1A1816',shades:1,chain:1};
const RK=o=>human({...ROCKY,...o}), EX=(i,o)=>human({...EXTRA[i%EXTRA.length],...o}), SU=(i,o)=>human({...SUIT[i%SUIT.length],...o});
/* place a 520x900 character so its feet land at (x, fy) */
const put=(svg,x,fy,sc,extra='',cx=260)=>`<div class="abs" style="left:${px(x-cx*sc)};top:${px(fy-880*sc)};width:${(520*sc).toFixed(1)}px;${extra}">${svg}</div>`;
const SELFIE_R=[[372,404],[446,380],[470,300]], IDLE_L=[[150,404],[128,520],[146,620]], IDLE_R=[[370,404],[392,520],[374,620]], PHONE_R=[[372,404],[404,506],[322,512]],
      OPEN_R=[[370,404],[452,470],[520,450]], CROSS_LH=[[150,404],[168,500],[330,488]], CROSS_RH=[[370,404],[352,500],[190,478]], HIPS_L=[[150,404],[96,500],[150,600]], HIPS_R=[[370,404],[424,500],[370,600]];

/* the cat (side view, faces right) */
function cat(o){
  const ph=o.phase||0, amp=o.amp||0, tw=o.tail||0, lid=o.lid==null?.45:o.lid;
  const leg=(x,k)=>{const s=Math.sin(ph+k)*amp;return `<rect x="${(x+s*14).toFixed(1)}" y="${(196-Math.max(0,Math.cos(ph+k))*amp*8).toFixed(1)}" width="20" height="54" rx="10" fill="url(#ctf)"/>`};
  return `<svg viewBox="0 0 320 270" width="100%" style="overflow:visible"><defs><linearGradient id="ctf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A7A2A0"/><stop offset="1" stop-color="#6E6866"/></linearGradient></defs>
   <ellipse cx="160" cy="258" rx="110" ry="10" fill="#000" opacity=".35"/>
   <path d="M70 170 C30 ${150+tw*10} 20 ${90-tw*20} ${48+tw*6} ${60-tw*10}" stroke="url(#ctf)" stroke-width="20" fill="none" stroke-linecap="round"/>
   ${leg(84,0)}${leg(200,Math.PI)}
   <ellipse cx="150" cy="176" rx="90" ry="50" fill="url(#ctf)"/><ellipse cx="160" cy="200" rx="60" ry="22" fill="#D8D2CE" opacity=".6"/>
   ${leg(110,Math.PI)}${leg(224,0)}
   ${o.bag?`<g transform="translate(96 104)"><rect x="0" y="0" width="92" height="60" rx="10" fill="#FF6A00"/><rect x="30" y="-12" width="32" height="16" rx="6" fill="none" stroke="#8A3A00" stroke-width="5"/><path d="M0 22 H92" stroke="#C24E00" stroke-width="4"/><path d="M46 60 V80" stroke="#5A3A08" stroke-width="5"/></g>`:''}
   <g transform="translate(244 118)"><path d="M-40 -26 L-30 -70 L-4 -40Z M10 -40 L34 -68 L40 -24Z" fill="#8E8886"/><path d="M-30 -36 L-27 -58 L-14 -42Z M18 -42 L30 -58 L32 -34Z" fill="#E7A6A0"/>
    <circle r="50" fill="url(#ctf)"/><ellipse cx="22" cy="18" rx="26" ry="18" fill="#E9E4E0"/><path d="M38 10 L46 6 L44 14Z" fill="#D9827A"/>
    ${[-14,22].map(x=>`<ellipse cx="${x}" cy="-6" rx="9" ry="${(10*(1-lid)+1.5).toFixed(1)}" fill="#1A1210"/><path d="M${x-12} ${(-6-10*(1-lid)).toFixed(1)} H${x+12}" stroke="#6E6866" stroke-width="5"/>`).join('')}
    <path d="M40 22 L78 14 M40 26 L80 28 M38 30 L74 40" stroke="#F5F1EE" stroke-width="2.5"/>
    <path d="M-34 36 Q6 56 40 36" stroke="#E8B84A" stroke-width="6" fill="none"/><circle cx="4" cy="50" r="8" fill="#E8B84A"/></g></svg>`}

/* ---------- city ---------- */
const BLD=(()=>{const a=[];let x=-180,i=0;while(x<1300){const w=110+rnd(i+3)*120,h=420+rnd(i+11)*620;a.push({x,w,h,c:rnd(i+21),bb:i%3===1,i});x+=w+8+rnd(i+31)*18;i++}return a})();
const SKY={day:['#FF8E4A','#FFC98A','#FFE3BF'],night:['#060912','#0D1528','#1C2540'],sunrise:['#3A2140','#C45A4A','#FFB066'],dusk:['#2A1A2E','#8A3E3A','#E07A44']};
function sky(mode,k=0,mode2){const a=SKY[mode],b=SKY[mode2||mode],c=[0,1,2].map(i=>mixc(a[i],b[i],k));
  return `<div class="abs" style="inset:-300px;background:linear-gradient(180deg,${c[0]} 0%,${c[1]} 55%,${c[2]} 100%)"></div>`}
/* lit(i,j) -> 0..1 for building i, window j. bbOn(i) -> billboard brightness */
function city(t,o){
  const base=o.base||1380, sc=o.sc||1, night=o.night||0, dx=o.dx||0, lit=o.lit||(()=>night), bbOn=o.bbOn||(()=>1), tint=o.tint||0;
  let s='';
  BLD.forEach(b=>{
    const top=base-b.h*sc, bc=mixc(mixc('#7A3A22','#3A2030',b.c),'#0B0F1C',night*.85), wc=mixc('#FFE2B0','#FFD27A',night);
    s+=`<rect x="${b.x}" y="${top.toFixed(1)}" width="${b.w.toFixed(1)}" height="${(b.h*sc+40).toFixed(1)}" fill="${bc}"/><rect x="${b.x}" y="${top.toFixed(1)}" width="6" height="${(b.h*sc).toFixed(1)}" fill="#fff" opacity="${f3(.08*(1-night))}"/>`;
    const cols=Math.max(2,Math.floor((b.w-30)/38)), rows=Math.floor((b.h*sc-60)/52);
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const j=r*cols+c, on=lit(b.i,j), x=b.x+18+c*((b.w-36)/cols), y=top+30+r*52;
      s+=`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${((b.w-36)/cols-12).toFixed(1)}" height="30" rx="3" fill="${on>.02&&rnd(b.i*97+j)>.35?wc:mixc(bc,'#000000',.35)}" opacity="${on>.02&&rnd(b.i*97+j)>.35?f3(.25+.75*on):1}"/>`}
    if(b.bb){const bw=Math.min(240,b.w+60), bx=b.x+b.w/2-bw/2, by=top-150, on=bbOn(b.i), n=['10M','2.3M','8.8M','+1','4.1M'][b.i%5];
      s+=`<rect x="${bx+bw/2-6}" y="${by+110}" width="12" height="44" fill="#1A1414"/><rect x="${bx}" y="${by}" width="${bw}" height="116" rx="12" fill="#151013" stroke="#2A2024" stroke-width="5"/>
       <g opacity="${f3(on)}"><rect x="${bx+6}" y="${by+6}" width="${bw-12}" height="104" rx="8" fill="${b.i%2?'#FF6A00':'#2A1F40'}"/>
       <text x="${bx+bw/2+18}" y="${by+76}" text-anchor="middle" font-family="Outfit" font-weight="800" font-size="56" fill="#FAF7F2">${n}</text>
       <path d="M${bx+30} ${by+52} c0 -14 20 -14 20 0 c0 -14 20 -14 20 0 c0 14 -20 26 -20 30 c0 -4 -20 -16 -20 -30Z" fill="#FAF7F2"/></g>`}});
  return `<svg class="abs" style="left:${px(-180+dx)};top:0;overflow:visible" width="1500" height="1920" viewBox="-180 0 1500 1920">${s}
    <rect x="-180" y="${base}" width="1500" height="700" fill="${mixc('#3A1E14','#07080C',night)}"/><rect x="-180" y="${base}" width="1500" height="6" fill="#000" opacity=".25"/>
    ${tint?`<rect x="-180" y="0" width="1500" height="1920" fill="#000" opacity="${f3(tint)}"/>`:''}</svg>`}

/* big phone */
function phone(x,y,w,inner,o={}){const h=w*2.05,r=w*.14;
  return `<div class="abs" style="left:${px(x)};top:${px(y)};width:${px(w)};height:${px(h)};border-radius:${px(r)};background:#141110;border:${px(w*.035)} solid #2A2523;box-shadow:0 40px 90px rgba(0,0,0,.6);${o.extra||''}">
   <div class="abs" style="inset:${px(w*.03)};border-radius:${px(r*.8)};overflow:hidden;background:${o.bg||'#FAF7F2'}">${inner}</div>
   <div class="abs" style="left:50%;top:${px(w*.05)};width:${px(w*.26)};height:${px(w*.06)};transform:translateX(-50%);border-radius:99px;background:#141110"></div></div>`}

/* follower coin */
const coin=(x,y,s,spin=0)=>`<div class="abs" style="left:${px(x-s/2)};top:${px(y-s/2)};width:${px(s)};height:${px(s)};transform:scaleX(${f3(Math.cos(spin))})">
  <svg width="100%" height="100%" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#C77A10"/><circle cx="50" cy="50" r="44" fill="#FFB547"/><circle cx="50" cy="50" r="36" fill="none" stroke="#C77A10" stroke-width="3" stroke-dasharray="4 5"/>
  <circle cx="45" cy="40" r="9" fill="#7A3A08"/><path d="M30 66 C32 52 58 52 60 66Z" fill="#7A3A08"/><path d="M66 36 V52 M58 44 H74" stroke="#7A3A08" stroke-width="5" stroke-linecap="round"/></svg></div>`;

/* ---------- shots (each returns full-frame HTML; lt = time inside the shot) ---------- */
const camWrap=(inner,cx,cy,z,rot=0)=>`<div class="abs" style="left:0;top:0;width:1080px;height:1920px;transform-origin:0 0;transform:translate(540px,960px) rotate(${rot.toFixed(3)}deg) scale(${z.toFixed(5)}) translate(${px(-cx)},${px(-cy)})">${inner}</div>`;
const settle=lt=>1-eo(P(lt,0,.35));  // every cut lands with a small camera settle

function shCold(t,lt,d){ // 12:01 AM, richest man loses everything
  const off=t>wordAt('lost')+.1?1-P(t,wordAt('lost')+.1,wordAt('lost')+.6):1, gl=Math.sin(t*41)>.7&&t>1.8?.25:0;
  const z=K(lt,[[0,1.04],[d,1.16,es]])+settle(lt)*.04;
  let w=sky('night')+city(t,{night:1,lit:(i,j)=>rnd(i*7+j)>.55?.9:0,bbOn:()=>.15});
  w+=`<div class="abs" style="left:140px;top:300px;width:800px;height:330px;border-radius:26px;background:#0E0A0C;border:8px solid #2A2024;box-shadow:0 0 120px rgba(255,106,0,${f3(.35*off)})">
     <div class="abs" style="inset:14px;border-radius:14px;background:linear-gradient(135deg,#FF6A00,#C24E00);opacity:${f3(off*(1-gl))}"></div>
     <div class="abs hl" style="left:0;right:0;top:78px;text-align:center;font-size:150px;letter-spacing:-.04em;color:#FAF7F2;opacity:${f3(off)};transform:translateX(${px(gl*30)})">10,000,000</div>
     <div class="abs" style="left:0;right:0;top:40px;text-align:center;font-weight:700;font-size:34px;color:#FFE2C4;opacity:${f3(off)}">ROCKY · FOLLOWERS</div></div>`;
  w+=put(RK({arms:'custom',la:IDLE_L,ra:PHONE_R,rprop:'phone',phoneGlow:1.4,look:[0,-9],brow:'worry',mouth:t>wordAt('lost')?'o':'flat',lid:.1+blink(t,[1.4]),sway:Math.sin(t*1.3)*2}),540,1780,1.35,'filter:brightness(.62) saturate(.8)');
  w+=`<div class="abs" style="left:300px;top:1000px;width:480px;height:480px;border-radius:50%;background:radial-gradient(circle,rgba(255,178,122,.28),rgba(255,178,122,0) 65%)"></div>`;
  for(let i=0;i<40;i++){const x=(rnd(i)*1200-60+t*90)%1140, y=((rnd(i+50)*1920+t*1400*(.7+rnd(i+9)*.5))%2100)-100;w+=`<div class="abs" style="left:${px(x)};top:${px(y)};width:2px;height:60px;background:rgba(170,190,220,.25);transform:rotate(12deg)"></div>`}
  return camWrap(w,540,1000,z)+abs(70,250,`<div style="font-weight:800;font-size:46px;letter-spacing:.06em;color:#FF6A00">12:01 AM</div>`,`opacity:${f3(fin(lt,.15,.4))}`)}
function shCatLeaves(t,lt,d){
  const x=K(lt,[[0,430],[d,820,ei]]), ph=lt*TAU*1.6;
  let w=sky('night')+city(t,{night:1,lit:(i,j)=>rnd(i*7+j)>.6?.85:0,bbOn:()=>.1,base:1400,tint:.35});
  w+=`<div class="abs" style="left:0;top:1400px;width:1080px;height:600px;background:linear-gradient(180deg,#0E1018,#05060A)"></div>`;
  w+=put(RK({arms:'idle',look:[10,4],brow:'worry',mouth:'frown',lid:.3}),110,1720,1.5,'filter:brightness(.5)');
  w+=`<div class="abs" style="left:${px(x-140)};top:1250px;width:300px">${cat({phase:ph,amp:1,tail:Math.sin(lt*3),bag:1,lid:.6})}</div>`;
  return camWrap(w,540,1150,1.05+.05*es(lt/d)+settle(lt)*.04)}
function shRewind(t,lt,d){ // "Let me explain." VHS rewind back to day
  const k=P(lt,0,d), back=4.1*(1-k);
  let inner=k<.62?shCold(back,back,4.2):shDayCity(6.9,0,3.3);
  const jit=Math.sin(lt*97)*14;
  return `<div class="abs" style="inset:0;filter:saturate(.6) contrast(1.15);transform:translateX(${px(jit)})">${inner}</div>
   <div class="abs" style="inset:0;background:repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 3px,rgba(0,0,0,0) 3px 7px)"></div>
   <div class="abs" style="left:0;top:${px((lt*2600)%1920)};width:1080px;height:70px;background:rgba(255,255,255,.12)"></div>
   ${abs(80,250,`<div style="font-weight:800;font-size:96px;color:#FAF7F2;letter-spacing:-.06em;text-shadow:0 6px 30px rgba(0,0,0,.6)">◀◀</div>`)}`}
function shDayCity(t,lt,d){
  const z=1.0+.06*es(lt/d)+settle(lt)*.05, cn=wordAt('Followers'), k=pop(t,cn), spin=(t-cn)*7;
  let w=sky('day')+city(t,{dx:-lt*12});
  [[120,1860,0,1.0],[330,1900,3,1.05],[560,1870,1,1.0],[800,1910,4,1.08],[990,1880,5,1.0]].forEach(([x,fy,i,sc],n)=>{
    w+=put(EX(i,{arms:'creator',gimbal:1,look:[n%2?6:-6,-2],mouth:'smile',bob:-Math.abs(Math.sin(t*3+n))*6,ring:0}),x,fy,.62*sc)});
  if(k>0)w+=coin(540,780,L(80,360,k),t<cn+.9?spin:0)+abs(0,990,`<div class="hl" style="width:1080px;text-align:center;font-size:58px;color:#FAF7F2">1 follower = ₹ nothing</div>`,`opacity:0`);
  return camWrap(w,540,1000,z)}
function shCoffee(t,lt,d){
  const pay=wordAt('50'), k=pop(t,pay);
  let w=`<div class="abs" style="inset:0;background:linear-gradient(180deg,#3A2014,#1E100A)"></div>`;
  w+=`<div class="abs" style="left:120px;top:250px;width:840px;height:420px;border-radius:22px;background:#151012;border:8px solid #4A2E1E;padding:36px 50px">
     <div style="font-weight:700;font-size:38px;color:#FFB27A;letter-spacing:.08em">MENU</div>
     ${[['Cappuccino','50'],['Cold coffee','80'],['Croissant','120']].map(([a,b],i)=>`<div style="display:flex;justify-content:space-between;align-items:center;margin-top:${i?22:30}px;font-weight:700;font-size:52px;color:#FAF7F2">${a}<span style="display:flex;align-items:center;gap:14px;color:#FFB547">${b}${FOLLOW(52)}</span></div>`).join('')}</div>`;
  w+=`<div class="abs" style="left:0;top:1180px;width:1080px;height:760px;background:linear-gradient(180deg,#6A3A22,#3A1E12)"></div><div class="abs" style="left:0;top:1170px;width:1080px;height:24px;background:#8A5236"></div>`;
  w+=`<svg class="abs" style="left:180px;top:930px" width="300" height="270" viewBox="0 0 300 270"><path d="M40 60 L260 60 L236 250 Q232 262 220 262 L80 262 Q68 262 64 250Z" fill="#FAF7F2"/><path d="M256 100 Q300 104 296 150 Q292 196 246 196" stroke="#FAF7F2" stroke-width="18" fill="none"/>
     <ellipse cx="150" cy="60" rx="110" ry="22" fill="#8A5236"/><path d="M130 50 c0 -12 18 -12 20 0 c2 -12 20 -12 20 0 c0 12 -20 22 -20 26 c0 -4 -20 -14 -20 -26Z" fill="#F3E3CF"/>
     ${[0,1,2].map(i=>`<path d="M${110+i*40} ${36-(t*60+i*30)%40} q10 -16 0 -32" stroke="#FAF7F2" stroke-width="6" fill="none" opacity="${f3(.5-((t*60+i*30)%40)/90)}" stroke-linecap="round"/>`).join('')}</svg>`;
  w+=phone(560,1180,300,`<div style="padding:70px 26px 0;text-align:center;font-weight:800;color:#0A0908"><div style="font-size:30px;color:#8A7F76">Pay</div><div style="font-size:84px;margin-top:6px">50</div><div style="font-size:30px">followers</div>
     <div style="margin:34px auto 0;width:200px;height:74px;border-radius:40px;background:${k>0?'#3DDC84':'#FF6A00'};display:flex;align-items:center;justify-content:center;font-size:32px;color:${k>0?'#0A2A18':'#0A0908'}">${k>0?'Paid ✓':'Pay'}</div></div>`,{extra:`transform:rotate(-8deg)`});
  for(let i=0;i<5;i++){const q=P(t,pay+.05+i*.06,pay+.75+i*.06);if(q>0&&q<1)w+=`<div class="abs" style="left:${px(L(690,500,eio(q)))};top:${px(L(1380,1000,eio(q))-Math.sin(q*Math.PI)*120)};opacity:${f3(1-q*.6)}">${FOLLOW(64)}</div>`}
  return camWrap(w,540,960,1.0+.05*es(lt/d)+settle(lt)*.05)}
function shRent(t,lt,d){
  const k=pop(t,wordAt('200,000'));
  let w=`<div class="abs" style="inset:0;background:linear-gradient(180deg,#5A3424,#2A160E)"></div>
   <div class="abs" style="left:190px;top:180px;width:700px;height:1500px;border-radius:10px;background:linear-gradient(90deg,#7A4A30,#8E5A3A 50%,#6A3E26);box-shadow:0 30px 80px rgba(0,0,0,.5)"></div>
   <div class="abs" style="left:240px;top:240px;width:600px;height:620px;border:6px solid #5A3220;border-radius:8px"></div><div class="abs" style="left:240px;top:920px;width:600px;height:680px;border:6px solid #5A3220;border-radius:8px"></div>
   <div class="abs" style="left:800px;top:930px;width:40px;height:40px;border-radius:50%;background:#E8B84A"></div>`;
  w+=`<div class="abs" style="left:290px;top:520px;width:500px;height:560px;background:#FAF7F2;transform:rotate(${L(-14,-3,k).toFixed(2)}deg) scale(${L(.6,1,k).toFixed(3)});opacity:${f3(P(k,0,.2))};box-shadow:0 20px 40px rgba(0,0,0,.4);padding:44px 40px">
     <div style="font-weight:800;font-size:64px;color:#0A0908;letter-spacing:-.03em">RENT DUE</div><div style="height:8px;width:120px;background:#FF6A00;border-radius:4px;margin:14px 0 30px"></div>
     <div style="font-weight:800;font-size:96px;color:#0A0908;letter-spacing:-.04em">200,000</div><div style="font-weight:700;font-size:44px;color:#5A4D45;display:flex;align-items:center;gap:12px">followers ${FOLLOW(48)}</div>
     <div style="margin-top:40px;font-weight:600;font-size:32px;color:#8A7F76">per month · no exceptions</div>
     <div class="abs" style="left:24px;top:-26px;width:110px;height:44px;background:rgba(240,210,150,.8);transform:rotate(-8deg)"></div></div>`;
  return camWrap(w,540,900,1.02+.08*es(lt/d)+settle(lt)*.05)}
function shSignal(t,lt,d){
  const ct=wordAt('green'), sig=t>=ct?'g':'r', cx=K(lt,[[0,-420],[ct-(t-lt)+.05,250,eo],[d,1400,ei]]);
  let w=sky('day')+city(t,{base:1200,dx:-60})+`<div class="abs" style="left:0;top:1200px;width:1080px;height:800px;background:#3A3232"></div>`+
    [0,1,2,3,4].map(i=>`<div class="abs" style="left:${60+i*220}px;top:1500px;width:120px;height:16px;background:#E8DDD0;opacity:.6"></div>`).join('');
  w+=`<div class="abs" style="left:110px;top:520px;width:24px;height:900px;background:#1E1A1A"></div><div class="abs" style="left:50px;top:420px;width:144px;height:390px;border-radius:30px;background:#151012;border:6px solid #2A2422">
     ${['#FF3D3D','#FFB547','#3DDC84'].map((c,i)=>`<div class="abs" style="left:24px;top:${22+i*120}px;width:96px;height:96px;border-radius:50%;background:${c};opacity:${(i===0&&sig==='r')||(i===2&&sig==='g')?1:.15};box-shadow:${(i===0&&sig==='r')||(i===2&&sig==='g')?`0 0 50px ${c}`:'none'}"></div>`).join('')}</div>`;
  w+=car(cx,1330,1.25,'#1E1E24',true)+car(700,1480,1.0,'#8AA7B5',false,'filter:brightness(.9)');
  return camWrap(w,540,1000,1.02+settle(lt)*.05)}
function car(x,y,s,col,tick,extra=''){return `<div class="abs" style="left:${px(x)};top:${px(y-140*s)};width:${px(420*s)};${extra}"><svg viewBox="0 0 420 160" width="100%"><ellipse cx="210" cy="150" rx="190" ry="10" fill="#000" opacity=".35"/>
   <path d="M20 112 Q22 80 60 74 L120 70 Q160 30 230 30 Q300 32 340 72 L392 82 Q412 88 410 112 Q408 128 392 128 L28 128 Q18 126 20 112Z" fill="${col}"/>
   <path d="M136 72 Q166 44 226 44 L232 72Z M244 72 L244 44 Q296 48 322 72Z" fill="#9FC7E8" opacity=".85"/>
   ${[100,320].map(cx=>`<circle cx="${cx}" cy="128" r="30" fill="#151012"/><circle cx="${cx}" cy="128" r="14" fill="#8A7F76"/>`).join('')}
   <rect x="380" y="92" width="22" height="12" rx="6" fill="#FFE2A0"/>${tick?`<g transform="translate(196 -6)">${''}</g>`:''}</svg>
   ${tick?`<div class="abs" style="left:${px(170*s)};top:${px(-40*s)}">${TICK(70*s)}</div>`:''}</div>`}
function shRocky(t,lt,d){
  const nm=wordAt('Rocky'), n0=wordAt('10'), cnt=Math.round(t*60)/60, val=t<n0?0:Math.min(1e7,1e7*eo(P(cnt,n0,n0+.9)));
  let w=sky('day')+city(t,{base:1500,dx:-lt*8,tint:.1,bbOn:()=>0})+`<div class="abs" style="left:0;top:1480px;width:1080px;height:500px;background:linear-gradient(180deg,#E8DDD0,#B9A894)"></div>`;
  w+=[[180,1],[900,-1]].map(([x,s])=>`<div class="abs" style="left:${x-130}px;top:760px;width:260px;height:260px;border-radius:50%;border:16px solid #FFF4E6;box-shadow:0 0 60px rgba(255,240,220,.9),inset 0 0 40px rgba(255,240,220,.6)"></div><div class="abs" style="left:${x-6}px;top:1010px;width:12px;height:480px;background:#2A2523"></div>`).join('');
  w+=put(RK({arms:'custom',la:HIPS_L,ra:SELFIE_R,rprop:'phone',phoneGlow:1,look:[0,0],mouth:'smirk',brow:'up',lid:.15+blink(t,[18.3]),tilt:Math.sin(t*2)*2,sway:Math.sin(t*2.4)*3}),540,1640,1.15);
  const k=pop(t,nm);
  if(k>0)w+=abs(540,1660,`<div style="display:flex;align-items:center;gap:14px;background:#FAF7F2;border-radius:40px;padding:12px 30px 14px 24px;font-weight:800;font-size:54px;color:#0A0908;box-shadow:0 14px 30px rgba(0,0,0,.35)">Rocky ${TICK(54)}</div>`,`transform:translate(-50%,0) scale(${f3(L(.5,1,k))});opacity:${f3(P(k,0,.2))}`);
  if(t>=n0){const q=pop(t,n0,.4);w+=abs(540,330,`<div class="hl" style="font-size:140px;color:#FAF7F2;background:rgba(14,10,12,.82);border-radius:40px;padding:14px 46px 26px;box-shadow:0 20px 50px rgba(0,0,0,.4)">${fmt(val)}</div>`,`transform:translate(-50%,0) scale(${f3(L(.6,1,q))})`);
    for(let i=0;i<14;i++){const q2=P(t,n0+i*.05,n0+1.6+i*.05);if(q2>0&&q2<1)w+=abs(540+(rnd(i)-.5)*900,650-q2*380+rnd(i+4)*200,`<svg width="56" height="56" viewBox="0 0 24 24"><path d="M12 21 C-2 12 4 2 12 7 C20 2 26 12 12 21Z" fill="${i%2?'#FF6A00':'#FF3D6E'}"/></svg>`,`opacity:${f3(Math.sin(q2*Math.PI))}`)}}
  return camWrap(w,540,1000,1.0+.07*es(lt/d)+settle(lt)*.05)}
function studioBg(){return `<div class="abs" style="inset:0;background:linear-gradient(180deg,#F3E6D6,#E2CDB4)"></div>
   <div class="abs" style="left:640px;top:330px;width:330px;height:420px;border-radius:12px;background:linear-gradient(180deg,#FFD7A8,#FFB97A);border:12px solid #8A5236"></div>
   ${[0,1].map(r=>`<div class="abs" style="left:80px;top:${460+r*250}px;width:440px;height:20px;background:#8A5236;border-radius:4px"></div>`+[0,1,2,3,4].map(i=>`<div class="abs" style="left:${100+i*84}px;top:${360+r*250}px;width:54px;height:100px;border-radius:12px 12px 8px 8px;background:#FAF7F2;border:4px solid #E9DCCB"><div style="height:26px;background:#FF6A00;border-radius:8px 8px 0 0"></div><div style="margin:14px 8px 0;height:8px;background:#E9DCCB;border-radius:4px"></div></div>`).join('')).join('')}
   <div class="abs" style="left:0;top:1450px;width:1080px;height:600px;background:linear-gradient(180deg,#C9A27E,#9A7454)"></div>`}
function shTara(t,lt,d){
  const nm=wordAt('Tara'), k=pop(t,nm), sk=pop(t,wordAt('skincare'));
  let w=studioBg();
  w+=put(FD({arms:'founder',phoneGlow:.6,look:[0,0],mouth:'smirk',brow:t>wordAt('me',1)&&t<nm?'up':'',lid:.1+blink(t,[22.6]),tilt:Math.sin(t*1.8)*1.6,sway:Math.sin(t*2)*2}),540,1680,1.25);
  if(k>0)w+=abs(540,1700,`<div style="display:flex;align-items:center;gap:16px;background:#FAF7F2;border-radius:40px;padding:12px 32px 14px;font-weight:800;font-size:54px;color:#0A0908;box-shadow:0 14px 30px rgba(0,0,0,.25)">Tara <span style="font-size:34px;color:#8A7F76;font-weight:700">· founder</span></div>`,`transform:translate(-50%,0) scale(${f3(L(.5,1,k))});opacity:${f3(P(k,0,.2))}`);
  if(sk>0)w+=abs(250,860,label('12K followers','#0A0908','#FAF7F2',40),`transform:rotate(-6deg) scale(${f3(L(.4,1,sk))});opacity:${f3(P(sk,0,.2))}`);
  return camWrap(w,540,1000,1.0+.06*es(lt/d)+settle(lt)*.05)}
function shQueue(t,lt,d){
  const ex=wordAt('except'), pan=es(P(t,ex-.25,ex+.35));
  let w=sky('day')+city(t,{base:1450,dx:-60,tint:.15})+`<div class="abs" style="left:-600px;top:1450px;width:2400px;height:600px;background:linear-gradient(180deg,#C9B49A,#9A8670)"></div>`;
  w+=put(RK({arms:'custom',la:IDLE_L,ra:OPEN_R,rprop:null,look:[-10,0],mouth:'grin',lid:.2}),900,1700,1.0);
  [0,1,2,3].forEach(i=>{const x=700-i*170+Math.sin(t*2+i)*4;w+=put(SU(i,{arms:'custom',la:IDLE_L,ra:[[370,404],[430,480],[470,470]],rprop:null,look:[10,0],mouth:'smile',bob:-Math.abs(Math.sin(t*4+i))*5}),x,1690,.82)+coin(x+90,1105,74,t*3+i)});
  w+=put(FD({arms:'custom',la:CROSS_LH,ra:CROSS_RH,rprop:null,lhand:true,look:[10,0],mouth:'flat',brow:'skep',lid:.35,tilt:t>ex?Math.sin((t-ex)*14)*3*(1-P(t,ex,ex+.8)):0}),-330,1690,.92);
  return camWrap(w,L(560,-60,pan),1050,1.0+settle(lt)*.05)}
function shLaugh(t,lt,d){
  let w=sky('day')+city(t,{base:1450,dx:-100,tint:.2})+`<div class="abs" style="left:0;top:1450px;width:1080px;height:600px;background:#B9A48A"></div>`;
  [[150,0],[400,2],[650,5],[900,3],[270,4],[780,1]].forEach(([x,i],n)=>{const front=n<4, b=Math.abs(Math.sin(t*16+n));
    w+=put(EX(i,{arms:'idle',look:[0,-4],mouth:'grin',lid:.55,squash:b*.4,bob:-b*10,tilt:Math.sin(t*11+n)*4,ring:0}),x,front?1720:1560,front?1.0:.78,front?'':'filter:brightness(.85)')});
  return camWrap(w,540,1080,1.04+settle(lt)*.06)}
function shTaraDeadpan(t,lt,d){
  let w=studioBg()+`<div class="abs" style="inset:0;background:rgba(40,20,10,.15)"></div>`;
  w+=put(FD({arms:'idle',look:[0,0],mouth:'flat',brow:'skep',lid:.4+blink(t,[28.9]),tilt:-2}),540,2160,2.0);
  return camWrap(w,540,1000,1.0+.05*es(lt/d)+settle(lt)*.05)}
function shBots(t,lt,d){
  const rows=[...Array(11)].map((_,i)=>`<div style="display:flex;align-items:center;gap:22px;padding:18px 30px;border-bottom:2px solid #EFE6DA"><div style="width:84px;height:84px;border-radius:50%;background:#C9C2BA;display:flex;align-items:center;justify-content:center"><svg width="50" height="50" viewBox="0 0 40 40"><circle cx="20" cy="14" r="8" fill="#F3EEE8"/><path d="M5 38 C6 26 34 26 35 38Z" fill="#F3EEE8"/></svg></div>
     <div style="flex:1"><div style="font-weight:800;font-size:38px;color:#0A0908">user_${83721+i}</div><div style="font-weight:600;font-size:28px;color:#A49A91">0 posts · 0 followers</div></div><div style="font-weight:800;font-size:28px;color:#8A7F76;border:3px solid #DDD3C6;border-radius:30px;padding:8px 22px">Following</div></div>`).join('');
  const sc=(lt*110)%(118*3);
  let w=`<div class="abs" style="inset:0;background:radial-gradient(ellipse at 50% 40%,#2A1A12,#0A0706)"></div>`;
  w+=phone(170,250,740,`<div class="abs" style="left:0;right:0;top:250px;bottom:0;overflow:hidden"><div style="transform:translateY(${px(-sc)})">${rows}${rows}</div></div>
     <div class="abs" style="left:0;right:0;top:0;height:250px;background:#FAF7F2;border-bottom:3px solid #EFE6DA;padding:110px 30px 0"><div style="font-weight:800;font-size:46px;color:#0A0908;display:flex;align-items:center;gap:12px">Rocky ${TICK(44)}</div><div style="margin-top:8px;font-weight:700;font-size:32px;color:#8A7F76">Followers · 10,000,000</div></div>`);
  const sus=fin(t,wordAt('nobody'),.6);
  w+=`<div class="abs" style="inset:0;background:radial-gradient(ellipse 55% 45% at 50% 52%,rgba(0,0,0,0),rgba(0,0,0,${f3(.55*sus)}))"></div>`;
  return camWrap(w,540,1080,K(lt,[[0,1.0],[d,1.22,es]])+settle(lt)*.04)}
function shNightfall(t,lt,d){
  const k=es(P(lt,0,1.6)), tk=pop(t,wordAt('11:59'));
  let w=sky('dusk',k,'night')+city(t,{night:k,lit:(i,j)=>k*(rnd(i*13+j)>.25?1:0),bbOn:()=>0});
  w+=`<div class="abs" style="left:240px;top:330px;width:600px;height:240px;border-radius:28px;background:#0E0A0C;border:8px solid #2A2024;opacity:${f3(P(k,.3,.8))}">
     <div class="abs hl" style="left:0;right:0;top:44px;text-align:center;font-size:150px;color:#FF3D3D;letter-spacing:.02em;text-shadow:0 0 40px rgba(255,61,61,.6);transform:scale(${f3(L(1,1.08,tk)*(t>wordAt('11:59')?1:1))})">${t>=wordAt('11:59')?'11:59':(t>(wordAt('11:59')-.6)?'11:58':'11:57')}</div></div>`;
  return camWrap(w,540,1000,1.0+.06*es(lt/d)+settle(lt)*.04)}
function shUpdate(t,lt,d){
  const nb=fin(t,wordAt('update'),.35), del=wordAt('delete'), prog=P(t,wordAt('update')+.2,del-.1), pressed=t>=del;
  let w=`<div class="abs" style="inset:0;background:radial-gradient(ellipse at 50% 40%,#16192A,#05060A)"></div>`;
  w+=phone(170,230,740,`<div style="height:100%;background:linear-gradient(180deg,#0E1018,#151826)">
     <div class="abs" style="left:24px;right:24px;top:${px(L(-200,90,nb))};border-radius:28px;background:rgba(250,247,242,.95);padding:24px 28px;display:flex;gap:20px;align-items:center">
      <div style="width:76px;height:76px;border-radius:20px;background:#FF6A00;display:flex;align-items:center;justify-content:center">${FOLLOW(54)}</div>
      <div><div style="font-weight:800;font-size:34px;color:#0A0908">App update installed</div><div style="font-weight:600;font-size:28px;color:#8A7F76">Silent update · 12 KB</div></div></div>
     <div class="abs" style="left:50px;right:50px;top:520px;text-align:center;font-weight:800;font-size:58px;color:#FAF7F2;opacity:${f3(P(prog,0,.15))}">Fake followers</div>
     <div class="abs" style="left:80px;right:80px;top:640px;height:18px;border-radius:9px;background:#2A2E40;opacity:${f3(P(prog,0,.15))}"><div style="width:${(prog*100).toFixed(1)}%;height:100%;border-radius:9px;background:#FF6A00"></div></div>
     <div class="abs" style="left:50%;top:760px;transform:translateX(-50%) scale(${f3(pressed?1-.08*Math.sin(P(t,del,del+.25)*Math.PI):1)});opacity:${f3(P(prog,.8,1))};width:420px;height:120px;border-radius:60px;background:${pressed?'#7A1F1F':'#FF3D3D'};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:56px;color:#FAF7F2">Delete</div>
     ${pressed?`<div class="abs" style="left:0;right:0;top:930px;text-align:center;font-weight:700;font-size:36px;color:#FF8A8A;opacity:${f3(fin(t,del+.1))}">Deleting worldwide…</div>`:''}</div>`);
  return camWrap(w,540,1000,K(lt,[[0,1.0],[d,1.12,es]])+settle(lt)*.04)}
function shBlackout(t,lt,d){
  const t0=wordAt('Midnight'), t1=wordAt('dark')+.05;
  const front=x=>L(-200,1400,P(t,t0+.2,t1));
  const lit=(i,j)=>{const b=BLD[i];return b.x+b.w*.5<front()?0:1}, bbOn=i=>{const b=BLD[i];return b.x+b.w*.5<front()?0:1};
  let w=sky('night')+city(t,{night:1,lit,bbOn});
  w+=`<div class="abs" style="left:0;top:0;width:1080px;height:1920px;background:#000;opacity:${f3(.35*P(t,t0+.2,t1))}"></div>`;
  w+=abs(540,300,`<div class="hl" style="font-size:120px;color:#FAF7F2;opacity:${f3(1-P(t,t1-.3,t1))}">12:00</div>`,'transform:translateX(-50%)');
  return camWrap(w,540,1000,1.0+.04*es(lt/d)+settle(lt)*.04)}
function shDrop(t,lt,d){
  const dr=wordAt('dropped'), cnt=Math.round(t*60)/60, q=P(cnt,dr,dr+.75), val=t<dr?1e7:L(1e7,1200,Math.pow(eio(q),.6)), shock=t>dr+.6;
  let w=`<div class="abs" style="inset:0;background:radial-gradient(ellipse at 50% 70%,#141826,#03040A)"></div>`;
  w+=abs(540,330,`<div style="font-weight:800;font-size:46px;letter-spacing:.06em;color:#FF6A00">12:01 AM</div>`,'transform:translateX(-50%)');
  w+=abs(540,410,`<div class="hl" style="font-size:${shock?170:150}px;color:${shock?'#FF3D3D':'#FAF7F2'};text-shadow:0 0 40px rgba(255,61,61,${shock?.5:0})">${fmt(val)}</div>`,`transform:translateX(-50%) translateY(${px(t>dr&&!shock?Math.sin(t*90)*6:0)})`);
  w+=put(RK({arms:'custom',la:IDLE_L,ra:PHONE_R,rprop:'phone',phoneGlow:1.5,shades:shock?0:1,look:shock?[0,-2]:[0,8],mouth:shock?'o':'flat',brow:shock?'up':'worry',lid:0,squash:shock?.5:0,headDy:shock?-8:0,bob:shock?Math.sin(t*50)*2:0}),540,2040,1.7,'filter:brightness(.8)');
  w+=`<div class="abs" style="left:240px;top:1100px;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(150,180,255,.22),rgba(150,180,255,0) 65%)"></div>`;
  return camWrap(w,540,1000,1.0+.08*es(lt/d)+settle(lt)*.04)}
function shTow(t,lt,d){
  const x=K(lt,[[0,620],[d,-120,ei]]);
  let w=sky('night')+city(t,{night:1,lit:()=>0,bbOn:()=>0,base:1300,tint:.2})+`<div class="abs" style="left:0;top:1300px;width:1080px;height:700px;background:#14141A"></div>`;
  w+=`<div class="abs" style="left:${px(x-500)};top:1010px;width:700px"><svg viewBox="0 0 520 260" width="100%"><rect x="20" y="70" width="300" height="140" rx="16" fill="#E8B84A"/><rect x="320" y="110" width="160" height="100" rx="14" fill="#C99418"/><rect x="340" y="124" width="80" height="54" rx="8" fill="#9FC7E8"/>
    <text x="170" y="156" text-anchor="middle" font-family="Outfit" font-weight="800" font-size="40" fill="#3A2808">FOLLOWER BANK</text>${[90,240,420].map(c=>`<circle cx="${c}" cy="214" r="34" fill="#151012"/><circle cx="${c}" cy="214" r="15" fill="#8A7F76"/>`).join('')}
    <path d="M20 120 L-40 200" stroke="#2A2523" stroke-width="12"/><rect x="330" y="40" width="20" height="16" rx="4" fill="#FF3D3D" opacity="${Math.sin(t*20)>0?1:.3}"/></svg></div>`;
  w+=car(x+190,1320,1.3,'#E8B84A',false,`transform:rotate(-7deg);transform-origin:0 100%`);
  w+=put(RK({arms:'idle',look:[-10,2],mouth:'o',brow:'worry',lid:0}),930,1760,1.0,'filter:brightness(.7)');
  return camWrap(w,560,1180,1.12+settle(lt)*.05)}
function shSponsors(t,lt,d){
  const names=['GLOW','FIZZ','KICKS','SNAX'], t0=wordAt('disappeared')-.35;
  let w=`<div class="abs" style="inset:0;background:linear-gradient(180deg,#1A1420,#0A0808)"></div>`;
  names.forEach((n,i)=>{const q=P(t,t0+i*.18,t0+i*.18+.3), x=110+(i%2)*450, y=300+Math.floor(i/2)*330;
    w+=q<1?`<div class="abs" style="left:${x}px;top:${y}px;width:400px;height:250px;border-radius:28px;background:${['#FF6A00','#2F8CFF','#3DDC84','#E57A8A'][i]};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:84px;color:#FAF7F2;letter-spacing:-.04em;transform:scale(${f3(1-eo(q)*.6)});opacity:${f3(1-q)}">${n}</div>`:'';
    if(q>0&&q<1)for(let j=0;j<8;j++){const a=j/8*TAU;w+=`<div class="abs" style="left:${px(x+200+Math.cos(a)*q*260-10)};top:${px(y+125+Math.sin(a)*q*200-10)};width:20px;height:20px;border-radius:50%;background:#FAF7F2;opacity:${f3(1-q)}"></div>`}});
  w+=put(RK({arms:'idle',look:[0,-8],mouth:'frown',brow:'worry',lid:.1}),540,2000,1.25,'filter:brightness(.85)');
  return camWrap(w,540,1000,1.0+settle(lt)*.05)}
function shCatUnfollow(t,lt,d){
  const u=wordAt('unfollowed'), done=t>=u+.1;
  let w=`<div class="abs" style="inset:0;background:radial-gradient(ellipse at 50% 40%,#22202A,#08070A)"></div>`;
  w+=phone(170,240,740,`<div style="padding:120px 40px 0;text-align:center"><div style="width:200px;height:200px;border-radius:50%;margin:0 auto;background:#2E2924;border:6px solid #E8B84A;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:90px;color:#E8B84A">R</div>
     <div style="margin-top:22px;font-weight:800;font-size:54px;color:#0A0908;display:flex;align-items:center;justify-content:center;gap:12px">Rocky ${TICK(48)}</div><div style="font-weight:700;font-size:34px;color:#8A7F76;margin-top:8px">1,200 followers</div>
     <div style="margin:50px auto 0;width:420px;height:110px;border-radius:55px;background:${done?'#FF6A00':'#EFE6DA'};display:flex;align-items:center;justify-content:center;font-weight:800;font-size:46px;color:${done?'#0A0908':'#5A4D45'}">${done?'Follow':'Following ✓'}</div>
     ${done?`<div style="margin:40px auto 0;font-weight:700;font-size:34px;color:#B04A5C;opacity:${f3(fin(t,u+.15))}">Unfollowed by @rocky_cat</div>`:''}</div>`);
  const pk=K(t,[[u-.5,0],[u-.05,1,eo],[u+.15,1],[u+.6,0,ei]]);
  w+=`<div class="abs" style="left:${px(L(900,560,pk))};top:${px(L(1700,1120,pk))};width:220px;transform:rotate(-24deg)"><svg viewBox="0 0 120 200" width="100%"><path d="M40 200 L36 80 Q34 40 60 40 Q86 40 84 80 L80 200Z" fill="#8E8886"/><ellipse cx="60" cy="52" rx="34" ry="30" fill="#A7A2A0"/>
     <ellipse cx="60" cy="58" rx="14" ry="12" fill="#E7A6A0"/>${[[38,30],[54,22],[70,22],[84,32]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="8" ry="9" fill="#E7A6A0"/>`).join('')}</svg></div>`;
  w+=`<div class="abs" style="left:640px;top:1460px;width:300px">${cat({lid:.7,tail:Math.sin(t*2)})}</div>`;
  return camWrap(w,540,1000,1.0+.05*es(lt/d)+settle(lt)*.04)}
function shSunrise(t,lt,d){
  const k=es(P(lt,0,1.5));
  let w=sky('night',k,'sunrise')+`<div class="abs" style="left:380px;top:${px(L(1300,980,k))};width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,#FFE2A0,#FF9A4A 60%,rgba(255,154,74,0) 72%)"></div>`+city(t,{night:1-k*.6,lit:()=>0,bbOn:()=>0,base:1260,tint:.15});
  w+=`<div class="abs" style="left:0;top:1260px;width:1080px;height:800px;background:linear-gradient(180deg,#4A2A26,#22140F)"></div>`;
  [[200,'CLOSED'],[540,'SALE?'],[880,'CLOSED']].forEach(([x,s],i)=>{w+=`<div class="abs" style="left:${x-150}px;top:950px;width:300px;height:330px;background:#3A2A28;border:6px solid #2A1C1A"><div style="height:100%;background:repeating-linear-gradient(180deg,#6E625C 0 16px,#5A4E48 16px 22px)"></div></div>
     <div class="abs" style="left:${x-80}px;top:880px;transform:rotate(${i%2?4:-5}deg)">${label('CLOSED','#FAF7F2','#B04A5C',34)}</div>`});
  [0,1,2].forEach(i=>{w+=put(SU(i,{arms:'idle',look:[0,6],mouth:'frown',brow:'worry',lid:.55,squash:.6}),200+i*340,1560,.72,'filter:brightness(.8)')});
  return camWrap(w,540,1080,1.0+.04*es(lt/d)+settle(lt)*.04)}
function shOneOpen(t,lt,d){
  const one=wordAt('one',1), pan=es(P(t,one-1.2,one+.1));
  let w=sky('sunrise')+`<div class="abs" style="left:-1200px;top:1260px;width:3600px;height:800px;background:linear-gradient(180deg,#5A3428,#2A1810)"></div>`;
  [-900,-560,-220].forEach(x=>{w+=`<div class="abs" style="left:${x}px;top:950px;width:300px;height:330px;background:#3A2A28;border:6px solid #2A1C1A"><div style="height:100%;background:repeating-linear-gradient(180deg,#6E625C 0 16px,#5A4E48 16px 22px)"></div></div>`});
  w+=`<div class="abs" style="left:340px;top:760px;width:420px;height:520px;background:#FAF2E6;border:8px solid #FF6A00;box-shadow:0 0 120px rgba(255,138,42,.6)"><div style="height:100px;background:#FF6A00;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:50px;color:#0A0908">TARA SKIN</div>
     <div style="margin:30px auto 0;width:300px;height:300px;background:linear-gradient(180deg,#FFE2C4,#FFC48A);border-radius:12px"></div></div><div class="abs" style="left:420px;top:1110px">${label('OPEN','#3DDC84','#0A2A18',40)}</div>`;
  [0,1,2,3,4].forEach(i=>{w+=put(EX(i,{arms:'idle',look:[-10,0],mouth:'smile',bob:-Math.abs(Math.sin(t*3+i))*4,ring:0}),880+i*150,1640,.72)});
  w+=put(FD({arms:'founder',look:[10,0],mouth:'smile',lid:.1}),250,1640,.8);
  return camWrap(w,L(-560,540,pan),1050,1.0+settle(lt)*.04)}
function shListen(t,lt,d){
  let w=studioBg()+`<div class="abs" style="inset:0;background:rgba(255,160,90,.12)"></div>`;
  w+=put(CR({arms:'creator',gimbal:1,look:[0,0],mouth:'grin',lid:.1,ringGlow:1,bob:-Math.abs(Math.sin(t*4))*5}),540,1480,.95);
  [[150,0],[930,2],[300,5],[780,3]].forEach(([x,i],n)=>{w+=put(EX(i,{arms:'idle',look:[x<540?10:-10,-2],mouth:'smile',lid:.1,headDy:Math.sin(t*5+n)*5,ring:0}),x,2080,1.0);
    for(let j=0;j<2;j++){const q=((t*.8+n*.3+j*.5)%1);w+=abs(x+(j?40:-40),1080-q*260,`<svg width="50" height="50" viewBox="0 0 24 24"><path d="M12 21 C-2 12 4 2 12 7 C20 2 26 12 12 21Z" fill="#FF6A00"/></svg>`,`opacity:${f3(Math.sin(q*Math.PI))}`)}});
  return camWrap(w,540,1080,1.0+.04*es(lt/d)+settle(lt)*.04)}
function monkRoom(){return `<div class="abs" style="inset:0;background:radial-gradient(ellipse at 50% 60%,#3A1E0E,#0A0605)"></div>`}
function shMonk(t,lt,d){
  const sg=wordAt('sunglasses'), on=es(P(lt,0,.9)), gl=P(t,sg,sg+.5);
  let w=monkRoom()+`<div class="abs" style="left:240px;top:380px;width:600px;height:1300px;background:radial-gradient(ellipse at 50% 40%,rgba(255,145,66,${f3(.35*on)}),rgba(255,145,66,0) 70%)"></div>`;
  w+=put(monk2({tw:t*4.2,mouth:'smirk',fit:'street'}),540,1700,1.2,`filter:brightness(${f3(L(.15,1,on))})`,250);
  if(gl>0&&gl<1)w+=abs(L(420,620,gl),880,`<svg width="120" height="120" viewBox="0 0 24 24"><path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10Z" fill="#FFF4D6"/></svg>`,`opacity:${f3(Math.sin(gl*Math.PI))};transform:scale(${f3(.6+Math.sin(gl*Math.PI)*.6)})`);
  return camWrap(w,540,1080,1.0+.06*es(lt/d)+settle(lt)*.04)}
function shMonkQuiet(t,lt,d){
  const b=P(lt,.2,.5), bo=P(lt,.85,1.05);
  let w=monkRoom()+put(monk2({tw:t*4.2,mouth:'smirk',tilt:2,fit:'street'}),540,2260,2.0,'',250);
  if(b>0&&bo<1)w+=abs(560,420,`<div style="background:#FAF7F2;border-radius:50px;padding:20px 50px 30px;font-weight:800;font-size:96px;color:#0A0908;letter-spacing:.1em;line-height:.6">...</div>`,`transform:scale(${f3(eb(b)*(1-eo(bo)))});transform-origin:0 100%`);
  return camWrap(w,540,1000,1.0+settle(lt)*.04)}
function shKabir(t,lt,d){
  const n=wordAt('40,000'), cnt=Math.round(t*60)/60, val=t<n?0:4e4*eo(P(cnt,n,n+.7)), rv=wordAt('real.');
  let w=studioBg()+`<div class="abs" style="inset:0;background:rgba(255,150,80,.1)"></div>`;
  const wall=t>=wordAt('every',4)-.1;
  if(!wall){w+=put(CR({arms:'creator',gimbal:1,look:[0,0],mouth:'smile',lid:.1,ringGlow:1,tilt:Math.sin(t*2)*2,bob:-Math.abs(Math.sin(t*3.6))*4}),540,1620,1.15);
    if(t>=n)w+=abs(540,330,`<div class="hl" style="font-size:140px;color:#FAF7F2;background:rgba(14,10,12,.82);border-radius:40px;padding:14px 46px 26px;box-shadow:0 20px 50px rgba(0,0,0,.3)">${fmt(val)}</div>`,`transform:translateX(-50%) scale(${f3(L(.6,1,pop(t,n,.4)))})`);
    w+=abs(540,1640,`<div style="display:flex;align-items:center;gap:14px;background:#FAF7F2;border-radius:40px;padding:12px 30px 14px;font-weight:800;font-size:54px;color:#0A0908;box-shadow:0 14px 30px rgba(0,0,0,.25)">Kabir</div>`,`transform:translate(-50%,0) scale(${f3(L(.5,1,pop(t,wordAt('Kabir'))))})`);}
  else{let g='';for(let i=0;i<20;i++){const r=Math.floor(i/4),c=i%4, x=80+c*240, y=300+r*250, tk=pop(t,wordAt('every',4)+i*.055,.3);
      g+=`<div class="abs" style="left:${x}px;top:${y}px;width:200px;height:210px;border-radius:30px;background:#FAF7F2;box-shadow:0 10px 24px rgba(0,0,0,.12);overflow:hidden"><div style="width:200px;height:280px;margin-top:20px">${EX(i,{arms:'idle',look:[0,0],mouth:i%3?'smile':'grin',lid:.1,ring:0})}</div></div>
        ${tk>0?abs(x+140,y-14,GTICK(70),`transform:scale(${f3(tk)})`):''}`}
    w+=g; if(t>=rv-.05)w+=abs(540,1580,label('100% real','#3DDC84','#0A2A18',64),`transform:translateX(-50%) scale(${f3(L(.4,1,pop(t,rv)))})`)}
  return camWrap(w,540,1000,1.0+.04*es(lt/d)+settle(lt)*.04)}
function shAdShoot(t,lt,d){
  const bg=wordAt('background.'), push=es(P(t,bg-.35,bg+.4));
  let w=studioBg();
  w+=`<div class="abs" style="left:620px;top:820px;width:300px;height:420px;background:#E9E2D8;border:6px solid #C9BFB2;transform:rotate(-4deg)"></div>`;
  w+=put(RK({arms:'custom',la:[[150,404],[200,330],[330,300]],ra:[[370,404],[420,330],[380,280]],rprop:null,lhand:true,shades:1,look:[-8,2],mouth:t>bg?'smirk':'frown',brow:'worry',lid:.2,bob:Math.sin(t*2)*2}),770,1620,.82,'filter:brightness(.92)');
  w+=put(CR({arms:'creator',gimbal:1,look:[0,0],mouth:'grin',lid:.1,ringGlow:1}),360,1720,1.05);
  w+=`<div class="abs" style="left:430px;top:1470px;width:90px;height:150px;border-radius:16px 16px 10px 10px;background:#FAF7F2;border:4px solid #E9DCCB"><div style="height:44px;background:#FF6A00;border-radius:12px 12px 0 0"></div></div>`;
  w+=abs(330,250,label('● REC','#FF3D3D','#FAF7F2',40),'');
  return camWrap(w,L(540,760,push),L(1000,1120,push),L(1.0,1.6,push)+settle(lt)*.04)}
function shAsk(t,lt,d){
  let w=studioBg()+`<div class="abs" style="inset:0;background:rgba(30,15,8,.25)"></div>`;
  w+=put(FD({arms:'idle',look:[0,0],mouth:t>wordAt('paying')?'smirk':'flat',brow:t>wordAt('what')?'up':'',lid:.15+blink(t,[71.0]),tilt:K(lt,[[0,0],[1.2,-5]])}),540,2120,1.9);
  return camWrap(w,540,1000,K(lt,[[0,1.0],[d,1.1,es]])+settle(lt)*.04)}
function shEnd(t,lt,d){
  let w=monkRoom()+`<div class="abs" style="left:0;top:1440px;width:1080px;height:600px;background:linear-gradient(180deg,#1A0C06,#050302)"></div>`;
  const sh=lt>1.3;
  const o={tw:t*4.2,mouth:sh?'grin':'smirk',fit:'street'};
  if(sh){const k=eo(P(lt,1.3,1.6));o.ra=LJ(CROSS_R,SHADE_R,k).map((p,i)=>i===2?[p[0],p[1]-6*Math.sin(P(lt,1.6,1.92)*Math.PI)]:p);o.shades=eo(P(lt,1.42,1.64))}
  w+=put(monk2(o),540,1560,.8,'',250);
  const lk=P(lt,.25,1.05);
  w+=`<div class="abs" style="left:0;width:1080px;top:470px;text-align:center;opacity:${f3(es(lk))};transform:scale(${L(.96,1,eo(lk)).toFixed(4)});white-space:nowrap;line-height:1"><span style="font-weight:800;font-size:110px;letter-spacing:-.04em;color:#FAF7F2">Creator</span><span style="font-family:'Baloo 2';font-weight:800;font-size:118px;color:#FF6A00;position:relative;top:5px;margin-left:18px">चाहिए?</span></div>`;
  w+=`<div class="abs" style="left:0;width:1080px;top:340px;text-align:center;font-weight:700;font-size:40px;color:#FFB27A;opacity:${f3(fin(lt,.05,.5))}">Creators with a real audience.</div>`;
  w+=`<div class="abs" style="left:0;width:1080px;top:640px;text-align:center;font-weight:400;font-size:40px;letter-spacing:.02em;color:#B9AFA6;opacity:${f3(fin(lt,.7,.6))}">creatorchahiye.com</div>`;
  return w}

/* ---------- timeline ---------- */
const cut=(w,n=0)=>wordAt(w,n)-.1;
const SHOTS=[[0,shCold],[cut('even'),shCatLeaves],[cut('let'),shRewind],[cut('in',1),shDayCity],[cut('a',0),shCoffee],[cut('rent'),shRent],[cut('blue'),shSignal],[cut('and',0),shRocky],
  [cut('me',1),shTara],[cut('every',1),shQueue],[cut('everyone'),shLaugh],[cut('they'),shTaraDeadpan],[cut('but'),shBots],[cut('then'),shNightfall],[cut('the',2),shUpdate],[cut('midnight'),shBlackout],
  [cut('12:01',1),shDrop],[cut('the',4),shTow],[cut('his',2),shSponsors],[cut('and',1),shCatUnfollow],[cut('by'),shSunrise],[cut('every',3),shOneOpen],[cut('i',3),shListen],
  [cut('a',3),shMonk],[cut('he'),shMonkQuiet],[cut('like'),shKabir],[cut('and',2),shAdShoot],[cut('so'),shAsk],[WORDS[WORDS.length-1][2]+.35,shEnd]];
const END=SHOTS[SHOTS.length-1][0]+3.4;

/* ---------- word captions ---------- */
const EMPH=/^(12:01|everything|cat|followers|followers\.|do\.|Rocky|Rocky,|Rocky's|10|million|50|200,000|Tara,|except|me\.|broke,|night,|11:59\.|delete\.|dark\.|1,200\.|unfollowed|one,|listen\.|sunglasses|word,|Kabir,|40,000|real\.|background\.|paying)$/i;
function caption(t){
  if(t>=SHOTS[SHOTS.length-1][0])return '';
  let cur=null;for(let i=0;i<WORDS.length;i++){const w=WORDS[i], nx=WORDS[i+1];if(t>=w[1]-.02&&(t<(nx?Math.min(nx[1]-.02,w[2]+.45):w[2]+.45)))cur=[w,i]}
  if(!cur)return '';
  const [w]=cur, k=P(t,w[1]-.02,w[1]+.1), em=EMPH.test(w[0]);
  return `<div class="abs" style="left:0;width:1080px;top:1230px;text-align:center"><span style="display:inline-block;font-weight:800;font-size:${em?112:96}px;letter-spacing:-.03em;color:${em?'#FF8A2A':'#FAF7F2'};
    -webkit-text-stroke:14px #0A0908;paint-order:stroke fill;text-shadow:0 10px 26px rgba(0,0,0,.55);transform:scale(${f3(L(1.22,1,eo(k)))});opacity:${f3(P(k,0,.4))}">${w[0].replace(/,$/,'')}</span></div>`}

/* ---------- grain + vignette ---------- */
const GRAIN=(()=>{const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d'),d=x.createImageData(512,512);let s=20281;const r=()=>{s|=0;s=s+0x6D2B79F5|0;let q=Math.imul(s^s>>>15,1|s);q=q+Math.imul(q^q>>>7,61|q)^q;return((q^q>>>14)>>>0)/4294967296};
  for(let i=0;i<d.data.length;i+=4){const v=128+(r()+r()+r()-1.5)*120;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0);return c.toDataURL('image/png')})();
const gst=document.createElement('style');gst.textContent=`.grain{background-image:url(${GRAIN});background-size:256px 256px}`;document.head.appendChild(gst);
const fx=f=>`<div class="abs" style="inset:0;background:radial-gradient(ellipse 76% 64% at 50% 47%,rgba(0,0,0,0) 55%,rgba(0,0,0,.3) 80%,rgba(0,0,0,.7) 100%)"></div>
  <div class="abs grain" style="inset:0;opacity:.09;mix-blend-mode:overlay;background-position:${Math.floor(rnd(f)*256)}px ${Math.floor(rnd(f+.5)*256)}px"></div>`;

/* ---------- frame ---------- */
function shotAt(t){let i=0;for(let j=0;j<SHOTS.length;j++)if(t>=SHOTS[j][0])i=j;return i}
function render(t){
  t=C(t,0,END); HU=0; const f=Math.round(t*60), i=shotAt(t), t0=SHOTS[i][0], t1=i+1<SHOTS.length?SHOTS[i+1][0]:END;
  stage.innerHTML=SHOTS[i][1](t,t-t0,t1-t0)+caption(t)+fx(f)}
window.render=render; window.DURATION=END;
window.cues=()=>({END,cuts:SHOTS.map(s=>+s[0].toFixed(3)),names:SHOTS.map(s=>s[1].name),words:WORDS});

function renderThumb(){
  const t=wordAt('dropped')+.9; HU=0;
  stage.innerHTML=shDrop(t,4,4.2)+`<div class="abs" style="left:0;top:0;width:1080px;height:760px;background:linear-gradient(180deg,rgba(3,4,10,.85),rgba(3,4,10,0))"></div>
   <div class="abs hl cream" style="left:0;width:1080px;text-align:center;top:600px;font-size:104px">Followers = money.</div>
   <div class="abs hl" style="left:0;width:1080px;text-align:center;top:716px;font-size:92px;color:#FF6A00">Until 12:01 AM.</div>`+fx(3)}
window.renderThumb=renderThumb;
render(0);
