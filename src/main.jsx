import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const eras = [
  {
    marker: "1940s",
    title: "The first Avenger",
    years: "1943–1945",
    films: [
      { title: "Captain America: The First Avenger", release: "2011" },
    ],
  },
  {
    marker: "1990s",
    title: "Before the team",
    years: "1995",
    films: [{ title: "Captain Marvel", release: "2019" }],
  },
  {
    marker: "2000s",
    title: "The age of Iron Man",
    years: "2008–2012",
    films: [
      { title: "Iron Man", release: "2008" },
      { title: "Iron Man 2", release: "2010" },
      { title: "The Incredible Hulk", release: "2008" },
      { title: "Thor", release: "2011" },
      { title: "The Avengers", release: "2012" },
    ],
  },
  {
    marker: "2013—15",
    title: "After New York",
    years: "2013–2015",
    films: [
      { title: "Iron Man 3", release: "2013" },
      { title: "Thor: The Dark World", release: "2013" },
      { title: "Captain America: The Winter Soldier", release: "2014" },
      { title: "Guardians of the Galaxy", release: "2014" },
      { title: "Guardians of the Galaxy Vol. 2", release: "2017" },
      { title: "Avengers: Age of Ultron", release: "2015" },
      { title: "Ant-Man", release: "2015" },
    ],
  },
  {
    marker: "2016—17",
    title: "Fractures & new worlds",
    years: "2016–2017",
    films: [
      { title: "Captain America: Civil War", release: "2016" },
      { title: "Black Widow", release: "2021" },
      { title: "Black Panther", release: "2018" },
      { title: "Spider-Man: Homecoming", release: "2017" },
      { title: "Doctor Strange", release: "2016–17" },
      { title: "Thor: Ragnarok", release: "2017" },
      { title: "Ant-Man and the Wasp", release: "2018" },
    ],
  },
  {
    marker: "2018—23",
    title: "The Blip & beyond",
    years: "2018–2028",
    films: [
      { title: "Avengers: Infinity War", release: "2018" },
      { title: "Avengers: Endgame", release: "2018–2023" },
      { title: "Shang-Chi and the Legend of the Ten Rings", release: "2021" },
      { title: "Eternals", release: "2021" },
      { title: "Spider-Man: Far From Home", release: "2024" },
      { title: "Spider-Man: No Way Home", release: "2024" },
      {
        title: "Doctor Strange in the Multiverse of Madness",
        release: "2025",
      },
      { title: "Thor: Love and Thunder", release: "2025" },
      { title: "Black Panther: Wakanda Forever", release: "2025" },
      {
        title: "Ant-Man and the Wasp: Quantumania",
        release: "2026",
      },
      { title: "Guardians of the Galaxy Vol. 3", release: "2026" },
      { title: "The Marvels", release: "2026" },
      { title: "Captain America: Brave New World", release: "2027" },
      { title: "Thunderbolts*", release: "2027" },
      { title: "Spider-Man: Brand New Day", release: "2026" },
      { title: "Avengers: Doomsday", release: "December 18, 2026" },
    ],
    branches: [
      {
        title: "TVA branch",
        note: "events outside linear time",
        films: [{ title: "Deadpool & Wolverine", release: "2024", tag: "Multiverse" }],
        tourTarget: "branch",
      },
      {
        title: "Earth-828",
        note: "alternate universe · 1960s",
        films: [
          { title: "The Fantastic Four: First Steps", release: "2025", tag: "Earth-828" },
        ],
      },
    ],
  },
];

const filters = [
  { id: "all", label: "All paths" },
  { id: "616", label: "Earth-616" },
  { id: "branches", label: "Branches" },
];

const tourSteps = [
  {
    target: "beginning",
    title: "Start at the beginning",
    copy: "Sneha, follow the timeline downward. The stories are arranged by when they happen, starting with the earliest chapter.",
  },
  {
    target: "release",
    title: "Story time, release time",
    copy: "The era headings show when events happen in the MCU. The year in parentheses is when each movie was released.",
  },
  {
    target: "filters",
    title: "Choose your path",
    copy: "Use these filters to see the full collection, just Earth-616, or the stories that branch into other universes.",
  },
  {
    target: "branch",
    title: "A detour through the multiverse",
    copy: "These dashed paths mark stories outside the main timeline, including the TVA and the Fantastic Four's Earth-828.",
  },
];

const countdownTarget = new Date("2026-12-18T00:00:00-05:00").getTime();
const storageKey = "marvel-timeline-completed-v1";

function filmId(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");
}

const allFilms = eras.flatMap((era) => [
  ...era.films.map((film) => ({ ...film, id: filmId(film.title), tag: "Earth-616" })),
  ...(era.branches ?? []).flatMap((branch) =>
    branch.films.map((film) => ({
      ...film,
      id: filmId(film.title),
      tag: film.tag ?? "Earth-616",
    })),
  ),
]);

