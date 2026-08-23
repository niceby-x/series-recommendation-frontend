'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, MotionValue } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, MeshReflectorMaterial } from '@react-three/drei';
import FlowerIcon from '../shared/FlowerIcon';
import type { HeroFeature } from '../../lib/landingContent';

// ==========================================
// 3D CONFIGURATION
// ==========================================
const STRIDE = 2.4;              
const AUTOPLAY_SPEED = 0.00035;    
const DRAG_SENSITIVITY = 0.01;    
const SLIPPERINESS = 0.98;

const DOMAIN =        [-9.6, -7.2, -4.8, -2.4,    0,   2.4,   4.8,   7.2,   9.6];
const ROT_Y_RANGE =   [  35,   30,   20,   10,    0,  -10,   -20,   -30,   -35];
const Z_RANGE =       [ 0.5,  0.0, -1.0, -2.0, -2.5, -2.0, -1.0,   0.0,   0.5]; 
const LOCAL_X_RANGE = [ 0.4,  0.3,  0.2,  0.1,    0, -0.1, -0.2,  -0.3,  -0.4];
const SCALE_RANGE =   [   1,    1,    1,    1,    1,    1,    1,     1,     1];

function interpolate(x: number, domain: number[], range: number[]): number {
  if (x <= domain[0]) return range[0];
  if (x >= domain[domain.length - 1]) return range[range.length - 1];
  for (let i = 0; i < domain.length - 1; i++) {
    if (x >= domain[i] && x <= domain[i + 1]) {
      const t = (x - domain[i]) / (domain[i + 1] - domain[i]);
      return range[i] + t * (range[i + 1] - range[i]);
    }
  }
  return range[0];
}

function CardTexture({ url }: { url: string }) {
  const safeUrl = url.includes('?') ? `${url}&3d=true` : `${url}?3d=true`;
  const texture = useTexture(safeUrl);
  return (
    <meshStandardMaterial 
      map={texture} 
      roughness={0.3} 
      metalness={0.1} 
      transparent 
      depthTest={false} 
      depthWrite={false} 
    />
  );
}

function StageCard({
  card,
  index,
  totalCards,
  scrollX,
  isDragging,
}: {
  card: HeroFeature;
  index: number;
  totalCards: number;
  scrollX: MotionValue<number>;
  isDragging: boolean;
}) {
  const router = useRouter();
  const TRACK_WIDTH = totalCards * STRIDE;
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!groupRef.current || !meshRef.current) return;

    const s = scrollX.get();
    const rawX = index * STRIDE - s;
    const wrappedX = ((((rawX + TRACK_WIDTH / 2) % TRACK_WIDTH) + TRACK_WIDTH) % TRACK_WIDTH) - TRACK_WIDTH / 2;

    const rotYDeg = interpolate(wrappedX, DOMAIN, ROT_Y_RANGE);
    const zVal = interpolate(wrappedX, DOMAIN, Z_RANGE);
    const localXVal = interpolate(wrappedX, DOMAIN, LOCAL_X_RANGE);
    const scaleVal = interpolate(wrappedX, DOMAIN, SCALE_RANGE);

    groupRef.current.position.x = wrappedX + localXVal;
    groupRef.current.position.y = -0.1; // Balanced position
    groupRef.current.position.z = zVal;
    groupRef.current.rotation.y = (rotYDeg * Math.PI) / 180;
    groupRef.current.scale.set(scaleVal, scaleVal, scaleVal);

    meshRef.current.renderOrder = Math.round(100 - Math.abs(wrappedX) * 10);
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        position={[0, 1.2, 0]}
        onClick={() => {
          if (!isDragging) {
            const link = String(card.id).startsWith('hero-fallback') ? '/series' : `/series/${card.id}`;
            router.push(link);
          }
        }}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <planeGeometry args={[2, 3]} />
        {card.imageUrl ? (
          <Suspense fallback={<meshStandardMaterial color="#A47BBA" transparent depthTest={false} depthWrite={false} />}>
            <CardTexture url={card.imageUrl} />
          </Suspense>
        ) : (
          <meshStandardMaterial color="#A47BBA" transparent depthTest={false} depthWrite={false} />
        )}
      </mesh>
    </group>
  );
}

