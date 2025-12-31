import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db.json');

const isVercel = !!process.env.VERCEL;

async function readDb() {
  try {
    const text = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(text);
  } catch (e) {
    return { items: [] };
  }
}

async function writeDb(data) {
  const text = JSON.stringify(data, null, 2);
  await fs.writeFile(DB_PATH, text, 'utf-8');
}

export async function POST(request) {
  try {
    const payload = await request.json();

    if (isVercel) {
      console.log('[DEMO] save payload:', payload);
      return NextResponse.json({
        success: true,
        mode: 'demo',
        message: 'Vercelでは保存せず、受信のみ行いました',
      });
    }

    const db = await readDb();

    db.items.unshift({
      id: crypto.randomUUID(),
      payload,
      createdAt: new Date().toISOString(),
    });

    await writeDb(db);

    return NextResponse.json({
      success: true,
      mode: 'local',
      message: 'ローカルの db.json に保存しました',
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, message: 'サーバー処理に失敗しました' },
      { status: 500 }
    );
  }
}
