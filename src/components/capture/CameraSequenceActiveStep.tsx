import { View } from 'react-native';

import { SequenceStep } from '../sequence/SequenceStep';

interface CameraSequenceActiveStepProps {
  step: any;
  spinValue: any;
  isShowingGuiding: boolean;
  enabled: boolean;
}

export const CameraSequenceActiveStep = ({
  step,
  spinValue,
  isShowingGuiding,
  enabled,
}: CameraSequenceActiveStepProps) => {
  return (
    <View
      className={`absolute ${
        isShowingGuiding ? 'bottom-[180px]' : 'bottom-5'
      } left-5 min-w-[400px] rounded-lg bg-neutral-900 ${
        enabled ? 'opacity-70' : 'opacity-0'
      }`}
    >
      <SequenceStep item={step} index={1} spinValue={spinValue} transparent />
    </View>
  );
};
