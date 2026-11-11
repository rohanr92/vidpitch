'use client'
import React from 'react'
import clsx from 'clsx'

type ButtonProps = {
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary', size = 'md', children, onClick,
  href, className, disabled, type = 'button', fullWidth,
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-[10px] transition-all duration-150 cursor-pointer select-none'
  const sizes = { sm: 'px-4 py-2 text-[13px]', md: 'px-5 py-[9px] text-[14px]', lg: 'px-8 py-[14px] text-[15px]' }
  const variants = {
    primary: 'bg-[#00E5A0] text-black hover:opacity-85 hover:-translate-y-[1px] shadow-[0_0_24px_rgba(0,229,160,0.25)]',
    ghost: 'bg-transparent text-[#F0F2F7] border border-white/[0.07] hover:border-white/20 hover:bg-white/[0.04]',
  }
  const classes = clsx(base, sizes[size], variants[variant], fullWidth && 'w-full', disabled && 'opacity-40 pointer-events-none', className)

  if (href) return <a href={href} className={classes}>{children}</a>
  return <button type={type} onClick={onClick} disabled={disabled} className={classes}>{children}</button>
}