let queries = [];

fetch("templet.json?v=2")
  .then((res) => res.json())
  .then((data) => {
    queries = data;

    const dropdown = document.getElementById("queryDropdown");
    dropdown.innerHTML = "";

    queries.forEach((item, index) => {
      const option = document.createElement("option");
      option.textContent = item.name;
      option.value = index;
      dropdown.appendChild(option);
    });
  });

document.getElementById("generateQuery").addEventListener("click", () => {
  const selectedIndex = document.getElementById("queryDropdown").value;
  const template = queries[selectedIndex];
  if (!template) return;

  const rawIds = document.getElementById("eventIds").value.trim();
  const lines = rawIds.split(/\r?\n/).filter((id) => id.trim().length > 0);
  const eventFilters = lines.map((id) => `  eventId = "${id.trim()}"`).join(" or\n");
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
