import { StyleSheet, Modal, View, ActivityIndicator, Text } from 'react-native';

const ActivityIndicatorModal: React.FC<{ isLoading: boolean; loadingText: string }> = props => {
  const { isLoading, loadingText } = props;
  return (
    <Modal visible={isLoading} transparent={true} animationType="fade" onRequestClose={() => {}}>
      <View style={styles.loadingOverlay}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>{loadingText}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingBox: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 8,
    color: '#ffffff',
    fontSize: 14
  }
});

export default ActivityIndicatorModal;
