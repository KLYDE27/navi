import { useLocalSearchParams, useNavigation } from "expo-router";
import { Bot, Send } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    FlatList,
    Keyboard,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
// ✅ IMPORT YOUR EXISTING THEME
import { Colors, Layout, Spacing, Typography } from "../../constants/Theme";
import sampleData from "../../data/sample-data.json";

// 📍 CONFIGURATION: API URL
const API_URL = Platform.OS === "android" 
    ? "http://10.0.2.2:3000/api/chat" 
    : "http://localhost:3000/api/chat";

interface Message {
    id: string;
    role: "user" | "assistant";
    text: string;
}

interface Chat {
    id: string;
    modelType: "Campus Navigator" | "AI Tutor";
    subject?: string;
    lastMessage: string;
    timestamp: string;
    messages: Message[];
}

export default function CampusNavigatorScreen() {
    const { chatId } = useLocalSearchParams<{ chatId?: string }>();
    const navigation = useNavigation();
    const [input, setInput] = useState("");
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const listRef = useRef<FlatList>(null);

    // Flow & Animation States
    const [chatStarted, setChatStarted] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [streamingText, setStreamingText] = useState("");
    const [showDeptModal, setShowDeptModal] = useState(true);
    const [selectedDept, setSelectedDept] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);

    // 1. Load Existing Chat History
    const chat = useMemo(() => {
        if (chatId) {
            return (sampleData.chats as Chat[]).find(
                (c) => c.id === chatId && c.modelType === "Campus Navigator"
            );
        }
        return null;
    }, [chatId]);

    useEffect(() => {
        if (chat && chat.messages.length > 0) {
            setMessages(chat.messages);
            setChatStarted(true); 
            setShowDeptModal(false);
        }
    }, [chat]);

    useEffect(() => {
        navigation.setOptions({ title: "Campus Navigator" });
    }, [navigation]);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", (e) => setKeyboardHeight(e.endCoordinates.height));
        const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
        return () => { showSub.remove(); hideSub.remove(); };
    }, []);

    // 2. Typing Animation
    const simulateTyping = (fullText: string) => {
        setIsTyping(true);
        let currentPos = 0;
        setStreamingText("");

        const interval = setInterval(() => {
            const nextText = fullText.slice(0, currentPos + 1);
            setStreamingText(nextText);
            currentPos++;

            if (currentPos >= fullText.length) {
                clearInterval(interval);
                setIsTyping(false);
                const botMsg: Message = { id: `a-${Date.now()}`, role: "assistant", text: fullText };
                setMessages((prev) => [...prev, botMsg]);
                setStreamingText("");
            }
        }, 20); 
    };

    // 3. Handle Send
    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim()) return;

        setChatStarted(true);
        const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: textToSend };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        
        setIsTyping(true);
        setStreamingText("");

        try {
            const promptWithContext = selectedDept 
                ? `[Context: ${selectedDept}] ${textToSend}`
                : textToSend;

            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userMessage: promptWithContext }),
            });

            const data = await response.json();

            if (data.reply) {
                simulateTyping(data.reply);
            } else {
                simulateTyping("I'm sorry, I didn't get a response from the server.");
            }

        } catch (error) {
            console.error("Navi Server Error:", error);
            simulateTyping("⚠️ I can't connect to the campus server right now. Is it running?");
        }
    };

    // Department Picker Modal
    const DepartmentModal = () => (
        <Modal visible={showDeptModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Department</Text>
                    <View style={{ maxHeight: 300 }}> 
                        <ScrollView showsVerticalScrollIndicator={true}>
                            {["College of Accountancy and Finance", 
                            "College of Arts & Letters",
                            "College of Business Administration", 
                            "College of Communication", 
                            "College of Computer and Information Sciences",
                            "College of Education", 
                            "College of Engineering"].map((dept) => (
                                <TouchableOpacity 
                                    key={dept} 
                                    style={styles.deptOption} 
                                    onPress={() => { 
                                        setSelectedDept(dept); 
                                        setShowDeptModal(false); 
                                    }}
                                >
                                    <Text style={styles.deptOptionText}>{dept}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <Text style={styles.modalFooter}>Scroll to see more</Text>
                </View>
            </View>
        </Modal>
    );

    const renderMessage = ({ item }: { item: Message }) => {
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
            <DepartmentModal />
            
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
                                <Bot color={Colors.primary} size={64} />
                                <Text style={styles.bannerText}>Hi! How can I help you today?</Text>
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
                                        {streamingText || "Thinking..."}<Text style={styles.beam}>|</Text>
                                    </Text>
                                </View>
                            </View>
                        )}
                        
                        {!chatStarted && !isTyping && (
                            <View style={styles.suggestionArea}>
                                {["Where is the Admin?", "Library hours?", "Map of College"].map((q, i) => (
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
                    <Send color="#FFFFFF" size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// 🎨 UPDATED STYLES TO MATCH YOUR THEME.TS
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    listContent: { 
        paddingHorizontal: Spacing["4"], 
        paddingTop: Spacing["4"], 
        paddingBottom: 160 
    },
    messageRow: { flexDirection: "row", marginBottom: Spacing["4"] },
    messageRowUser: { justifyContent: "flex-end" },
    messageRowAssistant: { justifyContent: "flex-start" },
    bubble: {
        maxWidth: "85%",
        // ✅ Fixed: Using Layout.borderRadius.lg
        borderRadius: Layout.borderRadius.lg, 
        paddingVertical: Spacing["3"],
        paddingHorizontal: Spacing["4"],
    },
    bubbleUser: { backgroundColor: Colors.primary },
    bubbleAssistant: { 
        backgroundColor: Colors.surface, 
        borderWidth: 1, 
        borderColor: Colors.softBlue // ✅ Fixed: Using softBlue
    },
    bubbleText: { 
        fontSize: Typography.base, // ✅ Fixed: Using Typography.base
        lineHeight: 22,
        fontFamily: Typography.fontFamily.body,
    },
    bubbleTextUser: { color: "#FFFFFF" },
    bubbleTextAssistant: { color: Colors.dark }, // ✅ Fixed: Using Colors.dark
    inputBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        padding: Spacing["4"],
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.softBlue,
    },
    textInput: {
        flex: 1,
        backgroundColor: Colors.light,
        // ✅ Fixed: Using Layout.borderRadius.full
        borderRadius: Layout.borderRadius.full, 
        paddingHorizontal: Spacing["4"],
        height: 50,
        fontSize: Typography.base,
        marginRight: Spacing["3"],
        color: Colors.dark,
        fontFamily: Typography.fontFamily.body,
    },
    sendButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    sendButtonDisabled: { backgroundColor: Colors.textMuted },
    suggestionArea: { marginTop: Spacing["2"] },
    suggestionCard: {
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: Colors.primary,
        backgroundColor: Colors.softBlue,
        padding: Spacing["4"],
        borderRadius: Layout.borderRadius.md, // ✅ Fixed
        marginHorizontal: Spacing["6"],
        marginBottom: Spacing["2"],
    },
    suggestionText: {
        fontSize: Typography.base,
        fontWeight: "500",
        color: Colors.dark,
        fontFamily: Typography.fontFamily.body,
    },
    beam: { color: Colors.primary, fontWeight: '700' },
    bannerContainer: { alignItems: 'center', paddingVertical: Spacing["12"] },
    bannerText: {
        fontWeight: "700",
        fontSize: Typography["2xl"], // ✅ Fixed
        color: Colors.primary,
        marginTop: Spacing["4"],
        fontFamily: Typography.fontFamily.brand,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        padding: Spacing["6"]
    },
    modalFooter: {
        fontSize: Typography.xs,
        color: Colors.textMuted,
        textAlign: 'center',
        marginTop: Spacing["2"],
        fontFamily: Typography.fontFamily.body,
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        padding: Spacing["6"],
        width: '85%',
        alignSelf: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
    },
    modalTitle: {
        fontSize: Typography.lg,
        fontWeight: "700",
        marginBottom: Spacing["4"],
        textAlign: 'center',
        color: Colors.dark,
        fontFamily: Typography.fontFamily.header,
    },
    deptOption: {
        paddingVertical: Spacing["4"],
        borderBottomWidth: 1,
        borderBottomColor: Colors.softBlue
    },
    deptOptionText: {
        fontSize: Typography.base,
        color: Colors.primary,
        fontFamily: Typography.fontFamily.body,
    }
});