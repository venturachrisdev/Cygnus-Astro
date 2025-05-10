import { Switch, Text, View } from 'react-native';

interface LabelSwitchProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const LabelSwitch = ({
  label,
  value,
  onChange,
  disabled,
}: LabelSwitchProps) => (
  <View className="mt-6 flex items-center justify-center">
    <Text
      className={`mb-3 text-center text-xs font-semibold ${
        disabled ? 'text-gray-600' : 'text-white'
      }`}
    >
      {label}
    </Text>
    <Switch
      value={value}
      disabled={disabled}
      onChange={() => {
        onChange(!value);
      }}
    />
  </View>
);
