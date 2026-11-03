import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../vehicle-vision-anatomy/vendor/anatomy/kit/iso-kit.mjs";
import * as G from "../vehicle-vision-anatomy/vendor/anatomy/kit/lathe.mjs";
import { GEOMETRY, SCENARIOS, observation } from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUTPUT = join(ROOT, "docs/public/vehicle-vision-dms-cabin.html");
const WIDTH = 1040;
const HEIGHT = 650;
const AZIMUTH = 220;
const ELEVATION = 31;
const FLOOR_Z = GEOMETRY.cabin.floorZmm;
const BASE = { x: -2900, y: -2600, w: 5800, d: 5200, r: 150 };
const CABIN = { x: -2600, y: -2050, w: 5000, d: 4100, r: 55 };
const DRIVER = GEOMETRY.driver;
const CAMERA = GEOMETRY.camera;
const INITIAL = observation(GEOMETRY.seat.travelMm.initial, "attentive");
const CONSOLE = { x: -2450, y: 400, w: 1850, d: 1550, r: 100 };
const SCREEN = { x: -2300, y: 1080, w: 1550, d: 730, z: FLOOR_Z + 537 };
const EXTENTS = [
  ...k.boxCorners(BASE, -220, 155),
  ...k.boxCorners(CABIN, FLOOR_Z, 310),
  ...k.boxCorners({ x: -1570, y: -1180, w: 1950, d: 920, r: 180 }, FLOOR_Z + 140, 1750),
  ...k.boxCorners({ x: 300, y: -1990, w: 2300, d: 3980, r: 130 }, FLOOR_Z + 560, 1590),
  ...k.boxCorners(CONSOLE, FLOOR_Z + 160, 1000),
  [CAMERA.xMm + 100, CAMERA.yMm - 90, CAMERA.zMm + 160],
  [CAMERA.xMm - 190, CAMERA.yMm + 90, CAMERA.zMm - 160],
];
const P = k.fitProjection(EXTENTS, WIDTH, HEIGHT, { pad: 28, headroom: 8, azimuth: AZIMUTH, elevation: ELEVATION });
const at = (point) => k.iso(point, P);
const polygon = (points) => k.pathOf(points.map(at), true);
const path3 = (points) => k.pathOf(points.map(at));
const face = (points, className, extra = "") => `<path class="${className}" d="${polygon(points)}" ${extra}/>`;
const line = (points, options = {}) => k.lineSvg(path3(points), options);
const solids = [];
const names = new Map();
const solid = (name, paths, options = {}) => {
  const count = (names.get(name) ?? 0) + 1;
  names.set(name, count);
  solids.push(count === 1 ? name : `${name}-${count}`);
  return k.solidSvg(paths, { tone: "mid", crease: "faint", ...options });
};
const slab = (name, plan, z, height, { steps = 8, bevel = 0, ...options } = {}) =>
  solid(name, k.slabOf(plan, z, height, P, steps, bevel), options);
const cylinder = (name, x, y, radius, z, height, { steps = 32, bevel = 0, ...options } = {}) =>
  solid(name, k.cylinder(x, y, radius, z, height, P, steps, bevel), options);
const lathe = (name, profile, frame, options = {}) => solid(name, G.solidOf(profile, frame, P, options), options);
const roundBand = (name, s0, s1, inner, outer, frame, options = {}) => solid(name, G.ringBand(s0, s1, inner, outer, frame, P, options), options);
const rodBetween = (name, a, b, radius, options = {}) => {
  const axis = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const length = Math.hypot(...axis);
  const profile = [[0, radius * 0.75], [Math.min(radius * 0.35, length * 0.12), radius], [length - Math.min(radius * 0.35, length * 0.12), radius], [length, radius * 0.75]];
  return lathe(name, profile, G.frameAlong(a, axis), { tone: "mid", crease: "lo", ...options });
};

