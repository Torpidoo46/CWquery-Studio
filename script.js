const queries = {
  "Status Code Query": `
fields @logStream, @timestamp
| parse @message '* - [*] * "* * *" * * "*" "*" * * "*" "*" "*" "*" "*" "*" "*"'
  as remoteAddr, dateTimeString, dateTimeEpoch, requestMethod, url, requestProtocol,
     statusCode, bytes, referrer, userAgent, requestTime, serverName, forwaredFor,
     upstreamTime, upstreamAddr, cacheStatus, upstreacCacheControl,
     upstreamExpires, tbc, cdn
| filter requestMethod == "GET"
| parse url /\\/(?<eventId>[a-zA-Z0-9_]+)\\/(?<profile>.*)\\//`,

  "Response Time Query": `
fields @logStream, @timestamp
| parse @message '* - [*] * "* * *" * * "*" "*" * * "*" "*" "*" "*" "*" "*" "*"'
  as remoteAddr, dateTimeString, dateTimeEpoch, requestMethod, url, requestProtocol,
     statusCode, bytes, referrer, userAgent, requestTime, serverName, forwaredFor,
     upstreamTime, upstreamAddr, cacheStatus, upstreacCacheControl,
     upstreamExpires, tbc, cdn
| filter requestMethod == "GET"
| parse url /\\/(?<eventId>[a-zA-Z0-9_]+)\\/(?<profile>.*)\\//`
};

document.getElementById("generateQuery").addEventListener("click", () => {
  const selectedQuery = document.getElementById("queryDropdown").value;
  const baseQuery = queries[selectedQuery] || "";
  const rawIds = document.getElementById("eventIds").value.trim();
  const lines = rawIds.split(/\r?\n/).filter(id => id.trim().length > 0);

  const eventFilters = lines.map(id => `  eventId = "${id.trim()}"`).join(" or\n");
  const finalFilter = lines.length > 0 ? `| filter\n${eventFilters}` : "";

  let suffix = "";

  if (selectedQuery === "Status Code Query") {
    suffix = `
| parse statusCode /(?<@status2xx>2..)/
| parse statusCode /(?<@status3xx>3..)/
| parse statusCode /(?<@status4xx>4..)/
| parse statusCode /(?<@status5xx>5..)/
| stats count(@status2xx), count(@status3xx), count(@status4xx), count(@status5xx) by bin(1m) as time
| limit 10000`;
  } else if (selectedQuery === "Response Time Query") {
    suffix = `
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
| limit 10000`;
  }

  const fullQuery = `${baseQuery}\n${finalFilter}\n${suffix}`;
  document.getElementById("outputQuery").value = fullQuery;
});

// Theme toggle
document.getElementById("themeToggle").addEventListener("change", (e) => {
  const isDark = e.target.checked;
  document.body.className = isDark ? "dark" : "light";
});

// Copy to clipboard
document.getElementById("copyQueryBtn").addEventListener("click", () => {
  const output = document.getElementById("outputQuery");
  output.select();
  output.setSelectionRange(0, 99999);
  document.execCommand("copy");
});
