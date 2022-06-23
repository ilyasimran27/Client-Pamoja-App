import React, {useState, useEffect,useContext} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  PermissionsAndroid,
  useColorScheme,
  View,
  Image,
  FlatList,
  Platform,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppContext} from '../../../GolbalProvider/GlobalProvider';
import {locationPermission, getCurrentLocation} from '../Mapbox/helperFunction';
import MapView, {Marker, AnimatedRegion} from 'react-native-maps';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const Location = () => {
  const {
    userData,
    setUserData,
    allUserData,
    setAllUserData,
    otherUserData,
    setOtherUserData,
    locationData,setLocationData
  } = useContext(AppContext);
  const {
    curLoc,
    time,
    distance,
    destinationCords,
    isLoading,
    coordinate,
    heading,
  } = locationData;
  useEffect(()=>{
    getLiveLocation();
  },[])
  const updateState = data => setLocationData(locationData => ({...locationData, ...data}));
  
  const getLiveLocation = async () => {
    const locPermissionDenied = await locationPermission();
    if (locPermissionDenied) {
      const {latitude, longitude, heading} = await getCurrentLocation();
      console.log('get live location after 4 second', heading);
      // animate(latitude, longitude);
      updateState({
        heading: heading,
        curLoc: {latitude, longitude},
        coordinate: new AnimatedRegion({
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }),
      });
    }
  };
  // const [CurrentLongitude, setCurrentLongitude] = useState('');
  // const [CurrentLatitude, setCurrentLatitude] = useState('');
  // const [LocationStatus, setLocationStatus] = useState('');


  // useEffect(() => {
  //   const requestLocationPermission = async () => {
  //     if (Platform.OS === 'ios') {
  //       getOneTimeLocation();
  //     } else {
  //       try {
  //         const granted = await PermissionsAndroid.request(
  //           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //           {
  //             title: 'Location Access Required',
  //             message: 'This App need your Access your Location please',
  //           },
  //         );
  //         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //           // To check if permission granted
  //           getOneTimeLocation();
  //           subscribeLocationLocation();
  //         } else {
  //           setLocationStatus('permission Denied');
  //         }
  //       } catch (err) {
  //         console.warn(err);
  //       }
  //     }
  //   };
  //   requestLocationPermission();
  //   return () => {
  //     Geolocation.clearWatch(watchID);
  //   };
  // }, []);
  const getOneTimeLocation = () => {
    setLocationStatus('getting location ....');
    Geolocation.getCurrentPosition(
      //will give you a current location
      position => {
        setLocationStatus('you are here');
        //getting logitude from the location json
        console.log('current location is here===>', position);
        console.log('position coords', position.coords);
        const CurrentLongitude = JSON.stringify(position.coords.longitude);
        //getting the latutude from location json
        const CurrentLatitude = JSON.stringify(position.coords.latitude);
        AsyncStorage.setItem('locationHistory', JSON.stringify({CurrentLongitude,CurrentLatitude}));
        //setting longitude state
        setCurrentLongitude(CurrentLongitude);
        //setting latitude state
        setCurrentLatitude(CurrentLatitude);
      },
      error => {
        setLocationStatus(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 4000,
        maximumAge: 2000,
      },
    );
  };
  const subscribeLocationLocation = () => {
    watchID = Geolocation.watchPosition(
      position => {
        //will give you the location on location change

        setLocationStatus('You are here');
        console.log('posiiton here===>', position);

        //getting the longitude  from the location json
        const CurrentLongitude = JSON.stringify(position.coords.longitude);

        //getting the latituude  from the location json
        const CurrentLatitude = JSON.stringify(position.coords.latitude);
        AsyncStorage.setItem('locationHistory', JSON.stringify({CurrentLongitude,CurrentLatitude}));
        //setting longitude state
        setCurrentLongitude(CurrentLongitude);

        //setting latitude state
        setCurrentLatitude(CurrentLatitude);
      },
      error => {
        setLocationStatus(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 2000,
      },
    );
  };
  return <View></View>;
};
export default Location;
