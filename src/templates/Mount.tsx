import { Text, View, Pressable, ScrollView } from 'react-native';
import { Layout } from "./Layout";
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { StatusChip } from '@/components/StatusChip';
import { MountDevice, useMountStore } from '@/stores/mount.store';
import { useEffect, useState } from 'react';
import { connectMount, disconnectMount, getMountInfo, homeMount, listMountDevices, parkMount, rescanMountDevices, unParkMount } from '@/actions/mount';

export const Mount = () => {

  const mountState = useMountStore();
  const [showDevicesList, setShowDevicesList] = useState(false);

  const setMountDevice = (device: MountDevice) => {
    setShowDevicesList(false);
    mountState.setCurrentDevice(device);
  }

  const connectToMount = () => {
    connectMount(mountState.currentDevice?.id || useMountStore.getState().currentDevice?.id || '');
  }

  useEffect(() => {
    getMountInfo();
    listMountDevices();
  }, []);

  return (
    <Layout>
      <ScrollView bounces={false} className="bg-neutral-950 h-full flex flex-1 p-4">
        <View className="w-full flex flex-row gap-x-3 justify-center items-center">
          <View className="p-3 flex-1 bg-black rounded-lg justify-center">
            <Pressable onPress={() => setShowDevicesList(!showDevicesList)}>
              <Text className="text-white font-medium text-md">{mountState.currentDevice?.name}</Text>
            </Pressable>
            { showDevicesList && mountState.devices.length && (
              <ScrollView className="h-64 absolute bg-black rounded-lg p-6 top-8 z-20 w-full">
              { mountState.devices.map(device => (
                <Pressable key={device.id} onPress={() => setMountDevice(device) }>
                  <Text className={`${device.id === mountState.currentDevice?.id ? "font-bold" : "font-medium"} text-white text-md my-4`}>{device.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
            )}
          </View>

          <Pressable className="bg-black p-2 rounded-xl" onPress={() => rescanMountDevices()}>
            <Icon name="refresh" size={28} color="white"></Icon>
          </Pressable>

          { mountState.isConnected && (
            <Pressable onPress={() => disconnectMount() } className={`bg-red-700 p-2 rounded-xl`}>
              <Icon name="connection" size={24} color="white"></Icon>
            </Pressable>
          )}
          { !mountState.isConnected && (
            <Pressable onPress={() => connectToMount() } className={`bg-green-700 p-2 rounded-xl`}>
              <Icon name="connection" size={24} color="white"></Icon>
            </Pressable>
          )}
        </View>

        <View className="flex w-full flex-row items-center justify-end my-3">
          <View className="m-2 flex flex-row justify-between items-center">
            <StatusChip label="Parked" isActive={mountState.isParked} />
            <StatusChip label="Home" isActive={mountState.isHome} />
            <StatusChip label="Tracking" isActive={mountState.isTracking} />
            <StatusChip last label="Slewing" isActive={mountState.isSlewing} />
          </View>
        </View>

        <View className="m-2 flex flex-row justify-between items-center gap-x-10">
          <Pressable onPress={() => homeMount()} className="flex flex-1 p-3 bg-black rounded-lg items-center">
              <Text className="text-white font-medium text-lg">Home</Text>
          </Pressable>

          { mountState.isParked && (
            <Pressable onPress={() => unParkMount()} className="flex flex-1 p-3 bg-black rounded-lg items-center">
              <Text className="text-white font-medium text-lg">Unpark</Text>
          </Pressable>
          )}

          { !mountState.isParked && (
              <Pressable onPress={() => parkMount()} className="flex flex-1 p-3 bg-black rounded-lg items-center">
                <Text className="text-white font-medium text-lg">Park</Text>
              </Pressable>
            )}

          <Pressable className="flex flex-1 p-3 bg-black rounded-lg items-center">
              <Text className="text-white font-medium text-lg">Set as Park</Text>
          </Pressable>
        </View>


        <View className="w-full flex flex-row gap-x-4 justify-between items-center mt-6">
          <View className="justify-center items-center flex-1">
            <View className="p-3 bg-black rounded-lg justify-center w-full">
              <Text className="text-white font-medium text-md">2x</Text>
            </View>
          </View>

          <View className="flex-1 flex-row gap-x-3 justify-center items-center w-full">
            <View className="p-3 bg-black rounded-lg justify-center flex-1">
              <Text className="text-white font-medium text-md">Sidereal</Text>
            </View>

            { mountState.isTracking && (
              <Pressable className="bg-red-700 p-2 rounded-xl">
                <Icon name="stop-circle" size={24} color="white"></Icon>
              </Pressable>
            )}
            { !mountState.isTracking && (
              <Pressable className="bg-green-700 p-2 rounded-xl">
                <Icon name="play-circle" size={24} color="white"></Icon>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </Layout>
  )
};