function platform() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -220, 150, P)}"/>`];
  for (const [x, y] of k.corners(BASE, 360)) {
    out.push(cylinder("rig-foot-pad", x, y, 155, -220, 35, { steps: 36, tone: "lo", crease: "mid" }));
    out.push(cylinder("rig-leveling-stem", x, y, 84, -185, 154, { steps: 32, tone: "mid", crease: "lo" }));
    out.push(cylinder("rig-lock-collar", x, y, 108, -52, 28, { steps: 36, tone: "hi", crease: "lo" }));
  }
  out.push(slab("lower-rig-frame", BASE, -3, 52, { bevel: 10, tone: "mid", crease: "lo" }));
  out.push(slab("cabin-floor-deck", { ...BASE, x: BASE.x + 46, y: BASE.y + 46, w: BASE.w - 92, d: BASE.d - 92, r: 120 }, 49, 100, { bevel: 8, tone: "hi", crease: "lo" }));
  out.push(slab("cabin-floor-trim", { ...CABIN, x: CABIN.x + 40, y: CABIN.y + 40, w: CABIN.w - 80, d: CABIN.d - 80, r: 72 }, FLOOR_Z, 8, { bevel: 2, tone: "lo", crease: "none" }));

  const bolts = k.corners(BASE, 205);
  out.push(k.lineSvg(bolts.map(([x, y]) => k.ring(x, y, 29, 149, P, 22)).join(""), { tone: "mid" }));
  out.push(k.dotsSvg(bolts.map(([x, y]) => at([x, y, 149])), { size: 1.25, tone: "lo" }));
  const hatch = { x: 1580, y: -2200, w: 900, d: 640, r: 36 };
  out.push(slab("floor-service-hatch", hatch, FLOOR_Z + 5, 14, { bevel: 4, tone: "mid" }));
  out.push(k.lineSvg(k.planOutline(k.insetPlan(hatch, 34), FLOOR_Z + 20, P, 7), { tone: "faint" }));
  const ruler = { x: -2520, y: -2220, w: 4140, d: 124, r: 14 };
  out.push(slab("seat-travel-index-strip", ruler, FLOOR_Z + 4, 7, { bevel: 2, tone: "lo", crease: "none" }));
  const ticks = k.topTicks(ruler.x + 22, ruler.x + ruler.w - 22, 20, 100, ruler.y + 14, FLOOR_Z + 13, [16, 38], P);
  out.push(k.lineSvg(ticks.minor, { tone: "mid" }), k.lineSvg(ticks.major, { tone: "hi" }));
  return out.join("");
}

