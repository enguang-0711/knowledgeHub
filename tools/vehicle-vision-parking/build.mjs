import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../vehicle-vision-anatomy/vendor/anatomy/kit/iso-kit.mjs";
import * as G from "../vehicle-vision-anatomy/vendor/anatomy/kit/lathe.mjs";
import { MODEL, SCENARIOS, clearanceMm } from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUTPUT = join(ROOT, "docs/public/vehicle-vision-surround-parking.html");
const WIDTH = 1040;
const HEIGHT = 660;
const AZIMUTH = 42;
const ELEVATION = 34;
const BASE = { x: -3600, y: -2850, w: 7200, d: 5700, r: 150 };
const DECK_Z = 160;
const BAY = { x: -2775, y: -1500, w: 5550, d: 3000, r: 30 };
const SCREEN = { x: -3240, y: 1190, w: 1540, d: 1040, z: 825 };
const EXTENTS = [
  ...k.boxCorners(BASE, -210, 120),
  ...k.boxCorners(BASE, DECK_Z, 1360),
  ...k.boxCorners({ x: -2450, y: -1060, w: 4900, d: 2120, r: 160 }, DECK_Z, 1860),
  ...k.boxCorners({ x: -3300, y: 1100, w: 1850, d: 1400, r: 80 }, DECK_Z, 1080),
  ...k.boxCorners({ x: 720, y: -1080, w: 1450, d: 2160, r: 30 }, DECK_Z, 500),
];
const P = k.fitProjection(EXTENTS, WIDTH, HEIGHT, { pad: 30, headroom: 12, azimuth: AZIMUTH, elevation: ELEVATION });
const at = (point) => k.iso(point, P);
const polygon = (points) => k.pathOf(points.map(at), true);
const path3 = (points) => k.pathOf(points.map(at));
const solids = [];
const solidNameCounts = new Map();
const solid = (name, paths, options = {}) => {
  const count = (solidNameCounts.get(name) ?? 0) + 1;
  solidNameCounts.set(name, count);
  solids.push(count === 1 ? name : `${name}-${count}`);
  return k.solidSvg(paths, { tone: "mid", crease: "faint", ...options });
};
const slab = (name, plan, z, height, { steps = 8, bevel = 0, ...options } = {}) =>
  solid(name, k.slabOf(plan, z, height, P, steps, bevel), options);
const cylinder = (name, x, y, radius, z, height, { steps = 32, bevel = 0, ...options } = {}) =>
  solid(name, k.cylinder(x, y, radius, z, height, P, steps, bevel), options);
const round = (name, meridian, frame, options = {}) =>
  solid(name, G.solidOf(meridian, frame, P, options), options);
const line = (points, options = {}) => k.lineSvg(path3(points), options);
const face = (points, className, extra = "") => `<path class="${className}" d="${polygon(points)}" ${extra}/>`;
const group = (parts, attrs = {}) => k.groupSvg(parts, attrs);

