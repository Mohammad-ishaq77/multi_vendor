import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Eye, FileText, ImageIcon, Loader2, X } from "lucide-react";

/**
 * Real uploaded-document gallery for the admin screens.
 *
 * Documents come from the API (`/api/approvals/:id/documents` or
 * `/api/admin/shops/:id/documents`) as `{ id, type, url, isVerified, createdAt }`.
 * Nothing here invents document content: an image URL is rendered as an image,
 * anything else is opened as a file, and an empty list says so plainly.
 */

const isImageUrl = (url = "") => /\.(png|jpe?g|gif|webp|avif|bmp|svg)(\?.*)?$/i.test(url.trim());

const labelFor = (type) =>
  String(type || "document")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

function DocumentViewer({ document, onClose }) {
  if (!document) return null;
  const isImage = isImageUrl(document.url);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-3">
              {isImage ? (
                <ImageIcon className="h-5 w-5 text-[#155c43]" />
              ) : (
                <FileText className="h-5 w-5 text-[#155c43]" />
              )}
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{labelFor(document.type)}</h3>
                <p className="text-xs text-gray-500">
                  {document.isVerified ? "Marked verified" : "Awaiting review"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={document.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open
              </a>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-gray-50 p-4">
            {isImage ? (
              <img
                src={document.url}
                alt={labelFor(document.type)}
                className="mx-auto max-h-[70vh] w-auto rounded-lg border border-gray-200 bg-white object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <FileText className="h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-600">This document is not an image.</p>
                <a
                  href={document.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#155c43] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0f4a35]"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open document
                </a>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const DocumentGallery = ({ documents = [], loading = false, emptyText = "No documents uploaded yet." }) => {
  const [selected, setSelected] = useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading documents…
      </div>
    );
  }

  if (!documents.length) {
    return <p className="py-6 text-center text-sm text-gray-500">{emptyText}</p>;
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <div
            key={doc.id || doc.url}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md"
          >
            <div className="flex h-36 items-center justify-center overflow-hidden bg-gray-50">
              {isImageUrl(doc.url) ? (
                <img
                  src={doc.url}
                  alt={labelFor(doc.type)}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <FileText className="h-10 w-10 text-gray-300" />
              )}
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{labelFor(doc.type)}</p>
                <p className="text-[0.65rem] text-gray-500">
                  {doc.isVerified ? "Verified" : "Not verified"}
                </p>
              </div>
              <button
                onClick={() => setSelected(doc)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#155c43]/20 px-2.5 py-1.5 text-xs font-medium text-[#155c43] hover:bg-[#155c43]/5"
              >
                <Eye className="h-3.5 w-3.5" /> View
              </button>
            </div>
          </div>
        ))}
      </div>
      <DocumentViewer document={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default DocumentGallery;