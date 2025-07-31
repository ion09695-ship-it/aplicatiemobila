import { Button } from "@/components/ui/button";
import { Bed, Plane, Map, Camera, CloudSun } from "lucide-react";

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  const actions = [
    {
      label: "Find Hotels",
      action: "Find hotels",
      icon: Bed,
      color: "bg-blue-100 hover:bg-blue-200 text-blue-700"
    },
    {
      label: "Search Flights",
      action: "Search flights",
      icon: Plane,
      color: "bg-green-100 hover:bg-green-200 text-green-700"
    },
    {
      label: "Plan Itinerary",
      action: "Plan itinerary",
      icon: Map,
      color: "bg-purple-100 hover:bg-purple-200 text-purple-700"
    },
    {
      label: "Find Activities",
      action: "Find activities",
      icon: Camera,
      color: "bg-orange-100 hover:bg-orange-200 text-orange-700"
    },
    {
      label: "Weather Info",
      action: "Weather info",
      icon: CloudSun,
      color: "bg-red-100 hover:bg-red-200 text-red-700"
    }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((actionItem) => {
        const Icon = actionItem.icon;
        return (
          <Button
            key={actionItem.action}
            onClick={() => onActionClick(actionItem.action)}
            variant="outline"
            size="sm"
            className={`${actionItem.color} border-0 font-medium transition-colors`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {actionItem.label}
          </Button>
        );
      })}
    </div>
  );
}
