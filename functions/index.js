const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const functions = require('firebase-functions');
const admin = require('firebase-admin');

const userRouters = require('./routers/users.js')

admin.initializeApp(functions.config().firebase);

const app = express();
dotenv.config()

app.use(bodyParser.json({ limit: '30mb' }))
app.use(bodyParser.urlencoded({ extended: true, limit: '30mb' }))
app.use(cors())

// app.use(cors({ origin: true }));
// app.use(authMiddleware)


app.use('/users', userRouters)

app.get('/', (req, res) => {
    res.send('Welcom to Cloud Functions HTTPS ')
})

exports.v1 = functions.https.onRequest(app)

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


exports.onSendtNotificationToFCMToken = functions.firestore.document('/fl_content/{documentId}').onUpdate(async (change, context) => {
    const document = change.after.data()
    const current = change.before.data()
    const { _fl_meta_, khachHang, nhaCungCap, trangThaiXuLy } = document
    if (_fl_meta_.schema == 'request') {
        if ((trangThaiXuLy == '1' || trangThaiXuLy == '2' || trangThaiXuLy == '3') && !!document.cac_ncc_phu_hop) {
            console.log('document-request', JSON.stringify(document))

            if (trangThaiXuLy == '1' && (document.ncc_dang_chon != current.ncc_dang_chon)) {
                const ncc_dang_chon = document.cac_ncc_phu_hop[document.ncc_dang_chon].nha_cung_cap_ref
                const [nha_cung_cap_ref, dich_vu_ref] = await Promise.all([ncc_dang_chon.get(), document.dichVu.get()])

                const NCCRef = nha_cung_cap_ref.data()
                functions.logger.info("[request] NCCRef " + JSON.stringify(NCCRef))

                const dichVuRef = dich_vu_ref.data()
                functions.logger.info("[request] dichVuRef " + JSON.stringify(dichVuRef))

                if (!!NCCRef.notificationToken) {
                    const message = {
                        notification: {
                            title: `Y??u c???u d???ch v??? m???i`,
                            body: `${dichVuRef.tenDichVu}`
                        },
                        token: NCCRef.notificationToken,
                        apns: { payload: { aps: { sound: 'default', } } },
                        android: {
                            notification: {
                                title: `Y??u c???u d???ch v??? m???i`,
                                body: `${dichVuRef.tenDichVu}`,
                                sound: "default"
                            }
                        }
                        // sound: "default",
                        // vibrate: "true"
                    }
                    await admin.messaging().send(message)
                }
            }

            if (trangThaiXuLy == '2') {
                const [khach_hang_ref, nha_cung_cap_ref] = await Promise.all([document.khachHang.get(), document.nhaCungCap.get()])

                const khachHangRef = khach_hang_ref.data()
                functions.logger.info("[request] khachHangRef " + JSON.stringify(khachHangRef))

                const nhaCungCapRef = nha_cung_cap_ref.data()
                functions.logger.info("[request] nhaCungCapRef " + JSON.stringify(nhaCungCapRef))

                const tenNhaCungCap = !!nhaCungCapRef && !!nhaCungCapRef.nhaCungCap ? nhaCungCapRef.nhaCungCap.tenNhaCungCap : ''
                if (!!khachHangRef.notificationToken) {
                    const message = {
                        notification: {
                            title: `${tenNhaCungCap} ???? ti???p nh???n y??u c???u`,
                            body: `Vui l??ng m??? app v?? ch???p nh???n`,
                        },
                        token: khachHangRef.notificationToken,
                        apns: { payload: { aps: { sound: 'default', } } },
                        android: {
                            notification: {
                                title: `${tenNhaCungCap} ???? ti???p nh???n y??u c???u`,
                                body: `Vui l??ng m??? app v?? ch???p nh???n`,
                                sound: "default"
                            }
                        }
                        // sound: "default",
                        // vibrate: "true"
                    }
                    await admin.messaging().send(message)
                }
            }

            if (trangThaiXuLy == '3') {
                const [khach_hang_ref, nha_cung_cap_ref] = await Promise.all([document.khachHang.get(), document.nhaCungCap.get()])

                const khachHangRef = khach_hang_ref.data()
                functions.logger.info("[request] khachHangRef " + JSON.stringify(khachHangRef))

                const nhaCungCapRef = nha_cung_cap_ref.data()
                functions.logger.info("[request] nhaCungCapRef " + JSON.stringify(nhaCungCapRef))

                const tenNhaCungCap = !!nhaCungCapRef && !!nhaCungCapRef.nhaCungCap ? nhaCungCapRef.nhaCungCap.tenNhaCungCap : ''
                if (!!nhaCungCapRef.notificationToken) {
                    const message = {
                        notification: {
                            title: `${tenNhaCungCap} ???? ???????c ch???p nh???n`,
                            body: `Vui l??ng m??? app v?? h???n g???p m???t`,
                        },
                        token: nhaCungCapRef.notificationToken,
                        apns: { payload: { aps: { sound: 'default', } } },
                        android: {
                            notification: {
                                title: `${tenNhaCungCap} ???? ???????c ch???p nh???n`,
                                body: `Vui l??ng m??? app v?? h???n g???p m???t`,
                                sound: "default"
                            }
                        }
                        // sound: "default",
                        // vibrate: "true"
                    }
                    await admin.messaging().send(message)
                }
            }
        }
    }
});

exports.onSendtNotificationToFCMTokenJoinVideoCall = functions.firestore.document('/videorooms/{roomId}').onCreate(async (snap, context) => {
    const snapData = snap.data();

    const roomId = context.params.roomId;
    const token = snapData.token;
    const displayName = snapData.displayName;

    functions.logger.info("[request] snapData " + JSON.stringify(snapData))
    functions.logger.info("[request] context " + JSON.stringify(context))
    const message = {
        notification: {
            title: `DoctorCity Video Calling...`,
            body: `${displayName} ??ang g???i video ?????n`,
        },
        data: {
            type: 'video-join',
            roomId: roomId,
            displayName: displayName,
        },
        token: token,
        apns: { payload: { aps: { sound: 'default', } } },
        android: {
            notification: {
                title: `DoctorCity Video Calling...`,
                body: `${displayName} ??ang g???i video ?????n`,
                sound: "default"
            }
        }
        // sound: "default",
        // vibrate: "true"
    }
    await admin.messaging().send(message)

});