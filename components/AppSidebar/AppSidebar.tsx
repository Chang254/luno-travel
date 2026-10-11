"use client";

import { LunoLogo } from "@/components/LunoLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { styles } from "./AppSidebar.styles";

const PLACEHOLDER_ITEMS = ["Trips", "Entries", "Media"];

export default function AppSidebar() {
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
              {PLACEHOLDER_ITEMS.map((item) => (
                <SidebarMenuItem key={item}>
                  <SidebarMenuButton disabled tooltip={item}>
                    <span>{item}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <span className={styles.footerText}>Account placeholder</span>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
