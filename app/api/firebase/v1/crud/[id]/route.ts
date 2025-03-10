// npm install firebase-admin
// npm install yup

import * as admin from 'firebase-admin';
import { type NextRequest } from 'next/server'
import * as yup from 'yup';

const table_name = "test"

const contentSchema = yup.object({
    email: yup.string().optional(),
    link: yup.string().optional(),
    rating: yup.number().optional(),
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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params; // Get the document ID from parameters
    const body: content = await req.json();
  
    // Validate the body against the schema
    try {
      await contentSchema.validate(body, { abortEarly: false });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errorMessages = error.inner.map((err) => err.message);
        return new Response(JSON.stringify(errorMessages), {
          status: 400,
        });
      } else {
        return new Response("Internal Server Error", {
          status: 500,
        });
      }
    }
  
    const db = admin.firestore();
    const docRef = db.collection(table_name).doc(id);
  
    // Check if the document exists
    const docSnapshot = await docRef.get();
    if (!docSnapshot.exists) {
      return new Response(JSON.stringify({ message: 'Document not found' }), {
        status: 404,
      });
    }
  
    // Update the document with validated fields
    const updatedData = {
      ...body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Update timestamp
    };
  
    try {
      await docRef.update(updatedData);
      return new Response('Document updated successfully', {
        status: 200,
      });
    } catch (error) {
      console.error('Error updating document:', error);
      return new Response('Internal Server Error', {
        status: 500,
      });
    }

}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {

    const db = admin.firestore();
    const id = params.id 
    
    // Extract query parameters for sorting, filtering, and pagination
    let query = db.collection(table_name).doc(id)

    try {
        const snapshot = await query.get();

        if (!snapshot.exists) {
            return new Response(JSON.stringify({ message: 'No records found' }), {
                status: 404,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*', // Allow all origins
                  'Access-Control-Allow-Methods': 'GET, OPTIONS', // Allowed HTTP methods
                  'Access-Control-Allow-Headers': 'Content-Type', // Allowed headers
              },
            });
        }

        return new Response(JSON.stringify(snapshot.data()), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // Allow all origins
                'Access-Control-Allow-Methods': 'GET, OPTIONS', // Allowed HTTP methods
                'Access-Control-Allow-Headers': 'Content-Type', // Allowed headers
            },
        });

    } catch (error) {
        return new Response('Internal Server Error', {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*', // Allow all origins
              'Access-Control-Allow-Methods': 'GET, OPTIONS', // Allowed HTTP methods
              'Access-Control-Allow-Headers': 'Content-Type', // Allowed headers
          },
        });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params; // Get the document ID from parameters
    const db = admin.firestore();
    const docRef = db.collection(table_name).doc(id);

    try {
        // Check if the document exists
        const docSnapshot = await docRef.get();
        if (!docSnapshot.exists) {
            return new Response(JSON.stringify({ message: 'Document not found' }), {
                status: 404,
            });
        }

        // Delete the document
        await docRef.delete();

        return new Response('Document deleted successfully', {
            status: 200,
        });

    } catch (error) {
        console.error('Error deleting document:', error);
        return new Response('Internal Server Error', {
            status: 500,
        });
    }
}
