import React, {useEffect, useState,useContext} from 'react';
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
import {sendNotification} from '../../utils/notificationService';
import {primaryColor} from '../../config';
import {useIsFocused} from '@react-navigation/native';
import {AppContext} from '../../../GolbalProvider/GlobalProvider';

export default function CommentScreen({navigation, route}) {
  const {postData, setPostData} = useContext(AppContext);
  const userData = route?.params.userData;
  console.log('route params is=>', route?.params);
  const isFocused = useIsFocused();

  const otherUserData = route.params.otherUserData;
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState(null);
  const [postData1, setPostData1] = useState(route.params.postData1);
  const checkUserImage = userId => {
    const user = otherUserData?.filter(item => item.uid === userId);

    return user[0]?.imageUrl
      ? user[0]?.imageUrl
      : 'https://cdn.pixabay.com/photo/2015/06/19/21/24/avenue-815297__480.jpg';
  };
  const getCommentData = async () => {
    const data = [];
    await firestore()
      .collection('posts')
      .doc(postData1.postId)
      .collection('comments')
      .get()
      .then(qsnapshot => {
        qsnapshot.forEach(item => {
          data.push(item.data());
        });
      });
    setComments(data);
  };
  const submitComment = async item => {
    let fcmToken = '';
    await firestore()
      .collection('Users')
      .doc(item.userId)
      .get()
      .then(qsnapshot => {
        fcmToken = qsnapshot.data().fcmToken;
      });
    // console.log('submit comment calling',userData);
    let postDataLocal = [...postData]

    const index = postDataLocal.findIndex(object => {
      return object.postId === postData1.postId;
    });

    // const index = postDataLocal.findIndex(object => {
    //   return object.postId === item.postId;
    // });
    let singlePost = {...item};

    singlePost = {
      ...singlePost,
      comments: singlePost.comments + 1,
    };

    postDataLocal[index] = singlePost;

    let commentId = uuid.v4();
    commentId = commentId.replaceAll('-', '_');
    const commentData = {
      userId: userData?.uid,
      userHandle: userData?.name,
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
    // console.log('commentData=====>', item);
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
    setPostData1(singlePost);
    setPostData(postDataLocal);
    setComments([...comments, commentData]);
    if (item.userId !== userData?.uid) {
      sendNotification(
        fcmToken,
        userData?.name,
        'comment',
        item.userId,
        userData?.uid,
        item,
        '',
      );
    }
  };
  useEffect(() => {
    if (isFocused) {
      getCommentData();
    }
  }, [userData,otherUserData]);
  return (
    <View style={styles.Wrapper}>
      <>
        <ScrollView style={[styles.content, {backgroundColor: 'black'}]}>
          <View
            style={{
              display: 'flex',

              alignItems: 'center',
            }}>
            {comments?.map((item, index) => {
              return (
                <View
                  key={index}
                  style={{
                    height: 60,

                    marginVertical: 7,

                    display: 'flex',
                    flexDirection: 'row',
                    width: '90%',
                  }}>
                  {/* <Text>hello from comment</Text> */}
                  <Image
                    source={{
                      uri: checkUserImage(item?.userId),
                    }}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 40 / 2,
                    }}
                  />
                  <View>
                    <View
                      style={{
                        // backgroundColor: primaryColor,
                        // borderRadius: 5,
                        // padding: 5,
                        marginLeft: 5,
                        // marginTop: 2,
                      }}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          marginBottom: 2,
                          color: 'white',
                        }}>
                        {item.userHandle}
                      </Text>
                      <Text style={{color: 'white'}}>{item.content}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            height: 50,
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
                marginLeft: 5,
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
              marginLeft: 8,
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
              marginLeft: 8,
            }}>
            <TouchableOpacity
              disabled={comment ? false : true}
              onPress={() => {
                submitComment(postData1);
                setComment(null);
              }}>
              <SendIcon name="send" style={{}} size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </>
    </View>
  );
}

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
