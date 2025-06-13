import { defineStore } from "pinia";
export const mainStore = defineStore("main", {
    state: () => {
        return {
            model: [
                {
                    children: [],
                    label: "Overview",
                    treeName: "Overview",
                    id: 1,
                },
                {
                    children: [],
                    label: "Area1",
                    treeName: "Area1",
                    id: 2,
                },
                {
                    children: [
                        {
                            children: [],
                            label: "Area2",
                            treeName: "Area2",
                            id: 6,
                        },
                        {
                            children: [],
                            label: "Area3",
                            treeName: "Area 3",
                            id: 7,
                        },
                        {
                            children: [],
                            label: "Area4",
                            treeName: "Area 4",
                            id: 8,
                        },
                        {
                            children: [],
                            label: "Area5",
                            treeName: "Area 5",
                            id: 9,
                        }
                    ],
                    label: "Area2-5",
                    treeName: "Area 2-5",
                    id: 3,
                },
                {
                    children: [
                        {
                            children: [],
                            label: "Area6",
                            treeName: "Area 6",
                            id: 10,
                        },
                        {
                            children: [],
                            label: "Area7",
                            treeName: "Area 7",
                            id: 11,
                        },
                    ],
                    label: "Area6-7",
                    treeName: "Area 6-7",
                    id: 4,
                },
                {
                    children: [
                        {
                            children: [],
                            label: "Area8",
                            treeName: "Area 8",
                            id: 12,
                        },
                        {
                            children: [],
                            label: "Area9",
                            treeName: "Area 9",
                            id: 13,
                        },
                        {
                            children: [],
                            label: "Area10",
                            treeName: "Area 10",
                            id: 14,
                        },
                    ],
                    label: "Area8-10",
                    treeName: "Area 8-10",
                    id: 5,
                },
                {
                    children: [],
                    label: "Area11",
                    treeName: "Area 11",
                    id: 15,
                },
                {
                    children: [],
                    label: "Area12",
                    treeName: "Area 12",
                    id: 16,
                },
                {
                    children: [],
                    label: "Area13",
                    treeName: "Area 13",
                    id: 17,
                },
            ],
            dialogVisible: false,
            dialogVisibleRobot: false,
            moduleIndex: 0,
            roomName: '',
            outLineCheckNodes: [],
            modelA: null,
            modelB: null,
            modelC: null,
            camera: null,
            gross: null,
            cleanable: null,
            robotCleanable: null,
            door: null,
            window: null,
            basicInfoImagePaths: { // the parent path and the extension .jpg will be added in the code
                "area-1": ["area-1-1", "area-1-2", "area-1-5", "area-1-6", "area-1-7"],
                "area-2": ["area-2-1", "area-2-2"],
                "area-3": ["area-3-1", "area-3-2"],
                "area-4": ["area-4-1", "area-4-2", "area-4-3", "area-4-4"],
                "area-5": ["area-5-1", "area-5-2", "area-5-3", "area-5-4", "area-5-5"],
                "area-6": ["area-6-1", "area-6-2", "area-6-3", "area-6-4"],
                "area-7": ["area-7-1"],
                "area-8": ["area-8-1", "area-8-2", "area-8-3"],
                "area-9": ["area-9-1", "area-9-2"],
                "area-10": ["area-10-1"],
                "area-11": ["area-11-1", "area-11-2"],
                "area-12": ["area-12-1", "area-12-2", "area-12-3", "area-12-4", "area-12-5"],
                "area-13": ["area-13-1", "area-13-2", "area-13-3", "area-13-4", "area-13-5", "area-13-6", "area-13-7"]
            },
            currentSurface: null,
            currentArea: null,

        }
    },
}) 