function readCompletedFilms() {
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return { completed: [], error: "" };

    const parsed = JSON.parse(stored);
    if (
      !Array.isArray(parsed) ||
      parsed.some((id) => typeof id !== "string")
    ) {
      throw new Error("Saved movie progress has an invalid format.");
    }

    return {
      completed: parsed.filter((id) => allFilms.some((film) => film.id === id)),
      error: "",
    };
  } catch (error) {
    console.error("Unable to load saved movie progress.", error);
    return {
      completed: [],
      error: "Saved progress could not be loaded. You can still track movies for this visit.",
    };
  }
}

function FilmCard({ film, completed, onToggle }) {
  return (
    <article
      className={`film${completed ? " film-completed" : ""}`}
      id={`film-${film.id}`}
    >
      <div className="film-title">
        {film.title}{" "}
        <span
          className="film-release"
          data-tour-target={film.title === "Captain America: The First Avenger" ? "release" : undefined}
        >
          ({film.release})
        </span>
      </div>
      <div className="film-actions">
        <span className="film-tag">{film.tag}</span>
        <button
          className="film-completion"
          type="button"
          aria-pressed={completed}
          aria-label={`Mark ${film.title} as ${completed ? "not completed" : "completed"}`}
          onClick={() => onToggle(film.id)}
        >
          {completed ? "Completed ✓" : "Mark complete"}
        </button>
      </div>
    </article>
  );
}

function Countdown() {
  const [remaining, setRemaining] = useState(() => countdownTarget - Date.now());

  useEffect(() => {
    const interval = window.setInterval(
      () => setRemaining(countdownTarget - Date.now()),
      60_000,
    );
    return () => window.clearInterval(interval);
  }, []);

  if (remaining <= 0) {
    return <p className="doomsday-countdown">Avengers: Doomsday · now showing</p>;
  }

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  return (
    <p className="doomsday-countdown" aria-label={`Avengers: Doomsday in ${days} days and ${hours} hours`}>
      <span className="countdown-label">Doomsday</span>
      <span>{days}d {hours}h</span>
    </p>
  );
}

