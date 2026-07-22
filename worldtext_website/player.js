
"use strict";
(() => {
  const INITIAL = Number(window.WORLDTEXT_START_CHAPTER || 1) - 1;
  const LOCKED = Boolean(window.WORLDTEXT_LOCK_CHAPTER);
  let collection = window.WORLDTEXT_COLLECTION;
  if (!collection || !Array.isArray(collection.twins)) throw new Error("Worldtext collection missing.");

  const $ = id => document.getElementById(id);
  const canvas = $("film"), cx = canvas.getContext("2d", {alpha:false});
  const image = cx.createImageData(128,96);
  const SH = [255,219,182,146,109,73,36,0];
  const FPS = Number(collection.fps || 8);

  let twins = collection.twins;
  let offsets = [];
  let total = 0;
  let playing = false;
  let suiteTime = 0;
  let lastTick = performance.now();
  let lastFrameKey = "";
  let activeChapter = -1;
  let activeHead = -1;
  let voiceOn = true;
  let scoreOn = false;
  let audioContext = null;
  let masterGain = null;
  let lastSpokenKey = "";
  let dragTimeline = false;

  const workOf = twin => {
    const fixed = new Set(["format","v","saved","width","height","fps","me","root","active","collaborator","frames","activePath","tree","nodes","edl","motion_cut","soundtrack"]);
    const key = Object.keys(twin).find(k => !fixed.has(k));
    return {key, data: key ? twin[key] : {}};
  };

  const rebuildOffsets = () => {
    offsets = [];
    total = 0;
    twins.forEach((t,i) => {
      const duration = Number(t.frames || 0) / Number(t.fps || FPS);
      offsets.push({i,start:total,end:total+duration,duration});
      total += duration;
    });
    $("timeline").setAttribute("aria-valuemax", String(total));
    $("duration").textContent = fmt(LOCKED ? offsets[INITIAL].duration : total);
  };
  rebuildOffsets();

  const allowedRange = () => LOCKED ? offsets[Math.max(0,Math.min(twins.length-1,INITIAL))] : {start:0,end:total,duration:total};

  function fmt(t){
    t=Math.max(0,Number(t)||0);
    const m=Math.floor(t/60), s=t-m*60;
    return String(m).padStart(2,"0")+":"+(s<10?"0":"")+s.toFixed(1);
  }

  function chapterAt(t){
    for(let i=offsets.length-1;i>=0;i--) if(t >= offsets[i].start - .0001) return i;
    return 0;
  }

  function headsFor(twin){
    const heads=[];
    (twin.edl||[]).forEach((e,k)=>{
      if(e.duration_seconds!==undefined || e.screen_text!==undefined || e.audio){
        heads.push({k,frame:Number(e.frame||k+1),e});
      }
    });
    return heads;
  }

  function headAt(heads, frameIndex){
    let ans=0;
    for(let i=0;i<heads.length;i++){
      if(heads[i].frame-1<=frameIndex) ans=i; else break;
    }
    return heads[ans] || {k:0,frame:1,e:{}};
  }

  function currentState(){
    const ci = LOCKED ? INITIAL : chapterAt(suiteTime);
    const o = offsets[ci], twin=twins[ci];
    const localTime=Math.max(0,Math.min(o.duration-.0001,suiteTime-o.start));
    const frameIndex=Math.max(0,Math.min(twin.frames-1,Math.floor(localTime*(twin.fps||FPS))));
    const heads=headsFor(twin);
    const head=headAt(heads,frameIndex);
    const next=heads[Math.min(heads.length-1,heads.indexOf(head)+1)];
    const beatStart=(head.frame-1)/(twin.fps||FPS);
    const beatDuration=Number(head.e.duration_seconds || ((next.frame-head.frame)/(twin.fps||FPS)) || 1);
    const beatLocal=Math.max(0,Math.min(beatDuration,localTime-beatStart));
    return {ci,o,twin,localTime,frameIndex,heads,head,beatStart,beatDuration,beatLocal};
  }

  function putPixel(x,y,v){
    if(x<0||x>127||y<0||y>95)return;
    const q=(y*128+x)*4;
    image.data[q]=image.data[q+1]=image.data[q+2]=v;
    image.data[q+3]=255;
  }

  function drawFrame(twin,fi){
    const node=twin.nodes[Math.max(0,Math.min(twin.frames-1,fi))];
    const d=image.data;
    for(let q=0;q<d.length;q+=4){d[q]=d[q+1]=d[q+2]=255;d[q+3]=255}
    for(const cmd of (node.commands||[])){
      const p=cmd.split(" ");
      if(p[0]==="CLR"){
        const bg=SH[Number(p[1])];
        for(let q=0;q<d.length;q+=4){d[q]=d[q+1]=d[q+2]=bg;d[q+3]=255}
      }else if(p[0]==="PNT"){
        const x=Math.round(+p[1]),y=Math.round(+p[2]),w=Math.max(1,Math.round(+p[3])),h=Math.max(1,Math.round(+p[4])),v=SH[+p[5]];
        for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)putPixel(xx,yy,v);
      }else if(p[0]==="LIN"){
        let x0=Math.round(+p[1]),y0=Math.round(+p[2]);
        const x1=Math.round(+p[3]),y1=Math.round(+p[4]),v=SH[+p[5]];
        const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;
        let err=dx+dy;
        for(let g=0;g<512;g++){
          putPixel(x0,y0,v);
          if(x0===x1&&y0===y1)break;
          const e2=2*err;
          if(e2>=dy){err+=dy;x0+=sx}
          if(e2<=dx){err+=dx;y0+=sy}
        }
      }
    }
    cx.putImageData(image,0,0);
  }

  function buildTimeline(){
    const tl=$("timeline");
    tl.querySelectorAll(".segment,.beat-mark,.chapter-mark").forEach(n=>n.remove());
    const range=allowedRange();
    if(LOCKED){
      const twin=twins[INITIAL], heads=headsFor(twin);
      const seg=document.createElement("div");seg.className="segment active";seg.style.left="0";seg.style.width="100%";tl.appendChild(seg);
      heads.forEach(h=>{
        const m=document.createElement("div");m.className="beat-mark";
        m.style.left=(((h.frame-1)/twin.frames)*100)+"%";tl.appendChild(m);
      });
    }else{
      offsets.forEach((o,i)=>{
        const seg=document.createElement("div");seg.className="segment";seg.dataset.i=i;
        seg.style.left=(o.start/total*100)+"%";seg.style.width=(o.duration/total*100)+"%";tl.appendChild(seg);
        const mark=document.createElement("div");mark.className="chapter-mark";mark.style.left=(o.start/total*100)+"%";tl.appendChild(mark);
        const heads=headsFor(twins[i]);
        heads.forEach(h=>{
          const global=o.start+(h.frame-1)/(twins[i].fps||FPS);
          const m=document.createElement("div");m.className="beat-mark";m.style.left=(global/total*100)+"%";tl.appendChild(m);
        });
      });
    }
  }

  function buildChapters(){
    const box=$("chapters");box.innerHTML="";
    twins.forEach((t,i)=>{
      const work=workOf(t).data;
      const b=document.createElement("button");b.className="chapter-button";b.type="button";b.dataset.i=i;
      if(LOCKED && Math.abs(i-INITIAL)<=1)b.classList.add("neighbor");
      const title=(t.motion_cut&&t.motion_cut.title)||work.title||("CHAPTER "+(i+1));
      b.innerHTML="<b>"+String(i+1).padStart(2,"0")+"</b><span>"+escapeHTML(title)+"</span>";
      b.onclick=()=>{
        if(LOCKED) location.href="chapter-"+String(i+1).padStart(2,"0")+".html";
        else seek(offsets[i].start+.001,true);
      };
      box.appendChild(b);
    });
  }

  function buildBeats(s){
    const box=$("beatList");box.innerHTML="";
    s.heads.forEach((h,i)=>{
      const vo=h.e.audio?.voiceover?.text || "";
      const b=document.createElement("button");b.type="button";b.className="beat";b.dataset.head=i;
      b.innerHTML="<span class='beat-time'>"+fmt((h.frame-1)/(s.twin.fps||FPS))+"</span><span><b>"+escapeHTML(h.e.screen_text||("BEAT "+(i+1)))+"</b><small>"+escapeHTML(vo)+"</small></span>";
      b.onclick=()=>seek(s.o.start+(h.frame-1)/(s.twin.fps||FPS)+.001,true);
      box.appendChild(b);
    });
  }

  function escapeHTML(s){
    return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  }

  function updateChapter(s){
    const work=workOf(s.twin);
    const w=work.data||{};
    const shownNumber=Number(collection.display_chapter_number || (s.ci+1));
    const shownCount=Number(collection.display_chapter_count || twins.length);
    $("title").textContent=String(shownNumber).padStart(2,"0")+" "+((s.twin.motion_cut&&s.twin.motion_cut.title)||w.title||"WORLDTEXT");
    $("chapterCounter").textContent=String(shownNumber).padStart(2,"0")+" / "+String(shownCount).padStart(2,"0");
    $("worldId").textContent=w.ontology_id||work.key||"—";
    $("instability").textContent=w.logline||"—";
    $("formula").textContent=w.formula||"—";
    $("myth").textContent=w.mythic_truth||"—";
    $("thesis").textContent=w.thesis||w.logline||"—";
    $("voiceName").textContent=s.twin.soundtrack?.voice_cast?.narrator||"browser narrator";
    const laws=Array.isArray(w.laws)?w.laws:[];
    $("laws").innerHTML=laws.map(l=>"<li><b>"+escapeHTML(l.id||"LAW")+"</b> "+escapeHTML(l.statement||String(l))+"</li>").join("")||"<li>No law block in this twin.</li>";
    document.querySelectorAll(".chapter-button").forEach(b=>b.classList.toggle("on",Number(b.dataset.i)===s.ci));
    document.querySelectorAll(".segment").forEach(seg=>seg.classList.toggle("active",Number(seg.dataset.i)===s.ci));
    buildBeats(s);
    $("state").textContent=(s.twin.frames||0)+" frames · "+(s.twin.fps||FPS)+" fps · "+headsFor(s.twin).length+" beats";
    if(LOCKED)document.body.classList.add("standalone");
  }

  function updateBeat(s, force=false){
    const e=s.twin.edl[s.frameIndex]||{};
    const he=s.head.e||{};
    const work=workOf(s.twin).data||{};
    const vo=he.audio?.voiceover?.text || he.screen_text || "Picture leads here.";
    $("voice").textContent=vo;
    $("screenText").textContent=he.screen_text ? "SCREEN: "+he.screen_text : "SCREEN: —";
    $("overlayTitle").textContent=he.screen_text || ("CHAPTER "+(s.ci+1));
    $("room").textContent=e.room||he.room||"—";
    $("imageFunction").textContent=e.image_function||he.image_function||"—";
    $("relation").textContent=e.relation||he.relation||"—";
    $("musicCue").textContent=he.audio?.music?.cue||"—";
    $("roomTone").textContent=he.audio?.room_tone||"—";
    $("sfxCue").textContent=(he.audio?.sfx||[]).map(x=>x.cue).join(", ")||"—";
    document.querySelectorAll(".beat").forEach(b=>b.classList.toggle("now",Number(b.dataset.head)===s.heads.indexOf(s.head)));
    const key=s.ci+":"+s.head.frame;
    if((playing||force)&&key!==lastSpokenKey){
      lastSpokenKey=key;
      if(voiceOn)speakText(vo,he.audio?.voiceover);
      if(scoreOn)strike(s.ci,s.heads.indexOf(s.head));
    }
  }

  function render(force=false){
    const s=currentState();
    const localDisplay=LOCKED?s.localTime:suiteTime;
    const durationDisplay=LOCKED?s.o.duration:total;
    $("clock").textContent=fmt(localDisplay);
    $("duration").textContent=fmt(durationDisplay);
    $("timeline").setAttribute("aria-valuenow",String(localDisplay));
    const pct=LOCKED?(s.localTime/s.o.duration):(suiteTime/total);
    $("head").style.left=(Math.max(0,Math.min(1,pct))*100)+"%";
    $("frameNo").textContent=s.frameIndex+1;
    $("overlayFrame").textContent="F"+(s.frameIndex+1);
    $("caption").innerHTML=escapeHTML((workOf(s.twin).data.title||s.twin.motion_cut?.title||"WORLDTEXT"))+" · <b>"+escapeHTML(s.twin.edl[s.frameIndex]?.image_function||"FRAME")+"</b>";
    $("microFill").style.width=(s.beatLocal/Math.max(.001,s.beatDuration)*100)+"%";
    $("beatTime").textContent=s.beatLocal.toFixed(1)+" / "+s.beatDuration.toFixed(1);
    const frameKey=s.ci+":"+s.frameIndex;
    if(force||frameKey!==lastFrameKey){
      drawFrame(s.twin,s.frameIndex);lastFrameKey=frameKey;
      const cmds=s.twin.nodes[s.frameIndex]?.commands||[];
      $("code").textContent=(s.twin.nodes[s.frameIndex]?.id||"frame")+" · "+cmds.length+" commands\n"+cmds.join("\n");
    }
    if(force||s.ci!==activeChapter){activeChapter=s.ci;activeHead=-1;updateChapter(s)}
    const hi=s.heads.indexOf(s.head);
    if(force||hi!==activeHead){activeHead=hi;updateBeat(s,force)}
  }

  function seek(t,announce=false){
    const r=allowedRange();
    suiteTime=Math.max(r.start,Math.min(r.end-.001,Number(t)||r.start));
    lastFrameKey="";activeChapter=-1;activeHead=-1;
    speechSynthesis.cancel();lastSpokenKey="";
    render(Boolean(announce));
    savePosition();
  }

  function timelineSeek(clientX){
    const tl=$("timeline"),r=tl.getBoundingClientRect(),f=Math.max(0,Math.min(1,(clientX-r.left)/r.width));
    const range=allowedRange();seek(range.start+f*range.duration,false);
  }

  function togglePlay(){
    playing=!playing;
    $("play").textContent=playing?"Ⅱ":"▶";
    $("play").setAttribute("aria-label",playing?"Pause":"Play");
    lastTick=performance.now();
    if(playing){ensureAudio();lastSpokenKey="";updateBeat(currentState(),true)}
    else speechSynthesis.cancel();
  }

  function speakText(text,meta={}){
    if(!("speechSynthesis" in window)||!text)return;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);
    u.lang=meta?.lang||"en-US";u.rate=Number(meta?.rate||.95);u.pitch=1+Number(meta?.pitch||0)/12;
    const voices=speechSynthesis.getVoices();
    u.voice=voices.find(v=>/Daniel|Alex|Male|David|Arthur/i.test(v.name)&&/^en/i.test(v.lang))||
            voices.find(v=>/^en/i.test(v.lang))||null;
    speechSynthesis.speak(u);
  }

  function ensureAudio(){
    if(audioContext)return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return;
    audioContext=new AC();masterGain=audioContext.createGain();masterGain.gain.value=.05;masterGain.connect(audioContext.destination);
  }

  function strike(chapter,beat){
    ensureAudio();if(!audioContext||!masterGain)return;
    const now=audioContext.currentTime;
    const osc=audioContext.createOscillator(),g=audioContext.createGain();
    osc.type=beat===0?"sine":"triangle";
    osc.frequency.value=75+(chapter*7)+(beat%4)*22;
    g.gain.setValueAtTime(.0001,now);
    g.gain.exponentialRampToValueAtTime(.14,now+.015);
    g.gain.exponentialRampToValueAtTime(.0001,now+.32);
    osc.connect(g);g.connect(masterGain);osc.start(now);osc.stop(now+.34);
  }

  function download(name,obj){
    const blob=new Blob([JSON.stringify(obj,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  }

  function loadObject(obj){
    if(obj?.format==="operator-twin-collection"&&Array.isArray(obj.twins)) collection=obj;
    else if(obj?.format==="operator-twin"&&Array.isArray(obj.nodes)) collection={format:"operator-twin-collection",v:1,fps:obj.fps||8,twins:[obj],chapters:[{chapter:1,title:obj.motion_cut?.title||"Loaded Twin"}]};
    else throw new Error("Expected operator-twin or operator-twin-collection JSON.");
    twins=collection.twins;rebuildOffsets();suiteTime=0;activeChapter=-1;activeHead=-1;lastFrameKey="";
    buildTimeline();buildChapters();render(true);
  }

  function savePosition(){try{localStorage.setItem("worldtext-suite-time",String(suiteTime))}catch{}}
  function loadPosition(){
    if(LOCKED){suiteTime=offsets[INITIAL].start;return}
    try{
      const n=Number(localStorage.getItem("worldtext-suite-time"));
      suiteTime=Number.isFinite(n)?Math.max(0,Math.min(total-.001,n)):offsets[Math.max(0,INITIAL)].start;
    }catch{suiteTime=offsets[Math.max(0,INITIAL)].start}
  }

  $("play").onclick=togglePlay;
  $("voiceToggle").onclick=()=>{
    voiceOn=!voiceOn;document.body.classList.toggle("voice-on",voiceOn);
    $("voiceToggle").setAttribute("aria-pressed",String(voiceOn));
    if(!voiceOn)speechSynthesis.cancel();else updateBeat(currentState(),true);
  };
  $("scoreToggle").onclick=()=>{
    scoreOn=!scoreOn;document.body.classList.toggle("score-on",scoreOn);
    $("scoreToggle").setAttribute("aria-pressed",String(scoreOn));
    if(scoreOn){ensureAudio();strike(currentState().ci,activeHead)}
  };
  $("cinema").onclick=()=>document.body.classList.toggle("cinema");
  canvas.ondblclick=()=>document.body.classList.toggle("cinema");
  $("restartChapter").onclick=()=>seek(currentState().o.start,true);
  $("speak").onclick=()=>{lastSpokenKey="";updateBeat(currentState(),true)};
  $("downloadChapter").onclick=()=>{
    const s=currentState();download("chapter-"+String(s.ci+1).padStart(2,"0")+".twin.json",s.twin);
  };
  $("downloadCollection").onclick=()=>download("worldtext_all_11_chapters.single.json",collection);
  $("loadJson").onchange=async e=>{
    const f=e.target.files?.[0];if(!f)return;
    try{loadObject(JSON.parse(await f.text()));$("state").textContent="loaded "+f.name}
    catch(err){$("state").textContent="load failed: "+err.message}
    e.target.value="";
  };

  const tl=$("timeline");
  tl.addEventListener("pointerdown",e=>{dragTimeline=true;tl.setPointerCapture(e.pointerId);timelineSeek(e.clientX)});
  tl.addEventListener("pointermove",e=>{if(dragTimeline)timelineSeek(e.clientX)});
  tl.addEventListener("pointerup",()=>{dragTimeline=false;savePosition()});
  tl.addEventListener("keydown",e=>{
    if(e.key==="ArrowLeft"){e.preventDefault();seek(suiteTime-(e.shiftKey?8:1),false)}
    if(e.key==="ArrowRight"){e.preventDefault();seek(suiteTime+(e.shiftKey?8:1),false)}
  });

  document.addEventListener("keydown",e=>{
    if(e.target.matches("input,textarea,select"))return;
    if(e.code==="Space"){e.preventDefault();togglePlay()}
    else if(e.key==="ArrowLeft"&&!e.shiftKey)seek(suiteTime-1,false);
    else if(e.key==="ArrowRight"&&!e.shiftKey)seek(suiteTime+1,false);
    else if(e.key==="ArrowLeft"&&e.shiftKey){const s=currentState();seek(offsets[Math.max(0,s.ci-1)].start,true)}
    else if(e.key==="ArrowRight"&&e.shiftKey){const s=currentState();seek(offsets[Math.min(twins.length-1,s.ci+1)].start,true)}
    else if(e.key.toLowerCase()==="v")$("voiceToggle").click();
    else if(e.key.toLowerCase()==="m")$("scoreToggle").click();
    else if(e.key.toLowerCase()==="f")document.body.classList.toggle("cinema");
    else if(e.key==="Escape")document.body.classList.remove("cinema");
  });

  function loop(now){
    const dt=Math.min(.1,(now-lastTick)/1000);lastTick=now;
    if(playing){
      const r=allowedRange();suiteTime+=dt;
      if(suiteTime>=r.end-.001){suiteTime=r.end-.001;playing=false;$("play").textContent="▶";speechSynthesis.cancel()}
      render(false);
      if(Math.floor(now)%1000<20)savePosition();
    }
    requestAnimationFrame(loop);
  }

  buildTimeline();buildChapters();loadPosition();
  document.body.classList.toggle("voice-on",voiceOn);
  render(true);
  requestAnimationFrame(loop);
})();
