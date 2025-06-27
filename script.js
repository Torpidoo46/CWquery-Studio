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
| parse statusCode /(?<@status2xx>2..)/...etc`;
  } else if (selectedQuery === "Response Time Query") {
    suffix = `
...response time suffix...`;
  }

  const fullQuery = `${baseQuery}\n${finalFilter}\n${suffix}`;
  document.getElementById("outputQuery").value = fullQuery;
});

document.getElementById("themeSwitch").addEventListener("change", e => {
  document.body.classList.toggle("dark", e.target.checked);
  document.body.classList.toggle("light", !e.target.checked);
});

document.getElementById("copyQuery").addEventListener("click", () => {
  const output = document.getElementById("outputQuery");
  output.select();
  document.execCommand("copy");
});
