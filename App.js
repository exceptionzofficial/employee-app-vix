import React, { useState, useEffect } from 'react';
import { Platform, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

function MainTabs({ route }) {
    const { user } = route.params || {};
    const insets = useSafeAreaInsets();
    const bottomPadding = Math.max(insets.bottom, 10);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = 'home';
                    else if (route.name === 'Logs') iconName = 'list';
                    else if (route.name === 'Task') iconName = 'check-square';
                    else if (route.name === 'Profile') iconName = 'user';
                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#FF007F',
                tabBarInactiveTintColor: '#94a3b8',
                tabBarStyle: {
                    height: 60 + bottomPadding,
                    paddingBottom: bottomPadding,
                    paddingTop: 10,
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#f1f5f9',
                    elevation: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                headerShown: false
            })}
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
