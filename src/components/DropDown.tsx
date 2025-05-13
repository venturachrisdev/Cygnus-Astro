import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import type { Device } from '@/actions/constants';

interface DropDownProps {
  onListExpand: () => void;
  isListExpanded: boolean;
  currentItem: Device | null;
  items: Device[];
  onItemSelected: (item: Device) => void;
  width?: number;
  defaultText: string;
}

export const DropDown = ({
  width = 620,
  onListExpand,
  isListExpanded,
  onItemSelected,
  items,
  currentItem,
  defaultText,
}: DropDownProps) => {
  const triggerRef = useRef<View>(null);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0 });

  useEffect(() => {
    if (triggerRef.current && isListExpanded) {
      triggerRef.current.measure((_fx, _fy, _width, height, px, py) => {
        setPosition({
          x: px,
          y: py + height,
          width,
        });
      });
    }
  }, [isListExpanded, width]);

  return (
    <View className="flex-1 justify-center rounded-lg bg-black">
      <Pressable
        ref={triggerRef}
        onPress={() => {
          if (items.length > 0) onListExpand();
        }}
        className="flex h-12 w-full flex-row items-center justify-between px-3"
      >
        <Text
          className="ml-3 font-medium text-white"
          style={{ opacity: items.length > 0 ? 1.0 : 0.4 }}
        >
          {currentItem?.name || defaultText}
        </Text>
        <Icon
          size={20}
          color={items.length > 0 ? 'white' : 'gray'}
          name={isListExpanded ? 'chevron-up' : 'chevron-down'}
        />
      </Pressable>
      <Modal
        supportedOrientations={['landscape']}
        visible={isListExpanded && items.length > 0}
        transparent
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={() => onListExpand()}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              width: '100%',
              height: '100%',
            }}
          />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={() => onListExpand()}>
          <View className="max-h-64">
            <ScrollView
              style={{
                top: position.y,
                right: 0,
                left: position.x + position.width / 2 - width / 2,
                width,
              }}
              className="rounded-lg bg-neutral-900 px-5 py-1"
            >
              {items.map((item, i) => (
                <Pressable
                  key={`${item.id}-${i}`}
                  onPress={() => onItemSelected(item)}
                >
                  <Text
                    className={`${
                      item.id === currentItem?.id ? 'font-bold' : 'font-medium'
                    } my-4 text-white`}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
