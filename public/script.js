/* CURSOR */
const cur = document.getElementById('cursor');
document.addEventListener('mousemove', e => { cur.style.left=e.clientX+'px'; cur.style.top=e.clientY+'px'; });
document.querySelectorAll('a,button,.cat-chip').forEach(el => {
  el.addEventListener('mouseenter',()=>{ cur.style.width='36px';cur.style.height='36px';cur.style.background='rgba(255,107,157,.15)'; });
  el.addEventListener('mouseleave',()=>{ cur.style.width='14px';cur.style.height='14px';cur.style.background='rgba(255,107,157,.25)'; });
});

/* CATEGORY CHIPS */
document.querySelectorAll('.cat-chip').forEach(c => {
  c.addEventListener('click', () => c.classList.toggle('on'));
});

/* STATE — no MAX_Q limit */
let gameHistory = [];
let questionCount = 0;
let confidence = 0;
let currentGuess = '';
let gameOver = false;
let selectedCategories = [];

/* HELPERS */
function setThinking(show, msg='Consulting the cosmic database...') {
  document.getElementById('thinking-txt').textContent = msg;
  document.getElementById('thinking').style.display = show ? 'flex' : 'none';
  document.getElementById('answers').style.display = show ? 'none' : 'grid';
  document.getElementById('bubble').style.display = show ? 'none' : 'block';
  const face = document.getElementById('genie-face');
  show ? face.classList.add('thinking') : face.classList.remove('thinking');
  document.querySelectorAll('.ans-btn').forEach(b => b.disabled = show);
}

function updateProgress() {
  // Progress bar: fills smoothly based on confidence (0-100%)
  const pct = Math.min(confidence, 100);
  document.getElementById('prog-fill').style.width = pct + '%';
  document.getElementById('prog-text').textContent = questionCount + ' question' + (questionCount !== 1 ? 's' : '') + ' asked';
  document.getElementById('q-count').textContent = questionCount;
  document.getElementById('conf-val').textContent = Math.round(confidence) + '%';
}

function addToHistory(q, a) {
  gameHistory.push({ q, a });
  const cls = a==='YES'?'yes':a==='NO'?'no':a==='PROBABLY'?'prob':'dk';
  const label = a==='YES'?'Yes':a==='NO'?'No':a==='PROBABLY'?'Prob.':'?';
  const container = document.getElementById('hist-items');
  const item = document.createElement('div');
  item.className = 'hist-item';
  item.innerHTML = `<span class="hist-q">${gameHistory.length}. ${q}</span><span class="hist-a ${cls}">${label}</span>`;
  container.appendChild(item);
  container.scrollTop = container.scrollHeight;
  document.getElementById('history').style.display = 'block';
}

/* BUILD PROMPT — no question limit, stops only on correct guess */
function buildSystemPrompt() {
  const cats = selectedCategories.join(', ');
  return `You are GENIE, an all-knowing AI playing the Akinator game. The user is thinking of something from these categories: ${cats}.

Your job: Ask ONE yes/no question at a time to narrow down what the user is thinking of.

RULES:
1. Ask only ONE question per response.
2. Questions must be answerable with Yes, No, Probably, or Don't Know.
3. Start broad, then get progressively more specific.
4. After gathering enough information, make educated guesses when confidence is high.
5. When confidence > 95%, make your guess using isGuess:true.
6. If your guess is WRONG (user answered No to your guess), keep asking more questions.
7. Never repeat a previous question.
8. Keep questions short and clear.
9. There is NO question limit — keep going until you guess correctly.

Respond ONLY in this exact JSON format (no markdown, no extra text):
{"question":"Your question here","confidence":45,"isGuess":false,"guess":""}

When guessing:
{"question":"Is it [NAME]?","confidence":88,"isGuess":true,"guess":"[NAME]"}`;
}

