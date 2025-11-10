// src/app/moderation/page.tsx
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

export default function ModerationPage() {
  return (
    <main className="container mx-auto max-w-[1150px] p-[24px] bg-[var(--color-secondary)] text-[var(--foreground)] rounded-lg shadow-md my-[10px] card">
      <h1 className="text-3xl font-bold text-center mb-8">Content Moderation & Suspension Policy</h1>

      <LegalSection title="1. Moderation Approach">
        <p>AoFiw uses automated keyword filtering combined with manual review. The high-risk keyword list is updated regularly. </p>
      </LegalSection>

      <LegalSection title="2. Content Triggering Immediate Removal & Suspension">
        <ul className="list-disc list-inside space-y-2">
          <li>Any solicitation for sexual services or prostitution;</li>
          <li>Explicit offers to meet in hotel/private rooms for sexual or overnight purposes; </li>
          <li>Pornographic or explicit material;</li>
          <li>Content related to drugs, illegal weapons, fraud, violence, discrimination, or hate speech; </li>
          <li>Disclosure of personal/identifying information such as ID numbers, phone numbers, or addresses; </li>
          <li>Impersonation or intentionally misleading content.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Violation Handling">
        <ul className="list-disc list-inside space-y-2">
          <li>First violation: remove content and issue a warning; </li>
          <li>Second violation: restrict features (posting, messaging) and notify the user; </li>
          <li>Third violation: permanent account suspension and potential legal referral. </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Appeals">
        <p>Suspended users may file an appeal within 14 days to support@aofiw.example. The Platform will review and respond within a reasonable time. ]</p>
      </LegalSection>

      <LegalSection title="5. Logs & Evidence">
        <p>The Platform retains moderation logs and removed content records to resolve disputes and comply with lawful requests, subject to applicable data retention rules. </p>
      </LegalSection>
    </main>
  );
}