function platform() {
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf(BASE, -210, 120, P)}"/>`);

  for (const [x, y] of k.corners(BASE, 360)) {
    out.push(cylinder("support-foot-pad", x, y, 150, -210, 34, { steps: 40, tone: "lo", crease: "mid" }));
    out.push(cylinder("support-foot-stem", x, y, 84, -176, 176, { steps: 32, tone: "mid", crease: "lo" }));
    out.push(cylinder("support-foot-collar", x, y, 110, -50, 28, { steps: 36, tone: "hi", crease: "lo" }));
    out.push(cylinder("support-foot-lock-ring", x, y, 94, -84, 12, { steps: 36, tone: "lo", crease: "faint" }));
  }

  out.push(slab("lower-base-frame", BASE, -4, 56, { bevel: 12, tone: "mid", crease: "lo" }));
  out.push(slab("floating-deck", { ...BASE, x: BASE.x + 48, y: BASE.y + 48, w: BASE.w - 96, d: BASE.d - 96, r: 112 }, 52, 108, { bevel: 8, tone: "hi", crease: "lo" }));
  out.push(slab("deck-perimeter-inlay", { ...BASE, x: BASE.x + 115, y: BASE.y + 115, w: BASE.w - 230, d: BASE.d - 230, r: 70 }, 160, 2, { steps: 10, flat: true, tone: "faint", crease: "none" }));

  const cornerBolts = k.corners(BASE, 190);
  out.push(k.dotsSvg(cornerBolts.map(([x, y]) => at([x, y, 160])), { size: 1.3, tone: "lo" }));
  out.push(k.lineSvg(cornerBolts.map(([x, y]) => k.ring(x, y, 28, 160, P, 24)).join(""), { tone: "mid" }));

  const bayPath = k.planOutline(BAY, DECK_Z + 2, P, 4);
  out.push(k.lineSvg(bayPath, { tone: "mid", className: "bay-marking" }));
  out.push(k.lineSvg(k.lineOnTop([BAY.x + 180, 0], [BAY.x + BAY.w - 180, 0], DECK_Z + 2, P), { tone: "faint", dotted: true }));
  for (const x of [-2100, -1500, -900, -300, 300, 900, 1500, 2100]) {
    const y0 = BAY.y + 160;
    const y1 = BAY.y + BAY.d - 160;
    out.push(k.lineSvg(k.lineOnTop([x, y0], [x, y1], DECK_Z + 1, P), { tone: "faint", dotted: true }));
  }

  const railPlans = [
    { x: -3230, y: -2300, w: 6460, d: 90, r: 30 },
    { x: -3230, y: 2210, w: 6460, d: 90, r: 30 },
    { x: -3230, y: -2210, w: 90, d: 4420, r: 30 },
    { x: 3140, y: -2210, w: 90, d: 4420, r: 30 },
  ];
  railPlans.forEach((plan, index) => {
    out.push(slab(`deck-guard-rail-${index + 1}`, plan, 160, 42, { bevel: 8, tone: "lo", crease: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan(plan, 14), 202, P, 6), { tone: "faint" }));
  });

  const ruler = { x: -2740, y: -1860, w: 5480, d: 130, r: 16 };
  out.push(slab("clearance-ruler-strip", ruler, DECK_Z + 3, 8, { bevel: 2, tone: "lo", crease: "none" }));
  const ticks = k.topTicks(ruler.x + 22, ruler.x + ruler.w - 22, 100, 500, ruler.y + 14, DECK_Z + 12, [18, 38], P);
  out.push(k.lineSvg(ticks.minor, { tone: "mid" }));
  out.push(k.lineSvg(ticks.major, { tone: "hi" }));

  const plate = { x: 2330, y: -2260, w: 700, d: 260, r: 18 };
  out.push(slab("fixture-id-plate", plate, DECK_Z + 4, 14, { bevel: 3, tone: "mid" }));
  const labelMatrix = k.topMatrix([plate.x + 85, plate.y + 40], DECK_Z + 19, P);
  out.push(k.faceTextSvg(labelMatrix, "360 / PARKING TEST", { size: 62, tone: "hi" }));
  out.push(k.faceTextSvg(k.topMatrix([plate.x + 85, plate.y + 112], DECK_Z + 19, P), "4 CAM · BEV · REF", { size: 36, tone: "mid" }));

  return out.join("");
}

