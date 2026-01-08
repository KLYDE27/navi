import { Stack } from "expo-router";
import { Colors, Typography } from "../../constants/Theme";

export default function AssistantsLayout() {
    return (
        <Stack
			screenOptions={{
				headerTitleAlign: "center",
                headerTitleStyle: {
                    fontFamily: Typography.fontFamily.brand,
                    fontSize: Typography.lg,
                },
                headerShadowVisible: false,
			}}
			>
			<Stack.Screen
				name="campus-navigator"
				options={{ 
				title: "Campus Navigator",
				headerStyle: { backgroundColor: Colors.accent }, // Palette Yellow
				headerTintColor: Colors.dark 
				}}
			/>
			<Stack.Screen
				name="ai-tutor/[subjectId]"
				options={{ 
				title: "AI Tutor",
				headerStyle: { backgroundColor: Colors.deepNavy }, // Palette Navy
				headerTintColor: '#FFFFFF' 
				}}
			/>
		</Stack>
    );
}