function StageFloor() {
  return (
    // Aligned to the card's actual bottom edge: group.position.y (-0.1) +
    // card mesh position.y (1.2) - half the card's geometry height (1.5)
    // = -0.4. Sits a hair below that (-0.42) so the reflection reads as
    // touching the poster rather than clipping through it.
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]}>
      <planeGeometry args={[60, 60]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={50}
        roughness={0.7}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#241528"
        metalness={0.5}
        mirror={0.85}
      />
    </mesh>
  );
}

function SceneContainer({
  children,
  pointerX,
  pointerY,
}: {
  children: React.ReactNode;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetRotX = pointerY.get() * -0.05;
    const targetRotY = pointerX.get() * 0.05;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.1;
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.1;
  });

  return <group ref={groupRef}>{children}</group>;
}

export default function LandingPosterStage({ deck }: { deck: HeroFeature[] }) {
  const prefersReducedMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);

  const [hasFinePointer] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  );

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  function handlePointerMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!hasFinePointer || prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  const minItemsRequired = 14;
  const loopMultiplier = Math.ceil(minItemsRequired / Math.max(1, deck.length));
  const endlessDeck = Array(loopMultiplier).fill(deck).flat();

  const scrollX = useMotionValue(0);
  const velocity = useRef(AUTOPLAY_SPEED);

  useAnimationFrame((t, delta) => {
    if (prefersReducedMotion || isDragging) return;
    scrollX.set(scrollX.get() + delta * velocity.current);
    velocity.current = velocity.current * SLIPPERINESS + AUTOPLAY_SPEED * (1 - SLIPPERINESS);
  });

  return (
    <motion.div
      className="relative overflow-hidden min-h-[calc(100vh-57px)] flex items-center justify-center w-full select-none !cursor-grab active:!cursor-grabbing"
      style={{
        background: 'linear-gradient(to bottom, #FFFFFF 0%, #FBDCE6 55%, #241528 100%)',
      }}
      onPanStart={() => setIsDragging(true)}
      onPanEnd={(e, info) => {
        setIsDragging(false);
        velocity.current = -info.velocity.x / 100000;
      }}
      onPan={(e, info) => {
        scrollX.set(scrollX.get() - info.delta.x * DRAG_SENSITIVITY);
      }}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      <div className="absolute inset-x-0 top-0 pt-8 sm:pt-10 md:pt-12 px-6 text-center z-20 pointer-events-none">
        {/* Soft radial backdrop behind the text only -- insurance against
            moving poster art directly underneath tanking legibility, without
            putting a visible "box" behind the headline. */}
        <div
          className="absolute inset-x-0 top-0 h-24 sm:h-28 -z-10"
          style={{
            background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(255,255,255,0.75), transparent 70%)',
          }}
        />
        <p className="inline-flex items-center gap-1.5 text-brand-mauve/70 text-[11px] font-bold tracking-[0.18em] mb-1">
          <FlowerIcon className="size-3 text-brand-pink-vivid" /> A BLUMI SELECTION
        </p>
        <h2 className="font-display italic text-[24px] sm:text-[28px] md:text-[34px] leading-tight text-brand-mauve">
          Seven stories to fall into
        </h2>
      </div>

      {/* Carousel gets its own top offset, independent of the headline
          above -- it needs real clearance from the navbar since the cards
          themselves (not just text) were sitting right against it. Using
          top-* instead of a shared container pt-* so this can be tuned
          without dragging the headline down with it. */}
      <div className="absolute inset-x-0 bottom-0 top-28 sm:top-32 md:top-36 pointer-events-none">
        <Canvas camera={{ position: [0, 0.8, 7.5], fov: 40 }} gl={{ alpha: true }} style={{ pointerEvents: 'auto' }}>
          <fog attach="fog" args={['#241528', 4, 15]} />
          
          <ambientLight intensity={1.6} />
          <directionalLight position={[0, 10, 8]} intensity={1.8} />
          <spotLight position={[0, 6, 4]} intensity={2.5} penumbra={1} angle={0.8} />

          <SceneContainer pointerX={pointerX} pointerY={pointerY}>
            {endlessDeck.map((card, i) => (
              <StageCard
                key={`track-${card.id}-${i}`}
                card={card}
                index={i}
                totalCards={endlessDeck.length}
                scrollX={scrollX}
                isDragging={isDragging}
              />
            ))}
            <StageFloor />
          </SceneContainer>
        </Canvas>
      </div>
    </motion.div>
  );
}