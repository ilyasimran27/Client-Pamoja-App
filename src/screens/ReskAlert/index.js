import React from "react";
import {
    View,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    

} from 'react-native';
import { Btn, Input } from "../../components";
import { primaryColor } from "../../config";
export default function ReskAlert({ navigation }) {
    return (
      
        <View style={styles.container}>
        
            <ImageBackground source={require("../../assets/logo.png")} style={styles.bg}>
                <View style={{ height: 250,  resizeMode: "stretch" }}>
                </View>
               
            </ImageBackground>
           
            <View>
            <Text style={styles.text}>Select the option</Text>
            </View>
            
           
            <View style={styles.button}>
            <Btn  onPress={() => {
            navigation.navigate('PrivateListAlert');
          }} title={'PRIVATE LIST ALERT'} height={45} />
           </View>
           
           <View style={styles.btn}>
            <Btn  onPress={() => {
            navigation.navigate('GeneralAlert');
          }} title={'GENERAL ALERT'} height={45}/>
            </View>

           


        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',

    },
  
    bg:{
                    justifyContent: 'center',
            alignItems: 'center',
            height: 250,
            width: '80%',
            resizeMode: "stretch",
            marginLeft:70,
            marginTop:20,
        

    },
  
    text: {
        fontSize: 18,
        color: "white",
        // fontWeight: "bold",
        marginLeft:20,
        marginTop:80,
        marginBottom:30,
      },
   
  
    button :{
        marginTop:20,
        width:"67%",
        marginLeft:65,
        borderRadius:20,
        // justifyContent:"center",
        // alignItems:"center",
        backgroundColor:primaryColor,
    },
    btn:{
        marginTop:20,
        width:"67%",
        marginLeft:65,
        borderRadius:20,

        backgroundColor:primaryColor,


    },


})