import { useState } from 'react';
import { RemindBeforeMinutes, SnoozeMinutes, UserSettings } from '../types/settings';
import { User } from '../types/auth';
import { TimePickerModal } from '../components/pickers/TimePickerModal';
import { SettingsSwitchItem } from '../components/settings/settings-switch-item';
import { SettingsPillSelectorGroup } from '../components/settings/settings-pill-selector-group';
import { sendDesktopNotification } from '../services/notification-service';

interface SettingsViewProps {
  settings: UserSettings;
  user?: User | null;
  onLogout?: () => void;
  onToggle: (key: 'push' | 'sound' | 'vibrate') => void;
  onSetRemindBefore: (val: RemindBeforeMinutes) => void;
  onSetSnooze: (val: SnoozeMinutes) => void;
  onSetQuietHours: (start: string, end: string) => void;
  onShowToast?: (message: string) => void;
}

export function SettingsView({
  settings,
  user,
  onLogout,
  onToggle,
  onSetRemindBefore,
  onSetSnooze,
  onSetQuietHours,
  onShowToast,
}: SettingsViewProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [timePickerTarget, setTimePickerTarget] = useState<'quietStart' | 'quietEnd' | null>(null);
  const remindOptions: RemindBeforeMinutes[] = [0, 5, 15, 30];
  const snoozeOptions: SnoozeMinutes[] = [5, 10, 15, 20];

  const getInitialTimeForPicker = () => {
    const val = timePickerTarget === 'quietStart' ? settings.quietStart : settings.quietEnd;
    const [h, m] = val.split(':').map(Number);
    return { h: h || 0, m: m || 0 };
  };

  const pickerTime = getInitialTimeForPicker();
  return (
    <div className="view-container" style={{ flex: 1, overflowY: 'auto', padding: '36px 40px' }}>
      <div style={{ font: "700 28px/1.25 'Space Grotesk',sans-serif", color: '#0F172A', marginBottom: '24px' }}>
        Cài đặt
      </div>

      <div style={{ maxWidth: '620px' }}>
        {/* Section 1: Thông báo & nhắc nhở */}
        <div style={{ font: '700 13.5px sans-serif', color: '#94A3B8', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '.04em' }}>
          Thông báo &amp; nhắc nhở
        </div>
        <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,23,42,.03),0 12px 24px -16px rgba(15,23,42,.14)' }}>
          <SettingsSwitchItem
            label="Thông báo đẩy"
            sublabel="Nhắc khi tới giờ công việc"
            checked={settings.push}
            onToggle={() => onToggle('push')}
          />
          <SettingsSwitchItem
            label="Âm thanh"
            checked={settings.sound}
            onToggle={() => onToggle('sound')}
          />
          <SettingsSwitchItem
            label="Rung"
            checked={settings.vibrate}
            onToggle={() => onToggle('vibrate')}
            borderBottom={false}
          />
        </div>

        <div style={{ marginTop: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            disabled={isTesting}
            onClick={async () => {
              setIsTesting(true);
              try {
                await sendDesktopNotification(
                  'NLTASK - Thông báo thử nghiệm',
                  'Hệ thống thông báo đẩy trên PC đang hoạt động rất tốt!',
                  { ...settings, push: true, sound: true, quietStart: '00:00', quietEnd: '00:00' }
                );
                onShowToast?.('Đã phát thông báo thử nghiệm! Kiểm tra góc dưới màn hình.');
              } catch (err) {
                console.error('Test notification failed:', err);
              } finally {
                setTimeout(() => setIsTesting(false), 1000);
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 16px',
              background: '#EFF6FF',
              color: '#2563EB',
              border: '1px solid #BFDBFE',
              borderRadius: '8px',
              font: "600 13.5px 'Space Grotesk', sans-serif",
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🔔</span>
            <span>{isTesting ? 'Đang gửi...' : 'Kiểm tra gửi thông báo đẩy trên PC'}</span>
          </button>
        </div>
        {/* Section 2: Nhắc trước khi tới giờ */}
        <SettingsPillSelectorGroup<RemindBeforeMinutes>
          title="Nhắc trước khi tới giờ"
          options={remindOptions}
          selected={settings.remindBefore}
          onSelect={onSetRemindBefore}
          formatLabel={(v) => (v === 0 ? 'Đúng giờ' : `${v} phút`)}
        />

        {/* Section 3: Nhắc lại (báo lại sau) */}
        <SettingsPillSelectorGroup<SnoozeMinutes>
          title="Nhắc lại (báo lại sau)"
          options={snoozeOptions}
          selected={settings.snooze}
          onSelect={onSetSnooze}
        />

        {/* Section 4: Giờ im lặng */}
        <div style={{ font: '700 13.5px sans-serif', color: '#94A3B8', margin: '24px 0 10px', textTransform: 'uppercase', letterSpacing: '.04em' }}>
          Giờ im lặng
        </div>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 2px rgba(15,23,42,.03),0 12px 24px -16px rgba(15,23,42,.14)' }}>
          <div style={{ font: '600 15px sans-serif', color: '#334155' }}>Không nhắc từ</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setTimePickerTarget('quietStart')}
              style={{ padding: '9px 16px', borderRadius: '10px', background: '#F1F5F9', border: 'none', font: "700 15px 'Space Grotesk',sans-serif", color: '#0F172A', cursor: 'pointer' }}
            >
              {settings.quietStart}
            </button>
            <span style={{ color: '#94A3B8', font: '600 14px sans-serif' }}>đến</span>
            <button
              onClick={() => setTimePickerTarget('quietEnd')}
              style={{ padding: '9px 16px', borderRadius: '10px', background: '#F1F5F9', border: 'none', font: "700 15px 'Space Grotesk',sans-serif", color: '#0F172A', cursor: 'pointer' }}
            >
              {settings.quietEnd}
            </button>
          </div>
        </div>

        {/* Section 5: Khác */}
        <div style={{ font: '700 13.5px sans-serif', color: '#94A3B8', margin: '24px 0 10px', textTransform: 'uppercase', letterSpacing: '.04em' }}>
          Khác
        </div>
        <div style={{ background: '#fff', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,23,42,.03),0 12px 24px -16px rgba(15,23,42,.14)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ font: '600 15.5px sans-serif', color: '#0F172A' }}>Ngôn ngữ</div>
            <div style={{ font: '600 14.5px sans-serif', color: '#94A3B8' }}>Tiếng Việt</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
            <div style={{ font: '600 15.5px sans-serif', color: '#0F172A' }}>Giao diện</div>
            <div style={{ font: '600 14.5px sans-serif', color: '#94A3B8' }}>Sáng</div>
          </div>
        </div>

        {/* Section 6: Tài khoản & Đăng xuất */}
        {user && onLogout && (
          <>
            <div style={{ font: '700 13.5px sans-serif', color: '#94A3B8', margin: '24px 0 10px', textTransform: 'uppercase', letterSpacing: '.04em' }}>
              Tài khoản
            </div>
            <div
              style={{
                background: '#fff',
                borderRadius: '10px',
                padding: '18px 20px',
                boxShadow: '0 1px 2px rgba(15,23,42,.03),0 12px 24px -16px rgba(15,23,42,.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ font: '700 16px sans-serif', color: '#0F172A' }}>{user.name}</span>
                  <span
                    style={{
                      font: '700 11px sans-serif',
                      background: user.role === 'ADMIN' ? '#F5F0FF' : '#EFF4FF',
                      color: user.role === 'ADMIN' ? '#7C3AED' : '#2563EB',
                      border: `1px solid ${user.role === 'ADMIN' ? 'rgba(124,58,237,0.2)' : 'rgba(37,99,235,0.2)'}`,
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {user.role}
                  </span>
                </div>
                <div style={{ font: '500 13.5px sans-serif', color: '#64748B' }}>{user.email}</div>
              </div>

              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  borderRadius: '10px',
                  padding: '10px 18px',
                  font: '700 14px sans-serif',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(220,38,38,0.08)',
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Đăng xuất
              </button>
            </div>
          </>
        )}
      </div>
      {/* Quiet Hours TimePicker Modal */}
      {timePickerTarget && (
        <TimePickerModal
          initialHour={pickerTime.h}
          initialMinute={pickerTime.m}
          title={timePickerTarget === 'quietStart' ? 'Giờ bắt đầu im lặng' : 'Giờ kết thúc im lặng'}
          onConfirm={(h, m) => {
            const timeStr = `${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}`;
            if (timePickerTarget === 'quietStart') {
              onSetQuietHours(timeStr, settings.quietEnd);
            } else {
              onSetQuietHours(settings.quietStart, timeStr);
            }
            setTimePickerTarget(null);
          }}
          onClose={() => setTimePickerTarget(null)}
        />
      )}
    </div>
  );
}
