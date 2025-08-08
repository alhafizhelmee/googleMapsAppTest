import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { memo, useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import InputSearch from './InputSearch';

const LOCATION_LIST_KEY = 'save_location';
const HEIGHT = Dimensions.get('screen').height;


const testList = Array.from({ length: 5 }).map((item, index) => index)


const ModalSearchLocation = ({ isVisible, onClose, onPress }) => {
    const insets = useSafeAreaInsets();
    const inputRef = React.useRef(null);
    const searchTimeOut = React.useRef(null);
    const [value, setvalue] = useState('');
    const [loading, setLoading] = useState(false);
    const [ListLocation, setListLocation] = useState([]);
    const [HistoryLocation, setHistoryLocation] = useState([]);

    useEffect(() => {
        if (isVisible) {
            initialState();
        }
    }, [isVisible]);

    const initialState = async () => {
        setvalue('');
        setTimeout(() => {
            inputRef.current?.focus();
        }, 500);
        const historyLocation = await getSavedLocations();
        setHistoryLocation(historyLocation);
        setListLocation(historyLocation);
    };

    const onSelect = async (item) => {
        console.log(item?.structured_formatting?.main_text);
        const location = await getLatLongFromPlaceId(item.place_id);
        if (item?.location) {
            onPress({...item?.location, name: item?.structured_formatting?.main_text})
            onClose();
            return;
        }
        saveLocation({ ...item, location })
        onPress({...location, name: item?.structured_formatting?.main_text})
        onClose();
    };

    const saveLocation = async (newLocation) => {
        try {
            const jsonValue = await AsyncStorage.getItem(LOCATION_LIST_KEY);
            const locations = jsonValue != null ? JSON.parse(jsonValue) : [];

            const updatedLocations = [...locations, newLocation];

            await AsyncStorage.setItem(LOCATION_LIST_KEY, JSON.stringify(updatedLocations));
            console.log('Location saved!');
        } catch (e) {
            console.error('Failed to save location:', e);
        }
    };

    const getSavedLocations = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem(LOCATION_LIST_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : [];
        } catch (e) {
            console.error('Failed to fetch locations:', e);
            return [];
        }
    };


    const getLatLongFromPlaceId = async (placeId) => {
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${process.env.API_KEY}`
            );
            const data = await response.json();

            if (data?.status === 'OK') {
                const location = data.result.geometry.location;
                // console.log('Latitude:', location.lat);
                // console.log('Longitude:', location.lng);
                return location;
            } else {
                console.error('Place details error:', data.status);
            }
        } catch (error) {
            console.error('Failed to fetch place details:', error);
        }
    };

    const fetchPlaceDetails = async (input) => {
        try {
            const filteredHistory = HistoryLocation.filter(loc =>
                loc.description?.toLowerCase().includes(input.toLowerCase())
            );

            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${process.env.API_KEY}`
            );
            const data = await response.json();

            // console.log(data?.status, data?.predictions);

            if (data?.predictions) {
                const apiResults = data.predictions;
                const uniqueApiResults = apiResults.filter(
                    apiItem => !filteredHistory.some(h => h.place_id === apiItem.place_id)
                );
                setListLocation([...filteredHistory, ...uniqueApiResults]);
            } else if (data?.status === 'ZERO_RESULTS') {
                setListLocation(filteredHistory)
            } else {
                setListLocation(filteredHistory);
            }
        } catch (error) {
            setListLocation(HistoryLocation);
        } finally {
            setLoading(false);
        }
    };

    const onChangeText = (text) => {
        setvalue(text);
        setLoading(true);
        if (searchTimeOut.current) {
            clearTimeout(searchTimeOut.current);
        }
        searchTimeOut.current = setTimeout(() => {
            fetchPlaceDetails(text);
        }, 500);
    };

    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            backdropOpacity={.3}
            style={{
                margin: 0,
                justifyContent: 'flex-end'
            }}
        >
            <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) + 20 }]}>
                <InputSearch
                    ref={inputRef}
                    placeholder='Search Location'
                    onChangeText={onChangeText}
                    value={value}
                    renderLeft={() => (
                        <TouchableOpacity onPress={onClose} style={{ paddingRight: 10 }}>
                            <FontAwesome6 name="angle-left" size={18} color="black" />
                        </TouchableOpacity>
                    )}
                    renderRight={() => (
                        <View>
                            {value == '' ?
                                (
                                    <FontAwesome6 name="magnifying-glass" size={18} color="black" />
                                ) :
                                loading ? (
                                    <View>
                                        <ActivityIndicator size="small" color="black" />
                                    </View>
                                ) :
                                    (
                                        <TouchableOpacity onPress={() => setvalue('')}>
                                            <FontAwesome6 name="xmark" size={18} color="black" />
                                        </TouchableOpacity>
                                    )
                            }
                        </View>
                    )}
                />
                <FlatList
                    data={ListLocation}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => {
                        return (
                            <TouchableOpacity style={[styles.itemList, { borderTopWidth: index == 0 ? 0 : 1 }]}
                                onPress={() => onSelect(item)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                    <View style={{ width: 30 }}>
                                        {item?.location ? (
                                            <FontAwesome6 name='clock-rotate-left' size={16} color="gray" />
                                        ) : (
                                            <FontAwesome6 name='location-dot' size={16} color="gray" />
                                        )}
                                    </View>
                                    <Text style={{ fontWeight: 'bold', color: 'black' }} numberOfLines={1}>{item?.structured_formatting?.main_text}</Text>
                                </View>
                                <Text style={{ marginLeft: 30, color: 'gray', paddingRight: 10 }} numberOfLines={1}>{item?.description}</Text>
                            </TouchableOpacity>
                        )
                    }}
                    contentContainerStyle={{
                        paddingBottom: 150,
                        paddingTop: 20,
                        // gap: 10
                    }}
                    showsVerticalScrollIndicator={false}
                />

            </View>
        </Modal>
    )
}

export default memo(ModalSearchLocation)

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: HEIGHT,
        width: '100%',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    itemList: {
        paddingVertical: 20,
        borderTopColor: '#ccc',
        gap: 6,
    }
})