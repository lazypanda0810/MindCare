import React, { useState } from 'react';
import { View, Text, Button, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import { auth } from '../firebase';

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f8f9fa' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#22223b', marginBottom: 16 },
  input: { width: 250, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, margin: 8, padding: 8, backgroundColor: '#fff' },
  btn: { marginTop: 8, width: 250 },
});

export default function AuthScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await auth.signInWithEmailAndPassword(email, password);
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Login Error', err.message);
    }
  };

  const handleSignUp = async () => {
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Signup Error', err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign In / Register</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} autoCapitalize="none" keyboardType="email-address" />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <View style={styles.btn}><Button title="Sign In" color="#118ab2" onPress={handleSignIn} /></View>
      <View style={styles.btn}><Button title="Sign Up" color="#06d6a0" onPress={handleSignUp} /></View>
    </ScrollView>
  );
}
