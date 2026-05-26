import React from "react";
import type { DocumentRole } from "../types";

export function EditorPermissionGuard({ role, children }: { role: DocumentRole; children: React.ReactNode }) {
  return (
    <div className="permission-guard">
      {role === "viewer" && (
        <div className="view-only-banner" style={{ 
          padding: '8px 12px', 
          backgroundColor: '#fef3c7', 
          color: '#92400e', 
          borderRadius: '8px',
          marginBottom: '12px',
          fontSize: '0.85rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: '16px', height: '16px' }}>
            <path d="M12 15V17M12 7V13M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Chế độ xem: Bạn không có quyền chỉnh sửa tài liệu này.
        </div>
      )}
      {children}
    </div>
  );
}
