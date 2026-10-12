import path from 'path';
// Where admin-uploaded images live. On a host with a persistent disk set UPLOAD_DIR (e.g. /var/data/uploads).
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'public', 'uploads');
