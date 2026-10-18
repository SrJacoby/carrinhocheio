
import type {
  ComponentPropsWithRef,
  ReactNode
} from 'react'

import './Button.css'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'ghost'

type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: ButtonVariant
  icon?: ReactNode
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  icon,
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  ref,
  ...props
}: ButtonProps) {
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    fullWidth ? 'ui-button--full' : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      className={classes}
    >
      {icon && (
        <span className="ui-button__icon">
          {icon}
        </span>
      )}

      <span>{children}</span>
    </button>
  )
}
