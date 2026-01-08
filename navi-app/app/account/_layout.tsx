import { Stack } from "expo-router";

export default function AccountLayout() {
	return (
		<Stack
			screenOptions={{
				headerTitleAlign: "center",
				headerStyle: { backgroundColor: "#FFFFFF" },
				headerShadowVisible: true,
			}}
		>
			<Stack.Screen
				name="index"
				options={{ title: "My Account" }}
			/>
		</Stack>
	);
}

