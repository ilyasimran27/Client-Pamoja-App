import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
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
} from './FollowingStyle';

import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
// import {TouchableOpacity} from 'react-native-gesture-handler';

const Following = ({navigation, route}) => {
    const [userData, setUserData] = useState(route.params.userData);
  
    useEffect(() => {}, []);
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
        <FlatList
          data={ route.params.followinfo}
          keyExtractor={item => item.uid}
          renderItem={({item}) => {
            return(
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
                  recievefollowRequest(item)
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
        )}}
      />
    </Container>
  );
};

export default Following;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
