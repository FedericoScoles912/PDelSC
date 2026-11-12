/**
 * @file Configuración de Metro con soporte de NativeWind.
 * @module client/metro.config
 */

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Priorizar .tsx para renderización y recarga en vivo (Fast Refresh / HMR)
const sourceExts = config.resolver.sourceExts || [];
config.resolver.sourceExts = [
  'tsx',
  'ts',
  ...sourceExts.filter((ext) => ext !== 'tsx' && ext !== 'ts')
];

module.exports = withNativeWind(config, { input: './global.css' });
