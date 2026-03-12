import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Alert, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import LinearGradient from 'react-native-linear-gradient';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import Icon from 'react-native-vector-icons/Feather';
import axios from 'axios';
import API_URL from '../services/api';
import { saveShiftState, getShiftState, clearShiftState } from '../services/session';

let MapView = null;
let Circle = null;
let Marker = null;
let mapsAvailable = false;

try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Circle = maps.Circle;
    Marker = maps.Marker;
    mapsAvailable = true;
} catch (e) {
    console.warn('react-native-maps not available:', e.message);
}

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation, route }) => {
    // Get user from params (passed from LoginScreen via MainTabs)
    const user = route.params?.user || { name: 'Employee', employeeId: 'TEMP', isFaceRegistered: false };
    const initialAction = route.params?.initialAction || (user.isFaceRegistered ? 'signin' : 'register');

    const [currentLocation, setCurrentLocation] = useState(null);
    const [rules, setRules] = useState([]);
    const [nearestRule, setNearestRule] = useState(null);
    const [distance, setDistance] = useState(null);
    const [locationAccuracy, setLocationAccuracy] = useState(null);
    const [isWithinRadius, setIsWithinRadius] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isShiftStarted, setIsShiftStarted] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    const timerRef = useRef(null);
    const mapRef = useRef(null);

    const fetchRules = async () => {
        try {
            const res = await axios.get(`${API_URL}/attendance/current-rules/${user.employeeId}`);
            if (res.data) setRules(res.data);
        } catch (err) {
            console.log('No rules found or error', err);
            setRules([]);
        }
    };

    const init = async () => {
        await fetchRules();
        await handlePermissions();

        // Restore persisted shift state
        const savedShift = await getShiftState();
        if (savedShift && savedShift.isActive) {
            setIsShiftStarted(true);
            const elapsed = Math.floor((Date.now() - savedShift.startTime) / 1000);
            setElapsedTime(elapsed);
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        init();

        if (route.params?.attendanceSuccess && !isShiftStarted) {
            startShift();
        }

        if (route.params?.shiftEnded) {
            setIsShiftStarted(false);
            setElapsedTime(0);
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            Geolocation.stopObserving();
        };
    }, [route.params?.attendanceSuccess, route.params?.shiftEnded]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchRules();
        
        // Force an immediate location update
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                setCurrentLocation({ latitude, longitude });
                if (rules.length > 0) {
                    calculateDistance(latitude, longitude, accuracy);
                }
                setRefreshing(false);
            },
            (error) => {
                console.error("Refresh location error:", error);
                setRefreshing(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }, [rules, user.employeeId]);

    const handlePermissions = async () => {
        const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        const status = await check(permission);
        if (status === RESULTS.GRANTED) startLocationTracking();
        else {
            const result = await request(permission);
            if (result === RESULTS.GRANTED) startLocationTracking();
        }
    };

    const calculateDistance = (lat1, lon1, accuracy = 0) => {
        if (!rules || rules.length === 0) return;
        
        const R = 6371e3;
        let minDistance = Infinity;
        let closest = null;
        let inAnyRange = false;

        rules.forEach(rule => {
            if (!rule.location) return;
            const lat2 = Number(rule.location.latitude);
            const lon2 = Number(rule.location.longitude);
            
            const φ1 = lat1 * Math.PI / 180;
            const φ2 = lat2 * Math.PI / 180;
            const Δφ = (lat2 - lat1) * Math.PI / 180;
            const Δλ = (lon2 - lon1) * Math.PI / 180;
            
            const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const d = R * c;

            if (d < minDistance) {
                minDistance = d;
                closest = rule;
            }

            // Check if within this specific rule's radius
            const buffer = 50;
            const allowedRadius = Number(rule.radius) + buffer + accuracy;
            if (d <= allowedRadius) inAnyRange = true;
        });
        
        setDistance(minDistance);
        setNearestRule(closest);
        setLocationAccuracy(accuracy);
        setIsWithinRadius(inAnyRange);
    };

    const startLocationTracking = () => {
        Geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                setCurrentLocation({ latitude, longitude });

                if (rules.length > 0) {
                    calculateDistance(latitude, longitude, accuracy);
                }
            },
            (error) => {
                console.error("GPS Error:", error);
                Alert.alert("GPS Error", "Failed to get highly accurate location. Please ensure GPS is on.");
            },
            { 
                enableHighAccuracy: true, 
                distanceFilter: 1, 
                interval: 2000, 
                fastestInterval: 1000 
            }
        );
    };

    const startShift = async () => {
        setIsShiftStarted(true);
        const startTime = Date.now();
        await saveShiftState({ isActive: true, startTime });
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setElapsedTime(prev => prev + 1), 1000);
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m}:${s}`.split(':').map(v => v.padStart(2, '0')).join(':');
    };

    if (isLoading) return <View style={styles.center}><ActivityIndicator color="#FF007F" /></View>;

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl 
                    refreshing={refreshing} 
                    onRefresh={onRefresh} 
                    colors={['#FF007F']} // Android
                    tintColor={'#FF007F'} // iOS
                />
            }
        >
            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.header}>
                <Image source={require('../assets/crayonz.jpg')} style={styles.logo} />
                <View>
                    <Text style={styles.greetText}>{isShiftStarted ? 'Active Duty' : 'Welcome back,'}</Text>
                    <Text style={styles.nameText}>{user.name}</Text>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                {isShiftStarted && (
                    <View style={styles.timerCard}>
                        <Text style={styles.timerTitle}>SHIFT DURATION</Text>
                        <Text style={styles.timerTime}>{formatTime(elapsedTime)}</Text>
                    </View>
                )}

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Nearest Branch / Location</Text>
                    {nearestRule ? (
                        <>
                            <Text style={styles.locName}>{nearestRule.eventName}</Text>
                            <View style={styles.distRow}>
                                <View>
                                    <Text style={styles.distLabel}>Distance: {distance?.toFixed(0)}m</Text>
                                    {locationAccuracy && (
                                        <Text style={styles.accuracyText}>Accuracy: ±{locationAccuracy.toFixed(1)}m</Text>
                                    )}
                                </View>
                                <View style={[styles.badge, { backgroundColor: isWithinRadius ? '#dcfce7' : '#fee2e2' }]}>
                                    <Text style={{ color: isWithinRadius ? '#16a34a' : '#dc2626', fontSize: 10, fontWeight: 'bold' }}>
                                        {isWithinRadius ? 'IN RANGE' : 'OUTSIDE'}
                                    </Text>
                                </View>
                            </View>
                            
                            {mapsAvailable && currentLocation && (
                                <View style={styles.mapContainer}>
                                    <MapView
                                        style={styles.map}
                                        initialRegion={{
                                            latitude: nearestRule.location.latitude,
                                            longitude: nearestRule.location.longitude,
                                            latitudeDelta: 0.015,
                                            longitudeDelta: 0.015,
                                        }}
                                    >
                                        {rules.map((rule, idx) => (
                                            <React.Fragment key={idx}>
                                                <Circle
                                                    center={{
                                                        latitude: Number(rule.location.latitude),
                                                        longitude: Number(rule.location.longitude)
                                                    }}
                                                    radius={Number(rule.radius)}
                                                    fillColor={rule.ruleId === nearestRule.ruleId ? "rgba(255, 0, 127, 0.2)" : "rgba(148, 163, 184, 0.2)"}
                                                    strokeColor={rule.ruleId === nearestRule.ruleId ? "rgba(255, 0, 127, 0.8)" : "rgba(148, 163, 184, 0.8)"}
                                                    strokeWidth={2}
                                                />
                                                <Marker 
                                                    coordinate={{
                                                        latitude: Number(rule.location.latitude),
                                                        longitude: Number(rule.location.longitude)
                                                    }}
                                                    title={rule.eventName}
                                                />
                                            </React.Fragment>
                                        ))}
                                        <Marker coordinate={currentLocation} title="You">
                                            <View style={styles.userMarker}>
                                                <Icon name="user" size={14} color="#fff" />
                                            </View>
                                        </Marker>
                                    </MapView>
                                </View>
                            )}
                        </>
                    ) : (
                        <Text style={[styles.locName, { color: '#ef4444' }]}>No active geofences found</Text>
                    )}
                </View>

                {!isShiftStarted ? (
                    <TouchableOpacity
                        style={styles.actionBtn}
                        disabled={!isWithinRadius || rules.length === 0}
                        onPress={() => navigation.navigate('Attendance', { 
                            user, 
                            action: initialAction, 
                            geofenceName: nearestRule?.eventName || 'Unknown Branch' 
                        })}
                    >
                        <LinearGradient colors={isWithinRadius ? ['#FF8C00', '#FF007F'] : ['#e2e8f0', '#cbd5e1']} style={styles.btnGrad}>
                            <Text style={styles.btnText}>
                                {initialAction === 'register' ? 'REGISTER FACE' : 'SIGN IN (FACE ID)'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.successBox}>
                        <Icon name="check-circle" size={20} color="#16a34a" />
                        <Text style={styles.successText}>Attendance logged successfully</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 40, paddingTop: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, flexDirection: 'row', alignItems: 'center', gap: 15 },
    logo: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff' },
    greetText: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
    nameText: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    content: { padding: 20 },
    timerCard: { backgroundColor: '#1e293b', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
    timerTitle: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' },
    timerTime: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
    card: { backgroundColor: '#fff', padding: 20, borderRadius: 20, elevation: 3 },
    cardTitle: { fontSize: 12, color: '#94a3b8', marginBottom: 5 },
    locName: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
    distRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, alignItems: 'center' },
    distLabel: { color: '#64748b' },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    actionBtn: { marginTop: 30 },
    btnGrad: { padding: 18, borderRadius: 15, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    successBox: { backgroundColor: '#dcfce7', padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 30 },
    successText: { color: '#166534', fontWeight: 'bold' },
    mapContainer: { height: 200, width: '100%', borderRadius: 15, overflow: 'hidden', marginTop: 20 },
    map: { flex: 1 },
    userMarker: { backgroundColor: '#FF8C00', padding: 6, borderRadius: 20, borderWidth: 2, borderColor: '#fff' },
    accuracyText: { fontSize: 10, color: '#94a3b8', marginTop: 2 }
});

export default HomeScreen;
