export const GEOMETRY = Object.freeze({
  ego: Object.freeze({ lengthMm: 4550, widthMm: 1850, halfLengthMm: 2275, halfWidthMm: 925, centerXmm: -5200 }),
  road: Object.freeze({ widthMm: 7000, laneWidthMm: 3500, halfWidthMm: 3500 }),
  targetCar: Object.freeze({ lengthMm: 4200, widthMm: 1800, halfLengthMm: 2100 }),
  pedestrian: Object.freeze({ lengthMm: 520, widthMm: 520, halfLengthMm: 260 }),
  distanceRangeMm: Object.freeze({ min: 8000, max: 24000, initial: 16000 }),
});

export const SCENARIOS = Object.freeze({
  tracking: Object.freeze({
    label: "前车跟踪",
    detail: "同车道车辆 · 连续目标",
    target: "vehicle",
    laneOffsetMm: 0,
    occluded: false,
  }),
  cutin: Object.freeze({
    label: "相邻车切入",
    detail: "相邻车道驶入 · 横向运动",
    target: "vehicle",
    laneOffsetMm: 3000,
    occluded: false,
  }),
  occlusion: Object.freeze({
    label: "遮挡行人",
    detail: "前车遮挡 · 行人局部重现",
    target: "pedestrian",
    laneOffsetMm: 1200,
    occluded: true,
  }),
});

/** Geometric ground-truth pose for the teaching track, relative to the ego front. */
export function targetState(distanceMm, scenarioId, geometry, scenarios) {
  const scenario = scenarios[scenarioId];
  const egoFrontX = geometry.ego.centerXmm + geometry.ego.halfLengthMm;
  const halfLength = scenario.target === "vehicle" ? geometry.targetCar.halfLengthMm : geometry.pedestrian.halfLengthMm;
  const targetXmm = egoFrontX + distanceMm + halfLength;
  const targetYmm = scenario.laneOffsetMm;
  const occluderDistanceMm = Math.max(6000, distanceMm - 2600);
  const occluderXmm = egoFrontX + occluderDistanceMm + geometry.targetCar.halfLengthMm;
  return {
    targetXmm,
    targetYmm,
    targetDistanceMm: distanceMm,
    occluderXmm,
    occluderYmm: 0,
    occluderDistanceMm,
    targetKind: scenario.target,
    laneOffsetMm: scenario.laneOffsetMm,
    occluded: scenario.occluded,
  };
}
