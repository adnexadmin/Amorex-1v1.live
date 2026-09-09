import React from 'react';
import { UserProfile, BackpackItem, DailyTask, StreamHost } from '../../types';
import { ProfileDashboard } from '../profile/ProfileDashboard';

export interface ProfileTabProps {
  user: UserProfile;
  backpack: BackpackItem[];
  tasks: DailyTask[];
  onOpenRecharge: () => void;
  onOpenAdminSuite: () => void;
  onSwitchToSuperAdmin?: () => void;
  onOpenSupportBot?: (context?: { source: string; query: string }) => void;
  onOpenInstallModal?: () => void;
  onOpenShareModal?: () => void;
  onLogout: () => void;
  onClaimTask: (taskId: string) => void;
  onEquipBackpackItem: (itemId: string) => void;
  onStart1v1Call?: (host: StreamHost) => void;
  hosts?: StreamHost[];
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  backpack,
  tasks,
  onOpenRecharge,
  onOpenAdminSuite,
  onSwitchToSuperAdmin,
  onOpenSupportBot,
  onOpenInstallModal,
  onOpenShareModal,
  onLogout,
  onClaimTask,
  onEquipBackpackItem,
  onStart1v1Call,
  hosts = []
}) => {
  return (
    <ProfileDashboard
      initialUser={user}
      backpack={backpack}
      tasks={tasks}
      onOpenRecharge={onOpenRecharge}
      onOpenAdminSuite={onOpenAdminSuite}
      onSwitchToSuperAdmin={onSwitchToSuperAdmin}
      onOpenSupportBot={onOpenSupportBot}
      onOpenInstallModal={onOpenInstallModal}
      onOpenShareModal={onOpenShareModal}
      onLogout={onLogout}
      onClaimTask={onClaimTask}
      onEquipBackpackItem={onEquipBackpackItem}
      onStart1v1Call={onStart1v1Call}
      hosts={hosts}
    />
  );
};
