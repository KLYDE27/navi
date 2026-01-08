import React, { useState, useMemo, useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Platform, ActivityIndicator } from "react-native";
import { Colors, Spacing, Typography, Layout, Icons } from "../../constants/Theme";

// 📍 API URL
const API_BASE = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";

interface FAQItem {
    id: number;
    question: string;
    answer: string;
    submitted_by: string; // matches DB column
    created_at: string;
    status: 'pending' | 'approved' | 'disapproved';
}

export default function AdminScreen() {
    const [allFaqs, setAllFaqs] = useState<FAQItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('All');
    const [viewingDetail, setViewingDetail] = useState<FAQItem | null>(null);

    // 1. Fetch All Data
    const fetchAdminData = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/faqs/admin`);
            const data = await res.json();
            setAllFaqs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAdminData(); }, []);

    // 2. Filter locally based on Tab
    const filteredData = useMemo(() => {
        if (selectedTab === 'All') return allFaqs; // ✅ CORRECT: Uses real data
        return allFaqs.filter(item => item.status.toLowerCase() === selectedTab.toLowerCase());
    }, [selectedTab, allFaqs]);

    // 3. Handle Approve/Disapprove
    const handleAction = async (type: 'approve' | 'disapprove') => {
        if (!viewingDetail) return;
        
        const newStatus = type === 'approve' ? 'approved' : 'disapproved';
        
        try {
            // Update Backend
            await fetch(`${API_BASE}/api/faqs/${viewingDetail.id}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            // Update Local State (Optimistic UI)
            setAllFaqs(prev => prev.map(item => 
                item.id === viewingDetail.id ? { ...item, status: newStatus } : item
            ));

            Alert.alert("Success", `Submission marked as ${newStatus}`);
            setViewingDetail(null); // Go back to list

        } catch (error) {
            Alert.alert("Error", "Failed to update status");
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;

    if (!viewingDetail) {
        return (
            <View style={styles.container}>
                <View style={styles.contentWrapper}>
                    <View style={styles.header}>
                        <View style={styles.iconCircle}><Icons.FAQs color={Colors.light} size={20} /></View>
                        <Text style={styles.headerTitle}>Q&A Management</Text>
                    </View>

                    <View style={{ height: 50 }}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabBar}>
                            {['All', 'Pending', 'Approved', 'Disapproved'].map(tab => (
                                <TouchableOpacity 
                                    key={tab} 
                                    style={[styles.tabItem, selectedTab === tab && styles.tabItemActive]}
                                    onPress={() => setSelectedTab(tab)}
                                >
                                    <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>{tab}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                        {filteredData.map(item => (
                            <View key={item.id} style={styles.card}>
                                <Text style={styles.cardTitle}>{item.question}</Text>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.cardMeta}>By {item.submitted_by}</Text>
                                    <Text style={[styles.statusTag, { color: item.status === 'pending' ? 'orange' : item.status === 'approved' ? 'green' : 'red' }]}>
                                        {item.status.toUpperCase()}
                                    </Text>
                                </View>
                                <TouchableOpacity 
                                    style={styles.viewDetailsBtn}
                                    onPress={() => setViewingDetail(item)}
                                >
                                    <Text style={styles.viewDetailsText}>View Details</Text>
                                    <Icons.Goto size={14} color={Colors.primary} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: Colors.surface }]}>
            {/* Header */}
            <View style={styles.detailHeader}>
                <TouchableOpacity onPress={() => setViewingDetail(null)} style={styles.backBtn}>
                    <Icons.Goto color={Colors.dark} size={Spacing[6]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Review Submission</Text>
            </View>
    
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.detailBody}>
                <View style={styles.detailCard}>
                    <Text style={styles.detailLabel}>Full Submission</Text>
                    <Text style={styles.cardMeta}>Author: {viewingDetail.submitted_by}</Text>
                    <Text style={styles.cardMeta}>Status: {viewingDetail.status}</Text>
                    
                    <Text style={styles.inputLabel}>Question</Text>
                    <View style={styles.readOnlyBox}>
                        <Text style={styles.readOnlyText}>{viewingDetail.question}</Text>
                    </View>
    
                    <Text style={styles.inputLabel}>Answer</Text>
                    <View style={[styles.readOnlyBox, { minHeight: 180 }]}>
                        <Text style={styles.readOnlyText}>{viewingDetail.answer}</Text>
                    </View>
                </View>
            </ScrollView>
    
            {/* Only show buttons if the item is Pending */}
            {viewingDetail.status === 'pending' && (
                <View style={[styles.actionRow, { paddingBottom: 20 }]}>
                    <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#10B981' }]} 
                        onPress={() => handleAction("approve")}
                    >
                        <Text style={styles.buttonText}>Approve</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: Colors.danger }]} 
                        onPress={() => handleAction("disapprove")}
                    >
                        <Text style={styles.buttonText}>Decline</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, paddingTop: 60 },
    contentWrapper: { flex: 1, paddingHorizontal: 20 },
    header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.dark },
    iconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },

    tabBar: { flexDirection: 'row', marginBottom: 15 },
    tabItem: { paddingHorizontal: 15, height: 35, justifyContent: 'center', borderRadius: 18, marginRight: 8, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.softBlue },
    tabItemActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    tabText: { fontSize: 13, color: Colors.textMuted },
    tabTextActive: { color: Colors.light, fontWeight: '700' },

    card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.softBlue },
    cardTitle: { fontWeight: '700', fontSize: 16, color: Colors.dark },
    cardMeta: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
    viewDetailsBtn: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 5 },
    viewDetailsText: { color: Colors.primary, fontWeight: '600', fontSize: 14 },

    detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.softBlue },
    backBtn: { width: 30, height: 30, justifyContent: 'center', color: Colors.dark },
    detailBody: { padding: 20, paddingBottom: 40 },
    detailCard: { gap: 5 },
    detailLabel: { fontSize: 22, fontWeight: 'bold', color: Colors.dark },
    inputLabel: { fontSize: 12, fontWeight: '800', color: Colors.textMuted, marginTop: 20, textTransform: 'uppercase' },
    
    readOnlyBox: { backgroundColor: Colors.background, borderRadius: 10, padding: 15, marginTop: 8, borderWidth: 1, borderColor: Colors.softBlue },
    readOnlyText: { color: Colors.dark, fontSize: 15, lineHeight: 22 },

    adCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.softBlue, padding: 15, borderRadius: 10, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.primary, marginTop: 10 },
    adTitle: { fontWeight: 'bold', color: Colors.primary },
    adSubtitle: { fontSize: 11, color: Colors.textMuted },

    actionRow: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: Colors.softBlue, backgroundColor: Colors.surface },
    actionButton: { flex: 1, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: Colors.light, fontWeight: 'bold', fontSize: 16 }
});