import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../vehicle-vision-anatomy/vendor/anatomy/kit/iso-kit.mjs";
import * as G from "../vehicle-vision-anatomy/vendor/anatomy/kit/lathe.mjs";
import { GEOMETRY, SCENARIOS, observation } from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUTPUT = join(ROOT, "docs/public/vehicle-vision-oms-cabin.html");
const WIDTH = 1040;
const HEIGHT = 660;
const AZIMUTH = 220;
const ELEVATION = 31;
const FLOOR_Z = GEOMETRY.cabin.floorZmm;
const BASE = { x: GEOMETRY.base.xMm, y: GEOMETRY.base.yMm, w: GEOMETRY.base.widthMm, d: GEOMETRY.base.depthMm, r: 150 };
const SEAT_X = GEOMETRY.seat.centerXmm;
const CONSOLE = { x: -3120, y: -1090, w: 1840, d: 1120, r: 100 };
const SCREEN = { x: CONSOLE.x + 120, y: CONSOLE.y + 122, w: 1450, d: 740, z: FLOOR_Z + 514 };
const EXTENTS = [
  ...k.boxCorners(BASE, -220, 155),
  ...k.boxCorners({ x: -1650, y: -1760, w: 2750, d: 3520, r: 90 }, FLOOR_Z, 1850),
  ...k.boxCorners(CONSOLE, FLOOR_Z, 990),
  [GEOMETRY.sensor.xMm - 240, -1700, 2620],
  [GEOMETRY.sensor.xMm + 220, 1700, FLOOR_Z - 30],
];
const P = k.fitProjection(EXTENTS, WIDTH, HEIGHT, { pad: 28, headroom: 9, azimuth: AZIMUTH, elevation: ELEVATION });
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
  const end = Math.min(radius * 0.35, length * 0.12);
  return lathe(name, [[0, radius * 0.75], [end, radius], [length - end, radius], [length, radius * 0.75]], G.frameAlong(a, axis), { tone: "mid", crease: "lo", ...options });
};

function platform() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -220, 150, P)}"/>`];
  for (const [x, y] of k.corners(BASE, 360)) {
    out.push(cylinder("rig-foot-pad", x, y, 150, -220, 34, { steps: 32, tone: "lo", crease: "mid" }));
    out.push(cylinder("rig-leveling-stem", x, y, 78, -186, 142, { steps: 28, tone: "mid", crease: "lo" }));
    out.push(cylinder("rig-lock-collar", x, y, 104, -48, 26, { steps: 32, tone: "hi", crease: "lo" }));
  }
  out.push(slab("lower-test-frame", BASE, -2, 54, { bevel: 10, tone: "mid", crease: "lo" }));
  out.push(slab("cabin-floor-deck", { ...BASE, x: BASE.x + 48, y: BASE.y + 48, w: BASE.w - 96, d: BASE.d - 96, r: 120 }, 52, 98, { bevel: 9, tone: "hi", crease: "lo" }));
  out.push(slab("floor-edge-trim", { ...BASE, x: BASE.x + 115, y: BASE.y + 115, w: BASE.w - 230, d: BASE.d - 230, r: 92 }, FLOOR_Z, 7, { bevel: 2, tone: "lo", crease: "none" }));

  const boltPoints = k.corners(BASE, 210);
  out.push(k.lineSvg(boltPoints.map(([x, y]) => k.ring(x, y, 27, 151, P, 20)).join(""), { tone: "mid" }));
  out.push(k.dotsSvg(boltPoints.map(([x, y]) => at([x, y, 151])), { size: 1.15, tone: "lo" }));
  const hatch = { x: 1780, y: -2210, w: 940, d: 690, r: 42 };
  out.push(slab("floor-service-hatch", hatch, FLOOR_Z + 5, 13, { bevel: 4, tone: "mid" }));
  out.push(k.lineSvg(k.planOutline(k.insetPlan(hatch, 34), FLOOR_Z + 19, P, 7), { tone: "faint" }));
  return out.join("");
}

