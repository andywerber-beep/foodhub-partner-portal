import React, { useState, useEffect } from 'react';
import { usePartner } from '../../context/PartnerContext';
import { supabase } from '../../lib/supabaseClient';

interface Transaction {
  id: string;
  created_at: string;
  customer_name: string;
  item_purchased: string;
  gross_amount: number;
  commission_amount: number;
  net_payout: number;
}

export const LedgerHistoryView: React.FC = () => {
  const { partner } = usePartner();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Mocking incoming tap records structured exactly like our database payload architecture
  useEffect(() => {
    const fetchLedgerData = async () => {
      setLoading(true);
      // Simulating a minor network pause to look realistic
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Placeholder data reflecting real-world transaction calculations (10% Commission)
      const mockTransactions: Transaction[] = [
        {
          id: 'TX-9021',
          created_at: new Date(2026, 5, 22, 12, 14).toLocaleString(),
          customer_name: 'Alex Mercer',
          item_purchased: 'Classic Burger Combo',
          gross_amount: 15.00,
          commission_amount: 1.50,
          net_payout: 13.50,
        },
        {
          id: 'TX-8974',
          created_at: new Date(2026, 5, 21, 18, 45).toLocaleString(),
          customer_name: 'Sarah Jenkins',
          item_purchased: 'Truffle Fries & Drink',
          gross_amount: 9.50,
          commission_amount: 0.95,
          net_payout: 8.55,
        },
        {
          id: 'TX-8841',
          created_at: new Date(2026, 5, 20, 13, 2).toLocaleString(),
          customer_name: 'David Ross',
          item_purchased: 'Gourmet Mains Deal',
          gross_amount: 22.00,
          commission_amount: 2.20,
          net_payout: 19.80,
        }
      ];

      setTransactions(mockTransactions);
      setLoading(false);
    };

    if (partner?.id) {
      fetchLedgerData();
    }
  }, [partner?.id]);

  return (
    <div style={{ width: '100%', color: 'var(--text-primary)', textAlign: 'left' }}>
      
      {/* Title Header */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Financial Ledger & Payouts</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
          Monitor your upfront subscription status, track client NFC phone taps, and audit marketplace statements.
        </p>
      </div>

      {/* Upfront Subscription Status Card */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', background: 'rgba(76, 209, 55, 0.1)', color: '#4CD137', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
              Subscription Paid Upfront
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 600, margin: '12px 0 6px 0' }}>Platform Workspace License</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
              Your recurring platform fee is managed securely via Stripe.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)' }}>£49.00<span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 400 }}>/mo</span></div>
            <div style={{ fontSize: '12px', color: '#4CD137', marginTop: '4px', fontWeight: 600 }}>● Next Auto-Renew: 22/07/2026</div>
          </div>
        </div>
      </div>

      {/* Live Transaction Ledger Stream */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>NFC Tap Activity Logs</h3>

        {loading ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px', padding: '20px 0' }}>Syncing ledger streaming arrays...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>TRANSACTION ID</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>TIMESTAMP</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>CUSTOMER</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>ITEM</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600 }}>TOTAL CHARGED</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--coral-accent)' }}>OUR 10% CUT</th>
                  <th style={{ padding: '12px 8px', fontWeight: 600, color: '#4CD137', textAlign: 'right' }}>NET DISBURSED</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 8px', fontWeight: 700, color: 'var(--text-secondary)' }}>{tx.id}</td>
                    <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{tx.created_at}</td>
                    <td style={{ padding: '16px 8px', fontWeight: 600 }}>{tx.customer_name}</td>
                    <td style={{ padding: '16px 8px', color: 'var(--text-secondary)' }}>{tx.item_purchased}</td>
                    <td style={{ padding: '16px 8px', fontWeight: 600 }}>£{tx.gross_amount.toFixed(2)}</td>
                    <td style={{ padding: '16px 8px', color: 'var(--coral-accent)', fontWeight: 600 }}>-£{tx.commission_amount.toFixed(2)}</td>
                    <td style={{ padding: '16px 8px', color: '#4CD137', fontWeight: 700, textAlign: 'right' }}>£{tx.net_payout.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default LedgerHistoryView;