function cameraCoverage() {
  const { cameraRangeMm: range } = MODEL;
  const y = MODEL.vehicle.halfWidthMm - 85;
  const front = [
    [MODEL.vehicle.halfLengthMm - 45, -360, 520],
    [MODEL.vehicle.halfLengthMm + range, -1280, DECK_Z + 4],
    [MODEL.vehicle.halfLengthMm + range, 1280, DECK_Z + 4],
  ];
  const rear = [
    [-MODEL.vehicle.halfLengthMm + 45, 360, 520],
    [-MODEL.vehicle.halfLengthMm - range, 1280, DECK_Z + 4],
    [-MODEL.vehicle.halfLengthMm - range, -1280, DECK_Z + 4],
  ];
  const left = [
    [-480, -y, 1020],
    [-1600, -range - 950, DECK_Z + 4],
    [1600, -range - 950, DECK_Z + 4],
  ];
  const right = [
    [480, y, 1020],
    [1600, range + 950, DECK_Z + 4],
    [-1600, range + 950, DECK_Z + 4],
  ];
  return [
    face(front, "camera-coverage camera-coverage-front", `data-camera="front"`),
    face(rear, "camera-coverage camera-coverage-rear", `data-camera="rear"`),
    face(left, "camera-coverage camera-coverage-left", `data-camera="left"`),
    face(right, "camera-coverage camera-coverage-right", `data-camera="right"`),
    ...[
      ["front", front], ["rear", rear], ["left", left], ["right", right],
    ].map(([camera, points]) => line([points[0], points[1], points[2], points[0]], { tone: "lit", className: "coverage-edge" }).replace("<path ", `<path data-camera="${camera}" `)),
  ].join("");
}

function wheels() {
  const out = [];
  const { halfWidthMm } = MODEL.vehicle;
  for (const x of [-1450, 1450]) {
    for (const side of [-1, 1]) {
      const axis = [0, side, 0];
      const frame = G.frameAlong([x, side * 820, 435], axis);
      out.push(round("radial-tire", [[-118, 270], [-118, 300], [-94, 326], [94, 326], [118, 300], [118, 270]], frame, { tone: "lo", crease: "mid", steps: 56 }));
      out.push(round("alloy-rim-barrel", [[94, 205], [108, 238], [132, 238], [145, 205]], frame, { tone: "hi", crease: "lo", steps: 48 }));
      out.push(round("alloy-center-hub", [[142, 92], [151, 128], [170, 128], [180, 92]], frame, { tone: "mid", crease: "faint", steps: 40 }));
      const lugPoints = Array.from({ length: 5 }, (_, index) => {
        const angle = index * Math.PI * 2 / 5;
        return G.pointOf(frame, 174, 82, angle);
      });
      out.push(k.dotsSvg(lugPoints.map(at), { size: 2.1, tone: "lo" }));
      out.push(k.lineSvg(k.ring(x, side * (halfWidthMm - 34), 308, 442, P, 48), { tone: "faint" }));
    }
  }
  return out.join("");
}

function windowAndTrim() {
  const out = [];
  const frontGlass = [[870, -610, 980], [870, 610, 980], [620, 555, 1410], [620, -555, 1410]];
  const rearGlass = [[-900, 610, 980], [-900, -610, 980], [-620, -555, 1410], [-620, 555, 1410]];
  out.push(face(frontGlass, "vehicle-glass"));
  out.push(face(rearGlass, "vehicle-glass"));
  for (const side of [-1, 1]) {
    const y = side * 735;
    const splitX = 0;
    out.push(face([[-690, y, 980], [splitX - 30, y, 980], [splitX - 90, side * 650, 1405], [-560, side * 650, 1405]], "vehicle-glass"));
    out.push(face([[splitX + 38, y, 980], [730, y, 980], [570, side * 650, 1405], [splitX - 50, side * 650, 1405]], "vehicle-glass"));
    out.push(line([[-710, y, 970], [780, y, 970]], { tone: "faint" }));
    out.push(line([[-520, side * 946, 520], [1080, side * 946, 520], [1080, side * 946, 900], [-520, side * 946, 900], [-520, side * 946, 520]], { tone: "faint" }));
    out.push(line([[splitX, side * 948, 520], [splitX, side * 948, 920]], { tone: "lo" }));
    out.push(line([[500, side * 951, 758], [690, side * 951, 758]], { tone: "hi" }));
  }
  return out.join("");
}

