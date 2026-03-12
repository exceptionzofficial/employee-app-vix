import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import API_URL from '../services/api';

const { width } = Dimensions.get('window');

const AttendanceLogsScreen = ({ route, navigation }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const user = route.params?.user;

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            if (!user?.employeeId) {
                console.error('No employee ID found in route params');
                setLoading(false);
                return;
            }
            const response = await axios.get(`${API_URL}/attendance/logs/${user.employeeId}`);
            // Sort by timestamp descending
            const sortedLogs = (response.data || []).sort((a, b) => b.timestamp - a.timestamp);
            setLogs(sortedLogs);
        } catch (error) {
            console.error('Logs error:', error);
            Alert.alert('Error', 'Failed to fetch attendance logs');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchLogs();
    };

    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#FF007F" />
                <Text style={styles.loadingText}>Fetching your history...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Attendance History</Text>
                    <Text style={styles.headerSubtitle}>{logs.length} Total Logs Recorded</Text>
                </View>
            </LinearGradient>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF007F" />
                }
            >
                {logs.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="clipboard" size={60} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No logs found.</Text>
                        <Text style={styles.emptySubText}>Your attendance history will appear here once you start logging.</Text>
                    </View>
                ) : (
                    logs.map((log, index) => (
                        <View key={index} style={styles.logCard}>
                            <View style={styles.dateRow}>
                                <View style={styles.dateBadge}>
                                    <Text style={styles.dateText}>{formatDate(log.date)}</Text>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: log.status === 'Late' ? '#fff7ed' : '#f0fdf4' }]}>
                                    <View style={[styles.statusDot, { backgroundColor: log.status === 'Late' ? '#f97316' : '#22c55e' }]} />
                                    <Text style={[styles.statusText, { color: log.status === 'Late' ? '#c2410c' : '#15803d' }]}>
                                        {log.status || 'Verified'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.branchRow}>
                                <Icon name="map-pin" size={14} color="#FF007F" />
                                <Text style={styles.branchName}>{log.geofence || 'Main Branch'}</Text>
                            </View>

                            <View style={styles.timesContainer}>
                                <View style={styles.timeBox}>
                                    <Text style={styles.timeLabel}>CHECK-IN</Text>
                                    <View style={styles.timeValueRow}>
                                        <Icon name="log-in" size={12} color="#22c55e" />
                                        <Text style={styles.timeValue}>{log.checkInTime || 'N/A'}</Text>
                                    </View>
                                </View>

                                <View style={styles.timeDivider} />

                                <View style={styles.timeBox}>
                                    <Text style={styles.timeLabel}>CHECK-OUT</Text>
                                    <View style={styles.timeValueRow}>
                                        <Icon name="log-out" size={12} color="#f43f5e" />
                                        <Text style={[styles.timeValue, !log.checkOutTime && styles.pendingText]}>
                                            {log.checkOutTime || 'Active Shift'}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {log.faceConfidence && (
                                <View style={styles.confidenceRow}>
                                    <Icon name="shield" size={10} color="#94a3b8" />
                                    <Text style={styles.confidenceText}>
                                        Face Verified: {Number(log.faceConfidence).toFixed(1)}% match
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    loadingText: { marginTop: 15, color: '#64748b', fontSize: 14, fontWeight: '500' },
    header: { 
        paddingTop: 60, 
        paddingBottom: 30, 
        paddingHorizontal: 25, 
        borderBottomLeftRadius: 35, 
        borderBottomRightRadius: 35, 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: 15,
        elevation: 8,
        shadowColor: '#FF007F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8
    },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
    scrollContent: { padding: 20, paddingTop: 25, paddingBottom: 40 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#64748b', marginTop: 20 },
    emptySubText: { textAlign: 'center', color: '#94a3b8', paddingHorizontal: 40, marginTop: 10, lineHeight: 20 },
    logCard: { 
        backgroundColor: '#fff', 
        borderRadius: 22, 
        padding: 18, 
        marginBottom: 16, 
        elevation: 4, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    dateBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    dateText: { fontSize: 13, fontWeight: '700', color: '#475569' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontWeight: 'bold' },
    branchRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 15 },
    branchName: { fontSize: 15, color: '#1e293b', fontWeight: '600' },
    timesContainer: { 
        flexDirection: 'row', 
        backgroundColor: '#f8fafc', 
        borderRadius: 15, 
        padding: 12, 
        alignItems: 'center'
    },
    timeBox: { flex: 1, alignItems: 'center' },
    timeLabel: { fontSize: 9, fontWeight: '900', color: '#94a3b8', letterSpacing: 1, marginBottom: 5 },
    timeValueRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    timeValue: { fontSize: 13, fontWeight: 'bold', color: '#334155' },
    pendingText: { color: '#f43f5e', fontStyle: 'italic' },
    timeDivider: { width: 1, height: 20, backgroundColor: '#e2e8f0', marginHorizontal: 10 },
    confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12, alignSelf: 'flex-end' },
    confidenceText: { fontSize: 9, color: '#94a3b8', fontWeight: '500' }
});

export default AttendanceLogsScreen;
