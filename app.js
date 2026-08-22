const WEDDING = {
  title: "Yomna Afify & Ahmed Wedding",
  start: "2026-09-17T20:00:00+03:00",
  end: "2026-09-18T01:00:00+03:00",
  location: "Beau Jardin Venues, Km 28 Alexandria Desert Road, Sheikh Zayed, Giza, Egypt",
  details: "Two souls. One beautiful chaos.\nThursday 17 September 2026 · 8:00 PM\nAdults-only celebration — children kindly stay at home.",
};

const INVITE_PAGE = "invite.html";

const cover = document.getElementById("cover");
const curtains = document.getElementById("curtains");
const film = document.getElementById("film");
const openBtn = document.getElementById("openBtn");
const skipBtn = document.getElementById("skipBtn");
const shareBtn = document.getElementById("shareBtn");
const calBtn = document.getElementById("calBtn");
const musicBtn = document.getElementById("musicBtn");
const anghamiDock = document.getElementById("anghamiDock");

function setMusicUi(open) {
  if (!musicBtn) return;
  musicBtn.classList.toggle("on", open);
  musicBtn.setAttribute("aria-pressed", open ? "true" : "false");
  musicBtn.setAttribute("aria-label", open ? "Hide music" : "Play music");
  if (anghamiDock) anghamiDock.classList.toggle("open", open);
}

function startMusic() {
  setMusicUi(true);
}

function toggleMusic() {
  const open = !anghamiDock?.classList.contains("open");
  setMusicUi(open);
}

if (musicBtn) {
  musicBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleMusic();
  });
}

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

function goToInvite() {
  clearTimers();
  window.location.assign(INVITE_PAGE);
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
  later(goToInvite, 7200);
}

function openInvitation() {
  openBtn.disabled = true;
  startMusic();
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

if (openBtn) {
  openBtn.addEventListener("click", openInvitation);
}

if (skipBtn) {
  skipBtn.addEventListener("click", goToInvite);
}

if (openBtn && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  goToInvite();
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function tick() {
  const days = document.getElementById("dd");
  if (!days) return;
  let diff = Math.max(0, Date.parse(WEDDING.start) - Date.now());
  const dd = Math.floor(diff / 86400000);
  diff -= dd * 86400000;
  const hh = Math.floor(diff / 3600000);
  diff -= hh * 3600000;
  const mm = Math.floor(diff / 60000);
  diff -= mm * 60000;
  const ss = Math.floor(diff / 1000);
  days.textContent = pad(dd);
  document.getElementById("hh").textContent = pad(hh);
  document.getElementById("mm").textContent = pad(mm);
  document.getElementById("ss").textContent = pad(ss);
}

tick();
if (document.getElementById("dd")) {
  setInterval(tick, 1000);
}

function icsStamp(iso) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

if (calBtn) {
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
}

if (shareBtn) {
  shareBtn.addEventListener("click", async () => {
    const data = {
      title: "Yomna Afify & Ahmed — Wedding Invitation",
      text: "You're invited to the wedding of Yomna Afify & Ahmed · 17 September 2026 · 8:00 PM · Beau Jardin",
      url: window.location.href.replace(/invite\.html$/, ""),
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
      await navigator.clipboard.writeText(data.url);
      shareBtn.textContent = "Link copied · تم نسخ الرابط";
      setTimeout(() => {
        shareBtn.textContent = "Share invitation · شارك الدعوة";
      }, 2200);
    } catch {
      prompt("Copy this invitation link:", data.url);
    }
  });
}
