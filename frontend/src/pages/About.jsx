import { useEffect } from "react";
import FadeIn from "../components/FadeIn";

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="page-wrapper">
      {/* About Section */}
      <section>
        <FadeIn>
          <h2>About Me</h2>
          <div className="about-content">
            <p>
              Hey there! I'm Yu Chien Hsiao, from Taoyuan, Taiwan. I'm currently
              pursuing my master's degree in cybersecurity in the Department of
              Electrical Engineering at National Taiwan University. Outside of
              school, I'm a big fan of K-pop, especially Taeyeon from Girls'
              Generation and MAMAMOO. I love going to concerts whenever I get the
              chance because there's nothing quite like the energy of a live
              performance. I also enjoy singing, and karaoke with friends is one
              of my favorite ways to relax. In my free time, I like watching MLB
              games and exploring good food around Taipei. I'm always happy to
              hear restaurant recommendations if you have any.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* Interests Section */}
      <section>
        <FadeIn>
          <h2>Interests</h2>
          <div className="cards">
            <div className="card">
              <div className="icon">&#127908;</div>
              <h3>K-pop &amp; Concerts</h3>
              <p>
                I'm a big fan of Taeyeon and MAMAMOO. Whenever I get the chance,
                I go to their concerts because their live performances are always
                exciting and unforgettable.
              </p>
            </div>
            <div className="card">
              <div className="icon">&#127925;</div>
              <h3>Singing</h3>
              <p>
                I really enjoy singing, and going to karaoke with friends is one
                of my favorite ways to relax.
              </p>
            </div>
            <div className="card">
              <div className="icon">&#9918;</div>
              <h3>MLB Baseball</h3>
              <p>
                Nothing beats a good baseball game. I love following the MLB
                season and watching highlights when I can't catch it live. I'm
                also a fan of Shohei Ohtani. The way he can both pitch and hit
                at such a high level is just incredible.
              </p>
            </div>
            <div className="card">
              <div className="icon">&#127837;</div>
              <h3>Food Explorer</h3>
              <p>
                I really enjoy trying new food and exploring different
                restaurants. Finding a place that's actually worth going back to
                is always exciting.
              </p>
            </div>
          </div>
        </FadeIn>
      </section>

    </div>
  );
}
