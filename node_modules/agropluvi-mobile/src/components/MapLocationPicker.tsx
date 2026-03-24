import React, { useEffect, useState } from 'react';
import { BackHandler, StyleSheet, Text, View, Pressable } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { MapRegion } from '../types/mapsRegion';

const DEFAULT_REGION: MapRegion = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export interface MapLocationPickerProps {
  /** Região inicial do mapa (centro/zoom). */
  initialRegion?: MapRegion | null;
  /** Ponto já selecionado (ex.: edição). */
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  /** Título exibido no topo. */
  title?: string;
  /** Chamado ao confirmar a localização. */
  onSelect: (latitude: number, longitude: number) => void;
  /** Chamado ao cancelar. */
  onCancel: () => void;
}

/**
 * Componente reutilizável para seleção geoespacial no mapa.
 * O usuário toca no mapa para definir um ponto; "Confirmar" persiste lat/lng.
 */
export function MapLocationPicker({
  initialRegion,
  initialLatitude,
  initialLongitude,
  title = 'Toque no mapa para definir a localização',
  onSelect,
  onCancel,
}: MapLocationPickerProps) {
  const [region, setRegion] = useState<MapRegion>(() => {
    if (initialLatitude != null && initialLongitude != null && Number.isFinite(initialLatitude) && Number.isFinite(initialLongitude)) {
      return {
        latitude: initialLatitude,
        longitude: initialLongitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
    }
    return initialRegion ?? DEFAULT_REGION;
  });

  const [selectedLat, setSelectedLat] = useState<number | null>(
    initialLatitude != null && Number.isFinite(Number(initialLatitude)) ? Number(initialLatitude) : null
  );
  const [selectedLng, setSelectedLng] = useState<number | null>(
    initialLongitude != null && Number.isFinite(Number(initialLongitude)) ? Number(initialLongitude) : null
  );

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onCancel();
      return true;
    });
    return () => subscription.remove();
  }, [onCancel]);

  const handleMapPress = (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLat(latitude);
    setSelectedLng(longitude);
  };

  const handleConfirm = () => {
    if (selectedLat != null && selectedLng != null && Number.isFinite(selectedLat) && Number.isFinite(selectedLng)) {
      onSelect(selectedLat, selectedLng);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onCancel} style={styles.headerButton}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Pressable
          onPress={handleConfirm}
          style={[styles.headerButton, styles.confirmButton, (selectedLat == null || selectedLng == null) && styles.confirmButtonDisabled]}
          disabled={selectedLat == null || selectedLng == null}
        >
          <Text style={styles.confirmButtonText}>Confirmar</Text>
        </Pressable>
      </View>

      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        onPress={handleMapPress}
      >
        {selectedLat != null && selectedLng != null && (
          <Marker
            coordinate={{ latitude: selectedLat, longitude: selectedLng }}
            title="Local selecionado"
          />
        )}
      </MapView>

      {selectedLat != null && selectedLng != null && (
        <View style={styles.footer}>
          <Text style={styles.coordsText}>
            {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerButton: { paddingVertical: 8, paddingHorizontal: 12, minWidth: 88 },
  cancelButtonText: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButton: {
    alignItems: 'flex-end',
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: '#34d399',
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  coordsText: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
});
