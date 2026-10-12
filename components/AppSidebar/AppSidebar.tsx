"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import LunoLogo from "@/components/LunoLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { styles } from "./AppSidebar.styles";
import TripsMenu from "./TripsMenu";

interface AppSidebarProps {
  footer: ReactNode;
}

export default function AppSidebar({ footer }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className={styles.header}>
          <span className={styles.logoWrapper}>
            <LunoLogo size="lg" />
          </span>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Trips</SidebarGroupLabel>
          <SidebarGroupAction asChild title="New trip">
            <Link href="/trips/new" aria-label="New trip">
              <Plus />
            </Link>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              <TripsMenu />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className={styles.account}>{footer}</div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
