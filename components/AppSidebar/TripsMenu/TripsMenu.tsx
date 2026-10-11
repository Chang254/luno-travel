"use client";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useTrips } from "@/lib/api/trips";
import { styles } from "./TripsMenu.styles";

export default function TripsMenu() {
  const { data: trips, isPending, isError } = useTrips();

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
      {trips.map((trip) => (
        <SidebarMenuItem key={trip.id}>
          <SidebarMenuButton tooltip={trip.title}>
            <span>{trip.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}
