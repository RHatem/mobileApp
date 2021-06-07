import { themeStyles } from "@styles/globalColors";
import React from "react";
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Notification } from '@types';
import { globalStyles } from "@styles/globalStyles";

interface Props {
    goToProfile: (p_userKey: string, p_username: string) => void;
    notification: Notification;
    styles: any;
    profile: any;
}

export class FollowNotificationComponent extends React.Component<Props> {
    constructor(props: Props) {
        super(props)
    }

    shouldComponentUpdate(p_nextProps: Props) {
        return p_nextProps.notification?.Index !== this.props.notification?.Index
    }

    render() {
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
                <View style={[this.props.styles.iconContainer, { backgroundColor: '#0377fc' }]}>
                    <MaterialCommunityIcons style={[{ marginLeft: 1 }]} name="account" size={15} color="white" />
                </View>
                <View style={this.props.styles.textContainer}>
                    <TouchableOpacity
                        style={this.props.styles.centerTextVertically}
                        onPress={() => this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username)}
                        activeOpacity={1}>
                        <Text style={[this.props.styles.usernameText, themeStyles.fontColorMain]}>{
                            this.props.notification.Metadata.FollowTxindexMetadata?.IsUnfollow ? 'unfollowed' : 'followed'
                        } </Text>
                    </TouchableOpacity>
                    <Text style={[globalStyles.fontWeight500, themeStyles.fontColorMain]}>{this.props.notification.Metadata.FollowTxindexMetadata?.IsUnfollow ? 'unfollowed' : 'followed'} you</Text>
                </View>
            </TouchableOpacity>
        )
    }
};