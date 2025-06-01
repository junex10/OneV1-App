import { Stack } from 'expo-router';
import Providers from './providers';

const LOGIN = 'src/login/';
const MAP = 'src/map/';

export default function RootLayout() {
    return (
        <Providers>
            <Stack
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="index" />

                {/* Login */}
                <Stack.Screen name={`${LOGIN}login`} options={{ title: 'Login', headerShown: true }}  />
                <Stack.Screen name={`${LOGIN}create-account`} options={{ title: 'CreateAccount', headerShown: true }}  />

                { /** MAP */}

                <Stack.Screen name={`${MAP}map`} options={{ title: 'Map', headerShown: false }}  />

            </Stack>
        </Providers>
    )
}