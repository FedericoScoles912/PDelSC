import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent llama a AppRegistry.registerComponent('main', () => App)
// y garantiza que el entorno esté configurado tanto en Expo Go como en compilaciones nativas (.apk)
registerRootComponent(App);
