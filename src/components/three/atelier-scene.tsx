"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveDpr, Environment, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { Color, Group, Mesh, PointLight, SpotLight } from "three";
import { choreography } from "@/components/motion/choreography";

const sofaUrl = "/models/sofa.glb";
const vesselUrl = "/models/vessel.glb";
const chandelierUrl = "/models/chandelier.glb";

function EditorialModel({ url, scale, rotation = 0, ready }: { url: string; scale: number; rotation?: number; ready: () => void }) {
  const { scene } = useGLTF(url, false, false);
  const object = useMemo(() => {
    const copy = scene.clone(true);
    copy.traverse((node) => {
      if (node instanceof Mesh) { node.castShadow = true; node.receiveShadow = true; }
    });
    copy.visible = false;
    return copy;
  }, [scene]);
  const { gl, camera, scene: stage, invalidate } = useThree();
  useEffect(() => {
    let cancelled = false;
    // Prepare the final lighting/material variant while the chapter still is visible.
    const frame = requestAnimationFrame(() => {
      if (gl.getContext().isContextLost()) return;
      void gl.compileAsync(object, camera, stage).catch(() => {
        // The normal render path remains available when asynchronous compilation fails.
      }).then(() => {
        if (cancelled || gl.getContext().isContextLost()) return;
        object.visible = true;
        invalidate();
        ready();
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      object.visible = false;
    };
  }, [camera, gl, invalidate, object, ready, stage]);
  return <primitive object={object} scale={scale} rotation-y={rotation} dispose={null} />;
}

function VesselPlinth() {
  return <group>
    <mesh castShadow receiveShadow position={[0, 0.27, 0]}>
      <cylinderGeometry args={[0.64, 0.67, 0.54, 64]} /><meshStandardMaterial color="#343834" roughness={0.68} />
    </mesh>
    <mesh position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.666, 0.012, 10, 64]} /><meshStandardMaterial color="#917247" metalness={0.68} roughness={0.36} />
    </mesh>
  </group>;
}

function Stage({ progress, mark, ready, chapter }: { chapter: number; progress: RefObject<number>; mark: (asset: number) => void; ready: boolean }) {
  const sofa = useRef<Group>(null);
  const vase = useRef<Group>(null);
  const chandelier = useRef<Group>(null);
  const bed = useRef<Group>(null);
  const gallery = useRef<Group>(null);
  const key = useRef<SpotLight>(null);
  const warm = useRef<PointLight>(null);
  const entrance = useRef({ amount: 0 });
  const invalidate = useThree((state) => state.invalidate);
  const coolTone = useMemo(() => new Color("#dce9ff"), []);
  const warmTone = useMemo(() => new Color("#ffcd8a"), []);
  const markSofa = useMemo(() => () => mark(0), [mark]);
  const markVase = useMemo(() => () => mark(1), [mark]);
  const markBed = useMemo(() => () => mark(3), [mark]);
  const markGallery = useMemo(() => () => mark(4), [mark]);
  const markChandelier = useMemo(() => () => mark(2), [mark]);

  useEffect(() => {
    if (!ready) return;
    const sequence = gsap.to(entrance.current, { amount: 1, duration: 1.15, ease: "power2.out",
      onUpdate: () => { if (!document.hidden) invalidate(); } });
    return () => { sequence.kill(); };
  }, [ready, invalidate]);

  useFrame(({ camera, size }) => {
    if (!sofa.current || !vase.current || !chandelier.current || !bed.current || !gallery.current || !key.current || !warm.current) return;
    const state = choreography(progress.current);
    const opening = (1 - entrance.current.amount) * Math.max(0, 1 - progress.current / 0.24);
    const framing = Math.min(1.12, size.width / size.height / 1.6);
    sofa.current.position.set(state.sofa.x * framing, 0.025, state.sofa.z);
    sofa.current.rotation.y = state.sofa.angle - opening * 0.24;
    sofa.current.visible = progress.current < 0.36;
    vase.current.position.set(state.vase.x * framing, 0, state.vase.z);
    vase.current.rotation.y = state.vase.angle;
    vase.current.visible = progress.current > 0.255 && progress.current < 0.545;
    chandelier.current.position.set(state.chandelier.x * framing, state.chandelier.y, 0.22);
    chandelier.current.rotation.y = state.chandelier.angle;
    chandelier.current.visible = progress.current > 0.64;
    bed.current.position.set(state.bed.x * framing, .015, state.bed.z);
    bed.current.rotation.y = state.bed.angle;
    bed.current.visible = progress.current > .44 && progress.current < .735;
    gallery.current.position.set((2.05 + (1-state.gallery)*5) * framing, .012, .38);
    gallery.current.rotation.y = -.66 + state.gallery*.27;
    gallery.current.visible = progress.current > .65;
    warm.current.position.set(state.chandelier.x, 1.25 + state.chandelier.y, 0.9);
    warm.current.intensity = state.warmth * 19;
    key.current.color.copy(coolTone).lerp(warmTone, state.warmth * 0.78);
    key.current.intensity = (100 + state.warmth * 28) * (1 - opening * 0.38);
    camera.position.set(state.camera.x, state.camera.y, state.camera.z);
    camera.lookAt(-0.06, state.camera.aim, 0);
  });

  return <>
    <hemisphereLight args={["#a8b8bf", "#4e3a24", 1.38]} />
    <spotLight ref={key} position={[3.3, 6, 4.1]} angle={0.56} penumbra={0.82} castShadow
      shadow-mapSize={[1024, 1024]} shadow-bias={-0.00018} shadow-normalBias={0.025} />
    <spotLight position={[2, 3, -3]} color="#8ab1ea" intensity={54} angle={0.73} penumbra={1} />
    <spotLight position={[-3, 1.5, 3.5]} color="#dab78c" intensity={18} angle={0.75} penumbra={1} />
    <pointLight ref={warm} color="#f5ac62" distance={10} decay={2} intensity={0} />
    <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[35, 35]} /><shadowMaterial transparent opacity={0.54} />
    </mesh>
    <group ref={sofa}><Suspense fallback={null}>
      <Environment files="/models/studio.hdr" environmentIntensity={0.41} />
      <EditorialModel url={sofaUrl} scale={1.16} ready={markSofa} />
    </Suspense></group>
    <group ref={vase}>
      <VesselPlinth />
      {ready && chapter >= 1 && <Suspense fallback={null}><group position-y={0.533}>
        <EditorialModel url={vesselUrl} scale={5.25} ready={markVase} />
        {[{ y: 0.469, radius: 0.539 }, { y: 0.557, radius: 0.538 }].map(({ y, radius }) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.009, 8, 64]} />
            <meshStandardMaterial color="#b28a53" metalness={0.75} roughness={0.33} />
          </mesh>
        ))}
      </group></Suspense>}
    </group>
    <group ref={bed}>{ready && chapter >= 2 && <Suspense fallback={null}>
      <EditorialModel url="/models/GothicBed_01/model.gltf" scale={1.32} ready={markBed} />
    </Suspense>}</group>
    <group ref={gallery}>{ready && chapter >= 3 && <Suspense fallback={null}>
      <EditorialModel url="/models/mid_century_lounge_chair/model.gltf" scale={1.02} ready={markGallery} />
      <group position={[-.94, 0, .18]}><EditorialModel url="/models/side_table_01/model.gltf" scale={1.1} ready={markGallery} /></group>
    </Suspense>}</group>
    <group ref={chandelier}>
      {ready && chapter >= 3 && <Suspense fallback={null}><EditorialModel url={chandelierUrl} scale={2.25} ready={markChandelier} /></Suspense>}
    </group>
  </>;
}

