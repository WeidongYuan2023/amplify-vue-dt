// 定义信息点类型
export interface InfoPoint {
  x: number;
  y: number;
  z: number;
  direction: string;
  content: string;
  detail: {
    title: string;
    direction?: string;
    image?: string;
    description: string;
  };
}

// 定义视角点类型
export interface ViewPoint {
  x: number;
  y: number;
  z: number;
  content: string;
  panoramaUrl: string;
}

// 定义热点类型
export interface Hotspot {
  x: number;
  y: number;
  z: number;
  content: string;
  detail?: any;
}

// 定义VR场景配置类型
export interface VRSceneConfig {
  panoramaUrl: string;
  hotspots: Hotspot[];
  infoPoints: InfoPoint[];
  viewPoints: ViewPoint[];
}

export const vrSceneConfig = {
  panoramaUrl: 'vrChart.png',
  
  // Hotspot configuration - Camera will move to this position when clicked
  // hotspots: [
  //   { x: 50, y: 0, z: 0, content: "Exhibit 1" },
  //   { x: -50, y: 0, z: 0, content: "Exhibit 2" },
  //   { x: 0, y: 50, z: 0, content: "Exhibit 3" }
  // ],

  hotspotsList: [
    { x: 2560, y: 2200, content: "Exhibit 1" }
  ],
  
  // Info points configuration - Shows tooltip when clicked
  // infoPoints: [
  //   { x: 30, y: 20, z: 30, direction: 'left', content: "This is an information point, click for details" },
  //   { x: -30, y: -20, z: 30, direction: 'left', content: "This is another information point with exhibit details" },
  //   { x: 0, y: -30, z: -40, direction: 'left', content: "Here are more exhibit introductions" }
  // ],
  infoPointList: [
    { 
      x: 1300, 
      y: 1525, 
      direction: 'left', 
      content: "Technology Exhibition",
      detail: {
        title: "Technology Exhibition",
        direction: 'right', 
        image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop",
        description: "Exhibition Area A showcases cutting-edge technology products, including the latest VR devices and smart home systems. Visitors can experience these products firsthand and learn about future technology trends."
      }
    },
    { 
      x: 380, 
      y: 1800, 
      direction: 'left', 
      content: "Historical Exhibition",
      detail: {
        title: "Historical Exhibition",
        direction: 'right',
        image: "https://images.unsplash.com/photo-1566054757965-8c4085344c96?q=80&w=2069&auto=format&fit=crop",
        description: "The Historical Artifacts Exhibition displays precious historical relics, including ancient pottery, bronze ware, and calligraphy works. Each exhibit has hundreds of years of history, reflecting the cultural characteristics and craftsmanship of different periods."
      }
    },
    { 
      x: 3120, 
      y: 1780, 
      direction: 'left', 
      content: "Interactive Experience",
      detail: {
        title: "Interactive Experience",
        direction: 'right',
        image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?q=80&w=2070&auto=format&fit=crop",
        description: "The Interactive Experience Zone is one of the highlights of this exhibition, featuring multiple interactive installations and games. Visitors can participate through touchscreens and motion-sensing devices, experiencing the perfect combination of technology and art. This area is especially suitable for families and children."
      }
    }
  ],
  
  // View points configuration - Changes panorama when clicked
  viewPointList: [
    // { 
    //   x: 4800, y: 2800, 
    //   direction: 'up', 
    //   content: "Exhibition Hall View", 
    //   panoramaUrl: 'https://cdn.pixabay.com/photo/2016/01/22/20/42/man-1156619_1280.jpg'
    // },
    // { 
    //   x: 6700, y: 2100, 
    //   direction: 'up', 
    //   content: "Top Floor View", 
    //   panoramaUrl: 'https://cdn.pixabay.com/photo/2017/01/19/23/46/panorama-1993645_1280.jpg'
    // }
  ]
}

// 交互点配置列表
export const morningRoomPoints = [
    { id: 'annotation0', position: { x: -2.52596, y: 1.70372, z: 2.2272}, color: 0xffffff, title: 'annotation0', cameraPosition: { x: -0.9663508137262427, y: 2.1739499499347863, z: 2.3758794639552594 }, cameraLookAt: { x: -1.9153222335032094, y: 2.1230178121309, z: 2.6871015097444575 } },
    { id: 'annotation1', position: { x: 2.45621, y: 2.27527, z: -2.20554}, color: 0xffffff, title: 'annotation1', cameraPosition: { 
        x:0.7867590415563405, y:2.6561591316569966, z:-0.7765455524279725 }, cameraLookAt: { x:1.236415277867895, y:2.589798766157637, z:-1.6672787173190746 } },
    { id: 'annotation2', position: { x: -2.23717, y: 1.46551, z: -1.7067}, color: 0xffffff, title: 'annotation2', cameraPosition: { x: -1.9744911996182322, y: 2.306922749656028, z: 1.0697409648687208 }, cameraLookAt: { x: -2.379410328368646, y: 2.249954371456774, z: 0.1571648841733344 } },
    { id: 'annotation3', position: { x: 0.144886, y: 1.58846, z: -2.65758}, color: 0xffffff, title: 'annotation3', cameraPosition: { x: 0.759697171637139, y: 1.9268762689780023, z: -1.460553169570961 }, cameraLookAt: { x: 0.4284981512992308, y: 1.700780485444151, z: -2.376625167612285 } },
    { id: 'annotation4', position: { x: 3.78, y: 1.68, z: 0.83}, color: 0xffffff, title: 'annotation4', cameraPosition: { x: 1.2319419959073197, y: 2.2246785812073817, z: 1.0542250231083983 }, cameraLookAt: { x: 2.1382443397526387, y: 2.1425206252606483, z: 0.6396576198853083 } },
    { id: 'annotation6', position: { x: -0.033053, y: 5.17387, z: -1.40863}, color: 0xffffff, title: 'annotation6', cameraPosition: { x: 0.9515166446321575, y: 1.092915232988878, z: -0.013262312330596021 }, cameraLookAt: { x: 0.7165213820276821, y: 2.0605126733761345, z: 0.07910878655581767 } },
    { id: 'annotation8', position: { x: -1.15573, y: 1.07829, z: 2.19375}, color: 0xffffff, title: 'annotation8', cameraPosition: { x: -0.8630028368098004, y: 1.5211971887012348, z: 0.7340895128150144 }, cameraLookAt: { x: -0.6376054502548028, y: 1.1360517278538786, z: 1.6289967661786546 } },
];


// 定义模式映射
export const modeMaps = {
  model: {
    'area6': 'the_great_drawing_room.glb',
    'area-6': 'the_great_drawing_room.glb',
    'area1': 'the_morning_room.glb',
    'area-1': 'the_morning_room.glb'
  },
  vr: {
    'area13': 'vrChart.png',
    'area-13': 'vrChart.png'
  },
  sceneMap: {
    'area1': 'morningRoom',
    'area-1': 'morningRoom',
    'area6': 'drawingRoom',
    'area-6': 'drawingRoom'
  },
  sceneVRMap: {
    'area13': 'museum',
    'area-13': 'museum'
  },
  name: {
    'office': 'floor_latest1.glb',
    'museum': 'vrChart.png',
    'morningRoom': 'the_great_drawing_room.glb',
    'drawingRoom': 'the_morning_room.glb',
  },
  alias: {
    'office': '',
    'museum': '13001',
    'morningRoom': '1001',
    'drawingRoom': '6001',
  },
  areaName: {
    'area6': 'Drawing Room',
    'area1': 'Morning Room',
    'area13': 'Museum',
  }
}