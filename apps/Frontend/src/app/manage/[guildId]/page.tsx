"use client";

import useSWR from "swr";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConfigResponse } from "../../../typings/API";

export default function Guild({
  params: { guildId },
}: {
  params: { guildId: string };
}) {
  const router = useRouter();

  const { data, error } = useSWR<ConfigResponse>(
    `/discord/guilds/${guildId}`,
    (url) =>
      fetch(`${process.env.API_URL}${url}`, { credentials: "include" }).then(
        (r) => {
          if (r.ok) return r.json();

          throw r.json();
        }
      )
  );

  useEffect(() => {
    if (!data && error) {
      return void router.replace("/");
    }
  }, [router, error, data]);

  return (
    data && (
      <div className="tw-flex tw-gap-2 tw-flex-col tw-items-center tw-justify-center tw-h-screen tw-p-12">
        Guild: {data.name}
        <div className="tw-grid">
          Channel:{" "}#
          {data.channels.find((c) => c.id === data.verifyMessage.channelId)
            ?.name ?? "Unknown Channel"}{" "}
          ({data.verifyMessage.channelId})
        </div>
      </div>
    )
  );
}
