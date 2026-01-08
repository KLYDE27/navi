import { Award, GraduationCap, Mail, Medal, User, CreditCard } from "lucide-react-native";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import sampleData from "../../data/sample-data.json";

export default function AccountScreen() {
	const userData = sampleData.user;
	const points = userData.points || 0;
	const badgesEarned = Math.floor(points / 500);

	const infoItems = [
		{
			icon: User,
			label: "Name",
			value: userData.name,
		},
		{
			icon: Mail,
			label: "Email",
			value: userData.email,
		},
		{
			icon: GraduationCap,
			label: "Course",
			value: userData.course,
		},
		{
			icon: CreditCard,
			label: "Student ID",
			value: userData.studentId,
		},
	];

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
			<View style={styles.headerCard}>
				<View style={styles.profileSection}>
					<View style={styles.profileImageContainer}>
						{userData.profileImage ? (
							<Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
						) : (
							<View style={styles.profileImagePlaceholder}>
								<Text style={styles.profileImageText}>
									{userData.name
										.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase()}
								</Text>
							</View>
						)}
					</View>
					<View style={styles.profileInfo}>
						<Text style={styles.userName}>{userData.name}</Text>
						<Text style={styles.userEmail}>{userData.email}</Text>
						<Text style={styles.userCourse}>{userData.course}</Text>
					</View>
				</View>

				<View style={styles.statsRow}>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{points.toLocaleString()}</Text>
						<Text style={styles.statLabel}>Points</Text>
					</View>
					<View style={styles.statDivider} />
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{badgesEarned}</Text>
						<Text style={styles.statLabel}>Badges</Text>
					</View>
					<View style={styles.statDivider} />
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{userData.studentId}</Text>
						<Text style={styles.statLabel}>Student ID</Text>
					</View>
				</View>
			</View>

			{badgesEarned > 0 && (
				<View style={styles.badgesSection}>
					<Text style={styles.sectionTitle}>Achievements</Text>
					<View style={styles.badgesContainer}>
						{Array.from({ length: badgesEarned }, (_, index) => (
							<View key={index} style={styles.badgeItem}>
								<View style={styles.badgeIconContainer}>
									<Medal color="#FFD700" size={32} strokeWidth={2} />
								</View>
								<Text style={styles.badgeLabel}>{(index + 1) * 500} pts</Text>
							</View>
						))}
					</View>
				</View>
			)}

			<View style={styles.infoSection}>
				<Text style={styles.sectionTitle}>Personal Information</Text>
				<View style={styles.infoCard}>
					{infoItems.map((item, index) => {
						const IconComponent = item.icon;
						return (
							<View key={index} style={[styles.infoItem, index < infoItems.length - 1 && styles.infoItemBorder]}>
								<View style={styles.infoIconContainer}>
									<IconComponent color="#5B5BFF" size={20} strokeWidth={2} />
								</View>
								<View style={styles.infoContent}>
									<Text style={styles.infoLabel}>{item.label}</Text>
									<Text style={styles.infoValue}>{item.value}</Text>
								</View>
							</View>
						);
					})}
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8F9FA",
	},
	contentContainer: {
		paddingTop: 20,
		paddingBottom: 40,
	},
	headerCard: {
		backgroundColor: "#FFFFFF",
		marginHorizontal: 20,
		marginBottom: 24,
		borderRadius: 20,
		padding: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 12,
		elevation: 3,
	},
	profileSection: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 24,
	},
	profileImageContainer: {
		width: 80,
		height: 80,
		borderRadius: 40,
		overflow: "hidden",
		backgroundColor: "#F8F9FA",
		marginRight: 16,
	},
	profileImage: {
		width: "100%",
		height: "100%",
	},
	profileImagePlaceholder: {
		width: "100%",
		height: "100%",
		backgroundColor: "#5B5BFF",
		alignItems: "center",
		justifyContent: "center",
	},
	profileImageText: {
		fontSize: 28,
		fontWeight: "700",
		color: "#FFFFFF",
		letterSpacing: 1,
	},
	profileInfo: {
		flex: 1,
	},
	userName: {
		fontSize: 22,
		fontWeight: "700",
		color: "#1A1A1A",
		marginBottom: 4,
	},
	userEmail: {
		fontSize: 14,
		color: "#6B7280",
		fontWeight: "400",
		marginBottom: 2,
	},
	userCourse: {
		fontSize: 14,
		color: "#5B5BFF",
		fontWeight: "600",
	},
	statsRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingTop: 24,
		borderTopWidth: 1,
		borderTopColor: "#F3F4F6",
	},
	statItem: {
		flex: 1,
		alignItems: "center",
	},
	statDivider: {
		width: 1,
		height: 40,
		backgroundColor: "#E5E7EB",
	},
	statValue: {
		fontSize: 16,
		fontWeight: "700",
		color: "#1A1A1A",
		marginBottom: 4,
	}, 
	statLabel: {
		fontSize: 12,
		fontWeight: "500",
		color: "#6B7280",
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	badgesSection: {
		paddingHorizontal: 20,
		marginBottom: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#1A1A1A",
		marginBottom: 16,
	},
	badgesContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	badgeItem: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 20,
		borderWidth: 1,
		borderColor: "#F3F4F6",
		alignItems: "center",
		justifyContent: "center",
		minWidth: 110,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	badgeIconContainer: {
		marginBottom: 10,
	},
	badgeLabel: {
		fontSize: 12,
		fontWeight: "600",
		color: "#6B7280",
		textAlign: "center",
	},
	infoSection: {
		paddingHorizontal: 20,
	},
	infoCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 20,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 12,
		elevation: 3,
	},
	infoItem: {
		flexDirection: "row",
		alignItems: "center",
		padding: 20,
	},
	infoItemBorder: {
		borderBottomWidth: 1,
		borderBottomColor: "#F3F4F6",
	},
	infoIconContainer: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: "#F0F0FF",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
	infoContent: {
		flex: 1,
	},
	infoLabel: {
		fontSize: 12,
		fontWeight: "500",
		color: "#9CA3AF",
		marginBottom: 4,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	infoValue: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111827",
	},
});

