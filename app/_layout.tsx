import { Stack } from "expo-router";
import Providers from "./providers";

const LOGIN = "src/login/";
const MAP = "src/map/";
const PROFILE = "src/profile/";

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
        <Stack.Screen
          name={`${LOGIN}login`}
          options={{ title: "Login", headerShown: false }}
        />
        <Stack.Screen
          name={`${LOGIN}create-account/create-account`}
          options={{ title: "CreateAccount", headerShown: false }}
        />
        <Stack.Screen
          name={`${LOGIN}create-account/upload-photo`}
          options={{ title: "Profile photo", headerShown: false }}
        />
        <Stack.Screen
          name={`${LOGIN}create-account/verify-code`}
          options={{ title: "Verify code", headerShown: false }}
        />

        {/** MAP */}

        <Stack.Screen
          name={`${MAP}map`}
          options={{ title: "Map", headerShown: false }}
        />

        {/** PROFILE */}

        <Stack.Screen
          name={`${PROFILE}profile`}
          options={{ title: "Profile", headerShown: false }}
        />
      </Stack>
    </Providers>
  );
}
