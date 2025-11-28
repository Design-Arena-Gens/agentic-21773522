'use client';

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  OrbitControls,
  Sparkles,
} from "@react-three/drei";
import * as THREE from "three";

function Wolf() {
  const bodyRef = useRef<THREE.Group>(null);
  const cheeksRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!bodyRef.current) return;
    const t = clock.getElapsedTime();
    bodyRef.current.position.z = Math.sin(t * 0.8) * 0.12 - 0.6;
    bodyRef.current.rotation.y = -0.5 + Math.sin(t * 0.4) * 0.1;
    if (cheeksRef.current) {
      const scale = 1.1 + Math.sin(t * 2.6) * 0.15;
      cheeksRef.current.scale.set(scale, scale, scale);
    }
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(t * 3) * 0.2;
    }
  });

  return (
    <group ref={bodyRef} position={[-2.2, 0.35, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[1.2, 0.6, 0.6]} />
        <meshStandardMaterial color="#3c4257" />
      </mesh>

      <mesh position={[0.55, 0.55, 0]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.55]} />
        <meshStandardMaterial color="#3c4257" />
      </mesh>

      <mesh position={[0.95, 0.4, 0]} castShadow>
        <boxGeometry args={[0.5, 0.35, 0.35]} />
        <meshStandardMaterial color="#50596f" />
      </mesh>

      <mesh ref={cheeksRef} position={[1.05, 0.42, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#bfc4d8" />
      </mesh>

      <mesh position={[1.15, 0.48, 0.16]} castShadow>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[1.15, 0.48, -0.16]} castShadow>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      <mesh position={[0.9, -0.05, 0.17]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.45, 12]} />
        <meshStandardMaterial color="#323747" />
      </mesh>
      <mesh position={[0.9, -0.05, -0.17]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.45, 12]} />
        <meshStandardMaterial color="#323747" />
      </mesh>

      <mesh ref={tailRef} position={[-0.6, 0.25, 0]} rotation={[0, 0, -0.5]} castShadow>
        <coneGeometry args={[0.12, 0.6, 14]} />
        <meshStandardMaterial color="#50596f" />
      </mesh>

      <WolfEars />
      <BlowParticles />
    </group>
  );
}

function WolfEars() {
  return (
    <group position={[0.6, 0.8, 0]}>
      <mesh position={[0.1, 0.25, 0.22]} rotation={[0.2, 0, 0]} castShadow>
        <coneGeometry args={[0.12, 0.3, 8]} />
        <meshStandardMaterial color="#2d3140" />
      </mesh>
      <mesh position={[0.1, 0.25, -0.22]} rotation={[0.2, 0, 0]} castShadow>
        <coneGeometry args={[0.12, 0.3, 8]} />
        <meshStandardMaterial color="#2d3140" />
      </mesh>
    </group>
  );
}

type Particle = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
};

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    position: new THREE.Vector3(),
    velocity: new THREE.Vector3(
      1 + Math.random() * 1.2,
      (Math.random() - 0.5) * 0.2,
      (Math.random() - 0.5) * 0.5,
    ),
    life: Math.random(),
  }));
}

function BlowParticles() {
  const count = 140;
  const [initialParticles] = useState(() => createParticles(count));
  const particlesRef = useRef<Particle[]>(initialParticles);
  const [positions] = useState(() => new Float32Array(count * 3));
  const positionsRef = useRef<Float32Array>(positions);
  const ref = useRef<THREE.Points>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);

  useFrame((_, delta) => {
    const particles = particlesRef.current;
    const positions = positionsRef.current;
    for (let i = 0; i < count; i++) {
      const particle = particles[i];
      particle.life += delta * 0.6;
      particle.position.addScaledVector(particle.velocity, delta * 2.2);
      particle.velocity.x += delta * 0.2;
      particle.velocity.y += delta * 0.04;
      const baseIndex = i * 3;
      positions[baseIndex] = particle.position.x + 1.1;
      positions[baseIndex + 1] = particle.position.y + 0.4;
      positions[baseIndex + 2] = particle.position.z;

      if (particle.life > 1.6) {
        particle.life = 0;
        particle.position.set(0, 0, 0);
        particle.velocity.set(
          1 + Math.random() * 1.1,
          (Math.random() - 0.5) * 0.18,
          (Math.random() - 0.5) * 0.42,
        );
      }
    }

    if (geometryRef.current) {
      geometryRef.current.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref} position={[0, 0, 0]} rotation={[0, -0.2, 0]}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#f0f6ff"
        size={0.06}
        sizeAttenuation
        transparent
        opacity={0.9}
      />
    </points>
  );
}

