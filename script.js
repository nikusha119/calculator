(function(){
  const resultEl = document.getElementById('result');
  const exprEl = document.getElementById('expr');
  const switchBtn = document.getElementById('themeSwitch');
  const knobIcon = document.getElementById('knobIcon');

  // Theme
  function applyTheme(dark){
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    switchBtn.setAttribute('data-on', dark ? 'true' : 'false');
    knobIcon.textContent = dark ? '🌙' : '☀️';
    try{ localStorage.setItem('calc-theme', dark ? 'dark' : 'light'); }catch(e){}
  }
  let savedTheme = 'dark';
  try{ savedTheme = localStorage.getItem('calc-theme') || 'dark'; }catch(e){}
  applyTheme(savedTheme === 'dark');
  switchBtn.addEventListener('click', ()=>{
    const nowDark = switchBtn.getAttribute('data-on') !== 'true';
    applyTheme(nowDark);
  });

  // Calculator logic
  let current = '0';
  let prev = null;
  let op = null;
  let justEvaluated = false;

  function formatNum(numStr){
    if(numStr === 'Error') return numStr;
    const n = parseFloat(numStr);
    if(!isFinite(n)) return 'Error';
    let s;
    if(Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-9 && n !== 0)){
      s = n.toExponential(4);
    } else {
      s = n.toLocaleString('en-US', {maximumFractionDigits:8});
    }
    return s;
  }

  function render(){
    resultEl.textContent = formatNum(current);
    exprEl.textContent = prev !== null && op ? formatNum(prev) + ' ' + op : '\u00A0';
  }

  function inputDigit(d){
    if(justEvaluated){ current = '0'; justEvaluated = false; }
    if(d === '.'){
      if(current.includes('.')) return;
      current = current + '.';
      return;
    }
    if(current === '0') current = d;
    else current = current + d;
  }

  function compute(a,b,operator){
    a = parseFloat(a); b = parseFloat(b);
    switch(operator){
      case '+': return a+b;
      case '−': return a-b;
      case '×': return a*b;
      case '÷': return b===0 ? NaN : a/b;
    }
  }

  function chooseOp(newOp){
    if(op && prev !== null && !justEvaluated){
      const res = compute(prev, current, op);
      prev = isFinite(res) ? res : 'Error';
      current = formatNum(prev);
    } else {
      prev = parseFloat(current);
    }
    op = newOp;
    justEvaluated = false;
    current = '0';
    render();
  }

  function equals(){
    if(op === null || prev === null) return;
    const res = compute(prev, current, op);
    current = isFinite(res) ? formatNum(res) : 'Error';
    prev = null; op = null;
    justEvaluated = true;
    render();
  }

  function clearAll(){
    current = '0'; prev = null; op = null; justEvaluated = false;
    render();
  }

  function backspace(){
    if(justEvaluated) return;
    current = current.length > 1 ? current.slice(0,-1) : '0';
    render();
  }

  function toggleSign(){
    if(current === '0') return;
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
    render();
  }

  function percent(){
    current = String(parseFloat(current) / 100);
    render();
  }

  document.getElementById('pad').addEventListener('click', (e)=>{
    const btn = e.target.closest('.key');
    if(!btn) return;
    if(btn.dataset.digit !== undefined){ inputDigit(btn.dataset.digit); render(); return; }
    const action = btn.dataset.action;
    if(action === 'clear') clearAll();
    else if(action === 'sign') toggleSign();
    else if(action === 'percent') percent();
    else if(action === 'back') backspace();
    else if(action === 'equals') equals();
    else if(action === 'op') chooseOp(btn.dataset.op);
  });

  render();
})();