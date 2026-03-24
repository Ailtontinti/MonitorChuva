import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { LoginScreen } from './src/screens/LoginScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { RainGaugesScreen } from './src/screens/RainGaugesScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { TalhoesScreen } from './src/screens/TalhoesScreen';

import { login, register } from './src/services/auth';
import { createProperty, listProperties, Property } from './src/services/properties';
import {
  createRainGauge,
  listRainGauges,
  RainGauge as RainGaugeType,
} from './src/services/rainGauges';
import {
  createRainfallRecord,
  deleteRainfallRecord,
  listRainfallRecords,
  updateRainfallRecord,
  RainfallRecord as RainfallRecordType,
} from './src/services/rainfallRecords';
import { MapLocationPicker } from './src/components/MapLocationPicker';
import {
  getRainGaugesForMap,
  getRainSummary,
  RainGaugeMapItem,
  RainSummaryPoint,
} from './src/services/dashboard';
import { clearSession, getToken, getUser, saveSession } from './src/services/storage';
import { getCurrentWeather, WeatherCurrent } from './src/services/weather';
import { createUser, listUsers, updateUser, UserItem } from './src/services/users';
import { WeatherForecastCard } from './src/components/WeatherForecastCard';
import { RainRecordsScreen } from './src/screens/RainRecordsScreen';
import type { MapRegion } from './src/types/mapsRegion';
import { agronomy as A } from './src/theme/agronomy';

function formatDateTimePtBrInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

function parseDateTimePtBrInputToIso(text: string): string | null {
  const m = text.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  if (
    !Number.isFinite(day) ||
    !Number.isFinite(month) ||
    !Number.isFinite(year) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }
  const d = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day ||
    d.getHours() !== hour ||
    d.getMinutes() !== minute
  ) {
    return null;
  }
  return d.toISOString();
}

function distanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

type GeoPoint = { lat: number; lng: number };

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function toGeoPointArray(value: unknown): GeoPoint[] | null {
  if (!Array.isArray(value)) return null;
  const points: GeoPoint[] = [];
  for (const item of value) {
    if (Array.isArray(item) && item.length >= 2 && isFiniteNumber(item[0]) && isFiniteNumber(item[1])) {
      // GeoJSON order: [lng, lat]
      points.push({ lat: item[1], lng: item[0] });
      continue;
    }
    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      if (isFiniteNumber(obj.lat) && isFiniteNumber(obj.lng)) {
        points.push({ lat: obj.lat, lng: obj.lng });
        continue;
      }
      if (isFiniteNumber(obj.latitude) && isFiniteNumber(obj.longitude)) {
        points.push({ lat: obj.latitude, lng: obj.longitude });
        continue;
      }
    }
    return null;
  }
  return points.length >= 3 ? points : null;
}

function extractPropertyPolygon(metadata: Record<string, unknown> | null): GeoPoint[] | null {
  if (!metadata || typeof metadata !== 'object') return null;

  const polygonFromGeoJson = (value: unknown): GeoPoint[] | null => {
    if (!value || typeof value !== 'object') return null;
    const geo = value as Record<string, unknown>;
    if (geo.type === 'Polygon' && Array.isArray(geo.coordinates) && geo.coordinates.length > 0) {
      return toGeoPointArray(geo.coordinates[0]);
    }
    return null;
  };

  const directCandidates: unknown[] = [
    metadata.boundaryPolygon,
    metadata.boundary,
    metadata.polygon,
    metadata.coordinates,
  ];

  for (const candidate of directCandidates) {
    const direct = toGeoPointArray(candidate);
    if (direct) return direct;
    const fromGeo = polygonFromGeoJson(candidate);
    if (fromGeo) return fromGeo;
  }

  const geoJson = metadata.geoJson;
  const fromGeoJson = polygonFromGeoJson(geoJson);
  if (fromGeoJson) return fromGeoJson;

  return null;
}

