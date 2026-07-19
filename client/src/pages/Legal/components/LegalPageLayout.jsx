import React from 'react';

export const LegalPageLayout = ({
  contactText,
  intro,
  sections,
  title,
}) => (
  <main className="flex flex-1 justify-center px-4 py-10">
    <div className="w-full max-w-4xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          QuizVNUA
        </p>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-6 text-gray-500 dark:text-gray-400">
          Cập nhật lần cuối: {new Date().getFullYear()}. {intro}
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <section
            key={section.title}
            className="rounded-xl bg-gray-50 p-5 dark:bg-gray-800/60"
          >
            <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
              {section.title}
            </h2>
            <p className="text-sm leading-7 text-gray-600 dark:text-gray-300">
              {section.content}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-sm font-medium leading-7 text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-900/40 dark:text-emerald-50">
        {contactText}
      </div>
    </div>
  </main>
);
