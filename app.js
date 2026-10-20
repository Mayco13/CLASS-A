const fields = {
  min: document.querySelector('#min'),
  max: document.querySelector('#max'),
  count: document.querySelector('#count'),
};

const button = document.querySelector('#draw-button');
const result = document.querySelector('#result');
const validation = document.querySelector('#validation');
const rangeNote = document.querySelector('#range-note');
const history = document.querySelector('#history');
const clearHistory = document.querySelector('#clear-history');

function randomInt(min, max) {
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  return min + (random[0] % (max - min + 1));
}

function settings() {
  const min = Number(fields.min.value);
  const max = Number(fields.max.value);
  const count = Number(fields.count.value);
  if (!Number.isInteger(min) || !Number.isInteger(max) || !Number.isInteger(count)) return { error: '請輸入整數。' };
  if (min > max) return { error: '最小號碼不可大於最大號碼。' };
  if (count < 1) return { error: '抽取數量至少為 1。' };
  if (count > max - min + 1) return { error: '抽取數量不可超過範圍內的號碼數。' };
  return { min, max, count };
}

function pickNumbers(min, max, count) {
  const available = Array.from({ length: max - min + 1 }, (_, index) => min + index);
  for (let index = available.length - 1; index > 0; index -= 1) {
    const pick = randomInt(0, index);
    [available[index], available[pick]] = [available[pick], available[index]];
  }
  return available.slice(0, count).sort((a, b) => a - b);
}

function renderHistory(numbers) {
  const item = document.createElement('li');
  const time = document.createElement('time');
  const values = document.createElement('span');
  time.dateTime = new Date().toISOString();
  time.textContent = new Intl.DateTimeFormat('zh-TW', { hour: '2-digit', minute: '2-digit' }).format(new Date());
  values.textContent = numbers.join('、');
  item.append(time, values);
  history.prepend(item);
  clearHistory.disabled = false;
}

async function draw() {
  const config = settings();
  validation.textContent = config.error || '';
  if (config.error) return;

  button.disabled = true;
  const numbers = pickNumbers(config.min, config.max, config.count);
  result.replaceChildren();
  rangeNote.textContent = `${config.min}–${config.max}，抽取 ${config.count} 個`;

  for (const [index, value] of numbers.entries()) {
    const number = document.createElement('span');
    number.className = 'number';
    number.textContent = value;
    result.append(number);
    await new Promise((resolve) => setTimeout(resolve, index === 0 ? 80 : 130));
    number.classList.add('show');
  }
  renderHistory(numbers);
  button.disabled = false;
}

button.addEventListener('click', draw);
clearHistory.addEventListener('click', () => {
  history.replaceChildren();
  clearHistory.disabled = true;
});

Object.values(fields).forEach((field) => field.addEventListener('input', () => {
  validation.textContent = '';
}));
