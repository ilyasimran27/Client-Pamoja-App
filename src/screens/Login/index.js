//sign in
import React, {useState, useEffect, useContext} from 'react';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
} from 'react-native';
import {primaryColor} from '../../config';

//import GoogleIcon from '@mui/icons-material/Google';
import Icon from 'react-native-vector-icons/FontAwesome';
// import { InterstitialAd, RewardedAd, BannerAd, TestIds,BannerAdSize } from '@react-native-firebase/admob';
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
} from 'react-native-admob-alpha';
const {width, height} = Dimensions.get('screen');
import {Btn, Input} from '../../components';
import {signinWithEmailAndPassword} from '../../firebase';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {updateUserFCMToken} from '../../utils/notificationService';
import {AppContext} from '../../../GolbalProvider/GlobalProvider';

const Login = ({navigation}) => {
  GoogleSignin.configure({
    webClientId:
      '535223982749-ojen7au3qckbbv2mhm1tnidk6jkjg8rc.apps.googleusercontent.com',
  });
  const [email, setEmail] = useState('alikhan@gmail.com');
  const [pass, setPassword] = useState('kashif234');
  const [load, setLoad] = useState(false);
  const [fcmDeviceToken, setFcmDeviceToken] = useState('');
  const {
    userData,
    setUserData,
    allUserData,
    setAllUserData,
    otherUserData,
    setOtherUserData,
  } = useContext(AppContext);
  // console.log('allUserData on login=>', allUserData);
  // useEffect(() => {
  //   (async () => {
  //     const res = await AsyncStorage.getItem('uid');
  //     if (res) {
  //       navigation.navigate('Home');
  //     }
  //   })();
  // }, []);

  const getFCMDeviceTokenFromLocal = async () => {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('fcmToken')
        .then(res => {
          if (res !== null) {
            const result = res;
            setFcmDeviceToken(result);
            resolve(res);
          } else {
            resolve(false);
          }
        })
        .catch(err => reject(err));
    });
  };

  async function onGoogleButtonPress() {
    try {
      const {idToken} = await GoogleSignin.signIn();

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      return auth()
        .signInWithCredential(googleCredential)
        .then(res => {
          const dataGoogleSignIn = res.additionalUserInfo.profile;

          const data = {
            email: dataGoogleSignIn.email,
            name: dataGoogleSignIn.name,
            uid: res.user.uid,
            gender: dataGoogleSignIn.gender ? dataGoogleSignIn.gender : '',
            imageUrl: dataGoogleSignIn.picture,
            loginMethod: 'google',
          };

          // AsyncStorage.setItem('uid', res.user?.uid);
          // AsyncStorage.setItem('userData', JSON.stringify(data));
          const userRef = firebase
            .firestore()
            .collection('Users')
            .doc(res.user.uid);
          userRef.get().then(docSnapshot => {
            if (docSnapshot.exists) {
              updateUserFCMToken(res.user.uid);
            } else {
              setUserData({
                email: dataGoogleSignIn.email,

                name: dataGoogleSignIn.name,
                uid: res.user.uid,
                gender: dataGoogleSignIn.gender ? dataGoogleSignIn.gender : '',
                fcmToken: fcmDeviceToken,
                imageUrl: dataGoogleSignIn.picture,
                loginMethod: 'google',
              });
              setOtherUserData([
                ...otherUserData,
                {
                  email: dataGoogleSignIn.email,

                  name: dataGoogleSignIn.name,
                  uid: res.user.uid,
                  gender: dataGoogleSignIn.gender
                    ? dataGoogleSignIn.gender
                    : '',
                  fcmToken: fcmDeviceToken,
                  imageUrl: dataGoogleSignIn.picture,
                  loginMethod: 'google',
                },
              ]);
              userRef.set({
                email: dataGoogleSignIn.email,

                name: dataGoogleSignIn.name,
                uid: res.user.uid,
                gender: dataGoogleSignIn.gender ? dataGoogleSignIn.gender : '',
                fcmToken: fcmDeviceToken,
                imageUrl: dataGoogleSignIn.picture,
                loginMethod: 'google',
              }); // create the document
            }
          });
          if (res.user.uid) {
            setTimeout(() => {
              navigation.navigate('Home');
            }, 4000);
          }
        });
    } catch (error) {
      return console.log(error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('error', error, error.code);
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('error', error, error.code);
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('error', error, error.code);
      } else {
        console.log('error', error, error.code, 'else');
      }
    }
  }
  const handleSignin = async allUserData => {
    let data = {
      email,
      password: pass,
    };
    try {
      setLoad(true);
      const response = await signinWithEmailAndPassword(
        data,
        allUserData,
        setUserData,
        setOtherUserData,
      );

      if (response === 'done') {
        setLoad(false);
        navigation.navigate('Home');
      }
    } catch (err) {
      setLoad(false);
      alert(err);
    }
  };
  async function logoutfacebook() {
    LoginManager.logOut();
  }
  async function onFacebookButtonPress() {
    // Attempt login with permissions

    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);

    if (result.isCancelled) {
      throw 'User cancelled the login process';
    }

    // Once signed in, get the users AccesToken
    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw 'Something went wrong obtaining access token';
    }

    // Create a Firebase credential with the AccessToken
    const facebookCredential = auth.FacebookAuthProvider.credential(
      data.accessToken,
    );

    // Sign-in the user with the credential
    return auth()
      .signInWithCredential(facebookCredential)
      .then(res => {
        const dataFacebookSignIn = res.additionalUserInfo.profile;

        const data = {
          email: dataFacebookSignIn.email,

          name: dataFacebookSignIn.name,
          uid: res.user.uid,
          gender: dataFacebookSignIn.gender ? dataFacebookSignIn.gender : '',
          imageUrl: dataFacebookSignIn.picture.data.url,
          loginMethod: 'facebook',
        };
        AsyncStorage.setItem('uid', res.user?.uid);
        AsyncStorage.setItem('userData', JSON.stringify(data));
        const userRef = firebase
          .firestore()
          .collection('Users')
          .doc(res.user.uid);
        userRef.get().then(docSnapshot => {
          if (docSnapshot.exists) {
            updateUserFCMToken(res.user.uid);
          } else {
            userRef.set({
              email: dataFacebookSignIn.email,

              name: dataFacebookSignIn.name,
              uid: res.user.uid,
              gender: dataFacebookSignIn.gender
                ? dataFacebookSignIn.gender
                : '',
              fcmToken: fcmDeviceToken,
              imageUrl: dataFacebookSignIn.picture.data.url,
              loginMethod: 'facebook',
            }); // create the document
          }
        });
        if (res.user.uid) {
          setTimeout(() => {
            navigation.navigate('Home');
          }, 4000);
        }
      });
  }
  useEffect(() => {
    setTimeout(() => {
      getFCMDeviceTokenFromLocal();
    }, 4000);
  }, []);
  return (
    <ScrollView style={{height: height, backgroundColor: 'black'}}>
      <View style={styles.container}>
        <ImageBackground
          source={require('../../assets/bg.png')}
          style={styles.bg}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
          />
        </ImageBackground>
        <View style={styles.email}>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder={'Enter email'}
            placeholderTextColor="white"
          />
        </View>
        <View style={styles.password}>
          <Input
            onChangeText={setPassword}
            value={pass}
            placeholder={'Enter Passrowd'}
            placeholderTextColor="white"
          />
        </View>
        <TouchableOpacity
          style={styles.for}
          onPress={() => navigation.navigate('Forgetpassword')}>
          <Text style={{color: 'white'}}>Forget password?</Text>
        </TouchableOpacity>

        <View style={{width: '90%', alignSelf: 'center', marginTop: 20}}>
          <Btn title={'Login'} onPress={handleSignin} load={load} />
        </View>
        <View style={{width: width}}>
          <Text
            style={{
              color: '#FFFF',
              alignSelf: 'center',
              fontSize: 18,
              marginTop: 10,
            }}>
            ----------------------------------OR--------------------------------
          </Text>
        </View>

        <View style={styles.Button}>
          <View style={styles.Button1}>
            <Icon.Button
              name="google"
              backgroundColor={'#FFFF'}
              color={primaryColor}
              onPress={onGoogleButtonPress}>
              <Text style={{fontSize: 18, color: primaryColor}}> Signup </Text>
            </Icon.Button>
          </View>

          <View style={styles.Button2}>
            <Icon.Button
              name="facebook"
              backgroundColor={'#FFFF'}
              color={primaryColor}
              onPress={() => onFacebookButtonPress()}>
              <Text style={{fontSize: 20, color: primaryColor}}> Signup </Text>
            </Icon.Button>
          </View>
        </View>

        {/* <TouchableOpacity
          style={styles.dont2}
          onPress={() => logoutfacebook()}>
          
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.dont2}
          onPress={() => navigation.navigate('Signup')}>
          <Text style={{color: 'white'}}>Don't have an account,Sign up</Text>
        </TouchableOpacity>
      </View>
      <AdMobBanner
        adSize={`${width - 50}x50`}
        adUnitID="ca-app-pub-3940256099942544/6300978111"
        testDevices={[AdMobBanner.simulatorId]}
        adViewDidReceiveAd={(a) => console.log('RECEIVED AD ' + a)}
        onAdFailedToLoad={(error) => console.error(error)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },

  email: {
    color: 'white',
    width: '100%',
    flexDirection: 'row',
    marginTop: 10,
  },

  password: {
    color: 'white',
    width: '100%',
    flexDirection: 'row',
    marginTop: 10,
  },
  dont2: {
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 90,
    backgroundColor: '#7a360e',
  },
  dont: {
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    justifyContent: 'center',
    alignItems: 'center',
    height: height - 430,
    width: width,
    resizeMode: 'stretch',
  },
  bg: {
    width: '100%',
    height: height - 430,
  },
  for: {
    color: 'white',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginTop: 10,
    marginRight: 20,
  },
  Button: {
    // width: '30%',
    alignSelf: 'center',
    marginTop: 10,
    flexDirection: 'row',
  },
  Button1: {
    color: {primaryColor},
    // alignItems:'center',
    backgroundColor: 'white',
    marginRight: 10,
    //size: 100,
    fontSize: 18,
    padding: 7,
    borderRadius: 25,
  },
  Button2: {
    color: {primaryColor},
    // alignItems:'center',
    backgroundColor: 'white',
    marginLeft: 10,
    // fontSize: 30,
    // size: 300,
    padding: 7,
    borderRadius: 25,
  },
});

export default Login;
