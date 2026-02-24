"use server";

import { Application, ApplicationData } from "@/classes/Application";

export const changeAction = async (
  data: Partial<Omit<ApplicationData, "createdAt" | "updatedAt" | "deletedAt">>,
) => {
  await Application.updateById(data.id!, data);
};
