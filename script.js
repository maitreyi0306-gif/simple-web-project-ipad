document.getElementById('countBtn').addEventListener('click', () => {
  const span = document.getElementById('count');
  const n = Number(span.textContent) + 1;
  span.textContent = n;
});

const colorPicker = document.getElementById('colorPicker');
colorPicker.addEventListener('input', (e) => {
  document.body.style.background = e.target.value;
});
