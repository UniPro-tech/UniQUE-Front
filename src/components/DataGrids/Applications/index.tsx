import {
  PlainApplication,
  Application,
  ApplicationWithOwner,
} from "@/types/Application";

export default async function ApplicationsDataGrid({
  rows,
}: {
  rows?: PlainApplication[] | Application[];
}) {
  if (!rows) {
    const fetched = await Application.getAllApplications();
    rows = fetched.map((app) => app.toPlainObject());
  } else {
    rows = rows.map((app) =>
      app instanceof Application ? app.toPlainObject() : app,
    );
  }

  // オーナー情報を取得して追加
  const rowsWithOwner = await Promise.all(
    rows.map(async (row) => {
      const app = new Application(row as PlainApplication);
      try {
        const owners = await app.getOwners();
        if (owners.length > 0) {
          return {
            ...row,
            ownerDisplayName: owners[0].profile?.displayName || owners[0].email,
            ownerCustomId: owners[0].customId,
          } as ApplicationWithOwner;
        }
      } catch (error) {
        console.error("Failed to fetch owner for app:", row.id, error);
      }
      return row as ApplicationWithOwner;
    }),
  );

  const ApplicationsDataGridClient = (await import("./Client")).default;
  return <ApplicationsDataGridClient rows={rowsWithOwner} />;
}