function cockpit() {
  const out = [];
  const dashBase = { x: 220, y: -2020, w: 2260, d: 4010, r: 140 };
  out.push(slab("dashboard-support-beam", { x: 210, y: -2000, w: 1980, d: 3960, r: 100 }, FLOOR_Z + 650, 190, { bevel: 28, tone: "lo", crease: "mid" }));
  out.push(slab("instrument-panel-shell", dashBase, FLOOR_Z + 835, 310, { bevel: 45, tone: "mid", crease: "lo" }));
  out.push(slab("instrument-panel-top", { ...dashBase, x: 260, y: -1950, w: 2180, d: 3860, r: 112 }, FLOOR_Z + 1120, 105, { bevel: 32, tone: "hi", crease: "faint" }));
  out.push(slab("driver-display-bezel", { x: 330, y: -1250, w: 480, d: 840, r: 50 }, FLOOR_Z + 1224, 22, { bevel: 7, tone: "lo" }));
  out.push(slab("driver-display-glass", { x: 355, y: -1225, w: 430, d: 790, r: 30 }, FLOOR_Z + 1248, 4, { bevel: 1, tone: "hi", crease: "none", className: "gauge-glass" }));
  out.push(slab("centre-display-bezel", { x: 820, y: 450, w: 810, d: 860, r: 55 }, FLOOR_Z + 1224, 26, { bevel: 8, tone: "lo" }));
  out.push(slab("centre-display-screen", { x: 852, y: 482, w: 746, d: 796, r: 34 }, FLOOR_Z + 1252, 4, { bevel: 1, tone: "hi", crease: "none", className: "gauge-glass" }));
  out.push(slab("steering-column-foot", { x: 470, y: -1030, w: 520, d: 560, r: 100 }, FLOOR_Z + 1110, 72, { bevel: 22, tone: "lo" }));

  const wheelX = 365;
  const wheelY = -720;
  const wheelZ = FLOOR_Z + 1030;
  const wheelFrame = G.frameAlong([wheelX, wheelY, wheelZ], [1, 0, 0]);
  const shaftFrame = G.frameAlong([wheelX + 50, wheelY, wheelZ], [1, 0, 0]);
  out.push(roundBand("steering-wheel-rim", -30, 30, 265, 316, wheelFrame, { tone: "lo", crease: "mid", steps: 80 }));
  out.push(roundBand("steering-wheel-hub-ring", -68, 68, 58, 92, shaftFrame, { tone: "mid", crease: "lo", steps: 48 }));
  out.push(G.disc(-105, 105, 58, shaftFrame, P, { tone: "hi", crease: "lo", steps: 48 }).fill && solid("steering-wheel-centre-cap", G.disc(-105, 105, 58, shaftFrame, P, { tone: "hi", crease: "lo", steps: 48 }), { tone: "hi", crease: "lo" }));
  out.push(rodBetween("steering-wheel-upper-spoke", [wheelX + 10, wheelY, wheelZ + 74], [wheelX + 10, wheelY, wheelZ + 275], 25, { tone: "hi" }));
  out.push(rodBetween("steering-wheel-left-spoke", [wheelX + 10, wheelY - 64, wheelZ - 32], [wheelX + 10, wheelY - 228, wheelZ - 185], 26, { tone: "hi" }));
  out.push(rodBetween("steering-wheel-right-spoke", [wheelX + 10, wheelY + 64, wheelZ - 32], [wheelX + 10, wheelY + 228, wheelZ - 185], 26, { tone: "hi" }));
  out.push(cylinder("column-lower-joint", 210, wheelY, 104, FLOOR_Z + 540, 210, { steps: 36, bevel: 18, tone: "lo" }));
  out.push(rodBetween("column-tilt-shaft", [210, wheelY, FLOOR_Z + 720], [wheelX - 30, wheelY, wheelZ], 70, { tone: "mid" }));
  out.push(cylinder("column-lock-collar", 245, wheelY, 91, FLOOR_Z + 665, 32, { steps: 36, tone: "hi", crease: "lo" }));

  for (const side of [-1, 1]) {
    const y = side * 1910;
    out.push(slab("sail-panel-inner-trim", { x: -1960, y: y - 78, w: 4140, d: 120, r: 34 }, FLOOR_Z + 285, 210, { bevel: 24, tone: "mid", crease: "lo" }));
    out.push(slab("door-armrest", { x: -640, y: y - 112, w: 1120, d: 190, r: 50 }, FLOOR_Z + 478, 80, { bevel: 24, tone: "hi", crease: "faint" }));
  }
  const windscreen = [
    [2200, -1640, FLOOR_Z + 1450], [2200, 1640, FLOOR_Z + 1450],
    [1720, 1640, FLOOR_Z + 2670], [1720, -1640, FLOOR_Z + 2670],
  ];
  out.push(face(windscreen, "windscreen-glass"));
  for (const side of [-1, 1]) {
    const y = side * 1700;
    out.push(rodBetween("windscreen-a-pillar", [2230, y, FLOOR_Z + 1390], [1700, y * 0.88, FLOOR_Z + 2700], 72, { tone: "mid" }));
    out.push(line([[2180, side * 1630, FLOOR_Z + 1450], [1690, side * 1460, FLOOR_Z + 2650]], { tone: "faint" }));
  }
  out.push(line([[1820, -1660, FLOOR_Z + 2670], [1820, 1660, FLOOR_Z + 2670]], { tone: "faint" }));

  const gauge = k.topMatrix([380, -1185], FLOOR_Z + 1255, P);
  out.push(`<g class="dms-gauge" transform="${gauge}" aria-hidden="true"><rect class="dms-gauge-bg" width="390" height="680" rx="28"/><path class="dms-gauge-rule" d="M45 135H345M45 545H345"/><path class="dms-gauge-arc" d="M88 438A125 125 0 0 1 300 438"/><path class="dms-gauge-needle" d="M192 438L246 304"/><circle class="dms-gauge-hub" cx="192" cy="438" r="18"/><circle class="dms-gauge-led" cx="95" cy="84" r="17"/></g>`);
  out.push(line([[955, 482, FLOOR_Z + 1257], [955, 482, FLOOR_Z + 1257]], { tone: "faint" }));
  return out.join("");
}

function seatTracks() {
  const out = [];
  for (const y of [-1110, -330]) {
    const rail = { x: -1480, y: y - 55, w: 1930, d: 110, r: 28 };
    out.push(slab("seat-guide-rail", rail, FLOOR_Z + 12, 62, { bevel: 14, tone: "lo", crease: "mid" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan(rail, 16), FLOOR_Z + 75, P, 5), { tone: "faint" }));
  }
  return out.join("");
}

