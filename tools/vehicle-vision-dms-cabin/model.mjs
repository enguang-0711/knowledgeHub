export const GEOMETRY = Object.freeze({
  cabin: Object.freeze({ lengthMm: 5200, widthMm: 4200, floorZmm: 190 }),
  seat: Object.freeze({ travelMm: Object.freeze({ min: -120, max: 120, initial: 0 }) }),
  driver: Object.freeze({
    centerXmm: -510,
    centerYmm: -720,
    centerZmm: 1590,
    eyeXmm: -300,
    eyeYmm: -720,
    eyeZmm: 1670,
    eyePupilOffsetMm: 46,
    halfEyeSpacingMm: 46,
  }),
  camera: Object.freeze({
    xMm: 1080,
    yMm: -720,
    zMm: 1485,
    lensOffsetMm: Object.freeze([-285, 0, 226]),
    direction: Object.freeze([-1, 0, 0]),
  }),
  exampleRangeMm: Object.freeze({ min: 820, max: 1580 }),
});

export const SCENARIOS = Object.freeze({
  attentive: Object.freeze({
    label: "正常注视",
    detail: "睁眼 · 面部在画面内",
    status: "FACE IN VIEW",
    gazeYawDeg: 0,
    eyesClosed: false,
    occluded: false,
  }),
  glance: Object.freeze({
    label: "视线偏离",
    detail: "眼睛转向侧方 · 人脸仍可见",
    status: "GAZE AWAY · LABEL",
    gazeYawDeg: 32,
    eyesClosed: false,
    occluded: false,
  }),
  eyesClosed: Object.freeze({
    label: "闭眼样本",
    detail: "闭眼标签 · 不表示疲劳判定阈值",
    status: "EYES CLOSED · LABEL",
    gazeYawDeg: 0,
    eyesClosed: true,
    occluded: false,
  }),
  occluded: Object.freeze({
    label: "镜头遮挡",
    detail: "遮挡片盖住镜头 · 传感器输入无效",
    status: "INPUT INVALID · COVERED",
    gazeYawDeg: 0,
    eyesClosed: false,
    occluded: true,
  }),
});

/** Geometric seat and eye pose for the teaching rig; it does not emulate a product detector. */
export function observation(seatOffsetMm, scenarioId, geometry = GEOMETRY, scenarios = SCENARIOS) {
  const offset = Math.max(geometry.seat.travelMm.min, Math.min(geometry.seat.travelMm.max, seatOffsetMm));
  const scenario = scenarios[scenarioId];
  const eye = [geometry.driver.eyeXmm + offset, geometry.driver.eyeYmm, geometry.driver.eyeZmm];
  const camera = [
    geometry.camera.xMm + geometry.camera.lensOffsetMm[0],
    geometry.camera.yMm + geometry.camera.lensOffsetMm[1],
    geometry.camera.zMm + geometry.camera.lensOffsetMm[2],
  ];
  const cameraDistanceMm = Math.hypot(camera[0] - eye[0], camera[1] - eye[1], camera[2] - eye[2]);
  return {
    seatOffsetMm: offset,
    eye,
    camera,
    cameraDistanceMm,
    insideExampleRange: cameraDistanceMm >= geometry.exampleRangeMm.min && cameraDistanceMm <= geometry.exampleRangeMm.max,
    gazeYawDeg: scenario.gazeYawDeg,
    eyesClosed: scenario.eyesClosed,
    occluded: scenario.occluded,
    status: scenario.status,
    label: scenario.label,
  };
}
