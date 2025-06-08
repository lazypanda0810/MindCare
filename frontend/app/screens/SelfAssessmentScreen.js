import React, { useState } from 'react';
import { View, Text, Button, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import { auth } from '../firebase';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f8f9fa' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#073b4c', marginBottom: 16, textAlign: 'center' },
  question: { fontSize: 16, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  likertRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  likertBtn: { flex: 1, marginHorizontal: 2 },
  submitBtn: { marginTop: 16 },
  result: { fontSize: 20, fontWeight: 'bold', color: '#118ab2', marginBottom: 16, textAlign: 'center' },
});

export default function SelfAssessmentScreen() {
  const [answers, setAnswers] = useState(Array(10).fill(4));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  const questions = [
    'I feel optimistic about the future.',
    'I have little interest or pleasure in doing things.',
    'I feel energetic and motivated.',
    'I feel like I am a burden to others.',
    'I have trouble concentrating.',
    'I feel good about myself.',
    'I feel hopeless.',
    'I am able to handle daily stress.',
    'I feel like harming myself.',
    'I feel connected to people around me.'
  ];

  const handleChange = (idx, value) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('http://localhost:3000/api/self-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      setResult(data.result);
      setSubmitted(true);
      if (data.alert) {
        Alert.alert('Important', data.alert);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <Text style={styles.result}>Assessment Result: {result}</Text>
        <Button title="Back" color="#22223b" onPress={() => setSubmitted(false)} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mental Health Self-Assessment</Text>
      {questions.map((q, idx) => (
        <View key={idx}>
          <Text style={styles.question}>{q}</Text>
          <View style={styles.likertRow}>
            {[1,2,3,4,5,6,7].map(val => (
              <View key={val} style={styles.likertBtn}>
                <Button
                  title={val.toString()}
                  color={answers[idx] === val ? '#118ab2' : '#adb5bd'}
                  onPress={() => handleChange(idx, val)}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
      <View style={styles.submitBtn}>
        <Button title="Submit" color="#118ab2" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
}
