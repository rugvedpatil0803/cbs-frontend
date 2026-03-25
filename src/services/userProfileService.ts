import apiClient from "./apiClient";

export interface UserProfile {
    firstName: string;
    lastName: string;
    email: string;
    contactNumber: string;
    address: string;
    motivation: string;
    reason: string;
    preferredSessionDuration: string;
    bio: string;
}


export const getUserProfile = async (userId: string) => {
    try {
        const response = await apiClient.get(`/user/profile/${userId}`);
        return response.data.data;

    } catch (error: any) {
        throw error?.response?.data?.message || "Failed to fetch profile";
    }
};


export const updateUserProfile = async (userId: string, payload: Partial<UserProfile>) => {
    try {
        const response = await apiClient.put(
            `/user/profile/${userId}`,
            payload
        );

        return response.data.data;

    } catch (error: any) {
        throw error?.response?.data?.message || "Failed to update profile";
    }
};

export const userByList = async () => {
    try {
        const response = await apiClient.get(`/user/list-by-roles`);
        return response.data.data;

    } catch (error: any) {
        throw error?.response?.data?.message || "Failed to get Users";
    }
};