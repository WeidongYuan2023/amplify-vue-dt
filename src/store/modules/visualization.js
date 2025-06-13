import { defineStore } from 'pinia';

export const useVisualizationStore = defineStore('visualization', {
  state: () => ({
    moduleIndex: 0,
    dialogVisible: false,
    dialogVisibleRobot: false,
    carouselKey: 0,
    areaImagePaths: [],
    currentSurface: null,
    gross: null,
    cleanable: null,
    robotCleanable: null,
    door: null,
    window: null,
  }),

  actions: {
    setModuleIndex(index) {
      this.moduleIndex = index;
    },
    toggleDialog() {
      this.dialogVisible = !this.dialogVisible;
    },
    toggleRobotDialog() {
      this.dialogVisibleRobot = !this.dialogVisibleRobot;
    },
    setAreaImagePaths(paths) {
      this.areaImagePaths = paths;
    },
    incrementCarouselKey() {
      this.carouselKey++;
    },
    setCurrentSurface(surface) {
      this.currentSurface = surface;
    }
  }
}); 