const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");
const pages = document.querySelectorAll(".page");

const timeline = document.getElementById("timeline");
const modal = document.getElementById("modal");

const eventTitle = document.getElementById("eventTitle");
const eventDesc = document.getElementById("eventDesc");
const eventStart = document.getElementById("eventStart");
const eventDuration = document.getElementById("eventDuration");
const eventColor = document.getElementById("eventColor");

const saveEventBtn = document.getElementById("saveEvent");
const cancelEventBtn = document.getElementById("cancelEvent");
const addEventBtn = document.getElementById("addEventBtn");

let events = JSON.parse(localStorage.getItem("events")) || [];

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

function renderEvent(ev) {
  const el = document.createElement("div");
  el.className = "event";
  el.textContent = ev.title;
  el.style.top = ev.start + "px";
  el.style.height = ev.duration + "px";
  el.style.borderColor = ev.color;

  enableDrag(el, ev);
  timeline.appendChild(el);
}

/* MODAL */
addEventBtn.onclick = () => modal.classList.add("active");
cancelEventBtn.onclick = () => modal.classList.remove("active");

saveEventBtn.onclick = () => {
  events.push({
    title: eventTitle.value,
    desc: eventDesc.value,
    start: timeToPixels(eventStart.value),
    duration: Number(eventDuration.value),
    color: eventColor.value
  });

  localStorage.setItem("events", JSON.stringify(events));
  modal.classList.remove("active");
  buildTimeline();
};

/* DRAG */
function enableDrag(el, ev) {
  let startY;

  el.onmousedown = e => {
    startY = e.clientY;
    document.onmousemove = m => {
      const dy = m.clientY - startY;
      el.style.top = ev.start + dy + "px";
    };
    document.onmouseup = () => {
      ev.start = el.offsetTop;
      localStorage.setItem("events", JSON.stringify(events));
      document.onmousemove = document.onmouseup = null;
    };
  };
}

/* HELPERS */
function timeToPixels(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

buildTimeline();