function isPointInsidePolygon(point: GeoPoint, polygon: GeoPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      (yi > point.lat) !== (yj > point.lat) &&
      point.lng < ((xj - xi) * (point.lat - yi)) / ((yj - yi) || Number.EPSILON) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

export default function App() {
  const [tela, setTela] = useState<
    | 'login'
    | 'register'
    | 'dashboard'
    | 'talhoes'
    | 'rainMap'
    | 'rainGauges'
    | 'rainRecords'
    | 'visualizarDados'
    | 'inserirDados'
    | 'registrarChuva'
    | 'cadastrarPluviometro'
    | 'cadastrarTalhao'
    | 'detalhesChuvas'
    | 'gerenciarPessoas'
  >('login');
  const [organizationId, setOrganizationId] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<
  { name: string; email: string; role?: 'owner' | 'admin' | 'user' } | null
>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [mapRegion, setMapRegion] = useState<MapRegion | undefined>(undefined);
  const [selectedProperty, setSelectedProperty] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [rainGauges, setRainGauges] = useState<RainGaugeType[]>([]);
  const [newGaugeName, setNewGaugeName] = useState('');
  const [selectedGauge, setSelectedGauge] = useState<RainGaugeType | null>(null);
  const [rainRecords, setRainRecords] = useState<RainfallRecordType[]>([]);
  const [rainRecordsLoaded, setRainRecordsLoaded] = useState(false);
  const [exportCsvAfterSelection, setExportCsvAfterSelection] = useState(false);
  const [rainAmount, setRainAmount] = useState('');
  const [rainDateIso, setRainDateIso] = useState(new Date().toISOString());
  const [rainDateInput, setRainDateInput] = useState(
    formatDateTimePtBrInput(new Date().toISOString()),
  );
  const [mapPickerMode, setMapPickerMode] = useState<'property' | 'gauge' | 'talhao' | null>(null);
  const [newPropertyLat, setNewPropertyLat] = useState<number | null>(null);
  const [newPropertyLng, setNewPropertyLng] = useState<number | null>(null);
  const [newTalhaoName, setNewTalhaoName] = useState('');
  const [selectedTalhaoPropertyId, setSelectedTalhaoPropertyId] = useState<string | null>(null);
  const [newTalhaoLat, setNewTalhaoLat] = useState<number | null>(null);
  const [newTalhaoLng, setNewTalhaoLng] = useState<number | null>(null);
  const [newGaugeLat, setNewGaugeLat] = useState<number | null>(null);
  const [newGaugeLng, setNewGaugeLng] = useState<number | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [rainSummary, setRainSummary] = useState<RainSummaryPoint[]>([]);
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);
  const [mapRainGauges, setMapRainGauges] = useState<RainGaugeMapItem[]>([]);
  const [rainRecordsFilterDays, setRainRecordsFilterDays] = useState<7 | 30 | null>(null);
  const [rainRecordsDateFilterIso, setRainRecordsDateFilterIso] = useState<string | null>(
    new Date().toISOString(),
  );
  const [rainRecordEditId, setRainRecordEditId] = useState<string | null>(null);
  const [rainRecordSuccess, setRainRecordSuccess] = useState<string>('');
  const [showGaugePicker, setShowGaugePicker] = useState(false);
  const [rainSummaryDays, setRainSummaryDays] = useState<7 | 30 | 90>(7);
  const [people, setPeople] = useState<UserItem[]>([]);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonEmail, setNewPersonEmail] = useState('');
  const [newPersonRole, setNewPersonRole] = useState<'admin' | 'user'>('user');
  const [newPersonPassword, setNewPersonPassword] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [token, storedUser] = await Promise.all([getToken(), getUser()]);
        if (cancelled) return;
        if (token && storedUser?.organizationId) {
          setUser({
            name: storedUser.name,
            email: storedUser.email,
            role: (storedUser as { role?: 'owner' | 'admin' | 'user' }).role,
          });
          setOrganizationId(storedUser.organizationId);
          setTela('dashboard');
        }
      } finally {
        if (!cancelled) setSessionLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  const handleRegister = async () => {
    setError('');
    const orgName = organizationName.trim();
    const nm = name.trim();
    const em = email.trim();
    const pw = password;
  
    if (!orgName || !nm || !em || !pw) {
      setError('Preencha todos os campos.');
      return;
    }
  
    setLoading(true);
    try {
      const result = await register({
        organizationName: orgName,
        name: nm,
        email: em,
        password: pw,
      });
  
      await saveSession(result.token, result.user, result.user.organizationId);
      setUser({
        name: result.user.name,
        email: result.user.email,
        role: result.user.role as 'owner' | 'admin' | 'user' | undefined,
      });
      setOrganizationId(result.user.organizationId);
      setTela('dashboard');
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof (err.response.data as { message?: string }).message === 'string'
          ? (err.response.data as { message: string }).message
          : 'Falha ao criar conta. Verifique a rede.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setError('');
    const em = email.trim();
    const pw = password;
  
    if (!em || !pw) {
      setError('Informe e-mail e senha.');
      return;
    }
  
    setLoading(true);
    try {
      const result = await login({ email: em, password: pw });
  
      await saveSession(result.token, result.user, result.user.organizationId);
      setUser({
        name: result.user.name,
        email: result.user.email,
        role: result.user.role as 'owner' | 'admin' | 'user' | undefined,
      });
      setOrganizationId(result.user.organizationId);
      setTela('dashboard');
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof (err.response.data as { message?: string }).message === 'string'
          ? (err.response.data as { message: string }).message
          : 'Falha ao entrar. Verifique a rede e os dados.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearSession();
    setUser(null);
    setOrganizationId('');
    setOrganizationName('');
    setName('');
    setEmail('');
    setPassword('');
    setProperties([]);
    setNewPropertyName('');
    setMapRegion(undefined);
    setSelectedProperty(null);
    setRainGauges([]);
    setNewGaugeName('');
    setSelectedGauge(null);
    setRainRecords([]);
    setRainAmount('');
    setRainDateIso(new Date().toISOString());
    setMapPickerMode(null);
    setNewPropertyLat(null);
    setNewPropertyLng(null);
    setNewGaugeLat(null);
    setNewGaugeLng(null);
    setTela('login');
  };

  useEffect(() => {
    const fetchProperties = async () => {
      if (
        !organizationId ||
        (tela !== 'dashboard' &&
          tela !== 'talhoes' &&
          tela !== 'registrarChuva' &&
          tela !== 'cadastrarPluviometro' &&
          tela !== 'cadastrarTalhao')
      )
        return;
      try {
        const data = await listProperties(organizationId);
        setProperties(data);
      } catch {
        // Mantém silencioso por enquanto; poderíamos exibir um erro na UI depois.
      }
    };

    fetchProperties();
  }, [organizationId, tela]);

  useEffect(() => {
    const fetchRainGauges = async () => {
      if (!organizationId || !selectedProperty || (tela !== 'rainGauges' && tela !== 'registrarChuva')) return;
      try {
        const data = await listRainGauges(organizationId, selectedProperty.id);
        setRainGauges(data);
      } catch {
        setRainGauges([]);
      }
    };

    fetchRainGauges();
  }, [organizationId, selectedProperty?.id, tela]);

  useEffect(() => {
    const fetchRainRecords = async () => {
      if (!organizationId || !selectedProperty || !selectedGauge || tela !== 'rainRecords') {
        setRainRecordsLoaded(false);
        return;
      }
      setRainRecordsLoaded(false);
      try {
        const now = new Date();
        let filters: { from?: string; to?: string } = {};
        if (rainRecordsDateFilterIso) {
          const d = new Date(rainRecordsDateFilterIso);
          const from = new Date(d);
          from.setHours(0, 0, 0, 0);
          const to = new Date(d);
          to.setHours(23, 59, 59, 999);
          filters = { from: from.toISOString(), to: to.toISOString() };
        } else if (rainRecordsFilterDays) {
          const from = new Date(now.getTime() - rainRecordsFilterDays * 24 * 60 * 60 * 1000);
          filters = {
            from: from.toISOString(),
            to: now.toISOString(),
          };
        }
        const data = await listRainfallRecords(
          organizationId,
          selectedProperty.id,
          selectedGauge.id,
          filters,
        );
        setRainRecords(data);
      } catch {
        setRainRecords([]);
      } finally {
        setRainRecordsLoaded(true);
      }
    };

    fetchRainRecords();
  }, [organizationId, selectedProperty?.id, selectedGauge?.id, tela, rainRecordsFilterDays, rainRecordsDateFilterIso]);

  useEffect(() => {
    if (!exportCsvAfterSelection) return;
    if (tela !== 'rainRecords' || !selectedProperty || !selectedGauge || !rainRecordsLoaded) return;

    handleExportRainRecords();
    setExportCsvAfterSelection(false);
  }, [
    exportCsvAfterSelection,
    tela,
    selectedProperty?.id,
    selectedGauge?.id,
    rainRecordsLoaded,
    rainRecords,
  ]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (
        !organizationId ||
        (tela !== 'dashboard' && tela !== 'visualizarDados' && tela !== 'detalhesChuvas')
      )
        return;
      try {
        const [summary, w] = await Promise.all([
          getRainSummary(organizationId, rainSummaryDays),
          getCurrentWeather(),
        ]);
        setRainSummary(summary);
        setWeather(w);
      } catch {
        setRainSummary([]);
        setWeather(null);
      }
    };
    fetchDashboard();
  }, [organizationId, tela, rainSummaryDays]);

  useEffect(() => {
    const fetchMapGauges = async () => {
      if (!organizationId || tela !== 'rainMap') return;
      try {
        const list = await getRainGaugesForMap(organizationId);
        setMapRainGauges(list);
      } catch {
        setMapRainGauges([]);
      }
    };
    fetchMapGauges();
  }, [organizationId, tela]);

  useEffect(() => {
    if (tela !== 'rainMap' || mapRegion) return;
    const firstProperty = properties.find(
      (p) =>
        p.latitude != null &&
        p.longitude != null &&
        Number.isFinite(Number(p.latitude)) &&
        Number.isFinite(Number(p.longitude))
    );
    const firstGauge = mapRainGauges.find(
      (g) => Number.isFinite(Number(g.latitude)) && Number.isFinite(Number(g.longitude))
    );
    if (firstProperty) {
      setMapRegion({
        latitude: Number(firstProperty.latitude),
        longitude: Number(firstProperty.longitude),
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    } else if (firstGauge) {
      setMapRegion({
        latitude: Number(firstGauge.latitude),
        longitude: Number(firstGauge.longitude),
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }
  }, [tela, mapRegion, properties, mapRainGauges]);

  useEffect(() => {
    if (tela !== 'registrarChuva' && tela !== 'cadastrarPluviometro') return;
    if (!selectedProperty && properties.length > 0) {
      const first = properties[0];
      setSelectedProperty({ id: first.id, name: first.name });
    }
  }, [tela, selectedProperty, properties]);

  useEffect(() => {
    const formatted = formatDateTimePtBrInput(rainDateIso);
    if (formatted) setRainDateInput(formatted);
  }, [rainDateIso]);

  useEffect(() => {
    if (tela !== 'gerenciarPessoas') return;
    (async () => {
      try {
        const users = await listUsers();
        setPeople(users);
      } catch (err: unknown) {
        const msg =
          err &&
          typeof err === 'object' &&
          'response' in err &&
          err.response &&
          typeof err.response === 'object' &&
          'data' in err.response &&
          err.response.data &&
          typeof (err.response.data as { message?: string }).message === 'string'
            ? (err.response.data as { message: string }).message
            : 'Não foi possível carregar os usuários.';
        setError(msg);
      }
    })();
  }, [tela]);

  const handleCreateProperty = async () => {
    const nameTrimmed = newPropertyName.trim();
    if (!nameTrimmed || !organizationId) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      const created = await createProperty(organizationId, {
        name: nameTrimmed,
        latitude: newPropertyLat ?? undefined,
        longitude: newPropertyLng ?? undefined,
      });
      setProperties((prev) => [created, ...prev]);
      setNewPropertyName('');
      setNewPropertyLat(null);
      setNewPropertyLng(null);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof (err.response.data as { message?: string }).message === 'string'
          ? (err.response.data as { message: string }).message
          : 'Falha ao criar talhão. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTalhao = async () => {
    const talhaoName = newTalhaoName.trim();
    if (!talhaoName) {
      setError('Informe o nome do talhão.');
      return;
    }
    if (!selectedTalhaoPropertyId) {
      setError('Selecione a propriedade do talhão.');
      return;
    }
    if (newTalhaoLat == null || newTalhaoLng == null) {
      setError('Defina a localização do talhão no mapa.');
      return;
    }
    if (!organizationId) {
      setError('Sessão inválida. Faça login novamente.');
      return;
    }
    const parentProperty = properties.find((p) => p.id === selectedTalhaoPropertyId) ?? null;
    if (!parentProperty) {
      setError('Propriedade selecionada não encontrada.');
      return;
    }
    const polygon = extractPropertyPolygon(parentProperty.metadata);
    if (polygon && polygon.length >= 3) {
      const inside = isPointInsidePolygon(
        { lat: Number(newTalhaoLat), lng: Number(newTalhaoLng) },
        polygon,
      );
      if (!inside) {
        setError('A localizacao do talhao deve ficar dentro dos limites da propriedade.');
        return;
      }
    } else if (
      parentProperty.latitude != null &&
      parentProperty.longitude != null &&
      Number.isFinite(Number(parentProperty.latitude)) &&
      Number.isFinite(Number(parentProperty.longitude))
    ) {
      const meters = distanceInMeters(
        Number(parentProperty.latitude),
        Number(parentProperty.longitude),
        Number(newTalhaoLat),
        Number(newTalhaoLng),
      );
      if (meters > 2000) {
        setError('A localização do talhão deve ficar dentro dos limites da propriedade (até 2 km do centro).');
        return;
      }
    }
    setLoading(true);
    setError('');
    try {
      const created = await createProperty(organizationId, {
        name: talhaoName,
        description: `Talhão vinculado à propriedade: ${parentProperty.name}`,
        latitude: newTalhaoLat,
        longitude: newTalhaoLng,
      });
      setProperties((prev) => [created, ...prev]);
      setNewTalhaoName('');
      setSelectedTalhaoPropertyId(null);
      setNewTalhaoLat(null);
      setNewTalhaoLng(null);
      setTela('talhoes');
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof (err.response.data as { message?: string }).message === 'string'
          ? (err.response.data as { message: string }).message
          : 'Falha ao criar talhão. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRainGauge = async () => {
    const nameTrimmed = newGaugeName.trim();
    if (!nameTrimmed) {
      setError('Informe o nome do pluviômetro.');
      return;
    }
    if (!organizationId || !selectedProperty) {
      setError('Sessão inválida ou área de referência não selecionada para o cadastro.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const created = await createRainGauge(organizationId, selectedProperty.id, {
        name: nameTrimmed,
        latitude: newGaugeLat ?? undefined,
        longitude: newGaugeLng ?? undefined,
      });
      setRainGauges((prev) => [created, ...prev]);
      setNewGaugeName('');
      setNewGaugeLat(null);
      setNewGaugeLng(null);
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof (err.response.data as { message?: string }).message === 'string'
          ? (err.response.data as { message: string }).message
          : 'Falha ao cadastrar pluviômetro. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRainRecord = async () => {
    if (!organizationId || !selectedProperty || !selectedGauge) return;
    const recordedAtIso = parseDateTimePtBrInputToIso(rainDateInput);
    if (!recordedAtIso) {
      setError('Data e hora inválidas. Use o formato dd/mm/aaaa HH:mm.');
      return;
    }
    const amount = Number(rainAmount.replace(',', '.'));
    if (!Number.isFinite(amount) || amount < 0) {
      setError('Informe um valor de chuva válido (mm).');
      return;
    }
    setLoading(true);
    setError('');
    setRainRecordSuccess('');
    try {
      if (rainRecordEditId) {
        await updateRainfallRecord(
          organizationId,
          selectedProperty.id,
          selectedGauge.id,
          rainRecordEditId,
          {
            recordedAt: recordedAtIso,
            amountMm: amount,
            source: 'manual',
          },
        );
      } else {
        await createRainfallRecord(organizationId, selectedProperty.id, selectedGauge.id, {
          recordedAt: recordedAtIso,
          amountMm: amount,
          source: 'manual',
        });
      }

      const now = new Date();
      let filters: { from?: string; to?: string } = {};
      if (rainRecordsDateFilterIso) {
        const d = new Date(rainRecordsDateFilterIso);
        const from = new Date(d);
        from.setHours(0, 0, 0, 0);
        const to = new Date(d);
        to.setHours(23, 59, 59, 999);
        filters = { from: from.toISOString(), to: to.toISOString() };
      } else if (rainRecordsFilterDays) {
        const from = new Date(now.getTime() - rainRecordsFilterDays * 24 * 60 * 60 * 1000);
        filters = {
          from: from.toISOString(),
          to: now.toISOString(),
        };
      }
      const data = await listRainfallRecords(
        organizationId,
        selectedProperty.id,
        selectedGauge.id,
        filters,
      );
      setRainRecords(data);
      setRainAmount('');
      setRainDateIso(new Date().toISOString());
      setRainDateInput(formatDateTimePtBrInput(new Date().toISOString()));
      setRainRecordEditId(null);
      setRainRecordSuccess(rainRecordEditId ? 'Alterações salvas com sucesso.' : 'Chuva registrada com sucesso.');
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof (err.response.data as { message?: string }).message === 'string'
          ? (err.response.data as { message: string }).message
          : 'Falha ao registrar chuva. Tente novamente.';
      setError(msg);
      setRainRecordSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditRainRecord = (record: RainfallRecordType) => {
    setError('');
    setRainRecordSuccess('');
    setRainRecordEditId(record.id);
    setRainDateIso(new Date(record.recordedAt).toISOString());
    setRainDateInput(formatDateTimePtBrInput(new Date(record.recordedAt).toISOString()));
    setRainAmount(String(record.amountMm).replace('.', ','));
  };

  const handleCancelEditRainRecord = () => {
    setError('');
    setRainRecordSuccess('');
    setRainRecordEditId(null);
    setRainAmount('');
    setRainDateIso(new Date().toISOString());
    setRainDateInput(formatDateTimePtBrInput(new Date().toISOString()));
  };

  const handleDeleteRainRecord = async (recordId: string) => {
    if (!organizationId || !selectedProperty || !selectedGauge) return;
    setLoading(true);
    setError('');
    setRainRecordSuccess('');
    try {
      await deleteRainfallRecord(organizationId, selectedProperty.id, selectedGauge.id, recordId);

      const now = new Date();
      let filters: { from?: string; to?: string } = {};
      if (rainRecordsDateFilterIso) {
        const d = new Date(rainRecordsDateFilterIso);
        const from = new Date(d);
        from.setHours(0, 0, 0, 0);
        const to = new Date(d);
        to.setHours(23, 59, 59, 999);
        filters = { from: from.toISOString(), to: to.toISOString() };
      } else if (rainRecordsFilterDays) {
        const from = new Date(now.getTime() - rainRecordsFilterDays * 24 * 60 * 60 * 1000);
        filters = {
          from: from.toISOString(),
          to: now.toISOString(),
        };
      }

      const data = await listRainfallRecords(
        organizationId,
        selectedProperty.id,
        selectedGauge.id,
        filters,
      );
      setRainRecords(data);

      if (rainRecordEditId === recordId) {
        setRainRecordEditId(null);
        setRainAmount('');
        setRainDateIso(new Date().toISOString());
      }
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof (err.response.data as { message?: string }).message === 'string'
          ? (err.response.data as { message: string }).message
          : 'Falha ao excluir registro. Tente novamente.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleExportRainRecords = async () => {
    if (!selectedProperty || !selectedGauge) return;
    if (!rainRecords.length) {
      setError('Não há registros para exportar.');
      return;
    }
    try {
      const header = 'DataHora;Chuva_mm;Fonte';
      const lines = rainRecords.map(
        (r) => `${new Date(r.recordedAt).toISOString()};${r.amountMm};${r.source ?? ''}`,
      );
      const csv = [header, ...lines].join('\n');
      const title = `Relatório de chuva - ${selectedProperty.name} - ${selectedGauge.name}`;
      const file = new File(Paths.cache, `relatorio_chuva_${selectedProperty.id}_${selectedGauge.id}.csv`);
      await file.write(csv);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { dialogTitle: title });
      } else {
        setError('Compartilhamento de arquivo não disponível neste dispositivo.');
      }
    } catch {
      setError('Não foi possível compartilhar o relatório.');
    }
  };

  if (sessionLoading) {
    return (
      <View style={[styles.tela, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.subtitulo}>Carregando...</Text>
      </View>
    );
  }

  if (mapPickerMode === 'property') {
    return (
      <MapLocationPicker
        title="Localização do talhão"
        initialLatitude={newPropertyLat}
        initialLongitude={newPropertyLng}
        onSelect={(lat, lng) => {
          setNewPropertyLat(lat);
          setNewPropertyLng(lng);
          setMapPickerMode(null);
        }}
        onCancel={() => setMapPickerMode(null)}
      />
    );
  }

  if (mapPickerMode === 'gauge') {
    const propertyForCenter = selectedProperty
      ? properties.find((p) => p.id === selectedProperty.id)
      : null;
    const initialRegion =
      propertyForCenter &&
      propertyForCenter.latitude != null &&
      propertyForCenter.longitude != null &&
      Number.isFinite(Number(propertyForCenter.latitude)) &&
      Number.isFinite(Number(propertyForCenter.longitude))
        ? {
            latitude: Number(propertyForCenter.latitude),
            longitude: Number(propertyForCenter.longitude),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        : undefined;
    return (
      <MapLocationPicker
        title="Localização do pluviômetro"
        initialRegion={initialRegion}
        initialLatitude={newGaugeLat}
        initialLongitude={newGaugeLng}
        onSelect={(lat, lng) => {
          setNewGaugeLat(lat);
          setNewGaugeLng(lng);
          setMapPickerMode(null);
        }}
        onCancel={() => setMapPickerMode(null)}
      />
    );
  }

  if (mapPickerMode === 'talhao') {
    const parentProperty = selectedTalhaoPropertyId
      ? properties.find((p) => p.id === selectedTalhaoPropertyId)
      : null;
    const initialRegion =
      parentProperty &&
      parentProperty.latitude != null &&
      parentProperty.longitude != null &&
      Number.isFinite(Number(parentProperty.latitude)) &&
      Number.isFinite(Number(parentProperty.longitude))
        ? {
            latitude: Number(parentProperty.latitude),
            longitude: Number(parentProperty.longitude),
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }
        : undefined;
    return (
      <MapLocationPicker
        title="Localização do talhão"
        initialRegion={initialRegion}
        initialLatitude={newTalhaoLat}
        initialLongitude={newTalhaoLng}
        onSelect={(lat, lng) => {
          setNewTalhaoLat(lat);
          setNewTalhaoLng(lng);
          setMapPickerMode(null);
        }}
        onCancel={() => setMapPickerMode(null)}
      />
    );
  }

  if (tela === 'rainMap') {
    return (
      <View style={styles.tela}>
        <View style={styles.header}>
          <Pressable onPress={() => setTela('dashboard')} style={styles.link}>
            <Text style={styles.linkText}>Voltar</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Mapa de chuva</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            region={mapRegion}
            onRegionChangeComplete={(r) => setMapRegion(r)}
          >
            {properties
              .filter(
                (p) =>
                  p.latitude != null &&
                  p.longitude != null &&
                  Number.isFinite(Number(p.latitude)) &&
                  Number.isFinite(Number(p.longitude))
              )
              .map((p) => (
                <Marker
                  key={`p-${p.id}`}
                  coordinate={{
                    latitude: Number(p.latitude),
                    longitude: Number(p.longitude),
                  }}
                  title={p.name}
                  description={p.description ?? 'Talhão'}
                />
              ))}
            {mapRainGauges
              .filter(
                (g) =>
                  Number.isFinite(Number(g.latitude)) &&
                  Number.isFinite(Number(g.longitude))
              )
              .map((g) => (
                <Marker
                  key={`g-${g.id}`}
                  coordinate={{
                    latitude: Number(g.latitude),
                    longitude: Number(g.longitude),
                  }}
                  title={g.name}
                  description="Pluviômetro"
                  pinColor="#b4533c"
                />
              ))}
          </MapView>
        </View>
      </View>
    );
  }

  if (tela === 'visualizarDados') {
    return (
      <View style={[styles.tela, { backgroundColor: A.bgCanvas }]}>
        <View
          style={{
            backgroundColor: A.bgCard,
            paddingTop: 44,
            paddingBottom: 16,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: A.border,
          }}
        >
          <Pressable onPress={() => setTela('dashboard')} style={{ padding: 8, marginRight: 8 }}>
            <Text style={{ fontSize: 18, color: A.textPrimary }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: A.fontTitleScreen, fontWeight: '600', color: A.textPrimary }}>
            Visualizar Dados
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => setTela('talhoes')}
            style={{
              backgroundColor: A.bgCard,
              borderRadius: 18,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: A.border,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 22, marginRight: 10 }}>🌧️</Text>
              <View>
                <Text style={{ color: A.textPrimary, fontSize: 17, fontWeight: '700' }}>
                  Talhões e pluviômetros
                </Text>
                <Text style={{ color: A.textSecondary, fontSize: 13, marginTop: 2 }}>
                  Selecionar propriedade e sensor
                </Text>
              </View>
            </View>
            <Text style={{ color: A.primary, fontSize: 18, fontWeight: '700' }}>→</Text>
          </Pressable>

          {/* Card Chuvas recentes */}
          <View
            style={{
              backgroundColor: A.bgCard,
              borderRadius: 18,
              padding: 16,
              marginBottom: 16,
              shadowColor: A.shadow,
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: A.textPrimary, fontSize: A.fontTitleCard, fontWeight: '600' }}>
                Chuvas Recentes
              </Text>
              <Pressable onPress={() => setTela('detalhesChuvas')}>
                <Text style={{ color: A.primary, fontSize: 15, fontWeight: '600' }}>Ver Detalhes</Text>
              </Pressable>
            </View>

            {(() => {
              const days: { date: string; label: string; totalMm: number }[] = [];
              const today = new Date();
              const byDate: Record<string, number> = {};
              rainSummary.forEach((s) => {
                byDate[s.date] = Number(s.totalMm);
              });
              for (let i = 6; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().slice(0, 10);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                days.push({
                  date: dateStr,
                  label: `${day}/${month}`,
                  totalMm: byDate[dateStr] ?? 0,
                });
              }
              const maxMm = Math.max(1, ...days.map((x) => x.totalMm));
              return (
                <View style={{ height: 180, justifyContent: 'flex-end' }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      paddingHorizontal: 8,
                    }}
                  >
                    {days.map((d) => (
                      <View key={d.date} style={{ alignItems: 'center', flex: 1 }}>
                        <View
                          style={{
                            width: 18,
                            height: Math.max(6, (d.totalMm / maxMm) * 110),
                            borderRadius: 6,
                            backgroundColor: A.chartBar,
                          }}
                        />
                      </View>
                    ))}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 10,
                      paddingHorizontal: 8,
                    }}
                  >
                    {days.map((d) => (
                      <Text key={d.date} style={{ fontSize: 12, color: A.textMuted }}>
                        {d.label}
                      </Text>
                    ))}
                  </View>
                </View>
              );
            })()}
          </View>

          <WeatherForecastCard variant="full" weather={weather} />
        </ScrollView>
      </View>
    );
  }

  if (tela === 'detalhesChuvas') {
    return (
      <View style={[styles.tela, { backgroundColor: A.bgCanvas }]}>
        <View
          style={{
            backgroundColor: A.bgCard,
            paddingTop: 44,
            paddingBottom: 16,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: A.border,
          }}
        >
          <Pressable onPress={() => setTela('visualizarDados')} style={{ padding: 8, marginRight: 8 }}>
            <Text style={{ fontSize: 18, color: A.textPrimary }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: A.fontTitleScreen, fontWeight: '600', color: A.textPrimary }}>
            Chuvas Recentes
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: A.bgCard,
              borderRadius: 20,
              padding: 16,
              shadowColor: A.shadow,
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: A.textPrimary, marginBottom: 4 }}>
              📊 Expandir Gráfico
            </Text>
            <Text style={{ fontSize: 15, color: A.textSecondary, marginBottom: 12 }}>
              Explore o histórico de chuva com mais detalhes.
            </Text>

            {/* Filtros rápidos de período */}
            <View
              style={{
                flexDirection: 'row',
                marginBottom: 16,
                backgroundColor: A.pillInactive,
                borderRadius: 999,
                padding: 4,
              }}
            >
              {[7, 30, 90].map((d) => {
                const active = rainSummaryDays === d;
                return (
                  <Pressable
                    key={d}
                    onPress={() => setRainSummaryDays(d as 7 | 30 | 90)}
                    style={{
                      flex: 1,
                      paddingVertical: 6,
                      borderRadius: 999,
                      backgroundColor: active ? A.primary : 'transparent',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: active ? A.textOnDark : A.textSecondary,
                        fontWeight: active ? '600' : '400',
                      }}
                    >
                      {d} dias
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Gráfico usando rainSummary e período selecionado */}
            {(() => {
              const daysWindow = rainSummaryDays;
              const days: { date: string; label: string; totalMm: number }[] = [];
              const today = new Date();
              const byDate: Record<string, number> = {};
              rainSummary.forEach((s) => {
                byDate[s.date] = Number(s.totalMm);
              });
              for (let i = daysWindow - 1; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().slice(0, 10);
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                days.push({
                  date: dateStr,
                  label: `${day}/${month}`,
                  totalMm: byDate[dateStr] ?? 0,
                });
              }
              const maxMm = Math.max(1, ...days.map((x) => x.totalMm));
              return (
                <View style={{ height: 220, justifyContent: 'flex-end', marginBottom: 12 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      paddingHorizontal: 4,
                    }}
                  >
                    {days.map((d) => (
                      <View key={d.date} style={{ alignItems: 'center', flex: 1 }}>
                        <View
                          style={{
                            width: 10,
                            height: Math.max(4, (d.totalMm / maxMm) * 140),
                            borderRadius: 4,
                            backgroundColor: A.chartBar,
                          }}
                        />
                      </View>
                    ))}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 8,
                      paddingHorizontal: 4,
                    }}
                  >
                    {days.map((d) => (
                      <Text key={d.date} style={{ fontSize: 12, color: A.textMuted }}>
                        {d.label}
                      </Text>
                    ))}
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      color: A.textMuted,
                      marginTop: 4,
                    }}
                  >
                    mm de chuva por dia no período selecionado
                  </Text>
                </View>
              );
            })()}

            <View style={{ marginTop: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: A.textPrimary, marginBottom: 8 }}>
                Esta funcionalidade permitirá:
              </Text>
              <Text style={{ fontSize: 16, color: A.textSecondary, marginBottom: 4 }}>
                • Visualizar período personalizado
              </Text>
              <Text style={{ fontSize: 16, color: A.textSecondary, marginBottom: 4 }}>
                • Filtrar por pluviômetro
              </Text>
              <Text style={{ fontSize: 16, color: A.textSecondary, marginBottom: 4 }}>
                • Exportar dados
              </Text>
              <Text style={{ fontSize: 16, color: A.textSecondary, marginBottom: 4 }}>
                • Comparar propriedades
              </Text>
              <Text style={{ fontSize: 16, color: A.textSecondary }}>
                • Análise detalhada
              </Text>
            </View>

            {/* Ações rápidas ligadas às telas existentes */}
            <View style={{ marginTop: 16 }}>
              <Pressable
                onPress={() => setTela('rainMap')}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: A.border,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 15, color: A.textPrimary }}>
                  Ver mapa de chuva e comparar propriedades
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  // Forca novo fluxo de selecao para evitar estado inconsistente.
                  setSelectedProperty(null);
                  setSelectedGauge(null);
                  setError('');
                  setTela('talhoes');
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: A.border,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 15, color: A.textPrimary }}>
                  Filtrar por talhão / pluviômetro
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (selectedProperty && selectedGauge) {
                    handleExportRainRecords();
                    return;
                  }
                  setExportCsvAfterSelection(true);
                  setError('Selecione um talhão e um pluviômetro antes de exportar o CSV.');
                  setTela('talhoes');
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: A.border,
                }}
              >
                <Text style={{ fontSize: 15, color: A.textPrimary }}>
                  Exportar dados detalhados (CSV)
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (tela === 'registrarChuva') {
    return (
      <View style={[styles.tela, { backgroundColor: A.bgCanvas }]}>
        <View
          style={{
            backgroundColor: A.bgCard,
            paddingTop: 44,
            paddingBottom: 16,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: A.border,
          }}
        >
          <Pressable onPress={() => setTela('inserirDados')} style={{ padding: 8, marginRight: 8 }}>
            <Text style={{ fontSize: 18, color: A.textPrimary }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: A.fontTitleScreen, fontWeight: '600', color: A.textPrimary }}>
            Registrar Chuva
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: A.bgCard,
              borderRadius: 20,
              padding: 16,
              shadowColor: A.shadow,
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Text style={{ color: A.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 6 }}>
              Data
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: A.inputBg,
                  borderColor: A.inputBorder,
                  color: A.textPrimary,
                },
              ]}
              placeholder="dd/mm/aaaa HH:mm"
              placeholderTextColor="#9ca3af"
              value={rainDateInput}
              onChangeText={(t) => {
                setRainDateInput(t);
                const parsed = parseDateTimePtBrInputToIso(t);
                if (parsed) setRainDateIso(parsed);
                setError('');
              }}
              editable={!loading}
            />

            <Text
              style={{
                color: A.textPrimary,
                fontSize: 16,
                fontWeight: '600',
                marginTop: 16,
                marginBottom: 6,
              }}
            >
              Pluviômetro
            </Text>
            <Pressable
              onPress={() => setShowGaugePicker((prev) => !prev)}
              style={{
                backgroundColor: A.inputBg,
                borderWidth: 1,
                borderColor: A.inputBorder,
                borderRadius: 8,
                paddingVertical: 14,
                paddingHorizontal: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: selectedGauge ? A.textPrimary : '#9ca3af', fontSize: 18 }}>
                {selectedGauge ? selectedGauge.name : 'Selecione um pluviômetro'}
              </Text>
              <Text style={{ color: '#9ca3af' }}>▾</Text>
            </Pressable>
            {showGaugePicker && rainGauges.length > 0 && (
              <View
                style={{
                  marginTop: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: A.inputBorder,
                  backgroundColor: A.bgCard,
                  maxHeight: 180,
                }}
              >
                <ScrollView nestedScrollEnabled>
                  {rainGauges.map((g) => (
                    <Pressable
                      key={g.id}
                      onPress={() => {
                        setSelectedGauge(g);
                        setShowGaugePicker(false);
                        setError('');
                      }}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: A.bgCanvas,
                      }}
                    >
                      <Text style={{ color: A.textPrimary, fontSize: 17 }}>{g.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
            {showGaugePicker && rainGauges.length === 0 && (
              <Text style={{ marginTop: 8, color: A.textSecondary, fontSize: 15 }}>
                Nenhum pluviômetro encontrado. Cadastre em Talhões &gt; Pluviômetros.
              </Text>
            )}

            <Text
              style={{
                color: A.textPrimary,
                fontSize: 16,
                fontWeight: '600',
                marginTop: 16,
                marginBottom: 6,
              }}
            >
              Quantidade (mm)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: A.inputBg,
                  borderColor: A.inputBorder,
                  color: A.textPrimary,
                },
              ]}
              placeholder="0.0"
              placeholderTextColor="#9ca3af"
              value={rainAmount}
              onChangeText={(t) => {
                setRainAmount(t);
                setError('');
              }}
              keyboardType="numeric"
              editable={!loading}
            />

            <Pressable
              style={[styles.botao, loading && styles.botaoDisabled, { marginTop: 24 }]}
              onPress={handleCreateRainRecord}
              disabled={loading || !rainAmount.trim() || !selectedGauge}
            >
              <Text style={styles.botaoTexto}>
                {loading ? 'Salvando...' : 'Registrar Chuva'}
              </Text>
            </Pressable>

            {error ? <Text style={[styles.erro, { marginTop: 12 }]}>{error}</Text> : null}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (tela === 'cadastrarPluviometro') {
    return (
      <View style={[styles.tela, { backgroundColor: A.bgCanvas }]}>
        <View
          style={{
            backgroundColor: A.bgCard,
            paddingTop: 44,
            paddingBottom: 16,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: A.border,
          }}
        >
          <Pressable onPress={() => setTela('inserirDados')} style={{ padding: 8, marginRight: 8 }}>
            <Text style={{ fontSize: 18, color: A.textPrimary }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: A.fontTitleScreen, fontWeight: '600', color: A.textPrimary }}>
            Cadastrar Pluviômetro
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: A.bgCard,
              borderRadius: 20,
              padding: 16,
              shadowColor: A.shadow,
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Text style={{ color: A.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 6 }}>
              Talhão de referência (recomendado)
            </Text>
            <Pressable
              onPress={() => setShowGaugePicker((prev) => !prev)}
              style={{
                backgroundColor: A.inputBg,
                borderWidth: 1,
                borderColor: A.inputBorder,
                borderRadius: 8,
                paddingVertical: 14,
                paddingHorizontal: 16,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: selectedProperty ? A.textPrimary : '#9ca3af', fontSize: 18 }}>
                {selectedProperty ? selectedProperty.name : 'Selecione um talhão'}
              </Text>
              <Text style={{ color: '#9ca3af' }}>▾</Text>
            </Pressable>
            <Text style={{ color: A.textSecondary, fontSize: 13, marginTop: 8 }}>
              O pluviômetro funciona sem vínculo físico ao talhão, mas associar uma área melhora a gestão da chuva por
              produção.
            </Text>
            {showGaugePicker && properties.length > 0 && (
              <View
                style={{
                  marginTop: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: A.inputBorder,
                  backgroundColor: A.bgCard,
                  maxHeight: 180,
                }}
              >
                <ScrollView nestedScrollEnabled>
                  {properties.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => {
                        setSelectedProperty({ id: p.id, name: p.name });
                        setShowGaugePicker(false);
                        setError('');
                      }}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: A.bgCanvas,
                      }}
                    >
                      <Text style={{ color: A.textPrimary, fontSize: 17 }}>{p.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
            {showGaugePicker && properties.length === 0 && (
              <Text style={{ marginTop: 8, color: A.textSecondary, fontSize: 15 }}>
                Nenhum talhão cadastrado. Cadastre um talhão para usar como referência de gestão.
              </Text>
            )}

            <Text
              style={{
                color: A.textPrimary,
                fontSize: 16,
                fontWeight: '600',
                marginTop: 16,
                marginBottom: 6,
              }}
            >
              Nome do Pluviômetro
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: A.inputBg,
                  borderColor: A.inputBorder,
                  color: A.textPrimary,
                },
              ]}
              placeholder="Ex: Pluviômetro 01"
              placeholderTextColor="#9ca3af"
              value={newGaugeName}
              onChangeText={(t) => {
                setNewGaugeName(t);
                setError('');
              }}
              editable={!loading}
            />

            <View style={{ marginTop: 12 }}>
              <Pressable
                style={[styles.botaoSecundario]}
                onPress={() => setMapPickerMode('gauge')}
                disabled={!selectedProperty}
              >
                <Text style={styles.botaoSecundarioTexto}>
                  {newGaugeLat != null && newGaugeLng != null
                    ? `Localização: ${Number(newGaugeLat).toFixed(4)}, ${Number(
                        newGaugeLng,
                      ).toFixed(4)} (alterar)`
                    : 'Definir localização no mapa'}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.botao, loading && styles.botaoDisabled, { marginTop: 24 }]}
              onPress={handleCreateRainGauge}
              disabled={loading || !newGaugeName.trim() || !selectedProperty}
            >
              <Text style={styles.botaoTexto}>
                {loading ? 'Salvando...' : 'Salvar Pluviômetro'}
              </Text>
            </Pressable>

            {error ? <Text style={[styles.erro, { marginTop: 12 }]}>{error}</Text> : null}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (tela === 'cadastrarTalhao') {
    return (
      <View style={[styles.tela, { backgroundColor: A.bgCanvas }]}>
        <View
          style={{
            backgroundColor: A.bgCard,
            paddingTop: 44,
            paddingBottom: 16,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: A.border,
          }}
        >
          <Pressable onPress={() => setTela('inserirDados')} style={{ padding: 8, marginRight: 8 }}>
            <Text style={{ fontSize: 18, color: A.textPrimary }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: A.fontTitleScreen, fontWeight: '600', color: A.textPrimary }}>
            Cadastrar Talhão
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: A.bgCard,
              borderRadius: 20,
              padding: 16,
              shadowColor: A.shadow,
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Text style={{ color: A.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 6 }}>
              Propriedade
            </Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: A.inputBorder,
                borderRadius: 12,
                padding: 10,
                backgroundColor: A.inputBg,
              }}
            >
              {properties.length === 0 ? (
                <Text style={{ color: A.textSecondary, fontSize: 14 }}>
                  Nenhuma propriedade cadastrada. Cadastre uma propriedade primeiro.
                </Text>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {properties.map((p) => {
                    const active = selectedTalhaoPropertyId === p.id;
                    return (
                      <Pressable
                        key={`talhao-parent-${p.id}`}
                        onPress={() => {
                          setSelectedTalhaoPropertyId(p.id);
                          setError('');
                        }}
                        style={{
                          borderRadius: 999,
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderWidth: 1,
                          borderColor: active ? A.primary : A.inputBorder,
                          backgroundColor: active ? A.primary : A.bgCard,
                        }}
                      >
                        <Text style={{ color: active ? A.textOnDark : A.textPrimary, fontSize: 13 }}>
                          {p.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            <Text style={{ color: A.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 6 }}>
              Nome do Talhão
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: A.inputBg,
                  borderColor: A.inputBorder,
                  color: A.textPrimary,
                },
              ]}
              placeholder="Ex: Talhão 01"
              placeholderTextColor="#9ca3af"
              value={newTalhaoName}
              onChangeText={(t) => {
                setNewTalhaoName(t);
                setError('');
              }}
              editable={!loading}
            />

            <View style={{ marginTop: 12 }}>
              <Pressable
                style={[styles.botaoSecundario]}
                onPress={() => setMapPickerMode('talhao')}
                disabled={!selectedTalhaoPropertyId}
              >
                <Text style={styles.botaoSecundarioTexto}>
                  {newTalhaoLat != null && newTalhaoLng != null
                    ? `Localização: ${Number(newTalhaoLat).toFixed(4)}, ${Number(
                        newTalhaoLng,
                      ).toFixed(4)} (alterar)`
                    : 'Definir localização no mapa'}
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={[styles.botao, loading && styles.botaoDisabled, { marginTop: 24 }]}
              onPress={handleCreateTalhao}
              disabled={loading || !newTalhaoName.trim() || !selectedTalhaoPropertyId}
            >
              <Text style={styles.botaoTexto}>
                {loading ? 'Salvando...' : 'Salvar Talhão'}
              </Text>
            </Pressable>

            {error ? <Text style={[styles.erro, { marginTop: 12 }]}>{error}</Text> : null}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (tela === 'inserirDados') {
    return (
      <View style={[styles.tela, { backgroundColor: A.bgCanvas }]}>
        <View
          style={{
            backgroundColor: A.bgCard,
            paddingTop: 44,
            paddingBottom: 16,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: A.border,
          }}
        >
          <Pressable onPress={() => setTela('dashboard')} style={{ padding: 8, marginRight: 8 }}>
            <Text style={{ fontSize: 18, color: A.textPrimary }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: 20, fontWeight: '700', color: A.textPrimary }}>
            Inserir Dados
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Chuva */}
          <Pressable
            onPress={() => setTela('registrarChuva')}
            style={{
              backgroundColor: A.menuRain,
              borderRadius: 18,
              paddingVertical: 16,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: A.menuRainIcon,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Text style={{ fontSize: 24 }}>🌧️</Text>
            </View>
            <View>
              <Text style={{ color: A.textPrimary, fontSize: 19, fontWeight: '700' }}>Chuva</Text>
              <Text style={{ color: A.textSecondary, fontSize: 15 }}>Registrar precipitação</Text>
            </View>
          </Pressable>

          {/* Pluviômetro */}
          <Pressable
            onPress={() => setTela('cadastrarPluviometro')}
            style={{
              backgroundColor: A.menuGauge,
              borderRadius: 18,
              paddingVertical: 16,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: A.menuGaugeIcon,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Text style={{ fontSize: 24 }}>📟</Text>
            </View>
            <View>
              <Text style={{ color: A.textPrimary, fontSize: 19, fontWeight: '700' }}>
                Pluviômetro
              </Text>
              <Text style={{ color: A.textSecondary, fontSize: 15 }}>Cadastrar equipamentos</Text>
            </View>
          </Pressable>

          {/* Talhão */}
          <Pressable
            onPress={() => setTela('cadastrarTalhao')}
            style={{
              backgroundColor: A.menuField,
              borderRadius: 18,
              paddingVertical: 16,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: A.menuFieldIcon,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Text style={{ fontSize: 24 }}>🗺️</Text>
            </View>
            <View>
              <Text style={{ color: A.textPrimary, fontSize: 19, fontWeight: '700' }}>Talhão</Text>
              <Text style={{ color: A.textSecondary, fontSize: 15 }}>Cadastrar propriedades</Text>
            </View>
          </Pressable>

          {/* Pessoas */}
          {user?.role !== 'user' && (
            <Pressable
              onPress={() => setTela('gerenciarPessoas')}
              style={{
                backgroundColor: A.menuPeople,
                borderRadius: 18,
                paddingVertical: 16,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: A.menuPeopleIcon,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <Text style={{ fontSize: 24 }}>👥</Text>
              </View>
              <View>
                <Text style={{ color: A.textPrimary, fontSize: 19, fontWeight: '700' }}>Pessoas</Text>
                <Text style={{ color: A.textSecondary, fontSize: 15 }}>
                  Gerenciar usuários (Admin)
                </Text>
              </View>
            </Pressable>
          )}
        </ScrollView>
      </View>
    );
  }

  if (tela === 'gerenciarPessoas') {
    return (
      <View style={[styles.tela, { backgroundColor: A.bgCanvas }]}>
        <View
          style={{
            backgroundColor: A.bgCard,
            paddingTop: 44,
            paddingBottom: 16,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: A.border,
          }}
        >
          <Pressable onPress={() => setTela('inserirDados')} style={{ padding: 8, marginRight: 8 }}>
            <Text style={{ fontSize: 18, color: A.textPrimary }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: A.fontTitleScreen, fontWeight: '600', color: A.textPrimary }}>
            Gerenciar Pessoas
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              backgroundColor: A.bgCard,
              borderRadius: 20,
              padding: 16,
              shadowColor: A.shadow,
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 3 },
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: A.textPrimary }}>
              Usuários da organização
            </Text>
            <Text style={{ fontSize: 15, color: A.textSecondary, marginTop: 4, marginBottom: 16 }}>
              Controle quem pode acessar e registrar dados na plataforma.
            </Text>

            {/* Cadastro integrado ao backend */}
            <Text style={{ fontSize: 15, color: A.textSecondary, marginBottom: 8 }}>
              Cadastro de usuários com integração ao backend.
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: A.inputBg, borderColor: A.inputBorder, color: A.textPrimary },
              ]}
              placeholder="Nome"
              placeholderTextColor="#9ca3af"
              value={newPersonName}
              onChangeText={(t) => setNewPersonName(t)}
            />
            <TextInput
              style={[
                styles.input,
                { backgroundColor: A.inputBg, borderColor: A.inputBorder, color: A.textPrimary },
              ]}
              placeholder="E-mail"
              placeholderTextColor="#9ca3af"
              value={newPersonEmail}
              onChangeText={(t) => setNewPersonEmail(t)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
            style={[
              styles.input,
              { backgroundColor: A.inputBg, borderColor: A.inputBorder, color: A.textPrimary },
            ]}
            placeholder="Senha inicial"
            placeholderTextColor="#9ca3af"
            value={newPersonPassword}
            onChangeText={setNewPersonPassword}
            secureTextEntry
          />
            

            <View
              style={{
                flexDirection: 'row',
                marginTop: 12,
                marginBottom: 4,
                backgroundColor: A.pillInactive,
                borderRadius: 999,
                padding: 4,
              }}
            >
              {(['user', 'admin'] as const).map((role) => {
                const active = newPersonRole === role;
                return (
                  <Pressable
                    key={role}
                    onPress={() => setNewPersonRole(role)}
                    style={{
                      flex: 1,
                      paddingVertical: 6,
                      borderRadius: 999,
                      alignItems: 'center',
                      backgroundColor: active ? A.primary : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: active ? A.textOnDark : A.textSecondary,
                        fontWeight: active ? '600' : '400',
                      }}
                    >
                      {role === 'admin' ? 'Admin' : 'Colaborador'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
  style={[styles.botao, { marginTop: 16 }]}
  onPress={async () => {
    const name = newPersonName.trim();
    const email = newPersonEmail.trim();
    const pwd = newPersonPassword.trim();
    if (!name || !email || !pwd) return;
    setLoading(true);
    try {
      const created = await createUser({
        name,
        email,
        password: pwd,
        role: newPersonRole,
      });
      setPeople((prev) => [created, ...prev]);
      setNewPersonName('');
      setNewPersonEmail('');
      setNewPersonPassword('');
      setError('');
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof (err.response.data as { message?: string }).message === 'string'
          ? (err.response.data as { message: string }).message
          : 'Não foi possível criar usuário.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }}
  disabled={
    loading || !newPersonName.trim() || !newPersonEmail.trim() || !newPersonPassword.trim()
  }
>
  <Text style={styles.botaoTexto}>{loading ? 'Salvando...' : 'Adicionar pessoa'}</Text>
            </Pressable>

            {people.length > 0 && (
              <View style={{ marginTop: 24 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: A.textPrimary,
                    marginBottom: 8,
                  }}
                >
                  Lista atual
                </Text>
                {people.map((p) => (
                  <View
                    key={p.id}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: A.border,
                      marginBottom: 8,
                      backgroundColor: A.inputBg,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 16, color: A.textPrimary, fontWeight: '700' }}>
                        {p.name}
                      </Text>
                      <Text style={{ fontSize: 14, color: A.textSecondary }}>{p.email}</Text>
                      <Text style={{ fontSize: 14, color: A.textMuted, marginTop: 2 }}>
                        {p.role === 'owner'
                          ? 'Proprietário'
                          : p.role === 'admin'
                          ? 'Admin'
                          : 'Colaborador'}
                      </Text>
                      <Text style={{ fontSize: 14, color: A.textSecondary, marginTop: 2 }}>
                        Status: {p.isActive ? 'Ativo' : 'Inativo'}
                      </Text>
                    </View>
                    <Pressable
                      onPress={async () => {
                        setLoading(true);
                        try {
                          const updated = await updateUser(p.id, { isActive: !p.isActive });
                          setPeople((prev) =>
                            prev.map((x) => (x.id === updated.id ? updated : x)),
                          );
                          setError('');
                        } catch (err: unknown) {
                          const msg =
                            err &&
                            typeof err === 'object' &&
                            'response' in err &&
                            err.response &&
                            typeof err.response === 'object' &&
                            'data' in err.response &&
                            err.response.data &&
                            typeof (err.response.data as { message?: string }).message === 'string'
                              ? (err.response.data as { message: string }).message
                              : 'Não foi possível atualizar usuário.';
                          setError(msg);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      style={{ padding: 6 }}
                      disabled={loading}
                    >
                      <Text style={{ fontSize: 14, color: A.primary, fontWeight: '700' }}>
                        {p.isActive ? 'Desativar' : 'Ativar'}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (tela === 'rainRecords' && selectedGauge && selectedProperty) {
    return (
      <RainRecordsScreen
          organizationName={organizationName}
          selectedPropertyName={selectedProperty.name}
          selectedGaugeName={selectedGauge.name}
          rainRecordsFilterDays={rainRecordsFilterDays}
          rainRecordsDateFilterIso={rainRecordsDateFilterIso}
          rainDateIso={rainDateIso}
          rainAmount={rainAmount}
          rainRecords={rainRecords}
          loading={loading}
          error={error}
          successMessage={rainRecordSuccess}
          editingRecordId={rainRecordEditId}
          onBack={() => {
            setTela('rainGauges');
            setError('');
            setRainRecordSuccess('');
            setRainRecordEditId(null);
          }}
          onSetFilterDays={(value) => {
            setRainRecordsFilterDays(value);
            if (value) setRainRecordsDateFilterIso(null);
          }}
          onPickFilterDate={(date) => {
            setRainRecordsFilterDays(null);
            setRainRecordsDateFilterIso(date.toISOString());
          }}
          onChangeRainDateIso={(t) => {
            setRainDateIso(t);
            setError('');
            setRainRecordSuccess('');
          }}
          onChangeRainAmount={(t) => {
            setRainAmount(t);
            setError('');
            setRainRecordSuccess('');
          }}
          onSubmitRainRecord={handleCreateRainRecord}
          onStartEditRainRecord={handleStartEditRainRecord}
          onCancelEdit={handleCancelEditRainRecord}
          onDeleteRainRecord={handleDeleteRainRecord}
        />
    );
  }

  if (tela === 'rainRecords' && (!selectedGauge || !selectedProperty)) {
    return (
      <View style={[styles.tela, { backgroundColor: A.bgCanvas }]}>
        <View
          style={{
            backgroundColor: A.bgCard,
            paddingTop: 44,
            paddingBottom: 16,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: A.border,
          }}
        >
          <Pressable onPress={() => setTela('dashboard')} style={{ padding: 8, marginRight: 8 }}>
            <Text style={{ fontSize: 18, color: A.textPrimary }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: A.fontTitleScreen, fontWeight: '600', color: A.textPrimary }}>
            Registros de chuva
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, color: A.textPrimary, fontWeight: '700', textAlign: 'center' }}>
            Selecione um talhão e um pluviômetro.
          </Text>
          <Text style={{ marginTop: 8, fontSize: 16, color: A.textSecondary, textAlign: 'center' }}>
            Você será direcionado para escolher os dados antes de ver os registros.
          </Text>
          <Pressable
            onPress={() => {
              setTela('talhoes');
              setError('');
            }}
            style={[styles.botao, { marginTop: 20, width: '100%', maxWidth: 360 }]}
          >
            <Text style={styles.botaoTexto}>Escolher talhão e pluviômetro</Text>
          </Pressable>
          {error ? <Text style={[styles.erro, { marginTop: 12 }]}>{error}</Text> : null}
        </View>
      </View>
    );
  }

  if (tela === 'rainGauges' && !selectedProperty) {
    return (
      <View style={[styles.tela, { backgroundColor: A.bgCanvas }]}>
        <View
          style={{
            backgroundColor: A.bgCard,
            paddingTop: 44,
            paddingBottom: 16,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: A.border,
          }}
        >
          <Pressable onPress={() => setTela('dashboard')} style={{ padding: 8, marginRight: 8 }}>
            <Text style={{ fontSize: 18, color: A.textPrimary }}>←</Text>
          </Pressable>
          <Text style={{ fontSize: A.fontTitleScreen, fontWeight: '600', color: A.textPrimary }}>
            Pluviômetros
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, color: A.textPrimary, fontWeight: '700', textAlign: 'center' }}>
            Nenhum talhão selecionado.
          </Text>
          <Pressable
            onPress={() => setTela('talhoes')}
            style={[styles.botao, { marginTop: 20, width: '100%', maxWidth: 360 }]}
          >
            <Text style={styles.botaoTexto}>Selecionar talhão</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (tela === 'rainGauges' && selectedProperty) {
    return (
      <RainGaugesScreen
        selectedPropertyName={selectedProperty.name}
        loading={loading}
        error={error}
        newGaugeName={newGaugeName}
        gaugeLocationLabel={
          newGaugeLat != null && newGaugeLng != null
            ? `Localização: ${Number(newGaugeLat).toFixed(4)}, ${Number(newGaugeLng).toFixed(4)} (alterar)`
            : 'Definir localização no mapa'
        }
        rainGauges={rainGauges}
        onBack={() => {
          setTela('talhoes');
          setSelectedProperty(null);
          setRainGauges([]);
          setNewGaugeName('');
          setError('');
        }}
        onChangeGaugeName={(t) => {
          setNewGaugeName(t);
          setError('');
        }}
        onOpenGaugeMap={() => setMapPickerMode('gauge')}
        onCreateRainGauge={handleCreateRainGauge}
        onSelectGauge={(g) => {
          setSelectedGauge(g);
          setRainRecordsLoaded(false);
          setTela('rainRecords');
          setError('');
        }}
      />
    );
  }

  if (tela === 'talhoes') {
    return (
      <TalhoesScreen
        user={user}
        loading={loading}
        error={error}
        newPropertyName={newPropertyName}
        properties={properties}
        propertyLocationLabel={
          newPropertyLat != null && newPropertyLng != null
            ? `Localização: ${Number(newPropertyLat).toFixed(4)}, ${Number(newPropertyLng).toFixed(4)} (alterar)`
            : 'Definir localização no mapa'
        }
        onBack={() => setTela('dashboard')}
        onChangePropertyName={(t) => {
          setNewPropertyName(t);
          setError('');
        }}
        onOpenPropertyMap={() => setMapPickerMode('property')}
        onCreateProperty={handleCreateProperty}
        onSelectProperty={(id, nameProp) => {
          setSelectedProperty({ id, name: nameProp });
          setTela('rainGauges');
          setError('');
        }}
        onGoRainMap={() => setTela('rainMap')}
      />
    );
  }

  if (tela === 'dashboard') {
    return (
      <DashboardScreen
        user={user}
        rainSummaryDays={rainSummaryDays}
        setRainSummaryDays={setRainSummaryDays}
        rainSummary={rainSummary}
        weather={weather}
        onGoTalhoes={() => setTela('talhoes')}
        onGoVisualizarDados={() => setTela('visualizarDados')}
        onGoInserirDados={() => setTela('inserirDados')}
      />
    );
  }

  if (tela === 'register') {
    return (
      <RegisterScreen
        organizationName={organizationName}
        name={name}
        email={email}
        password={password}
        loading={loading}
        error={error}
        onChangeOrganizationName={(t) => { setOrganizationName(t); setError(''); }}
        onChangeName={(t) => { setName(t); setError(''); }}
        onChangeEmail={(t) => { setEmail(t); setError(''); }}
        onChangePassword={(t) => { setPassword(t); setError(''); }}
        onSubmit={handleRegister}
        onGoToLogin={() => { setTela('login'); setError(''); }}
      />
    );
  }

  return (
    <LoginScreen
      email={email}
      password={password}
      loading={loading}
      error={error}
      onChangeEmail={(t) => { setEmail(t); setError(''); }}
      onChangePassword={(t) => { setPassword(t); setError(''); }}
      onSubmit={handleLogin}
      onGoToRegister={() => { setTela('register'); setError(''); }}
    />
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: A.bgDeep,
  },
  centro: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  logo: {
    color: '#e5e7eb',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: A.bgHeaderMuted,
  },
  headerTitle: {
    color: '#e5e7eb',
    fontSize: 22,
    fontWeight: '600',
  },
  link: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  linkBlock: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#3b82f6',
    fontSize: 18,
  },
  conteudo: {
    flex: 1,
    padding: 16,
  },
  titulo: {
    color: '#e5e7eb',
    fontSize: 26,
    fontWeight: '600',
  },
  subtitulo: {
    color: '#94a3b8',
    fontSize: 18,
    marginTop: 8,
  },
  input: {
    backgroundColor: A.bgDeepSurface,
    borderWidth: 1,
    borderColor: A.bgHeader,
    borderRadius: 8,
    color: A.textOnDark,
    fontSize: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  erro: {
    color: A.error,
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  botao: {
    marginTop: 24,
    backgroundColor: A.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  botaoDisabled: {
    opacity: 0.7,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  botaoSecundario: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: A.primary,
    alignItems: 'center',
  },
  botaoSecundarioTexto: {
    color: A.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  propertyCard: {
    backgroundColor: A.bgDeepSurface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: A.bgHeader,
  },
  propertyName: {
    color: A.textOnDark,
    fontSize: 18,
    fontWeight: '600',
  },
  propertyDescription: {
    color: A.weatherCardSubtext,
    fontSize: 16,
    marginTop: 4,
  },
  propertyCoords: {
    color: A.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
});
