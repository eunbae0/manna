import * as admin from 'firebase-admin';

import { prayerRequestNotification } from './notification/prayerRequestNotification';
import { boardNewPostNotification } from './notification/boardNewPostNotification';
import { fellowshipNotification } from './notification/fellowshipNotification';
import { boardActivityNotification } from './notification/boardActivityNotification';
import { getUserFeeds } from './caller/getUserFeeds';
import { sendPushNotificationToAllUsers } from './caller/pushNotification';

admin.initializeApp();

// notification

exports.prayerRequestNotification = prayerRequestNotification();

exports.fellowshipNotification = fellowshipNotification();

exports.boardNewPostNotification = boardNewPostNotification();

exports.boardActivityNotification = boardActivityNotification();

// caller

exports.getUserFeeds = getUserFeeds();

exports.sendPushNotificationToAllUsers = sendPushNotificationToAllUsers();
