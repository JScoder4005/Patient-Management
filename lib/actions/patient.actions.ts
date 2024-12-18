'use server'

import { ID,  Query } from "node-appwrite";
import { parseStringify } from "../utils";
import {BUCKET_ID, DATABASE_ID, databases, ENDPOINT, PATIENT_COLLECTION_ID, PROJECT_ID, storage, users} from "../appwrite.config"
import { InputFile,} from "node-appwrite/file";


// CREATE APPWRITE USER
export const createUser = async (user: CreateUserParams) => {
    try {
      // Create new user -> https://appwrite.io/docs/references/1.5.x/server-nodejs/users#create
      const newUser = await  users.create(
        ID.unique(),
        user.email,
        user.phone,
        undefined,
        user.name
      );
      console.log({newUser});
  
       return parseStringify(newUser);
    } catch (error: any) {
      // Check existing user
      if (error && error?.code === 409) {
        const documents = await users.list([
          Query.equal("email", [user.email]),
        ]);
  
        return documents?.users[0];
      }
      console.error("An error occurred while creating a new user:", error);
    }
  };
  


export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);
    return parseStringify(user);
  } catch (error) {
    console.log(error)
  }
}


export const registerPatient = async ({identificationDocument, ...patient}: RegisterUserParams) => {

  try {
    if (!BUCKET_ID || !DATABASE_ID || !PATIENT_COLLECTION_ID || !ENDPOINT || !PROJECT_ID) {
      throw new Error('Missing required environment variables');
    }

    console.log('BUCKET_ID:', BUCKET_ID);

    let file;

    if (identificationDocument) {
      const inputFilee = InputFile.fromBuffer(
        identificationDocument?.get('blobFile') as Blob,
        identificationDocument?.get('fileName') as string,
      )

      file = await storage.createFile(BUCKET_ID!, ID.unique(), inputFilee)
    }

   console.log(
    {
      identificationDocumentId: file?.$id || null,
      identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
      ...patient
     }
   )
    
    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
     {
      identificationDocumentId: file?.$id || null,
      identificationDocumentUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`,
      ...patient
     }

    )

    return parseStringify(newPatient)
  } catch (error) {
    console.log("An error occurred while creating a new patient", error)
  }
}

export const getpatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );

    return parseStringify(patients.documents[0])
  } catch (error) {
    console.log(error)
  }
}