import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./vendor/anatomy/kit/iso-kit.mjs";
import * as G from "./vendor/anatomy/kit/lathe.mjs";
import * as A from "./vendor/anatomy/kit/audit.mjs";
import { turning } from "./vendor/anatomy/kit/turn-build.mjs";
import * as TA from "./vendor/anatomy/kit/turn-audit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUTPUT = join(ROOT, "docs/public/vehicle-vision-adas-calibration.html");
const WIDTH = 920;
const HEIGHT = 560;
const AZIMUTH = 42;
const ELEVATION = 30;
const CX = -560;
const CZ = 300;
const BOARD_X = 550;
const FX = 560;
const MAX_YAW = 14;
const MAX_PITCH = 8;
const LENS_X = CX + 63;
const RAD = Math.PI / 180;

const BASE = { x: -850, y: -330, w: 1650, d: 660, r: 18 };
const CAMERA_BOUNDS = [
  [CX - 70, -62, 205], [CX + 75, 62, 395],
];
const EXTENTS = [
  ...k.boxCorners(BASE, -35, 25),
  ...k.boxCorners({ x: BOARD_X - 14, y: -390, w: 28, d: 780, r: 0 }, -4, 604),
  ...k.boxCorners({ x: -300, y: 235, w: 320, d: 32, r: 10 }, 160, 430),
  ...k.boxCorners({ x: -390, y: -270, w: 220, d: 120, r: 8 }, 24, 112),
  ...CAMERA_BOUNDS,
  [-560, 0, 212], [-560, 0, 385],
];
const P = k.fitProjection(EXTENTS, WIDTH, HEIGHT, { pad: 30, azimuth: AZIMUTH, elevation: ELEVATION });
const at = (point) => k.iso(point, P);
const S = (paths, options = {}) => k.solidSvg(paths, options);
const L = (path, options = {}) => k.lineSvg(path, options);
const D = (points, options = {}) => k.dotsSvg(points, options);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
const polygon = (points) => k.pathOf(points.map(at), true);
const path3 = (points) => k.pathOf(points.map(at));
const face = (points, className, extra = "") => `<path class="${className}" d="${polygon(points)}" ${extra}/>`;
const line = (points, className, extra = "") => `<path class="${className}" d="${path3(points)}" ${extra}/>`;
const cssTone = (tone) => `class="iso-line" data-tone="${tone}"`;
const mat = (name, svg) => `<g data-mat="${name}">${svg}</g>`;

