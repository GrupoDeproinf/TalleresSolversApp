import './src/utils/silenciarConsola';
import crashlytics from "@react-native-firebase/crashlytics";
import "./src/utils/storageGuard";
/**
 * @format
 */
import 'react-native-reanimated';

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import i18n from './src/assets/language';
AppRegistry.registerComponent(appName, () => App);

crashlytics().log("App iniciada");
