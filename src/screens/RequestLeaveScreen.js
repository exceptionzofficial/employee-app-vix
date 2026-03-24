import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Dimensions, Modal, Pressable } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import API_URL from '../services/api';

const { width, height } = Dimensions.get('window');

const HOLIDAYS = [
    { date: '01 Jan', day: 'Thu', name: 'New Year’s Day' },
    { date: '15 Jan', day: 'Thu', name: 'Pongal' },
    { date: '21 Mar', day: 'Sat', name: 'Ramzan (Idu’l Fitr)' },
    { date: '28 May', day: 'Thu', name: 'Bakrid (Id-ul-Zuha)' },
    { date: '26 Jun', day: 'Fri', name: 'Muharram' },
    { date: '15 Aug', day: 'Sat', name: 'Independence Day' },
    { date: '14 Sep', day: 'Mon', name: 'Ganesh Chaturthi' },
    { date: '02 Oct', day: 'Fri', name: 'Gandhi Jayanti' },
    { date: '19 Oct', day: 'Mon', name: 'Ayutha Pooja / Saraswathi Pooja' },
    { date: '20 Oct', day: 'Tue', name: 'Vijayadasami' },
    { date: '08 Nov', day: 'Sun', name: 'Diwali' },
    { date: '25 Dec', day: 'Fri', name: 'Christmas' },
];

