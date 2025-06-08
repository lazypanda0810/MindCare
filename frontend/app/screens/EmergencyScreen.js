import React, { useState } from 'react';
import { View, Text, Button, Alert, Linking, ScrollView, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f8f9fa' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#d90429', marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginVertical: 8, width: '100%', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  helpline: { fontSize: 16, marginBottom: 4 },
  centerBtn: { marginVertical: 6 },
  backBtn: { marginTop: 24 },
  info: { fontSize: 16, color: '#333', marginBottom: 16, textAlign: 'center' }
});

export default function EmergencyScreen() {
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleHelp = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Need help', contactConsent: false })
      });
      const data = await res.json();
      setResponse(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  };

  if (response) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Emergency Help</Text>
        <Text style={styles.subtitle}>{response.message}</Text>
        <View style={styles.card}>
          <Text style={styles.subtitle}>Helplines:</Text>
          {response.helplines && response.helplines.map((h, idx) => (
            <Text key={idx} style={styles.helpline}>{h.name}: {h.phone || h.text}</Text>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.subtitle}>Nearby Centers:</Text>
          {response.centers && response.centers.map((c, idx) => (
            <View key={idx} style={styles.centerBtn}>
              <Button title={`${c.name} (${c.distance})`} color="#118ab2" onPress={() => Linking.openURL(c.maps)} />
            </View>
          ))}
        </View>
        <View style={styles.backBtn}>
          <Button title="Back" color="#22223b" onPress={() => setResponse(null)} />
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Help</Text>
      <Text style={styles.info}>If you are feeling extremely low or in crisis, please use the emergency help options below. Your safety matters.</Text>
      <Button title={loading ? 'Contacting...' : 'Get Emergency Help'} onPress={handleHelp} disabled={loading} color="#d90429" />
    </View>
  );
}
