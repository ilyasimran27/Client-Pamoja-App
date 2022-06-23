import React, {useState, useEffect, useCallback} from 'react';
import {View, ScrollView, Text, Button, StyleSheet, Image} from 'react-native';
import {Bubble, GiftedChat, Send, InputToolbar} from 'react-native-gifted-chat';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import firestore from '@react-native-firebase/firestore';
// import {TextInput} from 'react-native-gesture-handler';
import {sendNotification} from '../../utils/notificationService';

const ChatScreen = ({route}) => {
  const [messages, setMessages] = useState([]);
  const {userName, otherUserId, userData} = route.params;
  const [fcmToken, setFcmToken] = useState('');
  
  useEffect(() => {
    // getAllMessages()
    // getFcm()
    const docid =
      otherUserId > userData.uid
        ? userData.uid + '-' + otherUserId
        : otherUserId + '-' + userData.uid;
    const messageRef = firestore()
      .collection('chatrooms')
      .doc(docid)
      .collection('messages')
      .orderBy('createdAt', 'desc');

    const unSubscribe = messageRef.onSnapshot(querySnap => {
      const allmsg = querySnap.docs.map(docSanp => {
        const data = docSanp.data();
        if (data.createdAt) {
          return {
            ...docSanp.data(),
            createdAt: docSanp.data().createdAt.toDate(),
          };
        } else {
          return {
            ...docSanp.data(),
            createdAt: new Date(),
          };
        }
      });
      setMessages(allmsg);
    });

    return () => {
      unSubscribe();
    };
  }, []);
  const getFcm = async () => {
    
    let fcmTokenn = '';
    await firestore()
      .collection('Users')
      .doc(otherUserId)
      .get()
      .then(qsnapshot => {
        console.log('qsnapshot===>', qsnapshot.data().fcmToken);
        fcmTokenn = qsnapshot.data().fcmToken;
        console.log('fcmtoken======>', fcmTokenn);
      });
    setFcmToken(fcmTokenn);
  };


  const onSend = useCallback(async(messageArray = []) => {
    const msg = messageArray[0];
    const mymsg = {
      ...msg,
      sentBy: userData.uid,
      sentTo: otherUserId,
      createdAt: new Date(),
    };
    setMessages(previousMessages => GiftedChat.append(previousMessages, mymsg));
    const docid =
      otherUserId > userData.uid
        ? userData.uid + '-' + otherUserId
        : otherUserId + '-' + userData.uid;
    firestore()
      .collection('chatrooms')
      .doc(docid)
      .collection('messages')
      .add({...mymsg, createdAt: firestore.FieldValue.serverTimestamp()});
      let fcmToken=''
      await firestore()
      .collection('Users')
      .doc(otherUserId)
      .get()
      .then(qsnapshot => {
        console.log('qsnapshot===>', qsnapshot.data().fcmToken);
        fcmToken = qsnapshot.data().fcmToken;
        console.log('fcmtoken======>', fcmToken);
      });
    sendNotification(fcmToken, userData.name, 'message',otherUserId,userData.uid,'dummy',userData);
  }, []);
  //  const renderComposer=(props)=> {
  //     return(
  //     <TextInput
  //        {...props}
  //        styles={{backgroundColor:"#666"}}
  //     />
  //   )
  // }
  const renderSend = props => {
    return (
      <Send {...props}>
        <View>
          <MaterialCommunityIcons
            name="send-circle"
            style={{marginBottom: 5, marginRight: 5}}
            size={32}
            color="#2e64e5"
          />
        </View>
      </Send>
    );
  };
  const renderInputToolbar = props => {
    return (
      <View style={{height: 45, backgroundColor: 'transparent'}}>
        <Image
          source={{
            uri: userData.imageUrl
              ? userData.imageUrl
              : 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
          }}
          style={{width: 40, height: 40, borderRadius: 40 / 2, marginLeft: 8}}
        />
        <InputToolbar
          {...props}
          containerStyle={{
            marginLeft: 50,
            marginRight: 1,
            backgroundColor: 'transparent',
          }}
        />
      </View>
    );
  };
  const renderBubble = props => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#2e64e5',
          },
        }}
        textStyle={{
          right: {
            color: '#fff',
          },
        }}
      />
    );
  };

  const scrollToBottomComponent = () => {
    return <FontAwesome name="angle-double-down" size={22} color="#333" />;
  };

  return (
    // <View></View>

    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: userData.uid,
        avatar: userData.imageUrl
          ? userData.imageUrl
          : 'https://images.unsplash.com/photo-1471879832106-c7ab9e0cee23?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max',
      }}
      renderBubble={renderBubble}
      alwaysShowSend
      renderSend={renderSend}
      showAvatarForEveryMessage={true}
      showUserAvatar={true}
      scrollToBottom
      scrollToBottomComponent={scrollToBottomComponent}
      renderInputToolbar={renderInputToolbar}
      renderAvatarOnTop={true}
      textInputStyle={{
        backgroundColor: '#817c88',
        borderRadius: 25,
        paddingTop: -20,
        paddingBottom: -10,
        marginLeft: 0,
        color: 'white',
        fontSize: 14,
      }}
      // renderComposer={renderComposer}
    />
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
