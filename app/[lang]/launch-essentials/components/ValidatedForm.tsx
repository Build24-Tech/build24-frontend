'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useErrorHandling, ValidationRule } from '@/hooks/use-error-handling';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Save } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Controller, FieldValues, Path, useForm } from 'react-hook-form';
import { z } from 'zod';
import { FieldError, NetworkStatus } from './ErrorDisplay';
import { AsyncOperationStatus, LoadingSpinner } from './LoadingStates';

// Field configuration interface
export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: ValidationRule[];
  dependencies?: string[]; // Fields this field depends on
  conditional?: (values: any) => boolean; // Show field conditionally
  autoSave?: boolean;
  disabled?: boolean;
}

interface ValidatedFormProps<T extends FieldValues> {
  fields: FieldConfig[];
  schema: z.ZodSchema<T>;
  onSubmit: (data: T) => Promise<void>;
  onAutoSave?: (data: Partial<T>) => Promise<void>;
  defaultValues?: Partial<T>;
  title?: string;
  description?: string;
  submitLabel?: string;
  autoSaveDelay?: number;
  className?: string;
  disabled?: boolean;
}

export function ValidatedForm<T extends FieldValues>({
  fields,
  schema,
  onSubmit,
  onAutoSave,
  defaultValues,
  title,
  description,
  submitLabel = 'Submit',
  autoSaveDelay = 2000,
  className = '',
  disabled = false,
}: ValidatedFormProps<T>) {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, isDirty },
    setValue,
    getValues,
    trigger,
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onChange',
  });

  const {
    executeWithErrorHandling,
    isLoading,
    error,
    clearError,
    isOnline,
    validateField,
  } = useErrorHandling({
    onError: (error, errorId) => {
      console.error('Form error:', error, errorId);
    },
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const watchedValues = watch();

  // Auto-save functionality
  useEffect(() => {
    if (!onAutoSave || !isDirty || !isOnline) return;

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new timeout for auto-save
    const timeout = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        await onAutoSave(getValues());
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (error) {
        setAutoSaveStatus('error');
        console.error('Auto-save failed:', error);
      }
    }, autoSaveDelay);

    setAutoSaveTimeout(timeout);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [watchedValues, isDirty, onAutoSave, autoSaveDelay, isOnline]);

  // Field-level validation
  const validateFieldValue = useCallback((fieldName: string, value: any) => {
    const field = fields.find(f => f.name === fieldName);
    if (!field?.validation) return;

    const result = validateField(value, field.validation);

    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: result.errors[0] || '',
    }));

    return result;
  }, [fields, validateField]);

  // Handle form submission
  const handleFormSubmit = useCallback(async (data: T) => {
    clearError();

    const result = await executeWithErrorHandling(
      () => onSubmit(data),
      { formData: data }
    );

    if (result !== null) {
      setAutoSaveStatus('saved');
    }
  }, [onSubmit, executeWithErrorHandling, clearError]);

  // Render field based on type
  const renderField = useCallback((field: FieldConfig) => {
    const fieldError = errors[field.name as Path<T>]?.message || fieldErrors[field.name];
    const isFieldDisabled = disabled || field.disabled;

    // Check if field should be shown based on conditions
    if (field.conditional && !field.conditional(watchedValues)) {
      return null;
    }

    const commonProps = {
      disabled: isFieldDisabled,
      'aria-describedby': field.description ? `${field.name}-description` : undefined,
      'aria-invalid': !!fieldError,
    };

    const renderFieldInput = () => {
      switch (field.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'number':
          return (
            <Controller
              name={field.name as Path<T>}
              control={control}
              render={({ field: formField }) => (
                <Input
                  {...formField}
                  {...commonProps}
                  type={field.type}
                  placeholder={field.placeholder}
                  onChange={(e) => {
                    formField.onChange(e);
                    validateFieldValue(field.name, e.target.value);
                  }}
                />
              )}
            />
          );

        case 'textarea':
          return (
            <Controller
              name={field.name as Path<T>}
              control={control}
              render={({ field: formField }) => (
                <Textarea
                  {...formField}
                  {...commonProps}
                  placeholder={field.placeholder}
                  onChange={(e) => {
                    formField.onChange(e);
                    validateFieldValue(field.name, e.target.value);
                  }}
                />
              )}
            />
          );

        case 'select':
          return (
            <Controller
              name={field.name as Path<T>}
              control={control}
              render={({ field: formField }) => (
                <Select
                  value={formField.value}
                  onValueChange={(value) => {
                    formField.onChange(value);
                    validateFieldValue(field.name, value);
                  }}
                  disabled={isFieldDisabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          );

        case 'checkbox':
          return (
            <Controller
              name={field.name as Path<T>}
              control={control}
              render={({ field: formField }) => (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.name}
                    checked={formField.value}
                    onCheckedChange={(checked) => {
                      formField.onChange(checked);
                      validateFieldValue(field.name, checked);
                    }}
                    disabled={isFieldDisabled}
                  />
                  <Label htmlFor={field.name} className="text-sm font-normal">
                    {field.label}
                  </Label>
                </div>
              )}
            />
          );

        case 'radio':
          return (
            <Controller
              name={field.name as Path<T>}
              control={control}
              render={({ field: formField }) => (
                <RadioGroup
                  value={formField.value}
                  onValueChange={(value) => {
                    formField.onChange(value);
                    validateFieldValue(field.name, value);
                  }}
                  disabled={isFieldDisabled}
                >
                  {field.options?.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`${field.name}-${option.value}`} />
                      <Label htmlFor={`${field.name}-${option.value}`} className="text-sm font-normal">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          );

        default:
          return null;
      }
    };

    return (
      <div key={field.name} className="space-y-2">
        {field.type !== 'checkbox' && (
          <Label htmlFor={field.name} className="text-sm font-medium">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        {renderFieldInput()}

        {field.description && (
          <p id={`${field.name}-description`} className="text-xs text-muted-foreground">
            {field.description}
          </p>
        )}

        <FieldError
          error={fieldError}
          suggestions={field.validation ? validateField(watchedValues[field.name], field.validation).suggestions : []}
        />
      </div>
    );
  }, [control, errors, fieldErrors, watchedValues, disabled, validateFieldValue, validateField]);

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <NetworkStatus isOnline={isOnline} />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {fields.map(renderField)}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              {onAutoSave && (
                <AsyncOperationStatus
                  operation="Auto-save"
                  status={autoSaveStatus}
                  className="text-xs"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              {isLoading && <LoadingSpinner size="sm" />}

              <Button
                type="submit"
                disabled={disabled || isLoading || !isValid}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {submitLabel}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Pre-configured form for common use cases
export function LaunchEssentialsForm<T extends FieldValues>(props: ValidatedFormProps<T>) {
  return (
    <ValidatedForm
      {...props}
      autoSaveDelay={1500}
      className={`max-w-2xl ${props.className || ''}`}
    />
  );
}
