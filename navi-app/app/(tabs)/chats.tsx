import { Bot, MapPin, MessageCircle } from "lucide-react-native";
import { router, Href } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import sampleData from "../../data/sample-data.json";
import { Colors, Spacing, Typography, Layout, Icons } from "../../constants/Theme";

interface Chat {
    id: string;
    modelType: "Campus Navigator" | "AI Tutor";
    subject?: string;
    lastMessage: string;
    timestamp: string;
}

export default function ChatsScreen() {
    const chats = useMemo(() => (sampleData.chats as Chat[]) || [], []);
    const [modalVisible, setModalVisible] = useState(false);

    // Formats the timestamp into a readable relative date
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const handleChatPress = (chat: Chat) => {
        if (chat.modelType === "Campus Navigator") {
            router.push({
                pathname: "/assistants/campus-navigator",
                params: { chatId: chat.id },
            } as Href);
        } else if (chat.modelType === "AI Tutor" && chat.subject) {
            router.push({
                pathname: `/assistants/ai-tutor/${chat.subject}`,
                params: { chatId: chat.id },
            } as Href);
        }
    };

    const renderChatItem = ({ item }: { item: Chat }) => {
        const isNavigator = item.modelType === "Campus Navigator";
        const Icon = isNavigator ? Icons.Location : Icons.AI;
        
        // Find subject name if it's a tutor chat
        const displayName = isNavigator 
            ? "Campus Navigator" 
            : (sampleData.subjects as any[]).find(s => s.id === item.subject)?.name || "AI Tutor";

        return (
            <TouchableOpacity 
                style={styles.chatCard} 
                onPress={() => handleChatPress(item)} 
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: isNavigator ? Colors.accent : Colors.primary }]}>
                    <Icon color={isNavigator ? Colors.dark : Colors.light} size={22} />
                </View>

                <View style={styles.chatContent}>
                    <View style={styles.chatHeader}>
                        <Text style={styles.chatTitle}>{displayName}</Text>
                        <Text style={styles.chatTime}>{formatTime(item.timestamp)}</Text>
                    </View>
                    <Text style={styles.chatPreview} numberOfLines={1}>{item.lastMessage}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Chats</Text>
                <Text style={styles.subtitle}>Your recent conversations</Text>
            </View>

            {chats.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Icons.GotoCircle color={Colors.textMuted} size={64} strokeWidth={1} />
                    <Text style={styles.emptyTitle}>No chats yet</Text>
                    <Text style={styles.emptySubtitle}>Start a new conversation with our AI helpers.</Text>
                </View>
            ) : (
                <FlatList
                    data={chats}
                    renderItem={renderChatItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* FAB to start new chat */}
            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Icons.Plus color={Colors.light} size={30} />
            </TouchableOpacity>

            {/* New Chat Selection Modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>New Conversation</Text>
                        <TouchableOpacity 
                            style={styles.modalItem} 
                            onPress={() => { setModalVisible(false); router.push("/assistants/campus-navigator"); }}
                        >
                            <Icons.Location color={Colors.primary} size={20} />
                            <Text style={styles.modalItemText}>Campus Navigator</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.modalItem} 
                            onPress={() => { setModalVisible(false); router.push("/assistants/ai-tutor"); }}
                        >
                            <Icons.GraduationCap color={Colors.primary} size={20} />
                            <Text style={styles.modalItemText}>AI Tutor</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 20 },
    title: { fontFamily: Typography.fontFamily.header, fontSize: Typography["3xl"], fontWeight: Typography.fontWeight.bold, color: Colors.dark },
    subtitle: { fontFamily: Typography.fontFamily.body, fontSize: 16, color: Colors.textMuted },
    listContent: { paddingHorizontal: 20, paddingBottom: 100 },
    chatCard: {
        flexDirection: "row",
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        padding: 16,
        marginBottom: 12,
        alignItems: "center",
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    chatContent: { flex: 1 },
    chatHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    chatTitle: { fontFamily: Typography.fontFamily.header, fontSize: 16, color: Colors.dark },
    chatTime: { fontSize: 12, color: Colors.textMuted },
    chatPreview: { fontSize: 14, color: Colors.textMuted, fontFamily: Typography.fontFamily.body },
    fab: {
        position: "absolute",
        bottom: 30,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primary,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40 },
    emptyTitle: { fontFamily: Typography.fontFamily.header, fontSize: 20, color: Colors.dark, marginTop: 10 },
    emptySubtitle: { textAlign: "center", color: Colors.textMuted, marginTop: 5 },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modalCard: { width: "80%", backgroundColor: Colors.surface, borderRadius: 20, padding: 20 },
    modalTitle: { fontFamily: Typography.fontFamily.header, fontSize: 18, marginBottom: 15 },
    modalItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: 10 },
    modalItemText: { fontSize: 16, color: Colors.dark, fontWeight: "600" },
});