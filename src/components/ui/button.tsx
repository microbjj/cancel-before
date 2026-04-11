import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded text-sm font-medium cursor-pointer border duration-100 disabled:cursor-not-allowed disabled:opacity-40',
    {
        variants: {
            variant: {
                default: 'border-primary bg-primary text-dark hover:opacity-80',
                destructive: 'border-red-500 bg-red-500 text-white hover:opacity-80',
                outline:
                    'border-border text-grays hover:border-primary hover:text-primary disabled:opacity-30',
                secondary:
                    'border-border text-grays hover:border-primary hover:text-primary disabled:opacity-30',
                ghost: 'border-transparent text-grays hover:border-border hover:text-light',
                link: 'border-transparent text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'px-4 py-1.5',
                sm: 'px-3 py-1',
                lg: 'px-6 py-2',
                icon: 'h-8 w-8',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button'
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
