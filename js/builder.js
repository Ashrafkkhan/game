// builder.js — Sequential Falling Word Builder
const BUILDER_LEVELS = [
  { word: "CAT", timeLimit:15 },
  { word: "BALL", timeLimit:18 },
  { word: "APPLE", timeLimit:20 },
  { word: "BANANA", timeLimit:24 },
  { word: "ELEPHANT", timeLimit:28 }
];

let builderState = { collected:"", active:false, startTS:0, timeIntervalId:null, timeLeft:0, index:0 };

function startBuilder(){
  const area = document.getElementById("screen-area");
  const lvl = clamp(progress.builderLevel, 0, BUILDER_LEVELS.length-1);
  const data = BUILDER_LEVELS[lvl];

  area.innerHTML = `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h3>🧩 Word Builder — Level ${lvl+1}</h3>
          <div class="small">Catch the letters in order: <strong>${data.word}</strong></div>
        </div>
        <div><button class="ghost" onclick="backToMenu()">⬅️ Back</button></div>
      </div>

      <div id="builder-progress-bar"><div id="builder-progress-fill"></div></div>
      <div id="builder-board" class="card" style="margin-top:12px; position:relative; height:260px;"></div>

      <div style="margin-top:8px;">
        <div id="builder-progress" class="small">Collected: </div>
        <div id="builder-feedback" style="margin-top:6px"></div>
      </div>

      <div class="controls" style="margin-top:10px;">
        <button class="big-btn" id="builder-start-btn">Start Level</button>
        <button class="ghost" id="builder-next" disabled>Next Level</button>
      </div>
    </div>
  `;

  document.getElementById("builder-start-btn").onclick = ()=> beginBuilderLevel(data);
  document.getElementById("builder-next").onclick = ()=> {
    progress.builderLevel = clamp(progress.builderLevel+1, 0, BUILDER_LEVELS.length-1);
    saveProgress();
    startBuilder();
  };
}

function beginBuilderLevel(data){
  const board = document.getElementById("builder-board");
  board.innerHTML = "";
  builderState.collected = "";
  builderState.active = true;
  builderState.startTS = Date.now();
  builderState.timeLeft = data.timeLimit;
  builderState.index = 0;

  // timer tick
  builderState.timeIntervalId = setInterval(()=>{
    builderState.timeLeft--;
    document.getElementById("builder-feedback").textContent = `⏱ Time left: ${builderState.timeLeft}s`;
    if(builderState.timeLeft <= 0){
      clearInterval(builderState.timeIntervalId);
      builderState.active = false;
      document.getElementById("builder-feedback").textContent = `⌛ Time's up — collected "${builderState.collected}"`;
    }
  }, 1000);

  // start dropping the first letter
  dropNextLetter(data);
}

function dropNextLetter(data){
  if(builderState.index >= data.word.length){
    return; // done
  }

  const board = document.getElementById("builder-board");
  const targetChar = data.word[builderState.index];

  // spawn target + distractors
  const distractors = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').filter(c=>c!==targetChar);
  const letters = [targetChar];
  for(let i=0;i<2;i++){ // add 2 random distractors
    letters.push(distractors[Math.floor(Math.random()*distractors.length)]);
  }

  letters.forEach((ch, i)=>{
    const el = document.createElement('div');
    el.className = 'fall-letter';
    el.textContent = ch;

    el.style.width = "70px";
    el.style.height = "70px";
    el.style.fontSize = "1.6rem";
    el.style.display = "flex";
    el.style.alignItems = "center";
    el.style.justifyContent = "center";
    el.style.borderRadius = "12px";
    el.style.background = (ch===targetChar ? "#28a745" : "#007bff");
    el.style.color = "white";
    el.style.cursor = "pointer";
    el.style.position = "absolute";
    el.style.left = `${Math.random() * (board.clientWidth - 80)}px`;
    el.style.top = `-90px`;

    el.onclick = ()=> {
      if(!builderState.active) return;
      if(ch === targetChar){
        collectBuilder(ch, el, data);
      } else {
        el.style.opacity = "0.3";
        document.getElementById("builder-feedback").textContent = `❌ Wrong letter, need "${targetChar}"`;
      }
    };

    board.appendChild(el);

    // fall animation
    const duration = 6000 + Math.random()*2000;
    setTimeout(()=> { 
      el.style.transition = `transform ${duration}ms linear, opacity 500ms linear ${duration-500}ms`;
      el.style.transform = `translateY(${board.clientHeight + 140}px)`;
      setTimeout(()=>{ try{ el.remove(); }catch(e){} }, duration+600);
    }, i*400);
  });

  // also speak the target char
  speak(targetChar, 0.9);
}

function collectBuilder(char, el, data){
  playBeep();
  builderState.collected += char;
  document.getElementById("builder-progress").textContent = `Collected: ${builderState.collected}`;

  // progress bar
  const fill = document.getElementById("builder-progress-fill");
  fill.style.width = (builderState.collected.length / data.word.length * 100) + "%";

  el.style.opacity = "0.4";
  el.style.pointerEvents = "none";

  builderState.index++;
  if(builderState.index < data.word.length){
    dropNextLetter(data); // drop next letter in sequence
  } else {
    // success
    builderState.active = false;
    clearInterval(builderState.timeIntervalId);
    const elapsed = Math.round((Date.now() - builderState.startTS)/1000);

    // stars by speed
    let stars = 1;
    if(elapsed <= data.timeLimit*0.7) stars = 2;
    if(elapsed <= data.timeLimit*0.45) stars = 3;
    awardStars('builder', stars);

    document.getElementById("builder-feedback").textContent = `🎉 Built ${data.word} in ${elapsed}s — ${stars}⭐`;
    document.getElementById("builder-next").disabled = false;
    speak(data.word, 0.9);
  }
}
