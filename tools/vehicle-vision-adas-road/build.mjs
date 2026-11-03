import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../vehicle-vision-anatomy/vendor/anatomy/kit/iso-kit.mjs";
import * as G from "../vehicle-vision-anatomy/vendor/anatomy/kit/lathe.mjs";
import { GEOMETRY, SCENARIOS, targetState } from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUTPUT = join(ROOT, "docs/public/vehicle-vision-adas-road.html");
const WIDTH = 1040;
const HEIGHT = 650;
const AZIMUTH = 138;
const ELEVATION = 34;
const DECK_Z = 150;
const BASE = { x: -10500, y: -8100, w: 36500, d: 16200, r: 160 };
const ROAD = { x: -10300, y: -3500, w: 36100, d: 7000, r: 48 };
const RULER = { x: -9500, y: 3820, w: 32800, d: 190, r: 18 };
const CONSOLE = { x: -9850, y: 4150, w: 3900, d: 3400, r: 110 };
const SCREEN = { x: -9550, y: 4790, w: 3300, d: 2040, z: DECK_Z + 1270 };
const EGO = GEOMETRY.ego;
const INITIAL_MM = GEOMETRY.distanceRangeMm.initial;
const EGO_FRONT_X = EGO.centerXmm + EGO.halfLengthMm;
const INITIAL_TARGET = targetState(INITIAL_MM, "tracking", GEOMETRY, SCENARIOS);
const INITIAL_OCCLUDER = targetState(INITIAL_MM, "occlusion", GEOMETRY, SCENARIOS);
const EXTENTS = [
  ...k.boxCorners(BASE, -225, 165),
  ...k.boxCorners(ROAD, DECK_Z, 35),
  ...k.boxCorners(CONSOLE, DECK_Z, 2270),
  ...k.boxCorners({ x: EGO.centerXmm - 2500, y: -1200, w: 5000, d: 2400, r: 260 }, DECK_Z, 1680),
  ...k.boxCorners({ x: 24500, y: -3700, w: 1000, d: 7400, r: 10 }, DECK_Z, 20),
];
const P = k.fitProjection(EXTENTS, WIDTH, HEIGHT, { pad: 26, headroom: 8, azimuth: AZIMUTH, elevation: ELEVATION });
const at = (point) => k.iso(point, P);
const polygon = (points) => k.pathOf(points.map(at), true);
const path3 = (points) => k.pathOf(points.map(at));
const face = (points, className, extra = "") => `<path class="${className}" d="${polygon(points)}" ${extra}/>`;
const group = (parts, attrs = {}) => k.groupSvg(parts, attrs);
const solids = [];
const counts = new Map();

const solid = (name, paths, options = {}) => {
  const count = (counts.get(name) ?? 0) + 1;
  counts.set(name, count);
  solids.push(count === 1 ? name : `${name}-${count}`);
  return k.solidSvg(paths, { tone: "mid", crease: "faint", ...options });
};
const slab = (name, plan, z, height, { steps = 8, bevel = 0, ...options } = {}) =>
  solid(name, k.slabOf(plan, z, height, P, steps, bevel), options);
const cylinder = (name, x, y, radius, z, height, { steps = 32, bevel = 0, ...options } = {}) =>
  solid(name, k.cylinder(x, y, radius, z, height, P, steps, bevel), options);
const round = (name, meridian, frame, options = {}) => solid(name, G.solidOf(meridian, frame, P, options), options);
const line = (points, options = {}) => k.lineSvg(path3(points), options);

