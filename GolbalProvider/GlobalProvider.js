import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import firebase from '@react-native-firebase/app';
import MapView, {Marker, AnimatedRegion} from 'react-native-maps';
const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const AppContext = React.createContext();
const AppProvider = props => {
  const [userData, setUserData] = useState(null);
  const [allUserData, setAllUserData] = useState([]);
  const [otherUserData, setOtherUserData] = useState([]);
  const [postData, setPostData] = useState([]);
  const [profilePostData, setProfilePostData] = useState([]);

  const [locationData,setLocationData]=useState({
    curLoc: {
      latitude: 0,
      longitude: 0,
    },
    destinationCords: {},
    isLoading: false,
    coordinate: new AnimatedRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA,
    }),
    time: 0,
    distance: 0,
    heading: 0,
  })

  const [image,setImage]=useState(null)
  const getAllUser = async () => {
    let othersUser=[]
    await firebase
      .firestore()
      .collection('Users')
      .get()
      .then(qsnapshot => {
        qsnapshot.forEach(doc => {
          othersUser.push(doc.data());
        });
      });
    setOtherUserData(othersUser);
  };
  const getAllPosts = async () => {
    const data = [];
    await firebase
      .firestore()
      .collection('posts')
      .get()
      .then(qSnapshot => {
        qSnapshot.forEach(doc => {
          data.push(doc.data());
        });
      });
    // console.log('post data here===>',data);
    setPostData(data);
  };

  useEffect(() => {
    getAllUser();
    getAllPosts();
  }, []);
  return (
    <AppContext.Provider
      value={{
        userData,
        setUserData,
        allUserData,
        setAllUserData,
        otherUserData,
        setOtherUserData,
        postData, setPostData,
        profilePostData, setProfilePostData,
        locationData,setLocationData
        
      }}>
      {props.children}
    </AppContext.Provider>
  );
};
export {AppContext, AppProvider};
