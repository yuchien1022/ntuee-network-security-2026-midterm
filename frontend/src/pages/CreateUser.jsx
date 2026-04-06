import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import services from "../services";

export default function CreateUser() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: "error", text: "Please enter a name." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const user = await services.user.createOne({ name: name.trim() });
      setMessage({
        type: "success",
        text: `User "${user.name}" created successfully!`,
      });
      setName("");
      setTimeout(() => navigate("/users"), 1200);
    } catch (err) {
      const errMsg =
        err.response?.data?.error || "Something went wrong. Please try again.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <section>
        <FadeIn>
          <h2>Create User</h2>
          <div className="form-section">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter a name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-filled"
                  disabled={submitting}
                >
                  {submitting ? "Creating..." : "Create"}
                </button>
              </div>
            </form>

            {message && (
              <div className={`form-message ${message.type}`}>
                {message.text}
              </div>
            )}
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
