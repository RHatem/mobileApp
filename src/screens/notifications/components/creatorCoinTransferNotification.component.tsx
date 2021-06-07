import { themeStyles } from "@styles/globalColors";
import React from "react";
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { formatNumber } from '@services'
import { Profile, Post, Notification } from '@types';
import { globalStyles } from "@styles/globalStyles";
import { FontAwesome } from '@expo/vector-icons';

interface Props {
    profile: Profile;
    notification: Notification;
    goToProfile: (p_userKey: string, p_username: string) => void;
    goToPost: (postHashCode: string) => void;
    styles: any;
    post: Post;
}

export class CreatorCoinTransferNotificationComponent extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    shouldComponentUpdate(p_nextProps: Props) {
        return p_nextProps.notification?.Index !== this.props.notification?.Index;
    }

    render() {
        const creatorCoinAmount = this.props.notification.Metadata.CreatorCoinTransferTxindexMetadata?.CreatorCoinToTransferNanos as number;
        const formattedCreatorCoinAmount = formatNumber(creatorCoinAmount / 1000000000, true, 6);
        const creatorCoinUsername = this.props.notification.Metadata.CreatorCoinTransferTxindexMetadata?.CreatorUsername as string;
        const diamondLevel = this.props.notification.Metadata.CreatorCoinTransferTxindexMetadata?.DiamondLevel as number;
        const postHashHex = this.props.notification.Metadata.CreatorCoinTransferTxindexMetadata?.PostHashHex as string;

        return (
            <TouchableOpacity
                style={[this.props.styles.notificationContainer, this.props.styles.centerTextVertically, themeStyles.containerColorMain, themeStyles.borderColor]}
                onPress={() => diamondLevel === 0 ? this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username) : this.props.goToPost(postHashHex)}
                activeOpacity={1}>
                <TouchableOpacity
                    style={this.props.styles.centerTextVertically}
                    onPress={() => this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username)}
                    activeOpacity={1}>
                    <Image style={this.props.styles.profilePic} source={{ uri: this.props.profile.ProfilePic }} />
                </TouchableOpacity>

                {
                    diamondLevel === 0 ?
                        <View style={[this.props.styles.iconContainer, { backgroundColor: '#00803c' }]}>
                            <FontAwesome name="send" size={12} color="white" />
                        </View>
                        :
                        <View style={[this.props.styles.iconContainer, { backgroundColor: '#00803c' }]}>
                            <FontAwesome style={{ marginLeft: 1, marginTop: 1 }} name="diamond" size={12} color="white" />
                        </View>
                }

                <View style={this.props.styles.textContainer}>
                    <TouchableOpacity
                        style={this.props.styles.centerTextVertically}
                        onPress={() => this.props.goToProfile(this.props.profile.PublicKeyBase58Check, this.props.profile.Username)}
                        activeOpacity={1}>
                        <Text style={[this.props.styles.usernameText, themeStyles.fontColorMain]}>{this.props.profile.Username} </Text>
                    </TouchableOpacity>

                    {
                        diamondLevel > 0 ?
                            <>
                                <Text style={[globalStyles.fontWeight500, themeStyles.fontColorMain]}>gave your post </Text>
                                <Text style={[this.props.styles.usernameText, themeStyles.fontColorMain]}>
                                    {diamondLevel} {diamondLevel === 1 ? 'diamond' : 'diamonds'}: </Text>
                                <Text style={[this.props.styles.postText, themeStyles.fontColorSub]} numberOfLines={1}> {this.props.post?.Body}</Text>
                            </>
                            :
                            <Text>
                                <Text style={[globalStyles.fontWeight500, themeStyles.fontColorMain]}>sent you </Text>
                                <Text style={[this.props.styles.usernameText, themeStyles.fontColorMain]}>{formattedCreatorCoinAmount} </Text>
                                <Text style={[this.props.styles.usernameText, themeStyles.fontColorMain]}>{creatorCoinUsername} </Text>
                                <Text style={[globalStyles.fontWeight500, themeStyles.fontColorMain]}>coins</Text>
                            </Text>
                    }
                </View>
            </TouchableOpacity>
        )
    }
};