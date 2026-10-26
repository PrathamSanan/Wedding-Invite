document.addEventListener("DOMContentLoaded",()=>{
const $$=s=>Array.from(document.querySelectorAll(s));
const mob=matchMedia("(max-width:900px)").matches,rm=matchMedia("(prefers-reduced-motion:reduce)").matches;
const G=window.gsap,ST=window.ScrollTrigger,anim=!!G&&!rm;
const onIntro=fn=>window.introDone?fn():document.addEventListener("intro:done",fn,{once:true});
let burst=()=>{};

/* ---- Canvas: petals + hearts, sparkle trail, bursts ---- */
if(!rm){
const cv=document.createElement("canvas");cv.className="fx-canvas";cv.setAttribute("aria-hidden","true");document.body.appendChild(cv);
const cx=cv.getContext("2d");let W=0,H=0;
const size=()=>{const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0)};
size();
let rt;addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(size,120)});
const cols=["#dfb743","#fce6ab","#e8742c","#b3203f","#f4a3b5"],pink=["#e8657a","#f4a3b5","#dfb743","#fce6ab"],R=Math.random;
const pick=a=>a[(R()*a.length)|0];

/* shapes: 0 circle, 1 heart, 2 four-point sparkle */
const heart=s=>{cx.beginPath();cx.moveTo(0,s*.9);cx.bezierCurveTo(-s*1.3,s*.1,-s*.8,-s*.9,0,-s*.3);cx.bezierCurveTo(s*.8,-s*.9,s*1.3,s*.1,0,s*.9);cx.closePath()};
const star=s=>{cx.beginPath();cx.moveTo(0,-s);cx.quadraticCurveTo(0,0,s,0);cx.quadraticCurveTo(0,0,0,s);cx.quadraticCurveTo(0,0,-s,0);cx.quadraticCurveTo(0,0,0,-s);cx.closePath()};

const mk=top=>{const h=R()<.32;return{x:R()*W,y:top?-20:R()*H,s:h?5+R()*5:5+R()*7,h,r:R()*6,vr:(R()-.5)*.04,vy:.5+R()*.9,vx:(R()-.5)*.4,ph:R()*6,a:.22+R()*.38,c:h?pick(pink):pick(cols)}};
const petals=Array.from({length:mob?14:28},()=>mk(false));
let sparks=[];

burst=(x,y,n=60,hearts=.35)=>{for(let i=0;i<n;i++){const a=R()*6.283,v=2+R()*6;sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-2,l:1,d:.012+R()*.015,s:2+R()*3,c:pick(pink),k:R()<hearts?1:(R()<.5?2:0),g:.12})}};
window.fxBurst=burst;

let last=0;
if(!mob)addEventListener("mousemove",e=>{const t=performance.now();if(t-last<50)return;last=t;sparks.push({x:e.clientX,y:e.clientY,vx:(R()-.5)*1.2,vy:R()*.8-.4,l:.9,d:.028,s:3+R()*2.5,c:pick(pink),k:R()<.4?1:2,g:.04})},{passive:true});

function loop(){
cx.clearRect(0,0,W,H);
for(const p of petals){
p.y+=p.vy;p.ph+=.03;p.x+=Math.sin(p.ph)*.6+p.vx;p.r+=p.vr;
if(p.y>H+20||p.x<-30||p.x>W+30)Object.assign(p,mk(true));
cx.save();cx.translate(p.x,p.y);cx.globalAlpha=p.a;cx.fillStyle=p.c;
if(p.h){cx.rotate(Math.sin(p.ph)*.4);heart(p.s);cx.fill()}
else{cx.rotate(p.r);cx.scale(1,Math.abs(Math.cos(p.ph))*.7+.3);cx.beginPath();cx.ellipse(0,0,p.s,p.s*.55,0,0,6.283);cx.fill()}
cx.restore()}
sparks=sparks.filter(s=>s.l>0);
for(const s of sparks){
s.x+=s.vx;s.y+=s.vy;s.vy+=s.g;s.vx*=.98;s.l-=s.d;
cx.save();cx.translate(s.x,s.y);cx.globalAlpha=Math.max(0,s.l);cx.fillStyle=s.c;
if(s.k===1){cx.rotate(s.vx*.08);heart(s.s)}else if(s.k===2)star(s.s*1.4);else{cx.beginPath();cx.arc(0,0,s.s*.6,0,6.283)}
cx.fill();cx.restore()}
requestAnimationFrame(loop)}
loop();

/* welcome burst once the envelope has finished */
onIntro(()=>setTimeout(()=>burst(innerWidth/2,innerHeight/2,mob?60:90),500));

/* tiny heart pop wherever you tap */
document.addEventListener("click",e=>{
const b=e.target.closest(".gold-button,.outline-button");
if(b){const r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,70)}
else if(!e.target.closest("input,textarea,select,.rsvp-modal-card,.lightbox"))burst(e.clientX,e.clientY,7,.8)});
}

/* ---- Cute: rising hearts from the & medallion ---- */
const sym=document.querySelector(".couple-symbol");
if(sym&&!rm&&"IntersectionObserver"in window){
let timer=null;
const spawn=()=>{
const h=document.createElement("span");h.className="love-heart";h.textContent=Math.random()>.25?"♥":"✦";
h.style.fontSize=8+Math.random()*10+"px";h.style.color=["#e8657a","#f4a3b5","#fce6ab"][(Math.random()*3)|0];
sym.appendChild(h);
const dx=(Math.random()-.5)*70;
const a=h.animate([{transform:"translate(-50%,-50%) scale(.3)",opacity:0},{opacity:1,offset:.2},{transform:`translate(calc(-50% + ${dx}px),-190%) scale(1.1) rotate(${dx/3}deg)`,opacity:0}],{duration:2200+Math.random()*900,easing:"ease-out"});
a.onfinish=()=>h.remove()};
new IntersectionObserver(es=>es.forEach(e=>{
if(e.isIntersecting&&!timer)timer=setInterval(spawn,650);
else if(!e.isIntersecting&&timer){clearInterval(timer);timer=null}}),{threshold:.3}).observe(sym)}

