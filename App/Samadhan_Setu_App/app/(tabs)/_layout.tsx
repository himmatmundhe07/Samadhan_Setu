import React from 'react';
import { Tabs } from 'expo-router';
import { Text, StyleSheet, View } from 'react-native';
import { colors } from '../../src/theme/colors';
import { fontSize } from '../../src/theme/typography';
import { useTranslation } from 'react-i18next';
import { useNotificationStore } from '../../src/store/notificationStore';
import { Home, Plus, ListTodo, Bell, User } from 'lucide-react-native';

export default function TabLayout() {
  const { t } = useTranslation();
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.forestGreen,
        tabBarInactiveTintColor: colors.mudBrown,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        sceneStyle: { backgroundColor: colors.chuna },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'होम',
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="submit"
        options={{
          title: 'शिकायत',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.submitIcon, focused && styles.submitIconActive]}>
              <Plus color={colors.surface} size={28} strokeWidth={3} />
            </View>
          ),
          tabBarItemStyle: styles.submitTab,
        }}
      />
      <Tabs.Screen
        name="problems"
        options={{
          title: 'सभी',
          tabBarIcon: ({ color, focused }) => (
            <ListTodo color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'सूचना',
          tabBarIcon: ({ color, focused }) => (
            <Bell color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: styles.badge,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'प्रोफ़ाइल',
          tabBarIcon: ({ color, focused }) => (
            <User color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      {/* Hidden tabs */}
      <Tabs.Screen name="analytics" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.chuna,
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
    paddingTop: 6,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  submitIcon: {
    backgroundColor: colors.forestGreen,
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 21,
    shadowColor: colors.forestGreen,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 2,
  },
  submitIconActive: {
    backgroundColor: colors.leafGreen,
  },
  submitTab: {
    marginTop: 0, // Lowered down so it never clashes with label
  },
  badge: {
    backgroundColor: colors.sindoor,
    fontSize: 10,
    fontWeight: '700',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
  },
});
