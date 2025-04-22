import {router } from 'expo-router'
import { StyleSheet, Text, View} from 'react-native'
import { useEffect} from 'react'

export default function InitialScreen() {
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async() => {
    router.replace('/home')
  }
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