function App() {
  const initialProgress = useMemo(readCompletedFilms, []);
  const [completed, setCompleted] = useState(() => new Set(initialProgress.completed));
  const [storageError, setStorageError] = useState(initialProgress.error);
  const [activeFilter, setActiveFilter] = useState("all");
  const [tourOpen, setTourOpen] = useState(false);
  const [activeTourStep, setActiveTourStep] = useState(0);
  const startTourRef = useRef(null);

  const nextFilm = allFilms.find((film) => !completed.has(film.id));
  const visibleFilms = allFilms.filter((film) => {
    if (activeFilter === "616") return film.tag === "Earth-616";
    if (activeFilter === "branches") return film.tag !== "Earth-616";
    return true;
  });

  useEffect(() => {
    if (storageError) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify([...completed]));
    } catch (error) {
      console.error("Unable to save movie progress.", error);
      setStorageError("Progress could not be saved in this browser. It will be kept for this visit only.");
    }
  }, [completed, storageError]);

  useEffect(() => {
    if (!tourOpen) return undefined;
    const targetName = tourSteps[activeTourStep].target;
    const target = document.querySelector(`[data-tour-target="${targetName}"]`);
    if (!target) return undefined;

    target.classList.add("tour-highlight");
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    });
    return () => target.classList.remove("tour-highlight");
  }, [tourOpen, activeTourStep]);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape" && tourOpen) closeTour();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [tourOpen]);

  function toggleFilm(id) {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function closeTour() {
    setTourOpen(false);
    startTourRef.current?.focus({ preventScroll: true });
  }

  function findNextFilm() {
    if (!nextFilm) return;
    setActiveFilter("all");
    window.requestAnimationFrame(() => {
      document.getElementById(`film-${nextFilm.id}`)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
      });
    });
  }

  return (
    <>
      <header className="masthead">
        <div className="topline">
          <div className="brand"><b>MARVEL</b> STUDIOS / FIELD GUIDE</div>
          <div className="topline-meta">
            <span>Earth-616 · Story order</span>
            <Countdown />
          </div>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">A living timeline · 2008—2026</p>
          <h1>Sneha, your story<br />starts here.</h1>
          <p className="hero-note">Welcome to the MCU timeline. Akhil will guide you through the stories, the eras, and a few alternate paths.</p>
          <button
            className="tour-start"
            ref={startTourRef}
            type="button"
            aria-expanded={tourOpen}
            aria-controls="tour-panel"
            onClick={() => {
              setActiveFilter("all");
              setActiveTourStep(0);
              setTourOpen(true);
              window.requestAnimationFrame(() => {
                document.getElementById("tour-next")?.focus({ preventScroll: true });
              });
            }}
          >
            Start Akhil&apos;s tour
          </button>
        </div>
      </header>

      <main className="page-main">
        <section className="toolbar" aria-label="Timeline controls">
          <div className="toolbar-label">
            <strong>{visibleFilms.length} {visibleFilms.length === 1 ? "film" : "films"}</strong>
            <span> · story chronology</span>
          </div>
          <div className="filters" role="group" aria-label="Filter timeline" data-tour-target="filters">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <section className="next-film" aria-live="polite">
          <div>
            <p className="next-film-label">Your next movie</p>
            {nextFilm ? (
              <>
                <h2>{nextFilm.title}</h2>
                <p>{completed.size} of {allFilms.length} movies completed</p>
              </>
            ) : (
              <>
                <h2>You&apos;ve seen them all.</h2>
                <p>Your MCU story is complete. Time for a rewatch?</p>
              </>
            )}
          </div>
          {nextFilm && (
            <button type="button" className="next-film-button" onClick={findNextFilm}>
              Find it in the timeline
            </button>
          )}
        </section>
        {storageError && <p className="storage-notice" role="status">{storageError}</p>}

        <section className="timeline" aria-label="Marvel movie story timeline">
          {eras.map((era, eraIndex) => {
            const mainFilms = era.films.map((film) => ({
              ...film,
              id: filmId(film.title),
              tag: "Earth-616",
            }));
            const visibleMain = activeFilter !== "branches";
            const visibleBranches = activeFilter !== "616";
            const hasVisibleFilms =
              (visibleMain && mainFilms.length > 0) ||
              (visibleBranches && (era.branches?.length ?? 0) > 0);
            if (!hasVisibleFilms) return null;

            return (
              <section
                className="era"
                key={era.title}
                data-tour-target={eraIndex === 0 ? "beginning" : undefined}
              >
                <div className="era-marker">{era.marker}</div>
                <div className="era-content">
                  {visibleMain && (
                    <>
                      <h2 className="era-heading">{era.title} <span>{era.years}</span></h2>
                      <div className="film-list">
                        {mainFilms.map((film) => (
                          <FilmCard
                            key={film.id}
                            film={film}
                            completed={completed.has(film.id)}
                            onToggle={toggleFilm}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {visibleBranches && era.branches?.map((branch) => (
                    <div
                      className="branch"
                      key={branch.title}
                      data-tour-target={branch.tourTarget}
                    >
                      <h3 className="branch-heading">{branch.title} <span>{branch.note}</span></h3>
                      <div className="film-list">
                        {branch.films.map((film) => {
                          const entry = {
                            ...film,
                            id: filmId(film.title),
                            tag: film.tag ?? "Earth-616",
                          };
                          return (
                            <FilmCard
                              key={entry.id}
                              film={entry}
                              completed={completed.has(entry.id)}
                              onToggle={toggleFilm}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </section>

        <p className="footnote"><b>Timeline note</b> Story years follow on-screen dialogue and Marvel’s published chronology where available. Some overlapping events are approximate; the two multiverse stories sit off the Earth-616 trunk.</p>
      </main>

      <footer>
        <div className="footer-inner"><span>MARVEL CINEMATIC UNIVERSE · FEATURE FILMS</span><span>Chronology through 2026</span></div>
      </footer>

      {tourOpen && (
        <aside className="tour-panel" id="tour-panel" aria-label="Akhil's guided tour for Sneha">
          <div className="tour-panel-top">
            <p className="tour-label">Akhil&apos;s guide for Sneha</p>
            <button className="tour-close" type="button" onClick={closeTour}>Close tour</button>
          </div>
          <div aria-live="polite" aria-atomic="true">
            <p className="tour-step-count">Step {activeTourStep + 1} of {tourSteps.length}</p>
            <h2 className="tour-title">{tourSteps[activeTourStep].title}</h2>
            <p className="tour-copy">{tourSteps[activeTourStep].copy}</p>
          </div>
          <div className="tour-controls">
            <button
              type="button"
              disabled={activeTourStep === 0}
              onClick={() => setActiveTourStep((step) => Math.max(0, step - 1))}
            >
              Back
            </button>
            <button
              id="tour-next"
              type="button"
              onClick={() => {
                if (activeTourStep === tourSteps.length - 1) closeTour();
                else setActiveTourStep((step) => step + 1);
              }}
            >
              {activeTourStep === tourSteps.length - 1 ? "Finish tour" : "Next"}
            </button>
          </div>
        </aside>
      )}
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