function seatAndDriver() {
  const out = [];
  const z = FLOOR_Z + 90;
  for (const y of [-1010, -430]) {
    out.push(slab("seat-carriage-slider", { x: -1080, y: y - 67, w: 800, d: 134, r: 25 }, z, 54, { bevel: 12, tone: "mid" }));
    out.push(cylinder("seat-slider-stop", -1065, y, 36, z + 54, 18, { steps: 24, tone: "hi", crease: "lo" }));
  }
  out.push(slab("seat-lift-platform", { x: -1050, y: -1120, w: 900, d: 800, r: 90 }, z + 54, 85, { bevel: 24, tone: "lo" }));
  out.push(cylinder("seat-left-hinge", -580, -1110, 60, z + 123, 28, { steps: 32, tone: "hi" }));
  out.push(cylinder("seat-right-hinge", -580, -300, 60, z + 123, 28, { steps: 32, tone: "hi" }));
  out.push(slab("seat-pan-frame", { x: -1030, y: -1140, w: 920, d: 850, r: 145 }, z + 125, 150, { bevel: 36, tone: "mid" }));
  out.push(slab("seat-cushion", { x: -1080, y: -1125, w: 900, d: 820, r: 172 }, z + 266, 146, { bevel: 46, tone: "hi", crease: "lo", className: "seat-upholstery" }));
  out.push(slab("seat-front-bolster-left", { x: -1080, y: -1130, w: 710, d: 145, r: 68 }, z + 355, 74, { bevel: 28, tone: "mid" }));
  out.push(slab("seat-front-bolster-right", { x: -1080, y: -300, w: 710, d: 145, r: 68 }, z + 355, 74, { bevel: 28, tone: "mid" }));

  out.push(slab("seat-back-frame", { x: -1100, y: -1120, w: 360, d: 840, r: 118 }, z + 315, 980, { bevel: 48, tone: "lo", crease: "mid" }));
  out.push(slab("seat-back-cushion", { x: -1130, y: -1090, w: 320, d: 780, r: 126 }, z + 363, 910, { bevel: 46, tone: "hi", crease: "lo", className: "seat-upholstery" }));
  out.push(slab("seat-side-bolster-left", { x: -1150, y: -1110, w: 400, d: 105, r: 48 }, z + 422, 820, { bevel: 28, tone: "mid" }));
  out.push(slab("seat-side-bolster-right", { x: -1150, y: -395, w: 400, d: 105, r: 48 }, z + 422, 820, { bevel: 28, tone: "mid" }));
  for (const y of [-980, -520]) out.push(cylinder("headrest-support-post", -890, y, 29, z + 1170, 250, { steps: 24, tone: "lo" }));
  out.push(slab("headrest-padded-shell", { x: -950, y: -1040, w: 220, d: 680, r: 118 }, z + 1372, 275, { bevel: 58, tone: "hi", crease: "lo", className: "seat-upholstery" }));

  out.push(slab("seatbelt-retractor-anchor", { x: -1210, y: -1260, w: 140, d: 110, r: 22 }, z + 610, 240, { bevel: 28, tone: "lo" }));
  out.push(cylinder("seatbelt-buckle-stalk", -540, -255, 42, z + 315, 240, { steps: 24, tone: "mid" }));
  out.push(slab("seatbelt-buckle", { x: -565, y: -286, w: 132, d: 72, r: 18 }, z + 548, 64, { bevel: 16, tone: "hi" }));

  const torsoZ = FLOOR_Z + 900;
  out.push(cylinder("driver-pelvis", DRIVER.centerXmm, DRIVER.centerYmm, 335, FLOOR_Z + 350, 360, { steps: 40, bevel: 55, tone: "mid" }));
  out.push(cylinder("driver-torso", DRIVER.centerXmm + 18, DRIVER.centerYmm, 365, FLOOR_Z + 690, 590, { steps: 44, bevel: 68, tone: "hi", crease: "lo", className: "driver-garment" }));
  out.push(slab("driver-shoulder-shell", { x: DRIVER.centerXmm - 210, y: DRIVER.centerYmm - 500, w: 420, d: 1000, r: 195 }, FLOOR_Z + 1180, 180, { bevel: 62, tone: "hi", crease: "lo", className: "driver-garment" }));
  out.push(cylinder("driver-neck", DRIVER.centerXmm + 36, DRIVER.centerYmm, 136, FLOOR_Z + 1265, 290, { steps: 36, bevel: 24, tone: "mid" }));
  const head = [DRIVER.centerXmm, DRIVER.centerYmm, DRIVER.centerZmm];
  out.push(solid("driver-head-shell", G.sphereOf(head, 220, P, { steps: 48 }), { tone: "hi", crease: "lo", className: "driver-head" }));
  const eyeWhites = [];
  const eyeIrises = [];
  for (const side of [-1, 1]) {
    out.push(solid("driver-ear", G.sphereOf([head[0] - 20, head[1] + side * 210, head[2] - 15], 68, P, { steps: 28 }), { tone: "mid", crease: "lo" }));
    eyeWhites.push(solid("eye-sclera", G.sphereOf([DRIVER.eyeXmm, DRIVER.eyeYmm + side * DRIVER.halfEyeSpacingMm, DRIVER.eyeZmm], 43, P, { steps: 28 }), { tone: "hi", crease: "mid" }));
    eyeIrises.push(solid("eye-iris-base", G.sphereOf([DRIVER.eyeXmm + 29, DRIVER.eyeYmm + side * DRIVER.halfEyeSpacingMm, DRIVER.eyeZmm], 21, P, { steps: 24 }), { tone: "lo", crease: "faint" }));
  }
  out.push(k.groupSvg(eyeWhites, { "data-eye-whites": "" }));
  out.push(k.groupSvg(eyeIrises, { "data-eye-irises": "" }));
  out.push(solid("driver-nose", G.sphereOf([DRIVER.eyeXmm + 30, DRIVER.eyeYmm, DRIVER.eyeZmm - 52], 43, P, { steps: 28 }), { tone: "mid", crease: "faint" }));
  out.push(rodBetween("driver-left-upper-arm", [-560, -1040, FLOOR_Z + 1180], [-60, -1040, FLOOR_Z + 1080], 118, { tone: "hi" }));
  out.push(rodBetween("driver-left-forearm", [-60, -1040, FLOOR_Z + 1080], [270, -950, FLOOR_Z + 850], 92, { tone: "mid" }));
  out.push(rodBetween("driver-right-upper-arm", [-560, -400, FLOOR_Z + 1180], [-60, -400, FLOOR_Z + 1080], 118, { tone: "hi" }));
  out.push(rodBetween("driver-right-forearm", [-60, -400, FLOOR_Z + 1080], [270, -490, FLOOR_Z + 850], 92, { tone: "mid" }));
  out.push(solid("driver-left-hand", G.sphereOf([270, -950, FLOOR_Z + 850], 80, P, { steps: 28 }), { tone: "hi", crease: "lo" }));
  out.push(solid("driver-right-hand", G.sphereOf([270, -490, FLOOR_Z + 850], 80, P, { steps: 28 }), { tone: "hi", crease: "lo" }));

  const eyePupilX = DRIVER.eyeXmm + DRIVER.eyePupilOffsetMm;
  const eyeA = at([eyePupilX, DRIVER.eyeYmm - DRIVER.halfEyeSpacingMm, DRIVER.eyeZmm]);
  const eyeB = at([eyePupilX, DRIVER.eyeYmm + DRIVER.halfEyeSpacingMm, DRIVER.eyeZmm]);
  out.push(`<g data-eye-pupils><circle class="eye-pupil" cx="${eyeA[0]}" cy="${eyeA[1]}" r="2.8"/><circle class="eye-pupil" cx="${eyeB[0]}" cy="${eyeB[1]}" r="2.8"/></g>`);
  out.push(`<g data-eyelids hidden>${[
    [[eyePupilX + 4, DRIVER.eyeYmm - DRIVER.halfEyeSpacingMm - 28, DRIVER.eyeZmm], [eyePupilX + 7, DRIVER.eyeYmm - DRIVER.halfEyeSpacingMm + 28, DRIVER.eyeZmm]],
    [[eyePupilX + 4, DRIVER.eyeYmm + DRIVER.halfEyeSpacingMm - 28, DRIVER.eyeZmm], [eyePupilX + 7, DRIVER.eyeYmm + DRIVER.halfEyeSpacingMm + 28, DRIVER.eyeZmm]],
  ].map((pair) => `<path d="${path3(pair)}"/>`).join("")}</g>`);
  return k.groupSvg(out, { id: "seat-and-driver", class: "seat-and-driver" });
}

