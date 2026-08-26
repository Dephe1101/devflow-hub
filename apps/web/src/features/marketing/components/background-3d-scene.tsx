/* eslint-disable react/no-unknown-property */
'use client';

import { useRef } from 'react';

import { Environment, Float, Html, RoundedBox, Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import { Database, Folder, Globe, Layout, Server, ShieldCheck, Terminal } from 'lucide-react';
import * as THREE from 'three';

/* ---------------------------------------------
 * 3D MOCK UI COMPONENTS (Html over 3D Box)
 * --------------------------------------------- */

function BrowserWindow({ url }: { url: string }): React.ReactElement {
  return (
    <div className="w-[400px] h-[260px] bg-card border border-border/20 rounded-xl overflow-hidden flex flex-col opacity-90 backdrop-blur-md">
      <div className="h-10 bg-muted/80 border-b border-border/30 flex items-center px-4 gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="flex-1 bg-background/80 rounded-md h-6 text-[11px] text-muted-foreground flex items-center px-3 font-mono">
          <Globe className="w-3 h-3 mr-2" /> {url}
        </div>
      </div>
      <div className="flex-1 p-6 flex flex-col gap-4 bg-background/50">
        <div className="h-8 w-3/4 bg-primary/20 rounded-md" />
        <div className="h-4 w-full bg-muted/80 rounded-md" />
        <div className="h-4 w-5/6 bg-muted/80 rounded-md" />
        <div className="h-4 w-4/6 bg-muted/80 rounded-md" />

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="h-16 bg-muted/50 rounded-lg"></div>
          <div className="h-16 bg-muted/50 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

function TerminalWindow(): React.ReactElement {
  return (
    <div className="w-[360px] h-[240px] bg-[#0c0c0c] border border-border/20 rounded-xl overflow-hidden flex flex-col opacity-95">
      <div className="h-10 bg-[#1a1a1a] flex items-center px-4 justify-between border-b border-[#333]">
        <div className="flex gap-2 items-center text-muted-foreground text-xs font-mono">
          <Terminal className="w-4 h-4" /> System Control
        </div>
      </div>
      <div className="flex-1 p-5 font-mono text-[13px] flex flex-col gap-2">
        <div className="text-green-400">
          ➜ <span className="text-blue-400">workspace</span> status check
        </div>
        <div className="text-gray-300">Initializing global environment...</div>
        <div className="text-gray-300">
          Loading configurations... <span className="text-green-400">[OK]</span>
        </div>
        <div className="text-gray-300">
          Establishing secure connection... <span className="text-green-400">[OK]</span>
        </div>
        <div className="text-yellow-400 mt-2">Warning: High productivity detected.</div>
        <div className="text-green-400 mt-2">✓ All systems operational.</div>
        <div className="text-green-400 animate-pulse">_</div>
      </div>
    </div>
  );
}

function FolderWindow(): React.ReactElement {
  return (
    <div className="w-[320px] h-[220px] bg-card border border-border/20 rounded-xl overflow-hidden flex flex-col opacity-90 backdrop-blur-md">
      <div className="h-10 bg-muted/80 border-b border-border/30 flex items-center px-4 gap-2 text-sm font-medium text-foreground">
        <Folder className="w-4 h-4 text-blue-400" />
        Project Resources
      </div>
      <div className="flex-1 p-4 flex flex-col gap-3 bg-background/50">
        <div className="flex items-center gap-3 text-sm text-foreground hover:bg-muted p-1.5 rounded-md cursor-pointer">
          <Server className="w-4 h-4 text-purple-400" /> Backend Microservices
        </div>
        <div className="flex items-center gap-3 text-sm text-foreground hover:bg-muted p-1.5 rounded-md cursor-pointer">
          <Layout className="w-4 h-4 text-orange-400" /> Frontend Application
        </div>
        <div className="flex items-center gap-3 text-sm text-foreground hover:bg-muted p-1.5 rounded-md cursor-pointer">
          <Database className="w-4 h-4 text-green-400" /> Database Configurations
        </div>
        <div className="flex items-center gap-3 text-sm text-foreground hover:bg-muted p-1.5 rounded-md cursor-pointer">
          <ShieldCheck className="w-4 h-4 text-red-400" /> Security Policies
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------
 * 3D SCENE LOGIC
 * --------------------------------------------- */

function FloatingResources({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}): React.ReactElement {
  const browserRef = useRef<THREE.Group>(null);
  const terminalRef = useRef<THREE.Group>(null);
  const folderRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const scroll = scrollYProgress.get(); // 0 to 1
    const t = state.clock.elapsedTime;

    if (!browserRef.current || !terminalRef.current || !folderRef.current) {
      return;
    }

    // SCROLL STAGE 0: Hỗn loạn (Chaos - Hero section)
    // SCROLL STAGE 0.5: Ngăn nắp (Order - Features section)

    // Browser Transform
    const bTargetX = THREE.MathUtils.lerp(Math.sin(t * 0.5) * 3 - 3, -4, scroll * 2);
    const bTargetY = THREE.MathUtils.lerp(Math.cos(t * 0.3) * 2 + 1, 1, scroll * 2);
    const bTargetZ = THREE.MathUtils.lerp(Math.sin(t * 0.4) * 2 - 2, -1, scroll * 2);
    const bTargetRotX = THREE.MathUtils.lerp(Math.sin(t * 0.2) * 0.2, 0, scroll * 2);
    const bTargetRotY = THREE.MathUtils.lerp(Math.cos(t * 0.2) * 0.2 + 0.2, 0.3, scroll * 2);

    browserRef.current.position.set(bTargetX, bTargetY, bTargetZ);
    browserRef.current.rotation.set(bTargetRotX, bTargetRotY, 0);

    // Terminal Transform
    const tTargetX = THREE.MathUtils.lerp(Math.cos(t * 0.4) * 4 + 3, 3, scroll * 2);
    const tTargetY = THREE.MathUtils.lerp(Math.sin(t * 0.5) * 2, -1, scroll * 2);
    const tTargetZ = THREE.MathUtils.lerp(Math.cos(t * 0.3) * 3 - 1, 0, scroll * 2);
    const tTargetRotX = THREE.MathUtils.lerp(Math.sin(t * 0.1) * 0.3, 0, scroll * 2);
    const tTargetRotY = THREE.MathUtils.lerp(Math.cos(t * 0.3) * 0.3 - 0.2, -0.2, scroll * 2);

    terminalRef.current.position.set(tTargetX, tTargetY, tTargetZ);
    terminalRef.current.rotation.set(tTargetRotX, tTargetRotY, 0);

    // Folder Transform
    const fTargetX = THREE.MathUtils.lerp(Math.sin(t * 0.6) * 2, -1, scroll * 2);
    const fTargetY = THREE.MathUtils.lerp(Math.cos(t * 0.4) * 3 - 2, -2, scroll * 2);
    const fTargetZ = THREE.MathUtils.lerp(Math.sin(t * 0.5) * 2 + 1, 2, scroll * 2);
    const fTargetRotX = THREE.MathUtils.lerp(Math.cos(t * 0.2) * 0.4, -0.1, scroll * 2);
    const fTargetRotY = THREE.MathUtils.lerp(Math.sin(t * 0.3) * 0.4, 0.1, scroll * 2);

    folderRef.current.position.set(fTargetX, fTargetY, fTargetZ);
    folderRef.current.rotation.set(fTargetRotX, fTargetRotY, 0);
  });

  return (
    <>
      <group ref={browserRef}>
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
          {/* Thick 3D Body */}
          <RoundedBox args={[3.8, 2.5, 0.2]} radius={0.1} smoothness={4}>
            <meshPhysicalMaterial color="#1e293b" roughness={0.3} metalness={0.7} clearcoat={0.5} />
          </RoundedBox>
          <Html transform distanceFactor={5} position={[0, 0, 0.11]} center>
            <BrowserWindow url="platform.workflow.io/dashboard" />
          </Html>
        </Float>
      </group>

      <group ref={terminalRef}>
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
          {/* Thick 3D Body */}
          <RoundedBox args={[3.4, 2.3, 0.3]} radius={0.1} smoothness={4}>
            <meshPhysicalMaterial color="#0f172a" roughness={0.6} metalness={0.8} clearcoat={0.2} />
          </RoundedBox>
          <Html transform distanceFactor={5} position={[0, 0, 0.16]} center>
            <TerminalWindow />
          </Html>
        </Float>
      </group>

      <group ref={folderRef}>
        <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
          {/* Thick 3D Body */}
          <RoundedBox args={[3.0, 2.1, 0.25]} radius={0.1} smoothness={4}>
            <meshPhysicalMaterial color="#334155" roughness={0.4} metalness={0.5} clearcoat={0.3} />
          </RoundedBox>
          <Html transform distanceFactor={5} position={[0, 0, 0.13]} center>
            <FolderWindow />
          </Html>
        </Float>
      </group>
    </>
  );
}

// ---------------------------------------------
// Main Component
// ---------------------------------------------

export function Background3DScene({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}): React.ReactElement {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <Environment preset="city" />
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#60a5fa" />
        <directionalLight position={[-5, -5, -5]} intensity={1} color="#34d399" />

        <FloatingResources scrollYProgress={scrollYProgress} />

        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
    </div>
  );
}
