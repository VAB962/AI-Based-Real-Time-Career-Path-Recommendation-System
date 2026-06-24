import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QUIZ_QUESTIONS, scoreQuiz } from '../data/quizData';
import GraphicalResults from '../components/GraphicalResults';
import './QuizPage.css';

/* ── Individual question card ───────────────────────────── */
function QuestionCard({ question, onAnswer, current, total }) {
  const [selected, setSelected] = useState(null);

  const choose = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => onAnswer(idx), 420);
  };

  return (
    <div className="qz-card fade-up" key={current}>
      <span className="qz-category">{question.category}</span>
      <h2 className="qz-question">{question.question}</h2>
      <div className="qz-options">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            className={`qz-option ${selected === idx ? 'qz-option-selected' : ''} ${selected !== null && selected !== idx ? 'qz-option-dim' : ''}`}
            onClick={() => choose(idx)}
          >
            <span className="qz-letter">{String.fromCharCode(65 + idx)}</span>
            <span className="qz-opt-text">{opt.label}</span>
            {selected === idx && <span className="qz-check">✓</span>}
          </button>
        ))}
      </div>
      <p className="qz-hint">Click any option to continue</p>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────── */
export default function QuizPage() {
  const [started,  setStarted]  = useState(false);
  const [current,  setCurrent]  = useState(0);
  const [answers,  setAnswers]  = useState([]);
  const [finished, setFinished] = useState(false);
  const [results,  setResults]  = useState([]);

  const total    = QUIZ_QUESTIONS.length;
  const progress = Math.round((current / total) * 100);

  const handleAnswer = (optIdx) => {
    const newAnswers = [...answers, optIdx];
    setAnswers(newAnswers);
    if (current + 1 >= total) {
      setResults(scoreQuiz(newAnswers));
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
    }
  };

  const retake = () => {
    setStarted(false); setCurrent(0);
    setAnswers([]); setFinished(false); setResults([]);
  };

  /* ── Start screen ── */
  if (!started) {
    return (
      <div className="qz-layout">
        <div className="container">
          <div className="qz-start card fade-up">
            <div className="qz-start-icon">◈</div>
            <h1>Career Discovery Quiz</h1>
            <p className="qz-start-desc">
              Answer 20 quick questions about your personality, interests and working style.
              We'll generate a <strong>personalised graphical career match</strong> just for you.
            </p>
            <div className="qz-start-meta">
              <span>📋 20 questions</span>
              <span>⏱ ~5 minutes</span>
              <span>📊 Graphical results</span>
              <span>🗺 Career roadmap</span>
            </div>
            <button className="btn btn-primary qz-start-btn" onClick={() => setStarted(true)}>
              Start Quiz →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Results screen ── */
  if (finished) {
    const top = results[0];
    return (
      <div className="qz-layout">
        <div className="container">
          <GraphicalResults
            recommendations={results}
            heroTitle={`You're Built for `}
            heroCareer={top?.career}
          />
          <div className="qz-result-actions">
            <button className="btn btn-ghost" onClick={retake}>↺ Retake Quiz</button>
            <Link to="/recommend" className="btn btn-outline">Try AI Recommender</Link>
            <Link to="/jobs"      className="btn btn-primary">Browse Matching Jobs →</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Quiz in progress ── */
  return (
    <div className="qz-layout">
      <div className="container">

        {/* Progress header */}
        <div className="qz-progress-header fade-up">
          <div className="qz-progress-info">
            <span style={{ color:'var(--text-2)', fontSize:'0.82rem', fontFamily:'var(--font-mono)' }}>
              Question {current + 1} of {total}
            </span>
            <span style={{ color:'var(--accent)', fontSize:'0.82rem', fontFamily:'var(--font-mono)', fontWeight:700 }}>
              {progress}% complete
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width:`${progress}%` }} />
          </div>
          {/* Step dots */}
          <div className="qz-dots">
            {Array.from({ length: total }, (_, i) => (
              <div key={i} className={`qz-dot ${i < current ? 'done' : ''} ${i === current ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        <QuestionCard
          key={current}
          question={QUIZ_QUESTIONS[current]}
          onAnswer={handleAnswer}
          current={current}
          total={total}
        />
      </div>
    </div>
  );
}
