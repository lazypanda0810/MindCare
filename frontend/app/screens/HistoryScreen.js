import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { auth } from '../firebase';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f8f9fa' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#073b4c', marginBottom: 16, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginVertical: 8, width: '100%', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  label: { fontWeight: 'bold', fontSize: 16 },
  value: { fontSize: 16, marginBottom: 4 },
  empty: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 32 },
});

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch('http://localhost:3000/api/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setHistory(data.history || []);
      } catch (e) {
        setHistory([]);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  if (loading) return <ActivityIndicator size="large" color="#118ab2" style={{ marginTop: 40 }} />;
  if (!history.length) return <Text style={styles.empty}>No test history found.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>My Test History</Text>
      {history.map((item, idx) => (
        <View key={item.id || idx} style={styles.card}>
          <Text style={styles.label}>Type: <Text style={styles.value}>{item.type}</Text></Text>
          <Text style={styles.label}>Result: <Text style={styles.value}>{item.result || item.category || item.percent}</Text></Text>
          <Text style={styles.label}>Date: <Text style={styles.value}>{item.timestamp && item.timestamp.toDate ? item.timestamp.toDate().toLocaleString() : String(item.timestamp)}</Text></Text>
        </View>
      ))}
    </ScrollView>
  );
}