function cameraAssembly() {
  const out = [];
  const x = CAMERA.xMm;
  const y = CAMERA.yMm;
  const z = CAMERA.zMm;
  const mount = { x: x - 160, y: y - 154, w: 320, d: 308, r: 38 };
  out.push(slab("dms-camera-mount-pad", mount, z - 70, 64, { bevel: 14, tone: "lo" }));
  out.push(slab("dms-camera-pedestal", { x: x - 110, y: y - 102, w: 220, d: 204, r: 30 }, z - 12, 165, { bevel: 23, tone: "mid" }));
  out.push(slab("dms-camera-housing", { x: x - 180, y: y - 172, w: 360, d: 344, r: 62 }, z + 110, 220, { bevel: 36, tone: "hi", crease: "lo" }));
  const frame = G.frameAlong([x - 145, y, z + 226], [-1, 0, 0]);
  out.push(lathe("dms-lens-barrel", [[0, 98], [18, 120], [105, 120], [126, 102], [126, 79], [0, 79]], frame, { tone: "mid", crease: "lo", steps: 48 }));
  out.push(roundBand("dms-lens-retaining-ring", 112, 136, 85, 119, frame, { tone: "lo", crease: "mid", steps: 48 }));
  const glassFrame = G.frameAlong([x - 285, y, z + 226], [-1, 0, 0]);
  out.push(G.disc(0, 8, 86, glassFrame, P, { tone: "lit", crease: "hi", steps: 48 }).fill && solid("dms-optical-glass", G.disc(0, 8, 86, glassFrame, P, { tone: "lit", crease: "hi", steps: 48 }), { tone: "lit", lit: true, crease: "hi" }));
  for (const yy of [-130, 130]) {
    out.push(solid("dms-ir-emitter", G.sphereOf([x - 263, y + yy, z + 226], 22, P, { steps: 24 }), { tone: "mid", crease: "lo" }));
    out.push(cylinder("dms-housing-fastener", x + 25, y + yy, 15, z + 325, 10, { steps: 20, tone: "lo", crease: "none" }));
  }
  out.push(cylinder("dms-status-led", x + 35, y, 18, z + 333, 8, { steps: 20, tone: "hi", crease: "none" }));

  const coverFrame = G.frameAlong([x - 302, y, z + 226], [-1, 0, 0]);
  const cover = [];
  cover.push(solid("dms-lens-cover-disc", G.disc(0, 22, 105, coverFrame, P, { tone: "lo", crease: "mid", steps: 48 }), { tone: "lo", crease: "mid" }));
  cover.push(rodBetween("dms-cover-hinge-arm", [x - 284, y + 102, z + 226], [x - 264, y + 187, z + 292], 18, { tone: "mid" }));
  cover.push(cylinder("dms-cover-thumb-tab", x - 255, y + 187, 27, z + 282, 24, { steps: 24, tone: "hi", crease: "lo" }));
  out.push(k.groupSvg(cover, { class: "lens-cover", "data-scenario-object": "occluded", hidden: true }));

  for (const side of [-1, 1]) {
    out.push(rodBetween("dms-bracket-cheek", [x - 100, y + side * 142, z + 20], [x + 70, y + side * 142, z + 55], 20, { tone: "lo" }));
    out.push(cylinder("dms-bracket-pivot", x - 15, y + side * 150, 31, z + 21, 18, { steps: 24, tone: "hi", crease: "lo" }));
  }
  return out.join("");
}