/* ---- Cute: twinkling sparkles around the hero ---- */
const hero=document.querySelector(".hero");
if(hero&&!rm){
const box=document.createElement("div");box.className="hero-sparkles";box.setAttribute("aria-hidden","true");
for(let i=0;i<(mob?9:16);i++){const s=document.createElement("span");s.textContent="✦";
s.style.left=6+Math.random()*88+"%";s.style.top=10+Math.random()*78+"%";s.style.fontSize=8+Math.random()*12+"px";
s.style.setProperty("--d",2.6+Math.random()*3+"s");s.style.setProperty("--delay",-Math.random()*5+"s");box.appendChild(s)}
hero.appendChild(box)}

/* ---- Mobile menu stagger ---- */
$$(".mobile-menu-inner>*").forEach((el,i)=>el.style.setProperty("--i",i));

/* ---- RSVP: confetti of hearts when the form is sent ---- */
const form=document.getElementById("rsvpForm");
if(form)form.addEventListener("submit",()=>{if(window.fxBurst)setTimeout(()=>window.fxBurst(innerWidth/2,innerHeight/2,110,.6),150)});

if(!anim)return;

/* ---- Headline word-mask reveal ---- */
const split=el=>{const walk=n=>Array.from(n.childNodes).forEach(c=>{
if(c.nodeType===3){const f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){f.append(" ");return}
const w=document.createElement("b"),i=document.createElement("b");w.className="w";i.className="wi";i.textContent=t;w.append(i);f.append(w)});c.replaceWith(f)}
else if(c.nodeType===1&&c.tagName!=="BR")walk(c)});walk(el);return el.querySelectorAll(".wi")};
if(ST)$$("h2").filter(h=>!h.closest(".final")).forEach(h=>{
const w=split(h);G.from(w,{yPercent:115,rotate:5,duration:1,stagger:.09,ease:"power4.out",scrollTrigger:{trigger:h,start:"top 88%"}})});

/* ---- Hero: Ken Burns (after intro) + parallax ---- */
G.set(".hero-image img",{scale:1.18});
onIntro(()=>G.to(".hero-image img",{scale:1,duration:3.2,ease:"power2.out"}));
if(ST){
G.to(".hero-image",{y:()=>innerHeight*.12,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom top",scrub:true}});
G.to(".hero-content",{y:-60,opacity:.15,ease:"none",scrollTrigger:{trigger:".hero",start:"top top",end:"bottom 20%",scrub:true}});
$$(".gold-line").filter(l=>!l.closest(".hero")).forEach(l=>G.from(l,{scaleX:0,duration:1.2,ease:"power3.out",scrollTrigger:{trigger:l,start:"top 92%"}}));
$$(".portrait img").forEach(img=>G.from(img,{scale:1.25,duration:1.6,ease:"power3.out",scrollTrigger:{trigger:img,start:"top 90%"}}));
$$(".venue-image img,.final-image img").forEach(img=>G.fromTo(img,{scale:1.22},{scale:1,ease:"none",scrollTrigger:{trigger:img.closest("section"),start:"top bottom",end:"bottom top",scrub:true}}));

/* cute: gallery photos pop in like little polaroids */
$$(".gallery-item img").forEach((img,i)=>G.from(img,{scale:.82,rotate:i%2?4:-4,opacity:0,duration:1,ease:"back.out(1.6)",scrollTrigger:{trigger:img,start:"top 92%"}}));

/* cute: hearts shower when the final section arrives */
const fin=document.querySelector(".final");
if(fin&&window.fxBurst)ST.create({trigger:fin,start:"top 55%",once:true,onEnter:()=>{window.fxBurst(innerWidth*.25,innerHeight*.35,40,.7);setTimeout(()=>window.fxBurst(innerWidth*.75,innerHeight*.3,40,.7),250);setTimeout(()=>window.fxBurst(innerWidth*.5,innerHeight*.45,60,.7),500)}});
}

/* ---- 3D tilt (desktop) ---- */
if(!mob)$$(".portrait,.event-card").forEach(el=>{
G.set(el,{transformPerspective:900});
const rx=G.quickTo(el,"rotationX",{duration:.5}),ry=G.quickTo(el,"rotationY",{duration:.5});
el.addEventListener("mousemove",e=>{const r=el.getBoundingClientRect();ry((e.clientX-r.left)/r.width*10-5);rx(-((e.clientY-r.top)/r.height*10-5))});
el.addEventListener("mouseleave",()=>{rx(0);ry(0)})});

/* ---- Countdown tick (only when a value really changes) ---- */
["days","hours","minutes","seconds"].forEach(id=>{const el=document.getElementById(id);if(!el)return;let last=el.textContent;
new MutationObserver(()=>{if(el.textContent===last)return;last=el.textContent;G.fromTo(el,{y:-12,opacity:.25},{y:0,opacity:1,duration:.4,ease:"power2.out"})}).observe(el,{childList:true,characterData:true,subtree:true})});
});
