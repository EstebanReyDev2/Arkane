import * as admin from 'firebase-admin';

function getFirebaseAdminConfig() {
  // Opción 1: Usar JSON completo (RECOMENDADO)
  if (process.env.FIREBASE_ADMIN_SDK_JSON) {
    try {
      const config = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON);
      if (typeof config.project_id === 'string' && config.project_id && config.private_key && config.client_email) {
        console.log('✓ Firebase Admin SDK configurado desde FIREBASE_ADMIN_SDK_JSON');
        return config;
      }
      console.error('✗ FIREBASE_ADMIN_SDK_JSON está presente pero no tiene project_id/private_key/client_email válidos');
    } catch (error) {
      console.error('✗ Error parsing FIREBASE_ADMIN_SDK_JSON:', error);
    }
  }

  // Opción 2: Construir desde variables individuales
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (projectId && privateKey && clientEmail) {
    const config = {
      type: 'service_account',
      project_id: projectId,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || undefined,
      private_key: privateKey.replace(/\\n/g, '\n'),
      client_email: clientEmail,
      client_id: process.env.FIREBASE_CLIENT_ID || undefined,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    };
    console.log('✓ Firebase Admin SDK configurado desde variables individuales');
    return config;
  }

  const missing: string[] = [];
  if (!process.env.FIREBASE_ADMIN_SDK_JSON && !projectId) missing.push('FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!process.env.FIREBASE_ADMIN_SDK_JSON && !privateKey) missing.push('FIREBASE_PRIVATE_KEY');
  if (!process.env.FIREBASE_ADMIN_SDK_JSON && !clientEmail) missing.push('FIREBASE_CLIENT_EMAIL');

  const errorMsg = `Firebase Admin SDK: Variables de entorno faltantes o inválidas: ${missing.join(', ')}. Configura FIREBASE_ADMIN_SDK_JSON o las variables individuales en Vercel.`;
  console.error('✗', errorMsg);
  throw new Error(errorMsg);
}

if (!admin.apps.length) {
  try {
    const config = getFirebaseAdminConfig();
    admin.initializeApp({
      credential: admin.credential.cert(config),
    });
  } catch (error) {
    console.error('✗ Error inicializando Firebase Admin:', error);
    throw error;
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