function seatRails() {
  const out = [];
  for (const zone of GEOMETRY.zones) {
    for (const side of [-1, 1]) {
      const rail = { x: -1530, y: zone.yMm + side * 292 - 42, w: 2380, d: 84, r: 24 };
      out.push(slab("seat-longitudinal-guide", rail, FLOOR_Z + 10, 48, { bevel: 11, tone: "lo", crease: "mid" }));
      out.push(k.lineSvg(k.planOutline(k.insetPlan(rail, 15), FLOOR_Z + 59, P, 5), { tone: "faint" }));
    }
  }
  return out.join("");
}

function seatAssembly(zone) {
  const out = [];
  const y = zone.yMm;
  const z0 = FLOOR_Z + 58;
  for (const side of [-1, 1]) {
    const railY = y + side * 292;
    out.push(slab("seat-rail-slider", { x: -1050, y: railY - 62, w: 760, d: 124, r: 25 }, z0, 52, { bevel: 12, tone: "mid" }));
    out.push(cylinder("seat-height-pivot", -820, railY, 36, z0 + 52, 22, { steps: 24, tone: "hi", crease: "lo" }));
  }
  out.push(slab("seat-pan-frame", { x: -585, y: y - 405, w: 890, d: 810, r: 138 }, FLOOR_Z + 286, 150, { bevel: 30, tone: "mid" }));
  out.push(slab("seat-cushion", { x: -625, y: y - 398, w: 870, d: 796, r: 160 }, FLOOR_Z + 426, 48, { bevel: 30, tone: "hi", crease: "lo", className: "seat-upholstery" }));
  for (const side of [-1, 1]) {
    out.push(slab("seat-cushion-side-bolster", { x: -575, y: y + side * 320 - 74, w: 655, d: 148, r: 65 }, FLOOR_Z + 455, 70, { bevel: 24, tone: "mid" }));
  }

  out.push(slab("seat-back-frame", { x: -705, y: y - 385, w: 245, d: 770, r: 94 }, FLOOR_Z + 570, 750, { bevel: 38, tone: "lo", crease: "mid" }));
  out.push(slab("seat-back-cushion", { x: -678, y: y - 358, w: 204, d: 716, r: 88 }, FLOOR_Z + 625, 676, { bevel: 35, tone: "hi", crease: "lo", className: "seat-upholstery" }));
  for (const side of [-1, 1]) {
    out.push(slab("seat-back-side-bolster", { x: -695, y: y + side * 297 - 61, w: 245, d: 122, r: 48 }, FLOOR_Z + 684, 565, { bevel: 25, tone: "mid" }));
  }
  out.push(cylinder("headrest-support-post", -565, y, 25, FLOOR_Z + 1225, 250, { steps: 22, tone: "lo" }));
  out.push(slab("headrest-padded-shell", { x: -640, y: y - 285, w: 200, d: 570, r: 96 }, FLOOR_Z + 1440, 190, { bevel: 38, tone: "hi", crease: "lo", className: "seat-upholstery" }));
  out.push(cylinder("belt-buckle-stalk", -120, y + 320, 28, FLOOR_Z + 485, 165, { steps: 22, tone: "mid" }));
  out.push(slab("belt-buckle", { x: -155, y: y + 282, w: 110, d: 72, r: 17 }, FLOOR_Z + 633, 38, { bevel: 10, tone: "hi" }));

  const zonePlan = { x: -1010, y: y - 445, w: 1510, d: 890, r: 28 };
  out.push(k.lineSvg(k.planOutline(zonePlan, FLOOR_Z + 9, P, 6), { tone: "green", className: `oms-zone-boundary oms-zone-${zone.id}` }));
  const marker = k.topMatrix([-940, y - 395], FLOOR_Z + 10, P);
  out.push(`<g class="zone-marker oms-zone-${zone.id}" data-zone-marker="${zone.id}" transform="${marker}" aria-hidden="true"><rect x="0" y="0" width="176" height="82" rx="14"/><text x="22" y="55">${zone.code}</text><circle cx="148" cy="42" r="12"/></g>`);
  return k.groupSvg(out, { class: `seat-assembly seat-${zone.id}`, "data-seat-zone": zone.id });
}