function viewCone() {
  const origin = [
    CAMERA.xMm + CAMERA.lensOffsetMm[0],
    CAMERA.yMm + CAMERA.lensOffsetMm[1],
    CAMERA.zMm + CAMERA.lensOffsetMm[2],
  ];
  const x = DRIVER.eyeXmm;
  const w = 490;
  const z0 = DRIVER.eyeZmm - 380;
  const z1 = DRIVER.eyeZmm + 380;
  const plane = [[x, DRIVER.eyeYmm - w, z0], [x, DRIVER.eyeYmm + w, z0], [x, DRIVER.eyeYmm + w, z1], [x, DRIVER.eyeYmm - w, z1]];
  const target = [DRIVER.eyeXmm + DRIVER.eyePupilOffsetMm, DRIVER.eyeYmm, DRIVER.eyeZmm];
  return [
    face([origin, plane[0], plane[1]], "dms-view-wash"),
    face([origin, plane[1], plane[2]], "dms-view-wash"),
    face([origin, plane[2], plane[3]], "dms-view-wash"),
    face([origin, plane[3], plane[0]], "dms-view-wash"),
    line([origin, plane[0]], { tone: "green", className: "dms-view-edge" }),
    line([origin, plane[1]], { tone: "green", className: "dms-view-edge" }),
    line([origin, plane[2]], { tone: "green", className: "dms-view-edge" }),
    line([origin, plane[3]], { tone: "green", className: "dms-view-edge" }),
    `<path data-gaze-line class="dms-gaze-line" d="${path3([target, [target[0] + 490, target[1], target[2]]])}"/>`,
  ].join("");
}

