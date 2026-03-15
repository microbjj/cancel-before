import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

type LogoSize = 's' | 'm' | 'l'

const SIZE_MAP: Record<LogoSize, number> = {
    s: 32,
    m: 48,
    l: 64,
}

export const Logo = ({ size = 'm' }: { size?: LogoSize }) => {
    const dimension = SIZE_MAP[size]

    return (
        <Link href="/">
            <Image src="/logo.png" alt="Cancel Before" width={dimension} height={dimension} />
        </Link>
    )
}
