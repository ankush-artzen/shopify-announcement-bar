"use client";

import React from "react";

interface TimerVals {
  [unit: string]: string | number;
}

type AnnouncementType = "Simple" | "Marquee" | "Carousel";
type ButtonPosition = "left" | "center" | "right"; // Adjust if you use custom positions

interface Settings {
  announcementType: AnnouncementType;
  title: string;
  messages: string[];
  showTimer: boolean;
  bgColor: string;
  textColor: string;
  showButton: boolean;
  enableButtonLink: boolean;
  buttonUrl: string;
  buttonLabel: string;
  buttonPosition: ButtonPosition;
  marqueeSpeed: number;
}

interface BannerPreviewProps {
  settings: Settings;
  timerVals: TimerVals;
  expired: boolean;
}

const BannerPreview: React.FC<BannerPreviewProps> = ({ settings, timerVals, expired }) => {
  const {
    announcementType,
    title,
    messages =[],
    showTimer,
    bgColor,
    textColor,
    showButton,
    enableButtonLink,
    buttonUrl,
    buttonLabel,
    buttonPosition,
    marqueeSpeed,
  } = settings;

  return (
    <div
      className={`countdown-timer w-full sticky top-0 z-30 btn-${buttonPosition} countdown-${announcementType.toLowerCase()} p-4 shadow-md border-t border-b`}
      style={{ background: bgColor, color: textColor }}
    >
      {announcementType === "Simple" && (
        <>
          <h4 className="text-lg font-semibold">{title}</h4>

          {showButton && (
            <div className="btn-wrapper text-center mt-2">
              {enableButtonLink ? (
                <a
                  href={buttonUrl || ""}
                  style={{
                    backgroundColor: textColor,
                    color: bgColor,
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontWeight: "500",
                    textDecoration: "none",
                    border: `1px solid ${textColor}`,
                  }}
                >
                  {buttonLabel}
                </a>
              ) : (
                <button
                  style={{
                    backgroundColor: textColor,
                    color: bgColor,
                    border: `1px solid ${textColor}`,
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontWeight: "500",
                  }}
                >
                  {buttonLabel}
                </button>
              )}
            </div>
          )}

          {showTimer && !expired && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              {Object.entries(timerVals).map(([unit, val]) => (
                <div
                  key={unit}
                  className="flex flex-col items-center bg-white bg-opacity-20 backdrop-blur-md px-2.5 py-1.5 rounded border border-white text-[10px] min-w-[52px]"
                >
                  <span className="text-lg font-bold">{val}</span>
                  <span className="uppercase font-semibold text-[9px]">{unit}</span>
                </div>
              ))}
            </div>
          )}

          {showTimer && expired && (
            <div className="mt-2 text-center text-red-600 font-semibold text-sm">
              ⏰ This offer has expired!
            </div>
          )}
        </>
      )}

      {announcementType === "Marquee" && (
        <div className="marquee-wrapper overflow-hidden whitespace-nowrap">
          <div
            className="marquee-track animate-marquee"
            style={{ animationDuration: `${marqueeSpeed}s` }}
          >
            {Array.from({ length: 30 }).map((_, i) => (
              <span key={i} className="marquee-content inline-block mx-4">
                {messages[i % messages.length]}
              </span>
            ))}
          </div>
        </div>
      )}

      {announcementType === "Carousel" && (
        <div className="carousel-wrapper overflow-hidden">
          <div className="carousel-track flex transition-transform duration-500">
            {messages.map((msg, i) => (
              <div className="carousel-slide min-w-full text-center" key={i}>
                {msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerPreview;
