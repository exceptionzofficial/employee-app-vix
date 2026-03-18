import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl, Alert, Modal, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import API_URL from '../services/api';

const { width, height } = Dimensions.get('window');

const TaskScreen = ({ navigation, route }) => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Status Update Modal State
    const [selectedTask, setSelectedTask] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [updateStatus, setUpdateStatus] = useState('');
    const [updateRemarks, setUpdateRemarks] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    
    const user = route.params?.user;

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            if (!user?.employeeId) {
                setLoading(false);
                return;
            }

            const [empRes, allRes] = await Promise.all([
                axios.get(`${API_URL}/tasks/employee/${user.employeeId}`),
                axios.get(`${API_URL}/tasks/employee/all-employees`)
            ]);

            const combined = [...(empRes.data || []), ...(allRes.data || [])];
            const sorted = combined.sort((a, b) => b.timestamp - a.timestamp);
            
            setTasks(sorted);
        } catch (error) {
            console.error('Fetch tasks error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleOpenUpdate = (task) => {
        setSelectedTask(task);
        setUpdateStatus(task.status);
        setUpdateRemarks(task.remarks || '');
        setModalVisible(true);
    };

    const handleUpdateStatus = async () => {
        if (!selectedTask) return;
        setIsUpdating(true);
        try {
            await axios.put(`${API_URL}/tasks/update-status/${selectedTask.taskId}`, {
                status: updateStatus,
                remarks: updateRemarks
            });
            Alert.alert('Success', 'Task status updated successfully');
            setModalVisible(false);
            fetchTasks();
        } catch (error) {
            console.error('Update status error:', error);
            Alert.alert('Error', 'Failed to update status');
        } finally {
            setIsUpdating(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchTasks();
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Completed': return '#22c55e';
            case 'Start': return '#3b82f6';
            default: return '#f59e0b';
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Daily Tasks</Text>
                    <Text style={styles.headerSubtitle}>Manage your assigned works</Text>
                </View>
            </LinearGradient>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF007F']} />
                }
            >
                {loading ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#FF007F" />
                        <Text style={styles.loadingText}>Loading assigned tasks...</Text>
                    </View>
                ) : tasks.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconBox}>
                            <LinearGradient colors={['#f8fafc', '#f1f5f9']} style={styles.emptyIconGrad}>
                                <Icon name="clipboard" size={50} color="#cbd5e1" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.emptyText}>No Tasks Assigned</Text>
                        <Text style={styles.emptySubText}>When your manager assigns tasks to you, they will appear here with real-time updates.</Text>
                        
                        {/* 
                        <TouchableOpacity 
                            style={styles.submitLogBtn}
                            onPress={() => navigation.navigate('TaskSubmit', { user })}
                        >
                            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.btnGrad}>
                                <Icon name="plus" size={20} color="#fff" />
                                <Text style={styles.btnText}>SUBMIT DAILY TASK LOG</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        */}
                    </View>
                ) : (
                    <View style={styles.tasksWrapper}>
                        {tasks.map((task, index) => (
                            <TouchableOpacity 
                                key={task.taskId || index} 
                                style={styles.taskCard}
                                activeOpacity={0.8}
                                onPress={() => handleOpenUpdate(task)}
                            >
                                <View style={styles.taskHeader}>
                                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(task.status) }]} />
                                    <View style={styles.taskMainInfo}>
                                        <Text style={styles.taskName}>{task.taskName}</Text>
                                        <Text style={styles.eventName}>{task.eventName || 'General Project'}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(task.status) }]}>{task.status}</Text>
                                    </View>
                                </View>

                                <View style={styles.taskBody}>
                                    <View style={styles.infoRow}>
                                        <Icon name="clock" size={14} color="#94a3b8" />
                                        <Text style={styles.infoLabel}>{task.startTime} - {task.endTime}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Icon name="map-pin" size={14} color="#94a3b8" />
                                        <Text style={styles.infoLabel}>{task.location}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Icon name="layers" size={14} color="#94a3b8" />
                                        <Text style={styles.infoLabel}>{task.category} • {task.outputType}</Text>
                                    </View>
                                </View>

                                {task.description ? (
                                    <View style={styles.descriptionBox}>
                                        <Text style={styles.descriptionText} numberOfLines={2}>
                                            {task.description}
                                        </Text>
                                    </View>
                                ) : null}

                                <View style={styles.updatePrompt}>
                                    <Text style={styles.updatePromptText}>Tap to update status</Text>
                                    <Icon name="edit-2" size={12} color="#FF007F" />
                                </View>
                            </TouchableOpacity>
                        ))}

                        {/* 
                        <TouchableOpacity 
                            style={[styles.submitLogBtn, { marginTop: 10, marginBottom: 40 }]}
                            onPress={() => navigation.navigate('TaskSubmit', { user })}
                        >
                            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.btnGrad}>
                                <Icon name="plus" size={20} color="#fff" />
                                <Text style={styles.btnText}>SUBMIT NEW WORK LOG</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        */}
                    </View>
                )}
            </ScrollView>

            {/* Status Update Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Task Status</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Icon name="x" size={24} color="#1e293b" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>{selectedTask?.taskName}</Text>

                        <Text style={styles.inputLabel}>Select Status</Text>
                        <View style={styles.statusOptions}>
                            {['Pending', 'Start', 'Completed'].map((s) => (
                                <TouchableOpacity 
                                    key={s} 
                                    style={[
                                        styles.statusOption, 
                                        updateStatus === s && { backgroundColor: getStatusColor(s) + '20', borderColor: getStatusColor(s) }
                                    ]}
                                    onPress={() => setUpdateStatus(s)}
                                >
                                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(s) }]} />
                                    <Text style={[styles.statusOptionText, updateStatus === s && { color: getStatusColor(s), fontWeight: 'bold' }]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.inputLabel}>Remarks / Updates (Optional)</Text>
                        <TextInput
                            style={styles.remarksInput}
                            multiline
                            numberOfLines={4}
                            placeholder="Add any progress notes here..."
                            value={updateRemarks}
                            onChangeText={setUpdateRemarks}
                        />

                        <TouchableOpacity 
                            style={styles.updateBtn}
                            onPress={handleUpdateStatus}
                            disabled={isUpdating}
                        >
                            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.btnGrad}>
                                {isUpdating ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Icon name="check" size={20} color="#fff" />
                                        <Text style={styles.btnText}>UPDATE STATUS</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { 
        paddingTop: 60, 
        paddingBottom: 35, 
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
    backBtn: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', letterSpacing: 0.5 },
    headerSubtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4, letterSpacing: 0.3 },
    scrollContent: { flexGrow: 1, padding: 25 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 400 },
    loadingText: { marginTop: 15, color: '#94a3b8', fontSize: 14 },
    emptyContainer: { alignItems: 'center', marginTop: 40 },
    emptyIconBox: { marginBottom: 25 },
    emptyIconGrad: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    emptyText: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
    emptySubText: { textAlign: 'center', color: '#94a3b8', fontSize: 14, lineHeight: 22, paddingHorizontal: 20 },
    submitLogBtn: { marginTop: 30, width: '100%', elevation: 4, shadowColor: '#FF007F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
    btnGrad: { padding: 18, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    btnText: { color: '#fff', fontSize: 13, fontWeight: 'bold', letterSpacing: 0.5 },
    
    tasksWrapper: { width: '100%' },
    taskCard: { 
        backgroundColor: '#fff', 
        borderRadius: 24, 
        padding: 20, 
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        elevation: 2,
        shadowColor: '#1e293b',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10
    },
    taskHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 18, gap: 12 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    taskMainInfo: { flex: 1 },
    taskName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    eventName: { fontSize: 11, color: '#FF007F', fontWeight: 'bold', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
    statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    
    taskBody: { gap: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 15 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoLabel: { fontSize: 13, color: '#64748b', fontWeight: '500' },
    
    descriptionBox: { marginTop: 15, padding: 12, backgroundColor: '#f8fafc', borderRadius: 12 },
    descriptionText: { fontSize: 12, color: '#64748b', fontStyle: 'italic', lineHeight: 18 },

    updatePrompt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    updatePromptText: { fontSize: 11, color: '#FF007F', fontWeight: 'bold', textTransform: 'uppercase' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 30, paddingBottom: 50, maxHeight: height * 0.8 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
    modalSubtitle: { fontSize: 14, color: '#FF007F', fontWeight: '800', marginBottom: 25, textTransform: 'uppercase' },
    
    inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    statusOptions: { flexDirection: 'row', gap: 10, marginBottom: 30 },
    statusOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 15, borderWidth: 1, borderColor: '#f1f5f9', backgroundColor: '#f8fafc' },
    statusOptionText: { fontSize: 12, color: '#64748b' },
    
    remarksInput: { backgroundColor: '#f8fafc', borderRadius: 20, padding: 15, textAlignVertical: 'top', color: '#1e293b', fontSize: 14, borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 30 },
    updateBtn: { elevation: 8, shadowColor: '#FF007F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 }
});

export default TaskScreen;