function controlConsole() {
  const out = [];
  out.push(slab("diagnostic-console-foot", CONSOLE, FLOOR_Z, 90, { bevel: 19, tone: "lo" }));
  for (const [x, y] of [[-2320, 470], [-760, 470], [-2320, 1880], [-760, 1880]]) out.push(cylinder("diagnostic-console-isolator", x, y, 54, FLOOR_Z + 90, 88, { steps: 28, tone: "mid" }));
  out.push(slab("diagnostic-console-shell", { ...CONSOLE, x: CONSOLE.x + 40, y: CONSOLE.y + 45, w: CONSOLE.w - 80, d: CONSOLE.d - 90, r: 84 }, FLOOR_Z + 176, 295, { bevel: 32, tone: "mid", crease: "lo" }));
  out.push(slab("diagnostic-console-deck", { ...CONSOLE, x: CONSOLE.x + 96, y: CONSOLE.y + 102, w: CONSOLE.w - 192, d: CONSOLE.d - 204, r: 58 }, FLOOR_Z + 464, 53, { bevel: 13, tone: "hi", crease: "faint" }));
  out.push(slab("diagnostic-screen-bezel", { x: SCREEN.x - 28, y: SCREEN.y - 28, w: SCREEN.w + 56, d: SCREEN.d + 56, r: 42 }, SCREEN.z - 20, 30, { bevel: 10, tone: "lo" }));
  out.push(slab("diagnostic-screen-glass", SCREEN, SCREEN.z + 12, 4, { bevel: 1, tone: "hi", crease: "none", className: "console-glass" }));
  const screenOrigin = k.topMatrix([SCREEN.x + 70, SCREEN.y + 58], SCREEN.z + 18, P);
  out.push(`<g class="dms-screen" transform="${screenOrigin}" aria-hidden="true">
    <rect class="dms-screen-bg" width="1400" height="800" rx="30"/>
    <path class="dms-screen-rule" d="M56 176H1340M56 625H1340"/>
    <rect class="dms-face-box" data-face-box x="550" y="220" width="280" height="310" rx="48"/>
    <path class="dms-screen-eyes" data-screen-eyes d="M605 356Q640 320 678 356M715 356Q752 320 788 356"/>
    <path class="dms-screen-mouth" d="M674 432Q698 449 724 432"/>
    <text class="dms-screen-title" x="62" y="126">DRIVER MONITOR</text>
    <text class="dms-screen-status" data-screen-status x="65" y="330">FACE IN VIEW</text>
    <text class="dms-screen-distance" data-screen-distance x="65" y="520">1.1 m</text>
    <circle class="dms-screen-led" data-screen-led cx="94" cy="710" r="20"/>
    <text class="dms-screen-validity" data-screen-validity x="143" y="729">SENSOR VALID</text>
  </g>`);
  for (const x of [-1480, -1230]) {
    out.push(cylinder("diagnostic-control-bushing", x, 930, 76, FLOOR_Z + 517, 13, { steps: 32, tone: "lo" }));
    out.push(cylinder("diagnostic-control-knob", x, 930, 55, FLOOR_Z + 530, 55, { steps: 32, bevel: 6, tone: "hi" }));
  }
  for (const x of [-960, -850, -740]) out.push(cylinder("diagnostic-function-button", x, 930, 33, FLOOR_Z + 517, 24, { steps: 24, tone: "mid", crease: "none" }));
  out.push(slab("vision-controller-case", { x: -2260, y: 620, w: 700, d: 220, r: 24 }, FLOOR_Z + 518, 76, { bevel: 15, tone: "lo", crease: "mid" }));
  for (let index = 0; index < 5; index++) out.push(slab("vision-controller-cooling-fin", { x: -2150 + index * 120, y: 635, w: 54, d: 190, r: 16 }, FLOOR_Z + 594, 34, { bevel: 8, tone: "mid", crease: "lo" }));
  const connector = { x: -2350, y: 520, w: 170, d: 88, r: 16 };
  out.push(slab("console-data-connector", connector, FLOOR_Z + 518, 55, { bevel: 12, tone: "mid" }));
  for (let pin = 0; pin < 5; pin++) out.push(cylinder("console-connector-contact", -2330 + pin * 27, 560, 7, FLOOR_Z + 575, 4, { steps: 16, tone: "hi", crease: "none" }));
  return out.join("");
}

function buildFigure() {
  const body = [platform(), cockpit(), viewCone(), seatTracks(), seatAndDriver(), cameraAssembly(), controlConsole()].join("");
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: "驾驶员监测 DMS 座舱切面：座椅滑轨、驾驶员模型、方向盘、仪表台、近红外相机和监测控制台",
    body,
    className: "dms-cabin-figure",
  });
}

function controls() {
  const buttons = Object.entries(SCENARIOS).map(([id, item], index) =>
    `<button type="button" class="scenario-button" data-scenario="${id}" aria-pressed="${index === 0 ? "true" : "false"}"><span class="scenario-index">0${index + 1}</span><span><b>${item.label}</b><small>${item.detail}</small></span></button>`
  ).join("");
  return `<div class="dms-controls">
    <div class="scenario-control"><div class="control-heading"><span>INPUT LABEL</span><small>切换模型输入状态</small></div><div class="scenario-buttons">${buttons}</div></div>
    <div class="control-divider"></div>
    <div class="live-controls">
      <label class="seat-control" for="seat-position"><span><b>座椅前后位置</b><small>改变眼睛相对相机的几何位置</small></span><input id="seat-position" type="range" min="${GEOMETRY.seat.travelMm.min}" max="${GEOMETRY.seat.travelMm.max}" step="5" value="${GEOMETRY.seat.travelMm.initial}"><output id="seat-value">0 mm</output></label>
      <div class="distance-readout"><span>相机到眼睛</span><strong id="camera-distance">1.1 m</strong><small id="camera-context">位于教学示意范围内</small></div>
      <button type="button" class="reset-button" id="reset-model">重置状态</button>
      <div class="model-note">镜头距离范围仅为教学布置参数；状态按钮直接指定标签，不执行疲劳、分心或人脸检测算法。</div>
    </div>
  </div>`;
}