function Pig() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.scale.setScalar(1 + Math.sin(t * 6) * 0.04);
    group.current.position.y = 0.25 + Math.sin(t * 4) * 0.02;
  });

  return (
    <group ref={group} position={[0, 0.25, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial color="#f8a8b8" />
      </mesh>
      <mesh position={[0.18, 0.04, 0.12]} castShadow>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0.18, 0.04, -0.12]} castShadow>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#111827" />
      </mesh>
      <mesh position={[0.2, -0.02, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.12, 16]} />
        <meshStandardMaterial color="#f58ea5" />
      </mesh>
      <mesh position={[-0.2, 0.15, 0]}>
        <torusGeometry args={[0.1, 0.03, 12, 24]} />
        <meshStandardMaterial color="#f58ea5" />
      </mesh>
    </group>
  );
}

function WoodenHouse() {
  const doorRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (doorRef.current) {
      doorRef.current.rotation.y = Math.sin(t * 2) * 0.18;
    }
  });

  return (
    <group position={[1.2, 0, 0]}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1.8, 1.1, 1.4]} />
        <meshStandardMaterial color="#b9804d" />
      </mesh>
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0, 1.1, 0.8, 4]} />
        <meshStandardMaterial color="#824c24" />
      </mesh>
      <mesh position={[0.95, 0.3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.2, 0.12, 0.5]} />
        <meshStandardMaterial color="#d29a63" />
      </mesh>

      <mesh position={[0, 0.4, -0.71]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.8, 0.8, 0.05]} />
        <meshStandardMaterial
          color="#fdf6ef"
          transparent
          opacity={0.35}
          roughness={0.3}
        />
      </mesh>

      <mesh
        ref={doorRef}
        position={[0.6, 0.25, 0.71]}
        rotation={[0, -0.1, 0]}
        castShadow
      >
        <boxGeometry args={[0.5, 0.7, 0.08]} />
        <meshStandardMaterial color="#9c6a3a" />
      </mesh>

      <group position={[0, 0.02, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[2.4, 32]} />
          <meshStandardMaterial color="#7db05b" />
        </mesh>
        <Sparkles color="#ffffff" count={50} speed={0.3} opacity={0.25} />
      </group>

      <group position={[0, 0.25, -0.4]}>
        <Pig />
      </group>
    </group>
  );
}

function Fireflies() {
  return (
    <group position={[0, 1.5, 0]}>
      <Sparkles
        count={40}
        size={1.2}
        speed={0.2}
        scale={[4, 1.5, 3]}
        color="#ffe2a8"
        opacity={0.35}
      />
    </group>
  );
}

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-20 text-white">
      <div className="absolute inset-x-0 top-10 text-center font-semibold uppercase tracking-[0.35em] text-white/70">
        The Big Bad Breeze
      </div>
      <div className="absolute inset-x-0 bottom-14 z-10 flex flex-col items-center text-center text-white/80">
        <p className="text-2xl font-light">
          A determined wolf huffs and puffs at the wooden refuge.
        </p>
        <p className="mt-3 max-w-xl text-balance text-base">
          The straw may be gone, but this plucky pig still trembles inside a
          timber hideout while gusts ripple through the forest clearing.
        </p>
      </div>

      <div className="relative h-[540px] w-full max-w-5xl">
        <Canvas
          shadows
          camera={{ position: [5, 2.5, 6.4], fov: 45, near: 0.1, far: 100 }}
        >
          <color attach="background" args={["transparent"]} />
          <ambientLight intensity={0.6} />
          <directionalLight
            castShadow
            position={[6, 7, 4]}
            intensity={1.4}
            shadow-mapSize={[1024, 1024]}
          />
          <spotLight
            position={[-6, 6, -4]}
            angle={0.6}
            penumbra={0.5}
            intensity={0.8}
            color="#9ab8ff"
          />

          <Environment preset="sunset" />

          <Float speed={1.6} rotationIntensity={0.08} floatIntensity={0.08}>
            <WoodenHouse />
          </Float>
          <Wolf />

          <ContactShadows
            opacity={0.55}
            position={[0, 0.01, 0]}
            width={20}
            height={20}
            blur={1.8}
            far={8}
            resolution={1024}
            color="#2b2b2b"
          />

          <Fireflies />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.2} />
        </Canvas>
      </div>
    </main>
  );
}
