
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Trader } from '@/types';
import { format, parseISO } from 'date-fns';


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizePhoneNumber(phoneNumber: string | undefined | null): string {
  if (!phoneNumber) {
    return "";
  }
  // Removes common separators, keeps digits and +
  return phoneNumber.replace(/[\s()-]/g, "");
}

export const formatTraderDataForAnalysis = (traders: Trader[]): string => {
  if (!traders || traders.length === 0) {
    return "No trader data available for this branch.";
  }
  return traders.map(trader => {
    let details = `Trader: ${trader.name}, Sales: £${(trader.totalSales ?? 0).toLocaleString('en-GB')}, Trades: ${trader.tradesMade ?? 0}, Status: ${trader.status}, Last Activity: ${format(parseISO(trader.lastActivity), 'dd/MM/yyyy')}`;
    if (trader.callBackDate) details += `, Call-Back Date: ${format(parseISO(trader.callBackDate), 'dd/MM/yyyy')}`;
    if (trader.annualTurnover != null) details += `, Annual Turnover: £${trader.annualTurnover.toLocaleString('en-GB')}`;
    if (trader.totalAssets != null) details += `, Total Assets: £${trader.totalAssets.toLocaleString('en-GB')}`;
    if (trader.description) details += `, Description: ${trader.description}`;
    if (trader.rating) details += `, Rating: ${trader.rating}`;
    if (trader.website) details += `, Website: ${trader.website}`;
    if (trader.phone) details += `, Phone: ${trader.phone}`;
    if (trader.address) details += `, Address: ${trader.address}`;
    if (trader.mainCategory) details += `, Main Category: ${trader.mainCategory}`;
    if (trader.ownerName) details += `, Owner: ${trader.ownerName}`;
    if (trader.ownerProfileLink) details += `, Owner Profile: ${trader.ownerProfileLink}`;
    if (trader.categories) details += `, Categories: ${trader.categories}`;
    if (trader.workdayTiming) details += `, Hours: ${trader.workdayTiming}`;
    if (trader.notes) details += `, Notes: ${trader.notes}`;
    return details;
  }).join('; \n');
};

    