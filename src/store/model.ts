import { defineStore } from 'pinia';
export const mainStore = defineStore('main', {
  state: () => {
    return {
      activeId: '',
      areas: [
        {
          children: [],
          label: 'Overview',
          treeName: 'Overview',
          id: 1
        },
        {
          children: [],
          label: 'Area1',
          treeName: 'Area 1',
          areaId: `area-1`,
          id: 2
        },
        {
          children: [
            {
              children: [],
              label: 'Area2',
              treeName: 'Area 2',
              areaId: `area-2`,
              id: 6
            },
            {
              children: [],
              label: 'Area3',
              treeName: 'Area 3',
              areaId: `area-3`,
              id: 7
            },
            {
              children: [],
              label: 'Area4',
              treeName: 'Area 4',
              areaId: `area-4`,
              id: 8
            },
            {
              children: [],
              label: 'Area5',
              treeName: 'Area 5',
              areaId: `area-5`,
              id: 9
            }
          ],
          label: 'Area2-5',
          treeName: 'Area 2 - 5',
          id: 3
        },
        {
          children: [
            {
              children: [],
              label: 'Area6',
              treeName: 'Area 6',
              areaId: `area-6`,
              id: 10
            },
            {
              children: [],
              label: 'Area7',
              treeName: 'Area 7',
              areaId: `area-7`,
              id: 11
            }
          ],
          label: 'Area6-7',
          treeName: 'Area 6 - 7',
          id: 4
        },
        {
          children: [
            {
              children: [],
              label: 'Area8',
              treeName: 'Area 8',
              areaId: `area-8`,
              id: 12
            },
            {
              children: [],
              label: 'Area9',
              treeName: 'Area 9',
              areaId: `area-9`,
              id: 13
            },
            {
              children: [],
              label: 'Area10',
              treeName: 'Area 10',
              areaId: `area-10`,
              id: 14
            }
          ],
          label: 'Area8-10',
          treeName: 'Area 8 - 10',
          id: 5
        },
        {
          children: [],
          label: 'Area11',
          treeName: 'Area 11',
          areaId: `area-11`,
          id: 15
        },
        {
          children: [],
          label: 'Area12',
          treeName: 'Area 12',
          areaId: `area-12`,
          id: 16
        },
        {
          children: [],
          label: 'Area13',
          treeName: 'Area 13',
          areaId: `area-13`,
          id: 17
        }
      ],
      buildingInfo: {
        address: 'Foxx Development Inc.',
        time: '9 AM to 5 PM',
        iphone: '+1 855-515-3699',
        website: 'https://foxxdevelopment.com'
      },
      dialogVisible: false,
      dialogVisibleRobot: false,
      roomName: '',
      outLineCheckNodes: [],
      modelA: null,
      modelB: null,
      modelC: null,
      camera: null,
      scale: (0.03, 0.04, 0.04),
      position: (0, 0.01, 0),
      getImageUrl: (name: any) => {
        return new URL(`/src/assets/3D/${name}`, import.meta.url).href;
      },
      getImg: (name: string) => {
        let str = name;
        if (name.startsWith('//')) {
          str = '/' + name.slice(2);
        }
        return new URL(`${str}`, import.meta.url).href;
      },
      model: {
        BASIC: 'basicInfo',
        SURFACE: 'surface',
        MONITORING: 'monitoring',
        ROBOT: 'robot'
      },
      moduleType: 'BASIC',
      rightIndex: 0,
      rightType: {
        RIGHT: 'right',
        FLOOR: 'floor',
        ROBOTDETAIL: 'robotDetail',
        SENSORDETAIL: 'sensorsDetails'
      },
      modelTypes: [
        {
          name: 'Basic Info',
          id: 'BASIC'
        },
        {
          name: 'Surface Analysis',
          id: 'SURFACE'
        },
        {
          name: 'Sensors',
          id: 'MONITORING'
        },
        {
          name: 'Cleaning Robots',
          id: 'ROBOT'
        }
      ],
      meshs: {
        area1: {
          name: 'Area1',
          label: 'Area 1',
          text: 'area-1',
          image: '/3D/ViewSelection.svg'
        },
        area2: {
          name: 'Area2',
          label: 'Area 2',
          text: 'area-2',
          image: '/3D/ViewSelection.svg'
        },
        area3: {
          name: 'Area3',
          label: 'Area 3',
          text: 'area-3',
          image: '/3D/ViewSelection.svg'
        },
        area4: {
          name: 'Area4',
          label: 'Area 4',
          text: 'area-4',
          image: '/3D/ViewSelection.svg'
        },
        area5: {
          name: 'Area5',
          label: 'Area 5',
          text: 'area-5',
          image: '/3D/ViewSelection.svg'
        },
        area6: {
          name: 'Area6',
          label: 'Area 6',
          text: 'area-6',
          icon: 'tempreture.svg',
          image: '/3D/ViewSelection.svg'
        },
        area7: {
          name: 'Area7',
          label: 'Area 7',
          text: 'area-7',
          icon: 'tempreture2.svg',
          image: '/3D/ViewSelection.svg'
        },
        area8: {
          name: 'Area8',
          label: 'Area 8',
          text: 'area-8',
          icon: 'tempreture3.svg',
          image: '/3D/ViewSelection.svg'
        },
        area9: {
          name: 'Area9',
          label: 'Area 9',
          text: 'area-9'
        },
        area10: {
          name: 'Area10',
          label: 'Area 10',
          text: 'area-10',
          image: '/3D/ViewSelection.svg'
        },
        area11: {
          name: 'Area11',
          label: 'Area 11',
          text: 'area-11',
          image: '/3D/ViewSelection.svg'
        },
        area12: {
          name: 'Area12',
          label: 'Area 12',
          text: 'area-12',
          image: '/3D/ViewSelection.svg'
        },
        area13: {
          name: 'Area13',
          label: 'Area 13',
          text: 'area-13',
          image: '/3D/ViewSelection.svg'
        }
      },
      rootPath: import.meta?.env?.VITE_APP_CONTEXT_PATH || '/',
      basicInfo: {
        imagePaths: {
          // the parent path and the extension .jpg will be added in the code
          'area-1': ['panoramic-area-1'],
          'area-2': ['panoramic-area-2'],
          'area-3': ['panoramic-area-3'],
          'area-4': ['panoramic-area-4'],
          'area-5': ['panoramic-area-5'],
          'area-6': ['panoramic-area-6'],
          'area-7': ['panoramic-area-7'],
          'area-8': ['panoramic-area-8'],
          'area-9': ['panoramic-area-9'],
          'area-10': ['panoramic-area-10'],
          'area-11': ['panoramic-area-11'],
          'area-12': ['panoramic-area-12'],
          'area-13': ['panoramic-area-13']
        },
        outsideImages: ['google-front-view.png', 'google-top-view.png'],
        rootPath: 'assets/basic-info',
        type: 'icon',
        kind: 'same', // all areas have the same icon
        modelIcons: {
          viewAll: 'circle.png'
        }
      },
      monitoring: {
        info: [
          {
            name: 'Foxx Irvine room',
            type: 'am319',
            areaId: 'area-6',
            areaName: 'Area6',
            status: 'normal',
            icon: '',
            online: 4,
            outline: 1,
            fault: 1,
            children: [
              {
                'type': 'co2',
                'name': 'co₂',
                'status': 'normal',
                'value': 894,
                'unit': 'ppm',
                'icon': 'co2'
              },
              {
                'type': 'temperature',
                'name': 'Temperature',
                'status': 'normal',
                'value': 20.8,
                'unit': '°C',
                'icon': 'temperature'
              },
              {
                'type': 'humidity',
                'name': 'Humidity',
                'status': 'normal',
                'value': 27.0,
                'unit': '% RH',
                'icon': 'humidity'
              },
              {
                'type': 'pressure',
                'name': 'Pressure',
                'status': 'normal',
                'value': 1016.0,
                'unit': 'hPa',
                'icon': 'pressure'
              },
              {
                'type': 'light',
                'name': 'Light',
                'status': 'normal',
                'value': 3,
                'unit': 'Lux',
                'icon': 'light'
              },
              {
                'type': 'tvoc',
                'name': 'TVOC',
                'status': 'warning',
                'value': 109.0,
                'unit': 'ppm',
                'icon': 'tvoc'
              },
              {
                'type': 'pm2_5',
                'name': 'PM2.5',
                'status': 'warning',
                'value': 2,
                'unit': 'μg/m3',
                'icon': 'pm2_5'
              },
              {
                'type': 'pm10',
                'name': 'PM10',
                'status': 'error',
                'value': 2,
                'unit': 'μg/m3',
                'icon': 'pm10'
              },
              {
                'type': 'hcho',
                'name': 'HCHO',
                'status': 'error',
                'value': 0.07,
                'unit': 'ppm',
                'icon': 'hcho'
              }
            ]
          },
          {
            name: 'Chen_floor',
            type: 'ws303',
            areaId: 'area-7',
            areaName: 'Area7',
            icon: '',
            status: 'warning',
            online: 1,
            outline: 0,
            fault: 1,
            children: [
              {
                'type': 'temperature',
                'name': 'lkge status',
                'value': 20.8,
                'unit': '°C',
                'status': 'normal',
                'icon': 'default-icon'
              },
              {
                'type': 'pm10',
                'name': 'PM10',
                'status': 'warning',
                'value': 3,
                'unit': 'μg/m3',
                'icon': 'pm10'
              },
              {
                'type': 'hcho',
                'name': 'HCHO',
                'status': 'error',
                'value': 0.09,
                'unit': 'ppm',
                'icon': 'hcho'
              }
            ]
          },
          {
            name: 'Rocket_floor',
            type: 'em500pp',
            areaId: 'area-8',
            areaName: 'Area8',
            icon: '',
            status: 'error',
            online: 1,
            outline: 1,
            fault: 1,
            children: [
              {
                'type': 'co2',
                'name': 'co₂',
                val: 2000,
                unit: 'ppm',
                status: 'normal',
                icon: ''
              },
              {
                'type': 'humidity',
                'name': 'Humidity',
                'status': 'warning',
                'value': 27.0,
                'unit': '% RH',
                'icon': 'humidity'
              },
              {
                'type': 'light',
                'name': 'Light',
                'status': 'normal',
                'value': 3,
                'unit': 'Lux',
                'icon': 'light'
              }
            ]
          }
        ],
        rootPath: 'assets/monitoring',
        type: 'icon',
        kind: 'fromData', // each area has the different icon
        modelIcons: {
          'Area6': 'tempreture.svg',
          'Area7': 'tempreture2.svg',
          'Area8': 'tempreture3.svg'
        }
      },
      surface: {
        rootPath: 'assets/surface-analysis',
        detailImages: {
          'gross': 'icon-gross.png',
          'cleanable': 'icon-cleanable.png',
          'robot': 'icon-robot.png'
        },
        imagePaths: [
          {
            name: 'Area1',
            areaId: 'area-1',
            imgs: ['area-1-1', 'area-1-2', 'area-1-5', 'area-1-6', 'area-1-7']
          },
          {
            name: 'Area2',
            areaId: 'area-2',
            imgs: ['area-2-1', 'area-2-2']
          },
          {
            name: 'Area3',
            areaId: 'area-3',
            imgs: ['area-3-1', 'area-3-2']
          },
          {
            name: 'Area4',
            areaId: 'area-4',
            imgs: ['area-4-1', 'area-4-2', 'area-4-3', 'area-4-4']
          },
          {
            name: 'Area5',
            areaId: 'area-5',
            imgs: ['area-5-1', 'area-5-2', 'area-5-3', 'area-5-4', 'area-5-5']
          },
          {
            name: 'Area6',
            areaId: 'area-6',
            imgs: ['area-6-1', 'area-6-2', 'area-6-3', 'area-6-4']
          },
          {
            name: 'Area7',
            areaId: 'area-7',
            imgs: ['area-7-1']
          },
          {
            name: 'Area8',
            areaId: 'area-8',
            imgs: ['area-8-1', 'area-8-2', 'area-8-3']
          },
          {
            name: 'Area9',
            areaId: 'area-9',
            imgs: ['area-9-1', 'area-9-2']
          },
          {
            name: 'Area10',
            areaId: 'area-10',
            imgs: ['area-10-1']
          },
          {
            name: 'Area11',
            areaId: 'area-11',
            imgs: ['area-11-1', 'area-11-2']
          },
          {
            name: 'Area12',
            areaId: 'area-12',
            imgs: ['area-12-1', 'area-12-2', 'area-12-3', 'area-12-4', 'area-12-5']
          },
          {
            name: 'Area13',
            areaId: 'area-13',
            imgs: ['area-13-1', 'area-13-2', 'area-13-3', 'area-13-4', 'area-13-5', 'area-13-6', 'area-13-7']
          }
        ],
        info: {
          list: [
            {
              img: 'icon-gross.png',
              name: `Gross \rSQ.FT`,
              type: 'gross',
              count: '5424'
            },
            {
              img: 'icon-cleanable.png',
              name: `Cleanable \rSQ.FT`,
              type: 'cleanable',
              count: '3796.8'
            },
            {
              img: 'icon-robot.png',
              name: `Robot \rSQ.FT`,
              type: 'robotCleanable',
              count: '3254.4'
            }
          ],
          detail: {
            door: 18,
            window: 7
          }
        }
      },
      robots: {
        rootPath: 'assets/cleaning-robots',
        type: 'icon',
        kind: 'robot',
        modelIcons: {
          'Area6': 'robotImg.png',
          'Area1': 'robotImg.png'
        },
        info: [
          {
            name: 'NEXUS-F1-CR201',
            type: 'Robot T800-FX100',
            status: 'Online',
            batteryLife: ' 2h 80min',
            scopeResp: '39,527 SQFT',
            state: 'maintenance',
            battery: ' 100%',
            areaName: 'Area6',
            // stateIcon: inFeet,
            // batteryIcon: battery100,
            areaId: 6
          },
          {
            name: 'NEXUS-F1-CR202',
            type: 'Robot T800-FX100',
            status: 'Online',
            batteryLife: ' 1h 20min',
            scopeResp: '21,423 SQFT',
            state: 'In Fleet',
            battery: ' 90%',
            areaName: 'Area1',
            // stateIcon: inFeet,
            // batteryIcon: battery100,
            areaId: 1
          }
        ]
      }
    };
  }
});
