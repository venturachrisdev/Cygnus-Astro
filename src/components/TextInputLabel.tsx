import { Text, TextInput, View } from 'react-native';

interface TextInputLabelProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  autoCorrect?: boolean;
  disabled?: boolean;
}

export const TextInputLabel = ({
  placeholder,
  value,
  onChange,
  label,
  autoCorrect = false,
  disabled = false,
}: TextInputLabelProps) => (
  <View className="flex flex-1">
    {label && <Text className="my-3 ml-3 font-medium text-white">{label}</Text>}
    <TextInput
      autoCorrect={autoCorrect}
      onChangeText={onChange}
      className="w-full rounded-lg bg-black p-4 text-gray-200"
      value={value}
      readOnly={disabled}
      placeholder={placeholder}
    />
  </View>
);
