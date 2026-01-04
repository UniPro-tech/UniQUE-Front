"use client";
import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import { Session } from "@/lib/Session";
import AccountButton from "./Sidebar/AccountButton";
import { Stack } from "@mui/material";
import { PermissionBitsFields } from "@/types/PermissionBits";
import Image from "next/image";
import Link from "next/link";
// use native img to avoid next/image dev-time optimization errors for this small logo

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

interface NavLink {
  text: string;
  href: string;
  icon: React.ReactNode;
}

export default function MiniDrawer({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  const isAdmin = session?.user.roles?.some(
    (role) =>
      role.permission & PermissionBitsFields.USER_CREATE &&
      role.permission & PermissionBitsFields.USER_DELETE &&
      role.permission & PermissionBitsFields.ROLE_MANAGE &&
      role.permission & PermissionBitsFields.USER_DISABLE &&
      role.permission & PermissionBitsFields.USER_UPDATE &&
      role.permission & PermissionBitsFields.PERMISSION_MANAGE
  );
  const NAVIGSTION_LINKS: NavLink[][] = [
    [{ text: "ホーム", href: "/dashboard", icon: <HomeIcon /> }],
    ...(isAdmin
      ? [
          [
            {
              text: "メンバー管理",
              href: "/dashboard/members",
              icon: <PeopleIcon />,
            },
            {
              text: "メンバー申請管理",
              href: "/dashboard/requests",
              icon: <PersonAddIcon />,
            },
          ],
        ]
      : []),
  ];

  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={open}
        style={{
          background: "#e6ecec",
          color: "#000000",
        }}
      >
        <Toolbar>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent={"center"}
            justifyItems={"center"}
            margin={0}
            padding={0}
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={[open && { display: "none" }]}
            >
              <MenuIcon />
            </IconButton>
            <Link href="/dashboard">
              <Image
                src="/unique_logotype.png"
                alt="UniQUE Logo"
                width={128}
                height={42}
                style={{ display: "block", objectFit: "contain" }}
              />
            </Link>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <AccountButton session={session} />
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        {NAVIGSTION_LINKS.map((section, index) => (
          <div key={index}>
            <List key={index}>
              {section.map((link) => (
                <ListItem
                  key={link.text}
                  disablePadding
                  sx={{ display: "block" }}
                >
                  <ListItemButton
                    href={link.href}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                      }}
                    >
                      {link.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={link.text}
                      sx={{ opacity: open ? 1 : 0 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
            {index < NAVIGSTION_LINKS.length - 1 && (
              <Divider key={"divider-" + index} />
            )}
          </div>
        ))}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          width: { xs: "100%", sm: "auto" },
          maxWidth: "100%",
          overflow: "auto",
          boxSizing: "border-box",
        }}
      >
        <DrawerHeader />
        {children}
      </Box>
    </Box>
  );
}
