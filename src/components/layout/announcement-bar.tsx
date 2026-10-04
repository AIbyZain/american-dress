"use client";

import { useStoreData } from "@/context/store-data-context";
import { siteConfig } from "@/config/site";

export function AnnouncementBar() {
  const { settings } = useStoreData();
  return (
    <div className="bg-ink text-[12.5px] text-ivory">
      <div className="container flex h-9 items-center justify-center gap-6 md:justify-between">
        <p className="truncate">{settings.announcement || "Free delivery on larger orders across Pakistan"}</p>
        <a href={siteConfig.phoneHref} className="hidden text-ivory/80 hover:text-ivory md:inline">
          Call the store: {siteConfig.phone}
        </a>
      </div>
    </div>
  );
}