function seating() {
  const out = [seatRails()];
  for (const zone of GEOMETRY.zones) out.push(seatAssembly(zone));
  return out.join("");
}

function gantryAndSensor() {
  const out = [];
  const x = GEOMETRY.sensor.xMm;
  for (const side of [-1, 1]) {
    const y = side * 1640;
    out.push(slab("gantry-foot-plate", { x: x - 148, y: y - 136, w: 296, d: 272, r: 35 }, FLOOR_Z + 2, 40, { bevel: 10, tone: "lo" }));
    out.push(slab("gantry-upright", { x: x - 78, y: y - 63, w: 156, d: 126, r: 23 }, FLOOR_Z + 38, 2220, { bevel: 18, tone: "mid", crease: "lo" }));
    out.push(slab("gantry-gusset", { x: x - 122, y: y - 100, w: 246, d: 200, r: 32 }, FLOOR_Z + 2050, 180, { bevel: 24, tone: "lo" }));
  }
  const beam = { x: x - 124, y: -1740, w: 248, d: 3480, r: 72 };
  out.push(slab("sensor-crossbeam", beam, FLOOR_Z + 2220, 175, { bevel: 30, tone: "mid", crease: "lo" }));
  out.push(slab("beam-cap", { x: beam.x + 18, y: beam.y + 36, w: beam.w - 36, d: beam.d - 72, r: 52 }, FLOOR_Z + 2392, 38, { bevel: 14, tone: "hi" }));

  const z = GEOMETRY.sensor.zMm;
  const mount = { x: x - 200, y: -186, w: 400, d: 372, r: 48 };
  out.push(slab("oms-camera-mount-pad", mount, z - 180, 64, { bevel: 15, tone: "lo" }));
  out.push(slab("oms-camera-gimbal", { x: x - 142, y: -128, w: 284, d: 256, r: 44 }, z - 115, 110, { bevel: 21, tone: "hi", crease: "lo" }));
  out.push(slab("oms-camera-housing", { x: x - 185, y: -166, w: 370, d: 332, r: 62 }, z - 50, 153, { bevel: 34, tone: "mid", crease: "lo" }));

  const lensFrame = G.frameAlong([x, 0, z - 53], [0, 0, -1]);
  out.push(lathe("oms-lens-barrel", [[0, 70], [12, 88], [92, 88], [108, 73], [108, 61], [0, 61]], lensFrame, { tone: "lo", crease: "mid", steps: 44 }));
  out.push(roundBand("oms-lens-retaining-ring", 86, 111, 64, 91, lensFrame, { tone: "hi", crease: "lo", steps: 44 }));
  const lensFrameFace = G.frameAlong([x, 0, z - 168], [0, 0, -1]);
  out.push(solid("oms-optical-glass", G.disc(0, 8, 67, lensFrameFace, P, { tone: "lit", crease: "hi", steps: 44 }), { tone: "lit", lit: true, crease: "hi" }));
  for (const side of [-1, 1]) {
    out.push(solid("oms-ir-illuminator", G.sphereOf([x + side * 136, 0, z - 142], 24, P, { steps: 24 }), { tone: "hi", crease: "lo", className: "oms-ir-lamp" }));
  }
  out.push(cylinder("oms-status-led", x, 112, 18, z + 92, 8, { steps: 20, tone: "hi", crease: "none", className: "oms-status-solid" }));
  const coverFrame = G.frameAlong([x, 0, z - 171], [0, 0, -1]);
  const cover = solid("oms-lens-cover", G.disc(0, 20, 98, coverFrame, P, { tone: "lo", crease: "mid", steps: 44 }), { tone: "lo", crease: "mid" });
  const coverArm = rodBetween("oms-cover-hinge", [x + 72, 0, z - 176], [x + 148, 58, z - 122], 14, { tone: "mid" });
  const coverTab = cylinder("oms-cover-thumb-tab", x + 146, 58, 23, z - 138, 25, { steps: 20, tone: "hi", crease: "lo" });
  out.push(k.groupSvg([cover, coverArm, coverTab], { class: "oms-camera-cover", "data-scenario-object": "cameraFault", hidden: true }));

  for (const zone of GEOMETRY.zones) {
    const zoneCorners = [
      [x, -12, z - 168], [zone.xMm + 220, zone.yMm - 430, FLOOR_Z + 665],
      [zone.xMm + 220, zone.yMm + 430, FLOOR_Z + 665],
    ];
    out.push(face(zoneCorners, "oms-view-wash", `data-view-zone="${zone.id}"`));
    out.push(line([zoneCorners[0], zoneCorners[1]], { tone: "green", className: `oms-view-edge oms-view-${zone.id}` }));
    out.push(line([zoneCorners[0], zoneCorners[2]], { tone: "green", className: `oms-view-edge oms-view-${zone.id}` }));
  }
  return out.join("");
}

