import React , {Component} from 'react';
import { View, Text,Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {primaryColor} from '../../config';

class PrivacyPolicy extends Component{

  
    render(){
        return(
    <ScrollView style={styles.bkC}>
    <View style={styles.Header}>
    <Text style={styles.headertxt}>Privacy Policy</Text>
  </View>
  <Text style={styles.tcL}>{"\n"}Pamoja, we respects the privacy of our users. This Privacy Policy explains how we</Text>
                <Text style={styles.tcL}>collect, use, disclose, and safeguard your information when you visit our mobile communication</Text>
                    <Text style={styles.tcL}> application. Please read this Privacy Policy carefully. IF YOU DO NOT AGREE WITH THE</Text>
                    <Text style={styles.tcL}>{'\u2022'} TERMS OF THIS PRIVACY POLICY, PLEASE DO NOT ACCESS THE APPLICATION.</Text>
                    <Text style={styles.tcL}>{'\u2022'}We reserve the right to make changes to this Privacy Policy at any time and for any reason. We</Text>
                    <Text style={styles.tcL}>{'\u2022'} will alert you about any changes by updating the “Last updated” date of this Privacy Policy. You</Text>
                    <Text style={styles.tcL}>{'\u2022'}are encouraged to periodically review this Privacy Policy to stay informed of updates. You will</Text>
                    <Text style={styles.tcL}>{'\u2022'} be deemed to have been made aware of, will be subject to, and will be deemed to have</Text>
                    <Text style={styles.tcL}>{'\u2022'}after the date such revised Privacy Policy is posted.</Text>
                    <Text style={styles.tcL}>{'\u2022'}This Privacy Policy does not apply to the third-party online/mobile store from which you install</Text>
                <Text style={styles.tcP}>the Application, including any in-game virtual items, which may also collect and use data about</Text>
                <Text style={styles.tcP}>you. We are not responsible for any of the data collected by any such third party.</Text>

  </ScrollView>
        )

}
}
const { width , height } = Dimensions.get('window');


const styles = {


    bkC: {
      height: 500,
      backgroundColor: 'black',
      height:height
    },
    title: {
        fontSize: 22,
        alignSelf: 'center'
    },
    tcP: {
        marginTop: 10,
        marginBottom: 10,
        fontSize: 18,
        color: 'white',
  
    },
    tcP:{
        marginTop: 10,
        fontSize: 18,
        color: 'white',
  
    },
    tcL:{
        marginLeft: 10,
        marginTop: 10,
        marginBottom: 10,
        fontSize: 18,
        color: 'white',
  
    },
    tcContainer: {
        marginTop: 15,
        marginBottom: 15,
        height: height * .7
    },
  
    button:{
        backgroundColor: '#136AC7',
        borderRadius: 5,
        padding: 10
    },
  
    buttonDisabled:{
      backgroundColor: '#999',
      borderRadius: 5,
      padding: 10
   },
  
    buttonLabel:{
        fontSize: 14,
        color: '#FFF',
        alignSelf: 'center'
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
  
  }

  export default PrivacyPolicy;