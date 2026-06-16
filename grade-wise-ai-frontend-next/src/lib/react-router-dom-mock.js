"use client";

import React, { useEffect } from "react";
import NextLink from "next/link";
import { useRouter, usePathname, useParams as useNextParams, useSearchParams as useNextSearchParams } from "next/navigation";

export const Link = React.forwardRef(({ to, children, ...props }, ref) => {
  return (
    <NextLink href={to || "#"} ref={ref} {...props}>
      {children}
    </NextLink>
  );
});

Link.displayName = "Link";

export const useNavigate = () => {
  const router = useRouter();
  return (to, options) => {
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
};

export const useParams = () => {
  return useNextParams() || {};
};

export const useLocation = () => {
  const pathname = usePathname();
  return { pathname };
};

export const useSearchParams = () => {
  const params = useNextSearchParams();
  return [params];
};

export const Navigate = ({ to, replace }) => {
  const router = useRouter();
  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [to, replace, router]);
  return null;
};
export default {
  Link,
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
  Navigate
};
