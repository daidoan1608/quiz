import React from "react";
import { CategoryManagerView } from "./components/CategoryManagerView";
import { useCategoryManager } from "./hooks/useCategoryManager";

export default function CategoryManager() {
  const categoryManager = useCategoryManager();
  return <CategoryManagerView {...categoryManager} />;
}
