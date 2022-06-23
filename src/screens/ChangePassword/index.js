import React, {useState, useEffect} from 'react';
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
const {width, height} = Dimensions.get('screen');

export default function ChangePassword({navigation}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword,setConfirmPassword]=useState('')
  const [newEmail, setNewEmail] = useState('');
  const [userData, setUserData] = useState({});
  const getLocalStorageData = async () => {
   
    let user = await AsyncStorage.getItem('userData');
    let data = JSON.parse(user);
  
    setUserData(data);

    return data;
  };
  useEffect(() => {
    getLocalStorageData();
  }, []);
  const [load, setLoad] = useState(false);
  //   const reauthenticate = email => {
  //     var user = firebase.auth().currentUser;
  //     var cred = firebase.auth.EmailAuthProvider.credential(
  //       user.email,
  //       currentPassword,
  //     );
  //     return user.reauthenticateWithCredential(cred);
  //   };
  const updateUserData = async newPassword => {
    let data = {...userData};
    data = {...data, password:newPassword};
    const response = await firebase
      .firestore()
      .collection('Users')
      .doc(userData.uid)
      .update({password:newPassword});
    AsyncStorage.setItem('userData', JSON.stringify(data));
    navigation.goBack()
  };
  const onSave = (password,newPassword) => {
    setLoad(true);
    var user = firebase.auth().currentUser;
    user
      .updatePassword(newPassword)
      .then(() => {
        setLoad(false);
       
        updateUserData(newPassword);
      })
      .catch(error => {
        alert('please login again and try again');
        setLoad(false);
       
      });

   
  };

  return (
    <View style={{height: height, backgroundColor: 'black'}}>
      <View style={styles.container}>
        <View style={styles.input}>
          <TextInput
            style={styles.inputText}
            value={oldPassword}
            onChangeText={setOldPassword}
            color={'white'}
            placeholder={'Enter old password*'}
            placeholderTextColor={'white'}
          />
        </View>
        <View style={styles.input}>
          <TextInput
            style={styles.inputText}
            value={newPassword}
            onChangeText={setNewPassword}
            color={'white'}
            placeholder={'Enter new password*'}
            placeholderTextColor={'white'}
          />
        </View>
        <View style={styles.input}>
          <TextInput
            style={styles.inputText}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            color={'white'}
            placeholder={'Re-nter new email*'}
            placeholderTextColor={'white'}
          />
        </View>

        {/* <View style={{margin: 20}}>
          <Btn title={'Upload Photo'} onPress={choosePhotoFromLibrary} />
        </View> */}
        <View style={{marginTop: 20}}>
          <Btn
            disabled={oldPassword && newPassword && newPassword===confirmPassword ? false : true}
            load={load}
            title={'Save'}
            onPress={() => {
                
              onSave(oldPassword,newPassword);
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
