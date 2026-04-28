import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from '../common/Select';
import Input from '../common/Input';
import { useFormStore } from '../../store/formStore';
import { getStep1Schema, LOAN_LIMITS, TENURE_RANGES, LOAN_PURPOSES } from '../../schemas/allSchemas';
import { calculateEMI, formatINR } from '../../utils/validators';

const LOAN_TYPES = [
  { id: 'Personal', icon: '💳', label: 'Personal Loan', desc: 'Up to ₹10 Lakh' },
  { id: 'Home', icon: '🏠', label: 'Home Loan', desc: 'Up to ₹1 Crore' },
  { id: 'Business', icon: '💼', label: 'Business Loan', desc: 'Up to ₹50 Lakh' },
];

export default function Step1LoanType({ onNext }) {
  const { state, dispatch } = useFormStore();
  const schema = getStep1Schema(state);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      loanType: state.loanType,
      loanAmount: state.loanAmount,
      loanTenure: state.loanTenure,
      loanPurpose: state.loanPurpose,
      referralCode: state.referralCode,
    },
  });

  const loanType = watch('loanType');
  const loanAmount = watch('loanAmount');
  const loanTenure = watch('loanTenure');
  const limits = LOAN_LIMITS[loanType] || LOAN_LIMITS.Personal;
  const tenureRange = TENURE_RANGES[loanType] || TENURE_RANGES.Personal;

  // Build tenure options
  const tenureOptions = [];
  for (let m = tenureRange.min; m <= tenureRange.max; m += tenureRange.step) {
    const y = Math.floor(m / 12), mo = m % 12;
    tenureOptions.push({ value: String(m), label: y > 0 ? `${y}Y${mo ? ` ${mo}M` : ''}` : `${mo}M` });
  }

  const emi = (loanAmount && loanTenure) ? calculateEMI(loanAmount, loanTenure, loanType) : null;

  // Reset tenure/purpose when loan type changes
  useEffect(() => {
    if (loanType !== state.loanType) {
      setValue('loanTenure', '');
      setValue('loanPurpose', '');
    }
  }, [loanType, state.loanType, setValue]);

  const onSubmit = (data) => {
    dispatch({ type: 'UPDATE_FIELDS', fields: data });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="animate-fade-in">
      <div className="card mb-4">
        <h2 className="text-base font-600 text-gray-800 mb-1">Select Loan Type</h2>
        <p className="text-xs text-gray-500 mb-4">Choose the loan product that fits your needs</p>

        <div className="flex gap-3 mb-1">
          {LOAN_TYPES.map(lt => (
            <button
              key={lt.id}
              type="button"
              onClick={() => setValue('loanType', lt.id, { shouldValidate: true })}
              className={`loan-type-card ${loanType === lt.id ? 'selected' : ''}`}
              aria-pressed={loanType === lt.id}
            >
              <span className="text-2xl">{lt.icon}</span>
              <span className="text-sm font-500 text-gray-800">{lt.label}</span>
              <span className="text-xs text-gray-400">{lt.desc}</span>
            </button>
          ))}
        </div>
        <input type="hidden" {...register('loanType')} />
        {errors.loanType && <p className="field-error mt-1" role="alert">{errors.loanType.message}</p>}
      </div>

      {loanType && (
        <div className="card mb-4 animate-fade-in">
          <h2 className="text-base font-600 text-gray-800 mb-4">Loan Details</h2>

          <div className="grid grid-cols-2 gap-3">
            <Input
              {...register('loanAmount')}
              id="loanAmount"
              label="Loan Amount (₹)"
              type="number"
              required
              placeholder={`Min ${formatINR(limits.min)}`}
              min={limits.min}
              max={limits.max}
              error={errors.loanAmount?.message}
              helpText={limits.label}
            />
            <Select
              {...register('loanTenure')}
              id="loanTenure"
              label="Loan Tenure"
              required
              placeholder="Select tenure"
              options={tenureOptions}
              error={errors.loanTenure?.message}
            />
          </div>

          <Select
            {...register('loanPurpose')}
            id="loanPurpose"
            label="Loan Purpose"
            required
            placeholder="Select purpose"
            options={LOAN_PURPOSES[loanType] || []}
            error={errors.loanPurpose?.message}
          />

          <Input
            {...register('referralCode')}
            id="referralCode"
            label="Referral Code"
            placeholder="6–10 character code"
            error={errors.referralCode?.message}
          />

          {emi && (
            <div className="emi-card animate-fade-in">
              <p className="text-xs font-500 opacity-75 mb-3 uppercase tracking-wide">EMI Preview</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Monthly EMI', formatINR(emi.emi)],
                  ['Interest Rate', `${emi.annualRate}% p.a.`],
                  ['Total Amount', formatINR(emi.totalAmount)],
                  ['Processing Fee', formatINR(emi.processingFee)],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-xs opacity-60">{l}</p>
                    <p className="text-sm font-600">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button type="submit" className="btn-primary w-full py-3">
        Continue →
      </button>
    </form>
  );
}
