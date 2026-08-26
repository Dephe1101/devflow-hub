/* eslint-disable react/no-unknown-property */
'use client';

import { useRef } from 'react';

import Link from 'next/link';

import { Environment, Float, Scroll, ScrollControls, Stars, useScroll } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Terminal } from 'lucide-react';
import * as THREE from 'three';

import { Button } from '@repo/ui';

// ---------------------------------------------
// 3D Elements
// ---------------------------------------------

function CursorLight(): React.ReactElement {
  const lightRef = useRef<THREE.PointLight>(null);
  const { pointer, viewport } = useThree();

  useFrame(() => {
    if (lightRef.current) {
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

function TechNode({
  index,
  total,
  color,
  size,
}: {
  index: number;
  total: number;
  color: string;
  size: number;
}): React.ReactElement {
  const groupRef = useRef<THREE.Group>(null);
  const scroll = useScroll();

  const initialAngle = (index / total) * Math.PI * 2;
  const initialRadius = 3;

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }
    const offset = scroll.offset; // 0 to 1
    const t = state.clock.elapsedTime;

    // Page 0 (0 - 0.2): Orbiting normally
    // Page 1 (0.2 - 0.4): Chaos! Scatter far away
    // Page 2 (0.4 - 0.6): Structured grid (Workspaces)
    // Page 3 (0.6 - 0.8): Merging into Core
    // Page 4 (0.8 - 1.0): Disappear inside

    let targetX = 0;
    let targetY = 0;
    let targetZ = 0;

    if (offset < 0.2) {
      // Orbiting
      const angle = initialAngle + t * 0.2;
      targetX = Math.cos(angle) * initialRadius;
      targetY = Math.sin(t * 0.5 + index) * 0.5;
      targetZ = Math.sin(angle) * initialRadius;
    } else if (offset < 0.4) {
      // Chaos
      const chaosFactor = (offset - 0.2) * 5; // 0 to 1
      const angle = initialAngle + t * (0.2 + chaosFactor * 2);
      const radius = initialRadius + chaosFactor * 10;
      targetX = Math.cos(angle) * radius;
      targetY = Math.sin(angle * 2) * radius + (Math.random() - 0.5) * chaosFactor;
      targetZ = Math.sin(angle) * radius;
    } else if (offset < 0.6) {
      // Grid
      const cols = Math.ceil(Math.sqrt(total));
      const row = Math.floor(index / cols);
      const col = index % cols;
      const spacing = 1.5;
      const startX = -(cols * spacing) / 2 + spacing / 2;
      const startY = (cols * spacing) / 2 - spacing / 2;

      targetX = THREE.MathUtils.lerp(groupRef.current.position.x, startX + col * spacing, 0.05);
      targetY = THREE.MathUtils.lerp(groupRef.current.position.y, startY - row * spacing, 0.05);
      targetZ = THREE.MathUtils.lerp(groupRef.current.position.z, -2, 0.05);
    } else {
      // Merging into core
      targetX = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.05);
      targetY = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.05);
      targetZ = THREE.MathUtils.lerp(groupRef.current.position.z, 0, 0.05);
    }

    // Smooth transition
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.1);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);

    groupRef.current.rotation.x += 0.01;
    groupRef.current.rotation.y += 0.01;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <icosahedronGeometry args={[size, 0]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
}

function CommandCore(): React.ReactElement {
  const coreRef = useRef<THREE.Mesh>(null);
  const scroll = useScroll();

  useFrame((state) => {
    if (!coreRef.current) {
      return;
    }
    const offset = scroll.offset;

    // Rotate core based on scroll
    coreRef.current.rotation.y = state.clock.elapsedTime * 0.2 + offset * Math.PI * 4;

    // Scale core based on scroll (zooms in at the end)
    let targetScale = 1;
    if (offset > 0.8) {
      targetScale = 1 + (offset - 0.8) * 5 * 10; // explode
    }
    coreRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshPhysicalMaterial
          color="#0f172a"
          emissive="#10b981"
          emissiveIntensity={0.2}
          roughness={0}
          metalness={0.1}
          transmission={0.9}
          ior={1.5}
          clearcoat={1}
          transparent
          opacity={0.9}
        />
      </mesh>
      {/* Inner pulse */}
      <mesh>
        <sphereGeometry args={[1.0, 32, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.15} wireframe />
      </mesh>
    </Float>
  );
}

function SceneContext(): React.ReactElement {
  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#06b6d4', '#eab308'];

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.2} />
      <CursorLight />

      <CommandCore />

      {Array.from({ length: 12 }).map((_, i) => (
        <TechNode
          key={i}
          index={i}
          total={12}
          color={colors[i % colors.length] ?? '#10b981'}
          size={Math.random() * 0.2 + 0.3}
        />
      ))}

      <Stars radius={20} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
    </>
  );
}

