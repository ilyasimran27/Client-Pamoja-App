import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Btn, Input} from '../../components';
import {primaryColor} from '../../config';
import {signupWithEmailAndPassword} from '../../firebase';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import {AppContext} from '../../../GolbalProvider/GlobalProvider';

export default function Signup({navigation}) {
  const {
    userData,
    setUserData,
    allUserData,
    setAllUserData,
    otherUserData,
    setOtherUserData,
    postData,
    setPostData,
  } = useContext(AppContext);
  const [name, setName] = useState('');
  const [fcmDeviceToken, setFcmDeviceToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassoword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState(false);
  const [load, setLoad] = useState(false);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [pic, setPic] = useState(null);
  const genderOption = ['male', 'female'];
  const getFCMDeviceTokenFromLocal = async () => {
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem('fcmToken')
        .then(res => {
          console.log('response is===>', res);
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
  useEffect(() => {
    getFCMDeviceTokenFromLocal();
  }, []);
  const choosePhotoFromLibrary = () => {
    ImagePicker.openPicker({
      width: 1200,
      height: 780,
      cropping: true,
    }).then(image => {
      console.log(image);
      const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
      console.log('imageUri is====>', imageUri);
      setPic(imageUri);
      setImage(imageUri);
    });
  };
  const uploadImage = async () => {
    if (image == null) {
      return null;
    }
    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    // Add timestamp to File Name
    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;

    setUploading(true);
    setTransferred(0);

    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);

    // Set transferred state
    task.on('state_changed', taskSnapshot => {
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );

      setTransferred(
        Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
          100,
      );
    });

    try {
      await task;

      const url = await storageRef.getDownloadURL();

      setUploading(false);
      setImage(null);

      // Alert.alert(
      //   'Image uploaded!',
      //   'Your image has been uploaded to the Firebase Cloud Storage Successfully!',
      // );
      return url;
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  const handleSignup = async () => {
    const imageUrl = await uploadImage();
    if (!name && !email && !password)
      return alert('please fill all the fields');

    if (password !== confirmPassword) return alert('Password does not match!');
    let data = {
      name,
      email,
      password,
      phoneNumber,
      gender,
      imageUrl,
      fcmToken: fcmDeviceToken,
    };
    try {
      setLoad(true);
      const response = await signupWithEmailAndPassword(
        data,
        otherUserData,
        setOtherUserData,
        setUserData
      );
      console.log(response);
      if (response === 'done') {
        alert('Signed Up!');
        navigation.navigate('Login');
      }
    } catch (err) {
      setLoad(false);
      alert(err);
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        {/* <ImageBackground
          source={require('../../assets/bg.png')}
          style={styles.bg}>
          <Text style={styles.text}>Signup</Text>
        </ImageBackground> */}
        <TouchableOpacity
          onPress={() => choosePhotoFromLibrary()}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
          }}>
          <View
            style={{
              backgroundColor: 'transparent',
              padding: 10,
              borderRadius: 50,
              borderColor: 'white',
              borderWidth: 2,
            }}>
            <Image
              source={
                pic === null
                  ? {
                      uri: 'https://t3.ftcdn.net/jpg/02/18/21/86/360_F_218218632_jF6XAkcrlBjv1mAg9Ow0UBMLBaJrhygH.jpg',
                    }
                  : {
                      uri: pic,
                    }
              }
              style={{width: 80, height: 80, borderRadius: 80 / 2}}
            />
          </View>
          <Text style={{color: 'white'}}>Add photo*</Text>
        </TouchableOpacity>
        <View style={styles.input}>
          <Input
            onChangeText={setName}
            placeholder={'Full Name*'}
            placeholderTextColor="white"
          />
        </View>
        <View style={styles.input}>
          <Input
            onChangeText={setEmail}
            placeholder={'Email Address*'}
            placeholderTextColor="white"
          />
        </View>
        <View style={styles.input}>
          <Input
            onChangeText={setPassword}
            placeholder={'Password*'}
            placeholderTextColor="white"
          />
        </View>
        <View style={styles.input}>
          <Input
            onChangeText={setConfirmPassoword}
            placeholder={'Confirm Password*'}
            placeholderTextColor="white"
          />
        </View>
        <View style={styles.input}>
          <Input
            onChangeText={setPhoneNumber}
            placeholder={'Phone Number*'}
            placeholderTextColor="white"
          />
        </View>
        <View style={styles.gen}>
          <Text style={{fontSize: 20, color: 'white', marginLeft: 10}}>
            Gender*
          </Text>
          <View
            style={{
              flexDirection: 'row',
              // alignSelf: 'center',

              backgroundColor: 'transparent',
              borderColor: 'white',
              borderWidth: 0.5,
              borderRadius: 12,
              marginLeft: 50,
              // paddingVertical: 3,
            }}>
            {genderOption.map((item, index) => {
              return (
                <TouchableOpacity
                  onPress={() => {
                    setGender(item.toLowerCase());
                  }}>
                  <Text
                    style={[
                      index === 1 ? styles.selectedTex2 : styles.selectedText1,
                      {
                        color: 'white',
                        borderWidth: 4,
                        width: '100%',

                        paddingHorizontal: 40,
                        paddingVertical: 4,
                        fontSize: 16,
                        fontWeight: 'normal',

                        backgroundColor:
                          gender === item ? '#ff5722' : 'transparent',
                      },
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {/* <TouchableOpacity
            onPress={() => {
              setGender('male');
            }}
            style={{
              backgroundColor: gender === 'male' ? primaryColor : 'black',
              borderRadius: 4,
            }}>
            <Text style={styles.gen1}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setGender('female');
            }}
            style={{
              backgroundColor: gender === 'female' ? primaryColor : 'black',
              borderRadius: 4,
            }}>
            <Text style={styles.gen1}>Female</Text>
          </TouchableOpacity> */}
        </View>
        {/* <View style={{margin: 20}}>
          <Btn title={'Upload Photo'} onPress={choosePhotoFromLibrary} />
        </View> */}
        <View style={{margin: 20}}>
          <Btn
            load={load}
            title={'Sign Up'}
            onPress={() => {
              handleSignup();
            }}
          />
        </View>

        <TouchableOpacity
          style={styles.dont}
          onPress={() => navigation.navigate('Login')}>
          <Text
            style={{
              color: 'white',
              backgroundColor: 'brown',
              width: '100%',
              padding: 10,
              paddingLeft: 130,
            }}>
            Already a Member? Sign in
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
    // justifyContent: 'center',
    // alignItems: 'center',
    marginTop: 2,
    fontSize: 12,
  },
});
