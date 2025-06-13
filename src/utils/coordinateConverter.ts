/**
 * 坐标转换工具
 * 用于将2D全景图像上的坐标点转换为3D球面坐标
 */

import { SPHERE_RADIUS } from '@/constants'

/**
 * 将2D图像坐标转换为3D球面坐标
 * @param point2D 2D图像上的坐标点 {x, y}
 * @param imageSize 全景图像的尺寸 {width, height}
 * @param radius 球体半径，默认使用常量SPHERE_RADIUS
 * @returns 3D球面坐标 {x, y, z}
 */
export function convert2DTo3D(
  point2D: { x: number, y: number }, 
  imageSize: { width: number, height: number },
  radius: number = SPHERE_RADIUS
) {
  // 计算球面坐标
  // 水平角度 (经度): 根据x坐标确定，范围从-π到π
  const longitude = 2 * Math.PI * (point2D.x / imageSize.width - 0.5);
  
  // 垂直角度 (纬度): 根据y坐标确定，范围从0到π
  const latitude = Math.PI * (1 - point2D.y / imageSize.height);
  
  // 转换为3D直角坐标
  const x = radius * Math.sin(latitude) * Math.cos(longitude);
  const y = radius * Math.cos(latitude);
  const z = radius * Math.sin(latitude) * Math.sin(longitude);
  
  return { x, y, z };
}

/**
 * 以左上角为原点的坐标转换函数
 * @param point2D 2D图像上的坐标点 {x, y}，以左上角为原点
 * @param imageSize 全景图像的尺寸 {width, height}
 * @param radius 球体半径，默认使用常量SPHERE_RADIUS
 * @returns 3D球面坐标 {x, y, z}
 */
export function convertFromTopLeft1(
  point2D: { x: number, y: number },
  imageSize: { width: number, height: number },
  radius: number = SPHERE_RADIUS,
  paddingX: number = 300
) {
  // 1. 将2D坐标归一化到[0,1]范围
  const normalizedX = point2D.x / imageSize.width;
  const normalizedY = point2D.y / imageSize.height;
  
  // 2. 计算球面坐标系中的经纬度
  // 经度(longitude): 从-π到π，对应图像的水平位置
  // 调整经度计算，使点位于正确的墙面上
  const longitude = (normalizedX * 2 - 1) * Math.PI;
  
  // 纬度(latitude): 从π/2到-π/2，对应图像的垂直位置
  const latitude = (0.5 - normalizedY) * Math.PI;
  
  // 3. 将球面坐标(经纬度)转换为3D直角坐标
  // 调整坐标计算，使点位于正确的墙面上
  return {
    x: -radius * Math.cos(latitude) * Math.sin(longitude),
    y: radius * Math.sin(latitude),
    z: -radius * Math.cos(latitude) * Math.cos(longitude)
  };
}
export function convertFromTopLeft(
  point2D: { x: number, y: number },
  imageSize: { width: number, height: number },
  radius: number = SPHERE_RADIUS,
  paddingX: number = 300
) {
  // 1. 将2D坐标归一化到[0,1]范围
  const normalizedX = (point2D.x - paddingX) / imageSize.width;
  const normalizedY = point2D.y / imageSize.height;
  
  // 2. 计算球面坐标系中的经纬度
  // 经度(longitude): 从-π到π，对应图像的水平位置
  const longitude = (normalizedX * 2 - 1) * Math.PI;
  
  // 纬度(latitude): 从π/2到-π/2，对应图像的垂直位置
  const latitude = (0.5 - normalizedY) * Math.PI;
  
  // 3. 将球面坐标(经纬度)转换为3D直角坐标
  return {
    x: -radius * Math.cos(latitude) * Math.sin(longitude),
    y: radius * Math.sin(latitude),
    z: -radius * Math.cos(latitude) * Math.cos(longitude)
  };
}

/**
 * 以中心为原点的坐标转换函数
 * @param point2D 2D图像上的坐标点 {x, y}，以图像中心为原点
 * @param imageSize 全景图像的尺寸 {width, height}
 * @param radius 球体半径，默认使用常量SPHERE_RADIUS
 * @returns 3D球面坐标 {x, y, z}
 */
