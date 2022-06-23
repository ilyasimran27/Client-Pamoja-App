import React, {useEffect, useState,useContext} from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Btn, Input} from '../../components';
import {primaryColor} from '../../config';
import Icon from 'react-native-vector-icons/AntDesign';
import IconI from 'react-native-vector-icons/Ionicons';
import Iconm from 'react-native-vector-icons/MaterialIcons';
import MessageIcon from 'react-native-vector-icons/FontAwesome';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import {clear} from 'react-native/Libraries/LogBox/Data/LogBoxData';
import auth from '@react-native-firebase/auth';
import {AppContext} from '../../../GolbalProvider/GlobalProvider';

export default function Menu(props) {
  const {
    userData,
    setUserData,
    allUserData,
    setAllUserData,
    otherUserData,
    setOtherUserData,
  } = useContext(AppContext);
  // const [userData, setUserData] = useState();
  const isFocused = useIsFocused();

  const getLocalStorageData = async () => {
    let user = await AsyncStorage.getItem('userData');
    let data = JSON.parse(user);

    setUserData(data);

    // return data;
  };
  useEffect(() => {
    // getLocalStorageData();
  }, []);

  return (
    <View style={styles.container}>
      <View style={{height: '90%'}}>
        <View style={styles.Header}>
          <Text style={styles.headertxt}>Menu</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            height: '17%',
            backgroundColor: 'black',
            alignItems: 'center',
            borderRadius: 15,
            marginTop: -10,
          }}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate('Privates');
            }}>
            <MessageIcon name="envelope-o" style={[styles.icon]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: -20,
            }}
            onPress={() => {
              props.navigation.navigate('Profile');
            }}>
            <Image
              source={{
                uri: userData?.imageUrl
                  ? userData?.imageUrl
                  : 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
              }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 80 / 2,
                borderColor: primaryColor,
                borderWidth: 2,
              }}
            />
          </TouchableOpacity>

          <TouchableOpacity>
            <IconI name="notifications" style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View style={styles.view}>
          <TouchableOpacity
            style={styles.touchop}
            onPress={() => {
              props.navigation.navigate('home');
            }}>
            <Icon name="home" style={styles.icon} />
            <Text style={styles.touchtxt}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.touchop}
            onPress={() => {
              props.navigation.navigate('Profile');
            }}>
            <Icon name="profile" style={styles.icon} />
            <Text style={styles.touchtxt}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.touchop}
            onPress={() => {
              props.navigation.navigate('Peoples');
            }}>
            <IconI name="people" style={styles.icon} />
            <Text style={styles.touchtxt}>People</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.touchop}
            onPress={() => {
              props.navigation.navigate('Privates');
            }}>
            <Icon name="star" style={styles.icon} />
            <Text style={styles.not}>Privates</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.touchop}
            onPress={() => {
              props.navigation.navigate('Invites');
            }}>
            <Iconm name="inventory" style={styles.icon} />
            <Text style={styles.touchtxt}>Invites</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.touchop}
            onPress={() => {
              props.navigation.navigate('Setting');
            }}>
            <Icon name="setting" style={styles.icon} />
            <Text style={styles.touchtxt}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.touchop}
            onPress={async () => {
              // AsyncStorage.removeItem('uid');
              auth().signOut();
              setUserData(null)
              props.navigation.navigate('Login');
            }}>
            <Icon name="logout" style={styles.icon} />
            <Text style={styles.touchtxt}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
        onPress={() => {
          props.navigation.navigate('PurposePostScreen');
        }}>
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            borderColor: 'white',
            borderWidth: 1,
            marginTop: -20,
            marginBottom: 20,
            paddingVertical: 20,
            paddingHorizontal: 15,
            borderRadius: 20,
          }}>
          Purpose Topic of Discussion
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    height: '80%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  Header: {
    width: '100%',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: primaryColor,
  },
  headertxt: {
    fontSize: 25,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
  },
  txt: {
    color: primaryColor,
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 60,
    marginTop: 20,
    marginBottom: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchtxt: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
    marginTop: 7,
  },
  not: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 22,
    marginTop: 10,
  },
  touchop: {
    flexDirection: 'row',
    marginTop: 15,
  },
  view: {
    backgroundColor: 'black',
    height: '80%',
    width: '100%',
    borderRadius: 15,
    marginTop: -10,
  },
  icon: {
    fontSize: 30,
    color: 'white',
    marginLeft: 20,
  },
  purpose: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 100,
    marginTop: 200,

    border: 2,
    borderRadius: 20,
  },
});
