import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {Btn, Input} from '../../components';
import {primaryColor} from '../../config';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Iconm from 'react-native-vector-icons/MaterialCommunityIcons';
import Icona from 'react-native-vector-icons/AntDesign';
import Iconc from 'react-native-vector-icons/MaterialIcons';

export default function Setting({navigation}) {
  return (
    <View>
      

      <View style={styles.view}>
        <Text style={styles.txt}>Profile</Text>

        <TouchableOpacity
          style={styles.touchop}
          onPress={() => {
            navigation.navigate('EditProfile');
          }}>
          <Icon name="user-edit" style={styles.icon} />
          <Text style={styles.touchtxt}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.touchop}
          onPress={() => {
            navigation.navigate('ChangeEmail');
          }}>
          <Iconm name="email-edit" style={styles.icon} />
          <Text style={styles.touchtxt}>Change Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.touchop}
          onPress={() => {
            navigation.navigate('ChangePassword');
          }}>
          <Iconm name="form-textbox-password" style={styles.icon} />
          <Text style={styles.touchtxt}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.touchop}>
          <Icon name="mobile-alt" style={styles.icon} />
          <Text style={styles.not}>Manage Device</Text>
        </TouchableOpacity>

        {/* <Text style={styles.txt}>Notification</Text> */}
        <TouchableOpacity
          style={styles.touchop}
          onPress={() => {
            navigation.navigate('NotificationScreen');
          }}>
          <Icona name="notification" style={styles.icon} />
          <Text style={styles.touchtxt}>Notification</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.touchop}
          onPress={() => {
            navigation.navigate('Privates');
          }}>
          <Icona name="message1" style={styles.icon} />
          <Text style={styles.touchtxt}>Parivate Message</Text>
        </TouchableOpacity>

        <Text style={styles.txt}>Legal</Text>

        <TouchableOpacity
          style={styles.touchop}
          onPress={() => {
            navigation.navigate('TermAndConditions');
          }}>
          <Icona name="bars" style={styles.icon} />
          <Text style={styles.touchtxt}>Term And Conditon</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.touchop}
          onPress={() => {
            navigation.navigate('PrivacyPolicy');
          }}>
          <Iconc name="privacy-tip" style={styles.icon} />
          <Text style={styles.touchtxt}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },

  Header: {
    width: '100%',
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: primaryColor,
  },
  headertxt: {
    fontSize: 25,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
  },
  txt: {
    color: primaryColor,
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 60,
    marginTop: 20,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchtxt: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    marginTop: 7,
  },
  not: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 22,
    marginTop: 10,
  },
  touchop: {
    flexDirection: 'row',
    marginTop: 15,
  },
  view: {
    backgroundColor: 'black',
    height: '100%',
    width: '100%',
    borderRadius: 15,
    marginTop: -10,
  },
  icon: {
    fontSize: 30,
    color: 'white',
    marginLeft: 20,
  },
});
