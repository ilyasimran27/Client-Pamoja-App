import React from "react";
import {
    View,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,

} from 'react-native';
import { Btn, Input } from "../../components";

export default function Forgetpassword({ navigation }) {
    return (
        <View style={styles.container}>
            <ImageBackground source={require("../../assets/bg.png")} style={styles.bg}>
                <View style={{ justifyContent: "center", alignItems: "center", height: 50 }}>
                    <Text style={styles.text}>Forget password</Text>
                </View>
            </ImageBackground>

            <View style={{ justifyContent: "center", alignItems: "center", height: 70 }}>
                <Text style={styles.find}>Find your Account</Text>
            </View>
            <View style={styles.input}>
                <Input placeholder={'Enter email'} placeholderTextColor="white" />
            </View>
            <View style={styles.btn}>
            <Btn title={'Search'} />
            </View>

            <TouchableOpacity style={styles.dont} onPress={() => navigation.navigate("Login")}>
        <Text style={{ color: "white",fontWeight:"bold" }}>Back to sign in</Text>
      </TouchableOpacity>



        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    text: {
        fontSize: 22,
        color: "white",
        fontWeight: "bold",
    },
    find:{
        fontSize: 22,
        color: "white",
        fontWeight: "bold",
        marginTop:40,
    },
    input:{
        marginTop:100,
    },
    btn:{
        marginTop:20,
    },
    dont: {
        color: 'white',
        justifyContent: "center",
        alignItems: "center",
        marginTop: 300,
        
      }

})