function buildPage() {
  const figure = k.plateHtml({
    fig: "Fig 04",
    title: "DMS / DRIVER MONITOR",
    hint: "选择输入标签 · 调节座椅滑轨",
    readout: "FACE IN VIEW · 1.1 m",
    keys: [
      { mark: "raised", label: "座椅、驾驶员与前舱实体" },
      { mark: "lit", label: "DMS 镜头与近红外补光" },
      { mark: "green", label: "相机视场和眼睛注视方向" },
    ],
    caption: "座椅移动改变眼睛到相机的几何距离。按钮代表已知输入标签；镜头遮挡会把传感器状态标为无效，页面不模拟量产算法或告警时序。",
    body: `<div class="iso-stage dms-stage" aria-label="DMS 驾驶员监测试验台"><div class="dms-svg-wrap">${buildFigure()}</div></div>${controls()}`,
  });
  const css = readFileSync(join(HERE, "figure.css"), "utf8");
  const live = readFileSync(join(HERE, "live.js"), "utf8")
    .replace("__MODEL__", JSON.stringify({ GEOMETRY, SCENARIOS, projection: P, initial: INITIAL }))
    .replace("__OBSERVATION__", observation.toString());
  let page = k.pageHtml({ title: "驾驶员监测 DMS 座舱试验台 · 交互式 3D 展示", theme: "light", width: 1120, body: `<style>${css}</style>${figure}`, script: live });
  page = page.replace('<html lang="en">', '<html lang="zh-CN">');
  page = page.replace("</head>", '<meta name="color-scheme" content="light">\n</head>');
  return page;
}

const page = buildPage();
assert.ok(solids.length >= 80 && solids.length <= 150, `Hero parts must be 80–150; got ${solids.length}`);
assert.equal(new Set(solids).size, solids.length, "Every solid needs a distinct part name");
assert.equal(CAMERA.zMm - 70, FLOOR_Z + 1225, "camera mount pad must land on the instrument panel top");
assert.equal(SCREEN.z - 20, FLOOR_Z + 517, "diagnostic screen bezel must sit on the console deck");
const consoleDeck = { x: CONSOLE.x + 96, y: CONSOLE.y + 102, w: CONSOLE.w - 192, d: CONSOLE.d - 204 };
assert.ok(SCREEN.x - 28 >= consoleDeck.x && SCREEN.x + SCREEN.w + 28 <= consoleDeck.x + consoleDeck.w, "screen bezel must fit on the console deck");
assert.ok(SCREEN.y - 28 >= consoleDeck.y && SCREEN.y + SCREEN.d + 28 <= consoleDeck.y + consoleDeck.d, "screen bezel must fit on the console deck");
for (const scenarioId of Object.keys(SCENARIOS)) {
  for (const seat of [GEOMETRY.seat.travelMm.min, 0, GEOMETRY.seat.travelMm.max]) {
    const state = observation(seat, scenarioId);
    assert.ok(Number.isFinite(state.cameraDistanceMm) && state.cameraDistanceMm > 0, `${scenarioId} camera distance must be finite`);
    assert.equal(state.seatOffsetMm, seat, "seat position must clamp to allowed travel");
  }
}
assert.ok(Math.abs(INITIAL.cameraDistanceMm - 1100) < 20, `initial camera-to-eye distance should be about 1.10 m; got ${INITIAL.cameraDistanceMm.toFixed(1)} mm`);
assert.equal(observation(GEOMETRY.seat.travelMm.min - 50, "attentive").seatOffsetMm, GEOMETRY.seat.travelMm.min, "seat offset must clamp low");
assert.equal(observation(GEOMETRY.seat.travelMm.max + 50, "attentive").seatOffsetMm, GEOMETRY.seat.travelMm.max, "seat offset must clamp high");

if (process.argv.includes("--verify")) {
  const existing = readFileSync(OUTPUT, "utf8");
  if (existing !== page) throw new Error("Generated DMS cabin page is stale; run npm run model:dms-cabin");
  console.log(`verified ${OUTPUT} · ${solids.length} solids · ${Object.keys(SCENARIOS).length} scenarios`);
} else {
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, page);
  console.log(`wrote ${OUTPUT} · ${(page.length / 1024).toFixed(0)} KB · ${solids.length} solids · ${Object.keys(SCENARIOS).length} scenarios`);
}

if (process.argv.includes("--audit")) {
  const seats = [GEOMETRY.seat.travelMm.min, 0, GEOMETRY.seat.travelMm.max];
  const summary = seats.map((seat) => `${seat} mm → ${(observation(seat, "attentive").cameraDistanceMm / 1000).toFixed(2)} m`).join(" · ");
  console.log(`geometry checks passed · camera distance ${summary}`);
}
