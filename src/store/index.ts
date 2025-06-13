import { defineStore } from 'pinia';
import { Sensor } from '@/types/sensor';
export const modelStore = defineStore('model', {
    state: () => {
        return {
            config: {
                focusArea: false,
                zoom: false,
                renderMode: 'textured',
                showSky: true,
                showGround: true
            },
            currentSensor: null as Sensor | null, // ai chart for current sensor
            mode: 'model' as 'vr' | 'model', // vr or model
            defaultScene: 'model', // default scene: model or vr
            currentScene: {
                name: 'morningRoom',
                activeArea: ''
            },
            wsStatus: {
                message: '',
                status: 'connected', // connecting, connected, disconnected, error, dat
            }, // websocket message
            singleMode: true, // single mode: only show model not surface, monitoring or robots
            sceneHistory: { panoramaUrl: '', showBack: false }, // vr scene history
            updateScene: null as { panoramaUrl: string, hotspots?: Array<any>, infoPoints?: Array<any>, viewPoints?: Array<any> } | null
        }
    },
    actions: {
        setSensor(sensor: any) {
            this.currentSensor = sensor;
        },
        setScene(uri: string) {
            this.sceneHistory.panoramaUrl = '';
            this.updateScene = { panoramaUrl: uri };
        },
        setSceneHistory(uri: string, showBack: boolean, currentScene: string) {
            this.sceneHistory.panoramaUrl = uri;
            this.sceneHistory.showBack = showBack;
        },
        setCurrentScene(name: string) {
            this.currentScene.name = name;
        },
        setActiveArea(area: string) {
            this.currentScene.activeArea = area;
        },
        setConfig (config) {
            this.config = { ...this.config, ...config };
        },
        setWSMessage(message: string) {
            this.wsStatus.message = message;
        },
    }
})
