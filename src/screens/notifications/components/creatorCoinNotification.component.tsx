import { themeStyles } from "@styles/globalColors";
import React from "react";
import { View, Text, TouchableOpacity, Image } from 'react-native';

import { calculateBitCloutInUSD } from '@services';

import { Profile, Notification } from '@types';
import { globalStyles } from "@styles/globalStyles";
import { FontAwesome } from '@expo/vector-icons';

interface Props {
    profile: Profile,
    goToProfile: (p_userKey: string, p_username: string) => void,
    styles: any,
    notification: Notification
}

export class CreatorCoinNotificationComponent extends React.Component<Props> {
    constructor(props: Props) {
        super(props)
    }

    shouldComponentUpdate(p_nextProps: Props) {
        return p_nextProps.notification?.Index !== this.props.notification?.Index
    }

    render() {
        const bitClout = this.props.notification.Metadata.CreatorCoinTxindexMetadata?.BitCloutToSellNanos as number;
        const usd = calculateBitCloutInUSD(bitClout);
        return (
            <TouchableOpacity
                style={[this.props.styles.notificationContainer, this.props.styles.centerTextVertically, themeStyles.containerColorMain, themeStyles.borderColor]}
                onPress={() => this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username)}
                activeOpacity={1}>
                <TouchableOpacity
                    style={this.props.styles.centerTextVertically}
                    onPress={() => this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username)}
                    activeOpacity={1}>
                    <Image style={this.props.styles.profilePic} source={{ uri: this.props.profile.ProfilePic }} />
                </TouchableOpacity>

                <View style={[this.props.styles.iconContainer, { backgroundColor: '#00803c' }]}>
                    <FontAwesome style={[{ marginLeft: 1 }]} name="dollar" size={14} color="white" />
                </View>

                <View style={this.props.styles.textContainer}>
                    <TouchableOpacity
                        style={this.props.styles.centerTextVertically}
                        onPress={() => this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username)}
                        activeOpacity={1}>
                        <Text style={[this.props.styles.usernameText, themeStyles.fontColorMain]}>{this.props.profile.Username} </Text>
                    </TouchableOpacity>

                    <Text style={[globalStyles.fontWeight500, themeStyles.fontColorMain]}>bought </Text>
                    <Text style={[this.props.styles.usernameText, themeStyles.fontColorMain]}>~${usd} </Text>
                    <Text style={[globalStyles.fontWeight500, themeStyles.fontColorMain]}>worth of your coin</Text>
                </View>
            </TouchableOpacity>
        )
    }

};
