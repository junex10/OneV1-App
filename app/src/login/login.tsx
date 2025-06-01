import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Link } from 'expo-router';

const Login: React.FC = () => {
    return (
      <>
        <Text>This is the login</Text>
        <Link href="./create-account" style={styles.button}>
          Go back to Home screen!
        </Link>
        <StatusBar style="auto" />
      </>
    );
  }

  const styles = StyleSheet.create({
    button: {
      fontSize: 20,
      textDecorationLine: 'underline',
      color: '#fff',
    },
  });
  
  export default Login;