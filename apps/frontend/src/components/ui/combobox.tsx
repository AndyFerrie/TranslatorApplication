"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { useEffect } from "react"

export type ComboboxOption<T> = {
	label: string
	value: string
	data: T
}

export type Combobox<T> = {
	placeholder: string
	options: Array<ComboboxOption<T>>
	onSelect: (a: ComboboxOption<T>) => void
	selected: ComboboxOption<T> | null | undefined
}

export function Combobox<T>({
	placeholder,
	options,
	selected,
	onSelect,
}: Combobox<T>) {
	const [open, setOpen] = React.useState(false)
	const [value, setValue] = React.useState<string | undefined>("")

	useEffect(() => {
		if (selected) {
			setValue(selected?.value)
		} else {
			setValue("")
		}
	}, [selected])

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
		>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between"
				>
					{value
						? options.find((option) => option.value === value)
								?.label
						: placeholder}
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0">
				<Command>
					<CommandInput
						placeholder={placeholder}
						className="h-9"
					/>
					<CommandList>
						<CommandEmpty>No option found.</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={option.value}
									onSelect={(currentValue) => {
										const selectedOption = options.find(
											(opt) => opt.value == currentValue
										)
										setValue(
											currentValue === value
												? ""
												: currentValue
										)
										setOpen(false)
										if (selectedOption) {
											onSelect(selectedOption)
										}
									}}
								>
									{option.label}
									<Check
										className={cn(
											"ml-auto",
											value === option.value
												? "opacity-100"
												: "opacity-0"
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
