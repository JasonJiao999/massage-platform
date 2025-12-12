// src/app/terms/page.tsx
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

export default function TermsPage() {
  return (
    <main className="container mx-auto max-w-[1150px] p-[24px] bg-[var(--color-secondary)] text-[var(--foreground)] rounded-lg shadow-md my-[10px] card">
      <h1 className="text-3xl font-bold text-center mb-8">User Agreement</h1>

      <LegalSection title="Welcome">
        <p>Welcome to AoFiw ("the Platform"). Before using our services, please read this Agreement carefully. By registering, logging in, or using AoFiw, you agree to be bound by these terms. </p>
      </LegalSection>

      <LegalSection title="1. Platform Purpose">
        <p>AoFiw is a social companionship platform for adults, designed for activities such as watching movies, having drinks, or dining together. AoFiw strictly prohibits any sexual or illegal activities. </p>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <ul className="list-disc list-inside space-y-2">
          <li>Users must be at least 18 years old.</li>
          <li>All registration information must be true and accurate. </li>
          <li>The Platform reserves the right to suspend or terminate accounts violating this Agreement.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Platform Responsibilities">
        <ul className="list-disc list-inside space-y-2">
          <li>AoFiw only provides communication and event-posting features.</li>
          <li>The Platform is not involved in any offline meetings or transactions. </li>
          <li>The Platform reserves the right to review and remove inappropriate content. </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. User Obligations">
        <ul className="list-disc list-inside space-y-2">
          <li>Users shall not post or promote sexual, obscene, violent, or illegal content. </li>
          <li>Users shall not engage in solicitation, advertising, or unlawful profit-making. </li>
          <li>Users are fully responsible for their actions online and offline. </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Payment & Refund">
        <ul className="list-disc list-inside space-y-2">
          <li>Paid features (VIP, ads, etc.) are voluntary. </li>
          <li>All payments are non-refundable unless otherwise required by applicable law. </li>
          <li>AoFiw reserves the right to adjust pricing at any time. </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Account Management">
        <ul className="list-disc list-inside space-y-2">
          <li>Users may delete their accounts at any time. </li>
          <li>Violations may result in suspension or permanent account termination. </li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Disclaimer">
        <p>The Platform only provides a communication medium and is not responsible for user interactions or outcomes. </p>
      </LegalSection>

      <LegalSection title="8. Governing Law">
        <p>This Agreement shall be governed by applicable laws of Southeast Asia and general international online standards. </p>
      </LegalSection>
    </main>
  );
}