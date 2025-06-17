
'use server';

import { db } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import type { BaseBranchId } from '@/types';

const COMPETITOR_URLS_COLLECTION = 'branch_competitor_urls';

interface StoredCompetitorUrls {
  branchId: BaseBranchId;
  urls: string[];
  lastUpdated: string;
}

/**
 * Saves or updates the list of competitor URLs for a given branch.
 * @param branchId The base ID of the branch.
 * @param urls An array of URL strings to save.
 */
export async function saveCompetitorUrls(branchId: BaseBranchId, urls: string[]): Promise<void> {
  if (!db) {
    console.error("[CompetitorInsightsService:saveCompetitorUrls] Firestore not initialised. Aborting operation.");
    throw new Error("Firestore not initialised. Cannot save competitor URLs.");
  }
  if (!branchId) {
    console.error("[CompetitorInsightsService:saveCompetitorUrls] Branch ID is missing. Aborting operation.");
    throw new Error("Branch ID is required to save competitor URLs.");
  }

  try {
    const docRef = doc(db, COMPETITOR_URLS_COLLECTION, branchId);
    const dataToSave: StoredCompetitorUrls = {
      branchId,
      urls,
      lastUpdated: new Date().toISOString(),
    };
    await setDoc(docRef, dataToSave);
    console.log(`[CompetitorInsightsService:saveCompetitorUrls] Successfully saved ${urls.length} URLs for branch ${branchId}.`);
  } catch (error) {
    console.error(`[CompetitorInsightsService:saveCompetitorUrls] Error saving URLs for branch ${branchId}:`, error);
    throw error; 
  }
}

/**
 * Retrieves the saved list of competitor URLs for a given branch.
 * @param branchId The base ID of the branch.
 * @returns An array of URL strings, or null if no URLs are saved or an error occurs.
 */
export async function getSavedCompetitorUrls(branchId: BaseBranchId): Promise<string[] | null> {
  if (!db) {
    console.error("[CompetitorInsightsService:getSavedCompetitorUrls] Firestore not initialised. Aborting operation.");
    // Gracefully return null or throw, depending on desired strictness. Here, returning null for client to handle.
    return null; 
  }
   if (!branchId) {
    console.error("[CompetitorInsightsService:getSavedCompetitorUrls] Branch ID is missing. Cannot fetch URLs.");
    return null;
  }

  try {
    const docRef = doc(db, COMPETITOR_URLS_COLLECTION, branchId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as StoredCompetitorUrls;
      console.log(`[CompetitorInsightsService:getSavedCompetitorUrls] Fetched ${data.urls?.length ?? 0} URLs for branch ${branchId}.`);
      return data.urls || []; // Return empty array if urls field is missing but doc exists
    } else {
      console.log(`[CompetitorInsightsService:getSavedCompetitorUrls] No saved URLs found for branch ${branchId}.`);
      return null; // No document found
    }
  } catch (error) {
    console.error(`[CompetitorInsightsService:getSavedCompetitorUrls] Error fetching URLs for branch ${branchId}:`, error);
    return null; // Indicate error by returning null
  }
}
