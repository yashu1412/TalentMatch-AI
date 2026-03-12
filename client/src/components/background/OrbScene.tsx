"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function AnimatedOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    meshRef.current.rotation.y += 0.0035;
    meshRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.35) * 0.18;
    meshRef.current.position.y =
      Math.sin(state.clock.elapsedTime * 0.9) * 0.12;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1.2}>
      <mesh ref={meshRef} scale={2.2}>
        <icosahedronGeometry args={[1, 32]} />
        <MeshDistortMaterial
          color="#2563EB"
          emissive="#38BDF8"
          emissiveIntensity={1.4}
          distort={0.35}
          speed={2}
          roughness={0.08}
          metalness={0.25}
        />
      </mesh>
    </Float>
  );
}

function Ring() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * 0.18;
    ref.current.rotation.x = Math.PI / 2.7;
  });

  return (
    <mesh ref={ref} scale={2.9}>
      <torusGeometry args={[1.4, 0.02, 16, 120]} />
      <meshStandardMaterial
        color="#60A5FA"
        emissive="#38BDF8"
        emissiveIntensity={1.2}
        transparent
        opacity={0.55}
      />
    </mesh>
  );
}

function StarsField() {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions] = useMemo(() => {
    const count = 180;
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 14;
    }

    return [pos];
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    pointsRef.current.rotation.x = state.clock.elapsedTime * 0.015;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#93C5FD"
        size={0.035}
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

export default function OrbScene() {
  return (
    <div className="relative h-[420px] w-full">
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute inset-0 rounded-full bg-primary-glow/10 blur-[120px]" />

      <Canvas camera={{ position: [0, 0, 5], fov: 48 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[4, 4, 4]} intensity={1.8} color="#60A5FA" />
        <pointLight position={[-3, 2, 2]} intensity={2.4} color="#38BDF8" />
        <pointLight position={[2, -2, 3]} intensity={1.6} color="#2563EB" />

        <StarsField />
        <Ring />
        <AnimatedOrb />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.7}
        />
      </Canvas>
    </div>
  );
}