function baseAndRails() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -35, 25, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(BASE, 36))) {
    out.push(S(k.cylinder(x, y, 27, -35, 4, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 22, -31, 31, P, 28), { tone: "mid", crease: "lo" }));
    out.push(S(k.cylinder(x, y, 25, 0, 4, P, 28), { tone: "lo" }));
  }
  out.push(S(k.slabOf(BASE, 0, 25, P, 12, 2.4), { tone: "mid", inner: L(k.sideSeam(BASE, 17, P, 12), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(BASE, 8), 25, P), { tone: "faint" }));
  const bolts = k.corners(BASE, 18);
  out.push(L(bolts.map(([x, y]) => k.ring(x, y, 4.1, 25, P, 18)).join(""), { tone: "lo" }));
  out.push(D(bolts.map(([x, y]) => at([x, y, 25])), { size: 0.8 }));

  for (const y of [-128, 104]) {
    const rail = { x: -770, y, w: 1320, d: 24, r: 4 };
    out.push(S(k.slabOf(rail, 25, 20, P, 8, 1.2), { tone: "hi", crease: "lo" }));
    out.push(L(k.planOutline(k.insetPlan(rail, 5), 45, P), { tone: "faint" }));
    const screws = [-735, -390, -40, 315, 525].map((x) => [x, y + 12]);
    out.push(D(screws.map(([x, sy]) => at([x, sy, 45])), { size: 0.65, tone: "mid" }));
  }
  const ruler = { x: -740, y: 236, w: 1190, d: 17, r: 3 };
  out.push(S(k.slabOf(ruler, 25, 4, P, 6, 0.5), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(ruler.x + 10, ruler.x + ruler.w - 10, 20, 100, ruler.y + 1, 29, [10, 24], P);
  out.push(L(ticks.minor, { tone: "mid" }), L(ticks.major, { tone: "hi" }));
  return out.join("");
}

function cameraMount() {
  const out = [];
  const x = CX;
  out.push(S(k.cylinder(x, 0, 37, 45, 6, P, 40), { tone: "lo" }));
  out.push(S(k.cylinder(x, 0, 28, 51, 116, P, 40), { tone: "mid", crease: "none" }));
  out.push(L([k.sideArc(x, 0, 28, 76, P, 40), k.sideArc(x, 0, 28, 165, P, 40)].join(""), { tone: "faint" }));
  out.push(S(k.cylinder(x, 0, 51, 166, 9, P, 48), { tone: "lo" }));
  out.push(S(k.cylinder(x, 0, 47, 175, 11, P, 48), { tone: "mid", crease: "lo" }));
  const boltPoints = Array.from({ length: 10 }, (_, i) => {
    const a = i * Math.PI * 2 / 10;
    return [x + 40 * Math.cos(a), 40 * Math.sin(a)];
  });
  out.push(L(boltPoints.map(([bx, by]) => k.ring(bx, by, 2.2, 186, P, 12)).join(""), { tone: "lo" }));
  out.push(D(boltPoints.map(([bx, by]) => at([bx, by, 186])), { size: 0.55, tone: "mid" }));

  out.push(S(k.slabOf({ x: CX - 59, y: -61, w: 118, d: 122, r: 8 }, 188, 12, P, 8, 1), { tone: "mid" }));
  out.push(D([[-43, -45], [-43, 45], [43, -45], [43, 45]].map(([dx, dy]) => at([CX + dx, dy, 200])), { size: 0.75, tone: "mid" }));
  return out.join("");
}

function targetBoard() {
  const out = [];
  const front = BOARD_X;
  const back = BOARD_X + 13;
  const y0 = -385;
  const y1 = 385;
  const z0 = 10;
  const z1 = 590;
  for (const y of [-325, 325]) {
    out.push(S(k.cylinder(BOARD_X + 20, y, 10, 0, 15, P, 24), { tone: "lo" }));
    out.push(S(k.cylinder(BOARD_X + 20, y, 6, 15, 117, P, 24), { tone: "mid", crease: "none" }));
  }
  out.push(face([[back, y0, z0], [back, y1, z0], [back, y1, z1], [back, y0, z1]], "va-board-back"));
  out.push(face([[front, y0, z0], [back, y0, z0], [back, y0, z1], [front, y0, z1]], "va-board-side"));
  out.push(face([[front, y1, z0], [back, y1, z0], [back, y1, z1], [front, y1, z1]], "va-board-side"));
  out.push(face([[front, y0, z1], [back, y0, z1], [back, y1, z1], [front, y1, z1]], "va-board-top"));
  out.push(face([[front, y0, z0], [back, y0, z0], [back, y1, z0], [front, y1, z0]], "va-board-foot"));
  out.push(face([[front, y0, z0], [front, y1, z0], [front, y1, z1], [front, y0, z1]], "va-board-face"));

  const cols = 9;
  const rows = 7;
  const side = 70;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const y = -315 + col * side;
      const z = 55 + row * side;
      const sq = [[front - 0.2, y, z], [front - 0.2, y + side, z], [front - 0.2, y + side, z + side], [front - 0.2, y, z + side]];
      out.push(face(sq, (row + col) % 2 === 0 ? "va-check-light" : "va-check-dark"));
    }
  }
  for (const y of [y0 + 15, y1 - 15]) {
    for (const z of [z0 + 15, z1 - 15]) {
      const p = at([front - 0.3, y, z]);
      out.push(`<circle class="va-frame-screw" cx="${p[0]}" cy="${p[1]}" r="1.6"/>`);
    }
  }
  out.push(S(k.slabOf({ x: BOARD_X - 10, y: -365, w: 58, d: 730, r: 5 }, 0, 15, P, 8, 1), { tone: "mid" }));
  return out.join("");
}

