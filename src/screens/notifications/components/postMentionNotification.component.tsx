import { themeStyles } from "@styles/globalColors";
import React from "react";
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Profile, Post, Notification } from '@types';
import { globalStyles } from "@styles/globalStyles";
import { FontAwesome } from '@expo/vector-icons';

interface Props {
    profile: Profile;
    post: Post;
    goToProfile: (p_userKey: string, p_username: string) => void;
    goToPost: (parentPoshHashHex: string, postHashCode: string) => void;
    postHashHex: string;
    parentPoshHashHex: string;
    notification: Notification;
    styles: any;
}

export class PostMentionNotificationComponent extends React.Component<Props> {
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
                activeOpacity={1}
                onPress={() => this.props.goToPost(this.props.parentPoshHashHex, this.props.postHashHex)}>
                <TouchableOpacity
                    style={this.props.styles.centerTextVertically}
                    onPress={() => this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username)}
                    activeOpacity={1}>
                    <Image style={this.props.styles.profilePic} source={{ uri: this.props.profile.ProfilePic }}></Image>
                </TouchableOpacity>
                <View style={[this.props.styles.iconContainer, { backgroundColor: '#fcba03' }]}>
                    <FontAwesome style={[{ marginLeft: 1 }]} name="commenting" size={12} color="white" />
                </View>
                <View style={this.props.styles.textContainer}>
                    <TouchableOpacity
                        style={this.props.styles.centerTextVertically}
                        onPress={() => this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username)}
                        activeOpacity={1}>
                        <Text style={[this.props.styles.usernameText, themeStyles.fontColorMain]}>{this.props.profile.Username} </Text>
                    </TouchableOpacity>

                    <Text style={[globalStyles.fontWeight500, themeStyles.fontColorMain]}>mentioned you in a post: </Text>
                    <Text style={[this.props.styles.postText, themeStyles.fontColorSub]} numberOfLines={1}>{this.props.post?.Body}</Text>
                </View>
            </TouchableOpacity>
        )
    }
};