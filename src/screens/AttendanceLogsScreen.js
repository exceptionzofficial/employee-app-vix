import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Feather';
import API_URL from '../services/api';

const AttendanceLogsScreen = ({ route }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const user = route.params?.user;
            if (!user?.employeeId) {
                console.error('No employee ID found in route params');
                setLoading(false);
                return;
            }
            const response = await axios.get(`${API_URL}/admin/attendance-logs`);
            // Filter logs for this employee
            const userLogs = response.data.filter(log => log.employeeId === user.employeeId);
            setLogs(userLogs);
        } catch (error) {
            console.error('Logs error:', error);
            Alert.alert('Error', 'Failed to fetch attendance logs');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#FF007F" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Attendance History</Text>
            {logs.length === 0 ? (
                <Text style={styles.empty}>No logs found.</Text>
            ) : (
                logs.map((log, index) => (
                    <View key={index} style={styles.logCard}>
                        <View style={styles.logHeader}>
                            <Text style={styles.date}>{new Date(log.timestamp).toLocaleDateString()}</Text>
                            <Text style={styles.time}>{log.time}</Text>
                        </View>
                        <View style={styles.logDetails}>
                            <View style={styles.detailItem}>
                                <Icon name="map-pin" size={14} color="#94a3b8" />
                                <Text style={styles.location}>{typeof log.location === 'object' ? 'GPS Verified' : log.location}</Text>
                            </View>
                            <Text style={[styles.status, { color: log.status === 'On-Time' ? '#22c55e' : '#f59e0b' }]}>
                                {log.status}
                            </Text>
                        </View>
                    </View>
                ))
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 20 },
    empty: { textAlign: 'center', marginTop: 50, color: '#94a3b8' },
    logCard: { backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 12, elevation: 2 },
    logHeader: { flexDirection: 'row', justifyContent: 'between', marginBottom: 10 },
    date: { fontWeight: 'bold', color: '#1e293b' },
    time: { color: '#64748b' },
    logDetails: { flexDirection: 'row', justifyContent: 'between', alignItems: 'center' },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    location: { fontSize: 12, color: '#94a3b8' },
    status: { fontSize: 12, fontWeight: 'bold' }
});

export default AttendanceLogsScreen;
