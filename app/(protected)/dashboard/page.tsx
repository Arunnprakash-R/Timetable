"use client";

import { useEffect, useMemo, useState } from "react";
import { differenceInMinutes } from "date-fns";
import { Clock3, CalendarClock, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClassCard } from "@/components/class-card";
import { useUser } from "@/hooks/useUser";
import { useTimetable } from "@/hooks/useTimetable";
import { useNotifications } from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";

function getDayIndex(date: Date) {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getScheduledDate(reference: Date, dayOfWeek: number, time: string) {
  const scheduledAt = new Date(reference);
  const currentDay = getDayIndex(reference);
  const dayDifference = (dayOfWeek - currentDay + 7) % 7;
  const [hours, minutes] = time.split(":").map(Number);

  scheduledAt.setDate(scheduledAt.getDate() + dayDifference);
  scheduledAt.setHours(hours, minutes, 0, 0);

  if (dayDifference === 0 && scheduledAt.getTime() < reference.getTime()) {
    scheduledAt.setDate(scheduledAt.getDate() + 7);
  }

  return scheduledAt;
}

export default function DashboardPage() {
  const { user } = useUser();
  const { timetable, entries, loading } = useTimetable(user?.section ?? "CSE-A", user?.department ?? "Computer Science");
  const { notifications, unreadCount } = useNotifications(user?.id);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const todaysEntries = useMemo(() => {
    const dayIndex = getDayIndex(clock);
    return entries
      .filter((entry) => entry.day_of_week === dayIndex)
      .slice()
      .sort((left, right) => timeToMinutes(left.start_time) - timeToMinutes(right.start_time));
  }, [clock, entries]);

  const nextClassInfo = useMemo(() => {
    const todayMinutes = clock.getHours() * 60 + clock.getMinutes();
    const upcomingToday = todaysEntries.find((entry) => timeToMinutes(entry.start_time) >= todayMinutes);

    if (upcomingToday) {
      return {
        entry: upcomingToday,
        scheduledAt: getScheduledDate(clock, getDayIndex(clock), upcomingToday.start_time),
      };
    }

    for (let offset = 1; offset <= 6; offset += 1) {
      const dayIndex = ((getDayIndex(clock) + offset - 1) % 7) || 7;
      const upcoming = entries
        .filter((entry) => entry.day_of_week === dayIndex)
        .slice()
        .sort((left, right) => timeToMinutes(left.start_time) - timeToMinutes(right.start_time))[0];

      if (upcoming) {
        return {
          entry: upcoming,
          scheduledAt: getScheduledDate(clock, dayIndex, upcoming.start_time),
        };
      }
    }

    return null;
  }, [clock, entries, todaysEntries]);

  const quickStats = useMemo(
    () => [
      { label: "Total classes today", value: String(todaysEntries.length) },
      { label: "Free periods", value: String(Math.max(0, 7 - todaysEntries.length)) },
      { label: "Active timetable", value: timetable?.label ?? "No active timetable" },
      { label: "Unread notifications", value: String(unreadCount) },
    ],
    [timetable?.label, todaysEntries.length, unreadCount]
  );

  const countdown = useMemo(() => {
    if (!nextClassInfo) return "No upcoming class";

    const remaining = Math.max(0, differenceInMinutes(nextClassInfo.scheduledAt, clock));
    const remainingHours = String(Math.floor(remaining / 60)).padStart(2, "0");
    const remainingMinutes = String(remaining % 60).padStart(2, "0");
    return `${remainingHours}:${remainingMinutes}:${String(clock.getSeconds()).padStart(2, "0")}`;
  }, [clock, nextClassInfo]);

  const visibleEntries = todaysEntries.slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="glass-panel">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="glass-panel">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Today&apos;s classes</CardTitle>
            <Badge>Live</Badge>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {loading ? (
              <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-40 rounded-2xl" />
              </div>
            ) : (
              visibleEntries.map((entry, index) => <ClassCard key={entry.id} entry={entry} current={index === 0} />)
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming class</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-primary/10 p-4">
                <Clock3 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">{nextClassInfo?.entry.subject ?? "No active class"}</p>
                  <p className="text-sm text-muted-foreground">Starts at {nextClassInfo?.entry.start_time ?? "--:--"}</p>
                </div>
              </div>
              <div className="rounded-2xl border p-4 text-center">
                <p className="text-sm text-muted-foreground">Countdown</p>
                <p className="mt-2 text-4xl font-bold tracking-tight">{countdown}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="text-lg">Recent notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.slice(0, 2).map((notification) => (
                <div key={notification.id} className="flex items-center gap-3 rounded-2xl border p-4">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                  </div>
                </div>
              ))}
              {!notifications.length ? (
                <div className="flex items-center gap-3 rounded-2xl border p-4">
                  <CalendarClock className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-medium">No notifications yet</p>
                    <p className="text-sm text-muted-foreground">Realtime updates will appear here.</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
