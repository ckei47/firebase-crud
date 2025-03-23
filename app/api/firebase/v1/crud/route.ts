// npm install firebase-admin
// npm install yup

import * as admin from 'firebase-admin';
import { type NextRequest } from 'next/server'
import * as yup from 'yup';

const table_name = "test"

const contentSchema = yup.object({
  title: yup.string().required('Title is required'),
  sub_title: yup.string().required('Subtitle is required'),
  article: yup.string().required('Article is Required'),
}).strict()
.noUnknown(true, 'Unknown field: ${unknown}');

interface content {
  email: string,
  link: string,
  rating: number
}

const serviceAccount = {
    "type": process.env.FIREBASE_CONNECTION_TYPE,
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY,
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": process.env.FIREBASE_AUTH_URI,
    "token_uri": process.env.FIREBASE_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER,
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL,
    "universe_domain": process.env.FIREBASE_UNIVERSE_DOMAIN
}
  
if (!admin.apps.length) {
    initializeFirebase()
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
    });
}

async function initializeFirebase() {
  await admin 
}

export async function POST(req: NextRequest) {
  
  const body:content = await req.json()

  try {

    await contentSchema.validate( body, { abortEarly: false });

  } catch (error) {

    if (error instanceof yup.ValidationError) {
      const errorMessages = error.inner.map((err) => err.message);
      return new Response( JSON.stringify(errorMessages), {
        status: 400,
      })
    } else {
      return new Response( "Internal Server Error", {
        status: 500,
      })
    }
  }

  const db = admin.firestore();
  await db.runTransaction(async (transaction) => {
    const counterRef = db.collection(`counters`).doc(`${table_name}_counter`);
    const counterDoc = await transaction.get(counterRef);
    const currentCount = counterDoc.exists ? counterDoc.data()?.count : 0;
    const newCount = currentCount + 1;

    transaction.set(counterRef, { count: newCount });

    const docData = {
      id: newCount,
      ...body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(), // Add createdAt timestamp
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Add updatedAt timestamp
    };

    const docRef = db.collection(table_name).doc(newCount.toString());
    await transaction.set(docRef, docData);
  });

  return new Response('Article Saved', {
    status: 200,
  })

}

export async function GET(req: NextRequest) {
  const db = admin.firestore();

 
    // Extract query parameters for sorting, filtering, and pagination
    const sortField = req.nextUrl.searchParams.get('sortField') ? req.nextUrl.searchParams.get('sortField') : false;
    const sortOrder = req.nextUrl.searchParams.get('sortOrder') ? 'desc' : 'asc';
    const pageSize = parseInt(req.nextUrl.searchParams.get('pageSize') || '10', 10);
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
    const email = req.nextUrl.searchParams.get('email');
    const startAfter = req.nextUrl.searchParams.get('startAfter'); // Use document ID or a field value for pagination

    let query: admin.firestore.Query = db.collection(table_name);
    
    // Apply filtering based on query parameters
    if (email) {
        query = query.where('email', '==', email);
    }
    // Apply sorting
    if (sortField) {
      query = query.orderBy(sortField, sortOrder)
    }

    // Apply pagination using startAfter if provided
    if (startAfter) {
        const lastDocSnapshot = await db.collection(table_name).doc(startAfter).get();
        if (lastDocSnapshot.exists) {
            query = query.startAfter(lastDocSnapshot);
        }
    }

    // Set the limit for pagination
    query = query.limit(pageSize);

    try {
        const selected_fields = ["title", "sub_title"]
        const snapshot = await query.select(...selected_fields).get();

        if (snapshot.empty) {
            return new Response(JSON.stringify({ message: 'No records found' }), {
                status: 404,
            });
        }

        const results = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        

        const response = {'data': results}

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        return new Response('Internal Server Error', {
            status: 500,
        });
    }
}
