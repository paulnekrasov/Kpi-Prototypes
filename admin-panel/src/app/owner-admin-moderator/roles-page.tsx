"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowsDownUp,
  Plus,
  PencilSimple,
  Trash,
  LightbulbFilament,
  House,
  Users,
  FileText,
  ChartBar,
  UserPlus,
  Student,
  Handshake,
  Folder,
  Calendar,
  Headset,
  CaretDown,
} from "@phosphor-icons/react";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { InputSearch } from "@components/ui/InputGroup";
import { Pagination } from "@components/ui/pagination";
import { Table } from "@components/layout/table";
import { Sidebar } from "@components/layout/sidebar";
import {
  RoleContentTabs,
  type RoleContentTabValue,
} from "@components/providers/RoleContentTabs";
import { SidebarTab } from "@components/ui/sidebar-tab";
import { cn } from "@components/utils/cn";
import { MemberFormDialog } from "./member-form-dialog";
import type { MemberFormData } from "./member-form-dialog";
import { DeleteDialog } from "./delete-dialog";
import {
  INITIAL_MEMBERS,
  INITIAL_SUGGESTIONS,
  MEMBER_ROLES,
  type Member,
  type MemberRole,
  type ViewerRole,
} from "./roles-data";

const PAGE_SIZE = 8;
const AVATAR_TONES = [
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(value));
}

function getRoleBadgeClass(role: MemberRole): string {
  switch (role) {
    case "Owner":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "HR":
      return "border-pink-200 bg-pink-50 text-pink-700";
    case "Admin":
      return "border-indigo-200 bg-indigo-100 text-indigo-700";
    case "Moderator":
      return "border-sky-200 bg-sky-100 text-sky-700";
    case "Support":
      return "border-pink-200 bg-pink-50 text-pink-700";
    case "External":
      return "border-(--border-subtle) bg-(--bg-subtle) text-(--text-muted)";
    case "Internal":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Media":
      return "border-pink-200 bg-pink-50 text-pink-700";
    default:
      return "border-(--border-subtle) bg-(--bg-subtle) text-(--text-muted)";
  }
}

