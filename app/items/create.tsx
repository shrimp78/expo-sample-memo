import { View, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router, useNavigation } from 'expo-router';

export default function CreateItemScreen() {
  const navigation = useNavigation();

  return (
    <View>
      <Text>CreateItemScreen</Text>
    </View>
  );
}
