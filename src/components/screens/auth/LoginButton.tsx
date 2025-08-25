import { StyleSheet, TouchableOpacity, View, Image, Text } from 'react-native';

interface LoginButtonProps {
  onPress: () => void;
  isLoading: boolean;
}

export const GoogleLoginButton = function (props: LoginButtonProps) {
  const { onPress, isLoading } = props;
  return (
    <TouchableOpacity style={styles.loginButton} onPress={onPress} disabled={isLoading}>
      <View style={styles.buttonContent}>
        <Image
          source={require('@assets/images/buttons/google-logo.png')}
          style={styles.logoIcon}
          resizeMode="contain"
        />
        <Text style={styles.buttonText}>{isLoading ? 'ログイン中...' : 'Googleでログイン'}</Text>
      </View>
    </TouchableOpacity>
  );
};

export const AppleLoginButton = function (props: LoginButtonProps) {
  const { onPress, isLoading } = props;
  return (
    <TouchableOpacity style={styles.loginButton} onPress={onPress} disabled={isLoading}>
      <View style={styles.buttonContent}>
        <Image
          source={require('@assets/images/buttons/apple-logo.png')}
          style={styles.logoIcon}
          resizeMode="contain"
        />
        <Text style={styles.buttonText}>{isLoading ? 'ログイン中...' : 'Appleでサインイン'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // 共通のログインボタンスタイル
  loginButton: {
    width: '100%',
    maxWidth: 320,
    height: 56,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dadce0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    alignSelf: 'center'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 20
  },
  logoIcon: {
    width: 26,
    height: 26
  }
});
