import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import API_URL from '../services/api';

const { width } = Dimensions.get('window');

const MyRequestsScreen = ({ route, navigation }) => {
    const [activeTab, setActiveTab] = useState('Leaves'); // 'Leaves' or 'Expenses'
    const [requests, setRequests] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const user = route.params?.user;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            if (!user?.employeeId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            const [leaveRes, expenseRes] = await Promise.all([
                axios.get(`${API_URL}/leave/my-requests/${user.employeeId}`),
                axios.get(`${API_URL}/expenses/my/${user.employeeId}`)
            ]);
            setRequests(leaveRes.data || []);
            setExpenses(expenseRes.data || []);
        } catch (error) {
            console.error('Fetch tracking data error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': case 'Verified': return { color: '#22c55e', bg: '#f0fdf4', icon: 'check-circle' };
            case 'Rejected': return { color: '#ef4444', bg: '#fef2f2', icon: 'x-circle' };
            case 'Submitted': return { color: '#3b82f6', bg: '#eff6ff', icon: 'send' };
            default: return { color: '#f59e0b', bg: '#fffbeb', icon: 'clock' };
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#FF007F" />
                <Text style={styles.loadingText}>Loading tracking records...</Text>
            </View>
        );
    }

    const currentList = activeTab === 'Leaves' ? requests : expenses;

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Tracking Center</Text>
                    <Text style={styles.headerSubtitle}>Monitor your requests & claims</Text>
                </View>
            </LinearGradient>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'Leaves' && styles.activeTab]} 
                    onPress={() => setActiveTab('Leaves')}
                >
                    <Text style={[styles.tabText, activeTab === 'Leaves' && styles.activeTabText]}>Leaves</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'Expenses' && styles.activeTab]} 
                    onPress={() => setActiveTab('Expenses')}
                >
                    <Text style={[styles.tabText, activeTab === 'Expenses' && styles.activeTabText]}>Expenses</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF007F" />
                }
            >
                {currentList.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Icon name={activeTab === 'Leaves' ? 'calendar' : 'credit-card'} size={60} color="#cbd5e1" />
                        <Text style={styles.emptyText}>No records found.</Text>
                        <Text style={styles.emptySubText}>Your submitted {activeTab.toLowerCase()} will appear here for tracking.</Text>
                    </View>
                ) : (
                    currentList.map((item, index) => {
                        const style = getStatusStyle(item.status);
                        const isExpense = activeTab === 'Expenses';
                        return (
                            <View key={index} style={styles.reqCard}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.typeBadge}>
                                        <Icon name={isExpense ? 'credit-card' : (item.type === 'Leave' ? 'calendar' : 'clock')} size={14} color="#FF007F" />
                                        <Text style={styles.typeText}>
                                            {isExpense ? item.category : (item.type === 'Leave' ? item.leaveType : 'Permission')}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
                                        <Icon name={style.icon} size={12} color={style.color} />
                                        <Text style={[styles.statusText, { color: style.color }]}>{item.status}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardContent}>
                                    {isExpense ? (
                                        <>
                                            <View style={styles.dateRow}>
                                                <Icon name="calendar" size={14} color="#64748b" />
                                                <Text style={styles.dateVal}>{item.expenseDate}</Text>
                                            </View>
                                            <Text style={styles.amountText}>₹{item.amount}</Text>
                                            {item.remarks ? <Text style={styles.reasonText}>"{item.remarks}"</Text> : null}
                                        </>
                                    ) : (
                                        <>
                                            <View style={styles.dateRow}>
                                                <Icon name="calendar" size={14} color="#64748b" />
                                                <Text style={styles.dateVal}>
                                                    {item.startDate}{item.endDate && item.endDate !== item.startDate ? ` to ${item.endDate}` : ''}
                                                </Text>
                                            </View>
                                            {item.type === 'Permission' && (
                                                <View style={styles.dateRow}>
                                                    <Icon name="clock" size={14} color="#64748b" />
                                                    <Text style={styles.dateVal}>{item.duration}</Text>
                                                </View>
                                            )}
                                            <Text style={styles.reasonText}>"{item.reason}"</Text>
                                        </>
                                    )}
                                </View>

                                {item.verifiedBy && (
                                    <View style={styles.adminNote}>
                                        <Text style={styles.adminNoteTitle}>Manager Verification:</Text>
                                        <Text style={styles.adminNoteText}>Verified by {item.verifiedBy}</Text>
                                    </View>
                                )}
                                
                                {item.adminComment || item.approvedBy ? (
                                    <View style={styles.adminNote}>
                                        <Text style={styles.adminNoteTitle}>Admin Feedback:</Text>
                                        <Text style={styles.adminNoteText}>
                                            {item.adminComment || (item.approvedBy ? `Approved by ${item.approvedBy}` : '')}
                                        </Text>
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
    tabContainer: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 20, marginTop: -25, borderRadius: 15, elevation: 4, padding: 5 },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
    activeTab: { backgroundColor: '#FF007F10' },
    tabText: { fontSize: 13, color: '#94a3b8', fontWeight: 'bold' },
    activeTabText: { color: '#FF007F' },
    scrollContent: { padding: 20, paddingTop: 10 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#64748b', marginTop: 20 },
    emptySubText: { textAlign: 'center', color: '#94a3b8', paddingHorizontal: 40, marginTop: 10 },
    reqCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FF007F08', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    typeText: { fontSize: 11, fontWeight: '900', color: '#FF007F', textTransform: 'uppercase' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    cardContent: { gap: 8 },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dateVal: { fontSize: 14, color: '#1e293b', fontWeight: '600' },
    amountText: { fontSize: 18, fontWeight: 'bold', color: '#FF007F', marginTop: 5 },
    reasonText: { fontSize: 13, color: '#64748b', fontStyle: 'italic', marginTop: 4 },
    adminNote: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    adminNoteTitle: { fontSize: 9, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' },
    adminNoteText: { fontSize: 12, color: '#1e293b', fontWeight: '500' }
});

export default MyRequestsScreen;
