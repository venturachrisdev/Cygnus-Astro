import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import {
  getLivestackImage,
  getLivestackImageInfo,
  getLivestackStatus,
  listAvailableLivestackImages,
  start,
  stop,
} from '@/actions/livestack';
import { ZoomableCameraImage } from '@/components/capture/ZoomableCameraImage';
import { CustomButton } from '@/components/CustomButton';
import { DropDown } from '@/components/DropDown';
import { StatusChip } from '@/components/StatusChip';
import { useConfigStore } from '@/stores/config.store';
import type { LiveStackImageRef } from '@/stores/livestack.store';
import { useLivestackStore } from '@/stores/livestack.store';

const imageRefId = ({ target, filter }: LiveStackImageRef) =>
  `${target}///${filter}`;

export const LiveStack = () => {
  const livestackState = useLivestackStore();
  const configState = useConfigStore();

  const [showImagesList, setShowImagesList] = useState(false);

  useEffect(() => {
    if (useConfigStore.getState().isConnected) {
      getLivestackStatus();
      listAvailableLivestackImages();
    }

    const interval = setInterval((_) => {
      if (useConfigStore.getState().isConnected) {
        getLivestackStatus();
        if (useLivestackStore.getState().isRunning) {
          listAvailableLivestackImages();
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  /* Refresh the selected stacked image on an interval while stacking is
     running so the newest exposures fold into the displayed frame. */
  useEffect(() => {
    const refresh = () => {
      const { selectedTarget, selectedFilter } = useLivestackStore.getState();
      if (selectedTarget && selectedFilter) {
        getLivestackImage(selectedTarget, selectedFilter);
        getLivestackImageInfo(selectedTarget, selectedFilter);
      }
    };

    refresh();

    const interval = setInterval(() => {
      if (
        useConfigStore.getState().isConnected &&
        useLivestackStore.getState().isRunning
      ) {
        refresh();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [livestackState.selectedTarget, livestackState.selectedFilter]);

  const imageItems = livestackState.availableImages.map((image) => ({
    id: imageRefId(image),
    name: `${image.target} - ${image.filter}`,
  }));

  const selectedId =
    livestackState.selectedTarget && livestackState.selectedFilter
      ? imageRefId({
          target: livestackState.selectedTarget,
          filter: livestackState.selectedFilter,
        })
      : null;

  const currentItem = imageItems.find((item) => item.id === selectedId) ?? null;

  const info = livestackState.currentImageInfo;
  let stackCountLabel: string | null = null;
  if (info) {
    stackCountLabel = info.IsMonochrome
      ? `Stacked: ${info.StackCount ?? 0}`
      : `R:${info.RedStackCount ?? 0} G:${info.GreenStackCount ?? 0} B:${
          info.BlueStackCount ?? 0
        }`;
  }

  return (
    <View className="flex h-full flex-1 bg-neutral-950 p-4">
      <View className="flex w-full flex-row items-center justify-between">
        <StatusChip
          isConnected={configState.isConnected}
          bubble
          label="Stacking"
          isActive={livestackState.isRunning}
        />

        {stackCountLabel && (
          <View className="flex h-8 flex-row items-center justify-center rounded-xl bg-neutral-900 px-4 py-1">
            <Text className="text-xs font-medium text-white">
              {stackCountLabel}
            </Text>
          </View>
        )}
      </View>

      <View className="my-4 flex flex-row items-center gap-x-4">
        <View className="flex-1">
          <DropDown
            defaultText="Select target and filter"
            onListExpand={() => setShowImagesList(!showImagesList)}
            isListExpanded={showImagesList}
            currentItem={currentItem}
            items={imageItems}
            onItemSelected={(item) => {
              setShowImagesList(false);
              const image = livestackState.availableImages.find(
                (candidate) => imageRefId(candidate) === item.id,
              );
              if (image) {
                livestackState.set({
                  selectedTarget: image.target,
                  selectedFilter: image.filter,
                });
              }
            }}
          />
        </View>

        <View className="w-48">
          {!livestackState.isRunning && (
            <CustomButton
              disabled={!configState.isConnected}
              onPress={() => start()}
              label="Start Stacking"
            />
          )}

          {livestackState.isRunning && (
            <CustomButton
              disabled={!configState.isConnected}
              onPress={() => stop()}
              label="Stop Stacking"
              color="red"
            />
          )}
        </View>
      </View>

      <View className="mt-2 flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-black">
        <ZoomableCameraImage
          image={livestackState.currentImage}
          resizeMode="contain"
          isLoading={livestackState.isLoadingImage}
        />
      </View>
    </View>
  );
};
