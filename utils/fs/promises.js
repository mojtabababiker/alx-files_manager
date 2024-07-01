/**
 * utility to make fs module promise based module using promisify
 * the promisified functions ar
 * fs.writeFile
 * fs.mkdir
 */
import { promisify } from 'util';

const fs = require('fs');

fs.writeFileAsync = promisify(fs.writeFile).bind(fs);
fs.mkdirAsync = promisify(fs.mkdir).bind(fs);

export default fs;
