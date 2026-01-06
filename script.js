const timeline = document.getElementById("timeline");
const menu = document.getElementById("menu");
const modal = document.getElementById("modal");

let events = JSON.parse(localStorage.getItem("events")) || [];
let editingEvent = null;

/* MENU */
document.getElementById("menuBtn").onclick = () => {
  menu.classList.toggle("open");
};

function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  menu.classList.remove("open");
}

/* CALENDÁRIO */
function buildTimeline() {
  timeline.innerHTML = "";
  for (let h = 0; h < 24; h++) {
    const hour = document.createElement("div");
    hour.className = "hour";
    hour.innerHTML = `<span>${String(h).padStart(2,"0")}:00</span>`;
    timeline.appendChild(hour);
  }
  events.forEach(renderEvent);
}

function renderEvent(ev) {
  const div = document.createElement("div");
  div.className = "event";
  div.style.top = (ev.start * 60) + "px";
  div.style.height = ev.duration + "px";
  div.style.borderColor = ev.color;
  div.textContent = ev.title;

  div.onclick = () => editEvent(ev.id);
  enableDrag(div, ev);

  timeline.appendChild(div);
}

function newEvent() {
  editingEvent = null;
  modal.style.display = "block";
}

function editEvent(id) {
  const ev = events.find(e => e.id === id);
  editingEvent = ev;
  eventTitle.value = ev.title;
  eventDesc.value = ev.desc;
  eventStart.value = minutesToTime(ev.start);
  eventDuration.value = ev.duration;
  eventColor.value = ev.color;
  modal.style.display = "block";
}

function saveEvent() {
  const data = {
    id: editingEvent?.id || Date.now(),
    title: eventTitle.value,
    desc: eventDesc.value,
    start: timeToMinutes(eventStart.value),
    duration: Number(eventDuration.value),
    color: eventColor.value
  };

  if (editingEvent) {
    events = events.map(e => e.id === data.id ? data : e);
  } else {
    events.push(data);
  }

  localStorage.setItem("events", JSON.stringify(events));
  closeModal();
  buildTimeline();
}

function closeModal() {
  modal.style.display = "none";
  eventTitle.value = eventDesc.value = eventStart.value = eventDuration.value = "";
}

/* DRAG */
function enableDrag(el, ev) {
  let startY;

  el.onmousedown = e => {
    startY = e.clientY;
    document.onmousemove = m => {
      const delta = m.clientY - startY;
      el.style.top = (ev.start * 60 + delta) + "px";
    };
    document.onmouseup = () => {
      ev.start = Math.max(0, Math.round(el.offsetTop / 60));
      localStorage.setItem("events", JSON.stringify(events));
      document.onmousemove = document.onmouseup = null;
    };
  };
}

/* HELPERS */
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m) {
  const h = Math.floor(m / 60);
  return `${String(h).padStart(2,"0")}:00`;
}

buildTimeline();
