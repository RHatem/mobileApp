import { themeStyles } from "@styles/globalColors";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';



import { Profile, Post, Notification } from '@types';
import { globalStyles } from "@styles/globalStyles";

interface Props {
    profile: Profile,
    goToProfile: (p_userKey: string, p_username: string) => void,
    goToPost: (postHashCode: string) => void,
    post: Post,
    styles: any,
    notification: Notification,
}

export class LikeNotificationComponent extends React.Component<Props> {
    constructor(props: Props) {
        super(props)
    }

    shouldComponentUpdate(p_nextProps: Props) {
        return p_nextProps.notification?.Index !== this.props.notification?.Index
    }

    render() {
        const postHashHex = this.props.notification.Metadata.LikeTxindexMetadata?.PostHashHex as string;
        const likedText = this.props.notification.Metadata.LikeTxindexMetadata?.IsUnlike ? 'unliked' : 'liked'

        return (
            <TouchableOpacity
                style={[this.props.styles.notificationContainer, this.props.styles.centerTextVertically, themeStyles.containerColorMain, themeStyles.borderColor]}
                activeOpacity={1}
                onPress={() => this.props.goToPost(postHashHex)}>
                <TouchableOpacity
                    style={this.props.styles.centerTextVertically}
                    onPress={() => this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username)}
                    activeOpacity={1}>
                    <Image style={this.props.styles.profilePic} source={{ uri: this.props.profile.ProfilePic }} />
                </TouchableOpacity>

                <View style={[this.props.styles.iconContainer, { backgroundColor: '#eb1b0c' }]}>
                    <Ionicons style={[{ marginLeft: 1, marginTop: 1 }]} name={'ios-heart-sharp'} size={13} color={'white'} />
                </View>

                <View style={this.props.styles.textContainer}>
                    <TouchableOpacity
                        style={this.props.styles.centerTextVertically}
                        onPress={() => this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username)}
                        activeOpacity={1}>
                        <Text style={[this.props.styles.usernameText, themeStyles.fontColorMain]}>{this.props.profile.Username} </Text>
                    </TouchableOpacity>

                    <Text style={[globalStyles.fontWeight500, themeStyles.fontColorMain]}>{likedText} your post: </Text>
                    <Text style={[[this.props.styles.postText, themeStyles.fontColorSub]]} numberOfLines={1}>{this.props.post?.Body}</Text>

                </View>
            </TouchableOpacity>
        )
    }

};