function adultSample() {
  const out = [];
  const y = 0;
  out.push(cylinder("adult-pelvis", -105, y, 176, FLOOR_Z + 455, 200, { steps: 36, bevel: 28, tone: "mid", className: "sample-adult-solid" }));
  out.push(cylinder("adult-torso", -95, y, 205, FLOOR_Z + 650, 590, { steps: 40, bevel: 52, tone: "hi", crease: "lo", className: "sample-adult-solid" }));
  out.push(cylinder("adult-neck", -85, y, 76, FLOOR_Z + 1210, 210, { steps: 32, bevel: 14, tone: "mid", className: "sample-adult-solid" }));
  out.push(solid("adult-head", G.sphereOf([-85, y, GEOMETRY.seat.adultHeadZmm], 144, P, { steps: 40 }), { tone: "hi", crease: "lo", className: "sample-adult-solid" }));
  for (const side of [-1, 1]) {
    out.push(solid("adult-ear", G.sphereOf([-72, side * 139, GEOMETRY.seat.adultHeadZmm - 12], 29, P, { steps: 20 }), { tone: "mid", crease: "lo", className: "sample-adult-solid" }));
    out.push(rodBetween("adult-upper-arm", [-75, side * 160, FLOOR_Z + 1178], [30, side * 228, FLOOR_Z + 1020], 68, { tone: "hi", className: "sample-adult-solid" }));
    out.push(rodBetween("adult-forearm", [30, side * 228, FLOOR_Z + 1020], [110, side * 264, FLOOR_Z + 776], 54, { tone: "mid", className: "sample-adult-solid" }));
    out.push(solid("adult-hand", G.sphereOf([110, side * 264, FLOOR_Z + 760], 49, P, { steps: 22 }), { tone: "hi", crease: "lo", className: "sample-adult-solid" }));
  }
  return k.groupSvg(out, { class: "oms-sample oms-sample-adult", "data-scenario-object": "adult", hidden: true });
}

