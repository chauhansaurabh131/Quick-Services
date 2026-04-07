import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {useFaceDetector} from 'react-native-vision-camera-face-detector';
import {Worklets, useSharedValue} from 'react-native-worklets-core';

export default function FaceCaptureScreen({navigation}) {
  const device = useCameraDevice('front');
  const format = useCameraFormat(device, [
    {videoResolution: {width: 1280, height: 720}},
    {fps: 30},
  ]);
  const cameraRef = useRef(null);

  const [hasPermission, setHasPermission] = useState(false);
  const [instruction, setInstruction] = useState('Look straight');
  const [isRecording, setIsRecording] = useState(false);
  const [stage, setStage] = useState('center'); // center -> right -> left -> done
  const stageRef = useRef('center');
  const recordingTimeoutRef = useRef(null);
  const autoReturnTimeoutRef = useRef(null);
  const lastFrameTime = useSharedValue(0);

  // Track consecutive successful frames for each stage
  const frameCountRef = useRef(0);

  const faceDetectionOptions = useRef({
    trackingEnabled: false,
    landmarkMode: 'none',
    contourMode: 'none',
    classificationMode: 'none',
  }).current;

  const {detectFaces, stopListeners} = useFaceDetector(faceDetectionOptions);

  const requestPermissions = async () => {
    try {
      const cameraPermission = await Camera.requestCameraPermission();
      const microphonePermission = await Camera.requestMicrophonePermission();

      if (
        cameraPermission === 'granted' &&
        microphonePermission === 'granted'
      ) {
        setHasPermission(true);
      } else {
        Alert.alert(
          'Permission needed',
          'Camera and Microphone permissions are required to record the clip. Please grant them in settings if prompted.',
          [
            {
              text: 'Cancel',
              onPress: () => navigation.goBack(),
              style: 'cancel',
            },
            {
              text: 'Retry',
              onPress: () => requestPermissions(),
            },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ],
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'An error occurred while requesting permissions.');
    }
  };

  useEffect(() => {
    requestPermissions();
    return () => {
      stopListeners();
      if (autoReturnTimeoutRef.current) {
        clearTimeout(autoReturnTimeoutRef.current);
      }
    };
  }, []);

  const startRecordingSequence = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      try {
        cameraRef.current.startRecording({
          onRecordingFinished: video => {
            console.log('Video recorded:', video);
          },
          onRecordingError: error => console.error(error),
        });

        recordingTimeoutRef.current = setTimeout(() => {
          stopRecording();
        }, 7000); // 7 seconds video
      } catch (e) {
        console.error(e);
      }
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      await cameraRef.current.stopRecording();
      setIsRecording(false);
    }
  };

  const handleFaceFailure = () => {
    if (isRecording) {
      clearTimeout(recordingTimeoutRef.current);
      stopRecording();
      Alert.alert(
        'Face Detection Failed',
        'Please keep your face clearly visible and try again.',
        [{text: 'Retry', onPress: () => resetSequence()}],
      );
    }
  };

  const resetSequence = () => {
    stageRef.current = 'center';
    setStage('center');
    setInstruction('Look straight');
    frameCountRef.current = 0;
  };

  const handleDetectedFaces = Worklets.createRunOnJS(faces => {
    // Basic logic to handle face presence and yaw angle
    if (faces.length > 0) {
      const face = faces[0];
      const yawAngle = face.yawAngle; // Turn angle

      // Simple logic based on current stage
      if (stageRef.current === 'center') {
        if (Math.abs(yawAngle) < 15) {
          frameCountRef.current += 1;
          if (frameCountRef.current > 15) {
            stageRef.current = 'right';
            setStage('right');
            setInstruction('Turn slightly right');
            frameCountRef.current = 0;
            if (!isRecording) {
              startRecordingSequence();
            }
          }
        } else {
          frameCountRef.current = 0;
        }
      } else if (stageRef.current === 'right') {
        if (yawAngle < -20) {
          // turning right (yaw might be negative or positive depending on camera)
          frameCountRef.current += 1;
          if (frameCountRef.current > 15) {
            stageRef.current = 'left';
            setStage('left');
            setInstruction('Turn slightly left');
            frameCountRef.current = 0;
          }
        }
      } else if (stageRef.current === 'left') {
        if (yawAngle > 20) {
          frameCountRef.current += 1;
          if (frameCountRef.current > 15) {
            stageRef.current = 'done';
            setStage('done');
            setInstruction('Recording Complete!');
            frameCountRef.current = 0;
            stopRecording();

            // Auto-return after 1.5 seconds
            autoReturnTimeoutRef.current = setTimeout(() => {
              navigation.navigate('KycDetailsScreen', {isCaptureDone: true});
            }, 1500);
          }
        }
      }
    } else {
      // No face detected
      if (isRecording && stageRef.current !== 'done') {
        // Lost face during recording before completion
        handleFaceFailure();
      }
    }
  });

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      const now = Date.now();
      if (now - lastFrameTime.value > 100) {
        // 10 fps = 100ms
        lastFrameTime.value = now;
        const faces = detectFaces(frame);
        handleDetectedFaces(faces);
      }
    },
    [handleDetectedFaces, lastFrameTime],
  );

  if (!device || !hasPermission) {
    return (
      <View style={styles.container}>
        <Text>Checking permissions and camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        format={format}
        isActive={true}
        video={true}
        audio={true}
        frameProcessor={frameProcessor}
      />
      <View style={styles.overlay}>
        <Text style={styles.instruction}>{instruction}</Text>
        {isRecording && <Text style={styles.recordingText}>Recording...</Text>}
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          stopListeners();
          if (autoReturnTimeoutRef.current) {
            clearTimeout(autoReturnTimeoutRef.current);
          }
          if (stage === 'KycDetailsScreen') {
            navigation.navigate('KycDetailsScreen', {isCaptureDone: true});
          } else {
            navigation.goBack();
          }
        }}>
        <Text style={styles.closeText}>
          {stage === 'done' ? 'Done' : 'Close'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 80,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  instruction: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  recordingText: {
    color: 'red',
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  closeText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
