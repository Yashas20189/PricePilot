import { useState } from "react";
import axios from "axios";
import { Send, Unlink } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function TelegramConnection({ connected, onConnectedChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function connect() {
    setBusy(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/telegram/connect`, {}, {
        headers: { Authorization: token },
      });
      window.open(response.data.connectUrl, "_blank", "noopener,noreferrer");
      setError("Press Start in Telegram. Refresh your dashboard after the bot confirms the connection.");
    } catch (e) {
      setError(e.response?.data?.message || "Could not create Telegram link.");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/telegram/connect`, {
        headers: { Authorization: token },
      });
      onConnectedChange(false);
    } catch (e) {
      setError(e.response?.data?.message || "Could not disconnect Telegram.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="pp-management" style={{ marginTop: 24 }}>
      <div className="pp-section-heading">
        <div>
          <span className="pp-eyebrow">NOTIFICATIONS</span>
          <h2>Telegram alerts</h2>
          <p>{connected ? "Your Telegram account is connected." : "Connect Telegram to receive price alerts in your chat."}</p>
        </div>
        {connected ? (
          <button className="pp-primary-button" disabled={busy} onClick={disconnect}>
            <Unlink size={16} /> {busy ? "Please wait..." : "Disconnect"}
          </button>
        ) : (
          <button className="pp-primary-button" disabled={busy} onClick={connect}>
            <Send size={16} /> {busy ? "Creating link..." : "Connect Telegram"}
          </button>
        )}
      </div>
      {error && <p role="status" style={{ marginTop: 12 }}>{error}</p>}
    </section>
  );
}
