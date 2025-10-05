/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React, { useState, useEffect } from "react";
import { Form, Input, Button, Space, message } from "antd";
import { useTranslation } from "react-i18next";
import { ClientAvatarUpload } from "./ClientAvatarUpload";
import { clientService } from "../../../services/ClientService";
import { documentService } from "../../../services/DocumentService";
import { useApp } from "../../../hooks";
import {
	CreateClientBodyRequest,
	UpdateClientBodyRequest,
	ClientItemResponseType,
} from "../../../models/client";

interface ClientFormSimpleProps {
	mode: "create" | "update";
	client?: ClientItemResponseType;
	onSuccess?: (client: ClientItemResponseType) => void;
	onCancel?: () => void;
}

interface FormValues {
	fullName: string;
	email?: string;
	phoneNumber?: string;
	cin?: string;
	location?: string;
}

export const ClientFormSimple: React.FC<ClientFormSimpleProps> = ({
	mode,
	client,
	onSuccess,
	onCancel,
}) => {
	const { t } = useTranslation();
	const { isRTL } = useApp();
	const [form] = Form.useForm<FormValues>();
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (mode === "update" && client) {
			form.setFieldsValue({
				fullName: client.fullName,
				email: client.email || "",
				phoneNumber: client.phoneNumber || "",
				cin: client.cin || "",
				location: client.location || "",
			});
		} else {
			form.resetFields();
		}
		setAvatarFile(null);
	}, [mode, client, form]);

	const handleAvatarSelected = (file: File | null) => {
		setAvatarFile(file);
	};

	// Convert client to AvatarEntity for upload component
	const getAvatarEntity = () => {
		if (mode === "update" && client) {
			return {
				_id: client._id,
				avatar: client.avatar,
				fullName: client.fullName,
			};
		}
		return undefined;
	};

	const handleSubmit = async (values: FormValues) => {
		setLoading(true);

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
					fullName: values.fullName.trim(),
					email: values.email?.trim() || null,
					phoneNumber: values.phoneNumber?.trim() || null,
					cin: values.cin?.trim() || null,
					location: values.location?.trim() || null,
					avatar: avatarDocumentId,
				};

				response = await clientService.create(createData);
				message.success(
					t("clients.form.createSuccess", { name: values.fullName })
				);
			} else {
				if (!client) {
					throw new Error("Client data is required for update mode");
				}

				const updateData: UpdateClientBodyRequest = {
					_id: client._id,
					fullName: values.fullName.trim(),
					email: values.email?.trim() || null,
					phoneNumber: values.phoneNumber?.trim() || null,
					cin: values.cin?.trim() || null,
					location: values.location?.trim() || null,
					avatar: avatarDocumentId || client.avatar, // Use new avatar ID or keep existing
				};

				response = await clientService.update(updateData);
				message.success(
					t("clients.form.updateSuccess", { name: values.fullName })
				);
			}

			onSuccess?.(response.data);

			// Reset form for create mode
			if (mode === "create") {
				form.resetFields();
				setAvatarFile(null);
			}
		} catch (error) {
			console.error(
				`Error ${mode === "create" ? "creating" : "updating"} client:`,
				error
			);
			message.error(
				mode === "create"
					? t("clients.form.createError")
					: t("clients.form.updateError")
			);
		} finally {
			setLoading(false);
		}
	};

	const validateCIN = (_: unknown, value: string) => {
		if (value && !/^\d{8}$/.test(value)) {
			return Promise.reject(new Error(t("clients.form.cinInvalid")));
		}
		return Promise.resolve();
	};

	const validateEmail = (_: unknown, value: string) => {
		if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
			return Promise.reject(new Error(t("clients.form.emailInvalid")));
		}
		return Promise.resolve();
	};

	return (
		<div>
			{/* Main Layout Container */}
			<div style={{
				display: "flex",
				flexDirection: isRTL ? "row-reverse" : "row",
				gap: "24px",
				marginBottom: "24px",
				// Stack on mobile, side-by-side on desktop
				flexWrap: "wrap"
			}}>
				{/* Avatar Upload Section */}
				<div style={{
					display: "flex",
					flexDirection: "column",
					alignItems: isRTL ? "flex-end" : "flex-start",
					gap: "8px",
					// Take full width on mobile, auto width on desktop
					minWidth: "200px",
					flex: "0 0 auto"
				}}>
					<div style={{
						fontSize: "14px",
						fontWeight: 500,
						textAlign: isRTL ? "right" : "left"
					}}>
						{t("clients.form.profilePicture")}
					</div>
					<ClientAvatarUpload
						onAvatarSelected={handleAvatarSelected}
						entity={getAvatarEntity()}
						disabled={loading}
					/>
				</div>

				{/* Form Container */}
				<div style={{
					flex: "1 1 300px",
					minWidth: "300px"
				}}>
					{/* Form */}
					<Form
						form={form}
						layout='vertical'
						onFinish={handleSubmit}
						disabled={loading}
					>
				<Form.Item
					name='fullName'
					label={t("clients.form.fullName")}
					rules={[
						{ required: true, message: t("clients.form.fullNameRequired") },
						{ min: 2, message: t("clients.form.fullNameMinLength") },
					]}
				>
					<Input placeholder={t("clients.form.fullNamePlaceholder")} />
				</Form.Item>

				<Form.Item
					name='email'
					label={t("clients.form.emailAddress")}
					rules={[{ validator: validateEmail }]}
				>
					<Input
						type='email'
						placeholder={t("clients.form.emailPlaceholder")}
					/>
				</Form.Item>

				<Form.Item name='phoneNumber' label={t("clients.form.phoneNumber")}>
					<Input placeholder={t("clients.form.phonePlaceholder")} />
				</Form.Item>

				<Form.Item
					name='cin'
					label={t("clients.form.cin")}
					rules={[{ validator: validateCIN }]}
				>
					<Input placeholder={t("clients.form.cinPlaceholder")} maxLength={8} />
				</Form.Item>

				<Form.Item name='location' label={t("clients.form.locationLabel")}>
					<Input placeholder={t("clients.form.locationPlaceholder")} />
				</Form.Item>

				{/* Action Buttons */}
				<Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
					<Space>
						{onCancel && (
							<Button onClick={onCancel} disabled={loading}>
								{t("ui.cancel")}
							</Button>
						)}
						<Button type='primary' htmlType='submit' loading={loading}>
							{mode === "create"
								? t("clients.form.createClient")
								: t("clients.form.updateClient")}
						</Button>
					</Space>
				</Form.Item>
			</Form>
				</div>
			</div>
		</div>
	);
};
