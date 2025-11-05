'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Calendar, FileSpreadsheet, MessageSquare, Mail, Sun, Moon, Check, X, AlertCircle } from 'lucide-react';

interface Integration {
  id: string;
  provider: string;
  googleCalendarIds: string[];
  googleSheetsUrl: string | null;
  twilioFromNumber: string | null;
}

export default function SettingsPage() {
  const { theme, setTheme } = useAppStore();
  const [integration, setIntegration] = useState<Integration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [showTwilioModal, setShowTwilioModal] = useState(false);

  // Form states
  const [calendarIds, setCalendarIds] = useState('');
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [twilioSid, setTwilioSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [twilioFromNumber, setTwilioFromNumber] = useState('');

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const token = localStorage.getItem('firebaseToken');
      if (!token) return;

      const res = await fetch('/api/integrations', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        const googleIntegration = data.find((i: Integration) => i.provider === 'GOOGLE');
        const twilioIntegration = data.find((i: Integration) => i.provider === 'TWILIO');

        // Merge both integrations for display
        if (googleIntegration || twilioIntegration) {
          setIntegration({
            id: googleIntegration?.id || twilioIntegration?.id,
            provider: 'COMBINED',
            googleCalendarIds: googleIntegration?.googleCalendarIds || [],
            googleSheetsUrl: googleIntegration?.googleSheetsUrl || null,
            twilioFromNumber: twilioIntegration?.twilioFromNumber || null,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching integrations:', err);
    }
  };

  const handleConnectGoogle = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('firebaseToken');
      const res = await fetch('/api/integrations/google/init', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        // Use window.location.replace to avoid being blocked as a frame
        window.location.replace(data.url);
      } else {
        setError('Failed to initiate Google OAuth');
      }
    } catch (err) {
      setError('Error connecting to Google');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCalendarIds = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('firebaseToken');
      const ids = calendarIds.split(',').map(id => id.trim()).filter(Boolean);

      const res = await fetch('/api/integrations/google/update', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ calendarIds: ids }),
      });

      if (res.ok) {
        await fetchIntegrations();
        setShowCalendarModal(false);
        setCalendarIds('');
      } else {
        setError('Failed to save calendar IDs');
      }
    } catch (err) {
      setError('Error saving calendar IDs');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSheetsUrl = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('firebaseToken');

      const res = await fetch('/api/integrations/google/update', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sheetsUrl }),
      });

      if (res.ok) {
        await fetchIntegrations();
        setShowSheetsModal(false);
      } else {
        setError('Failed to save Sheets URL');
      }
    } catch (err) {
      setError('Error saving Sheets URL');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTwilio = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('firebaseToken');

      const res = await fetch('/api/integrations/twilio/save', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountSid: twilioSid,
          authToken: twilioAuthToken,
          fromNumber: twilioFromNumber,
        }),
      });

      if (res.ok) {
        await fetchIntegrations();
        setShowTwilioModal(false);
        setTwilioSid('');
        setTwilioAuthToken('');
        setTwilioFromNumber('');
      } else {
        setError('Failed to save Twilio credentials');
      }
    } catch (err) {
      setError('Error saving Twilio credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your workspace and integrations</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Connections */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Connections</h2>

        {/* Google Calendar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Google Calendar</h3>
                  {integration?.googleCalendarIds.length ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Connected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                      Not Connected
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Sync appointments bi-directionally with your Google Calendar
                </p>
                {integration?.googleCalendarIds.length ? (
                  <div className="mt-2 text-xs text-gray-700">
                    <p className="font-medium">Connected Calendars: {integration.googleCalendarIds.length}</p>
                    <p className="text-gray-500 mt-1">{integration.googleCalendarIds.join(', ')}</p>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <p>• Read and write appointments</p>
                    <p>• Real-time sync</p>
                    <p>• Multiple calendar support</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {!integration?.googleCalendarIds.length ? (
                <button
                  onClick={handleConnectGoogle}
                  disabled={loading}
                  className="px-4 py-2 bg-[#3B5BFF] text-white rounded-lg hover:bg-[#2A4BE0] transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {loading ? 'Connecting...' : 'Connect'}
                </button>
              ) : (
                <button
                  onClick={() => setShowCalendarModal(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Configure
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Google Sheets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Google Sheets</h3>
                  {integration?.googleSheetsUrl ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Connected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                      Not Connected
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Store and manage appointments in Google Sheets
                </p>
                {integration?.googleSheetsUrl ? (
                  <div className="mt-2 text-xs text-gray-700">
                    <p className="font-medium">Spreadsheet URL:</p>
                    <p className="text-gray-500 mt-1 break-all">{integration.googleSheetsUrl}</p>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <p>• Spreadsheet URL configuration</p>
                    <p>• Custom tab names</p>
                    <p>• Read/write access</p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setSheetsUrl(integration?.googleSheetsUrl || '');
                setShowSheetsModal(true);
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {integration?.googleSheetsUrl ? 'Update' : 'Configure'}
            </button>
          </div>
        </div>

        {/* SMS Provider */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">SMS (Twilio)</h3>
                  {integration?.twilioFromNumber ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Connected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                      Not Connected
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Send and receive SMS messages with customers
                </p>
                {integration?.twilioFromNumber ? (
                  <div className="mt-2 text-xs text-gray-700">
                    <p className="font-medium">From Number: {integration.twilioFromNumber}</p>
                    <p className="text-gray-500 mt-2">
                      <span className="font-medium">Webhook URL:</span><br />
                      {typeof window !== 'undefined' && `${window.location.origin}/api/webhooks/twilio-sms`}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <p>• Account SID & Auth Token</p>
                    <p>• Phone number configuration</p>
                    <p>• Two-way messaging</p>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowTwilioModal(true)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {integration?.twilioFromNumber ? 'Update' : 'Configure'}
            </button>
          </div>
        </div>

        {/* Gmail - Coming Soon */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 opacity-60">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Gmail API</h3>
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                    Coming Soon
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Send automated email confirmations and updates
                </p>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p>• OAuth 2.0 authentication</p>
                  <p>• Template support</p>
                  <p>• Send from your domain</p>
                </div>
              </div>
            </div>
            <button
              disabled
              className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed text-sm font-medium"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Theme</h3>
          <div className="flex gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-3 flex-1 p-4 border-2 rounded-lg transition-colors ${
                theme === 'light'
                  ? 'border-[#3B5BFF] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                <Sun className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Light</p>
                <p className="text-sm text-gray-600">Bright and clean</p>
              </div>
              {theme === 'light' && <Check className="w-5 h-5 text-[#3B5BFF]" />}
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-3 flex-1 p-4 border-2 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'border-[#3B5BFF] bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-10 h-10 bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center">
                <Moon className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Dark</p>
                <p className="text-sm text-gray-600">Easy on the eyes</p>
              </div>
              {theme === 'dark' && <Check className="w-5 h-5 text-[#3B5BFF]" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Note: Dark mode UI implementation coming in Phase 2
          </p>
        </div>
      </div>

      {/* Calendar ID Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Configure Google Calendar</h3>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Enter your Google Calendar IDs (comma-separated). You can find your calendar ID in Google Calendar settings.
            </p>
            <input
              type="text"
              placeholder="primary, work@example.com"
              value={calendarIds}
              onChange={(e) => setCalendarIds(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B5BFF] focus:border-transparent mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCalendarModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCalendarIds}
                disabled={loading || !calendarIds}
                className="flex-1 px-4 py-2 bg-[#3B5BFF] text-white rounded-lg hover:bg-[#2A4BE0] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sheets URL Modal */}
      {showSheetsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Configure Google Sheets</h3>
              <button
                onClick={() => setShowSheetsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Enter the full URL of your Google Sheets spreadsheet where appointments will be synced.
            </p>
            <input
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/..."
              value={sheetsUrl}
              onChange={(e) => setSheetsUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B5BFF] focus:border-transparent mb-4"
            />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Make sure the sheet has an "Appointments" tab with the correct column headers.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSheetsModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSheetsUrl}
                disabled={loading || !sheetsUrl}
                className="flex-1 px-4 py-2 bg-[#3B5BFF] text-white rounded-lg hover:bg-[#2A4BE0] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Twilio Modal */}
      {showTwilioModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Configure Twilio</h3>
              <button
                onClick={() => setShowTwilioModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Enter your Twilio credentials from your Twilio Console.
            </p>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account SID
                </label>
                <input
                  type="text"
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={twilioSid}
                  onChange={(e) => setTwilioSid(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B5BFF] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auth Token
                </label>
                <input
                  type="password"
                  placeholder="Your Auth Token"
                  value={twilioAuthToken}
                  onChange={(e) => setTwilioAuthToken(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B5BFF] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Number
                </label>
                <input
                  type="tel"
                  placeholder="+1234567890"
                  value={twilioFromNumber}
                  onChange={(e) => setTwilioFromNumber(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B5BFF] focus:border-transparent"
                />
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800">
                <strong>After saving:</strong> Configure the webhook URL in your Twilio Console to receive inbound messages.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTwilioModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTwilio}
                disabled={loading || !twilioSid || !twilioAuthToken || !twilioFromNumber}
                className="flex-1 px-4 py-2 bg-[#3B5BFF] text-white rounded-lg hover:bg-[#2A4BE0] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
