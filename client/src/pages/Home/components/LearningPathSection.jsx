import { LEARNING_ICON_PATHS, LEARNING_PATH_STEPS } from 'pages/Home/constants';
import SvgIcon from './SvgIcon';

export default function LearningPathSection({ t }) {
  return (
    <section className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-[2px]">
        <span className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-4 py-2 rounded-full font-bold text-xs sm:text-sm shadow-lg transform -rotate-2">
          {t('home.learningPath.comingSoon')}
        </span>
      </div>

      <div className="opacity-40 pointer-events-none select-none grayscale">
        <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3 text-gray-900 dark:text-white">
          {t('home.learningPath.title')}
        </h2>
        <div className="grid grid-cols-[40px_1fr] gap-x-2 pt-2">
          {LEARNING_PATH_STEPS.map((step, index) => (
            <LearningPathStep
              key={step.title}
              step={step}
              isFirst={index === 0}
              isLast={index === LEARNING_PATH_STEPS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function LearningPathStep({ step, isFirst, isLast }) {
  const iconColor = step.muted ? 'text-gray-400' : 'text-blue-600';

  return (
    <>
      <div
        className={`flex flex-col items-center gap-1 ${isFirst ? 'pt-3' : ''} ${isLast ? 'pb-3' : ''}`}
      >
        {!isFirst && <PathConnector />}
        <div className={iconColor}>
          <SvgIcon path={LEARNING_ICON_PATHS[step.icon]} />
        </div>
        {!isLast && <PathConnector />}
      </div>
      <div
        className={`flex flex-1 flex-col py-3 ${step.muted ? 'opacity-60' : ''}`}
      >
        <p className="text-base font-medium text-gray-900 dark:text-white">
          {step.title}
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {step.description}
        </p>
      </div>
    </>
  );
}

function PathConnector() {
  return <div className="w-[1.5px] bg-blue-200 dark:bg-blue-900 h-full" />;
}