function childSeatSample() {
  const out = [];
  const y = 0;
  out.push(slab("child-seat-base", { x: -570, y: -330, w: 760, d: 660, r: 150 }, FLOOR_Z + 486, 118, { bevel: 32, tone: "lo", className: "sample-child-solid" }));
  out.push(slab("child-seat-shell", { x: -655, y: -295, w: 360, d: 590, r: 160 }, FLOOR_Z + 590, 590, { bevel: 54, tone: "hi", crease: "lo", className: "sample-child-solid" }));
  for (const side of [-1, 1]) {
    out.push(slab("child-seat-side-wing", { x: -610, y: side * 226 - 67, w: 440, d: 134, r: 58 }, FLOOR_Z + 765, 390, { bevel: 34, tone: "mid", className: "sample-child-solid" }));
    out.push(rodBetween("child-seat-handle", [-528, side * 250, FLOOR_Z + 1100], [-362, side * 250, FLOOR_Z + 1430], 21, { tone: "lo", className: "sample-child-solid" }));
    out.push(rodBetween("child-seat-harness", [-352, side * 190, FLOOR_Z + 1110], [-205, side * 78, FLOOR_Z + 758], 20, { tone: "mid", className: "sample-child-solid" }));
  }
  out.push(slab("child-seat-buckle", { x: -235, y: -48, w: 70, d: 96, r: 18 }, FLOOR_Z + 755, 44, { bevel: 12, tone: "hi", className: "sample-child-solid" }));
  out.push(solid("child-head", G.sphereOf([-248, 0, GEOMETRY.seat.childHeadZmm], 112, P, { steps: 34 }), { tone: "hi", crease: "lo", className: "sample-child-solid" }));
  out.push(cylinder("child-torso", -250, 0, 118, FLOOR_Z + 750, 292, { steps: 32, bevel: 25, tone: "mid", className: "sample-child-solid" }));
  for (const side of [-1, 1]) out.push(rodBetween("child-arm", [-250, side * 88, FLOOR_Z + 1008], [-92, side * 150, FLOOR_Z + 890], 34, { tone: "hi", className: "sample-child-solid" }));
  return k.groupSvg(out, { class: "oms-sample oms-sample-child", "data-scenario-object": "childSeat", hidden: true });
}

function bagSample() {
  const out = [];
  out.push(slab("bag-main-body", { x: -410, y: -250, w: 490, d: 500, r: 88 }, FLOOR_Z + 650, 345, { bevel: 38, tone: "mid", crease: "lo", className: "sample-bag-solid" }));
  out.push(slab("bag-front-pocket", { x: 28, y: -172, w: 86, d: 344, r: 34 }, FLOOR_Z + 742, 166, { bevel: 22, tone: "hi", className: "sample-bag-solid" }));
  out.push(rodBetween("bag-carry-handle", [-300, -88, FLOOR_Z + 1010], [-300, 88, FLOOR_Z + 1010], 17, { tone: "lo", className: "sample-bag-solid" }));
  return k.groupSvg(out, { class: "oms-sample oms-sample-bag", "data-scenario-object": "bag", hidden: true });
}

function blanketSample() {
  const out = [];
  out.push(slab("occlusion-blanket", { x: -420, y: -350, w: 720, d: 700, r: 120 }, FLOOR_Z + 652, 92, { bevel: 20, tone: "hi", crease: "lo", className: "sample-blanket-solid" }));
  for (const side of [-1, 1]) {
    out.push(slab("blanket-fold", { x: -370 + (side > 0 ? 300 : 0), y: side * 140 - 42, w: 280, d: 84, r: 38 }, FLOOR_Z + 736, 34, { bevel: 13, tone: "mid", className: "sample-blanket-solid" }));
  }
  out.push(slab("blanket-draped-edge", { x: 245, y: -220, w: 120, d: 440, r: 45 }, FLOOR_Z + 478, 268, { bevel: 24, tone: "lo", className: "sample-blanket-solid" }));
  return k.groupSvg(out, { class: "oms-sample oms-sample-blanket", "data-scenario-object": "blanket", hidden: true });
}

