
export type AnnouncementType = "Simple" | "Marquee" | "Carousel";
export type ButtonPosition = "top" | "bottom" | "left" | "right"; 

export interface Settings {
  title: string;
  announcementType: AnnouncementType;
  messages: string[];
  showTimer: boolean;
  endDate: string;
  bgColor: string;
  textColor: string;
  showButton: boolean;
  enableButtonLink: boolean;
  buttonLabel: string;
  buttonUrl: string;
  buttonPosition: ButtonPosition;
  marqueeSpeed: number;
  enableViewLimit?: boolean;
  maxViews?: number;
  enableViewCount?: boolean;
}
