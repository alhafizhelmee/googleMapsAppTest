import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

type InputSearchProps = TextInputProps & {
    renderRight?: () => React.ReactNode;
    renderLeft?: () => React.ReactNode;
}

const InputSearch = React.forwardRef<TextInput, InputSearchProps>(({
    placeholderTextColor = '#bbb',
    renderRight,
    renderLeft,
    ...props
}, ref) => {
    return (
        <View
            style={styles.container}
        >
            {renderLeft && renderLeft()}
            <TextInput
                ref={ref}
                placeholderTextColor={placeholderTextColor}
                style={styles.input}
                {...props}

            />
            {renderRight && renderRight()}
        </View>
    )
})

export default InputSearch

const styles = StyleSheet.create({
    container: {
        height: 50,
        width: '100%',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#aaa',
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        color: '#333'
    },
    input: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: '#333'
    }
})