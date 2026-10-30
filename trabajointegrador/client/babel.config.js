/**
 * @file Configuración de Babel para Expo + NativeWind v4.
 * @module client/babel.config
 */

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel'
    ]
  };
};
