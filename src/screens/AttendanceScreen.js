import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import LinearGradient from 'react-native-linear-gradient';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import axios from 'axios';
import API_URL from '../services/api';
import { saveSession, getSession } from '../services/session';

const { width, height } = Dimensions.get('window');
const FRAME_SIZE = width * 0.75;

const AttendanceScreen = ({ navigation, route }) => {
    // Get user and action type from route
    const user = route.params?.user || { employeeId: 'UNKNOWN' };
    const action = route.params?.action || 'signin';

    const device = useCameraDevice('front') || useCameraDevice('back');
    const camera = useRef(null);

    const [isScanning, setIsScanning] = useState(true);
    const [isVerifying, setIsVerifying] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const scanAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        handlePermissions();
        if (isScanning && !isVerifying) {
            startScanAnimation();
        }
    }, [isScanning, isVerifying]);

    const handlePermissions = async () => {
        const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
        const status = await check(permission);
        if (status === RESULTS.GRANTED) setPermissionGranted(true);
        else {
            const result = await request(permission);
            setPermissionGranted(result === RESULTS.GRANTED);
        }
    };

    const startScanAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
                Animated.timing(scanAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
            ])
        ).start();
    };

    const handleVerifyOrRegister = async () => {
        if (!permissionGranted) {
            Alert.alert('Permission Required', 'Please grant camera permission.');
            return;
        }

        setIsScanning(false);
        setIsVerifying(true);

        try {
            // Mock capture
            const mockImageBase64 = "MOCK_BASE64_IMAGE_DATA";
            const location = { latitude: 11.2519, longitude: 77.9737 };

            // In real app, /attendance/mark would distinguish between reg and verify
            // For now, we'll use it to simulate the backend call
            const response = await axios.post(`${API_URL}/attendance/mark`, {
                employeeId: user.employeeId,
                imageBase64: mockImageBase64,
                location: location,
                status: "On-Time",
                isRegistration: action === 'register'
            });

            setIsVerifying(false);

            // If this was a registration, update session to reflect face is now registered
            if (action === 'register') {
                const currentSession = await getSession();
                if (currentSession) {
                    currentSession.isFaceRegistered = true;
                    await saveSession(currentSession);
                }
            }

            Alert.alert('Success',
                action === 'register' ? 'Face registered successfully!' : 'Identity verified & attendance marked!'
            );
            navigation.navigate('MainTabs', { 
                screen: 'Home', 
                params: { attendanceSuccess: true, user: { ...user, isFaceRegistered: true } } 
            });
        } catch (error) {
            setIsVerifying(false);
            setIsScanning(true);
            console.error('Attendance Error:', error);
            Alert.alert('Error', 'Failed to process face identification.');
        }
    };

    if (device == null || !permissionGranted) return (
        <View style={styles.loading}>
            <ActivityIndicator size="large" color="#FF007F" />
            <Text style={styles.text}>Initializing Camera...</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Camera ref={camera} style={StyleSheet.absoluteFill} device={device} isActive={true} photo={true} />
            <View style={styles.overlay}>
                <View style={styles.header}>
                    <Text style={styles.title}>CRAYONZ SECURE</Text>
                    <Text style={styles.subtitle}>{action === 'register' ? 'FACE REGISTRATION' : 'FACE IDENTIFICATION'}</Text>
                </View>

                <View style={styles.frameContainer}>
                    <View style={styles.frame}>
                        <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.frameBorder} />
                        <View style={styles.innerFrame}>
                            {/* Corner Markers */}
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                            
                            {isVerifying && (
                                <View style={styles.verifyingOverlay}>
                                    <ActivityIndicator size="large" color="#fff" />
                                    <Text style={styles.verifyingText}>{action === 'register' ? 'Registering...' : 'Verifying...'}</Text>
                                </View>
                            )}
                        </View>
                        {isScanning && (
                            <Animated.View style={[styles.scanLine, {
                                transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [10, FRAME_SIZE - 10] }) }]
                            }]}>
                                <LinearGradient colors={['transparent', '#FF007F', 'transparent']} horizontal={true} style={styles.lineGradient} />
                            </Animated.View>
                        )}
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.instruction}>
                        {isVerifying ? 'Please hold still...' : action === 'register' ? 'Capture your face for recognition' : 'Center your face to sign in'}
                    </Text>
                    {!isVerifying && (
                        <TouchableOpacity onPress={handleVerifyOrRegister} activeOpacity={0.8}>
                            <LinearGradient colors={['#FF8C00', '#FF007F']} style={styles.captureBtn}>
                                <Text style={styles.captureBtnText}>{action === 'register' ? 'CAPTURE & REGISTER' : 'CONFIRM FACE ID'}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={isVerifying}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    loading: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', gap: 15 },
    text: { color: '#fff', fontSize: 16, fontWeight: '600' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'space-between', paddingVertical: 60 },
    header: { alignItems: 'center' },
    title: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 3 },
    subtitle: { color: '#FF8C00', fontSize: 12, fontWeight: '700', marginTop: 4, letterSpacing: 1 },
    frameContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    frame: { width: FRAME_SIZE, height: FRAME_SIZE, justifyContent: 'center', alignItems: 'center' },
    frameBorder: { position: 'absolute', width: '100%', height: '100%', borderRadius: 40, opacity: 0.3, borderWidth: 2, borderColor: '#FF007F' },
    innerFrame: { width: FRAME_SIZE, height: FRAME_SIZE, borderRadius: 40, overflow: 'hidden' },
    corner: { position: 'absolute', width: 30, height: 30, borderColor: '#FF007F', borderWidth: 4 },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },
    verifyingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', gap: 15 },
    verifyingText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    scanLine: { position: 'absolute', top: 0, width: '100%', height: 2, zIndex: 10 },
    lineGradient: { width: '100%', height: '100%', backgroundColor: '#FF007F', shadowColor: '#FF007F', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10, elevation: 15 },
    footer: { alignItems: 'center', paddingHorizontal: 40 },
    instruction: { color: 'rgba(255,255,255,0.8)', fontSize: 15, marginBottom: 35, textAlign: 'center' },
    captureBtn: { paddingHorizontal: 45, paddingVertical: 18, borderRadius: 35, elevation: 8 },
    captureBtnText: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
    cancelBtn: { marginTop: 25 },
    cancelText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '600' }
});

export default AttendanceScreen;