function platform() {
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, -225, 155, P)}"/>`];
  for (const [x, y] of k.corners(BASE, 390)) {
    out.push(cylinder("base-foot-pad", x, y, 180, -225, 36, { steps: 36, tone: "lo", crease: "mid" }));
    out.push(cylinder("base-leveling-stem", x, y, 92, -189, 178, { steps: 32, tone: "mid", crease: "lo" }));
    out.push(cylinder("base-locking-collar", x, y, 122, -42, 28, { steps: 36, tone: "hi", crease: "lo" }));
  }
  out.push(slab("lower-base-frame", BASE, -4, 54, { bevel: 10, tone: "mid", crease: "lo" }));
  out.push(slab("floating-test-deck", { ...BASE, x: BASE.x + 52, y: BASE.y + 52, w: BASE.w - 104, d: BASE.d - 104, r: 112 }, 50, 100, { bevel: 9, tone: "hi", crease: "lo" }));
  out.push(slab("roadway-asphalt-bed", ROAD, DECK_Z, 30, { bevel: 3, tone: "lo", crease: "faint", className: "roadway-solid" }));

  const bolts = k.corners(BASE, 205);
  out.push(k.lineSvg(bolts.map(([x, y]) => k.ring(x, y, 30, 150, P, 24)).join(""), { tone: "mid" }));
  out.push(k.dotsSvg(bolts.map(([x, y]) => at([x, y, 150])), { size: 1.3, tone: "lo" }));

  for (const y of [-7860, 7760]) {
    const rail = { x: -10150, y, w: 35800, d: 84, r: 24 };
    out.push(slab("road-deck-guard-rail", rail, 150, 38, { bevel: 7, tone: "mid", crease: "lo" }));
    out.push(k.lineSvg(k.planOutline(k.insetPlan(rail, 13), 189, P, 5), { tone: "faint" }));
  }

  for (const y of [-3500, 3500]) out.push(line([[-10100, y, 184], [25500, y, 184]], { tone: "hi", className: "road-edge-line" }));
  out.push(line([[-10100, 0, 184], [25500, 0, 184]], { tone: "faint", className: "road-center-line" }));
  for (let x = -6000; x < 24600; x += 3600) {
    out.push(line([[x, -20, 185], [x + 1550, -20, 185]], { tone: "hi", className: "lane-dash" }));
  }
  for (let x = -6100; x < 24100; x += 4100) {
    out.push(cylinder("lane-reflector-stud", x, 0, 72, 182, 22, { steps: 24, bevel: 5, tone: "hi", crease: "lo" }));
  }

  out.push(slab("distance-ruler-strip", RULER, 153, 8, { bevel: 2, tone: "mid", crease: "none" }));
  const ticks = k.topTicks(RULER.x + 42, RULER.x + RULER.w - 42, 500, 2500, RULER.y + 20, 163, [24, 58], P);
  out.push(k.lineSvg(ticks.minor, { tone: "mid" }), k.lineSvg(ticks.major, { tone: "hi" }));
  const plate = { x: 19100, y: 3950, w: 2380, d: 510, r: 26 };
  out.push(slab("rig-identification-plate", plate, 154, 16, { bevel: 5, tone: "mid" }));
  out.push(k.faceTextSvg(k.topMatrix([plate.x + 130, plate.y + 75], 171, P), "ADAS / FORWARD-VISION TRACK", { size: 170, tone: "hi" }));
  out.push(k.faceTextSvg(k.topMatrix([plate.x + 130, plate.y + 300], 171, P), "GT DISTANCE · SCENARIO RIG", { size: 105, tone: "mid" }));
  return out.join("");
}

