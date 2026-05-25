'use client'

import * as React from 'react'
import { Dialog } from 'radix-ui'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const DialogRoot = Dialog.Root
const DialogTrigger = Dialog.Trigger
const DialogPortal = Dialog.Portal
const DialogClose = Dialog.Close

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof Dialog.Overlay>,
  React.ComponentPropsWithoutRef<typeof Dialog.Overlay>
>(({ className, style, ...props }, ref) => (
  <Dialog.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 backdrop-blur-sm', className)}
    style={{ background: 'var(--overlay)', ...style }}
    {...props}
  />
))
DialogOverlay.displayName = 'DialogOverlay'

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, children, style, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <Dialog.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 w-[calc(100%-24px)] sm:w-full sm:max-w-lg',
        'max-h-[85vh] overflow-y-auto p-5 sm:p-6',
        'data-[state=open]:animate-dialog-enter',
        'data-[state=closed]:animate-dialog-exit',
        className,
      )}
      style={{
        transform: 'translate(-50%, -50%)',
        background: 'var(--card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-modal)',
        ...style,
      }}
      {...props}
    >
      {children}
    </Dialog.Content>
  </DialogPortal>
))
DialogContent.displayName = 'DialogContent'

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-2 mb-4', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn('text-[1.125rem] font-semibold text-[--foreground] leading-[1.3]', className)}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

export {
  DialogRoot as Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
}

export function DialogCloseButton({ className }: { className?: string }) {
  return (
    <DialogClose
      aria-label="Close"
      className={cn(
        'absolute top-4 right-4 flex items-center justify-center w-8 h-8',
        'rounded-full hover:bg-[--muted] text-[--muted-foreground]',
        'hover:text-[--foreground] transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent]',
        className,
      )}
    >
      <X size={16} aria-hidden />
    </DialogClose>
  )
}
