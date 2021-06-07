import React, { useEffect, useState } from 'react';
import { FlatList, Text, View, StyleSheet, Image, ActivityIndicator, Dimensions, RefreshControl, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { globals, navigatorGlobals } from '@globals';
import { Notification, NotificationType, Post, Profile } from '@types';
import { api, getAnonymousProfile, loadTickersAndExchangeRate } from '@services';
import { globalStyles, themeStyles } from '@styles';
import { FollowNotificationComponent } from './components/followNotification.component';
import { BasicTransferNotificationComponent } from './components/basicTransferNotification.component';
import { LikeNotificationComponent } from './components/likeNotification.component';
import { CreatorCoinNotificationComponent } from './components/creatorCoinNotification.component';
import { CreatorCoinTransferNotificationComponent } from './components/creatorCoinTransferNotification.component';

import { PostReplyNotificationComponent } from './components/postReplyNotification.component';
import { PostMentionNotificationComponent } from './components/postMentionNotification.component';
import { PostRecloutNotificationComponent } from './components/postRecloutNotification.component';


export function NotificationsScreen({ navigation }: any) {
    const [isLoading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [profiles, setProfiles] = useState<{ [key: string]: Profile }>({});
    const [posts, setPosts] = useState<{ [key: string]: Post }>({});
    const [refreshing, setRefreshing] = React.useState(false);
    const [isLoadingMore, setLoadingMore] = useState(false);
    const [lastNotificationIndex, setLastNotificationIndex] = useState(-999);
    const [init, setInit] = useState(false);

    let mount = true;

    navigatorGlobals.refreshNotifications = loadNotifications;

    function loadNotifications(p_force = false) {
        if (!init && !p_force) {
            return;
        }

        if (mount) {
            setLoading(true);
        }

        api.getNotifications(globals.user.publicKey, -1, 50)
            .then(
                p_response => {
                    loadTickersAndExchangeRate().then(
                        () => {
                            if (mount) {
                                setNotifications(p_response.Notifications ? p_response.Notifications : []);
                                setProfiles(p_response.ProfilesByPublicKey);
                                setPosts(p_response.PostsByHash);
                                setLoading(false);
                                setRefreshing(false);
                            }
                        }
                    );
                }
            ).catch(p_error => globals.defaultHandleError(p_error));
    }

    function loadMoreNotifications() {
        if (notifications?.length > 0) {
            const newLastNotificationIndex = notifications[notifications.length - 1].Index;

            if (newLastNotificationIndex !== 0) {
                if (mount) {
                    setLoadingMore(true);
                }

                api.getNotifications(globals.user.publicKey, newLastNotificationIndex - 1, 50).then(
                    p_response => {
                        if (mount) {
                            const allNotifications = notifications.concat(p_response.Notifications)
                            setNotifications(allNotifications);
                            setProfiles(p_previousValue => Object.assign(p_previousValue, p_response.ProfilesByPublicKey));
                            setPosts(p_previousValue => Object.assign(p_previousValue, p_response.PostsByHash));
                            setLastNotificationIndex(newLastNotificationIndex);
                            setLoading(false);
                            setRefreshing(false);
                        }
                    }
                ).catch(p_error => globals.defaultHandleError(p_error)).finally(
                    () => {
                        if (mount) {
                            setLoadingMore(false);
                        }
                    }
                );
            }
        }
    }

    useEffect(
        () => {
            setInit(true);
            loadNotifications(true);

            return () => {
                mount = false;
            }
        },
        []
    );

    function goToProfile(p_userKey: string, p_username: string) {
        if (p_username !== 'anonymous') {
            try {
                navigation.navigate(
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

    function goToPost(p_postHashHex: string, p_priorityComment?: string) {
        try {
            navigation.navigate(
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

    function getProfile(p_notification: Notification): Profile {
        let profile = profiles[p_notification.Metadata.TransactorPublicKeyBase58Check];
        if (!profile) {
            profile = getAnonymousProfile(p_notification.Metadata.TransactorPublicKeyBase58Check);
        }

        return profile;
    }

    function renderSubmitPostNotification(p_notification: Notification) {
        const postHashHex = p_notification.Metadata.SubmitPostTxindexMetadata?.PostHashBeingModifiedHex as string;
        const profile = getProfile(p_notification);

        const post = posts[postHashHex];
        if (!post) {
            return undefined;
        }

        if (post.RecloutedPostEntryResponse) {
            return <PostRecloutNotificationComponent
                post={post}
                notification={p_notification}
                goToPost={goToPost}
                styles={styles}
                goToProfile={goToProfile}
                profile={profile}
                postHashHex={postHashHex}
            />
        } else {
            const parentPostHashHex = p_notification.Metadata.SubmitPostTxindexMetadata?.ParentPostHashHex;

            if (parentPostHashHex) {
                const parentPost = posts[parentPostHashHex];

                if (parentPost && parentPost.ProfileEntryResponse.PublicKeyBase58Check === globals.user.publicKey) {

                    return <PostReplyNotificationComponent
                        notification={p_notification}
                        profile={profile}
                        post={post}
                        goToProfile={goToProfile}
                        goToPost={goToPost}
                        styles={styles}
                        postHashHex={postHashHex}
                    />
                } else {
                    return renderPostMentionNotification(p_notification, true);
                }
            } else {
                return renderPostMentionNotification(p_notification, false);
            }
        }
    }



    function renderPostMentionNotification(p_notification: Notification, p_withParentPost: boolean) {
        const profile = getProfile(p_notification);

        let parentPoshHashHex: string;
        let postHashHex: string;
        let post: Post;
        postHashHex = ''

        if (p_withParentPost) {
            parentPoshHashHex = p_notification.Metadata.SubmitPostTxindexMetadata?.ParentPostHashHex as string;
            postHashHex = p_notification.Metadata.SubmitPostTxindexMetadata?.PostHashBeingModifiedHex as string;
            post = posts[postHashHex];
        } else {
            parentPoshHashHex = p_notification.Metadata.SubmitPostTxindexMetadata?.PostHashBeingModifiedHex as string;
            post = posts[parentPoshHashHex];
        }

        return (
            <PostMentionNotificationComponent
                profile={profile}
                post={post}
                goToProfile={goToProfile}
                goToPost={goToPost}
                notification={p_notification}
                postHashHex={postHashHex}
                parentPoshHashHex={parentPoshHashHex}
                styles={styles}
            />
        );
    }



    function renderNotification(p_notification: Notification): any {
        if (p_notification?.Metadata) {
            const postHashHex = p_notification.Metadata.LikeTxindexMetadata?.PostHashHex as string;
            const post = posts[postHashHex]
            const profile = getProfile(p_notification)
            switch (p_notification.Metadata.TxnType) {
                case NotificationType.Follow:
                    return <FollowNotificationComponent
                        styles={styles}
                        profile={profile}
                        goToProfile={goToProfile}
                        notification={p_notification} />
                case NotificationType.BasicTransfer:
                    return <BasicTransferNotificationComponent
                        styles={styles}
                        notification={p_notification}
                        goToProfile={goToProfile} profile={profile}
                    />
                case NotificationType.Like:
                    return <LikeNotificationComponent
                        styles={styles}
                        post={post}
                        notification={p_notification}
                        goToPost={goToPost}
                        goToProfile={goToProfile}
                        profile={profile}
                    />
                case NotificationType.CreatorCoin:
                    return <CreatorCoinNotificationComponent
                        styles={styles}
                        notification={p_notification}
                        goToProfile={goToProfile}
                        profile={profile} />

                case NotificationType.CreatorCoinTransfer:

                    return <CreatorCoinTransferNotificationComponent
                        profile={profile}
                        notification={p_notification}
                        goToProfile={goToProfile}
                        goToPost={goToPost}
                        styles={styles}
                        post={post}
                    />
                case NotificationType.SubmitPost:
                    return renderSubmitPostNotification(p_notification);
                default:
                    return undefined;
            }
        }

        return undefined;
    }

    const keyExtractor = (item: any, index: number) => item.Index?.toString() + index.toString();
    return isLoading ?
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
                    data={notifications}
                    keyExtractor={keyExtractor}
                    renderItem={({ item }) => renderNotification(item)}
                    onEndReached={loadMoreNotifications}
                    onEndReachedThreshold={4}
                    maxToRenderPerBatch={20}
                    windowSize={20}
                    refreshControl={<RefreshControl
                        tintColor={themeStyles.fontColorMain.color}
                        titleColor={themeStyles.fontColorMain.color}
                        refreshing={refreshing}
                        onRefresh={loadNotifications} />}
                    ListFooterComponent={() => isLoadingMore ? <ActivityIndicator color={themeStyles.fontColorMain.color}></ActivityIndicator> : <View></View>}

                />
            </View>
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