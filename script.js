class Calculator {
  constructor(historyElement, resultElement, historyListElement) {
    this.historyElement = historyElement;
    this.resultElement = resultElement;
    this.historyListElement = historyListElement;
    this.logs = [];
    this.clear();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.shouldResetScreen = false;
    this.updateDisplay();
  }

  delete() {
    if (this.shouldResetScreen) return;
    if (this.currentOperand === '0') return;
    
    if (this.currentOperand.length === 1) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.toString().slice(0, -1);
    }
    this.updateDisplay();
  }

  appendNumber(number) {
    if (this.currentOperand === '0' || this.shouldResetScreen) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }
    
    if (number === '.' && this.currentOperand.includes('.')) return;
    
    this.currentOperand += number;
    this.updateDisplay();
  }

  chooseOperation(operation) {
    if (this.currentOperand === '' && operation !== '-') return;
    
    if (this.previousOperand !== '') {
      this.compute();
    }

    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    switch (this.operation) {
      case '+': computation = prev + current; break;
      case '-': computation = prev - current; break;
      case '*': computation = prev * current; break;
      case '/':
        if (current === 0) {
          alert("Cannot divide by zero!");
          this.clear();
          return;
        }
        computation = prev / current;
        break;
      case '%': computation = prev % current; break;
      default: return;
    }

    const displaySymbol = this.operation === '*' ? '×' : this.operation === '/' ? '÷' : this.operation;
    const resultVal = Math.round(computation * 1e10) / 1e10;
    
    this.logs.unshift({
      expression: `${this.previousOperand} ${displaySymbol} ${this.currentOperand} =`,
      value: resultVal
    });
    this.renderHistoryLog();

    this.currentOperand = resultVal.toString();
    this.operation = undefined;
    this.previousOperand = '';
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  updateDisplay() {
    this.resultElement.innerText = this.currentOperand;
    if (this.operation != null) {
      const displaySymbol = this.operation === '*' ? '×' : this.operation === '/' ? '÷' : this.operation;
      this.historyElement.innerText = `${this.previousOperand} ${displaySymbol}`;
    } else {
      this.historyElement.innerText = '';
    }
  }

  renderHistoryLog() {
    if (!this.historyListElement) return;

    if (this.logs.length === 0) {
      this.historyListElement.innerHTML = '<p class="empty-msg">No calculations yet</p>';
      return;
    }

    let itemsHtml = '';
    for (let i = 0; i < this.logs.length; i++) {
      itemsHtml += `
        <div class="history-item" data-val="${this.logs[i].value}">
          <div class="calc-expr">${this.logs[i].expression}</div>
          <div class="calc-val">${this.logs[i].value}</div>
        </div>
      `;
    }
    this.historyListElement.innerHTML = itemsHtml;

    const historyItems = this.historyListElement.querySelectorAll('.history-item');
    historyItems.forEach((item) => {
      item.addEventListener('click', () => {
        this.currentOperand = item.getAttribute('data-val');
        this.shouldResetScreen = false;
        this.updateDisplay();
        const drawer = document.getElementById('history-drawer');
        if (drawer) drawer.classList.remove('open');
      });
    });
  }

  clearLogs() {
    this.logs = [];
    this.renderHistoryLog();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const historyElement = document.getElementById('history');
  const resultElement = document.getElementById('result');
  const historyListElement = document.getElementById('history-list');

  const calculator = new Calculator(historyElement, resultElement, historyListElement);

  function handleInput(key) {
    if (!isNaN(key) || key === '.') {
      calculator.appendNumber(key);
    } else if (['+', '-', '*', '/', '%'].includes(key)) {
      calculator.chooseOperation(key);
    } else if (key === 'Enter' || key === '=') {
      calculator.compute();
    } else if (key === 'Backspace') {
      calculator.delete();
    } else if (key === 'Clear') {
      calculator.clear();
    }
  }

  document.querySelectorAll('.btn').forEach((button) => {
    button.addEventListener('click', () => {
      if ('vibrate' in navigator) navigator.vibrate(20);
      const key = button.getAttribute('data-key');
      handleInput(key);
    });
  });

  document.addEventListener('keydown', (e) => {
    let key = e.key;
    if (key === 'Escape' || key.toLowerCase() === 'c') key = 'Clear';
    if (key.toLowerCase() === 'x') key = '*';

    const validKeys = ['0','1','2','3','4','5','6','7','8','9','.', '+','-','*','/','%','Enter','=','Backspace','Clear'];
    
    if (validKeys.includes(key)) {
      e.preventDefault();
      const button = document.querySelector(`.btn[data-key="${key}"]`);
      if (button) {
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 120);
      }
      handleInput(key);
    }
  });

  const historyToggle = document.getElementById('history-toggle');
  const closeDrawer = document.getElementById('close-drawer');
  const clearHistory = document.getElementById('clear-history');
  const drawer = document.getElementById('history-drawer');

  if (historyToggle && drawer) {
    historyToggle.addEventListener('click', () => drawer.classList.add('open'));
  }
  if (closeDrawer && drawer) {
    closeDrawer.addEventListener('click', () => drawer.classList.remove('open'));
  }
  if (clearHistory) {
    clearHistory.addEventListener('click', () => calculator.clearLogs());
  }
});