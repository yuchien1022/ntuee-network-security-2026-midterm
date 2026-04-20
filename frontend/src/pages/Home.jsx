import { useEffect, useState } from "react";
import services from "../services";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export default function Home() {
  const [owner, setOwner] = useState(null);

  useEffect(() => {
    services.user.getOwner().then(setOwner).catch(() => setOwner(null));
  }, []);

  const ownerName = owner?.username ?? "Site Owner";

  return (
    <section className="hero">
      <div className="owner-photo-wrapper">
        {owner?.avatarUrl ? (
          <img
            src={`${API_BASE}${owner.avatarUrl}`}
            alt={ownerName}
            className="owner-photo"
          />
        ) : (
          <img
            src="/owner.jpg"
            alt={ownerName}
            className="owner-photo"
          />
        )}
      </div>
      <p className="greeting">Hello, welcome to my page</p>
      <h1>
        I&apos;m {ownerName},
        <br />a Graduate Student at National Taiwan University.
      </h1>
      <p className="subtitle">
        This is my personal site for the Practicum of Attack and Defense of
        Network Security course.
      </p>
      <div className="scroll-hint">
        <span>Explore</span>
        <div className="line"></div>
      </div>
    </section>
  );
}
