import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {primaryColor} from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
const About = ({navigation, route}) => {
 // const [userData, setUserData] = useState(route.params.userData);
  //const [otherUsersData, setOtherUsersData] = useState(
  //  route.params.otherUsersData,
  //);

 
  useEffect(() => {}, []);

  return (
    <View style={styles.container}>
  {/*   <View style={styles.circle}>
     <Image
          source={{
            uri: userData?.imageUrl
              ? userData?.imageUrl
              : 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
          }}
          style={{width: '100%', height: '100%', borderRadius: 120 / 2}}
        /> 
      <Text style={[styles.txt, {textAlign: 'center'}]}>{userData.name}</Text> 
        </View>*/}
        <View style={{alignItems: 'flex-start'}}>
      {/*  <Text style={[styles.txt, {textAlign: 'center'}]}>{userData.name}</Text> 
      <Text style={styles.txt}>Email : {userData.email}</Text> */}
        {/* <Text style={styles.txt}>Education : {'ABC School'}</Text>
        <Text style={styles.txt}>Age : {'2'}</Text>
        <Text style={styles.txt}>Date of Birth : {'29 july 1997'}</Text>
        <Text style={styles.txt}>Address : {'Karachi Pakistan'}</Text> */}
      </View>
    </View>
  );
};

export default About;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    // justifyContent:'center',
    alignItems: 'center',
  },

  view: {
    backgroundColor: 'black',
    width: '100%',
    marginTop: 100,
    flexDirection: 'row',
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 360,
    borderWidth: 2,
    borderColor: primaryColor,
    backgroundColor: 'white',
    marginTop: 20,
    marginBottom: 50,
  },
  text: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
  },
  txt: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    padding: 10,
  },
  btntxt: {
    width: 100,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
  },
  btn: {
    borderRadius: 20,
    backgroundColor: primaryColor,
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewop: {
    backgroundColor: 'black',
    width: '100%',
    height: 200,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 30,
    color: 'white',
  },
  touchop: {
    borderRadius: 360,
    borderWidth: 2,
    borderColor: primaryColor,
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
    margin: 15,
  },

  touchtxt: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    margin: 5,
    marginTop: 7,
  },
});
