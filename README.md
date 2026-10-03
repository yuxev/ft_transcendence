<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/banner-dark.svg" />
  <img src="docs/banner-light.svg" width="100%" alt="ft_transcendence: The final 42 common-core project: pong in the browser, with 42 sign-in, tournaments and three languages." />
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/architecture-dark.svg" />
  <img src="docs/architecture-light.svg" width="100%" alt="Browser to nginx (TLS) to Django REST to PostgreSQL, in docker compose, plus 42 OAuth" />
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/oauth-dark.svg" />
  <img src="docs/oauth-light.svg" width="100%" alt="Sequence: browser, django, 42 intra and postgres exchange code, token, profile and JWT cookie" />
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/modes-dark.svg" />
  <img src="docs/modes-light.svg" width="100%" alt="Game modes: 1 vs AI, 4 players, tournament, space shooter" />
</picture>

## Run it

```bash
# .env needs: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB,
#             OAUTH42_CLIENT_ID, OAUTH42_CLIENT_SECRET, OAUTH42_REDIRECT_URI,
#             OAUTH42_AUTHORIZATION_URL, OAUTH42_TOKEN_URL
docker compose up --build
# then open https://localhost
```

<sub>Diagrams in <code>docs/</code> are generated SVGs, drawn to match the code in this repo.</sub>
