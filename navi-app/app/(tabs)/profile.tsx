import { router, Href } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Profile</Text>
				<Text style={styles.subtitle}>Account & preferences</Text>
			</View>
			<TouchableOpacity
				style={styles.card}
				onPress={() => router.push("/account" as Href)}
				activeOpacity={0.85}
			>
				<Text style={styles.cardTitle}>Account</Text>
				<Text style={styles.cardText}>Sign in to sync chats across devices.</Text>
			</TouchableOpacity>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Settings</Text>
				<Text style={styles.cardText}>Theme, notifications, data controls.</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8F9FA",
		padding: 20,
	},
	header: {
		marginTop: 20,
		marginBottom: 24,
	},
	title: {
		fontSize: 32,
		fontWeight: "700",
		color: "#1A1A1A",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#6B7280",
		fontWeight: "400",
	},
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 20,
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1A1A1A",
		marginBottom: 12,
	},
	cardText: {
		fontSize: 14,
		color: "#4B5563",
		marginBottom: 8,
		lineHeight: 20,
	},
});