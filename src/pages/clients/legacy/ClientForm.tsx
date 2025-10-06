/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ClientAvatarUpload } from "./ClientAvatarUpload";
import { clientService } from "../../../services/ClientService";
import { documentService } from "../../../services/DocumentService";
import { useApp } from "../../../hooks";
import { cn } from "../../../utils/cn";
import {
	CreateClientBodyRequest,
	UpdateClientBodyRequest,
	ClientItemResponseType,
} from "../../../models/client";

interface ClientFormProps {
	mode: "create" | "update";
	client?: ClientItemResponseType;
	onSuccess?: (client: ClientItemResponseType) => void;
	onCancel?: () => void;
	className?: string;
}

interface FormData {
	fullName: string;
	email: string;
	phoneNumber: string;
	cin: string;
	location: string;
}

interface FormErrors {
	fullName?: string;
	email?: string;
	phoneNumber?: string;
	cin?: string;
	location?: string;
	avatar?: string;
	general?: string;
}

const initialFormData: FormData = {
	fullName: "",
	email: "",
	phoneNumber: "",
	cin: "",
	location: "",
};

export const ClientForm: React.FC<ClientFormProps> = ({
	mode,
	client,
	onSuccess,
	onCancel,
	className = "",
}) => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const [formData, setFormData] = useState<FormData>(initialFormData);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [errors, setErrors] = useState<FormErrors>({});
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initialize form data for update mode
	useEffect(() => {
		if (mode === "update" && client) {
			setFormData({
				fullName: client.fullName,
				email: client.email || "",
				phoneNumber: client.phoneNumber || "",
				cin: client.cin || "",
				location: client.location || "",
			});
		} else {
			setFormData(initialFormData);
		}
		setAvatarFile(null);
		setErrors({});
	}, [mode, client]);

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		// Required field validation
		if (!formData.fullName.trim()) {
			newErrors.fullName = t("clients.legacy.form.fullNameRequired");
		} else if (formData.fullName.trim().length < 2) {
			newErrors.fullName = t("clients.legacy.form.fullNameMinLength");
		}

		// Email validation
		if (formData.email.trim()) {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				newErrors.email = t("clients.legacy.form.emailInvalid");
			}
		}

		// Phone number validation
		if (formData.phoneNumber.trim()) {
			const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
			if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ""))) {
				newErrors.phoneNumber = t("clients.legacy.form.phoneInvalid");
			}
		}

		// CIN validation (8 digits)
		if (formData.cin.trim()) {
			const cinRegex = /^\d{8}$/;
			if (!cinRegex.test(formData.cin)) {
				newErrors.cin = t("clients.legacy.form.cinInvalid");
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error for this field when user starts typing
		if (errors[name as keyof FormErrors]) {
			setErrors((prev) => ({
				...prev,
				[name]: undefined,
			}));
		}
	};

	const handleAvatarSelected = (file: File | null) => {
		setAvatarFile(file);
		if (errors.avatar) {
			setErrors((prev) => ({ ...prev, avatar: undefined }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsSubmitting(true);
		setErrors({});

		try {
			let response: { data: ClientItemResponseType };
			let avatarDocumentId: string | null = null;

			// Upload avatar first if provided
			if (avatarFile) {
				const uploadResponse = await documentService.uploadDocument(avatarFile, {
					documentType: 'avatar',
					associatedEntityType: 'client',
					isPublic: true
				});
				avatarDocumentId = uploadResponse.data._id;
			}

			if (mode === "create") {
				const createData: CreateClientBodyRequest = {
					fullName: formData.fullName.trim(),
					email: formData.email.trim() || null,
					phoneNumber: formData.phoneNumber.trim() || null,
					cin: formData.cin.trim() || null,
					location: formData.location.trim() || null,
					avatar: avatarDocumentId,
				};

				response = await clientService.create(createData);
			} else {
				if (!client) {
					throw new Error(t("clients.legacy.error.clientRequired"));
				}

				const updateData: UpdateClientBodyRequest = {
					_id: client._id,
					fullName: formData.fullName.trim(),
					email: formData.email.trim() || null,
					phoneNumber: formData.phoneNumber.trim() || null,
					cin: formData.cin.trim() || null,
					location: formData.location.trim() || null,
					avatar: avatarDocumentId || client.avatar, // Use new avatar ID or keep existing
				};

				response = await clientService.update(updateData);
			}

			onSuccess?.(response.data);

			// Reset form for create mode
			if (mode === "create") {
				setFormData(initialFormData);
				setAvatarFile(null);
			}
		} catch (error) {
			console.error(
				`Error ${mode === "create" ? "creating" : "updating"} client:`,
				error
			);
			setErrors({
				general:
					error instanceof Error ? error.message : `Failed to ${mode} client`,
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const getCurrentAvatarUrl = (): string | null => {
		if (mode === "update" && client?.avatar) {
			// Return avatar URL for existing client
			return `/api/files/serve/${client.avatar}`;
		}
		return null;
	};

	return (
		<div className={cn(className, "bg-card")} style={{ backgroundColor: "white" }}>
			<form
				onSubmit={handleSubmit}
				style={{ display: "flex", flexDirection: "column", gap: "24px" }}
			>
				{/* General Error */}
				{errors.general && (
					<div
						style={{
							padding: "16px",
							border: "1px solid #fca5a5",
							borderRadius: "6px",
							backgroundColor: "#fef2f2",
						}}
					>
						<p style={{ fontSize: "14px", color: "#dc2626", margin: 0 }}>
							{errors.general}
						</p>
					</div>
				)}

				{/* Form Layout Container */}
				<div className={cn(
					"flex gap-6",
					isRTL ? "flex-row-reverse" : "flex-row",
					"flex-col lg:flex-row" // Stack on mobile, side-by-side on desktop
				)}>
					{/* Avatar Section */}
					<div className={cn(
						"flex flex-col gap-2",
						isRTL ? "lg:items-end" : "lg:items-start",
						"items-center lg:w-auto w-full" // Center on mobile, align according to direction on desktop
					)}>
						<label
							className={cn(
								"text-sm font-medium text-gray-700",
								isRTL ? "text-right" : "text-left"
							)}
						>
							Profile Picture
						</label>
						<ClientAvatarUpload
							onAvatarSelected={handleAvatarSelected}
							currentAvatarUrl={getCurrentAvatarUrl()}
							disabled={isSubmitting}
						/>
						{errors.avatar && (
							<p className={cn(
								"text-sm text-red-600 mt-1",
								isRTL ? "text-right" : "text-left"
							)}>
								{errors.avatar}
							</p>
						)}
					</div>

					{/* Form Fields Container */}
					<div className="flex-1">
						{/* Form Fields Grid */}
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
								gap: "24px",
							}}
						>
					{/* Full Name */}
					<div style={{ gridColumn: "1 / -1" }}>
						<label
							htmlFor='fullName'
							style={{
								display: "block",
								fontSize: "14px",
								fontWeight: 500,
								color: "#374151",
								marginBottom: "4px",
							}}
						>
							Full Name *
						</label>
						<input
							type='text'
							id='fullName'
							name='fullName'
							value={formData.fullName}
							onChange={handleInputChange}
							disabled={isSubmitting}
							style={{
								width: "100%",
								padding: "8px 12px",
								border: `1px solid ${errors.fullName ? "#fca5a5" : "#d1d5db"}`,
								borderRadius: "6px",
								fontSize: "14px",
								backgroundColor: isSubmitting ? "#f9fafb" : "white",
								cursor: isSubmitting ? "not-allowed" : "text",
							}}
							placeholder="Enter client's full name"
						/>
						{errors.fullName && (
							<p
								style={{ marginTop: "4px", fontSize: "14px", color: "#dc2626" }}
							>
								{errors.fullName}
							</p>
						)}
					</div>

					{/* Email */}
					<div>
						<label
							htmlFor='email'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							Email Address
						</label>
						<input
							type='email'
							id='email'
							name='email'
							value={formData.email}
							onChange={handleInputChange}
							disabled={isSubmitting}
							className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
								errors.email ? "border-red-300" : "border-gray-300"
							}`}
							placeholder='client@example.com'
						/>
						{errors.email && (
							<p className='mt-1 text-sm text-red-600'>{errors.email}</p>
						)}
					</div>

					{/* Phone Number */}
					<div>
						<label
							htmlFor='phoneNumber'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							Phone Number
						</label>
						<input
							type='tel'
							id='phoneNumber'
							name='phoneNumber'
							value={formData.phoneNumber}
							onChange={handleInputChange}
							disabled={isSubmitting}
							className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
								errors.phoneNumber ? "border-red-300" : "border-gray-300"
							}`}
							placeholder='+1234567890'
						/>
						{errors.phoneNumber && (
							<p className='mt-1 text-sm text-red-600'>{errors.phoneNumber}</p>
						)}
					</div>

					{/* CIN */}
					<div>
						<label
							htmlFor='cin'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							CIN (National ID)
						</label>
						<input
							type='text'
							id='cin'
							name='cin'
							value={formData.cin}
							onChange={handleInputChange}
							disabled={isSubmitting}
							maxLength={8}
							className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
								errors.cin ? "border-red-300" : "border-gray-300"
							}`}
							placeholder='12345678'
						/>
						{errors.cin && (
							<p className='mt-1 text-sm text-red-600'>{errors.cin}</p>
						)}
					</div>

					{/* Location */}
					<div>
						<label
							htmlFor='location'
							className='block text-sm font-medium text-gray-700 mb-1'
						>
							Location
						</label>
						<input
							type='text'
							id='location'
							name='location'
							value={formData.location}
							onChange={handleInputChange}
							disabled={isSubmitting}
							className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
								errors.location ? "border-red-300" : "border-gray-300"
							}`}
							placeholder='City, Country'
						/>
						{errors.location && (
							<p className='mt-1 text-sm text-red-600'>{errors.location}</p>
						)}
					</div>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className='flex flex-col sm:flex-row gap-3 pt-6'>
					<button
						type='submit'
						disabled={isSubmitting}
						className='flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{isSubmitting ? (
							<span className='flex items-center justify-center'>
								<svg
									className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
									fill='none'
									viewBox='0 0 24 24'
								>
									<circle
										className='opacity-25'
										cx='12'
										cy='12'
										r='10'
										stroke='currentColor'
										strokeWidth='4'
									></circle>
									<path
										className='opacity-75'
										fill='currentColor'
										d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
									></path>
								</svg>
								{mode === "create" ? "Creating..." : "Updating..."}
							</span>
						) : mode === "create" ? (
							"Create Client"
						) : (
							"Update Client"
						)}
					</button>

					{onCancel && (
						<button
							type='button'
							onClick={onCancel}
							disabled={isSubmitting}
							className='flex-1 sm:flex-none px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
						>
							Cancel
						</button>
					)}
				</div>
			</form>
		</div>
	);
};
