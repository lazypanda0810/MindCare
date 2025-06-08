import React, { useState } from 'react';
import { View, Text, Button, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import { auth } from '../firebase';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f8f9fa' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ffd166', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, marginBottom: 8, backgroundColor: '#fff' },
  btn: { marginTop: 12 },
  result: { fontSize: 20, fontWeight: 'bold', color: '#073b4c', marginBottom: 16, textAlign: 'center' },
});

export default function BurnoutScreen() {
  const [workHours, setWorkHours] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [motivation, setMotivation] = useState('4');
  const [exhaustion, setExhaustion] = useState('4');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const isSignedIn = !!auth.currentUser;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        workHours: Number(workHours),
        sleepHours: Number(sleepHours),
        motivation: Number(motivation),
        exhaustion: Number(exhaustion),
        isGuest: !isSignedIn,
      };
      const headers = { 'Content-Type': 'application/json' };
      if (isSignedIn) {
        const token = await auth.currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('http://localhost:3000/api/burnout', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(data.result);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  };

  if (result !== null) {
    return (
      <View style={styles.container}>
        <Text style={styles.result}>
          {isSignedIn ? `Burnout Risk: ${result}%` : `Burnout Risk: ${result}`}
        </Text>
        <Button title="Back" color="#22223b" onPress={() => setResult(null)} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Burnout Risk Calculator</Text>
      <Text style={styles.label}>Work/Study Hours per Day:</Text>
      <TextInput keyboardType="numeric" value={workHours} onChangeText={setWorkHours} style={styles.input} />
      <Text style={styles.label}>Sleep Hours per Night:</Text>
      <TextInput keyboardType="numeric" value={sleepHours} onChangeText={setSleepHours} style={styles.input} />
      <Text style={styles.label}>Motivation Level (1-7):</Text>
      <TextInput keyboardType="numeric" value={motivation} onChangeText={setMotivation} style={styles.input} />
      <Text style={styles.label}>Exhaustion Level (1-7):</Text>
      <TextInput keyboardType="numeric" value={exhaustion} onChangeText={setExhaustion} style={styles.input} />
      <View style={styles.btn}>
        <Button title={loading ? 'Calculating...' : 'Calculate Burnout Risk'} onPress={handleSubmit} disabled={loading} color="#ffd166" />
      </View>
    </ScrollView>
  );
}
