/* =====================
   CONFIGURAÇÕES
===================== */

let settings = JSON.parse(localStorage.getItem("settings")) || {
  dayStart: "06:00",
  dayEnd: "23:00",
  hourSize: 60,
  colors: [
    { name: "Trabalho", value: "#2196f3" },
    { name: "Pessoal", value: "#4caf50" },
    { name: "Urgente", value: "#f44336" }
  ]
};

const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");

const cfgStartHour = document.getElementById("cfgStartHour");
const cfgEndHour = document.getElementById("cfgEndHour");
const cfgHourSize = document.getElementById("cfgHourSize");
const colorList = document.getElementById("colorList");

settingsBtn.onclick = () => openSettings();
document.getElementById("closeSettings").onclick = () =>
  settingsModal.classList.remove("active");

document.getElementById("saveSettings").onclick = () => {
  settings.dayStart = cfgStartHour.value;
  settings.dayEnd = cfgEndHour.value;
  settings.hourSize = Number(cfgHourSize.value);

  localStorage.setItem("settings", JSON.stringify(settings));
  settingsModal.classList.remove("active");
  buildTimeline();
};

document.getElementById("addColor").onclick = () => {
  settings.colors.push({ name: "Nova", value: "#000000" });
  renderColors();
};

function openSettings() {
  cfgStartHour.value = settings.dayStart;
  cfgEndHour.value = settings.dayEnd;
  cfgHourSize.value = settings.hourSize;

  renderColors();
  settingsModal.classList.add("active");
}

function renderColors() {
  colorList.innerHTML = "";
  settings.colors.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "color-item";
    div.innerHTML = `
      <input value="${c.name}" onchange="settings.colors[${i}].name=this.value">
      <input type="color" value="${c.value}" onchange="settings.colors[${i}].value=this.value">
    `;
    colorList.appendChild(div);
  });
}

/* =====================
   CRONOGRAMA DINÂMICO
===================== */

function buildTimeline() {
  timeline.innerHTML = "";

  const start = timeToMinutes(settings.dayStart);
  const end = timeToMinutes(settings.dayEnd);

  timeline.style.height = (end - start) + "px";

  for (let m = start; m < end; m += 60) {
    const hour = document.createElement("div");
    hour.className = "hour";
    hour.style.height = settings.hourSize + "px";
    hour.innerHTML = `<span>${minutesToTime(m)}</span>`;
    timeline.appendChild(hour);
  }

  events.forEach(renderEvent);
}

function renderEvent(ev) {
  const el = document.createElement("div");
  el.className = "event";
  el.textContent = ev.title;

  el.style.top = (ev.startMin - timeToMinutes(settings.dayStart)) + "px";
  el.style.height = (ev.endMin - ev.startMin) + "px";
  el.style.borderColor = ev.color;

  enableDragAndClick(el, ev);
  timeline.appendChild(el);
}
