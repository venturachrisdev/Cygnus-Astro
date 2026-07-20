import Axios from 'axios';

import { useProfileStore } from '@/stores/profile.store';

import { getApiUrl } from './hosts';

export const getProfiles = async () => {
  const profileState = useProfileStore.getState();
  profileState.set({ isLoading: true });

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/profile/show`, {
        params: { active: false },
      })
    ).data;

    const profiles = response.Response.map((profile: any) => ({
      id: profile.Id,
      name: profile.Name,
    }));

    profileState.set({ profiles });

    return response.Response;
  } catch (e) {
    console.log('Error getting profiles', e);
    return undefined;
  } finally {
    profileState.set({ isLoading: false });
  }
};

export const showProfile = async () => {
  const profileState = useProfileStore.getState();
  profileState.set({ isLoading: true });

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/profile/show`, {
        params: { active: true },
      })
    ).data;

    profileState.set({
      activeProfile: {
        id: response.Response.Id,
        name: response.Response.Name,
      },
      description: response.Response.Description ?? '',
      lastUsed: response.Response.LastUsed ?? '',
    });

    return response.Response;
  } catch (e) {
    console.log('Error getting active profile', e);
    return undefined;
  } finally {
    profileState.set({ isLoading: false });
  }
};

export const switchProfile = async (id: string) => {
  const profileState = useProfileStore.getState();
  profileState.set({ isLoading: true });

  try {
    await Axios.get(`${await getApiUrl()}/profile/switch`, {
      params: { profileid: id },
    });

    await getProfiles();
    await showProfile();
  } catch (e) {
    console.log('Error switching profile', e);
  } finally {
    profileState.set({ isLoading: false });
  }
};

/*
  settingpath uses a dash separated path into the active profile,
  e.g. 'CameraSettings-PixelSize' as parsed by the plugin's ProfileChangeValue.
*/
export const changeProfileValue = async (path: string, value: string) => {
  const profileState = useProfileStore.getState();
  profileState.set({ isLoading: true });

  try {
    await Axios.get(`${await getApiUrl()}/profile/change-value`, {
      params: { settingpath: path, newValue: value },
    });

    await showProfile();
  } catch (e) {
    console.log('Error changing profile value', e);
  } finally {
    profileState.set({ isLoading: false });
  }
};

export const getHorizon = async () => {
  const profileState = useProfileStore.getState();

  try {
    const response = (await Axios.get(`${await getApiUrl()}/profile/horizon`))
      .data;

    profileState.set({
      horizon: {
        altitudes: response.Response.Altitudes ?? [],
        azimuths: response.Response.Azimuths ?? [],
      },
    });

    return response.Response;
  } catch (e) {
    console.log('Error getting horizon', e);
    return undefined;
  }
};
