'use client';

import { useRef, useState } from 'react';

export default function Home() {
  const videoUrl = process.env.NEXT_PUBLIC_VIDEO_URL || '/sample02.mp4';
  const videoRef = useRef(null);
  const [comment, setComment] = useState('');
  const [times, setTimes] = useState([]);
  const [query, setQuery] = useState('');

  const getCurrentTime = () => {
    if (!videoRef.current) return 0;
    return Number(videoRef.current.currentTime.toFixed(2));
  };

  const formatTime = (value) => {
    const numeric = Number(value);
    return Number.isNaN(numeric) ? String(value) : numeric.toFixed(2);
  };

  const addTimeData = () => {
    const trimmed = comment.trim();
    if (!trimmed) return;

    const entry = {
      id: Date.now(),
      time: getCurrentTime(),
      comment: trimmed,
    };

    setTimes((prev) => [...prev, entry]);
    setComment('');
  };

  const moveTime = (val) => {
    const player = videoRef.current;
    if (!player) return;
    player.currentTime = val;
    player.play();
  };

  const parseJsonResponse = async (response, fallback) => {
    const text = await response.text();
    if (!text) return fallback;
    try {
      return JSON.parse(text);
    } catch {
      return fallback;
    }
  };

  const saveToServer = async () => {
    console.log('サーバーに保存を開始します...');

    if (times.length === 0) {
      alert('保存するデータがありません');
      return;
    }

    const response = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(times),
    });

    const data = await parseJsonResponse(response, {});

    if (!response.ok) {
      alert(data.message || '保存に失敗しました');
      return;
    }

    setTimes([]);
    alert(data.message || '保存しました');
  };

  const loadFromServer = async () => {
    const response = await fetch('/api/save', { method: 'GET' });

    const data = await parseJsonResponse(response, []);

    if (!response.ok) {
      alert(data.message || '読み込みに失敗しました');
      return;
    }

    console.log('読み込んだデータ:', data);
    setTimes(Array.isArray(data) ? data : []);
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filteredTimes = normalizedQuery
    ? times.filter((item) => {
        const timeMatch = String(item.time).includes(normalizedQuery);
        const commentMatch = item.comment
          .toLowerCase()
          .includes(normalizedQuery);
        return timeMatch || commentMatch;
      })
    : times;

  return (
    <div className='page'>
      <main className='container app-shell'>
        <header className='hero'>
          <div>
            <p className='eyebrow'>TIMESTAMP REVIEW</p>
            <h1>MEDIA NOTES</h1>
            <p className='lead'>
              再生中の瞬間を残して、あとで一括レビューできるメモツール。
            </p>
          </div>
          <div className='actions'>
            <button
              className='secondary bdr18'
              onClick={() => loadFromServer()}
            >
              サーバーから受信
            </button>
            <button className='bdr18' onClick={() => saveToServer()}>
              サーバーに送信
            </button>
          </div>
        </header>

        <div className='layout'>
          <section className='panel'>
            <div className='video-wrap'>
              <video src={videoUrl} ref={videoRef} controls></video>
            </div>
            <div className='input-row'>
              <input
                type='text'
                className='mb0'
                placeholder='コメントを入力'
                aria-label='コメントを入力'
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                }}
              ></input>
              <button onClick={() => addTimeData()}>保存</button>
            </div>
          </section>

          <aside className='panel notes'>
            <div className='notes-header'>
              <div>
                <h2>タイムスタンプ</h2>
                <p className='muted'>コメントや秒数で検索</p>
              </div>
              <span className='count-badge'>
                {filteredTimes.length}/{times.length}
              </span>
            </div>
            <div className='search-row'>
              <input
                type='search'
                className='mb0'
                aria-label='タイムスタンプを検索'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {filteredTimes.length === 0 ? (
              <p className='empty-state'>
                該当するタイムスタンプがありません。
              </p>
            ) : (
              <ul className='time-list'>
                {filteredTimes.map((item) => {
                  return (
                    <li key={item.id}>
                      <button
                        className='time-item'
                        type='button'
                        onClick={() => moveTime(item.time)}
                      >
                        <span className='time'>{formatTime(item.time)}</span>
                        <span className='comment'>{item.comment}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
