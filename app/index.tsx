//import {router } from 'expo-router'
import { StyleSheet, Text, View} from 'react-native'

export default function InitialScreen() {
  return (
  <View style={styles.container}>
    <Text style={styles.title}>アプリ起動中</Text>
  </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEF4',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  }
})
