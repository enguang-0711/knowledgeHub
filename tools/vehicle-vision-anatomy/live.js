const DATA = __MODEL__;
const follow = __FOLLOW__;
const stage = document.querySelector(".va-stage");
const readout = document.querySelector("[data-readout]");
const yawInput = document.querySelector("#va-yaw");
const pitchInput = document.querySelector("#va-pitch");
const yawValue = document.querySelector("[data-yaw-value]");
const pitchValue = document.querySelector("[data-pitch-value]");
const offset = document.querySelector("[data-offset]");
const ray = stage.querySelector("[data-ray]");
const hitRing = stage.querySelector("[data-hit-ring]");
const hitCross = stage.querySelector("[data-hit-cross]");
const hitDot = stage.querySelector("[data-hit-dot]");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const RAD = Math.PI / 180;
const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
const round = (value) => Math.round(value * 10) / 10;
const format = (value) => `${value > 0 ? "+" : ""}${round(value).toFixed(1)}°`;
const project = ([x, y, z]) => {
  const { P, cam } = DATA;
  return [
    P.origin[0] + (x * cam.sinA - y * cam.cosA) * cam.k,
    P.origin[1] + ((x * cam.cosA + y * cam.sinA) * cam.sinE - z * cam.cosE) * cam.k,
  ];
};
let base = { yaw: 0, pitch: 0 };
let target = { ...base };
let current = { ...base };
let last = 0;
let frame = 0;
let visible = false;
let touring = !reduced.matches;
let tourTime = 0;
let idleTimer = 0;
let drag = null;

const controller = TURN.mount(stage, DATA.turn, {
  follow,
  onFrame: (turned) => {
    current.yaw = turned.values["camera.yaw"] ?? current.yaw;
    current.pitch = -(turned.values["camera.pitch"] ?? -current.pitch);
    updateReadout();
    updateRay();
  },
});

function updateReadout() {
  const yaw = current.yaw;
  const pitch = current.pitch;
  const u = -DATA.fx * Math.tan(yaw * RAD) / Math.cos(pitch * RAD);
  const v = DATA.fx * Math.tan(pitch * RAD);
  readout.textContent = `yaw ${round(yaw).toFixed(1)}° · pitch ${round(pitch).toFixed(1)}°`;
  yawValue.textContent = format(yaw);
  pitchValue.textContent = format(pitch);
  yawInput.value = String(round(yaw));
  pitchInput.value = String(round(pitch));
  offset.textContent = `Δu ${Math.round(u)} px · Δv ${Math.round(v)} px`;
}

function updateRay() {
  const yaw = current.yaw * RAD;
  const pitch = current.pitch * RAD;
  const rel = DATA.lensX - DATA.cx;
  const lens = [
    DATA.cx + rel * Math.cos(pitch) * Math.cos(yaw),
    rel * Math.cos(pitch) * Math.sin(yaw),
    DATA.cz + rel * Math.sin(pitch),
  ];
  const direction = [Math.cos(pitch) * Math.cos(yaw), Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch)];
  const t = (DATA.boardX - lens[0]) / direction[0];
  const point = [DATA.boardX, lens[1] + t * direction[1], lens[2] + t * direction[2]];
  const a = project(lens);
  const b = project(point);
  ray.setAttribute("d", `M${a[0].toFixed(2)} ${a[1].toFixed(2)}L${b[0].toFixed(2)} ${b[1].toFixed(2)}`);
  hitRing.setAttribute("cx", b[0].toFixed(2));
  hitRing.setAttribute("cy", b[1].toFixed(2));
  hitCross.setAttribute("d", `M${(b[0] - 7).toFixed(2)} ${b[1].toFixed(2)}L${(b[0] + 7).toFixed(2)} ${b[1].toFixed(2)}M${b[0].toFixed(2)} ${(b[1] - 7).toFixed(2)}L${b[0].toFixed(2)} ${(b[1] + 7).toFixed(2)}`);
  hitDot.setAttribute("cx", b[0].toFixed(2));
  hitDot.setAttribute("cy", b[1].toFixed(2));
}

