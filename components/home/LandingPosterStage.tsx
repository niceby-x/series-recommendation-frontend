'use client';

import { useState, useRef, useLayoutEffect, useEffect, Suspense, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, MotionValue } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Image, MeshReflectorMaterial } from '@react-three/drei';
import FlowerIcon from '../shared/FlowerIcon';
import Logo from '../shared/Logo';
import type { HeroFeature } from '../../lib/landingContent';

// ==========================================
// 3D CONFIGURATION (Mapped perfectly from CSS)
// Scale: 100px = 1 Three.js unit
// ==========================================
const STRIDE = 2.2;              
const AUTOPLAY_SPEED = 0.00035;    
const DRAG_SENSITIVITY = 0.01;    
const WHEEL_SENSITIVITY = 0.01; // matches DRAG_SENSITIVITY as a starting point; needs live trackpad tuning
const WHEEL_IDLE_MS = 150; // how long to wait after the last wheel tick before resuming autoplay
const SLIPPERINESS = 0.98;

const DOMAIN =        [-8.8, -6.6, -4.4, -2.2,    0,  2.2,  4.4,  6.6,  8.8];
const ROT_Y_RANGE =   [  40,   40,   30,   15,    0,  -15,  -30,  -40,  -40];
const Z_RANGE =       [ 0.15, 0.15,-1.4, -2.6, -3.0, -2.6, -1.4, 0.15, 0.15]; 
const LOCAL_X_RANGE = [ 0.85, 0.85, 1.1,  0.7,    0, -0.7, -1.1,-0.85,-0.85];
const OPAC_RANGE =    [    0,  0.3,   1,    1,    1,    1,    1,  0.3,    0];

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

function StageCard({
  card,
  index,
  totalCards,
  scrollX,
  isDragging,
  onCardHoverChange,
}: {
  card: HeroFeature;
  index: number;
  totalCards: number;
  scrollX: MotionValue<number>;
  isDragging: boolean;
  onCardHoverChange: (hovering: boolean) => void;
}) {
  const router = useRouter();
  const TRACK_WIDTH = totalCards * STRIDE;
  
  // Three nested groups to recreate the CSS transform order of operations
  const outerGroupRef = useRef<THREE.Group>(null);
  const middleGroupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!outerGroupRef.current || !middleGroupRef.current || !innerGroupRef.current || !meshRef.current) return;

    const s = scrollX.get();
    const rawX = index * STRIDE - s;
    const wrappedX = ((((rawX + TRACK_WIDTH / 2) % TRACK_WIDTH) + TRACK_WIDTH) % TRACK_WIDTH) - TRACK_WIDTH / 2;

    const rotYDeg = interpolate(wrappedX, DOMAIN, ROT_Y_RANGE);
    const zVal = interpolate(wrappedX, DOMAIN, Z_RANGE);
    const localXVal = interpolate(wrappedX, DOMAIN, LOCAL_X_RANGE);
    const opacVal = interpolate(wrappedX, DOMAIN, OPAC_RANGE);

    // 1. TranslateX(wrappedX)
    outerGroupRef.current.position.x = wrappedX;
    outerGroupRef.current.position.y = 0; 

    // 2. RotateY(rotateY)
    middleGroupRef.current.rotation.y = (rotYDeg * Math.PI) / 180;

    // 3 & 4. Translate along the newly rotated local axes (Z depth, then local X offset)
    innerGroupRef.current.position.x = localXVal;
    innerGroupRef.current.position.z = zVal;
    
    meshRef.current.renderOrder = Math.round(100 - Math.abs(wrappedX) * 10);
    
    // Apply opacity fade out to the material. mesh.material's type allows
    // Material | Material[] even though this component only ever assigns
    // a single material (via FallbackMesh's <meshStandardMaterial> or
    // drei Image's internal shaderMaterial) -- narrowing out the array
    // case satisfies the type without changing behavior.
    const material = meshRef.current.material;
    if (material && !Array.isArray(material)) {
        material.transparent = true;
        material.opacity = opacVal;
    }
  });

  const handleClick = () => {
    if (!isDragging) {
      const link = String(card.id).startsWith('hero-fallback') ? '/series' : `/series/${card.id}`;
      router.push(link);
    }
  };

  return (
    <group ref={outerGroupRef}>
      <group ref={middleGroupRef}>
        <group ref={innerGroupRef}>
          {card.imageUrl ? (
            <Suspense
              fallback={<FallbackMesh ref={meshRef} onClick={handleClick} onHoverChange={onCardHoverChange} />}
            >
              <Image
                ref={meshRef}
                url={card.imageUrl.includes('?') ? `${card.imageUrl}&3d=true` : `${card.imageUrl}?3d=true`}
                position={[0, 0, 0]}
                scale={[2, 3]}
                radius={0.08}
                transparent
                onClick={handleClick}
                onPointerOver={() => onCardHoverChange(true)}
                onPointerOut={() => onCardHoverChange(false)}
              />
            </Suspense>
          ) : (
            <FallbackMesh ref={meshRef} onClick={handleClick} onHoverChange={onCardHoverChange} />
          )}
        </group>
      </group>
    </group>
  );
}

const FallbackMesh = forwardRef<
  THREE.Mesh,
  { onClick: () => void; onHoverChange: (hovering: boolean) => void }
>(({ onClick, onHoverChange }, ref) => (
  <mesh
    ref={ref}
    position={[0, 0, 0]}
    onClick={onClick}
    onPointerOver={() => onHoverChange(true)}
    onPointerOut={() => onHoverChange(false)}
  >
    <planeGeometry args={[2, 3]} />
    <meshStandardMaterial color="#D9B8E8" transparent depthTest={false} depthWrite={false} />
  </mesh>
));
FallbackMesh.displayName = 'FallbackMesh';

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

function StageFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.55, 0]}>
      <planeGeometry args={[60, 60]} />
      <MeshReflectorMaterial
        blur={[70, 20]}
        resolution={1024}
        mixBlur={1}
        mixStrength={5}
        roughness={0.7}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#FBEAF8" 
        metalness={0.25}
        mirror={0.3}
      />
    </mesh>
  );
}

export default function LandingPosterStage({ deck }: { deck: HeroFeature[] }) {
  const prefersReducedMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);

  // Tracks how many cards currently report a pointer-over (a card's inner
  // Suspense/fallback swap can momentarily overlap, so this is a count
  // rather than a boolean to avoid a stray onPointerOut clobbering a still-
  // active hover on the replacement mesh).
  const hoveredCardCount = useRef(0);
  const [isHoveringCard, setIsHoveringCard] = useState(false);

  function handleCardHoverChange(hovering: boolean) {
    hoveredCardCount.current = Math.max(0, hoveredCardCount.current + (hovering ? 1 : -1));
    setIsHoveringCard(hoveredCardCount.current > 0);
  }

  // Grab hand only over cards (or while actively dragging); default arrow
  // everywhere else on the stage.
  useLayoutEffect(() => {
    document.body.style.cursor = isDragging ? 'grabbing' : isHoveringCard ? 'grab' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [isDragging, isHoveringCard]);

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

  const headerRef = useRef<HTMLDivElement>(null);
  const [canvasTop, setCanvasTop] = useState(320); 
  const HEADER_GAP = -25; 

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    function measure() {
      if (el) setCanvasTop(el.offsetHeight + HEADER_GAP);
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  // Touchpad support: framer-motion's onPan only fires for pointer-drag
  // gestures, so a two-finger trackpad swipe (a wheel event, not a pointer
  // drag) never reached scrollX. Attached as a native listener with
  // { passive: false } because React's onWheel prop is passive by default,
  // which would silently ignore preventDefault().
  const stageRef = useRef<HTMLDivElement>(null);
  const wheelResumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || prefersReducedMotion) return;

    function handleWheel(e: WheelEvent) {
      // Only hijack gestures that read as a horizontal swipe (spinning the
      // carousel); leave vertical scroll alone so the page can still scroll
      // normally over the hero.
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;

      e.preventDefault();
      setIsDragging(true);
      scrollX.set(scrollX.get() + e.deltaX * WHEEL_SENSITIVITY);

      if (wheelResumeTimeout.current) clearTimeout(wheelResumeTimeout.current);
      wheelResumeTimeout.current = setTimeout(() => setIsDragging(false), WHEEL_IDLE_MS);
    }

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      if (wheelResumeTimeout.current) clearTimeout(wheelResumeTimeout.current);
    };
  }, [prefersReducedMotion, scrollX]);

  return (
    <motion.div
      ref={stageRef}
      className="relative overflow-hidden min-h-screen flex items-center justify-center w-full select-none"
      style={{
        background: 'linear-gradient(to bottom, #FFFFFF 0%, #FDF1F6 35%, #FBEAF8 65%, #F1E3FB 100%)',
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
      <div ref={headerRef} className="absolute inset-x-0 top-0 pt-8 md:pt-14 px-6 text-center z-20 pointer-events-none">
        <div
          className="absolute inset-x-0 top-0 h-64 sm:h-72 md:h-80 -z-10"
          style={{
            background: 'radial-gradient(ellipse 65% 100% at 50% 0%, rgba(255,255,255,0.75), transparent 70%)',
          }}
        />
        <div className="flex flex-col items-center gap-2 mb-2">
          <Logo variant="icon" theme="brand" size={72} />
          <span className="font-heading font-semibold text-[#2B1B3A] text-2xl md:text-3xl tracking-tight">
            BLumi
          </span>
        </div>
        <h2 className="font-display text-[34px] sm:text-[46px] md:text-[56px] leading-tight text-[#2B1B3A] mb-1">
            Stories to <span className="font-serif italic text-[#D946EF] font-light">fall into</span>
          <svg className="inline-block ml-1 w-8 h-8 md:w-10 md:h-10 text-[#D946EF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-xs md:text-sm text-[#4A3B58] max-w-3xl mx-auto border-t border-[#D946EF]/20 pt-3">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-[#D946EF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <div className="text-left leading-tight">
              <span className="block font-bold">Loved by</span> <span className="font-normal opacity-80">our community</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ top: canvasTop }}>
        <Canvas
          camera={{ position: [0, 0, 6.0], fov: 32 }}
          gl={{ alpha: true }}
          style={{ pointerEvents: 'auto' }}
        >
          <fog attach="fog" args={['#F1E3FB', 14, 28]} />
          
          <ambientLight intensity={1.3} />
          <directionalLight position={[0, 10, 8]} intensity={1.4} />
          <spotLight position={[0, 6, 4]} intensity={1.4} penumbra={1} angle={0.8} color="#FFFFFF" />

          <SceneContainer pointerX={pointerX} pointerY={pointerY}>
            {endlessDeck.map((card, i) => (
              <StageCard
                key={`track-${card.id}-${i}`}
                card={card}
                index={i}
                totalCards={endlessDeck.length}
                scrollX={scrollX}
                isDragging={isDragging}
                onCardHoverChange={handleCardHoverChange}
              />
            ))}
            <StageFloor />
          </SceneContainer>
        </Canvas>
      </div>
    </motion.div>
  );
}