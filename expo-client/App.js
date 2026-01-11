import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';

// Attempt to use expo-constants, but fall back safely if native module isn't available
let BACKEND = 'http://192.168.1.214:3000';
try {
  // Require in a try/catch so missing native modules won't crash the JS runtime
  // eslint-disable-next-line global-require
  const Constants = require('expo-constants');
  BACKEND = Constants.expoConfig?.extra?.backendUrl ?? BACKEND;
} catch (e) {
  console.warn('expo-constants not available; using fallback BACKEND', e && e.message);
}

export default function App() {
  const [email, setEmail] = useState('suheybk@gmail.com');
  const [password, setPassword] = useState('98989796A');
  const [output, setOutput] = useState('Ready');

  const onConnectivity = async () => {
    setOutput('Checking connectivity...');
    try {
      const res = await fetch(`${BACKEND}/api/auth/csrf`);
      const json = await res.text();
      setOutput(`Status: ${res.status}\nBody: ${json.substring(0, 200)}`);
    } catch (e) {
      setOutput('Connectivity error: ' + e.message);
    }
  };

  const onLogin = async (shouldSucceed = true) => {
    setOutput('Signing in...');
    const payload = {
      email,
      password: shouldSucceed ? password : 'wrongpass'
    };

    try {
      const res = await fetch(`${BACKEND}/api/auth/test-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      setOutput(`Status: ${res.status}\n${JSON.stringify(json, null, 2)}`);
    } catch (e) {
      setOutput('Login request error: ' + e.message);
    }
  };

  const onSessionCheck = async () => {
    setOutput('Checking session...');
    try {
      const res = await fetch(`${BACKEND}/api/auth/session`, { credentials: 'include' });
      const json = await res.json();
      setOutput(`Status: ${res.status}\n${JSON.stringify(json, null, 2)}`);
    } catch (e) {
      setOutput('Session request error: ' + e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Laiba Rasa — Expo Test Client (SDK 54)</Text>

        <View style={styles.field}>
          <Text>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" />
        </View>

        <View style={styles.field}>
          <Text>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <View style={styles.buttons}>
          <Button title="1) Connectivity" onPress={onConnectivity} />
          <View style={{ height: 8 }} />
          <Button title="2) Login (success)" onPress={() => onLogin(true)} />
          <View style={{ height: 8 }} />
          <Button title="3) Login (failure)" onPress={() => onLogin(false)} />
          <View style={{ height: 8 }} />
          <Button title="4) Session check" onPress={onSessionCheck} />
        </View>

        <View style={styles.outputBox}>
          <Text style={styles.outputTitle}>Output</Text>
          <Text style={styles.outputText}>{output}</Text>
        </View>

        <Text style={styles.note}>Backend URL: {BACKEND}</Text>
        <Text style={styles.note}>Make sure your phone and this machine are on the same LAN.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, alignItems: 'stretch' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  field: { marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 6, marginTop: 4 },
  buttons: { marginTop: 16 },
  outputBox: { marginTop: 20, backgroundColor: '#f7f7f7', padding: 12, borderRadius: 6 },
  outputTitle: { fontWeight: '600', marginBottom: 6 },
  outputText: { fontFamily: 'monospace' },
  note: { marginTop: 12, fontSize: 12, color: '#666' },
});