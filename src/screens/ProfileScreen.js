import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import API_URL from '../services/api';
import { clearSession, clearShiftState } from '../services/session';

const ProfileScreen = ({ route, navigation }) => {
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const user = route.params?.user;
            if (!user?.employeeId) {
                console.error('No employee ID found in route params');
                setLoading(false);
                return;
            }
            const response = await axios.get(`${API_URL}/employee/${user.employeeId}`);
            setEmployee(response.data);
        } catch (error) {
            console.error('Profile Fetch Error:', error);
            Alert.alert('Error', 'Failed to load profile details.');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (label) => {
        const type = label === 'Leave Request' ? 'Leave' : 'Permission';
        navigation.navigate('RequestLeave', { user: employee || route.params?.user, type });
    };



    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'This will end your shift and log you out. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        await clearSession();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#FF007F" />
            </View>
        );
    }

    if (!employee) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>No profile found.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.header}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {employee.name.split(' ').map(n => n[0]).join('')}
                        </Text>
                    </View>
                </View>
                <Text style={styles.name}>{employee.name}</Text>
                <Text style={styles.role}>{employee.role}</Text>
                <Text style={styles.idText}>ID: {employee.employeeId}</Text>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionCard} onPress={() => handleAction('Leave Request')}>
                        <View style={[styles.iconCirc, { backgroundColor: '#fff7ed' }]}>
                            <Icon name="calendar" size={20} color="#f97316" />
                        </View>
                        <Text style={styles.actionLabel}>Request Leave</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={() => handleAction('Permission Request')}>
                        <View style={[styles.iconCirc, { backgroundColor: '#f0f9ff' }]}>
                            <Icon name="clock" size={20} color="#0ea5e9" />
                        </View>
                        <Text style={styles.actionLabel}>Permission</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('MyRequests', { user: employee || route.params?.user })}>
                        <View style={[styles.iconCirc, { backgroundColor: '#f0fdf4' }]}>
                            <Icon name="file-text" size={20} color="#22c55e" />
                        </View>
                        <Text style={styles.actionLabel}>Track Status</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('ExpenseSubmit', { user: employee || route.params?.user })}>
                        <View style={[styles.iconCirc, { backgroundColor: '#fef2f2' }]}>
                            <Icon name="credit-card" size={20} color="#ef4444" />
                        </View>
                        <Text style={styles.actionLabel}>Expense Claim</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    <InfoRow icon="mail" label="Email" value={employee.email} />
                    <InfoRow icon="phone" label="Phone" value={employee.phone || 'N/A'} />
                    <InfoRow icon="briefcase" label="Department" value={employee.department} />
                    <InfoRow icon="map-pin" label="Location" value={employee.location} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Request</Text>
                    <View style={styles.requestGrid}>
                        <RequestTile 
                            icon="dollar-sign" 
                            color="#f59e0b" 
                            label="Salary In Advance" 
                            onPress={() => navigation.navigate('PersonalRequest', { type: 'Salary In Advance', user: employee || route.params?.user })} 
                        />
                        <RequestTile 
                            icon="briefcase" 
                            color="#8b5cf6" 
                            label="Travel Advance" 
                            onPress={() => navigation.navigate('PersonalRequest', { type: 'Travel Advance', user: employee || route.params?.user })} 
                        />
                        <RequestTile 
                            icon="layers" 
                            color="#ec4899" 
                            label="Handloan" 
                            onPress={() => navigation.navigate('PersonalRequest', { type: 'Handloan', user: employee || route.params?.user })} 
                        />
                        <RequestTile 
                            icon="home" 
                            color="#10b981" 
                            label="WFH" 
                            onPress={() => navigation.navigate('PersonalRequest', { type: 'WFH', user: employee || route.params?.user })} 
                        />
                    </View>
                </View>

                {/* Sign Out Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
                    <Icon name="log-out" size={18} color="#ef4444" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
        <Icon name={icon} size={18} color="#FF007F" style={styles.infoIcon} />
        <View>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

const RequestTile = ({ icon, label, color, onPress }) => (
    <TouchableOpacity style={styles.requestTile} onPress={onPress}>
        <View style={[styles.tileIcon, { backgroundColor: `${color}15` }]}>
            <Icon name={icon} size={18} color={color} />
        </View>
        <Text style={styles.tileLabel}>{label}</Text>
        <Icon name="chevron-right" size={14} color="#cbd5e1" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: '#94a3b8', fontSize: 16 },
    header: { padding: 40, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    avatarContainer: { marginBottom: 15 },
    avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    name: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    role: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
    idText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 5, letterSpacing: 1 },
    content: { padding: 20 },
    actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 30 },
    actionCard: { width: '48%', backgroundColor: '#f8fafc', paddingVertical: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
    iconCirc: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    actionLabel: { fontSize: 11, fontWeight: 'bold', color: '#1e293b', textAlign: 'center', paddingHorizontal: 5 },
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    infoIcon: { marginRight: 15 },
    infoLabel: { fontSize: 11, color: '#94a3b8' },
    infoValue: { fontSize: 15, color: '#1e293b', fontWeight: '500' },
    infoValue: { fontSize: 15, color: '#1e293b', fontWeight: '500' },
    requestGrid: { gap: 10 },
    requestTile: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f8fafc', borderRadius: 15, marginBottom: 8, borderWidth: 1, borderColor: '#f1f5f9' },
    tileIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    tileLabel: { flex: 1, fontSize: 14, color: '#1e293b', fontWeight: '600' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 15, borderWidth: 1, borderColor: '#fecaca', backgroundColor: '#fef2f2', borderRadius: 15, marginTop: 10 },
    logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 15 }
});

export default ProfileScreen;
