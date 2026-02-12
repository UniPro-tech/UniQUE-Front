// ============================
// DTO definitions (Swagger準拠: routes.ApplicationDTO)
// ============================

/** routes.ApplicationDTO */
export interface ApplicationDTO {
  id: string;
  name: string;
  description?: string;
  websiteUrl?: string;
  privacyPolicyUrl?: string;
  userId?: string;
}

/** routes.CreateApplicationRequest */
export interface CreateApplicationRequest {
  name: string;
  user_id: string;
  client_secret: string;
  description?: string;
  website_url?: string;
  privacy_policy_url?: string;
}

/** routes.UpdateApplicationRequest */
export interface UpdateApplicationRequest {
  name?: string;
  description?: string;
  website_url?: string;
  privacy_policy_url?: string;
  client_secret?: string;
}

/** routes.ApplicationListResponse */
export interface ApplicationListResponse {
  data: ApplicationDTO[];
}

export default ApplicationDTO;
