import ModalSearchLocation from '@/component/ModalSearchLocation';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function App() {
  const mapRef = useRef<MapView>(null);
  const inserts = useSafeAreaInsets();
  const [PopupSearchLocation, setPopupSearchLocation] = useState(false);
  const [LocationName, setLocationName] = useState('Kuala Lumpur, Malaysia');
  const [region, setRegion] = useState({
    latitude: 3.1390,
    longitude: 101.6869,
    latitudeDelta: 0.05,
    longitudeDelta: 0.005,
  });

  const [marker, setMarker] = useState({
    latitude: 3.1390,
    longitude: 101.6869,
  });

  const centerMap = () => {
    mapRef.current?.animateToRegion(region, 500); // 1s animation
  };

  const openSearchPage = () => {
    setPopupSearchLocation(true);
  }

  const setNewLocation = (location: any) => {
    console.log(location)
    const newRegion = {
      latitude: location.lat,
      longitude: location.lng,
      latitudeDelta: 0.05,
      longitudeDelta: 0.005,
    };

    // Animate map to new region
    mapRef.current?.animateToRegion(newRegion, 500); // 1s animation

    // Update marker position
    setMarker({
      latitude: location.lat,
      longitude: location.lng
    });
    setLocationName(location.name);

    // Update region state if you need it for other purposes
    setTimeout(() => {
      setRegion(newRegion);
    }, 500);
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        provider={PROVIDER_GOOGLE}
      >
        <Marker
          coordinate={marker}
          title="Kuala Lumpur"
          description="Capital of Malaysia"
        />
      </MapView>

      <View style={[styles.topContainer, { top: Math.max(inserts.top + 10, 30) }]}>
        <View style={[styles.locationContainer, styles.shadowButton]}>
          <Text style={styles.locationName}>{LocationName}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.searchContainer,
            styles.shadowButton
          ]}
          onPress={openSearchPage}
        >
          <FontAwesome6 name='magnifying-glass' size={20} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.buttonContainer,
          styles.shadowButton
        ]}
        onPress={centerMap}
      >
        <FontAwesome6 name='location-crosshairs' size={20} />
      </TouchableOpacity>

      <ModalSearchLocation
        isVisible={PopupSearchLocation}
        onClose={() => setPopupSearchLocation(false)}
        onPress={setNewLocation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  topContainer: {
    position: 'absolute',
    paddingHorizontal: 20,
    flexDirection: 'row',
    width: '100%',
    gap: 10
  },
  locationContainer: {
    justifyContent: 'center',
    backgroundColor: 'white',
    height: 50,
    borderRadius: 25,
    flex: 1
  },
  locationName: {
    color: 'black',
    fontWeight: 'bold',
    paddingHorizontal: 20
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  searchContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  shadowButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});
