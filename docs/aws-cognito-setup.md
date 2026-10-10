# AWS Cognito & Google Identity Provider Setup Guide

This guide describes how to deploy and configure the AWS Cognito User Pool with Google Identity Provider federation using the Terraform scripts in `infra/`.

---

## 1. Google Cloud Console Configuration

1. Go to [Google Cloud Console > APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Set **Authorized JavaScript origins**:
   - `https://electa-auth-dev.auth.ap-southeast-1.amazoncognito.com` (or your chosen Cognito domain prefix)
4. Set **Authorized redirect URIs**:
   - `https://electa-auth-dev.auth.ap-southeast-1.amazoncognito.com/oauth2/idpresponse`
5. Save and copy the **Client ID** and **Client Secret**.

---

## 2. Terraform Deployment (`infra/environments/dev/`)

1. Navigate to the dev environment directory:
   ```bash
   cd infra/environments/dev
   ```
2. Initialize Terraform:
   ```bash
   terraform init
   ```
3. Deploy resources:
   ```bash
   terraform apply \
     -var="google_client_id=YOUR_GOOGLE_CLIENT_ID" \
     -var="google_client_secret=YOUR_GOOGLE_CLIENT_SECRET"
   ```
4. Copy the resulting outputs into your `.env.local` file:
   ```env
   NEXT_PUBLIC_COGNITO_USER_POOL_ID="ap-southeast-1_..."
   NEXT_PUBLIC_COGNITO_CLIENT_ID="..."
   NEXT_PUBLIC_COGNITO_DOMAIN="https://electa-auth-dev.auth.ap-southeast-1.amazoncognito.com"
   AUTH_PROVIDER="cognito"
   ```

---

## 3. Local Development (Without Live Cloud)

During local development, Electa runs with `AUTH_PROVIDER=local` by default. This simulates Cognito federated login and token exchange without requiring active internet connectivity or AWS deployment.
