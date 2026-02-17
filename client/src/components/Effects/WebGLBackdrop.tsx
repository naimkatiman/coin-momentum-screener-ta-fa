import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const WebGLBackdrop: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const pointsCount = 1700;
    const positions = new Float32Array(pointsCount * 3);
    const colors = new Float32Array(pointsCount * 3);

    const palette = [
      new THREE.Color('#0ea5a8'),
      new THREE.Color('#0891b2'),
      new THREE.Color('#f59e0b'),
      new THREE.Color('#14b8a6'),
    ];

    for (let i = 0; i < pointsCount; i += 1) {
      const i3 = i * 3;
      const radius = 1.1 + Math.random() * 4.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.55;
      positions[i3 + 2] = radius * Math.cos(phi);

      const shade = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = shade.r;
      colors[i3 + 1] = shade.g;
      colors[i3 + 2] = shade.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.024,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const cloud = new THREE.Points(geometry, material);
    scene.add(cloud);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(3.25, 0.018, 16, 200),
      new THREE.MeshBasicMaterial({ color: '#0ea5a8', transparent: true, opacity: 0.2 })
    );
    halo.rotation.x = Math.PI / 2.1;
    scene.add(halo);

    const pointer = { x: 0, y: 0 };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 0.45;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 0.2;
    };

    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId = 0;

    const render = () => {
      const t = clock.getElapsedTime();

      cloud.rotation.y += 0.00055;
      cloud.rotation.x = THREE.MathUtils.lerp(cloud.rotation.x, pointer.y, 0.03);
      cloud.rotation.z = THREE.MathUtils.lerp(cloud.rotation.z, pointer.x, 0.03);
      cloud.position.y = Math.sin(t * 0.35) * 0.12;

      halo.rotation.z = t * 0.08;
      halo.material.opacity = 0.16 + Math.sin(t * 1.2) * 0.05;
      material.size = 0.022 + Math.sin(t * 1.35) * 0.0038;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);

      geometry.dispose();
      material.dispose();
      halo.geometry.dispose();
      (halo.material as THREE.Material).dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div className="webgl-backdrop" ref={mountRef} aria-hidden="true" />;
};
