"use client";

import { useState, type ReactNode } from "react";
import { createRealtimeClient } from "@neon/realtime/client";
import { drizzleParsers } from "@neon/realtime-drizzle/client";
import { RealtimeProvider } from "@neon/realtime-react";

interface NeonRealtimeProviderProps {
  url: string;
  children: ReactNode;
}

export function NeonRealtimeProvider({
  url,
  children,
}: NeonRealtimeProviderProps) {
  const [client] = useState(() =>
    createRealtimeClient({
      url,
      parsers: {
        ...drizzleParsers,
      },
    }),
  );

  return <RealtimeProvider client={client}>{children}</RealtimeProvider>;
}

