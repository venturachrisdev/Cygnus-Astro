import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { abortCaptureImage, getCameraInfo } from '@/actions/camera';
import type { Device } from '@/actions/constants';
import {
  framingSlew,
  setFramingCoordinates,
  setFramingSource,
} from '@/actions/framing';
import { fetchGPSLocation } from '@/actions/gps';
import {
  convertDMStoDegrees,
  convertHMStoDegrees,
  getMountInfo,
  stopSlewMount,
} from '@/actions/mount';
import { filterNGC, getNGCTypeText, searchNGC } from '@/actions/ngc';
import { setSequenceTarget } from '@/actions/sequence';
import { disconnectEventsSocket, initializeEventsSocket } from '@/actions/tppa';
import { CircleButton } from '@/components/CircleButton';
import { CustomButton } from '@/components/CustomButton';
import { DropDown } from '@/components/DropDown';
import { TextInputLabel } from '@/components/TextInputLabel';
import { getAltitudePoints } from '@/helpers/sequence';
import { useAlertsStore } from '@/stores/alerts.store';
import { useCameraStore } from '@/stores/camera.store';
import { useConfigStore } from '@/stores/config.store';
import { useFavoritesStore } from '@/stores/favorites.store';
import { useMountStore } from '@/stores/mount.store';
import { useNGCStore } from '@/stores/ngc.store';
import { useSequenceStore } from '@/stores/sequence.store';

const ALL_TARGETS_LIST_NAME = 'All targets';

