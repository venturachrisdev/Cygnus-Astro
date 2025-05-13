import { Pressable, View } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

interface CaptureButtonProps {
  progressPercentage: number;
  isCapturing: boolean;
  disabled: boolean;
  onCapture: () => void;
  onCancel: () => void;
}

export const CaptureButton = ({
  progressPercentage,
  isCapturing,
  disabled,
  onCancel,
  onCapture,
}: CaptureButtonProps) => (
  <View
    className="flex h-14 w-14 items-center justify-center rounded-full border-white"
    style={{ opacity: disabled ? 0.4 : 1.0 }}
  >
    <AnimatedCircularProgress
      size={60}
      width={2}
      fill={progressPercentage}
      delay={0}
      duration={250}
      tintColor="#008000"
      backgroundColor={disabled ? '#808080' : '#ffffff'}
    >
      {() => (
        <>
          {!isCapturing && (
            <Pressable
              disabled={disabled}
              onPress={() => onCapture()}
              className={`${
                disabled ? 'bg-gray-400' : 'bg-white'
              } flex h-12 w-12 items-center justify-center rounded-full`}
            />
          )}
          {isCapturing && (
            <Pressable
              disabled={disabled}
              onPress={() => onCancel()}
              className="h-6 w-6 rounded-sm bg-white"
            />
          )}
        </>
      )}
    </AnimatedCircularProgress>
  </View>
);
