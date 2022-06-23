import React, {useState, useEffect,useContext} from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Btn, Input} from '../../components';
import Icon from 'react-native-vector-icons/Entypo';
import {primaryColor} from '../../config';
import {signupWithEmailAndPassword} from '../../firebase';
import ImagePicker from 'react-native-image-crop-picker';
import firebase from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';
import {AppContext} from '../../../GolbalProvider/GlobalProvider';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

const {width, height} = Dimensions.get('screen');

export default function ChangeEmail({navigation}) {
  const {
    userData,
    setUserData,
    allUserData,
    setAllUserData,
    otherUserData,
    setOtherUserData,
    postData,
    setPostData,
    profilePostData,
    setProfilePostData,
  } = useContext(AppContext);
  console.log("userData===>",userData)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  GoogleSignin.configure({
    webClientId:
      '535223982749-ojen7au3qckbbv2mhm1tnidk6jkjg8rc.apps.googleusercontent.com',
  });
  // const [userData, setUserData] = useState({});
  const getLocalStorageData = async () => {
   
    let user = await AsyncStorage.getItem('userData');
    let data = JSON.parse(user);
  
    console.log("user in change email===>",user)
    setUserData(data);

    return data;
  };
  useEffect(() => {
    // getLocalStorageData();
  }, []);
  const [load, setLoad] = useState(false);
  
     const reauthenticateGoogle = async(email) => {
      // const {idToken} = await GoogleSignin.signIn();
      console.log("reauthenticate calling")
      const {idToken} = await GoogleSignin.signIn();
      var user = firebase.auth().currentUser;
      var cred = firebase.auth.GoogleAuthProvider.credential(
        idToken
        
      );
      console.log("cred===>",cred)
      return user.reauthenticateWithCredential(cred);
    };
  //   const reauthenticate = email => {
  //     var user = firebase.auth().currentUser;
  //     var cred = firebase.auth.EmailAuthProvider.credential(
  //       user.email,
  //       currentPassword,
  //     );
  //     return user.reauthenticateWithCredential(cred);
  //   };
  const updateUserData = async newEmail => {
    let data = {...userData};
    data = {...data, email:newEmail};
    const response = await firebase
      .firestore()
      .collection('Users')
      .doc(userData.uid)
      .update({email:newEmail});
      setUserData(data)
    AsyncStorage.setItem('userData', JSON.stringify(data));
    navigation.goBack()
  };
 const reauthenticate = (currentPassword) => {
    var user = firebase.auth().currentUser;
    var cred = firebase.auth.EmailAuthProvider.credential(
        user.email, currentPassword);
    return user.reauthenticateWithCredential(cred);
  }
  // const onSave = (email, newEmail) => {
  //   setLoad(true);
  //   var user = firebase.auth().currentUser;
  //   user
  //     .updateEmail(newEmail)
  //     .then(() => {
  //       setLoad(false);
      
  //       updateUserData(newEmail);
  //     })
  //     .catch(error => {
  //       alert('please login again and try again');
  //       setLoad(false);
       
  //     });

  
  // };
  const changeEmailWithGoogle = (oldEmail, newEmail) => {
    console.log("change email callig")
    reauthenticateGoogle(oldEmail).then(() => {
      console.log("then in reauthticate")
      var user = firebase.auth().currentUser;
      user.updateEmail(newEmail).then(() => {
        console.log("then in update")
        updateUserData(newEmail);
      }).catch((error) => { console.log("error in update email=>",error); });
    }).catch((error) => { console.log("error in reauthicate==>",error); });
    
  }
  const changeEmailWithFirebase = (currentPassword, newEmail) => {
    console.log("change email callig")
    reauthenticate(currentPassword).then(() => {
      console.log("then in reauthticate")
      var user = firebase.auth().currentUser;
      user.updateEmail(newEmail).then(() => {
        console.log("then in update")
        updateUserData(newEmail);
      }).catch((error) => { console.log("error in update email=>",error); });
    }).catch((error) => { console.log("error in reauthicate==>",error); });
    
  }
  return (
    <View style={{height: height, backgroundColor: 'black'}}>
      <View style={styles.container}>
        <View style={styles.input}>
          <TextInput
            style={styles.inputText}
            value={email}
            onChangeText={setEmail}
            color={'white'}
            placeholder={'Enter old email*'}
            placeholderTextColor={'white'}
          />
        </View>
        <View style={styles.input}>
          <TextInput
            style={styles.inputText}
            value={newEmail}
            onChangeText={setNewEmail}
            color={'white'}
            placeholder={'Enter new email*'}
            placeholderTextColor={'white'}
          />
        </View>

        {
        userData?.loginMethod!=="google"?
        <View style={styles.input}>
          <TextInput
            style={styles.inputText}
            value={password}
            onChangeText={setPassword}
            color={'white'}
            placeholder={'Enter current password*'}
            placeholderTextColor={'white'}
          />
        </View>:<></> }

        {/* <View style={{margin: 20}}>
          <Btn title={'Upload Photo'} onPress={choosePhotoFromLibrary} />
        </View> */}
        <View style={{marginTop: 20}}>
          <Btn
            
            load={load}
            title={'Save'}
            onPress={() => {
              userData?.loginMethod!=="google"?changeEmailWithFirebase(password, newEmail):changeEmailWithGoogle(email,newEmail);
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
  },
  bg: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText1: {
    borderBottomLeftRadius: 12,
    borderTopLeftRadius: 12,
  },
  selectedTex2: {
    borderBottomRightRadius: 12,
    borderTopRightRadius: 12,
  },
  text: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    marginTop: 20,
    display: 'flex',
    marginLeft: 20,

    width: '73%',
  },
  gen: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
  gen1: {
    fontSize: 20,
    color: 'white',
    padding: 10,
  },

  dont: {
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 90,
  },
  inputText: {borderColor: 'white', borderBottomWidth: 2, fontSize: 16},
});
