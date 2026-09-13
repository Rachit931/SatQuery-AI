'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export type AIState = 'idle' | 'thinking' | 'responding' | 'image_uploaded' | 'location_attached' | 'error';

interface AIAssistant3DProps {
  state: AIState;
}

export default function AIAssistant3D({ state }: AIAssistant3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene, camera, renderer
    const scene = new THREE.Scene();
    
    // We want a transparent background
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    const width = 120;
    const height = 120;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Clear container and append new canvas
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Holographic core
    const coreGeometry = new THREE.IcosahedronGeometry(0.8, 2);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00f7ff,
      emissive: 0x0055ff,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
      wireframe: true,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Orbital ring 1
    const ring1Geom = new THREE.RingGeometry(1.2, 1.25, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0xa855f7, // purple
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5 
    });
    const ring1 = new THREE.Mesh(ring1Geom, ringMat);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);

    // Orbital ring 2
    const ring2Geom = new THREE.RingGeometry(1.5, 1.52, 32);
    const ring2Mat = new THREE.MeshBasicMaterial({ 
      color: 0x00f7ff, // cyan
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3 
    });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00f7ff, 2, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.01;

      // Base idle rotation
      let speedMult = 1;
      let pulseMult = 1;

      // State overrides
      if (state === 'thinking') {
        speedMult = 4;
        pulseMult = 2;
        coreMaterial.emissiveIntensity = 0.8 + Math.sin(time * 10) * 0.4;
      } else if (state === 'responding') {
        speedMult = 2;
        pulseMult = 1.5;
        coreMaterial.emissiveIntensity = 0.6 + Math.sin(time * 5) * 0.2;
      } else if (state === 'error') {
        coreMaterial.color.setHex(0xff5555);
        coreMaterial.emissive.setHex(0xff0000);
      } else {
        // Reset colors
        coreMaterial.color.setHex(0x00f7ff);
        coreMaterial.emissive.setHex(0x0055ff);
        coreMaterial.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.1;
      }

      core.rotation.y += 0.005 * speedMult;
      core.rotation.x += 0.002 * speedMult;
      
      ring1.rotation.z -= 0.01 * speedMult;
      ring1.rotation.y = Math.sin(time) * 0.2;

      ring2.rotation.z += 0.015 * speedMult;
      ring2.rotation.x = Math.PI / 2 + Math.cos(time * 0.8) * 0.2;

      // Pulse scale
      const scale = 1 + Math.sin(time * 4) * 0.02 * pulseMult;
      core.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      ring1Geom.dispose();
      ringMat.dispose();
      ring2Geom.dispose();
      ring2Mat.dispose();
    };
  }, [state]); // Re-run mostly on state change to update materials, though we could just mutate them.

  return (
    <div 
      ref={containerRef} 
      className="flex items-center justify-center w-full h-[120px] transition-all duration-500 ease-in-out"
      style={{
        filter: state === 'error' ? 'drop-shadow(0 0 10px rgba(255,0,0,0.3))' : 'drop-shadow(0 0 15px rgba(0, 247, 255, 0.4))'
      }}
    />
  );
}
