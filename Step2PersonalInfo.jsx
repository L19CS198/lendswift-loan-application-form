import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../common/Input';
import Select from '../common/Select';
import RadioGroup from '../common/RadioGroup';
import { useFormStore } from '../../store/formStore';
import { step2Schema } from '../../schemas/allSchemas';

const MAX_DOB = new Date(Date.now() - 21 * 365.25 * 24 * 3600000).toISOString().split('T')[0];
const MIN_DOB = new Date(Date.now() - 65 * 365.25 * 24 * 3600000).toISOString().split('T')[0];

export default function Step2PersonalInfo({ onNext, onPrev }) {
  const { state, dispatch } = useFormStore();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      fullName: state.fullName, dob: state.dob, gender: state.gender,
      maritalStatus: state.maritalStatus, fatherName: state.fatherName,
      motherName: state.motherName, email: state.email,
      mobile: state.mobile, alternateMobile: state.alternateMobile,
    },
  });

  const gender = watch('gender');

  const onSubmit = (data) => {
    dispatch({ type: 'UPDATE_FIELDS', fields: data });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="animate-fade-in">
      <div className="card mb-4">
        <h2 className="text-base font-600 text-gray-800 mb-1">Personal Information</h2>
        <p className="text-xs text-gray-500 mb-4">As per your PAN card and official documents</p>

        <Input {...register('fullName')} id="fullName" label="Full Name (as per PAN)" required placeholder="Enter your full name" autoComplete="given-name" error={errors.fullName?.message} />

        <div className="grid grid-cols-2 gap-3">
          <Input {...register('dob')} id="dob" label="Date of Birth" type="date" required min={MIN_DOB} max={MAX_DOB} autoComplete="bday" error={errors.dob?.message} helpText="Age must be 21–65 years" />
          <Select {...register('maritalStatus')} id="maritalStatus" label="Marital Status" required placeholder="Select" options={['Single','Married','Divorced','Widowed']} error={errors.maritalStatus?.message} />
        </div>

        <RadioGroup
          name="gender" label="Gender" required
          options={['Male','Female','Other']}
          value={gender}
          onChange={v => setValue('gender', v, { shouldValidate: true })}
          error={errors.gender?.message}
        />
        <input type="hidden" {...register('gender')} />

        <div className="grid grid-cols-2 gap-3">
          <Input {...register('fatherName')} id="fatherName" label="Father's Name" required placeholder="Father's full name" error={errors.fatherName?.message} />
          <Input {...register('motherName')} id="motherName" label="Mother's Name" required placeholder="Mother's full name" error={errors.motherName?.message} />
        </div>
      </div>

      <div className="card mb-4">
        <h2 className="text-base font-600 text-gray-800 mb-4">Contact Details</h2>

        <Input {...register('email')} id="email" label="Email Address" type="email" required placeholder="you@example.com" autoComplete="email" error={errors.email?.message} />

        <div className="grid grid-cols-2 gap-3">
          <Input {...register('mobile')} id="mobile" label="Mobile Number" type="tel" required placeholder="10-digit mobile" maxLength={10} autoComplete="tel" error={errors.mobile?.message} helpText="Starting with 6, 7, 8 or 9" />
          <Input {...register('alternateMobile')} id="alternateMobile" label="Alternate Mobile" type="tel" placeholder="Optional" maxLength={10} error={errors.alternateMobile?.message} />
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onPrev} className="btn-secondary flex-1 py-3">← Previous</button>
        <button type="submit" className="btn-primary flex-1 py-3">Continue →</button>
      </div>
    </form>
  );
}
