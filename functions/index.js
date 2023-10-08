const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

const userColectition = db.collection('users');
// const gamesCollecetion = db.collection('games');

// exports.helloWorld = functions.https.onRequest((request, response) => {
//     try {
//         handleHelloWorld();
//         response.json({data: "success"})
//     } catch (e) {
//         console.log(e)
//     }
// });

exports.newNotification = functions.firestore.document('users/{userId}/notifications/{notificationId}').onCreate((snap, context) => {
    try {
        handleNewNotification(context.params.userId, snap.data())
        return "success";
    } catch (e) {
        console.log(e)
        return e;
    }
});

async function handleNewNotification(userId, notification) {
    try {
        if (notification.type == "GAME_NOTIFICATION") {
            return;
        }
        let token = await getTokenById(userId);
        let gameId = notification.gameId != null ? notification.gameId : ""
        const message = {
            notification: {
                title: `${notification.titleNotification}`,
                body: `${notification.bodyNotification}`,
            },
            data: {
                type: notification.type,
                gameId: gameId,
            },
            token: token
        };
        await admin.messaging().send(message);
    } catch (e) {
        console.log(e);
    }
}


async function getTokenById(id) {
    try {
        var doc = await userColectition
            .doc(id)
            .get();
        return doc.data().fcmToken
    } catch (e) {
        console.log(e)
        return null
    }
}

// exports.addMessages = functions.firestore.document('games/{gameId}/chats/{chatId}').onCreate((snap, context) => {
//     try {
//         handleAddNewMessage(context.params.gameId, snap.data())
//     } catch (e) {
//         console.log(e)
//     }

// });


// async function handleAddNewMessage(gameId, messageObject) {
//     try {
//         let game = await gamesCollecetion.doc(gameId).get();

//         let tokens = await getTokensByIds(game.data().usersJoined);
//         const message = {
//             notification: {
//                 title: `You have an message from ${game.data().title}`,
//                 body: messageObject.content,
//             },
//             data: {
//                 gameId: gameId,
//                 senderId: senderId,
//                 type: 'NEW_MESSAGE'
//             },
//             tokens: tokens,
//         };
//         await admin.messaging().sendMulticast(message);
//     } catch (e) {
//         console.log(e);
//     }
// }

// async function getTokensByIds(ids) {
//     try {
//         const MAX_IDS_PER_QUERY = 8;
//         let times = Math.ceil(ids.length / MAX_IDS_PER_QUERY);
//         var results = [];
//         for (var i = 0; i < times; i++) {
//             let startIndex = i * MAX_IDS_PER_QUERY;
//             let endIndex = startIndex + MAX_IDS_PER_QUERY > ids.length
//                 ? ids.length
//                 : startIndex + MAX_IDS_PER_QUERY;
//             let subList = ids.slice(startIndex, endIndex);
//             var elementResult = await userColectition
//                 .where('__name__', 'in', subList)
//                 .get();
//             elementResult.forEach(doc => {
//                 results.push(doc.data().fcmToken)
//             });
//         }
//         return results;
//     } catch (e) {
//         console.log(e)
//         return []
//     }
// }