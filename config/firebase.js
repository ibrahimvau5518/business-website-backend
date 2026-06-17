const admin = require('firebase-admin');

let initialized = false;

const initFirebase = () => {
    if (initialized) {
        return admin;
    }

    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        } catch (error) {
            console.error('Firebase Service Account JSON parse error:', error.message);
            return null;
        }
    } else {
        try {
            serviceAccount = require('../firebaseServiceAccount.json');
        } catch (error) {
            console.warn('Firebase file not found and FIREBASE_SERVICE_ACCOUNT env is not set.');
            return null;
        }
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        initialized = true;
    }

    return initialized ? admin : null;
};

const getFirebaseAdmin = () => (initialized ? admin : initFirebase());

module.exports = { getFirebaseAdmin, initFirebase };