/* eslint-disable react/no-unknown-property */
'use client';

import { useMemo, useRef } from 'react';

import { ContactShadows, Environment, Float, OrbitControls, Stars, Torus } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function CursorLight(): React.ReactElement {
  const lightRef = useRef<THREE.PointLight>(null);
  const { pointer, viewport } = useThree();

  useFrame(() => {
    if (lightRef.current) {
      // Smoothly follow the pointer with some offset for dramatic lighting
      const targetX = (pointer.x * viewport.width) / 2;
      const targetY = (pointer.y * viewport.height) / 2;
      lightRef.current.position.x += (targetX - lightRef.current.position.x) * 0.1;
      lightRef.current.position.y += (targetY - lightRef.current.position.y) * 0.1;
    }
  });

  return (
    <pointLight ref={lightRef} position={[0, 0, 5]} intensity={2} color="#10b981" distance={20} />
  );
}

function OrbitingRing({
  radius,
  speed,
  rotationX,
  rotationY,
}: {
  radius: number;
  speed: number;
  rotationX: number;
  rotationY: number;
}): React.ReactElement {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * speed;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[rotationX, rotationY, 0]}>
      <Torus args={[radius, 0.02, 16, 100]}>
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
      </Torus>
    </mesh>
  );
}

function TechNode({
  position,
  color,
  size,
  speed,
  orbitRadius,
  orbitSpeed,
  orbitAxis,
}: {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitAxis: [number, number, number];
}): React.ReactElement {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const initialOffset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      // Orbit around the center
      const angle = t * orbitSpeed + initialOffset;
      groupRef.current.position.x = Math.cos(angle) * orbitRadius * orbitAxis[0];
      groupRef.current.position.y = Math.sin(angle) * orbitRadius * orbitAxis[1];
      groupRef.current.position.z = Math.sin(angle) * orbitRadius * orbitAxis[2];
    }
    if (meshRef.current) {
      // Self rotation
      meshRef.current.rotation.x = Math.sin(t * speed) * 0.5;
      meshRef.current.rotation.y = Math.cos(t * speed) * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={speed} rotationIntensity={1.5} floatIntensity={2}>
        <mesh ref={meshRef} position={position}>
          <icosahedronGeometry args={[size, 0]} />
          <meshPhysicalMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.8}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </Float>
      {/* Energy line connecting to core - simplified for performance */}
      <line>
        <bufferGeometry
          attach="geometry"
          setFromPoints={[new THREE.Vector3(0, 0, 0), new THREE.Vector3().fromArray(position)]}
        />
        <lineBasicMaterial attach="material" color={color} transparent opacity={0.1} />
      </line>
    </group>
  );
}

function CommandCoreScene(): React.ReactElement {
  const nodes = useMemo(() => {
    const items = [];
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#06b6d4'];

    for (let i = 0; i < 8; i++) {
      items.push({
        position: [
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
        ] as [number, number, number],
        color: colors[i % colors.length] ?? '#10b981',
        size: Math.random() * 0.2 + 0.2,
        speed: Math.random() * 2 + 1,
        orbitRadius: Math.random() * 3 + 2.5,
        orbitSpeed: (Math.random() * 0.5 + 0.2) * (Math.random() > 0.5 ? 1 : -1),
        orbitAxis: [
          Math.random() > 0.5 ? 1 : 0.5,
          Math.random() > 0.5 ? 1 : 0.2,
          Math.random() > 0.5 ? 1 : -0.5,
        ] as [number, number, number],
      });
    }
    return items;
  }, []);

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.2} />
      <CursorLight />

      {/* The Core */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh>
          <sphereGeometry args={[1.2, 64, 64]} />
          <meshPhysicalMaterial
            color="#0f172a"
            emissive="#10b981"
            emissiveIntensity={0.2}
            roughness={0}
            metalness={0.1}
            transmission={0.9}
            ior={1.5}
            clearcoat={1}
            clearcoatRoughness={0}
            transparent
            opacity={0.9}
          />
        </mesh>
        {/* Core inner pulse */}
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.15} wireframe />
        </mesh>
      </Float>

      {/* Orbiting Rings */}
      <OrbitingRing radius={3} speed={0.2} rotationX={Math.PI / 3} rotationY={0} />
      <OrbitingRing radius={4} speed={-0.15} rotationX={-Math.PI / 4} rotationY={Math.PI / 6} />
      <OrbitingRing radius={5} speed={0.1} rotationX={Math.PI / 6} rotationY={-Math.PI / 3} />

      {/* Tech Nodes */}
      {nodes.map((node, i) => (
        <TechNode key={i} {...node} />
      ))}

      {/* Particle Dust */}
      <Stars radius={10} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      <ContactShadows
        position={[0, -5, 0]}
        opacity={0.5}
        scale={30}
        blur={2.5}
        far={10}
        color="#10b981"
      />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2 + 0.1}
        minPolarAngle={Math.PI / 2 - 0.4}
      />
    </>
  );
}

export function Hero3DScene(): React.ReactElement {
  return (
    <div className="w-full h-full relative z-0 dark:opacity-90 opacity-80 pointer-events-none">
      <Canvas camera={{ position: [0, 2, 8], fov: 45 }} className="pointer-events-auto">
        <CommandCoreScene />
      </Canvas>
    </div>
  );
}
