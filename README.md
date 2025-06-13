
# 博物馆网页门户 (Museum Web Portal)

数字孪生网页门户是一个基于 Vue 3 和 Three.js 的交互式 3D 博物馆展示平台，提供沉浸式的虚拟参观体验。

## 项目概述

该项目旨在创建一个数字化博物馆体验，让用户能够通过网页浏览器探索博物馆的各个展厅和展品。系统支持 3D 模型展示、VR 全景浏览、展品详情查看等功能，为用户提供身临其境的博物馆参观体验。

## 主要功能

- **3D 场景浏览**：使用 Three.js 渲染的交互式 3D 博物馆场景
- **VR 全景体验**：支持 360° 全景图浏览，提供沉浸式体验
- **展厅详情查看**：点击展厅可查看详细信息和高清模型
- **场景切换**：在不同展厅和视角之间平滑切换
- **信息点标记**：在场景中显示重要位置和展品的标记点
- **响应式设计**：适配不同设备屏幕尺寸

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **3D 渲染**：Three.js
- **状态管理**：Pinia
- **UI 组件**：自定义组件
- **构建工具**：Vite
- **样式**：SCSS

## 项目结构

```
museum-web-portal/
├── public/                 # 静态资源
│   └── draco/              # Draco 压缩库
├── src/
│   ├── api/                # API 请求
│   ├── assets/             # 项目资源
│   ├── components/         # 组件
│   │   ├── features/       # 功能组件
│   │   ├── three/          # Three.js 相关组件
│   │   └── ui/             # UI 组件
│   ├── composables/        # 组合式函数
│   ├── config/             # 配置文件
│   ├── constants/          # 常量定义
│   ├── router/             # 路由配置
│   ├── store/              # 状态管理
│   ├── types/              # TypeScript 类型定义
│   └── utils/              # 工具函数
├── .env                    # 环境变量
└── vite.config.ts          # Vite 配置
```

## 核心组件

### ThreeScene

主要的 3D 场景渲染组件，负责加载和显示博物馆的整体 3D 模型，处理用户交互和场景切换。

### VRScene

VR 全景浏览组件，提供 360° 全景图浏览体验，支持热点交互和场景切换。

### DetailViewer

展厅详情查看组件，用于显示选中展厅的高清 3D 模型和详细信息。

## 使用指南

1. **场景导航**：
   - 使用鼠标拖拽旋转视角
   - 滚轮缩放场景
   - 点击标记点查看详情或切换场景

2. **VR 模式**：
   - 在主界面选择 VR 图标进入全景模式
   - 拖拽改变视角
   - 点击热点切换场景或查看展品详情

3. **展品详情**：
   - 点击展品查看详细信息
   - 可旋转和缩放 3D 模型以查看细节

## 开发指南

### 添加新展厅

1. 准备 3D 模型文件 (.glb/.gltf)
2. 在 `config/vrSceneConfig.js` 中添加新展厅配置
3. 更新场景切换逻辑

### 添加新展品

1. 准备展品 3D 模型
2. 在相应展厅的配置中添加展品信息
3. 添加展品标记点和交互逻辑

### 自定义热点

1. 在 `composables/useVRScene.ts` 中定义新的热点类型
2. 在场景配置中添加热点信息
3. 实现热点交互逻辑


## 前置条件

### 系统要求
- 操作系统：Windows 10/11、macOS 或 Linux
- 浏览器：支持 WebGL 的现代浏览器（Chrome 90+、Firefox 88+、Safari 14+、Edge 90+）
- 显卡：支持 WebGL 2.0 的显卡

### 开发环境要求
- Node.js 16.x 或更高版本
- npm 8.x 或更高版本
- Git

### 资源要求
- 3D 模型文件（.glb/.gltf 格式）
- 全景图像（.jpg/.png 格式，建议分辨率 4096x2048 或更高）
- 纹理和材质文件

### 后端支持
- 打开展厅或者VR场景需要后端接口返回的3D模型和全景图的路径
- 完整功能需要后端提供的接口支持

## 安装与运行

### 安装步骤

1. 克隆项目仓库

```bash
git clone <repository-url>
cd museum-web-portal
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

4. 构建生产版本

```bash
npm run build
```

5. 预览生产构建

```bash
npm run preview
```

### 部署说明

#### 静态服务器部署
1. 构建项目
```bash
npm run build
```

2. 将 `dist` 目录下的文件部署到静态服务器（如 Nginx、Apache）

#### Docker 部署
1. 构建 Docker 镜像
```bash
docker build -t museum-web-portal .
```

2. 运行 Docker 容器
```bash
docker run -p 8080:80 museum-web-portal
```