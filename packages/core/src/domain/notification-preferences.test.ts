import { describe, it, expect } from "vitest";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  isNotificationChannel,
  isNotificationLeadTime,
  isQuietHoursTime,
} from "./notification-preferences";

describe("notification-preferences", () => {
  // test_notification_defaults
  it("uses safe defaults", () => {
    expect(DEFAULT_NOTIFICATION_PREFERENCES).toEqual({
      enabled: false,
      leadTimeMinutes: 30,
      channel: "in-app",
      quietHours: null,
    });
  });

  it("validates the lead-time set", () => {
    expect(isNotificationLeadTime(30)).toBe(true);
    expect(isNotificationLeadTime(1440)).toBe(true);
    expect(isNotificationLeadTime(45)).toBe(false);
    expect(isNotificationLeadTime("30")).toBe(false);
  });

  it("validates the delivery channel", () => {
    expect(isNotificationChannel("in-app")).toBe(true);
    expect(isNotificationChannel("os")).toBe(true);
    expect(isNotificationChannel("both")).toBe(true);
    expect(isNotificationChannel("email")).toBe(false);
  });

  it("validates quiet-hours time format", () => {
    expect(isQuietHoursTime("22:00")).toBe(true);
    expect(isQuietHoursTime("07:30")).toBe(true);
    expect(isQuietHoursTime("00:00")).toBe(true);
    expect(isQuietHoursTime("23:59")).toBe(true);
    expect(isQuietHoursTime("24:00")).toBe(false);
    expect(isQuietHoursTime("7:30")).toBe(false);
    expect(isQuietHoursTime("22h00")).toBe(false);
    expect(isQuietHoursTime(2200)).toBe(false);
  });
});
