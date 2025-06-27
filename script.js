// Command Guide dropdown toggle and close
const guideToggle = document.getElementById('commandGuideToggle');
const guideList = document.getElementById('commandGuideList');
const closeGuideBtn = guideList.querySelector('.close-guide');

guideToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = guideList.classList.contains('show');
  guideList.classList.toggle('show', !isOpen);
  guideToggle.setAttribute('aria-expanded', !isOpen);
});

closeGuideBtn.addEventListener('click', (e) => {
  guideList.classList.remove('show');
  guideToggle.setAttribute('aria-expanded', 'false');
});

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  if (!guideList.contains(e.target) && !guideToggle.contains(e.target)) {
    guideList.classList.remove('show');
    guideToggle.setAttribute('aria-expanded', 'false');
  }
});

// Apply button inserts command text into event IDs textarea
document.querySelectorAll('.apply-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const codeBlock = btn.previousElementSibling.textContent.trim();
    const eventIdsTextarea = document.getElementById('eventIds');
    if (eventIdsTextarea) {
      eventIdsTextarea.value = codeBlock;
      eventIdsTextarea.focus();
    }
    guideList.classList.remove('show');
    guideToggle.setAttribute('aria-expanded', 'false');
  });
});
