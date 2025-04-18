import { View, Pressable } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

interface CaptureButtonProps {
  progressPercentage: number;
  isCapturing: boolean;
  disabled: boolean;
  onCapture: () => void;
  onCancel: () => void;
}

export const CaptureButton = ({ progressPercentage, isCapturing, disabled, onCancel, onCapture }: CaptureButtonProps) => (
  <View className={`border-white rounded-full w-14 h-14 flex justify-center items-center`}>
    <AnimatedCircularProgress
      size={60}
      width={2}
      fill={progressPercentage}
      delay={0}
      duration={250}
      tintColor="#008000"
      backgroundColor={disabled ? "#808080" : "#ffffff"}>
      {() => (
        <>
          {!isCapturing && (
            <Pressable disabled={disabled} onPress={() => onCapture()} className={`${disabled ? "bg-gray-400" : "bg-white"} w-12 h-12 rounded-full flex justify-center items-center`}>
            </Pressable>
          )}
          {isCapturing && (
            <Pressable disabled={disabled} onPress={() => onCancel()} className={`bg-white w-6 h-6 rounded-sm`}>
            </Pressable>
          )}
        </>
      )}
    </AnimatedCircularProgress>
  </View>
);
