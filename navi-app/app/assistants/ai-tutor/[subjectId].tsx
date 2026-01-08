import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    FlatList,
    Keyboard,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import sampleData from "../../../data/sample-data.json";
import { Colors, Spacing, Typography, Layout, Icons } from "../../../constants/Theme";

interface SubjectData {
    id: string;
    name: string;
    icon: string;
    description: string;
}

interface Chat {
    id: string;
    modelType: "Campus Navigator" | "AI Tutor";
    subject?: string;
    lastMessage: string;
    timestamp: string;
    messages: { id: string; role: "user" | "assistant"; text: string }[];
}

export default function AITutorSubjectScreen() {
    const { subjectId, chatId } = useLocalSearchParams<{ subjectId: string; chatId?: string }>();
    const navigation = useNavigation();
    const listRef = useRef<FlatList<any>>(null);
    const [input, setInput] = useState("");
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [messages, setMessages] = useState<{ id: string; role: "user" | "assistant"; text: string }[]>([]);
    
    const [chatStarted, setChatStarted] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [streamingText, setStreamingText] = useState("");

    const subject = useMemo(() => {
        return (sampleData.subjects as SubjectData[]).find((s) => s.id === subjectId);
    }, [subjectId]);

    const chat = useMemo(() => {
        if (chatId) {
            return (sampleData.chats as Chat[]).find(
                (c) => c.id === chatId && c.modelType === "AI Tutor" && c.subject === subjectId
            );
        }
        return null;
    }, [chatId, subjectId]);

    const subjectName = subject?.name || "AI Tutor";

    useEffect(() => {
        if (subject) {
            navigation.setOptions({ title: subjectName });
        }
    }, [navigation, subject, subjectName]);

    useEffect(() => {
        if (chat && chat.messages) {
            setMessages(chat.messages);
            setChatStarted(true); // Hide banner if history exists
        }
    }, [chat]);

    useEffect(() => {
        const showSubscription = Keyboard.addListener("keyboardDidShow", (e) => setKeyboardHeight(e.endCoordinates.height));
        const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const simulateTyping = (fullText: string) => {
        setIsTyping(true);
        let currentPos = 0;
        setStreamingText("");

        const interval = setInterval(() => {
            const nextChar = fullText.slice(0, currentPos + 1);
            setStreamingText(nextChar);
            currentPos++;

            if (currentPos >= fullText.length) {
                clearInterval(interval);
                setIsTyping(false);
                setMessages((prev) => [
                    ...prev,
                    { id: `a-${Date.now()}`, role: "assistant", text: fullText },
                ]);
                setStreamingText("");
            }
        }, 25);
    };

    const handleSend = (textOverride?: string) => {
        const textToSend = typeof textOverride === 'string' ? textOverride : input;
        const trimmed = textToSend.trim();
        if (!trimmed) return;

        setChatStarted(true);
        const userMessage = { id: `u-${Date.now()}`, role: "user" as const, text: trimmed };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        // Demo assistant response
        setTimeout(() => {
            simulateTyping(`I'm checking the course material for ${subjectName}. Regarding "${trimmed}"...`);
        }, 600);
    };

    const renderMessage = ({ item }: { item: { id: string; role: "user" | "assistant"; text: string } }) => {
        const isUser = item.role === "user";
        return (
            <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
                <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
                    <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant]}>
                        {item.text}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(m) => m.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.listContent}
                onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}

                ListHeaderComponent={() => (
                    <>
                        {!chatStarted && (
                            <View style={styles.bannerContainer}>
                                <Icons.AI color={Colors.primary} size={64} />
                                <Text style={styles.bannerText}>Ready to study {subjectName}?</Text>
                            </View>
                        )}
                    </>
                )}

                ListFooterComponent={() => (
                    <>
                        {isTyping && (
                            <View style={[styles.messageRow, styles.messageRowAssistant]}>
                                <View style={[styles.bubble, styles.bubbleAssistant]}>
                                    <Text style={styles.bubbleTextAssistant}>
                                        {streamingText}<Text style={styles.beam}>|</Text>
                                    </Text>
                                </View>
                            </View>
                        )}
                        
                        {!chatStarted && !isTyping && (
                            <View style={styles.suggestionArea}>
                                {["Explain core concepts", "Quiz me on this", "Summarize lesson"].map((q, i) => (
                                    <TouchableOpacity key={i} style={styles.suggestionCard} onPress={() => handleSend(q)}>
                                        <Text style={styles.suggestionText}>{q}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </>
                )}
            />

            <View style={[styles.inputBar, { paddingBottom: Platform.OS === 'ios' ? keyboardHeight + 32 : keyboardHeight + 16 }]}>
                <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Type a message..."
                    placeholderTextColor={Colors.textMuted}
                    style={styles.textInput}
                    onSubmitEditing={() => handleSend()}
                />
                <TouchableOpacity 
                    style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]} 
                    onPress={() => handleSend()}
                    disabled={!input.trim()}
                >
                    <Icons.Send color="#FFFFFF" size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    listContent: { paddingHorizontal: Spacing[4], paddingTop: Spacing[4], paddingBottom: 160 },
    messageRow: { flexDirection: "row", marginBottom: Spacing[3] },
    messageRowUser: { justifyContent: "flex-end" },
    messageRowAssistant: { justifyContent: "flex-start" },
    bubble: {
        maxWidth: "85%",
        borderRadius: Layout.borderRadius.lg,
        paddingVertical: Spacing[3],
        paddingHorizontal: Spacing[4],
    },
    bubbleUser: { backgroundColor: Colors.primary },
    bubbleAssistant: { 
        backgroundColor: Colors.surface, 
        borderWidth: 2, 
        borderColor: Colors.deepNavy 
    },
    bubbleText: { fontFamily: Typography.fontFamily.body, fontSize: Typography.base, lineHeight: 22 },
    bubbleTextUser: { color: "#FFFFFF" },
    bubbleTextAssistant: { color: Colors.dark },
    inputBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing[4],
        backgroundColor: Colors.surface,
        borderTopWidth: 2,
        borderTopColor: Colors.softBlue,
    },
    textInput: {
        flex: 1,
        backgroundColor: Colors.light,
        borderRadius: Layout.borderRadius.full,
        paddingHorizontal: Spacing[4],
        height: 50,
        fontFamily: Typography.fontFamily.body,
        fontSize: Typography.base,
        marginRight: Spacing[3],
        color: Colors.dark,
    },
    sendButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    sendButtonDisabled: { backgroundColor: Colors.softBlue },
    suggestionArea: { marginTop: Spacing[4] },
    suggestionCard: {
        borderWidth: 1.5,
        borderStyle: "dashed",
        borderColor: Colors.softBlue,
        backgroundColor: Colors.light,
        padding: Spacing[4],
        borderRadius: Layout.borderRadius.md,
        marginBottom: Spacing[3],
    },
    suggestionText: { fontFamily: Typography.fontFamily.body, color: Colors.primary },
    beam: { color: Colors.primary, fontWeight: '700' },
    bannerContainer: { alignItems: 'center', paddingVertical: Spacing[10] },
    bannerText: {
        fontFamily: Typography.fontFamily.header,
        fontSize: Typography.xl,
        color: Colors.dark,
        marginTop: Spacing[3],
    },
});