function vehicle(prefix, cx, cy, { compact = false, camera = false } = {}) {
  const out = [];
  const isEgo = !compact;
  const halfL = isEgo ? EGO.halfLengthMm : GEOMETRY.targetCar.halfLengthMm;
  const halfW = isEgo ? EGO.halfWidthMm : GEOMETRY.targetCar.widthMm / 2;
  const z = DECK_Z + 30;
  const wheelXs = isEgo ? [-1450, 1450] : [-1320, 1320];
  for (const wx of wheelXs) {
    for (const side of [-1, 1]) {
      const axis = [0, side, 0];
      const frame = G.frameAlong([cx + wx, cy + side * (halfW - 42), z + 310], axis);
      out.push(round(`${prefix}-tire`, [[-112, 255], [-112, 292], [-88, 315], [88, 315], [112, 292], [112, 255]], frame, { tone: "lo", crease: "mid", steps: 48 }));
      out.push(round(`${prefix}-wheel-rim`, [[88, 170], [101, 208], [126, 208], [140, 170]], frame, { tone: "hi", crease: "lo", steps: 40 }));
      if (isEgo) {
        out.push(round(`${prefix}-wheel-hub`, [[137, 76], [146, 111], [164, 111], [174, 76]], frame, { tone: "mid", crease: "faint", steps: 32 }));
        const lugs = Array.from({ length: 5 }, (_, index) => {
          const angle = index * Math.PI * 2 / 5;
          return at(G.pointOf(frame, 167, 22, angle));
        });
        out.push(k.dotsSvg(lugs, { size: 1.4, tone: "lo" }));
      }
    }
  }

  out.push(slab(`${prefix}-undertray`, { x: cx - halfL + 120, y: cy - halfW + 70, w: 2 * halfL - 240, d: 2 * halfW - 140, r: 210 }, z + 300, 160, { bevel: 24, tone: "lo", crease: "mid" }));
  out.push(slab(`${prefix}-body-sill`, { x: cx - halfL, y: cy - halfW + 5, w: 2 * halfL, d: 2 * halfW - 10, r: 280 }, z + 400, 130, { bevel: 34, tone: "mid", crease: "faint" }));
  out.push(slab(`${prefix}-main-body`, { x: cx - halfL + 50, y: cy - halfW + 20, w: 2 * halfL - 100, d: 2 * halfW - 40, r: 320 }, z + 500, 390, { bevel: 68, tone: "hi", crease: "lo" }));
  const hoodLength = isEgo ? 1660 : 1500;
  out.push(slab(`${prefix}-bonnet`, { x: cx + 240, y: cy - halfW + 125, w: hoodLength, d: 2 * (halfW - 125), r: 190 }, z + 830, 126, { bevel: 34, tone: "hi", crease: "faint" }));
  out.push(slab(`${prefix}-rear-deck`, { x: cx - halfL + 140, y: cy - halfW + 140, w: 790, d: 2 * (halfW - 140), r: 150 }, z + 824, 112, { bevel: 30, tone: "mid", crease: "faint" }));
  out.push(slab(`${prefix}-cabin-shell`, { x: cx - 920, y: cy - halfW + 135, w: 1770, d: 2 * (halfW - 135), r: 310 }, z + 850, 420, { bevel: 72, tone: "mid", crease: "lo" }));
  out.push(slab(`${prefix}-roof-glass`, { x: cx - 650, y: cy - halfW + 300, w: 1230, d: 2 * (halfW - 300), r: 200 }, z + 1268, 14, { bevel: 3, tone: "lo", crease: "none", className: "vehicle-glass-solid" }));

  if (isEgo) {
    for (const side of [-1, 1]) {
      out.push(slab(`${prefix}-mirror-stalk`, { x: cx + 610, y: cy + side * (halfW - 15), w: 88, d: 58, r: 20 }, z + 900, 32, { bevel: 8, tone: "lo", crease: "none" }));
      out.push(slab(`${prefix}-mirror-housing`, { x: cx + 660, y: cy + side * (halfW + 6), w: 180, d: 152, r: 48 }, z + 910, 82, { bevel: 17, tone: "mid", crease: "lo" }));
      out.push(slab(`${prefix}-door-handle`, { x: cx - 460, y: cy + side * (halfW - 4), w: 190, d: 32, r: 12 }, z + 735, 22, { bevel: 5, tone: "hi", crease: "none" }));
    }
  } else {
    for (const side of [-1, 1]) out.push(slab(`${prefix}-mirror-shell`, { x: cx + 675, y: cy + side * (halfW + 5), w: 168, d: 144, r: 45 }, z + 900, 76, { bevel: 15, tone: "mid", crease: "lo" }));
  }

  for (const side of [-1, 1]) {
    out.push(slab(`${prefix}-headlamp`, { x: cx + halfL - 155, y: cy + side * (halfW - 215), w: 105, d: 245, r: 30 }, z + 690, 72, { bevel: 15, tone: "hi", crease: "mid" }));
    out.push(slab(`${prefix}-tail-lamp`, { x: cx - halfL + 55, y: cy + side * (halfW - 180), w: 78, d: 210, r: 28 }, z + 665, 70, { bevel: 14, tone: "lo", crease: "faint" }));
  }
  out.push(slab(`${prefix}-grille`, { x: cx + halfL - 48, y: cy - 310, w: 44, d: 620, r: 20 }, z + 565, 220, { bevel: 10, tone: "lo", crease: "faint" }));

  if (camera) {
    const camX = cx + 1030;
    const camY = cy;
    const camZ = z + 1278;
    out.push(slab(`${prefix}-camera-mount`, { x: camX - 92, y: camY - 86, w: 184, d: 172, r: 26 }, camZ - 26, 36, { bevel: 8, tone: "lo" }));
    out.push(slab(`${prefix}-camera-housing`, { x: camX - 76, y: camY - 74, w: 152, d: 148, r: 22 }, camZ + 8, 78, { bevel: 12, tone: "hi", crease: "lo" }));
    const frame = G.frameAlong([camX + 63, camY, camZ + 45], [1, 0, 0]);
    out.push(round(`${prefix}-camera-lens-barrel`, [[0, 37], [10, 48], [67, 48], [82, 38], [82, 26], [0, 26]], frame, { tone: "mid", crease: "lo", steps: 36 }));
    out.push(round(`${prefix}-camera-lens-bezel`, [[77, 40], [84, 47], [98, 47], [106, 39], [106, 23], [77, 23]], frame, { tone: "lo", crease: "mid", steps: 36 }));
    out.push(round(`${prefix}-camera-lens-glass`, [[104, 29], [107, 36], [113, 36], [115, 29], [115, 0]], frame, { tone: "lit", crease: "hi", lit: true, steps: 32 }));
    for (const dx of [-50, 50]) for (const dy of [-48, 48]) out.push(cylinder(`${prefix}-camera-fastener`, camX + dx, camY + dy, 7, camZ + 87, 5, { steps: 16, tone: "lo", crease: "none" }));
    for (const dy of [-22, 22]) out.push(cylinder(`${prefix}-camera-status-led`, camX - 51, camY + dy, 8, camZ + 89, 4, { steps: 18, tone: "hi", crease: "none" }));
  }

  const windows = [];
  for (const side of [-1, 1]) {
    const y = cy + side * (halfW + 1);
    windows.push(line([[cx - 1050, y, z + 990], [cx - 430, y, z + 990], [cx - 350, cy + side * (halfW - 195), z + 1244], [cx - 830, cy + side * (halfW - 195), z + 1244], [cx - 1050, y, z + 990]], { tone: "faint" }));
    windows.push(line([[cx - 360, y, z + 990], [cx + 690, y, z + 990], [cx + 540, cy + side * (halfW - 195), z + 1244], [cx - 330, cy + side * (halfW - 195), z + 1244], [cx - 360, y, z + 990]], { tone: "faint" }));
    windows.push(line([[cx - 950, y, z + 640], [cx + 720, y, z + 640]], { tone: "lo" }));
  }
  return group([...out, ...windows], { class: "vehicle-assembly" });
}