function ecuAndDisplay() {
  const out = [];
  const ecu = { x: -390, y: -270, w: 220, d: 120, r: 10 };
  out.push(S(k.slabOf(ecu, 25, 66, P, 8, 1.6), { tone: "hi", crease: "lo", inner: L(k.sideSeam(ecu, 74, P, 8), { tone: "faint" }) }));
  for (let i = 0; i < 7; i++) {
    const fin = { x: ecu.x + 20 + i * 26, y: ecu.y + 22, w: 7, d: 76, r: 2 };
    out.push(S(k.slabOf(fin, 91, 5, P, 4, 0.7), { tone: "mid" }));
  }
  const ecuBolts = k.corners(ecu, 13).map(([x, y]) => at([x, y, 91]));
  out.push(D(ecuBolts, { size: 0.7, tone: "mid" }));
  const portFace = [
    [-345, -149, 38], [-309, -149, 38], [-309, -149, 74], [-345, -149, 74],
    [-282, -149, 42], [-254, -149, 42], [-254, -149, 70], [-282, -149, 70],
  ];
  out.push(face(portFace.slice(0, 4), "va-connector-face"));
  out.push(face(portFace.slice(4), "va-connector-face"));
  for (const x of [-337, -329, -321, -313, -274, -266, -258]) {
    const p = at([x, -148.5, 55]);
    out.push(`<circle class="va-connector-pin" cx="${p[0]}" cy="${p[1]}" r="1.1"/>`);
  }

  const screenOuter = [[-300, 268, 164], [20, 268, 164], [20, 268, 430], [-300, 268, 430]];
  const screenInner = [[-283, 269, 181], [3, 269, 181], [3, 269, 413], [-283, 269, 413]];
  out.push(face([[...screenOuter[0]], [...screenOuter[1]], [...screenOuter[1].slice(0, 2), 446], [...screenOuter[0].slice(0, 2), 446]], "va-monitor-top"));
  out.push(face(screenOuter, "va-monitor-frame"));
  out.push(face(screenInner, "va-screen"));
  const road = [[-266, 269.5, 188], [-14, 269.5, 188], [-88, 269.5, 332], [-190, 269.5, 332]];
  out.push(face(road, "va-screen-road"));
  const lane = (x0, x1) => line([[x0, 269.6, 190], [x1, 269.6, 326]], "va-screen-lane");
  out.push(lane(-205, -98), lane(-75, 4));
  out.push(line([[-140, 269.7, 198], [-140, 269.7, 248], [-123, 269.7, 300], [-110, 269.7, 326]], "va-screen-center"));
  out.push(face([[-175, 269.8, 244], [-119, 269.8, 244], [-119, 269.8, 286], [-175, 269.8, 286]], "va-detection-box"));
  out.push(line([[-174, 269.9, 281], [-119, 269.9, 281]], "va-detection-label"));
  out.push(line([[-268, 269.9, 391], [-206, 269.9, 391], [-144, 269.9, 391]], "va-screen-status"));
  out.push(`<circle class="va-screen-led" cx="${at([-278, 269.9, 399])[0]}" cy="${at([-278, 269.9, 399])[1]}" r="2.2"/>`);
  out.push(S(k.cylinder(-140, 246, 11, 82, 81, P, 28), { tone: "mid", crease: "none" }));
  out.push(S(k.slabOf({ x: -175, y: 222, w: 70, d: 48, r: 8 }, 82, 14, P, 6, 1), { tone: "lo" }));

  const wire = k.wireSvg(at([CX - 56, -4, CZ - 8]), at([-390, -149, 72]), {
    via: [at([CX - 92, -54, 210]), at([-470, -118, 94])], tone: "blue", dashed: true, ends: "both", size: 1.8,
  });
  out.push(wire);
  out.push(k.wireSvg(at([-390, -149, 55]), at([-140, 269, 182]), {
    via: [at([-260, -4, 46]), at([-90, 130, 62])], tone: "faint", dashed: true, ends: "both", size: 1.2,
  }));
  return out.join("");
}

const R = A.recorder(P);
const T = turning(P, { recorder: R });
const yaw = T.group("camera.yaw", { turn: { pivot: [CX, 0] } });
const tilt = T.group("camera.pitch", { parent: yaw, hinge: { point: [CX, 0, CZ], axis: [0, 1, 0], range: [-MAX_PITCH, MAX_PITCH] } });
const cameraLayer = T.layer("camera");
T.stack(["back", "camera", "front"]);
const frameZ = (x, y) => ({ o: [x, y, 0], a: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] });

