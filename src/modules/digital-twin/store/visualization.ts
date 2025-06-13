import { defineStore } from 'pinia';

interface Area {
  id: number;
  label: string;
  children: Area[];
}

export const useVisualizationStore = defineStore('visualization', {
  state: () => ({
    moduleIndex: 0,
    roomName: '',
    currentArea: null as Area | null,
    currentSurface: null,
    dialogVisible: false,
    dialogVisibleRobot: false,
    basicInfoImagePaths: {
      'area-1': ['1-1', '1-2', '1-3'],
      'area-2': ['2-1', '2-2', '2-3'],
      'area-3': ['3-1', '3-2', '3-3'],
    },
    model: [
      {
        id: 1,
        label: '数字孪生建筑',
        children: [
          {
            id: 2,
            label: 'Level 1',
            children: [
              { id: 4, label: 'Room A', children: [] },
              { id: 5, label: 'Room B', children: [] },
              { id: 6, label: 'Room C', children: [] }
            ]
          },
          {
            id: 3,
            label: 'Level 2',
            children: [
              { id: 7, label: 'Room D', children: [] },
              { id: 8, label: 'Room E', children: [] }
            ]
          },
          { id: 9, label: 'Overview', children: [] }
        ]
      }
    ]
  }),
  
  actions: {
    setModuleIndex(index: number) {
      this.moduleIndex = index;
    }
    // Additional actions can be added here
  },
  
  getters: {
    // Getters can be added here
  }
}); 