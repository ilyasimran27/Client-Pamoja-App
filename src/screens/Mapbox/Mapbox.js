//new code
import React, {useState, useRef, useEffect,useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import MapView, {Marker, AnimatedRegion} from 'react-native-maps';
import imagePath from './imagePath';
import MapViewDirections from 'react-native-maps-directions';
import Loader from './Loader';
//import MapViewDirections from 'react-native-maps-directions';
import {locationPermission, getCurrentLocation} from './helperFunction';
import {AppContext} from '../../../GolbalProvider/GlobalProvider';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icons from 'react-native-vector-icons/Entypo';
import { primaryColor } from '../../config';
import Entype from 'react-native-vector-icons/Entypo';
import firestore from '@react-native-firebase/firestore';
const { width, height } = Dimensions.get('window');

const GOOGLE_MAP_KEY = 'AIzaSyC9Fv0X8v8Z6UVNFG3ySLKRnRngd_UlB6I';

const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const MapBox = ({navigation,setLoadMap, alertReason, reason}) => {
  const {
    userData,
    setUserData,
    allUserData,
    setAllUserData,
    otherUserData,
    setOtherUserData,
    locationData,setLocationData
  } = useContext(AppContext);
  const [renderCoordinate, setRenderCoordinate] = useState([0, 0]);
  const [sendUserArray, setSendUserArray] = useState([]);
  const [locationDataServer, setLocationDataServer] = useState(null);
  const mapRef = useRef();
  const markerRef = useRef();

  // const [state, setState] = useState({
  //   curLoc: {
  //     latitude: 30.7046,
  //     longitude: 77.1025,
  //   },
  //   destinationCords: {},
  //   isLoading: false,
  //   coordinate: new AnimatedRegion({
  //     latitude: 30.7046,
  //     longitude: 77.1025,
  //     latitudeDelta: LATITUDE_DELTA,
  //     longitudeDelta: LONGITUDE_DELTA,
  //   }),
  //   time: 0,
  //   distance: 0,
  //   heading: 0,
  // });

  const {
    curLoc,
    time,
    distance,
    destinationCords,
    isLoading,
    coordinate,
    heading,
  } = locationData;
  console.log('current location is====>',curLoc)
  const updateState = data => setLocationData(locationData => ({...locationData, ...data}));


  // useEffect(() => {
  //   getLiveLocation();
  // }, []);

  const getLiveLocation = async () => {
    const locPermissionDenied = await locationPermission();
    if (locPermissionDenied) {
      const {latitude, longitude, heading} = await getCurrentLocation();
      console.log('get live location after 4 second', heading);
      animate(latitude, longitude);
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

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     getLiveLocation();
  //   }, 6000);
  //   return () => clearInterval(interval);
  // }, []);

  const onPressLocation = () => {
    navigation.navigate('chooseLocation', {getCordinates: fetchValue});
  };
  const fetchValue = data => {
    console.log('this is data', data);
    updateState({
      destinationCords: {
        latitude: data.destinationCords.latitude,
        longitude: data.destinationCords.longitude,
      },
    });
  };

  const animate = (latitude, longitude) => {
    const newCoordinate = {latitude, longitude};
    if (Platform.OS == 'android') {
      if (markerRef.current) {
        markerRef.current.animateMarkerToCoordinate(newCoordinate, 7000);
      }
    } else {
      coordinate.timing(newCoordinate).start();
    }
  };

  const onCenter = () => {
    mapRef.current.animateToRegion({
      latitude: curLoc.latitude,
      longitude: curLoc.longitude,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    });
  };

  const fetchTime = (d, t) => {
    updateState({
      distance: d,
      time: t,
    });
  };
  const changeCorodinate = async () => {
    setRenderCoordinate([
      Number(locationDataServer.locationCoordinate['CurrentLatitude']),
      40,
    ]);
    let updateSendUserArray = [...sendUserArray];
    updateSendUserArray = updateSendUserArray.filter(
      item => item !== userData.uid,
    );
    // console.log('updateduserArray=>',updateSendUserArray,userData)
    await firestore()
      .collection('locations')
      .doc(locationData.locationId)
      .update({ sendTo: updateSendUserArray });
  };
  const getDataFromFirestore = async () => {
    try {
      let data = [];
      await firestore()
        .collection('locations')
        .where('alertType', '==', reason)
        .where('alertReason', '==', alertReason)
        .orderBy('createdDate', 'desc')
        .get()
        .then(qsnapshot => {
          qsnapshot.forEach(doc => {
            data.push(doc.data());
          });
        });
        setSendUserArray(data[0].sendTo)
      setLocationDataServer(data[0]);

    } catch (e) {
      console.log('error in getting data', e);
    }
  };
  useEffect(() => {
    getDataFromFirestore();
  }, [alertReason]);
  return (
    <View style={styles.container}>
      {distance !== 0 && time !== 0 && (
        <View style={{alignItems: 'center', marginVertical: 16}}>
          <Text>Time left: {time.toFixed(0)} </Text>
          <Text>Distance left: {distance.toFixed(0)}</Text>
        </View>
      )}
      <View style={{flex: 1}}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{
            ...curLoc            ,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}>
          <Marker.Animated ref={markerRef} coordinate={curLoc}>
            <Image
              source={imagePath.icBike}
              style={{
                width: 40,
                height: 40,
                transform: [{rotate: `${heading}deg`}],
              }}
              resizeMode="contain"
            />
          </Marker.Animated>

          {/* {Object.keys(destinationCords).length > 0 && (
            <Marker
              coordinate={destinationCords}
              image={imagePath.icGreenMarker}
            />
          )} */}

          {/* {Object.keys(destinationCords).length > 0 && (
            <MapViewDirections
              origin={curLoc}
              destination={destinationCords}
              apikey={GOOGLE_MAP_KEY}
              strokeWidth={6}
              strokeColor="red"
              optimizeWaypoints={true}
              onStart={params => {
                console.log(
                  `Started routing between "${params.origin}" and "${params.destination}"`,
                );
              }}
              onReady={result => {
                console.log(`Distance: ${result.distance} km`);
                console.log(`Duration: ${result.duration} min.`);
                fetchTime(result.distance, result.duration),
                  mapRef.current.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      // right: 30,
                      // bottom: 300,
                      // left: 30,
                      // top: 100,
                    },
                  });
              }}
              onError={errorMessage => {
                // console.log('GOT AN ERROR');
              }}
            />
          )} */}
        </MapView>
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
          }}
          onPress={onCenter}>
          <Image source={imagePath.greenIndicator} />
        </TouchableOpacity>
      </View>
      {locationDataServer !== null ? (
        <View
          style={{
            width: '80%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            // backgroundColor: '#ff5722',
            backgroundColor: primaryColor,
            borderRadius: 100,
            paddingHorizontal: 20,
            paddingVertical: 20,
            position: 'absolute',
            bottom: 20,
          }}>
          <View
            style={{
              width: '40%',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Image
              source={
                userData?.imageUrl
                  ? {
                    uri: userData?.imageUrl,
                  }
                  : {
                    uri: 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
                  }
              }
              style={{ width: 40, height: 40, borderRadius: 40 / 2 }}
            />
            <Text style={{ marginLeft: 10, color: 'white' }}>
              {userData?.name}
            </Text>
          </View>

          <View
            style={{
              width: '30%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => {
                // alert('your Alert is sent!');
                // setLoadMap(false);
                changeCorodinate();
              }}>
              <Icon
                name="check"
                style={{
                  width: 40,
                  borderRadius: 40 / 2,
                  backgroundColor: 'white',
                  textAlign: 'center',
                  fontSize: 30,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  color: '#ff5722',
                }}
              />
            </TouchableOpacity>
            <View style={{ width: 10 }} />
            <TouchableOpacity onPress={() => setLoadMap(false)}>
              <Icons
                name="cross"
                style={{
                  width: 40,
                  borderRadius: 40 / 2,
                  backgroundColor: 'white',
                  textAlign: 'center',
                  fontSize: 30,
                  paddingVertical: 5,
                  paddingHorizontal: 10,
                  color: '#ff5722',
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <></>
      )}
      <Loader isLoading={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bottomCard: {
    backgroundColor: 'white',
    width: '100%',
    padding: 30,
    borderTopEndRadius: 24,
    borderTopStartRadius: 24,
  },
  inpuStyle: {
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    marginTop: 16,
  },
});

export default MapBox;

//old code
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ImageBackground,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   Dimensions,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import Icons from 'react-native-vector-icons/Entypo';
// import { primaryColor } from '../../config';
// import Entype from 'react-native-vector-icons/Entypo';
// import firestore from '@react-native-firebase/firestore';

// const { width, height } = Dimensions.get('window');
// import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
// import { locationPermission, getCurrentLocation } from './helperFunction';
// import MapboxGL from '@rnmapbox/maps';
// MapboxGL.setAccessToken(
//   'pk.eyJ1IjoibWF0cml4LXRlY2giLCJhIjoiY2wxZGc2MXhpMDl1ZzNjbjNkZmF0MDE0NSJ9.ySJpXEurUTjfVnCZDCMpVA',
// );
// const MapBox = ({ setLoadMap, userData, locationCoordinate, alertReason, reason }) => {
//   const [renderCoordinate, setRenderCoordinate] = useState([0, 0]);
//   const [sendUserArray, setSendUserArray] = useState([]);
//   const [locationData, setLocationData] = useState(null);
//   const [users, setUsers] = useState([]);
//   // console.log('locationCoordinate in mapbox===>', locationCoordinate);
//   let latitude = Number(locationCoordinate.CurrentLongitude);

//   const coordinates = [
//     Number(locationCoordinate.CurrentLatitude),
//     Number(locationCoordinate.CurrentLongitude),
//   ];
//   const changeCorodinate = async () => {
//     setRenderCoordinate([
//       Number(locationData.locationCoordinate['CurrentLatitude']),
//       40,
//     ]);
//     let updateSendUserArray = [...sendUserArray];
//     updateSendUserArray = updateSendUserArray.filter(
//       item => item !== userData.uid,
//     );
//     // console.log('updateduserArray=>',updateSendUserArray,userData)
//     await firestore()
//       .collection('locations')
//       .doc(locationData.locationId)
//       .update({ sendTo: updateSendUserArray });
//   };
//   const getDataFromFirestore = async () => {
//     try {
//       let data = [];
//       await firestore()
//         .collection('locations')
//         .where('alertType', '==', reason)
//         .where('alertReason', '==', alertReason)
//         .orderBy('createdDate', 'desc')
//         .get()
//         .then(qsnapshot => {
//           qsnapshot.forEach(doc => {
//             data.push(doc.data());
//           });
//         });
//       setUsers(data);

//     } catch (e) {
//       console.log('error in getting data', e);
//     }
//   };
//   useEffect(() => {
//     getDataFromFirestore();
//   }, [alertReason]);
//   return (
//     <View style={styles.container}>
//      <MapView
//        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
//        style={styles.map}
//        region={{
//          latitude: 37.78825,
//          longitude: -122.4324,
//          latitudeDelta: 0.015,
//          longitudeDelta: 0.0121,
//        }}
//      >
//      </MapView>
//    </View>
//     <View style={styles.page}>
//       <View style={styles.container}>
//         <MapboxGL.MapView
//           style={styles.map}
//           // zoomLevel={9}
//           renderMode="normal"
//           zoomEnabled={true}>

//           {!!users?.length && users.map((e, i) => {
//             return (
//               <React.Fragment key={Math.random()}>
//               </React.Fragment>
//             )
//           })}
//         </MapboxGL.MapView>
//         </View>
//       {locationData !== null ? (
//         <View
//           style={{
//             width: '80%',
//             display: 'flex',
//             flexDirection: 'row',
//             justifyContent: 'space-between',
//             // backgroundColor: '#ff5722',
//             backgroundColor: primaryColor,
//             borderRadius: 100,
//             paddingHorizontal: 20,
//             paddingVertical: 20,
//             position: 'absolute',
//             bottom: 20,
//           }}>
//           <View
//             style={{
//               width: '40%',
//               flexDirection: 'row',
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}>
//             <Image
//               source={
//                 userData?.imageUrl
//                   ? {
//                     uri: userData?.imageUrl,
//                   }
//                   : {
//                     uri: 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
//                   }
//               }
//               style={{ width: 40, height: 40, borderRadius: 40 / 2 }}
//             />
//             <Text style={{ marginLeft: 10, color: 'white' }}>
//               {userData?.name}
//             </Text>
//           </View>

//           <View
//             style={{
//               width: '30%',
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//             }}>
//             <TouchableOpacity
//               onPress={() => {
//                 // alert('your Alert is sent!');
//                 // setLoadMap(false);
//                 changeCorodinate();
//               }}>
//               <Icon
//                 name="check"
//                 style={{
//                   width: 40,
//                   borderRadius: 40 / 2,
//                   backgroundColor: 'white',
//                   textAlign: 'center',
//                   fontSize: 30,
//                   paddingVertical: 5,
//                   paddingHorizontal: 10,
//                   color: '#ff5722',
//                 }}
//               />
//             </TouchableOpacity>
//             <View style={{ width: 10 }} />
//             <TouchableOpacity onPress={() => setLoadMap(false)}>
//               <Icons
//                 name="cross"
//                 style={{
//                   width: 40,
//                   borderRadius: 40 / 2,
//                   backgroundColor: 'white',
//                   textAlign: 'center',
//                   fontSize: 30,
//                   paddingVertical: 5,
//                   paddingHorizontal: 10,
//                   color: '#ff5722',
//                 }}
//               />
//             </TouchableOpacity>
//           </View>
//         </View>
//       ) : (
//         <></>
//       )}
//     </View>
//   );
// };
// export default MapBox;

// const styles = StyleSheet.create({
//   page: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5FCFF',
//     width,
//     height,
//   },
//   container: {
//     width,
//     height,
//     backgroundColor: 'tomato',
//   },
//   map: {
//     flex: 1,
//   },
//   location: {
//     color: primaryColor,
//     fontSize: 31,
//   },
//   ontainer: {
//     ...StyleSheet.absoluteFillObject,
//     height: 400,
//     width: 400,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
// });
