import React, {useState, useEffect} from 'react';
import Icon from 'react-native-vector-icons/AntDesign';
import {primaryColor} from '../../config';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon1 from 'react-native-vector-icons/FontAwesome5'; //user-alt
import Icon2 from 'react-native-vector-icons/FontAwesome5'; //user-plus
import Icon3 from 'react-native-vector-icons/FontAwesome5'; //star

import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import {Btn, Input} from '../../components';

import Iconss from 'react-native-vector-icons/SimpleLineIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import {useIsFocused} from '@react-navigation/native';
import {sendNotification} from '../../utils/notificationService';
import ImagePicker from 'react-native-image-crop-picker';
import SendIcon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import uuid from 'react-native-uuid';
import storage from '@react-native-firebase/storage';
import {TextInput} from 'react-native-gesture-handler';
import CameraIcon from 'react-native-vector-icons/AntDesign';
import {HORIZONTAL} from 'react-native/Libraries/Components/ScrollView/ScrollViewContext';
import {RED} from 'react-native-stories-view/src/utils/colors';

const AnyUserProfile = ({navigation, route}) => {
  const isFocused = useIsFocused();
  const {uid} = route.params;
  const [userData, setUserData] = useState({});
  const [userUid, setUserUid] = useState(JSON.parse(JSON.stringify(uid)));

  const [otherUsersData, setOtherUsersData] = useState([]);
  const [requestData, setRequestData] = useState([]);
  const [followData, setFollowData] = useState([]);
  const [post, setPost] = useState(null);
  const [postData, setPostData] = useState([]);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [comment, setComment] = useState(null);



  const getLocalfromSendRequest = async () => {
    let user = await AsyncStorage.getItem('sendRequestArray');
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


  const getDataFromFirestore = async () => {

    let requestData = [];
    let follwingData = [];
    let data2 = [];

    const sendRequest = await getLocalfromSendRequest();
    const followData = await getLocalfromFollowRequest();

    await firebase
      .firestore()
      .collection('Users')
      .where('uid', '==', userUid)
      .get()
      .then(qSnapshot => {
        qSnapshot.forEach(doc => {
          let myData = doc.data();
          console.log('YOOOLOOO--->', myData);
          setUserData(myData);
        });
      });

    console.log('userData in messageing==>', userData);
    console.log('userUid in messageing==>', userUid);

    const data = [];

    await firestore()
      .collection('posts')
      .where('userId', '==', userUid)
      .get()
      .then(qSnapshot => {
        qSnapshot.forEach(doc => {
          data2.push(doc.data());
        });
      });
    setPostData(data2);

    await firebase
      .firestore()
      .collection('Users')
      .where('uid', '==', userUid)
      .get()
      .then(qSnapshot => {
        qSnapshot.forEach(doc => {
          data.push(doc.data());
        });
      });

    await firebase
      .firestore()
      .collection('Users')
      .where('uid', '!=', userUid)
      .get()
      .then(qSnapshot => {
        qSnapshot.forEach(doc => {
          data.push(doc.data());
        });
      });

    requestData = data.filter(item => !sendRequest.includes(item.uid));
    follwingData = data.filter(item => !followData.includes(item.uid));
    setFollowData(follwingData);
    setRequestData(requestData);
    setOtherUsersData(data);
  };

  const submitComment = async item => {
    let postDataLocal = [...postData];
    const index = postDataLocal.findIndex(object => {
      return object.postId === item.postId;
    });
    let singlePost = {...item};

    singlePost = {
      ...singlePost,
      comments: singlePost.comments + 1,
    };
    postDataLocal[index] = singlePost;

    let commentId = uuid.v4();
    commentId = commentId.replaceAll('-', '_');
    const commentData = {
      userId: userData.uid,
      userHandle: userData.name,
      commnetId: commentId,
      commentTime: firestore.Timestamp.fromDate(new Date()),
      content: comment,
      likes: 0,
      comments: 0,
      likesByUsers: [],
      dislikes: 0,
      dislikesByUsers: [],
      postId: item.postId,
    };

    firestore()
      .collection('posts')
      .doc(item.postId)
      .update({
        comments: item.comments + 1,
      });
    firestore()
      .collection('posts')
      .doc(item.postId)
      .collection('comments')
      .doc(commentId)
      .set(commentData);
    setPostData(postDataLocal);
    let fcmToken = '';
    await firestore()
      .collection('Users')
      .doc(item.userId)
      .get()
      .then(qsnapshot => {
        fcmToken = qsnapshot.data().fcmToken;
      });
    if (item.userId !== userData.uid) {
      sendNotification(fcmToken, userData.name, 'comment');
    }
  };
  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      width: 1200,
      height: 880,
      cropping: true,
    })
      .then(image => {
        const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
        setImage(imageUri);
      })
      .catch(error => {});
  };
  const uploadImage = async () => {
    if (image == null) {
      return null;
    }
    const uploadUri = image;
    let filename = uploadUri.substring(uploadUri.lastIndexOf('/') + 1);

    // Add timestamp to File Name
    const extension = filename.split('.').pop();
    const name = filename.split('.').slice(0, -1).join('.');
    filename = name + Date.now() + '.' + extension;

    setUploading(true);
    setTransferred(0);

    const storageRef = storage().ref(`photos/${filename}`);
    const task = storageRef.putFile(uploadUri);

    // Set transferred state
    task.on('state_changed', taskSnapshot => {
      setTransferred(
        Math.round(taskSnapshot.bytesTransferred / taskSnapshot.totalBytes) *
          100,
      );
    });

    try {
      await task;

      const url = await storageRef.getDownloadURL();

      setUploading(false);
      setImage(null);

      // Alert.alert(
      //   'Image uploaded!',
      //   'Your image has been uploaded to the Firebase Cloud Storage Successfully!',
      // );
      return url;
    } catch (e) {
      console.log(e);
      return null;
    }
  };
  const submitPost = async () => {
    const imageUrl = await uploadImage();
    let postId = uuid.v4();
    postId = postId.replaceAll('-', '_');

    const postingData = {
      userId: userData.uid,
      userHandle: userData.name,
      postImg: imageUrl,
      postTime: firestore.Timestamp.fromDate(new Date()),
      content: post,
      likes: 0,
      comments: 0,
      likesByUsers: [],
      dislikes: 0,
      dislikesByUsers: [],
      postId,
    };
    let uploadPost = [...postData, postingData];
    firestore()
      .collection('posts')
      .doc(postId)
      .set({
        userId: userData.uid,
        userHandle: userData.name,
        postImg: imageUrl,
        postTime: firestore.Timestamp.fromDate(new Date()),
        content: post,
        likes: 0,
        dislikes: 0,
        likesByUsers: [],
        dislikesByUsers: [],
        comments: 0,
        postId,
      });

    setPost('');

    setPostData(uploadPost);
  };
  const diskLike = async post => {
    let fcmToken = '';
    await firestore()
      .collection('Users')
      .doc(post.userId)
      .get()
      .then(qsnapshot => {
        fcmToken = qsnapshot.data().fcmToken;
      });
    let postDataLocal = [...postData];
    const index = postDataLocal.findIndex(object => {
      return object.postId === post.postId;
    });

    let dislikes = 0;
    let dislikeByArray = [];
    let singlePost = {...post};
    if (singlePost.dislikes !== null) {
      dislikes = singlePost.dislikes + 1;
    } else {
      dislikes == 0;
    }
    if (!singlePost.dislikesByUsers.includes(userData.uid)) {
      dislikeByArray = [...singlePost.dislikesByUsers, userData.uid];
      singlePost = {...singlePost, dislikes, dislikesByUsers: dislikeByArray};

      postDataLocal[index] = singlePost;
      setPostData(postDataLocal);
      firestore().collection('posts').doc(post.postId).update({
        dislikes,
        dislikesByUsers: dislikeByArray,
      });
      if (post.userId !== userData.uid) {
        sendNotification(fcmToken, userData.name, 'dislike');
      }
    } else {
      dislikeByArray = singlePost.dislikesByUsers.filter(
        item => item !== userData.uid,
      );

      dislikes = singlePost.dislikes - 1;
      singlePost = {...singlePost, dislikes, dislikesByUsers: dislikeByArray};

      postDataLocal[index] = singlePost;
      setPostData(postDataLocal);
      firestore().collection('posts').doc(post.postId).update({
        dislikes,
        dislikesByUsers: dislikeByArray,
      });
    }
  };
  const postLike = async post => {
    let fcmToken = '';
    await firestore()
      .collection('Users')
      .doc(post.userId)
      .get()
      .then(qsnapshot => {
        fcmToken = qsnapshot.data().fcmToken;
      });
    let postDataLocal = [...postData];
    const index = postDataLocal.findIndex(object => {
      return object.postId === post.postId;
    });

    let likes = 0;
    let likeByArray = [];
    let singlePost = {...post};
    if (singlePost.likes !== null) {
      likes = singlePost.likes + 1;
    } else {
      likes == 0;
    }
    if (!singlePost.likesByUsers.includes(userData.uid)) {
      likeByArray = [...singlePost.likesByUsers, userData.uid];
      singlePost = {...singlePost, likes, likesByUsers: likeByArray};

      postDataLocal[index] = singlePost;
      setPostData(postDataLocal);
      firestore().collection('posts').doc(post.postId).update({
        likes,
        likesByUsers: likeByArray,
      });
      if (post.userId !== userData.uid) {
        sendNotification(fcmToken, userData.name, 'like');
      }
    } else {
      likeByArray = singlePost.likesByUsers.filter(
        item => item !== userData.uid,
      );

      likes = singlePost.likes - 1;
      singlePost = {...singlePost, likes, likesByUsers: likeByArray};

      postDataLocal[index] = singlePost;
      setPostData(postDataLocal);
      firestore().collection('posts').doc(post.postId).update({
        likes,
        likesByUsers: likeByArray,
      });
    }
  };

  useEffect(() => {
    if (isFocused) {
      getDataFromFirestore();
    }
  }, [isFocused]);

  return (
    <ScrollView style={styles.container}>
      <View
        style={{
          alignItems: 'center',
          paddingTop: 40,
        }}>
        <Image
          source={{
            uri: userData?.imageUrl
              ? userData?.imageUrl
              : 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
          }}
          style={{
            width: 130,
            height: 130,
            borderRadius: 360 / 2,
          }}
        />
      </View>

      <View style={{alignItems: 'center', paddingTop: 15, paddingBottom: 30}}>
        <Text style={{color: 'white', fontSize: 20}}>{userData.name}</Text>
      </View>

      <View
        style={{
          alignItems: 'center',
        }}>
        <TouchableHighlight onPress={() => {}}>
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#ff7630',
              padding: 5,
              borderRadius: 360,
            }}>
            <MIcon
              style={{marginLeft: 15, marginTop: 2}}
              name="chat"
              size={18}
              color="white"
            />
            <Text style={{color: 'white', fontSize: 15, marginRight: 15}}>
              {' '}
              Chat
            </Text>
          </View>
        </TouchableHighlight>
      </View>

      <View
        style={{
          alignSelf: 'center',
          width: '90%',

          marginTop: 50,
          borderTopWidth: 0.5,
          borderTopColor: '#ff7630',
          borderBottomWidth: 0.5,
          borderBottomColor: '#ff7630',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignSelf: 'center',
            backgroundColor: 'black',
          }}>
          <View style={{padding: 10}}>
            <TouchableHighlight onPress={() => {}}>
              <View style={{alignItems: 'center', marginRight: 40}}>
                <Icon1
                  // style={{marginLeft: 15, marginTop: 2}}
                  name="user-alt"
                  size={20}
                  color="white"
                />
                <Text style={{color: 'white', fontSize: 12}}>About</Text>
              </View>
            </TouchableHighlight>
          </View>

          <View style={{padding: 10}}>
            <TouchableHighlight
              onPress={() => {
                navigation.navigate('SendRequest', {
                  userData: userData,
                  otherUsersData: requestData,
                });
              }}>
              <View style={{alignItems: 'center'}}>
                <Icon2
                  // style={{marginLeft: 15, marginTop: 2}}
                  name="user-plus"
                  size={20}
                  color="white"
                />
                <Text style={{color: 'white', fontSize: 12}}>Send Request</Text>
              </View>
            </TouchableHighlight>
          </View>

          <View style={{padding: 10}}>
            <TouchableHighlight
              onPress={() => {
                navigation.navigate('FollowRequest', {
                  userData: userData,
                  otherUsersData: followData,
                });
              }}>
              <View style={{alignItems: 'center', marginLeft: 40}}>
                <Icon3
                  // style={{marginLeft: 15, marginTop: 2}}
                  name="star"
                  size={20}
                  color="white"
                />
                <Text style={{color: 'white', fontSize: 12}}>Follow</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
      </View>
      <View
        style={{
          alignSelf: 'center',
          width: '90%',
          marginTop: 50,
        }}>
        {postData?.map((post, index) => {
          return (
            <View style={{marginBottom: 10}} key={index}>
              {index === 0 ? (
                <Text
                  style={{
                    color: 'white',
                    marginLeft: 14,
                    fontSize: 18,
                    marginBottom: 10,
                  }}>
                  Posts
                </Text>
              ) : (
                <></>
              )}
              <View style={{borderRadius: 20, backgroundColor: 'white'}}>
                <View
                  style={{
                    height: 50,
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                  }}>
                  <View style={{flexDirection: 'row'}}>
                    <View style={{justifyContent: 'center', padding: '7.5%'}}>
                      <Image
                        source={{
                          uri: userData?.imageUrl,
                        }}
                        style={{width: 40, height: 40, borderRadius: 40 / 2}}
                      />
                    </View>
                    <View style={{justifyContent: 'center'}}>
                      <Text style={{fontSize: 15, fontWeight: 'bold'}}>
                        {post?.userHandle}
                      </Text>
                    </View>
                  </View>
                  <View style={{justifyContent: 'center', padding: '2%'}}>
                    <Entypo.Button
                      name="dots-three-horizontal"
                      color="black"
                      backgroundColor="transparent"
                    />
                  </View>
                </View>
                {post?.postImg ? (
                  <View
                    style={{
                      height: 300,
                      backgroundColor: 'black',
                    }}>
                    <Image
                      source={{
                        uri: post?.postImg,
                      }}
                      style={{
                        width: '100%',
                        height: 300,
                      }}
                    />
                  </View>
                ) : (
                  <></>
                )}

                <View
                  style={{
                    height: 100,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'black',
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      textAlign: 'center',
                      fontSize: 14,
                      fontWeight: 'bold',
                      backgroundColor: 'black',
                    }}>
                    {post.content}
                  </Text>
                </View>

                <View style={{}}>
                  <View
                    style={{
                      backgroundColor: 'white',
                      borderBottomWidth: 1,
                      borderBottomColor: 'black',
                    }}>
                    <View
                      style={{
                        height: 15,

                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                        width: '60%',
                        alignItems: 'center',
                        marginBottom: 2,
                      }}>
                      <Text>{post.likes}Likes</Text>
                      <Text>{post.dislikes}Dislikes</Text>
                      <Text>{post.comments}Comments</Text>
                    </View>
                  </View>
                  <View
                    style={{
                      backgroundColor: 'white',
                    }}>
                    <View
                      style={{
                        height: 45,

                        flexDirection: 'row',
                        justifyContent: 'space-evenly',

                        alignItems: 'center',
                        marginBottom: 2,
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          postLike(post);
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Icon
                            name="like1"
                            style={{marginRight: 5}}
                            size={20}
                            color={
                              post?.likesByUsers?.includes(userData.uid)
                                ? '#ff7630'
                                : 'black'
                            }
                          />
                          <Text style={{marginTop: 4}}>Like</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          diskLike(post);
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',

                            alignItems: 'center',
                            alignContent: 'center',
                          }}>
                          <Icon
                            name="dislike1"
                            style={{marginRight: 5, marginTop: 4}}
                            size={20}
                            color={
                              post.dislikesByUsers.includes(userData.uid)
                                ? '#ff7630'
                                : 'black'
                            }
                          />
                          <Text>Dislike</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('CommentScreen', {
                            postData: post,
                            userData: userData,
                            otherUserData: otherUserData,
                          });
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <Icons
                            name="commenting-o"
                            style={{marginRight: 5}}
                            size={20}
                            color="black"
                          />
                          <Text>Comments</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      alignItems: 'center',
                      backgroundColor: 'white',
                      borderBottomRightRadius: 20,
                      borderBottomLeftRadius: 20,
                    }}>
                    <View>
                      <Image
                        source={{
                          uri: userData?.imageUrl
                            ? userData?.imageUrl
                            : 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
                        }}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 40 / 2,
                          marginLeft: 8,
                        }}
                      />
                    </View>

                    <View
                      style={{
                        width: '75%',
                        borderRadius: 20,
                        borderColor: '#999999',
                        borderWidth: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 40,
                      }}>
                      <TextInput
                        placeholder="Add a comment"
                        style={{textAlign: 'left', width: '100%'}}
                        value={comment}
                        onChangeText={content => setComment(content)}
                      />
                      {/* <TouchableOpacity
                        onPress={() => {
                          takePhotoFromCamera();
                        }}>
                        <CameraIcon
                          name="camera"
                          style={{marginRight: 5}}
                          size={25}
                          color="black"
                        />
                      </TouchableOpacity> */}
                    </View>
                    <View
                      style={{
                        backgroundColor: '#ff7630',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 20,
                        padding: 8,
                      }}>
                      <TouchableOpacity
                        disabled={post ? false : true}
                        onPress={() => {
                          submitComment(post);
                          setComment();
                        }}>
                        <SendIcon
                          name="send"
                          style={{}}
                          size={20}
                          color="white"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default AnyUserProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  circle: {
    width: 130,
    height: 130,
    borderRadius: 360,
    justifyContent: 'center',
  },
});