function CanvasLifecycle({ fallback }: { fallback: () => void }) {
  const canvas = useThree((state) => state.gl.domElement);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const loss = (event: Event) => { event.preventDefault(); fallback(); };
    const redraw = () => { if (!document.hidden) invalidate(); };
    canvas.addEventListener("webglcontextlost", loss);
    document.addEventListener("visibilitychange", redraw);
    return () => {
      canvas.removeEventListener("webglcontextlost", loss);
      document.removeEventListener("visibilitychange", redraw);
    };
  }, [canvas, fallback, invalidate]);
  return null;
}

export default function AtelierScene({ progress, registerRenderer, mark, ready, fallback, chapter }: {
  chapter: number;
  progress: RefObject<number>; registerRenderer: (invalidate: () => void) => void; mark: (asset: number) => void;
  ready: boolean; fallback: () => void;
}) {
  return <Canvas shadows dpr={[1, 1.4]} camera={{ position: [0, 2, 6.75], fov: 36 }} frameloop="demand" performance={{ min: .8, debounce: 180 }}
    gl={{ alpha: true, antialias: true, powerPreference: "default" }} onCreated={({ invalidate, performance }) => registerRenderer(() => { performance.regress(); invalidate(); })}>
    <AdaptiveDpr /><CanvasLifecycle fallback={fallback} /><Stage progress={progress} mark={mark} ready={ready} chapter={chapter} />
  </Canvas>;
}
