// match.js — Enhanced Letter Match Game
const MATCH_LEVELS = [
  { pairs:["b","d","p"], time:20, targetSize:"large" },
  { pairs:["p","q","g"], time:20, targetSize:"large" },
  { pairs:["n","u","m"], time:25, targetSize:"medium" }
];

let matchState = { running:false, timeLeft:0, score:0, timerId:null };

function startMatch(){
  const area = document.getElementById("screen-area");
  const lvl = clamp(progress.matchLevel, 0, MATCH_LEVELS.length-1);
  const data = MATCH_LEVELS[lvl];

  area.innerHTML = `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h3>🔤 Letter Match — Level ${lvl+1}</h3>
          <div class="small">Click the correct letter as fast as you can.</div>
        </div>
        <div><button class="ghost" onclick="backToMenu()">⬅️ Back</button></div>
      </div>

      <div id="match-target" style="font-size:3rem;font-weight:700;margin:16px; color:#007bff;"></div>
      
      <div id="match-options" style="margin-top:12px; display:flex; gap:12px; flex-wrap:wrap; justify-content:center;"></div>
      
      <div id="match-feedback" style="margin-top:10px; font-size:1.2rem;"></div>
      
      <div class="controls" style="margin-top:12px; align-items:center; display:flex; gap:12px;">
        <button class="big-btn" id="match-start">Start Round</button>
        <button class="ghost" id="match-next" disabled>Next Level</button>
        <div id="match-timer" style="flex:1; height:16px; background:#eee; border-radius:8px; overflow:hidden;">
          <div id="match-timer-bar" style="height:100%; width:100%; background:linear-gradient(90deg,#28a745,#7bed9f);"></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("match-start").onclick = ()=> beginMatchRound(data);
  document.getElementById("match-next").onclick = ()=> {
    progress.matchLevel = clamp(progress.matchLevel+1, 0, MATCH_LEVELS.length-1);
    saveProgress(); startMatch();
  };
}

function beginMatchRound(data){
  matchState.running = true;
  matchState.timeLeft = data.time;
  matchState.score = 0;
  document.getElementById("match-feedback").textContent = `Score: 0`;

  chooseMatchTarget(data);

  const bar = document.getElementById("match-timer-bar");
  let fullTime = data.time;

  matchState.timerId = setInterval(()=>{
    matchState.timeLeft--;
    bar.style.width = (matchState.timeLeft/fullTime * 100) + "%";
    if(matchState.timeLeft<=0){
      clearInterval(matchState.timerId);
      matchState.running = false;
      endMatchRound();
    }
  },1000);
}

function chooseMatchTarget(data){
  if(!data) data = MATCH_LEVELS[progress.matchLevel];
  const target = data.pairs[Math.floor(Math.random()*data.pairs.length)];
  document.getElementById("match-target").textContent = target.toUpperCase();

  const opts = randomizeArray([...data.pairs]);
  const container = document.getElementById("match-options");
  container.innerHTML = "";

  opts.forEach(o=>{
    const btn = document.createElement('div');
    btn.className = 'option';
    btn.textContent = o.toUpperCase();
    btn.style.fontSize = "2rem";
    btn.style.padding = "20px 28px";
    btn.style.background = "#f1f1f1";
    btn.style.borderRadius = "12px";
    btn.style.cursor = "pointer";
    btn.style.transition = "transform 0.2s, background 0.2s";
    btn.onmouseenter = ()=> btn.style.transform="scale(1.1)";
    btn.onmouseleave = ()=> btn.style.transform="scale(1)";

    btn.onclick = ()=>{
      if(!matchState.running) return;
      if(o === target){
        matchState.score++;
        document.getElementById("match-feedback").textContent = `✅ Correct! Score: ${matchState.score}`;
        playBeep(); speak(o, 0.9);

        // bounce animation
        btn.animate([{ transform:'scale(1)' },{ transform:'scale(1.3)' },{ transform:'scale(1)' }], { duration:300 });

      } else {
        document.getElementById("match-feedback").textContent = `❌ Wrong, that was "${o}"`;
        // shake animation
        btn.animate([{ transform:'translateX(0)' },{ transform:'translateX(-6px)' },{ transform:'translateX(6px)' },{ transform:'translateX(0)' }], { duration:300 });
      }
      chooseMatchTarget(data);
    };

    container.appendChild(btn);
  });
}

function endMatchRound(){
  const s = matchState.score;
  let stars = 0;
  if(s >= 10) stars = 3;
  else if(s >= 6) stars = 2;
  else if(s >= 3) stars = 1;
  awardStars('match', stars);

  document.getElementById("match-feedback").textContent = `🎉 Round over — Score ${s} — ${stars}⭐`;
  document.getElementById("match-next").disabled = false;
}
