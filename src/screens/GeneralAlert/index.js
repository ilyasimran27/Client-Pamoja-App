import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Btn, Input} from '../../components';
import {primaryColor} from '../../config';
import Naivgation from '../../Navigation';
import MapBox from '../Mapbox/Mapbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GeneralAlert({Naivgation}) {
  const [userData, setUserData] = useState();
  const [locationCoordinate, setLocationCoordinate] = useState({});
  const [alertReason, setAlertReason] = useState('');
  const getLocalStorageData = async () => {
    let user = await AsyncStorage.getItem('userData');
    let location = await AsyncStorage.getItem('locationHistory');
    location = JSON.parse(location);
    console.log('general alert=======>', location);
    let data = JSON.parse(user);
    setUserData(data);
    setLocationCoordinate(location);
    return data;
  };
  useEffect(() => {
    // getLocalStorageData();
  }, []);
  const [loadMap, setLoadMap] = useState(false);
  return (
    <View style={styles.container}>
      {!loadMap ? (
        <>
          <View style={styles.log}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logo}
            />
          </View>
          <Text style={styles.text}>Click the option to get alert:</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              flexWrap: 'wrap',
            }}>
            <TouchableOpacity
              style={styles.border}
              onPress={() => {
                setAlertReason('send a distress single');
                setLoadMap(!loadMap);
              }}>
              <Icon name="bed-single-outline" style={styles.icon} />
              <Text style={styles.send}>SEND A DISTRESS SINGLE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setAlertReason('health alert');
                setLoadMap(!loadMap);
              }}
              style={styles.border}>
              <Icon name="heart" style={styles.icon} />
              <Text style={styles.health}>HEALTH ALERT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setAlertReason('security alert');
                setLoadMap(!loadMap);
              }}
              style={styles.border}>
              <Icon name="security" style={styles.icon} />
              <Text style={styles.security}>SECURITY ALERT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setAlertReason("fire alert")
                setLoadMap(!loadMap);
              }}
              style={styles.border}>
              <Icon name="fire" style={styles.icon} />
              <Text style={styles.fire}>FIRE ALERT</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <MapBox
          reason="general"
          alertReason={alertReason}
          // locationCoordinate={locationCoordinate}
          // userData={userData}
          setLoadMap={setLoadMap}></MapBox>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  logo: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 250,
    width: '80%',
    resizeMode: 'stretch',
  },
  log: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 20,
  },
  send: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 1,
  },
  health: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 1,
  },
  security: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 1,
  },
  fire: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 1,
  },
  icon: {
    fontSize: 50,
    color: primaryColor,
  },
  border: {
    width: '40%',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: primaryColor,
    alignItems: 'center',
    marginTop: 20,
  },
});
