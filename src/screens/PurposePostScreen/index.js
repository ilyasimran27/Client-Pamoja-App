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
import React, {useEffect, useState, useRef} from 'react';
import {primaryColor, secondaryColor} from '../../config/index';
import CameraIcon from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/AntDesign';
import {useIsFocused} from '@react-navigation/native';
import SendIcon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import uuid from 'react-native-uuid';
// import storage from '@react-native-firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from '@react-native-firebase/storage';
// import firestore from '@react-native-firebase/firestore';
import firestore from '@react-native-firebase/firestore';
import {SliderBox} from 'react-native-image-slider-box';
import {TextInput} from 'react-native-gesture-handler';
import {sendNotification} from '../../utils/notificationService';
import axios from 'axios';
const postCollection = firestore().collection('posts');
export default function PurposePostScreen({navigation}) {
  const [userData, setUserData] = useState();
  const [otherUserData, serOtherUserData] = useState([]);
  const [postData, setPostData] = useState([]);
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState(null);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);

  const userRef = useRef({});
  const checkUserImage = userId => {
    const userData = otherUserData.filter(item => item.uid === userId);
    
    return userData[0]?.imageUrl !== null
      ? userData[0]?.imageUrl
      : 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max';
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
  const getLocalStorageData = async () => {
    let user = await AsyncStorage.getItem('userData');
    let data = JSON.parse(user);
    setUserData(data);

    let data2 = [];

    await firestore()
      .collection('PurposePost')
      .where('userId', '==', data.uid)
      .get()
      .then(qsnapshot => {
        qsnapshot.forEach(item => {
          data2.push(item.data());
        });
      });

    setPostData(data2);
    // return data;
  };
  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({cropping: true})
      .then(image => {
        console.log('image in then====>', image);
        const imageUri = image.path;
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
      .collection('PurposePost')
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
  const getDataFromFirestore = async () => {
    const data = [];
    await firestore()
      .collection('posts')
      .get()
      .then(qSnapshot => {
        qSnapshot.forEach(doc => {
          data.push(doc.data());
        });
      });
    setPostData(data);
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
    // Call only when screen open or when back on screen

    getLocalStorageData();
    // getDataFromFirestore();
  }, []);
  // useEffect(() => {
  //   // const response = await postCollection.where("uid", "==", e.user?.uid).get();
  // }, []);

  return (
    <>
      <ScrollView style={[styles.content, {backgroundColor: 'black'}]}>
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
                  Purpose Post
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
                      {otherUserData.length !== 0 ? (
                        <Image
                          source={{
                            uri: checkUserImage(post.userId),
                          }}
                          style={{width: 40, height: 40, borderRadius: 40 / 2}}
                        />
                      ) : (
                        <></>
                      )}
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
                  {/* <View
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
                  </View> */}
                  {/* <View
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
                  </View> */}
                  <View
                    style={{
                      flexDirection: 'row',
                      width: '100%',
                      alignItems: 'center',
                      backgroundColor: 'white',
                      borderBottomRightRadius: 20,
                      borderBottomLeftRadius: 20,
                    }}>
                    {/* <View>
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
                    </View> */}
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* <View style={{height: 60}}></View> */}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          width: '100%',

          backgroundColor: '#e4e5e9',
          justifyContent: 'center',
          alignItems: 'center',
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
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'white',
            borderRadius: 50,
          }}>
          <TextInput
            placeholder="type a message"
            style={{width: '65%', height: 40}}
            multiline
            numberOfLines={4}
            value={post}
            onChangeText={content => setPost(content)}
          />
          <TouchableOpacity
            onPress={() => {
              takePhotoFromCamera();
            }}>
            <CameraIcon
              name="camera"
              style={{marginRight: 5}}
              size={25}
              color="black"
            />
          </TouchableOpacity>
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
            onPress={() => submitPost()}>
            <SendIcon name="send" style={{}} size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',

    flex: 1,
    backgroundColor: 'white',
  },
});
