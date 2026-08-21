/* eslint-disable react/no-unknown-property */
'use client';

import { useMemo, useRef } from 'react';

import { ContactShadows, Environment, Float, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import type * as THREE from 'three';

function Node({
  position,
  color,
  size,
  speed,
}: {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
}): React.ReactElement {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.2;
      meshRef.current.rotation.y = Math.cos(state.clock.elapsedTime * speed) * 0.2;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} envMapIntensity={2} />
      </mesh>
    </Float>
  );
}

function Scene(): React.ReactElement {
  // Generate random nodes
  const nodes = useMemo(() => {
    const items = [];
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b'];

    for (let i = 0; i < 12; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4,
        ] as [number, number, number],
        color: colors[Math.floor(Math.random() * colors.length)] ?? '#10b981',
        size: Math.random() * 0.5 + 0.3,
        speed: Math.random() * 2 + 1,
      });
    }
    return items;
  }, []);

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#10b981" />

      {/* Center Main Hub Node */}
      <Float speed={2} rotationIntensity={2} floatIntensity={1}>
        <mesh position={[0, 0, 0]}>
          <octahedronGeometry args={[1.5, 0]} />
          <meshPhysicalMaterial
            color="#000000"
            emissive="#10b981"
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={0.9}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </Float>

      {/* Floating Child Nodes */}
      {nodes.map((node, i) => (
        <Node key={i} {...node} />
      ))}

      {/* Ground Shadow */}
      <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2 + 0.2}
        minPolarAngle={Math.PI / 2 - 0.5}
      />
    </>
  );
}

export function Hero3DScene(): React.ReactElement {
  return (
    <div className="w-full h-full min-h-[500px] absolute inset-0 -z-10 opacity-70 [mask-image:linear-gradient(to_bottom,white,transparent)]">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <Scene />
      </Canvas>
    </div>
  );
}
