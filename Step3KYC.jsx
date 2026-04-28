import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../common/Input';
import { useFormStore } from '../../store/formStore';
import { getStep3Schema } from '../../schemas/allSchemas';
import { validatePAN, validateAadhaar } from '../../utils/validators';

function VerifyBadge({ status }) {
  if (status === 'verifying') return <p className="text-xs text-warning mt-1 flex items-center gap-1"><span className="animate-spin">⏳</span> Verifying with NSDL/UIDAI...</p>;
  if (status === 'verified') return <p className="verified-badge"><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="6" fill="#27AE60"/><path d="M3 6l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Verified</p>;
  return null;
}

export default function Step3KYC({ onNext, onPrev }) {
  const { state, dispatch } = useFormStore();
  const [panStatus, setPanStatus] = useState(state.panVerified ? 'verified' : 'idle');
  const [aadhaarStatus, setAadhaarStatus] = useState(state.aadhaarVerified ? 'verified' : 'idle');

  const schema = getStep3Schema(state.loanType);
  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      pan: state.pan, panVerified: state.panVerified,
      aadhaar: state.aadhaar, aadhaarVerified: state.aadhaarVerified,
      aadhaarConsent: state.aadhaarConsent,
      voterId: state.voterId, passport: state.passport,
    },
  });

  const aadhaarConsent = watch('aadhaarConsent');

  const handlePanBlur = async (e) => {
    const val = e.target.value.toUpperCase();
    setValue('pan', val);
    if (!val || val.length < 10) return;
    const result = validatePAN(val, state.loanType);
    if (!result.valid) { setPanStatus('idle'); return; }
    setPanStatus('verifying');
    await new Promise(r => setTimeout(r, 1500));
    setPanStatus('verified');
    setValue('panVerified', true, { shouldValidate: true });
    dispatch({ type: 'UPDATE_FIELDS', fields: { pan: val, panVerified: true } });
  };

  const handleAadhaarBlur = async (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setValue('aadhaar', val);
    if (val.length < 12) return;
    const result = validateAadhaar(val);
    if (!result.valid) { setAadhaarStatus('idle'); return; }
    setAadhaarStatus('verifying');
    await new Promise(r => setTimeout(r, 1500));
    setAadhaarStatus('verified');
    setValue('aadhaarVerified', true, { shouldValidate: true });
    dispatch({ type: 'UPDATE_FIELDS', fields: { aadhaar: val, aadhaarVerified: true } });
  };

  const onSubmit = (data) => {
    dispatch({ type: 'UPDATE_FIELDS', fields: data });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="animate-fade-in">
      <div className="card mb-4">
        <h2 className="text-base font-600 text-gray-800 mb-1">Identity Verification (KYC)</h2>
        <p className="text-xs text-gray-500 mb-3">PAN and Aadhaar verification required as per RBI guidelines</p>

        <div className="info-banner info mb-4">
          🔒 This is a simulation. No real data is sent to NSDL or UIDAI. Your data is encrypted locally.
        </div>

        <div className="mb-4">
          <Input
            {...register('pan')}
            id="pan"
            label="PAN Number"
            required
            placeholder="ABCDE1234F"
            maxLength={10}
            style={{ textTransform: 'uppercase' }}
            onBlur={handlePanBlur}
            onChange={e => { e.target.value = e.target.value.toUpperCase(); }}
            verified={panStatus === 'verified'}
            error={errors.pan?.message || errors.panVerified?.message}
            helpText="Format: 5 letters + 4 digits + 1 letter (4th char = P for Individual)"
          />
          <VerifyBadge status={panStatus} />
        </div>
        <input type="hidden" {...register('panVerified')} />

        <div className="mb-4">
          <Input
            {...register('aadhaar')}
            id="aadhaar"
            label="Aadhaar Number"
            required
            placeholder="12-digit Aadhaar number"
            maxLength={12}
            onBlur={handleAadhaarBlur}
            verified={aadhaarStatus === 'verified'}
            error={errors.aadhaar?.message || errors.aadhaarVerified?.message}
            helpText="Only last 4 digits shown after verification"
          />
          <VerifyBadge status={aadhaarStatus} />
        </div>
        <input type="hidden" {...register('aadhaarVerified')} />

        <div className="consent-box mb-4">
          <input
            type="checkbox"
            id="aadhaarConsent"
            className="mt-0.5 w-4 h-4 cursor-pointer accent-brand-primary"
            {...register('aadhaarConsent')}
          />
          <label htmlFor="aadhaarConsent" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
            I consent to LendSwift verifying my Aadhaar with UIDAI for KYC purposes under the
            Aadhaar Act 2016 and RBI Digital Lending Guidelines (DL/2022/01).{' '}
            <strong className="text-gray-800">This consent is mandatory.</strong>
          </label>
        </div>
        {errors.aadhaarConsent && <p className="field-error -mt-2 mb-3" role="alert">{errors.aadhaarConsent.message}</p>}
      </div>

      <div className="card mb-4">
        <h2 className="text-base font-600 text-gray-800 mb-1">Additional ID (Optional)</h2>
        <p className="text-xs text-gray-500 mb-4">Provide additional identification if available</p>
        <div className="grid grid-cols-2 gap-3">
          <Input {...register('voterId')} id="voterId" label="Voter ID" placeholder="ABC1234567" error={errors.voterId?.message} />
          <Input {...register('passport')} id="passport" label="Passport Number" placeholder="A1234567" error={errors.passport?.message} />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onPrev} className="btn-secondary flex-1 py-3">← Previous</button>
        <button type="submit" className="btn-primary flex-1 py-3">Continue →</button>
      </div>
    </form>
  );
}
