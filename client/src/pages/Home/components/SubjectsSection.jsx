import { SUBJECT_ICON_PATHS } from "pages/Home/constants";
import SvgIcon from "./SvgIcon";

export default function SubjectsSection({ subjects, t, onSelectSubject }) {
  return (
    <section>
      <div className="flex items-center justify-between px-2 pb-5 pt-2">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          {t("home.subjectsTitle")}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.length > 0 ? (
          subjects.map((subject, index) => (
            <SubjectCard
              key={subject.subjectId || subject.name || index}
              subject={subject}
              iconPath={SUBJECT_ICON_PATHS[index % SUBJECT_ICON_PATHS.length]}
              t={t}
              onClick={() => onSelectSubject(subject.subjectId)}
            />
          ))
        ) : (
          <EmptySubjectsMessage t={t} />
        )}
      </div>
    </section>
  );
}

function SubjectCard({ subject, iconPath, t, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left flex flex-col gap-4 rounded-2xl p-6 bg-white dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700/50 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
    >
      <div className="flex items-center justify-center size-12 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
        <SvgIcon path={iconPath} />
      </div>
      <div className="flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-primary transition-colors leading-snug mb-1">
          {subject.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {t("home.questionCount", { count: subject.totalQuestions })}
        </p>
      </div>
    </button>
  );
}

function EmptySubjectsMessage({ t }) {
  return (
    <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
      {t("home.noSubjects")}
    </div>
  );
}
