'use client';

import React, { useState } from 'react';
import { GrimoireVault, VaultSettings } from '@/types/grimoire';
import { cn } from '@/lib/utils';

interface SettingsTabProps {
  vault: GrimoireVault;
  className?: string;
}

export function SettingsTab({
  vault,
  className,
}: SettingsTabProps) {
  const [settings, setSettings] = useState<VaultSettings>(vault.settings);
  const [activeSection, setActiveSection] = useState<'general' | 'appearance' | 'notifications' | 'backup' | 'advanced'>('general');
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: keyof VaultSettings, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNotificationChange = (key: keyof VaultSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Here you would save the settings to the database
      console.log('Saving settings:', settings);
      // await updateVault({ settings });
      setTimeout(() => setIsSaving(false), 1000); // Simulate API call
    } catch (error) {
      console.error('Failed to save settings:', error);
      setIsSaving(false);
    }
  };

  const sections = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'backup', label: 'Backup & Export', icon: '💾' },
    { id: 'advanced', label: 'Advanced', icon: '🔧' },
  ] as const;

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Vault Settings</h2>
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex h-full">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors',
                    activeSection === section.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {activeSection === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grimoire Name
                      </label>
                      <input
                        type="text"
                        value={vault.book_name}
                        onChange={(e) => console.log('Update book name:', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter your grimoire name"
                        aria-label="Grimoire name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Owner Name
                      </label>
                      <input
                        type="text"
                        value={vault.owner_name || ''}
                        onChange={(e) => console.log('Update owner name:', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter your name"
                        aria-label="Owner name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Practice Type
                      </label>
                      <select
                        value={vault.practice}
                        onChange={(e) => console.log('Update practice:', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Practice type"
                      >
                        <option value="Eclectic">Eclectic</option>
                        <option value="Wiccan">Wiccan</option>
                        <option value="Hedge Witch">Hedge Witch</option>
                        <option value="Kitchen Witch">Kitchen Witch</option>
                        <option value="Green Witch">Green Witch</option>
                        <option value="Ceremonial">Ceremonial</option>
                        <option value="Chaos Magic">Chaos Magic</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default View
                      </label>
                      <select
                        value={settings.default_view}
                        onChange={(e) => handleSettingChange('default_view', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Default view"
                      >
                        <option value="library">Library</option>
                        <option value="daily">Daily Practice</option>
                        <option value="correspondences">Correspondences</option>
                        <option value="settings">Settings</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Auto-save</h4>
                        <p className="text-sm text-gray-600">Automatically save changes as you type</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.auto_save}
                          onChange={(e) => handleSettingChange('auto_save', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Auto-save"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['light', 'dark', 'auto'] as const).map((theme) => (
                          <button
                            key={theme}
                            onClick={() => handleSettingChange('theme', theme)}
                            className={cn(
                              'p-4 border rounded-lg text-center transition-colors',
                              settings.theme === theme
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <div className="text-2xl mb-2">
                              {theme === 'light' && '☀️'}
                              {theme === 'dark' && '🌙'}
                              {theme === 'auto' && '🔄'}
                            </div>
                            <div className="text-sm font-medium capitalize">{theme}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Layout
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['grid', 'list', 'compact'] as const).map((layout) => (
                          <button
                            key={layout}
                            onClick={() => handleSettingChange('layout', layout)}
                            className={cn(
                              'p-4 border rounded-lg text-center transition-colors',
                              settings.layout === layout
                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <div className="text-2xl mb-2">
                              {layout === 'grid' && '⊞'}
                              {layout === 'list' && '☰'}
                              {layout === 'compact' && '⋮'}
                            </div>
                            <div className="text-sm font-medium capitalize">{layout}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Daily Reminders</h4>
                        <p className="text-sm text-gray-600">Get reminded to practice daily</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.daily_reminders}
                          onChange={(e) => handleNotificationChange('daily_reminders', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Daily reminders"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">New Suggestions</h4>
                        <p className="text-sm text-gray-600">Get notified about new AI suggestions</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.new_suggestions}
                          onChange={(e) => handleNotificationChange('new_suggestions', e.target.checked)}
                          className="sr-only peer"
                          aria-label="New suggestions"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Backup Reminders</h4>
                        <p className="text-sm text-gray-600">Get reminded to backup your grimoire</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.backup_reminders}
                          onChange={(e) => handleNotificationChange('backup_reminders', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Backup reminders"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Practice Reminders</h4>
                        <p className="text-sm text-gray-600">Get reminded about scheduled practices</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notifications.practice_reminders}
                          onChange={(e) => handleNotificationChange('practice_reminders', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Practice reminders"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'backup' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup & Export</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Frequency
                      </label>
                      <select
                        value={settings.backup_frequency}
                        onChange={(e) => handleSettingChange('backup_frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Backup frequency"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="never">Never</option>
                      </select>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-blue-500 text-lg">💾</span>
                        <div>
                          <h4 className="font-medium text-blue-900">Last Backup</h4>
                          <p className="text-sm text-blue-700">
                            {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-2xl">📤</span>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-900">Export Grimoire</h4>
                          <p className="text-sm text-gray-600">Download your grimoire as JSON</p>
                        </div>
                      </button>

                      <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <span className="text-2xl">📥</span>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-900">Import Grimoire</h4>
                          <p className="text-sm text-gray-600">Import from backup file</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">AI Suggestions</h4>
                        <p className="text-sm text-gray-600">Enable AI-powered suggestions and insights</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.ai_suggestions}
                          onChange={(e) => handleSettingChange('ai_suggestions', e.target.checked)}
                          className="sr-only peer"
                          aria-label="AI suggestions"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Safety Warnings</h4>
                        <p className="text-sm text-gray-600">Show safety warnings for potentially dangerous practices</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.safety_warnings}
                          onChange={(e) => handleSettingChange('safety_warnings', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Safety warnings"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Correspondences Integration</h4>
                        <p className="text-sm text-gray-600">Integrate with the correspondence system</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.correspondences_integration}
                          onChange={(e) => handleSettingChange('correspondences_integration', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Correspondences integration"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Lunar Integration</h4>
                        <p className="text-sm text-gray-600">Show moon phases and lunar correspondences</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.lunar_integration}
                          onChange={(e) => handleSettingChange('lunar_integration', e.target.checked)}
                          className="sr-only peer"
                          aria-label="Lunar integration"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Danger Zone</h4>
                      <div className="space-y-2">
                        <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                          Delete All Data
                        </button>
                        <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors">
                          Reset to Defaults
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
