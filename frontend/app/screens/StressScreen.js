import React, { useState } from 'react';
import { View, Text, Button, TextInput, Linking, Alert, ScrollView } from 'react-native';
import { auth } from '../firebase';

export default function StressScreen() {
  const [sleep, setSleep] = useState('');
  const [screen, setScreen] = useState('');
  const [food, setFood] = useState('4');
  const [exercise, setExercise] = useState('3');
  const [mood, setMood] = useState('4');
  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const isSignedIn = !!auth.currentUser;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        sleep: Number(sleep),
        screen: Number(screen),
        food: Number(food),
        exercise: Number(exercise),
        mood: Number(mood),
        isGuest: !isSignedIn,
      };
      const headers = { 'Content-Type': 'application/json' };
      if (isSignedIn) {
        const token = await auth.currentUser.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('http://localhost:3000/api/stress', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult(isSignedIn ? `${data.result}% (${data.category})` : data.result);
      setRecommendations(data.recommendations || []);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  };

  if (result !== null) {
    return (
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        <Text style={{ fontSize: 20, marginBottom: 8 }}>Stress Level: {result}</Text>
        <Text style={{ fontSize: 18, marginVertical: 8 }}>Helpful Resources:</Text>
        {recommendations.map((rec, idx) => (
          <Button key={idx} title={rec.title} onPress={() => Linking.openURL(rec.url)} />
        ))}
        <Button title="Back" onPress={() => { setResult(null); setRecommendations([]); }} />
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>Stress Level Predictor</Text>
      <Text>Sleep Hours per Night:</Text>
      <TextInput keyboardType="numeric" value={sleep} onChangeText={setSleep} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <Text>Screen Time per Day (hours):</Text>
      <TextInput keyboardType="numeric" value={screen} onChangeText={setScreen} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <Text>Food Habits (1=Poor, 7=Excellent):</Text>
      <TextInput keyboardType="numeric" value={food} onChangeText={setFood} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <Text>Exercise Frequency (per week):</Text>
      <TextInput keyboardType="numeric" value={exercise} onChangeText={setExercise} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <Text>Self-Rated Mood (1-7):</Text>
      <TextInput keyboardType="numeric" value={mood} onChangeText={setMood} style={{ borderWidth: 1, marginBottom: 8, padding: 8 }} />
      <Button title={loading ? 'Predicting...' : 'Predict Stress Level'} onPress={handleSubmit} disabled={loading} />
    </View>
  );
}
