const timeline = document.getElementById("timeline");

let settings = JSON.parse(localStorage.getItem("settings")) || {
  start: "06:00",
  end: "23:00",
  hourSize: 60
};

let events = JSON.parse(localStorage.getItem("events")) || [];
let currentEvent = null;

// ---------- UTILS ----------
const toMin = t => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const toTime = m =>
  String(Math.floor(m / 60)).padStart(2, "0") + ":" +
  String(m % 60).padStart(2, "0");

// ---------- TIMELINE ----------
function renderTimeline() {
  timeline.innerHTML = "";
  timeline.style.setProperty("--hour-size", settings.hourSize + "px");

  const start = toMin(settings.start);
  const end = toMin(settings.end);

  for (let m = start; m < end; m += 60) {
    const h = document.createElement("div");
    h.className = "hour";
    h.textContent = toTime(m);
    timeline.appendChild(h);
  }

  events.forEach(renderEvent);
}

// ---------- EVENT ----------
function renderEvent(ev) {
  const el = document.createElement("div");
  el.className = "event";
  el.textContent = ev.title;
  el.style.borderColor = ev.color;

  const base = toMin(settings.start);
  el.style.top =
    ((ev.start - base) / 60) * settings.hourSize + "px";
  el.style.height =
    ((ev.end - ev.start) / 60) * settings.hourSize + "px";

  timeline.appendChild(el);

  let moved = false, startY, startTop;

  el.onpointerdown = e => {
    moved = false;
    startY = e.clientY;
    startTop = el.offsetTop;

    document.onpointermove = evm => {
      moved = true;
      el.style.top = startTop + (evm.clientY - startY) + "px";
    };

    document.onpointerup = () => {
      document.onpointermove = null;
      document.onpointerup = null;

      if (moved) {
        const minutes =
          (el.offsetTop / settings.hourSize) * 60 + base;
        ev.start = Math.round(minutes / 15) * 15;
        localStorage.setItem("events", JSON.stringify(events));
        renderTimeline();
      } else {
        openEventModal(ev);
      }
    };
  };
}

// ---------- CRIAR EVENTO ----------
timeline.onclick = e => {
  if (e.target.closest(".event")) return;

  const rect = timeline.getBoundingClientRect();
  const y = e.clientY - rect.top;

  const base = toMin(settings.start);
  const start = base + Math.floor((y / settings.hourSize) * 60);

  currentEvent = {
    id: Date.now(),
    title: "",
    desc: "",
    start,
    end: start + 60,
    color: "#2196f3"
  };

  openEventModal(currentEvent);
};

// ---------- MODAIS ----------
const eventOverlay = document.getElementById("eventOverlay");
const configOverlay = document.getElementById("configOverlay");

function openEventModal(ev) {
  currentEvent = ev;
  evTitle.value = ev.title;
  evDesc.value = ev.desc;
  evStart.value = toTime(ev.start);
  evEnd.value = toTime(ev.end);
  evColor.value = ev.color;
  eventOverlay.classList.add("active");
}

eventOverlay.onclick = e => {
  if (e.target === eventOverlay) eventOverlay.classList.remove("active");
};

saveEvent.onclick = () => {
  currentEvent.title = evTitle.value;
  currentEvent.desc = evDesc.value;
  currentEvent.start = toMin(evStart.value);
  currentEvent.end = toMin(evEnd.value);
  currentEvent.color = evColor.value;

  if (!events.find(e => e.id === currentEvent.id))
    events.push(currentEvent);

  localStorage.setItem("events", JSON.stringify(events));
  eventOverlay.classList.remove("active");
  renderTimeline();
};

// ---------- CONFIG ----------
settingsBtn.onclick = () => {
  cfgStart.value = settings.start;
  cfgEnd.value = settings.end;
  cfgHourSize.value = settings.hourSize;
  configOverlay.classList.add("active");
};

configOverlay.onclick = e => {
  if (e.target === configOverlay)
    configOverlay.classList.remove("active");
};

saveConfig.onclick = () => {
  settings.start = cfgStart.value;
  settings.end = cfgEnd.value;
  settings.hourSize = +cfgHourSize.value;
  localStorage.setItem("settings", JSON.stringify(settings));
  configOverlay.classList.remove("active");
  renderTimeline();
};

renderTimeline();
