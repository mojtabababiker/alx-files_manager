/**
 * api Authentication endpoints definitions
 */
import * as path from 'path';
import fs from '../utils/fs/promises';
import {
  dbClient, redisClient,
} from '../utils/utils';

/**
 * api upload file endpoint
 * Description:
 * - Retrieve the user based on the auth token, and create a file in DB and disk
 * - If the user is not found, return 401
 * - the required data is name, type, data only for files or images
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} res
 */
export async function postUpload(req, res) {
  const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
  let parentName = ''; // to save the file on if specified later
  let userId; // id of the owner of the file
  const {
    name, type, parentId, isPublic, data,
  } = req.body;
  const token = req.headers['x-token'];
  try {
    userId = await redisClient.get(`auth_${token}`);
    const user = await dbClient.getDoc('users', { _id: userId });
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!name) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }
    if (!type) {
      res.status(400).json({ error: 'Missing type' });
      return;
    }
    if (type !== 'folder' && !data) {
      res.status(400).json({ error: 'Missing data' });
      return;
    }
    if (parentId) {
      try {
        const parent = await dbClient.getDoc('files', { _id: parentId });
        if (parent.type !== 'folder') {
          res.status(400).json({ error: 'Parent is not folder' });
          return;
        }
        parentName = parent.name; // update the parent name above
      } catch (error) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (type === 'folder') {
    const docObject = {
      userId,
      name,
      type,
      isPublic: Boolean(isPublic),
      parentId: parentId !== undefined ? parentId : 0,
    };
    try {
      const id = await dbClient.addFile(docObject);
      res.status(201).json({ id, ...docObject });
    } catch (error) {
      res.status(500).json({ error: `Enteral server error ${error.message}` });
    }
    return;
  }

  const docObject = {
    userId,
    name,
    type,
    isPublic: Boolean(isPublic),
    parentId: parentId !== undefined ? parentId : 0,
  };
  // creating the holding directory
  try {
    await fs.mkdirAsync(path.join(folderPath, parentName),
      { recursive: true });
  } catch (error) {
    console.log(error.message);
  }
  // save the file to database
  let fileId;
  try {
    fileId = await dbClient.addFile(docObject);
  } catch (error) {
    res.status(500).json({ error: `Enteral server error ${error.message}` });
    return;
  }
  // save the file to local disk
  try {
    const encodeType = type === 'image' ? 'binary' : 'utf-8';
    await fs.writeFileAsync(path.join(folderPath, parentName, fileId),
      Buffer.from(data, 'base64'), { encoding: encodeType });
  } catch (error) {
    // console.log(error.message);
    res.status(500).json({ error: `Enteral server error ${error.message}` });
    return;
  }
  res.status(201).json({ id: fileId, ...docObject });
}

/**
 * api get file endpoint based on the ID
 * Description:
 * - Login required, Retrieve a file with the id ID from DB
 * - If the user is not found, return 401
 * - If the requested file ID is not available return 404
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} res
 */
export async function getShow(req, res) {
  const fileId = req.params.id;
  const token = req.headers['x-token'];
  const userId = await redisClient.get(`auth_${token}`);
  const user = await dbClient.getDoc('users', { _id: userId });

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const file = await dbClient.getDoc('files', { _id: fileId, userId });
  if (!file) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.json(file);
}

/**
 * api get file endpoint based on the ID
 * Description:
 * - Login required, Retrieve a file with the id ID from DB
 * - If the user is not found, return 401
 * - If the requested file ID is not available return 404
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} res
 */
export async function getIndex(req, res) {
  const MAX_ITEMS = 20; // maximum files per page
  const pageNumber = req.query.page || 0; // current page number
  const filesParentId = req.query.parentId || 0; // by default it the root dir

  const token = req.headers['x-token'];
  const userId = await redisClient.get(`auth_${token}`);
  const user = await dbClient.getDoc('users', { _id: userId });

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const result = await dbClient.paginate(
    'files',
    { userId, parentId: filesParentId },
    pageNumber * MAX_ITEMS,
    MAX_ITEMS,
  );
  res.json(result);
}
