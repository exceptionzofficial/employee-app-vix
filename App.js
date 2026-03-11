import React, { useState, useEffect } from 'react';
import { Platform, ActivityIndicator, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { getSession } from './src/services/session';

import HomeScreen from './src/screens/HomeScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AttendanceLogsScreen from './src/screens/AttendanceLogsScreen';
import TaskScreen from './src/screens/TaskScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function GradientTabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();
    const bottomPadding = Math.max(insets.bottom, 10);

    const iconMap = {
        Home: 'home',
        Logs: 'list',
        Task: 'check-square',
        Profile: 'user',
    };

    return (
        <LinearGradient
            colors={['#FF8C00', '#FF007F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[tabStyles.container, { paddingBottom: bottomPadding }]}
        >
            {state.routes.map((route, index) => {
                const isFocused = state.index === index;
                const iconName = iconMap[route.name] || 'circle';

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        onPress={onPress}
                        style={tabStyles.tab}
                        activeOpacity={0.7}
                    >
                        <View style={[tabStyles.iconWrapper, isFocused && tabStyles.activeIconWrapper]}>
                            <Icon
                                name={iconName}
                                size={20}
                                color={isFocused ? '#FF007F' : 'rgba(255,255,255,0.6)'}
                            />
                        </View>
                        <Text style={[
                            tabStyles.label,
                            { color: isFocused ? '#fff' : 'rgba(255,255,255,0.6)' }
                        ]}>
                            {route.name}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </LinearGradient>
    );
}

const tabStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingTop: 10,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeIconWrapper: {
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
    },
});

function MainTabs({ route }) {
    const { user } = route.params || {};

    return (
        <Tab.Navigator
            tabBar={(props) => <GradientTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="Home" component={HomeScreen} initialParams={{ user }} />
            <Tab.Screen name="Logs" component={AttendanceLogsScreen} initialParams={{ user }} />
            <Tab.Screen name="Task" component={TaskScreen} initialParams={{ user }} />
            <Tab.Screen name="Profile" component={ProfileScreen} initialParams={{ user }} />
        </Tab.Navigator>
    );
}

export default function App() {
    const [initialRoute, setInitialRoute] = useState(null);
    const [sessionUser, setSessionUser] = useState(null);

    useEffect(() => {
        const checkSession = async () => {
            const savedUser = await getSession();
            if (savedUser) {
                setSessionUser(savedUser);
                setInitialRoute('MainTabs');
            } else {
                setInitialRoute('Login');
            }
        };
        checkSession();
    }, []);

    if (!initialRoute) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#FF007F" />
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={initialRoute}>
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen 
                        name="MainTabs" 
                        component={MainTabs} 
                        options={{ headerShown: false }} 
                        initialParams={sessionUser ? { user: sessionUser } : undefined}
                    />
                    <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
