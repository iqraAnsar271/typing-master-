"use client";

import { useEffect, useMemo, useState } from "react";

const sampleText =
  "Practice makes progress and every keystroke builds confidence.";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function HomePage() {
  const [username, setUsername] = useState("Player 1");
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [leaderboard, setLeaderboard] = useState<
    { _id?: string; username: string; wpm: number; accuracy: number }[]
  >([]);

  const correctChars = useMemo(() => {
    return input
      .split("")
      .filter((char, index) => char === sampleText[index]).length;
  }, [input]);

  const accuracy =
    input.length > 0 ? Math.round((correctChars / input.length) * 100) : 100;

  const wpm =
    started && timeLeft > 0
      ? Math.max(
          0,
          Math.round((correctChars / 5) / ((60 - timeLeft) / 60 || 1))
        )
      : 0;

  const fetchScores = async () => {
    try {
      const res = await fetch(`${API_URL}/scores`);
      if (!res.ok) throw new Error("Failed to load scores");
      const data = await res.json();
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch {
      setLeaderboard([]);
    }
  };

  useEffect(() => {
    const loadScores = async () => {
      await fetchScores();
    };

    void loadScores();
  }, []);

  useEffect(() => {
    if (!started || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, timeLeft]);

  const saveScore = async () => {
    try {
      const response = await fetch(`${API_URL}/scores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          wpm,
          accuracy,
          mode: "practice",
        }),
      });

      if (!response.ok) throw new Error("Failed to save score");
      await fetchScores();
      setScoreSaved(true);
    } catch (error) {
      console.error("Failed to save score", error);
    }
  };

  const resetGame = () => {
    setInput("");
    setStarted(false);
    setTimeLeft(60);
    setScoreSaved(false);
  };

  const handleInputChange = (value: string) => {
    if (!started) {
      setStarted(true);
    }

    setInput(value);

    if (value === sampleText) {
      saveScore();
      setStarted(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: 900,
        margin: "40px auto",
        padding: 24,
        fontFamily: "Arial",
      }}
    >
      <h1 style={{ fontSize: 54, marginBottom: 16 }}>Typing Game</h1>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Username:
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value || "Player 1")}
            style={{
              marginLeft: 10,
              padding: "8px 12px",
              fontSize: 16,
              borderRadius: 8,
              border: "1px solid #d1d5db",
            }}
          />
        </label>

        <p>Time left: {timeLeft}s</p>
        <p>WPM: {wpm}</p>
        <p>Accuracy: {accuracy}%</p>
      </div>

      <div
        style={{
          background: "#f3f4f6",
          padding: 20,
          borderRadius: 12,
          lineHeight: 1.8,
          fontSize: 20,
          marginBottom: 20,
        }}
      >
        {sampleText.split("").map((char, index) => {
          let color = "#111827";

          if (index < input.length) {
            color = input[index] === char ? "green" : "red";
          }

          return (
            <span key={index} style={{ color }}>
              {char}
            </span>
          );
        })}
      </div>

      <textarea
        value={input}
        onChange={(e) => handleInputChange(e.target.value)}
        disabled={timeLeft === 0}
        placeholder="Start typing here..."
        style={{
          width: "100%",
          minHeight: 120,
          padding: 16,
          fontSize: 18,
          borderRadius: 12,
          border: "1px solid #d1d5db",
        }}
      />

      <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
        <button
          onClick={resetGame}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: "#111827",
            color: "white",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {scoreSaved && (
        <p style={{ color: "green", marginTop: 16 }}>Score saved successfully.</p>
      )}

      <h2 style={{ marginTop: 40 }}>Leaderboard</h2>
      <ul>
        {leaderboard.length === 0 ? (
          <li>No scores yet.</li>
        ) : (
          leaderboard.map((item, index) => (
            <li key={item._id || index}>
              {index + 1}. {item.username} - {item.wpm} WPM - {item.accuracy}%
            </li>
          ))
        )}
      </ul>
    </main>
  );
}