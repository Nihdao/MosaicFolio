'use client'

import { useState } from 'react'
import type { CSSProperties } from 'react'
import NextImage from 'next/image'
import { X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import type { PortfolioImage } from '@/lib/content'
import EditableImageLabel from '@/components/editor/EditableImageLabel'

interface ImageTileProps {
  image: PortfolioImage
  devMode?: boolean
}

const tileStyle: CSSProperties = {
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-tile)',
}

function ImageLightbox({
  open,
  onOpenChange,
  src,
  alt,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  alt: string
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10050,
            background: 'rgba(0,0,0,0.88)',
            animation: 'lightbox-in 0.2s ease-out',
          }}
        />
        <Dialog.Content
          aria-label={alt || 'Image preview'}
          onClick={() => onOpenChange(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10051,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            outline: 'none',
          }}
        >
          <style>{`
            @keyframes lightbox-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes lightbox-img-in {
              from { opacity: 0; transform: scale(0.95); }
              to   { opacity: 1; transform: scale(1); }
            }
          `}</style>
          <Dialog.Close
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: 9999,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            <X size={18} />
          </Dialog.Close>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 8,
              cursor: 'default',
              animation: 'lightbox-img-in 0.25s ease-out',
            }}
          />
          <Dialog.Title style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            {alt || 'Image preview'}
          </Dialog.Title>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default function ImageTile({ image, devMode }: ImageTileProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!devMode && !image.label) {
    return (
      <>
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="tile-interactive relative w-full h-full min-h-[var(--tile-row-height)] overflow-hidden transition-[transform] duration-[var(--tile-hover-duration)] ease-[var(--tile-hover-easing)] hover:-translate-y-0.5 cursor-zoom-in"
          style={tileStyle}
          aria-label="Open image"
        >
          <NextImage
            src={image.src}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        </button>
        <ImageLightbox open={lightboxOpen} onOpenChange={setLightboxOpen} src={image.src} alt="" />
      </>
    )
  }

  if (devMode) {
    return (
      <div
        className="relative w-full h-full min-h-[var(--tile-row-height)] overflow-hidden"
        style={tileStyle}
      >
        <NextImage
          src={image.src}
          alt={image.label ?? ''}
          fill
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
          <span className="absolute bottom-0 left-0 p-4 text-white text-sm font-medium">
            <EditableImageLabel image={image} />
          </span>
        </div>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="tile-interactive relative w-full h-full min-h-[var(--tile-row-height)] overflow-hidden group transition-[transform] duration-[var(--tile-hover-duration)] ease-[var(--tile-hover-easing)] hover:-translate-y-0.5 cursor-zoom-in"
        style={tileStyle}
        aria-label={`Open image — ${image.label}`}
      >
        <NextImage
          src={image.src}
          alt={image.label ?? ''}
          fill
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
          <span className="absolute bottom-0 left-0 p-4 text-white text-sm font-medium">
            {image.label}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-[var(--tile-hover-duration)]" />
      </button>
      <ImageLightbox open={lightboxOpen} onOpenChange={setLightboxOpen} src={image.src} alt={image.label ?? ''} />
    </>
  )
}
