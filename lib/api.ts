import { supabase } from "./supabase";

// API Base URLs - Update these for your environment
// For iOS Simulator: http://localhost:PORT
// For Android Emulator: http://10.0.2.2:PORT
// For Physical Device: http://YOUR_COMPUTER_IP:PORT
//
// IMPORTANT: For physical device, replace with your computer's IP address!
// Find your IP: Mac/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
//              Windows: ipconfig (look for IPv4 Address)
// Make sure phone and computer are on the SAME WiFi network!

// Your computer's IP address (update this if it changes!)
const COMPUTER_IP = "192.168.43.198";

const DONATION_SERVICE_URL =
  process.env.EXPO_PUBLIC_DONATION_SERVICE_URL || `http://${COMPUTER_IP}:3001`;
const CAMPAIGN_SERVICE_URL =
  process.env.EXPO_PUBLIC_CAMPAIGN_SERVICE_URL || `http://${COMPUTER_IP}:3002`;

// Helper to fetch profile data
async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { full_name: "Unknown", avatar_url: null };
  }

  return data;
}

// Donation API
export const donationAPI = {
  async getDonations(filters?: {
    status?: string;
    category?: string;
    donor_id?: string;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.donor_id) params.append("donor_id", filters.donor_id);

      const url = `${DONATION_SERVICE_URL}/api/donations${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const donations = await response.json();

      // Fetch profile data for each donation and merge
      const donationsWithProfiles = await Promise.all(
        donations.map(async (donation: any) => {
          const profile = await fetchProfile(donation.donor_id);

          // Fetch ratings for this donation
          const { data: ratings } = await supabase
            .from("ratings")
            .select("rating, comment")
            .eq("donation_id", donation.id);

          return {
            ...donation,
            profiles: profile,
            ratings: ratings || [],
          };
        })
      );

      return donationsWithProfiles;
    } catch (error) {
      console.error("Error fetching donations:", error);
      throw error;
    }
  },

  async getDonationById(id: string) {
    try {
      const response = await fetch(
        `${DONATION_SERVICE_URL}/api/donations/${id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const donation = await response.json();

      // Fetch profile data
      const profile = await fetchProfile(donation.donor_id);

      // Fetch ratings
      const { data: ratings } = await supabase
        .from("ratings")
        .select("rating, comment")
        .eq("donation_id", donation.id);

      return {
        ...donation,
        profiles: profile,
        ratings: ratings || [],
      };
    } catch (error) {
      console.error("Error fetching donation:", error);
      throw error;
    }
  },

  async createDonation(donationData: {
    donor_id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    image_url?: string;
    status?: string;
  }) {
    try {
      const response = await fetch(`${DONATION_SERVICE_URL}/api/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(donationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating donation:", error);
      throw error;
    }
  },

  async updateDonation(
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      category: string;
      location: string;
      status: string;
    }>
  ) {
    try {
      const response = await fetch(
        `${DONATION_SERVICE_URL}/api/donations/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating donation:", error);
      throw error;
    }
  },

  async deleteDonation(id: string) {
    try {
      const response = await fetch(
        `${DONATION_SERVICE_URL}/api/donations/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error deleting donation:", error);
      throw error;
    }
  },
};

// Campaign API
export const campaignAPI = {
  async getCampaigns(filters?: {
    status?: string;
    category?: string;
    recipient_id?: string;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.recipient_id)
        params.append("recipient_id", filters.recipient_id);

      const url = `${CAMPAIGN_SERVICE_URL}/api/campaigns${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const campaigns = await response.json();

      // Fetch profile data for each campaign and merge
      const campaignsWithProfiles = await Promise.all(
        campaigns.map(async (campaign: any) => {
          const profile = await fetchProfile(campaign.recipient_id);
          return {
            ...campaign,
            profiles: profile,
          };
        })
      );

      return campaignsWithProfiles;
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      throw error;
    }
  },

  async getCampaignById(id: string) {
    try {
      const response = await fetch(
        `${CAMPAIGN_SERVICE_URL}/api/campaigns/${id}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const campaign = await response.json();

      // Fetch profile data
      const profile = await fetchProfile(campaign.recipient_id);

      return {
        ...campaign,
        profiles: profile,
      };
    } catch (error) {
      console.error("Error fetching campaign:", error);
      throw error;
    }
  },

  async createCampaign(campaignData: {
    recipient_id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    goal_amount?: number | null;
    image_url?: string;
  }) {
    try {
      const response = await fetch(`${CAMPAIGN_SERVICE_URL}/api/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating campaign:", error);
      throw error;
    }
  },

  async updateCampaign(
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      category: string;
      location: string;
      status: string;
    }>
  ) {
    try {
      const response = await fetch(
        `${CAMPAIGN_SERVICE_URL}/api/campaigns/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating campaign:", error);
      throw error;
    }
  },

  async contributeToCampaign(id: string, amount: number) {
    try {
      const response = await fetch(
        `${CAMPAIGN_SERVICE_URL}/api/campaigns/${id}/contribute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ amount }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error contributing to campaign:", error);
      throw error;
    }
  },

  async deleteCampaign(id: string) {
    try {
      const response = await fetch(
        `${CAMPAIGN_SERVICE_URL}/api/campaigns/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error("Error deleting campaign:", error);
      throw error;
    }
  },
};