function cameraModule(name, position, direction) {
  const out = [];
  const [x, y, z] = position;
  const sign = Math.sign(direction[0] || direction[1]);
  const length = 150;
  out.push(slab(`${name}-mount-pad`, { x: x - 100, y: y - 100, w: 200, d: 200, r: 28 }, z - 24, 34, { bevel: 7, tone: "lo" }));
  out.push(slab(`${name}-camera-housing`, { x: x - 82, y: y - 80, w: 164, d: 160, r: 22 }, z + 10, 84, { bevel: 11, tone: "hi", crease: "lo" }));
  const frame = G.frameAlong([x + direction[0] * 75, y + direction[1] * 75, z + 54], direction);
  const s0 = 0;
  out.push(round(`${name}-lens-barrel`, [[s0, 44], [s0 + 12, 55], [s0 + 78, 55], [s0 + 96, 43], [s0 + 96, 30], [s0, 30]], frame, { tone: "mid", crease: "lo", steps: 40 }));
  out.push(round(`${name}-lens-bezel`, [[92, 45], [98, 52], [112, 52], [118, 44], [118, 26], [92, 26]], frame, { tone: "lo", crease: "mid", steps: 40 }));
  out.push(round(`${name}-lens-glass`, [[117, 32], [119, 38], [126, 38], [128, 32], [128, 0]], frame, { tone: "lit", crease: "hi", lit: true, steps: 36 }));
  for (const dx of [-54, 54]) {
    for (const dy of [-51, 51]) {
      out.push(cylinder(`${name}-housing-screw`, x + dx, y + dy, 8, z + 94, 5, { steps: 16, tone: "lo", crease: "none" }));
    }
  }
  const marker = at([x + direction[0] * (length + 4), y + direction[1] * (length + 4), z + 52]);
  out.push(`<circle class="camera-lens-marker" cx="${marker[0]}" cy="${marker[1]}" r="3.2"/>`);
  return group(out, { class: "camera-module", "data-camera-module": name });
}

function vehicle() {
  const out = [cameraCoverage(), wheels()];
  out.push(slab("vehicle-undertray", { x: -2130, y: -875, w: 4260, d: 1750, r: 230 }, 410, 225, { bevel: 28, tone: "lo", crease: "mid" }));
  out.push(slab("vehicle-sill", { x: -2200, y: -944, w: 4400, d: 1888, r: 300 }, 500, 110, { bevel: 40, tone: "mid", crease: "faint" }));
  out.push(slab("vehicle-main-body", { x: -2200, y: -940, w: 4400, d: 1880, r: 360 }, 580, 420, { bevel: 74, tone: "hi", crease: "lo" }));
  out.push(slab("front-bonnet", { x: 420, y: -820, w: 1630, d: 1640, r: 230 }, 915, 132, { bevel: 42, tone: "hi", crease: "faint" }));
  out.push(slab("rear-deck", { x: -2010, y: -820, w: 820, d: 1640, r: 170 }, 915, 118, { bevel: 38, tone: "hi", crease: "faint" }));
  out.push(slab("passenger-cabin-shell", { x: -930, y: -750, w: 1850, d: 1500, r: 340 }, 920, 490, { bevel: 85, tone: "mid", crease: "lo" }));
  out.push(slab("cabin-roof-panel", { x: -660, y: -622, w: 1370, d: 1244, r: 250 }, 1375, 95, { bevel: 60, tone: "hi", crease: "lo" }));
  out.push(windowAndTrim());

  for (const side of [-1, 1]) {
    out.push(slab("side-mirror-stalk", { x: 620, y: side * 920 - 28, w: 74, d: 56, r: 18 }, 930, 20, { tone: "lo", crease: "none" }));
    out.push(slab("side-mirror-housing", { x: 660, y: side * 965 - 76, w: 180, d: 152, r: 56 }, 948, 90, { bevel: 18, tone: "mid", crease: "lo" }));
    out.push(slab("side-step", { x: -500, y: side * 956 - 24, w: 1120, d: 48, r: 18 }, 490, 62, { bevel: 15, tone: "lo", crease: "faint" }));
    for (const x of [-600, 560]) {
      out.push(slab("door-handle", { x, y: side * 950 - 16, w: 170, d: 32, r: 12 }, 840, 20, { bevel: 5, tone: "hi", crease: "none" }));
    }
  }

  for (const y of [-620, 620]) {
    out.push(slab("front-headlamp", { x: 2130, y: y - 200, w: 70, d: 400, r: 45 }, 780, 88, { bevel: 16, tone: "hi", crease: "mid", className: "lamp-solid" }));
    out.push(slab("rear-tail-lamp", { x: -2205, y: y - 190, w: 75, d: 380, r: 40 }, 760, 76, { bevel: 14, tone: "lo", crease: "faint" }));
  }
  out.push(slab("front-grille", { x: 2190, y: -330, w: 52, d: 660, r: 48 }, 610, 250, { bevel: 14, tone: "lo", crease: "faint" }));
  out.push(slab("rear-plate-recess", { x: -2210, y: -275, w: 36, d: 550, r: 26 }, 690, 150, { bevel: 8, tone: "lo", crease: "faint" }));
  out.push(slab("roof-rail-left", { x: -510, y: -690, w: 1160, d: 38, r: 18 }, 1478, 32, { bevel: 9, tone: "mid" }));
  out.push(slab("roof-rail-right", { x: -510, y: 652, w: 1160, d: 38, r: 18 }, 1478, 32, { bevel: 9, tone: "mid" }));
  out.push(cylinder("roof-antenna-foot", -920, 0, 48, 1410, 32, { steps: 32, tone: "lo" }));
  out.push(cylinder("roof-antenna-fin", -920, 0, 24, 1442, 90, { steps: 24, tone: "hi" }));

  out.push(cameraModule("front-camera", [2240, 0, 740], [1, 0, 0]));
  out.push(cameraModule("rear-camera", [-2240, 0, 740], [-1, 0, 0]));
  out.push(cameraModule("left-camera", [-120, -920, 1020], [0, -1, 0]));
  out.push(cameraModule("right-camera", [120, 920, 1020], [0, 1, 0]));

  return group(out, { id: "moving-vehicle", transform: "translate(0 0)" });
}

