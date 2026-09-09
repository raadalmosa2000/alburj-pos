import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Linking, Platform } from 'react-native';
import { fetchTodayDuty, fetchCities } from '../api/client';
import { Phone, MapPin, Building, ChevronDown } from 'lucide-react-native';

export default function HomeScreen() {
  const [duty, setDuty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string | undefined>();

  useEffect(() => {
    loadData();
  }, [selectedCityId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const c = await fetchCities();
      setCities(c);
      if (!selectedCityId && c.length > 0) {
        setSelectedCityId(c[0].id);
      }

      if (selectedCityId || c.length > 0) {
        const d = await fetchTodayDuty(selectedCityId || c[0].id, 'pharmacy');
        setDuty(d);
      }
    } catch (error) {
      console.log('Error loading data', error);
    } finally {
      setLoading(false);
    }
  };

  const openMap = (facility: any) => {
    if (facility.latitude && facility.longitude) {
      const scheme = Platform.select({ ios: 'maps://0,0?q=', android: 'geo:0,0?q=' });
      const latLng = `${facility.latitude},${facility.longitude}`;
      const label = facility.name;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
      });
      Linking.openURL(url!);
    } else if (facility.address) {
       Linking.openURL(`https://maps.google.com/?q=${facility.address}`);
    }
  };

  const callPhone = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المناوب اليوم</Text>

        {/* Simple city selector mockup */}
        <TouchableOpacity style={styles.citySelector}>
          <Text style={styles.cityText}>
            {cities.find(c => c.id === selectedCityId)?.name || 'المدينة'}
          </Text>
          <ChevronDown size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {duty.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.noDuty}>لا توجد صيدليات مناوبة اليوم في هذه المدينة</Text>
        </View>
      ) : (
        duty.map((schedule) => {
          const f = schedule.facility;
          return (
            <View key={schedule.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Building size={24} color="#0066CC" />
                <Text style={styles.facilityName}>{f.name}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoText}>{f.address}</Text>
                <MapPin size={20} color="#666" style={{marginLeft: 8}} />
              </View>

              {f.phone && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoText}>{f.phone}</Text>
                  <Phone size={20} color="#666" style={{marginLeft: 8}} />
                </View>
              )}

              <View style={styles.actions}>
                {f.phone && (
                  <TouchableOpacity style={[styles.btn, styles.callBtn]} onPress={() => callPhone(f.phone)}>
                    <Phone size={20} color="#FFF" />
                    <Text style={styles.btnText}>اتصال</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.btn, styles.mapBtn]} onPress={() => openMap(f)}>
                  <MapPin size={20} color="#FFF" />
                  <Text style={styles.btnText}>الموقع</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 40 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
  citySelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0' },
  cityText: { fontSize: 16, marginRight: 8, color: '#333' },
  noDuty: { fontSize: 18, color: '#666' },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, justifyContent: 'flex-end' },
  facilityName: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', marginRight: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 12 },
  infoText: { fontSize: 16, color: '#4A4A4A' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12 },
  callBtn: { backgroundColor: '#34C759' },
  mapBtn: { backgroundColor: '#007AFF' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});
