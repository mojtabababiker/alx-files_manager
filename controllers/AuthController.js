/**
 * api Authentication endpoints definitions
 */
import {
  dbClient, redisClient, validatePassword,
  addAccessToken, getUserFromToken,
} from '../utils/utils';

/**
  * api log user endpoint
  * Description:
  *  - Get the email/pwd from the request body, and find the user with the email
  *  - If there is, and check for password matching
  *  - Create an Auth token save it to redis
  * @param {Express.request} req - The request object
  * @param {Express.response} res - The response object
  * @return object with token: createdToken
*/
export async function getConnect(req, res) {
  const authHeader = req.headers.authorization;
  // console.log(req.headers);
  if (authHeader === undefined) {
    // console.log('No auth header');
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const auth = authHeader.split(' ')[1];
    const credentials = Buffer.from(auth, 'base64').toString();
    // console.log(credentials);
    const [email, pwd] = credentials.split(':');

    const user = await dbClient.getDoc('users', { email });
    // if no user with email email
    if (!user) {
      // console.log("NOt User");
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // validate password
    const validPassword = validatePassword(pwd, user.password);
    if (!validPassword) {
      // console.log("Wrong pwd");
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // create access token
    const token = addAccessToken();
    await redisClient.set(`auth_${token}`, user._id.toString(), 1000 * 60 * 60 * 24);
    res.json({ token });
  } catch (error) {
    // console.log(error.message);
    res.status(400).json({ error: 'Bad Auth Schema' });
  }
}

/**
  * api logout user endpoint
  * Description:
  *  - Get the access token from the request header X-Token, and find the user id based on it
  *  - If there is, and delete it
  * @param {Express.request} req - The request object
  * @param {Express.response} res - The response object
  * @return object with token: createdToken
*/
export async function getDisconnect(req, res) {
  const token = req.headers['x-token'];
  const user = await getUserFromToken(token);
  if (user) {
    try {
      await redisClient.del(`auth_${token}`);
      res.status(204).json({});
      return;
    } catch (error) {
      // console.log(error.message);
    }
  }
  res.status(401).json({ error: 'Unauthorized' });
}

/**
  * api get user profile endpoint
  * Description:
  *  - Get the access token from the request header X-Token, and find the user id based on it
  *  - If there is, return its email and id
  * @param {Express.request} req - The request object
  * @param {Express.response} res - The response object
  * @return object with user's email and id
*/
export async function getMe(req, res) {
  const user = await getUserFromToken(req.headers['x-token']);
  if (user) {
    res.json({ id: user._id, email: user.email });
    return;
  }
  res.status(401).json({ error: 'Unauthorized' });
}
