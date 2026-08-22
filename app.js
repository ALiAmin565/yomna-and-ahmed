const WEDDING = {
  title: "Yomna & Ahmed Wedding",
  start: "2026-09-17T20:00:00+03:00",
  end: "2026-09-18T01:00:00+03:00",
  location: "Beau Jardin Venues, Km 28 Alexandria Desert Road, Sheikh Zayed, Giza, Egypt",
  details: "Two souls. One beautiful chaos.\nThursday 17 September 2026 · 8:00 PM\nAdults-only celebration — children kindly stay at home.",
};

const cover = document.getElementById("cover");
const curtains = document.getElementById("curtains");
const film = document.getElementById("film");
const invite = document.getElementById("invite");
const openBtn = document.getElementById("openBtn");
const skipBtn = document.getElementById("skipBtn");
const shareBtn = document.getElementById("shareBtn");
const calBtn = document.getElementById("calBtn");

let timers = [];

function later(fn, ms) {
  const id = setTimeout(fn, ms);
  timers.push(id);
  return id;
}

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

function showInvite() {
  clearTimers();
  cover.style.display = "none";
  curtains.classList.remove("play", "open");
  film.classList.remove("show", "step-1", "step-2", "step-3", "step-4", "step-5", "step-6");
  film.style.display = "none";
  invite.hidden = false;
  invite.classList.add("show");
  document.getElementById("stage").classList.add("is-open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function playFilm() {
  film.style.display = "block";
  film.classList.add("show");
  later(() => film.classList.add("step-1"), 200);
  later(() => film.classList.add("step-2"), 900);
  later(() => film.classList.add("step-3"), 1600);
  later(() => film.classList.add("step-4"), 2400);
  later(() => film.classList.add("step-5"), 3100);
  later(() => film.classList.add("step-6"), 4000);
  later(showInvite, 7200);
}

function openInvitation() {
  openBtn.disabled = true;
  curtains.classList.add("play");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => curtains.classList.add("open"));
  });
  later(() => {
    cover.style.display = "none";
    playFilm();
  }, 900);
  later(() => curtains.classList.remove("play", "open"), 1900);
}

openBtn.addEventListener("click", openInvitation);
skipBtn.addEventListener("click", showInvite);

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || /[?&]open=1\b/.test(location.search)) {
  showInvite();
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function tick() {
  const now = Date.now();
  const target = Date.parse(WEDDING.start);
  let diff = Math.max(0, target - now);
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
  const d = new Date(iso);
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function googleCalUrl() {
  const gcal = new URL("https://calendar.google.com/calendar/render");
  gcal.searchParams.set("action", "TEMPLATE");
  gcal.searchParams.set("text", WEDDING.title);
  gcal.searchParams.set("dates", `${icsStamp(WEDDING.start)}/${icsStamp(WEDDING.end)}`);
  gcal.searchParams.set("details", WEDDING.details);
  gcal.searchParams.set("location", WEDDING.location);
  return gcal.toString();
}

function downloadCalendar(event) {
  event.preventDefault();
  const apple = /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent);
  if (!apple) {
    window.open(googleCalUrl(), "_blank", "noopener");
    return;
  }
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Yomna Ahmed Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:yomna-ahmed-wedding@invite`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(WEDDING.start)}`,
    `DTEND:${icsStamp(WEDDING.end)}`,
    `SUMMARY:${WEDDING.title}`,
    `LOCATION:${WEDDING.location}`,
    `DESCRIPTION:${WEDDING.details.replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "yomna-ahmed-wedding.ics";
  a.click();
  URL.revokeObjectURL(url);
}

calBtn.addEventListener("click", downloadCalendar);

shareBtn.addEventListener("click", async () => {
  const data = {
    title: "Yomna & Ahmed — Wedding Invitation",
    text: "You're invited to the wedding of Yomna & Ahmed · 17 September 2026 · 8:00 PM · Beau Jardin",
    url: window.location.href,
  };
  try {
    if (navigator.share) {
      await navigator.share(data);
      return;
    }
  } catch {
    /* user cancelled */
  }
  try {
    await navigator.clipboard.writeText(window.location.href);
    shareBtn.textContent = "Link copied · تم نسخ الرابط";
    setTimeout(() => {
      shareBtn.textContent = "Share invitation · شارك الدعوة";
    }, 2200);
  } catch {
    prompt("Copy this invitation link:", window.location.href);
  }
});
