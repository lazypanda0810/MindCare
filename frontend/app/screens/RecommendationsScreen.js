import React, { useState } from 'react';
import { View, Text, Button, Picker, Linking, ScrollView, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f8f9fa' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#06d6a0', marginBottom: 16 },
  picker: { width: 220, marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginVertical: 8, width: '100%', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  btn: { marginTop: 8 },
  resTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
});

const types = [
  { label: 'General', value: '' },
  { label: 'Stress', value: 'stress' },
  { label: 'Burnout', value: 'burnout' },
];
const levels = [
  { label: 'Any', value: '' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export default function RecommendationsScreen() {
  const [type, setType] = useState('');
  const [level, setLevel] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    let url = 'http://localhost:3000/api/recommendations';
    const params = [];
    if (type) params.push(`type=${type}`);
    if (level) params.push(`level=${level}`);
    if (params.length) url += '?' + params.join('&');
    const res = await fetch(url);
    const data = await res.json();
    setRecommendations(data.recommendations || []);
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mindfulness & Wellness Recommendations</Text>
      <Text>Type:</Text>
      <Picker selectedValue={type} onValueChange={setType} style={styles.picker}>
        {types.map(t => <Picker.Item key={t.value} label={t.label} value={t.value} />)}
      </Picker>
      <Text>Level:</Text>
      <Picker selectedValue={level} onValueChange={setLevel} style={styles.picker}>
        {levels.map(l => <Picker.Item key={l.value} label={l.label} value={l.value} />)}
      </Picker>
      <Button title={loading ? 'Loading...' : 'Get Recommendations'} onPress={fetchRecommendations} disabled={loading} color="#06d6a0" />
      {recommendations.length > 0 && (
        <View style={{ marginTop: 16, width: '100%' }}>
          <Text style={styles.resTitle}>Resources:</Text>
          {recommendations.map((rec, idx) => (
            <View key={idx} style={styles.card}>
              <Button title={rec.title} color="#22223b" onPress={() => Linking.openURL(rec.url)} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
