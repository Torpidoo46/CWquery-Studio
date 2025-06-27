const templates = {
  "Status Code Query": `fields @logStream, @timestamp
| parse @message '* - [*] * "* * *" * * "*" "*" * * "*" "*" "*" "*" "*" "*" "*"'
  as remoteAddr, dateTimeString, dateTimeEpoch, requestMethod, url, requestProtocol,
     statusCode, bytes, referrer, userAgent, requestTime, serverName, forwaredFor,
     upstreamTime, upstreamAddr, cacheStatus, upstreacCacheControl,
     upstreamExpires, tbc, cdn
| filter requestMethod == "GET"
| parse url /\\/(?<eventId>[a-zA-Z0-9_]+)\\/(?<profile>.*)\\//
| filter
  {EVENT_FILTER}
| parse statusCode /(?<@status2xx>2..)/
| parse statusCode /(?<@status3xx>3..)/
| parse statusCode /(?<@status4xx>4..)/
| parse statusCode /(?<@status5xx>5..)/
| stats count(@status2xx), count(@status3xx), count(@status4xx), count(@status5xx) by bin(1m) as time
| limit 10000`,

  "Response Time Query": `fields @logStream, @timestamp
| parse @message '* - [*] * "* * *" * * "*" "*" * * "*" "*" "*" "*" "*" "*" "*"'
  as remoteAddr, dateTimeString, dateTimeEpoch, requestMethod, url, requestProtocol,
     statusCode, bytes, referrer, userAgent, requestTime, serverName, forwaredFor,
     upstreamTime, upstreamAddr, cacheStatus, upstreacCacheControl,
     upstreamExpires, tbc, cdn
| filter requestMethod == "GET"
| parse url /\\/(?<eventId>[a-zA-Z0-9_]+)\\/(?<profile>.*)\\//
| filter
  {EVENT_FILTER}
| field abs(upstreamTime)*1000 as ust
| field abs(requestTime)*1000 as rst
| filter rst >= 0
| filter ust >= 0
| stats
    avg(ust), avg(rst),
    pct(ust, 95), pct(rst, 95),
    pct(ust, 99), pct(rst, 99),
    max(ust), max(rst)
  by bin(10s) as time
| order by time
| limit 10000`
};

const commandGuide = {
  "fields": "Retrieve one or more log fields. Supports functions like abs(), sqrt(), etc.",
  "filter": "Retrieve log fields based on conditions. Supports =, !=, >, regex, etc.",
  "filterIndex": "Limit query to indexed data using the specified field.",
  "stats": "Calculate stats: sum(), avg(), count(), etc. Can be nested.",
  "sort": "Sort log fields in ascending or descending order.",
  "limit": "Limit the number of log events returned by a query.",
  "parse": "Extract ephemeral fields from log messages.",
  "dedup": "Remove duplicate results based on provided fields.",
  "pattern": "Identify repeating log patterns. (Standard class only)",
  "diff": "Compare patterns across two time ranges. (Standard class only)",
  "unnest": "Flatten a list into multiple records from a JSON message."
};

window.onload = function () {
  const templateSelect = document.getElementById("templateSelect");
  Object.keys(templates).forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key;
    templateSelect.appendChild(option);
  });

  document.getElementById("guideToggle").addEventListener("click", () => {
    const box = document.getElementById("guideBox");
    box.classList.toggle("hidden");
    if (!box.classList.contains("loaded")) {
      box.innerHTML = Object.entries(commandGuide)
        .map(([cmd, desc]) => `<strong>${cmd}</strong>: ${desc}`)
        .join("<br><br>");
      box.classList.add("loaded");
    }
  });

  document.getElementById("darkModeToggle").addEventListener("change", function () {
    document.body.classList.toggle("light");
  });

  document.getElementById("copyBtn").addEventListener("click", () => {
    const output = document.getElementById("outputQuery").innerText;
    if (!output) {
      alert("No query to copy.");
      return;
    }
    navigator.clipboard.writeText(output).then(() => {
      alert("Query copied to clipboard!");
    });
  });
};

function generateQuery() {
  const selectedTemplate = document.getElementById("templateSelect").value;
  const input = document.getElementById("eventInput").value.trim();
  const outputBox = document.getElementById("outputQuery");

  if (!input) {
    alert("Please enter one or more event IDs.");
    return;
  }

  const ids = input
    .split(/[\n,]+/)
    .map(id => id.trim())
    .filter(Boolean)
    .map(id => `eventId = "${id}"`);

  const eventFilter = ids.join(" or\n  ");
  const rawTemplate = templates[selectedTemplate];
  const finalQuery = rawTemplate.replace("{EVENT_FILTER}", eventFilter);

  outputBox.innerText = finalQuery;
}
