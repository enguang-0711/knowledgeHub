const DATA = __MODEL__;
const observation = __OBSERVATION__;
const stage = document.querySelector(".dms-stage");
const seatAssembly = stage.querySelector("#seat-and-driver");
const eyeWhites = stage.querySelector("[data-eye-whites]");
const irises = stage.querySelector("[data-eye-irises]");
const pupils = stage.querySelector("[data-eye-pupils]");
const eyelids = stage.querySelector("[data-eyelids]");
const gazeLine = stage.querySelector("[data-gaze-line]");
const faceBox = stage.querySelector("[data-face-box]");
const screenEyes = stage.querySelector("[data-screen-eyes]");
const screenStatus = stage.querySelector("[data-screen-status]");
const screenDistance = stage.querySelector("[data-screen-distance]");
const screenValidity = stage.querySelector("[data-screen-validity]");
const screenLed = stage.querySelector("[data-screen-led]");
const seatInput = document.querySelector("#seat-position");
const seatOutput = document.querySelector("#seat-value");
const distanceOutput = document.querySelector("#camera-distance");
const cameraContext = document.querySelector("#camera-context");
const plateReadout = document.querySelector("[data-readout]");
const scenarioButtons = [...document.querySelectorAll("[data-scenario]")];
const resetButton = document.querySelector("#reset-model");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const range = DATA.GEOMETRY.seat.travelMm;
const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
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

let scenarioId = "attentive";
let baseSeat = range.initial;
let currentSeat = range.initial;
let targetSeat = range.initial;
let last = 0;
let frame = 0;
let visible = false;
let touring = !reduced.matches;
let tourTime = 0;
let idleTimer = 0;

function setTranslation(element, xMm, yMm = 0) {
  const [x0, y0] = project([0, 0, 0]);
  const [x1, y1] = project([xMm, yMm, 0]);
  element.setAttribute("transform", `translate(${(x1 - x0).toFixed(2)} ${(y1 - y0).toFixed(2)})`);
}

function updateGaze(seatOffsetMm, yawDegrees) {
  const driver = DATA.GEOMETRY.driver;
  const eye = [driver.eyeXmm + seatOffsetMm + driver.eyePupilOffsetMm, driver.eyeYmm, driver.eyeZmm];
  const eyeY = driver.eyeYmm;
  const gaze = yawDegrees * Math.PI / 180;
  const pupilOffset = [0, Math.sin(gaze) * 48, 0];
  const [p0x, p0y] = project([0, 0, 0]);
  const [p1x, p1y] = project(pupilOffset);
  const transform = `translate(${(p1x - p0x).toFixed(2)} ${(p1y - p0y).toFixed(2)})`;
  irises.setAttribute("transform", transform);
  pupils.setAttribute("transform", transform);
  const start = [eye[0], eyeY, driver.eyeZmm];
  const end = [eye[0] + Math.cos(gaze) * 440, eyeY + Math.sin(gaze) * 440, driver.eyeZmm + Math.sin(gaze) * 20];
  const a = project(start);
  const b = project(end);
  gazeLine.setAttribute("d", `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}`);
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
  const scenario = DATA.SCENARIOS[id];
  stage.dataset.scenario = id;
  scenarioButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.scenario === id)));
  stage.querySelectorAll("[data-scenario-object]").forEach((element) => {
    element.hidden = !element.dataset.scenarioObject.split(/\s+/).includes(id);
  });
  pupils.hidden = scenario.eyesClosed;
  eyeWhites.hidden = scenario.eyesClosed;
  irises.hidden = scenario.eyesClosed;
  eyelids.hidden = !scenario.eyesClosed;
  faceBox.classList.toggle("eyes-closed", scenario.eyesClosed);
  screenEyes.classList.toggle("is-closed", scenario.eyesClosed);
  screenEyes.setAttribute("transform", scenario.gazeYawDeg ? "translate(28 0)" : "");
  screenStatus.textContent = scenario.status;
  screenValidity.textContent = scenario.occluded ? "SENSOR INPUT INVALID" : "LABEL / INPUT AVAILABLE";
  screenLed.classList.toggle("is-invalid", scenario.occluded);
  paint(currentSeat);
  hold();
}

function paint(seatOffsetMm) {
  const state = observation(seatOffsetMm, scenarioId, DATA.GEOMETRY, DATA.SCENARIOS);
  setTranslation(seatAssembly, state.seatOffsetMm, 0);
  updateGaze(state.seatOffsetMm, state.gazeYawDeg);
  const distance = `${(state.cameraDistanceMm / 1000).toFixed(2)} m`;
  seatOutput.textContent = `${state.seatOffsetMm > 0 ? "+" : ""}${Math.round(state.seatOffsetMm)} mm`;
  seatInput.value = String(Math.round(state.seatOffsetMm / 5) * 5);
  distanceOutput.textContent = distance;
  screenDistance.textContent = distance;
  cameraContext.textContent = state.occluded
    ? "镜头被遮挡 · 输入无效"
    : state.insideExampleRange
      ? "位于教学示意范围内"
      : "超出教学示意范围";
  plateReadout.textContent = `${state.status} · ${distance}`;
  screenValidity.textContent = state.occluded ? "SENSOR INPUT INVALID" : state.insideExampleRange ? "LABEL / INPUT AVAILABLE" : "OUTSIDE EXAMPLE RANGE";
}

function setBaseSeat(value) {
  baseSeat = clamp(Math.round(value / 5) * 5, range.min, range.max);
  targetSeat = baseSeat;
  seatInput.value = String(baseSeat);
  run();
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (reduced.matches) touring = false;
  if (touring) {
    tourTime += dt;
    targetSeat = clamp(baseSeat + 24 * Math.sin((tourTime / 9) * Math.PI * 2), range.min, range.max);
  } else {
    targetSeat = baseSeat;
  }
  const ease = reduced.matches ? 1 : 1 - Math.exp(-dt / 0.19);
  const next = currentSeat + (targetSeat - currentSeat) * ease;
  const moving = Math.abs(next - currentSeat) > 0.05;
  currentSeat = moving ? next : targetSeat;
  paint(currentSeat);
  frame = visible && (touring || moving) ? requestAnimationFrame(tick) : 0;
}

function run() {
  if (reduced.matches) {
    currentSeat = targetSeat;
    paint(currentSeat);
    return;
  }
  if (visible && !frame) {
    last = 0;
    frame = requestAnimationFrame(tick);
  }
}

seatInput.addEventListener("pointerdown", hold);
seatInput.addEventListener("input", () => {
  hold();
  setBaseSeat(Number(seatInput.value));
});
scenarioButtons.forEach((button) => button.addEventListener("click", () => setScenario(button.dataset.scenario)));
resetButton.addEventListener("click", () => {
  hold();
  baseSeat = range.initial;
  targetSeat = range.initial;
  currentSeat = range.initial;
  seatInput.value = String(range.initial);
  setScenario("attentive");
  run();
});

reduced.addEventListener?.("change", () => {
  if (reduced.matches) {
    touring = false;
    clearTimeout(idleTimer);
    targetSeat = baseSeat;
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

setScenario("attentive");
paint(range.initial);
run();

window.__dmsCabin = {
  setSeatOffset: setBaseSeat,
  setScenario,
  get state() { return observation(Math.round(currentSeat), scenarioId, DATA.GEOMETRY, DATA.SCENARIOS); },
};
