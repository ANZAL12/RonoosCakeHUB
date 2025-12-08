import { Stack } from "expo-router";

export default function AddressLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title: 'My Addresses' }} />
            <Stack.Screen name="add" options={{ title: 'Add Address' }} />
        </Stack>
    );
}
