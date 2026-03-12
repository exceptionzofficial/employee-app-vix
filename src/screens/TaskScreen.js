import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

const TaskScreen = ({ navigation }) => {
    // Mock tasks removed as requested for future implementation
    
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
            >
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconBox}>
                        <LinearGradient colors={['#f8fafc', '#f1f5f9']} style={styles.emptyIconGrad}>
                            <Icon name="clipboard" size={50} color="#cbd5e1" />
                        </LinearGradient>
                    </View>
                    <Text style={styles.emptyText}>No Tasks Assigned</Text>
                    <Text style={styles.emptySubText}>When your manager assigns tasks to you, they will appear here with real-time updates.</Text>
                    
                    <View style={styles.tipContainer}>
                        <Icon name="info" size={16} color="#94a3b8" />
                        <Text style={styles.tipText}>Tip: Keep your app updated to receive instant task notifications.</Text>
                    </View>
                </View>
            </ScrollView>
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
    scrollContent: { flexGrow: 1, padding: 25, justifyContent: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: -40 },
    emptyIconBox: { marginBottom: 25 },
    emptyIconGrad: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', borderWeight: 1, borderColor: '#e2e8f0' },
    emptyText: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 12 },
    emptySubText: { textAlign: 'center', color: '#94a3b8', fontSize: 14, lineHeight: 22, paddingHorizontal: 20 },
    tipContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        padding: 15, 
        borderRadius: 15, 
        marginTop: 40,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        gap: 10
    },
    tipText: { color: '#94a3b8', fontSize: 12, flex: 1 }
});

export default TaskScreen;
