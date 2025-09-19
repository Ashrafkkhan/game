// js/sort.js — Syllable Sort

const SORT_LEVELS = [
  { syllables:["BA","NA","NA"], word:"BANANA" },
  { syllables:["EL","E","PHANT"], word:"ELEPHANT" },
  { syllables:["COM","PU","TER"], word:"COMPUTER" }
];

let sortState = { tries:0 };

// fallback helpers
if (typeof randomizeArray === "undefined") {
  window.randomizeArray = arr => arr.sort(()=>0.5-Math.random());
}
if (typeof clamp === "undefined") {
  window.clamp = (v,min,max)=> Math.max(min, Math.min(max,v));
}
function safeAwardStars(key,stars){
  if(typeof awardStars==="function"){ awardStars(key,stars); }
  else {
    window.progress = window.progress || { stars:{} };
    window.progress.stars[key] = Math.max(window.progress.stars[key]||0, stars);
  }
}

// ENTRY
function startSort(){
  const area = document.getElementById("screen-area");
  if(!area){ alert("Missing #screen-area in HTML"); return; }
  const lvl = clamp((window.progress?.sortLevel)||0, 0, SORT_LEVELS.length-1);
  const data = SORT_LEVELS[lvl];

  area.innerHTML = `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h3>📦 Syllable Sort — Level ${lvl+1}</h3>
        <button class="ghost" id="sort-back">⬅️ Back</button>
      </div>
      <div class="small">Order the syllables to form: <strong>${data.word}</strong></div>

      <div id="sort-pool" style="display:flex;gap:10px;flex-wrap:wrap;margin:12px 0;"></div>
      <div id="sort-target" style="min-height:70px;display:flex;gap:8px;align-items:center;justify-content:center;background:#fff7e6;border:2px dashed #ffd89a;border-radius:12px;padding:10px;"></div>

      <div id="sort-preview" style="margin-top:10px;font-weight:700;font-size:1.2rem;"></div>
      <div id="sort-feedback" style="margin-top:8px;"></div>

      <div class="controls" style="margin-top:12px;">
        <button class="big-btn" id="sort-start">Start</button>
        <button class="ghost" id="sort-check" disabled>Check</button>
        <button class="ghost" id="sort-next" disabled>Next</button>
      </div>
    </div>
  `;

  document.getElementById("sort-back").onclick = ()=> typeof backToMenu==="function" ? backToMenu() : alert("Back pressed");
  document.getElementById("sort-start").onclick = ()=> beginSort(data);
  document.getElementById("sort-check").onclick = ()=> checkSort(data);
  document.getElementById("sort-next").onclick = ()=> {
    if(window.progress) window.progress.sortLevel = clamp((window.progress.sortLevel||0)+1,0,SORT_LEVELS.length-1);
    startSort();
  };
}

function beginSort(data){
  sortState.tries=0;
  const poolEl = document.getElementById("sort-pool");
  const targetEl = document.getElementById("sort-target");
  const previewEl = document.getElementById("sort-preview");
  const feedback = document.getElementById("sort-feedback");
  const checkBtn = document.getElementById("sort-check");
  const nextBtn = document.getElementById("sort-next");

  poolEl.innerHTML=""; targetEl.innerHTML=""; previewEl.textContent=""; feedback.textContent="";
  checkBtn.disabled=false; nextBtn.disabled=true;

  randomizeArray(data.syllables.slice()).forEach(s=>{
    const btn=document.createElement("div");
    btn.textContent=s;
    btn.style.cssText="padding:12px 16px;background:#007bff;color:#fff;border-radius:10px;cursor:pointer;font-weight:700;";
    btn.onclick=()=> placeSyllable(s);
    poolEl.appendChild(btn);
  });

  function placeSyllable(s){
    const card=document.createElement("div");
    card.textContent=s;
    card.style.cssText="padding:10px 14px;background:#28a745;color:#fff;border-radius:10px;cursor:pointer;font-weight:700;";
    card.onclick=()=>{ card.remove(); updatePreview(); };
    targetEl.appendChild(card);
    updatePreview();
  }

  function updatePreview(){
    const chosen=[...targetEl.children].map(x=>x.textContent);
    previewEl.textContent=chosen.join("");
    checkBtn.disabled = (chosen.length!==data.syllables.length);
  }
}

function checkSort(data){
  sortState.tries++;
  const targetEl=document.getElementById("sort-target");
  const feedback=document.getElementById("sort-feedback");
  const nextBtn=document.getElementById("sort-next");
  const chosen=[...targetEl.children].map(x=>x.textContent);

  if(chosen.length!==data.syllables.length){ feedback.textContent="⚠️ Add all syllables."; return; }

  if(chosen.join("")===data.word){
    let stars=1; if(sortState.tries===1) stars=3; else if(sortState.tries===2) stars=2;
    safeAwardStars("sort",stars);
    feedback.textContent=`🎉 Correct! ${data.word} — ${stars}⭐`;
    nextBtn.disabled=false;
  } else {
    feedback.textContent="❌ Not correct, try again!";
  }
}

// expose
window.startSort=startSort;
