import { router, useLocalSearchParams, Href } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Spacing, Typography, Layout, Icons } from "../constants/Theme";
import { useEffect, useState } from "react";
import sampleData from "../data/sample-data.json";

interface StoreItem {
    id: string;
    tier: string;
    title: string;
    description: string;
    details?: string[];
    icon: any;
}

interface StoreSection {
    id: string;
    name: string;
    items: StoreItem[];
}

const marketplaceData: StoreSection[] = [
    {
        id: "printing-services",
        name: "Printing Services",
        items: [
            {
                id: "print-1",
                tier: "50 Stardust",
                title: "20 Black & White Pages",
                description: "Print your assignments and reports.",
                details: ["Standard A4 paper", "Same-day pickup"],
                icon: Icons.Printer,
            },
            {
                id: "print-2",
                tier: "100 Stardust",
                title: "10 Color Pages",
                description: "High-quality color printing for presentations.",
                details: ["Glossy finish", "Ideal for visuals"],
                icon: Icons.Printer,
            },
            {
                id: "print-3",
                tier: "150 Stardust",
                title: "Binding Service",
                description: "Professional binding for your thesis and reports.",
                details: ["Includes cover", "Ready in 2 hours"],
                icon: Icons.Printer,
            },
        ],
    },
    {
        id: "food-stall-1",
        name: "Food Stall #1",
        items: [
            {
                id: "food-1",
                tier: "80 Stardust",
                title: "Free Siomai",
                description: "Get a free siomai serving at Master Siomai.",
                details: ["Comes with sauce pack", "Available 11AM-7PM"],
                icon: Icons.Food,
            },
            {
                id: "food-2",
                tier: "120 Stardust",
                title: "Burger Combo",
                description: "Burger with fries and drink.",
                details: ["Choice of drink", "Upgrade to large fries"],
                icon: Icons.Food,
            },
            {
                id: "food-3",
                tier: "100 Stardust",
                title: "Coffee & Pastry",
                description: "Enjoy a coffee with a pastry of your choice.",
                details: ["Select any pastry", "Extra shot optional"],
                icon: Icons.Coffee,
            },
        ],
    },
    {
        id: "cafe",
        name: "Campus Cafe",
        items: [
            {
                id: "cafe-1",
                tier: "150 Stardust",
                title: "Study Pass",
                description: "Reserved seat + drink at the campus cafe.",
                details: ["2-hour reservation", "Includes Wi-Fi token"],
                icon: Icons.Coffee,
            },
            {
                id: "cafe-2",
                tier: "200 Stardust",
                title: "Premium Coffee",
                description: "Artisan coffee with premium beans.",
                details: ["Single-origin beans", "Brewed on demand"],
                icon: Icons.Coffee,
            },
            {
                id: "cafe-3",
                tier: "180 Stardust",
                title: "Snack Combo",
                description: "Coffee, sandwich, and a cookie.",
                details: ["Vegetarian option available", "Swap cookie for brownie"],
                icon: Icons.Coffee,
            },
        ],
    },
    {
        id: "lab-supplies",
        name: "Lab Supplies",
        items: [
            {
                id: "lab-1",
                tier: "300 Stardust",
                title: "Lab Kit Upgrade",
                description: "Upgrade your lab kit with premium supplies.",
                details: ["Includes glassware set", "Reusable tools"],
                icon: Icons.GraduationCap,
            },
            {
                id: "lab-2",
                tier: "250 Stardust",
                title: "Safety Equipment",
                description: "Lab goggles, gloves, and apron set.",
                details: ["Meets campus standards", "Multiple sizes"],
                icon: Icons.GraduationCap,
            },
            {
                id: "lab-3",
                tier: "400 Stardust",
                title: "Complete Lab Set",
                description: "Full lab equipment package for the semester.",
                details: ["Includes consumables", "2-year warranty"],
                icon: Icons.GraduationCap,
            },
        ],
    },
];

