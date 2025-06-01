import { StyleSheet, Text, View } from "react-native";
import { Link } from 'expo-router';

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>One</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Link href="/src/login/login" style={styles.button}>
          Login
        </Link>
        <Link href="/src/login/create-account" style={styles.button}>
          Create account
      </Link>
        <Link href="/src/map/map" style={styles.button}>
          Map
      </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: 'white',
    fontSize: 30
  },
  titleContainer: {
    backgroundColor: '#25292e',
    padding: 20,
    top: '25%'
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    top: '18%'
  },
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    color: '#fff',
    backgroundColor: '#FD3A73',
    marginTop: 20,
    padding: 10,
    borderRadius: 25,
    width: '90%',
    textAlign: 'center'
  },
});