function obstacles() {
  const low = [];
  const obstacle = SCENARIOS.low.obstacle;
  low.push(slab("low-obstacle-rubber-foot", { x: obstacle.xMm - 210, y: obstacle.yMm - 135, w: 420, d: 270, r: 34 }, DECK_Z, 36, { bevel: 12, tone: "lo" }));
  low.push(slab("low-obstacle-polymer-body", { x: obstacle.xMm - 180, y: obstacle.yMm - 100, w: 360, d: 200, r: 28 }, DECK_Z + 36, 164, { bevel: 22, tone: "hi", crease: "lo" }));
  for (const x of [obstacle.xMm - 95, obstacle.xMm + 95]) {
    low.push(slab("low-obstacle-reflector", { x: x - 28, y: obstacle.yMm - 104, w: 56, d: 208, r: 16 }, DECK_Z + 105, 34, { bevel: 9, tone: "mid", crease: "none" }));
  }
  low.push(k.lineSvg(k.planOutline({ x: obstacle.xMm - 210, y: obstacle.yMm - 135, w: 420, d: 270, r: 34 }, DECK_Z + 2, P), { tone: "faint" }));

  const ramp = [];
  const x0 = 720;
  const x1 = 2170;
  const y0 = -1080;
  const y1 = 1080;
  const z0 = DECK_Z;
  const z1 = DECK_Z + 310;
  ramp.push(face([[x0, y0, z0], [x1, y0, z1], [x1, y1, z1], [x0, y1, z0]], "scenario-ramp-top"));
  ramp.push(face([[x0, y0, z0 - 85], [x1, y0, z0 - 85], [x1, y0, z1], [x0, y0, z0]], "scenario-ramp-side"));
  ramp.push(face([[x0, y1, z0 - 85], [x1, y1, z0 - 85], [x1, y1, z1], [x0, y1, z0]], "scenario-ramp-side"));
  ramp.push(face([[x0, y0, z0 - 85], [x0, y1, z0 - 85], [x0, y1, z0], [x0, y0, z0]], "scenario-ramp-end"));
  ramp.push(face([[x1, y0, z0 - 85], [x1, y1, z0 - 85], [x1, y1, z1], [x1, y0, z1]], "scenario-ramp-end"));
  ramp.push(face([[1120, -540, 252], [1360, -540, 303], [1360, 460, 303], [1120, 460, 252]], "ramp-reflection"));
  for (let index = 0; index < 8; index++) {
    const x = x0 + 160 + index * 150;
    const z = z0 + ((x - x0) / (x1 - x0)) * (z1 - z0) + 4;
    ramp.push(line([[x, y0 + 20, z], [x, y1 - 20, z]], { tone: "faint" }));
  }

  const stopper = [];
  stopper.push(slab("wheel-stop-base", { x: -2670, y: -520, w: 170, d: 1040, r: 42 }, DECK_Z, 70, { bevel: 12, tone: "lo" }));
  stopper.push(slab("wheel-stop-face", { x: -2640, y: -465, w: 120, d: 930, r: 40 }, DECK_Z + 70, 95, { bevel: 18, tone: "mid" }));
  for (const y of [-330, 0, 330]) stopper.push(cylinder("wheel-stop-anchor", -2580, y, 24, DECK_Z + 165, 10, { steps: 24, tone: "lo" }));

  return [
    group(stopper, { class: "scenario-object", "data-scenario-object": "standard low ramp" }),
    group(low, { class: "scenario-object", "data-scenario-object": "low" }),
    group(ramp, { class: "scenario-object", "data-scenario-object": "ramp" }),
  ].join("");
}

