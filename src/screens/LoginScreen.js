import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import API_URL from '../services/api';
import { saveSession } from '../services/session';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
    const [employeeId, setEmployeeId] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!employeeId || !pin) {
            Alert.alert('Required', 'Please enter both Employee ID and PIN');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/employee/login`, {
                employeeId,
                pin
            });

            const { employee } = response.data;

            // Save session for persistent login
            await saveSession(employee);

            // Navigate to Home or passing the registration status
            navigation.replace('MainTabs', {
                user: employee,
                initialAction: employee.isFaceRegistered ? 'signin' : 'register'
            });

        } catch (error) {
            console.error('Login Error:', error);
            const msg = error.response?.data?.error || 'Failed to connect to server';
            Alert.alert('Login Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.topSection}>
                <Image
                    source={require('../assets/crayonz.jpg')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.bottomSection}>
                <Text style={styles.welcomeText}>Employee Login</Text>
                <Text style={styles.loginHint}>Access your attendance portal</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Employee ID"
                        placeholderTextColor="#94a3b8"
                        value={employeeId}
                        onChangeText={setEmployeeId}
                        autoCapitalize="characters"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="4-Digit PIN"
                        placeholderTextColor="#94a3b8"
                        value={pin}
                        onChangeText={setPin}
                        secureTextEntry
                        keyboardType="number-pad"
                        maxLength={4}
                    />
                </View>

                <TouchableOpacity
                    style={styles.loginBtnContainer}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={['#FF8C00', '#FF007F']}
                        style={styles.loginBtn}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginBtnText}>VERIFY ID</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.footerText}>Secure biometric & PIN identification</Text>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    topSection: { flex: 1.2, justifyContent: 'center', alignItems: 'center' },
    logo: { width: width * 0.8, height: width * 0.4 },
    bottomSection: {
        flex: 2,
        backgroundColor: '#f8fafc',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 30,
        paddingTop: 40,
        elevation: 20,
    },
    welcomeText: { fontSize: 28, fontWeight: '900', color: '#1e293b', textAlign: 'center' },
    loginHint: { fontSize: 16, color: '#64748b', textAlign: 'center', marginTop: 5, marginBottom: 40 },
    inputContainer: { gap: 15, marginBottom: 30 },
    input: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        color: '#1e293b',
    },
    loginBtn: { paddingVertical: 16, borderRadius: 15, alignItems: 'center' },
    loginBtnText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
    footerText: { textAlign: 'center', color: '#94a3b8', fontSize: 12, marginTop: 40 }
});

export default LoginScreen;
