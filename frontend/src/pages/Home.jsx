export default function Home() {
  return (
    <section className="hero">
      <div className="owner-photo-wrapper">
        <img
          src="/owner.jpg"
          alt="Yu Chien Hsiao"
          className="owner-photo"
        />
      </div>
      <p className="greeting">Hello, welcome to my page</p>
      <h1>
        I&apos;m Yu Chien Hsiao,
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
