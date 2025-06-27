// Query Templates
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

// Command Guide
const commandGuide = {
  "fields": "Retrieve one or more log fields. You can also use functions and operations such as abs(a+b), sqrt(a/b), log(a)+log(b), strlen(trim()), datefloor(), isPresent(), and others in this command.",
  "filter": "Retrieve log fields based on one or more conditions. You can use comparison operators such as =, !=, >, >=, <, <=, boolean operators such as and, or, and not, and regular expressions.",
  "filterIndex": "Only supported in Standard log class. Limits the query to indexed data using a specified field.",
  "stats": "Calculate aggregate statistics such as sum(), avg(), count(), min(), max(). Can be nested.",
  "sort": "Sort log fields in ascending or descending order.",
  "limit": "Limit number of log events returned by a query.",
  "parse": "Extract ephemeral fields from log messages for further processing.",
  "dedup": "Remove duplicate results based on provided fields.",
  "pattern": "Identify and collapse log groups with similar structures. (Standard class only)",
  "diff": "Compare pattern changes between two time ranges. (Standard class only)",
  "unnest": "Flatten a list into multiple records (esp. from JSON)."
};

// Populate dropdowns
window.onload = function () {
  const templateSelect = document.getElementById("templateSelect");
  Object.keys(templates).forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key;
    templateSelect.appendChild(option);
  });

  const commandGuideSelect = document.getElementById("commandGuide");
  Object.keys(commandGuide).forEach(key => {
    const option = document.createElement("option");
    option.value = commandGuide[key];
    option.textContent = key;
    commandGuideSelect.appendChild(option);
  });

  document.getElementById("commandGuide").addEventListener("change", function () {
    const desc = this.value;
    document.getElementById("commandDescription").innerText = desc;
  });

  document.getElementById("darkModeToggle").addEventListener("change", function () {
    document.body.classList.toggle("light");
  });
};

// Generate query with event IDs
function generateQuery() {
  const selectedTemplate = document.getElementById("templateSelect").value;
  const input = document.getElementById("eventInput").value.trim();
  const outputBox = document.getElementById("outputQuery");

  if (!input) {
    alert("Please enter one or more event IDs.");
    return;
  }

  const ids = input.split(",").map(id => `eventId = "${id.trim()}"`);
  const eventFilter = ids.join(" or ");

  const rawTemplate = templates[selectedTemplate];
  const finalQuery = rawTemplate.replace("{EVENT_FILTER}", eventFilter);

  outputBox.innerText = finalQuery;
}
