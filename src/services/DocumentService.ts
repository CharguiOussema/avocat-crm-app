/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 28/9/2024
 */

import { baseHttpClient } from "./abstract/BaseHttpClient";

interface DocumentUploadResponse {
	_id: string;
	originalName: string;
	fileName: string;
	mimeType: string;
	fileSize: number;
	category: string;
	isPublic: boolean;
}

interface DocumentUploadRequest {
	documentType?: string;
	associatedEntity?: string;
	associatedEntityType?: string;
	isPublic?: boolean;
}

class DocumentService {
	private instance = baseHttpClient.instance;

	// Upload a document and return the document ID
	uploadDocument = (file: File, metadata?: DocumentUploadRequest): Promise<{ data: DocumentUploadResponse }> => {
		const formData = new FormData();

		// Add the file
		formData.append('file', file);

		// Add metadata if provided
		if (metadata) {
			formData.append('data', JSON.stringify(metadata));
		}

		return this.instance.post<DocumentUploadResponse>(
			"/api/files/upload-document",
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			}
		);
	};

	// Get document by ID
	getDocument = (documentId: string) => {
		return this.instance.get(`/api/files/${documentId}`);
	};

	// Get document file URL for serving
	getDocumentUrl = (documentId: string): string => {
		return `${this.instance.defaults.baseURL}/api/files/serve/${documentId}`;
	};

	// Delete document
	deleteDocument = (documentId: string) => {
		return this.instance.delete(`/api/files/${documentId}`);
	};
}

const documentService = new DocumentService();
export { documentService };