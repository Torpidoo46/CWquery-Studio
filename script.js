const queryDropdown = document.getElementById('queryDropdown');
const eventIdsTextarea = document.getElementById('eventIds');
const generateBtn = document.getElementById('generateQuery');
const outputTextarea = document.getElementById('outputQuery');
const copyBtn = document.getElementById('copyQuery');
const themeSwitch = document.getElementById('themeSwitch');
const htmlEl = document.documentElement;

let templates = [];

fetch('templates.json')
  .then(res => res.json())
  .then(data => {
    templates = data;
    queryDropdown.innerHTML = '<option value="" disabled selected>Select a template</option>';
    templates.forEach((t, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = t.name;
      queryDropdown.appendChild(opt);
    });
  })
  .catch(() => {
    queryDropdown.innerHTML = '<option>Error loading templates</option>';
  });

function formatEventIdsAsOr(eventIdsArray) {
  return eventIdsArray
    .map(id => `eventId = "${id.replace(/"/g, '\\"')}"`)
    .join(' or\n  ');
}

generateBtn.addEventListener('click', () => {
  const idx = queryDropdown.value;
  if (idx === '') {
    alert('Select a template');
    return;
  }
  const template = templates[idx];
  const ids = eventIdsTextarea.value.trim().split('\n').map(s => s.trim()).filter(Boolean);
  if (ids.length === 0) {
    alert('Enter event IDs');
    return;
  }
  const filterBlock = formatEventIdsAsOr(ids);
  const query = template.query.replace('{{eventIds}}', filterBlock);
  outputTextarea.value = query;
});

copyBtn.addEventListener('click', () => {
  if (!outputTextarea.value.trim()) {
    alert('No query to copy!');
    return;
  }
  outputTextarea.select();
  document.execCommand('copy');
  alert('Copied to clipboard!');
});

function setTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeSwitch.checked = theme === 'dark';
}

themeSwitch.addEventListener('change', () => {
  setTheme(themeSwitch.checked ? 'dark' : 'light');
});

setTheme(localStorage.getItem('theme') || 'light');