export const TargetSearch = () => {
  const router = useRouter();
  const configState = useConfigStore();
  const ngcState = useNGCStore();
  const alertState = useAlertsStore();
  const mountState = useMountStore();
  const cameraState = useCameraStore();
  const sequenceState = useSequenceStore();
  const favoritesState = useFavoritesStore();

  const [searchValue, setSearchValue] = useState<string>('');
  const [debounceID, setDebounceID] = useState<NodeJS.Timer>();
  const [didPlatesolveFail, setDidPlatesolveFail] = useState<boolean>(false);
  const [canShowFramingModal, setCanShowFramingModal] = useState<boolean>(true);
  const [newListName, setNewListName] = useState<string>();
  const [showFavoritesModal, setShowFavoritesModal] = useState<boolean>(false);
  const [showListsDropDown, setShowListsDropdown] = useState<boolean>(false);
  const [currentList, setCurrentList] = useState<Device>({
    name: ALL_TARGETS_LIST_NAME,
    id: ALL_TARGETS_LIST_NAME,
  });

  const spinValue = useRef(new Animated.Value(0)).current;
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const onValueChange = (value: string) => {
    setSearchValue(value);

    if (value.trim().length >= 3) {
      if (debounceID) {
        clearTimeout(debounceID);
      }

      const debounce = setTimeout(() => {
        searchNGC(value);
      }, 1000);

      setDebounceID(debounce);
    }
  };

  useEffect(() => {
    if (mountState.isSlewing || cameraState.isExposing) {
      setDidPlatesolveFail(false);
    }
  }, [mountState.isSlewing, cameraState.isExposing]);

  useEffect(() => {
    initializeEventsSocket((message) => {
      if (message.Response.Event === 'ERROR-PLATESOLVE') {
        setDidPlatesolveFail(true);
      }
    });

    const { latitude, longitude } = configState.draftConfig.astrometry;
    if (!latitude || !longitude) {
      console.log('No coordinates found. Using GPS');
      fetchGPSLocation();
    }

    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    const interval = setInterval((_) => {
      if (useConfigStore.getState().isConnected) {
        getMountInfo();
        getCameraInfo();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      disconnectEventsSocket();
    };
  }, []);

  const onGoto = async (center: boolean) => {
    if (
      ngcState.selectedObject &&
      mountState.isConnected &&
      cameraState.isConnected
    ) {
      const raInDegrees = convertHMStoDegrees(ngcState.selectedObject.ra, true);
      const decInDegrees = convertDMStoDegrees(
        ngcState.selectedObject.dec,
        true,
      );

      await setFramingSource();
      await setFramingCoordinates(raInDegrees, decInDegrees);
      await framingSlew(center, true);
      setCanShowFramingModal(true);
    }
  };

  const onAddToSequence = async () => {
    if (ngcState.selectedObject && sequenceState.sequence.length > 0) {
      const name =
        ngcState.selectedObject.names.split(',')[0] ||
        ngcState.selectedObject.type;
      const raInDegrees = convertHMStoDegrees(ngcState.selectedObject.ra, true);
      const decInDegrees = convertDMStoDegrees(
        ngcState.selectedObject.dec,
        true,
      );

      await setSequenceTarget(name, raInDegrees, decInDegrees);
      router.back();
    }
  };

  const now = new Date();
  let hours = now.getHours();
  hours = hours < 12 ? hours + 12 : hours - 12;
  const minutes = now.getMinutes();
  const hourDate = hours + minutes / 60;

  const addNewFavoriteList = () => {
    if (newListName) {
      favoritesState.set({
        lists: [
          {
            name: newListName,
            targets: [],
          },
          ...favoritesState.lists,
        ],
      });
    }
    setNewListName(undefined);
  };

  const onListSelected = (item: Device) => {
    setCurrentList(item);
    filterNGC(
      useFavoritesStore.getState().lists.find((l) => l.name === item.name)
        ?.targets || [],
      item.name !== ALL_TARGETS_LIST_NAME,
    );
    setShowListsDropdown(false);
    setSearchValue('');
  };

  const addNGCToList = (listName: string) => {
    const selectedList = favoritesState.lists.find(
      (list) => list.name === listName,
    );
    if (selectedList && ngcState.selectedObject) {
      selectedList.targets.push(ngcState.selectedObject);
      const remainingLists = favoritesState.lists.filter(
        (list) => list.name !== selectedList.name,
      );
      favoritesState.set({
        lists: [...remainingLists, selectedList],
      });

      alertState.set({
        message: `'${ngcState.selectedObject?.names.split(',')[0]}' added to '${
          selectedList.name
        }' list!`,
        type: 'success',
      });
      const deviceList = { name: selectedList.name, id: selectedList.name };
      setCurrentList(deviceList);
      setShowFavoritesModal(false);
      onListSelected(deviceList);
    }
  };

  const removeFromFavorites = () => {
    if (ngcState.selectedObject) {
      for (const list of favoritesState.lists) {
        if (
          list.targets.find(
            (target) => target.names === ngcState.selectedObject?.names,
          )
        ) {
          const targetsRemoved = list.targets.filter(
            (target) => target.names !== ngcState.selectedObject?.names,
          );
          const remainingLists = favoritesState.lists.filter(
            (l) => l.name !== list.name,
          );
          favoritesState.set({
            lists: [
              ...remainingLists,
              {
                name: list.name,
                targets: targetsRemoved,
              },
            ],
          });
          alertState.set({
            message: `'${ngcState.selectedObject?.names.split(
              ',',
            )[0]}' removed from '${list.name}' list!`,
            type: 'success',
          });

          onListSelected(currentList);
        }
      }
    }
  };

  const deleteList = (list: Device) => {
    const remainingLists = favoritesState.lists.filter(
      (l) => l.name !== list.name,
    );
    favoritesState.set({
      lists: remainingLists,
    });

    alertState.set({
      message: `'${list.name}' removed successfully!`,
      type: 'success',
    });

    const deviceList = {
      name: ALL_TARGETS_LIST_NAME,
      id: ALL_TARGETS_LIST_NAME,
    };
    setCurrentList(deviceList);
    onListSelected(deviceList);
  };

  const isFavorite = useMemo(() => {
    if (ngcState.selectedObject) {
      for (const list of favoritesState.lists) {
        if (
          list.targets.find(
            (target) => target.names === ngcState.selectedObject?.names,
          )
        ) {
          return true;
        }
      }
    }
    return false;
  }, [ngcState.selectedObject, favoritesState.lists]);

  return (
    <>
      <Modal
        visible={showFavoritesModal}
        transparent
        supportedOrientations={['landscape']}
      >
        <View className="absolute h-full w-full bg-black opacity-90">
          <View className="flex flex-1 items-center justify-center">
            <View className="flex w-96 rounded-lg bg-neutral-900 p-5">
              <View className="flex flex-row">
                <TextInputLabel
                  placeholder="Create New List"
                  onChange={(text) => setNewListName(text)}
                  value={newListName ?? ''}
                />
                <View className="ml-4 w-20">
                  <CustomButton
                    disabled={!newListName}
                    color="green"
                    iconSize={20}
                    icon="plus"
                    onPress={addNewFavoriteList}
                  />
                </View>
              </View>
              {favoritesState.lists.length > 0 && (
                <View className="mt-6 max-h-[70%]">
                  <ScrollView>
                    {favoritesState.lists.map((list) => (
                      <View key={list.name}>
                        <Pressable
                          onPress={() => addNGCToList(list.name)}
                          className="px-3 py-5"
                        >
                          <Text className="font-bold text-white">
                            {list.name}
                            {'    '}
                            <Text className="text-gray-600">
                              ({list.targets.length} targets)
                            </Text>
                          </Text>
                        </Pressable>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={ngcState.isRunning && canShowFramingModal}
        transparent
        supportedOrientations={['landscape']}
      >
        <View className="absolute h-full w-full bg-black opacity-50" />
        <View className="flex flex-1 items-center justify-center">
          <View className="flex w-96 rounded-lg bg-neutral-900 p-5">
            <View className="flex flex-row">
              <View className="mr-10 flex gap-y-6">
                {!mountState.isSlewing &&
                  !cameraState.isExposing &&
                  !didPlatesolveFail && (
                    <View className="flex flex-row items-center">
                      <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <Icon name="loading" size={16} color="white" />
                      </Animated.View>
                      <Text className="ml-3 text-xl text-white">
                        Framing...
                      </Text>
                    </View>
                  )}
                {mountState.isSlewing && (
                  <View className="flex flex-row items-center">
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Icon name="loading" size={16} color="white" />
                    </Animated.View>
                    <Text className="ml-3 text-xl text-white">
                      Slewing to target...
                    </Text>
                  </View>
                )}
                {cameraState.isExposing && (
                  <View className="flex flex-row items-center">
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Icon name="loading" size={16} color="white" />
                    </Animated.View>
                    <Text className="ml-3 text-xl text-white">Exposing...</Text>
                  </View>
                )}
                {didPlatesolveFail && (
                  <View className="flex flex-row items-center">
                    <View>
                      <Icon
                        name="information-outline"
                        size={18}
                        color="#a71914"
                      />
                    </View>
                    <Text className="ml-1 text-xl text-red-600">
                      Platesolve failed. Retrying...
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View className="mt-10 flex w-full flex-row">
              <View className="mr-2 h-12 flex-1">
                <CustomButton
                  label="Stop"
                  color="red"
                  onPress={() => {
                    stopSlewMount();
                    abortCaptureImage();
                  }}
                />
              </View>
              <View className="h-12 flex-1">
                <CustomButton
                  label="Close"
                  color="transparent"
                  onPress={() => setCanShowFramingModal(false)}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView
        bounces={false}
        className="flex h-full flex-1 bg-neutral-950 px-4"
      >
        <View className="flex w-full flex-row items-center justify-between pt-2">
          <View className="flex flex-row items-center">
            <View className="w-12">
              <CustomButton
                onPress={() => router.back()}
                color="transparent"
                icon="arrow-left"
                iconSize={24}
              />
            </View>
            <Text className="ml-2 text-xl font-medium text-white">Targets</Text>
          </View>
        </View>
        <View className="flex w-full flex-row items-center justify-between pt-2">
          <View>
            <DropDown
              isListExpanded={showListsDropDown}
              items={[
                { name: ALL_TARGETS_LIST_NAME, id: ALL_TARGETS_LIST_NAME },
                ...favoritesState.lists.map((list) => ({
                  name: list.name,
                  id: list.name,
                })),
              ]}
              defaultText="Select List"
              onItemSelected={onListSelected}
              onListExpand={() => setShowListsDropdown(!showListsDropDown)}
              currentItem={currentList}
            />
          </View>
        </View>
        {currentList?.name === ALL_TARGETS_LIST_NAME && (
          <View className="mt-4 flex w-full flex-row items-center">
            <TextInputLabel
              value={searchValue}
              placeholder="Search Object (e.g NGC4665, Andromeda Galaxy)"
              onChange={onValueChange}
              disabled={currentList.name !== ALL_TARGETS_LIST_NAME}
            />
          </View>
        )}
        {currentList?.name !== ALL_TARGETS_LIST_NAME && (
          <View className="my-4 flex w-full flex-row items-center justify-end">
            <View className="w-48 opacity-75">
              <CustomButton
                color="transparent"
                icon="trash-can"
                iconSize={20}
                label="Delete List"
                onPress={() => deleteList(currentList)}
              />
            </View>
          </View>
        )}
        <View className="mb-10 h-full">
          {ngcState.results.length === 0 && searchValue.length > 0 && (
            <Text className="mt-4 text-center text-lg font-medium text-neutral-700">
              {`No results for '${searchValue}'`}
            </Text>
          )}
          {ngcState.results.length === 0 && searchValue.length === 0 && (
            <View className="mt-10 flex flex-1 items-center opacity-10">
              <Icon name="selection-search" size={140} color="gray" />
            </View>
          )}
          {ngcState.results.map((ngc) => {
            return (
              <View key={ngc.id}>
                <Pressable
                  className={`my-1 flex rounded-lg px-3 pt-3 ${
                    ngcState.selectedObject?.id === ngc.id ? 'bg-black' : ''
                  }`}
                  onPress={() => ngcState.set({ selectedObject: ngc })}
                >
                  <View className="flex flex-row justify-between">
                    <View className="flex flex-row">
                      <View className="mr-3 h-24 w-1 rounded-lg bg-neutral-900" />
                      <View className="flex">
                        <Text className="text-xl font-semibold text-white">
                          {ngc.id}
                        </Text>
                        <Text className="text-sm font-medium text-neutral-300">
                          {ngc.names.split(',')[0] || getNGCTypeText(ngc.type)}
                        </Text>
                        <Text className="mt-3 text-sm text-neutral-500">
                          RA: {ngc.ra}
                        </Text>
                        <Text className="text-sm text-neutral-500">
                          Dec: {ngc.dec}
                        </Text>
                      </View>
                    </View>
                    <View className="mr-6">
                      <LineChart
                        curved
                        width={420}
                        height={90}
                        adjustToWidth
                        maxValue={90}
                        hideYAxisText
                        xAxisLabelTexts={[
                          '12',
                          '13',
                          '14',
                          '15',
                          '16',
                          '17',
                          '18',
                          '19',
                          '20',
                          '21',
                          '22',
                          '23',
                          '00',
                          '01',
                          '02',
                          '03',
                          '04',
                          '05',
                          '06',
                          '07',
                          '08',
                          '09',
                          '10',
                          '11',
                        ]}
                        xAxisLabelTextStyle={{
                          color: '#aaa',
                          fontSize: 8,
                        }}
                        hideAxesAndRules
                        showVerticalLines
                        noOfVerticalLines={1}
                        verticalLinesSpacing={0}
                        verticalLinesThickness={1}
                        verticalLinesShift={hourDate * 17}
                        verticalLinesStrokeDashArray={[6]}
                        verticalLinesColor="#88ad75"
                        yAxisThickness={0}
                        showReferenceLine1
                        stepValue={1}
                        referenceLine1Position={-65}
                        referenceLine1Config={{
                          thickness: 1,
                          width: 420,
                          dashWidth: 5,
                          dashGap: 0,
                          color: 'gray',
                          labelText: '30°',
                          labelTextStyle: {
                            color: '#aaa',
                            fontSize: 8,
                            marginTop: -12,
                          },
                        }}
                        xAxisColor="white"
                        yAxisColor="white"
                        dataPointsRadius1={0}
                        mostNegativeValue={0}
                        color1="#e77"
                        dataPointsColor1="white"
                        data={getAltitudePoints(
                          ngc,
                          configState.draftConfig.astrometry.longitude,
                          configState.draftConfig.astrometry.latitude,
                        ).map((i) => ({ value: i }))}
                      />
                    </View>
                  </View>
                  <View />
                </Pressable>
                <View className="h-[0.5px] w-full bg-neutral-900" />
              </View>
            );
          })}
        </View>
        <View className="h-8" />
      </ScrollView>
      {ngcState.selectedObject && (
        <View className="absolute bottom-2 flex w-full flex-row justify-end bg-black opacity-90">
          {!isFavorite && (
            <CircleButton
              disabled={false}
              onPress={() => setShowFavoritesModal(true)}
              color="transparent"
              icon="star-plus"
              label="Add to Favorites"
            />
          )}

          {isFavorite && (
            <CircleButton
              disabled={false}
              onPress={() => removeFromFavorites()}
              color="transparent"
              icon="star-remove"
              label="Remove from Favorites"
            />
          )}
          <CircleButton
            disabled={!mountState.isConnected || mountState.isSlewing}
            onPress={() => onGoto(false)}
            color="transparent"
            icon="target"
            label="Slew"
          />
          <CircleButton
            disabled={!mountState.isConnected || mountState.isSlewing}
            onPress={() => onGoto(true)}
            color="transparent"
            icon="target-variant"
            label="Slew & Center"
          />
          <CircleButton
            disabled={!sequenceState.sequence.length}
            onPress={() => onAddToSequence()}
            color="transparent"
            icon="star-plus-outline"
            label="Set as target"
          />
        </View>
      )}
    </>
  );
};
