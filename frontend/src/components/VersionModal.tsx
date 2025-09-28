"use client";

import { useState } from "react";
import { X, AlertTriangle, Eye, RotateCcw } from "lucide-react";

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

const ConfirmationDialog = ({ 
  version, 
  onConfirm, 
  onCancel, 
  versionsToDelete 
}: { 
  version: Version; 
  onConfirm: () => void; 
  onCancel: () => void;
  versionsToDelete: number;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
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
  
  const handleRestoreClick = () => {
    setShowConfirmation(true);
  };
  
  const handleConfirmRestore = () => {
    setShowConfirmation(false);
    onConfirmRestore();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
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
              
              {/* Content with better styling and scrolling */}
              <div className="border-2 border-gray-200 rounded-lg bg-gray-50">
                <div className="sticky top-0 bg-gray-100 px-4 py-2 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      Version {version.version_number} Content
                    </span>
                    <div className="text-xs text-gray-500">
                      {version.content.length} characters
                    </div>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  <div
                    className="prose prose-sm max-w-none p-6 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: version.content }}
                    style={{
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                    }}
                  />
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
        <ConfirmationDialog
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