function pedestrian(state) {
  const { targetXmm: x, targetYmm: y } = state;
  const z = DECK_Z + 180;
  const out = [];
  for (const side of [-1, 1]) {
    out.push(slab("pedestrian-shoe", { x: x - 125, y: y + side * 105 - 80, w: 310, d: 165, r: 46 }, z, 88, { bevel: 20, tone: "lo", crease: "mid" }));
    out.push(cylinder("pedestrian-lower-leg", x + 20, y + side * 105, 75, z + 86, 330, { steps: 28, bevel: 12, tone: "mid", crease: "lo" }));
  }
  out.push(cylinder("pedestrian-torso", x + 24, y, 185, z + 405, 500, { steps: 36, bevel: 28, tone: "hi", crease: "lo" }));
  out.push(solid("pedestrian-head", G.sphereOf([x + 34, y, z + 1025], 155, P, { steps: 36 }), { tone: "hi", crease: "lo" }));
  return group(out, { class: "scenario-object", "data-scenario-object": "occlusion", id: "moving-target-pedestrian" });
}

function consoleUnit() {
  const out = [];
  out.push(slab("console-foot", CONSOLE, DECK_Z, 90, { bevel: 18, tone: "lo" }));
  for (const [x, y] of [[-9510, 4380], [-6450, 4380], [-9510, 7300], [-6450, 7300]]) {
    out.push(cylinder("console-isolator", x, y, 54, DECK_Z + 90, 86, { steps: 28, tone: "mid" }));
  }
  out.push(slab("console-shell", { ...CONSOLE, x: CONSOLE.x + 50, y: CONSOLE.y + 55, w: CONSOLE.w - 100, d: CONSOLE.d - 110, r: 92 }, DECK_Z + 176, 260, { bevel: 32, tone: "mid", crease: "lo" }));
  out.push(slab("console-control-deck", { ...CONSOLE, x: CONSOLE.x + 112, y: CONSOLE.y + 118, w: CONSOLE.w - 224, d: CONSOLE.d - 236, r: 58 }, DECK_Z + 430, 62, { bevel: 14, tone: "hi", crease: "faint" }));
  out.push(slab("truth-screen-bezel", { x: SCREEN.x - 34, y: SCREEN.y - 34, w: SCREEN.w + 68, d: SCREEN.d + 68, r: 48 }, SCREEN.z - 25, 42, { bevel: 12, tone: "lo" }));
  out.push(slab("truth-screen-glass", { x: SCREEN.x, y: SCREEN.y, w: SCREEN.w, d: SCREEN.d, r: 28 }, SCREEN.z + 17, 5, { bevel: 1, tone: "hi", crease: "none", className: "screen-glass" }));
  const screen = k.topMatrix([SCREEN.x + 110, SCREEN.y + 94], SCREEN.z + 23, P);
  out.push(`<g class="adas-screen" transform="${screen}" aria-hidden="true">
    <rect class="adas-screen-bg" x="0" y="0" width="3080" height="1840" rx="60"/>
    <path class="adas-screen-road" d="M210 1740L900 100L2190 100L2870 1740Z"/>
    <path class="adas-screen-lane" d="M1540 1670V270M1060 1670L1260 270M2020 1670L1820 270"/>
    <path class="adas-screen-dash" d="M1540 1590V1420M1540 1300V1130M1540 1010V840M1540 720V550M1540 430V300"/>
    <rect class="adas-screen-box" data-screen-box x="1390" y="430" width="310" height="230" rx="22"/>
    <text class="adas-screen-kicker" x="180" y="260">GROUND TRUTH</text>
    <text class="adas-screen-value" data-screen-distance x="180" y="560">16.0 m</text>
    <text class="adas-screen-target" data-screen-target x="180" y="810">VEHICLE · TRACKING</text>
    <path class="adas-screen-rule" d="M180 940H2870"/>
    <circle class="adas-screen-led" cx="235" cy="1130" r="26"/>
    <text class="adas-screen-status" data-screen-status x="300" y="1150">TRACKING / VALID</text>
  </g>`);
  for (const x of [-9200, -8250, -7300]) {
    out.push(cylinder("console-selector-bushing", x, 4480, 95, DECK_Z + 492, 12, { steps: 36, tone: "lo" }));
    out.push(cylinder("console-selector-knob", x, 4480, 69, DECK_Z + 504, 66, { steps: 36, bevel: 7, tone: "hi" }));
  }
  for (const x of [-9290, -8750, -8210, -7670, -7130]) out.push(cylinder("console-status-button", x, 7230, 34, DECK_Z + 492, 24, { steps: 24, tone: "mid", crease: "none" }));
  out.push(slab("console-controller-module", { x: -9130, y: 5740, w: 1200, d: 370, r: 24 }, DECK_Z + 495, 78, { bevel: 14, tone: "lo", crease: "mid" }));
  for (let index = 0; index < 5; index++) {
    out.push(slab("console-cooling-fin", { x: -9000 + index * 185, y: 5810, w: 68, d: 235, r: 18 }, DECK_Z + 573, 34, { bevel: 8, tone: "mid", crease: "lo" }));
  }
  return group(out, { class: "console-unit" });
}

