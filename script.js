const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const pages = document.querySelectorAll(".page");

const timeline = document.getElementById("timeline");
const modal = document.getElementById("modal");

const eventTitle = document.getElementById("eventTitle");
const eventDesc = document.getElementById("eventDesc");
const eventStart = document.getElementById("eventStart");
const eventEnd = document.getElementById("eventEnd");
const eventColor = document.getElementById("eventColor");

const saveEventBtn = document.getElementById("saveEvent");
const cancelEventBtn = document.getElementById("cancelEvent");
const deleteEventBtn = document.getElementById("deleteEvent");
const addEventBtn = document.getElementById("addEventBtn");

let events = JSON.parse(localStorage.getItem("events")) || [];
let editingEventId = null;

/* MENU */
menuBtn.onclick = () => menu.classList.toggle("open");

menu.querySelectorAll("button").forEach(btn => {
  btn.onclick = () => {
    pages.forEach(p => p.classList.remove("active"));
    document.getElementById(btn.dataset.page).classList.add("active");
    menu.classList.remove("open");
  };
});

/* TIMELINE */
function buildTimeline() {
  timeline.innerHTML = "";

  for (let h = 0; h < 24; h++) {
    const hour = document.createElement("div");
    hour.className = "hour";
    hour.innerHTML = `<span>${String(h).padStart(2, "0")}:00</span>`;
    timeline.appendChild(hour);
  }

  events.forEach(renderEvent);
}

/* EVENTO */
function renderEvent(ev) {
  const el = document.createElement("div");
  el.className = "event";
  el.textContent = ev.title;

  el.style.top = ev.startMin + "px";
  el.style.height = (ev.endMin - ev.startMin) + "px";
  el.style.borderColor = ev.color;

  enableDragAndClick(el, ev);
  timeline.appendChild(el);
}

/* CLICK EM ÁREA VAZIA DO CRONOGRAMA */
timeline.addEventListener("click", e => {
  if (e.target !== timeline) return;

  const rect = timeline.getBoundingClientRect();
  const y = e.clientY - rect.top;

  const startMin = Math.max(0, Math.floor(y));
  const endMin = Math.min(startMin + 60, 1440);

  openNewEvent(startMin, endMin);
});

/* MODAL */
addEventBtn.onclick = () => openNewEvent(480, 540);

cancelEventBtn.onclick = () => modal.classList.remove("active");

function openNewEvent(startMin, endMin) {
  editingEventId = null;
  modal.classList.add("active");

  eventTitle.value = "";
  eventDesc.value = "";
  eventStart.value = minutesToTime(startMin);
  eventEnd.value = minutesToTime(endMin);
  eventColor.value = "#2196f3";
}

function openEditEvent(ev) {
  editingEventId = ev.id;
  modal.classList.add("active");

  eventTitle.value = ev.title;
  eventDesc.value = ev.desc;
  eventStart.value = minutesToTime(ev.startMin);
  eventEnd.value = minutesToTime(ev.endMin);
  eventColor.value = ev.color;
}

/* SALVAR */
saveEventBtn.onclick = () => {
  const startMin = timeToMinutes(eventStart.value);
  const endMin = timeToMinutes(eventEnd.value);

  if (endMin <= startMin) {
    alert("Horário final deve ser maior que o inicial");
    return;
  }

  if (editingEventId) {
    events = events.map(ev =>
      ev.id === editingEventId
        ? { ...ev, title: eventTitle.value, desc: eventDesc.value, startMin, endMin, color: eventColor.value }
        : ev
    );
  } else {
    events.push({
      id: Date.now(),
      title: eventTitle.value,
      desc: eventDesc.value,
      startMin,
      endMin,
      color: eventColor.value
    });
  }

  localStorage.setItem("events", JSON.stringify(events));
  modal.classList.remove("active");
  buildTimeline();
};

/* EXCLUIR */
deleteEventBtn.onclick = () => {
  if (!editingEventId) return;

  events = events.filter(e => e.id !== editingEventId);
  localStorage.setItem("events", JSON.stringify(events));
  modal.classList.remove("active");
  buildTimeline();
};

/* DRAG + CLICK DIFERENCIADO */
function enableDragAndClick(el, ev) {
  let startY = 0;
  let moved = false;

  el.onmousedown = e => {
    e.stopPropagation();
    startY = e.clientY;
    moved = false;

    document.onmousemove = m => {
      const dy = m.clientY - startY;
      if (Math.abs(dy) > 5) moved = true;
      el.style.top = ev.startMin + dy + "px";
    };

    document.onmouseup = () => {
      document.onmousemove = document.onmouseup = null;

      if (!moved) {
        openEditEvent(ev);
        return;
      }

      const duration = ev.endMin - ev.startMin;
      ev.startMin = Math.max(0, el.offsetTop);
      ev.endMin = ev.startMin + duration;

      localStorage.setItem("events", JSON.stringify(events));
      buildTimeline();
    };
  };
}

/* HELPERS */
function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

buildTimeline();
