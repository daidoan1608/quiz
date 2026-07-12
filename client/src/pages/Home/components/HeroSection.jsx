import CatMascot from "./CatMascot";

export default function HeroSection({ t, onStart }) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-blue-600/5 via-primary/10 to-indigo-500/5 dark:from-surface-dark dark:via-primary/5 dark:to-surface-dark border border-gray-200/50 dark:border-white/5 py-12 px-6 sm:px-12 flex flex-col lg:flex-row items-center gap-10 shadow-sm">
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-400/10 dark:bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex-1 flex flex-col gap-5 text-center lg:text-left">
        <span className="inline-flex w-fit mx-auto lg:mx-0 items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          ✨ {t("home.hero.badge")}
        </span>
        <h1 className="text-gray-900 dark:text-white text-4xl sm:text-5xl font-black leading-tight tracking-tight">
          {t("home.hero.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
          {t("home.hero.slogan")}
        </p>

        <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-2">
          <button
            type="button"
            onClick={onStart}
            className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
          >
            {t("home.hero.start")}
          </button>
        </div>
      </div>

      <div className="w-full lg:w-96 flex justify-center z-10">
        <div className="w-full max-w-[400px] bg-white/70 dark:bg-surface-dark/70 backdrop-blur-md border border-white/30 dark:border-white/5 shadow-xl rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/50 pb-3">
            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              🐱
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t("home.hero.mascotName")}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {t("home.hero.mascotDescription")}
              </p>
            </div>
          </div>
          <CatMascot />
        </div>
      </div>
    </section>
  );
}