// The yoke belongs to the yaw stage; pitch-axis trunnions bridge it to the head.
for (const side of [-1, 1]) {
  const yoke = T.round({ name: `camera.yaw-yoke.${side < 0 ? "left" : "right"}`, group: yaw, layer: cameraLayer,
    F: frameZ(CX, side * 58), s0: 200, s1: 400, r: 5, tone: "mid", crease: "lo", material: "gunmetal" });
  yoke.shapes[0].ground = true;
}
const pitchTrunnionFrame = (side) => ({ o: [CX, side * 46, CZ], a: [0, side, 0], u: [1, 0, 0], v: [0, 0, 1] });
for (const side of [-1, 1]) {
  T.round({ name: `camera.pitch-trunnion.${side < 0 ? "left" : "right"}`, group: tilt, layer: cameraLayer,
    F: pitchTrunnionFrame(side), s0: 0, s1: 7, r: 8, tone: "hi", crease: "lo", material: "steel" });
}

const box = { x: CX - 53, y: -46, w: 83, d: 92, r: 8 };
const housing = T.prism({ name: "camera.housing", group: tilt, layer: cameraLayer, plan: box, z: CZ - 39, h: 78, steps: 8, bevel: 1.5, tone: "hi", crease: "lo", material: "gunmetal", details: {
  seams: [CZ - 26, CZ + 28],
  dots: [
    [-42, -34], [-42, 34], [18, -34], [18, 34],
  ].map(([dx, dy]) => ({ at: [CZ + 38, CX + dx, dy], normal: [0, 0, 1], size: 0.8, tone: "mid" })),
  bevel: 0.8,
} });
const frameX = (x) => ({ o: [x, 0, CZ], a: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] });
const frameBack = (x, y = 0, z = CZ) => ({ o: [x, y, z], a: [-1, 0, 0], u: [0, 1, 0], v: [0, 0, -1] });
const barrel = T.round({ name: "camera.lens.barrel", group: tilt, layer: cameraLayer, F: frameX(CX + 30.1), s0: 0, s1: 18.4, r: 27, tone: "hi", crease: "lo", material: "steel", details: {
  seams: [3, 14], ribs: { s0: 4, s1: 13, count: 48, fade: [0.08, 0.48], tone: "lo", seams: true },
} });
T.round({ name: "camera.lens.bezel", group: tilt, layer: cameraLayer, F: frameX(CX + 48.6), s0: 0, s1: 5.9, r: 30, tone: "hi", crease: "lo", material: "chrome", details: {
  seams: [1.2, 4.4], ribs: { s0: 1.5, s1: 4.2, count: 64, fade: [0.08, 0.52], tone: "mid", seams: true },
  bolts: [{ s: 4.8, r: 29.2, count: 8, size: 0.7, tone: "lo", fade: [0.05, 0.35] }],
} });
const glass = T.round({ name: "camera.lens.glass", group: tilt, layer: cameraLayer, F: frameX(CX + 54.6), s0: 0, s1: 2.4, r: 23, tone: "hi", crease: "lo", material: "steel" });
T.plane({ part: glass, o: [CX + 57, 0, CZ], u: [0, 1, 0], v: [0, 0, 1], svg: `<circle class="va-lens-surface" r="20.5"/><circle class="va-lens-inner" r="12.5"/><circle class="va-lens-glint" cx="-5.5" cy="5.5" r="2.6"/>`, fade: [0.02, 0.3] });
for (let i = 0; i < 8; i++) {
  const x = CX - 42 + i * 9;
  T.prism({ name: "camera.top.cooling-fin." + (i + 1), group: tilt, layer: cameraLayer, plan: { x, y: -29, w: 2.5, d: 58, r: 0.5 }, z: CZ + 39, h: 2.6, bevel: 0.35, tone: "mid", crease: "lo", material: "gunmetal" });
}
for (const side of [-1, 1]) {
  for (let i = 0; i < 6; i++) {
    const x = CX - 38 + i * 11;
    const y = side < 0 ? -48 : 46;
    T.prism({ name: "camera.side-" + (side < 0 ? "left" : "right") + ".vent." + (i + 1), group: tilt, layer: cameraLayer, plan: { x, y, w: 2.4, d: 2, r: 0.3 }, z: CZ - 36, h: 17, bevel: 0.25, tone: "lo", crease: "faint", material: "gunmetal" });
  }
}

