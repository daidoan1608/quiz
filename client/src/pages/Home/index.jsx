import React from 'react';
import { HomeView } from './components/HomeView';
import { useHomePage } from './hooks/useHomePage';

export default function Home() {
  const homePage = useHomePage();

  return <HomeView {...homePage} />;
}
