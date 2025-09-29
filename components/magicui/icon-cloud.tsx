"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import {
  fetchSimpleIcons,
  ICloud,
  renderSimpleIcon,
  SimpleIcon,
} from "react-icon-cloud";

import { sanitizeSlug } from "@/lib/utils";

// Dynamically import Cloud with no SSR to avoid hydration issues
const Cloud = dynamic(() => import("react-icon-cloud").then(mod => mod.Cloud), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center w-full h-40">Loading icons...</div>
});

export const cloudProps: Omit<ICloud, "children"> = {
  containerProps: {
    style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      paddingTop: 40,
    },
  },
  options: {
    reverse: true,
    depth: 1,
    wheelZoom: false,
    imageScale: 2,
    activeCursor: "pointer",
    tooltip: "native",
    initial: [0.05, -0.05],
    clickToFront: 700,
    tooltipDelay: 0,
    outlineColour: "#0000",
    maxSpeed: 0.02,
    minSpeed: 0.01,
  },
};

export const renderCustomIcon = (
  icon: SimpleIcon,
  theme: string,
  liveLinks: boolean
) => {
  const bgHex = theme === "light" ? "#f3f2ef" : "#080510";
  const fallbackHex = theme === "light" ? "#6e6e73" : "#ffffff";
  const minContrastRatio = theme === "dark" ? 2 : 1.2;

  return renderSimpleIcon({
    icon,
    bgHex,
    fallbackHex,
    minContrastRatio,
    size: 42,
    aProps: liveLinks
      ? {
          href: `${process.env.NEXT_PUBLIC_PORTFOLIO_URL}/tags/${sanitizeSlug(
            icon.slug
          )}`,
          target: "",
          rel: "noopener noreferrer",
        }
      : {
          href: `${process.env.NEXT_PUBLIC_PORTFOLIO_URL}/tags/${sanitizeSlug(
            icon.slug
          )}`,
          target: undefined,
          rel: undefined,
          onClick: (e: any) => e.preventDefault(),
          style: { cursor: "pointer" },
        },
  });
};

export type DynamicCloudProps = {
  iconSlugs: string[];
  liveLinks?: boolean;
};

type IconData = Awaited<ReturnType<typeof fetchSimpleIcons>>;

export default function IconCloud({
  iconSlugs,
  liveLinks = true,
}: DynamicCloudProps) {
  const [data, setData] = useState<IconData | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    fetchSimpleIcons({ slugs: iconSlugs })
      .then((result) => {
        // Filter out any icons that failed to load
        const filteredData = {
          ...result,
          simpleIcons: Object.fromEntries(
            Object.entries(result.simpleIcons).filter(([slug, icon]) => {
              if (!icon) {
                console.warn(`Icon "${slug}" failed to load from simple-icons`);
                return false;
              }
              return true;
            })
          )
        };
        setData(filteredData);
      })
      .catch((error) => {
        console.error('Failed to fetch simple icons:', error);
        setData(null);
      });
  }, [iconSlugs]);

  const renderedIcons = useMemo(() => {
    if (!data) return null;

    return Object.values(data.simpleIcons).map((icon) =>
      renderCustomIcon(icon, theme || "light", liveLinks)
    );
  }, [data, theme, liveLinks]);

  return (
    // @ts-ignore
    <Cloud {...cloudProps}>
      <>{renderedIcons}</>
    </Cloud>
  );
}
