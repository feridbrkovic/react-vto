import React, { useRef, useEffect, useState } from 'react';
import Webcam from "react-webcam";
import * as THREE from 'three';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
//import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
//import * as faceDetection from '@tensorflow-models/face-detection';
import '@tensorflow/tfjs-converter';
//import { FaceDetector } from '@tensorflow-models/face-detection/mediapipe_face_detection';
import glassesSrc from './glasses.png';

const App = () => {
  const webcamRef = useRef(null);
  const glassesRef = useRef(null);
   const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [glassesMesh, setGlassesMesh] = useState(null);

  useEffect(() => {
    async function getCameraAccess() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            // Assuming webcamRef is a ref to a video element:
            if (webcamRef.current) {
                webcamRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error("Error accessing the camera:", error);
        }
    }

    getCameraAccess();

    const loadModel = async () => {
      await tf.setBackend('webgl');
      const model = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFaceDetector,
        { maxFaces: 1 }
      );
      setModel(model);
      console.log("Model loaded.");
    };

    loadModel();
  }, []);

  useEffect(() => {
    // Initialize Three.js scene, camera, and renderer
    const initThree = () => {
      const width = canvasRef.current.clientWidth;
      const height = canvasRef.current.clientHeight;

      // Scene
      const scene = new THREE.Scene();
      setScene(scene);

      // Camera
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;
      setCamera(camera);

      // Renderer
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
      renderer.setSize(width, height);
      setRenderer(renderer);

      // Glasses mesh (simple example)
      renderer.linearEncoding = THREE.SRGBColorSpace;
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(glassesSrc, (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        const geometry = new THREE.PlaneGeometry(2, 1); // Adjust size to fit
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 1});
        const glasses = new THREE.Mesh(geometry, material);
        scene.add(glasses);
        setGlassesMesh(glasses);
        console.log("Glasses mesh added.");
      }, undefined, // onProgress not needed here, but it's the second argument
      (error) => console.error('Error loading glasses texture:', error));
    };

    initThree();
  }, []);

  

  useEffect(() => {
    // Define the rendering loop of Three.js
    const animate = () => {
      requestAnimationFrame(animate);
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };
    animate();
  }, [renderer, scene, camera]);

  function calculateDistance(pointA, pointB) {
    // Assuming pointA and pointB are arrays of [x, y, z]
    return Math.sqrt(Math.pow(pointB[0] - pointA[0], 2) + Math.pow(pointB[1] - pointA[1], 0));
}

const calculateRoll = (leftEye, rightEye) => {
  const deltaY = rightEye[1] - leftEye[1];
  const deltaX = rightEye[0] - leftEye[0];
  const angleRadians = Math.atan2(deltaY, deltaX);
  return angleRadians; // In radians
};


  useEffect(() => {
    
    
  const detect = async () => {
    if (!webcamRef.current || !model || !glassesMesh) return;
    const video = webcamRef.current.video;
    if (video.readyState !== 4) return;
  
    const faceEstimates = await model.estimateFaces({input: video});
    if (faceEstimates.length > 0) {
      const keypoints = faceEstimates[0].scaledMesh;

      const leftEye = keypoints[130]; // Left eye outer corner
      const rightEye = keypoints[359]; // Right eye outer corner
      const noseTip = keypoints[5]; // Nose tip for position
      const eyeCenter = keypoints[168]; // Nose tip for position
      const baselineEyeDistance = calculateDistance(leftEye, rightEye)

      const depth = Math.abs(leftEye[2] - rightEye[2]);

      const eyeDistance = calculateDistance(leftEye, rightEye);

      //console.log("Eye Distance:", eyeDistance);

      // Original distance your glasses mesh was designed to fit
      const originalDistance = 150; // Adjust this based on your model
      const scaleMultiplier = eyeDistance / originalDistance;
  
      const scaleX = -0.01;
      const scaleY = -0.01; // Inverted because Three.js y-axis is opposite to image y-axis
      const offsetX = 0; // Adjust based on scene
      const offsetY = -0.05; // Adjust based on scene
      // const fixedDepth = -5;

      // const normalizedX = (eyeCenter[0] / video.videoWidth) * 2 - 1;
      // const normalizedY = ((eyeCenter[1] / video.videoHeight) * 2 - 1);

      glassesMesh.position.x = (eyeCenter[0] - video.videoWidth / 2) * scaleX + offsetX;
      glassesMesh.position.y = (eyeCenter[1] - video.videoHeight / 2) * scaleY + offsetY;

      
        glassesMesh.scale.set(scaleMultiplier, scaleMultiplier, scaleMultiplier);
      
      glassesMesh.position.z = camera.position.z - 4;

      const eyeLine = new THREE.Vector2(rightEye[0] - leftEye[0], rightEye[1] - leftEye[1]);
      const rotationZ = Math.atan2(eyeLine.y, eyeLine.x);
      
      glassesMesh.rotation.z = rotationZ;

    }
  };
  
  

  const intervalId = setInterval(detect, 200);
  return () => clearInterval(intervalId);
}, [model, glassesMesh, camera, scene]);

  return (
    <div style={{ position: 'relative', width: '800px', height: '800px' }}>
      <Webcam ref={webcamRef} autoPlay playsInline style={{ width: '800px', height: '800px' }} mirrored={true} />
      <canvas ref={canvasRef} style={{ width: '800px', height: '800px', position: 'absolute', top: 0, left: 0 }} />
    </div>
  );
};

export default App;
