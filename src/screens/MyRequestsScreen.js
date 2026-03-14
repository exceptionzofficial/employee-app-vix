import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import API_URL from '../services/api';

const { width } = Dimensions.get('window');

const MyRequestsScreen = ({ route, navigation }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const user = route.params?.user;

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            if (!user?.employeeId) {
                setLoading(false);
                return;
            }
            const response = await axios.get(`${API_URL}/leave/my-requests/${user.employeeId}`);
            setRequests(response.data || []);
        } catch (error) {
            console.error('My Requests error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchMyRequests();
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': return { color: '#22c55e', bg: '#f0fdf4', icon: 'check-circle' };
            case 'Rejected': return { color: '#ef4444', bg: '#fef2f2', icon: 'x-circle' };
            default: return { color: '#f59e0b', bg: '#fffbeb', icon: 'clock' };
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#FF007F" />
                <Text style={styles.loadingText}>Loading your requests...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>My Applications</Text>
                    <Text style={styles.headerSubtitle}>Track your leave & permissions</Text>
                </View>
            </LinearGradient>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF007F" />
                }
            >
                {requests.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name="file-text" size={60} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No requests yet.</Text>
                        <Text style={styles.emptySubText}>Your submitted leave and permission applications will appear here.</Text>
                    </View>
                ) : (
                    requests.map((req, index) => {
                        const style = getStatusStyle(req.status);
                        return (
                            <View key={index} style={styles.reqCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.typeBadge}>
                                        <Icon name={req.type === 'Leave' ? 'calendar' : 'clock'} size={14} color="#FF007F" />
                                        <Text style={styles.typeText}>{req.type === 'Leave' ? req.leaveType : 'Permission'}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
                                        <Icon name={style.icon} size={12} color={style.color} />
                                        <Text style={[styles.statusText, { color: style.color }]}>{req.status}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardContent}>
                                    <View style={styles.dateRow}>
                                        <Icon name="calendar" size={14} color="#64748b" />
                                        <Text style={styles.dateVal}>
                                            {req.startDate}{req.endDate && req.endDate !== req.startDate ? ` to ${req.endDate}` : ''}
                                        </Text>
                                    </View>
                                    {req.type === 'Permission' && (
                                        <View style={styles.dateRow}>
                                            <Icon name="clock" size={14} color="#64748b" />
                                            <Text style={styles.dateVal}>{req.duration}</Text>
                                        </View>
                                    )}
                                    <Text style={styles.reasonText}>"{req.reason}"</Text>
                                </View>

                                {req.adminComment ? (
                                    <View style={styles.adminNote}>
                                        <Text style={styles.adminNoteTitle}>Admin Remarks:</Text>
                                        <Text style={styles.adminNoteText}>{req.adminComment}</Text>
                                    </View>
                                ) : null}
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 15, color: '#64748b', fontSize: 14 },
    header: { paddingTop: 60, paddingBottom: 35, paddingHorizontal: 25, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, flexDirection: 'row', alignItems: 'center', gap: 15, elevation: 8 },
    backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
    scrollContent: { padding: 20 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#64748b', marginTop: 20 },
    emptySubText: { textAlign: 'center', color: '#94a3b8', paddingHorizontal: 40, marginTop: 10 },
    reqCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FF007F08', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    typeText: { fontSize: 12, fontWeight: '800', color: '#FF007F', textTransform: 'uppercase' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    statusText: { fontSize: 11, fontWeight: 'bold' },
    cardContent: { gap: 8 },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dateVal: { fontSize: 14, color: '#1e293b', fontWeight: '600' },
    reasonText: { fontSize: 13, color: '#64748b', fontStyle: 'italic', marginTop: 4 },
    adminNote: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    adminNoteTitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 1, marginBottom: 4 },
    adminNoteText: { fontSize: 13, color: '#1e293b', fontWeight: '500' }
});

export default MyRequestsScreen;
