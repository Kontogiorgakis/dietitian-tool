import "server-only";

export interface GoogleReview {
  author_name: string;
  author_url?: string;
  language: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface PlaceReviewsResponse {
  reviews: GoogleReview[];
  rating?: number;
  user_ratings_total?: number;
  url?: string;
}

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

/**
 * Fetches Google Place details and caches the result for 24 hours.
 *
 * Must never be exposed as a Server Action or a route handler that accepts a
 * caller-supplied placeId. Doing so publishes an unauthenticated proxy to the
 * paid Places API backed by GOOGLE_MAPS_API_KEY, and a varying placeId would
 * bypass the cache on every call. The "server-only" import above makes any
 * client import fail at build time.
 */
export const getGoogleReviews = async (
  placeId: string
): Promise<PlaceReviewsResponse | null> => {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!placeId) return null;

  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY is not configured");
    return null;
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "reviews,rating,user_ratings_total,url");
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url, {
      next: { revalidate: ONE_DAY_IN_SECONDS, tags: ["google-reviews"] },
    });
    const data = await response.json();

    if (data.status !== "OK") {
      console.error("Google Places API error:", data.status, data.error_message);
      return null;
    }

    return {
      reviews: data.result.reviews ?? [],
      rating: data.result.rating,
      user_ratings_total: data.result.user_ratings_total,
      url: data.result.url,
    };
  } catch (error) {
    console.error("getGoogleReviews error:", error);
    return null;
  }
};
