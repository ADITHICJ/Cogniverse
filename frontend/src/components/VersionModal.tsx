"use client";

import { useState } from "react";
import { X, AlertTriangle, Eye, RotateCcw } from "lucide-react";
import { marked } from "marked";

interface Version {
  id: string;
  version_number: number;
  content: string;
  created_at: string;
}

interface VersionModalProps {
  version: Version;
  onClose: () => void;
  isRestoring: boolean;
  onConfirmRestore: () => void;
  totalVersions: number;
}

const ConfirmationModal = ({
  onConfirm,
  onCancel,
  versionsToDelete,
  version,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  versionsToDelete: number;
  version: Version;
}) => (
  <div className="fixed inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">Confirm Version Restore</h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-3">
            Are you sure you want to restore to <strong>Version {version.version_number}</strong>?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm font-medium">⚠️ Warning:</p>
            <p className="text-red-700 text-sm mt-1">
              This will permanently delete {versionsToDelete} newer version{versionsToDelete !== 1 ? 's' : ''} 
              and cannot be undone.
            </p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Delete & Restore
          </button>
        </div>
      </div>
    </div>
  </div>
);

const VersionModal = ({ version, onClose, isRestoring, onConfirmRestore, totalVersions }: VersionModalProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const versionsToDelete = totalVersions - version.version_number;
  
  // Process content to ensure proper formatting
  const getFormattedContent = (content: string) => {
    try {
      // If content looks like HTML, return as-is
      if (content.startsWith('<') && content.includes('>')) {
        return content;
      }
      
      // If content is empty or just whitespace, show placeholder
      if (!content || content.trim() === '') {
        return '<p class="text-gray-500 italic">No content in this version</p>';
      }
      
      // Convert markdown to HTML
      return marked(content);
    } catch (error) {
      console.error('Error formatting content:', error);
      // Fallback: wrap in paragraph tags and escape HTML
      return `<p>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
    }
  };
  
  const handleRestoreClick = () => {
    setShowConfirmation(true);
  };
  
  const handleConfirmRestore = () => {
    setShowConfirmation(false);
    onConfirmRestore();
  };

  return (
    <>
      <div className="fixed inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Version {version.version_number}</h3>
                <p className="text-sm text-gray-600">
                  Created: {new Date(version.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          {/* Content - Scrollable */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800">Content Preview</h4>
                <div className="text-sm text-gray-500">
                  Scroll to view full content
                </div>
              </div>
              
              {/* Content with editor-like styling */}
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Eye size={16} />
                      Version {version.version_number} Content
                    </span>
                    <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      {version.content ? version.content.length : 0} chars
                    </div>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto bg-white">
                  <div
                    className="prose prose-lg max-w-none focus:outline-none min-h-[200px] p-6 leading-relaxed prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-em:text-gray-600 prose-code:text-blue-600 prose-code:bg-blue-50 prose-pre:bg-gray-800 prose-blockquote:border-blue-300 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-li:text-gray-700"
                    dangerouslySetInnerHTML={{ 
                      __html: getFormattedContent(version.content)
                    }}
                    style={{
                      fontFamily: '"Inter", sans-serif',
                      lineHeight: '1.75',
                    }}
                  />
                </div>
                
                {/* Footer with content info */}
                <div className="bg-gray-50 px-4 py-2 border-t text-xs text-gray-500 flex justify-between items-center">
                  <div>
                    Content preview - matches editor formatting
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Read-only view</span>
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t rounded-b-xl flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {isRestoring && versionsToDelete > 0 && (
                <span className="text-amber-600 font-medium">
                  ⚠️ Restoring will delete {versionsToDelete} newer version{versionsToDelete !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={onClose} 
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              
              {isRestoring && (
                <button 
                  onClick={handleRestoreClick}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Restore Version</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <ConfirmationModal
          version={version}
          onConfirm={handleConfirmRestore}
          onCancel={() => setShowConfirmation(false)}
          versionsToDelete={versionsToDelete}
        />
      )}
    </>
  );
};

export default VersionModal;