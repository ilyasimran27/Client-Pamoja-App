import React, {useState,useEffect,useContext} from 'react';
import {StyleSheet, Text, View, RefreshControl, ScrollView} from 'react-native';
import Storiess from '../../components/screenComponents/Stories';
import Content from '../../components/screenComponents/Content';
import BottomNav from '../../components/screenComponents/BottomNav';
import Location from '../Location';
import {AppContext} from '../../../GolbalProvider/GlobalProvider';

const wait = timeout => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};
export default Home = ({navigation, route}) => {
  const [refreshing, setRefreshing] = useState(false);
  const {
    userData,
    setUserData,
    allUserData,
    setAllUserData,
    otherUserData,
    setOtherUserData,
  } = useContext(AppContext);

 
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    wait(2000).then(() => setRefreshing(false));
  }, []);

  // const postId = route.params ? route.params.postId : 'hello';
  
 




  
  return (
    <View style={styles.Wrapper}>
      <Location />
    
     

        <Storiess navigation={navigation}/>
        <View style={{flex: 5}}>
          <Content navigation={navigation} />
        </View>
      

      {/* <BottomNav /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  Wrapper: {
    flex: 1,
    backgroundColor: 'white',
  },
});
