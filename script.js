// Elements references
const queryDropdown = document.getElementById('queryDropdown');
const eventIdsTextarea = document.getElementById('eventIds');
const generateBtn = document.getElementById('generateQuery');
const outputTextarea = document.getElementById('outputQuery');
const copyBtn = document.getElementById('copyQuery');
const themeSwitch = document.getElementById('themeSwitch');
const htmlEl = document.documentElement;

let templates = []; // Will hold loaded templates

// Load templates.json and populate the dropdown
fetch('templates.json')
  .then(response => response.json())
  .then(data => {
    templates = data;
    populateQueryDropdown(templates);
  })
  .catch(error => {
    console.error('Error loading templates.json:', error);
    queryDropdown.innerHTML = '<option value="" disabled>Error loading templates</option>';
  });

// Populate the Query Template dropdown
function populateQueryDropdown(templates) {
  queryDropdown.innerHTML = '<option value="" disabled selected>Select a template</option>';
  templates.forEach((template, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = template.name;
    queryDropdown.appendChild(option);
  });
}

// Format event IDs as OR conditions for the filter block
function formatEventIdsAsOr(eventIdsArray) {
  return eventIdsArray
    .map(id => `eventId = "${id.replace(/"/g, '\\"')}"`)
    .join(' or\n  ');
}

// Generate query when button clicked
generateBtn.addEventListener('click', () => {
  const selectedIndex = queryDropdown.value;
  if (!selectedIndex) {
    alert('Please select a query template.');
    return;
  }

  const template = templates[selectedIndex];
  if (!template) {
    alert('Selected template not found.');
    return;
  }

  const rawEventIds = eventIdsTextarea.value.trim();
  if (!rawEventIds) {
    alert('Please enter at least one Event ID.');
    return;
  }

  const eventIdsArray = rawEventIds
    .split('\n')
    .map(id => id.trim())
    .filter(id => id.length > 0);

  if (eventIdsArray.length === 0) {
    alert('Please enter valid Event IDs.');
    return;
  }

  // Format event IDs as OR conditions
  const formattedEventIds = formatEventIdsAsOr(eventIdsArray);

  // Replace placeholder {{eventIds}} with formatted event IDs block
  // Note: Your template already contains the "| filter" line before {{eventIds}}
  const finalQuery = template.query.replace('{{eventIds}}', formattedEventIds);

  outputTextarea.value = finalQuery;
});

// Copy query to clipboard
copyBtn.addEventListener('click', () => {
  if (!outputTextarea.value.trim()) {
    alert('No query to copy!');
    return;
  }
  outputTextarea.select();
  outputTextarea.setSelectionRange(0, 99999); // For mobile devices

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      alert('Query copied to clipboard!');
    } else {
      alert('Failed to copy query.');
    }
  } catch (err) {
    alert('Copy command is not supported by your browser.');
  }

  // Deselect text
  window.getSelection().removeAllRanges();
});

// Dark mode toggle with persistence
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  htmlEl.setAttribute('data-theme', savedTheme);
  themeSwitch.checked = savedTheme === 'dark';
  themeSwitch.setAttribute('aria-checked', themeSwitch.checked.toString());
}

themeSwitch.addEventListener('change', () => {
  if (themeSwitch.checked) {
    htmlEl.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    themeSwitch.setAttribute('aria-checked', 'true');
  } else {
    htmlEl.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    themeSwitch.setAttribute('aria-checked', 'false');
  }
});

// Initialize theme on page load
initTheme();
