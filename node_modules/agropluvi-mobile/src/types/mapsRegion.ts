/**
 * Mesma forma que `Region` do react-native-maps (LatLng + deltas).
 * Definido aqui para não importar tipo do pacote — evita resolução errada no Hermes.
 */
export type MapRegion = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};