function consoleAssembly() {
  const out = [];
  out.push(slab("diagnostic-console-foot", CONSOLE, FLOOR_Z, 74, { bevel: 18, tone: "lo" }));
  for (const [x, y] of [[CONSOLE.x + 100, CONSOLE.y + 100], [CONSOLE.x + CONSOLE.w - 100, CONSOLE.y + 100], [CONSOLE.x + 100, CONSOLE.y + CONSOLE.d - 100], [CONSOLE.x + CONSOLE.w - 100, CONSOLE.y + CONSOLE.d - 100]]) {
    out.push(cylinder("diagnostic-console-isolator", x, y, 45, FLOOR_Z + 74, 82, { steps: 24, tone: "mid" }));
  }
  out.push(slab("diagnostic-console-shell", { ...CONSOLE, x: CONSOLE.x + 40, y: CONSOLE.y + 44, w: CONSOLE.w - 80, d: CONSOLE.d - 88, r: 82 }, FLOOR_Z + 150, 298, { bevel: 32, tone: "mid", crease: "lo" }));
  out.push(slab("diagnostic-console-deck", { ...CONSOLE, x: CONSOLE.x + 88, y: CONSOLE.y + 92, w: CONSOLE.w - 176, d: CONSOLE.d - 184, r: 60 }, FLOOR_Z + 440, 54, { bevel: 13, tone: "hi", crease: "faint" }));
  out.push(slab("diagnostic-screen-bezel", { x: SCREEN.x - 28, y: SCREEN.y - 28, w: SCREEN.w + 56, d: SCREEN.d + 56, r: 40 }, SCREEN.z - 20, 28, { bevel: 9, tone: "lo" }));
  out.push(slab("diagnostic-screen-glass", SCREEN, SCREEN.z + 10, 4, { bevel: 1, tone: "hi", crease: "none", className: "console-glass" }));
  const screenOrigin = k.topMatrix([SCREEN.x + 64, SCREEN.y + 42], SCREEN.z + 16, P);
  out.push(`<g class="oms-screen" transform="${screenOrigin}" aria-hidden="true">
    <rect class="oms-screen-bg" width="1440" height="650" rx="28"/>
    <path class="oms-screen-rule" d="M42 144H1394M42 596H1394"/>
    <text class="oms-screen-title" x="54" y="100">OCCUPANT MONITOR · INPUT LABELS</text>
    <text class="oms-screen-subtitle" x="54" y="210">SEAT</text><text class="oms-screen-subtitle" x="355" y="210">ASSIGNED STATE</text><text class="oms-screen-subtitle" x="1065" y="210">VALID</text>
    ${GEOMETRY.zones.map((zone, index) => `<g class="oms-screen-row" data-screen-row="${zone.id}" transform="translate(0 ${238 + index * 112})"><rect class="oms-row-bg" x="40" y="0" width="1350" height="90" rx="15"/><circle class="oms-row-led" cx="82" cy="45" r="12"/><text class="oms-row-zone" x="125" y="56">${zone.code} · ${zone.label}</text><text class="oms-row-status" data-screen-status="${zone.id}" x="355" y="56">STANDBY</text><text class="oms-row-valid" data-screen-valid="${zone.id}" x="1065" y="56">YES</text></g>`).join("")}
    <text class="oms-screen-foot" x="54" y="632">TEACHING LABELS ONLY · NO PERCEPTION ALGORITHM</text>
  </g>`);
  for (const [x, radius] of [[CONSOLE.x + 500, 68], [CONSOLE.x + 720, 68]]) {
    out.push(cylinder("diagnostic-control-bushing", x, CONSOLE.y + 930, radius + 18, FLOOR_Z + 494, 14, { steps: 28, tone: "lo" }));
    out.push(cylinder("diagnostic-control-knob", x, CONSOLE.y + 930, radius, FLOOR_Z + 508, 48, { steps: 28, bevel: 6, tone: "hi" }));
  }
  for (const x of [CONSOLE.x + 980, CONSOLE.x + 1110, CONSOLE.x + 1240]) out.push(cylinder("diagnostic-function-button", x, CONSOLE.y + 930, 32, FLOOR_Z + 494, 25, { steps: 22, tone: "mid", crease: "none" }));
  out.push(slab("oms-controller-case", { x: CONSOLE.x + 1330, y: CONSOLE.y + 850, w: 400, d: 150, r: 22 }, FLOOR_Z + 494, 64, { bevel: 14, tone: "lo", crease: "mid" }));
  for (let index = 0; index < 3; index++) out.push(slab("oms-controller-cooling-fin", { x: CONSOLE.x + 1380 + index * 92, y: CONSOLE.y + 868, w: 40, d: 115, r: 12 }, FLOOR_Z + 558, 26, { bevel: 6, tone: "mid", crease: "lo" }));
  const connector = { x: CONSOLE.x + 1390, y: CONSOLE.y + 550, w: 188, d: 88, r: 15 };
  out.push(slab("console-data-connector", connector, FLOOR_Z + 494, 50, { bevel: 10, tone: "mid" }));
  for (let pin = 0; pin < 4; pin++) out.push(cylinder("console-connector-contact", CONSOLE.x + 1415 + pin * 40, CONSOLE.y + 590, 7, FLOOR_Z + 545, 4, { steps: 16, tone: "hi", crease: "none" }));
  return out.join("");
}

