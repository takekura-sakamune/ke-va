/* Local, synthesized sound effects. No audio downloads or autoplay required. */
(() => {
 const root=globalThis;
 let ctx=null,master=null,enabled=true,motion=true,unlocked=false;
 const reduce=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
 try{enabled=localStorage.getItem('keva-sound')!=='off';motion=localStorage.getItem('keva-motion')!=='off'}catch{}
 const layer=document.createElement('div');layer.id='fx-layer';layer.setAttribute('aria-hidden','true');document.body.append(layer);
 function update(){
  const sound=document.getElementById('sound-toggle'),anim=document.getElementById('motion-toggle');
  if(sound){sound.textContent=enabled?'♪ 音：オン':'♪ 音：オフ';sound.setAttribute('aria-pressed',String(enabled))}
  if(anim){anim.textContent=motion?'✧ 演出：オン':'✧ 演出：オフ';anim.setAttribute('aria-pressed',String(motion))}
  document.documentElement.classList.toggle('motion-off',!motion);
 }
 async function unlock(){
  unlocked=true;
  if(!enabled)return;
  try{const Audio=root.AudioContext||root.webkitAudioContext;if(!Audio)return;if(!ctx){ctx=new Audio();master=ctx.createGain();master.gain.value=.2;master.connect(ctx.destination)}if(ctx.state==='suspended')await ctx.resume()}catch{}
 }
 function tone(f,time,duration,type='sine',volume=.25,slide=null){
  if(!ctx||!master)return;
  const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(f,time);if(slide)osc.frequency.exponentialRampToValueAtTime(slide,time+duration);
  gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(volume,time+.012);gain.gain.exponentialRampToValueAtTime(.001,time+duration);
  osc.connect(gain);gain.connect(master);osc.start(time);osc.stop(time+duration+.025);osc.onended=()=>{osc.disconnect();gain.disconnect()};
 }
 let paperBuffer=null;
 function paper(time,duration=.17,strength=.5){
  if(!ctx||!master)return;
  if(!paperBuffer){
   paperBuffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.4),ctx.sampleRate);
   const samples=paperBuffer.getChannelData(0);
   for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
  }
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),low=ctx.createBiquadFilter(),gain=ctx.createGain();
  source.buffer=paperBuffer;source.playbackRate.value=.9+Math.random()*.2;
  filter.type='highpass';filter.frequency.value=750;
  low.type='lowpass';low.frequency.setValueAtTime(6500,time);low.frequency.exponentialRampToValueAtTime(2400,time+duration);
  // Two uneven swishes give the dry texture of card edges rubbing together.
  gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(strength,time+.018);
  gain.gain.linearRampToValueAtTime(strength*.22,time+duration*.42);
  gain.gain.linearRampToValueAtTime(strength*.65,time+duration*.59);
  gain.gain.exponentialRampToValueAtTime(.001,time+duration);
  source.connect(filter);filter.connect(low);low.connect(gain);gain.connect(master);
  source.start(time,Math.random()*.08,duration);source.stop(time+duration+.02);
  source.onended=()=>{source.disconnect();filter.disconnect();low.disconnect();gain.disconnect()};
 }
 function sound(kind){
  if(!enabled||!unlocked||!ctx||ctx.state!=='running'||document.hidden)return;
  const t=ctx.currentTime+.01;
  const notes=(seq,step=.09,duration=.25)=>seq.forEach((f,i)=>tone(f,t+i*step,duration,'sine',.24));
  if(kind==='draw')paper(t,.14,.45);
  else if(kind==='publish')paper(t,.22,.55);
  else if(kind==='use'){paper(t,.17,.5);tone(180,t+.12,.09,'sine',.1,95)}
  else if(kind==='answer')notes([880,1175],.07,.22);
  else if(kind==='raise')notes([262,392,523,784],.1,.35);
  else if(kind==='win')notes([523,659,784,1046],.13,.55);
  else if(kind==='lose')notes([392,349,294,262],.15,.4);
  else if(kind==='tie')notes([392,523,392],.14,.4);
  else if(kind==='predict')notes([440,659],.16,.4);
  else if(kind==='start')notes([262,392,523],.1,.3);
 }
 function animate(el,frames,options){
  if(!motion||reduce?.matches||typeof el.animate!=='function')return Promise.resolve();
  try{return el.animate(frames,{...options,easing:'cubic-bezier(.2,.7,.2,1)'}).finished.catch(()=>{})}catch{return Promise.resolve()}
 }
 function popup(text,kind='notice',symbol='✧'){
  const el=document.createElement('div');el.className='fx-popup fx-'+kind;
  const mark=document.createElement('span');mark.className='fx-symbol';mark.textContent=symbol;
  const label=document.createElement('strong');label.textContent=text;el.append(mark,label);layer.append(el);
  return el;
 }
 async function flash(text,kind,symbol){
  if(!motion||reduce?.matches)return;
  const el=popup(text,kind,symbol);
  try{await animate(el,[{opacity:0,transform:'translateY(18px) scale(.94)'},{opacity:1,transform:'translateY(0) scale(1)',offset:.2},{opacity:1,offset:.75},{opacity:0,transform:'translateY(-15px) scale(1.03)'}],{duration:kind==='raise'?900:650})}finally{el.remove()}
 }
 async function card(data){
  sound(data.mode);
  if(!motion||reduce?.matches)return;
  const el=popup(`${data.n} ${data.name}`,data.mode,data.symbol);
  if(data.image){const img=document.createElement('img');img.className='fx-card-art';img.src=data.image;img.alt=`${data.n} ${data.name}`;el.prepend(img);el.classList.add('fx-image-card')}
  const caption=document.createElement('small');caption.textContent=`${data.p===0?'あなた':'CPU'}が${data.mode==='publish'?'公開':'使用'}`;el.append(caption);
  try{await animate(el,[{opacity:0,transform:data.mode==='publish'?'perspective(600px) rotateY(-85deg) scale(.85)':'translateY(60px) rotate(-6deg) scale(.8)'},{opacity:1,transform:'perspective(600px) rotateY(0) translateY(0) scale(1)',offset:.35},{opacity:1,offset:.8},{opacity:0,transform:'translateY(-20px) scale(.95)'}],{duration:650})}finally{el.remove()}
 }
 function highlight(selector){const el=document.querySelector(selector);if(el)void animate(el,[{boxShadow:'0 0 0 2px #e3c88a, 0 0 28px #e3c88a66'},{boxShadow:'0 0 0 0 transparent'}],{duration:850})}
 let lastDealSound=-1;
 async function deal(data){
  if(ctx&&ctx.currentTime-lastDealSound>.08){sound('draw');lastDealSound=ctx.currentTime}
  if(!motion||reduce?.matches)return;
  const source=document.querySelector('#deck-stack .card'),target=document.querySelector(data.target);
  if(!source||!target||!source.getBoundingClientRect||!target.getBoundingClientRect)return;
  const from=source.getBoundingClientRect(),to=target.getBoundingClientRect();
  const flying=source.cloneNode(true);flying.classList.add('dealing-card');
  Object.assign(flying.style,{position:'fixed',left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px',minHeight:'0',margin:'0',zIndex:'60',pointerEvents:'none'});document.body.append(flying);
  try{await animate(flying,[{transform:'translate(0,0) rotate(0deg)',opacity:1},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) rotate(-7deg)`,opacity:1,offset:.85},{transform:`translate(${to.left-from.left}px,${to.top-from.top}px) rotate(0deg)`,opacity:1}],{duration:280})}finally{flying.remove()}
 }
 root.KevaFX={
  async play(kind,data={}){
   try{
    if(kind==='deal')return await deal(data);
    if(kind==='card')return await card(data);
    sound(kind);
    if(kind==='draw'){void flash(`${data.p===0?'あなた':'CPU'}が${data.count}枚ドロー`,'draw','▱');return}
    if(kind==='answer'){highlight('#intel');highlight('#own-intel');return}
    if(kind==='raise')return await flash(`${data.p===0?'あなた':'CPU'}がレイズ ×2`,'raise','♢');
    if(kind==='predict')return await flash('最後の予想へ','predict','⌖');
    if(kind==='start'){highlight('#table');return}
    if(['win','lose','tie'].includes(kind)){highlight('.result');document.querySelectorAll('[data-seat="1"] .card').forEach(el=>void animate(el,[{transform:'rotateY(-85deg)',opacity:.2},{transform:'rotateY(0)',opacity:1}],{duration:600}));}
   }catch{/* Effects never interrupt game progression. */}
  },
  unlock,
  toggleSound(){enabled=!enabled;try{localStorage.setItem('keva-sound',enabled?'on':'off')}catch{}if(master)master.gain.value=enabled ? .2 : 0;if(enabled)void unlock().then(()=>sound('answer'));update()},
  toggleMotion(){motion=!motion;try{localStorage.setItem('keva-motion',motion?'on':'off')}catch{}update()}
 };
 document.addEventListener('pointerdown',()=>void unlock(),{passive:true});
 document.addEventListener('keydown',()=>void unlock(),{passive:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&ctx?.state==='running')void ctx.suspend().catch(()=>{})});
 document.getElementById('sound-toggle')?.addEventListener('click',()=>root.KevaFX.toggleSound());
 document.getElementById('motion-toggle')?.addEventListener('click',()=>root.KevaFX.toggleMotion());
 update();
})();
