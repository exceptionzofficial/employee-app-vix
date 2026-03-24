import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import API_URL from '../services/api';

const PersonalRequestScreen = ({ navigation, route }) => {
    const { type, user } = route.params;
    const [loading, setLoading] = useState(false);
    
    const [form, setForm] = useState({
        employeeId: user?.employeeId || '',
        employeeName: user?.name || '',
        type: type,
        amount: '',
        reason: '',
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async () => {
        if (!form.reason) {
            Alert.alert('Required', 'Please provide a reason for your request.');
            return;
        }

        if (isFinancial && !form.amount) {
            Alert.alert('Required', 'Please specify the amount.');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(`${API_URL}/personal-requests/submit`, form);
            Alert.alert('Success', 'Your request has been submitted successfully.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Request Submission Error:', error);
            const msg = error.response?.data?.error || 'Failed to submit request. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const isFinancial = (type.includes('Advance') || type === 'Handloan') && type !== 'Salary In Advance';

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{type}</Text>
                    <Text style={styles.headerSubtitle}>Request Submission</Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formCard}>
                    <View style={styles.infoBox}>
                        <Icon name="info" size={16} color="#3b82f6" />
                        <Text style={styles.infoText}>
                            {type === 'Salary In Advance' 
                                ? 'Note: Salary advance is limited to 2 times per calendar year.' 
                                : `Submit your ${type.toLowerCase()} request for approval.`}
                        </Text>
                    </View>

                    {isFinancial && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Requested Amount (₹)</Text>
                            <TextInput 
                                style={styles.input}
                                value={form.amount}
                                onChangeText={(t) => setForm({...form, amount: t})}
                                placeholder="Enter amount"
                                keyboardType="numeric"
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date</Text>
                        <TextInput 
                            style={[styles.input, { backgroundColor: '#f8fafc', color: '#64748b' }]}
                            value={form.date}
                            editable={false}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Reason / Remarks</Text>
                        <TextInput 
                            style={[styles.input, styles.textArea]}
                            value={form.reason}
                            onChangeText={(t) => setForm({...form, reason: t})}
                            placeholder="Please explain why you need this request..."
                            multiline
                            numberOfLines={4}
                            placeholderTextColor="#94a3b8"
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.submitBtn} 
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.btnGrad}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>SUBMIT REQUEST</Text>}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 25, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, flexDirection: 'row', alignItems: 'center', gap: 15 },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
    scrollContent: { padding: 20 },
    formCard: { backgroundColor: '#fff', borderRadius: 25, padding: 20, elevation: 3 },
    infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#eff6ff', padding: 15, borderRadius: 15, marginBottom: 25 },
    infoText: { flex: 1, fontSize: 12, color: '#1e40af', lineHeight: 18 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 10, fontWeight: 'bold', color: '#64748b', mb: 8, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
    input: { backgroundColor: '#f1f5f9', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a' },
    textArea: { height: 100, textAlignVertical: 'top' },
    submitBtn: { marginTop: 10 },
    btnGrad: { padding: 18, borderRadius: 15, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 }
});

export default PersonalRequestScreen;
