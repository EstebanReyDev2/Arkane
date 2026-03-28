import { NextResponse } from 'next/server';
import { adminAuth } from '@/src/lib/firebase/admin';

export async function POST(request: Request) {
  try {
    const { uid, admin } = await request.json();

    if (!uid) {
      return NextResponse.json({ error: 'Falta el UID del usuario' }, { status: 400 });
    }

    // Aquí debríamos verificar también que quien hace la request es un Superadmin
    // const authHeader = request.headers.get('Authorization');
    // const token = authHeader?.split('Bearer ')[1];
    // if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    // const decodedToken = await adminAuth.verifyIdToken(token);
    // if (!decodedToken.admin) return NextResponse.json({ error: 'Privilegios insuficientes' }, { status: 403 });

    // Set custom claim
    await adminAuth.setCustomUserClaims(uid, { admin: !!admin });

    return NextResponse.json({ success: true, message: `Rol admin ${admin ? 'otorgado' : 'revocado'} a ${uid}` });
  } catch (error: any) {
    console.error('Error configurando Custom Claim:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
