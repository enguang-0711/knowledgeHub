const DATA = __MODEL__;
const clearanceMm = __CLEARANCE__;
const stage = document.querySelector(".parking-stage");
const vehicle = stage.querySelector("#moving-vehicle");
const offsetInput = document.querySelector("#lateral-offset");
const offsetOutput = document.querySelector("#lateral-value");
const gapOutput = document.querySelector("#clearance-value");
const gapContext = document.querySelector("#clearance-context");
const readout = document.querySelector("[data-readout]");
const readoutBox = document.querySelector(".clearance-readout");
const bevCar = stage.querySelector("#bev-car");
const screenGap = stage.querySelector("[data-screen-clearance]");
const screenScenario = stage.querySelector("[data-screen-scenario]");
const screenStatus = stage.querySelector("[data-screen-status]");
const scenarioButtons = [...document.querySelectorAll("[data-scenario]")];
const cameraButtons = [...document.querySelectorAll("[data-camera-select]")];
const resetButton = document.querySelector("#reset-model");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
const roundToTen = (value) => Math.round(value / 10) * 10;
const fmt = (value) => `${value > 0 ? "+" : ""}${Math.round(value)} mm`;

let scenarioId = "standard";
let selectedCamera = "all";
let baseOffset = 0;
let currentOffset = 0;
let targetOffset = 0;
let last = 0;
let frame = 0;
let visible = false;
let touring = !reduced.matches;
let tourTime = 0;
let idleTimer = 0;
let drag = null;

function hold() {
  touring = false;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    touring = !reduced.matches;
    tourTime = 0;
    run();
  }, 5200);
}

function setScenario(id) {
  if (!DATA.SCENARIOS[id]) return;
  scenarioId = id;
  stage.dataset.scenario = id;
  scenarioButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.scenario === id)));
  stage.querySelectorAll("[data-scenario-object]").forEach((element) => {
    const scenarios = element.dataset.scenarioObject.split(/\s+/);
    element.hidden = !scenarios.includes("all") && !scenarios.includes(id);
  });
  stage.querySelectorAll("[data-bev-obstacle]").forEach((element) => {
    element.hidden = element.dataset.bevObstacle !== id;
  });
  screenScenario.textContent = id === "ramp" ? "BEV / REFLECT" : id === "low" ? "4 × FISHEYE + OBJ" : "4 × FISHEYE";
  gapContext.textContent = id === "low" ? "到低矮障碍物 · 几何参考值" : id === "ramp" ? "到车位边界 · 坡面误差未建模" : "到车位边界 · 教学模型读数";
  hold();
  paint(currentOffset);
}

function setCamera(id) {
  selectedCamera = id;
  cameraButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.cameraSelect === id)));
  stage.querySelectorAll(".camera-coverage[data-camera], .coverage-edge[data-camera]").forEach((area) => {
    area.classList.toggle("is-muted", id !== "all" && area.dataset.camera !== id);
  });
  screenStatus.textContent = id === "all" ? "4 CAM READY" : `${id.toUpperCase()} CAM`;
  hold();
}

