"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Float, Stars, PerspectiveCamera, Environment, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function Globe() {
    const meshRef = useRef<THREE.Mesh>(null);
    const atmosphereRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.001;
        }
        if (atmosphereRef.current) {
            atmosphereRef.current.rotation.y += 0.0015;
        }
    });

    return (
        <group>
            {/* The Main Mars Surface */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[2.5, 64, 64]} />
                <MeshDistortMaterial
                    color="#b7410e" // Mars Rust Red
                    roughness={0.9}
                    metalness={0.2}
                    distort={0.15} // Slight rocky distortion
                    speed={1}
                />
            </mesh>

            {/* Atmosphere / Dust Cloud */}
            <mesh ref={atmosphereRef}>
                <sphereGeometry args={[2.6, 64, 64]} />
                <meshStandardMaterial
                    color="#ea580c"
                    transparent
                    opacity={0.1}
                    wireframe
                />
            </mesh>

            {/* Subtle Inner Glow */}
            <Sphere args={[2.48, 64, 64]}>
                <meshStandardMaterial
                    color="#4e1a06"
                    transparent
                    opacity={0.8}
                />
            </Sphere>

            {/* Orbiting Asteroids / Particles */}
            <Asteroids count={50} />
        </group>
    );
}

function Asteroids({ count }: { count: number }) {
    const asteroids = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 3.5 + Math.random() * 3;
            const x = Math.cos(angle) * radius;
            const y = (Math.random() - 0.5) * 6;
            const z = Math.sin(angle) * radius;
            const size = Math.random() * 0.08 + 0.02;
            const speed = Math.random() * 0.008 + 0.002;
            const rotSpeed = Math.random() * 0.02;
            temp.push({ x, y, z, size, speed, angle, radius, rotSpeed });
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
                child.rotation.x += data.rotSpeed;
                child.rotation.y += data.rotSpeed;
            });
        }
    });

    return (
        <group ref={meshes}>
            {asteroids.map((_, i) => (
                <mesh key={i}>
                    <dodecahedronGeometry args={[_.size, 0]} />
                    <meshStandardMaterial color="#6b21a8" emissive="#3b0764" emissiveIntensity={0.5} />
                </mesh>
            ))}
        </group>
    );
}

export function LandingScene() {
    return (
        <div className="absolute inset-0 w-full h-full">
            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                <Environment preset="night" />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={1} fade speed={1.5} />
                <ambientLight intensity={0.2} />

                {/* Sun Light (Orange) */}
                <pointLight position={[10, 5, 10]} intensity={1.5} color="#fb923c" castShadow />

                {/* Secondary Cool Light (Rim) */}
                <pointLight position={[-10, -5, -10]} intensity={0.8} color="#4c1d95" />

                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <Globe />
                </Float>

                <fog attach="fog" args={["#020617", 5, 20]} />
            </Canvas>
        </div>
    );
}
