import { Bot, MessageCircle, Sparkles, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type LucideIconComponent = React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

interface NavItem {
  id: string;
  label: string;
  Icon: LucideIconComponent;
}

interface NavigationBarProps {
  onTabPress?: (tabId: string) => void;
}

const navItems: NavItem[] = [
  { id: 'chats', label: 'Chats', Icon: MessageCircle },
  { id: 'assistants', label: 'Assistants', Icon: Bot },
  { id: 'share', label: 'Share', Icon: Sparkles },
  { id: 'profile', label: 'Profile', Icon: User },
];

export const NavigationBar: React.FC<NavigationBarProps> = ({ onTabPress }) => {
  const [activeTab, setActiveTab] = useState('chats');

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    onTabPress?.(tabId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navigationBar}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const tintColor = isActive ? '#5B5BFF' : '#8E8E93';
          const { Icon } = item;
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => handleTabPress(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                <Icon color={tintColor} size={24} strokeWidth={2} />
              </View>
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  navigationBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 10,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  activeIconContainer: {
    backgroundColor: '#F0F0FF',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 2,
  },
  activeLabel: {
    color: '#5B5BFF',
    fontWeight: '600',
  },
});

