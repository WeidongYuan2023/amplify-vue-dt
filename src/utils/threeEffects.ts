import * as THREE from 'three';
import gsap from 'gsap';

/**
 * 为3D模型应用淡入淡出效果
 * @param model - THREE.Object3D 模型对象
 * @param scene - THREE.Scene 场景对象
 * @param camera - THREE.Camera 相机对象
 * @param renderer - THREE.WebGLRenderer 渲染器对象
 * @param fadeIn - 是否为淡入效果，false则为淡出
 * @param duration - 动画持续时间（秒）
 * @returns GSAP动画实例
 */
export const applyModelFadeEffect = (
  model: THREE.Object3D, 
  scene?: THREE.Scene,
  camera?: THREE.Camera,
  renderer?: THREE.WebGLRenderer,
  fadeIn = true, 
  duration = 1.2
) => {
  // 保存原始材质状态
  const originalMaterials = new Map();
  
  // 设置初始透明度
  model.traverse((node) => {
    if ((node as THREE.Mesh).isMesh && (node as THREE.Mesh).material) {
      const mesh = node as THREE.Mesh;
      if (Array.isArray(mesh.material)) {
        // 保存原始状态
        originalMaterials.set(node, mesh.material.map(mat => ({
          transparent: mat.transparent,
          opacity: mat.opacity
        })));
        
        mesh.material.forEach(mat => {
          if (mat) {
            mat.transparent = true;
            mat.opacity = fadeIn ? 0 : 1; // 淡入从0开始，淡出从1开始
          }
        });
      } else if (mesh.material) {
        // 保存原始状态
        originalMaterials.set(node, {
          transparent: mesh.material.transparent,
          opacity: mesh.material.opacity
        });
        
        mesh.material.transparent = true;
        mesh.material.opacity = fadeIn ? 0 : 1; // 淡入从0开始，淡出从1开始
      }
    }
  });
  
  // 创建淡入/淡出动画
  return gsap.to({}, {
    duration: duration,
    onUpdate: function() {
      const progress = this.progress();
      model.traverse((node) => {
        if ((node as THREE.Mesh).isMesh && (node as THREE.Mesh).material) {
          const mesh = node as THREE.Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat, index) => {
              if (mat) {
                const original = originalMaterials.get(node);
                if (original && original[index]) {
                  // 计算当前应该的不透明度
                  const originalOpacity = original[index].opacity;
                  // 淡入：从0到原始值，淡出：从原始值到0
                  mat.opacity = fadeIn 
                    ? originalOpacity * progress 
                    : originalOpacity * (1 - progress);
                }
              }
            });
          } else if (mesh.material) {
            const original = originalMaterials.get(node);
            if (original) {
              // 计算当前应该的不透明度
              const originalOpacity = original.opacity;
              // 淡入：从0到原始值，淡出：从原始值到0
              mesh.material.opacity = fadeIn 
                ? originalOpacity * progress 
                : originalOpacity * (1 - progress);
            }
          }
        }
      });
    },
    onComplete: function() {
      // 动画完成后，恢复材质的原始透明度设置
      model.traverse((node) => {
        if ((node as THREE.Mesh).isMesh && (node as THREE.Mesh).material) {
          const mesh = node as THREE.Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat, index) => {
              if (mat) {
                const original = originalMaterials.get(node);
                if (original && original[index]) {
                  // 完全恢复原始设置
                  mat.transparent = original[index].transparent;
                  mat.opacity = original[index].opacity;
                }
              }
            });
          } else if (mesh.material) {
            const original = originalMaterials.get(node);
            if (original) {
              // 完全恢复原始设置
              mesh.material.transparent = original.transparent;
              mesh.material.opacity = original.opacity;
            }
          }
        }
      });
      
      // 强制渲染一帧确保更改生效
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
  });
};