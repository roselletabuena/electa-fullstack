# Infrastructure Specification: Terraform AWS Cognito & Google IdP (`infra/`)

## Directory Layout

```text
infra/
├── main.tf           # AWS Provider, Terraform version, and general configs
├── variables.tf      # Input variables (AWS Region, Google Client ID/Secret, Callback URLs)
├── cognito.tf        # Cognito User Pool, Google IdP, Domain, and App Client
├── outputs.tf        # Output variables (Pool ID, Client ID, Cognito Domain, Issuer URL)
└── terraform.tfvars.example # Example variable values
```

## Input Variables (`variables.tf`)

| Variable                | Type           | Default                                               | Description                                 |
| :---------------------- | :------------- | :---------------------------------------------------- | :------------------------------------------ |
| `aws_region`            | `string`       | `"ap-southeast-1"`                                    | AWS Region for Cognito deployment           |
| `environment`           | `string`       | `"dev"`                                               | Environment tier (`dev`, `staging`, `prod`) |
| `app_name`              | `string`       | `"votesphere"`                                        | Application prefix for resource naming      |
| `google_client_id`      | `string`       | `""`                                                  | Google OAuth 2.0 Web Client ID              |
| `google_client_secret`  | `string`       | `""`                                                  | Google OAuth 2.0 Client Secret (sensitive)  |
| `callback_urls`         | `list(string)` | `["http://localhost:3000/api/auth/callback/cognito"]` | Allowed OAuth redirect URLs                 |
| `logout_urls`           | `list(string)` | `["http://localhost:3000/login"]`                     | Allowed post-logout redirect URLs           |
| `cognito_domain_prefix` | `string`       | `"votesphere-auth"`                                   | Prefix for the Cognito Hosted UI domain     |

## Terraform Outputs (`outputs.tf`)

| Output                        | Description                                      |
| :---------------------------- | :----------------------------------------------- |
| `cognito_user_pool_id`        | ID of the created AWS Cognito User Pool          |
| `cognito_user_pool_client_id` | App Client ID for Next.js application            |
| `cognito_domain`              | Fully qualified Cognito Hosted UI domain URL     |
| `cognito_issuer`              | OIDC Issuer endpoint URL                         |
| `env_snippet`                 | Ready-to-copy `.env.local` configuration snippet |
