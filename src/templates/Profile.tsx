import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import type { Device } from '@/actions/constants';
import {
  changeProfileValue,
  getHorizon,
  getProfiles,
  showProfile,
  switchProfile,
} from '@/actions/profile';
import { CustomButton } from '@/components/CustomButton';
import { DropDown } from '@/components/DropDown';
import { StatusChip } from '@/components/StatusChip';
import { useConfigStore } from '@/stores/config.store';
import { useProfileStore } from '@/stores/profile.store';

export const Profile = () => {
  const profileState = useProfileStore();
  const configState = useConfigStore();

  const [showProfilesList, setShowProfilesList] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<Device | null>(null);
  const [settingPath, setSettingPath] = useState('');
  const [settingValue, setSettingValue] = useState('');

  useEffect(() => {
    if (useConfigStore.getState().isConnected) {
      getProfiles();
      showProfile();
      getHorizon();
    }
  }, []);

  const confirmSwitch = () => {
    if (pendingProfile) {
      switchProfile(pendingProfile.id);
    }
    setPendingProfile(null);
  };

  const { isConnected } = configState;
  const canEdit =
    isConnected && settingPath.length > 0 && settingValue.length > 0;

  return (
    <ScrollView
      bounces={false}
      className="flex h-full flex-1 bg-neutral-950 p-4"
    >
      <Text className="mb-4 text-lg font-semibold text-white">Profiles</Text>

      <View className="mb-4 flex flex-row items-center justify-between">
        <StatusChip
          isConnected={isConnected}
          bubble
          label={profileState.activeProfile?.name ?? 'No active profile'}
          isActive={!!profileState.activeProfile}
        />
        {profileState.horizon.altitudes.length > 0 && (
          <StatusChip
            isConnected={isConnected}
            bubble
            last
            label={`Horizon points: ${profileState.horizon.altitudes.length}`}
            isActive
          />
        )}
      </View>

      {!!profileState.description && (
        <Text className="mb-3 text-sm text-gray-400">
          {profileState.description}
        </Text>
      )}

      <DropDown
        onListExpand={() => setShowProfilesList(!showProfilesList)}
        currentItem={profileState.activeProfile}
        items={profileState.profiles}
        isListExpanded={showProfilesList}
        onItemSelected={(profile) => {
          setShowProfilesList(false);
          setPendingProfile(profile);
        }}
        defaultText="Select Profile"
      />

      <Text className="mb-2 mt-8 font-medium text-white">Edit Setting</Text>
      <Text className="mb-3 text-xs text-gray-500">
        Dash separated path, e.g. CameraSettings-PixelSize
      </Text>
      <View className="flex flex-row items-center justify-between gap-x-4">
        <View className="flex flex-1 items-center justify-center rounded-lg bg-black p-3">
          <TextInput
            className="flex w-full py-1 text-white"
            placeholder="Setting path"
            placeholderTextColor="#6b7280"
            value={settingPath}
            onChangeText={setSettingPath}
          />
        </View>
        <View className="flex flex-1 items-center justify-center rounded-lg bg-black p-3">
          <TextInput
            className="flex w-full py-1 text-white"
            placeholder="New value"
            placeholderTextColor="#6b7280"
            value={settingValue}
            onChangeText={setSettingValue}
          />
        </View>
        <View className="w-40">
          <CustomButton
            disabled={!canEdit}
            onPress={() => changeProfileValue(settingPath, settingValue)}
            label="Set Value"
          />
        </View>
      </View>

      <View className="h-32" />

      <Modal
        supportedOrientations={['landscape']}
        visible={pendingProfile !== null}
        transparent
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={() => setPendingProfile(null)}>
          <View className="flex h-full w-full items-center justify-center bg-black/70">
            <TouchableWithoutFeedback>
              <View className="w-[60%] rounded-lg bg-neutral-900 p-6">
                <Text className="mb-2 text-lg font-semibold text-white">
                  Switch profile?
                </Text>
                <Text className="mb-6 text-sm text-gray-400">
                  Switching to {pendingProfile?.name} changes the entire rig
                  configuration and reconnects equipment. Continue?
                </Text>
                <View className="flex flex-row items-center justify-between gap-x-4">
                  <View className="flex-1">
                    <CustomButton
                      onPress={() => setPendingProfile(null)}
                      label="Cancel"
                      color="neutral"
                    />
                  </View>
                  <View className="flex-1">
                    <CustomButton
                      onPress={confirmSwitch}
                      label="Switch"
                      color="green"
                    />
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
};
