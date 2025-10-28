const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

async function getConfig() {
  const defaultConfig = await getDefaultConfig(__dirname);

  const customConfig = {
    resolver: {
      assetExts: [...defaultConfig.resolver.assetExts, "cjs"],
    },
  };

  return mergeConfig(defaultConfig, customConfig);
}

module.exports = getConfig();
