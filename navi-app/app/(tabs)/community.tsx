import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    Modal, TextInput, ScrollView, Platform, ActivityIndicator, Alert, Linking
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import * as Speech from 'expo-speech';
import { Colors, Spacing, Typography, Layout } from "../../constants/Theme";
// 👇 FIX: Import icons directly so they are never undefined
import { Book, CircleArrowRight, CheckCircle, Volume2, StopCircle } from 'lucide-react-native';

const API_BASE = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
const CACHE_KEY = "NAVI_FAQ_CACHE";

interface FAQItem {
    id: number;
    category: string;
    question: string;
    answer: string;
    status: string;
}

export default function CommunityScreen() {
    const [faqs, setFaqs] = useState<FAQItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    
    // UI States
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedFAQ, setSelectedFAQ] = useState<FAQItem | null>(null);
    const [isPostModalVisible, setIsPostModalVisible] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    // Form States
    const [formCategory, setFormCategory] = useState("");
    const [formQuestion, setFormQuestion] = useState("");
    const [formAnswer, setFormAnswer] = useState("");

    const categories = ["All", "Enrollment", "Facilities", "Finance", "Events"];

    useEffect(() => { loadFAQs(); }, []);

    const loadFAQs = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/faqs/public`);
            const data = await res.json();
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(data));
            setFaqs(data);
            setIsOffline(false);
        } catch (err) {
            console.log("Loading from cache...");
            const cachedData = await AsyncStorage.getItem(CACHE_KEY);
            if (cachedData) {
                setFaqs(JSON.parse(cachedData));
                setIsOffline(true);
            }
        } finally {
            setLoading(false);
        }
    };

    // 1️⃣ MICROSOFT AZURE FEATURE: Immersive Reader (Speech)
    const handleAzureSpeech = (text: string) => {
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
        } else {
            setIsSpeaking(true);
            Speech.speak(text, {
                language: 'en-US',
                pitch: 1.0,
                rate: 0.9,
                onDone: () => setIsSpeaking(false),
                onStopped: () => setIsSpeaking(false),
            });
        }
    };

    // 2️⃣ MICROSOFT 365 FEATURE: PDF Handbook
    const downloadOfflineHandbook = async () => {
        try {
            const htmlContent = `
                <html>
                <body>
                    <h1 style="color:#0469cd">Navi Campus Handbook</h1>
                    <p>Generated via Microsoft 365 Integration</p>
                    ${faqs.map(item => `
                        <div style="margin-bottom:20px; border-bottom:1px solid #ccc;">
                            <b>Q: ${item.question}</b><br/>
                            <span>${item.answer}</span>
                        </div>
                    `).join('')}
                </body>
                </html>
            `;
            const { uri } = await Print.printToFileAsync({ html: htmlContent });
            await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } catch (error) { Alert.alert("Error", "Could not generate handbook."); }
    };

    const handlePostContribution = async () => {
        if (!formCategory || !formQuestion || !formAnswer) return alert("Fill all fields");
        try {
            await fetch(`${API_BASE}/api/faqs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ category: formCategory, question: formQuestion, answer: formAnswer, submitted_by: "Student" })
            });
            Alert.alert("Submitted", "Pending review.");
            setFormCategory(""); setFormQuestion(""); setFormAnswer("");
            setIsPostModalVisible(false);
        } catch (err) { alert("Failed to post."); }
    };

    const filteredFAQs = selectedCategory === "All" ? faqs : faqs.filter(f => f.category === selectedCategory);

    return (
        <View style={styles.container}>
            {isOffline && (
                <View style={{backgroundColor: Colors.danger, padding: 10, alignItems: 'center'}}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>Offline Mode</Text>
                </View>
            )}

            <View style={styles.headerSection}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                    <Text style={styles.headerTitle}>FAQs</Text>
                    <TouchableOpacity onPress={downloadOfflineHandbook} style={styles.microsoftButton}>
                        {/* FIX: Direct Icon Usage */}
                        <Book size={14} color="white" />
                        <Text style={styles.microsoftButtonText}>Get Handbook (MS 365)</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {categories.map((cat) => (
                        <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)} style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}>
                            <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? <ActivityIndicator size="large" color={Colors.primary} style={{marginTop: 20}}/> : (
                <FlatList
                    data={filteredFAQs}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.faqCard} onPress={() => setSelectedFAQ(item)}>
                            <View style={styles.faqCardHeader}>
                                <Text style={styles.faqCategory}>{item.category}</Text>
                                {/* FIX: Direct Icon Usage */}
                                <CircleArrowRight size={Spacing.m} color={Colors.textMuted || '#888'} />
                            </View>
                            <Text style={styles.faqQuestion}>{item.question}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            <View style={styles.stickyFooter}>
                <Text style={styles.footerText}>Can't find what you're looking for?</Text>
                <TouchableOpacity style={styles.contributeButton} onPress={() => setIsPostModalVisible(true)}>
                    <Text style={styles.contributeButtonText}>Contribute</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={!!selectedFAQ} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.answerModalContent}>
                        <Text style={styles.modalCategory}>{selectedFAQ?.category}</Text>
                        <Text style={styles.modalQuestion}>{selectedFAQ?.question}</Text>
                        <View style={styles.divider} />
                        
                        <View style={{marginBottom: 20}}>
                            <Text style={styles.modalAnswer}>{selectedFAQ?.answer}</Text>
                            
                            {/* AZURE VOICE BUTTON */}
                            <TouchableOpacity 
                                onPress={() => handleAzureSpeech(`Question: ${selectedFAQ?.question}... Answer: ${selectedFAQ?.answer}`)}
                                style={{
                                    marginTop: 15,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 8,
                                    backgroundColor: isSpeaking ? '#ffcccc' : '#e6f2ff',
                                    padding: 10,
                                    borderRadius: 8,
                                    alignSelf: 'flex-start'
                                }}
                            >
                                {isSpeaking ? (
                                    <StopCircle size={20} color={Colors.primary} />
                                ) : (
                                    <Volume2 size={20} color={Colors.primary} />
                                )}
                                <Text style={{color: Colors.primary, fontWeight: 'bold'}}>
                                    {isSpeaking ? "Stop Immersive Reader" : "Listen (Azure AI)"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.closeButton} onPress={() => {
                            Speech.stop();
                            setIsSpeaking(false);
                            setSelectedFAQ(null);
                        }}>
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Post Modal */}
            <Modal visible={isPostModalVisible} animationType="slide">
                 <View style={styles.postModalContainer}>
                    <View style={styles.postModalHeader}>
                        <TouchableOpacity onPress={() => setIsPostModalVisible(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.postForm}>
                        <Text style={styles.formLabel}>Category</Text>
                        <TextInput value={formCategory} onChangeText={setFormCategory} placeholder="Enrollment" style={styles.formInput} />
                        <Text style={styles.formLabel}>Question</Text>
                        <TextInput value={formQuestion} onChangeText={setFormQuestion} placeholder="Question..." style={styles.formInput} multiline />
                        <Text style={styles.formLabel}>Answer</Text>
                        <TextInput value={formAnswer} onChangeText={setFormAnswer} placeholder="Answer..." style={[styles.formInput, styles.textArea]} multiline />
                        <View style={styles.postButtonContainer}>
                            <TouchableOpacity style={styles.postButton} onPress={handlePostContribution}>
                                <Text style={styles.postButtonText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: Colors.background 
    },
    headerSection: {
        padding: Spacing[4],
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.softBlue,
    },
    headerTitle: {
        fontFamily: Typography.fontFamily.header,
        fontSize: Typography["2xl"],
        fontWeight: Typography.fontWeight.bold,
        color: Colors.dark,
        marginBottom: Spacing[3],
        alignSelf: "center"
    },
    categoryScroll: { 
        flexDirection: "row" },
        categoryChip: {
        paddingHorizontal: Spacing[4],
        paddingVertical: Spacing[2],
        borderRadius: Layout.borderRadius.full,
        backgroundColor: Colors.light,
        marginRight: Spacing[2],
        borderWidth: 1,
        borderColor: Colors.softBlue,
    },
    categoryChipActive: { 
        backgroundColor: Colors.primary, 
        borderColor: Colors.primary 
    },
    categoryText: { 
        color: Colors.text, 
        fontFamily: Typography.fontFamily.body 
    },
    categoryTextActive: { 
        color: Colors.surface, 
        fontWeight: "bold" 
    },

    listContent: { 
        padding: Spacing[4], 
        paddingBottom: 120 
    },
    faqCard: {
        backgroundColor: Colors.surface,
        padding: Spacing[4],
        borderRadius: Layout.borderRadius.lg,
        marginBottom: Spacing[3],
        borderWidth: 1,
        borderColor: Colors.softBlue,
        elevation: 2,
    },
    faqCardHeader: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        marginBottom: 4 
    },
    faqCategory: { 
        fontSize: Typography.sm, 
        color: Colors.primary, 
        fontWeight: "bold", 
        textTransform: "uppercase" 
    },
    faqQuestion: { 
        fontSize: 16, 
        fontFamily: Typography.fontFamily.header, 
        color: Colors.dark 
    },

    stickyFooter: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.primary,
        padding: Spacing[4],
        alignItems: "center",
    },
    footerText: { color: Colors.surface, 
        marginBottom: Spacing[2], 
        fontSize: Typography.base,
        fontFamily: Typography.fontFamily.body 
    },
    contributeButton: {
        backgroundColor: Colors.accent,
        paddingHorizontal: Spacing[6],
        paddingVertical: Spacing[3],
        borderRadius: Layout.borderRadius.md,
    },
    contributeButtonText: { 
        color: Colors.dark, 
        fontSize: Typography.base,
        fontFamily: Typography.fontFamily.body,
        fontWeight: Typography.fontWeight.semibold 
    },
    modalOverlay: { 
        flex: 1, 
        backgroundColor: "rgba(0,0,0,0.5)", 
        justifyContent: "center", 
        padding: Spacing[6] 
    },
    answerModalContent: { 
        backgroundColor: Colors.surface, 
        borderRadius: Layout.borderRadius.sm, 
        padding: Spacing[6] 
    },
    modalCategory: { 
        color: Colors.primary, 
        fontWeight: "bold", 
        marginBottom: 4 
    },
    modalQuestion: { 
        fontSize: 20, 
        fontFamily: Typography.fontFamily.header, 
        marginBottom: Spacing[4] 
    },
    divider: { 
        height: 1, 
        backgroundColor: Colors.softBlue, 
        marginBottom: Spacing[4] 
    },
    modalAnswer: { 
        fontSize: 16, 
        lineHeight: 24, 
        color: Colors.text 
    },
    closeButton: { 
        marginTop: Spacing[6], 
        alignItems: "center", 
        padding: Spacing[3], 
        backgroundColor: Colors.light, 
        borderRadius: Layout.borderRadius.md 
    },
    closeButtonText: { 
        color: Colors.primary, 
        fontWeight: "bold" 
    },
    postModalContainer: { 
        flex: 1, 
        backgroundColor: Colors.light 
    },
    postModalHeader: { 
        flexDirection: "row", 
        justifyContent: "space-between", 
        alignItems: 'center',
        paddingHorizontal: Spacing[4], 
        paddingVertical: Spacing[4],
        backgroundColor: Colors.deepNavy,
        borderBottomWidth: 2, 
        borderBottomColor: Colors.deepNavy,
        paddingTop: 60
    },
    cancelText: { 
        fontSize: Typography.base, 
        fontFamily: Typography.fontFamily.header,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.light
    },
    postButtonContainer:{
        width: '100%',
        alignItems: 'flex-end',
    },
    postButton: { 
        backgroundColor: Colors.primary, 
        paddingHorizontal: Spacing[8], 
        paddingVertical: Spacing[2], 
        borderRadius: Layout.borderRadius.full,
        shadowColor: Colors.primary,
    },
    postButtonText: { 
        color: Colors.light, 
        fontWeight: Typography.fontWeight.semibold,
        fontSize: Typography.lg,
    },
    postForm: { 
        padding: Spacing[4] 
    },
    formSection:{
        marginBottom: Spacing[4]
    },
    formLabel: { 
        fontSize: Typography.base, 
        fontFamily: Typography.fontFamily.header,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.primary, 
        marginBottom: Spacing[3],
        marginHorizontal: Spacing[2],

    },
    formInput: { 
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.md,
        paddingHorizontal: Spacing[4], 
        paddingVertical: Spacing[3],
        marginBottom: Spacing[6],
        marginHorizontal: Spacing[1],
        fontSize: Typography.base, 
        color: Colors.dark,
        borderWidth: 3,
        borderColor: Colors.softBlue,
        fontFamily: Typography.fontFamily.body,
    },
    textArea: { 
        minHeight: 120, 
        textAlignVertical: "top", // Essential for Android multiline
        paddingTop: Spacing[3],
    },
    charCount: {
        textAlign: 'right',
        fontSize: Typography.sm,
        color: Colors.textMuted,
        marginRight: Spacing[2],
        marginBottom: Spacing[4]
    },
    banner: {
        position: 'absolute',
        top: 30, // Floating at the top
        left: 20,
        right: 20,
        backgroundColor: '#4CAF50', // Green success color
        padding: Spacing[6],
        borderRadius: 8,
        zIndex: 1000,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        elevation: 5,
    },
    bannerText: {
        color: Colors.light,
        fontWeight: Typography.fontWeight.bold,
        fontSize: Typography.base,
        fontFamily: Typography.fontFamily.header
    },
    
});