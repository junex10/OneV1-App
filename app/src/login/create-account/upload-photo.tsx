import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Colors } from "./../../../resources/global";
import { useLocalSearchParams } from "expo-router";
import { Auth } from "../../../services";

let DEFAULT_PIC: string;

const UploadPhoto: React.FC = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [getUser, setUser] = useState<any>(null);
  const router = useRouter();
  const { user } = useLocalSearchParams();

  useEffect(() => {
    const userData = user ? JSON.parse(user as string) : null;
    DEFAULT_PIC = `https://ui-avatars.com/api/?name=${userData?.username}&background=FD3A73&color=fff&size=256`;
    setUser(userData);
  }, []);

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
        setPhoto(selected.uri);
      } else {
        Alert.alert("Only images are allowed.");
      }
    }
  };

  const handleNext = async () => {
    const formData = new FormData();

    let fileType = "image/jpeg";

    if (photo?.endsWith(".png")) fileType = "image/png";
    else if (photo?.endsWith(".jpg") || photo?.endsWith(".jpeg"))
      fileType = "image/jpeg";
    else if (photo?.endsWith(".webp")) fileType = "image/webp";
    else fileType = "image/*";

    formData.append("email", getUser?.email);
    formData.append("username", getUser?.username);
    formData.append("phone", getUser?.phone);
    formData.append("password", getUser?.password);
    formData.append("password_confirmation", getUser?.password);
    formData.append("photo", {
      uri: photo,
      name: "photo",
      type: fileType,
    } as any);

    const data = {
      ...getUser,
      photo: photo || DEFAULT_PIC,
    };
    // You can pass the photo URI to the next screen here

    const newUser = await Auth.newUser(formData);

    if (newUser) {
      router.push({
        pathname: "/src/login/create-account/verify-code",
        params: {
          user: JSON.stringify(newUser),
        },
      });
    } else {
      Alert.alert("An unknow error has happened");
    }

    // Add the request here
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Your Photo</Text>
      <TouchableOpacity style={styles.picContainer} onPress={pickImage}>
        <Image source={{ uri: photo || DEFAULT_PIC }} style={styles.pic} />
        <View style={styles.cameraIconContainer}>
          <Text style={styles.cameraIcon}>📷</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.infoText}>Tap the photo to upload a new one</Text>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.nextBtn,
          {
            backgroundColor: photo ? Colors.purple : Colors.gray,
          },
        ]}
        onPress={handleNext}
        disabled={!photo}
      >
        <Text style={styles.nextBtnText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const PIC_SIZE = 160;

const styles = StyleSheet.create({
  backBtn: {
    position: "absolute",
    bottom: 100,
    left: 32,
    right: 32,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: Colors.purple,
    marginBottom: 16,
  },
  backBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 32,
  },
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
  infoText: {
    color: "#aaa",
    fontSize: 15,
    marginBottom: 40,
    textAlign: "center",
  },
  nextBtn: {
    position: "absolute",
    bottom: 40,
    left: 32,
    right: 32,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
  },
  nextBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default UploadPhoto;