function rayLayer() {
  const end = [INITIAL_TARGET.targetXmm - GEOMETRY.targetCar.halfLengthMm, INITIAL_TARGET.targetYmm, DECK_Z + 700];
  const start = [EGO.centerXmm + 1720, 0, DECK_Z + 1510];
  return `<path class="adas-target-ray" data-target-ray d="${path3([start, end])}"/>`;
}

function buildFigure() {
  const trackingCar = targetState(INITIAL_MM, "tracking", GEOMETRY, SCENARIOS);
  const cutinCar = targetState(INITIAL_MM, "cutin", GEOMETRY, SCENARIOS);
  const occlusion = targetState(INITIAL_MM, "occlusion", GEOMETRY, SCENARIOS);
  const screenAndRoad = [
    platform(),
    rayLayer(),
    `<g id="moving-target-car" class="scenario-object" data-scenario-object="tracking cutin">${vehicle("target-car", trackingCar.targetXmm, trackingCar.targetYmm, { compact: true })}</g>`,
    pedestrian(occlusion),
    `<g id="moving-occluder" class="scenario-object" data-scenario-object="occlusion">${vehicle("occluder-car", occlusion.occluderXmm, occlusion.occluderYmm, { compact: true })}</g>`,
    vehicle("ego-car", EGO.centerXmm, 0, { camera: true }),
    consoleUnit(),
  ].join("");
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: "前视 ADAS 道路验证台：测试车辆、前视相机、前车、相邻车道切入车辆、遮挡行人和真值控制台",
    body: screenAndRoad,
    className: "adas-road-figure",
  });
}