function hold() {
  touring = false;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    touring = !reduced.matches;
    tourTime = 0;
    run();
  }, 4200);
}

function setBase(yaw, pitch) {
  base = {
    yaw: clamp(yaw, -DATA.maxYaw, DATA.maxYaw),
    pitch: clamp(pitch, -DATA.maxPitch, DATA.maxPitch),
  };
  if (!touring) target = { ...base };
  run();
}

function draw() {
  controller.set({ yaw: current.yaw, pitch: current.pitch });
}

function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
  last = now;
  if (reduced.matches) touring = false;
  if (touring) {
    tourTime += dt;
    target = { yaw: base.yaw + 1.8 * Math.sin(tourTime * 0.72), pitch: base.pitch + 0.7 * Math.sin(tourTime * 0.43) };
  }
  const ease = reduced.matches ? 1 : 1 - Math.exp(-dt / 0.12);
  const nextYaw = clamp(current.yaw + (target.yaw - current.yaw) * ease, -DATA.maxYaw, DATA.maxYaw);
  const nextPitch = clamp(current.pitch + (target.pitch - current.pitch) * ease, -DATA.maxPitch, DATA.maxPitch);
  const moved = Math.abs(nextYaw - current.yaw) > 0.001 || Math.abs(nextPitch - current.pitch) > 0.001;
  current = { yaw: nextYaw, pitch: nextPitch };
  if (moved) draw();
  const settled = !touring && Math.abs(current.yaw - target.yaw) < 0.01 && Math.abs(current.pitch - target.pitch) < 0.01;
  frame = visible && !settled ? requestAnimationFrame(tick) : 0;
}

function run() {
  if (reduced.matches) {
    current = { ...target };
    draw();
    return;
  }
  if (visible && !frame) {
    last = 0;
    frame = requestAnimationFrame(tick);
  }
}

yawInput.addEventListener("pointerdown", hold);
pitchInput.addEventListener("pointerdown", hold);
yawInput.addEventListener("input", () => setBase(Number(yawInput.value), base.pitch));
pitchInput.addEventListener("input", () => setBase(base.yaw, Number(pitchInput.value)));
document.querySelector("[data-reset]").addEventListener("click", () => {
  hold();
  base = { yaw: 0, pitch: 0 };
  target = { ...base };
  run();
});

stage.addEventListener("pointerdown", (event) => {
  hold();
  drag = { x: event.clientX, yaw: target.yaw, pitch: target.pitch, id: event.pointerId };
  stage.setPointerCapture(event.pointerId);
  stage.setAttribute("data-drag", "");
});
stage.addEventListener("pointermove", (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  hold();
  const scale = DATA.width / Math.max(stage.getBoundingClientRect().width, 1);
  const delta = (event.clientX - drag.x) * scale;
  base = { yaw: clamp(drag.yaw + delta * 0.035, -DATA.maxYaw, DATA.maxYaw), pitch: drag.pitch };
  target = { ...base };
  run();
});
const release = (event) => {
  if (!drag || event.pointerId !== drag.id) return;
  drag = null;
  stage.removeAttribute("data-drag");
};
stage.addEventListener("pointerup", release);
stage.addEventListener("pointercancel", release);
stage.addEventListener("keydown", (event) => {
  const step = event.shiftKey ? 2 : 0.2;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    hold();
    setBase(base.yaw + (event.key === "ArrowRight" ? step : -step), base.pitch);
  }
});

reduced.addEventListener?.("change", () => {
  if (reduced.matches) {
    touring = false;
    clearTimeout(idleTimer);
    target = { ...base };
  } else {
    hold();
  }
  run();
});
new IntersectionObserver((entries) => {
  visible = entries[entries.length - 1].isIntersecting;
  if (visible) run();
  else if (frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
}, { rootMargin: "100px 0px" }).observe(stage);

window.__visionModel = { controller, set: (yaw, pitch) => { hold(); base = { yaw, pitch }; target = { ...base }; run(); }, get angles() { return { ...current }; } };
updateReadout();
updateRay();
draw();
