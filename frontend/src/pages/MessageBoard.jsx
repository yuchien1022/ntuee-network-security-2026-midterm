import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import { useAuth } from "../context/AuthContext";
import services from "../services";

const API_BASE = import.meta.env.VITE_API_URL ?? "";
const MAX_MESSAGE_LENGTH = 1000;

function Avatar({ user }) {
  if (user?.avatarUrl) {
    return (
      <img
        src={`${API_BASE}${user.avatarUrl}`}
        alt={user.username}
        className="msg-avatar msg-avatar-img"
      />
    );
  }
  return (
    <div className="msg-avatar">
      {user?.username?.charAt(0).toUpperCase() ?? "?"}
    </div>
  );
}

function MessageItem({ msg, currentUserId, onUpdated, onDeleted, onDeleteError }) {
  const isOwner = Boolean(currentUserId && msg.author?.id === currentUserId);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(msg.content);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  async function handleSave() {
    if (!editContent.trim()) return;
    if (editContent.length > MAX_MESSAGE_LENGTH) {
      setEditError(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }
    setSaving(true);
    setEditError("");
    try {
      const updated = await services.message.update(msg.id, editContent);
      onUpdated(updated);
      setEditing(false);
    } catch (err) {
      setEditError(err.response?.data?.error || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this message?")) return;
    try {
      await services.message.remove(msg.id);
      onDeleted(msg.id);
    } catch (err) {
      onDeleteError?.(err);
    }
  }

  return (
    <div className="msg-item">
      <Avatar user={msg.author} />
      <div className="msg-body">
        <div className="msg-meta">
          <span className="msg-author">
            {msg.author?.username ?? "Unknown"}
            {msg.author?.role === "owner" ? " (Owner)" : ""}
          </span>
          {isOwner && !editing && (
            <div className="msg-actions">
              <button className="msg-action-btn" onClick={() => { setEditing(true); setEditContent(msg.content); }}>Edit</button>
              <button className="msg-action-btn msg-action-delete" onClick={handleDelete}>Delete</button>
            </div>
          )}
        </div>
        {editing ? (
          <div className="msg-edit-form">
            <textarea
              className="msg-textarea"
              value={editContent}
              onChange={(e) => {
                const nextValue = e.target.value;
                setEditContent(nextValue);
                if (editError && nextValue.length <= MAX_MESSAGE_LENGTH) {
                  setEditError("");
                }
              }}
              rows={3}
            />
            {editError && <div className="form-message error">{editError}</div>}
            <div className="form-actions">
              <button className="btn btn-filled" onClick={handleSave} disabled={saving || !editContent.trim()}>
                {saving ? "Saving…" : "Save"}
              </button>
              <button className="btn" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
            </div>
          </div>
        ) : (
          <p className="msg-content">{msg.content}</p>
        )}
      </div>
    </div>
  );
}

export default function MessageBoard() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      setLoadError("");
      const data = await services.message.getAll();
      setMessages(data);
    } catch (err) {
      setLoadError(err.response?.data?.error || "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePost(e) {
    e.preventDefault();
    if (!content.trim()) return;
    if (content.length > MAX_MESSAGE_LENGTH) {
      setError(`Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }
    setPosting(true);
    setError("");
    try {
      const newMsg = await services.message.create({ content });
      setMessages((prev) => [newMsg, ...prev]);
      setContent("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post message.");
    } finally {
      setPosting(false);
    }
  }

  function handleUpdated(updated) {
    setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }

  function handleDeleted(id) {
    setDeleteError("");
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  function handleDeleteError(err) {
    setDeleteError(err.response?.data?.error || "Failed to delete message.");
  }

  return (
    <div className="page-wrapper">
      <section>
        <FadeIn>
          <h2>Message Board</h2>

          {user ? (
            <form className="msg-form" onSubmit={handlePost}>
              <textarea
                className="msg-textarea"
                placeholder="Leave a message…"
                value={content}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setContent(nextValue);
                  if (error && nextValue.length <= MAX_MESSAGE_LENGTH) {
                    setError("");
                  }
                }}
                rows={3}
              />
              {error && <div className="form-message error">{error}</div>}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-filled"
                  disabled={posting || !content.trim()}
                >
                  {posting ? "Posting…" : "Post"}
                </button>
                <span className="char-count">{content.length} / {MAX_MESSAGE_LENGTH}</span>
              </div>
            </form>
          ) : (
            <div className="auth-notice">
              <p>
                Please <Link to="/login">log in</Link> or{" "}
                <Link to="/register">register</Link> to post a message.
              </p>
            </div>
          )}

          {loadError && <div className="form-message error">{loadError}</div>}
          {deleteError && <div className="form-message error">{deleteError}</div>}

          <div className="msg-list">
            {loading ? (
              <div className="loading">Loading messages…</div>
            ) : messages.length === 0 ? (
              <div className="empty-state">
                <p>No messages yet. Be the first to say something!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  msg={msg}
                  currentUserId={user?.id}
                  onUpdated={handleUpdated}
                  onDeleted={handleDeleted}
                  onDeleteError={handleDeleteError}
                />
              ))
            )}
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
