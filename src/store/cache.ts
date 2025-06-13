import { defineStore } from 'pinia';
import * as THREE from 'three';

// 定义LRU缓存的最大大小（可以根据需要调整）
const MAX_CACHE_SIZE = 3; // 最多缓存3个模型

export const modelCacheStore = defineStore('modelCache', () => {
  // 使用Map来存储模型和访问时间
  const modelCache = new Map();
  const lastAccessTime = new Map(); // 记录每个模型的最后访问时间
  
  // 添加模型到缓存
  function addModel(path: string, model: any) {
    // 如果缓存已满，先清理最久未使用的模型
    if (modelCache.size >= MAX_CACHE_SIZE && !modelCache.has(path)) {
      cleanLeastRecentlyUsed();
    }
    
    modelCache.set(path, model);
    lastAccessTime.set(path, Date.now());
    
    // 输出当前缓存大小
    console.log(`Model cached: ${path}, current cache size: ${modelCache.size}`);
  }
  
  // 从缓存获取模型
  function getModel(path: string) {
    if (modelCache.has(path)) {
      // 更新访问时间
      lastAccessTime.set(path, Date.now());
      return modelCache.get(path);
    }
    return null;
  }
  
  // 检查缓存中是否有模型
  function hasModel(path: string) {
    return modelCache.has(path);
  }
  
  // 清理最久未使用的模型
  function cleanLeastRecentlyUsed() {
    if (modelCache.size === 0) return;
    
    // 找出最久未访问的模型路径
    let oldestPath = null;
    let oldestTime = Infinity;
    
    lastAccessTime.forEach((time, path) => {
      if (time < oldestTime) {
        oldestTime = time;
        oldestPath = path;
      }
    });
    
    if (oldestPath) {
      // 释放该模型的资源
      disposeModel(modelCache.get(oldestPath));
      
      // 从缓存中移除
      modelCache.delete(oldestPath);
      lastAccessTime.delete(oldestPath);
      
      console.log(`Cleaned least recently used model: ${oldestPath}`);
    }
  }
  
  // 释放单个模型资源
  function disposeModel(model: any) {
    if (!model) return;
    
    model.traverse((object: any) => {
      if (object.geometry) {
        object.geometry.dispose();
      }
      
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material: any) => {
            disposeMaterial(material);
          });
        } else {
          disposeMaterial(object.material);
        }
      }
    });
  }
  
  // 释放材质资源
  function disposeMaterial(material: any) {
    // 释放材质的所有纹理
    for (const key in material) {
      const value = material[key];
      if (value && typeof value === 'object' && 'isTexture' in value) {
        value.dispose();
      }
    }
    material.dispose();
  }
  
  // 清理所有缓存
  function clearCache() {
    modelCache.forEach((model) => {
      disposeModel(model);
    });
    modelCache.clear();
    lastAccessTime.clear();
    console.log('All model caches cleared');
    
    // 强制垃圾回收（如果浏览器支持）
    if (window.gc) window.gc();
  }
  
  // 获取当前缓存大小
  function getCacheSize() {
    return modelCache.size;
  }
  
  // 手动触发内存优化
  function optimizeMemory() {
    // 如果缓存超过一定大小，清理一部分
    if (modelCache.size > MAX_CACHE_SIZE / 2) {
      cleanLeastRecentlyUsed();
    }
    
    // 尝试触发垃圾回收
    if (window.gc) window.gc();
  }
  
  return {
    modelCache,
    addModel,
    getModel,
    hasModel,
    clearCache,
    getCacheSize,
    optimizeMemory
  };
});