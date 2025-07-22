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
