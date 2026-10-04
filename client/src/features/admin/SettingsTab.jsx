import { useState, useEffect, useCallback } from 'react';
import { Key, Eye, EyeOff, Shield, ShieldCheck, Loader2 } from 'lucide-react';
import { changePassword } from '../../components/services/changePassword';
import {
  getAdminMfaStatus,
  requestAdminMfaEnable,
  confirmAdminMfaEnable,
  requestAdminMfaDisable,
  confirmAdminMfaDisable,
} from '../../components/services/adminMfaService';
import OtpSixDigitInput from '../../components/shared/OtpSixDigitInput';

const formatMmSs = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const SettingsTab = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });

  const [mfaStatus, setMfaStatus] = useState(null);
  const [mfaStatusLoading, setMfaStatusLoading] = useState(true);
  const [mfaActionLoading, setMfaActionLoading] = useState(false);
  const [mfaOtpPhase, setMfaOtpPhase] = useState(null);
  const [mfaOtpCode, setMfaOtpCode] = useState('');
  const [mfaRemainingSec, setMfaRemainingSec] = useState(0);
  const [mfaMessage, setMfaMessage] = useState('');

  const loadMfaStatus = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setMfaStatusLoading(false);
      return;
    }
    try {
      const data = await getAdminMfaStatus(token);
      setMfaStatus(data);
    } catch {
      setMfaStatus(null);
    } finally {
      setMfaStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMfaStatus();
  }, [loadMfaStatus]);

  useEffect(() => {
    if (!mfaOtpPhase) return undefined;
    const deadline = Date.now() + (mfaOtpPhase.expiresInSeconds ?? 180) * 1000;
    const tick = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setMfaRemainingSec(left);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [mfaOtpPhase]);

  const cancelMfaFlow = () => {
    setMfaOtpPhase(null);
    setMfaOtpCode('');
    setMfaMessage('');
  };

  const handleRequestEnable = async () => {
    const token = localStorage.getItem('authToken');
    setMfaMessage('');
    setMfaActionLoading(true);
    try {
      const challenge = await requestAdminMfaEnable(token);
      setMfaOtpPhase({
        mode: 'enable',
        sessionToken: challenge.mfaSessionToken,
        maskedEmail: challenge.maskedEmail,
        expiresInSeconds: challenge.expiresInSeconds,
      });
      setMfaOtpCode('');
    } catch (e) {
      setMfaMessage(e.message || 'Request failed');
    } finally {
      setMfaActionLoading(false);
    }
  };

  const handleConfirmEnable = async (codeOverride) => {
    const token = localStorage.getItem('authToken');
    const code = typeof codeOverride === 'string' ? codeOverride : mfaOtpCode;
    if (!mfaOtpPhase || mfaOtpPhase.mode !== 'enable' || code.length !== 6) {
      setMfaMessage('Enter the full 6-digit code.');
      return;
    }
    if (mfaRemainingSec <= 0) {
      setMfaMessage('Code expired. Request a new one.');
      return;
    }
    setMfaActionLoading(true);
    setMfaMessage('');
    try {
      await confirmAdminMfaEnable(token, mfaOtpPhase.sessionToken, code);
      cancelMfaFlow();
      setSuccess('Two-factor authentication is now enabled.');
      await loadMfaStatus();
    } catch (e) {
      setMfaMessage(e.message || 'Verification failed');
    } finally {
      setMfaActionLoading(false);
    }
  };

  const handleRequestDisable = async () => {
    const token = localStorage.getItem('authToken');
    setMfaMessage('');
    setMfaActionLoading(true);
    try {
      const challenge = await requestAdminMfaDisable(token);
      setMfaOtpPhase({
        mode: 'disable',
        sessionToken: challenge.mfaSessionToken,
        maskedEmail: challenge.maskedEmail,
        expiresInSeconds: challenge.expiresInSeconds,
      });
      setMfaOtpCode('');
    } catch (e) {
      setMfaMessage(e.message || 'Request failed');
    } finally {
      setMfaActionLoading(false);
    }
  };

  const handleConfirmDisable = async (codeOverride) => {
    const token = localStorage.getItem('authToken');
    const code = typeof codeOverride === 'string' ? codeOverride : mfaOtpCode;
    if (!mfaOtpPhase || mfaOtpPhase.mode !== 'disable' || code.length !== 6) {
      setMfaMessage('Enter the full 6-digit code.');
      return;
    }
    if (mfaRemainingSec <= 0) {
      setMfaMessage('Code expired. Request a new one.');
      return;
    }
    setMfaActionLoading(true);
    setMfaMessage('');
    try {
      await confirmAdminMfaDisable(token, mfaOtpPhase.sessionToken, code);
      cancelMfaFlow();
      setSuccess('Two-factor authentication has been disabled.');
      await loadMfaStatus();
    } catch (e) {
      setMfaMessage(e.message || 'Verification failed');
    } finally {
      setMfaActionLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setLoading(true);

    // Validate form
    const validationErrors = {};
    
    if (!formData.oldPassword) {
      validationErrors.oldPassword = 'Current password is required';
    }
    
    // All usage of validatePassword is commented out or removed
    // const passwordError = validatePassword(formData.newPassword);
    // if (passwordError) {
    //   validationErrors.newPassword = passwordError;
    // }
    
    if (formData.newPassword !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      // Get token from wherever you store it (localStorage, context, etc.)
      const token = localStorage.getItem('authToken'); // Adjust based on your auth setup
      
      await changePassword(
        token,
        formData.oldPassword,
        formData.newPassword,
        formData.confirmPassword
      );
      
      setSuccess('Password changed successfully!');
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-6">Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Password Change Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Key className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                {errors.submit}
              </div>
            )}
            
            {success && (
              <div className="text-green-500 text-sm p-2 bg-green-50 rounded">
                {success}
              </div>
            )}
            
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.old ? "text" : "password"}
                  id="oldPassword"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.oldPassword ? 'border-red-300' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('old')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.old ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.oldPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.oldPassword}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.newPassword ? 'border-red-300' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters with uppercase, lowercase, and special characters.
              </p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
        
        {/* Admin MFA */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Two-factor authentication (admin)</h3>
          </div>

          {mfaStatusLoading ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading security settings…
            </div>
          ) : mfaStatus ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {mfaStatus.mfaEnabled
                  ? 'Your admin account requires an email verification code when you sign in.'
                  : 'Add an extra step at sign-in: we will email you a one-time code.'}
              </p>
              {mfaStatus.mfaLocked && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded p-3">
                  Verification is temporarily locked after too many failed attempts. Try again later
                  {mfaStatus.mfaLockedUntil ? ` (until ${mfaStatus.mfaLockedUntil})` : ''}.
                </p>
              )}

              {!mfaOtpPhase ? (
                <div className="flex flex-wrap gap-3">
                  {!mfaStatus.mfaEnabled ? (
                    <button
                      type="button"
                      onClick={handleRequestEnable}
                      disabled={mfaActionLoading || mfaStatus.mfaLocked}
                      className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {mfaActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      Enable 2FA
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestDisable}
                      disabled={mfaActionLoading || mfaStatus.mfaLocked}
                      className="inline-flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm font-medium"
                    >
                      {mfaActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                      Disable 2FA
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 border border-indigo-100 bg-white rounded-lg p-4">
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0" />
                    <p>
                      An OTP has been sent to{' '}
                      <span className="font-medium text-gray-900">{mfaOtpPhase.maskedEmail}</span>{' '}
                      and will expire in{' '}
                      <span className={`font-mono font-semibold tabular-nums ${mfaRemainingSec <= 30 ? 'text-amber-600' : 'text-indigo-700'}`}>
                        {formatMmSs(mfaRemainingSec)}
                      </span>
                      .
                    </p>
                  </div>
                  <OtpSixDigitInput
                    idPrefix="settings-mfa-otp"
                    value={mfaOtpCode}
                    onChange={(v) => {
                      setMfaOtpCode(v);
                      if (mfaMessage) setMfaMessage('');
                    }}
                    onComplete={(c) =>
                      mfaOtpPhase.mode === 'enable' ? handleConfirmEnable(c) : handleConfirmDisable(c)
                    }
                    focusTrigger={mfaOtpPhase.sessionToken}
                    error={!!mfaMessage}
                    disabled={mfaActionLoading || mfaRemainingSec <= 0}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={mfaOtpPhase.mode === 'enable' ? handleConfirmEnable : handleConfirmDisable}
                      disabled={
                        mfaActionLoading ||
                        mfaRemainingSec <= 0 ||
                        mfaOtpCode.length !== 6
                      }
                      className="inline-flex items-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {mfaActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={cancelMfaFlow}
                      disabled={mfaActionLoading}
                      className="inline-flex items-center gap-2 border border-gray-300 bg-white py-2 px-4 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={
                        mfaOtpPhase.mode === 'enable'
                          ? handleRequestEnable
                          : handleRequestDisable
                      }
                      disabled={mfaActionLoading}
                      className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                    >
                      Resend code
                    </button>
                  </div>
                </div>
              )}

              {mfaMessage ? (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-2">{mfaMessage}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Sign in as an admin to manage two-factor authentication.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;