// memory.js — Enhanced Memory Flip
const MEMORY_LEVELS = [
  { pairs: ["cat","dog","sun","hat"] }, // 4 pairs
  { pairs: ["ba","na","pa","ta","ka","la"] }, // 6 pairs
  { pairs: ["apple","ball","car","duck","egg","frog","hat","ice"] } // 8 pairs
];
let memoryState = { cards:[], flipped:[], matches:0, flips:0 };

function startMemory(){
  const area = document.getElementById("screen-area");
  const lvl = clamp(progress.memoryLevel, 0, MEMORY_LEVELS.length-1);
  const data = MEMORY_LEVELS[lvl];
  area.innerHTML = `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h3>🃏 Memory Flip — Level ${lvl+1}</h3>
          <div class="small">Flip cards and find all pairs. Fewer flips = more stars.</div>
        </div>
        <div><button class="ghost" onclick="backToMenu()">⬅️ Back</button></div>
      </div>

      <div id="memory-progress" style="margin:10px 0; height:14px; background:#eee; border-radius:8px; overflow:hidden;">
        <div id="memory-progress-fill" style="height:100%; width:0%; background:linear-gradient(90deg,#28a745,#7bed9f);"></div>
      </div>

      <div id="memory-board" style="margin-top:12px; display:grid; grid-template-columns:repeat(auto-fill,minmax(100px,1fr)); gap:12px;"></div>
      <div id="memory-feedback" style="margin-top:8px; font-size:1.1rem;"></div>

      <div class="controls" style="margin-top:8px;">
        <button class="big-btn" id="memory-start">Start</button>
        <button class="ghost" id="memory-next" disabled>Next Level</button>
      </div>
    </div>
  `;
  document.getElementById("memory-start").onclick = ()=> beginMemory(data);
  document.getElementById("memory-next").onclick = ()=> {
    progress.memoryLevel = clamp(progress.memoryLevel+1, 0, MEMORY_LEVELS.length-1);
    saveProgress(); startMemory();
  };
}

function beginMemory(data){
  memoryState.matches = 0; memoryState.flips = 0; memoryState.flipped = [];
  const pairs = data.pairs.slice(0, Math.min(8, data.pairs.length));
  const cards = randomizeArray([...pairs, ...pairs]);
  memoryState.cards = cards;

  const board = document.getElementById("memory-board");
  board.innerHTML = "";
  cards.forEach(val=>{
    const card = document.createElement('div');
    card.className = 'mem-card';
    card.innerHTML = `<div class="card-inner">
                        <div class="card-front">?</div>
                        <div class="card-back">${val.toUpperCase()}</div>
                      </div>`;
    card.dataset.val = val;
    card.onclick = ()=> flipCard(card);
    board.appendChild(card);
  });
  document.getElementById("memory-feedback").textContent = "Start flipping!";
  updateMemoryProgress();
}

function flipCard(card){
  if(card.classList.contains('matched') || memoryState.flipped.length===2) return;
  if(card.classList.contains('flipped')) return;

  memoryState.flips++;
  card.classList.add('flipped');
  memoryState.flipped.push(card);

  if(memoryState.flipped.length===2){
    const [a,b] = memoryState.flipped;
    if(a.dataset.val === b.dataset.val){
      // Match
      a.classList.add('matched'); b.classList.add('matched');
      memoryState.matches++;
      memoryState.flipped = [];
      playBeep();
      document.getElementById("memory-feedback").textContent = `✅ Matched ${memoryState.matches}`;
      updateMemoryProgress();

      if(memoryState.matches === memoryState.cards.length/2){
        finishMemory();
      }
    } else {
      // Wrong match → shake then flip back
      document.getElementById("memory-feedback").textContent = "❌ Not a match.";
      setTimeout(()=>{
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        memoryState.flipped = [];
      }, 900);
    }
  }
}

function updateMemoryProgress(){
  const fill = document.getElementById("memory-progress-fill");
  const total = memoryState.cards.length/2;
  fill.style.width = (memoryState.matches/total * 100) + "%";
}

function finishMemory(){
  const pairs = memoryState.cards.length/2;
  const extra = memoryState.flips - pairs;
  let stars = 1;
  if(extra <= 2) stars = 3;
  else if(extra <= 5) stars = 2;
  awardStars('memory', stars);

  document.getElementById("memory-feedback").textContent = `🎉 Completed in ${memoryState.flips} flips — ${stars}⭐ Great job!`;
  document.getElementById("memory-next").disabled = false;
}
