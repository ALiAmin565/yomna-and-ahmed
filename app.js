const WEDDING = {
  title: "Yomna Afify & Ahmed Wedding",
  start: "2026-09-17T20:00:00+03:00",
  end: "2026-09-18T01:00:00+03:00",
  location: "Beau Jardin Venues, Km 28 Alexandria Desert Road, Sheikh Zayed, Giza, Egypt",
  details: "Thursday 17 September 2026 · 8:00 PM · Beau Jardin\nAdults-only celebration.",
};

const shareBtn = document.getElementById("shareBtn");
const calBtn = document.getElementById("calBtn");

function pad(n) {
  return String(n).padStart(2, "0");
}

function tick() {
  let diff = Math.max(0, Date.parse(WEDDING.start) - Date.now());
  const dd = Math.floor(diff / 86400000);
  diff -= dd * 86400000;
  const hh = Math.floor(diff / 3600000);
  diff -= hh * 3600000;
  const mm = Math.floor(diff / 60000);
  diff -= mm * 60000;
  const ss = Math.floor(diff / 1000);
  document.getElementById("dd").textContent = pad(dd);
  document.getElementById("hh").textContent = pad(hh);
  document.getElementById("mm").textContent = pad(mm);
  document.getElementById("ss").textContent = pad(ss);
}

tick();
setInterval(tick, 1000);

function icsStamp(iso) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

calBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const apple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
  const gcal = new URL("https://calendar.google.com/calendar/render");
  gcal.searchParams.set("action", "TEMPLATE");
  gcal.searchParams.set("text", WEDDING.title);
  gcal.searchParams.set("dates", `${icsStamp(WEDDING.start)}/${icsStamp(WEDDING.end)}`);
  gcal.searchParams.set("details", WEDDING.details);
  gcal.searchParams.set("location", WEDDING.location);
  if (!apple) {
    window.open(gcal.toString(), "_blank", "noopener");
    return;
  }
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${icsStamp(WEDDING.start)}`,
    `DTEND:${icsStamp(WEDDING.end)}`,
    `SUMMARY:${WEDDING.title}`,
    `LOCATION:${WEDDING.location}`,
    `DESCRIPTION:${WEDDING.details.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "yomna-ahmed-wedding.ics";
  a.click();
  URL.revokeObjectURL(url);
});

shareBtn.addEventListener("click", async () => {
  const data = {
    title: "Yomna Afify & Ahmed — Wedding Invitation",
    text: "You're invited · 17 September 2026 · 8:00 PM · Beau Jardin",
    url: window.location.href,
  };
  try {
    if (navigator.share) {
      await navigator.share(data);
      return;
    }
  } catch {
    /* cancelled */
  }
  try {
    await navigator.clipboard.writeText(window.location.href);
    shareBtn.textContent = "Link copied";
    setTimeout(() => {
      shareBtn.textContent = "Share invitation";
    }, 2000);
  } catch {
    prompt("Copy this invitation link:", window.location.href);
  }
});
