module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'babel-plugin-dotenv',
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/components/screens',
            '@services': './src/services',
            '@context': './src/context',
            '@models': './src/components/types',
            '@constants': './constants'
          }
        }
      ]
    ]
  };
};
