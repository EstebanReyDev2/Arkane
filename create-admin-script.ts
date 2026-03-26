import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function createAdmin() {
  try {
    console.log('Creating auth user...');
    const userCredential = await createUserWithEmailAndPassword(auth, 'AdminArkane@gmail.com', 'Admin1234!');
    const uid = userCredential.user.uid;
    console.log('Created user auth with UID:', uid);
    
    console.log('Creating Firestore document...');
    await setDoc(doc(db, 'users', uid), {
      email: 'AdminArkane@gmail.com',
      role: 'admin',
      createdAt: new Date(),
      firstName: 'Admin',
      lastName: 'Arkane',
      wishlist: [],
      addresses: []
    });
    console.log('Successfully created admin user document in Firestore.');
    process.exit(0);
  } catch (e: any) {
    if (e.code === 'auth/email-already-in-use') {
      console.log('User already exists in Auth. We need to update the Firestore document.');
      // We can't easily get the UID without logging in, so let's try to log in.
      import('firebase/auth').then(async ({ signInWithEmailAndPassword }) => {
        try {
          const cred = await signInWithEmailAndPassword(auth, 'AdminArkane@gmail.com', 'Admin1234!');
          const uid = cred.user.uid;
          await setDoc(doc(db, 'users', uid), {
            email: 'AdminArkane@gmail.com',
            role: 'admin',
            createdAt: new Date(),
            firstName: 'Admin',
            lastName: 'Arkane',
            wishlist: [],
            addresses: []
          });
          console.log('Successfully updated existing user to admin in Firestore.');
          process.exit(0);
        } catch (signInErr) {
          console.error('Failed to sign in existing user:', signInErr);
          process.exit(1);
        }
      });
    } else {
      console.error('Error:', e);
      process.exit(1);
    }
  }
}

createAdmin();
