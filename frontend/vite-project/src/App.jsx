import { useMemo, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5001";

/** Categorical fields (dropdowns) */
const CATEGORY_OPTIONS = {
  "Gender": ["Male", "Female"],
  "Customer Type": ["Loyal Customer", "disloyal Customer"],
  "Type of Travel": ["Business travel", "Personal Travel"],
  "Class": ["Eco", "Eco Plus", "Business"],
};

/** 1–5 sliders (Likert) */
const LIKERT_FIELDS = [
  "Inflight wifi service",
  "Departure/Arrival time convenient",
  "Ease of Online booking",
  "Gate location",
  "Food and drink",
  "Online boarding",
  "Seat comfort",
  "Inflight entertainment",
  "On-board service",
  "Leg room service",
  "Baggage handling",
  "Checkin service",
  "Inflight service",
  "Cleanliness",
];

/** Numeric inputs */
const NUM_FIELDS = {
  "Age": { min: 0, max: 120, step: 1 },
  "Flight Distance": { min: 0, max: 10000, step: 1 },
  "Departure Delay in Minutes": { min: 0, max: 1440, step: 1 },
  "Arrival Delay in Minutes": { min: 0, max: 1440, step: 1 },
};

/** Sensible defaults */
const DEFAULTS = {
  "Gender": "Male",
  "Customer Type": "Loyal Customer",
  "Type of Travel": "Business travel",
  "Class": "Eco",
  "Age": 35,
  "Flight Distance": 500,
  "Departure Delay in Minutes": 0,
  "Arrival Delay in Minutes": 5,
};
LIKERT_FIELDS.forEach((f) => (DEFAULTS[f] = 3)); // default all sliders to 3

export default function App() {
  const [form, setForm] = useState(DEFAULTS);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Ensure numeric fields and sliders are numbers in the payload
  const payload = useMemo(() => {
    const o = { ...form };
    Object.keys(NUM_FIELDS).forEach((k) => (o[k] = Number(o[k] ?? 0)));
    LIKERT_FIELDS.forEach((k) => (o[k] = Number(o[k] ?? 3)));
    return o;
  }, [form]);

  const update = (key, value) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function predict() {
    setBusy(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json?.errors?.join("; ") || res.statusText;
        throw new Error(msg);
      }
      setResult(json);
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setBusy(false);
    }
  }

  function resetDefaults() {
    setForm(DEFAULTS);
    setResult(null);
    setError(null);
  }

  return (
    <div className="container">
      <h1>Flight Satisfaction — Demo</h1>
      <p className="muted">Backend: {API_BASE}</p>

      {/* Categorical dropdowns */}
      <section>
        <h2>Passenger & Trip</h2>
        <div className="grid two">
          {Object.keys(CATEGORY_OPTIONS).map((name) => (
            <label key={name} className="field">
              <span>{name}</span>
              <select
                value={form[name]}
                onChange={(e) => update(name, e.target.value)}
              >
                {CATEGORY_OPTIONS[name].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          ))}

          {Object.entries(NUM_FIELDS).map(([name, cfg]) => (
            <label key={name} className="field">
              <span>{name}</span>
              <input
                type="number"
                min={cfg.min}
                max={cfg.max}
                step={cfg.step}
                value={form[name]}
                onChange={(e) => update(name, e.target.value)}
              />
            </label>
          ))}
        </div>
      </section>

      {/* Sliders */}
      <section>
        <h2>Service Ratings (1–5)</h2>
        <div className="grid one">
          {LIKERT_FIELDS.map((name) => (
            <div key={name} className="sliderRow">
              <div className="sliderLabel">
                <span>{name}</span>
                <strong>{form[name]}</strong>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={form[name]}
                onChange={(e) => update(name, parseInt(e.target.value, 10))}
              />
              <div className="ticks">
                <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="actions">
        <button onClick={predict} disabled={busy}>
          {busy ? "Predicting…" : "Predict"}
        </button>
        <button className="secondary" onClick={resetDefaults} disabled={busy}>
          Reset defaults
        </button>
      </div>

      {/* Preview & Result */}
      <div className="grid two">
        <div>
          <h3>Request preview</h3>
          <pre className="box">{JSON.stringify(payload, null, 2)}</pre>
        </div>
        <div>
          <h3>Result</h3>
          {error && <pre className="box error">{error}</pre>}
          {result && <pre className="box">{JSON.stringify(result, null, 2)}</pre>}
          {!error && !result && <pre className="box muted">No result yet</pre>}
        </div>
      </div>
    </div>
  );
}
