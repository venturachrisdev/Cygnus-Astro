import { View, Text, Image, ActivityIndicator, ScrollView, Switch } from 'react-native';
import Axios from 'axios';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { useState } from 'react';

const API_URL = "http://10.0.0.250:1888/v2/api";
const API_CAMERA_CAPTURE = "equipment/camera/capture";
const API_FILTERWHEEL_CHANGE = "/equipment/filterwheel/change-filter";
const filters = ["L", "R", "G", "B", "S", "H", "O"];

const Welcome = () => {

  const [capturedImage, setCapturedImage] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [showDurationView, setShowDurationView] = useState(false);
  const [showFilterView, setShowFilterView] = useState(false);
  const [loop, setLoop] = useState(false);

  const durations = [
    1,
    2,
    3,
    4,
    5,
    10,
    15,
    20,
    25,
    30,
    45,
    60,
    120,
    180,
    240,
    300,
    600,
    900,
  ];

  const sleep = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const [currentFilter, setCurrentFilter] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(1);

  const runCountdown = async (duration: number) => {
    for (let i = duration; i >= 0; i -= 1) {
      setCountdown(i);
      await sleep(1000);
    }
    setLoading(true);
  }

  const changeFilter = async (filter: number) => {
    try {
      console.log('Changing filter', filter);
      await Axios.get(`${API_URL}/${API_FILTERWHEEL_CHANGE}?filterId=${filter}`);
      setCurrentFilter(filter);
    } catch (e) {
      console.log('Error changing filter', e);
    }
  }

  const getCapturedImage = async () => {
    try {
      const response = (await (Axios.get(`${API_URL}/${API_CAMERA_CAPTURE}?getResult=true&quality=90&autoPrepare=true`))).data;
      console.log("Image was captured", response.Response.Image.length);
      return response.Response.Image;
    } catch (e) {
      console.log('Error getting image from camera', e);
    }
  }

  const captureImage = async () => {
    if (isCapturing) {
      console.log("Capture in progress");
      return;
    }

    console.log('Capturing...');
    setIsCapturing(true);

    try {
      await Axios.get(`${API_URL}/${API_CAMERA_CAPTURE}?duration=${currentDuration}&gain=0&solve=false`);
      
      if (currentDuration >= 1) {
        await runCountdown(currentDuration);
      }

      // Allow for processing
      sleep(currentDuration > 1 ? 500 : 0);
      const image = await getCapturedImage();
      setIsCapturing(false);
      setCountdown(0);
      setCapturedImage(image);
      setLoading(false);

    } catch (e) {
      console.log('Error capturing image', e);
    }
  }

  const currentFilterText = filters[currentFilter];

  return (
    <View className="flex flex-row justify-end h-full">
      <View className="bg-gray-900 h-full w-16"></View>
      <View className="bg-black h-full flex flex-1 justify-center items-center text-center">
        {capturedImage && (
          <Image resizeMode="center" className="h-full w-full" source={{ uri: `data:image/jpeg;base64,${capturedImage}` }}></Image>
        )}
        {!capturedImage && !isLoading && (
          <Text className='text-gray-800 font-bold text-3xl'>Cygnus</Text>
        )}
        {
          isLoading && (
            <ActivityIndicator size="large" className="absolute" />
          )
        }
      </View>

      {showDurationView && (
        <ScrollView contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }} className="absolute right-24 flex h-full w-24 py-6 mr-[0.5px] bg-opacity-50 bg-gray-900 bg-opacity-50 flex-column">
          { durations.map((duration) => (
            <TouchableHighlight className="mb-4 p-2" key={duration} onPress={() => { setCurrentDuration(duration) ; setShowDurationView(false) }}>
              <Text className={`${(duration === currentDuration) ? "text-yellow-500" : "text-white" } font-bold`}>{duration}s</Text>
            </TouchableHighlight>
          ))}
        </ScrollView>
      )}

      {showFilterView && (
        <ScrollView contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }} className="absolute right-24 flex h-full w-24 py-6 mr-[0.5px] bg-gray-900 bg-opacity-50 flex-column">
          { filters.map((filter, i) => (
            <TouchableHighlight className="mb-4 p-2" key={filter} onPress={() => { changeFilter(i); setShowFilterView(false) }}>
              <Text className={`${(i == currentFilter) ? "text-yellow-500" : "text-white" } font-bold`}>{filter}</Text>
            </TouchableHighlight>
          ))}
        </ScrollView>
      )}

      <View className="bg-gray-900 h-full w-24 flex flex-column items-center">
        <TouchableHighlight className="my-6 p-4 rounded-full" onPress={() => setShowDurationView(!showDurationView)}>
          <Text className="text-gray-300 font-bold">{currentDuration}s</Text>
        </TouchableHighlight>

        <TouchableHighlight className="p-4 mb-8 rounded-full" onPress={() => setShowFilterView(!showFilterView)}>
          <Text className="text-gray-300 font-bold">{currentFilterText}</Text>
        </TouchableHighlight>

        <TouchableHighlight disabled={isCapturing} onPress={() => captureImage()} className={`${isCapturing ? 'border-gray-400' : 'border-white'} rounded-full border-2 p-1 mb-8`}>
          <View className={`${isCapturing ? 'bg-gray-400' : 'bg-white'} w-12 h-12 rounded-full flex justify-center items-center`}>
            {countdown > 0 && (
              <Text className="text-gray-900 text-sm font-bold">{countdown}</Text>
            )}
          </View>
        </TouchableHighlight>

        <View className="mt-6">
          <Text className="text-xs text-center font-bold text-white mb-3">Loop</Text>
          <Switch value={loop} onChange={() => { setLoop(!loop) } }></Switch>
        </View>
      </View>
    </View>
  );
};

export { Welcome };
