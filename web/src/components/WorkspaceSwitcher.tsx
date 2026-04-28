"use client";

import React from 'react';
import { LayoutGrid, Plus, Users, User } from 'lucide-react';
import { Workspace } from '../../../shared/workspace';

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  onSelect: (id: string | null) => void;
  onCreate: () => void;
  onInvite: (id: string) => void;
}

export function WorkspaceSwitcher({ 
  workspaces, 
  currentWorkspaceId, 
  onSelect, 
  onCreate,
  onInvite
}: WorkspaceSwitcherProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">Workspaces</span>
        <button 
          onClick={onCreate}
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-indigo-600 transition-colors"
          title="Create Workspace"
        >
          <Plus size={14} />
        </button>
      </div>

      <button
        onClick={() => onSelect(null)}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-medium ${
          currentWorkspaceId === null 
            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' 
            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        <User size={18} />
        <span>Personal</span>
      </button>

      {workspaces.map((workspace) => (
        <div key={workspace.id} className="group relative">
          <button
            onClick={() => onSelect(workspace.id)}
            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-sm font-medium w-full text-left ${
              currentWorkspaceId === workspace.id 
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <LayoutGrid size={18} />
            <span className="truncate">{workspace.name}</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onInvite(workspace.id);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-indigo-600 transition-all"
            title="Invite Members"
          >
            <Users size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
