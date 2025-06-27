let queries = [];

fetch("templet.json?v=2") // Cache busting
  .then((res) => res.json())
  .then((data) => {
    queries = data;

    const dropdown = document.getElementById("queryDropdown");
    dropdown.innerHTML = ""; // Clear existing options

    queries.forEach((item, index) => {
      const option = document.createElement("option");
      option.textContent = item.name;
      option.value = index; // use index for reference
      dropdown.appendChild(option);
    });
  });

document.getElementById("generateQuery").addEventListener("click", () => {
  const selectedIndex = parseInt(document.getElementById("queryDropdown").value, 10);
  const template = queries[selectedIndex];
  if (!template) return;

  const rawIds = document.getElementById("eventIds").value.trim();
  const lines = rawIds.split(/\r?\n/).filter(id => id.trim().length > 0);
  const eventFilters = lines.map(id => `  eventId = "${id.trim()}"`).join(" or\n");
  const filterBlock = lines.length > 0 ? `| filter\n${eventFilters}` : "";

  const fullQuery = template.query.replace("{{eventIds}}", filterBlock);
  document.getElementById("outputQuery").value = fullQuery;
});

document.getElementById("themeSwitch").addEventListener("change", (e) => {
  document.body.classList.toggle("dark", e.target.checked);
  document.body.classList.toggle("light", !e.target.checked);
});

document.getElementById("copyQuery").addEventListener("click", () => {
  const output = document.getElementById("outputQuery");
  output.select();
  document.execCommand("copy");
});