export function convertFromCenter(
  point2D: { x: number, y: number },
  imageSize: { width: number, height: number },
  radius: number = SPHERE_RADIUS
) {
  // 1. 将2D坐标归一化到[-0.5,0.5]范围
  const normalizedX = point2D.x / imageSize.width - 0.5;
  const normalizedY = 0.5 - point2D.y / imageSize.height;
  
  // 2. 计算球面坐标系中的经纬度
  const longitude = normalizedX * 2 * Math.PI;
  const latitude = normalizedY * Math.PI;
  
  // 3. 将球面坐标(经纬度)转换为3D直角坐标
  return {
    x: -radius * Math.cos(latitude) * Math.sin(longitude),
    y: radius * Math.sin(latitude),
    z: -radius * Math.cos(latitude) * Math.cos(longitude)
  };
}

/**
 * 带偏移量的坐标转换函数
 * @param point2D 2D图像上的坐标点 {x, y}
 * @param imageSize 全景图像的尺寸 {width, height}
 * @param offset 坐标偏移量 {x, y}
 * @param radius 球体半径，默认使用常量SPHERE_RADIUS
 * @returns 3D球面坐标 {x, y, z}
 */
export function convertWithOffset(
  point2D: { x: number, y: number },
  imageSize: { width: number, height: number },
  offset: { x: number, y: number } = { x: 0, y: 0 },
  radius: number = SPHERE_RADIUS
) {
  // 应用偏移量
  const adjustedPoint = {
    x: point2D.x + offset.x,
    y: point2D.y + offset.y
  };
  
  // 使用左上角为原点的转换函数
  return convertFromTopLeft(adjustedPoint, imageSize, radius);
}

/**
 * 将3D球面坐标转换回2D图像坐标
 * @param point3D 3D球面坐标 {x, y, z}
 * @param imageSize 全景图像的尺寸 {width, height}
 * @param radius 球体半径，默认使用常量SPHERE_RADIUS
 * @returns 2D图像坐标 {x, y}
 */
export function convert3DTo2D(
  point3D: { x: number, y: number, z: number },
  imageSize: { width: number, height: number },
  radius: number = SPHERE_RADIUS
) {
  // 计算球面角度
  const latitude = Math.acos(point3D.y / radius);
  const longitude = Math.atan2(point3D.z, point3D.x);
  
  // 转换为2D图像坐标
  const x = (longitude / (2 * Math.PI) + 0.5) * imageSize.width;
  const y = (1 - latitude / Math.PI) * imageSize.height;
  
  return { x, y };
}

/**
 * 批量转换多个2D坐标点
 * @param points2D 2D坐标点数组
 * @param imageSize 图像尺寸
 * @param radius 球体半径
 * @returns 3D坐标点数组
 */
export function batchConvert2DTo3D(
  points2D: Array<{ x: number, y: number, [key: string]: any }>,
  imageSize: { width: number, height: number },
  radius: number = SPHERE_RADIUS
) {
  return points2D.map(point => {
    const { x, y, ...rest } = point;
    const point3D = convert2DTo3D({ x, y }, imageSize, radius);
    return { ...point3D, ...rest };
  });
}

/**
 * 批量转换多个2D坐标点（以左上角为原点）
 * @param points2D 2D坐标点数组
 * @param imageSize 图像尺寸
 * @param radius 球体半径
 * @returns 3D坐标点数组
 */
export function batchConvertFromTopLeft(
  points2D: Array<{ x: number, y: number, [key: string]: any }>,
  imageSize: { width: number, height: number },
  radius: number = SPHERE_RADIUS
) {
  return points2D.map(point => {
    const { x, y, ...rest } = point;
    const point3D = convertFromTopLeft({ x, y }, imageSize, radius);
    return { ...point3D, ...rest };
  });
}

/**
 * 创建信息点配置对象
 * @param coords 3D坐标 {x, y, z}
 * @param content 显示内容
 * @param direction 方向
 * @param detail 详细信息
 * @returns 信息点配置对象
 */
export function createInfoPoint(
  coords: { x: number, y: number, z: number },
  content: string,
  direction: string = 'right',
  detail?: {
    title: string,
    direction?: string,
    image?: string,
    description: string
  } | null
) {
  return {
    x: coords.x,
    y: coords.y,
    z: coords.z,
    direction,
    content,
    detail
  };
}

// 导出坐标转换工具对象，提供统一的接口
export const coordinateConverter = {
  convert2DTo3D,
  convert3DTo2D,
  convertFromTopLeft,
  convertFromCenter,
  convertWithOffset,
  batchConvert2DTo3D,
  batchConvertFromTopLeft,
  createInfoPoint
};

// 使用示例
// const imageCoords = { x: 1060, y: 1600 };
// const panoramaSize = { width: 7380, height: 3668 };
// const worldCoords = convertFromTopLeft(imageCoords, panoramaSize);
// console.log(worldCoords);