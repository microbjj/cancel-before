import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    'border-border text-light w-full rounded border bg-transparent px-3 py-1.5 text-sm',
                    'placeholder:text-grays',
                    'focus:border-primary focus:outline-none',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    className,
                )}
                ref={ref}
                {...props}
            />
        )
    },
)
Input.displayName = 'Input'

export { Input }
