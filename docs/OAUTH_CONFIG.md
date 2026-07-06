# FarmSync OAuth Configurations

This document outlines the OAuth 2.0 configuration settings, redirect URIs, and integration rules for Google and Azure AD authentication setup.

---

## 1. Registered Redirect URIs

For production deployment on Render, the registered redirect URIs configured in GCP Console and Microsoft Entra ID (Azure AD) App Registrations must match the following URLs exactly:

### Google OAuth
* **Authorized redirect URIs:**
  `https://farmsync-zpoe.onrender.com/login/oauth2/code/google`
* **Development / Testing URIs:**
  `http://localhost:9090/login/oauth2/code/google`

### Azure AD (Microsoft Entra ID)
* **Redirect URIs (Web platform):**
  `https://farmsync-zpoe.onrender.com/login/oauth2/code/azure`
* **Development / Testing URIs:**
  `http://localhost:9090/login/oauth2/code/azure`

---

## 2. Configuration Parameters (Backend)

The OAuth client registrations are managed via the following variables in the backend configuration:

* `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_ID`
* `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GOOGLE_CLIENT_SECRET`
* `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_AZURE_CLIENT_ID`
* `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_AZURE_CLIENT_SECRET`
* `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_AZURE_TENANT_ID`

These environment variables are referenced in `Backend/src/main/resources/application.properties` and must be set in your host shell or deployment environment dashboard.
