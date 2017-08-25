import path from 'path';
import os from 'os';

export const TOKEN_DIR = path.join(os.homedir(), '/.credentials/');
export const TOKEN_PATH = path.join(TOKEN_DIR, 'spot-sale-scheduler.json');
