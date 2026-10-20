module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimated's plugin must stay last.
      'react-native-reanimated/plugin',
    ],
  };
};
