/**
 * module contains Abstract class for mongodb operations
 */
import { MongoClient, ObjectId } from 'mongodb';
import { createHash } from 'crypto';

export class DBClient {
  /**
   * DBClient an abstraction class, that connect to mongo database and
   * handel all the database operations
   */

  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';
    this.db = undefined;

    MongoClient.connect(`mongodb://${this.host}:${this.port}`, { useUnifiedTopology: true }, (error, client) => {
      if (!error) {
        this.db = client.db(this.database);
      }
    });
  }

  isAlive() {
    /**
     * Check if the connection to database is succeeded
     */
    return this.db !== undefined;
  }

  async nbUsers() {
    /**
     * Get the number of documents on the collection users
     * @returns {number}
     */
    if (!(this.isAlive())) return 0;
    return await this.db.collection('users').countDocuments(); // eslint-disable-line
  }

  async nbFiles() {
    /**
     * Get the number of documents on the collection files
     * @returns {number}
     */
    if (!this.isAlive()) return 0;
    return await this.db.collection('files').countDocuments();  // eslint-disable-line
  }

  async addUser(email, password) {
    /**
     * Add new user to users collection, with the email and password
     * if the email already registered an Error will be threw
     * @param {string} email - the user email
     * @param {string} password - user password
     * @returns {object} an object contains user email and its id
     */
    let user = await this.db.collection('users').findOne({ email });
    if (user) {
      // console.log(user);
      throw new Error('Already exist');
    }
    try {
      // const hashedPwd = await hash(password, salt);
      const hashedPwd = createHash('sha1').update(password).digest('hex');
      user = await this.db.collection('users').insertOne({ email, password: hashedPwd });
      // console.log(user.insertedId)
      return { email, id: user.insertedId };
    } catch (error) {
      throw new Error('invalid password');
    }
  }

  async getUser(filters) {
    /**
     * Get user from database filtered by filters object
     * @param {object} filters - object of the filters yo apply on the query
     * @return {object} contains the fetched user object, or empty object
     */
    try {
      if ('_id' in filters) {
        filters._id = new ObjectId(JSON.parse(filters._id));  // eslint-disable-line
      }
      const user = await this.db.collection('users').findOne(filters);
      return user;
    } catch (error) {
      // console.log(error.message);
      // throw error
      return null;
    }
  }
}

export const dbClient = new DBClient();  // eslint-disable-line
