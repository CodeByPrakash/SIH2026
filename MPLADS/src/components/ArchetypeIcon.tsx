import React from "react";
import {
  IconCircleCheck,
  IconCurrencyRupee,
  IconClockHour4,
  IconMapPin,
  IconGhost,
  IconBuilding,
  IconCreditCard,
  IconSearch,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ArchetypeIconProps {
  archetype: string;
  className?: string;
}

export function ArchetypeIcon({ archetype, className = "size-4" }: ArchetypeIconProps) {
  switch (archetype) {
    case "clean":
      return <IconCircleCheck className={cn("text-emerald-500 shrink-0", className)} />;
    case "cost_anomaly":
      return <IconCurrencyRupee className={cn("text-amber-500 shrink-0", className)} />;
    case "delay_anomaly":
      return <IconClockHour4 className={cn("text-blue-500 shrink-0", className)} />;
    case "duplicate_work":
      return <IconMapPin className={cn("text-purple-500 shrink-0", className)} />;
    case "ghost_asset":
      return <IconGhost className={cn("text-rose-500 shrink-0", className)} />;
    case "vendor_anomaly":
      return <IconBuilding className={cn("text-orange-500 shrink-0", className)} />;
    case "payment_anomaly":
      return <IconCreditCard className={cn("text-indigo-500 shrink-0", className)} />;
    default:
      return <IconSearch className={cn("text-muted-foreground shrink-0", className)} />;
  }
}

export default ArchetypeIcon;
