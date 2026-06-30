
const state = {
  current:   '0',
  previous:  '',
  operator:  null,
  freshOp:   false,   // just pressed an operator
  freshEq:   false,   // just pressed equals
  history:   [],      // tape lines
};

const resultEl    = document.getElementById('result');
const expressionEl = document.getElementById('expression');
const tapeEl      = document.getElementById('tape');

function render() {
  resultEl.textContent = format(state.current);
  expressionEl.textContent =
    state.previous && state.operator
      ? `${format(state.previous)} ${state.operator}`
      : '';
}

function format(num) {
  if (num === 'Error') return '😬 Error';
  const n = parseFloat(num);
  if (isNaN(n)) return num;
  // Limit display length
  if (Math.abs(n) >= 1e12 || (Math.abs(n) < 1e-6 && n !== 0)) {
    return n.toExponential(4);
  }
  const str = parseFloat(n.toPrecision(10)).toString();
  return str;
}

function addTape(line) {
  state.history.push(line);
  if (state.history.length > 8) state.history.shift();
  tapeEl.textContent = state.history.join('\n');
  tapeEl.scrollTop = tapeEl.scrollHeight;
}
function inputDigit(d) {
  if (state.freshOp || state.freshEq) {
    state.current = d;
    state.freshOp = false;
    state.freshEq = false;
  } else {
    state.current = state.current === '0' ? d : state.current + d;
  }
  if (state.current.length > 12) state.current = state.current.slice(0, 12);
}

function inputDecimal() {
  if (state.freshOp || state.freshEq) {
    state.current = '0.';
    state.freshOp = false;
    state.freshEq = false;
    return;
  }
  if (!state.current.includes('.')) state.current += '.';
}

function inputOperator(op) {
  if (state.operator && !state.freshOp) {
    calculate();
  }
  state.previous = state.current;
  state.operator  = op;
  state.freshOp   = true;
  state.freshEq   = false;
}

function calculate() {
  if (!state.operator || !state.previous) return;
  const a = parseFloat(state.previous);
  const b = parseFloat(state.current);
  let result;

  switch (state.operator) {
    case '+': result = a + b; break;
    case '−': result = a - b; break;
    case '×': result = a * b; break;
    case '÷':
      if (b === 0) { result = 'Error'; break; }
      result = a / b;
      break;
    default: return;
  }

  const line = `${format(state.previous)} ${state.operator} ${format(state.current)} = ${result === 'Error' ? '😬' : format(result.toString())}`;
  addTape(line);

  state.current  = result === 'Error' ? 'Error' : result.toString();
  state.previous = '';
  state.operator  = null;
  state.freshEq   = true;
}

function clear() {
  state.current  = '0';
  state.previous = '';
  state.operator  = null;
  state.freshOp  = false;
  state.freshEq  = false;
}

function toggleSign() {
  if (state.current === 'Error') return;
  state.current = (parseFloat(state.current) * -1).toString();
}

function percent() {
  if (state.current === 'Error') return;
  state.current = (parseFloat(state.current) / 100).toString();
}
function pop() {
  resultEl.classList.remove('pop');
  void resultEl.offsetWidth;
  resultEl.classList.add('pop');
  setTimeout(() => resultEl.classList.remove('pop'), 120);
}

function shakeDisplay() {
  resultEl.classList.remove('shake');
  void resultEl.offsetWidth;
  resultEl.classList.add('shake');
  setTimeout(() => resultEl.classList.remove('shake'), 400);
}
document.querySelector('.keypad').addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;

  const action = btn.dataset.action;
  const value  = btn.dataset.value;

  switch (action) {
    case 'digit':    inputDigit(value); pop(); break;
    case 'decimal':  inputDecimal(); break;
    case 'operator': inputOperator(value); break;
    case 'equals':
      if (state.current === 'Error') { shakeDisplay(); break; }
      calculate();
      pop();
      break;
    case 'clear':    clear(); break;
    case 'sign':     toggleSign(); break;
    case 'percent':  percent(); break;
  }

  render();
});
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9')     { inputDigit(e.key); pop(); }
  else if (e.key === '.')               { inputDecimal(); }
  else if (e.key === '+')               { inputOperator('+'); }
  else if (e.key === '-')               { inputOperator('−'); }
  else if (e.key === '*')               { inputOperator('×'); }
  else if (e.key === '/')               { e.preventDefault(); inputOperator('÷'); }
  else if (e.key === 'Enter' || e.key === '=') { calculate(); pop(); }
  else if (e.key === 'Backspace')       {
    if (state.current.length > 1) state.current = state.current.slice(0,-1);
    else state.current = '0';
  }
  else if (e.key === 'Escape')          { clear(); }

  render();
});
render();
