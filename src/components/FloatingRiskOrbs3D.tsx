/**
 * FloatingRiskOrbs3D — Three.js 3D risk score visualization
 * Shows animated floating spheres sized by risk level with glow effects.
 * Used on Dashboard and Analysis pages.
 */
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float, Text } from "@react-three/drei";
import * as THREE from "three";

interface RiskOrb {
  position: [number, number, number];
  riskScore: number;
  label: string;
  color: string;
}

function RiskOrbMesh({ orb, index }: { orb: RiskOrb; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scale = 0.4 + orb.riskScore * 0.8;

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 + index;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.5 + index;
  });

  return (
    <Float speed={1.5 + index * 0.3} rotationIntensity={0.4} floatIntensity={0.8}>
      <group position={orb.position}>
        <Sphere ref={meshRef} args={[scale, 32, 32]}>
          <MeshDistortMaterial
            color={orb.color}
            distort={0.3 + orb.riskScore * 0.2}
            speed={2}
            roughness={0.1}
            metalness={0.8}
            transparent
            opacity={0.85}
          />
        </Sphere>
        <Text
          position={[0, -scale - 0.3, 0]}
          fontSize={0.18}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {orb.label}
        </Text>
        <Text
          position={[0, -scale - 0.55, 0]}
          fontSize={0.14}
          color={orb.color}
          anchorX="center"
          anchorY="middle"
        >
          {(orb.riskScore * 100).toFixed(0)}%
        </Text>
      </group>
    </Float>
  );
}

function ParticleField() {
  const points = useRef<THREE.Points>(null);
  const count = 300;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#4f9cf9" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

interface Props {
  orbs?: RiskOrb[];
  height?: string;
}

const DEFAULT_ORBS: RiskOrb[] = [
  { position: [-2.5, 0, 0], riskScore: 0.92, label: "Paytm Network", color: "#ef4444" },
  { position: [0, 0.5, 0], riskScore: 0.67, label: "PhonePe Hub", color: "#f97316" },
  { position: [2.5, 0, 0], riskScore: 0.41, label: "GPay Cluster", color: "#eab308" },
  { position: [-1.2, -1.5, 1], riskScore: 0.18, label: "HDFC Branch", color: "#22c55e" },
  { position: [1.2, -1.5, 1], riskScore: 0.78, label: "SBI Gateway", color: "#ef4444" },
];

export default function FloatingRiskOrbs3D({ orbs = DEFAULT_ORBS, height = "350px" }: Props) {
  return (
    <div style={{ width: "100%", height, borderRadius: "12px", overflow: "hidden" }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#4f9cf9" />
        <pointLight position={[-5, -5, 5]} intensity={1} color="#8b5cf6" />
        <fog attach="fog" args={["#0a0a1a", 8, 20]} />
        <ParticleField />
        {orbs.map((orb, i) => (
          <RiskOrbMesh key={i} orb={orb} index={i} />
        ))}
      </Canvas>
    </div>
  );
}
