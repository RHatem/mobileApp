import React from 'react';
import { FlatList, Text, View, StyleSheet, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import { globals, navigatorGlobals } from '@globals';
import { Notification, NotificationType, Post, Profile } from '@types';
import { api, getAnonymousProfile, loadTickersAndExchangeRate } from '@services';
import { themeStyles } from '@styles';
import { FollowNotificationComponent } from './components/followNotification.component';
import { BasicTransferNotificationComponent } from './components/basicTransferNotification.component';
import { LikeNotificationComponent } from './components/likeNotification.component';
import { CreatorCoinNotificationComponent } from './components/creatorCoinNotification.component';
import { CreatorCoinTransferNotificationComponent } from './components/creatorCoinTransferNotification.component';
import { PostReplyNotificationComponent } from './components/postReplyNotification.component';
import { PostMentionNotificationComponent } from './components/postMentionNotification.component';
import { PostRecloutNotificationComponent } from './components/postRecloutNotification.component';
import { NavigationProp } from '@react-navigation/native';

interface Props {
    standardPublicKey: string;
    nonStandardPublicKey?: string;
    back: () => void;
    selectAccount: (publicKey: string) => void;
    navigation: NavigationProp<any>;
}

interface State {
    isLoading: boolean;
    notifications: Notification[];
    profiles: { [key: string]: Profile };
    posts: { [key: string]: Post };
    refreshing: boolean;
    isLoadingMore: boolean;
    lastNotificationIndex: number;
    init: boolean;
}

export class NotificationsScreen extends React.Component<Props, State> {

    private _isMounted = true;

    constructor(props: Props) {
        super(props);

        this.state = {
            isLoading: true,
            notifications: [],
            profiles: {},
            posts: {},
            refreshing: false,
            isLoadingMore: false,
            lastNotificationIndex: -999,
            init: false,
        };

        this.loadNotifications = this.loadNotifications.bind(this);
        this.loadMoreNotifications = this.loadMoreNotifications.bind(this);
        this.goToProfile = this.goToProfile.bind(this);
        this.goToPost = this.goToPost.bind(this);
        this.getProfile = this.getProfile.bind(this);
        this.renderSubmitPostNotification = this.renderSubmitPostNotification.bind(this);
        this.renderPostMentionNotification = this.renderPostMentionNotification.bind(this);
        this.renderNotification = this.renderNotification.bind(this);
    }

    loadNotifications(p_force = false) {
        if (!this.state.init && !p_force) {
            return;
        }

        if (this._isMounted) {
            this.setState({ isLoading: true, });
        }

        api.getNotifications(globals.user.publicKey, -1, 50)
            .then(
                p_response => {
                    loadTickersAndExchangeRate().then(
                        () => {
                            if (this._isMounted) {
                                this.setState({
                                    notifications: p_response.Notifications ? p_response.Notifications : [],
                                    profiles: p_response.ProfilesByPublicKey,
                                    isLoading: false,
                                    refreshing: false,
                                    posts: p_response.PostsByHash
                                });
                            }
                        }
                    );
                }
            ).catch(p_error => globals.defaultHandleError(p_error));
    }

    loadMoreNotifications() {
        if (this.state.notifications?.length > 0) {
            const newLastNotificationIndex = this.state.notifications[this.state.notifications.length - 1].Index;

            if (newLastNotificationIndex !== 0) {
                if (this._isMounted) {
                    this.setState({ isLoadingMore: true });
                }

                api.getNotifications(globals.user.publicKey, newLastNotificationIndex - 1, 50).then(
                    p_response => {
                        if (this._isMounted) {
                            const allNotifications = this.state.notifications.concat(p_response.Notifications)
                            this.setState((p_previousValue) => ({
                                notifications: allNotifications,
                                lastNotificationIndex: newLastNotificationIndex,
                                isLoading: false,
                                refreshing: false,
                                profiles: Object.assign(p_previousValue.profiles, p_response.ProfilesByPublicKey),
                                posts: Object.assign(p_previousValue.posts, p_response.PostsByHash)
                            }));
                        }
                    }
                ).catch(p_error => globals.defaultHandleError(p_error)).finally(
                    () => {
                        if (this._isMounted) {
                            this.setState({ isLoadingMore: false });
                        }
                    }
                );
            }
        }
    }

    componentDidMount() {
        this.setState({ init: true });
        this.loadNotifications(true);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    goToProfile(p_userKey: string, p_username: string) {
        if (p_username !== 'anonymous') {
            try {
                this.props.navigation.navigate(
                    'AppNavigator',
                    {
                        screen: 'UserProfile',
                        params: {
                            publicKey: p_userKey,
                            username: p_username
                        }
                    }
                );
            } catch {
                alert('Something went wrong! Please try again.')
            }
        }
    }

    goToPost(p_postHashHex: string, p_priorityComment?: string) {
        try {
            this.props.navigation.navigate(
                'AppNavigator',
                {
                    screen: 'Post',
                    params: {
                        postHashHex: p_postHashHex,
                        priorityComment: p_priorityComment
                    }
                }
            );
        } catch {
            alert('Something went wrong! Please try again.')
        }
    }

    getProfile(p_notification: Notification): Profile {
        let profile = this.state.profiles[p_notification.Metadata.TransactorPublicKeyBase58Check];
        if (!profile) {
            profile = getAnonymousProfile(p_notification.Metadata.TransactorPublicKeyBase58Check);
        }
        return profile;
    }

    renderSubmitPostNotification(p_notification: Notification) {
        const postHashHex = p_notification.Metadata.SubmitPostTxindexMetadata?.PostHashBeingModifiedHex as string;
        const profile = this.getProfile(p_notification);

        const post = this.state.posts[postHashHex];
        if (!post) {
            return undefined;
        }

        if (post.RecloutedPostEntryResponse) {
            return <PostRecloutNotificationComponent
                post={post}
                notification={p_notification}
                goToPost={this.goToPost}
                styles={styles}
                goToProfile={this.goToProfile}
                profile={profile}
                postHashHex={postHashHex}
            />
        } else {
            const parentPostHashHex = p_notification.Metadata.SubmitPostTxindexMetadata?.ParentPostHashHex;

            if (parentPostHashHex) {
                const parentPost = this.state.posts[parentPostHashHex];

                if (parentPost && parentPost.ProfileEntryResponse.PublicKeyBase58Check === globals.user.publicKey) {
                    return <PostReplyNotificationComponent
                        notification={p_notification}
                        profile={profile}
                        post={post}
                        goToProfile={this.goToProfile}
                        goToPost={this.goToPost}
                        styles={styles}
                        postHashHex={postHashHex}
                    />
                } else {
                    return this.renderPostMentionNotification(p_notification, true);
                }
            } else {
                return this.renderPostMentionNotification(p_notification, false);
            }
        }
    }

    renderPostMentionNotification(p_notification: Notification, p_withParentPost: boolean) {
        const profile = this.getProfile(p_notification);
        let parentPoshHashHex: string;
        let postHashHex: string;
        let post: Post;
        postHashHex = ''

        if (p_withParentPost) {
            parentPoshHashHex = p_notification.Metadata.SubmitPostTxindexMetadata?.ParentPostHashHex as string;
            postHashHex = p_notification.Metadata.SubmitPostTxindexMetadata?.PostHashBeingModifiedHex as string;
            post = this.state.posts[postHashHex];
        } else {
            parentPoshHashHex = p_notification.Metadata.SubmitPostTxindexMetadata?.PostHashBeingModifiedHex as string;
            post = this.state.posts[parentPoshHashHex];
        }

        return (
            <PostMentionNotificationComponent
                profile={profile}
                post={post}
                goToProfile={this.goToProfile}
                goToPost={this.goToPost}
                notification={p_notification}
                postHashHex={postHashHex}
                parentPoshHashHex={parentPoshHashHex}
                styles={styles}
            />
        );
    }

    renderNotification(p_notification: Notification): any {
        if (p_notification?.Metadata) {

            const profile = this.getProfile(p_notification)
            switch (p_notification.Metadata.TxnType) {
                case NotificationType.Follow:
                    return <FollowNotificationComponent
                        styles={styles}
                        profile={profile}
                        goToProfile={this.goToProfile}
                        notification={p_notification} />
                case NotificationType.BasicTransfer:
                    return <BasicTransferNotificationComponent
                        styles={styles}
                        notification={p_notification}
                        goToProfile={this.goToProfile} profile={profile}
                    />
                case NotificationType.Like: {
                    const postHashHex = p_notification.Metadata.LikeTxindexMetadata?.PostHashHex as string;
                    return <LikeNotificationComponent
                        styles={styles}
                        post={this.state.posts[postHashHex]}
                        notification={p_notification}
                        goToPost={this.goToPost}
                        goToProfile={this.goToProfile}
                        profile={profile}
                    />
                }
                case NotificationType.CreatorCoin:
                    return <CreatorCoinNotificationComponent
                        styles={styles}
                        notification={p_notification}
                        goToProfile={this.goToProfile}
                        profile={profile} />

                case NotificationType.CreatorCoinTransfer:
                    const postHashHex = p_notification.Metadata.CreatorCoinTransferTxindexMetadata?.PostHashHex as string;
                    return <CreatorCoinTransferNotificationComponent
                        profile={profile}
                        notification={p_notification}
                        goToProfile={this.goToProfile}
                        goToPost={this.goToPost}
                        styles={styles}
                        post={this.state.posts[postHashHex]}
                    />
                case NotificationType.SubmitPost:
                    return this.renderSubmitPostNotification(p_notification);
                default:
                    return undefined;
            }
        }
        return undefined;
    }
    render() {
        navigatorGlobals.refreshNotifications = this.loadNotifications;

        const keyExtractor = (item: any, index: number) => item.Index?.toString() + index.toString();
        return this.state.isLoading ?
            <View style={[styles.listContainer, themeStyles.containerColorMain]}>
                <ActivityIndicator style={styles.activityIndicator} color={themeStyles.fontColorMain.color}></ActivityIndicator>
            </View>
            :
            globals.readonly ?
                <View style={[{ alignItems: 'center', justifyContent: 'center' }, styles.listContainer, themeStyles.containerColorSub]}>
                    <Text style={[themeStyles.fontColorMain]}>Notifications are not available in the read-only mode.</Text>
                </View>
                :
                <View style={[styles.listContainer, themeStyles.containerColorSub]}>
                    <FlatList
                        data={this.state.notifications}
                        keyExtractor={keyExtractor}
                        renderItem={({ item }) => this.renderNotification(item)}
                        onEndReached={this.loadMoreNotifications}
                        onEndReachedThreshold={4}
                        maxToRenderPerBatch={20}
                        windowSize={20}
                        refreshControl={<RefreshControl
                            tintColor={themeStyles.fontColorMain.color}
                            titleColor={themeStyles.fontColorMain.color}
                            refreshing={this.state.refreshing}
                            onRefresh={this.loadNotifications} />}
                        ListFooterComponent={() => this.state.isLoadingMore ? <ActivityIndicator color={themeStyles.fontColorMain.color}></ActivityIndicator> : <View></View>}

                    />
                </View>
    }
}

const styles = StyleSheet.create(
    {
        activityIndicator: {
            marginTop: 175
        },
        listContainer: {
            flex: 1,
            width: Dimensions.get('window').width
        },
        notificationContainer: {
            height: 65,
            paddingLeft: 10,
            paddingRight: 10,
            borderBottomWidth: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: Dimensions.get('window').width
        },
        centerTextVertically: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
        },
        textContainer: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            width: Dimensions.get('window').width - 74
        },
        profilePic: {
            width: 40,
            height: 40,
            borderRadius: 6,
            marginRight: 12
        },
        usernameText: {
            fontWeight: '700'
        },
        iconContainer: {
            position: 'absolute',
            left: 35,
            bottom: 4,
            borderRadius: 20,
            width: 20,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.23,
            shadowRadius: 2.62,
            elevation: 4,
        },
        postText: {
            marginTop: 4,
            fontWeight: '500'
        }
    }
);