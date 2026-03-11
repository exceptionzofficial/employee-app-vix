import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const TaskScreen = () => {
    const tasks = [
        { id: 1, title: 'Morning Setup', status: 'Completed', time: '09:00 AM' },
        { id: 2, title: 'Inventory Check', status: 'Pending', time: '02:00 PM' },
        { id: 3, title: 'Final Report', status: 'Scheduled', time: '06:00 PM' },
    ];

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Daily Tasks</Text>
            {tasks.map(task => (
                <View key={task.id} style={styles.taskCard}>
                    <View style={styles.iconBox}>
                        <Icon name={task.status === 'Completed' ? 'check-circle' : 'circle'} size={24} color={task.status === 'Completed' ? '#22c55e' : '#FF007F'} />
                    </View>
                    <View style={styles.taskInfo}>
                        <Text style={styles.taskTitle}>{task.title}</Text>
                        <Text style={styles.taskTime}>{task.time}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: task.status === 'Completed' ? '#ecfdf5' : '#fff5f7' }]}>
                        <Text style={[styles.badgeText, { color: task.status === 'Completed' ? '#059669' : '#e11d48' }]}>{task.status}</Text>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 20 },
    taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 15, marginBottom: 12, elevation: 2 },
    iconBox: { marginRight: 15 },
    taskInfo: { flex: 1 },
    taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
    taskTime: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    badgeText: { fontSize: 11, fontWeight: 'bold' }
});

export default TaskScreen;
