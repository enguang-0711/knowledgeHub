export const MODEL = Object.freeze({
  vehicle: Object.freeze({ lengthMm: 4550, widthMm: 1850, halfLengthMm: 2275, halfWidthMm: 925 }),
  bay: Object.freeze({ lengthMm: 5550, widthMm: 3000, halfLengthMm: 2775, halfWidthMm: 1500 }),
  lateralRangeMm: 200,
  cameraRangeMm: 1250,
});

export const SCENARIOS = Object.freeze({
  standard: Object.freeze({
    label: "标准车位",
    detail: "地面车位线 · 常规泊车",
    obstacle: null,
    clearanceSide: null,
    reflectance: false,
  }),
  low: Object.freeze({
    label: "低矮障碍",
    detail: "右侧 200 mm 高的低矮障碍",
    obstacle: Object.freeze({ xMm: 160, yMm: 1280, lengthMm: 360, widthMm: 200, heightMm: 200 }),
    clearanceSide: "right",
    reflectance: false,
  }),
  ramp: Object.freeze({
    label: "坡道反光",
    detail: "坡面与局部高反光区域",
    obstacle: null,
    clearanceSide: null,
    reflectance: true,
  }),
});

/**
 * Geometric reference gap for the current teaching scene. The result is
 * derived from the bay boundary and, when present, the obstacle footprint.
 */
export function clearanceMm(offsetMm, geometry, scenario) {
  const { vehicle, bay } = geometry;
  const leftBay = bay.halfWidthMm - (vehicle.halfWidthMm - offsetMm);
  const rightBay = bay.halfWidthMm - (vehicle.halfWidthMm + offsetMm);
  let nearest = Math.min(leftBay, rightBay);

  if (scenario.obstacle && scenario.clearanceSide === "right") {
    const obstacleInnerEdge = scenario.obstacle.yMm - scenario.obstacle.widthMm / 2;
    const vehicleOuterEdge = offsetMm + vehicle.halfWidthMm;
    const alongLength = Math.abs(scenario.obstacle.xMm) <= vehicle.halfLengthMm + scenario.obstacle.lengthMm / 2;
    if (alongLength) nearest = Math.min(nearest, obstacleInnerEdge - vehicleOuterEdge);
  }

  return Math.max(0, Math.round(nearest / 10) * 10);
}
