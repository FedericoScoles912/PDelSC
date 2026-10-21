export type RootTabParamList = {
  Dashboard: undefined;
  Camera: undefined;
  Scanner: undefined;
  Location: undefined;
  Motion: undefined;
  Biometric: undefined;
  Extras: undefined;
  Settings: undefined;
};

export type ScreenName = keyof RootTabParamList;
