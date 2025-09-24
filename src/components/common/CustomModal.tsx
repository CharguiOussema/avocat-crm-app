/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useRef } from "react";
import { Button, Space } from "antd";
import { X, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../utils/cn";
import { capitalize } from "../../utils/common.helpers";
import useKeyDown from "../../hooks/useKeyDown";
import useOnClickOutside from "../../hooks/useOnClickOutside";

export type ModalSize = "auto";

export interface CustomModalButton {
	key: string;
	label: string;
	type?: "default" | "primary" | "dashed" | "link" | "text";
	danger?: boolean;
	loading?: boolean;
	disabled?: boolean;
	onClick: () => void;
	htmlType?: "button" | "submit" | "reset";
}

type TitleFunction = () => React.ReactNode;
type FooterFunction = () => React.ReactNode;
type ActionsFunction = () => React.ReactNode;

export interface CustomModalProps {
	/**
	 * Modal title - supports function, i18n key or direct string
	 */
	title?: string | TitleFunction;

	/**
	 * Modal name identifier
	 */
	name?: string;

	/**
	 * Custom width (CSS string)
	 */
	width?: string;

	/**
	 * Custom height (CSS string)
	 */
	height?: string;

	/**
	 * Variable for dynamic sizing
	 */
	variable?: string;

	/**
	 * Subtitle text
	 */
	subTitle?: string;

	/**
	 * Custom subtitle component
	 */
	subTitleCustom?: React.ReactNode;

	/**
	 * Modal visibility state
	 */
	isOpen: boolean;

	/**
	 * Callback when modal is closed
	 */
	close?: () => void;

	/**
	 * Show X close button in header
	 */
	showCloseButton?: boolean;

	/**
	 * Custom footer content
	 */
	footer?: React.ReactNode | FooterFunction;

	/**
	 * Custom header actions
	 */
	actions?: React.ReactNode | ActionsFunction;

	/**
	 * Whether modal should auto-close on outside click/escape
	 */
	shouldAutoClose?: boolean;

	/**
	 * Show border bottom on header
	 */
	borderB?: boolean;

	/**
	 * Show back action button
	 */
	hasBackAction?: boolean;

	/**
	 * Back action click handler
	 */
	onBackActionClicked?: () => void;

	/**
	 * Modal content/children
	 */
	children: React.ReactNode;

	/**
	 * Default width if not specified
	 */
	defaultWidth?: string;

	/**
	 * Default height if not specified
	 */
	defaultHeight?: string;

	/**
	 * Custom footer buttons - if not provided, no footer will be shown
	 */
	footerButtons?: CustomModalButton[];

	/**
	 * Show default close button in footer (when footerButtons is provided)
	 */
	showFooterCloseButton?: boolean;

	/**
	 * Close button label (i18n key or string)
	 */
	closeButtonLabel?: string;

	/**
	 * Whether clicking mask closes modal
	 */
	maskClosable?: boolean;

	/**
	 * Custom CSS class name
	 */
	className?: string;

	/**
	 * Loading state for the entire modal
	 */
	loading?: boolean;

	/**
	 * Data test id for testing
	 */
	"data-testid"?: string;
}

/**
 * Z-Index Hierarchy:
 * - Sidebar overlay: z-index: 40
 * - Standard modals (CustomModal, ClientFormModal): z-[100]
 * - Confirmation dialogs (ConfirmModal): z-[150]
 * - Full-screen modals (AvatarModal): z-[200]
 */
export const CustomModal: React.FC<CustomModalProps> = ({
	isOpen = false,
	close = () => {},
	shouldAutoClose = false,
	borderB = true,
	actions,
	hasBackAction = false,
	onBackActionClicked,
	title,
	subTitle,
	subTitleCustom,
	showCloseButton = true,
	footer,
	footerButtons,
	showFooterCloseButton = true,
	closeButtonLabel,
	children,
	defaultWidth = "600px",
	defaultHeight = "auto",
	maskClosable = false,
	className,
	loading = false,
	width = defaultWidth,
	height = defaultHeight,
	"data-testid": dataTestId,
}) => {
	const { t } = useTranslation();
	const refDialog = useRef<HTMLDivElement>(null);

	const onClose = () => {
		if (shouldAutoClose || maskClosable) {
			close();
		}
	};

	useKeyDown("Escape", onClose);
	useOnClickOutside(refDialog, onClose);

	const renderSubtitle = () => {
		if (subTitleCustom) {
			return subTitleCustom;
		}

		return subTitle ? (
			<p className='text-xs sm:text-sm text-muted-foreground mt-1 truncate'>
				{capitalize(subTitle)}
			</p>
		) : null;
	};

	// Calculate modal dimensions to fit within viewport
	const getModalDimensions = () => {
		const maxWidth = "min(95vw, " + (width || "600px") + ")";
		const maxHeight =
			"min(90vh, " + (height === "auto" ? "90vh" : height) + ")";

		return {
			width: maxWidth,
			height: height === "auto" ? "auto" : maxHeight,
			maxWidth: "95vw",
			maxHeight: "90vh",
		};
	};

	const modalDimensions = getModalDimensions();

	// Generate footer content
	const renderFooter = () => {
		if (footer) {
			return typeof footer === "function" ? footer() : footer;
		}

		if (!footerButtons && !showFooterCloseButton) {
			return null;
		}

		const buttons: React.ReactNode[] = [];

		// Add custom buttons
		if (footerButtons) {
			footerButtons.forEach((button) => {
				buttons.push(
					<Button
						key={button.key}
						type={button.type || "default"}
						danger={button.danger}
						loading={button.loading}
						disabled={button.disabled || loading}
						onClick={button.onClick}
						htmlType={button.htmlType}
					>
						{button.label}
					</Button>
				);
			});
		}

		// Add close button if requested
		if (showFooterCloseButton && footerButtons) {
			buttons.unshift(
				<Button key='close' onClick={close} disabled={loading}>
					{closeButtonLabel || t("ui.cancel")}
				</Button>
			);
		}

		return buttons.length > 0 ? (
			<div className='flex-shrink-0 flex flex-col sm:flex-row justify-end gap-2 sm:gap-0 px-4 sm:px-6 py-3 sm:py-4 bg-muted/30 border-t border-border'>
				<Space
					size='middle'
					className='flex flex-col sm:flex-row w-full sm:w-auto'
				>
					{buttons}
				</Space>
			</div>
		) : null;
	};

	return (
		<Transition appear show={isOpen} as={Fragment}>
			<Dialog
				initialFocus={refDialog}
				as='div'
				className='fixed inset-0 z-[100] flex justify-center overflow-y-hidden'
				onClose={onClose}
				data-testid={dataTestId}
			>
				<Transition.Child
					as={Fragment}
					enter='ease-out duration-300'
					enterFrom='opacity-0'
					enterTo='opacity-100'
					leave='ease-in duration-200'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className='fixed inset-0 transition-opacity bg-black bg-opacity-50'
					/>
				</Transition.Child>

				<div className='px-2 sm:px-4 text-center flex items-center justify-center' style={{ minHeight: 'calc(100vh - 64px)', paddingTop: '64px' }}>
					<Transition.Child
						as={Fragment}
						enter='ease-out duration-300'
						enterFrom='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
						enterTo='opacity-100 translate-y-0 sm:scale-100'
						leave='ease-in duration-200'
						leaveFrom='opacity-100 translate-y-0 sm:scale-100'
						leaveTo='opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
					>
						<div
							className={cn(
								"flex flex-col text-left align-middle transition-all transform",
								"bg-card border border-border rounded-lg shadow-2xl",
								"mx-auto my-4 overflow-hidden",
								className
							)}
							style={modalDimensions}
						>
							<div className='flex flex-col h-full' ref={refDialog}>
								{/* Header */}
								<div
									className={cn(
										"flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-4 bg-card",
										borderB && "border-b border-border"
									)}
								>
									<div
										className={cn(
											"flex items-center",
											hasBackAction && "space-x-2 sm:space-x-3"
										)}
									>
										{hasBackAction && (
											<button
												onClick={onBackActionClicked}
												className='flex items-center p-1 rounded-full cursor-pointer hover:bg-accent hover:text-primary transition-colors'
												disabled={loading}
											>
												<ArrowLeft className='w-4 h-4 sm:w-5 sm:h-5' />
											</button>
										)}

										<div className='flex flex-col min-w-0 flex-1'>
											<Dialog.Title
												as='h3'
												className='text-base sm:text-lg font-semibold text-card-foreground truncate pr-2'
											>
												{typeof title === "function" ? title() : title}
											</Dialog.Title>
											{renderSubtitle()}
										</div>
									</div>

									<div className='flex items-center space-x-1 sm:space-x-2 flex-shrink-0'>
										{actions && (
											<>{typeof actions === "function" ? actions() : actions}</>
										)}
										{showCloseButton && (
											<button
												className='p-1.5 sm:p-2 text-muted-foreground hover:text-card-foreground hover:bg-accent rounded-full transition-colors'
												onClick={close}
												disabled={loading}
												aria-label='Close modal'
											>
												<X className='w-4 h-4 sm:w-5 sm:h-5' />
											</button>
										)}
									</div>
								</div>

								{/* Content */}
								<div className='flex-1 overflow-hidden bg-card'>
									<div
										className='h-full overflow-x-hidden overflow-y-auto px-4 sm:px-6 py-4 bg-card text-card-foreground custom-scrollbar'
										style={{
											scrollbarWidth: "thin",
											scrollbarColor:
												"hsl(var(--muted-foreground)) hsl(var(--muted))",
										}}
									>
										{children}
									</div>
								</div>

								{/* Footer */}
								{renderFooter()}
							</div>
						</div>
					</Transition.Child>
				</div>
			</Dialog>
		</Transition>
	);
};
