import { page, pageInner } from "@/lib/ui.js";
import { useRouter } from "next/navigation";
import useAuthStore from "@/features/auth/store.js";
import AmbientBackground from "@/components/layout/AmbientBackground.jsx";
import MainLandmark from "@/components/layout/MainLandmark.jsx";
import { ROLE_THEME, DEFAULT_THEME, DASHBOARD_MAP } from "./Profile/constants.js";
import ProfileHeader from "./Profile/components/ProfileHeader.jsx";
import ProfileCard from "./Profile/components/ProfileCard.jsx";
import AccountDetailsCard from "./Profile/components/AccountDetailsCard.jsx";
import AccessDenied from "./Profile/components/AccessDenied.jsx";

function Profile() {
  const { user } = useAuthStore();
  const router = useRouter();

  const theme = user ? (ROLE_THEME[user.role] ?? DEFAULT_THEME) : DEFAULT_THEME;
  const RoleIcon = theme.Icon;
  const dashboardLink = user ? (DASHBOARD_MAP[user.role] ?? "/") : "/";

  const handleChangePassword = () => {
    if (user) router.push("/forgot-password");
  };

  return (
    <div className={page}>
      <AmbientBackground />
      <MainLandmark className={pageInner}>
        {user ? (
          <>
            <ProfileHeader RoleIcon={RoleIcon} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-1">
                <ProfileCard user={user} theme={theme} RoleIcon={RoleIcon} />
              </div>
              <div className="lg:col-span-2">
                <AccountDetailsCard
                  user={user}
                  theme={theme}
                  RoleIcon={RoleIcon}
                  dashboardLink={dashboardLink}
                  onChangePassword={handleChangePassword}
                />
              </div>
            </div>
          </>
        ) : (
          <AccessDenied />
        )}
      </MainLandmark>
    </div>
  );
}

export default Profile;