const coverCorners = [[-34, -27], [34, -27], [-34, 27], [34, 27]];
coverCorners.forEach(([y, dz], index) => {
  T.round({ name: "camera.front-cover.screw." + (index + 1), group: tilt, layer: cameraLayer, F: { ...frameX(CX + 30), o: [CX + 30, y, CZ + dz] }, s0: 0, s1: 2.7, r: 2.1, tone: "hi", crease: "lo", material: "steel" });
  T.round({ name: "camera.rear-cover.screw." + (index + 1), group: tilt, layer: cameraLayer, F: frameBack(CX - 53, y, CZ + dz), s0: 0, s1: 2.7, r: 2.1, tone: "hi", crease: "lo", material: "steel" });
});

[[CX - 43, -35], [CX - 43, 35], [CX + 18, -35], [CX + 18, 35]].forEach(([x, y], index) => {
  T.round({ name: "camera.top-cover.screw." + (index + 1), group: tilt, layer: cameraLayer, F: frameZ(x, y), s0: CZ + 39, s1: CZ + 41.2, r: 2.35, tone: "hi", crease: "lo", material: "steel" });
});

[-12, 12].forEach((y, index) => {
  const x = CX - 47;
  T.ball({ name: "camera.status-led." + (index + 1), group: tilt, layer: cameraLayer, c: [x, y, CZ + 42.2], r: 3.2, fixed: false, tone: "lit", crease: "hi", material: "gold" });
});

const connectorFrame = frameBack(CX - 53);
T.round({ name: "camera.connector.mount", group: tilt, layer: cameraLayer, F: connectorFrame, s0: 0, s1: 5, r: 16, tone: "mid", crease: "lo", material: "gunmetal" });
T.round({ name: "camera.connector.shell", group: tilt, layer: cameraLayer, F: connectorFrame, s0: 5, s1: 22, r: 13.5, tone: "hi", crease: "lo", material: "steel", details: { seams: [8, 19], ribs: { s0: 9, s1: 18, count: 18, fade: [0.08, 0.45], tone: "mid", seams: true } } });
T.round({ name: "camera.connector.lock-ring", group: tilt, layer: cameraLayer, F: connectorFrame, s0: 22, s1: 27, r: 16, tone: "mid", crease: "lo", material: "brass", details: { ribs: { s0: 23, s1: 26, count: 16, fade: [0.05, 0.35], tone: "lo" } } });
T.round({ name: "camera.connector.strain-relief", group: tilt, layer: cameraLayer, F: connectorFrame, s0: 27, s1: 40, r: 8, tone: "lo", crease: "faint", material: "rubber", details: { ribs: { s0: 28, s1: 39, count: 12, fade: [0.05, 0.4], tone: "mid" } } });
void housing;

export const follow = ({ yaw = 0, pitch = 0 }) => ({ "camera.yaw": yaw, "camera.pitch": -pitch });
export const poses = () => {
  const list = [];
  for (let heading = -MAX_YAW; heading <= MAX_YAW; heading += 2) {
    for (let pitch = -MAX_PITCH; pitch <= MAX_PITCH; pitch += 2) list.push(follow({ yaw: heading, pitch }));
  }
  return list;
};

function projectionScript(turn) {
  const cam = k.cameraOf(P);
  return JSON.stringify({ P, cam, width: WIDTH, height: HEIGHT, cx: CX, cz: CZ, boardX: BOARD_X, lensX: LENS_X, fx: FX, maxYaw: MAX_YAW, maxPitch: MAX_PITCH, turn });
}

