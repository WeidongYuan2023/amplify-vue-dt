import type { Hotspot } from '@/types'

export const HOTSPOT_POSITIONS: Hotspot[] = [
  { x: 50, y: 0, z: 0, content: "展品 1" },
  { x: -50, y: 0, z: 0, content: "展品 2" },
  { x: 0, y: 50, z: 0, content: "展品 3" }
]

// 坐标转换示例
const point2D = { x: 1060, y: 1600 }
const imageSize = { width: 7380, height: 3668 }

// 转换为球面坐标
const spherePoint = {
  x: 100 * Math.sin(Math.PI * (1 - point2D.y/imageSize.height)) * 
     Math.cos(2 * Math.PI * (point2D.x/imageSize.width - 0.5)),
  y: 100 * Math.cos(Math.PI * (1 - point2D.y/imageSize.height)),
  z: 100 * Math.sin(Math.PI * (1 - point2D.y/imageSize.height)) * 
     Math.sin(2 * Math.PI * (point2D.x/imageSize.width - 0.5))
}
const whethers = ['cloudy',
  'HeavyRain',
  'MidRain',
  'NightPartlyCloudy',
  'NightSunny',
  'PartlyCloudy',
  'Shower',
  'Snow',
  'Sunny',
  'ThinRain']
export const CAMERA_ANIMATION_DURATION = 1000
export const SPHERE_RADIUS = 500