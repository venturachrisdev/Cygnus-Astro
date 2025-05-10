import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

interface CameraMountControlBarProps {
  absolute?: boolean;
  showStop?: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveStop: () => void;
  disabled?: boolean;
}

export const CameraMountControlBar = ({
  absolute,
  showStop,
  onMoveDown,
  onMoveLeft,
  onMoveRight,
  onMoveUp,
  onMoveStop,
  disabled,
}: CameraMountControlBarProps) => {
  const [intervalID, setIntervalID] = useState<NodeJS.Timer | null>();

  const handlePress = (movingFn: () => void) => {
    if (!disabled) {
      movingFn();
    }
  };

  const onLongPressIn = (movingFn: () => void) => {
    const interval = setInterval(() => {
      movingFn();
    }, 1000);

    setIntervalID(interval);
  };

  const onLongPressOut = () => {
    if (intervalID) {
      clearInterval(intervalID);
      setIntervalID(null);
    }
  };

  return (
    <View
      className={`${
        absolute === true ? 'absolute right-5 top-5 opacity-60' : ''
      } ${
        disabled ? 'opacity-40' : ''
      } flex flex-row items-center justify-center gap-x-3`}
    >
      <Pressable
        onPress={() => handlePress(onMoveLeft)}
        onPressIn={() => onLongPressIn(onMoveLeft)}
        onPressOut={() => onLongPressOut()}
        className="flex h-14 w-14 items-center justify-center rounded-lg bg-neutral-900"
      >
        <Icon name="arrow-left-thick" size={24} color="white" />
      </Pressable>

      <View className="flex items-center justify-center gap-y-3">
        <Pressable
          onPress={() => handlePress(onMoveUp)}
          onPressIn={() => onLongPressIn(onMoveUp)}
          onPressOut={() => onLongPressOut()}
          className="flex h-14 w-14 items-center justify-center rounded-lg bg-neutral-900"
        >
          <Icon name="arrow-up-thick" size={24} color="white" />
        </Pressable>

        {showStop && (
          <Pressable
            onPress={() => handlePress(onMoveStop)}
            className="flex h-14 w-14 items-center justify-center rounded-lg bg-red-800"
          >
            <Icon name="stop-circle" size={32} color="white" />
          </Pressable>
        )}

        <Pressable
          onPress={() => handlePress(onMoveDown)}
          onPressIn={() => onLongPressIn(onMoveDown)}
          onPressOut={() => onLongPressOut()}
          className="flex h-14 w-14 items-center justify-center rounded-lg bg-neutral-900"
        >
          <Icon name="arrow-down-thick" size={24} color="white" />
        </Pressable>
      </View>

      <Pressable
        onPress={() => handlePress(onMoveRight)}
        onPressIn={() => onLongPressIn(onMoveRight)}
        onPressOut={() => onLongPressOut()}
        className="flex h-14 w-14 items-center justify-center rounded-lg bg-neutral-900"
      >
        <Icon name="arrow-right-thick" size={28} color="white" />
      </Pressable>
    </View>
  );
};
