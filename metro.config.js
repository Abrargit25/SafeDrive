const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const jetpackComposeStub = path.resolve(__dirname, 'stubs/expo-ui-jetpack-compose.js');
const modifiersStub = path.resolve(__dirname, 'stubs/expo-ui-jetpack-compose-modifiers.js');

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@expo/ui/jetpack-compose') {
    return { filePath: jetpackComposeStub, type: 'sourceFile' };
  }
  if (moduleName === '@expo/ui/jetpack-compose/modifiers') {
    return { filePath: modifiersStub, type: 'sourceFile' };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
