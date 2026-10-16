export const getDestinationRoute = (role) => {
  switch (role) {
    case "super_admin":
      return "/super-admin/dashboard";
    case "admin":
      return "/admin/dashboard";
    case "instructor":
      return "/instructor/dashboard";
    case "student":
      return "/student/dashboard";
    default:
      return "/profile";
  }
};

export const redirectByRole = (role, navigate) => {
  navigate(getDestinationRoute(role));
};

