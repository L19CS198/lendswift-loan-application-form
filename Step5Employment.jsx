import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../common/Input';
import Select from '../common/Select';
import RadioGroup from '../common/RadioGroup';
import { useFormStore } from '../../store/formStore';
import { getStep5Schema } from '../../schemas/allSchemas';
import { calculateEMI, formatINR } from '../../utils/validators';

const BUSINESS_TYPES = ['Proprietorship','Partnership','LLP','Private Limited','Public Limited','NGO/Trust','Other'];

export default function Step5Employment({ onNext, onPrev }) {
  const { state, dispatch } = useFormStore();
  const schema = getStep5Schema(state);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      employmentType: state.employmentType,
      companyName: state.companyName, designation: state.designation,
      monthlySalary: state.monthlySalary, yearsOfExperience: state.yearsOfExperience,
      businessName: state.businessName, businessType: state.businessType,
      gstNumber: state.gstNumber, annualTurnover: state.annualTurnover,
      yearsInBusiness: state.yearsInBusiness, monthlyIncome: state.monthlyIncome,
      officeAddress: state.officeAddress,
    },
  });

  const employmentType = watch('employmentType');
  const monthlySalary = watch('monthlySalary') || watch('monthlyIncome');

  const emi = calculateEMI(state.loanAmount, state.loanTenure, state.loanType);
  const income = parseInt(monthlySalary) || 0;
  const emiRatio = income > 0 ? Math.round((emi.emi / income) * 100) : 0;

  const onSubmit = (data) => {
    dispatch({ type: 'UPDATE_FIELDS', fields: data });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="animate-fade-in">
      <div className="card mb-4">
        <h2 className="text-base font-600 text-gray-800 mb-1">Employment & Income</h2>
        <p className="text-xs text-gray-500 mb-4">Your current employment status determines required documents</p>

        {state.loanType === 'Business' && (
          <div className="info-banner warning mb-4">
            ⚠ Business loans require <strong>Self-Employed</strong> or <strong>Business Owner</strong> status.
          </div>
        )}

        <RadioGroup
          name="employmentType"
          label="Employment Type"
          required
          options={['Salaried', 'Self-Employed', 'Business Owner']}
          value={employmentType}
          onChange={v => setValue('employmentType', v, { shouldValidate: true })}
          error={errors.employmentType?.message || errors['']?.message}
          layout="horizontal"
        />
        <input type="hidden" {...register('employmentType')} />
        {errors[''] && <p className="field-error mb-3" role="alert">{errors[''].message}</p>}
      </div>

      {employmentType === 'Salaried' && (
        <div className="card mb-4 animate-fade-in">
          <h3 className="text-sm font-600 text-gray-700 mb-4 uppercase tracking-wide text-xs text-brand-primary">Salaried Details</h3>
          <Input {...register('companyName')} id="companyName" label="Company Name" required placeholder="Your employer's name" error={errors.companyName?.message} />
          <div className="grid grid-cols-2 gap-3">
            <Input {...register('designation')} id="designation" label="Designation" required placeholder="Your job title" error={errors.designation?.message} />
            <Input {...register('yearsOfExperience')} id="yearsOfExperience" label="Years of Experience" type="number" required placeholder="0–50" min={0} max={50} error={errors.yearsOfExperience?.message} />
          </div>
          <Input {...register('monthlySalary')} id="monthlySalary" label="Monthly Net Salary (₹)" type="number" required placeholder="Min ₹15,000" min={15000} error={errors.monthlySalary?.message} />
        </div>
      )}

      {employmentType === 'Self-Employed' && (
        <div className="card mb-4 animate-fade-in">
          <h3 className="text-xs font-600 text-brand-primary mb-4 uppercase tracking-wide">Self-Employment Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input {...register('businessName')} id="businessName" label="Business Name" required placeholder="Your business" error={errors.businessName?.message} />
            <Select {...register('businessType')} id="businessType" label="Business Type" required placeholder="Select type" options={BUSINESS_TYPES} error={errors.businessType?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input {...register('annualTurnover')} id="annualTurnover" label="Annual Turnover (₹)" type="number" required placeholder="Min ₹3,00,000" min={300000} error={errors.annualTurnover?.message} />
            <Input {...register('yearsInBusiness')} id="yearsInBusiness" label="Years in Business" type="number" required placeholder="Min 2 years" min={2} error={errors.yearsInBusiness?.message} />
          </div>
          <Input {...register('monthlyIncome')} id="monthlyIncome" label="Monthly Net Income (₹)" type="number" required placeholder="Min ₹10,000" min={10000} error={errors.monthlyIncome?.message} />
          <Input {...register('officeAddress')} id="officeAddress" label="Office/Business Address" required placeholder="Complete office address" error={errors.officeAddress?.message} />
        </div>
      )}

      {employmentType === 'Business Owner' && (
        <div className="card mb-4 animate-fade-in">
          <h3 className="text-xs font-600 text-brand-primary mb-4 uppercase tracking-wide">Business Owner Details</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input {...register('businessName')} id="businessName" label="Registered Business Name" required error={errors.businessName?.message} />
            <Select {...register('businessType')} id="businessType" label="Business Type" required placeholder="Select type" options={BUSINESS_TYPES} error={errors.businessType?.message} />
          </div>
          <Input {...register('gstNumber')} id="gstNumber" label="GST Number" required placeholder="37ABCDE1234F1Z5" maxLength={15} style={{ fontFamily: 'monospace', textTransform: 'uppercase' }} error={errors.gstNumber?.message} helpText="15-character GST registration number" />
          <div className="grid grid-cols-2 gap-3">
            <Input {...register('annualTurnover')} id="annualTurnover" label="Annual Turnover (₹)" type="number" required placeholder="Min ₹3,00,000" min={300000} error={errors.annualTurnover?.message} />
            <Input {...register('yearsInBusiness')} id="yearsInBusiness" label="Years in Business" type="number" required placeholder="Min 2" min={2} error={errors.yearsInBusiness?.message} />
          </div>
          <Input {...register('monthlyIncome')} id="monthlyIncome" label="Monthly Net Income (₹)" type="number" required placeholder="Min ₹10,000" min={10000} error={errors.monthlyIncome?.message} />
          <Input {...register('officeAddress')} id="officeAddress" label="Registered Office Address" required error={errors.officeAddress?.message} />
        </div>
      )}

      {income > 0 && emi.emi > 0 && (
        <div className={`info-banner ${emiRatio > 50 ? 'warning' : 'success'} mb-4`}>
          {emiRatio > 50 ? '⚠' : '✓'} <strong>EMI-to-Income Ratio: {emiRatio}%</strong>
          {emiRatio > 50
            ? ` — Exceeds 50% threshold. EMI: ${formatINR(emi.emi)} vs Income: ${formatINR(income)}`
            : ` — Within acceptable range. EMI: ${formatINR(emi.emi)} vs Income: ${formatINR(income)}`}
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onPrev} className="btn-secondary flex-1 py-3">← Previous</button>
        <button type="submit" className="btn-primary flex-1 py-3">Continue →</button>
      </div>
    </form>
  );
}
