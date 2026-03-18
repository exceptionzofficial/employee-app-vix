import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import API_URL from '../services/api';

const CATEGORIES = [
    "Petrol", "Bus", "Train", "Flight", "Taxi", "Auto", 
    "Toll & Parking", "Staff meals", "Hotel stay", 
    "Stationery", "Office materials", "Courier", 
    "Food", "Paid Campaign", "Event Expense", 
    "Inhouse Shoot", "Camera Rental"
];

const ExpenseSubmitScreen = ({ navigation, route }) => {
    const user = route.params?.user;
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [form, setForm] = useState({
        employeeId: user?.employeeId || '',
        employeeName: user?.name || '',
        amount: '',
        expenseDate: new Date().toISOString().split('T')[0],
        category: 'Petrol',
        remarks: ''
    });

    const handleSubmit = async () => {
        if (!form.amount || !form.category) {
            Alert.alert('Required', 'Please fill in the amount and category');
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${API_URL}/expenses/submit`, form);
            Alert.alert('Success', 'Expense claim submitted for approval!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Expense Submission Error:', error);
            Alert.alert('Error', 'Failed to submit expense. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Expense Management</Text>
                    <Text style={styles.headerSubtitle}>Submit your reimbursement claim</Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Amount (₹)</Text>
                        <TextInput 
                            style={styles.input}
                            value={form.amount}
                            onChangeText={(t) => setForm({...form, amount: t})}
                            placeholder="0.00"
                            placeholderTextColor="#94a3b8"
                            selectionColor="#22c55e"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Expense Date</Text>
                        <TextInput 
                            style={styles.input}
                            value={form.expenseDate}
                            onChangeText={(t) => setForm({...form, expenseDate: t})}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#94a3b8"
                            selectionColor="#22c55e"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.pickerContainer}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity 
                                    key={cat} 
                                    style={[styles.chip, form.category === cat && styles.activeChip]}
                                    onPress={() => setForm({...form, category: cat})}
                                >
                                    <Text style={[styles.chipText, form.category === cat && styles.activeChipText]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Remarks / Details</Text>
                        <TextInput 
                            style={[styles.input, styles.textArea]}
                            value={form.remarks}
                            onChangeText={(t) => setForm({...form, remarks: t})}
                            placeholder="Add brief details about the expense..."
                            placeholderTextColor="#94a3b8"
                            selectionColor="#22c55e"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    <TouchableOpacity 
                        style={styles.submitBtn} 
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.btnGrad}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>SUBMIT EXPENSE CLAIM</Text>}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoCard}>
                    <Icon name="info" size={18} color="#0ea5e9" />
                    <Text style={styles.infoText}>Claims will follow the multi-level approval process: Verified by Manager → Approved by Admin / Accounts.</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 25, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, flexDirection: 'row', alignItems: 'center', gap: 15, elevation: 8 },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
    scrollContent: { padding: 20 },
    formCard: { backgroundColor: '#fff', borderRadius: 25, padding: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 10, fontWeight: 'bold', color: '#64748b', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
    input: { backgroundColor: '#f1f5f9', borderWidth: 1.5, borderColor: '#e2e8f0', borderRadius: 12, padding: 14, fontSize: 15, color: '#0f172a', fontWeight: '500' },
    textArea: { height: 100, textAlignVertical: 'top' },
    pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
    activeChip: { backgroundColor: '#22c55e', borderColor: '#16a34a' },
    chipText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    activeChipText: { color: '#fff' },
    submitBtn: { marginTop: 10 },
    btnGrad: { padding: 18, borderRadius: 15, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
    infoCard: { flexDirection: 'row', backgroundColor: '#e0f2fe', padding: 15, borderRadius: 15, marginTop: 20, alignItems: 'center', gap: 10 },
    infoText: { flex: 1, color: '#0369a1', fontSize: 12, lineHeight: 18 }
});

export default ExpenseSubmitScreen;
