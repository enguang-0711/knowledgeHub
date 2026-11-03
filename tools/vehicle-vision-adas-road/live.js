const DATA = __MODEL__;
const targetState = __TARGET_STATE__;
const stage = document.querySelector(".adas-road-stage");
const distanceInput = document.querySelector("#target-distance");
const distanceOutput = document.querySelector("#distance-value");
const truthDistance = document.querySelector("#truth-distance");
const truthContext = document.querySelector("#truth-context");
const plateReadout = document.querySelector("[data-readout]");
const targetCar = stage.querySelector("#moving-target-car");
const targetPedestrian = stage.querySelector("#moving-target-pedestrian");
const occluder = stage.querySelector("#moving-occluder");
const targetRay = stage.querySelector("[data-target-ray]");
const screenDistance = stage.querySelector("[data-screen-distance]");
const screenTarget = stage.querySelector("[data-screen-target]");
const screenStatus = stage.querySelector("[data-screen-status]");
const screenBox = stage.querySelector("[data-screen-box]");
const scenarioButtons = [...document.querySelectorAll("[data-scenario]")];
const resetButton = document.querySelector("#reset-model");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
const fmtMeters = (millimeters) => `${(millimeters / 1000).toFixed(1)} m`;
const project = (point) => {
  const { origin, scale, azimuth, elevation } = DATA.projection;
  const radians = Math.PI / 180;
  const sinA = Math.sin(azimuth * radians);
  const cosA = Math.cos(azimuth * radians);
  const sinE = Math.sin(elevation * radians);
  const cosE = Math.cos(elevation * radians);
  const k = scale * Math.sqrt(1.6);
  return [
    origin[0] + (point[0] * sinA - point[1] * cosA) * k,
    origin[1] + ((point[0] * cosA + point[1] * sinA) * sinE - point[2] * cosE) * k,
  ];
};

const initial = DATA.GEOMETRY.distanceRangeMm.initial;
let scenarioId = "tracking";
let baseDistance = initial;
let currentDistance = initial;
let targetDistance = initial;
let last = 0;
let frame = 0;
let visible = false;
let touring = !reduced.matches;
let tourTime = 0;
let idleTimer = 0;

function place(element, from, to) {
  const [x0, y0] = project([from[0], from[1], DATA.deckZ + 180]);
  const [x1, y1] = project([to[0], to[1], DATA.deckZ + 180]);
  element.setAttribute("transform", `translate(${(x1 - x0).toFixed(2)} ${(y1 - y0).toFixed(2)})`);
}

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
    const ids = element.dataset.scenarioObject.split(/\s+/);
    element.hidden = !ids.includes(id);
  });
  const item = DATA.SCENARIOS[id];
  truthContext.textContent = id === "occlusion" ? "行人 · 前车遮挡边缘" : id === "cutin" ? "车辆 · 相邻车道目标" : "前车 · 目标连续可见";
  screenTarget.textContent = item.target === "pedestrian" ? "PEDESTRIAN · OCCLUSION" : id === "cutin" ? "VEHICLE · CUT-IN" : "VEHICLE · TRACKING";
  screenStatus.textContent = id === "occlusion" ? "PARTIAL OCCLUSION" : id === "cutin" ? "CUT-IN / VALID" : "TRACKING / VALID";
  paint(currentDistance);
  hold();
}

function paint(distance) {
  const value = clamp(distance, DATA.GEOMETRY.distanceRangeMm.min, DATA.GEOMETRY.distanceRangeMm.max);
  const state = targetState(Math.round(value), scenarioId, DATA.GEOMETRY, DATA.SCENARIOS);
  const trackingBase = DATA.initialTarget;
  const pedestrianBase = targetState(initial, "occlusion", DATA.GEOMETRY, DATA.SCENARIOS);
  const blockerBase = DATA.initialOccluder;

  if (state.targetKind === "vehicle") {
    place(targetCar, [trackingBase.targetXmm, trackingBase.targetYmm], [state.targetXmm, state.targetYmm]);
  } else {
    place(targetPedestrian, [pedestrianBase.targetXmm, pedestrianBase.targetYmm], [state.targetXmm, state.targetYmm]);
  }
  place(occluder, [blockerBase.occluderXmm, blockerBase.occluderYmm], [state.occluderXmm, state.occluderYmm]);

  const camera = [DATA.GEOMETRY.ego.centerXmm + 1145, 0, DATA.deckZ + 1380];
  const half = state.targetKind === "vehicle" ? DATA.GEOMETRY.targetCar.halfLengthMm : DATA.GEOMETRY.pedestrian.halfLengthMm;
  const target = [state.targetXmm - half, state.targetYmm, DATA.deckZ + (state.targetKind === "vehicle" ? 850 : 1080)];
  targetRay.setAttribute("d", `M${project(camera).map((v) => v.toFixed(1)).join(" ")}L${project(target).map((v) => v.toFixed(1)).join(" ")}`);
  const label = fmtMeters(value);
  distanceOutput.textContent = label;
  distanceInput.value = String(Math.round(value / 500) * 500);
  truthDistance.textContent = label;
  screenDistance.textContent = label;
  plateReadout.textContent = `GT ${label} · ${scenarioId.toUpperCase()}`;
  screenBox.setAttribute("x", String(1390 + (DATA.GEOMETRY.distanceRangeMm.max - value) * 0.035));
}

function setBaseDistance(value) {
  baseDistance = clamp(Math.round(value / 500) * 500, DATA.GEOMETRY.distanceRangeMm.min, DATA.GEOMETRY.distanceRangeMm.max);
  targetDistance = baseDistance;
  distanceInput.value = String(baseDistance);
  run();
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (reduced.matches) touring = false;
  if (touring) {
    tourTime += dt;
    targetDistance = clamp(baseDistance + 700 * Math.sin((tourTime / 11) * Math.PI * 2), DATA.GEOMETRY.distanceRangeMm.min, DATA.GEOMETRY.distanceRangeMm.max);
  } else {
    targetDistance = baseDistance;
  }
  const ease = reduced.matches ? 1 : 1 - Math.exp(-dt / 0.2);
  const next = currentDistance + (targetDistance - currentDistance) * ease;
  const moving = Math.abs(next - currentDistance) > 0.5;
  currentDistance = moving ? next : targetDistance;
  paint(currentDistance);
  frame = visible && (touring || moving) ? requestAnimationFrame(tick) : 0;
}

function run() {
  if (reduced.matches) {
    currentDistance = targetDistance;
    paint(currentDistance);
    return;
  }
  if (visible && !frame) {
    last = 0;
    frame = requestAnimationFrame(tick);
  }
}

distanceInput.addEventListener("pointerdown", hold);
distanceInput.addEventListener("input", () => {
  hold();
  setBaseDistance(Number(distanceInput.value));
});
scenarioButtons.forEach((button) => button.addEventListener("click", () => setScenario(button.dataset.scenario)));
resetButton.addEventListener("click", () => {
  hold();
  baseDistance = initial;
  targetDistance = initial;
  currentDistance = initial;
  distanceInput.value = String(initial);
  setScenario("tracking");
  run();
});

reduced.addEventListener?.("change", () => {
  if (reduced.matches) {
    touring = false;
    clearTimeout(idleTimer);
    targetDistance = baseDistance;
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

setScenario("tracking");
paint(initial);
run();

window.__adasRoadModel = {
  setDistance: setBaseDistance,
  setScenario,
  get state() { return { scenario: scenarioId, distanceMm: Math.round(currentDistance) }; },
};
