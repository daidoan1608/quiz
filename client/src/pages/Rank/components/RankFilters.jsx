import React from 'react';
import { TIME_FILTER_OPTIONS } from '../constants/rankFilters';
import { RankSelect } from './RankSelect';

export const RankFilters = ({
  criteriaOptions,
  filterCriteria,
  openSelect,
  selectedSubject,
  setFilterCriteria,
  setOpenSelect,
  setSelectedSubject,
  setTimeFilter,
  subjectSelectOptions,
  texts,
  timeFilter,
}) => (
  <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-lg shadow-gray-100/70 dark:shadow-black/10 sticky top-24">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        {texts.rankingFilter || 'Lọc Bảng Xếp Hạng'}
      </h3>
      <div className="space-y-6">
        <div>
          <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
            {texts.timeFilter || 'Thời gian'}
          </p>
          <div className="flex gap-2 flex-wrap">
            {TIME_FILTER_OPTIONS.map((item) => (
              <button
                key={item.id}
                onClick={() => setTimeFilter(item.id)}
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 text-sm font-semibold transition-all duration-200 border
                  ${
                    timeFilter === item.id
                      ? 'bg-primary text-white shadow-md shadow-primary/20 border-primary scale-[1.02]'
                      : 'bg-gray-50 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-600 hover:bg-primary/10 hover:text-primary hover:border-primary/30'
                  }
                `}
              >
                {texts[item.textKey] || item.fallback}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="flex flex-col w-full">
            <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
              {texts.rankingCriteria || 'Tiêu chí xếp hạng'}
            </p>
            <RankSelect
              id="criteria"
              value={filterCriteria}
              options={criteriaOptions}
              onChange={setFilterCriteria}
              openSelect={openSelect}
              setOpenSelect={setOpenSelect}
            />
          </label>
        </div>

        <div>
          <label className="flex flex-col w-full">
            <p className="text-gray-800 dark:text-gray-200 text-base font-medium leading-normal pb-2">
              {texts.subject || 'Môn học'}
            </p>
            <RankSelect
              id="subject"
              value={selectedSubject}
              options={subjectSelectOptions}
              onChange={setSelectedSubject}
              openSelect={openSelect}
              setOpenSelect={setOpenSelect}
            />
          </label>
        </div>
      </div>
    </div>
  </aside>
);
