export const GEOMETRY = Object.freeze({
  cabin: Object.freeze({ lengthMm: 5600, widthMm: 4200, floorZmm: 190 }),
  base: Object.freeze({ xMm: -3200, yMm: -3000, widthMm: 6400, depthMm: 6000 }),
  seat: Object.freeze({
    centerXmm: -100,
    widthMm: 820,
    depthMm: 850,
    cushionTopZmm: 650,
    adultHeadZmm: 1710,
    childHeadZmm: 1260,
  }),
  zones: Object.freeze([
    Object.freeze({ id: "left", label: "左座", code: "L2", xMm: -100, yMm: -920 }),
    Object.freeze({ id: "center", label: "中座", code: "C2", xMm: -100, yMm: 0 }),
    Object.freeze({ id: "right", label: "右座", code: "R2", xMm: -100, yMm: 920 }),
  ]),
  sensor: Object.freeze({
    xMm: -900,
    yMm: 0,
    zMm: 2440,
    lensOffsetMm: Object.freeze([0, 0, -88]),
    direction: Object.freeze([0, 0, -1]),
  }),
  exampleRangeMm: Object.freeze({ min: 780, max: 1600 }),
  initial: Object.freeze({ zoneId: "center", scenarioId: "adult" }),
});

export const SCENARIOS = Object.freeze({
  empty: Object.freeze({
    label: "空座",
    detail: "无人样本 · 座位区域有效",
    status: "EMPTY · INPUT LABEL",
    occupancy: "empty",
    object: "none",
    sensorValid: true,
  }),
  adult: Object.freeze({
    label: "成人乘员",
    detail: "坐姿乘员 · 按座位关联",
    status: "OCCUPIED · ADULT LABEL",
    occupancy: "occupied",
    object: "adult",
    sensorValid: true,
  }),
  childSeat: Object.freeze({
    label: "儿童座椅",
    detail: "儿童约束装置与儿童样本",
    status: "OCCUPIED · CHILD-SEAT LABEL",
    occupancy: "occupied",
    object: "childSeat",
    sensorValid: true,
  }),
  object: Object.freeze({
    label: "空座有物品",
    detail: "背包样本 · 与乘员区分",
    status: "OBJECT · NO PERSON LABEL",
    occupancy: "empty",
    object: "bag",
    sensorValid: true,
  }),
  occluded: Object.freeze({
    label: "毯子遮挡",
    detail: "部分遮挡 · 保留不确定状态",
    status: "UNCERTAIN · OCCLUDED LABEL",
    occupancy: "unknown",
    object: "blanket",
    sensorValid: true,
  }),
  cameraFault: Object.freeze({
    label: "相机输入无效",
    detail: "镜头盖闭合 · 所有座位状态无效",
    status: "SENSOR INPUT INVALID",
    occupancy: "invalid",
    object: "none",
    sensorValid: false,
  }),
});

/** Geometric seat-to-sensor observation for a labelled sample; it does not emulate OMS perception. */
export function observation(zoneId, scenarioId, geometry = GEOMETRY, scenarios = SCENARIOS) {
  const zone = geometry.zones.find((item) => item.id === zoneId);
  const scenario = scenarios[scenarioId];
  if (!zone || !scenario) throw new RangeError(`Unknown OMS zone or scenario: ${zoneId}/${scenarioId}`);

  const camera = [
    geometry.sensor.xMm + geometry.sensor.lensOffsetMm[0],
    geometry.sensor.yMm + geometry.sensor.lensOffsetMm[1],
    geometry.sensor.zMm + geometry.sensor.lensOffsetMm[2],
  ];
  const sample = [zone.xMm - 200, zone.yMm, scenario.object === "childSeat" ? geometry.seat.childHeadZmm : geometry.seat.adultHeadZmm];
  const cameraDistanceMm = Math.hypot(camera[0] - sample[0], camera[1] - sample[1], camera[2] - sample[2]);
  const zoneStates = geometry.zones.map((item) => ({
    id: item.id,
    label: item.code,
    status: scenario.sensorValid ? (item.id === zoneId ? scenario.status : "STANDBY") : "INPUT INVALID",
    active: item.id === zoneId,
  }));

  return {
    zoneId,
    zoneLabel: zone.label,
    zoneCode: zone.code,
    scenarioId,
    scenarioLabel: scenario.label,
    status: scenario.status,
    occupancy: scenario.occupancy,
    object: scenario.object,
    sensorValid: scenario.sensorValid,
    sample,
    camera,
    cameraDistanceMm,
    insideExampleRange: cameraDistanceMm >= geometry.exampleRangeMm.min && cameraDistanceMm <= geometry.exampleRangeMm.max,
    zoneStates,
  };
}
