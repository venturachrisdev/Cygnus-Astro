import { View, Text, Switch } from 'react-native';

interface LabelSwitchProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const LabelSwitch = ({ label, value, onChange }: LabelSwitchProps) => (
  <View className="mt-6">
    <Text className="text-xs text-center font-semibold text-white mb-3">{label}</Text>
    <Switch value={value} onChange={() => { onChange(!value) } }></Switch>
  </View>
);