function controls() {
  const scenarioButtons = Object.entries(SCENARIOS).map(([id, item], index) =>
    `<button type="button" class="scenario-button" data-scenario="${id}" aria-pressed="${index === 0 ? "true" : "false"}"><span class="scenario-index">0${index + 1}</span><span><b>${item.label}</b><small>${item.detail}</small></span></button>`
  ).join("");
  return `<div class="adas-controls">
    <div class="scenario-control"><div class="control-heading"><span>SCENARIO</span><small>选择道路目标变体</small></div><div class="scenario-buttons">${scenarioButtons}</div></div>
    <div class="control-divider"></div>
    <div class="live-controls">
      <label class="distance-control" for="target-distance"><span><b>目标纵向距离</b><small>从测试车前端到目标最近边缘</small></span><input id="target-distance" type="range" min="${GEOMETRY.distanceRangeMm.min}" max="${GEOMETRY.distanceRangeMm.max}" step="500" value="${INITIAL_MM}"><output id="distance-value">16.0 m</output></label>
      <div class="truth-readout" aria-live="polite"><span>几何真值距离</span><strong id="truth-distance">16.0 m</strong><small id="truth-context">前车 · 目标连续可见</small></div>
      <button type="button" class="reset-button" id="reset-model">重置验证台</button>
      <div class="model-note">毫米级场景参数 · 示意相机视场 · 不等同真实道路法规或量产传感器数据</div>
    </div>
  </div>`;
}

