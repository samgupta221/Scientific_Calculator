const display = document.getElementById('display');
const buttonsGrid = document.querySelector('.buttons-grid');
const themeToggle = document.getElementById('themeToggle');
const angleToggle = document.getElementById('angleToggle');
const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');
const openHistoryBtn = document.getElementById('open-history');
const clearHistoryBtn = document.getElementById('clearHistory');

let currentInput = '';
let memory = 0;
let history = [];
let isDegree = angleToggle.checked;
let lightMode = false;

function updateDisplay() {
  display.textContent = currentInput || '0';
}

function addInput(value) {
  if (currentInput.length >= 25) return; // Max length limit

  if (value === '.') {
    const parts = currentInput.split(/[\+\-\*\/]/);
    if (parts[parts.length - 1].includes('.')) return;
  }

  currentInput += value;
  updateDisplay();
}

function clearInput() {
  currentInput = '';
  updateDisplay();
}

function deleteLast() {
  currentInput = currentInput.slice(0, -1);
  updateDisplay();
}

function memoryClear() {
  memory = 0;
}

function memoryRecall() {
  addInput(memory.toString());
}

function memoryAdd() {
  try {
    const val = eval(currentInput);
    memory += val;
  } catch {
    // ignore errors
  }
}

function memorySubtract() {
  try {
    const val = eval(currentInput);
    memory -= val;
  } catch {
    // ignore errors
  }
}

function evaluateExpression(expr) {
  try {
   
    let expression = expr.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');

    expression = expression.replace(/sin\(/g, 'Math.sin(');
    expression = expression.replace(/cos\(/g, 'Math.cos(');
    expression = expression.replace(/tan\(/g, 'Math.tan(');
    expression = expression.replace(/log\(/g, 'Math.log10(');


    if (isDegree) {
      expression = expression.replace(/Math\.sin\(([^)]+)\)/g, (_, x) => `Math.sin((${x}) * Math.PI / 180)`);
      expression = expression.replace(/Math\.cos\(([^)]+)\)/g, (_, x) => `Math.cos((${x}) * Math.PI / 180)`);
      expression = expression.replace(/Math\.tan\(([^)]+)\)/g, (_, x) => `Math.tan((${x}) * Math.PI / 180)`);
    }

    const result = eval(expression);
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return result;
    }
    return 'Error';
  } catch {
    return 'Error';
  }
}

function addToHistory(input, result) {
  if (result === 'Error') return;
  history.unshift(`${input} = ${result}`);
  renderHistory();
}


function renderHistory() {
  historyList.innerHTML = '';
  history.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = item;
    li.addEventListener('click', () => {
     
      const expr = item.split('=')[0].trim();
      currentInput = expr;
      updateDisplay();
      historyPanel.style.display = 'none';
    });
    historyList.appendChild(li);
  });
}

buttonsGrid.addEventListener('click', e => {
  const target = e.target;
  if (target.tagName !== 'BUTTON') return;


  if (target.id === 'mc') {
    memoryClear();
    return;
  }
  if (target.id === 'mr') {
    memoryRecall();
    return;
  }
  if (target.id === 'mplus') {
    memoryAdd();
    return;
  }
  if (target.id === 'mminus') {
    memorySubtract();
    return;
  }

  if (target.id === 'clear') {
    clearInput();
    return;
  }
  if (target.id === 'delete') {
    deleteLast();
    return;
  }
  if (target.id === 'equals') {
    const result = evaluateExpression(currentInput);
    if (result !== 'Error') {
      addToHistory(currentInput, result);
      currentInput = result.toString();
    } else {
      currentInput = 'Error';
    }
    updateDisplay();
    return;
  }

  if (target.classList.contains('sci-btn')) {
    const func = target.dataset.func;
    currentInput += `${func}(`;
    updateDisplay();
    return;
  }

  if (target.classList.contains('operator')) {
    if (currentInput === '' && target.dataset.op !== '-') return; // prevent operator start except minus
    // Prevent two consecutive operators
    if (/[+\-*/.]$/.test(currentInput)) {
      currentInput = currentInput.slice(0, -1);
    }
    currentInput += target.dataset.op;
    updateDisplay();
    return;
  }

  if (target.classList.contains('num-btn')) {
    addInput(target.dataset.num);
    return;
  }


  if (target.id === 'open-history') {
    historyPanel.style.display = historyPanel.style.display === 'flex' ? 'none' : 'flex';
  }
});


themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('light', themeToggle.checked);
});


angleToggle.addEventListener('change', () => {
  isDegree = angleToggle.checked;
});

clearHistoryBtn.addEventListener('click', () => {
  history = [];
  renderHistory();
});

document.addEventListener('keydown', e => {
  if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
    addInput(e.key);
  } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
    if (currentInput === '' && e.key !== '-') return;
    if (/[+\-*/.]$/.test(currentInput)) currentInput = currentInput.slice(0, -1);
    currentInput += e.key;
    updateDisplay();
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    const result = evaluateExpression(currentInput);
    if (result !== 'Error') {
      addToHistory(currentInput, result);
      currentInput = result.toString();
    } else {
      currentInput = 'Error';
    }
    updateDisplay();
  } else if (e.key === 'Backspace') {
    deleteLast();
  } else if (e.key.toLowerCase() === 'c') {
    clearInput();
  }
});

updateDisplay();
