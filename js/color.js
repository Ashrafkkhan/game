// js/color.js
// Improved, robust Read & Color screen

const COLOR_LEVELS = [
  { word:"APPLE",  correct:"red",    options:["red","green","yellow"] },
  { word:"BANANA", correct:"yellow", options:["blue","green","yellow"] },
  { word:"SKY",    correct:"blue",   options:["blue","red","purple"] }
];

let colorState = { };

// --- small helpers/fallbacks (safe if shared helpers are missing) ---
if (typeof randomizeArray === 'undefined') {
  window.randomizeArray = function(arr){ return arr.sort(()=>0.5 - Math.random()); };
}
if (typeof clamp === 'undefined') {
  window.clamp = function(v,min,max){ return Math.max(min, Math.min(max, v)); };
}
function safeAwardStars(gameKey, stars){
  if (typeof awardStars === 'function') {
    awardStars(gameKey, stars);
  } else {
    // fallback: keep max and save
    progress.stars = progress.stars || {};
    progress.stars[gameKey] = Math.max(progress.stars[gameKey] || 0, stars);
    if (typeof saveProgress === 'function') saveProgress();
  }
}
function getTextColorForBackground(bg){
  // if hex color -> compute brightness, else use known light color list
  try {
    if (typeof bg === 'string' && bg.startsWith('#')) {
      let hex = bg.slice(1);
      if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
      const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
      const brightness = 0.299*r + 0.587*g + 0.114*b;
      return (brightness > 180) ? '#111' : '#fff';
    }
    const lightNames = ['yellow','white','beige','lightyellow','ivory','pink','lavender','lightgray','moccasin','lemonchiffon'];
    if (lightNames.indexOf(String(bg).toLowerCase()) !== -1) return '#111';
  } catch(e){}
  return '#fff';
}
// end helpers

function startColor(){
  const area = document.getElementById("screen-area");
  const lvl = clamp(progress.colorLevel || 0, 0, COLOR_LEVELS.length - 1);
  const data = COLOR_LEVELS[lvl];

  area.innerHTML = `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h3>🎨 Read & Color — Level ${lvl+1}</h3>
          <div class="small">Pick the color that matches: <strong id="color-target">${data.word}</strong></div>
        </div>
        <div><button class="ghost" onclick="backToMenu()">⬅️ Back</button></div>
      </div>

      <div id="color-options" style="margin-top:12px; display:flex; flex-wrap:wrap; gap:10px;"></div>
      <div id="color-feedback" style="margin-top:10px; min-height:28px;"></div>

      <div class="controls" style="margin-top:8px;">
        <button class="big-btn" id="color-start">Start</button>
        <button class="ghost" id="color-next" disabled>Next Level</button>
      </div>
    </div>
  `;

  document.getElementById("color-start").onclick = () => beginColor(data);
  document.getElementById("color-next").onclick = () => {
    progress.colorLevel = clamp((progress.colorLevel || 0) + 1, 0, COLOR_LEVELS.length - 1);
    if (typeof saveProgress === 'function') saveProgress();
    startColor();
  };
}

function beginColor(data){
  const container = document.getElementById("color-options");
  const feedback = document.getElementById("color-feedback");
  container.innerHTML = "";
  feedback.textContent = "";
  colorState.hintShown = false;

  // shuffled options
  const opts = randomizeArray(data.options.slice());
  opts.forEach(opt => {
    const box = document.createElement('div');
    box.className = 'color-box';
    // apply background; accept named colors and hex
    box.style.background = opt;
    box.style.minWidth = "110px";
    box.style.minHeight = "90px";
    box.style.display = "inline-flex";
    box.style.alignItems = "center";
    box.style.justifyContent = "center";
    box.style.borderRadius = "12px";
    box.style.cursor = "pointer";
    box.style.userSelect = "none";
    // choose readable text color
    box.style.color = getTextColorForBackground(opt);
    box.textContent = String(opt).toUpperCase();

    box.onclick = function handleClick(){
      // Prevent multiple clicks once correct chosen
      if (container.dataset.locked === "true") return;

      if (String(opt).toLowerCase() === String(data.correct).toLowerCase()){
        // correct
        safeAwardStars('color', 2);
        feedback.textContent = `✅ Correct — ${data.word} is ${opt}.`;
        document.getElementById("color-next").disabled = false;
        container.dataset.locked = "true";
        try{ playBeep(); }catch(e){}
        try{ speak(data.word, 0.95); }catch(e){}
        // visually mark correct boxes (dim others)
        Array.from(container.children).forEach(c => { c.style.opacity = (c === box) ? '1' : '0.45'; c.onclick = null; });
      } else {
        // wrong: quick shake + friendly message
        box.animate([
          { transform:'translateX(0)' }, { transform:'translateX(-6px)' }, { transform:'translateX(6px)' }, { transform:'translateX(0)' }
        ], { duration:280, iterations:1 });
        feedback.textContent = `❌ Not quite — try again!`;
      }
    };

    container.appendChild(box);
  });

  // also offer a hint button (if you have one in UI). We'll also enable hint on wrong attempts.
  // Clear locked flag
  container.dataset.locked = "false";
}
