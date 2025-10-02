/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 2/10/2025
 */

import React, { useEffect, useRef, useCallback } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	debounceMs?: number;
	className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
	value,
	onChange,
	placeholder = "Search...",
	debounceMs = 500,
	className = "w-full",
}) => {
	const [localValue, setLocalValue] = React.useState(value);
	const timeoutRef = useRef<NodeJS.Timeout | undefined>();

	// Update local value when prop value changes
	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	// Debounced search function
	const debouncedOnChange = useCallback(
		(searchValue: string) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(() => {
				onChange(searchValue);
			}, debounceMs);
		},
		[onChange, debounceMs]
	);

	// Handle search input change with debounce
	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = e.target.value;
			setLocalValue(newValue);
			debouncedOnChange(newValue);
		},
		[debouncedOnChange]
	);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return (
		<Input
			placeholder={placeholder}
			prefix={<SearchOutlined />}
			value={localValue}
			onChange={handleChange}
			className={className}
		/>
	);
};