function consoleUnit() {
  const out = [];
  const consolePlan = { x: -3300, y: 1060, w: 1840, d: 1380, r: 100 };
  out.push(slab("console-foot", consolePlan, DECK_Z, 100, { bevel: 20, tone: "lo" }));
  for (const [x, y] of [[-3150, 1200], [-1700, 1200], [-3150, 2320], [-1700, 2320]]) {
    out.push(cylinder("console-isolator", x, y, 60, DECK_Z + 100, 110, { steps: 32, tone: "mid" }));
    out.push(cylinder("console-isolator-washer", x, y, 72, DECK_Z + 95, 10, { steps: 32, tone: "lo" }));
  }
  out.push(slab("console-shell", { ...consolePlan, x: -3260, y: 1110, w: 1760, d: 1280, r: 88 }, DECK_Z + 210, 225, { bevel: 34, tone: "mid", crease: "lo" }));
  out.push(slab("console-control-deck", { ...consolePlan, x: -3200, y: 1170, w: 1640, d: 1120, r: 58 }, DECK_Z + 435, 58, { bevel: 14, tone: "hi", crease: "faint" }));
  out.push(slab("display-bezel", { x: SCREEN.x - 28, y: SCREEN.y - 28, w: SCREEN.w + 56, d: SCREEN.d + 56, r: 46 }, SCREEN.z - 20, 34, { bevel: 12, tone: "lo" }));
  out.push(slab("display-glass", { x: SCREEN.x, y: SCREEN.y, w: SCREEN.w, d: SCREEN.d, r: 26 }, SCREEN.z + 14, 4, { bevel: 1, tone: "hi", crease: "none", className: "display-glass" }));
  out.push(slab("display-lip", { x: SCREEN.x + 45, y: SCREEN.y + 48, w: SCREEN.w - 90, d: SCREEN.d - 96, r: 12 }, SCREEN.z + 18, 1, { bevel: 0, flat: true, tone: "faint", crease: "none", className: "display-lip" }));

  for (const x of [-2950, -2600, -2250]) {
    out.push(cylinder("panel-selector-bushing", x, 1320, 92, DECK_Z + 492, 12, { steps: 40, tone: "lo" }));
    out.push(cylinder("panel-selector-knob", x, 1320, 68, DECK_Z + 504, 62, { steps: 40, bevel: 6, tone: "hi" }));
    out.push(k.lineSvg(k.ring(x, 1320, 54, DECK_Z + 566, P, 36), { tone: "faint" }));
  }
  for (const x of [-2940, -2760, -2580, -2400, -2220]) {
    out.push(cylinder("panel-status-button", x, 2100, 38, DECK_Z + 493, 22, { steps: 24, tone: "mid", crease: "none" }));
  }
  for (const x of [-3090, -2790, -2490]) {
    out.push(slab("console-keycap", { x, y: 2280, w: 135, d: 76, r: 18 }, DECK_Z + 493, 26, { bevel: 8, tone: "lo", crease: "faint" }));
  }
  const screenOrigin = k.topMatrix([SCREEN.x + 34, SCREEN.y + 30], SCREEN.z + 21, P);
  const screen = `<g class="bev-screen" transform="${screenOrigin}" aria-hidden="true">
    <rect class="bev-screen-bg" x="0" y="0" width="1470" height="980" rx="34"/>
    <path class="bev-parking-lines" d="M80 120H710M80 860H710M120 120V860M670 120V860"/>
    <path class="bev-center-line" d="M395 145V835"/>
    <g id="bev-car" transform="translate(0 0)">
      <path class="bev-car-body" d="M290 320Q290 265 345 252L480 252Q535 265 535 320V665Q535 720 480 733H345Q290 720 290 665Z"/>
      <path class="bev-car-glass" d="M325 334Q325 300 360 292H465Q500 300 500 334V413H325ZM325 580H500V652Q500 686 465 694H360Q325 686 325 652Z"/>
      <path class="bev-camera-zone" d="M320 265L210 132L610 132L505 265M290 355L130 280L130 700L290 630M535 355L700 280L700 700L535 630"/>
    </g>
    <circle class="bev-obstacle" data-bev-obstacle="low" cx="548" cy="490" r="26"/>
    <path class="bev-ramp" data-bev-obstacle="ramp" d="M355 470L435 430L485 530L405 570Z"/>
    <text class="bev-kicker" x="800" y="240">NEAREST GAP</text>
    <text class="bev-distance" data-screen-clearance x="800" y="360">575 mm</text>
    <path class="bev-rule" d="M800 410H1390"/>
    <text class="bev-kicker" x="800" y="490">CAMERA SET</text>
    <text class="bev-value" data-screen-scenario x="800" y="590">4 × FISHEYE</text>
    <circle class="bev-status-dot" cx="820" cy="760" r="16"/>
    <text class="bev-status" data-screen-status x="860" y="777">READY</text>
  </g>`;
  out.push(screen);
  return group(out, { class: "console-unit" });
}

