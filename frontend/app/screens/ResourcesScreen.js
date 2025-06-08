import React, { useState } from 'react';
import { View, Text, Button, Linking, ScrollView, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f8f9fa' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#118ab2', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginVertical: 8, width: '100%', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  name: { fontWeight: 'bold', fontSize: 18 },
  info: { fontSize: 16, color: '#333', marginBottom: 16, textAlign: 'center' },
  btn: { marginTop: 8 },
});

export default function ResourcesScreen() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    const res = await fetch('http://localhost:3000/api/resources');
    const data = await res.json();
    setResources(data.resources || []);
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nearby Support Resources</Text>
      <Button title={loading ? 'Loading...' : 'Show Nearby Resources'} onPress={fetchResources} disabled={loading} color="#118ab2" />
      {resources.length > 0 && (
        <View style={{ marginTop: 16, width: '100%' }}>
          {resources.map((r, idx) => (
            <View key={idx} style={styles.card}>
              <Text style={styles.name}>{r.name}</Text>
              <Text>{r.type} - {r.address}</Text>
              <Text>Distance: {r.distance}</Text>
              <View style={styles.btn}>
                <Button title="Get Directions" color="#22223b" onPress={() => Linking.openURL(r.maps)} />
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
