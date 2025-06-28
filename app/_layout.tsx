import { Stack } from "expo-router";
import Providers from "./../resources/providers";

const LOGIN = "src/login/";
const MAP = "src/map/";
const PROFILE = "src/profile/";
const CHAT = "src/chat/";
const EVENT = "src/event/";

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
        <Stack.Screen
          name={`${LOGIN}create-account/forgot-password`}
          options={{ title: "Forgot password", headerShown: false }}
        />

        <Stack.Screen
          name={`${LOGIN}create-account/forgot-password-code`}
          options={{ title: "Forgot password code", headerShown: false }}
        />

        <Stack.Screen
          name={`${LOGIN}create-account/new-password`}
          options={{ title: "New password", headerShown: false }}
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

        {/** CHAT */}

        <Stack.Screen
          name={`${CHAT}chat-list`}
          options={{ title: "Chat list", headerShown: false }}
        />
        <Stack.Screen
          name={`${CHAT}chat`}
          options={{ title: "Chat", headerShown: false }}
        />
        <Stack.Screen
          name={`${CHAT}friends-list`}
          options={{ title: "Friends", headerShown: false }}
        />
        <Stack.Screen
          name={`${CHAT}friend-profile`}
          options={{ title: "Friend profile", headerShown: false }}
        />

        {/**  EVENTS */}
        <Stack.Screen
          name={`${EVENT}first-new-event`}
          options={{ title: "New event one", headerShown: false }}
        />
        <Stack.Screen
          name={`${EVENT}second-new-event`}
          options={{ title: "New event second", headerShown: false }}
        />
        <Stack.Screen
          name={`${EVENT}third-new-event`}
          options={{ title: "New event third", headerShown: false }}
        />
        <Stack.Screen
          name={`${EVENT}fourth-new-event`}
          options={{ title: "New event Fourth", headerShown: false }}
        />
        <Stack.Screen
          name={`${EVENT}current-event`}
          options={{ title: "Current event", headerShown: false }}
        />
        <Stack.Screen
          name={`${EVENT}current-event-chat`}
          options={{ title: "Current event chat", headerShown: false }}
        />
        <Stack.Screen
          name={`${EVENT}current-event-list`}
          options={{ title: "Current event chat", headerShown: false }}
        />
      </Stack>
    </Providers>
  );
}
