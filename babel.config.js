module.exports = (api) => {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        { jsxImportSource: 'nativewind', unstable_transformImportMeta: true },
      ],
      'nativewind/babel',
    ],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            // This needs to be mirrored in tsconfig.json
            '@': './src',
          },
        },
      ],
      /* Worklets plugin replaces react-native-reanimated/plugin in Reanimated 4 and must stay last. */
      'react-native-worklets/plugin',
    ],
  };
};
