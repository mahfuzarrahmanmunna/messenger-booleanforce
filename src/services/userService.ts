// src/services/userService.ts
import { getDatabase } from '../config/database.js';
import { ObjectId } from 'mongodb';

export class UserService {
  async getAllUsers() {
    const db = getDatabase();
    return await db.collection('users').find().toArray();
  }

  async getUserById(id: string) {
    const db = getDatabase();
    return await db.collection('users').findOne({ _id: new ObjectId(id) });
  }

  async createUser(userData: any) {
    const db = getDatabase();
    const result = await db.collection('users').insertOne(userData);
    return { ...userData, _id: result.insertedId };
  }

  async updateUser(id: string, userData: any) {
    const db = getDatabase();
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: userData }
    );
    return result.matchedCount > 0;
  }

  async deleteUser(id: string) {
    const db = getDatabase();
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }
}