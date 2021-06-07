import { themeStyles } from "@styles/globalColors";
import React from "react";
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Profile, Post, Notification } from '@types';
import { globalStyles } from "@styles/globalStyles";
import { FontAwesome } from '@expo/vector-icons';

interface Props {
    profile: Profile;
    notification: Notification;
    goToProfile: (p_userKey: string, p_username: string) => void;
    goToPost: (p_postHashHex: string, p_priorityComment: undefined) => void;
    styles: any;
    post: Post;
    postHashHex: string;
}

export class PostRecloutNotificationComponent extends React.Component<Props> {
    constructor(props: Props) {
        super(props)
        this.state = {
            notification: this.props.notification
        };
    }

    shouldComponentUpdate(p_nextProps: Props) {
        return p_nextProps.notification?.Index !== this.props.notification?.Index;
    }

    render() {
        return (
            <TouchableOpacity
                style={[this.props.styles.notificationContainer, this.props.styles.centerTextVertically, themeStyles.containerColorMain, themeStyles.borderColor]}
                activeOpacity={1}
                onPress={() => this.props.goToPost(this.props.postHashHex, undefined)}>
                <TouchableOpacity
                    style={this.props.styles.centerTextVertically}
                    onPress={() => this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username)}
                    activeOpacity={1}>
                    <Image style={this.props.styles.profilePic} source={{ uri: this.props.profile.ProfilePic }}></Image>
                </TouchableOpacity>
                <View style={[this.props.styles.iconContainer, { backgroundColor: '#5ba358' }]}>
                    <FontAwesome style={{ marginLeft: 1 }} name="retweet" size={13} color="white" />
                </View>
                <View style={this.props.styles.textContainer}>
                    <TouchableOpacity
                        style={this.props.styles.centerTextVertically}
                        onPress={() => this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username)}
                        activeOpacity={1}>
                        <Text style={[this.props.styles.usernameText, themeStyles.fontColorMain]}>{this.props.profile.Username} </Text>
                    </TouchableOpacity>
                    <Text style={[globalStyles.fontWeight500, themeStyles.fontColorMain]}>reclouted your post: </Text>
                    <Text style={[this.props.styles.postText, themeStyles.fontColorSub]} numberOfLines={1}>{this.props.post?.RecloutedPostEntryResponse?.Body}</Text>
                </View>
            </TouchableOpacity>
        )
    }
};