function buildFigure() {
  const body = [
    platform(),
    obstacles(),
    vehicle(),
    consoleUnit(),
  ].join("");
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: "环视泊车验证台：四路鱼眼相机、车辆模型、停车位、障碍物和鸟瞰显示屏",
    body,
    className: "parking-figure",
  });
}

function controls() {
  const scenarioButtons = Object.entries(SCENARIOS).map(([id, item], index) =>
    `<button type="button" class="scenario-button" data-scenario="${id}" aria-pressed="${index === 0 ? "true" : "false"}"><span class="scenario-index">0${index + 1}</span><span><b>${item.label}</b><small>${item.detail}</small></span></button>`
  ).join("");
  const cameraButtons = [
    ["all", "全部"], ["front", "前"], ["rear", "后"], ["left", "左"], ["right", "右"],
  ].map(([id, label], index) =>
    `<button type="button" class="camera-button" data-camera-select="${id}" aria-pressed="${index === 0 ? "true" : "false"}">${label}</button>`
  ).join("");

  return `<div class="parking-controls">
    <div class="scenario-control">
      <div class="control-heading"><span>SCENARIO</span><small>选择泊车测试变体</small></div>
      <div class="scenario-buttons">${scenarioButtons}</div>
    </div>
    <div class="control-divider"></div>
    <div class="live-controls">
      <label class="lateral-control" for="lateral-offset"><span><b>车辆横向偏移</b><small>拖动场景或使用左右方向键</small></span><input id="lateral-offset" type="range" min="-${MODEL.lateralRangeMm}" max="${MODEL.lateralRangeMm}" step="10" value="0"><output id="lateral-value">0 mm</output></label>
      <div class="clearance-readout" aria-live="polite"><span>最近几何间距</span><strong id="clearance-value">575 mm</strong><small id="clearance-context">到车位边界 · 教学模型读数</small></div>
      <div class="camera-control"><span><b>视锥通道</b><small>切换单路或全部摄像头</small></span><div class="camera-buttons">${cameraButtons}</div></div>
      <button type="button" class="reset-button" id="reset-model">重置模型</button>
    </div>
  </div>`;
}

