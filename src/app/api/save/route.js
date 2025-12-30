import { promises as fs } from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'db.json');

const readDb = async () => {
  try {
    const raw = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
};

const writeDb = async (data) => {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
};

export async function GET() {
  const savedChapters = await readDb();
  return Response.json(savedChapters);
}

export async function POST(request) {
  const data = await request.json();
  await writeDb(data);

  return Response.json({ message: '保存しました！', received: data });
}
