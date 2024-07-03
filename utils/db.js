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

  /**
   * Get the number of documents on the collection files
   * @returns {number}
   */
  async nbFiles() {
    if (!this.isAlive()) return 0;
    return await this.db.collection('files').countDocuments();  // eslint-disable-line
  }

  /**
   * Add new user to users collection, with the email and password
   * if the email already registered an Error will be threw
   * @param {string} email - the user email
   * @param {string} password - user password
   * @returns {object} an object contains user email and its id
   */
  async addUser(email, password) {
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

  /**
   * add a new file document, with the attributes provided on docObject
   * @param {ObjectId} docObject the file document attributes added to db
   * @returns {Promise<string|null>} returns the created file id or null in error
   */
  async addFile(docObject) {
    try {
      const file = await this.db.collection('files').insertOne({ ...docObject });
      return file.insertedId.toString();
    } catch (error) {
      // console.log(error.message);
      return null;
    }
  }

  /**
   * Get document from database filtered by filters object
   * @param {string} collection
   * @param {object} filters - object of the filters yo apply on the query
   * @return {object} contains the fetched user object, or empty object
   */
  async getDoc(collection, filters) {
    try {
      if ('_id' in filters) {
        filters._id = new ObjectId(filters._id);  // eslint-disable-line
      }
      const doc = await this.db.collection(collection).findOne(filters);
      return doc;
    } catch (error) {
      console.log(error.message);
      // throw error
      return null;
    }
  }

  /**
   * update the document in the collection with the provided filters and update object
   * @param {string} collection name of the collection to update its document
   * @param {object} filters object of filters to apply on the query
   * @param {update} update object of the fields to update
   * @returns {Promise<object||null>} return the updated document or null in error
   */
  async updateDoc(collection, filters, update) {
    try {
      if ('_id' in filters) {
        filters._id = new ObjectId(filters._id);  // eslint-disable-line
      }
      const doc = await this.db.collection(collection).findOneAndUpdate(
        filters, { $set: update },
        { returnDocument: 'after' },
      );
      // console.log(doc);
      const { _id, ...rest } = doc.value;
      return { id: _id, ...rest };
    } catch (error) {
      // console.log(error.message);
      return null;
    }
  }

  /**
   * Paginate the database collection result based on the filters and, start and end
   * return the result of the chunk as array of documents
   * @param {string} collection the collection name to paginate
   * @param {object} filters object of filters to apply on the query
   * @param {int} start the start document
   * @param {int} $limit the end document
   * @returns {Promise<Array<object>>} an array of the matched object from start to end
   */
  async paginate(collection, filters, start, limit) {
    try {
      const result = await this.db.collection(collection)
        .aggregate([
          {
            $match: { ...filters },
          },
          {
            $skip: start,
          },
          {
            $limit: limit,
          },
        ])
        .toArray();
      result.map((doc, index) => {
        const { _id, ...rest } = doc;
        result[index] = { id: _id, ...rest }; // eslint-disable-line
        return doc;
      });
      // console.log(result);
      return result;
    } catch (error) {
      // console.log(error.message);
      return [];
    }
  }
}
const dbClient = new DBClient();
export default dbClient;
