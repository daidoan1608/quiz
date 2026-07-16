import CatMascot from './CatMascot';

export default function HeroSection({ t, onStart }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-white via-primary/10 to-blue-100/80 px-6 py-12 shadow-2xl shadow-blue-900/10 ring-1 ring-primary/10 dark:border-white/10 dark:from-gray-900 dark:via-primary/10 dark:to-slate-900 dark:shadow-black/40 sm:px-12 flex flex-col lg:flex-row items-center gap-10">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/0 via-primary/70 to-primary/0 pointer-events-none" />
      <div className="absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 right-1/4 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl pointer-events-none dark:bg-indigo-500/20" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.55),transparent_42%,rgba(255,255,255,0.25))] pointer-events-none dark:bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_42%,rgba(255,255,255,0.03))]" />

      <div className="relative z-10 flex-1 flex flex-col gap-5 text-center lg:text-left">
        <span className="inline-flex w-fit mx-auto lg:mx-0 items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          ✨ {t('home.hero.badge')}
        </span>
        <h1 className="text-gray-900 dark:text-white text-4xl sm:text-5xl font-black leading-tight tracking-tight">
          {t('home.hero.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed">
          {t('home.hero.slogan')}
        </p>

        <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-2">
          <button
            type="button"
            onClick={onStart}
            className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
          >
            {t('home.hero.start')}
          </button>
        </div>
      </div>

      <div className="relative z-10 w-full lg:w-96 flex justify-center">
        <div className="w-full max-w-[400px] bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border border-white/70 dark:border-white/10 shadow-2xl shadow-blue-900/10 dark:shadow-black/30 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700/50 pb-3">
            <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              🐱
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {t('home.hero.mascotName')}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {t('home.hero.mascotDescription')}
              </p>
            </div>
          </div>
          <CatMascot />
        </div>
      </div>
    </section>
  );
}
