import React, {useState, useEffect,useContext} from 'react';
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
import {AppContext} from '../../../GolbalProvider/GlobalProvider';

// import {TouchableOpacity} from 'react-native-gesture-handler';
import {useIsFocused} from '@react-navigation/native';

const Peoples = ({navigation, route}) => {
  // const [userData, setUserData] = useState();
  const isFocused = useIsFocused();
  const [requestData, setRequestData] = useState([]);
  const [followData, setFollowData] = useState([]);
  const [receivedFollowData, setRecieveFollowData] = useState([]);
  const [receivedRequestData, setRecieveRequestData] = useState([]);

  const [peoplesData, setPeoplesData] = useState([]);
  const [otherUsersData2, setOtherUsersData2] = useState([]);
  const {
    userData,
    setUserData,
    allUserData,
    setAllUserData,
    otherUserData,
    setOtherUserData,
  } = useContext(AppContext);
  // const getLocalStorageData = async () => {
  //   let user = await AsyncStorage.getItem('userData');
  //   let data = JSON.parse(user);

  //   return data;
  // };
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
    console.log('get local storage data calling====>');
    let user = await AsyncStorage.getItem('followArray');
    if (user !== null) {
      let data = JSON.parse(user);
      return data;
    } else {
      return [];
    }

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

    // const userData = await getLocalStorageData();
    
    let data = [];
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
    data=otherUserData?.filter((item)=>item.uid!==userData?.uid)
    // await firestore()
    //   .collection('Users')
    //   .where('uid', '!=', userData.uid)
    //   .get()
    //   .then(qSnapshot => {
    //     qSnapshot.forEach(doc => {
         
    //       data.push(doc.data());
    //     });
    //   });
    requestData = data.filter(item => !sendRequest.includes(item.uid));
    recRequestData = data.filter(item => !recRequest.includes(item.uid));

    follwingData = data.filter(item => !followData.includes(item.uid));
    recFollwingData = data.filter(item => !recFollowData.includes(item.uid));
    if (sendRequest.length !== 0 && followData.length !== 0) {
      peoplesDataForSet = data.filter(
        item =>
          !sendRequest.includes(item.uid) && !followData.includes(item.uid),
      );
    }

    console.log('request data is========>', peoplesDataForSet);
    if (peoplesDataForSet.length === 0) {
      setPeoplesData(data);
    } else {
      setPeoplesData(peoplesDataForSet);
    }
    setRecieveFollowData(recFollowData);
    setFollowData(followData);
    setRequestData(sendRequest);
    setRecieveRequestData(recRequest);
    setOtherUsersData2(peoplesDataForSet);
    // setUserData(userData);
  };

  useEffect(() => {
    if (isFocused) {
      getDataFromFirestore();
    }
  }, [isFocused,userData]);
  const followRequest = async object => {
    let follwingData = [...followData, object.uid];
    let peoplesDataForSet = [...peoplesData];
 

    let data = [...otherUsersData2];

    await firestore()
      .collection('Users')
      .doc(userData?.uid)
      .collection('following')
      .doc(object.uid)
      .set(object);
    if (follwingData.length !== 0 && requestData.length !== 0) {
      peoplesDataForSet = peoplesDataForSet.filter(
        item =>
          !follwingData.includes(item.uid) && !requestData.includes(item.uid),
      );
    }

    AsyncStorage.setItem('followArray', JSON.stringify(follwingData));
    setFollowData(follwingData);
    setPeoplesData(peoplesDataForSet);

    setOtherUsersData2(data);
  };
  const recievefollowRequest = async object => {
    await firestore()
      .collection('Users')
      .doc(object.uid)
      .collection('recievefollowrequest')
      .doc(userData?.uid)
      .set(userData);
  };
  const sendRequest = async object => {
    let reqData = [...requestData, object.uid];
    let peoplesDataForSet = [...peoplesData];
    console.log('object is====>', object);
    let data = [...otherUsersData2];
    data = data.filter(item => item.uid !== object.uid);
    console.log('this is data', data);
    await firestore()
      .collection('Users')
      .doc(userData?.uid)
      .collection('sendrequest')
      .doc(object.uid)
      .set(object);
    if (reqData.length !== 0 && followData.length !== 0) {
      peoplesDataForSet = peoplesDataForSet.filter(
        item => !reqData.includes(item.uid) && !followData.includes(item.uid),
      );
    }

    AsyncStorage.setItem('sendRequestArray', JSON.stringify(reqData));
    setRequestData(reqData);
    setPeoplesData(peoplesDataForSet);
    setOtherUsersData2(data);
  };
  const recieveSendRequest = async object => {
    await firestore()
      .collection('Users')
      .doc(object.uid)
      .collection('recieverequest')
      .doc(userData?.uid)
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
          People you may know
        </Text>
      </View>

      <FlatList
        data={peoplesData}
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
                        : "https://cdn.pixabay.com/photo/2015/06/19/21/24/avenue-815297__480.jpg",
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
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',

                      width: '100%',
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 'bold',
                        fontFamily: 'Lato-Regular',

                        color: 'white',
                      }}>
                      {item.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        marginRight: 10,
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          sendRequest(item);
                          recieveSendRequest(item);
                        }}
                        style={{
                          backgroundColor: '#ff7630',
                          padding:!requestData.includes(item.uid)?5:0,
                          borderRadius: 10,
                        }}>
                        <Text
                          style={{
                            color: 'white',
                          }}>
                          {receivedRequestData.includes(item.uid)
                            ? 'Accept Request'
                            : !requestData.includes(item.uid)
                            ? 'Send Request'
                            : <></>}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          followRequest(item);
                          recievefollowRequest(item);
                        }}
                        style={{
                          backgroundColor: '#ff7630',
                          padding: !followData.includes(item.uid)?5:0,
                          borderRadius: 10,
                          marginLeft: 10,
                        }}>
                        <Text
                          style={{
                            color: 'white',
                          }}>
                          {!followData.includes(item.uid) &&
                          !receivedFollowData.includes(item.uid)
                            ? 'follow'
                            : !followData.includes(item.uid) &&
                              receivedFollowData.includes(item.uid)
                            ? 'follow back'
                            : !followData.includes(item.uid)
                            ? 'follow'
                            : <></>}
                        </Text>
                      </TouchableOpacity>
                    </View>
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

export default Peoples;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
