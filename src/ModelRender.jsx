import { Center } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import { useEffect } from "react";
import { ShaderMaterial } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";


export const ModelRender = ({ url, onUpdate, rotate }) => {
  const geom = useLoader(STLLoader, url);

  useEffect(() => {
    geom.computeBoundingSphere();
    onUpdate(geom.boundingSphere);
  }, [geom, url])

  return (
    <Center front>
      <mesh geometry={geom}
        castShadow
        receiveShadow
        rotation={[0, 0, rotate * Math.PI / 2 + 1]}
      >
        <meshStandardMaterial
          attach="material"
          color="#049ef4"
          emissive="#000000"
          fog={true}
          roughness={1}
        />
      </mesh>
    </Center>
  );
}
