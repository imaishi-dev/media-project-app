'use client';

import { useRef, useState } from 'react';

export default function Home() {
  const videoRef = useRef(null);
  const [comment, setComment] = useState('');
  const [times, setTimes] = useState([]);

  const addTimeData = () => {
    const nowTime = Number(videoRef.current.currentTime.toFixed(2));
    setTimes((prev) => [
      ...prev,
      {
        id: Date.now(),
        time: nowTime,
        comment: comment,
      },
    ]);
    console.log(times);
  };

  const moveTime = (val) => {
    videoRef.current.currentTime = val;
    videoRef.current.play();
  };

  const saveToServer = async () => {
    console.log('サーバーに保存を開始します...');

    const response = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(times),
    });

    const result = await response.json();
    console.log(result);
    setTimes([]);
    alert(result.message);
  };

  const loadFromServer = async () => {
    const response = await fetch('/api/save', {
      method: 'GET',
    });

    const data = await response.json();
    console.log('読み込んだデータ:', data);
    setTimes(data);
  };

  return (
    <div className='page'>
      <main className='container app-shell'>
        <header className='hero'>
          <div>
            <p className='eyebrow'>MEDIA NOTES</p>
          </div>
          <div className='actions'>
            <button className='secondary' onClick={() => loadFromServer()}>
              サーバーから受信
            </button>
            <button onClick={() => saveToServer()}>サーバーに送信</button>
          </div>
        </header>

        <div className='layout'>
          <section className='panel'>
            <div className='video-wrap'>
              <video src='/sample02.mp4' ref={videoRef} controls></video>
            </div>
            <div className='input-row'>
              <input
                type='text'
                className='mb0'
                placeholder='コメントを入力'
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                }}
              ></input>
              <button onClick={() => addTimeData()}>保存</button>
            </div>
          </section>

          <aside className='panel notes'>
            <h2>タイムスタンプ</h2>
            <ul className='time-list'>
              {times.map((item) => {
                return (
                  <li key={item.id}>
                    <button
                      className='time-item'
                      type='button'
                      onClick={() => moveTime(item.time)}
                    >
                      <span className='time'>{item.time}</span>
                      <span className='comment'>{item.comment}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}