function buildFigure() {
  const body = [platform(), gantryAndSensor(), seating(), adultSample(), childSeatSample(), bagSample(), blanketSample(), consoleAssembly()].join("");
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: "OMS 乘员监测多座位试验台：三座后排、顶置相机、座位样本与状态控制台",
    body,
    className: "oms-cabin-figure",
  });
}

function controls() {
  const scenarios = Object.entries(SCENARIOS).map(([id, item], index) =>
    `<button type="button" class="scenario-button" data-scenario="${id}" aria-pressed="${id === GEOMETRY.initial.scenarioId}"><span class="scenario-index">0${index + 1}</span><span><b>${item.label}</b><small>${item.detail}</small></span></button>`
  ).join("");
  const zones = GEOMETRY.zones.map((zone) =>
    `<button type="button" class="zone-button" data-zone="${zone.id}" aria-pressed="${zone.id === GEOMETRY.initial.zoneId}"><b>${zone.label}</b><small>${zone.code}</small></button>`
  ).join("");
  return `<div class="oms-controls">
    <div class="scenario-control"><div class="control-heading"><span>INPUT LABEL</span><small>选择预设教学样本</small></div><div class="scenario-buttons">${scenarios}</div></div>
    <div class="control-divider"></div>
    <div class="live-controls">
      <div class="control-heading"><span>SEAT ZONE</span><small>样本移动到所选区域</small></div><div class="zone-buttons">${zones}</div>
      <div class="distance-readout"><span>镜头到区域参考点</span><strong id="camera-distance">0.88 m</strong><small id="camera-context">示意几何 · 非检测距离阈值</small></div>
      <button type="button" class="reset-button" id="reset-model">重置试验台</button>
      <div class="model-note">按钮直接指定空座、乘员、物品或遮挡标签；不运行 OMS 分类算法。遮挡状态保持“不确定”，镜头盖闭合时所有座位输入均无效。</div>
    </div>
  </div>`;
}

function buildPage() {
  const initial = observation(GEOMETRY.initial.zoneId, GEOMETRY.initial.scenarioId);
  const figure = k.plateHtml({
    fig: "Fig 05",
    title: "OMS / OCCUPANT MONITOR",
    hint: "选择座位 · 切换占用与遮挡输入",
    readout: `${initial.zoneCode} · ${initial.status} · ${(initial.cameraDistanceMm / 1000).toFixed(2)} m`,
    keys: [
      { mark: "raised", label: "三座后排与顶置横梁" },
      { mark: "lit", label: "OMS 镜头与红外补光" },
      { mark: "green", label: "座位区域及示意视场" },
    ],
    caption: "在三个座位区域间移动一个已指定的教学样本。右下状态屏显示座位关联、遮挡不确定性和输入有效性；它不代表量产感知输出。",
    body: `<div class="iso-stage oms-stage" aria-label="OMS 多座位乘员监测试验台"><div class="oms-svg-wrap">${buildFigure()}</div></div>${controls()}`,
  });
  const css = readFileSync(join(HERE, "figure.css"), "utf8");
  const live = readFileSync(join(HERE, "live.js"), "utf8")
    .replace("__MODEL__", JSON.stringify({ GEOMETRY, SCENARIOS, projection: P, initial }))
    .replace("__OBSERVATION__", observation.toString());
  let page = k.pageHtml({ title: "乘员监测 OMS 多座位试验台 · 交互式 3D 展示", theme: "light", width: 1120, body: `<style>${css}</style>${figure}`, script: live });
  page = page.replace('<html lang="en">', '<html lang="zh-CN">');
  page = page.replace("</head>", '<meta name="color-scheme" content="light">\n</head>');
  return page;
}

