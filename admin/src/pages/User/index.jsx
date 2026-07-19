import React from "react";
import { UserManagerView } from "./components/UserManagerView";
import { useUserManager } from "./hooks/useUserManager";

export default function UserManager() {
  const userManager = useUserManager();
  return <UserManagerView {...userManager} />;
}