function buildPage() {
  const figure = k.plateHtml({
    fig: "Fig 03",
    title: "ADAS / FORWARD ROAD",
    hint: "选择场景 · 拖动距离滑杆或用方向键",
    readout: "GT 16.0 m · TRACKING",
    keys: [
      { mark: "raised", label: "道路、测试车与移动目标实体" },
      { mark: "lit", label: "前视相机镜头与目标检测区域" },
      { mark: "green", label: "模型真值视线" },
    ],
    caption: "距离滑杆驱动场景中目标的纵向位置，并同步更新真值读数。切入车与遮挡行人的横向关系由各场景参数定义。",
    body: `<div class="iso-stage adas-road-stage" aria-label="前视 ADAS 道路验证台"><div class="adas-svg-wrap">${buildFigure()}</div></div>${controls()}`,
  });
  const css = readFileSync(join(HERE, "figure.css"), "utf8");
  const live = readFileSync(join(HERE, "live.js"), "utf8")
    .replace("__MODEL__", JSON.stringify({ GEOMETRY, SCENARIOS, projection: P, deckZ: DECK_Z, egoFrontX: EGO_FRONT_X, initialTarget: INITIAL_TARGET, initialOccluder: INITIAL_OCCLUDER }))
    .replace("__TARGET_STATE__", targetState.toString());
  let page = k.pageHtml({ title: "前视 ADAS 道路验证台 · 交互式 3D 展示", theme: "light", width: 1120, body: `<style>${css}</style>${figure}`, script: live });
  page = page.replace('<html lang="en">', '<html lang="zh-CN">');
  page = page.replace("</head>", '<meta name="color-scheme" content="light">\n</head>');
  return page;
}

const page = buildPage();
assert.ok(solids.length >= 80 && solids.length <= 150, `Hero parts must be 80–150; got ${solids.length}`);
assert.equal(new Set(solids).size, solids.length, "Every solid needs a distinct part name");
for (const [id, scenario] of Object.entries(SCENARIOS)) {
  for (const distance of [GEOMETRY.distanceRangeMm.min, INITIAL_MM, GEOMETRY.distanceRangeMm.max]) {
    const state = targetState(distance, id, GEOMETRY, SCENARIOS);
    assert.equal(state.targetDistanceMm, distance, `${id} must preserve requested ground-truth distance`);
    const half = state.targetKind === "vehicle" ? GEOMETRY.targetCar.halfLengthMm : GEOMETRY.pedestrian.halfLengthMm;
    const nearEdge = state.targetXmm - half;
    assert.equal(nearEdge - EGO_FRONT_X, distance, `${id} distance must be measured from the ego front`);
    if (scenario.occluded) assert.ok(state.occluderDistanceMm < distance, "Occluder must be nearer than the pedestrian");
  }
}

if (process.argv.includes("--verify")) {
  const existing = readFileSync(OUTPUT, "utf8");
  if (existing !== page) throw new Error("Generated ADAS road page is stale; run npm run model:adas-road");
  console.log(`verified ${OUTPUT} · ${solids.length} solids · ${Object.keys(SCENARIOS).length} scenarios`);
} else {
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, page);
  console.log(`wrote ${OUTPUT} · ${(page.length / 1024).toFixed(0)} KB · ${solids.length} solids · ${Object.keys(SCENARIOS).length} scenarios`);
}

if (process.argv.includes("--audit")) {
  const result = Object.entries(SCENARIOS).map(([id]) => {
    const distances = [8000, 16000, 24000].map((distance) => targetState(distance, id, GEOMETRY, SCENARIOS).targetDistanceMm);
    return `${id}: ${distances.join(" / ")} mm`;
  });
  console.log(`geometry checks passed · ${result.join(" · ")}`);
}
