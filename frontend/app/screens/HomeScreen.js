import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f8f9fa' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#22223b', marginBottom: 24 },
  btn: { marginVertical: 8, width: 260 },
});

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>MindCare Dashboard</Text>
      <View style={styles.btn}><Button title="Mental Health Self-Assessment" color="#118ab2" onPress={() => navigation.navigate('SelfAssessment')} /></View>
      <View style={styles.btn}><Button title="Burnout Risk Calculator" color="#ffd166" onPress={() => navigation.navigate('Burnout')} /></View>
      <View style={styles.btn}><Button title="Stress Level Predictor" color="#06d6a0" onPress={() => navigation.navigate('Stress')} /></View>
      <View style={styles.btn}><Button title="Mindfulness & Wellness" color="#073b4c" onPress={() => navigation.navigate('Recommendations')} /></View>
      <View style={styles.btn}><Button title="Nearby Support Resources" color="#22223b" onPress={() => navigation.navigate('Resources')} /></View>
      <View style={styles.btn}><Button title="View My Test History" color="#adb5bd" onPress={() => navigation.navigate('History')} /></View>
      <View style={styles.btn}><Button title="Emergency Help" color="#d90429" onPress={() => navigation.navigate('Emergency')} /></View>
    </ScrollView>
  );
}