const RequestLeaveScreen = ({ navigation, route }) => {
    const user = route.params?.user;
    const type = route.params?.type || 'Leave'; // 'Leave' or 'Permission'
    
    const [myRequests, setMyRequests] = useState([]);
    const [leaveType, setLeaveType] = useState('CL');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [duration, setDuration] = useState('1 Hour');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [leaveBalances, setLeaveBalances] = useState({ CL: 4, SL: 4, 'EL-PL': 4, LOP: 99 });
    const [showCalendar, setShowCalendar] = useState(false);
    const [viewType, setViewType] = useState('Calendar'); // 'List' or 'Calendar'
    const [currentCalDate, setCurrentCalDate] = useState(new Date());

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setIsFetchingData(true);
            const requestsRes = await axios.get(`${API_URL}/leave/my-requests/${user.employeeId}`);
            setMyRequests(requestsRes.data);
            
            const balancesRes = await axios.get(`${API_URL}/leave/balances/${user.employeeId}`);
            setLeaveBalances(balancesRes.data);
            
            // Set default leave type to first available one
            const availableTypes = ['CL', 'SL', 'EL-PL', 'LOP', 'Half Day'].filter(t => isTypeAvailable(t, requestsRes.data, balancesRes.data));
            if (availableTypes.length > 0 && !availableTypes.includes('CL')) {
                setLeaveType(availableTypes[0]);
            }
        } catch (error) {
            console.error('Error fetching leave data:', error);
        } finally {
            setIsFetchingData(false);
        }
    };

    const isTypeAvailable = (t, requests, balances = leaveBalances) => {
        // LOP and Half Day are always available
        if (t === 'LOP' || t === 'Half Day') return true;

        // Check if balance is available
        if (balances[t] <= 0) {
            return false;
        }

        return true;
    };

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
                endDate: type === 'Leave' ? (leaveType === 'Half Day' ? startDate : endDate) : startDate,
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

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendarGrid = () => {
        const year = currentCalDate.getFullYear();
        const month = currentCalDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < firstDay; i++) {
            days.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
        }

        // Actual days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${d < 10 ? '0' + d : d} ${currentCalDate.toLocaleString('en-US', { month: 'short' })}`;
            const isHoliday = HOLIDAYS.some(h => {
                // Match "DD MMM" e.g. "01 Jan"
                const [hDay, hMonth] = h.date.split(' ');
                return parseInt(hDay) === d && hMonth === currentCalDate.toLocaleString('en-US', { month: 'short' });
            });

            days.push(
                <View key={d} style={[styles.calendarDay, isHoliday && styles.calendarDayHoliday]}>
                    <Text style={[styles.calendarDayText, isHoliday && styles.calendarDayHolidayText]}>{d}</Text>
                    {isHoliday && <View style={styles.holidayDot} />}
                </View>
            );
        }

        return <View style={styles.calendarGrid}>{days}</View>;
    };

    if (isFetchingData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#FF007F" />
                <Text style={{ marginTop: 10, color: '#94a3b8' }}>Loading request data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>{type} Request</Text>
                    <Text style={styles.headerSubtitle}>Submit for Admin Approval</Text>
                </View>
                <TouchableOpacity onPress={() => setShowCalendar(true)} style={styles.calendarTrigger}>
                    <Icon name="calendar" size={16} color="#fff" />
                    <Text style={styles.calendarTriggerText}>Holidays</Text>
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    {type === 'Leave' && (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>LEAVE TYPE</Text>
                            <View style={styles.typeGrid}>
                                {['CL', 'SL', 'EL-PL', 'LOP', 'Half Day'].map((t) => {
                                    const available = isTypeAvailable(t, myRequests);
                                    if (!available) return null;

                                    let balance = leaveBalances[t] !== undefined ? leaveBalances[t] : (t === 'Half Day' ? '' : 0);
                                    
                                    const balanceText = (t === 'LOP' || t === 'Half Day') ? '' : `${balance} Days`;

                                    return (
                                        <TouchableOpacity 
                                            key={t}
                                            style={[styles.typeBtn, leaveType === t && styles.typeBtnActive]}
                                            onPress={() => setLeaveType(t)}
                                        >
                                            <Text style={[styles.typeText, leaveType === t && styles.typeTextActive]}>{t}</Text>
                                            {balanceText !== '' && (
                                                <Text style={[styles.balanceText, leaveType === t && styles.balanceTextActive]}>{balanceText}</Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
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
                            <Text style={styles.label}>DURATION</Text>
                            <View style={styles.typeGrid}>
                                {['1 Hour', '2 Hours', '3 Hours', '4 Hours'].map((d) => (
                                    <TouchableOpacity 
                                        key={d} 
                                        onPress={() => setDuration(d)}
                                        style={[styles.typeBtn, duration === d && styles.typeBtnActive]}
                                    >
                                        <Text style={[styles.typeText, duration === d && styles.typeTextActive]}>{d}</Text>
                                    </TouchableOpacity>
                                ))}
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

            <Modal
                visible={showCalendar}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCalendar(false)}
            >
                <View style={styles.modalOverlay}>
                    {/* Absolutely positioned dismiss layer - sits BEHIND modal content */}
                    <TouchableOpacity 
                        style={StyleSheet.absoluteFill} 
                        activeOpacity={1} 
                        onPress={() => setShowCalendar(false)} 
                    />
                    
                    {/* Modal content - sits ON TOP, not nested inside any touchable */}
                    <View style={styles.calendarModal}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Leave Calendar {currentCalDate.getFullYear()}</Text>
                                {viewType === 'Calendar' && (
                                    <Text style={styles.modalSubtitle}>{currentCalDate.toLocaleString('en-US', { month: 'long' })}</Text>
                                )}
                            </View>
                            <View style={styles.modalActions}>
                                <TouchableOpacity 
                                    style={styles.viewToggle} 
                                    onPress={() => setViewType(viewType === 'Calendar' ? 'List' : 'Calendar')}
                                >
                                    <Icon name={viewType === 'Calendar' ? 'list' : 'calendar'} size={14} color="#FF007F" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setShowCalendar(false)} style={styles.closeBtn}>
                                    <Icon name="x" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {viewType === 'List' ? (
                            <ScrollView 
                                style={styles.holidayList} 
                                showsVerticalScrollIndicator={false}
                                nestedScrollEnabled={true}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            >
                                {HOLIDAYS.map((h, i) => (
                                    <View key={i} style={[styles.holidayItem, i === HOLIDAYS.length - 1 && { borderBottomWidth: 0 }]}>
                                        <View style={styles.holidayDateBox}>
                                            <Text style={styles.holidayDate}>{h.date}</Text>
                                            <Text style={styles.holidayDay}>{h.day}</Text>
                                        </View>
                                        <Text style={styles.holidayName}>{h.name}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        ) : (
                            <View style={styles.calendarViewContainer}>
                                <View style={styles.monthNav}>
                                    <TouchableOpacity onPress={() => setCurrentCalDate(new Date(currentCalDate.setMonth(currentCalDate.getMonth() - 1)))} style={styles.navBtn}>
                                        <Icon name="chevron-left" size={20} color="#FF007F" />
                                    </TouchableOpacity>
                                    <Text style={styles.currentMonthLabel}>{currentCalDate.toLocaleString('en-US', { month: 'long' })}</Text>
                                    <TouchableOpacity onPress={() => setCurrentCalDate(new Date(currentCalDate.setMonth(currentCalDate.getMonth() + 1)))} style={styles.navBtn}>
                                        <Icon name="chevron-right" size={20} color="#FF007F" />
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.weekDays}>
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                        <Text key={i} style={styles.weekDay}>{d}</Text>
                                    ))}
                                </View>
                                {renderCalendarGrid()}
                                <View style={styles.calLegend}>
                                    <View style={styles.legendItem}>
                                        <View style={[styles.holidayDot, { marginRight: 8 }]} />
                                        <Text style={styles.legendText}>Public Holiday</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
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
    typeTextActive: { color: '#1e293b' },
    balanceText: { fontSize: 9, fontWeight: '600', color: '#94a3b8', marginTop: 2 },
    balanceTextActive: { color: '#64748b' },
    dateInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 15, borderWidth: 1, borderColor: '#e2e8f0' },
    textInput: { flex: 1, paddingVertical: 12, marginLeft: 10, fontSize: 14, color: '#1e293b' },
    textArea: { height: 100, textAlignVertical: 'top', marginLeft: 0, paddingHorizontal: 15, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    submitBtn: { marginTop: 15, borderRadius: 15, overflow: 'hidden' },
    btnGrad: { padding: 18, alignItems: 'center' },
    submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15, letterSpacing: 1 },
    btnDisabled: { opacity: 0.7 },
    infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 25, paddingHorizontal: 10 },
    infoText: { flex: 1, color: '#94a3b8', fontSize: 12, lineHeight: 18 },
    calendarTrigger: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    calendarTriggerText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    calendarModal: { width: '90%', backgroundColor: '#fff', borderRadius: 25, padding: 25, maxHeight: height * 0.8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 15 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
    modalSubtitle: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
    modalActions: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    viewToggle: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FF007F10', justifyContent: 'center', alignItems: 'center' },
    closeBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center' },
    holidayList: { marginTop: 5, maxHeight: height * 0.5 },
    holidayItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 15 },
    holidayDateBox: { width: 55, alignItems: 'center', paddingVertical: 6, borderRadius: 12, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
    holidayDate: { fontSize: 13, fontWeight: 'bold', color: '#FF007F' },
    holidayDay: { fontSize: 9, fontWeight: '600', color: '#94a3b8', marginTop: 1 },
    holidayName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#475569' },
    calendarViewContainer: { marginTop: 5 },
    monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: '#f8fafc', padding: 5, borderRadius: 15 },
    navBtn: { padding: 8 },
    currentMonthLabel: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
    weekDays: { flexDirection: 'row', marginBottom: 10 },
    weekDay: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: 'bold', color: '#94a3b8' },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    calendarDay: { width: `${100/7}%`, height: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
    calendarDayEmpty: { width: `${100/7}%`, height: 45 },
    calendarDayText: { fontSize: 14, color: '#475569', fontWeight: '500' },
    calendarDayHoliday: { backgroundColor: '#FF007F10', borderRadius: 10 },
    calendarDayHolidayText: { color: '#FF007F', fontWeight: 'bold' },
    holidayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FF007F', marginTop: 2 },
    calLegend: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendText: { fontSize: 11, color: '#94a3b8', fontWeight: '600' }
});

export default RequestLeaveScreen;
