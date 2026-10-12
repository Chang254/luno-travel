"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useTrips } from "@/lib/api/trips";
import TripLink from "./TripLink";
import { styles } from "./TripsMenu.styles";

export default function TripsMenu() {
  const { data: trips, isPending, isError } = useTrips();
  const pathname = usePathname();

  if (isPending) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton disabled tooltip="Trips">
          <span>Loading trips…</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (isError) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton disabled tooltip="Trips">
          <span className={styles.error}>Couldn&apos;t load trips</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (trips.length === 0) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton disabled tooltip="Trips">
          <span>No trips yet</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <>
      {trips.map((trip) => {
        const href = `/editor/${trip.id}`;

        return (
          <SidebarMenuItem key={trip.id}>
            <SidebarMenuButton asChild isActive={pathname === href} tooltip={trip.title}>
              <Link href={href}>
                <TripLink title={trip.title} />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </>
  );
}
