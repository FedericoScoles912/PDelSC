import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { User } from '../types';

/**
 * Lista tipada de parámetros para cada ruta en la pila de navegación
 */
export type RootStackParamList = {
  Login: undefined;
  Welcome: {
    user: User;
  };
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
export type WelcomeRouteProp = RouteProp<RootStackParamList, 'Welcome'>;
