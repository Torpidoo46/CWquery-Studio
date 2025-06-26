// script.js

const queryTemplates = {
  "Status Code Query": `fields @logStream, @timestamp
| parse @message '* - [*] * "* * *" * * "*" "*" * * "*" "*" "*" "*" "*" "*" "*"'
  as remoteAddr, dateTimeString, dateTimeEpoch, requestMethod, url, requestProtocol,
     statusCode, bytes, referrer, userAgent, requestTime, serverName, forwaredFor,
     upstreamTime, upstreamAddr, cacheStatus, upstreacCacheControl,
     upstreamExpires, tbc, cdn
| filter requestMethod == "GET"
| parse url /\\/(?<eventId>[a-zA-Z0-9_]+)\\/(?<profile>.*)\\//`,

  "Response Time Query": `fields @logStream, @timestamp
| parse @message '* - [*] * "* * *" * * "*" "*" * * "*" "*" "*" "*" "*" "*" "*"'
  as remoteAddr, dateTimeString, dateTimeEpoch, requestMethod, url, requestProtocol,
     statusCode, bytes, referrer, userAgent, requestTime, serverName, forwaredFor,
     upstreamTime, upstreamAddr, cacheStatus, upstreacCacheControl,
     upstreamExpires, tbc, cdn
| filter requestMethod == "GET"
| parse url /\\/(?<eventId>[a-zA-Z0-9_]+)\\/(?<profile>.*)\\//`
};

const queryDropdown = document.getElementById("queryDropdown");
const eventIdsInput = document.getElementById("eventIds");
const outputQuery = document.getElementById("outputQuery");
const generateButton = document.getElementById("generateQuery");
const toggleSound = document.getElementById("toggleSound");
const audio = new Audio("click.mp3");
let isSoundOn = true;

toggleSound.addEventListener("click", () => {
  isSoundOn = !isSoundOn;
  toggleSound.textContent = isSoundOn ? "🔊 Sound On" : "🔇 Sound Off";
});

function formatEventIds(rawInput) {
  const ids = rawInput
    .trim()
    .split(/\s+/)
    .filter(id => id.length > 0)
    .map(id => `"${id}"`)
    .join(",\n  ");
  return `| filter eventId in [\n  ${ids}\n]`;
}

generateButton.addEventListener("click", () => {
  if (isSoundOn) audio.play();

  const selectedTemplate = queryTemplates[queryDropdown.value];
  const eventFilter = formatEventIds(eventIdsInput.value);
  let extra = "";

  if (queryDropdown.value === "Status Code Query") {
    extra = `
| parse statusCode /(?<@status2xx>2..)/ 
| parse statusCode /(?<@status3xx>3..)/ 
| parse statusCode /(?<@status4xx>4..)/ 
| parse statusCode /(?<@status5xx>5..)/ 
| stats count(@status2xx), count(@status3xx), count(@status4xx), count(@status5xx) by bin(1m) as time 
| limit 10000`;
  } else if (queryDropdown.value === "Response Time Query") {
    extra = `
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

  const finalQuery = `${selectedTemplate}\n${eventFilter}\n${extra}`;
  outputQuery.value = finalQuery;
});
