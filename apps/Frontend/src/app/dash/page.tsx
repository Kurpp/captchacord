"use client";

import useSWR from "swr";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GuildsResponse } from "../../typings/API";

export default function Home() {
  const router = useRouter();
  const { data, error } = useSWR<GuildsResponse>("/discord/guilds", (url) =>
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
        <h1 className="tw-text-7xl tw-font-bold tw-text-slate-500">
          Welcome John Doe
        </h1>
        <div className="tw-grid tw-gap-2 tw-grid-cols-4">
          {/* TODO: tidy this up */}
          {data.userGuilds
            // shortest -> longest
            .sort((a, b) => a.name.length - b.name.length)
            // guilds which have manage server perms first
            .sort(
              (a, b) =>
                Number(
                  (BigInt(b.permissions!) & BigInt(1 << 5)) === BigInt(1 << 5)
                ) -
                Number(
                  (BigInt(a.permissions!) & BigInt(1 << 5)) === BigInt(1 << 5)
                )
            )
            // guilds that the bot are in first
            .sort(
              (a, b) =>
                Number(data.botGuilds.map(({ id }) => id).includes(b.id)) -
                Number(data.botGuilds.map(({ id }) => id).includes(a.id))
            )
            .map((guild) => (
              <p key={guild.id}>{guild.name}</p>
            ))}
        </div>
        {/* <Link href={`${process.env.API_URL}/discord/logout`}>
        <button className="tw-text-7xl tw-font-bold tw-bg-slate-500">Logout</button>
      </Link> */}
      </div>
    )
  );
}
