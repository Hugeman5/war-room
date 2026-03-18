'use client';

import { useRef, useEffect } from 'react';
import { useBtcHistoryStore } from '@/store/btcHistoryStore';
import type { BtcDataPoint } from '@/intelligence/dataLoader/bitcoinHistoricalLoader';

type BtcHistoryInitializerProps = {
  btcHistory: BtcDataPoint[];
};

export default function BtcHistoryInitializer({ btcHistory }: BtcHistoryInitializerProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      useBtcHistoryStore.getState().setHistory(btcHistory);
      initialized.current = true;
    }
  }, [btcHistory]);

  return null; // This component does not render anything.
}
