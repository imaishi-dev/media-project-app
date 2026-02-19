import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db.json');

const isVercel = !!process.env.VERCEL;

async function readDbRaw() {
  try {
    const text = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(text);
  } catch (e) {
    return [];
  }
}

function normalizeDb(raw) {
  if (raw && Array.isArray(raw.items)) {
    return raw;
  }

  if (Array.isArray(raw)) {
    return {
      items: [
        {
          id: crypto.randomUUID(),
          payload: raw,
          createdAt: new Date().toISOString(),
        },
      ],
    };
  }

  return { items: [] };
}

function extractTimes(raw) {
  if (Array.isArray(raw)) {
    return raw;
  }

  if (raw && Array.isArray(raw.items)) {
    const latest = raw.items[0];
    if (Array.isArray(latest?.payload)) {
      return latest.payload;
    }
  }

  return [];
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

    const raw = await readDbRaw();
    const db = normalizeDb(raw);

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

export async function GET() {
  try {
    const raw = await readDbRaw();
    const times = extractTimes(raw);
    return NextResponse.json(times);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { success: false, message: 'サーバー処理に失敗しました' },
      { status: 500 }
    );
  }
}
