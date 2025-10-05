/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import React, { useState, useEffect } from "react";
import {
	Search,
	Plus,
	Edit,
	Trash2,
	User,
	Mail,
	Phone,
	MapPin,
	CreditCard,
} from "lucide-react";
import { ClientAvatarDisplay } from "./ClientAvatarDisplay";
import { ClientFormModal } from "./ClientFormModal";
import { clientService } from "../../../services/ClientService";
import { ClientItemResponseType } from "../../../models/client";

interface ClientListProps {
	className?: string;
}

interface ClientListState {
	clients: ClientItemResponseType[];
	loading: boolean;
	error: string | null;
	searchTerm: string;
	page: number;
	totalPages: number;
	limit: number;
}

interface ModalState {
	isOpen: boolean;
	mode: "create" | "update";
	client?: ClientItemResponseType;
}

const initialState: ClientListState = {
	clients: [],
	loading: true,
	error: null,
	searchTerm: "",
	page: 1,
	totalPages: 1,
	limit: 10,
};

const initialModalState: ModalState = {
	isOpen: false,
	mode: "create",
};

export const ClientList: React.FC<ClientListProps> = ({ className = "" }) => {
	const [state, setState] = useState<ClientListState>(initialState);
	const [modalState, setModalState] = useState<ModalState>(initialModalState);

	const fetchClients = async () => {
		try {
			setState((prev) => ({ ...prev, loading: true, error: null }));

			const response = await clientService.getAll({
				page: state.page,
				limit: state.limit,
				...(state.searchTerm && { search: state.searchTerm }),
			});

			setState((prev) => ({
				...prev,
				clients: response.data.docs,
				totalPages: response.data.totalPages,
				loading: false,
			}));
		} catch (error) {
			setState((prev) => ({
				...prev,
				error:
					error instanceof Error ? error.message : "Failed to fetch clients",
				loading: false,
			}));
		}
	};

	useEffect(() => {
		fetchClients();
	}, [state.page, state.searchTerm]);

	const handleSearch = (searchTerm: string) => {
		setState((prev) => ({
			...prev,
			searchTerm,
			page: 1, // Reset to first page when searching
		}));
	};

	const handleAddClient = () => {
		setModalState({
			isOpen: true,
			mode: "create",
		});
	};

	const handleEditClient = (client: ClientItemResponseType) => {
		setModalState({
			isOpen: true,
			mode: "update",
			client,
		});
	};

	const handleDeleteClient = async (client: ClientItemResponseType) => {
		if (!confirm(`Are you sure you want to delete ${client.fullName}?`)) {
			return;
		}

		try {
			await clientService.delete(client._id);
			setState((prev) => ({
				...prev,
				clients: prev.clients.filter((c) => c._id !== client._id),
			}));
		} catch (error) {
			setState((prev) => ({
				...prev,
				error:
					error instanceof Error ? error.message : "Failed to delete client",
			}));
		}
	};

	const handleModalSuccess = (updatedClient: ClientItemResponseType) => {
		if (modalState.mode === "create") {
			setState((prev) => ({
				...prev,
				clients: [updatedClient, ...prev.clients],
			}));
		} else {
			setState((prev) => ({
				...prev,
				clients: prev.clients.map((c) =>
					c._id === updatedClient._id ? updatedClient : c
				),
			}));
		}
	};

	const handleCloseModal = () => {
		setModalState(initialModalState);
	};

	const formatDate = (dateString: string): string => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div className={`w-full ${className}`}>
			{/* Header */}
			<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
				<div>
					<h1 className='text-2xl font-bold text-gray-900'>Clients</h1>
					<p className='text-gray-600'>Manage your client relationships</p>
				</div>

				<button
					onClick={handleAddClient}
					className='inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
				>
					<Plus className='w-4 h-4 mr-2' />
					Add Client
				</button>
			</div>

			{/* Search Bar */}
			<div className='mb-6'>
				<div className='relative max-w-md'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
					<input
						type='text'
						placeholder='Search clients...'
						value={state.searchTerm}
						onChange={(e) => handleSearch(e.target.value)}
						className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
					/>
				</div>
			</div>

			{/* Error Display */}
			{state.error && (
				<div className='mb-6 p-4 border border-red-300 rounded-md bg-red-50'>
					<p className='text-sm text-red-700'>{state.error}</p>
					<button
						onClick={() => setState((prev) => ({ ...prev, error: null }))}
						className='mt-2 text-xs text-red-600 hover:text-red-800'
					>
						Dismiss
					</button>
				</div>
			)}

			{/* Loading State */}
			{state.loading && (
				<div className='flex items-center justify-center py-12'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
				</div>
			)}

			{/* Empty State */}
			{!state.loading && state.clients.length === 0 && (
				<div className='text-center py-12'>
					<User className='mx-auto h-12 w-12 text-gray-400' />
					<h3 className='mt-2 text-sm font-medium text-gray-900'>No clients</h3>
					<p className='mt-1 text-sm text-gray-500'>
						Get started by adding your first client.
					</p>
					<button
						onClick={handleAddClient}
						className='mt-6 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700'
					>
						<Plus className='w-4 h-4 mr-2' />
						Add Client
					</button>
				</div>
			)}

			{/* Clients Table */}
			{!state.loading && state.clients.length > 0 && (
				<>
					{/* Desktop Table */}
					<div className='hidden md:block bg-white shadow overflow-hidden sm:rounded-md'>
						<table className='min-w-full divide-y divide-gray-200'>
							<thead className='bg-gray-50'>
								<tr>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Client
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Contact Info
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Details
									</th>
									<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Created
									</th>
									<th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
										Actions
									</th>
								</tr>
							</thead>
							<tbody className='bg-white divide-y divide-gray-200'>
								{state.clients.map((client) => (
									<tr key={client._id} className='hover:bg-gray-50'>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='flex items-center'>
												<div className='flex-shrink-0'>
													<ClientAvatarDisplay
														client={client}
														size='medium'
														className='mr-3'
													/>
												</div>
												<div>
													<div className='text-sm font-medium text-gray-900'>
														{client.fullName}
													</div>
												</div>
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='space-y-1'>
												{client.email && (
													<div className='flex items-center text-sm text-gray-600'>
														<Mail className='w-3 h-3 mr-1' />
														{client.email}
													</div>
												)}
												{client.phoneNumber && (
													<div className='flex items-center text-sm text-gray-600'>
														<Phone className='w-3 h-3 mr-1' />
														{client.phoneNumber}
													</div>
												)}
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap'>
											<div className='space-y-1'>
												{client.cin && (
													<div className='flex items-center text-sm text-gray-600'>
														<CreditCard className='w-3 h-3 mr-1' />
														{client.cin}
													</div>
												)}
												{client.location && (
													<div className='flex items-center text-sm text-gray-600'>
														<MapPin className='w-3 h-3 mr-1' />
														{client.location}
													</div>
												)}
											</div>
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
											{formatDate(client.createdAt)}
										</td>
										<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
											<div className='flex items-center justify-end space-x-2'>
												<button
													onClick={() => handleEditClient(client)}
													className='text-blue-600 hover:text-blue-900 p-1'
													title='Edit client'
												>
													<Edit className='w-4 h-4' />
												</button>
												<button
													onClick={() => handleDeleteClient(client)}
													className='text-red-600 hover:text-red-900 p-1'
													title='Delete client'
												>
													<Trash2 className='w-4 h-4' />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Mobile Cards */}
					<div className='md:hidden space-y-4'>
						{state.clients.map((client) => (
							<div
								key={client._id}
								className='bg-white p-4 rounded-lg shadow border border-gray-200'
							>
								<div className='flex items-start space-x-3'>
									<ClientAvatarDisplay client={client} size='large' />
									<div className='flex-1 min-w-0'>
										<h3 className='text-lg font-medium text-gray-900 truncate'>
											{client.fullName}
										</h3>

										<div className='mt-2 space-y-2'>
											{client.email && (
												<div className='flex items-center text-sm text-gray-600'>
													<Mail className='w-4 h-4 mr-2 flex-shrink-0' />
													<span className='truncate'>{client.email}</span>
												</div>
											)}
											{client.phoneNumber && (
												<div className='flex items-center text-sm text-gray-600'>
													<Phone className='w-4 h-4 mr-2 flex-shrink-0' />
													<span>{client.phoneNumber}</span>
												</div>
											)}
											{client.cin && (
												<div className='flex items-center text-sm text-gray-600'>
													<CreditCard className='w-4 h-4 mr-2 flex-shrink-0' />
													<span>{client.cin}</span>
												</div>
											)}
											{client.location && (
												<div className='flex items-center text-sm text-gray-600'>
													<MapPin className='w-4 h-4 mr-2 flex-shrink-0' />
													<span className='truncate'>{client.location}</span>
												</div>
											)}
										</div>

										<div className='mt-3 flex items-center justify-between'>
											<span className='text-xs text-gray-500'>
												Created {formatDate(client.createdAt)}
											</span>
											<div className='flex items-center space-x-2'>
												<button
													onClick={() => handleEditClient(client)}
													className='text-blue-600 hover:text-blue-900 p-1'
													title='Edit client'
												>
													<Edit className='w-4 h-4' />
												</button>
												<button
													onClick={() => handleDeleteClient(client)}
													className='text-red-600 hover:text-red-900 p-1'
													title='Delete client'
												>
													<Trash2 className='w-4 h-4' />
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Pagination */}
					{state.totalPages > 1 && (
						<div className='flex items-center justify-between mt-6'>
							<div className='flex items-center space-x-2'>
								<button
									onClick={() =>
										setState((prev) => ({
											...prev,
											page: Math.max(1, prev.page - 1),
										}))
									}
									disabled={state.page === 1}
									className='px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
								>
									Previous
								</button>
								<span className='text-sm text-gray-700'>
									Page {state.page} of {state.totalPages}
								</span>
								<button
									onClick={() =>
										setState((prev) => ({
											...prev,
											page: Math.min(prev.totalPages, prev.page + 1),
										}))
									}
									disabled={state.page === state.totalPages}
									className='px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
								>
									Next
								</button>
							</div>
							<div className='text-sm text-gray-500'>
								Showing {state.clients.length} of {state.clients.length} clients
							</div>
						</div>
					)}
				</>
			)}

			{/* Modal */}
			<ClientFormModal
				isOpen={modalState.isOpen}
				mode={modalState.mode}
				client={modalState.client}
				onSuccess={handleModalSuccess}
				onClose={handleCloseModal}
			/>
		</div>
	);
};
