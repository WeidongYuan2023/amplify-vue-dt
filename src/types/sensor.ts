// 传感器数据类型定义
export interface SensorChild {
    type: string;
    name: string;
    value: number;
    unit: string;
    status: 'normal' | 'warning' | 'error';
    icon: string;
}

export interface Sensor {
    name: string;
    type: string;
    id?: string;
    areaId: string;
    areaName: string;
    icon: string;
    status: string;
    online: number;
    outline: number;
    fault: number;
    children: SensorChild[];
}