function buildMessages() {
  const msgs = [];
  for (let i = 0; i < gameHistory.length; i++) {
    msgs.push({ role:'model', parts:[{ text: JSON.stringify({ question:gameHistory[i].q, confidence:Math.round(confidence), isGuess:false, guess:'' }) }] });
    msgs.push({ role:'user',  parts:[{ text: gameHistory[i].a }] });
  }
  if (msgs.length === 0) {
    msgs.push({ role:'user', parts:[{ text:'Start the game. Ask your first question.' }] });
  } else {
    msgs.push({ role:'user', parts:[{ text:'Continue asking or make a guess if confident enough. Keep going until you get it right — there is no question limit.' }] });
  }
  return msgs;
}

/* CALL BACKEND — uses the multi-provider /api/gemini endpoint */
async function callGemini(overrideBody = null) {
  const body = overrideBody || {
    systemPrompt: buildSystemPrompt(),
    messages: buildMessages(),
    forceGuess: false
  };
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Server error');
  }
  return res.json();
}

/* START */
function startGame() {
  selectedCategories = [...document.querySelectorAll('.cat-chip.on')].map(c => c.dataset.c);
  if (!selectedCategories.length) { alert('Please select at least one category!'); return; }

  document.getElementById('entry').classList.add('hide');
  setTimeout(() => document.getElementById('entry').style.display='none', 500);
  document.getElementById('game').style.display = 'block';
  document.getElementById('cat-display').textContent = selectedCategories.length === 6 ? 'All Categories' : selectedCategories.join(', ');

  gameHistory = []; questionCount = 0; confidence = 0; currentGuess = ''; gameOver = false;
  document.getElementById('hist-items').innerHTML = '';
  document.getElementById('history').style.display = 'none';
  document.getElementById('result-card').style.display = 'none';
  document.getElementById('genie-face').className = 'genie-avatar';
  updateProgress();
  askNext();
}

/* ASK NEXT — no question cap, runs until correct guess */
async function askNext() {
  if (gameOver) return;

  const msg = questionCount < 5
    ? 'Reading the cosmic waves...'
    : questionCount < 15
    ? 'Narrowing it down...'
    : questionCount < 30
    ? 'Getting warmer...'
    : 'Going deeper...';

  setThinking(true, msg);

  try {
    const resp = await callGemini();
    confidence = resp.confidence || confidence;
    updateProgress();
    setThinking(false);

    if (resp.isGuess && resp.guess) {
      currentGuess = resp.guess;
      document.getElementById('bubble-text').textContent = resp.question || `Is it ${resp.guess}?`;
      document.getElementById('bubble-sub').textContent = `Confidence: ${Math.round(resp.confidence)}%`;
    } else {
      currentGuess = '';
      document.getElementById('bubble-text').textContent = resp.question;
      document.getElementById('bubble-sub').textContent = questionCount < 5
        ? 'Think carefully and answer honestly...'
        : confidence >= 85
        ? `Almost certain — Confidence: ${Math.round(resp.confidence)}%`
        : `Confidence: ${Math.round(resp.confidence)}%`;
    }
    document.getElementById('bubble').style.display = 'block';
    document.getElementById('answers').style.display = 'grid';
    questionCount++;
    updateProgress();

  } catch(err) {
    setThinking(false);
    document.getElementById('bubble-text').textContent = 'Error: ' + err.message;
    document.getElementById('bubble-sub').textContent = 'Check your connection or try again.';
    document.getElementById('bubble').style.display = 'block';
    document.getElementById('answers').style.display = 'none';
  }
}

/* ANSWER */
function answer(ans) {
  const currentQ = document.getElementById('bubble-text').textContent;
  if (currentGuess) {
    addToHistory(currentQ, ans);
    if (ans === 'YES') {
      // Correct guess — show win result
      showResult(true, currentGuess);
      return;
    }
    // Wrong guess — reset and keep asking
    currentGuess = '';
    askNext();
    return;
  }
  addToHistory(currentQ, ans);
  askNext();
}

