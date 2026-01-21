"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Float, Stars, PerspectiveCamera, Environment, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function Globe() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.002;
        }
    });

    return (
        <group>
            {/* The Main Globe */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[2.5, 64, 64]} />
                <meshStandardMaterial
                    color="#0f172a"
                    emissive="#ea580c"
                    emissiveIntensity={0.2}
                    wireframe={true}
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Inner Glow */}
            <Sphere args={[2.4, 64, 64]}>
                <meshStandardMaterial
                    color="#ea580c"
                    transparent
                    opacity={0.05}
                />
            </Sphere>

            {/* Orbiting Asteroids / Particles */}
            <Asteroids count={40} />
        </group>
    );
}

function Asteroids({ count }: { count: number }) {
    const asteroids = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 3.5 + Math.random() * 2;
            const x = Math.cos(angle) * radius;
            const y = (Math.random() - 0.5) * 4;
            const z = Math.sin(angle) * radius;
            const size = Math.random() * 0.05 + 0.02;
            const speed = Math.random() * 0.01 + 0.005;
            temp.push({ x, y, z, size, speed, angle, radius });
        }
        return temp;
    }, [count]);

    const meshes = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (meshes.current) {
            meshes.current.children.forEach((child, i) => {
                const data = asteroids[i];
                data.angle += data.speed;
                child.position.x = Math.cos(data.angle) * data.radius;
                child.position.z = Math.sin(data.angle) * data.radius;
                child.rotation.x += 0.01;
                child.rotation.y += 0.01;
            });
        }
    });

    return (
        <group ref={meshes}>
            {asteroids.map((_, i) => (
                <mesh key={i}>
                    <dodecahedronGeometry args={[_.size, 0]} />
                    <meshStandardMaterial color="#94a3b8" />
                </mesh>
            ))}
        </group>
    );
}

export function LandingScene() {
    return (
        <div className="absolute inset-0 w-full h-full">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                <Environment preset="city" />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ea580c" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                    <Globe />
                </Float>
            </Canvas>
        </div>
    );
}
