import { Tabs, router, Href, usePathname } from "expo-router";
import { Image, Text, TouchableOpacity, View, StyleSheet, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { Colors, Spacing, Typography, Layout, Icons } from "../../constants/Theme";
import sampleData from "../../data/sample-data.json";

// Dummy fetch function to simulate API call
const fetchUserPoints = async (): Promise<number> => {
	return new Promise((resolve) => {
		setTimeout(() => {
			// Hardcoded points value
			resolve(sampleData.user.points);
		}, 500); // Simulate 500ms loading time
	});
};

function PointsButton() {
	const [points, setPoints] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const pathname = usePathname();

	useEffect(() => {
		const loadPoints = async () => {
			setIsLoading(true);
			try {
				const userPoints = await fetchUserPoints();
				setPoints(userPoints);
			} catch (error) {
				console.error("Failed to fetch points:", error);
				setPoints(0);
			} finally {
				setIsLoading(false);
			}
		};

		loadPoints();
	}, []);

	return (
		<TouchableOpacity
			style={styles.pointsButton}
			onPress={() => {
				router.push({
					pathname: "/marketplace",
					params: { from: pathname ?? "/(tabs)/home" },
				} as Href);
			}}
		>
			{isLoading ? (
				<ActivityIndicator size="small" color={Colors.accent} />
			) : (
				<>
					<Text style={styles.pointsText}>{points}</Text>
					<Icons.Points color={Colors.light} size={Spacing[4]} strokeWidth={3} />
				</>
			)}
		</TouchableOpacity>
	);
}

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: true,
				headerTitle: "", // We leave this empty to use the Left slot instead
				headerLeft: () => (
				<View style={styles.headerLeftContainer}>
					<Image 
					source={require("../../assets/images/navi-logo.png")} 
					style={styles.logo} 
					resizeMode="contain"
					/>
					<Text style={styles.brandName}>NAVI</Text>
				</View>
				),
				headerRight: () => <PointsButton />,
				headerStyle: { 
					backgroundColor: Colors.surface,
					borderBottomWidth: 2,
					borderBottomColor: Colors.primary,
				},
				headerShadowVisible: true,
				tabBarActiveTintColor: Colors.primary,
				tabBarInactiveTintColor: Colors.textMuted,
				tabBarStyle: {
					backgroundColor: Colors.surface,
					borderTopColor: Colors.softBlue,
					height: 60,
					paddingTop: Spacing[1]
				},
			}}
		>
			<Tabs.Screen
				name="home"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => <Icons.Home color={color} size={Spacing[6]} strokeWidth={2} />,
				}}
			/>
			<Tabs.Screen
				name="chats"
				options={{
					title: "Chats",
					tabBarIcon: ({ color }) => <Icons.AI color={color} size={Spacing[8]} strokeWidth={2} />,
				}}
			/>
			<Tabs.Screen
				name="community"
				options={{
				title: "Community",
				tabBarIcon: ({ color }) => <Icons.FAQs color={color} size={Spacing[6]} strokeWidth={2} />,
				}}
			/>
			<Tabs.Screen
				name="share"
				options={{
					title: "Share",
					tabBarIcon: ({ color }) => <Icons.Share color={color} size={Spacing[6]} strokeWidth={2} />,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profile",
					tabBarIcon: ({ color }) => <Icons.Profile color={color} size={Spacing[6]} strokeWidth={2} />,
				}}
			/>
			<Tabs.Screen
				name="admin"
				options={{
					title: "Admin",
					tabBarIcon: ({ color }) => <Icons.Admin color={color} size={Spacing[6]} strokeWidth={2} />,
				}}
			/>
		</Tabs>
	);
}

const styles = StyleSheet.create({
	headerLeftContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: Spacing[4], 
        gap: Spacing[2], 
    },
	logo: {
        width: 32, 
        height: 32,
    },
    brandName: {
		fontFamily: Typography.fontFamily.brand,
        fontSize: Typography["2xl"],
        fontWeight: Typography.fontWeight.bold,
        color: Colors.primary,
        letterSpacing: 0.5,
    },
	pointsButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: Spacing[2],
		marginRight: Spacing[4],
		paddingHorizontal: Spacing[3],
		paddingVertical: Spacing[1],
		backgroundColor: Colors.primary,
		borderRadius: Layout.borderRadius.sm,
	},
	pointsText: {
		fontFamily: Typography.fontFamily.header,
		fontSize: Typography.base,
		fontWeight: Typography.fontWeight.bold,
		letterSpacing: 1,
		color: Colors.light,
	},
});