/* FORCE GUESS (manual trigger) */
async function forceGuess() {
  if (gameOver) return;
  setThinking(true, 'Summoning my final answer...');
  try {
    const historyText = gameHistory.map((h,i) => `Q${i+1}: ${h.q} -> ${h.a}`).join('\n');
    const forcePrompt = `You are playing Akinator. Based on this Q&A history, make your best single guess.
Categories: ${selectedCategories.join(', ')}

History:
${historyText}

Respond ONLY in JSON (no markdown):
{"guess":"Character/Person Name","confidence":75,"reasoning":"brief reason"}`;

    const resp = await callGemini({
      systemPrompt: forcePrompt,
      messages: [{ role:'user', parts:[{ text:'Make your best guess now.' }] }],
      forceGuess: true
    });
    confidence = resp.confidence || confidence;
    setThinking(false);
    showResult(null, resp.guess, resp.reasoning);
  } catch(err) {
    setThinking(false);
    showResult(null, 'Unknown', 'Could not determine from the given answers.');
  }
}

/* SHOW RESULT */
function showResult(correct, guess, reasoning='') {
  gameOver = true;
  document.getElementById('bubble').style.display = 'none';
  document.getElementById('answers').style.display = 'none';
  document.getElementById('result-card').style.display = 'block';

  document.getElementById('res-guess').textContent = guess || '???';
  document.getElementById('res-q').textContent = questionCount;
  document.getElementById('res-conf').textContent = Math.round(confidence) + '%';

  if (correct === true) {
    document.getElementById('res-icon').innerHTML = '<i class="fa-solid fa-trophy"></i>';
    document.getElementById('res-icon').className = 'result-icon win-icon';
    document.getElementById('res-title').textContent = 'I GOT IT!';
    document.getElementById('res-title').className = 'result-title win';
    document.getElementById('res-sub').textContent = `I read your mind in ${questionCount} questions!`;
    document.getElementById('feedback-btns').style.display = 'none';
    document.getElementById('genie-face').classList.add('win');
  } else {
    document.getElementById('res-icon').innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i>';
    document.getElementById('res-icon').className = 'result-icon';
    document.getElementById('res-title').textContent = 'MY GUESS IS...';
    document.getElementById('res-title').className = 'result-title';
    document.getElementById('res-sub').textContent = reasoning || `After ${questionCount} questions, this is my best guess.`;
    document.getElementById('feedback-btns').style.display = 'flex';
  }
  updateProgress();
}

function onCorrect() {
  document.getElementById('genie-face').className = 'genie-avatar win';
  document.getElementById('res-icon').innerHTML = '<i class="fa-solid fa-trophy"></i>';
  document.getElementById('res-icon').className = 'result-icon win-icon';
  document.getElementById('res-title').textContent = 'I GOT IT!';
  document.getElementById('res-title').className = 'result-title win';
  document.getElementById('res-sub').textContent = `The genie never fails! ${questionCount} questions.`;
  document.getElementById('feedback-btns').style.display = 'none';
}
function onWrong() {
  document.getElementById('genie-face').className = 'genie-avatar lose';
  document.getElementById('res-icon').innerHTML = '<i class="fa-solid fa-face-sad-tear"></i>';
  document.getElementById('res-icon').className = 'result-icon lose-icon';
  document.getElementById('res-title').textContent = 'I WAS WRONG...';
  document.getElementById('res-title').className = 'result-title lose';
  document.getElementById('res-sub').textContent = 'You outsmarted me! Play again and I will learn.';
  document.getElementById('feedback-btns').style.display = 'none';
}

function restartGame() {
  gameHistory=[]; questionCount=0; confidence=0; currentGuess=''; gameOver=false;
  document.getElementById('hist-items').innerHTML='';
  document.getElementById('history').style.display='none';
  document.getElementById('result-card').style.display='none';
  document.getElementById('bubble').style.display='none';
  document.getElementById('answers').style.display='none';
  document.getElementById('thinking').style.display='none';
  document.getElementById('genie-face').className='genie-avatar';
  document.getElementById('feedback-btns').style.display='flex';
  updateProgress();
  askNext();
}

function goToEntry() {
  document.getElementById('game').style.display='none';
  const entry=document.getElementById('entry');
  entry.style.display='flex';
  setTimeout(()=>entry.classList.remove('hide'),10);
}
