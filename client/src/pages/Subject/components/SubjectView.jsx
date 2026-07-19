import React from 'react';
import { SubjectGrid } from './SubjectGrid';
import { SubjectSidebar } from './SubjectSidebar';
import { SubjectToolbar } from './SubjectToolbar';

export const SubjectView = (props) => (
  <div className="bg-background-light dark:bg-background-dark text-[#151c27] dark:text-gray-100 transition-colors duration-300">
    <main className="mx-auto grid w-full max-w-screen-2xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:px-8">
      <SubjectToolbar
        searchQuery={props.searchQuery}
        setIsMobileSidebarOpen={props.setIsMobileSidebarOpen}
        setSearchQuery={props.setSearchQuery}
        texts={props.texts}
      />
      <SubjectSidebar
        categories={props.categories}
        clearFilters={props.clearFilters}
        getCategoryName={props.getCategoryName}
        isMobileSidebarOpen={props.isMobileSidebarOpen}
        selectedCategory={props.selectedCategory}
        setIsMobileSidebarOpen={props.setIsMobileSidebarOpen}
        setSelectedCategory={props.setSelectedCategory}
        texts={props.texts}
      />
      <SubjectGrid {...props} />
    </main>
  </div>
);
