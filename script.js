const timeline = document.getElementById("timeline");
const eventModal = document.getElementById("eventModal");
const settingsModal = document.getElementById("settingsModal");

let settings = JSON.parse(localStorage.getItem("settings")) || {
  start: "06:00",
  end: "23:00",
  hourSize: 60
};

let events = JSON.parse(localStorage.getItem("events")) || [];
let activeEvent = null;
let dragging = false;

// ---------------- UTIL ----------------
function toMin(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatHour(m) {
  return String(Math.floor(m / 60)).padStart(2, "0") + ":00";
}

// ---------------- TIMELINE ----------------
function buildTimeline() {
  timeline.innerHTML = "";

  const startMin = toMin(settings.start);
  const endMin = toMin(settings.end);
  const totalHours = (endMin - startMin) / 60;

  timeline.style.height = totalHours * settings.hourSize + "px";

  for (let m = startMin; m < endMin; m += 60) {
    const h = document.createElement("div");
    h.className = "hour";
    h.style.height = settings.hourSize + "px";
    h.innerHTML = `<span>${formatHour(m)}</span>`;
    timeline.appendChild(h);
  }

  events.forEach(renderEvent);
}

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

  // DRAG
  let startY, startTop;
  el.onpointerdown = e => {
    dragging = false;
    startY = e.clientY;
    startTop = el.offsetTop;

    document.onpointermove = evMove => {
      dragging = true;
      el.style.top = startTop + (evMove.clientY - startY) + "px";
    };

    document.onpointerup = () => {
      document.onpointermove = null;
      document.onpointerup = null;

      if (dragging) {
        const minutes =
          (el.offsetTop / settings.hourSize) * 60 + base;
        ev.start = Math.round(minutes / 15) * 15;
        ev.end = ev.start + (ev.end - ev.start);
        save();
      } else {
        openEventModal(ev);
      }
    };
  };
}

// ---------------- EVENTOS ----------------
timeline.onclick = e => {
  if (e.target !== timeline) return;

  const rect = timeline.getBoundingClientRect();
  const y = e.clientY - rect.top;

  const base = toMin(settings.start);
  const start = base + Math.floor((y / settings.hourSize) * 60);

  activeEvent = {
    id: Date.now(),
    title: "",
    desc: "",
    start,
    end: start + 60,
    color: "#2196f3"
  };

  openEventModal(activeEvent);
};

function openEventModal(ev) {
  activeEvent = ev;

  evTitle.value = ev.title;
  evDesc.value = ev.desc;
  evStart.value = minutesToTime(ev.start);
  evEnd.value = minutesToTime(ev.end);
  evColor.value = ev.color;

  eventModal.classList.add("active");
}

function minutesToTime(m) {
  return String(Math.floor(m / 60)).padStart(2, "0") + ":" +
         String(m % 60).padStart(2, "0");
}

saveEvent.onclick = () => {
  activeEvent.title = evTitle.value;
  activeEvent.desc = evDesc.value;
  activeEvent.start = toMin(evStart.value);
  activeEvent.end = toMin(evEnd.value);
  activeEvent.color = evColor.value;

  if (!events.find(e => e.id === activeEvent.id)) {
    events.push(activeEvent);
  }

  closeModals();
  save();
};

// ---------------- CONFIG ----------------
settingsBtn.onclick = () => {
  cfgStart.value = settings.start;
  cfgEnd.value = settings.end;
  cfgHourSize.value = settings.hourSize;
  settingsModal.classList.add("active");
};

saveCfg.onclick = () => {
  settings.start = cfgStart.value;
  settings.end = cfgEnd.value;
  settings.hourSize = Number(cfgHourSize.value);
  localStorage.setItem("settings", JSON.stringify(settings));
  closeModals();
  buildTimeline();
};

// ---------------- MODAIS ----------------
[eventModal, settingsModal].forEach(modal => {
  modal.onclick = e => {
    if (e.target === modal) closeModals();
  };
});

function closeModals() {
  eventModal.classList.remove("active");
  settingsModal.classList.remove("active");
}

function save() {
  localStorage.setItem("events", JSON.stringify(events));
  buildTimeline();
}

// INIT
buildTimeline();
