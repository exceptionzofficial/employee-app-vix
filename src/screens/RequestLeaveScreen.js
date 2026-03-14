import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import API_URL from '../services/api';

const { width } = Dimensions.get('window');

const RequestLeaveScreen = ({ navigation, route }) => {
    const user = route.params?.user;
    const type = route.params?.type || 'Leave'; // 'Leave' or 'Permission'
    
    const [leaveType, setLeaveType] = useState('CL');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [duration, setDuration] = useState(type === 'Permission' ? '2 Hours' : 'Full Day');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmitting = async () => {
        if (!reason.trim()) {
            Alert.alert('Incomplete Form', 'Please provide a reason for your request.');
            return;
        }

        try {
            setIsLoading(true);
            const payload = {
                employeeId: user.employeeId,
                employeeName: user.name,
                type,
                leaveType: type === 'Leave' ? leaveType : undefined,
                startDate,
                endDate: type === 'Leave' ? endDate : startDate,
                reason,
                duration
            };

            await axios.post(`${API_URL}/leave/request`, payload);
            
            Alert.alert('Success', 'Your request has been submitted to Admin for approval.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Request submission error:', error);
            Alert.alert('Error', 'Failed to submit request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>{type} Request</Text>
                    <Text style={styles.headerSubtitle}>Submit for Admin Approval</Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    {type === 'Leave' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>LEAVE TYPE</Text>
                            <View style={styles.typeGrid}>
                                {['CL', 'SL', 'EL-PL', 'LOP', 'Half Day'].map((t) => (
                                    <TouchableOpacity 
                                        key={t}
                                        style={[styles.typeBtn, leaveType === t && styles.typeBtnActive]}
                                        onPress={() => setLeaveType(t)}
                                    >
                                        <Text style={[styles.typeText, leaveType === t && styles.typeTextActive]}>{t}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{type === 'Leave' ? 'START DATE' : 'DATE'}</Text>
                        <View style={styles.dateInput}>
                            <Icon name="calendar" size={18} color="#FF007F" />
                            <TextInput 
                                value={startDate}
                                onChangeText={setStartDate}
                                placeholder="YYYY-MM-DD"
                                style={styles.textInput}
                            />
                        </View>
                    </View>

                    {type === 'Leave' && leaveType !== 'Half Day' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>END DATE</Text>
                            <View style={styles.dateInput}>
                                <Icon name="calendar" size={18} color="#FF007F" />
                                <TextInput 
                                    value={endDate}
                                    onChangeText={setEndDate}
                                    placeholder="YYYY-MM-DD"
                                    style={styles.textInput}
                                />
                            </View>
                        </View>
                    )}

                    {type === 'Permission' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>DURATION / TIME</Text>
                            <View style={styles.dateInput}>
                                <Icon name="clock" size={18} color="#FF007F" />
                                <TextInput 
                                    value={duration}
                                    onChangeText={setDuration}
                                    placeholder="e.g. 2 Hours, 10:00 AM - 12:00 PM"
                                    style={styles.textInput}
                                />
                            </View>
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>REASON</Text>
                        <TextInput 
                            value={reason}
                            onChangeText={setReason}
                            placeholder="Briefly explain the reason..."
                            multiline
                            numberOfLines={4}
                            style={[styles.textInput, styles.textArea]}
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.submitBtn, isLoading && styles.btnDisabled]} 
                        onPress={handleSubmitting}
                        disabled={isLoading}
                    >
                        <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.btnGrad}>
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitBtnText}>SUBMIT REQUEST</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                    <Icon name="info" size={16} color="#94a3b8" />
                    <Text style={styles.infoText}>Requests are typically reviewed by your manager within 24 hours.</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingTop: 60, paddingBottom: 35, paddingHorizontal: 25, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, flexDirection: 'row', alignItems: 'center', gap: 15, elevation: 8 },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
    scrollContent: { padding: 20 },
    card: { backgroundColor: '#fff', borderRadius: 25, padding: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 11, fontWeight: '900', color: '#94a3b8', letterSpacing: 1, marginBottom: 10 },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    typeBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
    typeBtnActive: { backgroundColor: '#FF007F10', borderColor: '#FF007F' },
    typeText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
    typeTextActive: { color: '#FF007F' },
    dateInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e2e8f0' },
    textInput: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 14, color: '#1e293b' },
    textArea: { height: 100, textAlignVertical: 'top', marginLeft: 0, paddingHorizontal: 15, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    submitBtn: { marginTop: 15, borderRadius: 15, overflow: 'hidden' },
    btnGrad: { padding: 18, alignItems: 'center' },
    submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
    btnDisabled: { opacity: 0.7 },
    infoBox: { flexDirection: 'row', itemsCenter: 'center', gap: 10, marginTop: 25, paddingHorizontal: 10 },
    infoText: { flex: 1, color: '#94a3b8', fontSize: 12, lineHeight: 18 }
});

export default RequestLeaveScreen;
