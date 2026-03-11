import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = '@crayonz_session';
const SHIFT_KEY = '@crayonz_shift';

export const saveSession = async (employee) => {
    try {
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(employee));
    } catch (e) {
        console.error('Failed to save session:', e);
    }
};

export const getSession = async () => {
    try {
        const data = await AsyncStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Failed to get session:', e);
        return null;
    }
};

export const clearSession = async () => {
    try {
        await AsyncStorage.multiRemove([SESSION_KEY, SHIFT_KEY]);
    } catch (e) {
        console.error('Failed to clear session:', e);
    }
};

// Shift persistence
export const saveShiftState = async (shiftData) => {
    try {
        await AsyncStorage.setItem(SHIFT_KEY, JSON.stringify(shiftData));
    } catch (e) {
        console.error('Failed to save shift:', e);
    }
};

export const getShiftState = async () => {
    try {
        const data = await AsyncStorage.getItem(SHIFT_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Failed to get shift:', e);
        return null;
    }
};

export const clearShiftState = async () => {
    try {
        await AsyncStorage.removeItem(SHIFT_KEY);
    } catch (e) {
        console.error('Failed to clear shift:', e);
    }
};
