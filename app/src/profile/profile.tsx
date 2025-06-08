import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import { Colors } from "./../../resources/global";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CustomModal, Storage } from "../../resources";
import { Events } from "../../services";
import Constants from "expo-constants";
import { ProfileService } from "./../../services";
import * as ImagePicker from "expo-image-picker";

const PROFILE_PIC_SIZE = 80;
const { width, height } = Dimensions.get("window");

let DEFAULT_PIC: string;
const Profile: React.FC = () => {
  const DEFAULT_TIMEOUT = 3000;

  const router = useRouter();
  const server = Constants.expoConfig?.extra?.SERVER;
  const formData = new FormData();

  const [tab, setTab] = useState<"events" | "settings">("events");
  const [subscribed, setSubscribe] = useState<boolean>(false); //True = subscribed, false = it isnt
  const [selectedField, setSelectedField] = useState<null | {
    label: string;
    value: string;
  }>(null);
  const [user, setUser] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [success, setSuccess] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [pickingPic, setPickingPic] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const user = await Storage.get("user");
      setUser({
        token: user?.token,
        user: {
          ...user.user,
          photo: `${server}storage/${user.user.photo}`,
        },
      });
      DEFAULT_PIC = `${server}storage/${user.user.photo}`;
      const eventsData = await Events.getEventsByUser({
        user_id: user.user.id,
      });
      if (eventsData.places) {
        setEvents(eventsData.places.rows);
      }
    })();
    if (selectedField) setInputValue(selectedField.value);
  }, [subscribed, selectedField]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Only allow images
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selected = result.assets[0];
      if (selected.type && selected.type.startsWith("image")) {
        let fileType = "image/jpeg";

        if (pickingPic) {
          if (selected.uri?.endsWith(".png")) fileType = "image/png";
          else if (
            selected.uri?.endsWith(".jpg") ||
            selected.uri?.endsWith(".jpeg")
          )
            fileType = "image/jpeg";
          else if (selected.uri?.endsWith(".webp")) fileType = "image/webp";
          else fileType = "image/*";

          formData.append("photo", {
            uri: selected.uri,
            name: "photo",
            type: fileType,
          } as any);
        }
        setPhoto(selected.uri);
        setPickingPic(true); // We show the button to update only the picture
      } else {
        Alert.alert("Only images are allowed.");
      }
    }
  };

  const handleProfileSave = async () => {
    formData.append("id", user?.user?.id);

    switch (selectedField?.label) {
      case "email":
        formData.append("email", inputValue);
        break;
      case "name":
        formData.append("name", inputValue);
        break;
      case "lastname":
        formData.append("lastname", inputValue);
        break;
      case "phone":
        formData.append("phone", inputValue);
        break;
    }

    const updated = await ProfileService.update(formData);
    if (updated?.data) {
      Storage.set("user", updated?.data);
      setSuccess(true);
      setSelectedField(null);
    }
  };

  if (selectedField) {
    return (
      <View style={styles.editContainer}>
        <TouchableOpacity
          onPress={() => setSelectedField(null)}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.fieldEdit}>
          <View style={styles.editFieldRow}>
            <TextInput
              style={styles.editFieldValue}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={selectedField.label}
              placeholderTextColor="#aaa"
              autoFocus
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.8}
          onPress={handleProfileSave}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {success && (
        <CustomModal
          visible={success}
          title="Profile updated!"
          message={"The profile has been update sucessfully!"}
          onClose={() => setSuccess(false)}
          timeout={DEFAULT_TIMEOUT}
        />
      )}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backBtn}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>
      <View style={styles.header}>
        {tab !== "settings" ? (
          <>
            <Image
              source={{
                uri: user?.user?.photo,
              }}
              style={styles.photo}
            />
            <View style={styles.info}>
              <Text style={styles.username}>
                {user?.user?.person?.username}
              </Text>
              <Text style={styles.email}>{user?.user?.email}</Text>
              <View style={styles.addressRow}>
                {/* <Ionicons
              name="location-outline"
              size={15}
              color={Colors.purple}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.address}>{user.address}</Text>*/}
              </View>
              <Text style={styles.subscribers}>
                {user?.person?.subscribers
                  ? Number(user?.user?.person?.subscribers)
                  : 0}{" "}
                subscribers
              </Text>
            </View>
          </>
        ) : (
          <TouchableOpacity style={styles.picContainer} onPress={pickImage}>
            <Image source={{ uri: photo || DEFAULT_PIC }} style={styles.pic} />
            <View style={styles.cameraIconContainer}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
      {/*<TouchableOpacity
        style={[
          styles.subscribeBtn,
          {
            backgroundColor: subscribed ? Colors.gray : Colors.purple,
          },
        ]}
      >
       <View style={styles.subscribeContent}>
          <Text style={styles.subscribeText}>Subscribe</Text>
          {subscribed && (
            <Ionicons
              name="checkmark-outline"
              size={18}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          )}
        </View> Add this to personal subscriber
      </TouchableOpacity>*/}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => {
            setPickingPic(false); // We finished uploading a new pic
            setTab("events");
          }}
        >
          <Text
            style={[styles.tabText, tab === "events" && styles.tabTextActive]}
          >
            Events
          </Text>
          {tab === "events" && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => setTab("settings")}>
          <Text
            style={[styles.tabText, tab === "settings" && styles.tabTextActive]}
          >
            Settings
          </Text>
          {tab === "settings" && <View style={styles.tabUnderline} />}
        </TouchableOpacity>
      </View>
      {tab === "events" ? (
        <>
          {/* First two events side by side */}
          <View style={styles.eventsRow}>
            {events.slice(0, 2).map((item) => (
              <View
                style={[
                  styles.eventCardHalf,
                  {
                    //backgroundColor: Colors.purple, -> Add here the current event
                  },
                ]}
                key={item.id}
              >
                <Image
                  source={{
                    uri: item.main_pic
                      ? `${server}/storage/${item.main_pic}`
                      : `${server}/img/random_location.jpg`,
                  }}
                  style={styles.eventImage}
                />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{item.event_type?.name}</Text>
                  <Text style={styles.eventDesc}>{item.content}</Text>
                  {item.address ? (
                    <View style={styles.eventRow}>
                      <Ionicons
                        name="location-outline"
                        size={15}
                        color={Colors.purple}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.eventAddress} numberOfLines={1}>
                        {item.address}
                      </Text>
                    </View>
                  ) : null}
                  <View style={styles.eventRow}>
                    <Ionicons
                      name="person-outline"
                      size={15}
                      color={Colors.purple}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.eventUsername}>
                      {item.user?.user?.person?.username}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
          {/* The rest as a vertical list */}
          <FlatList
            data={events.slice(2)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.eventCardFull}>
                <Image
                  source={{
                    uri: item.main_pic
                      ? `${server}/storage/${item.main_pic}`
                      : `${server}/img/random_location.jpg`,
                  }}
                  style={styles.eventImage}
                />
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{item.event_type?.name}</Text>
                  <Text style={styles.eventDesc}>{item.content}</Text>
                  {item.address ? (
                    <View style={styles.eventRow}>
                      <Ionicons
                        name="location-outline"
                        size={15}
                        color={Colors.purple}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.eventAddress}>{item.address}</Text>
                    </View>
                  ) : null}
                  <View style={styles.eventRow}>
                    <Ionicons
                      name="person-outline"
                      size={15}
                      color={Colors.purple}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.eventUsername}>
                      {item.user?.user?.person?.username}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            contentContainerStyle={styles.eventsListVertical}
            showsVerticalScrollIndicator={false}
          />
        </>
      ) : (
        <>
          {tab === "settings" && (
            <View style={styles.settingsContainer}>
              <SettingsItem
                label="Email"
                value={user?.user?.email}
                onPress={() =>
                  setSelectedField({
                    label: "email",
                    value: user?.user?.email,
                  })
                }
              />
              <SettingsItem
                label="Name"
                value={user?.user?.person?.name}
                onPress={() =>
                  setSelectedField({
                    label: "name",
                    value: user?.user?.person?.name,
                  })
                }
              />
              <SettingsItem
                label="Lastname"
                value={user?.user?.person?.lastname}
                onPress={() =>
                  setSelectedField({
                    label: "lastname",
                    value: user?.user?.person?.lastname,
                  })
                }
              />
              <SettingsItem
                label="Phone"
                value={user?.user?.person?.phone}
                onPress={() =>
                  setSelectedField({
                    label: "phone",
                    value: user?.user?.person?.phone,
                  })
                }
              />
              {pickingPic && (
                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    {
                      bottom: -160,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={handleProfileSave}
                >
                  <Text style={styles.saveBtnText}>Save</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
};

// Update SettingsItem to accept onPress:
const SettingsItem = ({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.settingsItem}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <View>
      <Text style={styles.settingsLabel}>{label}</Text>
      <Text style={styles.settingsValue}>{value}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={Colors.purple} />
  </TouchableOpacity>
);
const PIC_SIZE = 160;
const styles = StyleSheet.create({
  picContainer: {
    width: PIC_SIZE,
    height: PIC_SIZE,
    borderRadius: PIC_SIZE / 2,
    backgroundColor: Colors.blue_dark,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 4,
    borderColor: Colors.purple,
    marginBottom: 16,
    alignSelf: "center",
    position: "relative",
  },
  pic: {
    width: PIC_SIZE,
    height: PIC_SIZE,
    borderRadius: PIC_SIZE / 2,
    resizeMode: "cover",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    elevation: 2,
  },
  cameraIcon: {
    fontSize: 20,
    color: Colors.purple,
  },
  saveBtn: {
    position: "absolute",
    bottom: 40,
    left: 32,
    right: 32,
    backgroundColor: Colors.purple,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  fieldEdit: {
    top: 60,
  },
  editContainer: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
    paddingTop: 48,
  },
  editHint: {
    color: "#bfc3c9",
    fontSize: 13,
    textAlign: "center",
    marginTop: 18,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  editFieldRow: {
    backgroundColor: Colors.blue_dark_2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blue_dark,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  editFieldValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  eventsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  eventCardHalf: {
    width: (width - 24 * 2 - 12) / 2, // 2 cards with 12px gap
    backgroundColor: Colors.blue_dark,
    borderRadius: 16,
    marginRight: 12,
    padding: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  eventCardFull: {
    width: width - 48,
    alignSelf: "center",
    backgroundColor: Colors.blue_dark,
    borderRadius: 16,
    marginBottom: 16,
    padding: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  eventsListVertical: {
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
    paddingTop: 48,
    paddingHorizontal: 0,
  },
  backBtn: {
    position: "absolute",
    top: 48,
    left: 24,
    backgroundColor: Colors.purple,
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
    alignSelf: "center",
  },
  photo: {
    width: PROFILE_PIC_SIZE,
    height: PROFILE_PIC_SIZE,
    borderRadius: PROFILE_PIC_SIZE / 2,
    borderWidth: 3,
    borderColor: Colors.purple,
    backgroundColor: "#fff1fa",
    marginRight: 18,
  },
  info: {
    justifyContent: "center",
  },
  username: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
  },
  email: {
    color: Colors.purple,
    fontSize: 15,
    fontWeight: "500",
  },
  subscribers: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
    opacity: 0.7,
  },
  subscribeBtn: {
    flexDirection: "row",
    alignSelf: "center",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 36,
    marginBottom: 18,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 8,
    marginTop: 8,
  },
  tab: {
    marginHorizontal: 18,
    alignItems: "center",
  },
  tabText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    opacity: 0.7,
  },
  tabTextActive: {
    color: Colors.purple,
    opacity: 1,
  },
  tabUnderline: {
    marginTop: 3,
    height: 3,
    width: 32,
    backgroundColor: Colors.purple,
    borderRadius: 2,
  },
  eventsList: {
    paddingLeft: 24,
    paddingVertical: 12,
  },
  eventCard: {
    width: width * 0.6,
    height: 300,
    backgroundColor: Colors.blue_dark,
    borderRadius: 16,
    marginRight: 18,
    padding: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  eventImage: {
    width: "100%",
    height: 110,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  eventInfo: {
    padding: 12,
  },
  eventTitle: {
    color: Colors.purple,
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  eventDesc: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.85,
    marginBottom: 4,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  eventAddress: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.8,
  },
  eventUsername: {
    color: Colors.purple,
    fontSize: 13,
    marginLeft: 2,
    opacity: 0.9,
  },
  settingsContainer: {
    paddingHorizontal: 0,
    paddingTop: 18,
    backgroundColor: "transparent",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blue_dark,
    backgroundColor: Colors.blue_dark_2,
  },
  settingsLabel: {
    color: Colors.purple,
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  settingsValue: {
    color: "#fff",
    fontSize: 15,
    opacity: 0.85,
  },
  fieldWrapper: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: Colors.purple,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  fieldValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 2,
  },
  address: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.8,
  },
});

export default Profile;
