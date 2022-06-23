import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';
import VideoIcon from 'react-native-vector-icons/FontAwesome5';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import {AppContext} from '../../GolbalProvider/GlobalProvider';
import uuid from 'react-native-uuid';

import {
  InputField,
  InputWrapper,
  AddImage,
  SubmitBtn,
  SubmitBtnText,
  StatusWrapper,
} from './AddPost';

const AddPostScreen = ({navigation, route}) => {
  const {
    userData,
    setUserData,
    allUserData,
    setAllUserData,
    otherUserData,
    setOtherUserData,
    postData,
    setPostData,
  } = useContext(AppContext);
  console.log('route params is===>',route?.params.image)
  const [image, setImage] = useState(
    route?.params.image 
  );
  const [type,setType]=useState(route?.params.type)
  const [uploading, setUploading] = useState(false);
  const [transferred, setTransferred] = useState(0);
  const [post, setPost] = useState(null);

  const takePhotoFromCamera = () => {
    ImagePicker.openCamera({
      width: 600,
      height: 700,
      cropping: true,
    })

      .then(image => {
        const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
        setImage(imageUri);
        // navigation.navigate('AddPostScreen', {
        //  image:imageUri
        // });
      })
      .catch(error => {});
  };

  const selectVideo = () => {
    ImagePicker.openPicker({
      mediaType:"video",
    }).then(video => {
      console.log("seleted thing is===>",video)
      const imageUri = Platform.OS === 'ios' ? video.sourceURL : video.path;
      setImage(imageUri);
      setType("video")
      // navigation.navigate('AddPostScreen', {
      //   image: imageUri,
      //   type:"video"
      // });
    });
  };
  const Grally = async () => {
    ImagePicker.openPicker({
      width: 600,
      height: 700,
      cropping: true,
    })
      .then(image => {
        const imageUri = Platform.OS === 'ios' ? image.sourceURL : image.path;
        setImage(imageUri);
        setType("image")
       
      })
      .catch(error => {});
  };

  const submitPost = async () => {
    const imageUrl = await uploadImage();
    let postId = uuid.v4();
    postId = postId.replaceAll('-', '_');
    console.log('submit post=>',userData)
    let postingData = {
      userId: userData?.uid,
      userHandle: userData?.name,
      
      postTime: firestore.Timestamp.fromDate(new Date()),
      content: post,
      likes: 0,
      comments: 0,
      likesByUsers: [],
      dislikes: 0,
      dislikesByUsers: [],
      postId,
    };
    if(type==="video"){
      postingData={
        ...postingData,
        postVideo:imageUrl?imageUrl:'',
      }
    }
    else if(type==="image"){
      postingData={
        ...postingData,
        postImg: imageUrl?imageUrl:''
      }
    }
    let uploadPost = [...postData, postingData];
    console.log("upload post===>",uploadPost)
    firestore()
      .collection('posts')
      .doc(postId)
      .set(postingData);

    setPost('');

    setPostData(uploadPost);
    navigation.goBack()
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
      console.log(
        `${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`,
      );

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
  const getLocalStorageData = async () => {
    // console.log('get local storage data calling====>');
    let user = await AsyncStorage.getItem('userData');
    let data = JSON.parse(user);
    // console.log('parsed========>', data);
    setUserData(data);
  };
  useEffect(() => {
    // getLocalStorageData();
  }, []);

  return (
    <View style={styles.container}>
      <InputWrapper>
        {image != null ? <AddImage source={{uri: image}} /> : null}

        <InputField
          placeholder="What's on your mind?"
          multiline
          numberOfLines={4}
          value={post}
          onChangeText={content => setPost(content)}
        />
        {uploading ? (
          <StatusWrapper>
            <Text>{transferred} % Completed!</Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </StatusWrapper>
        ) : (
          <SubmitBtn onPress={submitPost}>
            <SubmitBtnText>Post</SubmitBtnText>
          </SubmitBtn>
        )}
      </InputWrapper>
      <ActionButton buttonColor="#2e64e5">
        <ActionButton.Item
          buttonColor="#9b59b6"
          title="Take Photo"
          onPress={takePhotoFromCamera}>
          <Icon name="camera-outline" style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item
          buttonColor="#3498db"
          title="Choose Photo"
          onPress={Grally}>
          <Icon name="md-images-outline" style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item
          buttonColor="#3498db"
          title="Choose Video"
          onPress={selectVideo}>
          <VideoIcon name="file-video" style={styles.actionButtonIcon} />
        </ActionButton.Item>
      </ActionButton>
    </View>
  );
};

export default AddPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
});
