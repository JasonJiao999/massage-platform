// src/app/disclaimer/page.tsx
import React from 'react';

export default function DisclaimerPage() {
  return (
    <main className="container mx-auto max-w-[1150px] p-[24px] bg-[var(--color-secondary)] text-[var(--foreground)] rounded-lg shadow-md my-[10px] card">
      <h1 className="text-3xl font-bold text-center mb-8">Disclaimer</h1>
      <div className="space-y-4 whitespace-pre-line">
        <p>Disclaimer: AoFiw acts solely as a communication platform between users. </p>
        <p>We do not organize, guarantee, or participate in any offline meetings or transactions. </p>
        <p>All interactions, meetings, financial transactions, or other activities between users are the sole responsibility of the parties involved. </p>
        <p>AoFiw is not liable for any loss, injury, fraud, dispute, or illegal conduct arising from user interactions. </p>
        <p>If a user’s conduct causes legal exposure to the Platform, AoFiw reserves the right to pursue remedies against that user. </p>
      </div>
    </main>
  );
}