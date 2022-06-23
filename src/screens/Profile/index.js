import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import {Btn, Input} from '../../components';
import About from '../About/About';
import {primaryColor} from '../../config';
import Icona from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/AntDesign';
import AntDesign from 'react-native-vector-icons/AntDesign';
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
import {AppContext} from '../../../GolbalProvider/GlobalProvider';
import {BottomSheet} from '../../screens/BottomSheet/BottomSheet';
import Gallery from 'react-native-vector-icons/MaterialCommunityIcons';

export default function Profile({navigation}) {
  const {
    userData,
    setUserData,
    allUserData,
    setAllUserData,
    otherUserData,
    setOtherUserData,
    postData,
    setPostData,
    profilePostData,
    setProfilePostData,
  } = useContext(AppContext);
  const isFocused = useIsFocused();

  const [otherUsersData, setOtherUsersData] = useState([]);
  const [requestData, setRequestData] = useState([]);
  const [followData, setFollowData] = useState([]);
  const [followersInfo, setFollowersInfo] = useState([]);
  const [followingInfo, setFollowingInfo] = useState([]);

  const [recfollowData, setRecFollowData] = useState([]);
  const [post, setPost] = useState(null);
  // const [postData, setPostData] = useState([]);
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [comment, setComment] = useState(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [postIdForDelete, setPostIdForDelete] = useState('');
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
    console.log('get local storage data calling====>');
    let user = await AsyncStorage.getItem('followArray');
    if (user !== null) {
      let data = JSON.parse(user);
      console.log('Correct Following data--> ', data);
      return data;
    } else {
      return [];
    }
  };

  const getLocalfromRecFollowRequest = async () => {
    console.log('get local storage data calling====>');
    let user = await AsyncStorage.getItem('recfollowArray');
    if (user !== null) {
      let data = JSON.parse(user);
      return data;
    } else {
      return [];
    }
  };

  const getDataFromFirestore = async () => {
    let requestData = [];
    let followingData = [];
    let x = [];
    let y = [];
    let a = [];
    let b = [];

    let data2 = [];

    const sendRequest = await getLocalfromSendRequest();
    const followData = await getLocalfromFollowRequest();
    const receiveFollowData = await getLocalfromRecFollowRequest();

    // const userData = await getLocalStorageData();
    console.log('postData===>', postData);
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
    data2 = postData?.filter(item => item.userId === userData?.uid);

    // await firebase
    //   .firestore()
    //   .collection('Users')
    //   .where('uid', '!=', userData.uid)
    //   .get()
    //   .then(qSnapshot => {
    //     qSnapshot.forEach(doc => {
    //       data.push(doc.data());
    //     });
    //   });
    data = otherUserData?.filter(item => item?.uid !== userData?.uid);
    requestData = data.filter(item => !sendRequest.includes(item.uid));
    followingData = data.filter(item => followData.includes(item.uid));
    let followers = data.filter(item => receiveFollowData.includes(item.uid));
    // y = data.filter(item => x.includes(item.uid));
    // b = data.filter(item => !followData.includes(item.uid));
    setProfilePostData(data2);
    setFollowData(followData);
    setRequestData(requestData);
    setRecFollowData(receiveFollowData);
    // setOtherUsersData(data);
    setFollowersInfo(followers);
    setFollowingInfo(followingData);
  };

  const submitComment = async item => {
    let postDataLocal = [...profilePostData];
    let allPostData = [...postData];
    const index = postDataLocal.findIndex(object => {
      return object.postId === item.postId;
    });
    const allPostIndex = allPostData.findIndex(object => {
      return object.postId === item.postId;
    });
    let singlePost = {...item};

    singlePost = {
      ...singlePost,
      comments: singlePost.comments + 1,
    };
    postDataLocal[index] = singlePost;
    allPostData[allPostIndex] = singlePost;
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
    setProfilePostData(postDataLocal);
    setPostData(allPostData);
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
  const Grally = async () => {
    ImagePicker.openPicker({
      // multiple: true,
      width: 600,
      height: 700,
      cropping: true,
    })
      .then(image => {
        // console.log('imageUri is=>', image);

        const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
        setImage(imageUri);
        navigation.navigate('AddPostScreen', {
          image: imageUri,
        });
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
    let uploadPost = [...profilePostData, postingData];
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
    setPostData([...postData, postingData]);
    setProfilePostData(uploadPost);
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
    let postDataLocal = [...profilePostData];
    let allPostData = [...postData];

    const index = postDataLocal.findIndex(object => {
      return object.postId === post.postId;
    });
    const allPostIndex = allPostData.findIndex(object => {
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
      allPostData[allPostIndex] = singlePost;

      setProfilePostData(postDataLocal);
      setPostData(allPostData);
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
      allPostData[allPostIndex] = singlePost;

      setProfilePostData(postDataLocal);
      setPostData(allPostData);

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
    let allPostData = [...postData];
    let postDataLocal = [...profilePostData];
    const index = postDataLocal.findIndex(object => {
      return object.postId === post.postId;
    });
    const allPostIndex = allPostData.findIndex(object => {
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
      allPostData[allPostIndex] = singlePost;
      setProfilePostData(postDataLocal);
      setPostData(allPostData);
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
      allPostData[allPostIndex] = singlePost;
      setProfilePostData(postDataLocal);
      setPostData(allPostData);
      firestore().collection('posts').doc(post.postId).update({
        likes,
        likesByUsers: likeByArray,
      });
    }
  };
  const hideModal = () => {
    setShowBottomSheet(false);
  };
  const hide = async () => {
    console.log('postID in hide=>', postIdForDelete);
    await firestore().collection('posts').doc(postIdForDelete).delete();
    let data = [...postData];
    let profilePosts = [...profilePostData];
    let filterData2 = profilePosts.filter(
      item => item.postId !== postIdForDelete,
    );
    let filterData = data.filter(item => item.postId !== postIdForDelete);
    setProfilePostData(filterData2);
    setPostData(filterData);
    setShowBottomSheet(false);
  };

  useEffect(() => {
    if (isFocused) {
      getDataFromFirestore();
    }
  }, [isFocused, userData]);

  return (
    <>
      <ScrollView style={[styles.content, {backgroundColor: 'black'}]}>
        <View style={styles.container}>
          <View style={styles.view}>
            <View style={styles.circle}>
              <Image
                source={{
                  uri: userData?.imageUrl
                    ? userData?.imageUrl
                    : 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
                }}
                style={{width: '100%', height: '100%', borderRadius: 360 / 2}}
              />
            </View>

            <View
              style={{
                flexDirection: 'row',
                display: 'flex',
                justifyContent: 'space-around',
                marginHorizontal: 20,
              }}>
              <View
                style={{justifyContent: 'space-evenly', marginHorizontal: 15}}>
                <Text
                  style={{color: 'white', textAlign: 'center', fontSize: 15}}>
                  {profilePostData?.length}
                </Text>
                <Text style={{color: 'white', fontSize: 18}}>Posts</Text>
              </View>
              <View
                style={{justifyContent: 'space-evenly', marginHorizontal: 15}}>
                <Text
                  style={{color: 'white', textAlign: 'center', fontSize: 15}}>
                  {recfollowData?.length}
                </Text>
                <View>
                  <TouchableHighlight
                    onPress={() => {
                      navigation.navigate('Followers', {
                        userData: userData,
                        otherUsersData: followData,
                        followinfo: followersInfo,
                      });
                    }}>
                    <Text style={{color: 'white', fontSize: 18}}>
                      Followers
                    </Text>
                  </TouchableHighlight>
                </View>
              </View>
              <View
                style={{justifyContent: 'space-evenly', marginHorizontal: 15}}>
                <Text
                  style={{color: 'white', textAlign: 'center', fontSize: 15}}>
                  {followData.length}
                </Text>
                <TouchableHighlight
                  onPress={() => {
                    navigation.navigate('Following', {
                      userData: userData,
                      otherUsersData: followingInfo,
                      followinfo: followingInfo,
                    });
                  }}>
                  <Text style={{color: 'white', fontSize: 18}}>Following</Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
          <View style={styles.text}>
            <View>
              <Text style={styles.txt}>{userData?.name}</Text>
            </View>
            <View style={{paddingTop: -10}}>
              <Text style={styles.BioTxt}>{userData?.bio}</Text>
            </View>
          </View>
          <View style={styles.viewop}>
            <About />
          </View>
        </View>
        {profilePostData?.map((post, index) => {
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
                          uri: userData?.imageUrl
                            ? userData.imageUrl
                            : 'https://cdn.pixabay.com/photo/2015/06/19/21/24/avenue-815297__480.jpg',
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
                  {post?.userId === userData.uid ? (
                    <View style={{justifyContent: 'center', padding: '2%'}}>
                      <TouchableOpacity
                        onPress={() => {
                          setPostIdForDelete(post?.postId);
                          setShowBottomSheet(true);
                        }}>
                        <Entypo
                          name="dots-three-horizontal"
                          color="black"
                          backgroundColor="transparent"
                          size={20}
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <></>
                  )}
                </View>
                {post?.postImg ? (
                  <View
                    style={{
                      backgroundColor: 'black',

                      height: 500,
                      maxHeight: 500,
                    }}>
                    <Image
                      source={{
                        uri: post?.postImg,
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  </View>
                ) : (
                  <></>
                )}
                {!post?.postImg ? (
                  <View
                    style={{
                      height: 300,
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
                ) : (
                  <View
                    style={{
                      backgroundColor: 'black',
                      paddingLeft: 5,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                      }}>
                      {post.content}
                    </Text>
                  </View>
                )}

                {/* <View
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
                </View> */}

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
                        width: '100%',
                        alignItems: 'center',
                        marginBottom: 5,
                      }}>
                      <Text>{post.likes} Likes</Text>
                      <Text>{post.dislikes} Dislikes</Text>
                      <Text>{post.comments} Comments</Text>
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
                        disabled={
                          post.dislikesByUsers.includes(userData?.uid)
                            ? true
                            : false
                        }
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
                              post?.likesByUsers?.includes(userData?.uid)
                                ? '#ff7630'
                                : 'black'
                            }
                          />
                          <Text style={{marginTop: 4}}>Like</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={
                          post?.likesByUsers?.includes(userData?.uid)
                            ? true
                            : false
                        }
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
                              post.dislikesByUsers.includes(userData?.uid)
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
                            postData1: post,
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
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'white',
          borderRadius: 50,
        }}>
        <TouchableOpacity
          style={{width: '65%', height: 40}}
          onPress={() => {
            navigation.navigate('AddPostScreen', {
              image: null,
            });
          }}>
          <Text style={{marginTop: 10, marginLeft: 5}}>type a message</Text>
        </TouchableOpacity>

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
        <TouchableOpacity
          onPress={() => {
            Grally();
          }}>
          <Gallery
            name="view-grid-plus"
            // name="camera"

            style={{marginRight: 5}}
            size={25}
            color="black"
          />
        </TouchableOpacity>
      </View>
      <BottomSheet show={showBottomSheet} height={290} onOuterClick={hideModal}>
        <View style={styles.bottomSheetContent}>
          <Text style={styles.bottomSheetText}>
            Are you sure you want to delete the post?
          </Text>
          <Pressable onPress={hide} style={styles.bottomSheetCloseButton}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <AntDesign
                name="delete"
                color="black"
                backgroundColor="transparent"
                size={20}
              />
              <Text style={styles.buttonText}>Delete</Text>
            </View>
          </Pressable>
        </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },

  view: {
    backgroundColor: 'black',
    width: '75%',
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circle: {
    width: 85,
    height: 85,
    borderRadius: 360,
    borderWidth: 2,
    borderColor: primaryColor,
    backgroundColor: 'white',
    marginLeft: 30,
  },
  text: {},
  txt: {
    width: '100%',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 15,
  },
  BioTxt: {
    width: '100%',
    color: 'white',
    fontSize: 15,
    padding: 15,
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
    height: 80,
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
  content: {
    width: '100%',
    flex: 1,

    backgroundColor: 'white',
  },
  bottomSheetContent: {
    padding: 40,
    alignItems: 'center',
  },
  bottomSheetText: {
    color: 'black',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 80,
  },
  bottomSheetCloseButton: {
    padding: 16,
    backgroundColor: '#eeeedd',
    borderRadius: 8,
  },
});
