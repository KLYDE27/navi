import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
// Import your sample data
import sampleData from "../../data/sample-data.json";
import { Colors, Spacing, Typography, Layout, Icons } from "../../constants/Theme";

const staticRewards = [
    { id: "r1", title: "Master Siomai Treat", points: "100" },
    { id: "r2", title: "Potato Corner Large", points: "150" },
    { id: "r3", title: "Zagu Free Pearl", points: "200" },
    { id: "r4", title: "Cafe Study Pass", points: "250" },
];

const quickPrompts = [
    { id: "qp1", title: "Enrollment", type: "navigator", prompt: "Steps for enrollment?" },
    { id: "qp3", title: "Clinic", type: "navigator", prompt: "Where is the clinic?" },
    { id: "qp5", title: "Library", type: "navigator", prompt: "Library hours today?" }
];

export default function HomeScreen() {
    // Logic for Ads
    const adSlides = ["New Partner: Master Siomai!", "Earn points by contributing FAQs", "AI Tutor now supports Python"];
    const [activeAdIndex, setActiveAdIndex] = useState(0);
    
    const userPoints = sampleData.user?.points || 0;

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveAdIndex((prev) => (prev + 1) % adSlides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            
            {/* --- AI ASSISTANTS --- */}
            <Text style={styles.sectionHeader}>AI Assistants</Text>
            <View style={styles.assistantGrid}>
                <TouchableOpacity 
                    style={[styles.assistantCard, { backgroundColor: Colors.accent }]}
                    onPress={() => router.push("/assistants/campus-navigator")}
                >
                    <Icons.Location color={Colors.dark} size={32} />
                    <Text style={[styles.cardLabel, { color: Colors.dark }]}>Campus Navigator</Text>
                    <Text style={[styles.cardSubtitle, { color: Colors.dark }]}>School maps & policies</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.assistantCard, { backgroundColor: Colors.primary }]}
                    onPress={() => router.push("/assistants/ai-tutor")}
                >
                    <Icons.Book color={Colors.light} size={32} />
                    <Text style={[styles.cardLabel, { color: Colors.light }]}>AI Tutor</Text>
                    <Text style={[styles.cardSubtitle, { color: Colors.light }]}>Homework & study help</Text>
                </TouchableOpacity>
            </View>

            {/* --- QUICK PROMPTS --- */}
            <View style={styles.promptGrid}>
                {quickPrompts.map((item) => (
                    <TouchableOpacity 
                        key={item.id} 
                        style={styles.promptTile}
                        onPress={() => router.push({
                            pathname: item.type === "navigator" ? "/assistants/campus-navigator" : "/assistants/ai-tutor",
                            params: { initialPrompt: item.prompt }
                        })}
                    >
                        <View style={[
                            styles.miniIconBubble, 
                            { backgroundColor: item.type === "navigator" ? Colors.accent : Colors.primary }
                        ]}>
                            {item.type === "navigator" ? (
                                <Icons.Location color={Colors.dark} size={Spacing[3]} />
                            ) : (
                                <Icons.Book color={Colors.light} size={Spacing[3]} />
                            )}
                        </View>
                        <Text style={styles.promptTileLabel} numberOfLines={1}>{item.title}</Text>
                        <Text style={styles.promptSubtitle} numberOfLines={2}>{item.prompt}</Text>

                    </TouchableOpacity>
                ))}
            </View>

            {/* --- EARN POINTS --- */}
            <Text style={styles.sectionHeader}>Earn Points</Text>
            <View style={styles.questCard}>
                <View style={styles.questInfo}>
                    <Icons.Points color={Colors.accent} size={28} />
                    <View style={styles.questTextContainer}>
                        <Text style={styles.totalPointsText}>{userPoints.toLocaleString()} Stardust</Text>
                        <Text style={styles.questSubtext}>Complete tasks to earn more</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.questButton} onPress={() => router.push("/marketplace")}>
                    <Text style={styles.questButtonText}>Quests</Text>
                </TouchableOpacity>
            </View>


            {/* --- REWARDS --- */}
            <Text style={styles.sectionHeader}>Redeem Rewards</Text>
            
            {/* --- ADVERTISEMENT --- */}
            <View style={styles.adContainer}>
                <Text style={styles.adText}>{adSlides[activeAdIndex]}</Text>
                <Text style={styles.adTag}>ADVERTISEMENT</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {staticRewards.map((reward) => (
                    <TouchableOpacity 
                        key={reward.id} 
                        style={styles.rewardCard}
                        onPress={() => router.push("/marketplace")}
                    >
                        <View style={styles.rewardImagePlaceholder}>
                            <Icons.Points color={Colors.accent} size={24} />
                        </View>
                        <Text style={styles.rewardTitle} numberOfLines={1}>{reward.title}</Text>
                        <Text style={styles.rewardPoints}>{reward.points} pts</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    contentContainer: { paddingTop: 20, paddingBottom: 20 },
    sectionHeader: {
        fontFamily: Typography.fontFamily.header,
        fontWeight: Typography.fontWeight.bold,
        fontSize: Typography["2xl"],
        color: Colors.dark,
        marginHorizontal: Spacing[4],
        marginBottom: Spacing[3],
        marginTop: Spacing[4],
    },
    assistantGrid: {
        flexDirection: 'row',
        paddingHorizontal: Spacing[4],
        justifyContent: 'space-between',
    },
    assistantCard: {
        width: '48%',
        height: 140, // Increased slightly to fit the subtitle
        borderRadius: Layout.borderRadius.lg,
        padding: Spacing[4],
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.softBlue
    },
    cardLabel: {
        fontFamily: Typography.fontFamily.header,
        fontSize: 15,
        marginTop: Spacing[2],
        textAlign: 'center',
    },
    cardSubtitle: {
        fontFamily: Typography.fontFamily.body,
        fontSize: 11,
        textAlign: 'center',
        marginTop: 4,
        opacity: 0.8,
    },
    promptGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: Spacing[4],
        justifyContent: 'space-between',
        marginTop: Spacing[3],
        gap: 8, // Gap between rows/columns
    },
    promptTile: {
        width: '31%', // Fits 3 columns with gaps
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.md,
        padding: Spacing[3],
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.softBlue,
        marginBottom: 4,
    },
    miniIconBubble: {
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    promptTileLabel: {
        fontFamily: Typography.fontFamily.body,
        fontSize: Typography.sm,
        color: Colors.dark,
        fontWeight: '600',
        textAlign: 'center',
    },
    promptSubtitle: {
        fontFamily: Typography.fontFamily.body,
        fontSize: Typography.xs,
        color: Colors.textMuted,
        fontWeight: Typography.fontWeight.normal,
        textAlign: 'center',
    },
    questCard: {
        marginHorizontal: Spacing[4],
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        padding: Spacing[4],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: Colors.softBlue,
        marginBottom: Spacing[3]
    },
    questInfo: { flexDirection: 'row', alignItems: 'center' },
    questTextContainer: { marginLeft: Spacing[3] },
    totalPointsText: {
        fontFamily: Typography.fontFamily.header,
        fontSize: 18,
        color: Colors.dark,
    },
    questSubtext: {
        fontFamily: Typography.fontFamily.body,
        fontSize: 12,
        color: Colors.textMuted,
    },
    questButton: {
        backgroundColor: Colors.dark,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: Layout.borderRadius.md,
    },
    questButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
    horizontalScroll: { paddingLeft: Spacing[4] },
    rewardCard: {
        width: 150,
        backgroundColor: Colors.surface,
        borderRadius: Layout.borderRadius.lg,
        marginRight: Spacing[3],
        padding: Spacing[3],
        borderWidth: 1,
        borderColor: Colors.softBlue,
    },
    rewardImagePlaceholder: {
        width: '100%',
        height: 70,
        backgroundColor: Colors.navy,
        borderRadius: Layout.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing[2],
    },
    rewardTitle: { fontFamily: Typography.fontFamily.header, fontSize: Typography.base, color: Colors.dark },
    rewardPoints: { fontFamily: Typography.fontFamily.header, fontSize: Typography.sm, color: Colors.primary },
    adContainer: {
        marginHorizontal: Spacing[6],
        marginVertical: Spacing[2],
        backgroundColor: Colors.deepNavy,
        borderRadius: Layout.borderRadius.lg,
        padding: Spacing[4],
        minHeight: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    adTag: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold',  marginTop: Spacing[3] },
    adText: { color: '#FFF', fontFamily: Typography.fontFamily.header, fontSize: 16, textAlign: 'center' },
});