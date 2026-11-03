const DATA = __MODEL__;
const observation = __OBSERVATION__;
const stage = document.querySelector(".oms-stage");
const sampleParts = [...stage.querySelectorAll(".oms-sample")];
const scenarioButtons = [...document.querySelectorAll("[data-scenario]")];
const zoneButtons = [...document.querySelectorAll("[data-zone]")];
const cover = stage.querySelector(".oms-camera-cover");
const distanceOutput = document.querySelector("#camera-distance");
const cameraContext = document.querySelector("#camera-context");
const plateReadout = document.querySelector("[data-readout]");
const resetButton = document.querySelector("#reset-model");
const cameraLed = stage.querySelector(".oms-status-solid");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const project = ([x, y, z]) => {
  const { origin, scale, azimuth, elevation } = DATA.projection;
  const radians = Math.PI / 180;
  const sinA = Math.sin(azimuth * radians);
  const cosA = Math.cos(azimuth * radians);
  const sinE = Math.sin(elevation * radians);
  const cosE = Math.cos(elevation * radians);
  const k = scale * Math.sqrt(1.6);
  return [
    origin[0] + (x * sinA - y * cosA) * k,
    origin[1] + ((x * cosA + y * sinA) * sinE - z * cosE) * k,
  ];
};

let zoneId = DATA.GEOMETRY.initial.zoneId;
let scenarioId = DATA.GEOMETRY.initial.scenarioId;
let currentY = DATA.GEOMETRY.zones.find((zone) => zone.id === zoneId).yMm;
let startY = currentY;
let targetY = currentY;
let animationStart = 0;
let frame = 0;
let visible = false;

function translateSamples(yMm) {
  const origin = project([0, 0, 0]);
  const destination = project([0, yMm, 0]);
  const transform = `translate(${(destination[0] - origin[0]).toFixed(2)} ${(destination[1] - origin[1]).toFixed(2)})`;
  sampleParts.forEach((element) => element.setAttribute("transform", transform));
}

function updateScreen(state) {
  state.zoneStates.forEach((zone) => {
    const row = stage.querySelector(`[data-screen-row="${zone.id}"]`);
    const status = stage.querySelector(`[data-screen-status="${zone.id}"]`);
    const valid = stage.querySelector(`[data-screen-valid="${zone.id}"]`);
    const marker = stage.querySelector(`[data-zone-marker="${zone.id}"]`);
    if (row) {
      row.classList.toggle("is-active", zone.active);
      row.classList.toggle("is-invalid", zone.status === "INPUT INVALID");
      row.classList.toggle("is-uncertain", zone.active && state.scenarioId === "occluded");
    }
    if (status) status.textContent = zone.status;
    if (valid) valid.textContent = state.sensorValid ? "YES" : "NO";
    if (marker) marker.classList.toggle("is-active", zone.active && state.sensorValid);
    stage.querySelectorAll(`.oms-zone-boundary.oms-zone-${zone.id}`).forEach((element) => {
      element.classList.toggle("is-active", zone.active && state.sensorValid);
      element.classList.toggle("is-invalid", !state.sensorValid);
    });
    stage.querySelectorAll(`.oms-view-${zone.id}`).forEach((element) => {
      element.classList.toggle("is-active", zone.active && state.sensorValid);
      element.classList.toggle("is-invalid", !state.sensorValid);
    });
    stage.querySelectorAll(`.oms-zone-${zone.id}.zone-marker`).forEach((element) => {
      element.classList.toggle("is-invalid", !state.sensorValid);
    });
  });
}

function paint() {
  const state = observation(zoneId, scenarioId, DATA.GEOMETRY, DATA.SCENARIOS);
  stage.dataset.scenario = scenarioId;
  stage.dataset.zone = zoneId;
  scenarioButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.scenario === scenarioId)));
  zoneButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.zone === zoneId)));
  sampleParts.forEach((element) => {
    const visibleForScenario = state.object !== "none" && element.dataset.scenarioObject === state.object;
    element.hidden = !visibleForScenario;
  });
  cover.hidden = state.sensorValid;
  cameraLed.classList.toggle("is-invalid", !state.sensorValid);
  updateScreen(state);

  const distance = `${(state.cameraDistanceMm / 1000).toFixed(2)} m`;
  distanceOutput.textContent = distance;
  cameraContext.textContent = state.sensorValid
    ? state.scenarioId === "occluded"
      ? "部分遮挡 · 保留不确定标签"
      : "教学几何距离 · 非产品阈值"
    : "镜头盖闭合 · 三席输入无效";
  plateReadout.textContent = `${state.zoneCode} · ${state.status} · ${distance}`;
  translateSamples(currentY);
}

function finishMotion() {
  currentY = targetY;
  frame = 0;
  paint();
}

function tick(now) {
  const progress = Math.min(1, (now - animationStart) / 780);
  const eased = 1 - Math.pow(1 - progress, 3);
  currentY = startY + (targetY - startY) * eased;
  paint();
  if (progress < 1 && visible && !reduced.matches) frame = requestAnimationFrame(tick);
  else finishMotion();
}

function moveToZone(nextZoneId) {
  if (!DATA.GEOMETRY.zones.some((zone) => zone.id === nextZoneId)) return;
  zoneId = nextZoneId;
  startY = currentY;
  targetY = DATA.GEOMETRY.zones.find((zone) => zone.id === zoneId).yMm;
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  if (reduced.matches || !visible || Math.abs(targetY - startY) < 0.1) {
    currentY = targetY;
    paint();
    return;
  }
  animationStart = performance.now();
  frame = requestAnimationFrame(tick);
  paint();
}

function setScenario(nextScenarioId) {
  if (!DATA.SCENARIOS[nextScenarioId]) return;
  scenarioId = nextScenarioId;
  paint();
}

scenarioButtons.forEach((button) => button.addEventListener("click", () => setScenario(button.dataset.scenario)));
zoneButtons.forEach((button) => button.addEventListener("click", () => moveToZone(button.dataset.zone)));
resetButton.addEventListener("click", () => {
  scenarioId = DATA.GEOMETRY.initial.scenarioId;
  moveToZone(DATA.GEOMETRY.initial.zoneId);
});

reduced.addEventListener?.("change", () => {
  if (reduced.matches && frame) {
    cancelAnimationFrame(frame);
    finishMotion();
  }
});

if ("IntersectionObserver" in window) {
  new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (!visible && frame) {
      cancelAnimationFrame(frame);
      finishMotion();
    }
  }, { rootMargin: "100px 0px" }).observe(stage);
} else {
  visible = true;
}

paint();

window.__omsCabin = {
  setZone: moveToZone,
  setScenario,
  get state() { return observation(zoneId, scenarioId, DATA.GEOMETRY, DATA.SCENARIOS); },
};
