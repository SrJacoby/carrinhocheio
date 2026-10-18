
import type {
  InputHTMLAttributes,
  ReactNode
} from 'react'

import { useId } from 'react'
import './FormField.css'

type FormFieldProps =
  InputHTMLAttributes<HTMLInputElement> & {
    label: string
    hint?: string
    error?: string
    icon?: ReactNode
  }

export default function FormField({
  label,
  hint,
  error,
  icon,
  id,
  className = '',
  ...props
}: FormFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`

  return (
    <div className={`ui-form-field ${className}`}>
      <label
        className="ui-form-field__label"
        htmlFor={inputId}
      >
        {label}
      </label>

      <div className="ui-form-field__control">
        {icon && (
          <span className="ui-form-field__icon">
            {icon}
          </span>
        )}

        <input
          {...props}
          id={inputId}
          className={
            icon
              ? 'ui-form-field__input ui-form-field__input--icon'
              : 'ui-form-field__input'
          }
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? errorId
              : hint
                ? hintId
                : undefined
          }
        />
      </div>

      {error ? (
        <small
          id={errorId}
          className="ui-form-field__error"
        >
          {error}
        </small>
      ) : hint ? (
        <small
          id={hintId}
          className="ui-form-field__hint"
        >
          {hint}
        </small>
      ) : null}
    </div>
  )
}
