import React from 'react';
import { PageContainer } from 'components/common/PageContainer';
import { SubjectGrid } from './SubjectGrid';
import { SubjectSidebar } from './SubjectSidebar';
import { SubjectToolbar } from './SubjectToolbar';

export const SubjectView = (props) => (
  <div className="bg-background-light dark:bg-background-dark text-[#151c27] dark:text-gray-100 transition-colors duration-300">
    <PageContainer className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
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
    </PageContainer>
  </div>
);
