import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "./../../../resources/utils";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

const messagesMock = [
  {
    id: "1",
    user: "other",
    username: "UpLvL Official Circle",
    text: "Today is gym day for me guys, the 4th day in a row this week",
    time: "15:27",
    type: "text",
  },
  {
    id: "2",
    user: "other",
    username: "AlbertoBD",
    text: "AlbertoBD has sent a task for validation: Arm Workout",
    image:
      "https://images.unsplash.com/photo-1517960413843-0aee8e2d471c?auto=format&fit=crop&w=400&q=80",
    time: "15:30",
    type: "task",
  },
  {
    id: "3",
    user: "other",
    username: "Boris",
    text: "Nice brooo keep it up 💪💪",
    time: "15:32",
    type: "text",
    bold: true,
  },
  {
    id: "4",
    user: "me",
    text: "Thank you!!",
    time: "15:34",
    type: "text",
  },
  {
    id: "5",
    user: "me",
    text: "You too broo",
    time: "15:34",
    type: "text",
  },
];

const Chat: React.FC = () => {
  const [messages, setMessages] = useState(messagesMock);
  const [sendingImage, setSendingImage] = useState(false);
  const [input, setInput] = useState("");
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      {
        id: (messages.length + 1).toString(),
        user: "me",
        text: input,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "text",
      },
    ]);
    setInput("");
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handlePickImage = async () => {
    setSendingImage(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    setSendingImage(false);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selected = result.assets[0];
      setMessages([
        ...messages,
        {
          id: (messages.length + 1).toString(),
          user: "me",
          username: "test",
          text: "",
          image: selected.uri,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "image",
        },
      ]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.user === "me";
    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowRight : styles.messageRowLeft,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.bubbleMe : styles.bubbleOther,
            item.type === "task" && styles.bubbleTask,
          ]}
        >
          {item.username && !isMe && (
            <Text style={styles.senderName}>{item.username}</Text>
          )}
          <Text
            style={[
              styles.messageText,
              item.bold && styles.boldText,
              item.type === "task" && styles.taskText,
            ]}
          >
            {item.text}
          </Text>
          {item.image && (
            <Image
              source={{ uri: item.image }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          )}
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerPicWrapper}>
          <Image
            source={{
              uri: "https://randomuser.me/api/portraits/men/32.jpg",
            }}
            style={styles.headerPic}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>UpLvL Official Circle</Text>
          <Text style={styles.headerSubtitle}>Tap to view details</Text>
        </View>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={styles.attachBtn}
          onPress={handlePickImage}
          disabled={sendingImage}
        >
          <Ionicons name="image-outline" size={26} color={Colors.purple} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#bfc3c9"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={26} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const HEADER_PIC_SIZE = 44;

const styles = StyleSheet.create({
  attachBtn: {
    backgroundColor: "transparent",
    borderRadius: 24,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 18,
    paddingHorizontal: 18,
    backgroundColor: Colors.blue_dark_2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blue_dark,
  },
  headerPicWrapper: {
    marginHorizontal: 12,
    borderRadius: HEADER_PIC_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.purple,
    backgroundColor: "#fff1fa",
    width: HEADER_PIC_SIZE,
    height: HEADER_PIC_SIZE,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  headerPic: {
    width: HEADER_PIC_SIZE,
    height: HEADER_PIC_SIZE,
    borderRadius: HEADER_PIC_SIZE / 2,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  headerSubtitle: {
    color: "#bfc3c9",
    fontSize: 13,
    opacity: 0.8,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-end",
  },
  messageRowLeft: {
    justifyContent: "flex-start",
  },
  messageRowRight: {
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 6,
    backgroundColor: Colors.blue_dark,
    position: "relative",
  },
  bubbleMe: {
    backgroundColor: Colors.blue_dark,
    alignSelf: "flex-end",
  },
  bubbleOther: {
    backgroundColor: "#35344a",
    alignSelf: "flex-start",
  },
  bubbleTask: {
    backgroundColor: Colors.purple,
    marginTop: 4,
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  boldText: {
    fontWeight: "bold",
    color: "#fff",
  },
  taskText: {
    color: "#fff",
  },
  senderName: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 2,
    fontSize: 15,
  },
  messageImage: {
    width: 220,
    height: 120,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 2,
  },
  timeText: {
    color: "#bfc3c9",
    fontSize: 12,
    alignSelf: "flex-end",
    marginTop: 4,
    opacity: 0.7,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.blue_dark_2,
    borderTopWidth: 1,
    borderTopColor: Colors.blue_dark,
  },
  input: {
    flex: 1,
    backgroundColor: "#35344a",
    color: "#fff",
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 24,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Chat;
