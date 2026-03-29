import { Card, CardContent, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import DesignServicesIcon from "@mui/icons-material/DesignServices";

export interface OtherServiceCardProps {
  serviceName: string;
  url: string;
  iconURL?: string | null;
  icon?: React.ReactNode;
}

export default function OtherServicesCard({
  serviceName,
  url,
  iconURL,
  icon,
}: OtherServiceCardProps) {
  return (
    <Link href={url} target={"_blank"} style={{ textDecoration: "none" }}>
      <Card
        variant="outlined"
        sx={{
          width: 160,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            padding: 2,
            width: "100%",
          }}
        >
          {icon ? (
            icon
          ) : iconURL ? (
            <Image
              src={iconURL}
              alt={`${serviceName} icon`}
              width={50}
              height={50}
            />
          ) : (
            <DesignServicesIcon fontSize="large" sx={{ fontSize: 50 }} />
          )}
          <Typography variant={"subtitle1"}>{serviceName}</Typography>
        </CardContent>
      </Card>
    </Link>
  );
}
