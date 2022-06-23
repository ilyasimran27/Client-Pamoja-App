import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import image from '../../assets/add.png';
import {
  Container,
  Card,
  UserInfo,
  UserImgWrapper,
  UserImg,
  UserInfoText,
  UserName,
  PostTime,
  MessageText,
  TextSection,
} from './FollowRequestStyle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
// import {TouchableOpacity} from 'react-native-gesture-handler';
import {useIsFocused} from '@react-navigation/native';

const Invites = ({navigation, route}) => {
  // console.log('routes in peoples===>', route.params.otherUsersData);
  const [userData, setUserData] = useState();
  const isFocused = useIsFocused();
  const [requestData, setRequestData] = useState([]);
  const [followData, setFollowData] = useState([]);
  const [invitesData, setInvitesData] = useState([]);
  const [otherUsersData, setOtherUsersData] = useState([]);
  const getLocalStorageData = async () => {
    let user = await AsyncStorage.getItem('userData');
    let data = JSON.parse(user);

    return data;
  };
  const getLocalfromSendRequest = async () => {
    let user = await AsyncStorage.getItem('sendRequestArray');
    if (user !== null) {
      let data = JSON.parse(user);
      return data;
    } else {
      return [];
    }
  };
  const getRecLocalfromSendRequest = async () => {
    console.log('get local storage data calling====>');
    let user = await AsyncStorage.getItem('recRequestArray');
    if (user !== null) {
      let data = JSON.parse(user);
      return data;
    } else {
      return [];
    }
  };
  const getLocalfromFollowRequest = async () => {
    let user = await AsyncStorage.getItem('followArray');
    if (user !== null) {
      let data = JSON.parse(user);
      return data;
    } else {
      return [];
    }

    console.log('parsed send request========>', data);
  };
  const getLocalfromRecFollowRequest = async () => {
    let user = await AsyncStorage.getItem('recfollowArray');
    if (user !== null) {
      let data = JSON.parse(user);
      return data;
    } else {
      return [];
    }

    console.log('parsed send request========>', data);
  };
  const getDataFromFirestore = async () => {
    console.log('function calling in menu');
    let requestData = [];
    let follwingData = [];
    let recRequestData = [];
    let recFollwingData = [];
    let peoplesDataForSet = [];
    let data2 = [];
    const sendRequest = await getLocalfromSendRequest();
    const recRequest = await getRecLocalfromSendRequest();

    const followData = await getLocalfromFollowRequest();
    const recFollowData = await getLocalfromRecFollowRequest();

    const userData = await getLocalStorageData();
    console.log('sendRequest', userData);
    const data = [];
    // await firestore()
    //   .collection('posts')
    //   .where('userId', '==', userData.uid)
    //   .get()
    //   .then(qSnapshot => {
    //     qSnapshot.forEach(doc => {
    //       data2.push(doc.data());
    //     });
    //   });
    // setPostData(data2);
    await firestore()
      .collection('Users')
      .where('uid', '!=', userData.uid)
      .get()
      .then(qSnapshot => {
        qSnapshot.forEach(doc => {
          console.log(doc.data().uid < userData.uid);
          data.push(doc.data());
        });
      });
    requestData = data.filter(item => !sendRequest.includes(item.uid));
    recRequestData = data.filter(item => !recRequest.includes(item.uid));

    follwingData = data.filter(item => !followData.includes(item.uid));
    recFollwingData = data.filter(item => !recFollowData.includes(item.uid));
    invitesDataForSet = data.filter(
      item => recRequest.includes(item.uid) || recFollowData.includes(item.uid),
    );
    console.log('request data is========>', peoplesDataForSet);
    setInvitesData(invitesDataForSet);
    setFollowData(follwingData);
    setRequestData(requestData);
    setOtherUsersData(peoplesDataForSet);
    setUserData(data);
  };

  useEffect(() => {
    if (isFocused) {
      getDataFromFirestore();
    }
  }, [isFocused]);
  const followRequest = async object => {
    console.log('object is====>', object);
    let data = [...otherUsersData];
    data = data.filter(item => item.uid !== object.uid);
    console.log('this is data', data);
    await firestore()
      .collection('Users')
      .doc(userData.uid)
      .collection('following')
      .doc(object.uid)
      .set(object);
    setOtherUsersData(data);
  };
  const recievefollowRequest = async object => {
    await firestore()
      .collection('Users')
      .doc(object.uid)
      .collection('recievefollowrequest')
      .doc(userData.uid)
      .set(userData);
  };
  return (
    <Container>
      <View
        style={{
          backgroundColor: '#ff7630',
          width: '100%',
          padding: 10,
          marginVertical: 5,
          borderRadius: 20,
        }}>
        <Text
          style={{
            textAlign: 'center',
            color: 'white',
            fontSize: 19,
          }}>
          Invitations
        </Text>
      </View>

      <FlatList
        data={invitesData}
        keyExtractor={item => item.uid}
        renderItem={({item}) => (
          <Card>
            <UserInfo>
              <View
                style={{
                  flexDirection: 'row',

                  width: '60%',
                }}>
                <UserImgWrapper>
                  <Image
                    source={{
                      uri: item?.imageUrl
                        ? item?.imageUrl
                        : 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
                    }}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 60 / 2,
                      marginLeft: 8,
                    }}
                  />
                </UserImgWrapper>
                <TextSection>
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        fontFamily: 'Lato-Regular',

                        color: 'white',
                      }}>
                      {item.name}
                    </Text>
                  </View>

                  {/* <PostTime>{item.messageTime}</PostTime> */}

                  {/* <MessageText>{item.messageText}</MessageText> */}
                </TextSection>
              </View>

              {/* <TouchableOpacity
                onPress={() => {
                  console.log('onpresss=?', item);
                  followRequest(item);
                  recievefollowRequest(item);
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 100,
                }}>
                <Text
                  style={{
                    color: 'white',
                    backgroundColor: '#ff7630',
                    padding: 10,
                    borderRadius: 50,
                  }}>
                  Follow
                </Text>
              </TouchableOpacity> */}
            </UserInfo>
          </Card>
        )}
      />
    </Container>
  );
};

export default Invites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
