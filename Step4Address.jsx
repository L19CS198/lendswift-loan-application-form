import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '../common/Input';
import Select from '../common/Select';
import { useFormStore } from '../../store/formStore';
import { step4Schema } from '../../schemas/allSchemas';
import { lookupPinCode } from '../../utils/pinCodeData';

function AddressBlock({ prefix, register, errors, watch, setValue, label }) {
  const [lookingUp, setLookingUp] = useState(false);
  const residenceType = watch(`${prefix}.residenceType`);

  const handlePinBlur = async (e) => {
    const pin = e.target.value;
    if (pin.length !== 6) return;
    setLookingUp(true);
    const result = await lookupPinCode(pin);
    setLookingUp(false);
    if (result.found) {
      setValue(`${prefix}.city`, result.city, { shouldValidate: true });
      setValue(`${prefix}.state`, result.state, { shouldValidate: true });
    }
  };

  const getErr = (field) => {
    const parts = field.split('.');
    let e = errors;
    for (const p of parts) e = e?.[p];
    return e?.message;
  };

  return (
    <div>
      <h3 className="text-sm font-500 text-gray-700 mb-3">{label}</h3>
      <Input
        {...register(`${prefix}.line1`)}
        id={`${prefix}-line1`}
        label="Address Line 1"
        required
        placeholder="House/Flat No, Street, Area"
        autoComplete="address-line1"
        error={getErr(`${prefix}.line1`)}
      />
      <Input
        {...register(`${prefix}.line2`)}
        id={`${prefix}-line2`}
        label="Address Line 2"
        placeholder="Landmark, Colony (optional)"
        autoComplete="address-line2"
        error={getErr(`${prefix}.line2`)}
      />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Input
            {...register(`${prefix}.pinCode`)}
            id={`${prefix}-pinCode`}
            label="PIN Code"
            required
            placeholder="6 digits"
            maxLength={6}
            autoComplete="postal-code"
            onBlur={handlePinBlur}
            error={getErr(`${prefix}.pinCode`)}
            suffix={lookingUp ? '⏳' : undefined}
            helpText="Auto-fills city & state"
          />
        </div>
        <Input
          {...register(`${prefix}.city`)}
          id={`${prefix}-city`}
          label="City"
          required
          placeholder="City name"
          autoComplete="address-level2"
          error={getErr(`${prefix}.city`)}
        />
        <Input
          {...register(`${prefix}.state`)}
          id={`${prefix}-state`}
          label="State"
          required
          placeholder="State name"
          autoComplete="address-level1"
          error={getErr(`${prefix}.state`)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select
          {...register(`${prefix}.residenceType`)}
          id={`${prefix}-residenceType`}
          label="Residence Type"
          required
          placeholder="Select type"
          options={['Owned','Rented','Company Provided','Family Owned']}
          error={getErr(`${prefix}.residenceType`)}
        />
        {residenceType === 'Rented' && (
          <Input
            {...register(`${prefix}.rentAmount`)}
            id={`${prefix}-rentAmount`}
            label="Monthly Rent (₹)"
            type="number"
            placeholder="e.g. 15000"
            error={getErr(`${prefix}.rentAmount`)}
          />
        )}
      </div>
      <Input
        {...register(`${prefix}.yearsAtAddress`)}
        id={`${prefix}-yearsAtAddress`}
        label="Years at This Address"
        type="number"
        placeholder="0–50"
        min={0} max={50}
        error={getErr(`${prefix}.yearsAtAddress`)}
      />
    </div>
  );
}

export default function Step4Address({ onNext, onPrev }) {
  const { state, dispatch } = useFormStore();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      currentAddress: state.currentAddress,
      sameAsPermanent: state.sameAsPermanent,
      permanentAddress: state.permanentAddress,
    },
  });

  const sameAsPermanent = watch('sameAsPermanent');

  const onSubmit = (data) => {
    dispatch({ type: 'UPDATE_FIELDS', fields: data });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="animate-fade-in">
      <div className="card mb-4">
        <h2 className="text-base font-600 text-gray-800 mb-1">Address Information</h2>
        <p className="text-xs text-gray-500 mb-4">Enter PIN code to auto-fill city and state</p>

        <AddressBlock
          prefix="currentAddress"
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          label="Current Residential Address"
        />

        <div className="consent-box my-4">
          <input
            type="checkbox"
            id="sameAsPermanent"
            className="mt-0.5 w-4 h-4 cursor-pointer accent-brand-primary"
            {...register('sameAsPermanent')}
          />
          <label htmlFor="sameAsPermanent" className="text-sm font-500 cursor-pointer">
            Permanent address is same as current address
          </label>
        </div>

        {!sameAsPermanent && (
          <div className="animate-fade-in border-t border-gray-100 pt-4 mt-2">
            <AddressBlock
              prefix="permanentAddress"
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              label="Permanent Address"
            />
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onPrev} className="btn-secondary flex-1 py-3">← Previous</button>
        <button type="submit" className="btn-primary flex-1 py-3">Continue →</button>
      </div>
    </form>
  );
}
