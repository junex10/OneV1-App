import React, { useState, useRef, useEffect } from "react";
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
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "./../../../resources/utils";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Storage, CustomModal } from "./../../../resources/utils";
import { ChatService } from "../../../resources/services";
import { useLocalSearchParams } from "expo-router";
import Constants from "expo-constants";
import { socket } from "../../../resources/providers/socket";
import { SocketEvents, eventBus } from "../../../resources/utils/global";
import moment from "moment";
import * as FileSystem from "expo-file-system";
import Video from "react-native-video";

const server = Constants.expoConfig?.extra?.SERVER;

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<any>([]);
  const [sendingImage, setSendingImage] = useState(false);
  const [input, setInput] = useState("");
  const [user, setUser] = useState<any>(null);
  const [chatWith, setChatWith] = useState<any | null>(null);
  const [chatSession, setChatSession] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const { friend } = useLocalSearchParams<any>();
  const friendData = friend ? JSON.parse(friend as string) : null;
  const [showFileError, setShowFileError] = useState(false);
  const [showFileSizeError, setShowFileSizeError] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const MAX_FILE_SIZE_MB = 16;

  useEffect(() => {
    (async () => {
      const getUser = await Storage.get("user");
      setUser(getUser);

      setChatWith(friendData);

      // We verify if we have a chat
      const logs = await ChatService.getLogs({
        user_id: getUser?.user?.id,
        other_user_id: friendData?.id,
      });
      setChatSession(logs?.chats?.chat_session);
      setMessages(logs?.chats?.logs);
    })();

    const handleNewMessage = async (data: any) => {
      const getUser = await Storage.get("user");
      if (
        (getUser?.user?.id === data?.sender_id &&
          friendData?.id === data?.other_user_id) ||
        (getUser?.user?.id === data?.other_user_id &&
          friendData?.id === data?.sender_id)
      ) {
        setMessages(data?.logs);
      }
    };

    eventBus.on(SocketEvents.NEW_MESSAGE, handleNewMessage);
    eventBus.on(SocketEvents.NEW_PIC_MESSAGE, handleNewMessage);

    return () => {
      eventBus.off(SocketEvents.NEW_MESSAGE, handleNewMessage);
      eventBus.off(SocketEvents.NEW_PIC_MESSAGE, handleNewMessage);
    };
  }, []);

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    socket?.emit(SocketEvents.NEW_MESSAGE, {
      chat_session_id: chatSession?.id,
      sender_id: user?.user?.id,
      message: input,
      other_user_id: friendData?.id,
    });

    setInput("");
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handlePickImage = async () => {
    setSendingImage(true);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });
    setSendingImage(false);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selected = result.assets[0];

      const fileInfo = await FileSystem.getInfoAsync(selected.uri);
      let fileSizeMB = 0;
      if (fileInfo.exists && fileInfo.size) {
        fileSizeMB = fileInfo.size / (1024 * 1024);
      }

      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        setShowFileSizeError(true);
        return;
      }

      if (
        selected.mimeType?.startsWith("image/") ||
        selected.mimeType?.startsWith("video/")
      ) {
        const base64 = await FileSystem.readAsStringAsync(selected.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        socket?.emit(SocketEvents.NEW_PIC_MESSAGE, {
          chat_session_id: chatSession?.id,
          sender_id: user?.user?.id,
          other_user_id: friendData?.id,
          attachment: {
            fileName: selected.fileName,
            mimeType: selected.mimeType,
            base64, // send base64 string
          },
        });

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        setShowFileError(true);
      }
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender_id === user?.user?.id;
    const formattedTime = moment(item?.created_at, [
      "HH:mm",
      moment.ISO_8601,
    ]).format("HH:mm a");

    const isVideo =
      item.attachment &&
      (item.attachment.endsWith(".mp4") ||
        item.attachment.endsWith(".mov") ||
        item.attachment.endsWith(".webm") ||
        item.attachment.endsWith(".avi"));

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
          <Text
            style={[
              styles.messageText,
              item.bold && styles.boldText,
              item.type === "task" && styles.taskText,
            ]}
          >
            {item.message}
          </Text>
          {item.attachment && isVideo && (
            <TouchableOpacity
              onPress={() => {
                setSelectedVideo(`${server}/storage/${item.attachment}`);
                setModalVisible(false);
              }}
              activeOpacity={0.8}
            >
              <Video
                source={{ uri: `${server}/storage/${item.attachment}` }}
                style={styles.messageImage}
                paused={true}
                resizeMode="cover"
                muted
              />
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="play-circle" size={48} color="#fff" />
              </View>
            </TouchableOpacity>
          )}
          {item.attachment && !isVideo && (
            <TouchableOpacity
              onPress={() => {
                setSelectedImage(`${server}/storage/${item.attachment}`);
                setModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri: `${server}/storage/${item.attachment}`,
                }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          <Text style={styles.timeText}>{formattedTime}</Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <CustomModal
        visible={showFileError}
        title="Unsupported File"
        message="Please select an image or video file."
        onClose={() => setShowFileError(false)}
        timeout={3000}
      />
      <CustomModal
        visible={showFileSizeError}
        title="File Too Large"
        message="The selected file exceeds the 16MB limit."
        onClose={() => setShowFileSizeError(false)}
        timeout={3000}
      />
      {/* Displays a bigger video */}
      <Modal
        visible={!!selectedVideo}
        transparent={true}
        onRequestClose={() => setSelectedVideo(null)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setSelectedVideo(null)}
        >
          {selectedVideo && (
            <Video
              source={{ uri: selectedVideo }}
              style={{ width: "90%", height: "70%", borderRadius: 12 }}
              resizeMode="contain"
              controls
              paused={false}
            />
          )}
        </Pressable>
      </Modal>

      {/*Display a bigger picture*/}
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setModalVisible(false)}
        >
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={{ width: "90%", height: "70%", resizeMode: "contain" }}
            />
          )}
        </Pressable>
      </Modal>
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
                uri: chatWith?.photo
                  ? `${server}storage/${chatWith?.photo}`
                  : `${server}img/random_location.jpg`,
              }}
              style={styles.headerPic}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/src/chat/friend-profile",
                params: {
                  friend: JSON.stringify(chatWith),
                },
              });
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                {chatWith?.person?.username}
              </Text>
              <Text style={styles.headerSubtitle}>Tap to view details</Text>
            </View>
          </TouchableOpacity>
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
    </>
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
