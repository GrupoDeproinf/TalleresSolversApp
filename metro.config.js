const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = require(
  path.join(
    path.dirname(require.resolve('metro-config/package.json')),
    'src/defaults/exclusionList',
  ),
);

async function getConfig() {
  const defaultConfig = await getDefaultConfig(__dirname);

  const customConfig = {
    resolver: {
      assetExts: [...defaultConfig.resolver.assetExts, 'cjs'],
      // Evita que Metro vigile salidas de Gradle/Xcode bajo node_modules (ENOENT al borrarse).
      blockList: exclusionList([
        /.*[/\\]android[/\\]build[/\\].*/,
        /.*[/\\]ios[/\\]build[/\\].*/,
      ]),
    },
  };

  return mergeConfig(defaultConfig, customConfig);
}

module.exports = getConfig();
