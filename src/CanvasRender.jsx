import { Canvas } from "@react-three/fiber";
import { ModelRender } from "./ModelRender";
import { PerspectiveCamera } from "@react-three/drei";
import { useState } from "react";

export const CanvasRender = ({ url, rotate }) => {
  const [radius, setRadius] = useState(0);

  return (
    <Canvas
      shadows
      style={{
        width: '50vw',
        height: 'calc(100vh - 12px)',
        border: '6px solid #888',
        [rotate === 0 ? "borderRight" : "borderLeft"]: '3px solid #888',
        [rotate === 0 ? "borderLeft" : "borderRight"]: '6px solid #888',
      }}
    >
      <ModelRender url={url}
        onUpdate={(boundingSphere) => {
          setRadius(boundingSphere.radius);
        }}
        rotate={rotate}
      />
      <PerspectiveCamera
        fov={50}
        position={
          [0,
            -radius * 6,
            radius * 6
          ]}
        rotation={[0.82, 0, 0]}
        zoom={3.8}
        near={1}
        far={2000}
        OrbitControls={true}
        makeDefault />
      {/* <OrbitControls panSpeed={0.5} rotateSpeed={0.5} /> */}
      <spotLight
        intensity={2.4}
        angle={0.3}
        penumbra={1.3}
        position={[100, -300, 200]}
        castShadow={true}
      />
      <ambientLight intensity={0.8} />

      {/* floor */}
      <mesh receiveShadow={true}>
        <meshStandardMaterial
          attach="material"
          color="#eeeeee"
          emissive="#000000"
          roughness={1} />
        <planeBufferGeometry attach="geometry" args={[1200, 1200]} />
      </mesh>
    </Canvas>
  )
}