import { Suspense } from "react";
import RolesPage from "@admin-panel/owner-admin-moderator/roles-page";

export default function OwnerAdminModeratorPage() {
  return (
    <Suspense>
      <RolesPage />
    </Suspense>
  );
}
