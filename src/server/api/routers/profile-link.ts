import * as z from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { type BentoSize, type BentoType } from "@prisma/client";

const createProfileLinkInput = z.object({
  link: z.string(),
  twitter: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  telegram: z.string().optional(),
  discord: z.string().optional(),
  youtube: z.string().optional(),
  twitch: z.string().optional(),
});

export const profileLinkRouter = createTRPCRouter({
  linkAvailable: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const profileLink = await ctx.prisma.profileLink.findUnique({
        where: {
          link: input,
        },
        select: { id: true },
      });

      if (!profileLink) {
        // make sure the username is not a reserved word and is above 3 characters and don't contain any special characters
        if (/^[a-zA-Z0-9_]+$/.test(input) && input.length >= 3) {
          return true;
        }
      }

      return false;
    }),

  createProfileLink: protectedProcedure
    .input(createProfileLinkInput)
    .mutation(async ({ input, ctx }) => {
      if (!/^[a-zA-Z0-9_]+$/.test(input.link) || input.link.length < 3) {
        throw new Error("Invalid link");
      }

      const profileLinks = await ctx.prisma.profileLink.count({
        where: {
          user: {
            providerId: ctx.auth.userId,
          },
        },
      });
      if (profileLinks >= 1) {
        throw new Error(
          "You can't create more profile links, upgrade your plan"
        );
      }

      const bento: {
        type: BentoType;
        href: string;

        mobileSize: BentoSize;
        desktopSize: BentoSize;

        mobilePosition: number;
        desktopPosition: number;
      }[] = [];

      let position = 1;
      for (const [key, value] of Object.entries(input)) {
        if (key !== "link" && value) {
          let url = `https://${key}.com/${value}`;

          if (key === "linkedin") {
            url = `https://www.${key}.com/in/${value}`;
          }

          if (key === "youtube") {
            url = `https://www.${key}.com/channel/${value}`;
          }

          if (key === "twitch") {
            url = `https://www.${key}.tv/${value}`;
          }

          bento.push({
            type: "LINK",

            href: url,

            mobileSize: "SIZE_2x2",
            desktopSize: "SIZE_2x2",

            mobilePosition: position,
            desktopPosition: position,
          });

          position += 1;
        }
      }

      const profileLink = await ctx.prisma.profileLink.create({
        data: {
          link: input.link,
          name: input.link,

          Bento: {
            createMany: {
              data: bento,
            },
          },

          user: {
            connect: {
              providerId: ctx.auth.userId,
            },
          },
        },
      });

      return profileLink;
    }),
});