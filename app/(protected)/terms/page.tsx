import React from 'react';

/**
 * Terms of Service page.  Contains placeholder copy and uses the
 * RelationshipOS brand colors.  Replace the lorem ipsum text with
 * your own legal terms before deployment.
 */
export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-teal-600">Terms of Service</h1>
      <p className="text-gray-600">
        These terms of service are provided as a placeholder.  Update
        this page with your real legal terms.  By using RelationshipOS,
        you agree to comply with and be bound by the following terms.
      </p>
      <p className="text-gray-600">
        <strong>Use of Service:</strong> Lorem ipsum dolor sit amet,
        consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam, quis
        nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat.
      </p>
      <p className="text-gray-600">
        <strong>Disclaimer:</strong> Duis aute irure dolor in reprehenderit
        in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
        officia deserunt mollit anim id est laborum.
      </p>
    </main>
  );
}