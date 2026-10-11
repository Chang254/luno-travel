"use client";

import type { ReactNode } from "react";

import LunoLogo from "@/components/LunoLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
