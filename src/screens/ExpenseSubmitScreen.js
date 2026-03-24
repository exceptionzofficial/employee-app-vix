import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, Modal } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import API_URL from '../services/api';

const CATEGORIES = [
    "Petrol", "Bus", "Train", "Flight", "Taxi", "Auto", 
    "Toll & Parking", "Staff meals", "Hotel stay", 
    "Stationery", "Office materials", "Courier", 
    "Food", "Paid Campaign", "Event Expense", 
    "Inhouse Shoot", "Camera Rental", "Custom / Others"
];

const ExpenseSubmitScreen = ({ navigation, route }) => {
    const user = route.params?.user;
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    
    // Line Item State
    const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('Petrol');
    const [amount, setAmount] = useState('');
    const [remarks, setRemarks] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    
    // Collection of items
    const [items, setItems] = useState([]);

    const addItem = () => {
        if (!amount || isNaN(amount)) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        const finalCategory = category === 'Custom / Others' ? customCategory : category;
        if (!finalCategory) {
            Alert.alert('Category Required', 'Please specify the custom category name');
            return;
        }
        
        const newItem = {
            id: Date.now(),
            category: finalCategory,
            amount: parseFloat(amount),
            remarks: remarks || ''
        };
        
        setItems([...items, newItem]);
        setAmount('');
        setRemarks('');
        setCustomCategory('');
        setCategory('Petrol'); // Reset to default for next item
    };

    const removeItem = (id) => {
        setItems(items.filter(i => i.id !== id));
    };

    const handleSubmit = async () => {
        if (items.length === 0) {
            Alert.alert('Empty Claim', 'Please add at least one expense item.');
            return;
        }
        setShowPreview(true);
    };

    const confirmSubmit = async () => {
        try {
            setLoading(true);
            const payload = {
                employeeId: user?.employeeId,
                employeeName: user?.name,
                expenseDate,
                items: items // [{ category, amount, remarks }]
            };

            await axios.post(`${API_URL}/expenses/submit-multiple`, payload);
            setShowPreview(false);
            Alert.alert('Success', 'Multiple expense claims submitted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error) {
            console.error('Expense Submission Error:', error);
            Alert.alert('Error', 'Failed to submit expenses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Expense Management</Text>
                    <Text style={styles.headerSubtitle}>Multi-item submission</Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.formCard, { marginBottom: 15 }]}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Submission Date</Text>
                        <TextInput 
                            style={styles.input}
                            value={expenseDate}
                            onChangeText={setExpenseDate}
                            placeholder="YYYY-MM-DD"
                            placeholderTextColor="#94a3b8"
                        />
                    </View>
                </View>

                {/* List of Added Items */}
                {items.length > 0 && (
                    <View style={[styles.formCard, { marginBottom: 15, padding: 15 }]}>
                        <Text style={[styles.label, { marginBottom: 10 }]}>Current Items ({items.length})</Text>
                        {items.map((item) => (
                            <View key={item.id} style={styles.itemRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemCategory}>{item.category}</Text>
                                    <Text style={styles.itemRemarks} numberOfLines={1}>{item.remarks || 'No remarks'}</Text>
                                </View>
                                <Text style={styles.itemPrice}>₹{item.amount}</Text>
                                <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeBtn}>
                                    <Icon name="x" size={16} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalText}>TOTAL AMOUNT</Text>
                            <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
                        </View>
                    </View>
                )}

                <View style={styles.formCard}>
                    <Text style={[styles.label, { color: '#FF007F' }]}>ADD NEW EXPENSE ITEM</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.pickerContainer}>
                            {CATEGORIES.map((cat) => (
                                <TouchableOpacity 
                                    key={cat} 
                                    style={[styles.chip, category === cat && styles.activeChip]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text style={[styles.chipText, category === cat && styles.activeChipText]}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {category === 'Custom / Others' && (
                        <View style={[styles.inputGroup, { marginTop: -10 }]}>
                            <Text style={styles.label}>Specify Custom Category</Text>
                            <TextInput 
                                style={styles.input}
                                value={customCategory}
                                onChangeText={setCustomCategory}
                                placeholder="Enter category name..."
                                placeholderTextColor="#94a3b8"
                            />
                        </View>
                    )}

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Amount (₹)</Text>
                        <TextInput 
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.00"
                            placeholderTextColor="#94a3b8"
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Remarks</Text>
                        <TextInput 
                            style={[styles.input, { height: 60 }]}
                            value={remarks}
                            onChangeText={setRemarks}
                            placeholder="Details..."
                            placeholderTextColor="#94a3b8"
                            multiline
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.addItemBtn, { marginBottom: 15 }]} 
                        onPress={addItem}
                    >
                        <Text style={styles.addItemText}>+ ADD TO LIST</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.submitBtn} 
                        onPress={handleSubmit}
                        disabled={loading || items.length === 0}
                    >
                        <LinearGradient colors={['#22c55e', '#16a34a']} style={[styles.btnGrad, (loading || items.length === 0) && { opacity: 0.6 }]}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>SUBMIT ALL CLAIMS</Text>}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={showPreview} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Preview Your Claim</Text>
                            <TouchableOpacity onPress={() => setShowPreview(false)}>
                                <Icon name="x" size={24} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.previewInfo}>
                            <Text style={styles.previewLabel}>Submission Date</Text>
                            <Text style={styles.previewValue}>{expenseDate}</Text>
                        </View>

                        <ScrollView style={styles.previewScroll} showsVerticalScrollIndicator={false}>
                            {items.map((item, index) => (
                                <View key={index} style={styles.previewRow}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.previewCategory}>{item.category}</Text>
                                        {item.remarks ? <Text style={styles.previewRemarks}>{item.remarks}</Text> : null}
                                    </View>
                                    <Text style={styles.previewPrice}>₹{item.amount}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.previewFooter}>
                            <View style={styles.totalBox}>
                                <Text style={styles.totalText}>TOTAL PAYABLE</Text>
                                <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
                            </View>

                            <TouchableOpacity 
                                style={[styles.submitBtn, { width: '100%' }]} 
                                onPress={confirmSubmit}
                                disabled={loading}
                            >
                                <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.btnGrad}>
                                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>CONFIRM & SUBMIT</Text>}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    pickerContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
    activeChip: { backgroundColor: '#FF007F10', borderColor: '#FF007F' },
    chipText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    activeChipText: { color: '#FF007F' },
    
    // Item List Styles
    itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    itemCategory: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
    itemRemarks: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
    itemPrice: { fontSize: 15, fontWeight: 'bold', color: '#0f172a', marginRight: 15 },
    removeBtn: { padding: 5 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 2, borderTopColor: '#f1f5f9' },
    totalText: { fontSize: 12, fontWeight: '900', color: '#64748b' },
    totalValue: { fontSize: 20, fontWeight: 'bold', color: '#FF007F' },
    
    addItemBtn: { padding: 15, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#FF007F', alignItems: 'center' },
    addItemText: { fontSize: 13, fontWeight: 'bold', color: '#FF007F' },
    
    btnText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
    
    submitBtn: { marginTop: 10 },
    btnGrad: { padding: 18, borderRadius: 15, alignItems: 'center' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
    previewInfo: { backgroundColor: '#f1f5f9', padding: 15, borderRadius: 15, marginBottom: 20 },
    previewLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748b', mb: 4, textTransform: 'uppercase' },
    previewValue: { fontSize: 14, fontWeight: 'bold', color: '#1e293b' },
    previewScroll: { maxHeight: 300 },
    previewRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    previewCategory: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
    previewRemarks: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
    previewPrice: { fontSize: 15, fontWeight: 'bold', color: '#FF007F' },
    previewFooter: { marginTop: 25 },
    totalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 5 }
});

export default ExpenseSubmitScreen;