// ---------------------------------------------
// HTML Overlays (Scrollytelling Pages)
// ---------------------------------------------

function HtmlOverlays(): React.ReactElement {
  return (
    <Scroll html style={{ width: '100%', height: '100%' }}>
      {/* Page 1: Hero (0vh) */}
      <div className="w-screen h-screen flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Tái định nghĩa luồng công việc Lập trình</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-bold font-heading tracking-tight leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70 drop-shadow-lg">
            Làm chủ Luồng công việc.
            <br />
            <span className="text-primary">Chỉ với Một Cú Click.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground/80 max-w-2xl mx-auto mb-10">
            Cuộn xuống để khám phá kỷ nguyên mới của sự tập trung.
          </p>
        </div>
      </div>

      {/* Page 2: Chaos (100vh) */}
      <div className="w-screen h-screen flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <div className="pointer-events-auto max-w-3xl bg-background/30 p-8 rounded-3xl backdrop-blur-md border border-border/20">
          <h2 className="text-4xl md:text-6xl font-bold font-heading tracking-tight mb-6 text-destructive">
            Vấn đề của sự Phân tâm
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Hàng tá tab trình duyệt. Terminal mở lộn xộn. Lạc lối giữa hàng chục công cụ mỗi dự án.
            Bạn đang mất đi Flow State mỗi ngày.
          </p>
        </div>
      </div>

      {/* Page 3: Solution Grid (200vh) */}
      <div className="w-screen h-screen flex flex-col items-start justify-center px-8 md:px-24 pointer-events-none">
        <div className="pointer-events-auto max-w-2xl bg-background/30 p-8 rounded-3xl backdrop-blur-md border border-border/20">
          <h2 className="text-4xl md:text-6xl font-bold font-heading tracking-tight mb-6 text-primary">
            Mọi thứ bạn cần.
            <br />
            Không có gì dư thừa.
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            WorkFlow Hub tự động gom nhóm tất cả tài nguyên (URL, App, Terminal) vào các Workspaces.
            Mở toàn bộ chỉ bằng một phím tắt duy nhất.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-md">
              <div className="font-bold text-lg mb-1">Giao diện Siêu tốc</div>
              <div className="text-sm text-muted-foreground">
                Quản lý Workspace với React 19 & Zustand
              </div>
            </div>
            <div className="p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-md">
              <div className="font-bold text-lg mb-1">Dữ liệu Local</div>
              <div className="text-sm text-muted-foreground">
                Lưu trữ siêu nhẹ bằng SQLite. Không độ trễ.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page 4: Architecture (300vh) */}
      <div className="w-screen h-screen flex flex-col items-end justify-center px-8 md:px-24 pointer-events-none text-right">
        <div className="pointer-events-auto max-w-2xl bg-background/30 p-8 rounded-3xl backdrop-blur-md border border-border/20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 text-amber-500 font-medium text-sm mb-4">
            <Terminal className="w-4 h-4" /> Sắp ra mắt ở Phase 2
          </div>
          <h2 className="text-4xl md:text-6xl font-bold font-heading tracking-tight mb-6">
            Sức mạnh từ Tauri & Rust
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Bứt phá giới hạn trình duyệt. Tích hợp sâu vào hệ điều hành. Mở VSCode, IntelliJ và gọi
            Shell Script trực tiếp từ Dashboard.
          </p>
        </div>
      </div>

      {/* Page 5: CTA (400vh) */}
      <div className="w-screen h-screen flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <div className="pointer-events-auto">
          <h2 className="text-5xl md:text-7xl font-bold font-heading tracking-tight mb-8">
            Bạn đã sẵn sàng bước vào Flow State?
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="w-full sm:w-auto text-xl h-16 px-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)] transition-all hover:scale-110"
              >
                Trải nghiệm WorkFlow Hub
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Scroll>
  );
}

// ---------------------------------------------
// Main Component
// ---------------------------------------------

export function ScrollyScene(): React.ReactElement {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#020617]">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <ScrollControls pages={5} damping={0.25} distance={1.2}>
          <SceneContext />
          <HtmlOverlays />
        </ScrollControls>
      </Canvas>
    </div>
  );
}
