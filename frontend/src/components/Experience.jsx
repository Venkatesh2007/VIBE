import {
  CameraControls,
  ContactShadows,
  Environment,
  Text,
} from "@react-three/drei";
import { a, useSpring } from "@react-spring/three";
import { Suspense, useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { Avatar } from "./Avatar";
import ThreeDBackground from "./ThreeDBackground";


// 📢 Captions Component (Displays AI's spoken text)
const Captions = (props) => {
  const { message } = useChat();
  const [caption, setCaption] = useState("");

  // const moodMusic = {
  //   smile: "/audio/happy.mp3",
  //   sad: "/audio/sad.mp3",
  //   default: "/audio/neutral.mp3"
  // };
  // const [audio] = useState(new Audio());
  // useEffect(() => {
  //   if (message?.facialExpression) {
  //     audio.src = moodMusic[message.facialExpression] || moodMusic.default;
  //     audio.loop = true;
  //     audio.volume = 0.3;
  //     audio.play();
  //   }
  //   return () => audio.pause();
  // }, [message]);
  
  useEffect(() => {
    if (message?.text) {
      setCaption(message.text);
    } else {
      setTimeout(() => setCaption(""), 1000); // Smooth fade-out
    }
  }, [message]);

  // 🎨 Animation for fade-in and fade-out effect
  const animationProps = useSpring({
    opacity: caption ? 1 : 0,
    position: caption ? [props.position[0], props.position[1] + 0.1, props.position[2]] : props.position,
    config: { duration: 500 }, // Smooth transition
  });


  if (!caption) return null;

  return (
    <group {...props}>
      <Text
        fontSize={0.025}
        anchorX={"left"}
        anchorY={"middle"}
        maxWidth={1}
        lineHeight={1.2}
      >
        {caption}
        <meshBasicMaterial attach="material" color="white" />
      </Text>
    </group>
  );
};

// 🔵 Existing Dots Component (Kept As Is)
const Dots = (props) => {
  const { loading } = useChat();
  const [loadingText, setLoadingText] = useState("");

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingText((prev) => (prev.length > 2 ? "." : prev + "."));
      }, 800);
      return () => clearInterval(interval);
    } else {
      setLoadingText("");
    }
  }, [loading]);

  if (!loading) return null;

  return (
    <group {...props}>
      <Text fontSize={0.14} anchorX={"left"} anchorY={"bottom"}>
        {loadingText}
        <meshBasicMaterial attach="material" color="black" />
      </Text>
    </group>
  );
};

// 🌟 Main Experience Component
export const Experience = () => {
  const cameraControls = useRef();
  const { cameraZoomed } = useChat();
  const [personDetected, setPersonDetected] = useState(false);

  // Callback triggered when the specific person is recognized
  const handleRecognition = (label) => {
    console.log(`${label} detected!`);
    setPersonDetected(true);
    // Here you can also call a function to trigger the avatar to talk
  };



  useEffect(() => {
    cameraControls.current.setLookAt(0, 2, 5, 0, 1.5, 0);
  }, []);

  useEffect(() => {
    if (cameraZoomed) {
      cameraControls.current.setLookAt(0, 1.5, 1.5, 0, 1.5, 0, true);
    } else {
      cameraControls.current.setLookAt(0, 2.2, 5, 0, 1.0, 0, true);
    }
  }, [cameraZoomed]);

  return (
    <>
      <CameraControls ref={cameraControls} />
      <Environment preset="sunset" />

      {/* Wrapping Components inside Suspense */}
      <Suspense>
        {/* 🔄 Existing Dots Component */}
        <Dots position-y={1.75} position-x={-0.02} />

        {/* 📢 Captions positioned to the left of AI */}
        <Captions position={[-0.3, 1.8, 0]} />
      </Suspense>

    
      {/* 🧑‍🚀 Avatar Model */}
      <ThreeDBackground />  

      <Avatar />

      {/* Soft Shadows */}
      <ContactShadows opacity={0.7} />
    </>
  );
};