function buildPage(theme = "light", verify = false) {
  const out = T.build({ statics: R.items, poses: poses(), verify });
  const back = [
    `<path class="iso-halo" d="${k.haloOf(BASE, -35, 25, P)}"/>`,
    baseAndRails(), cameraMount(), ecuAndDisplay(),
  ].join("");
  const front = targetBoard();
  const staticSvg = (body, label = "") => `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg iso-layer" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true"${label ? ` aria-label="${label}"` : ""}>${body}</svg>`;
  const backSvg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: "前视摄像头标定台：相机、ECU、显示器与棋盘格标定靶", body: back });
  const overlay = `<svg class="iso-layer va-overlay" viewBox="0 0 ${WIDTH} ${HEIGHT}" aria-hidden="true"><path class="va-ray" data-ray="" d=""/><circle class="va-hit-ring" data-hit-ring="" r="10"/><path class="va-hit-cross" data-hit-cross="" d=""/><circle class="va-hit-dot" data-hit-dot="" r="2.5"/></svg>`;
  const stage = `<div class="iso-turn va-stage" tabindex="0" role="application" aria-label="前视摄像头标定台 3D 模型。拖动场景可调整偏航；使用下方滑杆设置偏航和俯仰。方向键也可调整当前滑杆。">${backSvg}${out.layerSvg("camera", { width: WIDTH, height: HEIGHT })}${staticSvg(front)}${overlay}</div>`;
  const controls = `<div class="va-controls">
    <label class="va-control" for="va-yaw"><span><b>偏航角</b><small>绕车辆竖直轴旋转</small></span><input id="va-yaw" type="range" min="-${MAX_YAW}" max="${MAX_YAW}" step="0.1" value="0"><output data-yaw-value>0.0°</output></label>
    <label class="va-control" for="va-pitch"><span><b>俯仰角</b><small>绕相机横向轴旋转</small></span><input id="va-pitch" type="range" min="-${MAX_PITCH}" max="${MAX_PITCH}" step="0.1" value="0"><output data-pitch-value>0.0°</output></label>
    <button class="va-reset" type="button" data-reset>回正相机</button>
    <div class="va-math" aria-live="polite"><span>理想针孔模型</span><strong data-offset>Δu 0 px · Δv 0 px</strong><small>目标落点随视线移动；像素偏差按固定焦距近似计算</small></div>
  </div>`;
  const hint = "拖动标定台调偏航 · 滑杆或方向键调角度";
  const figure = k.plateHtml({
    fig: "Fig 3D",
    title: "ADAS 前视相机标定台",
    hint,
    readout: "yaw 0.0° · pitch 0.0°",
    keys: [
      { mark: "raised", label: "相机在双轴支架上调整安装外参" },
      { mark: "lit", label: "视线与标定靶的交点" },
      { mark: "blue", label: "图像数据送入视觉 ECU" },
    ],
    caption: "偏航或俯仰会让标定靶上的视线交点移动。真实标定还需内参、畸变、坐标系和多视角观测。",
    body: `${stage}${controls}`,
  });
  const css = readFileSync(join(HERE, "figure.css"), "utf8");
  const live = readFileSync(join(HERE, "live.js"), "utf8").replace("__MODEL__", projectionScript(out.data)).replace("__FOLLOW__", follow.toString());
  const turnRuntime = readFileSync(join(HERE, "vendor/anatomy/kit/turn.mjs"), "utf8").replace(/^export /gm, "");
  let page = k.pageHtml({ title: "ADAS 前视相机标定台 · 交互式 3D 展示", theme, width: 980, body: `<style>${out.css}\n${css}</style>${figure}`, script: `${verify ? `window.__isoVerify=${JSON.stringify(out.verify)};\n` : ""}${turnRuntime}\n${live}` });
  page = page.replace('<html lang="en">', '<html lang="zh-CN">');
  page = page.replace('</head>', '<meta name="color-scheme" content="light">\n</head>');
  return { page, out };
}

const verify = process.argv.includes("--verify");
const theme = process.argv.includes("--dark") ? "dark" : "light";
const { page, out } = buildPage(theme, verify);
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, page);
console.log(`wrote ${OUTPUT} · ${(page.length / 1024).toFixed(0)} KB · ${out.report.parts} live parts · ${out.report.layers.map((layer) => `${layer.name}: ${layer.planar} planes, ${layer.dynamic} dynamic`).join(" · ")} · build ${out.report.seconds.toFixed(2)} s`);

if (process.argv.includes("--audit")) {
  const R0 = R;
  A.settle(R0, P);
  TA.orbitOrExit(T, R0, P, {
    sweep: { at: (value) => follow({ yaw: value }), from: -MAX_YAW, to: MAX_YAW, frame: 0.3 },
    clips: [{ name: "pitch", at: (t) => follow({ yaw: 8, pitch: -MAX_PITCH + 2 * MAX_PITCH * t }), from: 0, to: 1, frame: 1 / 60 }],
    quick: process.argv.includes("--quick"),
    only: process.argv.find((arg) => arg.startsWith("--only="))?.slice(7).split(",") ?? null,
  });
}
