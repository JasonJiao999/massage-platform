// src/app/privacy/page.tsx
import React from 'react';

// 輔助組件，用於格式化文本
const LegalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mb-6">
    <h2 className="text-2xl font-semibold border-b pb-2 mb-4">{title}</h2>
    <div className="space-y-4 whitespace-pre-line">
      {children}
    </div>
  </section>
);

export default function PrivacyPage() {
  return (
    <main className="container mx-auto max-w-[1150px] p-[24px] bg-[var(--color-secondary)] text-[var(--foreground)] rounded-lg shadow-md my-[10px] card">
      <h1 className="text-3xl font-bold text-center mb-8">Privacy Policy</h1>
      <p className="text-center text-sm text-gray-600 mb-6">PDPA Compliant Summary</p>

      <LegalSection title="1. Data Controller">
        <p>AoFiw (individual operator) is the data controller responsible for personal data processing. </p>
      </LegalSection>

      <LegalSection title="2. Types of Data Collected">
        <ul className="list-disc list-inside space-y-2">
          <li>Registration: name/nickname, email, country, birth year, ID proof (if required)</li>
          <li>Usage: login times, IP address, device info, activity logs </li>
          <li>Content: user posts and chat records (for moderation and safety) </li>
          <li>Payment: transaction records (for accounting) </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Purposes of Processing">
        <ul className="list-disc list-inside space-y-2">
          <li>Identity and age verification</li>
          <li>Provide, maintain, and improve the service</li>
          <li>Content moderation, safety, and abuse prevention</li>
          <li>Legal compliance, dispute resolution, and law enforcement requests</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Data Sharing">
        <ul className="list-disc list-inside space-y-2">
          <li>We do not sell personal data. </li>
          <li>We may share necessary data with payment providers, hosting providers, or law enforcement. </li>
          <li>Data shared with advertisers will be aggregated or de-identified when possible. </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Retention & Deletion">
        <ul className="list-disc list-inside space-y-2">
          <li>Data retained per business needs and legal requirements; users may request access, correction, or deletion. </li>
          <li>Upon account deletion, personal data will be removed or anonymized within a reasonable timeframe (unless retention is required by law). </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Security">
        <ul className="list-disc list-inside space-y-2">
          <li>Reasonable technical and organizational measures are in place (encryption, backups, access control). </li>
          <li>In case of a breach, affected users and authorities will be notified as required. </li>
        </ul>
      </LegalSection>

      <LegalSection title="7. User Rights">
        <p>Users have rights to access, correct, restrict processing, or delete personal data and may withdraw consent where applicable. </p>
      </LegalSection>

      <LegalSection title="8. Contact">
        <p>For privacy requests: support@aofiw.communication </p>
      </LegalSection>
    </main>
  );
}