function buildPage() {
  const figure = k.plateHtml({
    fig: "Fig 02",
    title: "SURROUND VIEW / PARKING",
    hint: "拖动模型横移车辆 · 滑杆可精细调节",
    readout: "GAP 575 mm · 4 CAM",
    keys: [
      { mark: "raised", label: "四路环视相机与车辆模型" },
      { mark: "lit", label: "相机视锥覆盖区域" },
      { mark: "blue", label: "车位、障碍物与 BEV 示意" },
    ],
    caption: "横移会同步更新车模、视锥、鸟瞰显示与几何间距。尺寸和间距为本教学场景的示意参数，不代表量产车型或传感器标定值。",
    body: `<div class="iso-stage parking-stage" tabindex="0" role="application" aria-label="环视泊车验证台。拖动场景可横向移动车辆，方向键也可调节；下方可切换障碍物和摄像头视锥。">${buildFigure()}</div>${controls()}`,
  });
  const css = readFileSync(join(HERE, "figure.css"), "utf8");
  const live = readFileSync(join(HERE, "live.js"), "utf8")
    .replace("__MODEL__", JSON.stringify({ MODEL, SCENARIOS, projection: P, camera: k.cameraOf(P), deckZ: DECK_Z, screen: SCREEN }))
    .replace("__CLEARANCE__", clearanceMm.toString());
  let page = k.pageHtml({
    title: "环视泊车验证台 · 交互式 3D 展示",
    theme: "light",
    width: 1120,
    body: `<style>${css}</style>${figure}`,
    script: live,
  });
  page = page.replace('<html lang="en">', '<html lang="zh-CN">');
  page = page.replace("</head>", '<meta name="color-scheme" content="light">\n</head>');
  return page;
}

const page = buildPage();
assert.ok(solids.length >= 80 && solids.length <= 150, `Hero parts must be 80–150; got ${solids.length}`);
assert.equal(new Set(solids).size, solids.length, "Every solid needs a distinct part name");

for (const [id, scenario] of Object.entries(SCENARIOS)) {
  for (const offset of [-MODEL.lateralRangeMm, 0, MODEL.lateralRangeMm]) {
    const gap = clearanceMm(offset, MODEL, scenario);
    assert.ok(gap >= 0 && Number.isFinite(gap), `${id} has invalid clearance at ${offset} mm`);
  }
}

if (process.argv.includes("--verify")) {
  const existing = readFileSync(OUTPUT, "utf8");
  if (existing !== page) throw new Error("Generated surround-parking page is stale; run npm run model:surround-parking");
  console.log(`verified ${OUTPUT} · ${solids.length} solids · ${Object.keys(SCENARIOS).length} scenarios`);
} else {
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, page);
  console.log(`wrote ${OUTPUT} · ${(page.length / 1024).toFixed(0)} KB · ${solids.length} solids · ${Object.keys(SCENARIOS).length} scenarios`);
}

if (process.argv.includes("--audit")) {
  const samples = Object.entries(SCENARIOS).map(([id, scenario]) => {
    const values = [-MODEL.lateralRangeMm, 0, MODEL.lateralRangeMm].map((offset) => clearanceMm(offset, MODEL, scenario));
    return `${id}: ${values.join(" / ")} mm`;
  });
  console.log(`geometry checks passed · ${samples.join(" · ")}`);
}