export default function MarketplaceScreen() {
    const { from } = useLocalSearchParams<{ from?: string }>();
	
	const adSlides = ["New Partner: Master Siomai!", "Earn points by contributing FAQs", "AI Tutor now supports Python"];
	const [activeAdIndex, setActiveAdIndex] = useState(0);
	
	useEffect(() => {
		const interval = setInterval(() => {
			setActiveAdIndex((prev) => (prev + 1) % adSlides.length);
		}, 4000);
		return () => clearInterval(interval);
	}, []);
	
	const userPoints = sampleData.user?.points || 0;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.navRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => from ? router.push(from as Href) : router.back()}>
                    <Icons.Goto color={Colors.dark} size={24} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Marketplace</Text>
                <View style={{ width: 40 }} />
            </View>
            
            <Text style={styles.subtitle}>Exchange your Stardust points</Text>

			<View style={styles.pointsDisplay}>
                <Icons.Reward color={Colors.accent} size={20} />
                <Text style={styles.pointsAmount}>{userPoints.toLocaleString()}</Text>
                <Text style={styles.pointsLabel}>Stardust Available</Text>
            </View>

			{/* --- ADVERTISEMENT --- */}
			<View style={styles.adContainer}>
				<Text style={styles.adText}>{adSlides[activeAdIndex]}</Text>
				<Text style={styles.adTag}>ADVERTISEMENT</Text>
			</View>

            {marketplaceData.map((section) => (
                <View key={section.id} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.name}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent}>
                        {section.items.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <View key={item.id} style={styles.carouselCard}>
                                    <View style={styles.carouselHeader}>
                                        <View style={styles.iconBubble}>
                                            <IconComponent color={Colors.primary} size={20} />
                                        </View>
                                        <View style={styles.carouselBadge}>
                                            <Text style={styles.carouselBadgeText}>{item.tier}</Text>
                                        </View>
                                    </View>
                                    
                                    <Text style={styles.carouselTitle}>{item.title}</Text>
                                    <Text style={styles.carouselText}>{item.description}</Text>
                                    
                                    <View style={styles.detailsContainer}>
                                        {item.details?.map((detail, idx) => (
                                            <Text key={idx} style={styles.carouselDetail}>• {detail}</Text>
                                        ))}
                                    </View>

                                    <TouchableOpacity style={styles.redeemButton}>
                                        <Text style={styles.redeemButtonText}>Redeem</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    contentContainer: { paddingVertical: 60, paddingHorizontal: 20 },
    navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surface, alignItems: "center", justifyContent: "center", },
    navTitle: { fontFamily: Typography.fontFamily.header, fontSize: Typography["3xl"], fontWeight: Typography.fontWeight.bold, color: Colors.dark },
    subtitle: { fontSize: 16, color: Colors.textMuted, textAlign: "center", marginBottom: 10 },
    pointsDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surface,
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 100,
        marginBottom: Spacing[4],
        borderWidth: 1,
        borderColor: Colors.softBlue,
    },
    pointsAmount: {
        fontFamily: Typography.fontFamily.header,
        fontSize: 18,
        color: Colors.dark,
        marginLeft: 8,
        marginRight: 6
    },
    pointsLabel: {
        fontSize: 12,
        color: Colors.textMuted,
        fontWeight: '500'
    },
	section: { marginBottom: 24 },
    sectionTitle: { fontFamily: Typography.fontFamily.header, fontSize: 20, fontWeight: Typography.fontWeight.semibold, color: Colors.dark, marginBottom: 12 },
    carouselContent: { gap: 16, paddingRight: 20 },
    carouselCard: { width: 240, backgroundColor: Colors.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: Colors.softBlue },
    carouselHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    iconBubble: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.light, alignItems: "center", justifyContent: "center" },
    carouselBadge: { backgroundColor: Colors.accent, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    carouselBadgeText: { fontSize: 11, fontWeight: Typography.fontWeight.bold, color: "#92400E" },
    carouselTitle: { fontFamily: Typography.fontFamily.header, fontSize: 16, color: Colors.dark, marginBottom: 4 },
    carouselText: { fontSize: 13, color: Colors.textMuted, lineHeight: 18, marginBottom: 8 },
    detailsContainer: { flex: 1, marginBottom: 16 },
    carouselDetail: { fontSize: 12, color: Colors.textMuted, marginBottom: 2 },
    redeemButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
    redeemButtonText: { color: Colors.light, fontWeight: "700", fontSize: 14 },
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