function paint(offset) {
  const value = clamp(offset, -DATA.MODEL.lateralRangeMm, DATA.MODEL.lateralRangeMm);
  const gap = clearanceMm(value, DATA.MODEL, DATA.SCENARIOS[scenarioId]);
  const cam = DATA.camera;
  const dx = -cam.cosA * value * DATA.projection.scale;
  const dy = cam.sinA * cam.sinE * value * DATA.projection.scale;
  vehicle.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`);
  bevCar.setAttribute("transform", `translate(${(value * 0.45).toFixed(1)} 0)`);
  offsetOutput.textContent = fmt(value);
  offsetInput.value = String(roundToTen(value));
  gapOutput.textContent = `${gap} mm`;
  screenGap.textContent = `${gap} mm`;
  readout.textContent = `GAP ${gap} mm · ${selectedCamera === "all" ? "4 CAM" : `${selectedCamera.toUpperCase()} CAM`}`;
  readoutBox.classList.toggle("is-near", gap < 160);
  screenStatus.textContent = gap < 160 ? "CHECK GAP" : selectedCamera === "all" ? "4 CAM READY" : `${selectedCamera.toUpperCase()} CAM`;
}

function setBaseOffset(value) {
  baseOffset = clamp(roundToTen(value), -DATA.MODEL.lateralRangeMm, DATA.MODEL.lateralRangeMm);
  targetOffset = baseOffset;
  offsetInput.value = String(baseOffset);
  run();
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (reduced.matches) touring = false;
  if (touring) {
    tourTime += dt;
    targetOffset = baseOffset + 34 * Math.sin((tourTime / 9.5) * Math.PI * 2);
  } else {
    targetOffset = baseOffset;
  }
  const ease = reduced.matches ? 1 : 1 - Math.exp(-dt / 0.17);
  const next = currentOffset + (targetOffset - currentOffset) * ease;
  const moving = Math.abs(next - currentOffset) > 0.05;
  currentOffset = moving ? next : targetOffset;
  paint(currentOffset);
  frame = visible && (touring || moving) ? requestAnimationFrame(tick) : 0;
}

function run() {
  if (reduced.matches) {
    currentOffset = targetOffset;
    paint(currentOffset);
    return;
  }
  if (visible && !frame) {
    last = 0;
    frame = requestAnimationFrame(tick);
  }
}

offsetInput.addEventListener("pointerdown", hold);
offsetInput.addEventListener("input", () => {
  hold();
  setBaseOffset(Number(offsetInput.value));
});
scenarioButtons.forEach((button) => button.addEventListener("click", () => setScenario(button.dataset.scenario)));
cameraButtons.forEach((button) => button.addEventListener("click", () => setCamera(button.dataset.cameraSelect)));
resetButton.addEventListener("click", () => {
  hold();
  baseOffset = 0;
  targetOffset = 0;
  scenarioId = "standard";
  selectedCamera = "all";
  setScenario("standard");
  setCamera("all");
  offsetInput.value = "0";
  run();
});

stage.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  hold();
  drag = { x: event.clientX, offset: baseOffset, id: event.pointerId };
  stage.setPointerCapture(event.pointerId);
  stage.setAttribute("data-drag", "");
});
stage.addEventListener("pointermove", (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  const scale = (DATA.MODEL.lateralRangeMm * 2) / Math.max(stage.getBoundingClientRect().width, 1);
  const next = drag.offset + (event.clientX - drag.x) * scale;
  setBaseOffset(next);
});
const release = (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  drag = null;
  stage.removeAttribute("data-drag");
};
stage.addEventListener("pointerup", release);
stage.addEventListener("pointercancel", release);
stage.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
  event.preventDefault();
  hold();
  setBaseOffset(baseOffset + (event.key === "ArrowRight" ? 10 : -10));
});

reduced.addEventListener?.("change", () => {
  if (reduced.matches) {
    touring = false;
    clearTimeout(idleTimer);
    targetOffset = baseOffset;
  } else {
    hold();
  }
  run();
});

if ("IntersectionObserver" in window) {
  new IntersectionObserver((entries) => {
    visible = entries[entries.length - 1].isIntersecting;
    if (visible) run();
    else if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }, { rootMargin: "100px 0px" }).observe(stage);
} else {
  visible = true;
}

setScenario("standard");
setCamera("all");
paint(0);
run();

window.__parkingModel = {
  setOffset: setBaseOffset,
  setScenario,
  setCamera,
  get state() { return { scenario: scenarioId, camera: selectedCamera, offsetMm: Math.round(currentOffset), clearanceMm: clearanceMm(Math.round(currentOffset), DATA.MODEL, DATA.SCENARIOS[scenarioId]) }; },
};
