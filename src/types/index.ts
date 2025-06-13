export interface Hotspot {
  x: number
  y: number
  z: number
  content: string,
  detail?: {
    title: string
    direction: string
    image: string 
    description: string
  }
  panoramaUrl?: string 
}

export interface TimeInfo {
  buildingTime?: string
  currentTime?: string
  currentDate?: string,
  currentWeekday?: string
}

export interface TooltipStyle {
  left: string
  top: string
  background?: string
  color?: string
  padding?: string
  borderRadius?: string
  boxShadow?: string
  maxWidth?: string
  // 其他可能的样式属性
}