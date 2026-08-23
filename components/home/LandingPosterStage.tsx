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
        // The reflective floor stays moody/dark through most of the scene
        // (that's what makes MeshReflectorMaterial read as a mirror at
        // all) -- but the very last stretch eases back up to this page's
        // own light palette, so the section hands off into LandingHero's
        // #FDF1F6 start color instead of cutting from near-black straight
        // into pale pink.
        background: 'linear-gradient(to bottom, #FFFFFF 0%, #FBDCE6 55%, #241528 88%, #FDF1F6 100%)',
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
      {/* ================= HEADER OVERLAY ================= */}
      <div className="absolute inset-x-0 top-0 pt-8 md:pt-14 px-6 text-center z-20 pointer-events-none">
        {/* Soft radial backdrop behind the text only -- insurance against
            moving poster art directly underneath tanking legibility, without
            putting a visible "box" behind the headline. Sized to the whole
            header block now that it also carries the subhead and the
            three trust badges, not just the eyebrow + headline. */}
        <div
          className="absolute inset-x-0 top-0 h-64 sm:h-72 md:h-80 -z-10"
          style={{
            background: 'radial-gradient(ellipse 65% 100% at 50% 0%, rgba(255,255,255,0.75), transparent 70%)',
          }}
        />
        <p className="inline-flex items-center justify-center gap-2 text-[#C084A3] text-[10px] md:text-xs font-bold tracking-[0.2em] mb-3 uppercase">
          <FlowerIcon className="size-3 text-[#F9A8D4]" /> A BLUMI SELECTION <FlowerIcon className="size-3 text-[#F9A8D4]" />
        </p>
        <h2 className="font-display text-[34px] sm:text-[46px] md:text-[56px] leading-tight text-[#2B1B3A] mb-3">
          Seven stories to <span className="font-serif italic text-[#D946EF] font-light">fall into</span>
          <svg className="inline-block ml-1 w-8 h-8 md:w-10 md:h-10 text-[#D946EF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </h2>
        <p className="text-[#6C5B7B] text-sm md:text-base font-medium mb-8">Carefully recommended. Endless emotions.</p>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-xs md:text-sm text-[#4A3B58] max-w-3xl mx-auto border-t border-[#D946EF]/20 pt-6">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-[#D946EF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            <div className="text-left leading-tight">
              <span className="block font-bold">Handpicked</span> <span className="font-normal opacity-80">just for you</span>
            </div>
          </div>
          <div className="hidden md:block w-px h-8 bg-[#D946EF]/20" />
          <div className="flex items-center gap-3">
            <FlowerIcon className="w-6 h-6 text-[#D946EF]" />
            <div className="text-left leading-tight">
              <span className="block font-bold">Based on what</span> <span className="font-normal opacity-80">you love</span>
            </div>
          </div>
          <div className="hidden md:block w-px h-8 bg-[#D946EF]/20" />
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-[#D946EF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
            <div className="text-left leading-tight">
              <span className="block font-bold">Loved by</span> <span className="font-normal opacity-80">our community</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel gets its own top offset, independent of the headline
          above -- it needs real clearance from the header block since the
          cards themselves (not just text) were sitting right against it.
          Using top-* instead of a shared container pt-* so this can be
          tuned without dragging the header down with it. Pushed further
          down than before now that the header also carries the subhead
          and the three trust badges below the headline. */}
      <div className="absolute inset-x-0 bottom-0 top-60 sm:top-64 md:top-72 pointer-events-none">
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