function getAvatarTone(name: string) {
  const total = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_TONES[total % AVATAR_TONES.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const checkboxClasses = [
  "relative size-4 shrink-0 appearance-none rounded-[4px] border border-(--border-subtle) bg-(--bg-base)",
  "transition-[border-color,background-color,box-shadow] duration-150 ease-out",
  "before:absolute before:left-1/2 before:top-1/2 before:h-[7px] before:w-[4px]",
  "before:-translate-x-1/2 before:-translate-y-[58%] before:rotate-45",
  "before:border-b-2 before:border-r-2 before:border-(--bg-base) before:opacity-0 before:content-['']",
  "checked:border-(--color-brand) checked:bg-(--color-brand) checked:before:opacity-100",
  "indeterminate:border-(--color-brand) indeterminate:bg-(--color-brand)",
  "indeterminate:before:h-0.5 indeterminate:before:w-2 indeterminate:before:-translate-y-1/2",
  "indeterminate:before:rotate-0 indeterminate:before:border-0 indeterminate:before:bg-(--bg-base) indeterminate:before:opacity-100",
  "focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--focus-ring)]",
].join(" ");

export default function RolesPage() {
  const [currentUserRole] = useState<ViewerRole>("Owner");
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<RoleContentTabValue>("members");
  const [selectedRoles, setSelectedRoles] = useState<MemberRole[]>([]);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const prev = html.getAttribute("data-theme");
    html.setAttribute("data-theme", "light");

    return () => {
      if (prev) html.setAttribute("data-theme", prev);
      else html.removeAttribute("data-theme");
    };
  }, []);

  useEffect(() => {
    if (!roleMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!roleMenuRef.current?.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [roleMenuOpen]);

  const isPrivileged = currentUserRole === "Owner" || currentUserRole === "Admin";

  const filteredMembers = useMemo(() => {
    const lowered = query.trim().toLowerCase();

    return members.filter((member) => {
      const matchesQuery =
        lowered === "" ||
        member.id.toLowerCase().includes(lowered) ||
        member.name.toLowerCase().includes(lowered) ||
        member.gmail.toLowerCase().includes(lowered);

      const matchesRole =
        selectedRoles.length === 0 || member.roles.some((role) => selectedRoles.includes(role));

      return matchesQuery && matchesRole;
    });
  }, [members, query, selectedRoles]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedMembers = filteredMembers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const allVisibleSelected =
    pagedMembers.length > 0 && pagedMembers.every((member) => selectedMemberIds.includes(member.id));
  const someVisibleSelected =
    pagedMembers.some((member) => selectedMemberIds.includes(member.id)) && !allVisibleSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  const handleAddMember = () => {
    setEditingMember(null);
    setFormOpen(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setFormOpen(true);
  };

  const handleDeleteMember = (member: Member) => {
    setDeletingMember(member);
    setDeleteOpen(true);
  };

  const handleSaveForm = (data: MemberFormData) => {
    if (editingMember) {
      setMembers((prev) =>
        prev.map((member) =>
          member.id === editingMember.id
            ? { ...member, ...data, passwordAutoGenerated: false }
            : member,
        ),
      );
      return;
    }

    const newMember: Member = {
      id: `M-${String(members.length + 1).padStart(3, "0")}`,
      ...data,
      createdAt: new Date().toISOString(),
      department: data.department,
      passwordAutoGenerated: true,
    };

    setMembers((prev) => [...prev, newMember]);
  };

  const handleConfirmDelete = () => {
    if (!deletingMember) return;

    setMembers((prev) => prev.filter((member) => member.id !== deletingMember.id));
    setSelectedMemberIds((prev) => prev.filter((id) => id !== deletingMember.id));
    setDeletingMember(null);
  };

  const toggleRoleFilter = (role: MemberRole) => {
    setPage(1);
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((value) => value !== role) : [...prev, role],
    );
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  };

  const toggleVisibleSelections = () => {
    if (allVisibleSelected) {
      setSelectedMemberIds((prev) => prev.filter((id) => !pagedMembers.some((member) => member.id === id)));
      return;
    }

    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      pagedMembers.forEach((member) => next.add(member.id));
      return Array.from(next);
    });
  };

  const neutralIconButtonClasses =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-(--border-subtle-plus) bg-(--bg-subtle) text-(--text-muted) transition-[background-color,color,border-color,transform] duration-150 ease-out hover:bg-(--bg-base) hover:text-(--text-primary) active:scale-[0.97] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--focus-ring)]";

  const destructiveIconButtonClasses =
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-pink-200 bg-pink-50 text-pink-500 transition-[background-color,color,border-color,transform] duration-150 ease-out hover:bg-pink-100 hover:text-pink-600 active:scale-[0.97] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--focus-ring)]";

  const tableSortIcon = (
    <ArrowsDownUp size={16} weight="bold" className="shrink-0 text-(--text-muted)" aria-hidden="true" />
  );

  const handleTabChange = (value: RoleContentTabValue) => {
    setActiveTab(value);
    setPage(1);
    setRoleMenuOpen(false);
  };

  const contentTabs = isPrivileged
    ? [
        { label: "Members", value: "members" as const },
        { label: "Suggestions", value: "suggestions" as const },
      ]
    : [{ label: "Members", value: "members" as const }];

  return (
    <div className="flex min-h-screen min-h-dvh bg-(--bg-base)">
      <div className="flex shrink-0 border-r border-(--border-subtle-plus)">
        <Sidebar defaultCollapsed={false}>
          <Sidebar.Content>
            <Sidebar.Header />
            <Sidebar.Nav>
              <SidebarTab icon={<House size={16} weight="bold" />} label="Home" active={false} />
              <SidebarTab icon={<LightbulbFilament size={16} weight="bold" />} label="Suggestions" active={false} />
              <SidebarTab icon={<FileText size={16} weight="bold" />} label="Logs" active={false} />
              <SidebarTab icon={<ChartBar size={16} weight="bold" />} label="Analytics" active={false} />
              <SidebarTab icon={<Users size={16} weight="bold" />} label="Roles" active />
              <SidebarTab icon={<UserPlus size={16} weight="bold" />} label="Recruitment" active={false} />
              <SidebarTab icon={<Student size={16} weight="bold" />} label="Student Associations" active={false} />
              <SidebarTab icon={<Handshake size={16} weight="bold" />} label="Partners" active={false} />
              <SidebarTab icon={<Folder size={16} weight="bold" />} label="Documents" active={false} />
              <SidebarTab icon={<Calendar size={16} weight="bold" />} label="Content Plan" active={false} />
              <SidebarTab icon={<Headset size={16} weight="bold" />} label="Support" active={false} />
            </Sidebar.Nav>
          </Sidebar.Content>
          <Sidebar.Footer userName="Paul Nekrasov" userRole={currentUserRole} />
        </Sidebar>
      </div>

      <div className="min-w-0 flex-1 bg-(--bg-base)">
        <main id="main-content" className="px-5 pb-8 pt-4 sm:px-6 lg:px-[19px]">
          <div className="w-full max-w-[1165px]">
            <h1 className="text-[38px] font-semibold tracking-[-0.04em] text-(--text-primary)">Roles</h1>

            <div className="mt-9 space-y-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <RoleContentTabs
                  items={contentTabs}
                  value={activeTab}
                  onValueChange={handleTabChange}
                  className="self-start"
                />

                {activeTab === "members" ? (
                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-[675px] xl:justify-end">
                    <InputSearch
                      id="member-search"
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Search"
                      aria-label="Search members by name, ID, or email"
                      containerClassName="w-full sm:w-[341px]"
                    />

                    <div className="relative" ref={roleMenuRef}>
                      <button
                        type="button"
                        onClick={() => setRoleMenuOpen((prev) => !prev)}
                        className="inline-flex h-9 w-full items-center justify-between gap-2 rounded-[8px] border border-(--border-subtle-plus) bg-(--bg-base) px-4 text-sm text-(--text-muted) transition-[background-color,color,border-color,box-shadow] duration-150 ease-out hover:text-(--text-primary) focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--focus-ring)] sm:w-[165px]"
                      >
                        <span className="inline-flex items-center gap-2">
                          <ArrowsDownUp size={16} weight="bold" aria-hidden="true" />
                          <span>Filter by Role</span>
                        </span>
                        <CaretDown
                          size={12}
                          weight="bold"
                          className={cn("transition-transform duration-150", roleMenuOpen && "rotate-180")}
                          aria-hidden="true"
                        />
                      </button>

                      {roleMenuOpen ? (
                        <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-[126px] rounded-[12px] border border-(--border-subtle-plus) bg-(--bg-base) p-2 shadow-[var(--shadow-subtle-active)]">
                          <div className="space-y-2">
                            {MEMBER_ROLES.map((role) => {
                              const checked = selectedRoles.includes(role);

                              return (
                                <label key={role} className="flex cursor-pointer items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleRoleFilter(role)}
                                    className={checkboxClasses}
                                  />
                                  <span
                                    className={cn(
                                      "inline-flex min-h-6 items-center rounded-[6px] border px-2 py-0.5 text-[11px] font-medium leading-none",
                                      getRoleBadgeClass(role),
                                    )}
                                  >
                                    {role}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {isPrivileged ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleAddMember}
                        iconLeft={<Plus size={16} weight="bold" />}
                        className="h-9 justify-center whitespace-nowrap px-4 text-sm sm:min-w-[153px]"
                      >
                        Add Member
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        iconLeft={<LightbulbFilament size={16} weight="bold" />}
                        className="h-9 justify-center whitespace-nowrap px-4 text-sm sm:min-w-[153px]"
                      >
                        Suggest Member
                      </Button>
                    )}
                  </div>
                ) : null}
              </div>

              {activeTab === "members" ? (
                <>
                  <div className="overflow-hidden rounded-[6px] border border-(--border-subtle-plus) bg-(--bg-base)">
                    <Table className="min-w-[1165px] table-fixed">
                      <colgroup>
                        <col className="w-[113px]" />
                        <col className="w-[171px]" />
                        <col className="w-[170px]" />
                        <col className="w-[205px]" />
                        <col className="w-[245px]" />
                        <col className="w-[152px]" />
                        <col className="w-[109px]" />
                      </colgroup>
                      <Table.Header>
                        <Table.Row className="h-[50px] bg-(--bg-subtle) hover:bg-(--bg-subtle) hover:shadow-none">
                          <Table.Head className="px-4 py-0 text-[14px] font-medium normal-case tracking-[-0.15px] text-(--text-muted)">
                            <div className="flex items-center gap-2">
                              <input
                                ref={selectAllRef}
                                type="checkbox"
                                checked={allVisibleSelected}
                                onChange={toggleVisibleSelections}
                                aria-label="Select all visible members"
                                className={checkboxClasses}
                              />
                              <span>ID</span>
                              {tableSortIcon}
                            </div>
                          </Table.Head>
                          <Table.Head className="px-4 py-0 text-[14px] font-medium normal-case tracking-[-0.15px] text-(--text-muted)">
                            <div className="flex items-center gap-2">
                              <span>Name</span>
                              {tableSortIcon}
                            </div>
                          </Table.Head>
                          <Table.Head className="px-4 py-0 text-[14px] font-medium normal-case tracking-[-0.15px] text-(--text-muted)">
                            <div className="flex items-center gap-2">
                              <span>Roles</span>
                              {tableSortIcon}
                            </div>
                          </Table.Head>
                          <Table.Head className="px-4 py-0 text-[14px] font-medium normal-case tracking-[-0.15px] text-(--text-muted)">
                            Email
                          </Table.Head>
                          <Table.Head className="px-4 py-0 text-[14px] font-medium normal-case tracking-[-0.15px] text-(--text-muted)">
                            Notes
                          </Table.Head>
                          <Table.Head className="px-4 py-0 text-[14px] font-medium normal-case tracking-[-0.15px] text-(--text-muted)">
                            Created
                          </Table.Head>
                          <Table.Head className="px-4 py-0 text-right text-[14px] font-medium normal-case tracking-[-0.15px] text-(--text-muted)">
                            Actions
                          </Table.Head>
                        </Table.Row>
                      </Table.Header>

                      <Table.Body>
                        {pagedMembers.length > 0 ? (
                          pagedMembers.map((member) => {
                            const selected = selectedMemberIds.includes(member.id);

                            return (
                              <Table.Row
                                key={member.id}
                                data-state={selected ? "selected" : undefined}
                                className="h-[50px] hover:bg-(--bg-subtle)/35 hover:shadow-none"
                              >
                                <Table.Cell className="px-4 py-0">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={selected}
                                      onChange={() => toggleMemberSelection(member.id)}
                                      aria-label={`Select ${member.name}`}
                                      className={checkboxClasses}
                                    />
                                    <span className="font-mono text-[14px] text-(--text-muted)">{member.id}</span>
                                  </div>
                                </Table.Cell>

                                <Table.Cell className="px-4 py-0">
                                  <div className="flex min-w-0 items-center gap-3">
                                    <span
                                      className={cn(
                                        "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-semibold",
                                        getAvatarTone(member.name),
                                      )}
                                      aria-hidden="true"
                                    >
                                      {getInitials(member.name)}
                                    </span>
                                    <span className="truncate text-[14px] font-normal text-(--text-muted)">
                                      {member.name}
                                    </span>
                                  </div>
                                </Table.Cell>

                                <Table.Cell className="px-4 py-0">
                                  <div className="flex flex-wrap gap-1.5">
                                    {member.roles.map((role) => (
                                      <span
                                        key={role}
                                        className={cn(
                                          "inline-flex min-h-6 items-center rounded-[6px] border px-2 py-0.5 text-[12px] font-medium leading-none",
                                          getRoleBadgeClass(role),
                                        )}
                                      >
                                        {role}
                                      </span>
                                    ))}
                                  </div>
                                </Table.Cell>

                                <Table.Cell className="px-4 py-0 text-[14px] text-(--text-muted)">
                                  <span className="block truncate whitespace-nowrap">{member.gmail}</span>
                                </Table.Cell>

                                <Table.Cell className="px-4 py-0">
                                  <span className="block truncate text-[14px] text-(--text-muted)">
                                    {member.notes || "-"}
                                  </span>
                                </Table.Cell>

                                <Table.Cell className="px-4 py-0 text-[14px] text-(--text-muted)">
                                  <span className="block whitespace-nowrap">{formatDate(member.createdAt)}</span>
                                </Table.Cell>

                                <Table.Cell className="px-4 py-0">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleEditMember(member)}
                                      className={neutralIconButtonClasses}
                                      aria-label={`Edit ${member.name}`}
                                    >
                                      <PencilSimple size={16} weight="bold" aria-hidden="true" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMember(member)}
                                      className={destructiveIconButtonClasses}
                                      aria-label={`Delete ${member.name}`}
                                    >
                                      <Trash size={16} weight="bold" aria-hidden="true" />
                                    </button>
                                  </div>
                                </Table.Cell>
                              </Table.Row>
                            );
                          })
                        ) : (
                          <Table.Row className="hover:bg-transparent hover:shadow-none">
                            <Table.Cell
                              colSpan={7}
                              className="px-4 py-12 text-center text-sm text-(--text-muted)"
                            >
                              No members match your current filters.
                            </Table.Cell>
                          </Table.Row>
                        )}
                      </Table.Body>
                    </Table>
                  </div>

                  <div className="flex justify-end">
                    {totalPages > 1 ? (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        className="justify-end"
                      >
                        <Pagination.Prev />
                        <Pagination.Pages />
                        <Pagination.Next />
                      </Pagination>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="overflow-hidden rounded-[6px] border border-(--border-subtle-plus) bg-(--bg-base)">
                  <Table>
                    <Table.Header>
                      <Table.Row className="h-[50px] bg-(--bg-subtle) hover:bg-(--bg-subtle) hover:shadow-none">
                        <Table.Head className="px-4 py-0 text-[14px] font-medium normal-case tracking-[-0.15px] text-(--text-muted)">
                          Type
                        </Table.Head>
                        <Table.Head className="px-4 py-0 text-[14px] font-medium normal-case tracking-[-0.15px] text-(--text-muted)">
                          Member
                        </Table.Head>
                        <Table.Head className="px-4 py-0 text-[14px] font-medium normal-case tracking-[-0.15px] text-(--text-muted)">
                          Title
                        </Table.Head>
                        <Table.Head className="px-4 py-0 text-[14px] font-medium normal-case tracking-[-0.15px] text-(--text-muted)">
                          Requester
                        </Table.Head>
                        <Table.Head className="px-4 py-0 text-[14px] font-medium normal-case tracking-[-0.15px] text-(--text-muted)">
                          Status
                        </Table.Head>
                        <Table.Head className="px-4 py-0 text-[14px] font-medium normal-case tracking-[-0.15px] text-(--text-muted)">
                          Created
                        </Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {INITIAL_SUGGESTIONS.length > 0 ? (
                        INITIAL_SUGGESTIONS.map((suggestion) => (
                          <Table.Row key={suggestion.id} className="h-[50px] hover:bg-(--bg-subtle)/35 hover:shadow-none">
                            <Table.Cell className="px-4 py-0">
                              <Badge
                                variant={
                                  suggestion.type === "Delete"
                                    ? "destructive"
                                    : suggestion.type === "Edit"
                                      ? "warning"
                                      : "success"
                                }
                              >
                                {suggestion.type}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell className="px-4 py-0 text-[14px] font-medium text-(--text-primary)">
                              {suggestion.memberName}
                            </Table.Cell>
                            <Table.Cell className="max-w-[260px] px-4 py-0 text-[14px] text-(--text-muted)">
                              <span className="block truncate">{suggestion.title}</span>
                            </Table.Cell>
                            <Table.Cell className="px-4 py-0 text-[14px] text-(--text-muted)">
                              {suggestion.requester}
                            </Table.Cell>
                            <Table.Cell className="px-4 py-0">
                              <Badge
                                variant={
                                  suggestion.status === "Approved"
                                    ? "success"
                                    : suggestion.status === "Declined"
                                      ? "destructive"
                                      : suggestion.status === "In Review"
                                        ? "warning"
                                        : "info"
                                }
                              >
                                {suggestion.status}
                              </Badge>
                            </Table.Cell>
                            <Table.Cell className="px-4 py-0 text-[14px] text-(--text-muted)">
                              {formatDate(suggestion.createdAt)}
                            </Table.Cell>
                          </Table.Row>
                        ))
                      ) : (
                        <Table.Row className="hover:bg-transparent hover:shadow-none">
                          <Table.Cell
                            colSpan={6}
                            className="px-4 py-12 text-center text-sm text-(--text-muted)"
                          >
                            No suggestions pending.
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </Table.Body>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <MemberFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingMember={editingMember}
        onSave={handleSaveForm}
      />
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        memberName={deletingMember?.name ?? ""}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
