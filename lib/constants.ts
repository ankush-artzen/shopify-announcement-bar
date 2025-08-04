export enum AnnouncementType {
  Simple = "Simple",
  Marquee = "Marquee",
  Carousel = "Carousel",
}


export enum ButtonPosition {
  Top = "top",
  Bottom = "bottom",
  Left = "left",
  Right = "right",
}

export const announcementOptions = Object.values(AnnouncementType).map((type) => ({
  label: type,
  value: type,
}));

export const buttonPositionOptions = Object.values(ButtonPosition).map((pos) => ({
  label: pos.charAt(0).toUpperCase() + pos.slice(1),
  value: pos,
}));
export const PLAN_VIEW_LIMITS = {
  Free: 500,
  Premium: Infinity,
  Trial: 100,
  Pro: Infinity,
  Basic: 500,
} as const;

export type PlanName = keyof typeof PLAN_VIEW_LIMITS;