const page = buildPage();
assert.ok(solids.length >= 80 && solids.length <= 150, `Hero parts must be 80–150; got ${solids.length}`);
assert.equal(new Set(solids).size, solids.length, "Every solid needs a distinct part name");
assert.equal(GEOMETRY.sensor.zMm + GEOMETRY.sensor.lensOffsetMm[2], 2352, "optical center height must match the published camera geometry");
assert.equal(SCREEN.z - 20, FLOOR_Z + 494, "diagnostic screen bezel should sit on the console deck");
const consoleDeck = { x: CONSOLE.x + 88, y: CONSOLE.y + 92, w: CONSOLE.w - 176, d: CONSOLE.d - 184 };
assert.ok(SCREEN.x - 28 >= consoleDeck.x && SCREEN.x + SCREEN.w + 28 <= consoleDeck.x + consoleDeck.w, "screen bezel must fit on the console deck");
assert.ok(SCREEN.y - 28 >= consoleDeck.y && SCREEN.y + SCREEN.d + 28 <= consoleDeck.y + consoleDeck.d, "screen bezel must fit on the console deck");
for (const zone of GEOMETRY.zones) {
  for (const scenarioId of Object.keys(SCENARIOS)) {
    const state = observation(zone.id, scenarioId);
    assert.ok(Number.isFinite(state.cameraDistanceMm) && state.cameraDistanceMm > 0, `${scenarioId}/${zone.id} distance must be finite`);
    assert.equal(state.sample[1], zone.yMm, `${scenarioId}/${zone.id} sample must map to the selected seat`);
    assert.equal(state.zoneStates.length, 3, "every OMS input must describe all three zones");
    if (scenarioId === "cameraFault") {
      assert.ok(state.zoneStates.every((item) => item.status === "INPUT INVALID"));
    } else {
      assert.equal(state.zoneStates.filter((item) => item.active).length, 1);
      assert.equal(state.zoneStates.find((item) => item.active).status, SCENARIOS[scenarioId].status);
      assert.ok(state.zoneStates.filter((item) => !item.active).every((item) => item.status === "STANDBY"));
    }
  }
}
assert.ok(observation(GEOMETRY.initial.zoneId, GEOMETRY.initial.scenarioId).insideExampleRange, "default adult sample should be in the example camera range");

if (process.argv.includes("--verify")) {
  const existing = readFileSync(OUTPUT, "utf8");
  if (existing !== page) throw new Error("Generated OMS cabin page is stale; run npm run model:oms-cabin");
  console.log(`verified ${OUTPUT} · ${solids.length} solids · ${Object.keys(SCENARIOS).length} input labels · ${GEOMETRY.zones.length} seat zones`);
} else {
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, page);
  console.log(`wrote ${OUTPUT} · ${(page.length / 1024).toFixed(0)} KB · ${solids.length} solids · ${Object.keys(SCENARIOS).length} input labels`);
}

if (process.argv.includes("--audit")) {
  const ranges = GEOMETRY.zones.map((zone) => `${zone.code} ${(observation(zone.id, "adult").cameraDistanceMm / 1000).toFixed(2)} m`).join(" · ");
  const checks = [
    `3 seat zones × ${Object.keys(SCENARIOS).length} labels`,
    "camera-fault invalidates every seat",
    "sample coordinates and seat matrix map to each selected zone",
    "inactive zones remain standby for valid inputs",
    `adult reference distance ${ranges}`,
  ];
  console.log(`geometry checks passed · ${checks.join(" · ")}`);
}
