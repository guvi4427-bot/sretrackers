'use client'
import { useEffect } from 'react'

interface AdUnitProps {
  slot: string
  format?: string
  style?: React.CSSProperties
}

export default function AdUnit({ slot, format = 'auto', style }: AdUnitProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {}
  }, [])

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client="ca-pub-7745236489664493"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
