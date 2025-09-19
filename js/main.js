// main.js — progress, helpers, navigation
const PROGRESS_KEY = "dyslexia_v3_progress";
let progress = {
  builderLevel: 0, matchLevel: 0, memoryLevel: 0, sortLevel: 0, colorLevel: 0,
  stars: { builder:0, match:0, memory:0, sort:0, color:0 }
};

function loadProgress(){
  const raw = localStorage.getItem(PROGRESS_KEY);
  if(raw){
    try{ progress = JSON.parse(raw); } catch(e){}
  }
  updateSidebar();
}
function saveProgress(){
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  updateSidebar();
}
function resetProgress(){
  if(!confirm("Reset saved progress?")) return;
  progress = { builderLevel:0, matchLevel:0, memoryLevel:0, sortLevel:0, colorLevel:0, stars:{builder:0,match:0,memory:0,sort:0,color:0}};
  saveProgress();
  alert("Progress reset.");
}
function updateSidebar(){
  document.getElementById("stat-builder").textContent = `${progress.stars.builder}⭐`;
  document.getElementById("stat-match").textContent = `${progress.stars.match}⭐`;
  document.getElementById("stat-memory").textContent = `${progress.stars.memory}⭐`;
  document.getElementById("stat-sort").textContent = `${progress.stars.sort}⭐`;
  document.getElementById("stat-color").textContent = `${progress.stars.color}⭐`;
  const total = progress.stars.builder + progress.stars.match + progress.stars.memory + progress.stars.sort + progress.stars.color;
  document.getElementById("stat-total").textContent = total;
}

// navigation
function openGame(id){
  // clear screen area and call specific start function
  document.getElementById("screen-area").innerHTML = "";
  if(id === "builder") startBuilder();
  if(id === "match") startMatch();
  if(id === "memory") startMemory();
  if(id === "sort") startSort();
  if(id === "color") startColor();
  
}
function backToMenu(){
  document.getElementById("screen-area").innerHTML = `<div id="home-screen"><h3>Welcome!</h3><p>Select a mini-game to practice. Try to earn stars ⭐ for each game.</p></div>`;
}

// utilities used by game modules
function speak(text, rate=0.9){ try{ const u=new SpeechSynthesisUtterance(text); u.rate=rate; speechSynthesis.speak(u);}catch(e){} }
function playBeep(){
  // try local asset, else web audio beep
  const audio = new Audio('assets/beep.wav');
  audio.volume = 0.5;
  audio.play().catch(()=>{ /* ignore */ });
}
function awardStars(gameKey, stars){
  // keep max stars achieved
  progress.stars[gameKey] = Math.max(progress.stars[gameKey] || 0, stars);
  saveProgress();
}
function clamp(v,min,max){ return Math.max(min, Math.min(max,v)); }

// initialize
loadProgress();
backToMenu();
