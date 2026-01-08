import { useNavigation, useRouter } from "expo-router";
import { BookOpen, Calculator, Code, FlaskConical, Globe, GraduationCap, Search } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import sampleData from "../../data/sample-data.json";
import { Colors, Spacing, Typography, Layout, Icons } from "../../constants/Theme";

interface SubjectData {
	id: string;
	name: string;
	icon: string;
	description: string;
}

interface Subject {
	id: string;
	name: string;
	icon: React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;
	description: string;
}

const iconMap: Record<string, React.ComponentType<{ color?: string; size?: number; strokeWidth?: number }>> = {
	Calculator,
	FlaskConical,
	BookOpen,
	Globe,
	Code,
	GraduationCap,
};

const getSubjects = (): Subject[] => {
	return (sampleData.subjects as SubjectData[]).map((subject) => ({
		...subject,
		icon: iconMap[subject.icon] || GraduationCap,
	}));
};

export default function AITutorScreen() {
	const navigation = useNavigation();
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const subjects = useMemo(() => getSubjects(), []);
	const [filteredSubjects, setFilteredSubjects] = useState(subjects);

	useEffect(() => {
		navigation.setOptions({ title: "AI Tutor" });
	}, [navigation]);

	useEffect(() => {
		if (searchQuery.trim() === "") {
			setFilteredSubjects(subjects);
		} else {
			const query = searchQuery.toLowerCase();
			setFilteredSubjects(
				subjects.filter(
					(subject) =>
						subject.name.toLowerCase().includes(query) ||
						subject.description.toLowerCase().includes(query)
				)
			);
		}
	}, [searchQuery]);

	const handleSubjectPress = (subjectId: string) => {
		router.push(`/assistants/ai-tutor/${subjectId}`);
	};

	const renderSubject = ({ item }: { item: Subject }) => {
		const IconComponent = item.icon;
		return (
			<TouchableOpacity style={styles.subjectCard} onPress={() => handleSubjectPress(item.id)}>
				<View style={styles.subjectCardContent}>
					<View style={styles.subjectIconContainer}>
						<item.icon color={Colors.primary} size={Spacing[6]} />
					</View>
					<View style={styles.subjectTextContainer}>
						<Text style={styles.subjectName}>{item.name}</Text>
						<Text style={styles.subjectDescription}>{item.description}</Text>
					</View>
					<Icons.GotoCircle color={Colors.deepNavy} size={Spacing[6]} />
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.searchContainer}>
				<View style={styles.searchBar}>
					<Search color="#9CA3AF" size={14} strokeWidth={2} style={styles.searchIcon} />
					<TextInput
						style={styles.searchInput}
						placeholder="Search subjects..."
						placeholderTextColor="#9CA3AF"
						value={searchQuery}
						onChangeText={setSearchQuery}
						returnKeyType="search"
					/>
				</View>
			</View>

			{filteredSubjects.length === 0 ? (
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>No subjects found</Text>
					<Text style={styles.emptySubtext}>Try a different search term</Text>
				</View>
			) : (
				<FlatList
					data={filteredSubjects}
					renderItem={renderSubject}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContent}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F8F9FA",
	},
	searchContainer: {
		paddingHorizontal: 20,
		paddingTop: 16,
		paddingBottom: 12,
		backgroundColor: "#FFFFFF",
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F3F4F6",
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 4,
	},
	searchIcon: {
		marginRight: 10,
	},
	searchInput: {
		flex: 1,
		fontSize: 16,
		color: "#111827",
	},
	listContent: {
		padding: 20,
		paddingTop: 16,
	},
	subjectCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	subjectCardContent: {
		flexDirection: "row",
		alignItems: "center",
		padding: 20,
	},
	subjectIconContainer: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: "#F0F0FF",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
	subjectTextContainer: {
		flex: 1,
	},
	subjectName: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1A1A1A",
		marginBottom: 4,
	},
	subjectDescription: {
		fontSize: 14,
		color: "#6B7280",
		lineHeight: 20,
	},
	emptyContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 40,
	},
	emptyText: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1A1A1A",
		marginBottom: 8,
	},
	emptySubtext: {
		fontSize: 14,
		color: "#6B7280",
	},
});

