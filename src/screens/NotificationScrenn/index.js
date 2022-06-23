import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import SendIcon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {sendNotification} from '../../utils/notificationService';
const NotificationScreen = ({navigation, route}) => {
  const [userData, setUserData] = useState();
  const [notficationHistory, setNotificationHistory] = useState([]);
  const [otherUserData, serOtherUserData] = useState([]);

  const getLocalStorageData = async () => {
    let user = await AsyncStorage.getItem('userData');
    let data = JSON.parse(user);

    let data2 = [];
    try {
      await firestore()
        .collection('Users')
        .doc(data.uid)
        .collection('history')
        .where('receiverUserId', '==', data?.uid)
        .orderBy('createdDt', 'desc')
        .get()
        .then(qsnapshot => {
          qsnapshot.forEach(item => {
            data2.push(item.data());
          });
        });
      setNotificationHistory(data2);
      setUserData(data)
    } catch (e) {
      console.log('error in notification', e);
    }

    // return data;
  };
  const getOtherUserData = async () => {
    let data2 = [];

    await firestore()
      .collection('Users')
      .get()
      .then(qsnapshot => {
        qsnapshot.forEach(item => {
          data2.push(item.data());
        });
      });

    serOtherUserData(data2);
  };
  const checkUserImage = userId => {
    const userData = otherUserData.filter(item => item.uid === userId);

    return userData[0].imageUrl
      ? userData[0].imageUrl
      : 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max';
  };
  useEffect(() => {
    console.log('useeffect in notification');
    getLocalStorageData();
    getOtherUserData();
  }, []);
  return (
    <View style={styles.Wrapper}>
      <>
        <ScrollView style={[styles.content, {backgroundColor: 'black'}]}>
          <View
            style={{
              display: 'flex',

              alignItems: 'center',
            }}>
            {notficationHistory.map((item, index) => {
              return (
                <TouchableOpacity onPress={()=>{
                  item.type!=="message"?navigation.navigate('Home2', {
                    postId: item.postId
                  }):navigation.navigate('Chat', {
                    userName: item.userName,
                    otherUserId: item.senderUserId,
                    userData: userData,
                  })
                }} style={{width:"100%"}}>
                  <View
                    key={index}
                    style={{
                      height: 60,

                      backgroundColor: 'black',
                      display: 'flex',
                      flexDirection: 'row',
                      width: '100%',
                      borderWidth: 1,
                      borderColor: 'white',
                    }}>
                    {/* <Text>hello from comment</Text> */}
                    <Image
                      source={{
                        uri: checkUserImage(item.senderUserId),
                      }}
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 50 / 2,
                      }}
                    />
                    <View>
                      <View
                        style={{
                          borderRadius: 5,
                          padding: 5,
                          marginLeft: 5,
                          marginTop: 5,
                        }}>
                        <Text
                          style={{
                            fontWeight: 'bold',
                            marginBottom: 2,
                            color: 'white',
                          }}>
                          {item.title}
                        </Text>
                        <Text style={{color: 'white'}}>{item.body}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </>
    </View>
  );
};
export default NotificationScreen;
const styles = StyleSheet.create({
  Wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    width: '100%',

    backgroundColor: 'white',
  },
});
