"use client";
import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import Link from "next/link";
// Server-side proxy routes will be used to avoid CORS.

export type AnnouncementDTO = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdBy?: string | null;
  isPinned?: boolean;
};

export default function AnnouncementsList({
  initial,
  canUpdate = false,
  canPin = false,
  canDelete = false,
}: {
  initial?: AnnouncementDTO[];
  canUpdate?: boolean;
  canPin?: boolean;
  canDelete?: boolean;
}) {
  const [items, setItems] = React.useState<AnnouncementDTO[]>(
    () => initial || [],
  );
  const [busy, setBusy] = React.useState<Record<string, boolean>>({});

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValues, setEditValues] = React.useState<{
    title: string;
    content: string;
  }>({ title: "", content: "" });
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);

  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({ open: false, message: "", severity: "info" });

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ title: "", content: "" });
    setEditDialogOpen(false);
  };

  const saveEdit = async (id: string) => {
    setBusy((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: editValues.title,
          content: editValues.content,
        }),
      });
      if (!res.ok) throw new Error("failed to update");
      setItems((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, title: editValues.title, content: editValues.content }
            : p,
        ),
      );
      setEditingId(null);
      setEditDialogOpen(false);
      setSnackbar({ open: true, message: "更新しました", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "更新に失敗しました",
        severity: "error",
      });
    } finally {
      setBusy((s) => ({ ...s, [id]: false }));
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteTarget(id);
    setDeleteDialogOpen(true);
  };

  const performDelete = async (id: string) => {
    setDeleteDialogOpen(false);
    if (!id) return;
    setBusy((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("failed to delete");
      setItems((prev) => prev.filter((p) => p.id !== id));
      setSnackbar({ open: true, message: "削除しました", severity: "success" });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "削除に失敗しました",
        severity: "error",
      });
    } finally {
      setBusy((s) => ({ ...s, [id]: false }));
      setDeleteTarget(null);
    }
  };

  const handlePin = async (id: string, pin: boolean) => {
    setBusy((s) => ({ ...s, [id]: true }));
    try {
      const res = await fetch(`/api/announcements/${id}/pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) throw new Error("failed to pin");
      const json = await res.json();
      setItems((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isPinned: json.is_pinned } : p)),
      );
      setSnackbar({
        open: true,
        message: pin ? "ピンしました" : "ピンを外しました",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "操作に失敗しました",
        severity: "error",
      });
    } finally {
      setBusy((s) => ({ ...s, [id]: false }));
    }
  };

  if (!items || items.length === 0) {
    return <div>お知らせはありません</div>;
  }

  return (
    <div>
      <ul style={{ padding: 0, listStyle: "none" }}>
        {items.map((a) => (
          <li
            key={a.id}
            style={{ border: "1px solid #ddd", padding: 12, marginBottom: 8 }}
          >
            <h3 style={{ margin: 0 }}>
              {a.title} {a.isPinned ? "📌" : null}
            </h3>
            <div style={{ fontSize: 12, color: "#666" }}>
              作成者: {a.createdBy || "system"} •{" "}
              {new Date(a.createdAt).toLocaleString()}
            </div>
            <p style={{ whiteSpace: "pre-wrap" }}>{a.content}</p>

            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href={`/dashboard/announcements/${a.id}`}
                style={{ textDecoration: "none" }}
              >
                <Button variant="outlined" size="small" disabled={!!busy[a.id]}>
                  詳細を表示
                </Button>
              </Link>
              {canUpdate && (
                <Link
                  href={`/dashboard/announcements/${a.id}/edit`}
                  style={{ textDecoration: "none" }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={!!busy[a.id]}
                  >
                    編集
                  </Button>
                </Link>
              )}
              {canDelete && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => confirmDelete(a.id)}
                  disabled={!!busy[a.id]}
                >
                  削除
                </Button>
              )}
              {canPin && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handlePin(a.id, !a.isPinned)}
                  disabled={!!busy[a.id]}
                >
                  {a.isPinned ? "ピン外し" : "ピン"}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <Dialog
        open={editDialogOpen}
        onClose={cancelEdit}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>お知らせを編集</DialogTitle>
        <DialogContent>
          <TextField
            label="タイトル"
            fullWidth
            margin="normal"
            value={editValues.title}
            onChange={(e) =>
              setEditValues((v) => ({ ...v, title: e.target.value }))
            }
          />
          <TextField
            label="内容"
            fullWidth
            margin="normal"
            multiline
            rows={6}
            value={editValues.content}
            onChange={(e) =>
              setEditValues((v) => ({ ...v, content: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelEdit}>キャンセル</Button>
          <Button
            variant="contained"
            onClick={() => editingId && saveEdit(editingId)}
            disabled={editingId ? !!busy[editingId] : true}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>確認</DialogTitle>
        <DialogContent>本当にお知らせを削除しますか？</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteTarget && performDelete(deleteTarget)}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
