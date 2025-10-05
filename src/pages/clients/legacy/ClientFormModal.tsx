/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React from "react";
import { X } from "lucide-react";
import { ClientForm } from "./ClientForm";
import { ClientItemResponseType } from "../../../models/client";

interface ClientFormModalProps {
	isOpen: boolean;
	mode: "create" | "update";
	client?: ClientItemResponseType;
	onSuccess?: (client: ClientItemResponseType) => void;
	onClose: () => void;
}

/**
 * Z-Index Hierarchy: z-[100] - Standard modal level
 */
export const ClientFormModal: React.FC<ClientFormModalProps> = ({
	isOpen,
	mode,
	client,
	onSuccess,
	onClose,
}) => {
	if (!isOpen) return null;

	const handleSuccess = (updatedClient: ClientItemResponseType) => {
		onSuccess?.(updatedClient);
		onClose();
	};

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === e.currentTarget) {
			onClose();
		}
	};

	return (
		<div
			className='fixed inset-0 z-[100] overflow-y-auto'
			style={{ paddingTop: "64px" }}
		>
			{/* Backdrop */}
			<div
				className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
				onClick={handleBackdropClick}
			/>

			{/* Modal Container */}
			<div
				className='flex items-center justify-center p-4'
				style={{ minHeight: "calc(100vh - 64px)" }}
			>
				<div className='relative w-full max-w-2xl bg-card rounded-lg shadow-xl border border-border'>
					{/* Header */}
					<div className='flex items-center justify-between p-6 border-b border-border bg-card'>
						<h2 className='text-xl font-semibold text-card-foreground'>
							{mode === "create" ? "Add New Client" : "Update Client"}
						</h2>
						<button
							onClick={onClose}
							className='p-2 hover:bg-accent rounded-full transition-colors'
							title='Close'
						>
							<X className='w-5 h-5 text-muted-foreground hover:text-accent-foreground' />
						</button>
					</div>

					{/* Form Content */}
					<div className='p-6 bg-card'>
						<ClientForm
							mode={mode}
							client={client}
							onSuccess={handleSuccess}
							onCancel={onClose}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
