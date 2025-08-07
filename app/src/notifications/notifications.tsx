import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  eventBus,
  SocketEvents,
} from "./../../../resources/utils/global";
import { useRouter } from "expo-router";
import { Notifications } from "../../../resources/services";
import { Storage } from "../../../resources/utils";
import { socket } from "../../../resources/providers/socket";

import moment from "moment";

const NOTIFICATIONS_STATUS = {
  READED: 1,
  UNREADED: 0,
};

const NOTIFICATIONS_TYPES = {
  NEW_MESSAGE: 6,
  NEW_EVENT: 7,
  NEW_INVITATION: 8,
};

const NotificationsScreen: React.FC = () => {
  const router = useRouter();

  const [notifications, setNotifications] = useState<any>([]);
  const [eventsOnGoing, setEventsOnGoing] = useState<any>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const getUser = await Storage.get("user");

      const notifications = await Notifications.getNotifications({
        user_id: getUser?.user?.id,
      });

      setNotifications(notifications?.notifications);

      const eventIds = notifications?.notifications
        .filter(
          (notif: any) =>
            notif.event_id !== undefined && notif.event_id !== null
        )
        .map((notif: any) => notif.event_id);
      // Save unique event IDs in eventsOnGoing state
      setEventsOnGoing(Array.from(new Set(eventIds)));

      setTimeout(async () => {
        socket?.emit(SocketEvents.NOTIFICATIONS.READ, {
          user_id: getUser?.user?.id,
        });
      }, 1000);
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    // We get new notification so we update

    const handleNewNotification = (data: any) => {
      setNotifications(data);
    };

    eventBus.on(SocketEvents.NOTIFICATIONS.NEW_MESSAGE, handleNewNotification);

    return () => {
      eventBus.off(
        SocketEvents.NOTIFICATIONS.NEW_MESSAGE,
        handleNewNotification
      );
    };
  }, [notifications]);

  useEffect(() => {
    const handleNewInvitation = (data: any) => {
      setNotifications((prev: any[]) =>
        prev.map((notif) =>
          notif.id === data.notification_id
            ? { ...notif, status: NOTIFICATIONS_STATUS.READED }
            : notif
        )
      );
    };

    eventBus.on(SocketEvents.EVENTS.ACCEPT_INVITATION, handleNewInvitation);

    return () => {
      eventBus.off(SocketEvents.EVENTS.ACCEPT_INVITATION, handleNewInvitation);
    };
  });

  const handleInvitation = async (
    notification_id: number,
    event_id: number
  ) => {
    const getUser = await Storage.get("user");
    socket?.emit(SocketEvents.EVENTS.ACCEPT_INVITATION, {
      user_id: getUser?.user?.id,
      event_id,
      notification_id,
    });
    router.push({
      pathname: "/src/event/current-event",
      params: { event_id: JSON.stringify(event_id) },
    });
  };

  const renderItem = ({ item }: any) => {
    const isNew = item.status !== NOTIFICATIONS_STATUS.READED;
    return (
      <View
        style={[styles.notificationCard, isNew && styles.newNotificationCard]}
      >
        <View style={styles.notificationHeader}>
          <Text
            style={[
              styles.notificationTitle,
              isNew && styles.newNotificationTitle,
            ]}
          >
            {item.title}
          </Text>
          {isNew && (
            <Ionicons
              name="alert-circle"
              size={20}
              color={Colors.purple}
              style={{ marginLeft: 6 }}
            />
          )}
        </View>
        <Text style={styles.notificationTime}>
          {moment(item.created_at).fromNow()}
        </Text>
        <Text style={styles.notificationDescription}>{item.message}</Text>
        {item.notification_type_id === NOTIFICATIONS_TYPES.NEW_INVITATION &&
          isNew && (
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() => handleInvitation(item?.id, item?.event_id)}
            >
              <Text style={styles.acceptBtnText}>Accept Invitation</Text>
            </TouchableOpacity>
          )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color={Colors.purple} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.blue_dark_2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blue_dark,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.purple,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  notificationCard: {
    backgroundColor: Colors.blue_dark_2,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6, // Added for Android and more prominent shadow
  },
  newNotificationCard: {
    borderWidth: 1.5,
    borderColor: Colors.purple,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  newNotificationTitle: {
    color: Colors.purple,
  },
  notificationTime: {
    color: Colors.gray,
    fontSize: 13,
    marginBottom: 6,
  },
  notificationDescription: {
    color: Colors.gray,
    fontSize: 15,
  },
  acceptBtn: {
    marginTop: 12,
    backgroundColor: Colors.purple,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: "center",
    alignSelf: "flex-end",
  },
  acceptBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default NotificationsScreen;
