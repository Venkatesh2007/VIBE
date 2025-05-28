import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Cloud, Environment, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// Butterfly Component
import { useGLTF, useAnimations } from "@react-three/drei";

// const Butterfly = ({ startPosition }) => {
//     const ref = useRef(null);
//     const { scene, animations } = useGLTF("/models/butterfly.glb"); // Load Butterfly Model
//     const { actions } = useAnimations(animations, ref);
//     const direction = useRef(new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize());
//     const speed = 0.008 + Math.random() * 0.015; // Random speed

//     useEffect(() => {
//         if (actions["metarig|!"]) {
//             actions["metarig|!"].play(); // Play wing flapping animation if available
//         }
//     }, [actions]);

//     useFrame(({ clock }) => {
//         if (ref.current && startPosition) {
//             const t = clock.getElapsedTime();
    
//             // Horizontal roaming
//             ref.current.position.x += Math.sin(t * 2) * 0.005;
//             ref.current.position.z += Math.cos(t * 1.5) * 0.005;
    
//             // Vertical movement with constraints
//             const maxHeight = startPosition[1] + 1; // Maximum height it can go
//             const minHeight = startPosition[1] - 0.5; // Minimum height
    
//             ref.current.position.y += Math.sin(t * 3) * 0.02; // Base flutter motion
    
//             // Apply height constraints
//             ref.current.position.y = Math.max(minHeight, Math.min(ref.current.position.y, maxHeight));
//         }
//     });
    

//     return <primitive ref={ref} object={scene} position={startPosition} scale={0.001} />;
// };

// useGLTF.preload("/models/butterfly.glb");



const ThreeDBackground = () => {
    return (
        <>
            {/* Environment with HDR Lighting */}
            <Environment files="/textures/small_forest.hdr" background ground={{ height: 5, radius: 15, scale: 100 }} />



            {/* Floating Clouds */}
            <Cloud position={[0, 5, -10]} speed={0.1} scale={0.08} opacity={0.3} />
            <Cloud position={[3, 4, -8]} speed={0.15} scale={0.06} opacity={0.4} />
            <Cloud position={[-3, 4, -9]} speed={0.15} scale={0.06} opacity={0.4} />




            {/* Sparkling Magic Effects */}
            <Sparkles count={30} size={2} speed={0.3} position={[0, 1, -2]} />
            <Sparkles count={30} size={2} speed={0.3} position={[-1, 1, -2]} />
            <Sparkles count={30} size={2} speed={0.3} position={[1, 1, -2]} />


            {/* Moving Butterflies
            <Butterfly startPosition={[1.5, 1, 0]} />
<Butterfly startPosition={[-1.2, 1.2, 0]} />
<Butterfly startPosition={[-1.5, 0.8, 0]} />
<Butterfly startPosition={[0.5, 1.5, -0.5]} />
<Butterfly startPosition={[-0.8, 1, 0.5]} /> */}



        </>
    );
};

export default ThreeDBackground;
