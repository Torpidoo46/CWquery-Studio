let templates = [];
let soundEnabled = true;

async function loadTemplates() {
  const response = await fetch('templates.json');
  templates = await response.json();
  const selector = document.getElementById('querySelector');
  templates.forEach((template, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = template.name;
    selector.appendChild(option);
  });
}

function generateQuery() {
  const selectedIndex = document.getElementById('querySelector').value;
  const template = templates[selectedIndex].query;

  const rawInput = document.getElementById('eventIds').value.trim();
  const ids = rawInput.split('\n').map(id => `"${id.trim()}"`).join(', ');

  const finalQuery = template.replace('{{eventIds}}', ids);
  document.getElementById('outputQuery').textContent = finalQuery;
  playClick();
}

function playClick() {
  if (soundEnabled) {
    const sound = document.getElementById('clickSound');
    sound.currentTime = 0;
    sound.play();
  }
}

document.querySelectorAll('*').forEach(el => {
  el.addEventListener('click', playClick);
});

document.getElementById('soundToggle').addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  document.getElementById('soundToggle').textContent = soundEnabled ? '🔊 Sound' : '🔇 Muted';
});

document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
});

window.onload = loadTemplates;

