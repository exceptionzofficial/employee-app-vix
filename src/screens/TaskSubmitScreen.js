import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import API_URL from '../services/api';

const CATEGORIES = ["Poster", "Video", "Ai", "Events", "Inhouse Shoot", "Outside Shoot", "Dubbing", "Script", "Purchasing"];
const OUTPUT_TYPES = ["Landscape", "Portrait"];
const SOURCE_FILES = ["Drive", "Sourcing"];

const TaskSubmitScreen = ({ navigation, route }) => {
    const user = route.params?.user;
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [form, setForm] = useState({
        employeeId: user?.employeeId || '',
        employeeName: user?.name || '',
        department: user?.department || '',
        role: user?.role || '',
        eventName: '',
        taskName: '',
        description: '',
        location: user?.location || '',
        sourceFile: 'Drive',
        category: 'Poster',
        outputType: 'Landscape',
        startTime: '',
        endTime: '',
        status: 'Pending',
        remarks: ''
    });

    const handleSubmit = async () => {
        if (!form.taskName || !form.eventName) {
            Alert.alert('Required', 'Please fill in Project Name and Task Name');
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${API_URL}/tasks/submit`, form);
            Alert.alert('Success', 'Daily task log submitted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Task Submission Error:', error);
            Alert.alert('Error', 'Failed to submit task log. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderDropdown = (label, value, options, field) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.pickerContainer}>
                {options.map((opt) => (
                    <TouchableOpacity 
                        key={opt} 
                        style={[styles.chip, value === opt && styles.activeChip]}
                        onPress={() => setForm({...form, [field]: opt})}
                    >
                        <Text style={[styles.chipText, value === opt && styles.activeChipText]}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Daily Work Task</Text>
                    <Text style={styles.headerSubtitle}>Log your work progress</Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.formCard}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Event / Project Name</Text>
                        <TextInput 
                            style={styles.input}
                            value={form.eventName}
                            onChangeText={(t) => setForm({...form, eventName: t})}
                            placeholder="e.g. Wedding Event, Tech Expo"
                            placeholderTextColor="#94a3b8"
                            selectionColor="#FF007F"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Task Name</Text>
                        <TextInput 
                            style={styles.input}
                            value={form.taskName}
                            onChangeText={(t) => setForm({...form, taskName: t})}
                            placeholder="e.g. Poster Design, Video Editing"
                            placeholderTextColor="#94a3b8"
                            selectionColor="#FF007F"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Work Description</Text>
                        <TextInput 
                            style={[styles.input, styles.textArea]}
                            value={form.description}
                            onChangeText={(t) => setForm({...form, description: t})}
                            placeholder="Briefly describe what you did..."
                            placeholderTextColor="#94a3b8"
                            selectionColor="#FF007F"
                            multiline
                            numberOfLines={4}
                        />
                    </View>

                    {renderDropdown('Category', form.category, CATEGORIES, 'category')}
                    {renderDropdown('Source File', form.sourceFile, SOURCE_FILES, 'sourceFile')}
                    {renderDropdown('Output Type', form.outputType, OUTPUT_TYPES, 'outputType')}

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Start Time</Text>
                            <TextInput 
                                style={styles.input}
                                value={form.startTime}
                                onChangeText={(t) => setForm({...form, startTime: t})}
                                placeholder="09:00 AM"
                                placeholderTextColor="#94a3b8"
                                selectionColor="#FF007F"
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                            <Text style={styles.label}>End Time</Text>
                            <TextInput 
                                style={styles.input}
                                value={form.endTime}
                                onChangeText={(t) => setForm({...form, endTime: t})}
                                placeholder="06:00 PM"
                                placeholderTextColor="#94a3b8"
                                selectionColor="#FF007F"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Status</Text>
                        <View style={styles.pickerContainer}>
                            {['Start', 'Completed', 'Pending'].map((s) => (
                                <TouchableOpacity 
                                    key={s} 
                                    style={[styles.statusChip, form.status === s && styles.activeStatusChip]}
                                    onPress={() => setForm({...form, status: s})}
                                >
                                    <Text style={[styles.chipText, form.status === s && styles.activeChipText]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.submitBtn} 
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.btnGrad}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>SUBMIT TASK LOG</Text>}
                        </LinearGradient>
                    </TouchableOpacity>
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
    row: { flexDirection: 'row' },
    pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
    activeChip: { backgroundColor: '#FF007F10', borderColor: '#FF007F' },
    statusChip: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: '#f1f5f9' },
    activeStatusChip: { backgroundColor: '#FF007F' },
    chipText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    activeChipText: { color: '#fff' },
    submitBtn: { marginTop: 10 },
    btnGrad: { padding: 18, borderRadius: 15, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 }
});

export default TaskSubmitScreen;
